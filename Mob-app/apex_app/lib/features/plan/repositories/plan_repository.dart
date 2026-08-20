import '../../../core/network/api_client.dart';
import '../models/plan_model.dart';

class PlanRepository {
  final _api = ApiClient.instance;

  Future<WeekPlanData> fetchWeekly({String? weekStart, String? salesOwner}) async {
    final params = <String, dynamic>{};
    if (weekStart  != null) params['week_start']  = weekStart;
    if (salesOwner != null) params['sales_owner'] = salesOwner;
    final res = await _api.get('/v1/plan/weekly', params: params);
    return WeekPlanData.fromJson(res.data as Map<String, dynamic>);
  }

  Future<void> assign({
    required String leadId,
    required String? nextFuDate,
    required String nextFuType,
  }) async {
    await _api.patch('/v1/plan/assign', data: {
      'lead_id':       leadId,
      'next_fu_date':  nextFuDate,
      'next_fu_type':  nextFuType,
    });
  }

  Future<String> createLead({
    required String namaCompany,
    required String product,
    required String salesOwner,
  }) async {
    final res = await _api.post('/v1/pipeline', data: {
      'nama_company': namaCompany,
      'product':      product,
      'sales_owner':  salesOwner,
      'stage':        'New',
      'prioritas':    'Warm',
    });
    return (res.data as Map<String, dynamic>)['lead_id'] as String;
  }
}
