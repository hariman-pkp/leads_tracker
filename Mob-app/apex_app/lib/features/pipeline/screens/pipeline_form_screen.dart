import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_utils.dart';
import '../../../core/services/ocr_service.dart';
import '../../../core/services/offline_service.dart';
import '../../../shared/widgets/voice_note_field.dart';
import '../providers/pipeline_provider.dart';

const _stageOptions = [
  'Prospect', 'Qualified', 'New', 'In Progress',
  'Proposal', 'Proposal Sent', 'On Hold',
  'Negotiation', 'Won', 'Lost',
];

class PipelineFormScreen extends ConsumerStatefulWidget {
  final String? leadId; // null = create new
  const PipelineFormScreen({super.key, required this.leadId});

  @override
  ConsumerState<PipelineFormScreen> createState() => _PipelineFormScreenState();
}

class _PipelineFormScreenState extends ConsumerState<PipelineFormScreen> {
  final _formKey      = GlobalKey<FormState>();
  final _companyCtrl  = TextEditingController();
  final _contactCtrl  = TextEditingController();
  final _phoneCtrl    = TextEditingController();
  final _emailCtrl    = TextEditingController();
  final _productCtrl  = TextEditingController();
  final _valueCtrl    = TextEditingController();
  final _notesCtrl    = TextEditingController();
  String _stage       = 'Prospect';
  String? _lossReason;
  final _lossReasonOtherCtrl = TextEditingController();
  DateTime? _tglFu;
  bool _saving        = false;
  bool _scanning      = false;

  static const _lossReasonOptions = [
    'Harga tidak kompetitif',
    'Kalah dari kompetitor',
    'Budget klien terbatas',
    'Proyek ditunda',
    'Kebutuhan berubah',
    'Tidak ada respons dari klien',
    'Fitur / produk tidak sesuai kebutuhan',
    'Hubungan tidak terjalin dengan baik',
    'Lainnya',
  ];

  bool get _isEdit => widget.leadId != null;
  bool _prefilled = false;

  Future<void> _scanBusinessCard() async {
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(height: 12),
          Container(width: 36, height: 4, decoration: BoxDecoration(
            color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 16),
          const Padding(
            padding: EdgeInsets.only(bottom: 8),
            child: Text('Scan Kartu Nama', style: TextStyle(
              color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700,
            )),
          ),
          ListTile(
            leading: const Icon(Icons.camera_alt, color: AppColors.primary),
            title: const Text('Ambil Foto', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () => Navigator.pop(ctx, ImageSource.camera),
          ),
          ListTile(
            leading: const Icon(Icons.photo_library, color: AppColors.primary),
            title: const Text('Pilih dari Galeri', style: TextStyle(color: AppColors.textPrimary)),
            onTap: () => Navigator.pop(ctx, ImageSource.gallery),
          ),
          const SizedBox(height: 12),
        ],
      ),
    );

    if (source == null || !mounted) return;

    final picked = await picker.pickImage(source: source, imageQuality: 90);
    if (picked == null || !mounted) return;

