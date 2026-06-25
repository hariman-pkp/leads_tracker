import 'dart:io';
import 'dart:typed_data';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../models/claim_model.dart';

class EntertainRepository {
  final _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> getClaims({
    int tahun = 0,
    int bulan = 0,
    String status = '',
  }) async {
    final res = await _dio.get('/v1/entertain/claims', queryParameters: {
      if (tahun > 0) 'tahun': tahun,
      if (bulan > 0) 'bulan': bulan,
      if (status.isNotEmpty) 'status': status,
    });
    final data = res.data as Map<String, dynamic>;
    return {
      'claims': (data['claims'] as List? ?? [])
          .map((e) => ClaimModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      'summary': data['summary'] as Map<String, dynamic>? ?? {},
      'limit_per_bulan': (data['limit_per_bulan'] as num?)?.toDouble() ?? 0.0,
    };
  }

  Future<Map<String, dynamic>> getClaimDetail(int id) async {
    final res = await _dio.get('/v1/entertain/claims/$id');
    return res.data as Map<String, dynamic>;
  }

  Future<Map<String, dynamic>> createClaim({
    String? leadId,
    required String tglKlaim,
    required String namaKlien,
    String lokasi = '',
    double? lat,
    double? lng,
    required double jumlah,
    String keterangan = '',
  }) async {
    final res = await _dio.post('/v1/entertain/claims', data: {
      if (leadId != null) 'lead_id': leadId,
      'tgl_klaim':  tglKlaim,
      'nama_klien': namaKlien,
      'lokasi':     lokasi,
      if (lat != null) 'lat': lat,
      if (lng != null) 'lng': lng,
      'jumlah':     jumlah,
      'keterangan': keterangan,
    });
    return res.data as Map<String, dynamic>;
  }

  Future<void> uploadPhoto(int claimId, File photo) async {
    final form = FormData.fromMap({
      'photo': await MultipartFile.fromFile(
        photo.path,
        filename: 'foto_${claimId}_${DateTime.now().millisecondsSinceEpoch}.jpg',
      ),
    });
    await _dio.post('/v1/entertain/claims/$claimId/photo', data: form);
  }

  Future<void> uploadPhotoBytes(int claimId, Uint8List bytes, String filename) async {
    final form = FormData.fromMap({
      'photo': MultipartFile.fromBytes(bytes, filename: filename),
    });
    await _dio.post('/v1/entertain/claims/$claimId/photo', data: form);
  }

  Future<void> cancelClaim(int claimId) async {
    await _dio.patch('/v1/entertain/claims/$claimId/cancel');
  }
}
