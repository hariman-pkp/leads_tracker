import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/local_notification_service.dart';

// ── Models ────────────────────────────────────────────────────────────────────

class _ScheduleEntry {
  final String leadId;
  final String company;
  final String stage;
  final String priority;
  final String product;
  final String fuStatus;   // 'Overdue' | 'Today' | 'Upcoming'
  final DateTime fuDate;

  const _ScheduleEntry({
    required this.leadId,
    required this.company,
    required this.stage,
    required this.priority,
    required this.product,
    required this.fuStatus,
    required this.fuDate,
  });

  factory _ScheduleEntry.fromMap(Map<String, dynamic> m) {
    DateTime parseDate(dynamic v) {
      if (v == null) return DateTime.now();
      try { return DateTime.parse(v.toString()); } catch (_) { return DateTime.now(); }
    }
    return _ScheduleEntry(
      leadId:   m['lead_id']?.toString()   ?? '',
      company:  m['nama_company']?.toString() ?? '',
      stage:    m['stage']?.toString()     ?? '',
      priority: m['prioritas']?.toString() ?? '',
      product:  m['product']?.toString()   ?? '',
      fuStatus: m['fu_status']?.toString() ?? 'Upcoming',
      fuDate:   parseDate(m['next_fu_date']),
    );
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────

final scheduleProvider = FutureProvider<List<_ScheduleEntry>>((ref) async {
  final res  = await ApiClient.instance.get('/v1/schedule?days=30');
  final data = res.data as Map<String, dynamic>;
  final all  = (data['schedule'] as List? ?? []);
  return all
      .map((e) => _ScheduleEntry.fromMap(Map<String, dynamic>.from(e as Map)))
      .toList();
});

// ── Screen ────────────────────────────────────────────────────────────────────

class FollowupListScreen extends ConsumerStatefulWidget {
  const FollowupListScreen({super.key});

  @override
  ConsumerState<FollowupListScreen> createState() =>
      _FollowupListScreenState();
}

class _FollowupListScreenState extends ConsumerState<FollowupListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  DateTime _focusedDay  = DateTime.now();
  DateTime _selectedDay = DateTime.now();
  CalendarFormat _calFormat = CalendarFormat.month;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
    // Trigger local notif jika ada overdue saat buka halaman ini
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkOverdueNotif());
  }

  void _checkOverdueNotif() {
    ref.read(scheduleProvider.future).then((entries) {
      final overdue = entries.where((e) => e.fuStatus == 'Overdue').toList();
      if (overdue.isEmpty) return;
      LocalNotificationService.instance.show(
        id: 9001,
        title: '⏰ ${overdue.length} Follow-Up Terlewat',
        body: overdue.length == 1
            ? 'FU ${overdue.first.company} sudah terlewat.'
            : '${overdue.length} jadwal FU sudah terlewat. Segera tindaklanjuti.',
      );
    }).catchError((_) {});
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  // Returns entries for a given day (ignores time)
  List<_ScheduleEntry> _forDay(
      List<_ScheduleEntry> entries, DateTime day) {
    return entries.where((e) =>
        e.fuDate.year  == day.year &&
        e.fuDate.month == day.month &&
        e.fuDate.day   == day.day).toList();
  }

  @override
  Widget build(BuildContext context) {
    final schedule = ref.watch(scheduleProvider);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        leading: IconButton(
          onPressed: () => context.go('/dashboard'),
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
        ),
        title: const Text('Follow-Up',
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(scheduleProvider),
            icon: const Icon(Icons.refresh,
                color: AppColors.textSecondary, size: 20),
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textMuted,
          indicatorColor: AppColors.primary,
          indicatorSize: TabBarIndicatorSize.label,
          tabs: const [
            Tab(icon: Icon(Icons.calendar_month_outlined, size: 18),
                text: 'Kalender'),
            Tab(icon: Icon(Icons.format_list_bulleted, size: 18),
                text: 'Daftar'),
          ],
        ),
      ),
      body: schedule.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => _ErrorView(
            error: e.toString(),
            onRetry: () => ref.invalidate(scheduleProvider)),
        data: (entries) => TabBarView(
          controller: _tabCtrl,
          children: [
            _CalendarTab(
              entries:     entries,
              focusedDay:  _focusedDay,
              selectedDay: _selectedDay,
              calFormat:   _calFormat,
              forDay:      _forDay,
              onDaySelected: (sel, foc) =>
                  setState(() { _selectedDay = sel; _focusedDay = foc; }),
              onFormatChanged: (fmt) => setState(() => _calFormat = fmt),
            ),
            _ListTab(entries: entries),
          ],
        ),
      ),
    );
  }
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────

