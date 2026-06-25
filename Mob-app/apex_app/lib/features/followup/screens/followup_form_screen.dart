import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_utils.dart';
import '../../../shared/widgets/voice_note_field.dart';
import '../providers/followup_provider.dart';
import '../models/followup_model.dart';

// Wireframe: 4 metode utama dalam grid 2x2
const _metodeOptions = [
  _MetodeItem('call',      Icons.phone_outlined,   'Telepon'),
  _MetodeItem('meeting',   Icons.groups_outlined,  'Meeting'),
  _MetodeItem('whatsapp',  Icons.chat_outlined,    'WhatsApp'),
  _MetodeItem('email',     Icons.email_outlined,   'Email'),
];

class _MetodeItem {
  final String value;
  final IconData icon;
  final String label;
  const _MetodeItem(this.value, this.icon, this.label);
}

class FollowupFormScreen extends ConsumerStatefulWidget {
  final String  leadId;
  final String  leadNama;
  final String? leadPhone;

  const FollowupFormScreen({
    super.key,
    required this.leadId,
    required this.leadNama,
    this.leadPhone,
  });

  @override
  ConsumerState<FollowupFormScreen> createState() => _FollowupFormScreenState();
}

class _FollowupFormScreenState extends ConsumerState<FollowupFormScreen> {
  String    _metode     = 'call';
  final _hasilCtrl      = TextEditingController();
  final _nextActionCtrl = TextEditingController();
  DateTime? _nextDate;
  bool      _saving     = false;
  bool      _showHistory = false;

  @override
  void dispose() {
    _hasilCtrl.dispose();
    _nextActionCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_hasilCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hasil follow-up wajib diisi'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }
    setState(() => _saving = true);
    final hasilText = _hasilCtrl.text.trim();
    try {
      await ref.read(followupRepositoryProvider).createFollowup(
        leadId:     widget.leadId,
        metodeFu:   _metode,
        hasilFu:    hasilText,
        nextAction: _nextActionCtrl.text.isNotEmpty ? _nextActionCtrl.text.trim() : null,
        nextDate:   _nextDate != null
            ? DateFormat('yyyy-MM-dd').format(_nextDate!)
            : null,
      );
      ref.invalidate(followupHistoryProvider(widget.leadId));
      if (!mounted) return;

      if (_metode == 'whatsapp') {
        await _showWhatsAppDialog(hasilText);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Follow-up berhasil dicatat!'),
            backgroundColor: AppColors.success,
          ),
        );
        context.pop();
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

  Future<void> _showWhatsAppDialog(String message) async {
    final send = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bg2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        title: Row(
          children: const [
            Icon(Icons.chat_outlined, color: Color(0xFF25D366), size: 22),
            SizedBox(width: 8),
            Text(
              'Kirim via WhatsApp?',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 16),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Follow-up berhasil dicatat. Kirim pesan berikut ke customer?',
              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
              ),
              child: Text(
                message,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                maxLines: 5,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Lewati', style: TextStyle(color: AppColors.textSecondary)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF25D366),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            onPressed: () => Navigator.of(ctx).pop(true),
            icon: const Icon(Icons.send, size: 16),
            label: const Text('Kirim WhatsApp'),
          ),
        ],
      ),
    );

    if (!mounted) return;
    context.pop(); // close form screen
    if (send == true) await _openWhatsApp(message);
  }

  Future<void> _openWhatsApp(String message) async {
    final rawPhone = widget.leadPhone ?? '';
    if (rawPhone.isEmpty) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nomor HP customer tidak tersedia'),
            backgroundColor: AppColors.warning,
          ),
        );
      }
      return;
    }

    // Normalise: strip non-digits, replace leading 0 with 62
    var digits = rawPhone.replaceAll(RegExp(r'[^\d]'), '');
    if (digits.startsWith('0')) digits = '62${digits.substring(1)}';

    final uri = Uri.parse(
      'https://wa.me/$digits?text=${Uri.encodeComponent(message)}',
    );
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tidak dapat membuka WhatsApp'),
            backgroundColor: AppColors.danger,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Catat Follow-Up', style: TextStyle(fontSize: 15)),
            Text(
              widget.leadNama,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: () => setState(() => _showHistory = !_showHistory),
            tooltip: 'Riwayat FU',
            icon: Icon(
              Icons.history,
              color: _showHistory ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: _saving
                ? const SizedBox(
                    width: 20, height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                  )
                : OutlinedButton(
                    onPressed: _save,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    child: const Text('Simpan', style: TextStyle(fontWeight: FontWeight.w600)),
                  ),
          ),
        ],
      ),
      body: _showHistory
          ? _HistoryView(leadId: widget.leadId)
          : _FormView(
              metode: _metode,
              hasilCtrl: _hasilCtrl,
              nextActionCtrl: _nextActionCtrl,
              nextDate: _nextDate,
              onMetodeChanged: (v) => setState(() => _metode = v),
              onDatePicked: (d) => setState(() => _nextDate = d),
            ),
    );
  }
}

// ── Form View ─────────────────────────────────────────────────────────────────

class _FormView extends StatelessWidget {
  final String                    metode;
  final TextEditingController     hasilCtrl;
  final TextEditingController     nextActionCtrl;
  final DateTime?                 nextDate;
  final ValueChanged<String>      onMetodeChanged;
  final ValueChanged<DateTime>    onDatePicked;

