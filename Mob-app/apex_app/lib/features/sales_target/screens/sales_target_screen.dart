import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../providers/sales_target_provider.dart';
import '../repositories/sales_target_repository.dart';

class SalesTargetScreen extends ConsumerStatefulWidget {
  const SalesTargetScreen({super.key});

  @override
  ConsumerState<SalesTargetScreen> createState() => _SalesTargetScreenState();
}

class _SalesTargetScreenState extends ConsumerState<SalesTargetScreen> {
  int _tahun = DateTime.now().year;

  static const _bulanLabel = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];

  String _rupiah(dynamic v) {
    final n = (v is num) ? v.toDouble() : double.tryParse(v?.toString() ?? '0') ?? 0;
    if (n >= 1e9) return '${(n / 1e9).toStringAsFixed(1)}M';
    if (n >= 1e6) return '${(n / 1e6).toStringAsFixed(0)}jt';
    return n.toStringAsFixed(0);
  }

  Color _achColor(double? pct) {
    if (pct == null) return AppColors.textMuted;
    if (pct >= 80) return const Color(0xFF10B981);
    if (pct >= 50) return const Color(0xFFF59E0B);
    return AppColors.danger;
  }

  void _showEditDialog(BuildContext context, Map<String, dynamic> row, Map<String, dynamic> bulanData) {
    final ctrl = TextEditingController(
      text: bulanData['target'] > 0 ? (bulanData['target'] / 1e6).toStringAsFixed(0) : '',
    );
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bg2,
        title: Text(
          '${row['sales_nama']} — ${_bulanLabel[(bulanData['bulan'] as int) - 1]} $_tahun',
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 15),
        ),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(
            controller: ctrl,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: const InputDecoration(
              labelText: 'Target (dalam juta Rp)',
              labelStyle: TextStyle(color: AppColors.textSecondary),
              suffixText: 'juta',
            ),
          ),
        ]),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final val        = double.tryParse(ctrl.text) ?? 0;
              final salesNama  = row['sales_nama'] as String;
              final bulan      = bulanData['bulan'] as int;
              final tahun      = _tahun;
              Navigator.pop(ctx);
              try {
                await ref.read(salesTargetRepositoryProvider).upsertTarget(
                  salesNama: salesNama,
                  tahun: tahun,
                  bulan: bulan,
                  targetDeal: val * 1e6,
                );
                ref.invalidate(salesTargetProvider(tahun));
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
                  content: Text('Target berhasil disimpan'),
                  backgroundColor: Color(0xFF10B981),
                ));
              } catch (e) {
                if (!mounted) return;
                ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                  content: Text('Gagal: $e'),
                  backgroundColor: AppColors.danger,
                ));
              }
            },
            child: const Text('Simpan'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final async   = ref.watch(salesTargetProvider(_tahun));
    final auth    = ref.watch(authProvider);
    final canEdit = [1, 2].contains(auth.user?.roleId);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Target Sales'),
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
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
            const SizedBox(height: 8),
            Text('Gagal memuat: $e', style: const TextStyle(color: AppColors.textSecondary), textAlign: TextAlign.center),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => ref.invalidate(salesTargetProvider(_tahun)),
              child: const Text('Coba Lagi'),
            ),
          ]),
        ),
        data: (data) {
          final rows = (data['data'] as List).cast<Map<String, dynamic>>();
          if (rows.isEmpty) {
            return const Center(
              child: Text('Belum ada data sales aktif.', style: TextStyle(color: AppColors.textMuted)),
            );
          }
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: rows.length,
            itemBuilder: (_, i) {
              final row = rows[i];
              final bulanList = (row['bulan'] as List).cast<Map<String, dynamic>>();
              final ytdTarget = (row['ytd_target'] as num?)?.toDouble() ?? 0;
              final ytdActual = (row['ytd_actual'] as num?)?.toDouble() ?? 0;
              final ytdPct   = (row['ytd_achievement_pct'] as num?)?.toDouble();
              final ytdBar   = ytdTarget > 0 ? (ytdActual / ytdTarget).clamp(0.0, 1.0) : 0.0;

              return Container(
                margin: const EdgeInsets.only(bottom: 14),
                decoration: BoxDecoration(
                  color: AppColors.bg2,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  // Header sales
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(children: [
                      CircleAvatar(
                        radius: 18,
                        backgroundColor: AppColors.primary.withOpacity(0.15),
                        child: Text(
                          (row['sales_nama'] as String)[0],
                          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Text(row['sales_nama'] as String, style: const TextStyle(
                            color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14,
                          )),
                          Text(
                            ytdTarget > 0
                              ? 'YTD: Rp ${_rupiah(ytdActual)} / Rp ${_rupiah(ytdTarget)} ${ytdPct != null ? "(${ytdPct.toStringAsFixed(1)}%)" : ""}'
                              : 'YTD: Rp ${_rupiah(ytdActual)} (target belum diset)',
                            style: TextStyle(color: _achColor(ytdPct), fontSize: 11),
                          ),
                        ]),
                      ),
                    ]),
                  ),
                  if (ytdTarget > 0)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: ytdBar,
                          minHeight: 5,
                          backgroundColor: AppColors.border,
                          valueColor: AlwaysStoppedAnimation(_achColor(ytdPct)),
                        ),
                      ),
                    ),
                  const SizedBox(height: 10),

                  // Grid bulan 3 kolom
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    child: GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 4,
                        crossAxisSpacing: 6,
                        mainAxisSpacing: 6,
                        childAspectRatio: 1.1,
                      ),
                      itemCount: 12,
                      itemBuilder: (_, mi) {
                        final m      = bulanList[mi];
                        final target = (m['target'] as num?)?.toDouble() ?? 0;
                        final actual = (m['actual'] as num?)?.toDouble() ?? 0;
                        final pct    = (m['achievement_pct'] as num?)?.toDouble();

                        Color borderColor = AppColors.border;
                        Color bgColor     = AppColors.bg4;
                        if (target > 0 && pct != null) {
                          if (pct >= 80) { borderColor = const Color(0xFF10B981); bgColor = const Color(0xFF10B981).withOpacity(0.1); }
                          else if (pct >= 50) { borderColor = const Color(0xFFF59E0B); bgColor = const Color(0xFFF59E0B).withOpacity(0.1); }
                          else { borderColor = AppColors.danger; bgColor = AppColors.danger.withOpacity(0.1); }
                        }

                        return GestureDetector(
                          onTap: canEdit ? () => _showEditDialog(context, row, m) : null,
                          child: Container(
                            decoration: BoxDecoration(
                              color: bgColor,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: borderColor),
                            ),
                            padding: const EdgeInsets.all(4),
                            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                              Text(_bulanLabel[mi], style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                              const SizedBox(height: 2),
                              Text(
                                target > 0 ? _rupiah(target) : '—',
                                style: TextStyle(
                                  color: target > 0 ? AppColors.textPrimary : AppColors.textMuted,
                                  fontSize: 10, fontWeight: FontWeight.w600,
                                ),
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (actual > 0)
                                Text(_rupiah(actual), style: const TextStyle(color: Color(0xFF10B981), fontSize: 9)),
                              if (pct != null)
                                Text('${pct.toStringAsFixed(0)}%', style: TextStyle(color: _achColor(pct), fontSize: 9, fontWeight: FontWeight.w700)),
                            ]),
                          ),
                        );
                      },
                    ),
                  ),
                  if (canEdit)
                    Padding(
                      padding: const EdgeInsets.only(right: 12, bottom: 8, top: 4),
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: Text('Ketuk bulan untuk edit target', style: TextStyle(
                          color: AppColors.textMuted.withOpacity(0.7), fontSize: 10, fontStyle: FontStyle.italic,
                        )),
                      ),
                    ),
                  const SizedBox(height: 4),
                ]),
              );
            },
          );
        },
      ),
    );
  }
}
