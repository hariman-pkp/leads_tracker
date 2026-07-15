import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/local_notification_service.dart';

// ── Icon & Color helpers (sama dengan web) ────────────────────────────────────

IconData _metodeIcon(String m) {
  final s = m.toLowerCase();
  if (s.contains('whatsapp'))                     return Icons.chat;
  if (s.contains('visit') || s.contains('kunjungan')) return Icons.directions_car;
  if (s.contains('meeting'))                      return Icons.handshake;
  if (s.contains('email'))                        return Icons.email;
  if (s.contains('video') || s.contains('online')) return Icons.videocam;
  return Icons.phone;
}

Color _metodeColor(String m) {
  final s = m.toLowerCase();
  if (s.contains('whatsapp'))                     return const Color(0xFF22C55E);
  if (s.contains('visit') || s.contains('kunjungan')) return const Color(0xFF10B981);
  if (s.contains('meeting'))                      return const Color(0xFF3B82F6);
  if (s.contains('email'))                        return const Color(0xFF6366F1);
  if (s.contains('video') || s.contains('online')) return const Color(0xFF8B5CF6);
  return const Color(0xFFF59E0B); // call = yellow
}

Color _prioritasColor(String p) {
  switch (p.toLowerCase()) {
    case 'hot':  return AppColors.danger;
    case 'warm': return AppColors.warning;
    default:     return AppColors.textMuted;
  }
}

// ── Models ────────────────────────────────────────────────────────────────────

class _ScheduleEntry {
  final String   leadId;
  final String   company;
  final String   stage;
  final String   priority;
  final String   product;
  final String   fuStatus;   // 'Overdue' | 'Today' | 'Upcoming'
  final DateTime fuDate;
  final String   nextFuType; // call | whatsapp | kunjungan | meeting | online

  const _ScheduleEntry({
    required this.leadId,
    required this.company,
    required this.stage,
    required this.priority,
    required this.product,
    required this.fuStatus,
    required this.fuDate,
    required this.nextFuType,
  });

  factory _ScheduleEntry.fromMap(Map<String, dynamic> m) {
    DateTime parseDate(dynamic v) {
      if (v == null) return DateTime.now();
      try { return DateTime.parse(v.toString()); } catch (_) { return DateTime.now(); }
    }
    return _ScheduleEntry(
      leadId:     m['lead_id']?.toString()    ?? '',
      company:    m['nama_company']?.toString() ?? '',
      stage:      m['stage']?.toString()      ?? '',
      priority:   m['prioritas']?.toString()  ?? '',
      product:    m['product']?.toString()    ?? '',
      fuStatus:   m['fu_status']?.toString()  ?? 'Upcoming',
      fuDate:     parseDate(m['next_fu_date']),
      nextFuType: m['next_fu_type']?.toString() ?? 'call',
    );
  }
}

class _FuLog {
  final String   fuId;
  final String   leadId;
  final String   company;
  final String   salesOwner;
  final DateTime tglFu;
  final String   metodeFu;
  final String   hasilFu;
  final String   catatanFu;
  final String   stage;
  final String   prioritas;

  const _FuLog({
    required this.fuId,
    required this.leadId,
    required this.company,
    required this.salesOwner,
    required this.tglFu,
    required this.metodeFu,
    required this.hasilFu,
    required this.catatanFu,
    required this.stage,
    required this.prioritas,
  });

  factory _FuLog.fromMap(Map<String, dynamic> m) {
    DateTime parseDate(dynamic v) {
      if (v == null) return DateTime.now();
      try { return DateTime.parse(v.toString()); } catch (_) { return DateTime.now(); }
    }
    return _FuLog(
      fuId:       m['fu_id']?.toString()        ?? '',
      leadId:     m['lead_id']?.toString()      ?? '',
      company:    m['nama_company']?.toString()  ?? '',
      salesOwner: m['sales_owner']?.toString()  ?? '',
      tglFu:      parseDate(m['tgl_fu']),
      metodeFu:   m['metode_fu']?.toString()    ?? 'Phone',
      hasilFu:    m['hasil_fu']?.toString()     ?? '',
      catatanFu:  m['catatan_fu']?.toString()   ?? '',
      stage:      m['stage']?.toString()        ?? '',
      prioritas:  m['prioritas']?.toString()    ?? '',
    );
  }
}