class _CalendarTab extends StatelessWidget {
  final List<_ScheduleEntry>                   entries;
  final DateTime                               focusedDay;
  final DateTime                               selectedDay;
  final CalendarFormat                         calFormat;
  final List<_ScheduleEntry> Function(List<_ScheduleEntry>, DateTime) forDay;
  final void Function(DateTime, DateTime)      onDaySelected;
  final void Function(CalendarFormat)          onFormatChanged;

  const _CalendarTab({
    required this.entries,
    required this.focusedDay,
    required this.selectedDay,
    required this.calFormat,
    required this.forDay,
    required this.onDaySelected,
    required this.onFormatChanged,
  });

  @override
  Widget build(BuildContext context) {
    final dayEntries = forDay(entries, selectedDay);

    return Column(
      children: [
        // ── Calendar ──────────────────────────────────────────────
        Container(
          color: AppColors.bg2,
          child: TableCalendar<_ScheduleEntry>(
            locale:          'id_ID',
            firstDay:        DateTime.utc(2024, 1, 1),
            lastDay:         DateTime.utc(2027, 12, 31),
            focusedDay:      focusedDay,
            selectedDayPredicate: (d) => isSameDay(d, selectedDay),
            calendarFormat:  calFormat,
            startingDayOfWeek: StartingDayOfWeek.monday,
            eventLoader: (day) => forDay(entries, day),
            onDaySelected:   onDaySelected,
            onFormatChanged: onFormatChanged,
            headerStyle: const HeaderStyle(
              formatButtonVisible: true,
              titleCentered: true,
              formatButtonShowsNext: false,
              titleTextStyle: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w700),
              leftChevronIcon: Icon(Icons.chevron_left,
                  color: AppColors.textSecondary),
              rightChevronIcon: Icon(Icons.chevron_right,
                  color: AppColors.textSecondary),
              formatButtonDecoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.all(Radius.circular(8)),
                border: Border.fromBorderSide(
                    BorderSide(color: AppColors.border)),
              ),
              formatButtonTextStyle: TextStyle(
                  color: AppColors.primary, fontSize: 11),
            ),
            calendarStyle: CalendarStyle(
              outsideDaysVisible: false,
              defaultTextStyle:
                  const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              weekendTextStyle:
                  const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              selectedDecoration: const BoxDecoration(
                  color: AppColors.primary, shape: BoxShape.circle),
              todayDecoration: BoxDecoration(
                  color: AppColors.primary.withAlpha(40),
                  shape: BoxShape.circle),
              todayTextStyle:
                  const TextStyle(color: AppColors.primary, fontSize: 13),
              markerDecoration: const BoxDecoration(
                  color: Color(0xFFFF8C42), shape: BoxShape.circle),
              markersMaxCount: 3,
              markerSize: 5,
            ),
            daysOfWeekStyle: const DaysOfWeekStyle(
              weekdayStyle: TextStyle(
                  color: AppColors.textSecondary, fontSize: 11),
              weekendStyle: TextStyle(
                  color: AppColors.textMuted, fontSize: 11),
            ),
          ),
        ),

        const Divider(height: 1),

        // ── Selected Day Header ────────────────────────────────────
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: Row(
            children: [
              Text(
                DateFormat('EEEE, d MMMM', 'id_ID').format(selectedDay),
                style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w700),
              ),
              const SizedBox(width: 8),
              if (dayEntries.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha(30),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('${dayEntries.length}',
                      style: const TextStyle(
                          color: AppColors.primary,
                          fontSize: 11,
                          fontWeight: FontWeight.w600)),
                ),
            ],
          ),
        ),

        // ── Day Entries ────────────────────────────────────────────
        Expanded(
          child: dayEntries.isEmpty
              ? _EmptyDay(date: selectedDay)
              : ListView.separated(
                  padding:
                      const EdgeInsets.fromLTRB(16, 0, 16, 24),
                  itemCount: dayEntries.length,
                  separatorBuilder: (_, __) =>
                      const SizedBox(height: 8),
                  itemBuilder: (_, i) => _FuCard(entry: dayEntries[i]),
                ),
        ),
      ],
    );
  }
}

// ── List Tab ──────────────────────────────────────────────────────────────────

class _ListTab extends StatelessWidget {
  final List<_ScheduleEntry> entries;
  const _ListTab({required this.entries});

