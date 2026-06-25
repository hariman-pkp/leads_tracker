import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;

/// Hasil dari map picker
class MapPickResult {
  final double latitude;
  final double longitude;
  final String address;
  const MapPickResult({
    required this.latitude,
    required this.longitude,
    required this.address,
  });
}

/// Bottom sheet map picker dengan OSM + Nominatim search
class MapPickerSheet extends StatefulWidget {
  final double? initialLat;
  final double? initialLng;

  const MapPickerSheet({super.key, this.initialLat, this.initialLng});

  static Future<MapPickResult?> show(
    BuildContext context, {
    double? lat,
    double? lng,
  }) =>
      showModalBottomSheet<MapPickResult>(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => MapPickerSheet(initialLat: lat, initialLng: lng),
      );

  @override
  State<MapPickerSheet> createState() => _MapPickerSheetState();
}

class _MapPickerSheetState extends State<MapPickerSheet> {
  late final MapController _mapCtrl;
  final _searchCtrl = TextEditingController();

  LatLng _center = const LatLng(-6.2088, 106.8456); // Jakarta default
  String _address = '';
  bool   _loading = false;
  List<_NominatimResult> _suggestions = [];
  bool   _showSuggestions = false;

  @override
  void initState() {
    super.initState();
    _mapCtrl = MapController();
    if (widget.initialLat != null && widget.initialLng != null) {
      _center = LatLng(widget.initialLat!, widget.initialLng!);
    }
    // Ambil alamat awal
    WidgetsBinding.instance.addPostFrameCallback((_) => _reverseGeocode(_center));
  }

