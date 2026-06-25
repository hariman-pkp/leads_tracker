class DailyReportModel {
  final int     id;
  final int     userId;
  final String? salesNama;
  final String  reportDate;
  final String  status;       // draft | sent
  final int     visitCount;
  final int     fuCount;
  final int     newLeadCount;
  final String? notesObstacle;
  final String? notesPlan;
  final String? mood;         // good | neutral | hard
  final String? sentAt;

  const DailyReportModel({
    required this.id,
    required this.userId,
    this.salesNama,
    required this.reportDate,
    required this.status,
    required this.visitCount,
    required this.fuCount,
    required this.newLeadCount,
    this.notesObstacle,
    this.notesPlan,
    this.mood,
    this.sentAt,
  });

  bool get isDraft => status == 'draft';
  bool get isSent  => status == 'sent';

  factory DailyReportModel.fromJson(Map<String, dynamic> j) => DailyReportModel(
    id:            j['id'] as int,
    userId:        j['user_id'] as int,
    salesNama:     j['sales_nama'] as String?,
    reportDate:    j['report_date'] as String? ?? '',
    status:        j['status'] as String? ?? 'draft',
    visitCount:    j['visit_count'] as int? ?? 0,
    fuCount:       j['fu_count'] as int? ?? 0,
    newLeadCount:  j['new_lead_count'] as int? ?? 0,
    notesObstacle: j['notes_obstacle'] as String?,
    notesPlan:     j['notes_plan'] as String?,
    mood:          j['mood'] as String?,
    sentAt:        j['sent_at'] as String?,
  );
}

class AutoSummary {
  final String date;
  final int    visitCount;
  final int    fuCount;
  final int    newLeadCount;
  final List<Map<String, dynamic>> visitDetails;

  const AutoSummary({
    required this.date,
    required this.visitCount,
    required this.fuCount,
    required this.newLeadCount,
    required this.visitDetails,
  });

  factory AutoSummary.fromJson(Map<String, dynamic> j) => AutoSummary(
    date:          j['date'] as String? ?? '',
    visitCount:    j['visit_count'] as int? ?? 0,
    fuCount:       j['fu_count'] as int? ?? 0,
    newLeadCount:  j['new_lead_count'] as int? ?? 0,
    visitDetails:  (j['visit_details'] as List? ?? [])
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList(),
  );
}
