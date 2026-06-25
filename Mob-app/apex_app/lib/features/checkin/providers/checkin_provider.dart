import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/visit_model.dart';
import '../repositories/checkin_repository.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/utils/location_service.dart';

final checkinRepositoryProvider =
    Provider<CheckinRepository>((_) => CheckinRepository());

// Riwayat kunjungan hari ini (hanya milik user login)
final todayVisitsProvider =
    FutureProvider<List<VisitModel>>((ref) {
  final userId = ref.watch(authProvider).user?.id;
  return ref.read(checkinRepositoryProvider).fetchToday(userId: userId);
});

// Active check-in (visit yang belum checkout)
final activeVisitProvider = Provider<AsyncValue<VisitModel?>>((ref) {
  return ref.watch(todayVisitsProvider).whenData(
    (visits) => visits.where((v) => v.isCheckedIn).firstOrNull,
  );
});

// State untuk proses check-in/out
enum CheckinStatus { idle, loading, success, error }

class CheckinState {
  final CheckinStatus status;
  final String?       errorMessage;
  const CheckinState({this.status = CheckinStatus.idle, this.errorMessage});
}

class CheckinNotifier extends StateNotifier<CheckinState> {
  final CheckinRepository _repo;
  final Ref _ref;

  CheckinNotifier(this._repo, this._ref) : super(const CheckinState());

  Future<void> checkIn({
    required double latitude,
    required double longitude,
    required String address,
    String? leadId,
    String? notes,
    String? photoBase64,
  }) async {
    state = const CheckinState(status: CheckinStatus.loading);
    try {
      final userId = _ref.read(authProvider).user?.id;
      await _repo.checkIn(
        userId:      userId,
        latitude:    latitude,
        longitude:   longitude,
        address:     address,
        leadId:      leadId,
        notes:       notes,
        photoBase64: photoBase64,
      );
      _ref.invalidate(todayVisitsProvider);
      state = const CheckinState(status: CheckinStatus.success);
    } catch (e) {
      state = CheckinState(
        status: CheckinStatus.error,
        errorMessage: 'Check-in gagal: ${e.toString()}',
      );
    }
  }

  Future<void> checkOut(int visitId, {String? notes}) async {
    state = const CheckinState(status: CheckinStatus.loading);
    try {
      // Ambil koordinat GPS saat checkout (best-effort, tidak wajib)
      double? lat, lng;
      try {
        final pos = await LocationService.instance.getCurrentLocation();
        lat = pos.latitude;
        lng = pos.longitude;
      } catch (_) {}

      await _repo.checkOut(visitId,
        notes: notes, latitude: lat, longitude: lng);
      _ref.invalidate(todayVisitsProvider);
      state = const CheckinState(status: CheckinStatus.success);
    } catch (e) {
      state = CheckinState(
        status: CheckinStatus.error,
        errorMessage: 'Check-out gagal: ${e.toString()}',
      );
    }
  }

  void reset() => state = const CheckinState();
}

final checkinNotifierProvider =
    StateNotifierProvider<CheckinNotifier, CheckinState>((ref) {
  return CheckinNotifier(ref.read(checkinRepositoryProvider), ref);
});
