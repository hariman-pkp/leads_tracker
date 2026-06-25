import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:geolocator/geolocator.dart';
import '../network/api_client.dart';
import '../storage/secure_storage.dart';
import 'background_location_service.dart';

/// Service yang mengirim posisi GPS ke server secara periodik.
/// Gunakan [statusNotifier] untuk listen perubahan state ON/OFF di UI.
class LocationTrackingService {
  LocationTrackingService._();
  static final LocationTrackingService instance = LocationTrackingService._();

  Timer? _timer;
  bool   _isRunning       = false;
  bool   _trackingEnabled = false; // default false sampai server konfirmasi

  bool get isRunning       => _isRunning;
  bool get trackingEnabled => _trackingEnabled;

  /// Widget listen ini untuk update icon real-time.
  final ValueNotifier<bool> statusNotifier = ValueNotifier(false);

  void _updateStatus() {
    statusNotifier.value = _trackingEnabled && _isRunning;
  }

  /// Cek setting dari server, lalu mulai tracking jika diizinkan.
  Future<void> start() async {
    if (_isRunning) return;

    await _checkServerSetting();
    if (!_trackingEnabled) {
      debugPrint('[LocationTracking] Tracking dinonaktifkan oleh admin.');
      _updateStatus();
      return;
    }

    _isRunning = true;
    _updateStatus();
    await _sendLocation();
    _timer = Timer.periodic(const Duration(minutes: 5), (_) => _sendLocation());
    // Aktifkan juga background tracking saat app di background
    await BackgroundLocationService.instance.start();
    debugPrint('[LocationTracking] Dimulai — interval 5 menit (foreground) + 15 menit (background).');
  }

  /// Hentikan tracking.
  void stop() {
    _timer?.cancel();
    _timer     = null;
    _isRunning = false;
    _updateStatus();
    BackgroundLocationService.instance.stop();
    debugPrint('[LocationTracking] Dihentikan.');
  }

  /// Re-cek setting dari server (dipanggil setelah login atau resume app).
  Future<void> refresh() async {
    stop();
    await _checkServerSetting();

    final token = await SecureStorage.instance.getToken();
    if (token == null) {
      _updateStatus();
      return;
    }

    if (_trackingEnabled) await start();
    _updateStatus();
  }

  Future<void> _checkServerSetting() async {
    try {
      final res  = await ApiClient.instance.get('/v1/location/settings');
      final data = res.data as Map<String, dynamic>?;
      _trackingEnabled = (data?['location_tracking_enabled'] as bool?) ?? false;
    } catch (e) {
      _trackingEnabled = false;
      debugPrint('[LocationTracking] Gagal cek setting: $e');
    }
  }

  Future<void> _sendLocation() async {
    if (!_trackingEnabled) { stop(); return; }

    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) { return; }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 10),
        ),
      );

      await ApiClient.instance.post('/v1/location', data: {
        'latitude'   : pos.latitude,
        'longitude'  : pos.longitude,
        'accuracy_m' : pos.accuracy.round(),
        'speed_kmh'  : pos.speed >= 0 ? (pos.speed * 3.6).toStringAsFixed(1) : null,
        'recorded_at': DateTime.now().toUtc().toIso8601String(),
      });

      debugPrint('[LocationTracking] Posisi dikirim: ${pos.latitude}, ${pos.longitude}');
    } catch (e) {
      debugPrint('[LocationTracking] Gagal kirim posisi: $e');
    }
  }
}
