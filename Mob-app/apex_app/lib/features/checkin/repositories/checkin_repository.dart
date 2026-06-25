import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/visit_model.dart';

class CheckinRepository {
  final _api = ApiClient.instance;

  /// Ambil riwayat kunjungan hari ini milik user tertentu
  Future<List<VisitModel>> fetchToday({int? userId}) async {
    final params = <String, dynamic>{};
    if (userId != null) params['user_id'] = userId.toString();
    final res  = await _api.get(ApiConstants.fieldActivity, params: params);
    final data = res.data as Map<String, dynamic>;
    return (data['data'] as List? ?? data['visits'] as List? ?? [])
        .map((e) => VisitModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  /// Check-in ke lokasi
  Future<VisitModel> checkIn({
    int? userId,
    required double latitude,
    required double longitude,
    required String address,
    String? leadId,
    String? notes,
    String? photoBase64,
  }) async {
    final res = await _api.post(ApiConstants.fieldActivityCheckin, data: {
      if (userId      != null) 'user_id':      userId,
      'latitude':  latitude,
      'longitude': longitude,
      'address':   address,
      if (leadId      != null) 'lead_id':      leadId,
      if (notes       != null) 'notes':        notes,
      if (photoBase64 != null) 'photo_base64': photoBase64,
    });
    final body = res.data as Map<String, dynamic>;
    return VisitModel.fromJson(
      body['visit'] as Map<String, dynamic>? ?? body,
    );
  }

  /// Check-out dari kunjungan aktif, opsional sertakan koordinat lokasi saat ini
  Future<void> checkOut(
    int visitId, {
    String? notes,
    double? latitude,
    double? longitude,
  }) async {
    await _api.put(
      '${ApiConstants.fieldActivity}/$visitId/checkout',
      data: {
        if (notes     != null) 'notes':              notes,
        if (latitude  != null) 'checkout_latitude':  latitude,
        if (longitude != null) 'checkout_longitude': longitude,
      },
    );
  }
}
