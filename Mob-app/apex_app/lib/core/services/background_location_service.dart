import 'platform/background_location_web.dart'
    if (dart.library.io) 'platform/background_location_mobile.dart';

/// Mengatur background location tracking menggunakan Workmanager (mobile only).
/// Di web, semua method menjadi no-op.
class BackgroundLocationService {
  BackgroundLocationService._();
  static final BackgroundLocationService instance = BackgroundLocationService._();

  final _impl = BackgroundLocationImpl();

  Future<void> init()  async => _impl.init();
  Future<void> start() async => _impl.start();
  Future<void> stop()  async => _impl.stop();
}
