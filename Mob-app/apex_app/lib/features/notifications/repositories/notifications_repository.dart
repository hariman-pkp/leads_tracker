import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/notification_model.dart';

class NotificationsRepository {
  final _api = ApiClient.instance;

  Future<int> fetchUnreadCount() async {
    final res  = await _api.get(ApiConstants.notificationsUnreadCount);
    final data = res.data as Map<String, dynamic>;
    return data['unread_count'] as int? ?? 0;
  }

  Future<({List<NotificationModel> items, int unreadCount})> fetchAll({
    bool unreadOnly = false,
    int limit = 30,
  }) async {
    final res  = await _api.get(ApiConstants.notifications, params: {
      if (unreadOnly) 'unread': '1',
      'limit': limit,
    });
    final data  = res.data as Map<String, dynamic>;
    final items = (data['notifications'] as List? ?? [])
        .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return (
      items: items,
      unreadCount: data['unread_count'] as int? ?? 0,
    );
  }

  Future<void> markRead(int id) async {
    await _api.post('${ApiConstants.notifications}/$id/read');
  }

  Future<void> markAllRead() async {
    await _api.post('${ApiConstants.notifications}/read-all');
  }

  Future<void> approveClaim(int claimId, String action, {String catatan = ''}) async {
    await _api.post(
      '/v1/entertain/claims/$claimId/approve',
      data: {'action': action, 'catatan': catatan},
    );
  }
}
