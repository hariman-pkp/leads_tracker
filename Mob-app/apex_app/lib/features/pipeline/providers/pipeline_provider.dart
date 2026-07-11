import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/lead_model.dart';
import '../repositories/pipeline_repository.dart';

final pipelineRepositoryProvider =
    Provider<PipelineRepository>((_) => PipelineRepository());

// Filter state
class PipelineFilter {
  final String? stage;
  final String? search;
  const PipelineFilter({this.stage, this.search});
  PipelineFilter copyWith({String? stage, String? search, bool clearStage = false, bool clearSearch = false}) =>
      PipelineFilter(
        stage:  clearStage  ? null : (stage  ?? this.stage),
        search: clearSearch ? null : (search ?? this.search),
      );
}

final pipelineFilterProvider =
    StateProvider<PipelineFilter>((_) => const PipelineFilter());

// Lazy-load state
class PipelineListState {
  final List<LeadModel> leads;
  final int total;
  final bool isLoadingMore;
  final bool hasMore;
  const PipelineListState({
    this.leads = const [],
    this.total = 0,
    this.isLoadingMore = false,
    this.hasMore = true,
  });
  PipelineListState copyWith({
    List<LeadModel>? leads,
    int? total,
    bool? isLoadingMore,
    bool? hasMore,
  }) => PipelineListState(
    leads: leads ?? this.leads,
    total: total ?? this.total,
    isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    hasMore: hasMore ?? this.hasMore,
  );
}

const _kPageSize = 20;

class PipelineListNotifier extends StateNotifier<AsyncValue<PipelineListState>> {
  final PipelineRepository _repo;
  PipelineFilter _filter;

  PipelineListNotifier(this._repo, this._filter)
      : super(const AsyncValue.loading()) {
    _load(reset: true);
  }

  Future<void> _load({bool reset = false}) async {
    if (reset) {
      state = const AsyncValue.loading();
    } else {
      final current = state.valueOrNull;
      if (current == null || !current.hasMore || current.isLoadingMore) return;
      state = AsyncValue.data(current.copyWith(isLoadingMore: true));
    }

    try {
      final offset = reset ? 0 : (state.valueOrNull?.leads.length ?? 0);
      final result = await _repo.fetchLeads(
        stage:  _filter.stage,
        search: _filter.search,
        limit:  _kPageSize,
        offset: offset,
      );
      final existing = reset ? <LeadModel>[] : (state.valueOrNull?.leads ?? []);
      final merged   = [...existing, ...result.leads];
      state = AsyncValue.data(PipelineListState(
        leads: merged,
        total: result.total,
        isLoadingMore: false,
        hasMore: merged.length < result.total,
      ));
    } catch (e, st) {
      state = AsyncValue.error(e, st);
    }
  }

  Future<void> loadMore() => _load(reset: false);

  Future<void> refresh() => _load(reset: true);

  void applyFilter(PipelineFilter filter) {
    _filter = filter;
    _load(reset: true);
  }
}

final pipelineListProvider =
    StateNotifierProvider<PipelineListNotifier, AsyncValue<PipelineListState>>((ref) {
  final filter = ref.watch(pipelineFilterProvider);
  final repo   = ref.read(pipelineRepositoryProvider);
  return PipelineListNotifier(repo, filter);
});

// Kept for leadDetailProvider compatibility
final pipelineLeadsProvider =
    FutureProvider<List<LeadModel>>((ref) async {
  final filter = ref.watch(pipelineFilterProvider);
  final repo   = ref.read(pipelineRepositoryProvider);
  final result = await repo.fetchLeads(
    stage:  filter.stage,
    search: filter.search,
    limit:  _kPageSize,
  );
  return result.leads;
});

final leadDetailProvider =
    FutureProvider.family<LeadModel, String>((ref, leadId) {
  return ref.read(pipelineRepositoryProvider).fetchDetail(leadId);
});

final productsProvider = FutureProvider<List<String>>((ref) async {
  final repo = ref.read(pipelineRepositoryProvider);
  return repo.fetchProducts();
});
