import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/entertain_repository.dart';

final _repo = EntertainRepository();

// Filter state
final entertainFilterProvider = StateProvider<Map<String, dynamic>>(
  (_) => {'tahun': DateTime.now().year, 'bulan': 0, 'status': ''},
);

// Claims list
final entertainClaimsProvider = FutureProvider.autoDispose
    .family<Map<String, dynamic>, Map<String, dynamic>>((ref, filter) async {
  return _repo.getClaims(
    tahun:  filter['tahun'] as int,
    bulan:  filter['bulan'] as int,
    status: filter['status'] as String,
  );
});

// Claim detail
final claimDetailProvider =
    FutureProvider.autoDispose.family<Map<String, dynamic>, int>((ref, id) async {
  return _repo.getClaimDetail(id);
});

// Notifier for create/cancel actions
class EntertainNotifier extends StateNotifier<AsyncValue<void>> {
  EntertainNotifier() : super(const AsyncData(null));

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
    state = const AsyncLoading();
    try {
      final result = await _repo.createClaim(
        leadId:     leadId,
        tglKlaim:   tglKlaim,
        namaKlien:  namaKlien,
        lokasi:     lokasi,
        lat:        lat,
        lng:        lng,
        jumlah:     jumlah,
        keterangan: keterangan,
      );
      state = const AsyncData(null);
      return result;
    } catch (e, s) {
      state = AsyncError(e, s);
      rethrow;
    }
  }

  Future<void> cancelClaim(int id) async {
    state = const AsyncLoading();
    try {
      await _repo.cancelClaim(id);
      state = const AsyncData(null);
    } catch (e, s) {
      state = AsyncError(e, s);
      rethrow;
    }
  }
}

final entertainNotifierProvider =
    StateNotifierProvider.autoDispose<EntertainNotifier, AsyncValue<void>>(
  (_) => EntertainNotifier(),
);