class _CombinedData {
  final List<_ScheduleEntry> scheduled;
  final List<_FuLog>         logs;
  const _CombinedData({required this.scheduled, required this.logs});
}

// ── Providers ─────────────────────────────────────────────────────────────────

final _followupDataProvider = FutureProvider<_CombinedData>((ref) async {
  final results = await Future.wait([
    ApiClient.instance.get('/v1/schedule?days=30'),
    ApiClient.instance.get('/v1/followup?per_page=50'),
  ]);

  final schedData = results[0].data as Map<String, dynamic>;
  final scheduled = (schedData['schedule'] as List? ?? [])
      .map((e) => _ScheduleEntry.fromMap(Map<String, dynamic>.from(e as Map)))
      .toList();

  final logsData = results[1].data as Map<String, dynamic>;
  final logs = (logsData['logs'] as List? ?? [])
      .map((e) => _FuLog.fromMap(Map<String, dynamic>.from(e as Map)))
      .toList();

  return _CombinedData(scheduled: scheduled, logs: logs);
});

// ── Screen ────────────────────────────────────────────────────────────────────

class FollowupListScreen extends ConsumerStatefulWidget {
  const FollowupListScreen({super.key});

  @override
  ConsumerState<FollowupListScreen> createState() => _FollowupListScreenState();
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
    WidgetsBinding.instance.addPostFrameCallback((_) => _checkOverdueNotif());
  }

  void _checkOverdueNotif() {
    ref.read(_followupDataProvider.future).then((data) {
      final overdue = data.scheduled.where((e) => e.fuStatus == 'Overdue').toList();
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

  List<_ScheduleEntry> _scheduledForDay(List<_ScheduleEntry> entries, DateTime day) =>
      entries.where((e) =>
          e.fuDate.year == day.year &&
          e.fuDate.month == day.month &&
          e.fuDate.day == day.day).toList();

  List<_FuLog> _logsForDay(List<_FuLog> logs, DateTime day) =>
      logs.where((l) =>
          l.tglFu.year == day.year &&
          l.tglFu.month == day.month &&
          l.tglFu.day == day.day).toList();

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(_followupDataProvider);

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
                color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
        actions: [
          IconButton(
            onPressed: () => ref.invalidate(_followupDataProvider),
            icon: const Icon(Icons.refresh, color: AppColors.textSecondary, size: 20),
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textMuted,
          indicatorColor: AppColors.primary,
          indicatorSize: TabBarIndicatorSize.label,
          tabs: const [
            Tab(icon: Icon(Icons.calendar_month_outlined, size: 18), text: 'Kalender'),
            Tab(icon: Icon(Icons.format_list_bulleted, size: 18),    text: 'Daftar'),
          ],
        ),
      ),
      body: async.when(
        loading: () => const Center(
            child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => _ErrorView(
            error: e.toString(),
            onRetry: () => ref.invalidate(_followupDataProvider)),
        data: (combined) => TabBarView(
          controller: _tabCtrl,
          children: [
            _CalendarTab(
              scheduled:   combined.scheduled,
              logs:        combined.logs,
              focusedDay:  _focusedDay,
              selectedDay: _selectedDay,
              calFormat:   _calFormat,
              scheduledForDay: _scheduledForDay,
              logsForDay:      _logsForDay,
              onDaySelected: (sel, foc) =>
                  setState(() { _selectedDay = sel; _focusedDay = foc; }),
              onFormatChanged: (fmt) => setState(() => _calFormat = fmt),
            ),
            _ListTab(scheduled: combined.scheduled, logs: combined.logs),
          ],
        ),
      ),
    );
  }
}

// ── Calendar Tab ──────────────────────────────────────────────────────────────

class _CalendarTab extends StatelessWidget {
  final List<_ScheduleEntry> scheduled;
  final List<_FuLog>         logs;
  final DateTime             focusedDay;
  final DateTime             selectedDay;
  final CalendarFormat       calFormat;
  final List<_ScheduleEntry> Function(List<_ScheduleEntry>, DateTime) scheduledForDay;
  final List<_FuLog>         Function(List<_FuLog>, DateTime) logsForDay;
  final void Function(DateTime, DateTime) onDaySelected;
  final void Function(CalendarFormat)     onFormatChanged;

  const _CalendarTab({
    required this.scheduled,
    required this.logs,
    required this.focusedDay,
    required this.selectedDay,
    required this.calFormat,
    required this.scheduledForDay,
    required this.logsForDay,
    required this.onDaySelected,
    required this.onFormatChanged,
  });

  @override
  Widget build(BuildContext context) {
    final dayScheduled = scheduledForDay(scheduled, selectedDay);
    final dayLogs      = logsForDay(logs, selectedDay);

    return Column(children: [
      Container(
        color: AppColors.bg2,
        child: TableCalendar(
          locale:           'id_ID',
          firstDay:         DateTime.utc(2024, 1, 1),
          lastDay:          DateTime.utc(2027, 12, 31),
          focusedDay:       focusedDay,
          selectedDayPredicate: (d) => isSameDay(d, selectedDay),
          calendarFormat:   calFormat,
          startingDayOfWeek: StartingDayOfWeek.monday,
          eventLoader: (day) {
            // Return combined count so dots appear
            final s = scheduledForDay(scheduled, day).length;
            final l = logsForDay(logs, day).length;
            return List.generate(s + l, (i) => i);
          },
          onDaySelected:   onDaySelected,
          onFormatChanged: onFormatChanged,
          headerStyle: const HeaderStyle(
            formatButtonVisible: true,
            titleCentered: true,
            formatButtonShowsNext: false,
            titleTextStyle: TextStyle(
                color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700),
            leftChevronIcon:  Icon(Icons.chevron_left,  color: AppColors.textSecondary),
            rightChevronIcon: Icon(Icons.chevron_right, color: AppColors.textSecondary),
            formatButtonDecoration: BoxDecoration(
              color: AppColors.bg3,
              borderRadius: BorderRadius.all(Radius.circular(8)),
              border: Border.fromBorderSide(BorderSide(color: AppColors.border)),
            ),
            formatButtonTextStyle: TextStyle(color: AppColors.primary, fontSize: 11),
          ),
          calendarBuilders: CalendarBuilders(
            markerBuilder: (ctx, day, events) {
              final sCount = scheduledForDay(scheduled, day).length;
              final lCount = logsForDay(logs, day).length;
              if (sCount == 0 && lCount == 0) return null;
              return Positioned(
                bottom: 4,
                child: Row(mainAxisSize: MainAxisSize.min, children: [
                  if (sCount > 0)
                    Container(
                      width: 6, height: 6, margin: const EdgeInsets.symmetric(horizontal: 1),
                      decoration: const BoxDecoration(
                          color: Color(0xFFF97316), shape: BoxShape.circle),
                    ),
                  if (lCount > 0)
                    Container(
                      width: 6, height: 6, margin: const EdgeInsets.symmetric(horizontal: 1),
                      decoration: const BoxDecoration(
                          color: Color(0xFF10B981), shape: BoxShape.circle),
                    ),
                ]),
              );
            },
          ),
          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            defaultTextStyle:  const TextStyle(color: AppColors.textPrimary, fontSize: 13),
            weekendTextStyle:  const TextStyle(color: AppColors.textPrimary, fontSize: 13),
            selectedDecoration: const BoxDecoration(
                color: AppColors.primary, shape: BoxShape.circle),
            todayDecoration: BoxDecoration(
                color: AppColors.primary.withAlpha(40), shape: BoxShape.circle),
            todayTextStyle: const TextStyle(color: AppColors.primary, fontSize: 13),
          ),
          daysOfWeekStyle: const DaysOfWeekStyle(
            weekdayStyle: TextStyle(color: AppColors.textSecondary, fontSize: 11),
            weekendStyle: TextStyle(color: AppColors.textMuted,     fontSize: 11),
          ),
        ),
      ),

      // Legend
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        child: Row(children: [
          _dot(const Color(0xFFF97316)), const SizedBox(width: 4),
          const Text('Terjadwal', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(width: 12),
          _dot(const Color(0xFF10B981)), const SizedBox(width: 4),
          const Text('Selesai', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ]),
      ),

      const Divider(height: 1, color: AppColors.border),

      // Selected day header
      Padding(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 6),
        child: Row(children: [
          Text(DateFormat('EEEE, d MMMM', 'id_ID').format(selectedDay),
              style: const TextStyle(
                  color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(width: 8),
          if (dayScheduled.isNotEmpty || dayLogs.isNotEmpty)
            Text('${dayScheduled.length + dayLogs.length} item',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        ]),
      ),

      Expanded(
        child: (dayScheduled.isEmpty && dayLogs.isEmpty)
            ? _EmptyDay(date: selectedDay)
            : ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                children: [
                  if (dayScheduled.isNotEmpty) ...[
                    _SectionHeader(label: 'Terjadwal', count: dayScheduled.length,
                        color: const Color(0xFFF97316)),
                    const SizedBox(height: 6),
                    ...dayScheduled.map((e) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _ScheduleCard(entry: e),
                    )),
                    if (dayLogs.isNotEmpty) const SizedBox(height: 10),
                  ],
                  if (dayLogs.isNotEmpty) ...[
                    _SectionHeader(label: 'Selesai', count: dayLogs.length,
                        color: const Color(0xFF10B981)),
                    const SizedBox(height: 6),
                    ...dayLogs.map((l) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _FuLogCard(log: l),
                    )),
                  ],
                ],
              ),
      ),
    ]);
  }

  Widget _dot(Color c) => Container(
    width: 8, height: 8,
    decoration: BoxDecoration(color: c, shape: BoxShape.circle),
  );
}

