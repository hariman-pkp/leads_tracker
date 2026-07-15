import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/app_colors.dart';
import '../models/visit_plan_model.dart';
import '../providers/visit_plan_provider.dart';

class ScheduleScreen extends ConsumerStatefulWidget {
  const ScheduleScreen({super.key});

  @override
  ConsumerState<ScheduleScreen> createState() => _ScheduleScreenState();
}

class _ScheduleScreenState extends ConsumerState<ScheduleScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  CalendarFormat _calFormat  = CalendarFormat.month;
  DateTime _focusedDay       = DateTime.now();
  DateTime _selectedDay      = DateTime.now();

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheduleAsync = ref.watch(todayScheduleProvider);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Jadwal',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  // Badge FU selesai hari ini
                  scheduleAsync.maybeWhen(
                    data: (s) => s.fuDoneToday > 0
                        ? Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '${s.fuDoneToday} FU Selesai',
                              style: const TextStyle(color: AppColors.success, fontSize: 12),
                            ),
                          )
                        : const SizedBox.shrink(),
                    orElse: () => const SizedBox.shrink(),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.refresh, color: AppColors.primary, size: 20),
                    onPressed: () => ref.read(todayScheduleProvider.notifier).refresh(),
                  ),
                ],
              ),
            ),

            // ── Tab Bar ─────────────────────────────────────────────────
            Container(
              margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              decoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.circular(10),
              ),
              child: TabBar(
                controller: _tabCtrl,
                indicator: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                tabs: const [Tab(text: 'Kalender'), Tab(text: 'Agenda')],
              ),
            ),

            const SizedBox(height: 8),

            Expanded(
              child: scheduleAsync.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
                      const SizedBox(height: 8),
                      Text('Gagal memuat jadwal', style: const TextStyle(color: AppColors.textSecondary)),
                      TextButton(
                        onPressed: () => ref.read(todayScheduleProvider.notifier).refresh(),
                        child: const Text('Coba lagi'),
                      ),
                    ],
                  ),
                ),
                data: (schedule) {
                  // Build map date → list untuk marker kalender
                  final Map<DateTime, List<VisitPlanModel>> planMap = {};
                  for (final p in schedule.all) {
                    if (p.nextFuDate == null) continue;
                    try {
                      final d = DateTime.parse(p.nextFuDate!);
                      final key = DateTime(d.year, d.month, d.day);
                      planMap.putIfAbsent(key, () => []).add(p);
                    } catch (_) {}
                  }

                  return TabBarView(
                    controller: _tabCtrl,
                    children: [
                      // ── Tab Kalender ─────────────────────────────────
                      _CalendarTab(
                        focusedDay:      _focusedDay,
                        selectedDay:     _selectedDay,
                        calFormat:       _calFormat,
                        planMap:         planMap,
                        onDaySelected: (sel, foc) {
                          setState(() { _selectedDay = sel; _focusedDay = foc; });
                          _tabCtrl.animateTo(1);
                        },
                        onPageChanged:     (foc) => setState(() => _focusedDay = foc),
                        onFormatChanged:   (f)   => setState(() => _calFormat = f),
                      ),

                      // ── Tab Agenda ────────────────────────────────────
                      _AgendaTab(
                        schedule:    schedule,
                        selectedDay: _selectedDay,
                        onRefresh:   () => ref.read(todayScheduleProvider.notifier).refresh(),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Kalender ─────────────────────────────────────────────────────────────────

class _CalendarTab extends StatelessWidget {
  final DateTime _focusedDay;
  final DateTime _selectedDay;
  final CalendarFormat _calFormat;
  final Map<DateTime, List<VisitPlanModel>> planMap;
  final Function(DateTime, DateTime) onDaySelected;
  final Function(DateTime) onPageChanged;
  final Function(CalendarFormat) onFormatChanged;

  const _CalendarTab({
    required DateTime focusedDay,
    required DateTime selectedDay,
    required CalendarFormat calFormat,
    required this.planMap,
    required this.onDaySelected,
    required this.onPageChanged,
    required this.onFormatChanged,
  })  : _focusedDay = focusedDay,
        _selectedDay = selectedDay,
        _calFormat = calFormat;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: TableCalendar<VisitPlanModel>(
        locale:           'id_ID',
        firstDay:         DateTime(2024),
        lastDay:          DateTime(2030),
        focusedDay:       _focusedDay,
        selectedDayPredicate: (d) => isSameDay(d, _selectedDay),
        calendarFormat:   _calFormat,
        availableCalendarFormats: const {
          CalendarFormat.month:    'Bulanan',
          CalendarFormat.twoWeeks: '2 Minggu',
          CalendarFormat.week:     'Mingguan',
        },
        eventLoader: (day) {
          final key = DateTime(day.year, day.month, day.day);
          return planMap[key] ?? [];
        },
        onDaySelected:   onDaySelected,
        onPageChanged:   onPageChanged,
        onFormatChanged: onFormatChanged,
        calendarStyle: CalendarStyle(
          outsideDaysVisible:  false,
          defaultTextStyle:    const TextStyle(color: AppColors.textPrimary),
          weekendTextStyle:    const TextStyle(color: AppColors.textSecondary),
          selectedDecoration:  const BoxDecoration(
            color: AppColors.primary, shape: BoxShape.circle,
          ),
          todayDecoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.3), shape: BoxShape.circle,
          ),
          todayTextStyle:   const TextStyle(color: AppColors.textPrimary),
          markerDecoration: const BoxDecoration(
            color: AppColors.yellow, shape: BoxShape.circle,
          ),
          markersMaxCount: 3,
        ),
        headerStyle: const HeaderStyle(
          formatButtonVisible: true,
          titleCentered:       true,
          formatButtonDecoration: BoxDecoration(
            border: Border.fromBorderSide(BorderSide(color: AppColors.primary)),
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          formatButtonTextStyle: TextStyle(color: AppColors.primary, fontSize: 12),
          titleTextStyle:  TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
          leftChevronIcon:  Icon(Icons.chevron_left,  color: AppColors.textSecondary),
          rightChevronIcon: Icon(Icons.chevron_right, color: AppColors.textSecondary),
        ),
        daysOfWeekStyle: const DaysOfWeekStyle(
          weekdayStyle: TextStyle(color: AppColors.textSecondary, fontSize: 12),
          weekendStyle: TextStyle(color: AppColors.textMuted,     fontSize: 12),
        ),
      ),
    );
  }
}

// ── Agenda Tab ───────────────────────────────────────────────────────────────

class _AgendaTab extends StatelessWidget {
  final TodaySchedule schedule;
  final DateTime      selectedDay;
  final Future<void> Function() onRefresh;

  const _AgendaTab({
    required this.schedule,
    required this.selectedDay,
    required this.onRefresh,
  });

  bool _isSelected(String? dateStr) {
    if (dateStr == null) return false;
    try { return isSameDay(DateTime.parse(dateStr), selectedDay); } catch (_) { return false; }
  }

  @override
  Widget build(BuildContext context) {
    final today = DateTime.now();
    final isToday = isSameDay(selectedDay, today);

    // Overdue: tampil hanya jika selectedDay = hari ini
    final overdue   = isToday ? schedule.overdue : <VisitPlanModel>[];
    final dueToday  = schedule.dueToday.where((p) => _isSelected(p.nextFuDate)).toList();
    final upcoming  = schedule.upcoming.where((p) => _isSelected(p.nextFuDate)).toList();

    final allItems  = [...overdue, ...dueToday, ...upcoming];
    final label     = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(selectedDay);

    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: onRefresh,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
        children: [
          Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(height: 12),

          // Overdue section
          if (overdue.isNotEmpty) ...[
            _SectionHeader(
              label: 'Overdue (${overdue.length})',
              color: AppColors.danger,
              icon: Icons.warning_amber_rounded,
            ),
            ...overdue.map((p) => _LeadCard(lead: p, variant: _CardVariant.overdue)),
            const SizedBox(height: 12),
          ],

          // Hari ini / tanggal yang dipilih
          if (dueToday.isNotEmpty) ...[
            _SectionHeader(
              label: isToday ? 'Hari Ini (${dueToday.length})' : 'Jadwal (${dueToday.length})',
              color: AppColors.yellow,
              icon: Icons.today,
            ),
            ...dueToday.map((p) => _LeadCard(lead: p, variant: _CardVariant.today)),
            const SizedBox(height: 12),
          ],

          // Upcoming di tanggal yang dipilih
          if (upcoming.isNotEmpty) ...[
            _SectionHeader(
              label: 'Mendatang (${upcoming.length})',
              color: AppColors.primary,
              icon: Icons.calendar_month,
            ),
            ...upcoming.map((p) => _LeadCard(lead: p, variant: _CardVariant.upcoming)),
          ],

          if (allItems.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.only(top: 48),
                child: Text(
                  'Tidak ada jadwal pada hari ini',
                  style: TextStyle(color: AppColors.textMuted),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Section Header ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  final Color  color;
  final IconData icon;
  const _SectionHeader({required this.label, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, color: color, size: 14),
          const SizedBox(width: 6),
          Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

// ── Lead Card ────────────────────────────────────────────────────────────────

enum _CardVariant { overdue, today, upcoming }

class _LeadCard extends StatelessWidget {
  final VisitPlanModel lead;
  final _CardVariant   variant;
  const _LeadCard({required this.lead, required this.variant});

  static const _typeIcon = <String, IconData>{
    'kunjungan': Icons.directions_car,
    'meeting':   Icons.handshake,
    'online':    Icons.videocam,
    'whatsapp':  Icons.chat,
    'call':      Icons.phone,
  };
  static const _typeColor = <String, Color>{
    'kunjungan': AppColors.success,
    'meeting':   AppColors.primary,
    'online':    Colors.purple,
    'whatsapp':  Color(0xFF25D366),
    'call':      AppColors.yellow,
  };
  static const _typeLabel = <String, String>{
    'kunjungan': 'Kunjungan',
    'meeting':   'Meeting',
    'online':    'Online',
    'whatsapp':  'WhatsApp',
    'call':      'Call',
  };

  Color get _borderColor {
    if (variant == _CardVariant.overdue) return AppColors.danger;
    if (variant == _CardVariant.today)   return AppColors.yellow;
    return AppColors.primary;
  }

  @override
  Widget build(BuildContext context) {
    final typeColor = _typeColor[lead.nextFuType] ?? AppColors.yellow;
    final typeIcon  = _typeIcon[lead.nextFuType]  ?? Icons.phone;
    final typeLabel = _typeLabel[lead.nextFuType] ?? lead.nextFuType;

    return GestureDetector(
      onTap: () => context.push('/pipeline/${lead.leadId}'),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.bg3,
          borderRadius: BorderRadius.circular(12),
          border: Border(left: BorderSide(color: _borderColor, width: 3)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Tipe FU badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: typeColor.withOpacity(0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(typeIcon, size: 11, color: typeColor),
                      const SizedBox(width: 4),
                      Text(typeLabel, style: TextStyle(color: typeColor, fontSize: 11, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                // Prioritas badge
                _PriorityBadge(prioritas: lead.prioritas),
                const Spacer(),
                if (variant == _CardVariant.overdue && lead.daysOverdue != null)
                  Text(
                    '${lead.daysOverdue}h lalu',
                    style: const TextStyle(color: AppColors.danger, fontSize: 11, fontWeight: FontWeight.w600),
                  ),
                if (variant != _CardVariant.overdue && lead.nextFuDate != null)
                  Text(
                    _fmtDate(lead.nextFuDate!),
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              lead.namaCompany,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              '${lead.stage} · ${lead.salesOwner}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
            ),
            if (lead.lastFuNotes != null && lead.lastFuNotes!.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                lead.lastFuNotes!,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _fmtDate(String s) {
    try { return DateFormat('d MMM', 'id_ID').format(DateTime.parse(s)); } catch (_) { return s; }
  }
}

class _PriorityBadge extends StatelessWidget {
  final String prioritas;
  const _PriorityBadge({required this.prioritas});

  @override
  Widget build(BuildContext context) {
    final color = prioritas == 'Hot'
        ? AppColors.danger
        : prioritas == 'Warm'
            ? AppColors.warning
            : AppColors.textMuted;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(prioritas, style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600)),
    );
  }
}
