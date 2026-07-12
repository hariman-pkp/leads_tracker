class VisitPlanModel {
  final int     id;
  final int     userId;
  final String? salesNama;
  final String? leadId;
  final String? leadNama;
  final String  plannedDate;
  final String? plannedTime;
  final String? notes;
  final String  status; // planned | done | cancelled
  final int?    visitLogId;

  const VisitPlanModel({
    required this.id,
    required this.userId,
    this.salesNama,
    this.leadId,
    this.leadNama,
    required this.plannedDate,
    this.plannedTime,
    this.notes,
    required this.status,
    this.visitLogId,
  });

  bool get isPlanned   => status == 'planned';
  bool get isDone      => status == 'done';
  bool get isCancelled => status == 'cancelled';

  factory VisitPlanModel.fromJson(Map<String, dynamic> j) => VisitPlanModel(
    id:          j['id'] as int,
    userId:      j['user_id'] as int,
    salesNama:   j['sales_nama'] as String?,
    leadId:      j['lead_id'] as String?,
    leadNama:    j['lead_nama'] as String?,
    plannedDate: j['planned_date'] as String? ?? '',
    plannedTime: j['planned_time'] as String?,
    notes:       j['notes'] as String?,
    status:      j['status'] as String? ?? 'planned',
    visitLogId:  j['visit_log_id'] as int?,
  );
}
