import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/location_tracking_service.dart';
import '../../../core/utils/date_utils.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/auth/repositories/auth_repository.dart';
import '../../../features/notifications/providers/notifications_provider.dart';
import '../models/dashboard_model.dart';
import '../providers/dashboard_provider.dart';

// ── Providers ─────────────────────────────────────────────────────────────────

final weeklyFuProvider = FutureProvider<List<_DayFu>>((ref) async {
  // Derive dari dashboardStatsProvider — tidak perlu API call terpisah
  final stats = await ref.read(dashboardStatsProvider.future);
  final today = WibDate.today();
  final labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  return List.generate(7, (i) {
    final d   = today.subtract(Duration(days: 6 - i));
    final key = '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';
    return _DayFu(
      label:   labels[d.weekday - 1],
      count:   stats.weeklyFu[key] ?? 0,
      isToday: d.year == today.year && d.month == today.month && d.day == today.day,
    );
  });
});

class _DayFu {
  final String label;
  final int    count;
  final bool   isToday;
  const _DayFu({required this.label, required this.count, required this.isToday});
}

final agendaProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final res     = await ApiClient.instance.get('/v1/followup');
  final data    = res.data as Map<String, dynamic>;
  final today   = (data['today_due'] as List? ?? [])
      .map((e) => {...(e as Map<String, dynamic>), '_overdue': false})
      .toList();
  final overdue = (data['overdue'] as List? ?? [])
      .map((e) => {...(e as Map<String, dynamic>), '_overdue': true})
      .toList();
  return [...overdue, ...today];
});

// ── Dashboard Screen ──────────────────────────────────────────────────────────

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState   = ref.watch(authProvider);
    final stats       = ref.watch(dashboardStatsProvider);
    final unread      = ref.watch(unreadCountProvider);
    final agenda      = ref.watch(agendaProvider);
    final weekly      = ref.watch(weeklyFuProvider);
    final user        = authState.user;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(dashboardStatsProvider);
            ref.invalidate(weeklyFuProvider);
            ref.invalidate(agendaProvider);
          },
          color: AppColors.primary,
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            slivers: [

              // ── Gradient Header ────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      colors: [Color(0xFF020810), Color(0xFF04101E), Color(0xFF071828)],
                      begin: Alignment.topCenter,
                      end:   Alignment.bottomCenter,
                    ),
                  ),
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          GestureDetector(
                            onTap: () => Scaffold.of(context).openDrawer(),
                            child: () {
                              final photoUrl = user?.avatarPhoto;
                              if (photoUrl != null) {
                                final url = 'http://localhost:8002/api/v1/static/$photoUrl';
                                return CircleAvatar(
                                  radius: 20,
                                  backgroundImage: NetworkImage(url),
                                );
                              }
                              return CircleAvatar(
                                radius: 20,
                                backgroundColor: Colors.white24,
                                child: Text(
                                  user != null && user.nama.isNotEmpty
                                      ? user.nama[0].toUpperCase() : 'U',
                                  style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700),
                                ),
                              );
                            }(),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Selamat datang,',
                                    style: TextStyle(
                                        color: Color(0xB3FFFFFF), fontSize: 12)),
                                Text(
                                  '${user?.nama.split(' ').first ?? ''} 👋',
                                  style: const TextStyle(
                                      color: Color(0xFFE2E8F0),
                                      fontSize: 15,
                                      fontWeight: FontWeight.w700),
                                ),
                              ],
                            ),
                          ),
                          _TrackingIcon(),
                          const SizedBox(width: 4),
                          _NotifBell(unread: unread),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: () => _showProfileMenu(context, ref, user),
                            child: Container(
                              width: 36, height: 36,
                              decoration: BoxDecoration(
                                color: Colors.white.withAlpha(38),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(Icons.person_outline,
                                  color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
                      // Pipeline card — only when data is ready
                      stats.maybeWhen(
                        data: (s) => Padding(
                          padding: const EdgeInsets.only(top: 16),
                          child: _PipelineCard(stats: s),
                        ),
                        orElse: () => const SizedBox.shrink(),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Body ──────────────────────────────────────────────
              SliverToBoxAdapter(
                child: stats.when(
                  loading: () => const Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(child: CircularProgressIndicator(
                        color: AppColors.primary)),
                  ),
                  error: (e, _) => Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      children: [
                        const Icon(Icons.cloud_off,
                            color: AppColors.textMuted, size: 48),
                        const SizedBox(height: 12),
                        Text('$e',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: AppColors.textSecondary, fontSize: 13)),
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => ref.invalidate(dashboardStatsProvider),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                  data: (s) => _DashboardData(
                    stats: s,
                    agenda: agenda,
                    weekly: weekly,
                    onAgendaTap: (id) => context.push('/pipeline/$id'),
                    onShowAll:   () => context.push('/followup-list'),
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 28)),
            ],
          ),
        ),
      ),
    );
  }

  void _showProfileMenu(BuildContext context, WidgetRef ref, dynamic user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ProfileSheet(ref: ref, user: user),
    );
  }
}

