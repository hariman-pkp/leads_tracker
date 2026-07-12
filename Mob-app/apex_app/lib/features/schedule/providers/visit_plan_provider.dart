import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/visit_plan_model.dart';
import '../repositories/visit_plan_repository.dart';

final visitPlanRepositoryProvider =
    Provider<VisitPlanRepository>((_) => VisitPlanRepository());

// Filter: bulan yang sedang ditampilkan (format YYYY-MM)
final visitPlanMonthProvider = StateProvider<String>((_) {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}';
});

class VisitPlanNotifier extends StateNotifier<AsyncValue<List<VisitPlanModel>>> {
  final VisitPlanRepository _repo;
  String _month;

  VisitPlanNotifier(this._repo, this._month) : super(const AsyncValue.loading()) {
    _load();
  }

  Future<void> _load() async {
    state = const AsyncValue.loading();
    try {
      final plans = await _repo.fetchPlans(month: _month);
      state = AsyncValue.data(plans);
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> refresh() => _load();

  Future<void> addPlan({
    required String plannedDate,
    String?         plannedTime,
    String?         leadId,
    String?         notes,
    int?            userId,
  }) async {
    final plan = await _repo.createPlan(
      plannedDate: plannedDate,
      plannedTime: plannedTime,
      leadId:      leadId,
      notes:       notes,
      userId:      userId,
    );
    final current = state.valueOrNull ?? [];
    state = AsyncValue.data([...current, plan]
      ..sort((a, b) {
        final d = a.plannedDate.compareTo(b.plannedDate);
        return d != 0 ? d : (a.plannedTime ?? '').compareTo(b.plannedTime ?? '');
      }));
  }

  Future<void> updateStatus(int id, String status) async {
    await _repo.updatePlan(id, {'status': status});
    final current = state.valueOrNull ?? [];
    state = AsyncValue.data(current.map((p) {
      if (p.id == id) {
        return VisitPlanModel.fromJson({
          'id': p.id, 'user_id': p.userId, 'sales_nama': p.salesNama,
          'lead_id': p.leadId, 'lead_nama': p.leadNama,
          'planned_date': p.plannedDate, 'planned_time': p.plannedTime,
          'notes': p.notes, 'status': status, 'visit_log_id': p.visitLogId,
        });
      }
      return p;
    }).toList());
  }

  Future<void> deletePlan(int id) async {
    await _repo.deletePlan(id);
    final current = state.valueOrNull ?? [];
    state = AsyncValue.data(current.where((p) => p.id != id).toList());
  }
}

final visitPlanProvider =
    StateNotifierProvider<VisitPlanNotifier, AsyncValue<List<VisitPlanModel>>>((ref) {
  final month = ref.watch(visitPlanMonthProvider);
  return VisitPlanNotifier(ref.read(visitPlanRepositoryProvider), month);
});
