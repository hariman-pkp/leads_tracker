import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/plan_model.dart';
import '../repositories/plan_repository.dart';

final planRepositoryProvider = Provider<PlanRepository>((_) => PlanRepository());

// ── State ─────────────────────────────────────────────────────────────────────

class PlanState {
  final AsyncValue<WeekPlanData> data;
  final DateTime weekStart;

  const PlanState({required this.data, required this.weekStart});

  PlanState copyWith({AsyncValue<WeekPlanData>? data, DateTime? weekStart}) =>
      PlanState(data: data ?? this.data, weekStart: weekStart ?? this.weekStart);
}

// ── Notifier ──────────────────────────────────────────────────────────────────

class PlanNotifier extends StateNotifier<PlanState> {
  final PlanRepository _repo;

  PlanNotifier(this._repo)
      : super(PlanState(
          data:      const AsyncValue.loading(),
          weekStart: _startOfWeek(DateTime.now()),
        )) {
    _load();
  }

  static DateTime _startOfWeek(DateTime d) {
    final diff = d.weekday - 1; // Monday = 1
    return DateTime(d.year, d.month, d.day - diff);
  }

  static String _toISO(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2,'0')}-${d.day.toString().padLeft(2,'0')}';

  Future<void> _load() async {
    state = state.copyWith(data: const AsyncValue.loading());
    try {
      final plan = await _repo.fetchWeekly(weekStart: _toISO(state.weekStart));
      state = state.copyWith(data: AsyncValue.data(plan));
    } catch (e, st) {
      state = state.copyWith(data: AsyncValue.error(e, st));
    }
  }

  Future<void> refresh() => _load();

  void prevWeek() {
    state = state.copyWith(weekStart: state.weekStart.subtract(const Duration(days: 7)));
    _load();
  }

  void nextWeek() {
    state = state.copyWith(weekStart: state.weekStart.add(const Duration(days: 7)));
    _load();
  }

  void goToday() {
    final w = _startOfWeek(DateTime.now());
    if (w != state.weekStart) {
      state = state.copyWith(weekStart: w);
      _load();
    }
  }

  // Assign lead ke tanggal + tipe
  Future<void> assign(PlanLead lead, String date, String fuType) async {
    final prev = state.data.valueOrNull;
    if (prev == null) return;

    // Optimistic update
    state = state.copyWith(data: AsyncValue.data(_applyAssign(prev, lead, date, fuType)));

    try {
      await _repo.assign(leadId: lead.leadId, nextFuDate: date, nextFuType: fuType);
    } catch (_) {
      // Rollback
      state = state.copyWith(data: AsyncValue.data(prev));
      rethrow;
    }
  }

  // Remove jadwal (nextFuDate → null)
  Future<void> removeSchedule(PlanLead lead) async {
    final prev = state.data.valueOrNull;
    if (prev == null) return;

    final updated = lead.copyWith(nextFuDate: null);
    final newUnscheduled = [...prev.unscheduled, updated];
    final newByDate = Map<String, List<PlanLead>>.from(
      prev.byDate.map((k, v) => MapEntry(k, v.where((l) => l.leadId != lead.leadId).toList())),
    )..removeWhere((_, v) => v.isEmpty);

    state = state.copyWith(data: AsyncValue.data(WeekPlanData(
      weekStart: prev.weekStart, weekEnd: prev.weekEnd, today: prev.today,
      unscheduled: newUnscheduled, overdue: prev.overdue, byDate: newByDate,
    )));

    try {
      await _repo.assign(leadId: lead.leadId, nextFuDate: null, nextFuType: lead.nextFuType);
    } catch (_) {
      state = state.copyWith(data: AsyncValue.data(prev));
      rethrow;
    }
  }

  // Quick lead: buat lead baru lalu assign
  Future<void> createAndAssign({
    required String namaCompany,
    required String product,
    required String salesOwner,
    required String date,
    required String fuType,
  }) async {
    final leadId = await _repo.createLead(
      namaCompany: namaCompany,
      product: product,
      salesOwner: salesOwner,
    );
    await _repo.assign(leadId: leadId, nextFuDate: date, nextFuType: fuType);
    await _load(); // reload for full data
  }

  WeekPlanData _applyAssign(WeekPlanData prev, PlanLead lead, String date, String fuType) {
    final updated = lead.copyWith(nextFuDate: date, nextFuType: fuType);

    // Remove dari unscheduled + overdue
    final unscheduled = prev.unscheduled.where((l) => l.leadId != lead.leadId).toList();
    final overdue     = prev.overdue    .where((l) => l.leadId != lead.leadId).toList();

    // Remove dari byDate lama
    final newByDate = Map<String, List<PlanLead>>.from(
      prev.byDate.map((k, v) => MapEntry(k, v.where((l) => l.leadId != lead.leadId).toList())),
    )..removeWhere((_, v) => v.isEmpty);

    // Tambah ke byDate baru jika dalam rentang minggu
    if (date.compareTo(prev.weekStart) >= 0 && date.compareTo(prev.weekEnd) <= 0) {
      newByDate[date] = [...(newByDate[date] ?? []), updated];
    }

    return WeekPlanData(
      weekStart: prev.weekStart, weekEnd: prev.weekEnd, today: prev.today,
      unscheduled: unscheduled, overdue: overdue, byDate: newByDate,
    );
  }
}

final planProvider = StateNotifierProvider<PlanNotifier, PlanState>((ref) {
  return PlanNotifier(ref.read(planRepositoryProvider));
});
