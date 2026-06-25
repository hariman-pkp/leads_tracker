class NotificationModel {
  final int     id;
  final String  type;
  final String  title;
  final String  body;
  final String? leadId;
  final String? leadNama;
  final String? senderNama;
  final String? readAt;
  final String  createdAt;
  final int?    claimId;
  final String? claimNo;
  final String? claimStatus;

  const NotificationModel({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    this.leadId,
    this.leadNama,
    this.senderNama,
    this.readAt,
    required this.createdAt,
    this.claimId,
    this.claimNo,
    this.claimStatus,
  });

  bool get isUnread   => readAt == null;
  bool get isApproval => type == 'approval';
  bool get canApprove => isApproval && claimStatus == 'Pending';

  factory NotificationModel.fromJson(Map<String, dynamic> j) => NotificationModel(
    id:          j['id'] as int,
    type:        j['type'] as String? ?? 'info',
    title:       j['title'] as String? ?? '',
    body:        j['body'] as String? ?? '',
    leadId:      j['lead_id'] as String?,
    leadNama:    j['lead_nama'] as String?,
    senderNama:  j['sender_nama'] as String?,
    readAt:      j['read_at'] as String?,
    createdAt:   j['created_at'] as String? ?? '',
    claimId:     j['claim_id'] as int?,
    claimNo:     j['claim_no'] as String?,
    claimStatus: j['claim_status'] as String?,
  );
}
