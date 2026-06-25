import '../../../core/network/api_client.dart';

class SalesTargetRepository {
  final _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> getTargets(int tahun) async {
    final res = await _dio.get('/v1/sales-targets', queryParameters: {'tahun': tahun});
    return res.data as Map<String, dynamic>;
  }

  Future<void> upsertTarget({
    required String salesNama,
    required int tahun,
    required int bulan,
    required double targetDeal,
  }) async {
    await _dio.post('/v1/sales-targets', data: {
      'sales_nama': salesNama,
      'tahun': tahun,
      'bulan': bulan,
      'target_deal': targetDeal,
    });
  }
}
