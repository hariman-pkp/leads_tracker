import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/date_utils.dart';
import '../providers/pipeline_provider.dart';
import '../models/lead_model.dart';
import '../../auth/providers/auth_provider.dart';

const _stages = ['Prospect','Qualified','Proposal','Negotiation','Won','Lost'];

final _fuHistoryProvider = FutureProvider.autoDispose.family<List<Map<String, dynamic>>, String>(
  (ref, leadId) async {
    final res  = await ApiClient.instance.get('/v1/followup/$leadId');
    final data = res.data as Map<String, dynamic>;
    return List<Map<String, dynamic>>.from(
      (data['logs'] as List? ?? []).map((e) => Map<String, dynamic>.from(e as Map)),
    );
  },
);

class PipelineDetailScreen extends ConsumerStatefulWidget {
  final String leadId;
  const PipelineDetailScreen({super.key, required this.leadId});

  @override
  ConsumerState<PipelineDetailScreen> createState() => _PipelineDetailScreenState();
}

class _PipelineDetailScreenState extends ConsumerState<PipelineDetailScreen> {
  bool _updatingStage = false;

  Future<void> _showStageSheet(LeadModel lead) async {
    final picked = await showModalBottomSheet<String>(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _StageSheet(currentStage: lead.stage),
    );
    if (picked == null || picked == lead.stage || !mounted) return;
    setState(() => _updatingStage = true);
    try {
      await ApiClient.instance.put(
        '/v1/pipeline/${widget.leadId}',
        data: {'stage': picked},
      );
      ref.invalidate(leadDetailProvider(widget.leadId));
      ref.invalidate(pipelineLeadsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Stage diubah ke $picked'),
          backgroundColor: AppColors.success,
        ));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal ubah stage: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _updatingStage = false);
    }
  }

  Future<void> _confirmDelete(BuildContext context) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bg2,
        title: const Text('Hapus Lead?',
            style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Lead dan semua riwayat FU akan dihapus permanen.',
            style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Hapus', style: TextStyle(color: AppColors.danger)),
          ),
        ],
      ),
    );
    if (ok != true || !mounted) return;
    try {
      await ref.read(pipelineRepositoryProvider).deleteLead(widget.leadId);
      ref.invalidate(pipelineLeadsProvider);
      if (mounted) context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal menghapus: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(leadDetailProvider(widget.leadId));

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        leading: IconButton(
          onPressed: () => context.go('/pipeline'),
          icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
        ),
        title: const Text('Detail Lead'),
        actions: [
          detail.whenOrNull(
            data: (lead) {
              final isSales = ref.read(authProvider).user?.isSalesOnly ?? false;
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  IconButton(
                    onPressed: () async {
                      await context.push('/pipeline/${widget.leadId}/edit');
                      ref.invalidate(leadDetailProvider(widget.leadId));
                    },
                    icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
                  ),
                  if (!isSales)
                    IconButton(
                      onPressed: () => _confirmDelete(context),
                      icon: const Icon(Icons.delete_outline, color: AppColors.danger),
                    ),
                ],
              );
            },
          ) ?? const SizedBox.shrink(),
        ],
      ),
      body: detail.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error:   (e, _) => Center(child: Text('Error: $e', style: const TextStyle(color: AppColors.danger))),
        data:    (lead) => _buildDetail(lead),
      ),
    );
  }

  Widget _buildDetail(LeadModel lead) {
    final stageColor = _stageColor(lead.stage);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header card
          Container(
            padding: const EdgeInsets.all(16),
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
                    Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(30),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.business, color: AppColors.primary, size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(lead.namaCompany,
                              style: const TextStyle(
                                color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 2),
                          Text(lead.contactPerson,
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Stage bar — tap untuk ubah
                GestureDetector(
                  onTap: _updatingStage ? null : () => _showStageSheet(lead),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: stageColor.withAlpha(20),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: stageColor.withAlpha(80)),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.track_changes_outlined, color: stageColor, size: 16),
                        const SizedBox(width: 8),
                        Text('Stage: ',
                            style: TextStyle(color: stageColor.withAlpha(180), fontSize: 13)),
                        Text(lead.stage,
                            style: TextStyle(
                              color: stageColor, fontSize: 13, fontWeight: FontWeight.w700)),
                        const Spacer(),
                        _updatingStage
                            ? SizedBox(
                                width: 14, height: 14,
                                child: CircularProgressIndicator(strokeWidth: 2, color: stageColor))
                            : Icon(Icons.swap_horiz_outlined, color: stageColor, size: 18),
                      ],
                    ),
                  ),
                ),

                if (lead.dealValue != null) ...[
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.monetization_on_outlined, color: AppColors.success, size: 16),
                      const SizedBox(width: 6),
                      Text(_formatRupiah(lead.dealValue!),
                          style: const TextStyle(
                            color: AppColors.success, fontSize: 16, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ],
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Pipeline stage progress strip
          _StageProgressBar(currentStage: lead.stage),

          const SizedBox(height: 16),

          _InfoSection(title: 'Informasi Kontak', items: [
            if (lead.phone != null) _InfoRow(icon: Icons.phone_outlined, label: 'Phone', value: lead.phone!),
            if (lead.email != null) _InfoRow(icon: Icons.email_outlined, label: 'Email', value: lead.email!),
            _InfoRow(icon: Icons.support_agent, label: 'Sales Owner', value: lead.salesOwner),
            if (lead.organisasi != null)
              _InfoRow(icon: Icons.corporate_fare, label: 'Organisasi', value: lead.organisasi!),
          ]),

          const SizedBox(height: 12),

          _InfoSection(title: 'Detail Pipeline', items: [
            if (lead.product != null)
              _InfoRow(icon: Icons.inventory_2_outlined, label: 'Product', value: lead.product!),
            if (lead.tglMasuk != null)
              _InfoRow(icon: Icons.calendar_today_outlined, label: 'Tgl Masuk', value: _formatDate(lead.tglMasuk!)),
            if (lead.tglFu != null)
              _InfoRow(icon: Icons.event_outlined, label: 'Next FU', value: _formatDate(lead.tglFu!)),
            _InfoRow(icon: Icons.tag, label: 'Lead ID', value: lead.leadId),
          ]),

          if (lead.notes != null && lead.notes!.isNotEmpty) ...[
            const SizedBox(height: 12),
            _InfoSection(title: 'Catatan', items: [
              Padding(
                padding: const EdgeInsets.all(12),
                child: Text(lead.notes!,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.5)),
              ),
            ]),
          ],

          const SizedBox(height: 16),

          // Riwayat Follow-Up
          _FuHistory(leadId: lead.leadId),

          const SizedBox(height: 24),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: lead.phone != null ? () => _callPhone(lead.phone!) : null,
                  icon: const Icon(Icons.phone, size: 16),
                  label: const Text('Hubungi'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    side: const BorderSide(color: AppColors.primary),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () async {
                    final phoneParam = (lead.phone?.isNotEmpty ?? false)
                        ? '&phone=${Uri.encodeComponent(lead.phone!)}'
                        : '';
                    await context.push(
                      '/pipeline/${lead.leadId}/followup'
                      '?nama=${Uri.encodeComponent(lead.namaCompany)}$phoneParam',
                    );
                    ref.invalidate(_fuHistoryProvider(lead.leadId));
                  },
                  icon: const Icon(Icons.add_comment_outlined, size: 16),
                  label: const Text('Follow-Up'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  Future<void> _callPhone(String phone) async {
    final uri = Uri.parse('tel:${phone.replaceAll(RegExp(r'\s+'), '')}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      // tel: tidak didukung di platform ini (misal Flutter web desktop)
    }
  }

  String _formatRupiah(double v) {
    if (v >= 1e9) return 'Rp ${(v/1e9).toStringAsFixed(1)}M';
    if (v >= 1e6) return 'Rp ${(v/1e6).toStringAsFixed(1)}Jt';
    return NumberFormat.currency(locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(v);
  }

  String _formatDate(String d) {
    try { return DateFormat('d MMMM yyyy', 'id_ID').format(WibDate.parse(d)); }
    catch (_) { return d; }
  }

  Color _stageColor(String stage) {
    switch (stage.toLowerCase()) {
      case 'prospect':    return AppColors.stageProspect;
      case 'qualified':   return AppColors.stageQualified;
      case 'proposal':    return AppColors.stageProposal;
      case 'negotiation': return AppColors.stageNegotiation;
      case 'won':         return AppColors.stageWon;
      case 'lost':        return AppColors.stageLost;
      default:            return AppColors.primary;
    }
  }
}

// ── Stage Bottom Sheet ────────────────────────────────────────────────────────

class _StageSheet extends StatelessWidget {
  final String currentStage;
  const _StageSheet({required this.currentStage});

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 10, bottom: 8),
            width: 40, height: 4,
            decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
          ),
          const Padding(
            padding: EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: Text('Ubah Stage',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
          ),
          const Divider(height: 1),
          ...List.generate(_stages.length, (idx) {
            final s         = _stages[idx];
            final isCurrent = s == currentStage;
            final color     = _color(s);
            // Divider pemisah sebelum Won/Lost
            final divider = (s == 'Won')
                ? const Padding(
                    padding: EdgeInsets.fromLTRB(16, 8, 16, 4),
                    child: Row(children: [
                      Expanded(child: Divider()),
                      Padding(
                        padding: EdgeInsets.symmetric(horizontal: 8),
                        child: Text('Hasil Akhir',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                      ),
                      Expanded(child: Divider()),
                    ]),
                  )
                : const SizedBox.shrink();
            return Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                divider,
                ListTile(
                  leading: Container(
                    width: 10, height: 10,
                    decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                  ),
                  title: Text(s, style: TextStyle(
                    color: isCurrent ? color : AppColors.textPrimary,
                    fontWeight: isCurrent ? FontWeight.w700 : FontWeight.normal,
                  )),
                  trailing: isCurrent
                      ? const Icon(Icons.check, color: AppColors.success, size: 18)
                      : null,
                  onTap: () => Navigator.pop(context, s),
                ),
              ],
            );
          }),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  Color _color(String stage) {
    switch (stage.toLowerCase()) {
      case 'prospect':    return AppColors.stageProspect;
      case 'qualified':   return AppColors.stageQualified;
      case 'proposal':    return AppColors.stageProposal;
      case 'negotiation': return AppColors.stageNegotiation;
      case 'won':         return AppColors.stageWon;
      case 'lost':        return AppColors.stageLost;
      default:            return AppColors.primary;
    }
  }
}

