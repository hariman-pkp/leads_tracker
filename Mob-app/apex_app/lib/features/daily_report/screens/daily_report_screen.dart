import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/location_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../models/daily_report_model.dart';
import '../providers/daily_report_provider.dart';

class DailyReportScreen extends ConsumerStatefulWidget {
  const DailyReportScreen({super.key});

  @override
  ConsumerState<DailyReportScreen> createState() => _DailyReportScreenState();
}

class _DailyReportScreenState extends ConsumerState<DailyReportScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;

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
    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ───────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Laporan Harian',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Text(
                    DateFormat('d MMM', 'id_ID').format(DateTime.now()),
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Tab Bar ───────────────────────────────────────────────
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
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
                  Tab(text: 'Buat Laporan'),
                  Tab(text: 'Riwayat'),
                ],
              ),
            ),

            const SizedBox(height: 12),

            Expanded(
              child: TabBarView(
                controller: _tabCtrl,
                children: const [
                  _CreateReportTab(),
                  _HistoryTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Create Report Tab ─────────────────────────────────────────────────────────

class _CreateReportTab extends ConsumerStatefulWidget {
  const _CreateReportTab();

  @override
  ConsumerState<_CreateReportTab> createState() => _CreateReportTabState();
}

class _CreateReportTabState extends ConsumerState<_CreateReportTab> {
  final _obstacleCtrl = TextEditingController();
  final _planCtrl     = TextEditingController();
  String?            _mood;
  bool               _sending   = false;
  bool               _submitted = false;
  DailyReportModel?  _todayReport; // laporan hari ini jika sudah ada
  bool               _checkingToday = true;

  @override
  void initState() {
    super.initState();
    _checkTodayReport();
  }

  Future<void> _checkTodayReport() async {
    try {
      final repo   = ref.read(dailyReportRepositoryProvider);
      final today  = DateTime.now();
      final result = await repo.fetchReports(dateFrom: today, dateTo: today, limit: 1);
      if (mounted) {
        setState(() {
          _todayReport   = result.reports.isNotEmpty ? result.reports.first : null;
          _checkingToday = false;
          // Jika sudah terkirim, tampilkan halaman sukses langsung
          if (_todayReport?.isSent == true) _submitted = true;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _checkingToday = false);
    }
  }

  @override
  void dispose() {
    _obstacleCtrl.dispose();
    _planCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitReport(AutoSummary summary) async {
    setState(() => _sending = true);
    try {
      final repo = ref.read(dailyReportRepositoryProvider);
      final id   = await repo.createReport({
        'visit_count':    summary.visitCount,
        'fu_count':       summary.fuCount,
        'new_lead_count': summary.newLeadCount,
        if (_obstacleCtrl.text.isNotEmpty) 'notes_obstacle': _obstacleCtrl.text.trim(),
        if (_planCtrl.text.isNotEmpty)     'notes_plan':     _planCtrl.text.trim(),
        if (_mood != null)                 'mood':           _mood,
      });

      // Ambil GPS saat kirim — tidak blokir jika gagal
      double? lat, lng;
      String? address;
      try {
        final loc = await LocationService.instance.getCurrentLocation();
        lat     = loc.latitude;
        lng     = loc.longitude;
        address = loc.address;
      } catch (_) {
        // GPS tidak tersedia — tetap kirim tanpa lokasi
      }

      await repo.sendReport(id, lat: lat, lng: lng, address: address);
      ref.read(reportHistoryProvider.notifier).refresh();
      if (mounted) setState(() { _submitted = true; _todayReport = null; });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_checkingToday) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }

    if (_submitted) {
      return _SuccessView(onReset: () {
        setState(() { _submitted = false; _todayReport = null; });
        _checkTodayReport();
      });
    }

    // Laporan hari ini sudah ada tapi masih draft
    if (_todayReport != null && _todayReport!.isDraft) {
      return _DraftExistsView(
        report: _todayReport!,
        onSend: () async {
          setState(() => _sending = true);
          try {
            final repo = ref.read(dailyReportRepositoryProvider);
            double? lat, lng; String? address;
            try {
              final loc = await LocationService.instance.getCurrentLocation();
              lat = loc.latitude; lng = loc.longitude; address = loc.address;
            } catch (_) {}
            await repo.sendReport(_todayReport!.id, lat: lat, lng: lng, address: address);
            ref.read(reportHistoryProvider.notifier).refresh();
            if (mounted) setState(() => _submitted = true);
          } catch (e) {
            if (mounted) ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Gagal: $e'), backgroundColor: AppColors.danger),
            );
          } finally {
            if (mounted) setState(() => _sending = false);
          }
        },
        sending: _sending,
      );
    }

    final summary = ref.watch(autoSummaryProvider);

    return summary.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      error: (e, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off, color: AppColors.textMuted, size: 40),
            const SizedBox(height: 10),
            Text('$e', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
            TextButton(
              onPressed: () => ref.invalidate(autoSummaryProvider),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
      data: (s) => SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Auto-summary gradient card ────────────────────────
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0E2A40), Color(0xFF163554)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: AppColors.primary.withAlpha(60)),
              ),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.auto_awesome,
                          color: AppColors.yellow, size: 14),
                      SizedBox(width: 6),
                      Text(
                        'REKAP OTOMATIS HARI INI',
                        style: TextStyle(
                          color: AppColors.textSecondary,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _SummaryStatItem(
                        value: s.visitCount.toString(),
                        label: 'Kunjungan',
                        icon: Icons.place_outlined,
                        color: AppColors.primary,
                      ),
                      _SummaryDivider(),
                      _SummaryStatItem(
                        value: s.fuCount.toString(),
                        label: 'Follow-Up',
                        icon: Icons.phone_outlined,
                        color: AppColors.yellow,
                      ),
                      _SummaryDivider(),
                      _SummaryStatItem(
                        value: s.newLeadCount.toString(),
                        label: 'Lead Baru',
                        icon: Icons.person_add_outlined,
                        color: AppColors.success,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // ── Mood ──────────────────────────────────────────────
            const Text(
              'Bagaimana Hari Ini?',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _MoodButton(emoji: '😊', label: 'Baik',   value: 'great',   selected: _mood == 'great',   onTap: () => setState(() => _mood = 'great')),
                const SizedBox(width: 10),
                _MoodButton(emoji: '😐', label: 'Biasa',  value: 'neutral', selected: _mood == 'neutral', onTap: () => setState(() => _mood = 'neutral')),
                const SizedBox(width: 10),
                _MoodButton(emoji: '😔', label: 'Berat',  value: 'tough',   selected: _mood == 'tough',   onTap: () => setState(() => _mood = 'tough')),
              ],
            ),

            const SizedBox(height: 20),

            // ── Notes Obstacle ────────────────────────────────────
            const Text(
              'Hambatan / Kendala',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _obstacleCtrl,
              maxLines: 3,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Ceritakan kendala yang dihadapi hari ini...',
              ),
            ),

            const SizedBox(height: 16),

            // ── Notes Plan ────────────────────────────────────────
            const Text(
              'Rencana Besok',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.8,
              ),
            ),
            const SizedBox(height: 8),
            TextField(
              controller: _planCtrl,
              maxLines: 3,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: const InputDecoration(
                hintText: 'Apa rencana kamu untuk besok?...',
              ),
            ),

            const SizedBox(height: 24),

            // ── Submit Button ─────────────────────────────────────
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton.icon(
                onPressed: _sending ? null : () => _submitReport(s),
                icon: _sending
                    ? const SizedBox(
                        width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.send_outlined, size: 18),
                label: Text(
                  _sending ? 'Mengirim...' : 'Kirim Laporan ke Manager',
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                ),
              ),
            ),

            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

// ── History Tab ───────────────────────────────────────────────────────────────

class _HistoryTab extends ConsumerStatefulWidget {
  const _HistoryTab();

  @override
  ConsumerState<_HistoryTab> createState() => _HistoryTabState();
}

class _HistoryTabState extends ConsumerState<_HistoryTab> {
  final _scrollCtrl = ScrollController();

  // Filter state (admin/manager only)
  List<_UserOption> _users   = [];
  int?      _selectedUserId;
  DateTime? _dateFrom;
  DateTime? _dateTo;

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
    _loadUsers();
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  bool get _isPrivileged {
    final user = ref.read(authProvider).user;
    return user != null && (user.isAdmin || user.isManager);
  }

  Future<void> _loadUsers() async {
    if (!_isPrivileged) return;
    try {
      final res  = await ApiClient.instance.get('/v1/master/users');
      final list = res.data as List? ?? [];
      if (mounted) {
        setState(() {
          _users = list
              .map((e) => _UserOption(
                    id:   (e['id'] as num).toInt(),
                    nama: e['nama'] as String? ?? '',
                  ))
              .toList();
        });
      }
    } catch (_) {}
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      ref.read(reportHistoryProvider.notifier).loadMore();
    }
  }

  void _applyFilter() {
    ref.read(reportHistoryFilterProvider.notifier).state = ReportHistoryFilter(
      userId:   _selectedUserId,
      dateFrom: _dateFrom,
      dateTo:   _dateTo,
    );
  }

  void _resetFilter() {
    setState(() {
      _selectedUserId = null;
      _dateFrom = null;
      _dateTo   = null;
    });
    ref.read(reportHistoryFilterProvider.notifier).state = const ReportHistoryFilter();
  }

  Future<void> _pickDateRange() async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 2),
      lastDate: now,
      initialDateRange: (_dateFrom != null && _dateTo != null)
          ? DateTimeRange(start: _dateFrom!, end: _dateTo!)
          : null,
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.dark(
            primary: AppColors.primary,
            onPrimary: Colors.white,
            surface: Color(0xFF1E2D45),
            onSurface: AppColors.textPrimary,
          ),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() {
        _dateFrom = picked.start;
        _dateTo   = picked.end;
      });
      _applyFilter();
    }
  }

  bool get _hasFilter =>
      _selectedUserId != null || _dateFrom != null || _dateTo != null;

  @override
  Widget build(BuildContext context) {
    final history = ref.watch(reportHistoryProvider);

    return Column(
      children: [
        // ── Filter Bar (admin/manager only) ──────────────────────────
        if (_isPrivileged)
          Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
            color: AppColors.bg2,
            child: Row(
              children: [
                // User dropdown
                Expanded(
                  child: GestureDetector(
                    onTap: _showUserPicker,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.bg3,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _selectedUserId != null
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.person_outline,
                              size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _selectedUserId != null
                                  ? (_users.firstWhere(
                                          (u) => u.id == _selectedUserId,
                                          orElse: () =>
                                              _UserOption(id: 0, nama: '—'))
                                      .nama)
                                  : 'Semua User',
                              style: TextStyle(
                                color: _selectedUserId != null
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const Icon(Icons.expand_more,
                              size: 14, color: AppColors.textMuted),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Date range
                Expanded(
                  child: GestureDetector(
                    onTap: _pickDateRange,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: AppColors.bg3,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: _dateFrom != null
                              ? AppColors.primary
                              : AppColors.border,
                        ),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.date_range,
                              size: 14, color: AppColors.textMuted),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              _dateFrom != null && _dateTo != null
                                  ? '${_fmt(_dateFrom!)} – ${_fmt(_dateTo!)}'
                                  : 'Semua Tanggal',
                              style: TextStyle(
                                color: _dateFrom != null
                                    ? AppColors.primary
                                    : AppColors.textSecondary,
                                fontSize: 12,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Reset
                if (_hasFilter) ...[
                  const SizedBox(width: 6),
                  GestureDetector(
                    onTap: _resetFilter,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.danger.withAlpha(20),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.danger.withAlpha(60)),
                      ),
                      child: const Icon(Icons.close,
                          size: 14, color: AppColors.danger),
                    ),
                  ),
                ],
              ],
            ),
          ),

        // ── List ────────────────────────────────────────────────────
        Expanded(
          child: history.when(
            loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary)),
            error: (e, _) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off, color: AppColors.textMuted, size: 40),
                  const SizedBox(height: 10),
                  Text('$e',
                      style: const TextStyle(
                          color: AppColors.textSecondary, fontSize: 13),
                      textAlign: TextAlign.center),
                  TextButton(
                    onPressed: () =>
                        ref.read(reportHistoryProvider.notifier).refresh(),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),
            data: (s) {
              if (s.reports.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.assignment_outlined,
                          color: AppColors.textMuted, size: 48),
                      SizedBox(height: 12),
                      Text(
                        'Belum ada riwayat laporan',
                        style: TextStyle(
                            color: AppColors.textSecondary, fontSize: 13),
                      ),
                    ],
                  ),
                );
              }

              return RefreshIndicator(
                onRefresh: () =>
                    ref.read(reportHistoryProvider.notifier).refresh(),
                color: AppColors.primary,
                backgroundColor: AppColors.bg3,
                child: ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.all(16),
                  itemCount: s.reports.length + (s.hasMore ? 1 : 0),
                  itemBuilder: (_, i) {
                    if (i == s.reports.length) {
                      return const Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(
                          child: SizedBox(
                            width: 24, height: 24,
                            child: CircularProgressIndicator(
                              strokeWidth: 2, color: AppColors.primary),
                          ),
                        ),
                      );
                    }
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: _ReportHistoryCard(report: s.reports[i]),
                    );
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showUserPicker() {
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 8),
          Container(
            width: 40, height: 4,
            decoration: BoxDecoration(
              color: AppColors.border,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 12),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Pilih User',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w700)),
          ),
          const SizedBox(height: 8),
          ListTile(
            title: const Text('Semua User',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 14)),
            trailing: _selectedUserId == null
                ? const Icon(Icons.check, color: AppColors.primary, size: 18)
                : null,
            onTap: () {
              setState(() => _selectedUserId = null);
              Navigator.pop(context);
              _applyFilter();
            },
          ),
          ..._users.map((u) => ListTile(
                title: Text(u.nama,
                    style: const TextStyle(
                        color: AppColors.textPrimary, fontSize: 14)),
                trailing: _selectedUserId == u.id
                    ? const Icon(Icons.check, color: AppColors.primary, size: 18)
                    : null,
                onTap: () {
                  setState(() => _selectedUserId = u.id);
                  Navigator.pop(context);
                  _applyFilter();
                },
              )),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  String _fmt(DateTime d) => DateFormat('d MMM', 'id_ID').format(d);
}

