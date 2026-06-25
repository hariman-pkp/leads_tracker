import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/network/api_client.dart';
import '../../../core/theme/app_colors.dart';

// ── Provider ──────────────────────────────────────────────────────────────────

final _analyticsProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  final res = await ApiClient.instance.get('/v1/analytics/personal');
  return res.data as Map<String, dynamic>;
});

// ── Screen ────────────────────────────────────────────────────────────────────

class AnalyticsScreen extends ConsumerWidget {
  const AnalyticsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(_analyticsProvider);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Analitik Personal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.show_chart),
            tooltip: 'Pipeline Forecast',
            onPressed: () => context.push('/forecast'),
          ),
          IconButton(
            icon: const Icon(Icons.track_changes),
            tooltip: 'Target Sales',
            onPressed: () => context.push('/sales-target'),
          ),
          IconButton(
            icon: const Icon(Icons.receipt_long),
            tooltip: 'Entertainment Claim',
            onPressed: () => context.push('/entertain'),
          ),
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(_analyticsProvider),
          ),
        ],
      ),
      body: state.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error:   (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
              const SizedBox(height: 12),
              Text('Gagal memuat data', style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 8),
              TextButton(
                onPressed: () => ref.invalidate(_analyticsProvider),
                child: const Text('Coba lagi'),
              ),
            ],
          ),
        ),
        data: (data) => _AnalyticsBody(data: data),
      ),
    );
  }
}

class _AnalyticsBody extends StatelessWidget {
  final Map<String, dynamic> data;
  const _AnalyticsBody({required this.data});

  @override
  Widget build(BuildContext context) {
    final summary  = data['summary']  as Map<String, dynamic>? ?? {};
    final monthly  = (data['monthly_activity'] as List? ?? [])
        .cast<Map<String, dynamic>>();
    final byStage  = (data['by_stage'] as List? ?? []).cast<Map<String, dynamic>>();
    final pipeVal  = (data['pipeline_value'] as List? ?? []).cast<Map<String, dynamic>>();

    final fmt    = NumberFormat.compact(locale: 'id_ID');
    final fmtRp  = NumberFormat('#,##0', 'id_ID');
    final winRate  = double.tryParse(summary['win_rate']?.toString() ?? '0') ?? 0;
    final totalWon = double.tryParse(summary['total_deal_won']?.toString() ?? '0') ?? 0;

    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ── Summary cards ──────────────────────────────────────────────
          Row(
            children: [
              _SummaryCard(
                label: 'Total Leads',
                value: '${summary['total_leads'] ?? 0}',
                icon: Icons.business_center,
                color: AppColors.primary,
              ),
              const SizedBox(width: 10),
              _SummaryCard(
                label: 'Win Rate',
                value: '${winRate.toStringAsFixed(1)}%',
                icon: Icons.emoji_events,
                color: const Color(0xFF10B981),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _SummaryCard(
                label: 'Deal Won',
                value: 'Rp ${fmt.format(totalWon)}',
                icon: Icons.attach_money,
                color: const Color(0xFFF59E0B),
              ),
              const SizedBox(width: 10),
              _SummaryCard(
                label: 'FU Bulan Ini',
                value: '${summary['total_fu_month'] ?? 0}',
                icon: Icons.phone_callback,
                color: const Color(0xFF8B5CF6),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _SummaryCard(
                label: 'Leads Won',
                value: '${summary['won'] ?? 0}',
                icon: Icons.thumb_up,
                color: const Color(0xFF10B981),
              ),
              const SizedBox(width: 10),
              _SummaryCard(
                label: 'Leads Lost',
                value: '${summary['lost'] ?? 0}',
                icon: Icons.thumb_down,
                color: AppColors.danger,
              ),
            ],
          ),

          const SizedBox(height: 20),

          // ── Win Rate gauge ─────────────────────────────────────────────
          _SectionCard(
            title: 'Win Rate',
            child: SizedBox(
              height: 160,
              child: _WinRateGauge(winRate: winRate),
            ),
          ),

          const SizedBox(height: 12),

          // ── Monthly FU Activity chart ──────────────────────────────────
          if (monthly.isNotEmpty) ...[
            _SectionCard(
              title: 'Aktivitas Follow-Up (6 Bulan)',
              child: SizedBox(
                height: 180,
                child: _MonthlyBarChart(monthly: monthly),
              ),
            ),
            const SizedBox(height: 12),
          ],

          // ── By stage ──────────────────────────────────────────────────
          if (byStage.isNotEmpty) ...[
            _SectionCard(
              title: 'Pipeline Aktif per Stage',
              child: _StageList(byStage: byStage),
            ),
            const SizedBox(height: 12),
          ],

          // ── Pipeline value ─────────────────────────────────────────────
          if (pipeVal.isNotEmpty)
            _SectionCard(
              title: 'Nilai Pipeline per Stage',
              child: _PipelineValueList(rows: pipeVal, fmtRp: fmtRp),
            ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _SummaryCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: color.withAlpha(30),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                const SizedBox(height: 2),
                Text(value, style: const TextStyle(
                  color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700,
                )),
              ],
            ),
          ),
        ],
      ),
    ),
  );
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;
  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(
          color: AppColors.textSecondary, fontSize: 12,
          fontWeight: FontWeight.w600, letterSpacing: 0.5,
        )),
        const SizedBox(height: 12),
        child,
      ],
    ),
  );
}

