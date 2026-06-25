class ContactModel {
  final int     id;
  final String  nama;
  final String? jabatan;
  final String? phone;
  final String? email;
  final String? company;
  final String? leadId;
  final String? notes;
  final String? createdAt;
  final String? foto;

  const ContactModel({
    required this.id,
    required this.nama,
    this.jabatan,
    this.phone,
    this.email,
    this.company,
    this.leadId,
    this.notes,
    this.createdAt,
    this.foto,
  });

  factory ContactModel.fromJson(Map<String, dynamic> j) => ContactModel(
    id:        j['id'] as int,
    nama:      (j['nama_contact'] ?? j['nama']) as String? ?? '',
    jabatan:   j['jabatan'] as String?,
    phone:     (j['no_hp'] ?? j['phone']) as String?,
    email:     j['email'] as String?,
    company:   (j['nama_company'] ?? j['company']) as String?,
    leadId:    j['lead_id'] as String?,
    notes:     (j['catatan'] ?? j['notes']) as String?,
    createdAt: j['created_at'] as String?,
    foto:      j['foto'] as String?,
  );

  /// Inisial untuk avatar
  String get initials {
    final parts = nama.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return nama.isNotEmpty ? nama[0].toUpperCase() : '?';
  }
}
