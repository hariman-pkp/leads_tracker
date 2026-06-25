class FollowupModel {
  final int     id;
  final String  leadId;
  final String  salesOwner;
  final String  tglFu;
  final String  metodeFu;   // call | whatsapp | email | visit | meeting
  final String? hasilFu;
  final String? nextAction;
  final String? nextDate;
  final String? createdAt;

  const FollowupModel({
    required this.id,
    required this.leadId,
    required this.salesOwner,
    required this.tglFu,
    required this.metodeFu,
    this.hasilFu,
    this.nextAction,
    this.nextDate,
    this.createdAt,
  });

  factory FollowupModel.fromJson(Map<String, dynamic> j) => FollowupModel(
    id:          j['id'] as int,
    leadId:      j['lead_id'] as String? ?? '',
    salesOwner:  j['sales_owner'] as String? ?? '',
    tglFu:       j['tgl_fu'] as String? ?? '',
    metodeFu:    j['metode_fu'] as String? ?? 'call',
    hasilFu:     j['hasil_fu'] as String?,
    nextAction:  j['next_action'] as String?,
    nextDate:    (j['tgl_fu_berikut'] ?? j['next_date']) as String?,
    createdAt:   j['created_at'] as String?,
  );
}