  const _FormView({
    required this.metode,
    required this.hasilCtrl,
    required this.nextActionCtrl,
    required this.nextDate,
    required this.onMetodeChanged,
    required this.onDatePicked,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Metode FU — 2x2 grid ─────────────────────────────────
          _sectionLabel('Metode Follow-Up'),
          const SizedBox(height: 8),
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.8,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            children: _metodeOptions.map((opt) {
              final selected = opt.value == metode;
              return GestureDetector(
                onTap: () => onMetodeChanged(opt.value),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.primary.withAlpha(30)
                        : AppColors.bg3,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: selected ? AppColors.primary : AppColors.border,
                      width: selected ? 1.5 : 1,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        opt.icon,
                        color: selected
                            ? AppColors.primary
                            : AppColors.textMuted,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        opt.label,
                        style: TextStyle(
                          color: selected
                              ? AppColors.primary
                              : AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 20),

          // ── Hasil FU ──────────────────────────────────────────────
          _sectionLabel('Hasil Follow-Up *'),
          const SizedBox(height: 8),
          VoiceNoteField(
            controller: hasilCtrl,
            hint: 'Ceritakan hasil percakapan, respon klien, dll...',
            maxLines: 4,
          ),

          const SizedBox(height: 20),

          // ── Next Action ───────────────────────────────────────────
          _sectionLabel('Rencana Tindak Lanjut'),
          const SizedBox(height: 8),
          TextField(
            controller: nextActionCtrl,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
            decoration: const InputDecoration(
              hintText: 'Apa langkah selanjutnya?',
              prefixIcon: Icon(Icons.arrow_forward_outlined, color: AppColors.textSecondary, size: 18),
            ),
          ),

          const SizedBox(height: 12),

          // ── Next Date ─────────────────────────────────────────────
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: nextDate ?? WibDate.today().add(const Duration(days: 3)),
                firstDate: WibDate.today(),
                lastDate: WibDate.today().add(const Duration(days: 365)),
                builder: (ctx, child) => Theme(
                  data: ThemeData.dark().copyWith(
                    colorScheme: const ColorScheme.dark(primary: AppColors.primary),
                  ),
                  child: child!,
                ),
              );
              if (picked != null) onDatePicked(picked);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: AppColors.bg4,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_outlined,
                      color: AppColors.textSecondary, size: 18),
                  const SizedBox(width: 10),
                  Text(
                    nextDate == null
                        ? 'Tanggal FU Berikutnya (opsional)'
                        : 'FU berikutnya: ${DateFormat('d MMMM yyyy', 'id_ID').format(nextDate!)}',
                    style: TextStyle(
                      color: nextDate == null
                          ? AppColors.textMuted
                          : AppColors.textPrimary,
                      fontSize: 14,
                    ),
                  ),
                  const Spacer(),
                  if (nextDate != null)
                    const Icon(Icons.check_circle, color: AppColors.success, size: 16),
                ],
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _sectionLabel(String t) => Text(
    t,
    style: const TextStyle(
      color: AppColors.textSecondary,
      fontSize: 11,
      fontWeight: FontWeight.w600,
      letterSpacing: 0.8,
    ),
  );
}

// ── History View ──────────────────────────────────────────────────────────────

class _HistoryView extends ConsumerWidget {
  final String leadId;
  const _HistoryView({required this.leadId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final history = ref.watch(followupHistoryProvider(leadId));

    return history.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      error: (e, _) => Center(
        child: Text('Error: $e', style: const TextStyle(color: AppColors.danger)),
      ),
      data: (list) {
        if (list.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.history_toggle_off, color: AppColors.textMuted, size: 48),
                SizedBox(height: 12),
                Text(
                  'Belum ada riwayat follow-up',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                ),
              ],
            ),
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: list.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, i) => _HistoryCard(fu: list[i]),
        );
      },
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FollowupModel fu;
  const _HistoryCard({required this.fu});

  IconData _metodeIcon(String m) {
    switch (m) {
      case 'whatsapp': return Icons.chat_outlined;
      case 'email':    return Icons.email_outlined;
      case 'visit':    return Icons.place_outlined;
      case 'meeting':  return Icons.groups_outlined;
      default:         return Icons.phone_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateStr = _formatDate(fu.tglFu);

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
              Icon(_metodeIcon(fu.metodeFu), color: AppColors.primary, size: 16),
              const SizedBox(width: 6),
              Text(
                fu.metodeFu.toUpperCase(),
                style: const TextStyle(
                  color: AppColors.primary,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
              const Spacer(),
              Text(
                dateStr,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
          if (fu.hasilFu != null) ...[
            const SizedBox(height: 8),
            Text(
              fu.hasilFu!,
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 13,
                height: 1.4,
              ),
            ),
          ],
          if (fu.nextAction != null) ...[
            const SizedBox(height: 8),
            const Divider(height: 1),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.arrow_forward, color: AppColors.yellow, size: 13),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    fu.nextAction!,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ),
                if (fu.nextDate != null)
                  Text(
                    _formatDate(fu.nextDate!),
                    style: const TextStyle(color: AppColors.yellow, fontSize: 11),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  String _formatDate(String d) {
    try {
      return DateFormat('d MMM yyyy', 'id_ID').format(WibDate.parse(d));
    } catch (_) { return d; }
  }
}
