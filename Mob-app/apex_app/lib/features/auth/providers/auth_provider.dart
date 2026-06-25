import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/network/api_client.dart';
import '../../../core/services/location_tracking_service.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';
import '../repositories/auth_repository.dart';

// ── Repository ─────────────────────────────────────────────────────────────
final authRepositoryProvider = Provider<AuthRepository>((_) => AuthRepository());

// ── Auth State ─────────────────────────────────────────────────────────────
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final UserModel? user;
  final String?   errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.user,
    this.errorMessage,
  });

  AuthState copyWith({AuthStatus? status, UserModel? user, String? errorMessage}) =>
      AuthState(
        status:       status       ?? this.status,
        user:         user         ?? this.user,
        errorMessage: errorMessage ?? this.errorMessage,
      );
}

// ── Notifier ───────────────────────────────────────────────────────────────
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState()) {
    ApiClient.onUnauthorized = _handleUnauthorized;
    _tryRestoreSession();
  }

  void _handleUnauthorized() {
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  Future<void> _tryRestoreSession() async {
    state = state.copyWith(status: AuthStatus.loading);
    final user = await _repo.restoreSession();
    if (user != null) {
      state = AuthState(status: AuthStatus.authenticated, user: user);
      LocationTrackingService.instance.refresh();
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final result = await _repo.login(email: email, password: password);
      state = AuthState(status: AuthStatus.authenticated, user: result.user);
      LocationTrackingService.instance.refresh();
    } on Exception catch (e) {
      state = AuthState(
        status: AuthStatus.error,
        errorMessage: _parseError(e),
      );
    }
  }

  /// Digunakan setelah biometric berhasil — restore session dari storage
  Future<void> restoreWithBiometric() async {
    state = state.copyWith(status: AuthStatus.loading);
    final user = await _repo.restoreSession();
    if (user != null) {
      state = AuthState(status: AuthStatus.authenticated, user: user);
      LocationTrackingService.instance.refresh();
    } else {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  Future<void> updateAvatarColor(String hexColor) async {
    await ApiClient.instance.dio.patch(
      '/v1/profile/avatar-color',
      data: {'avatar_color': hexColor},
    );
    final updated = state.user?.copyWith(avatarColor: hexColor);
    if (updated != null) {
      state = state.copyWith(user: updated);
      await SecureStorage.instance.saveUserJson(updated.toJsonString());
    }
  }

  Future<void> uploadAvatarPhoto(XFile xfile) async {
    MultipartFile multipart;
    if (kIsWeb) {
      final bytes = await xfile.readAsBytes();
      multipart = MultipartFile.fromBytes(bytes, filename: xfile.name);
    } else {
      multipart = await MultipartFile.fromFile(xfile.path, filename: xfile.name);
    }

    final res = await ApiClient.instance.dio.post(
      '/v1/profile/avatar-photo',
      data: FormData.fromMap({'photo': multipart}),
    );

    final photoUrl = res.data['avatar_photo'] as String;
    final updated  = state.user?.copyWith(avatarPhoto: photoUrl);
    if (updated != null) {
      state = state.copyWith(user: updated);
      await SecureStorage.instance.saveUserJson(updated.toJsonString());
    }
  }

  Future<void> deleteAvatarPhoto() async {
    await ApiClient.instance.dio.delete('/v1/profile/avatar-photo');
    final updated = state.user?.copyWith(avatarPhoto: null);
    if (updated != null) {
      state = state.copyWith(user: updated);
      await SecureStorage.instance.saveUserJson(updated.toJsonString());
    }
  }

  Future<void> logout() async {
    LocationTrackingService.instance.stop();
    await _repo.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  String _parseError(Exception e) {
    final msg = e.toString();
    if (msg.contains('401') || msg.contains('Unauthorized')) {
      return 'Email atau password salah.';
    }
    if (msg.contains('SocketException') || msg.contains('connection')) {
      return 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});