// ── Notification Bell ─────────────────────────────────────────────────────────

class _NotifBell extends StatelessWidget {
  final AsyncValue<int> unread;
  const _NotifBell({required this.unread});

  @override
  Widget build(BuildContext context) {
    final count = unread.maybeWhen(data: (n) => n, orElse: () => 0);
    return GestureDetector(
      onTap: () => context.push('/notifications'),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(38),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.notifications_outlined,
                color: Colors.white, size: 20),
          ),
          if (count > 0)
            Positioned(
              top: -2, right: -2,
              child: Container(
                constraints:
                    const BoxConstraints(minWidth: 16, minHeight: 16),
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: const Color(0xFFFF5722),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                      color: const Color(0xFF29ABE2), width: 1.5),
                ),
                child: Text(
                  count > 99 ? '99+' : '$count',
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 8,
                      fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Pipeline Card ─────────────────────────────────────────────────────────────

class _PipelineCard extends StatelessWidget {
  final DashboardStats stats;
  const _PipelineCard({required this.stats});

  @override
  Widget build(BuildContext context) {
    final s = stats;

    String fmt(double v) {
      if (v >= 1e9) return 'Rp ${(v / 1e9).toStringAsFixed(1)}M';
      if (v >= 1e6) return 'Rp ${(v / 1e6).toStringAsFixed(1)}Jt';
      if (v >= 1e3) return 'Rp ${(v / 1e3).toStringAsFixed(0)}Rb';
      return 'Rp 0';
    }

    // Won bulan ini sebagai pencapaian
    final won    = s.wonAmountMonth;
    final target = s.targetMonth;
    final pct    = target > 0 ? (won / target * 100).clamp(0, 999) : 0.0;
    final ratio  = (pct / 100).clamp(0.0, 1.0);

    final pctColor = pct >= 80
        ? const Color(0xFF69D96D)
        : pct >= 50
            ? const Color(0xFFFBBF24)
            : const Color(0xFFF87171);

    return Container(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(89),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0x3329ABE2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Label
          const Text('PENCAPAIAN BULAN INI',
              style: TextStyle(
                  color: Color(0x80FFFFFF),
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.8)),
          const SizedBox(height: 10),

          // Won amount + % row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Kiri: won amount
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      fmt(won),
                      style: const TextStyle(
                          color: Color(0xFFE2E8F0),
                          fontSize: 26,
                          fontWeight: FontWeight.w800,
                          letterSpacing: -0.5),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      target > 0 ? 'Target: ${fmt(target)}' : 'Target belum diset',
                      style: const TextStyle(
                          color: Color(0x80FFFFFF), fontSize: 12),
                    ),
                  ],
                ),
              ),
              // Kanan: persentase
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    target > 0 ? '${pct.toStringAsFixed(0)}%' : '—',
                    style: TextStyle(
                        color: pctColor,
                        fontSize: 26,
                        fontWeight: FontWeight.w800),
                  ),
                  Text(
                    'tercapai',
                    style: TextStyle(
                        color: pctColor.withAlpha(180), fontSize: 12),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: 12),

          // Progress bar
          ClipRRect(
            borderRadius: BorderRadius.circular(99),
            child: Container(
              height: 6,
              color: Colors.white.withAlpha(20),
              child: FractionallySizedBox(
                widthFactor: ratio,
                alignment: Alignment.centerLeft,
                child: Container(color: pctColor),
              ),
            ),
          ),

          const SizedBox(height: 10),

          // Divider
          Container(height: 0.5, color: Colors.white.withAlpha(20)),
          const SizedBox(height: 10),

          // Footer: pipeline open sebagai konteks proyeksi
          Row(
            children: [
              const Icon(Icons.trending_up, color: Color(0x6029ABE2), size: 13),
              const SizedBox(width: 4),
              Text(
                'Pipeline open: ${fmt(s.pipelineValueMonth)}',
                style: const TextStyle(color: Color(0x80FFFFFF), fontSize: 11),
              ),
              const Spacer(),
              Text(
                '${s.pipelineCount} aktif · ${s.wonThisMonth} won',
                style: const TextStyle(color: Color(0x60FFFFFF), fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Dashboard Data Body ───────────────────────────────────────────────────────

class _DashboardData extends StatelessWidget {
  final DashboardStats                         stats;
  final AsyncValue<List<Map<String, dynamic>>> agenda;
  final AsyncValue<List<_DayFu>>               weekly;
  final void Function(String id)               onAgendaTap;
  final VoidCallback                           onShowAll;

  const _DashboardData({
    required this.stats,
    required this.agenda,
    required this.weekly,
    required this.onAgendaTap,
    required this.onShowAll,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [

          // ── Stat Cards 2×2 ──────────────────────────────────────
          Row(children: [
            Expanded(child: _StatCard(
              icon:  Icons.business_center_outlined,
              label: 'Leads Aktif',
              value: '${stats.activeLeads}',
              color: AppColors.primary,
            )),
            const SizedBox(width: 10),
            Expanded(child: _StatCard(
              icon:  Icons.warning_amber_rounded,
              label: 'FU Overdue',
              value: '${stats.overdueFollowUp}',
              color: AppColors.danger,
              accent: stats.overdueFollowUp > 0,
              onTap: stats.overdueFollowUp > 0
                  ? () => context.push('/followup-list') : null,
            )),
          ]),
          const SizedBox(height: 10),
          Row(children: [
            Expanded(child: _StatCard(
              icon:  Icons.emoji_events_outlined,
              label: 'Won Bulan Ini',
              value: '${stats.wonThisMonth}',
              color: AppColors.success,
              accent: stats.wonThisMonth > 0,
            )),
            const SizedBox(width: 10),
            Expanded(child: _StatCard(
              icon:  Icons.calendar_today_outlined,
              label: 'FU Hari Ini',
              value: '${stats.followUpToday}',
              color: const Color(0xFFFF8C42),
              accent: stats.followUpToday > 0,
              onTap: stats.followUpToday > 0
                  ? () => context.push('/followup-list') : null,
            )),
          ]),

          // ── Quick Stats Row ──────────────────────────────────────
          const SizedBox(height: 10),
          _QuickStatsRow(stats: stats),

          // ── Agenda ──────────────────────────────────────────────
          agenda.maybeWhen(
            data: (items) => items.isEmpty
                ? const SizedBox.shrink()
                : _AgendaSection(
                    items:     items,
                    onTap:     onAgendaTap,
                    onShowAll: onShowAll,
                  ),
            orElse: () => const SizedBox.shrink(),
          ),

          // ── Weekly Chart ─────────────────────────────────────────
          weekly.maybeWhen(
            data: (days) => _WeeklyChart(days: days),
            orElse: () => const SizedBox.shrink(),
          ),

          // ── Analytics Shortcut ───────────────────────────────────
          const SizedBox(height: 20),
          _AnalyticsShortcut(),

          // ── Stage Breakdown ──────────────────────────────────────
          if (stats.stageBreakdown.isNotEmpty) ...[
            const SizedBox(height: 20),
            const Text('Breakdown per Stage',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 13,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                children: stats.stageBreakdown.map((st) {
                  final c = _stageColor(st.stage);
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 5),
                    child: Row(children: [
                      Container(
                          width: 8, height: 8,
                          decoration: BoxDecoration(
                              color: c, shape: BoxShape.circle)),
                      const SizedBox(width: 10),
                      Expanded(child: Text(st.stage,
                          style: const TextStyle(
                              color: AppColors.textPrimary, fontSize: 13))),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: c.withAlpha(30),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text('${st.count} lead',
                            style: TextStyle(
                                color: c,
                                fontSize: 11,
                                fontWeight: FontWeight.w600)),
                      ),
                    ]),
                  );
                }).toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Color _stageColor(String stage) {
    final s = stage.toLowerCase();
    if (s.contains('prospect'))    return AppColors.stageProspect;
    if (s.contains('qualified'))   return AppColors.stageQualified;
    if (s.contains('proposal'))    return AppColors.stageProposal;
    if (s.contains('negotiation')) return AppColors.stageNegotiation;
    if (s.contains('won'))         return AppColors.stageWon;
    if (s.contains('lost'))        return AppColors.stageLost;
    return AppColors.primary;
  }
}

// ── Analytics Shortcut ────────────────────────────────────────────────────────

class _AnalyticsShortcut extends StatelessWidget {
  const _AnalyticsShortcut();

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.push('/analytics'),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1E3A5F), Color(0xFF0F2340)],
            begin: Alignment.topLeft,
            end:   Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.primary.withAlpha(60)),
        ),
        child: Row(
          children: [
            Container(
              width: 44, height: 44,
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(40),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.bar_chart, color: AppColors.primary, size: 24),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Analitik Personal', style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  )),
                  SizedBox(height: 2),
                  Text('Win rate, trend FU, nilai pipeline', style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 12,
                  )),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, color: AppColors.textMuted, size: 14),
          ],
        ),
      ),
    );
  }
}

