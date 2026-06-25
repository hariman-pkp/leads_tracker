class DashboardStats {
  final int    totalLeads;
  final int    activeLeads;
  final int    followUpToday;
  final int    overdueFollowUp;
  final double pipelineValueMonth;   // active_pipeline (propose_value non-Won/Lost)
  final int    pipelineCount;        // jumlah lead aktif dalam pipeline
  final double wonAmountMonth;       // deal_value Won bulan ini
  final int    wonThisMonth;
  final int    lostThisMonth;
  final double winRate;
  final double avgDealSize;
  final List<StageCount>  stageBreakdown;
  final Map<String, int>  weeklyFu;     // "2026-06-15" → count
  final double            targetMonth;  // sales target bulan ini

  const DashboardStats({
    required this.totalLeads,
    required this.activeLeads,
    required this.followUpToday,
    required this.overdueFollowUp,
    required this.pipelineValueMonth,
    required this.pipelineCount,
    required this.wonAmountMonth,
    required this.wonThisMonth,
    required this.lostThisMonth,
    required this.winRate,
    required this.avgDealSize,
    required this.stageBreakdown,
    required this.weeklyFu,
    required this.targetMonth,
  });

  // API response: { "stats": {...}, "by_stage": [...], "weekly_fu": [...], ... }
  factory DashboardStats.fromJson(Map<String, dynamic> j) {
    final stats   = (j['stats'] as Map<String, dynamic>?) ?? j;
    final byStage = j['by_stage'] as List? ?? [];
    final rawWeekly = j['weekly_fu'] as List? ?? [];
    final weeklyFu  = <String, int>{
      for (final e in rawWeekly)
        (e as Map)['fu_date'].toString(): _i(e['jumlah']),
    };

    final won    = _i(stats['won']);
    final lost   = _i(stats['lost']);
    final closed = won + lost;
    final winRate   = closed > 0 ? (won / closed * 100) : 0.0;
    final totalWon  = _d(stats['total_won'] ?? stats['total_deal']);
    final avgDeal   = won > 0 ? totalWon / won : 0.0;

    return DashboardStats(
      totalLeads:         _i(stats['total']),
      activeLeads:        _i(stats['aktif']),
      followUpToday:      _i(stats['fu_today']),
      overdueFollowUp:    _i(stats['overdue_fu']),
      pipelineValueMonth: _d(stats['active_pipeline']),
      pipelineCount:      _i(stats['pipeline_count'] ?? stats['aktif']),
      wonAmountMonth:     _d(stats['won_amount_month']),
      wonThisMonth:       won,
      lostThisMonth:      lost,
      winRate:            winRate,
      avgDealSize:        avgDeal,
      stageBreakdown:     byStage
          .map((e) => StageCount.fromJson(e as Map<String, dynamic>))
          .toList(),
      weeklyFu:           weeklyFu,
      targetMonth:        _d(j['target_month'] ?? j['stats']?['target_month']),
    );
  }

  static int    _i(dynamic v) => v == null ? 0 : int.tryParse(v.toString()) ?? 0;
  static double _d(dynamic v) => v == null ? 0 : double.tryParse(v.toString()) ?? 0;
}

class StageCount {
  final String stage;
  final int    count;
  final double value;
  const StageCount({required this.stage, required this.count, required this.value});

  // API: { "stage": "On Hold", "jumlah": 7, "total_nilai": "18771000000.0" }
  factory StageCount.fromJson(Map<String, dynamic> j) => StageCount(
    stage: j['stage'] as String? ?? '',
    count: DashboardStats._i(j['jumlah'] ?? j['count']),
    value: DashboardStats._d(j['total_nilai'] ?? j['value']),
  );
}
