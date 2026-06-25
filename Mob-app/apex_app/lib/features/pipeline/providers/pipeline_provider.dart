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

final pipelineLeadsProvider =
    FutureProvider<List<LeadModel>>((ref) async {
  final filter = ref.watch(pipelineFilterProvider);
  final repo   = ref.read(pipelineRepositoryProvider);
  final result = await repo.fetchLeads(
    stage:  filter.stage,
    search: filter.search,
    limit:  50,
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