class _WinRateGauge extends StatelessWidget {
  final double winRate;
  const _WinRateGauge({required this.winRate});

  @override
  Widget build(BuildContext context) {
    final pct = (winRate / 100).clamp(0.0, 1.0);
    return Stack(
      alignment: Alignment.center,
      children: [
        PieChart(
          PieChartData(
            startDegreeOffset: -90,
            sectionsSpace: 0,
            centerSpaceRadius: 50,
            sections: [
              PieChartSectionData(
                value: winRate,
                color: const Color(0xFF10B981),
                radius: 30,
                showTitle: false,
              ),
              PieChartSectionData(
                value: math.max(0, 100 - winRate),
                color: AppColors.bg4,
                radius: 30,
                showTitle: false,
              ),
            ],
          ),
        ),
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${winRate.toStringAsFixed(1)}%',
              style: const TextStyle(
                color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.w800,
              ),
            ),
            const Text('Win Rate', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
          ],
        ),
      ],
    );
  }
}

class _MonthlyBarChart extends StatelessWidget {
  final List<Map<String, dynamic>> monthly;
  const _MonthlyBarChart({required this.monthly});

  @override
  Widget build(BuildContext context) {
    final maxVal = monthly.map((m) => double.tryParse(m['total_fu']?.toString() ?? '0') ?? 0).fold(0.0, math.max);
    final groups = List.generate(monthly.length, (i) {
      final m  = monthly[i];
      final fu = double.tryParse(m['total_fu']?.toString() ?? '0') ?? 0;
      return BarChartGroupData(
        x: i,
        barRods: [
          BarChartRodData(
            toY: fu,
            color: AppColors.primary,
            width: 18,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
          ),
        ],
      );
    });

    return BarChart(
      BarChartData(
        maxY: maxVal > 0 ? maxVal * 1.2 : 10,
        barGroups: groups,
        gridData: FlGridData(
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => FlLine(color: AppColors.border, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (val, _) {
                final i = val.toInt();
                if (i < 0 || i >= monthly.length) return const SizedBox();
                final month = (monthly[i]['month'] as String? ?? '').split('-');
                final label = month.length >= 2
                    ? _shortMonth(int.tryParse(month[1]) ?? 0)
                    : '';
                return Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                );
              },
            ),
          ),
        ),
      ),
    );
  }

  static String _shortMonth(int m) {
    const names = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return m >= 1 && m <= 12 ? names[m] : '';
  }
}

class _StageList extends StatelessWidget {
  final List<Map<String, dynamic>> byStage;
  const _StageList({required this.byStage});

  @override
  Widget build(BuildContext context) {
    final total = byStage.fold<int>(0, (s, e) => s + (int.tryParse(e['cnt']?.toString() ?? '0') ?? 0));
    return Column(
      children: byStage.map((s) {
        final cnt = int.tryParse(s['cnt']?.toString() ?? '0') ?? 0;
        final pct = total > 0 ? cnt / total : 0.0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            children: [
              SizedBox(
                width: 90,
                child: Text(s['stage']?.toString() ?? '',
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 12)),
              ),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: pct,
                    minHeight: 8,
                    backgroundColor: AppColors.bg4,
                    valueColor: const AlwaysStoppedAnimation(AppColors.primary),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Text('$cnt', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _PipelineValueList extends StatelessWidget {
  final List<Map<String, dynamic>> rows;
  final NumberFormat fmtRp;
  const _PipelineValueList({required this.rows, required this.fmtRp});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: rows.map((r) {
        final val = double.tryParse(r['total_value']?.toString() ?? '0') ?? 0;
        final cnt = int.tryParse(r['cnt']?.toString() ?? '0') ?? 0;
        return Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(r['stage']?.toString() ?? '',
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('Rp ${fmtRp.format(val)}',
                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                  Text('$cnt leads',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                ],
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
