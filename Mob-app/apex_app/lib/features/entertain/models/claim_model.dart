class ClaimModel {
  final int id;
  final String claimNo;
  final int userId;
  final String? leadId;
  final String? leadNama;
  final String salesNama;
  final String tglKlaim;
  final String namaKlien;
  final String lokasi;
  final double? lat;
  final double? lng;
  final double jumlah;
  final String keterangan;
  final String status;
  final String? fotoBukti;
  final bool limitWarning;
  final String? submittedAt;

  const ClaimModel({
    required this.id,
    required this.claimNo,
    required this.userId,
    this.leadId,
    this.leadNama,
    required this.salesNama,
    required this.tglKlaim,
    required this.namaKlien,
    required this.lokasi,
    this.lat,
    this.lng,
    required this.jumlah,
    required this.keterangan,
    required this.status,
    this.fotoBukti,
    required this.limitWarning,
    this.submittedAt,
  });

  factory ClaimModel.fromJson(Map<String, dynamic> j) => ClaimModel(
        id:           (j['id'] as num).toInt(),
        claimNo:      j['claim_no'] as String? ?? '',
        userId:       (j['user_id'] as num).toInt(),
        leadId:       j['lead_id'] as String?,
        leadNama:     j['lead_nama'] as String?,
        salesNama:    j['sales_nama'] as String? ?? '',
        tglKlaim:     j['tgl_klaim'] as String? ?? '',
        namaKlien:    j['nama_klien'] as String? ?? '',
        lokasi:       j['lokasi'] as String? ?? '',
        lat:          (j['lat'] as num?)?.toDouble(),
        lng:          (j['lng'] as num?)?.toDouble(),
        jumlah:       (j['jumlah'] as num?)?.toDouble() ?? 0,
        keterangan:   j['keterangan'] as String? ?? '',
        status:       j['status'] as String? ?? 'Pending',
        fotoBukti:    j['foto_bukti'] as String?,
        limitWarning: j['limit_warning'] == true || j['limit_warning'] == 1,
        submittedAt:  j['submitted_at'] as String?,
      );
}
