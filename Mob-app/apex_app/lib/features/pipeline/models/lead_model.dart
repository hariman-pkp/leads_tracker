class LeadModel {
  final String  leadId;
  final String  namaCompany;
  final String  contactPerson;
  final String? phone;
  final String? email;
  final String  stage;
  final String  salesOwner;
  final String? product;
  final double? dealValue;
  final double? proposeValue;
  final String? tglMasuk;
  final String? tglFu;
  final String? notes;
  final String? organisasi;
  final String? lossReason;

  const LeadModel({
    required this.leadId,
    required this.namaCompany,
    required this.contactPerson,
    this.phone,
    this.email,
    required this.stage,
    required this.salesOwner,
    this.product,
    this.dealValue,
    this.proposeValue,
    this.tglMasuk,
    this.tglFu,
    this.notes,
    this.organisasi,
    this.lossReason,
  });

  factory LeadModel.fromJson(Map<String, dynamic> j) {
    return LeadModel(
      leadId:        (j['lead_id'] ?? j['id'])?.toString() ?? '',
      namaCompany:   j['nama_company'] as String? ?? '',
      contactPerson: j['contact_person'] as String? ?? '',
      phone:         j['phone'] as String?,
      email:         j['email'] as String?,
      stage:         j['stage'] as String? ?? '',
      salesOwner:    j['sales_owner'] as String? ?? '',
      product:       j['product'] as String?,
      dealValue:     j['deal_value'] == null
          ? null
          : double.tryParse(j['deal_value'].toString()),
      proposeValue:  j['propose_value'] == null
          ? null
          : double.tryParse(j['propose_value'].toString()),
      tglMasuk:      j['tgl_masuk'] as String?,
      tglFu:         (j['next_fu_date'] ?? j['tgl_fu']) as String?,
      notes:         (j['last_fu_notes'] ?? j['notes']) as String?,
      organisasi:    j['organisasi'] as String?,
      lossReason:    j['loss_reason'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'nama_company':   namaCompany,
    'contact_person': contactPerson,
    if (phone != null)      'phone':       phone,
    if (email != null)      'email':       email,
    'stage':          stage,
    if (product != null)    'product':     product,
    if (dealValue != null)  'deal_value':  dealValue,
    if (tglFu != null)      'tgl_fu':      tglFu,
    if (notes != null)      'notes':       notes,
    if (organisasi != null) 'organisasi':  organisasi,
    if (lossReason != null) 'loss_reason': lossReason,
  };
}