// ── Quick Stats Row ───────────────────────────────────────────────────────────

class _QuickStatsRow extends StatelessWidget {
  final DashboardStats stats;
  const _QuickStatsRow({required this.stats});

  @override
  Widget build(BuildContext context) {
    String fmtCurrency(double v) {
      if (v >= 1e9) return 'Rp ${(v / 1e9).toStringAsFixed(1)}M';
      if (v >= 1e6) return 'Rp ${(v / 1e6).toStringAsFixed(0)}Jt';
      if (v > 0)    return 'Rp ${(v / 1e3).toStringAsFixed(0)}Rb';
      return '—';
    }

    final winColor = stats.winRate >= 30
        ? AppColors.success
        : stats.winRate >= 15
            ? AppColors.warning
            : AppColors.danger;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          _QuickStat(
            label: 'Win Rate',
            value: '${stats.winRate.toStringAsFixed(0)}%',
            color: winColor,
            icon: Icons.trending_up,
          ),
          _Divider(),
          _QuickStat(
            label: 'Avg Deal Size',
            value: fmtCurrency(stats.avgDealSize),
            color: AppColors.primary,
            icon: Icons.paid_outlined,
          ),
          _Divider(),
          _QuickStat(
            label: 'Total Pipeline',
            value: fmtCurrency(stats.pipelineValueMonth),
            color: AppColors.textSecondary,
            icon: Icons.account_balance_wallet_outlined,
          ),
        ],
      ),
    );
  }
}

