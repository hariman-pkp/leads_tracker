import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../pipeline/models/lead_model.dart';
import '../repositories/entertain_repository.dart';

class EntertainFormScreen extends ConsumerStatefulWidget {
  const EntertainFormScreen({super.key});

  @override
  ConsumerState<EntertainFormScreen> createState() => _EntertainFormScreenState();
}

class _EntertainFormScreenState extends ConsumerState<EntertainFormScreen> {
  final _formKey      = GlobalKey<FormState>();
  final _namaKlienCtrl = TextEditingController();
  final _lokasiCtrl    = TextEditingController();
  final _jumlahCtrl    = TextEditingController();
  final _ketCtrl       = TextEditingController();

  DateTime _tglKlaim   = DateTime.now();
  String? _selectedLeadId;
  List<LeadModel> _leads = [];
  XFile? _photo;
  Uint8List? _photoBytes;
  bool _loading = false;
  String? _error;
  final _picker = ImagePicker();
  final _fmtDate = DateFormat('yyyy-MM-dd');

  @override
  void initState() {
    super.initState();
    _loadLeads();
  }

  Future<void> _loadLeads() async {
    try {
      final res = await ApiClient.instance.dio.get('/v1/pipeline',
          queryParameters: {'per_page': 200});
      final data = res.data as Map<String, dynamic>;
      final all = (data['leads'] as List? ?? data['data'] as List? ?? [])
          .map((e) => LeadModel.fromJson(e as Map<String, dynamic>))
          .toList();
      // Hanya tampilkan leads yang masih aktif (bukan Won/Lost)
      final active = all.where((l) => l.stage != 'Won' && l.stage != 'Lost').toList();
      if (mounted) setState(() => _leads = active);
    } catch (e) {
      debugPrint('_loadLeads error: $e');
    }
  }