class _UserOption {
  final int    id;
  final String nama;
  const _UserOption({required this.id, required this.nama});
}

// ── Sub Widgets ───────────────────────────────────────────────────────────────

class _SummaryStatItem extends StatelessWidget {
  final String   value;
  final String   label;
  final IconData icon;
  final Color    color;
  const _SummaryStatItem({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Expanded(
    child: Column(
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(height: 6),
        Text(value,
            style: TextStyle(
                color: color,
                fontSize: 22,
                fontWeight: FontWeight.w800)),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(
                color: AppColors.textSecondary, fontSize: 11)),
      ],
    ),
  );
}

class _SummaryDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    width: 1,
    height: 52,
    color: AppColors.border,
    margin: const EdgeInsets.symmetric(horizontal: 8),
  );
}

class _MoodButton extends StatelessWidget {
  final String emoji;
  final String label;
  final String value;
  final bool   selected;
  final VoidCallback onTap;
  const _MoodButton({
    required this.emoji, required this.label, required this.value,
    required this.selected, required this.onTap,
  });

  @override
  Widget build(BuildContext context) => Expanded(
    child: GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary.withAlpha(30) : AppColors.bg3,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.border,
            width: selected ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 22)),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: selected ? AppColors.primary : AppColors.textSecondary,
                fontSize: 11,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class _ReportHistoryCard extends ConsumerWidget {
  final DailyReportModel report;
  const _ReportHistoryCard({required this.report});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isSent  = report.isSent;
    final color   = isSent ? AppColors.success : AppColors.yellow;
    final dateStr = _formatDate(report.reportDate);

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bg3,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                dateStr,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: color.withAlpha(30),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: color.withAlpha(80)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isSent ? Icons.check_circle_outline : Icons.edit_outlined,
                      color: color, size: 11,
                    ),
                    const SizedBox(width: 3),
                    Text(
                      isSent ? 'Terkirim' : 'Draft',
                      style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ),
              if (!isSent) ...[
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _showEditSheet(context, ref),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withAlpha(20),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('Edit',
                        style: TextStyle(color: AppColors.primary, fontSize: 10,
                            fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ],
          ),
          if (report.salesNama != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.person_outline, size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(
                  report.salesNama!,
                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                ),
              ],
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              _MiniStat(Icons.place_outlined,     '${report.visitCount}',   'kunjungan'),
              _MiniStat(Icons.phone_outlined,     '${report.fuCount}',      'follow-up'),
              _MiniStat(Icons.person_add_outlined,'${report.newLeadCount}', 'lead baru'),
              if (report.mood != null) ...[
                const SizedBox(width: 12),
                Text(_moodEmoji(report.mood!), style: const TextStyle(fontSize: 16)),
              ],
              const Spacer(),
              if ((report.notesObstacle?.isNotEmpty ?? false) ||
                  (report.notesPlan?.isNotEmpty ?? false))
                GestureDetector(
                  onTap: () => _showNotesDialog(context),
                  child: const Icon(Icons.info_outline,
                      size: 18, color: AppColors.primary),
                ),
            ],
          ),
        ],
      ),
    );
  }

  void _showNotesDialog(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
        contentPadding: const EdgeInsets.fromLTRB(20, 12, 20, 4),
        title: const Row(
          children: [
            Icon(Icons.info_outline, size: 18, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Detail Laporan',
                style: TextStyle(color: AppColors.textPrimary,
                    fontSize: 15, fontWeight: FontWeight.w600)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (report.notesObstacle?.isNotEmpty ?? false) ...[
              const Row(children: [
                Text('🚧', style: TextStyle(fontSize: 13)),
                SizedBox(width: 6),
                Text('Hambatan / Kendala',
                    style: TextStyle(color: AppColors.textMuted,
                        fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              Text(report.notesObstacle!,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              const SizedBox(height: 14),
            ],
            if (report.notesPlan?.isNotEmpty ?? false) ...[
              const Row(children: [
                Text('📅', style: TextStyle(fontSize: 13)),
                SizedBox(width: 6),
                Text('Rencana Besok',
                    style: TextStyle(color: AppColors.textMuted,
                        fontSize: 12, fontWeight: FontWeight.w600)),
              ]),
              const SizedBox(height: 4),
              Text(report.notesPlan!,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Tutup',
                style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }

  Future<void> _showEditSheet(BuildContext context, WidgetRef ref) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _EditDraftSheet(report: report, ref: ref),
    );
  }

  static DateTime _parseUtc(String s) {
    // date-only strings like "2026-07-09" — treat as local midnight
    if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(s)) return DateTime.parse(s);
    final normalized = s.endsWith('Z') || s.contains('+') ? s : '${s}Z';
    return DateTime.parse(normalized).toLocal();
  }

  String _formatDate(String d) {
    try {
      return DateFormat('EEEE, d MMMM yyyy', 'id_ID').format(_parseUtc(d));
    } catch (_) { return d; }
  }

  String _moodEmoji(String mood) {
    switch (mood) {
      case 'great':
      case 'good':    return '😊';
      case 'neutral': return '😐';
      case 'tough':
      case 'hard':    return '😔';
      default:        return '';
    }
  }
}

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final String   value;
  final String   label;
  const _MiniStat(this.icon, this.value, this.label);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(right: 14),
    child: Row(
      children: [
        Icon(icon, color: AppColors.textMuted, size: 13),
        const SizedBox(width: 4),
        Text(
          '$value $label',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
        ),
      ],
    ),
  );
}

// ── Draft Exists View ─────────────────────────────────────────────────────────

class _DraftExistsView extends StatelessWidget {
  final DailyReportModel report;
  final VoidCallback     onSend;
  final bool             sending;

  const _DraftExistsView({
    required this.report,
    required this.onSend,
    required this.sending,
  });

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: AppColors.yellow.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.edit_note, color: AppColors.yellow, size: 44),
          ),
          const SizedBox(height: 20),
          const Text(
            'Draft Tersimpan',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Laporan hari ini sudah tersimpan sebagai draft.\nSiap dikirim ke Manager?',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 28),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: sending ? null : () => Navigator.of(context).maybePop(),
                  icon: const Icon(Icons.edit_outlined, size: 16),
                  label: const Text('Edit Draft'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.textSecondary,
                    side: const BorderSide(color: AppColors.border),
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: sending ? null : onSend,
                  icon: sending
                      ? const SizedBox(width: 16, height: 16,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : const Icon(Icons.send_outlined, size: 16),
                  label: Text(sending ? 'Mengirim...' : 'Kirim Sekarang'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 13),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    ),
  );
}

// ── Success View ──────────────────────────────────────────────────────────────

class _SuccessView extends StatelessWidget {
  final VoidCallback onReset;
  const _SuccessView({required this.onReset});

  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: AppColors.success.withAlpha(30),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_outline, color: AppColors.success, size: 44),
          ),
          const SizedBox(height: 20),
          const Text(
            'Laporan Terkirim!',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Laporan harian kamu sudah berhasil\ndikirim ke Manager.',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14, height: 1.5),
          ),
          const SizedBox(height: 28),
          ElevatedButton(
            onPressed: onReset,
            child: const Text('Selesai'),
          ),
        ],
      ),
    ),
  );
}

