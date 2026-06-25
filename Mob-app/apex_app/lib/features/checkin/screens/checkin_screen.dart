import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/location_service.dart';
import '../../../core/utils/photo_stamper.dart';
import '../../../core/widgets/map_picker_sheet.dart';
import '../models/visit_model.dart';
import '../providers/checkin_provider.dart';
import '../../auth/providers/auth_provider.dart';

class CheckinScreen extends ConsumerStatefulWidget {
  const CheckinScreen({super.key});

  @override
  ConsumerState<CheckinScreen> createState() => _CheckinScreenState();
}

class _CheckinScreenState extends ConsumerState<CheckinScreen> {
  final _addressCtrl = TextEditingController();
  final _notesCtrl   = TextEditingController();

  bool    _showForm    = false;
  bool    _gettingGps  = false;
  bool    _stampingImg = false;
  double? _lat, _lng;

  Uint8List? _stampedPhoto;   // foto sudah di-stamp, siap upload
  Map<String, dynamic>? _selectedLead; // lead yang ditautkan ke check-in

  Future<void> _getGpsLocation() async {
    setState(() => _gettingGps = true);
    try {
      final r = await LocationService.instance.getCurrentLocation();
      setState(() {
        _lat = r.latitude;
        _lng = r.longitude;
        // Hanya set alamat jika masih kosong agar tidak overwrite hasil map picker
        if (_addressCtrl.text.isEmpty) {
          _addressCtrl.text = r.address;
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: AppColors.warning,
        ));
      }
    } finally {
      if (mounted) setState(() => _gettingGps = false);
    }
  }

