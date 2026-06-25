import 'platform/local_notif_web.dart'
    if (dart.library.io) 'platform/local_notif_mobile.dart';

/// Local push notification service (mobile only).
/// Di web, semua method menjadi no-op.
class LocalNotificationService {
  LocalNotificationService._();
  static final LocalNotificationService instance = LocalNotificationService._();

  final _impl = LocalNotifImpl();

  Future<void> init() async => _impl.init();

  Future<void> show({
    required int id,
    required String title,
    required String body,
  }) async => _impl.show(id: id, title: title, body: body);

  Future<void> cancel(int id) async  => _impl.cancel(id);
  Future<void> cancelAll() async     => _impl.cancelAll();
}