// ── List Tab ──────────────────────────────────────────────────────────────────

class _ListTab extends StatelessWidget {
  final List<_ScheduleEntry> scheduled;
  final List<_FuLog>         logs;

  const _ListTab({required this.scheduled, required this.logs});

  @override
  Widget build(BuildContext context) {
    final overdue  = scheduled.where((e) => e.fuStatus == 'Overdue').toList();
    final today    = scheduled.where((e) => e.fuStatus == 'Today').toList();
    final upcoming = scheduled.where((e) => e.fuStatus == 'Upcoming').toList();

    if (scheduled.isEmpty && logs.isEmpty) return _EmptyView();

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        // ── Overdue ──────────────────────────────────────────────────
        if (overdue.isNotEmpty) ...[
          _SectionHeader(label: 'Overdue', count: overdue.length, color: AppColors.danger),
          const SizedBox(height: 8),
          ...overdue.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _ScheduleCard(entry: e),
          )),
          const SizedBox(height: 12),
        ],

        // ── Hari Ini ─────────────────────────────────────────────────
        if (today.isNotEmpty) ...[
          _SectionHeader(label: 'Hari Ini', count: today.length,
              color: const Color(0xFFF97316)),
          const SizedBox(height: 8),
          ...today.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _ScheduleCard(entry: e),
          )),
          const SizedBox(height: 12),
        ],

        // ── Upcoming ─────────────────────────────────────────────────
        if (upcoming.isNotEmpty) ...[
          _SectionHeader(label: 'Upcoming (30 hari)', count: upcoming.length,
              color: AppColors.primary),
          const SizedBox(height: 8),
          ...upcoming.map((e) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _ScheduleCard(entry: e),
          )),
          const SizedBox(height: 16),
        ],

        // ── FU Selesai ────────────────────────────────────────────────
        if (logs.isNotEmpty) ...[
          _SectionHeader(label: 'FU Selesai', count: logs.length,
              color: const Color(0xFF10B981)),
          const SizedBox(height: 8),
          ...logs.map((l) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: _FuLogCard(log: l),
          )),
        ],
      ],
    );
  }
}