class _QuickStat extends StatelessWidget {
  final String   label;
  final String   value;
  final Color    color;
  final IconData icon;
  const _QuickStat({required this.label, required this.value,
      required this.color, required this.icon});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Column(
      children: [
        Icon(icon, color: color, size: 16),
        const SizedBox(height: 4),
        Text(value,
            style: TextStyle(
                color: color, fontSize: 13, fontWeight: FontWeight.w800),
            maxLines: 1, overflow: TextOverflow.ellipsis),
        const SizedBox(height: 2),
        Text(label,
            style: const TextStyle(
                color: AppColors.textMuted, fontSize: 10),
            textAlign: TextAlign.center),
      ],
    ),
  );
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    width: 1, height: 36,
    margin: const EdgeInsets.symmetric(horizontal: 4),
    color: AppColors.border,
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
// Uses Stack + Positioned for accent strip — avoids CrossAxisAlignment.stretch
// inside an unbounded scroll context.

class _StatCard extends StatelessWidget {
  final IconData      icon;
  final String        label;
  final String        value;
  final Color         color;
  final bool          accent;
  final VoidCallback? onTap;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    this.accent = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(11),
            child: Stack(
              children: [
                Padding(
                  padding: EdgeInsets.only(left: accent ? 10 : 14)
                      .add(const EdgeInsets.fromLTRB(0, 14, 14, 14)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Row(children: [
                        Icon(icon, color: color, size: 18),
                        if (onTap != null) ...[
                          const Spacer(),
                          Icon(Icons.chevron_right, color: color, size: 16),
                        ],
                      ]),
                      const SizedBox(height: 8),
                      Text(value,
                          style: TextStyle(
                              color: accent ? color : AppColors.primary,
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              height: 1)),
                      const SizedBox(height: 3),
                      Text(label,
                          style: const TextStyle(
                              color: AppColors.textSecondary, fontSize: 11)),
                    ],
                  ),
                ),
                if (accent)
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

// ── Agenda Section ────────────────────────────────────────────────────────────

class _AgendaSection extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  final void Function(String id)   onTap;
  final VoidCallback               onShowAll;

  const _AgendaSection({
    required this.items,
    required this.onTap,
    required this.onShowAll,
  });

  @override
  Widget build(BuildContext context) {
    final shown = items.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 20, bottom: 10),
          child: Text('AGENDA HARI INI',
              style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8)),
        ),
        ...shown.map((lead) => _AgendaItem(lead: lead, onTap: onTap)),
        if (items.length > 3)
          GestureDetector(
            onTap: onShowAll,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 10),
              margin: const EdgeInsets.only(top: 4),
              decoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              alignment: Alignment.center,
              child: Text('Lihat semua (${items.length}) →',
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w600)),
            ),
          ),
      ],
    );
  }
}

