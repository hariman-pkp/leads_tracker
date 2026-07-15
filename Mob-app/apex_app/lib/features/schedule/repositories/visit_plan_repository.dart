import '../../../core/network/api_client.dart';
import '../models/visit_plan_model.dart';

class VisitPlanRepository {
  final _api = ApiClient.instance;

  Future<TodaySchedule> fetchToday() async {
    final res  = await _api.get('/v1/today');
    final data = res.data as Map<String, dynamic>;
    return TodaySchedule.fromJson(data);
  }
}
