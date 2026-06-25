import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/dashboard_model.dart';

class DashboardRepository {
  final _api = ApiClient.instance;

  Future<DashboardStats> fetchStats() async {
    final res  = await _api.get(ApiConstants.dashboard);
    final data = res.data as Map<String, dynamic>;
    return DashboardStats.fromJson(data);
  }
}
