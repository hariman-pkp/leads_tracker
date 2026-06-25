import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/notification_model.dart';
import '../repositories/notifications_repository.dart';

final notificationsRepositoryProvider =
    Provider<NotificationsRepository>((_) => NotificationsRepository());

// Unread count — di-poll tiap kali widget dibuild
final unreadCountProvider = FutureProvider<int>((ref) {
  return ref.read(notificationsRepositoryProvider).fetchUnreadCount();
});

// Daftar notif lengkap
final notificationsListProvider =
    FutureProvider<List<NotificationModel>>((ref) async {
  final result = await ref.read(notificationsRepositoryProvider).fetchAll();
  return result.items;
});
