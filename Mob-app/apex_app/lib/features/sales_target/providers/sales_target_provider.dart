import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/sales_target_repository.dart';

final salesTargetRepositoryProvider = Provider((_) => SalesTargetRepository());

final salesTargetProvider = FutureProvider.family<Map<String, dynamic>, int>((ref, tahun) {
  return ref.read(salesTargetRepositoryProvider).getTargets(tahun);
});
