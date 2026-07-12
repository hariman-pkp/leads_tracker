import '../../../core/network/api_client.dart';
import '../models/visit_plan_model.dart';

class VisitPlanRepository {
  final _api = ApiClient.instance;
  static const _base = '/v1/visit-plan';

  Future<List<VisitPlanModel>> fetchPlans({
    int?    userId,
    String? month,
    String? dateFrom,
    String? dateTo,
    String? status,
  }) async {
    final res = await _api.get(_base, params: {
      if (userId   != null) 'user_id':   userId,
      if (month    != null) 'month':     month,
      if (dateFrom != null) 'date_from': dateFrom,
      if (dateTo   != null) 'date_to':   dateTo,
      if (status   != null) 'status':    status,
    });
    final data = res.data as Map<String, dynamic>;
    return (data['plans'] as List? ?? [])
        .map((e) => VisitPlanModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<VisitPlanModel> createPlan({
    required String plannedDate,
    String?         plannedTime,
    String?         leadId,
    String?         notes,
    int?            userId,
  }) async {
    final res = await _api.post(_base, data: {
      'planned_date': plannedDate,
      if (plannedTime != null) 'planned_time': plannedTime,
      if (leadId      != null) 'lead_id':      leadId,
      if (notes       != null) 'notes':        notes,
      if (userId      != null) 'user_id':      userId,
    });
    final body = res.data as Map<String, dynamic>;
    return VisitPlanModel.fromJson(body['plan'] as Map<String, dynamic>);
  }

  Future<void> updatePlan(int id, Map<String, dynamic> data) async {
    await _api.put('$_base/$id', data: data);
  }

  Future<void> deletePlan(int id) async {
    await _api.delete('$_base/$id');
  }
}