    setState(() => _scanning = true);
    try {
      final result = await OcrService.instance.scanBusinessCard(picked.path);
      if (!mounted) return;

      if (result == null) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Tidak dapat membaca kartu nama. Coba foto ulang dengan pencahayaan lebih baik.'),
          backgroundColor: AppColors.warning,
        ));
        return;
      }

      // Prefill fields yang belum terisi
      if (result.company != null && _companyCtrl.text.isEmpty) {
        _companyCtrl.text = result.company!;
      }
      if (result.name != null && _contactCtrl.text.isEmpty) {
        _contactCtrl.text = result.name!;
      }
      if (result.phone != null && _phoneCtrl.text.isEmpty) {
        _phoneCtrl.text = result.phone!;
      }
      if (result.email != null && _emailCtrl.text.isEmpty) {
        _emailCtrl.text = result.email!;
      }

      if (mounted) setState(() {});

      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(result.rawText?.isNotEmpty == true
            ? 'Kartu nama berhasil dibaca. Periksa dan lengkapi data.'
            : 'Tidak ada teks terdeteksi. Coba foto lebih jelas.'),
        backgroundColor: result.rawText?.isNotEmpty == true
            ? AppColors.success
            : AppColors.warning,
      ));
    } finally {
      if (mounted) setState(() => _scanning = false);
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isEdit && !_prefilled) {
      final detail = ref.read(leadDetailProvider(widget.leadId!));
      detail.whenData((lead) {
        _prefilled = true;
        _companyCtrl.text = lead.namaCompany;
        _contactCtrl.text = lead.contactPerson;
        _phoneCtrl.text   = lead.phone ?? '';
        _emailCtrl.text   = lead.email ?? '';
        _productCtrl.text = lead.product ?? '';
        if (lead.dealValue != null) {
          _valueCtrl.text = lead.dealValue!.toStringAsFixed(0);
        }
        _notesCtrl.text = lead.notes ?? '';
        _stage = _stageOptions.contains(lead.stage) ? lead.stage : _stageOptions.first;
        _lossReason = lead.lossReason;
        if (lead.tglFu != null) {
          try { _tglFu = WibDate.parse(lead.tglFu!); } catch (_) {}
        }
        if (mounted) setState(() {});
      });
    }
  }

  @override
  void dispose() {
    _companyCtrl.dispose(); _contactCtrl.dispose();
    _phoneCtrl.dispose();   _emailCtrl.dispose();
    _productCtrl.dispose(); _valueCtrl.dispose();
    _notesCtrl.dispose();   _lossReasonOtherCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final data = {
        'nama_company':   _companyCtrl.text.trim(),
        'contact_person': _contactCtrl.text.trim(),
        if (_phoneCtrl.text.isNotEmpty) 'phone':    _phoneCtrl.text.trim(),
        if (_emailCtrl.text.isNotEmpty) 'email':    _emailCtrl.text.trim(),
        if (_productCtrl.text.isNotEmpty) 'product': _productCtrl.text.trim(),
        if (_valueCtrl.text.isNotEmpty)
          'deal_value': double.tryParse(_valueCtrl.text.replaceAll('.', '').replaceAll(',', '')),
        if (_notesCtrl.text.isNotEmpty) 'last_fu_notes': _notesCtrl.text.trim(),
        if (_tglFu != null) 'tgl_fu': _tglFu!.toIso8601String().substring(0, 10),
        'stage': _stage,
        if (_stage == 'Lost' && _lossReason != null)
          'loss_reason': _lossReason == 'Lainnya' && _lossReasonOtherCtrl.text.isNotEmpty
              ? _lossReasonOtherCtrl.text.trim()
              : _lossReason,
      };

      final repo     = ref.read(pipelineRepositoryProvider);
      final isOffline = !OfflineService.instance.isOnline;

      if (_isEdit) {
        await repo.updateLead(widget.leadId!, data);
        ref.invalidate(leadDetailProvider(widget.leadId!));
      } else {
        await repo.createLead(data);
      }
      ref.invalidate(pipelineLeadsProvider);
      if (!mounted) return;

      if (isOffline) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Tersimpan offline — akan disinkronkan saat koneksi tersedia'),
          backgroundColor: Color(0xFF0EA5E9),
          duration: Duration(seconds: 3),
        ));
      }
      context.pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal menyimpan: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    // Saat edit, pastikan data sudah di-load (mungkin navigasi langsung ke /edit tanpa lewat detail)
    if (_isEdit && !_prefilled) {
      final detail = ref.watch(leadDetailProvider(widget.leadId!));
      detail.whenData((lead) {
        if (!_prefilled) {
          _prefilled = true;
          _companyCtrl.text = lead.namaCompany;
          _contactCtrl.text = lead.contactPerson;
          _phoneCtrl.text   = lead.phone ?? '';
          _emailCtrl.text   = lead.email ?? '';
          _productCtrl.text = lead.product ?? '';
          if (lead.dealValue != null) _valueCtrl.text = lead.dealValue!.toStringAsFixed(0);
          _notesCtrl.text = lead.notes ?? '';
          _stage = _stageOptions.contains(lead.stage) ? lead.stage : _stageOptions.first;
          if (lead.tglFu != null) {
            try { _tglFu = WibDate.parse(lead.tglFu!); } catch (_) {}
          }
        }
      });
      if (detail.isLoading) {
        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
      }
    }

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.close, color: AppColors.textPrimary),
        ),
        title: Text(_isEdit ? 'Edit Lead' : 'Lead Baru'),
        actions: [
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Scan Kartu Nama ──────────────────────────────────────
              if (!_isEdit)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: OutlinedButton.icon(
                    onPressed: _scanning ? null : _scanBusinessCard,
                    icon: _scanning
                        ? const SizedBox(width: 16, height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                        : const Icon(Icons.document_scanner_outlined, size: 18),
                    label: Text(_scanning ? 'Memindai...' : 'Scan Kartu Nama (OCR)'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: const BorderSide(color: AppColors.primary),
                      minimumSize: const Size(double.infinity, 44),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                ),

              _sectionLabel('Informasi Perusahaan'),
              _field(_companyCtrl, 'Nama Perusahaan *', required: true),
              const SizedBox(height: 12),
              _field(_contactCtrl, 'Nama Kontak *', required: true),
              const SizedBox(height: 12),
              _field(_phoneCtrl, 'No. Telepon', keyboardType: TextInputType.phone),
              const SizedBox(height: 12),
              _field(_emailCtrl, 'Email', keyboardType: TextInputType.emailAddress),

              const SizedBox(height: 20),
              _sectionLabel('Detail Pipeline'),

              // Stage Dropdown
              DropdownButtonFormField<String>(
                value: _stage,
                dropdownColor: AppColors.bg4,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: const InputDecoration(labelText: 'Stage'),
                items: _stageOptions.map((s) => DropdownMenuItem(
                  value: s,
                  child: Text(s),
                )).toList(),
                onChanged: (v) => setState(() {
                _stage = v ?? _stage;
                if (_stage != 'Lost') _lossReason = null;
              }),
              ),

              // Loss Reason — muncul hanya saat stage = Lost
              if (_stage == 'Lost') ...[
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: _lossReasonOptions.contains(_lossReason) ? _lossReason : null,
                  dropdownColor: AppColors.bg4,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                  decoration: const InputDecoration(
                    labelText: 'Alasan Tidak Menang *',
                    labelStyle: TextStyle(color: Color(0xFFF87171)),
                  ),
                  items: _lossReasonOptions.map((s) => DropdownMenuItem(
                    value: s, child: Text(s, overflow: TextOverflow.ellipsis),
                  )).toList(),
                  onChanged: (v) => setState(() => _lossReason = v),
                ),
                if (_lossReason == 'Lainnya') ...[
                  const SizedBox(height: 8),
                  TextFormField(
                    controller: _lossReasonOtherCtrl,
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                    decoration: const InputDecoration(labelText: 'Jelaskan alasan lainnya'),
                    maxLines: 2,
                  ),
                ],
              ],

              const SizedBox(height: 12),
              _ProductField(controller: _productCtrl),
              const SizedBox(height: 12),
              _field(_valueCtrl, 'Nilai Deal (Rp)', keyboardType: TextInputType.number),

              const SizedBox(height: 12),

              // Tanggal Follow-Up
              GestureDetector(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _tglFu ?? WibDate.today().add(const Duration(days: 3)),
                    firstDate: WibDate.today(),
                    lastDate: WibDate.today().add(const Duration(days: 365)),
                    builder: (ctx, child) => Theme(
                      data: ThemeData.dark().copyWith(
                        colorScheme: const ColorScheme.dark(primary: AppColors.primary),
                      ),
                      child: child!,
                    ),
                  );
                  if (picked != null) setState(() => _tglFu = picked);
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
                      const Icon(Icons.calendar_today_outlined, color: AppColors.textSecondary, size: 18),
                      const SizedBox(width: 10),
                      Text(
                        _tglFu == null
                            ? 'Tanggal Follow-Up'
                            : 'FU: ${_tglFu!.day}/${_tglFu!.month}/${_tglFu!.year}',
                        style: TextStyle(
                          color: _tglFu == null ? AppColors.textMuted : AppColors.textPrimary,
                          fontSize: 14,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),
              _sectionLabel('Catatan'),
              VoiceNoteField(controller: _notesCtrl, hint: 'Tambahkan catatan...'),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(String t) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(t, style: const TextStyle(
      color: AppColors.textSecondary, fontSize: 11,
      fontWeight: FontWeight.w600, letterSpacing: 0.8,
    )),
  );

  Widget _field(
    TextEditingController ctrl,
    String label, {
    bool required = false,
    TextInputType? keyboardType,
  }) =>
      TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(labelText: label),
        validator: required
            ? (v) => (v == null || v.isEmpty) ? '$label wajib diisi' : null
            : null,
      );
}

