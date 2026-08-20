class PlanLead {
  final String  leadId;
  final String  namaCompany;
  final String  stage;
  final String  prioritas;
  final String  salesOwner;
  final String? product;
  final String? nextFuDate;
  final String  nextFuType;
  final String? lastFuNotes;
  final double  proposeValue;
  final int?    daysOverdue;

  const PlanLead({
    required this.leadId,
    required this.namaCompany,
    required this.stage,
    required this.prioritas,
    required this.salesOwner,
    this.product,
    this.nextFuDate,
    required this.nextFuType,
    this.lastFuNotes,
    required this.proposeValue,
    this.daysOverdue,
  });

  factory PlanLead.fromJson(Map<String, dynamic> j) => PlanLead(
    leadId:       j['lead_id']       as String? ?? '',
    namaCompany:  j['nama_company']  as String? ?? '',
    stage:        j['stage']         as String? ?? '',
    prioritas:    j['prioritas']     as String? ?? 'Warm',
    salesOwner:   j['sales_owner']   as String? ?? '',
    product:      j['product']       as String?,
    nextFuDate:   j['next_fu_date']  as String?,
    nextFuType:   j['next_fu_type']  as String? ?? 'call',
    lastFuNotes:  j['last_fu_notes'] as String?,
    proposeValue: double.tryParse(j['propose_value']?.toString() ?? '0') ?? 0.0,
    daysOverdue:  j['days_overdue'] != null
        ? (j['days_overdue'] as num).toInt()
        : null,
  );

  PlanLead copyWith({String? nextFuDate, String? nextFuType}) => PlanLead(
    leadId:       leadId,
    namaCompany:  namaCompany,
    stage:        stage,
    prioritas:    prioritas,
    salesOwner:   salesOwner,
    product:      product,
    nextFuDate:   nextFuDate ?? this.nextFuDate,
    nextFuType:   nextFuType ?? this.nextFuType,
    lastFuNotes:  lastFuNotes,
    proposeValue: proposeValue,
    daysOverdue:  daysOverdue,
  );
}

class WeekPlanData {
  final String             weekStart;
  final String             weekEnd;
  final String             today;
  final List<PlanLead>     unscheduled;
  final List<PlanLead>     overdue;
  final Map<String, List<PlanLead>> byDate;

  const WeekPlanData({
    required this.weekStart,
    required this.weekEnd,
    required this.today,
    required this.unscheduled,
    required this.overdue,
    required this.byDate,
  });

  factory WeekPlanData.fromJson(Map<String, dynamic> j) {
    final raw = j['by_date'];
    final byDateRaw = (raw is Map) ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
    final byDate = byDateRaw.map((k, v) => MapEntry(
      k,
      (v as List).map((e) => PlanLead.fromJson(e as Map<String, dynamic>)).toList(),
    ));
    return WeekPlanData(
      weekStart:   j['week_start']  as String? ?? '',
      weekEnd:     j['week_end']    as String? ?? '',
      today:       j['today']       as String? ?? '',
      unscheduled: (j['unscheduled'] as List? ?? [])
          .map((e) => PlanLead.fromJson(e as Map<String, dynamic>)).toList(),
      overdue:     (j['overdue'] as List? ?? [])
          .map((e) => PlanLead.fromJson(e as Map<String, dynamic>)).toList(),
      byDate:      byDate,
    );
  }
}
