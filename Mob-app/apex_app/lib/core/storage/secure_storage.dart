import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  SecureStorage._();
  static final SecureStorage instance = SecureStorage._();

  static final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    webOptions: WebOptions(dbName: 'apex_secure', publicKey: 'apex_key'),
  );

  static const _keyToken      = 'apex_jwt_token';
  static const _keyUserJson   = 'apex_user_json';
  static const _keySavedEmail = 'apex_saved_email';

  Future<void> saveToken(String token) =>
      _storage.write(key: _keyToken, value: token);

  Future<String?> getToken() =>
      _storage.read(key: _keyToken);

  Future<void> saveUserJson(String json) =>
      _storage.write(key: _keyUserJson, value: json);

  Future<String?> getUserJson() =>
      _storage.read(key: _keyUserJson);

  Future<void> saveSavedEmail(String email) =>
      _storage.write(key: _keySavedEmail, value: email);

  Future<String?> getSavedEmail() =>
      _storage.read(key: _keySavedEmail);

  Future<void> clearSavedEmail() =>
      _storage.delete(key: _keySavedEmail);

  Future<void> clear() => _storage.deleteAll();
}
