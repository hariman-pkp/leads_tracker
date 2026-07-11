import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/daily_report_model.dart';
import '../repositories/daily_report_repository.dart';

final dailyReportRepositoryProvider =
    Provider<DailyReportRepository>((_) => DailyReportRepository());

// Auto-summary dari data hari ini
final autoSummaryProvider =
    FutureProvider<AutoSummary>((ref) {
  return ref.read(dailyReportRepositoryProvider).fetchSummary();
});

// ── Filter State ──────────────────────────────────────────────────────────────

class ReportHistoryFilter {
  final int?      userId;
  final DateTime? dateFrom;
  final DateTime? dateTo;

  const ReportHistoryFilter({this.userId, this.dateFrom, this.dateTo});

  ReportHistoryFilter copyWith({
    Object? userId     = _sentinel,
    Object? dateFrom   = _sentinel,
    Object? dateTo     = _sentinel,
  }) => ReportHistoryFilter(
    userId:   userId   == _sentinel ? this.userId   : userId   as int?,
    dateFrom: dateFrom == _sentinel ? this.dateFrom : dateFrom as DateTime?,
    dateTo:   dateTo   == _sentinel ? this.dateTo   : dateTo   as DateTime?,
  );

  static const Object _sentinel = Object();
}

final reportHistoryFilterProvider =
    StateProvider<ReportHistoryFilter>((_) => const ReportHistoryFilter());

// ── Lazy-load State ───────────────────────────────────────────────────────────

const _kReportPageSize = 20;

class ReportHistoryState {
  final List<DailyReportModel> reports;
  final int total;
  final bool isLoadingMore;
  final bool hasMore;
  const ReportHistoryState({
    this.reports = const [],
    this.total = 0,
    this.isLoadingMore = false,
    this.hasMore = true,
  });
  ReportHistoryState copyWith({
    List<DailyReportModel>? reports,
    int? total,
    bool? isLoadingMore,
    bool? hasMore,
  }) => ReportHistoryState(
    reports: reports ?? this.reports,
    total: total ?? this.total,
    isLoadingMore: isLoadingMore ?? this.isLoadingMore,
    hasMore: hasMore ?? this.hasMore,
  );
}

class ReportHistoryNotifier extends StateNotifier<AsyncValue<ReportHistoryState>> {
  final DailyReportRepository _repo;
  ReportHistoryFilter _filter;

  ReportHistoryNotifier(this._repo, this._filter)
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
      final offset = reset ? 0 : (state.valueOrNull?.reports.length ?? 0);
      final result = await _repo.fetchReports(
        userId:   _filter.userId,
        dateFrom: _filter.dateFrom,
        dateTo:   _filter.dateTo,
        limit:    _kReportPageSize,
        offset:   offset,
      );
      final existing = reset ? <DailyReportModel>[] : (state.valueOrNull?.reports ?? []);
      final merged   = [...existing, ...result.reports];
      state = AsyncValue.data(ReportHistoryState(
        reports: merged,
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

  void applyFilter(ReportHistoryFilter filter) {
    _filter = filter;
    _load(reset: true);
  }
}

final reportHistoryProvider =
    StateNotifierProvider<ReportHistoryNotifier, AsyncValue<ReportHistoryState>>((ref) {
  final filter = ref.watch(reportHistoryFilterProvider);
  return ReportHistoryNotifier(ref.read(dailyReportRepositoryProvider), filter);
});
