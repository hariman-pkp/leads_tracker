import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/followup_model.dart';

class FollowupRepository {
  final _api = ApiClient.instance;

  Future<List<FollowupModel>> fetchHistory(String leadId) async {
    final res  = await _api.get('${ApiConstants.followup}/$leadId');
    final data = res.data as Map<String, dynamic>;
    return (data['logs'] as List? ?? [])
        .map((e) => FollowupModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> createFollowup({
    required String leadId,
    required String metodeFu,
    required String hasilFu,
    String? nextAction,
    String? nextDate,
  }) async {
    await _api.post(ApiConstants.followup, data: {
      'lead_id':     leadId,
      'metode_fu':   metodeFu,
      'hasil_fu':    hasilFu,
      if (nextAction != null) 'next_action': nextAction,
      if (nextDate   != null) 'next_date':   nextDate,
    });
  }
}
