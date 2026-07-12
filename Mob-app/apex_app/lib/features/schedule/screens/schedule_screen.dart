import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../pipeline/repositories/pipeline_repository.dart';
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
  CalendarFormat    _calFormat = CalendarFormat.month;
  DateTime          _focusedDay  = DateTime.now();
  DateTime          _selectedDay = DateTime.now();

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

  String _fmtMonth(DateTime d) => DateFormat('MMMM yyyy', 'id_ID').format(d);

  void _onDaySelected(DateTime selected, DateTime focused) {
    setState(() {
      _selectedDay = selected;
      _focusedDay  = focused;
    });
    // Switch ke tab Agenda
    _tabCtrl.animateTo(1);
  }

  void _onPageChanged(DateTime focused) {
    setState(() => _focusedDay = focused);
    final m = '${focused.year}-${focused.month.toString().padLeft(2, '0')}';
    ref.read(visitPlanMonthProvider.notifier).state = m;
  }

  @override
  Widget build(BuildContext context) {
    final plans    = ref.watch(visitPlanProvider);
    final authUser = ref.watch(authProvider).user;

    // Map date → plans untuk marker kalender
    final Map<DateTime, List<VisitPlanModel>> planMap = {};
    plans.valueOrNull?.forEach((p) {
      try {
        final d = DateTime.parse(p.plannedDate);
        final key = DateTime(d.year, d.month, d.day);
        planMap.putIfAbsent(key, () => []).add(p);
      } catch (_) {}
    });

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
                  IconButton(
                    icon: const Icon(Icons.add, color: AppColors.primary),
                    onPressed: () => _showAddPlanSheet(context, ref, authUser),
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
                tabs: const [
                  Tab(text: 'Kalender'),
                  Tab(text: 'Agenda'),
                ],
              ),
            ),

            const SizedBox(height: 8),

            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: [
                  // ── Tab Kalender ───────────────────────────────────────
                  _CalendarTab(
                    focusedDay:   _focusedDay,
                    selectedDay:  _selectedDay,
                    calFormat:    _calFormat,
                    planMap:      planMap,
                    onDaySelected: _onDaySelected,
                    onPageChanged: _onPageChanged,
                    onFormatChanged: (f) => setState(() => _calFormat = f),
                  ),

                  // ── Tab Agenda ─────────────────────────────────────────
                  _AgendaTab(
                    selectedDay: _selectedDay,
                    plans:       plans,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddPlanSheet(BuildContext ctx, WidgetRef ref, dynamic authUser) {
    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _AddPlanSheet(
        initialDate: _selectedDay,
        authUser:    authUser,
      ),
    );
  }
}