// ── Stage Progress Bar ────────────────────────────────────────────────────────

class _StageProgressBar extends StatelessWidget {
  final String currentStage;
  const _StageProgressBar({required this.currentStage});

  // Tahap linear sebelum fork
  static const _linear = ['Prospect', 'Qualified', 'Proposal', 'Negotiation'];

  @override
  Widget build(BuildContext context) {
    final isWon  = currentStage == 'Won';
    final isLost = currentStage == 'Lost';
    final isClosed = isWon || isLost;

    // Index di tahap linear (-1 jika sudah closed)
    final idx = isClosed ? _linear.length : _linear.indexOf(currentStage);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Baris linear: Prospect → Qualified → Proposal → Negotiation ──
        Row(
          children: List.generate(_linear.length, (i) {
            final done   = i < idx || isClosed;
            final active = i == idx;
            final color  = active
                ? AppColors.primary
                : done ? AppColors.success : AppColors.border;
            return Expanded(
              child: Column(
                children: [
                  Container(
                    height: 4,
                    margin: EdgeInsets.only(right: i < _linear.length - 1 ? 3 : 0),
                    decoration: BoxDecoration(
                      color: color,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _linear[i],
                    style: TextStyle(
                      fontSize: 9,
                      color: active ? AppColors.primary
                           : done   ? AppColors.success
                           : AppColors.textMuted,
                      fontWeight: active ? FontWeight.w700 : FontWeight.normal,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            );
          }),
        ),

        // ── Fork: Won | Lost ──────────────────────────────────────────────
        const SizedBox(height: 8),
        Row(
          children: [
            // Won
            Expanded(
              child: _ForkBranch(
                label: 'Won',
                icon: Icons.emoji_events_outlined,
                color: AppColors.stageWon,
                active: isWon,
                reached: isClosed,
              ),
            ),
            const SizedBox(width: 8),
            // Lost
            Expanded(
              child: _ForkBranch(
                label: 'Lost',
                icon: Icons.cancel_outlined,
                color: AppColors.stageLost,
                active: isLost,
                reached: isClosed,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ForkBranch extends StatelessWidget {
  final String   label;
  final IconData icon;
  final Color    color;
  final bool     active;   // stage ini yang dipilih
  final bool     reached;  // sudah di Won/Lost (salah satunya)

  const _ForkBranch({
    required this.label,
    required this.icon,
    required this.color,
    required this.active,
    required this.reached,
  });

  @override
  Widget build(BuildContext context) {
    final dimmed = reached && !active;
    final c = dimmed ? AppColors.border : color;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: active ? color.withAlpha(25) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: active ? color : AppColors.border),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, color: c, size: 14),
          const SizedBox(width: 5),
          Text(
            label,
            style: TextStyle(
              color: c,
              fontSize: 11,
              fontWeight: active ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
        ],
      ),
    );
  }
}

// ── FU History ────────────────────────────────────────────────────────────────

class _FuHistory extends ConsumerWidget {
  final String leadId;
  const _FuHistory({required this.leadId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fuList = ref.watch(_fuHistoryProvider(leadId));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('RIWAYAT FOLLOW-UP',
            style: TextStyle(color: AppColors.textSecondary, fontSize: 11,
                fontWeight: FontWeight.w600, letterSpacing: 0.8)),
        const SizedBox(height: 8),
        fuList.when(
          loading: () => const Padding(
            padding: EdgeInsets.all(16),
            child: Center(child: CircularProgressIndicator(color: AppColors.primary, strokeWidth: 2)),
          ),
          error:   (_, __) => const Text('Gagal memuat riwayat FU',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
          data: (logs) => logs.isEmpty
              ? Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.bg3,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: const Center(
                    child: Text('Belum ada riwayat follow-up',
                        style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                  ),
                )
              : Container(
                  decoration: BoxDecoration(
                    color: AppColors.bg3,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: ListView.separated(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: logs.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, indent: 44),
                    itemBuilder: (_, i) => _FuLogRow(log: logs[i]),
                  ),
                ),
        ),
      ],
    );
  }
}

class _FuLogRow extends StatelessWidget {
  final Map<String, dynamic> log;
  const _FuLogRow({required this.log});

  static const _methIcons = {
    'call':      Icons.phone_outlined,
    'whatsapp':  Icons.chat_outlined,
    'email':     Icons.email_outlined,
    'visit':     Icons.place_outlined,
    'meeting':   Icons.groups_outlined,
  };

  @override
  Widget build(BuildContext context) {
    final metode  = (log['metode_fu'] as String? ?? 'call').toLowerCase();
    final date    = log['tgl_fu'] as String? ?? '';
    final hasil   = log['hasil_fu'] as String? ?? '';
    final next    = log['tgl_fu_berikut'] as String?;
    final icon    = _methIcons[metode] ?? Icons.phone_outlined;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(
              color: AppColors.primary.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: AppColors.primary, size: 15),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(_formatDate(date),
                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 12,
                            fontWeight: FontWeight.w600)),
                    const SizedBox(width: 6),
                    Text(metode,
                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  ],
                ),
                if (hasil.isNotEmpty) ...[
                  const SizedBox(height: 3),
                  Text(hasil,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                      maxLines: 3, overflow: TextOverflow.ellipsis),
                ],
                if (next != null) ...[
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.event_outlined, color: AppColors.warning, size: 12),
                      const SizedBox(width: 3),
                      Text('Next: ${_formatDate(next)}',
                          style: const TextStyle(color: AppColors.warning, fontSize: 11)),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatDate(String d) {
    try { return DateFormat('d MMM yyyy', 'id_ID').format(WibDate.parse(d)); }
    catch (_) { return d; }
  }
}

// ── Shared widgets ────────────────────────────────────────────────────────────

class _InfoSection extends StatelessWidget {
  final String title;
  final List<Widget> items;
  const _InfoSection({required this.title, required this.items});

  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 11,
          fontWeight: FontWeight.w600, letterSpacing: 0.8)),
      const SizedBox(height: 6),
      Container(
        decoration: BoxDecoration(
          color: AppColors.bg3,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(children: items),
      ),
    ],
  );
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String   label;
  final String   value;
  const _InfoRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
    child: Row(
      children: [
        Icon(icon, color: AppColors.textMuted, size: 16),
        const SizedBox(width: 10),
        SizedBox(width: 90,
            child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))),
        Expanded(
          child: Text(value,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              textAlign: TextAlign.right),
        ),
      ],
    ),
  );
}
