import '../../../core/network/api_client.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/storage/secure_storage.dart';
import '../models/user_model.dart';

class AuthRepository {
  final _api = ApiClient.instance;

  Future<({String token, UserModel user})> login({
    required String email,
    required String password,
  }) async {
    final res = await _api.post(ApiConstants.login, data: {
      'email':    email,
      'password': password,
    });

    final data  = res.data as Map<String, dynamic>;
    final token = (data['access_token'] ?? data['token']) as String;
    final user  = UserModel.fromJson(data['user'] as Map<String, dynamic>);

    await SecureStorage.instance.saveToken(token);
    await SecureStorage.instance.saveUserJson(user.toJsonString());

    return (token: token, user: user);
  }

  Future<UserModel?> restoreSession() async {
    final json = await SecureStorage.instance.getUserJson();
    return UserModel.fromJsonString(json);
  }

  Future<void> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    await _api.put(ApiConstants.changePassword, data: {
      'current_password': currentPassword,
      'new_password':     newPassword,
    });
  }

  Future<void> logout() async {
    await SecureStorage.instance.clear();
  }

  Future<void> forgotPassword(String email) async {
    await _api.post(ApiConstants.forgotPassword, data: {'email': email});
  }

  Future<void> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    await _api.post(ApiConstants.resetPassword, data: {
      'email':        email,
      'otp':          otp,
      'new_password': newPassword,
    });
  }
}
