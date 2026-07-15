import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/visit_plan_model.dart';
import '../repositories/visit_plan_repository.dart';

final visitPlanRepositoryProvider =
    Provider<VisitPlanRepository>((_) => VisitPlanRepository());

class TodayScheduleNotifier extends StateNotifier<AsyncValue<TodaySchedule>> {
  final VisitPlanRepository _repo;

  TodayScheduleNotifier(this._repo) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final schedule = await _repo.fetchToday();
      state = AsyncValue.data(schedule);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() => _load();
}

final todayScheduleProvider =
    StateNotifierProvider<TodayScheduleNotifier, AsyncValue<TodaySchedule>>((ref) {
  return TodayScheduleNotifier(ref.read(visitPlanRepositoryProvider));
});
