import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/followup_model.dart';
import '../repositories/followup_repository.dart';

final followupRepositoryProvider =
    Provider<FollowupRepository>((_) => FollowupRepository());

final followupHistoryProvider =
    FutureProvider.family<List<FollowupModel>, String>((ref, leadId) {
  return ref.read(followupRepositoryProvider).fetchHistory(leadId);
});
