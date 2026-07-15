// Model dari /v1/today — leads dengan next_fu_date
class VisitPlanModel {
  final String  leadId;
  final String  namaCompany;
  final String  stage;
  final String  prioritas;
  final String  salesOwner;
  final String? nextFuDate;
  final String  nextFuType; // call | whatsapp | kunjungan | meeting | online
  final String? lastFuNotes;
  final double  proposeValue;
  final int?    daysOverdue;

  const VisitPlanModel({
    required this.leadId,
    required this.namaCompany,
    required this.stage,
    required this.prioritas,
    required this.salesOwner,
    this.nextFuDate,
    required this.nextFuType,
    this.lastFuNotes,
    required this.proposeValue,
    this.daysOverdue,
  });

  bool get isKunjungan => nextFuType == 'kunjungan';

  factory VisitPlanModel.fromJson(Map<String, dynamic> j) => VisitPlanModel(
    leadId:       j['lead_id'] as String? ?? '',
    namaCompany:  j['nama_company'] as String? ?? '',
    stage:        j['stage'] as String? ?? '',
    prioritas:    j['prioritas'] as String? ?? 'Warm',
    salesOwner:   j['sales_owner'] as String? ?? '',
    nextFuDate:   j['next_fu_date'] as String?,
    nextFuType:   j['next_fu_type'] as String? ?? 'call',
    lastFuNotes:  j['last_fu_notes'] as String?,
    proposeValue: (j['propose_value'] ?? 0).toDouble(),
    daysOverdue:  j['days_overdue'] != null
        ? (j['days_overdue'] as num).toInt()
        : null,
  );
}

class TodaySchedule {
  final String               date;
  final List<VisitPlanModel> overdue;
  final List<VisitPlanModel> dueToday;
  final List<VisitPlanModel> upcoming;
  final int                  fuDoneToday;

  const TodaySchedule({
    required this.date,
    required this.overdue,
    required this.dueToday,
    required this.upcoming,
    required this.fuDoneToday,
  });

  factory TodaySchedule.fromJson(Map<String, dynamic> j) => TodaySchedule(
    date:        j['date'] as String? ?? '',
    overdue:     _list(j['overdue']),
    dueToday:    _list(j['due_today']),
    upcoming:    _list(j['upcoming']),
    fuDoneToday: j['fu_done_today'] as int? ?? 0,
  );

  static List<VisitPlanModel> _list(dynamic raw) =>
      (raw as List? ?? [])
          .map((e) => VisitPlanModel.fromJson(e as Map<String, dynamic>))
          .toList();

  // Semua leads (overdue + dueToday + upcoming) untuk marker kalender
  List<VisitPlanModel> get all => [...overdue, ...dueToday, ...upcoming];
}