// ── Schedule Card (Terjadwal) ─────────────────────────────────────────────────

class _ScheduleCard extends StatelessWidget {
  final _ScheduleEntry entry;
  const _ScheduleCard({required this.entry});

  @override
  Widget build(BuildContext context) {
    final isOverdue = entry.fuStatus == 'Overdue';
    final isToday   = entry.fuStatus == 'Today';
    final barColor  = isOverdue ? AppColors.danger
        : isToday ? const Color(0xFFF97316) : AppColors.primary;
    final fuColor   = _metodeColor(entry.nextFuType);
    final fuIcon    = _metodeIcon(entry.nextFuType);
    final pColor    = _prioritasColor(entry.priority);

    return Material(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: () => context.push('/pipeline/${entry.leadId}'),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
                color: isOverdue ? AppColors.danger.withAlpha(80) : AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: Stack(children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(
                      child: Text(entry.company,
                          style: const TextStyle(
                              color: AppColors.textPrimary, fontSize: 14,
                              fontWeight: FontWeight.w600),
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: pColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(entry.priority,
                          style: TextStyle(color: pColor, fontSize: 10,
                              fontWeight: FontWeight.w600)),
                    ),
                  ]),
                  if (entry.product.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(entry.product,
                        style: const TextStyle(
                            color: AppColors.textSecondary, fontSize: 11)),
                  ],
                  const SizedBox(height: 8),
                  Row(children: [
                    // Tipe FU badge dengan icon
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: fuColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(fuIcon, size: 11, color: fuColor),
                        const SizedBox(width: 4),
                        Text(entry.nextFuType,
                            style: TextStyle(color: fuColor, fontSize: 10,
                                fontWeight: FontWeight.w600)),
                      ]),
                    ),
                    const Spacer(),
                    Icon(isOverdue ? Icons.warning_amber_outlined : Icons.event_outlined,
                        color: barColor, size: 13),
                    const SizedBox(width: 4),
                    Text(
                      isOverdue
                          ? 'Terlambat · ${DateFormat('d MMM', 'id_ID').format(entry.fuDate)}'
                          : isToday ? 'Hari Ini'
                          : DateFormat('d MMM', 'id_ID').format(entry.fuDate),
                      style: TextStyle(color: barColor, fontSize: 11,
                          fontWeight: FontWeight.w600)),
                    const SizedBox(width: 10),
                    GestureDetector(
                      onTap: () => context.push(
                        '/pipeline/${entry.leadId}/followup',
                        extra: {'nama': entry.company},
                      ),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Catat FU',
                            style: TextStyle(color: Colors.white, fontSize: 11,
                                fontWeight: FontWeight.w600)),
                      ),
                    ),
                  ]),
                ]),
              ),
              Positioned(left: 0, top: 0, bottom: 0,
                  child: Container(width: 4, color: barColor)),
            ]),
          ),
        ),
      ),
    );
  }
}

