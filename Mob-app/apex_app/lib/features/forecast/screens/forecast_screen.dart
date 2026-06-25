import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../providers/forecast_provider.dart';

class ForecastScreen extends ConsumerStatefulWidget {
  const ForecastScreen({super.key});

  @override
  ConsumerState<ForecastScreen> createState() => _ForecastScreenState();
}

class _ForecastScreenState extends ConsumerState<ForecastScreen> {
  int _tahun = DateTime.now().year;

  String _rupiah(dynamic v) {
    final n = (v is num) ? v.toDouble() : double.tryParse(v?.toString() ?? '0') ?? 0;
    if (n >= 1e9) return 'Rp ${(n / 1e9).toStringAsFixed(1)}M';
    if (n >= 1e6) return 'Rp ${(n / 1e6).toStringAsFixed(0)}jt';
    return 'Rp ${n.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(forecastProvider(_tahun));

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Pipeline Forecast'),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: DropdownButton<int>(
              value: _tahun,
              dropdownColor: AppColors.bg4,
              underline: const SizedBox(),
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              items: List.generate(4, (i) => DateTime.now().year - i)
                  .map((y) => DropdownMenuItem(value: y, child: Text('$y')))
                  .toList(),
              onChanged: (v) => setState(() => _tahun = v ?? _tahun),
            ),
          ),
        ],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
              const SizedBox(height: 8),
              Text('Gagal memuat: $e', style: const TextStyle(color: AppColors.textSecondary), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              ElevatedButton(
                onPressed: () => ref.invalidate(forecastProvider(_tahun)),
                child: const Text('Coba Lagi'),
              ),
            ],
          ),
        ),
        data: (data) {
          final summary  = data['summary']  as Map<String, dynamic>;
          final monthly  = (data['monthly_forecast'] as List).cast<Map<String, dynamic>>();
          final bySales  = (data['by_sales'] as List).cast<Map<String, dynamic>>();
          final lossData = (data['loss_analysis'] as List).cast<Map<String, dynamic>>();

          final totalW = (summary['total_weighted'] as num?)?.toDouble() ?? 0;
          final totalL = (summary['total_leads'] as num?)?.toDouble() ?? 0;
          final wonCnt = (summary['total_won_count'] as num?)?.toDouble() ?? 0;
          final closingRate = totalL > 0 ? (wonCnt / totalL * 100).round() : 0;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              // Summary cards
              Row(children: [
                _summaryCard('Weighted Pipeline', _rupiah(totalW), AppColors.primary),
                const SizedBox(width: 10),
                _summaryCard('Actual Won YTD', _rupiah(summary['total_won']), const Color(0xFF10B981)),
              ]),
              const SizedBox(height: 10),
              Row(children: [
                _summaryCard('Total Leads', '${totalL.toInt()}', AppColors.textPrimary),
                const SizedBox(width: 10),
                _summaryCard('Closing Rate', '$closingRate%',
                  closingRate >= 30 ? const Color(0xFF10B981)
                    : closingRate >= 15 ? const Color(0xFFF59E0B)
                    : AppColors.danger),
              ]),

              const SizedBox(height: 20),

              // Monthly forecast
              _sectionTitle('Forecast per Bulan'),
              if (monthly.isEmpty)
                _emptyMsg('Belum ada lead dengan exp. close date di $_tahun')
              else
                ...monthly.map((row) => _monthRow(row)),

              const SizedBox(height: 20),

              // Per-sales
              _sectionTitle('Pipeline per Sales'),
              if (bySales.isEmpty)
                _emptyMsg('Tidak ada data')
              else ...[
                ...bySales.map((s) {
                  final maxW = bySales.map((x) => (x['total_weighted'] as num).toDouble()).reduce((a, b) => a > b ? a : b);
                  final pct  = maxW > 0 ? ((s['total_weighted'] as num).toDouble() / maxW) : 0.0;
                  return _salesRow(s, pct.toDouble());
                }),
              ],

              const SizedBox(height: 20),

              // Loss analysis
              _sectionTitle('Analisa Loss Reason'),
              if (lossData.isEmpty)
                _emptyMsg('Belum ada lead Lost tahun ini')
              else
                ...lossData.map((lr) => _lossRow(lr)),

              const SizedBox(height: 20),
            ],
          );
        },
      ),
    );
  }

  Widget _summaryCard(String label, String value, Color valueColor) => Expanded(
    child: Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
        const SizedBox(height: 4),
        Text(value, style: TextStyle(color: valueColor, fontSize: 16, fontWeight: FontWeight.w700)),
      ]),
    ),
  );

  Widget _sectionTitle(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(t, style: const TextStyle(
      color: AppColors.textSecondary, fontSize: 11,
      fontWeight: FontWeight.w600, letterSpacing: 0.8,
    )),
  );

  Widget _emptyMsg(String msg) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 12),
    child: Text(msg, style: const TextStyle(color: AppColors.textMuted, fontSize: 13), textAlign: TextAlign.center),
  );

  Widget _monthRow(Map<String, dynamic> row) {
    final weighted = (row['total_weighted'] as num).toDouble();
    final wonVal   = (row['actual_won'] as num).toDouble();
    final pct      = weighted > 0 ? (wonVal / weighted).clamp(0.0, 1.0) : 0.0;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text(row['bulan_label'] as String, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600)),
          Text('${row['jumlah_lead']} lead', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ]),
        const SizedBox(height: 6),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('Weighted: ${_rupiah(weighted)}', style: const TextStyle(color: AppColors.primary, fontSize: 13)),
          Text('Won: ${_rupiah(wonVal)}', style: const TextStyle(color: Color(0xFF10B981), fontSize: 13)),
        ]),
        const SizedBox(height: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: pct,
            minHeight: 6,
            backgroundColor: AppColors.border,
            valueColor: const AlwaysStoppedAnimation(Color(0xFF10B981)),
          ),
        ),
      ]),
    );
  }

  Widget _salesRow(Map<String, dynamic> s, double barPct) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    decoration: BoxDecoration(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: AppColors.border),
    ),
    child: Row(children: [
      CircleAvatar(
        radius: 16,
        backgroundColor: AppColors.primary.withOpacity(0.15),
        child: Text(
          (s['sales_owner'] as String).isNotEmpty ? (s['sales_owner'] as String)[0] : '?',
          style: const TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w700),
        ),
      ),
      const SizedBox(width: 10),
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(s['sales_owner'] as String, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(3),
            child: LinearProgressIndicator(
              value: barPct,
              minHeight: 5,
              backgroundColor: AppColors.border,
              valueColor: const AlwaysStoppedAnimation(AppColors.primary),
            ),
          ),
        ]),
      ),
      const SizedBox(width: 10),
      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Text(_rupiah(s['total_weighted']), style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600)),
        Text('${s['jumlah_lead']} lead', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      ]),
    ]),
  );

  Widget _lossRow(Map<String, dynamic> lr) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: AppColors.bg2,
      borderRadius: BorderRadius.circular(10),
      border: Border.all(color: AppColors.danger.withOpacity(0.4)),
    ),
    child: Row(children: [
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(lr['reason'] as String, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
          const SizedBox(height: 2),
          Text('Nilai hilang: ${_rupiah(lr['nilai_hilang'])}', style: const TextStyle(color: AppColors.danger, fontSize: 12)),
        ]),
      ),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.danger.withOpacity(0.15),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text('${lr['jumlah']}×', style: const TextStyle(color: AppColors.danger, fontSize: 12, fontWeight: FontWeight.w700)),
      ),
    ]),
  );
}