  Future<void> _openMapPicker() async {
    final result = await MapPickerSheet.show(
      context,
      lat: _lat,
      lng: _lng,
    );
    if (result != null && mounted) {
      setState(() {
        _lat = result.latitude;
        _lng = result.longitude;
        _addressCtrl.text = result.address;
      });
    }
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    // Web browser desktop tidak support ImageSource.camera via file input —
    // gunakan gallery (file picker). Di mobile native tetap gunakan kamera.
    final source = kIsWeb ? ImageSource.gallery : ImageSource.camera;
    final picked = await picker.pickImage(
      source: source,
      imageQuality: 80,
      preferredCameraDevice: CameraDevice.rear,
    );
    if (picked == null) return;

    setState(() => _stampingImg = true);
    try {
      final bytes   = await picked.readAsBytes();
      final address = _addressCtrl.text.isNotEmpty
          ? _addressCtrl.text
          : 'Lokasi tidak diketahui';
      final stamped = await PhotoStamper.stamp(
        imageBytes: bytes,
        dateTime:   DateTime.now(),
        address:    address,
        latitude:   _lat,
        longitude:  _lng,
      );
      setState(() => _stampedPhoto = stamped);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal memproses foto: $e'),
          backgroundColor: AppColors.warning,
        ));
      }
    } finally {
      if (mounted) setState(() => _stampingImg = false);
    }
  }

  Future<void> _doCheckIn() async {
    if (_stampedPhoto == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Foto check-in wajib diambil dari kamera'),
          backgroundColor: AppColors.warning,
        ),
      );
      return;
    }

    // Gunakan koordinat yang sudah dipilih jika ada; ambil GPS hanya jika belum diset
    double? lat = _lat;
    double? lng = _lng;
    if (lat == null || lng == null) {
      try {
        final pos = await LocationService.instance.getCurrentLocation();
        lat = pos.latitude;
        lng = pos.longitude;
        if (mounted) setState(() { _lat = lat; _lng = lng; });
      } catch (_) {}
    }

    final photoB64 = base64Encode(_stampedPhoto!);

    await ref.read(checkinNotifierProvider.notifier).checkIn(
      latitude:    lat ?? 0,
      longitude:   lng ?? 0,
      address:     _addressCtrl.text.trim().isEmpty ? '-' : _addressCtrl.text.trim(),
      leadId:      _selectedLead?['lead_id'] as String?,
      notes:       _notesCtrl.text.isNotEmpty ? _notesCtrl.text.trim() : null,
      photoBase64: photoB64,
    );

    if (mounted) {
      setState(() {
        _showForm     = false;
        _stampedPhoto = null;
        _selectedLead = null;
      });
      _addressCtrl.clear();
      _notesCtrl.clear();
    }
  }

  void _onCoordinatesPicked(double lat, double lng) {
    setState(() {
      _lat = lat;
      _lng = lng;
    });
  }

  Future<void> _doCheckOut(int visitId) async {
    await ref.read(checkinNotifierProvider.notifier).checkOut(visitId);
  }

  @override
  void dispose() {
    _addressCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final todayVisits   = ref.watch(todayVisitsProvider);
    final activeVisit   = ref.watch(activeVisitProvider);
    final checkinState  = ref.watch(checkinNotifierProvider);
    final isLoading     = checkinState.status == CheckinStatus.loading;
    final isAdmin       = ref.watch(authProvider).user?.isAdmin ?? false;

    ref.listen<CheckinState>(checkinNotifierProvider, (_, next) {
      if (next.status == CheckinStatus.error && next.errorMessage != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(next.errorMessage!),
          backgroundColor: AppColors.danger,
        ));
        ref.read(checkinNotifierProvider.notifier).reset();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
              child: Row(
                children: [
                  const Expanded(
                    child: Text(
                      'Field Activity',
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  Text(
                    DateFormat('d MMM yyyy', 'id_ID').format(DateTime.now()),
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Active / No-active card
            activeVisit.when(
              loading: () => const SizedBox.shrink(),
              error:   (_, __) => const SizedBox.shrink(),
              data: (visit) => visit != null
                  ? _ActiveVisitCard(
                      visit: visit,
                      onCheckOut: _doCheckOut,
                      isLoading: isLoading,
                    )
                  : _NoActiveCard(
                      onTap: () {
                        setState(() => _showForm = !_showForm);
                      },
                      isLoading: isLoading,
                    ),
            ),

            // Form check-in atau daftar riwayat — tidak ditampilkan bersamaan
            // agar layout tidak overflow ketika form panjang.
            if (_showForm) ...[
              const SizedBox(height: 12),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: _CheckinForm(
                    addressCtrl:  _addressCtrl,
                    notesCtrl:    _notesCtrl,
                    isLoading:    isLoading,
                    isGettingGps: _gettingGps,
                    isStamping:   _stampingImg,
                    stampedPhoto: _stampedPhoto,
                    selectedLead: _selectedLead,
                    isAdmin:      isAdmin,
                    onGetGps:     _getGpsLocation,
                    onOpenMap:    _openMapPicker,
                    onTakePhoto:  _takePhoto,
                    onRetakePhoto: () => setState(() => _stampedPhoto = null),
                    onSelectLead: (lead) => setState(() => _selectedLead = lead),
                    onCoordinatesPicked: _onCoordinatesPicked,
                    onSubmit:     _doCheckIn,
                    onCancel:     () => setState(() {
                      _showForm     = false;
                      _stampedPhoto = null;
                      _selectedLead = null;
                    }),
                  ),
                ),
              ),
            ] else ...[
              const SizedBox(height: 20),

              // Riwayat hari ini
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text(
                  'Kunjungan Hari Ini',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 10),

              Expanded(
                child: todayVisits.when(
                  loading: () => const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                  error: (e, _) => Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.cloud_off, color: AppColors.textMuted, size: 40),
                        const SizedBox(height: 8),
                        Text(
                          'Gagal memuat: $e',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                          textAlign: TextAlign.center,
                        ),
                        TextButton(
                          onPressed: () => ref.invalidate(todayVisitsProvider),
                          child: const Text('Coba Lagi'),
                        ),
                      ],
                    ),
                  ),
                  data: (visits) {
                    final done = visits.where((v) => v.checkedOutAt != null).toList();
                    if (done.isEmpty) {
                      return const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.route_outlined, color: AppColors.textMuted, size: 48),
                            SizedBox(height: 12),
                            Text(
                              'Belum ada kunjungan selesai hari ini',
                              style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                      );
                    }
                    return RefreshIndicator(
                      onRefresh: () => ref.refresh(todayVisitsProvider.future),
                      color: AppColors.primary,
                      backgroundColor: AppColors.bg3,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: done.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) => _VisitHistoryCard(visit: done[i]),
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Active Visit Card ─────────────────────────────────────────────────────────

class _ActiveVisitCard extends StatelessWidget {
  final VisitModel visit;
  final Future<void> Function(int) onCheckOut;
  final bool isLoading;
  const _ActiveVisitCard({
    required this.visit,
    required this.onCheckOut,
    required this.isLoading,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [AppColors.success.withAlpha(40), AppColors.bg3],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.success.withAlpha(100)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 10, height: 10,
                  decoration: const BoxDecoration(
                    color: AppColors.success, shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                const Text(
                  'SEDANG CHECK-IN',
                  style: TextStyle(
                    color: AppColors.success,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.success.withAlpha(30),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_elapsedMinutes(visit.checkedInAt)} menit',
                    style: const TextStyle(
                      color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.place, color: AppColors.primary, size: 18),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    visit.address,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            if (visit.leadNama != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  const SizedBox(width: 26),
                  const Icon(Icons.business_outlined, color: AppColors.textMuted, size: 13),
                  const SizedBox(width: 4),
                  Text(visit.leadNama!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ],
              ),
            ],
            const SizedBox(height: 4),
            Row(
              children: [
                const SizedBox(width: 26),
                const Icon(Icons.access_time, color: AppColors.textMuted, size: 13),
                const SizedBox(width: 4),
                Text(
                  'Check-in: ${_formatTime(visit.checkedInAt)}',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isLoading ? null : () => onCheckOut(visit.id),
                icon: isLoading
                    ? const SizedBox(
                        width: 14, height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.logout, size: 16),
                label: Text(isLoading ? 'Memproses...' : 'Check-Out Sekarang'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Parse ke UTC — naive string dari server dianggap WIB (UTC+7)
  static DateTime _toUtc(String dt) {
    final s = dt.trim().replaceFirst(' ', 'T');
    if (s.endsWith('Z')) return DateTime.parse(s);
    if (RegExp(r'[+-]\d{2}:?\d{2}$').hasMatch(s)) return DateTime.parse(s).toUtc();
    return DateTime.parse('${s}+07:00').toUtc();
  }

  // Tampilkan jam dalam WIB (UTC+7), tidak bergantung timezone device/browser
  String _formatTime(String dt) {
    try {
      final wib = _toUtc(dt).add(const Duration(hours: 7));
      return '${wib.hour.toString().padLeft(2, '0')}:${wib.minute.toString().padLeft(2, '0')}';
    } catch (_) { return dt; }
  }

  int _elapsedMinutes(String dt) {
    try { return DateTime.now().toUtc().difference(_toUtc(dt)).inMinutes; } catch (_) { return 0; }
  }
}

// ── No Active Card ────────────────────────────────────────────────────────────

class _NoActiveCard extends StatelessWidget {
  final VoidCallback onTap;
  final bool isLoading;
  const _NoActiveCard({required this.onTap, required this.isLoading});

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(horizontal: 16),
    child: GestureDetector(
      onTap: isLoading ? null : onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bg3,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.primary.withAlpha(80)),
        ),
        child: Row(
          children: [
            Container(
              width: 48, height: 48,
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(30),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.add_location_alt_outlined, color: AppColors.primary, size: 24),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Mulai Kunjungan',
                    style: TextStyle(
                      color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Tap untuk check-in ke lokasi klien',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 12),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 20),
          ],
        ),
      ),
    ),
  );
}

// ── Check-in Form ─────────────────────────────────────────────────────────────

class _CheckinForm extends ConsumerStatefulWidget {
  final TextEditingController addressCtrl;
  final TextEditingController notesCtrl;
  final bool       isLoading;
  final bool       isGettingGps;
  final bool       isStamping;
  final Uint8List? stampedPhoto;
  final Map<String, dynamic>? selectedLead;
  final bool isAdmin;
  final VoidCallback onGetGps;
  final VoidCallback onOpenMap;
  final VoidCallback onTakePhoto;
  final VoidCallback onRetakePhoto;
  final ValueChanged<Map<String, dynamic>?> onSelectLead;
  final void Function(double lat, double lng) onCoordinatesPicked;
  final VoidCallback onSubmit;
  final VoidCallback onCancel;

  const _CheckinForm({
    required this.addressCtrl,
    required this.notesCtrl,
    required this.isLoading,
    required this.isGettingGps,
    required this.isStamping,
    required this.stampedPhoto,
    required this.selectedLead,
    required this.isAdmin,
    required this.onGetGps,
    required this.onOpenMap,
    required this.onTakePhoto,
    required this.onRetakePhoto,
    required this.onSelectLead,
    required this.onCoordinatesPicked,
    required this.onSubmit,
    required this.onCancel,
  });

  @override
  ConsumerState<_CheckinForm> createState() => _CheckinFormState();
}

class _CheckinFormState extends ConsumerState<_CheckinForm> {
  // Lead search
  final _leadCtrl  = TextEditingController();
  final _leadFocus = FocusNode();
  List<Map<String, dynamic>> _allLeads        = [];
  List<Map<String, dynamic>> _leadSuggestions = [];

  // Address autocomplete (Nominatim / OpenStreetMap)
  final _addressFocus = FocusNode();
  List<dynamic> _addressSuggestions = [];
  bool  _addressSearching = false;
  Timer? _addressDebounce;

  @override
  void initState() {
    super.initState();
    _loadLeads();
    if (widget.selectedLead != null) {
      _leadCtrl.text = widget.selectedLead!['nama_company'] as String? ?? '';
    }
    _leadFocus.addListener(() {
      if (!_leadFocus.hasFocus) {
        Future.delayed(const Duration(milliseconds: 150), () {
          if (mounted) setState(() => _leadSuggestions = []);
        });
      }
    });
    _addressFocus.addListener(() {
      if (!_addressFocus.hasFocus) {
        Future.delayed(const Duration(milliseconds: 150), () {
          if (mounted) setState(() => _addressSuggestions = []);
        });
      }
    });
  }

  @override
  void dispose() {
    _leadCtrl.dispose();
    _leadFocus.dispose();
    _addressFocus.dispose();
    _addressDebounce?.cancel();
    super.dispose();
  }

  Future<void> _loadLeads() async {
    try {
      final leads = await ref.read(leadPickListProvider.future);
      if (mounted) setState(() => _allLeads = leads);
    } catch (_) {}
  }

  void _onLeadSearch(String q) {
    if (q.isEmpty) {
      setState(() => _leadSuggestions = []);
      widget.onSelectLead(null);
      return;
    }
    final lower = q.toLowerCase();
    setState(() {
      _leadSuggestions = _allLeads.where((l) {
        final company = (l['nama_company'] as String? ?? '').toLowerCase();
        final contact = (l['contact_person'] as String? ?? '').toLowerCase();
        return company.contains(lower) || contact.contains(lower);
      }).take(5).toList();
    });
  }

  void _selectLead(Map<String, dynamic> lead) {
    _leadCtrl.text = lead['nama_company'] as String? ?? '';
    setState(() => _leadSuggestions = []);
    _leadFocus.unfocus();
    widget.onSelectLead(lead);
  }

  void _clearLead() {
    _leadCtrl.clear();
    setState(() => _leadSuggestions = []);
    widget.onSelectLead(null);
  }

  void _onAddressChange(String q) {
    if (!widget.isAdmin) return; // Nominatim hanya untuk admin
    _addressDebounce?.cancel();
    if (q.length < 3) {
      setState(() => _addressSuggestions = []);
      return;
    }
    _addressDebounce = Timer(
      const Duration(milliseconds: 400),
      () => _searchAddress(q),
    );
  }

  Future<void> _searchAddress(String q) async {
    if (!mounted) return;
    setState(() => _addressSearching = true);
    try {
      final res = await Dio().get(
        'https://nominatim.openstreetmap.org/search',
        queryParameters: {
          'format': 'json',
          'q': q,
          'limit': '5',
          'accept-language': 'id',
          'addressdetails': '1',
          'countrycodes': 'ID',
        },
        options: Options(headers: {'User-Agent': 'APEXLeadsApp/1.0'}),
      );
      if (mounted) {
        setState(() {
          _addressSuggestions = res.data is List ? res.data as List : [];
        });
      }
    } catch (_) {
      if (mounted) setState(() => _addressSuggestions = []);
    } finally {
      if (mounted) setState(() => _addressSearching = false);
    }
  }

  void _pickAddressSuggestion(dynamic s) {
    final name = s['display_name'] as String? ?? '';
    widget.addressCtrl.text = name;
    final lat = double.tryParse(s['lat'] as String? ?? '');
    final lng = double.tryParse(s['lon'] as String? ?? '');
    if (lat != null && lng != null) widget.onCoordinatesPicked(lat, lng);
    setState(() => _addressSuggestions = []);
    _addressFocus.unfocus();
  }

  @override
  Widget build(BuildContext context) {
    final hasPhoto = widget.stampedPhoto != null;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bg3,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Detail Check-in',
              style: TextStyle(
                color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 12),

            // ── Lead / Klien — inline search ───────────────────────────
            TextFormField(
              controller: _leadCtrl,
              focusNode: _leadFocus,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              onChanged: _onLeadSearch,
              decoration: InputDecoration(
                labelText: 'Lead / Klien (opsional)',
                prefixIcon: Icon(
                  widget.selectedLead != null
                      ? Icons.business_center_outlined
                      : Icons.link_outlined,
                  color: widget.selectedLead != null
                      ? AppColors.primary
                      : AppColors.textMuted,
                  size: 18,
                ),
                suffixIcon: widget.selectedLead != null
                    ? GestureDetector(
                        onTap: _clearLead,
                        child: const Icon(Icons.close, color: AppColors.textMuted, size: 16),
                      )
                    : null,
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide(
                    color: widget.selectedLead != null
                        ? AppColors.primary.withAlpha(120)
                        : AppColors.border,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
                filled: true,
                fillColor: AppColors.bg1,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
              ),
            ),
            if (_leadSuggestions.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  color: AppColors.bg2,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: _leadSuggestions.map((l) => InkWell(
                    onTap: () => _selectLead(l),
                    borderRadius: BorderRadius.circular(10),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                      child: Row(
                        children: [
                          Container(
                            width: 32, height: 32,
                            decoration: BoxDecoration(
                              color: AppColors.primary.withAlpha(20),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.business, color: AppColors.primary, size: 16),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  l['nama_company'] as String? ?? '',
                                  style: const TextStyle(
                                    color: AppColors.textPrimary, fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                Text(
                                  '${l['contact_person'] ?? ''} · ${l['stage'] ?? ''}',
                                  style: const TextStyle(
                                    color: AppColors.textSecondary, fontSize: 11,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  )).toList(),
                ),
              ),
            if (widget.selectedLead != null && _leadSuggestions.isEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4, left: 4),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, color: AppColors.success, size: 13),
                    const SizedBox(width: 4),
                    Text(
                      widget.selectedLead!['contact_person'] as String? ?? '',
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 10),

            // ── Alamat + Nominatim autocomplete ───────────────────────
            TextFormField(
              controller: widget.addressCtrl,
              focusNode: _addressFocus,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              onChanged: _onAddressChange,
              decoration: InputDecoration(
                hintText: widget.isAdmin ? 'Ketik alamat untuk mencari…' : 'Ketik Lokasi',
                hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 13),
                prefixIcon: const Icon(Icons.place_outlined, color: AppColors.textSecondary, size: 18),
                suffixIcon: _addressSearching
                    ? const Padding(
                        padding: EdgeInsets.only(right: 12),
                        child: SizedBox(
                          width: 14, height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                        ),
                      )
                    : null,
                filled: true,
                fillColor: AppColors.bg1,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
            if (widget.isAdmin && _addressSuggestions.isNotEmpty)
              Container(
                margin: const EdgeInsets.only(top: 2),
                decoration: BoxDecoration(
                  color: AppColors.bg2,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: _addressSuggestions.map((s) => InkWell(
                    onTap: () => _pickAddressSuggestion(s),
                    borderRadius: BorderRadius.circular(10),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                      child: Row(
                        children: [
                          const Icon(Icons.place_outlined, color: AppColors.primary, size: 16),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              s['display_name'] as String? ?? '',
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )).toList(),
                ),
              ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.isGettingGps ? null : widget.onGetGps,
                    icon: widget.isGettingGps
                        ? const SizedBox(
                            width: 14, height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                          )
                        : const Icon(Icons.my_location, size: 15),
                    label: Text(
                      widget.isGettingGps ? 'Mendeteksi…' : 'Lokasi Saya',
                      style: const TextStyle(fontSize: 12),
                    ),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.primary,
                      side: BorderSide(color: AppColors.primary.withAlpha(120)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: widget.onOpenMap,
                    icon: const Icon(Icons.map_outlined, size: 15),
                    label: const Text('Cari di Peta', style: TextStyle(fontSize: 12)),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: const Color(0xFF26A69A),
                      side: const BorderSide(color: Color(0x8026A69A)),
                      padding: const EdgeInsets.symmetric(vertical: 8),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Catatan
            TextField(
              controller: widget.notesCtrl,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Catatan (opsional)',
                prefixIcon: const Icon(Icons.notes_outlined, color: AppColors.textSecondary, size: 18),
                filled: true,
                fillColor: AppColors.bg1,
                contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.border),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: const BorderSide(color: AppColors.primary),
                ),
              ),
            ),
            const SizedBox(height: 14),

            // ── Foto Check-in ─────────────────────────────────────────
            Container(
              decoration: BoxDecoration(
                color: AppColors.bg1,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: hasPhoto
                      ? AppColors.success.withAlpha(120)
                      : AppColors.warning.withAlpha(120),
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: hasPhoto
                  ? Stack(
                      children: [
                        Image.memory(
                          widget.stampedPhoto!,
                          width: double.infinity,
                          height: 180,
                          fit: BoxFit.cover,
                        ),
                        Positioned(
                          top: 8, right: 8,
                          child: GestureDetector(
                            onTap: widget.onRetakePhoto,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                              decoration: BoxDecoration(
                                color: Colors.black.withOpacity(0.65),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.camera_alt, color: Colors.white, size: 14),
                                  SizedBox(width: 4),
                                  Text('Ambil Ulang',
                                      style: TextStyle(color: Colors.white, fontSize: 12)),
                                ],
                              ),
                            ),
                          ),
                        ),
                        Positioned(
                          top: 8, left: 8,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.success.withOpacity(0.85),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check_circle, color: Colors.white, size: 12),
                                SizedBox(width: 4),
                                Text('Foto OK',
                                    style: TextStyle(color: Colors.white, fontSize: 11)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    )
                  : InkWell(
                      onTap: widget.isStamping ? null : widget.onTakePhoto,
                      child: SizedBox(
                        height: 110,
                        child: Center(
                          child: widget.isStamping
                              ? const Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    CircularProgressIndicator(
                                        color: AppColors.primary, strokeWidth: 2),
                                    SizedBox(height: 8),
                                    Text('Memproses foto…',
                                        style: TextStyle(
                                            color: AppColors.textSecondary, fontSize: 12)),
                                  ],
                                )
                              : Column(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Icon(
                                      kIsWeb
                                          ? Icons.upload_file_outlined
                                          : Icons.camera_alt_outlined,
                                      color: AppColors.warning,
                                      size: 36,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      kIsWeb
                                          ? 'Pilih Foto Check-in *'
                                          : 'Ambil Foto Check-in *',
                                      style: const TextStyle(
                                        color: AppColors.warning,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    const SizedBox(height: 2),
                                    Text(
                                      kIsWeb
                                          ? 'Pilih foto dari file (testing web)'
                                          : 'Foto akan diberi tanggal, jam & lokasi',
                                      style: const TextStyle(
                                          color: AppColors.textMuted, fontSize: 11),
                                    ),
                                  ],
                                ),
                        ),
                      ),
                    ),
            ),

            const SizedBox(height: 14),

            // Tombol aksi
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: widget.onCancel,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      side: const BorderSide(color: AppColors.border),
                    ),
                    child: const Text('Batal'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: (widget.isLoading || widget.isStamping) ? null : widget.onSubmit,
                    icon: widget.isLoading
                        ? const SizedBox(
                            width: 14, height: 14,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Icon(Icons.login, size: 16),
                    label: Text(widget.isLoading ? 'Memproses...' : 'Check-In'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Visit History Card ────────────────────────────────────────────────────────

class _VisitHistoryCard extends StatelessWidget {
  final VisitModel visit;
  const _VisitHistoryCard({required this.visit});

  static DateTime _toUtc(String dt) {
    final s = dt.trim().replaceFirst(' ', 'T');
    if (s.endsWith('Z')) return DateTime.parse(s);
    if (RegExp(r'[+-]\d{2}:?\d{2}$').hasMatch(s)) return DateTime.parse(s).toUtc();
    return DateTime.parse('${s}+07:00').toUtc();
  }

  String _formatTime(String dt) {
    try {
      final wib = _toUtc(dt).add(const Duration(hours: 7));
      return '${wib.hour.toString().padLeft(2, '0')}:${wib.minute.toString().padLeft(2, '0')}';
    } catch (_) { return dt; }
  }

  @override
  Widget build(BuildContext context) {
    final checkinTime  = _formatTime(visit.checkedInAt);
    final checkoutTime = visit.checkedOutAt != null ? _formatTime(visit.checkedOutAt!) : '-';

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bg3,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: AppColors.success.withAlpha(20),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.check_circle_outline, color: AppColors.success, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  visit.address,
                  style: const TextStyle(
                    color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (visit.leadNama != null) ...[
                  const SizedBox(height: 2),
                  Text(visit.leadNama!,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 11)),
                ],
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.access_time, color: AppColors.textMuted, size: 12),
                    const SizedBox(width: 3),
                    Text(
                      '$checkinTime → $checkoutTime',
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                    ),
                    if (visit.durationMinutes != null) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withAlpha(20),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${visit.durationMinutes} mnt',
                          style: const TextStyle(color: AppColors.primary, fontSize: 10),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Provider for lead pick list (active leads only)
final leadPickListProvider = FutureProvider.autoDispose<List<Map<String, dynamic>>>((ref) async {
  final res = await ApiClient.instance.get(
    '/v1/pipeline',
    params: {'limit': '200'},
  );
  final data = res.data as Map<String, dynamic>;
  return List<Map<String, dynamic>>.from(
    (data['leads'] as List? ?? []).map((e) => Map<String, dynamic>.from(e as Map)),
  );
});