class _AgendaItem extends StatelessWidget {
  final Map<String, dynamic>     lead;
  final void Function(String id) onTap;

  const _AgendaItem({required this.lead, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final overdue  = lead['_overdue'] as bool? ?? false;
    final company  = lead['nama_company'] as String? ?? '';
    final stage    = lead['stage'] as String? ?? '';
    final leadId   = lead['lead_id'] as String? ?? '';
    final product  = lead['product'] as String? ?? '';
    final accent   = overdue ? AppColors.danger : const Color(0xFFFF8C42);
    final initials = company.length >= 2
        ? company.substring(0, 2).toUpperCase()
        : company.toUpperCase();

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: () => onTap(leadId),
          borderRadius: BorderRadius.circular(12),
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            // Stack accent strip — no CrossAxisAlignment.stretch
            child: ClipRRect(
              borderRadius: BorderRadius.circular(11),
              child: Stack(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 12, 12, 12),
                    child: Row(children: [
                      Container(
                        width: 34, height: 34,
                        decoration: BoxDecoration(
                          color: accent.withAlpha(30),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        alignment: Alignment.center,
                        child: Text(initials,
                            style: TextStyle(
                                color: accent,
                                fontSize: 12,
                                fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(company,
                                style: const TextStyle(
                                    color: AppColors.textPrimary,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis),
                            if (product.isNotEmpty)
                              Text(product,
                                  style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 11)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: accent.withAlpha(30),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(overdue ? 'Overdue' : 'Hari Ini',
                                style: TextStyle(
                                    color: accent,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600)),
                          ),
                          if (stage.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withAlpha(20),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(stage,
                                  style: const TextStyle(
                                      color: AppColors.primary,
                                      fontSize: 9,
                                      fontWeight: FontWeight.w500)),
                            ),
                          ],
                        ],
                      ),
                    ]),
                  ),
                  Positioned(
                    left: 0, top: 0, bottom: 0,
                    child: Container(width: 4, color: accent),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Weekly Chart ──────────────────────────────────────────────────────────────

class _WeeklyChart extends StatelessWidget {
  final List<_DayFu> days;
  const _WeeklyChart({required this.days});

  @override
  Widget build(BuildContext context) {
    final maxVal = days.map((d) => d.count).fold(0, (a, b) => a > b ? a : b);
    final total  = days.fold(0, (s, d) => s + d.count);

    return Padding(
      padding: const EdgeInsets.only(top: 20),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 14, 14, 10),
        decoration: BoxDecoration(
          color: AppColors.bg2,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('PERFORMA MINGGU INI',
                style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8)),
            const SizedBox(height: 14),
            SizedBox(
              height: 100,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: days.map((d) {
                  final ratio = maxVal > 0 ? d.count / maxVal : 0.0;
                  final barH  = 60.0 * ratio + 4;
                  final color = d.isToday ? AppColors.primary : AppColors.bg4;
                  return Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (d.count > 0)
                          Text('${d.count}',
                              style: TextStyle(
                                  color: d.isToday
                                      ? AppColors.primary
                                      : AppColors.textSecondary,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700)),
                        const SizedBox(height: 3),
                        ClipRRect(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(4),
                            topRight: Radius.circular(4),
                          ),
                          child: Container(
                              height: barH,
                              margin:
                                  const EdgeInsets.symmetric(horizontal: 3),
                              color: color),
                        ),
                        const SizedBox(height: 5),
                        Text(d.label,
                            style: TextStyle(
                                color: d.isToday
                                    ? AppColors.primary
                                    : AppColors.textMuted,
                                fontSize: 10,
                                fontWeight: d.isToday
                                    ? FontWeight.w700
                                    : FontWeight.w400)),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 10),
            Row(children: [
              const Text('Total FU Minggu Ini',
                  style: TextStyle(
                      color: AppColors.textSecondary, fontSize: 11)),
              const Spacer(),
              Text('$total follow-up',
                  style: const TextStyle(
                      color: AppColors.primary,
                      fontSize: 12,
                      fontWeight: FontWeight.w700)),
            ]),
          ],
        ),
      ),
    );
  }
}

// ── Profile Sheet ─────────────────────────────────────────────────────────────

class _ProfileSheet extends StatelessWidget {
  final WidgetRef ref;
  final dynamic   user;
  const _ProfileSheet({required this.ref, required this.user});

  @override
  Widget build(BuildContext context) {
    const textPri = AppColors.textPrimary;
    const textSec = AppColors.textSecondary;
    const divider = AppColors.border;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 4,
            decoration: BoxDecoration(
                color: divider,
                borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),
          () {
            final photoUrl = user?.avatarPhoto;
            if (photoUrl != null) {
              return CircleAvatar(
                radius: 28,
                backgroundImage: NetworkImage(
                    'http://localhost:8002/api/v1/static/$photoUrl'),
              );
            }
            final avatarBg = user?.resolvedAvatarColor ?? AppColors.primary;
            return CircleAvatar(
              radius: 28,
              backgroundColor: avatarBg.withAlpha(30),
              child: Text(
                user != null && user.nama.isNotEmpty
                    ? user.nama[0].toUpperCase() : 'U',
                style: TextStyle(
                    color: avatarBg,
                    fontSize: 22,
                    fontWeight: FontWeight.w700),
              ),
            );
          }(),
          const SizedBox(height: 10),
          Text(user?.nama ?? '',
              style: TextStyle(
                  color: textPri,
                  fontSize: 16,
                  fontWeight: FontWeight.w700)),
          Text(user?.email ?? '',
              style: TextStyle(color: textSec, fontSize: 13)),
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(user?.roleName ?? '',
                style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ),
          const SizedBox(height: 16),
          Divider(color: divider),
          ListTile(
            leading: Icon(Icons.lock_outline, color: textSec, size: 20),
            title: Text('Ganti Password', style: TextStyle(color: textPri)),
            onTap: () {
              Navigator.pop(context);
              showModalBottomSheet(
                context: context,
                isScrollControlled: true,
                backgroundColor: AppColors.bg2,
                shape: const RoundedRectangleBorder(
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                builder: (_) => _ChangePasswordSheet(ref: ref),
              );
            },
          ),
          ListTile(
            leading: const Icon(Icons.logout,
                color: AppColors.danger, size: 20),
            title: const Text('Keluar',
                style: TextStyle(color: AppColors.danger)),
            onTap: () {
              Navigator.pop(context);
              ref.read(authProvider.notifier).logout();
            },
          ),
        ],
      ),
    );
  }
}

