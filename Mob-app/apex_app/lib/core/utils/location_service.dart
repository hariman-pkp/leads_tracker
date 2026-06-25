import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

class LocationResult {
  final double latitude;
  final double longitude;
  final double? accuracy;
  final String  address;

  const LocationResult({
    required this.latitude,
    required this.longitude,
    this.accuracy,
    required this.address,
  });
}

class LocationService {
  LocationService._();
  static final LocationService instance = LocationService._();

  /// Minta izin & dapatkan posisi + alamat sekarang
  Future<LocationResult> getCurrentLocation() async {
    // Cek service aktif
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Layanan lokasi tidak aktif. Aktifkan GPS di pengaturan.');
    }

    // Cek & minta permission
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception('Izin lokasi ditolak.');
      }
    }
    if (permission == LocationPermission.deniedForever) {
      throw Exception(
        'Izin lokasi ditolak permanen. Buka Pengaturan untuk mengaktifkan.',
      );
    }

    // Ambil posisi dengan akurasi tinggi
    final pos = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
        timeLimit: Duration(seconds: 15),
      ),
    );

    // Reverse geocoding → alamat teks
    String address = 'Lokasi tidak diketahui';
    try {
      final placemarks = await placemarkFromCoordinates(
        pos.latitude,
        pos.longitude,
      );
      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = <String>[
          if (p.street?.isNotEmpty == true)          p.street!,
          if (p.subLocality?.isNotEmpty == true)     p.subLocality!,
          if (p.locality?.isNotEmpty == true)        p.locality!,
          if (p.administrativeArea?.isNotEmpty == true) p.administrativeArea!,
        ];
        address = parts.join(', ');
      }
    } catch (_) {
      // Geocoding gagal — pakai koordinat sebagai fallback
      address = '${pos.latitude.toStringAsFixed(5)}, ${pos.longitude.toStringAsFixed(5)}';
    }

    return LocationResult(
      latitude:  pos.latitude,
      longitude: pos.longitude,
      accuracy:  pos.accuracy,
      address:   address,
    );
  }
}