// ── Edit Draft Sheet ──────────────────────────────────────────────────────────

class _EditDraftSheet extends StatefulWidget {
  final DailyReportModel report;
  final WidgetRef        ref;
  const _EditDraftSheet({required this.report, required this.ref});

  @override
  State<_EditDraftSheet> createState() => _EditDraftSheetState();
}

class _EditDraftSheetState extends State<_EditDraftSheet> {
  late final TextEditingController _obstacleCtrl;
  late final TextEditingController _planCtrl;
  late String? _mood;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _obstacleCtrl = TextEditingController(text: widget.report.notesObstacle ?? '');
    _planCtrl     = TextEditingController(text: widget.report.notesPlan ?? '');
    _mood         = widget.report.mood;
  }

  @override
  void dispose() {
    _obstacleCtrl.dispose();
    _planCtrl.dispose();
    super.dispose();
  }

  Future<void> _save({bool send = false}) async {
    setState(() => _saving = true);
    try {
      final repo = widget.ref.read(dailyReportRepositoryProvider);
      await repo.updateReport(widget.report.id, {
        if (_obstacleCtrl.text.isNotEmpty) 'notes_obstacle': _obstacleCtrl.text.trim(),
        if (_planCtrl.text.isNotEmpty)     'notes_plan':     _planCtrl.text.trim(),
        if (_mood != null)                 'mood':           _mood,
      });
      if (send) {
        double? lat, lng;
        String? address;
        try {
          final loc = await LocationService.instance.getCurrentLocation();
          lat     = loc.latitude;
          lng     = loc.longitude;
          address = loc.address;
        } catch (_) {}
        await repo.sendReport(widget.report.id, lat: lat, lng: lng, address: address);
      }
      widget.ref.invalidate(reportHistoryProvider);
      if (mounted) {
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(send ? 'Laporan berhasil dikirim!' : 'Draft disimpan.'),
          backgroundColor: AppColors.success,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                margin: const EdgeInsets.only(top: 12, bottom: 8),
                width: 40, height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const Padding(
              padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
              child: Text('Edit Laporan Draft',
                  style: TextStyle(color: AppColors.textPrimary, fontSize: 16,
                      fontWeight: FontWeight.w700)),
            ),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Hambatan / Catatan',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _obstacleCtrl,
                    maxLines: 3,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Ceritakan hambatan hari ini...',
                      hintStyle: const TextStyle(color: AppColors.textMuted),
                      filled: true,
                      fillColor: AppColors.bg3,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Rencana Besok',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 6),
                  TextField(
                    controller: _planCtrl,
                    maxLines: 2,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Rencana untuk besok...',
                      hintStyle: const TextStyle(color: AppColors.textMuted),
                      filled: true,
                      fillColor: AppColors.bg3,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text('Mood',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      for (final m in [
                        ('😊', 'Baik', 'great'),
                        ('😐', 'Biasa', 'neutral'),
                        ('😔', 'Berat', 'tough'),
                      ]) ...[
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _mood = m.$3),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _mood == m.$3
                                    ? AppColors.primary.withAlpha(30)
                                    : AppColors.bg3,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: _mood == m.$3 ? AppColors.primary : AppColors.border,
                                ),
                              ),
                              child: Column(
                                children: [
                                  Text(m.$1, style: const TextStyle(fontSize: 20)),
                                  Text(m.$2,
                                      style: TextStyle(
                                        color: _mood == m.$3
                                            ? AppColors.primary
                                            : AppColors.textMuted,
                                        fontSize: 10,
                                      )),
                                ],
                              ),
                            ),
                          ),
                        ),
                        if (m.$3 != 'hard') const SizedBox(width: 8),
                      ],
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _saving ? null : () => _save(send: false),
                          child: const Text('Simpan Draft'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _saving ? null : () => _save(send: true),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                          ),
                          child: _saving
                              ? const SizedBox(width: 16, height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('Kirim Sekarang'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
