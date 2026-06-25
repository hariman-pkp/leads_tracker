class VisitModel {
  final int     id;
  final String? leadId;
  final String? leadNama;
  final String  address;
  final double  latitude;
  final double  longitude;
  final String  type;          // check_in | check_out
  final String  checkedInAt;
  final String? checkedOutAt;
  final int?    durationMinutes;
  final String? notes;

  const VisitModel({
    required this.id,
    this.leadId,
    this.leadNama,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.type,
    required this.checkedInAt,
    this.checkedOutAt,
    this.durationMinutes,
    this.notes,
  });

  bool get isCheckedIn => type == 'check_in' && checkedOutAt == null;

  factory VisitModel.fromJson(Map<String, dynamic> j) => VisitModel(
    id:              j['id'] as int,
    leadId:          j['lead_id'] as String?,
    leadNama:        j['lead_nama'] as String?,
    address:         j['address'] as String? ?? '',
    latitude:        double.tryParse(j['latitude']?.toString() ?? '0') ?? 0,
    longitude:       double.tryParse(j['longitude']?.toString() ?? '0') ?? 0,
    type:            j['type'] as String? ?? 'check_in',
    checkedInAt:     j['checked_in_at'] as String? ?? '',
    checkedOutAt:    j['checked_out_at'] as String?,
    durationMinutes: j['duration_minutes'] as int?,
    notes:           j['notes'] as String?,
  );
}