// ── Change Password Sheet ─────────────────────────────────────────────────────

class _ChangePasswordSheet extends StatefulWidget {
  final WidgetRef ref;
  const _ChangePasswordSheet({required this.ref});

  @override
  State<_ChangePasswordSheet> createState() => _ChangePasswordSheetState();
}

class _ChangePasswordSheetState extends State<_ChangePasswordSheet> {
  final _currentCtrl = TextEditingController();
  final _newCtrl     = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _obsC = true, _obsN = true, _obsF = true;
  bool _saving = false;

  @override
  void dispose() {
    _currentCtrl.dispose(); _newCtrl.dispose(); _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final cur  = _currentCtrl.text.trim();
    final neu  = _newCtrl.text.trim();
    final conf = _confirmCtrl.text.trim();
    if (cur.isEmpty || neu.isEmpty || conf.isEmpty) {
      _snack('Semua field wajib diisi', error: true); return;
    }
    if (neu.length < 6) {
      _snack('Password baru minimal 6 karakter', error: true); return;
    }
    if (neu != conf) {
      _snack('Konfirmasi password tidak cocok', error: true); return;
    }
    setState(() => _saving = true);
    try {
      await AuthRepository().changePassword(
          currentPassword: cur, newPassword: neu);
      if (mounted) { Navigator.pop(context); _snack('Password berhasil diubah'); }
    } catch (e) {
      _snack('Gagal: $e', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  void _snack(String msg, {bool error = false}) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(msg),
        backgroundColor: error ? AppColors.danger : AppColors.success,
      ));

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                      color: AppColors.border,
                      borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 16),
              const Text('Ganti Password',
                  style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              _passField(_currentCtrl, 'Password Saat Ini', _obsC,
                  () => setState(() => _obsC = !_obsC)),
              const SizedBox(height: 12),
              _passField(_newCtrl, 'Password Baru', _obsN,
                  () => setState(() => _obsN = !_obsN)),
              const SizedBox(height: 12),
              _passField(_confirmCtrl, 'Konfirmasi Password Baru', _obsF,
                  () => setState(() => _obsF = !_obsF)),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _saving ? null : _save,
                  style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14)),
                  child: _saving
                      ? const SizedBox(
                          width: 18, height: 18,
                          child: CircularProgressIndicator(
                              strokeWidth: 2, color: Colors.white))
                      : const Text('Simpan Password',
                          style: TextStyle(fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _passField(TextEditingController ctrl, String label,
      bool obscure, VoidCallback toggle) =>
      TextField(
        controller: ctrl,
        obscureText: obscure,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: const Icon(Icons.lock_outline,
              color: AppColors.textSecondary, size: 18),
          suffixIcon: IconButton(
            onPressed: toggle,
            icon: Icon(
                obscure
                    ? Icons.visibility_outlined
                    : Icons.visibility_off_outlined,
                color: AppColors.textMuted,
                size: 18),
          ),
          filled: true,
          fillColor: AppColors.bg3,
          border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border)),
          enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border)),
        ),
      );
}

// ── Location Tracking Icon ────────────────────────────────────────────────────

class _TrackingIcon extends StatefulWidget {
  @override
  State<_TrackingIcon> createState() => _TrackingIconState();
}

class _TrackingIconState extends State<_TrackingIcon> {
  late final ValueNotifier<bool> _notifier;

  @override
  void initState() {
    super.initState();
    _notifier = LocationTrackingService.instance.statusNotifier;
    _notifier.addListener(_onChanged);
  }

  @override
  void dispose() {
    _notifier.removeListener(_onChanged);
    super.dispose();
  }

  void _onChanged() {
    if (mounted) setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    final on = _notifier.value;
    return Tooltip(
      message: on ? 'Location Tracking ON' : 'Location Tracking OFF',
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(38),
          shape: BoxShape.circle,
        ),
        child: Icon(
          on ? Icons.location_on : Icons.location_off,
          color: on ? const Color(0xFF10B981) : const Color(0xFF6B7280),
          size: 20,
        ),
      ),
    );
  }
}