  @override
  void dispose() {
    _mapCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _reverseGeocode(LatLng pos) async {
    setState(() { _loading = true; _address = ''; });
    try {
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse'
        '?lat=${pos.latitude}&lon=${pos.longitude}'
        '&format=json&accept-language=id',
      );
      final res = await http.get(url, headers: {'User-Agent': 'APEX-App/1.0'});
      if (res.statusCode == 200) {
        final j = json.decode(res.body) as Map<String, dynamic>;
        setState(() => _address = j['display_name'] as String? ?? '');
      }
    } catch (_) {
      setState(() => _address = '${pos.latitude.toStringAsFixed(6)}, ${pos.longitude.toStringAsFixed(6)}');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _searchAddress(String q) async {
    if (q.trim().length < 3) {
      setState(() { _suggestions = []; _showSuggestions = false; });
      return;
    }
    try {
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/search'
        '?q=${Uri.encodeComponent(q)}&format=json&limit=5&accept-language=id',
      );
      final res = await http.get(url, headers: {'User-Agent': 'APEX-App/1.0'});
      if (res.statusCode == 200) {
        final list = json.decode(res.body) as List;
        setState(() {
          _suggestions   = list.map((e) => _NominatimResult.fromJson(e as Map<String, dynamic>)).toList();
          _showSuggestions = _suggestions.isNotEmpty;
        });
      }
    } catch (_) {}
  }

  void _selectSuggestion(_NominatimResult r) {
    final pos = LatLng(r.lat, r.lng);
    _mapCtrl.move(pos, 16);
    setState(() {
      _center          = pos;
      _address         = r.displayName;
      _showSuggestions = false;
      _suggestions     = [];
    });
    _searchCtrl.text = '';
    FocusScope.of(context).unfocus();
  }

  void _onMapMoved(MapCamera camera, bool hasGesture) {
    if (!hasGesture) return;
    _center = camera.center;
    // Debounce: reverse geocode setelah pindah
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted && _center == camera.center) {
        _reverseGeocode(_center);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.92,
      minChildSize: 0.5,
      maxChildSize: 0.97,
      builder: (_, controller) => Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1A1D2E),
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Handle
            Container(
              margin: const EdgeInsets.only(top: 10, bottom: 6),
              width: 40, height: 4,
              decoration: BoxDecoration(
                color: Colors.white24,
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                children: [
                  const Text(
                    'Pilih Lokasi',
                    style: TextStyle(
                      color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Colors.white54, size: 20),
                  ),
                ],
              ),
            ),

            // Search bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              child: TextField(
                controller: _searchCtrl,
                style: const TextStyle(color: Colors.white, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Cari alamat…',
                  hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
                  prefixIcon: const Icon(Icons.search, color: Colors.white38, size: 18),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? IconButton(
                          onPressed: () {
                            _searchCtrl.clear();
                            setState(() { _suggestions = []; _showSuggestions = false; });
                          },
                          icon: const Icon(Icons.clear, color: Colors.white38, size: 16),
                        )
                      : null,
                  filled: true,
                  fillColor: const Color(0xFF252840),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 10),
                ),
                onChanged: _searchAddress,
              ),
            ),

            // Daftar saran pencarian
            if (_showSuggestions)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: const Color(0xFF252840),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.white12),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  padding: EdgeInsets.zero,
                  itemCount: _suggestions.length,
                  separatorBuilder: (_, __) => const Divider(
                    height: 1, color: Colors.white10,
                  ),
                  itemBuilder: (_, i) {
                    final r = _suggestions[i];
                    return ListTile(
                      dense: true,
                      leading: const Icon(Icons.place_outlined, color: Color(0xFF7C6AF5), size: 18),
                      title: Text(
                        r.displayName,
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      onTap: () => _selectSuggestion(r),
                    );
                  },
                ),
              ),

            // Peta
            Expanded(
              child: Stack(
                children: [
                  FlutterMap(
                    mapController: _mapCtrl,
                    options: MapOptions(
                      initialCenter: _center,
                      initialZoom: 15,
                      onPositionChanged: _onMapMoved,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.pkp.apex_app',
                      ),
                    ],
                  ),
                  // Crosshair marker di tengah
                  const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.location_pin, color: Color(0xFF7C6AF5), size: 40),
                        SizedBox(height: 20), // offset agar pin tepat di tengah
                      ],
                    ),
                  ),
                  // Loading indicator
                  if (_loading)
                    Positioned(
                      top: 8, left: 0, right: 0,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.black87,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              SizedBox(
                                width: 12, height: 12,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2, color: Color(0xFF7C6AF5),
                                ),
                              ),
                              SizedBox(width: 6),
                              Text('Mencari alamat…',
                                  style: TextStyle(color: Colors.white, fontSize: 11)),
                            ],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Panel bawah: tampilkan alamat + tombol konfirmasi
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
              color: const Color(0xFF1A1D2E),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.place, color: Color(0xFF7C6AF5), size: 18),
                      const SizedBox(width: 8),
                      Expanded(
                        child: _loading
                            ? const Text(
                                'Memuat alamat…',
                                style: TextStyle(color: Colors.white54, fontSize: 13),
                              )
                            : Text(
                                _address.isNotEmpty ? _address : 'Geser peta untuk pilih lokasi',
                                style: const TextStyle(color: Colors.white, fontSize: 13),
                                maxLines: 3,
                                overflow: TextOverflow.ellipsis,
                              ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _loading || _address.isEmpty
                          ? null
                          : () => Navigator.pop(
                                context,
                                MapPickResult(
                                  latitude:  _center.latitude,
                                  longitude: _center.longitude,
                                  address:   _address,
                                ),
                              ),
                      icon: const Icon(Icons.check_circle_outline, size: 18),
                      label: const Text('Pilih Lokasi Ini'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C6AF5),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 13),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _NominatimResult {
  final double lat;
  final double lng;
  final String displayName;
  _NominatimResult({required this.lat, required this.lng, required this.displayName});

  factory _NominatimResult.fromJson(Map<String, dynamic> j) => _NominatimResult(
    lat:         double.parse(j['lat'] as String),
    lng:         double.parse(j['lon'] as String),
    displayName: j['display_name'] as String,
  );
}