// ── FU Log Card (Selesai) ─────────────────────────────────────────────────────

class _FuLogCard extends StatelessWidget {
  final _FuLog log;
  const _FuLogCard({required this.log});

  @override
  Widget build(BuildContext context) {
    final mColor = _metodeColor(log.metodeFu);
    final mIcon  = _metodeIcon(log.metodeFu);
    final pColor = _prioritasColor(log.prioritas);

    return Material(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: () => context.push('/pipeline/${log.leadId}'),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: Stack(children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(children: [
                    Expanded(
                      child: Text(log.company,
                          style: const TextStyle(
                              color: AppColors.textPrimary, fontSize: 14,
                              fontWeight: FontWeight.w600),
                          maxLines: 1, overflow: TextOverflow.ellipsis),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: pColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(log.prioritas,
                          style: TextStyle(color: pColor, fontSize: 10,
                              fontWeight: FontWeight.w600)),
                    ),
                  ]),
                  const SizedBox(height: 6),
                  Row(children: [
                    // Metode FU badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: mColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(mIcon, size: 11, color: mColor),
                        const SizedBox(width: 4),
                        Text(log.metodeFu,
                            style: TextStyle(color: mColor, fontSize: 10,
                                fontWeight: FontWeight.w600)),
                      ]),
                    ),
                    const SizedBox(width: 6),
                    // Hasil FU
                    Flexible(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: log.hasilFu == 'Interested'
                              ? const Color(0xFF22C55E).withAlpha(25)
                              : AppColors.bg3,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(log.hasilFu,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                                color: log.hasilFu == 'Interested'
                                    ? const Color(0xFF22C55E) : AppColors.textSecondary,
                                fontSize: 10)),
                      ),
                    ),
                    const SizedBox(width: 6),
                    const Icon(Icons.check_circle_outline,
                        color: Color(0xFF10B981), size: 13),
                    const SizedBox(width: 4),
                    Text(DateFormat('d MMM', 'id_ID').format(log.tglFu),
                        style: const TextStyle(color: Color(0xFF10B981),
                            fontSize: 11, fontWeight: FontWeight.w600)),
                  ]),
                  if (log.catatanFu.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Text(log.catatanFu,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ]),
              ),
              // Garis kiri hijau = selesai
              const Positioned(left: 0, top: 0, bottom: 0,
                  child: SizedBox(width: 4,
                      child: ColoredBox(color: Color(0xFF10B981)))),
            ]),
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
  const _SectionHeader({required this.label, required this.count, required this.color});

  @override
  Widget build(BuildContext context) => Row(children: [
    Text(label, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.w700)),
    const SizedBox(width: 8),
    Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withAlpha(30), borderRadius: BorderRadius.circular(10)),
      child: Text('$count',
          style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
    ),
  ]);
}

