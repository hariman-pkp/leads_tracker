import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../models/claim_model.dart';
import '../providers/entertain_provider.dart';

class EntertainListScreen extends ConsumerStatefulWidget {
  const EntertainListScreen({super.key});

  @override
  ConsumerState<EntertainListScreen> createState() => _EntertainListScreenState();
}

class _EntertainListScreenState extends ConsumerState<EntertainListScreen> {
  final _fmt = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  Widget build(BuildContext context) {
    final filter = ref.watch(entertainFilterProvider);
    final async  = ref.watch(entertainClaimsProvider(filter));

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Entertainment Claim', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
            onPressed: () => context.push('/entertain/new').then((_) => _refresh()),
          ),
        ],
      ),
      body: Column(children: [
        _FilterBar(filter: filter),
        async.when(
          loading: () => const Expanded(child: Center(child: CircularProgressIndicator(color: AppColors.primary))),
          error: (e, _) => Expanded(child: Center(
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              const Icon(Icons.error_outline, color: AppColors.danger, size: 40),
              const SizedBox(height: 8),
              Text(e.toString(), style: const TextStyle(color: AppColors.textSecondary), textAlign: TextAlign.center),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _refresh, child: const Text('Coba Lagi')),
            ]),
          )),
          data: (data) {
            final claims = data['claims'] as List<ClaimModel>;
            final summary = data['summary'] as Map<String, dynamic>;
            final limit   = data['limit_per_bulan'] as double;
            return Expanded(child: RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async => _refresh(),
              child: ListView(children: [
                _SummaryCards(summary: summary, limit: limit, fmt: _fmt),
                if (claims.isEmpty)
                  const Padding(
                    padding: EdgeInsets.all(40),
                    child: Center(child: Text('Belum ada klaim', style: TextStyle(color: AppColors.textMuted))),
                  )
                else
                  ...claims.map((c) => _ClaimCard(claim: c, fmt: _fmt, onRefresh: _refresh)),
              ]),
            ));
          },
        ),
      ]),
    );
  }

  void _refresh() => ref.invalidate(entertainClaimsProvider);
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
class _FilterBar extends ConsumerWidget {
  final Map<String, dynamic> filter;
  const _FilterBar({required this.filter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final months = ['Semua', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    final statuses = ['Semua', 'Pending', 'Approved', 'Rejected', 'Cancelled'];
    return Container(
      color: AppColors.bg2,
      padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
      child: Row(children: [
        // Bulan
        Expanded(child: _buildDropdown(
          value: filter['bulan'] == 0 ? 'Semua' : months[filter['bulan'] as int],
          items: months,
          onChanged: (v) => ref.read(entertainFilterProvider.notifier).state = {
            ...filter, 'bulan': months.indexOf(v!),
          },
        )),
        const SizedBox(width: 8),
        // Status
        Expanded(child: _buildDropdown(
          value: (filter['status'] as String).isEmpty ? 'Semua' : filter['status'] as String,
          items: statuses,
          onChanged: (v) => ref.read(entertainFilterProvider.notifier).state = {
            ...filter, 'status': v == 'Semua' ? '' : v!,
          },
        )),
      ]),
    );
  }

  Widget _buildDropdown({required String value, required List<String> items, required ValueChanged<String?> onChanged}) {
    return DropdownButtonFormField<String>(
      value: value,
      dropdownColor: AppColors.bg3,
      style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
      decoration: InputDecoration(
        isDense: true,
        contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        filled: true, fillColor: AppColors.bg3,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
      ),
      items: items.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
      onChanged: onChanged,
    );
  }
}

// ── Summary Cards ─────────────────────────────────────────────────────────────
class _SummaryCards extends StatelessWidget {
  final Map<String, dynamic> summary;
  final double limit;
  final NumberFormat fmt;
  const _SummaryCards({required this.summary, required this.limit, required this.fmt});

  @override
  Widget build(BuildContext context) {
    final total    = (summary['total_bulan'] as num?)?.toDouble() ?? 0;
    final pending  = (summary['pending']  as num?)?.toInt() ?? 0;
    final approved = (summary['approved'] as num?)?.toInt() ?? 0;
    final rejected = (summary['rejected'] as num?)?.toInt() ?? 0;
    final pct      = limit > 0 ? (total / limit * 100).clamp(0, 100) : 0.0;

    return Padding(
      padding: const EdgeInsets.all(12),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          _StatChip(label: 'Pending',  value: '$pending',  color: AppColors.warning),
          const SizedBox(width: 8),
          _StatChip(label: 'Approved', value: '$approved', color: AppColors.success),
          const SizedBox(width: 8),
          _StatChip(label: 'Rejected', value: '$rejected', color: AppColors.danger),
        ]),
        if (limit > 0) ...[
          const SizedBox(height: 10),
          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
            Text('Total bulan ini: ${fmt.format(total)}', style: const TextStyle(color: AppColors.textPrimary, fontSize: 13)),
            Text('Limit: ${fmt.format(limit)}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
          ]),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: pct / 100,
              minHeight: 6,
              backgroundColor: AppColors.bg4,
              color: pct >= 90 ? AppColors.danger : pct >= 70 ? AppColors.warning : AppColors.success,
            ),
          ),
        ],
      ]),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label, value;
  final Color color;
  const _StatChip({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(20)),
    child: Row(mainAxisSize: MainAxisSize.min, children: [
      Text(value, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 14)),
      const SizedBox(width: 4),
      Text(label, style: TextStyle(color: color.withOpacity(0.8), fontSize: 12)),
    ]),
  );
}

// ── Claim Card ────────────────────────────────────────────────────────────────
class _ClaimCard extends ConsumerWidget {
  final ClaimModel claim;
  final NumberFormat fmt;
  final VoidCallback onRefresh;
  const _ClaimCard({required this.claim, required this.fmt, required this.onRefresh});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statusColor = _statusColor(claim.status);
    return GestureDetector(
      onTap: () => context.push('/entertain/${claim.id}').then((_) => onRefresh()),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: AppColors.bg3,
          borderRadius: BorderRadius.circular(12),
          border: claim.limitWarning
              ? Border.all(color: AppColors.warning.withOpacity(0.5))
              : null,
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              Expanded(child: Text(claim.claimNo,
                  style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w600))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                child: Text(claim.status, style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ]),
            const SizedBox(height: 6),
            Text(claim.namaKlien, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
            if (claim.leadNama != null) ...[
              const SizedBox(height: 2),
              Text(claim.leadNama!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
            ],
            const SizedBox(height: 8),
            Row(children: [
              const Icon(Icons.calendar_today, size: 12, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(claim.tglKlaim.substring(0, 10), style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const Spacer(),
              Text(fmt.format(claim.jumlah),
                  style: const TextStyle(color: AppColors.yellow, fontWeight: FontWeight.bold, fontSize: 15)),
            ]),
            if (claim.limitWarning)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Row(children: const [
                  Icon(Icons.warning_amber, size: 12, color: AppColors.warning),
                  SizedBox(width: 4),
                  Text('Melebihi limit bulanan', style: TextStyle(color: AppColors.warning, fontSize: 11)),
                ]),
              ),
          ]),
        ),
      ),
    );
  }

  Color _statusColor(String s) {
    switch (s) {
      case 'Approved':  return AppColors.success;
      case 'Rejected':  return AppColors.danger;
      case 'Cancelled': return AppColors.textMuted;
      default:          return AppColors.warning;
    }
  }
}