  @override
  Widget build(BuildContext context) {
    final overdue  = entries.where((e) => e.fuStatus == 'Overdue').toList();
    final today    = entries.where((e) => e.fuStatus == 'Today').toList();
    final upcoming = entries.where((e) => e.fuStatus == 'Upcoming').toList();

    if (entries.isEmpty) return _EmptyView();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        if (overdue.isNotEmpty) ...[
          _SectionHeader(
              label: 'Overdue', count: overdue.length,
              color: AppColors.danger),
          const SizedBox(height: 8),
          ...overdue.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _FuCard(entry: e))),
          const SizedBox(height: 12),
        ],
        if (today.isNotEmpty) ...[
          _SectionHeader(
              label: 'Hari Ini', count: today.length,
              color: const Color(0xFFFF8C42)),
          const SizedBox(height: 8),
          ...today.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _FuCard(entry: e))),
          const SizedBox(height: 12),
        ],
        if (upcoming.isNotEmpty) ...[
          _SectionHeader(
              label: 'Upcoming (30 hari)',
              count: upcoming.length,
              color: AppColors.primary),
          const SizedBox(height: 8),
          ...upcoming.map((e) => Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _FuCard(entry: e))),
        ],
      ],
    );
  }
}

// ── FU Card ───────────────────────────────────────────────────────────────────

class _FuCard extends StatelessWidget {
  final _ScheduleEntry entry;
  const _FuCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    final isOverdue = entry.fuStatus == 'Overdue';
    final isToday   = entry.fuStatus == 'Today';
    final color = isOverdue
        ? AppColors.danger
        : isToday
            ? const Color(0xFFFF8C42)
            : AppColors.primary;

    Color priorityColor() {
      switch (entry.priority.toLowerCase()) {
        case 'hot':  return AppColors.danger;
        case 'warm': return AppColors.warning;
        default:     return AppColors.textMuted;
      }
    }

    return Material(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: () => context.push('/pipeline/${entry.leadId}'),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: isOverdue
                ? AppColors.danger.withAlpha(80) : AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Expanded(
                          child: Text(entry.company,
                              style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: priorityColor().withAlpha(25),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(entry.priority,
                              style: TextStyle(
                                  color: priorityColor(),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ]),
                      if (entry.product.isNotEmpty) ...[
                        const SizedBox(height: 3),
                        Text(entry.product,
                            style: const TextStyle(
                                color: AppColors.textSecondary,
                                fontSize: 11)),
                      ],
                      const SizedBox(height: 8),
                      Row(children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withAlpha(20),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(entry.stage,
                              style: const TextStyle(
                                  color: AppColors.primary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w500)),
                        ),
                        const Spacer(),
                        Icon(
                          isOverdue
                              ? Icons.warning_amber_outlined
                              : Icons.event_outlined,
                          color: color, size: 13),
                        const SizedBox(width: 4),
                        Text(
                          isOverdue
                              ? 'Terlambat · ${DateFormat('d MMM', 'id_ID').format(entry.fuDate)}'
                              : isToday
                                  ? 'Hari Ini'
                                  : DateFormat('d MMM', 'id_ID').format(entry.fuDate),
                          style: TextStyle(
                              color: color,
                              fontSize: 11,
                              fontWeight: FontWeight.w600)),
                        const SizedBox(width: 10),
                        GestureDetector(
                          onTap: () => context.push(
                            '/pipeline/${entry.leadId}/followup',
                            extra: {'nama': entry.company},
                          ),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 10, vertical: 5),
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Text('Catat FU',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600)),
                          ),
                        ),
                      ]),
                    ],
                  ),
                ),
                Positioned(
                  left: 0, top: 0, bottom: 0,
                  child: Container(width: 4, color: color),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Supporting Widgets ────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String label;
  final int    count;
  final Color  color;
  const _SectionHeader(
      {required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) => Row(children: [
        Text(label,
            style: TextStyle(
                color: color, fontSize: 13, fontWeight: FontWeight.w700)),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
          decoration: BoxDecoration(
            color: color.withAlpha(30),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Text('$count',
              style: TextStyle(
                  color: color, fontSize: 12, fontWeight: FontWeight.w600)),
        ),
      ]);
}

class _EmptyDay extends StatelessWidget {
  final DateTime date;
  const _EmptyDay({required this.date});

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.event_available_outlined,
                color: AppColors.success, size: 48),
            const SizedBox(height: 12),
            Text(
              'Tidak ada FU pada\n${DateFormat('d MMMM yyyy', 'id_ID').format(date)}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13),
            ),
          ],
        ),
      );
}

class _EmptyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.check_circle_outline,
                color: AppColors.success, size: 56),
            SizedBox(height: 16),
            Text('Tidak ada jadwal FU!',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w600)),
            SizedBox(height: 6),
            Text('Semua follow-up sudah selesai',
                style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 13)),
          ],
        ),
      );
}

class _ErrorView extends StatelessWidget {
  final String       error;
  final VoidCallback onRetry;
  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off,
                color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text(error,
                style: const TextStyle(
                    color: AppColors.textSecondary, fontSize: 13),
                textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
                onPressed: onRetry, child: const Text('Coba Lagi')),
          ],
        ),
      );
}