// ── Kalender ────────────────────────────────────────────────────────────────

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
  })  : _focusedDay  = focusedDay,
        _selectedDay = selectedDay,
        _calFormat   = calFormat;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: TableCalendar<VisitPlanModel>(
        locale:            'id_ID',
        firstDay:          DateTime(2024),
        lastDay:           DateTime(2030),
        focusedDay:        _focusedDay,
        selectedDayPredicate: (d) => isSameDay(d, _selectedDay),
        calendarFormat:    _calFormat,
        availableCalendarFormats: const {
          CalendarFormat.month:       'Bulanan',
          CalendarFormat.twoWeeks:    '2 Minggu',
          CalendarFormat.week:        'Mingguan',
        },
        eventLoader: (day) {
          final key = DateTime(day.year, day.month, day.day);
          return planMap[key] ?? [];
        },
        onDaySelected:   onDaySelected,
        onPageChanged:   onPageChanged,
        onFormatChanged: onFormatChanged,
        calendarStyle: CalendarStyle(
          outsideDaysVisible:   false,
          defaultTextStyle:     const TextStyle(color: AppColors.textPrimary),
          weekendTextStyle:     const TextStyle(color: AppColors.textSecondary),
          selectedDecoration:   const BoxDecoration(
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
          formatButtonVisible:      true,
          titleCentered:            true,
          formatButtonDecoration:   BoxDecoration(
            border: Border.fromBorderSide(BorderSide(color: AppColors.primary)),
            borderRadius: BorderRadius.all(Radius.circular(8)),
          ),
          formatButtonTextStyle: TextStyle(color: AppColors.primary, fontSize: 12),
          titleTextStyle:        TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600),
          leftChevronIcon:       Icon(Icons.chevron_left,  color: AppColors.textSecondary),
          rightChevronIcon:      Icon(Icons.chevron_right, color: AppColors.textSecondary),
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

class _AgendaTab extends ConsumerWidget {
  final DateTime _selectedDay;
  final AsyncValue<List<VisitPlanModel>> plans;

  const _AgendaTab({
    required DateTime selectedDay,
    required this.plans,
  }) : _selectedDay = selectedDay;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return plans.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      error:   (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: AppColors.danger))),
      data:    (list) {
        final dayPlans = list.where((p) {
          try {
            final d = DateTime.parse(p.plannedDate);
            return isSameDay(d, _selectedDay);
          } catch (_) { return false; }
        }).toList();

        final label = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_selectedDay);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
              child: Text(
                label,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
              ),
            ),
            if (dayPlans.isEmpty)
              const Expanded(
                child: Center(
                  child: Text(
                    'Tidak ada agenda hari ini',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                ),
              )
            else
              Expanded(
                child: RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => ref.read(visitPlanProvider.notifier).refresh(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: dayPlans.length,
                    itemBuilder: (_, i) => _PlanCard(plan: dayPlans[i]),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

// ── Plan Card ────────────────────────────────────────────────────────────────

class _PlanCard extends ConsumerWidget {
  final VisitPlanModel plan;
  const _PlanCard({required this.plan});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = plan.isDone
        ? AppColors.success
        : plan.isCancelled
            ? AppColors.textMuted
            : AppColors.yellow;

    final statusLabel = plan.isDone
        ? 'Selesai'
        : plan.isCancelled
            ? 'Dibatalkan'
            : 'Direncanakan';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bg3,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: statusColor, width: 3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              if (plan.plannedTime != null) ...[
                Icon(Icons.access_time, size: 13, color: AppColors.textSecondary),
                const SizedBox(width: 4),
                Text(
                  plan.plannedTime!.substring(0, 5),
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
                const SizedBox(width: 10),
              ],
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  statusLabel,
                  style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w600),
                ),
              ),
              const Spacer(),
              if (plan.isPlanned)
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, color: AppColors.textSecondary, size: 18),
                  color: AppColors.bg4,
                  onSelected: (v) async {
                    if (v == 'done') {
                      await ref.read(visitPlanProvider.notifier).updateStatus(plan.id, 'done');
                    } else if (v == 'cancel') {
                      await ref.read(visitPlanProvider.notifier).updateStatus(plan.id, 'cancelled');
                    } else if (v == 'delete') {
                      await ref.read(visitPlanProvider.notifier).deletePlan(plan.id);
                    }
                  },
                  itemBuilder: (_) => [
                    const PopupMenuItem(value: 'done',   child: Text('Tandai Selesai', style: TextStyle(color: AppColors.textPrimary))),
                    const PopupMenuItem(value: 'cancel', child: Text('Batalkan',       style: TextStyle(color: AppColors.warning))),
                    const PopupMenuItem(value: 'delete', child: Text('Hapus',          style: TextStyle(color: AppColors.danger))),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 6),
          if (plan.leadNama != null) ...[
            Row(
              children: [
                const Icon(Icons.business, size: 13, color: AppColors.primary),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    plan.leadNama!,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
          ],
          if (plan.notes != null && plan.notes!.isNotEmpty)
            Text(
              plan.notes!,
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
          if (plan.salesNama != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  plan.salesNama!,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

// ── Add Plan Bottom Sheet ─────────────────────────────────────────────────────

class _AddPlanSheet extends ConsumerStatefulWidget {
  final DateTime initialDate;
  final dynamic  authUser;
  const _AddPlanSheet({required this.initialDate, this.authUser});

  @override
  ConsumerState<_AddPlanSheet> createState() => _AddPlanSheetState();
}

class _AddPlanSheetState extends ConsumerState<_AddPlanSheet> {
  late DateTime _date;
  TimeOfDay?    _time;
  String?       _leadId;
  String?       _leadNama;
  final _notesCtrl = TextEditingController();
  bool _saving = false;

  // Simple leads list untuk dropdown
  List<Map<String, dynamic>> _leads = [];

  @override
  void initState() {
    super.initState();
    _date = widget.initialDate;
    _loadLeads();
  }

  @override
  void dispose() {
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadLeads() async {
    try {
      final repo  = PipelineRepository();
      final result = await repo.fetchLeads(limit: 200, offset: 0);
      if (mounted) {
        setState(() {
          _leads = result.leads.map((l) => {
            'lead_id':      l.leadId,
            'nama_company': l.namaCompany,
          }).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final dateStr = DateFormat('yyyy-MM-dd').format(_date);
      final timeStr = _time != null
          ? '${_time!.hour.toString().padLeft(2, '0')}:${_time!.minute.toString().padLeft(2, '0')}:00'
          : null;
      await ref.read(visitPlanProvider.notifier).addPlan(
        plannedDate: dateStr,
        plannedTime: timeStr,
        leadId:      _leadId,
        notes:       _notesCtrl.text.trim().isEmpty ? null : _notesCtrl.text.trim(),
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal: $e'), backgroundColor: AppColors.danger),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateLabel = DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_date);

    return Padding(
      padding: EdgeInsets.only(
        left: 16, right: 16, top: 16,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Handle
          Center(
            child: Container(
              width: 40, height: 4,
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AppColors.textMuted, borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const Text(
            'Tambah Rencana Kunjungan',
            style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 16),

          // Tanggal
          _FieldLabel('Tanggal'),
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _date,
                firstDate: DateTime(2024),
                lastDate: DateTime(2030),
                builder: (ctx, child) => Theme(
                  data: ThemeData.dark().copyWith(
                    colorScheme: const ColorScheme.dark(primary: AppColors.primary),
                  ),
                  child: child!,
                ),
              );
              if (picked != null) setState(() => _date = picked);
            },
            child: _FieldBox(
              child: Row(
                children: [
                  const Icon(Icons.calendar_today, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(dateLabel, style: const TextStyle(color: AppColors.textPrimary)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Jam
          _FieldLabel('Jam (opsional)'),
          GestureDetector(
            onTap: () async {
              final picked = await showTimePicker(
                context: context,
                initialTime: _time ?? TimeOfDay.now(),
                builder: (ctx, child) => Theme(
                  data: ThemeData.dark().copyWith(
                    colorScheme: const ColorScheme.dark(primary: AppColors.primary),
                  ),
                  child: child!,
                ),
              );
              if (picked != null) setState(() => _time = picked);
            },
            child: _FieldBox(
              child: Row(
                children: [
                  const Icon(Icons.access_time, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Text(
                    _time != null ? _time!.format(context) : 'Pilih jam',
                    style: TextStyle(
                      color: _time != null ? AppColors.textPrimary : AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Lead / Klien
          _FieldLabel('Klien / Lead (opsional)'),
          GestureDetector(
            onTap: () => _showLeadPicker(),
            child: _FieldBox(
              child: Row(
                children: [
                  const Icon(Icons.business, size: 16, color: AppColors.primary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _leadNama ?? 'Pilih lead',
                      style: TextStyle(
                        color: _leadNama != null ? AppColors.textPrimary : AppColors.textMuted,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (_leadNama != null)
                    GestureDetector(
                      onTap: () => setState(() { _leadId = null; _leadNama = null; }),
                      child: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Catatan
          _FieldLabel('Catatan (opsional)'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bg3,
              borderRadius: BorderRadius.circular(10),
            ),
            child: TextField(
              controller: _notesCtrl,
              maxLines: 3,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Tujuan kunjungan, produk yang ditawarkan, dll.',
                hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 13),
                border: InputBorder.none,
                contentPadding: EdgeInsets.all(12),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Tombol Simpan
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _saving ? null : _save,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _saving
                  ? const SizedBox(
                      width: 20, height: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ),
          ),
        ],
      ),
    );
  }

  void _showLeadPicker() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        itemCount: _leads.length,
        itemBuilder: (_, i) {
          final l = _leads[i];
          return ListTile(
            title: Text(l['nama_company'] as String, style: const TextStyle(color: AppColors.textPrimary)),
            onTap: () {
              setState(() {
                _leadId   = l['lead_id'] as String;
                _leadNama = l['nama_company'] as String;
              });
              Navigator.pop(context);
            },
          );
        },
      ),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String text;
  const _FieldLabel(this.text);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(text, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
  );
}

class _FieldBox extends StatelessWidget {
  final Widget child;
  const _FieldBox({required this.child});
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 13),
    decoration: BoxDecoration(
      color: AppColors.bg3,
      borderRadius: BorderRadius.circular(10),
    ),
    child: child,
  );
}