class _EmptyDay extends StatelessWidget {
  final DateTime date;
  const _EmptyDay({required this.date});

  @override
  Widget build(BuildContext context) => Center(
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.event_available_outlined, color: AppColors.success, size: 48),
      const SizedBox(height: 12),
      Text('Tidak ada agenda pada\n${DateFormat('d MMMM yyyy', 'id_ID').format(date)}',
          textAlign: TextAlign.center,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
    ]),
  );
}

class _EmptyView extends StatelessWidget {
  @override
  Widget build(BuildContext context) => const Center(
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      Icon(Icons.check_circle_outline, color: AppColors.success, size: 56),
      SizedBox(height: 16),
      Text('Tidak ada jadwal FU!',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 16,
              fontWeight: FontWeight.w600)),
      SizedBox(height: 6),
      Text('Semua follow-up sudah selesai',
          style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
    ]),
  );
}

class _ErrorView extends StatelessWidget {
  final String       error;
  final VoidCallback onRetry;
  const _ErrorView({required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) => Center(
    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
      const Icon(Icons.cloud_off, color: AppColors.textMuted, size: 48),
      const SizedBox(height: 12),
      Text(error,
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
          textAlign: TextAlign.center),
      const SizedBox(height: 16),
      ElevatedButton(onPressed: onRetry, child: const Text('Coba Lagi')),
    ]),
  );
}
