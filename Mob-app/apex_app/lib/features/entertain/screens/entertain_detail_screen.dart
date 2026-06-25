import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../providers/entertain_provider.dart';
import '../repositories/entertain_repository.dart';

class EntertainDetailScreen extends ConsumerStatefulWidget {
  final int claimId;
  const EntertainDetailScreen({super.key, required this.claimId});

  @override
  ConsumerState<EntertainDetailScreen> createState() => _EntertainDetailScreenState();
}

class _EntertainDetailScreenState extends ConsumerState<EntertainDetailScreen> {
  final _fmt    = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);
  final _picker = ImagePicker();
  bool _uploading = false;

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(claimDetailProvider(widget.claimId));

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Detail Klaim', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.primary)),
        error: (e, _) => Center(child: Text(e.toString(), style: const TextStyle(color: AppColors.danger))),
        data: (data) {
          final claim     = data['claim'] as Map<String, dynamic>;
          final approvals = data['approvals'] as List? ?? [];
          final status    = claim['status'] as String? ?? 'Pending';
          final statusColor = _statusColor(status);
          final fotoUrl  = claim['foto_bukti'] as String?;
          final apiBase  = ApiClient.instance.dio.options.baseUrl; // 'http://localhost:8002/api'

          return RefreshIndicator(
            color: AppColors.primary,
            onRefresh: () async => ref.invalidate(claimDetailProvider(widget.claimId)),
            child: ListView(padding: const EdgeInsets.all(16), children: [
              // Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.bg3, borderRadius: BorderRadius.circular(12)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text(claim['claim_no'] as String? ?? '',
                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12)),
                      child: Text(status,
                          style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12)),
                    ),
                  ]),
                  const SizedBox(height: 12),
                  _row('Nama Klien',   claim['nama_klien'] as String? ?? ''),
                  if ((claim['lead_nama'] as String?) != null)
                    _row('Leads',      claim['lead_nama'] as String),
                  _row('Tanggal',     (claim['tgl_klaim'] as String? ?? '').substring(0, 10)),
                  _row('Lokasi',      claim['lokasi'] as String? ?? '-'),
                  _row('Jumlah',      _fmt.format((claim['jumlah'] as num?)?.toDouble() ?? 0)),
                  if ((claim['keterangan'] as String?)?.isNotEmpty == true)
                    _row('Keterangan', claim['keterangan'] as String),
                ]),
              ),
              const SizedBox(height: 12),

              // Foto Bukti
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: AppColors.bg3, borderRadius: BorderRadius.circular(12)),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Foto Bukti', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  if (fotoUrl != null && fotoUrl.isNotEmpty)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: Image.network('$apiBase/v1/static/$fotoUrl',
                          width: double.infinity, fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => const Text('Gagal memuat foto',
                              style: TextStyle(color: AppColors.textMuted))),
                    )
                  else if (status == 'Pending') ...[
                    const Text('Belum ada foto', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                    const SizedBox(height: 10),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton.icon(
                        onPressed: _uploading ? null : () => _uploadFoto(widget.claimId),
                        icon: _uploading
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2))
                            : const Icon(Icons.camera_alt, size: 18),
                        label: const Text('Upload Foto Struk'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: const BorderSide(color: AppColors.primary),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                      ),
                    ),
                  ]
                  else
                    const Text('Tidak ada foto', style: TextStyle(color: AppColors.textMuted)),
                ]),
              ),
              const SizedBox(height: 12),

              // Riwayat approval
              if (approvals.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppColors.bg3, borderRadius: BorderRadius.circular(12)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Text('Riwayat Approval', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 10),
                    ...approvals.map((a) {
                      final ap = a as Map<String, dynamic>;
                      final act = ap['action'] as String? ?? '';
                      final actColor = act == 'Approved' ? AppColors.success : AppColors.danger;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                          Icon(act == 'Approved' ? Icons.check_circle : Icons.cancel,
                              color: actColor, size: 18),
                          const SizedBox(width: 8),
                          Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('${ap['approver_nama']} — $act',
                                style: TextStyle(color: actColor, fontWeight: FontWeight.w600, fontSize: 13)),
                            if ((ap['catatan'] as String?)?.isNotEmpty == true)
                              Text(ap['catatan'] as String,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                          ])),
                        ]),
                      );
                    }),
                  ]),
                ),
                const SizedBox(height: 12),
              ],

              // Batalkan klaim
              if (status == 'Pending')
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: () => _confirmCancel(widget.claimId),
                    icon: const Icon(Icons.cancel_outlined, color: AppColors.danger),
                    label: const Text('Batalkan Klaim', style: TextStyle(color: AppColors.danger)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: AppColors.danger),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
            ]),
          );
        },
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      SizedBox(width: 90,
          child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13))),
      Expanded(child: Text(value, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13))),
    ]),
  );

  Color _statusColor(String s) {
    switch (s) {
      case 'Approved':  return AppColors.success;
      case 'Rejected':  return AppColors.danger;
      case 'Cancelled': return AppColors.textMuted;
      default:          return AppColors.warning;
    }
  }

  Future<void> _uploadFoto(int id) async {
    XFile? picked;
    if (kIsWeb) {
      picked = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
    } else {
      final src = await showModalBottomSheet<ImageSource>(
        context: context,
        backgroundColor: AppColors.bg3,
        builder: (_) => SafeArea(child: Column(mainAxisSize: MainAxisSize.min, children: [
          ListTile(
            leading: const Icon(Icons.camera_alt, color: AppColors.primary),
            title: const Text('Kamera', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () => Navigator.pop(context, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library, color: AppColors.primary),
            title: const Text('Galeri', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () => Navigator.pop(context, ImageSource.gallery),
          ),
        ])),
      );
      if (src == null) return;
      picked = await _picker.pickImage(source: src, imageQuality: 80);
    }
    if (picked == null) return;

    setState(() => _uploading = true);
    try {
      if (kIsWeb) {
        final bytes = await picked.readAsBytes();
        await EntertainRepository().uploadPhotoBytes(id, bytes, picked.name);
      } else {
        await EntertainRepository().uploadPhoto(id, File(picked.path));
      }
      ref.invalidate(claimDetailProvider(id));
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Foto berhasil diupload'), backgroundColor: AppColors.success));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal upload: $e'), backgroundColor: AppColors.danger));
      }
    } finally {
      if (mounted) setState(() => _uploading = false);
    }
  }

  Future<void> _confirmCancel(int id) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: AppColors.bg3,
        title: const Text('Batalkan Klaim?', style: TextStyle(color: AppColors.textPrimary)),
        content: const Text('Klaim yang dibatalkan tidak dapat diajukan ulang.',
            style: TextStyle(color: AppColors.textSecondary)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false),
              child: const Text('Tidak', style: TextStyle(color: AppColors.textSecondary))),
          TextButton(onPressed: () => Navigator.pop(context, true),
              child: const Text('Ya, Batalkan', style: TextStyle(color: AppColors.danger))),
        ],
      ),
    );
    if (ok != true) return;

    try {
      await EntertainRepository().cancelClaim(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Klaim dibatalkan'), backgroundColor: AppColors.warning));
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Gagal: $e'), backgroundColor: AppColors.danger));
      }
    }
  }
}