/// Dropdown produk dari master data + opsi ketik manual
class _ProductField extends ConsumerStatefulWidget {
  final TextEditingController controller;
  const _ProductField({required this.controller});

  @override
  ConsumerState<_ProductField> createState() => _ProductFieldState();
}

class _ProductFieldState extends ConsumerState<_ProductField> {
  bool _manualMode = false;

  @override
  Widget build(BuildContext context) {
    final productsAsync = ref.watch(productsProvider);

    if (_manualMode) {
      return Row(
        children: [
          Expanded(
            child: TextFormField(
              controller: widget.controller,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: const InputDecoration(labelText: 'Produk / Layanan'),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.list, color: AppColors.textSecondary, size: 20),
            tooltip: 'Pilih dari daftar',
            onPressed: () => setState(() => _manualMode = false),
          ),
        ],
      );
    }

    return productsAsync.when(
      loading: () => TextFormField(
        controller: widget.controller,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: const InputDecoration(labelText: 'Produk / Layanan'),
      ),
      error: (_, __) => TextFormField(
        controller: widget.controller,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: const InputDecoration(labelText: 'Produk / Layanan'),
      ),
      data: (products) {
        if (products.isEmpty) {
          return TextFormField(
            controller: widget.controller,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
            decoration: const InputDecoration(labelText: 'Produk / Layanan'),
          );
        }
        // Pastikan nilai controller ada di list, kalau tidak masuk manual mode
        final currentVal = widget.controller.text;
        final inList = products.contains(currentVal);
        if (currentVal.isNotEmpty && !inList) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _manualMode = true);
          });
          return const SizedBox.shrink();
        }
        return Row(
          children: [
            Expanded(
              child: DropdownButtonFormField<String>(
                value: inList ? currentVal : null,
                dropdownColor: AppColors.bg4,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: const InputDecoration(labelText: 'Produk / Layanan'),
                items: [
                  ...products.map((p) => DropdownMenuItem(value: p, child: Text(p))),
                ],
                onChanged: (v) {
                  if (v != null) widget.controller.text = v;
                },
              ),
            ),
            IconButton(
              icon: const Icon(Icons.edit, color: AppColors.textSecondary, size: 20),
              tooltip: 'Ketik manual',
              onPressed: () => setState(() => _manualMode = true),
            ),
          ],
        );
      },
    );
  }
}
