import 'package:flutter/foundation.dart';
import 'package:workmanager/workmanager.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:dio/dio.dart';

const _taskName       = 'apex_location_track';
const _taskUniqueName = 'apex_bg_location';
const _tokenKey       = 'auth_token';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((taskName, inputData) async {
    if (taskName != _taskName) return Future.value(true);
    try {
      const storage = FlutterSecureStorage();
      final token   = await storage.read(key: _tokenKey);
      final baseUrl = await storage.read(key: 'api_base_url') ??
          'http://localhost:8002/api';
      if (token == null) return Future.value(true);

      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        return Future.value(true);
      }

      final pos = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.medium,
          timeLimit: Duration(seconds: 15),
        ),
      );

      final dio = Dio(BaseOptions(
        baseUrl: baseUrl,
        headers: {'Authorization': 'Bearer $token'},
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ));

      await dio.post('/v1/location', data: {
        'latitude'   : pos.latitude,
        'longitude'  : pos.longitude,
        'accuracy_m' : pos.accuracy.round(),
        'speed_kmh'  : pos.speed >= 0 ? (pos.speed * 3.6).toStringAsFixed(1) : null,
        'recorded_at': DateTime.now().toUtc().toIso8601String(),
      });
    } catch (e) {
      debugPrint('[BgLocation] Error: $e');
    }
    return Future.value(true);
  });
}

class BackgroundLocationImpl {
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
    _initialized = true;
  }

  Future<void> start() async {
    await init();
    await Workmanager().registerPeriodicTask(
      _taskUniqueName,
      _taskName,
      frequency: const Duration(minutes: 15),
      constraints: Constraints(networkType: NetworkType.connected),
      existingWorkPolicy: ExistingWorkPolicy.replace,
    );
  }

  Future<void> stop() async {
    await Workmanager().cancelByUniqueName(_taskUniqueName);
  }
}
