import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/dashboard_model.dart';
import '../repositories/dashboard_repository.dart';

final dashboardRepositoryProvider =
    Provider<DashboardRepository>((_) => DashboardRepository());

final dashboardStatsProvider =
    FutureProvider<DashboardStats>((ref) {
  return ref.read(dashboardRepositoryProvider).fetchStats();
});