  @override
  void dispose() {
    _namaKlienCtrl.dispose();
    _lokasiCtrl.dispose();
    _jumlahCtrl.dispose();
    _ketCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: const Text('Klaim Baru', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
      ),
      body: Form(
        key: _formKey,
        child: ListView(padding: const EdgeInsets.all(16), children: [
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.danger.withOpacity(0.15), borderRadius: BorderRadius.circular(8)),
              child: Text(_error!, style: const TextStyle(color: AppColors.danger)),
            ),

          // Tanggal klaim
          _label('Tanggal Klaim *'),
          GestureDetector(
            onTap: _pickDate,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
              decoration: BoxDecoration(color: AppColors.bg3, borderRadius: BorderRadius.circular(10)),
              child: Row(children: [
                const Icon(Icons.calendar_today, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Text(DateFormat('dd MMM yyyy', 'id_ID').format(_tglKlaim),
                    style: const TextStyle(color: AppColors.textPrimary)),
              ]),
            ),
          ),
          const SizedBox(height: 14),

          // Link lead (opsional)
          _label('Leads Pipeline (Opsional)'),
          DropdownButtonFormField<String>(
            value: _selectedLeadId,
            dropdownColor: AppColors.bg3,
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
            decoration: _inputDecoration('Pilih leads terkait...'),
            items: [
              const DropdownMenuItem(value: null, child: Text('— Tidak terkait leads —',
                  style: TextStyle(color: AppColors.textMuted))),
              ..._leads.map((l) => DropdownMenuItem(
                value: l.leadId,
                child: Text('${l.namaCompany}', overflow: TextOverflow.ellipsis),
              )),
            ],
            onChanged: (v) {
              setState(() => _selectedLeadId = v);
            },
          ),
          const SizedBox(height: 14),

          // Nama klien
          _label('Nama Klien *'),
          TextFormField(
            controller: _namaKlienCtrl,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: _inputDecoration('Nama orang yang dihibur'),
            validator: (v) => v == null || v.trim().isEmpty ? 'Wajib diisi' : null,
          ),
          const SizedBox(height: 14),

          // Lokasi / restoran
          _label('Lokasi / Restoran'),
          TextFormField(
            controller: _lokasiCtrl,
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: _inputDecoration('Nama tempat makan / lokasi'),
          ),
          const SizedBox(height: 14),

          // Jumlah
          _label('Jumlah (Rp) *'),
          TextFormField(
            controller: _jumlahCtrl,
            style: const TextStyle(color: AppColors.textPrimary),
            keyboardType: TextInputType.number,
            inputFormatters: [_ThousandsSeparatorFormatter()],
            decoration: _inputDecoration('0'),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Wajib diisi';
              final raw = v.replaceAll('.', '');
              if (double.tryParse(raw) == null) return 'Angka tidak valid';
              return null;
            },
          ),
          const SizedBox(height: 14),

          // Keterangan
          _label('Keterangan'),
          TextFormField(
            controller: _ketCtrl,
            style: const TextStyle(color: AppColors.textPrimary),
            maxLines: 3,
            decoration: _inputDecoration('Tujuan entertainment, peserta, dll.'),
          ),
          const SizedBox(height: 16),

          // Foto bukti
          _label('Foto Bukti (Struk/Nota)'),
          GestureDetector(
            onTap: _pickPhoto,
            child: Container(
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.bg3,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.border),
              ),
              child: _photoBytes != null
                  ? Stack(children: [
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.memory(_photoBytes!, width: double.infinity, height: 140, fit: BoxFit.cover),
                      ),
                      Positioned(top: 6, right: 6, child: GestureDetector(
                        onTap: () => setState(() { _photo = null; _photoBytes = null; }),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                          child: const Icon(Icons.close, size: 16, color: Colors.white),
                        ),
                      )),
                    ])
                  : Column(mainAxisAlignment: MainAxisAlignment.center, children: const [
                      Icon(Icons.camera_alt_outlined, color: AppColors.textMuted, size: 36),
                      SizedBox(height: 6),
                      Text('Ketuk untuk foto struk', style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
                    ]),
            ),
          ),
          const SizedBox(height: 24),

          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _loading ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: _loading
                  ? const SizedBox(height: 20, width: 20,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Submit Klaim', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
          ),
        ]),
      ),
    );
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _tglKlaim,
      firstDate: DateTime.now().subtract(const Duration(days: 90)),
      lastDate: DateTime.now(),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(colorScheme: const ColorScheme.dark(primary: AppColors.primary)),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _tglKlaim = picked);
  }

  Future<void> _pickPhoto() async {
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
    final bytes = await picked.readAsBytes();
    setState(() { _photo = picked; _photoBytes = bytes; });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });

    try {
      final jumlah = double.parse(_jumlahCtrl.text.trim().replaceAll('.', ''));
      final result = await EntertainRepository().createClaim(
        leadId:     _selectedLeadId,
        tglKlaim:   _fmtDate.format(_tglKlaim),
        namaKlien:  _namaKlienCtrl.text.trim(),
        lokasi:     _lokasiCtrl.text.trim(),
        jumlah:     jumlah,
        keterangan: _ketCtrl.text.trim(),
      );

      // Upload foto jika ada
      if (_photo != null && _photoBytes != null) {
        final id = result['id'] as int;
        if (kIsWeb) {
          await EntertainRepository().uploadPhotoBytes(id, _photoBytes!, _photo!.name);
        } else {
          await EntertainRepository().uploadPhoto(id, File(_photo!.path));
        }
      }

      if (mounted) {
        final limitWarning = result['limit_warning'] == true;
        if (limitWarning) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('⚠ Klaim disubmit, namun melebihi limit bulanan.'),
            backgroundColor: AppColors.warning,
          ));
        } else {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
            content: Text('Klaim berhasil disubmit'),
            backgroundColor: AppColors.success,
          ));
        }
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('DioException', '').trim());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 6),
    child: Text(text, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
  );

  InputDecoration _inputDecoration(String hint) => InputDecoration(
    hintText: hint,
    hintStyle: const TextStyle(color: AppColors.textMuted),
    filled: true,
    fillColor: AppColors.bg3,
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
  );
}

// ── Formatter: 234500 → 234.500 (separator titik, format Indonesia) ──────────
class _ThousandsSeparatorFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue old, TextEditingValue next) {
    if (next.text.isEmpty) return next;

    // Hanya izinkan digit
    final digits = next.text.replaceAll(RegExp(r'[^\d]'), '');
    if (digits.isEmpty) return next.copyWith(text: '');

    // Format dengan titik setiap 3 digit
    final buffer = StringBuffer();
    for (int i = 0; i < digits.length; i++) {
      if (i > 0 && (digits.length - i) % 3 == 0) buffer.write('.');
      buffer.write(digits[i]);
    }
    final formatted = buffer.toString();
    return TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );
  }
}
