import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../models/daily_report_model.dart';

class DailyReportRepository {
  final _api = ApiClient.instance;

  Future<AutoSummary> fetchSummary({String? date}) async {
    final res = await _api.get(
      ApiConstants.dailyReportSummary,
      params: {if (date != null) 'date': date},
    );
    return AutoSummary.fromJson(res.data as Map<String, dynamic>);
  }

  Future<List<DailyReportModel>> fetchReports({String? month}) async {
    final res = await _api.get(
      ApiConstants.dailyReport,
      params: {if (month != null) 'month': month, 'limit': 30},
    );
    final data = res.data as Map<String, dynamic>;
    return (data['reports'] as List? ?? [])
        .map((e) => DailyReportModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<int> createReport(Map<String, dynamic> data) async {
    try {
      final res  = await _api.post(ApiConstants.dailyReport, data: data);
      final body = res.data as Map<String, dynamic>;
      return body['report_id'] as int;
    } on DioException catch (e) {
      // Laporan hari ini sudah ada — kembalikan report_id yang existing
      if (e.response?.statusCode == 422) {
        final body = e.response?.data as Map<String, dynamic>?;
        final existingId = body?['report_id'] as int?;
        if (existingId != null) return existingId;
      }
      rethrow;
    }
  }

  Future<void> updateReport(int id, Map<String, dynamic> data) async {
    await _api.put('${ApiConstants.dailyReport}/$id', data: data);
  }

  Future<void> sendReport(int id, {double? lat, double? lng, String? address}) async {
    try {
      await _api.post('${ApiConstants.dailyReport}/$id/send', data: {
        'latitude':  lat,
        'longitude': lng,
        'address':   address,
      });
    } on DioException catch (e) {
      // 422 = sudah pernah dikirim, abaikan
      if (e.response?.statusCode != 422) rethrow;
    }
  }
}
