import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/daily_report_model.dart';
import '../repositories/daily_report_repository.dart';
import '../../../core/utils/date_utils.dart';

final dailyReportRepositoryProvider =
    Provider<DailyReportRepository>((_) => DailyReportRepository());

// Auto-summary dari data hari ini
final autoSummaryProvider =
    FutureProvider<AutoSummary>((ref) {
  return ref.read(dailyReportRepositoryProvider).fetchSummary();
});

// Riwayat laporan (bulan ini)
final reportHistoryProvider =
    FutureProvider<List<DailyReportModel>>((ref) {
  final now   = WibDate.now();
  final month = '${now.year}-${now.month.toString().padLeft(2, '0')}';
  return ref.read(dailyReportRepositoryProvider).fetchReports(month: month);
});
