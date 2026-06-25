import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/forecast_repository.dart';

final forecastRepositoryProvider = Provider((_) => ForecastRepository());

final forecastProvider = FutureProvider.family<Map<String, dynamic>, int>((ref, tahun) {
  return ref.read(forecastRepositoryProvider).getForecast(tahun);
});
