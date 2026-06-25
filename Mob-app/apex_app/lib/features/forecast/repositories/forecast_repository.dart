import '../../../core/network/api_client.dart';

class ForecastRepository {
  final _dio = ApiClient.instance.dio;

  Future<Map<String, dynamic>> getForecast(int tahun) async {
    final res = await _dio.get('/v1/pipeline/forecast', queryParameters: {'tahun': tahun});
    return res.data as Map<String, dynamic>;
  }
}
