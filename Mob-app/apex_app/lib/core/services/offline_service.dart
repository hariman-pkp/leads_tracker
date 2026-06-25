import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../network/api_client.dart';

/// Service untuk cache data lokal dan antrian aksi offline.
/// Gunakan [isOnlineNotifier] untuk listen perubahan koneksi di UI.
class OfflineService {
  OfflineService._();
  static final OfflineService instance = OfflineService._();

  static const _cachePrefix = 'apex_cache_';
  static const _queueKey    = 'apex_offline_queue';

  final ValueNotifier<bool> isOnlineNotifier  = ValueNotifier(true);
  final ValueNotifier<bool> isSyncingNotifier = ValueNotifier(false);

  bool get isOnline => isOnlineNotifier.value;

  // ── Connectivity monitoring ──────────────────────────────────────────

  void init() {
    Connectivity().onConnectivityChanged.listen((results) {
      final online = results.any((r) => r != ConnectivityResult.none);
      final wasOffline = !isOnlineNotifier.value;
      isOnlineNotifier.value = online;
      if (online && wasOffline) _flushQueue();
    });
    _checkInitial();
  }

  Future<void> _checkInitial() async {
    final results = await Connectivity().checkConnectivity();
    isOnlineNotifier.value = results.any((r) => r != ConnectivityResult.none);
  }

  // ── Cache read/write ─────────────────────────────────────────────────

  Future<void> saveCache(String key, dynamic data) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      '$_cachePrefix$key',
      jsonEncode({'ts': DateTime.now().toIso8601String(), 'data': data}),
    );
  }

  Future<T?> readCache<T>(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final raw   = prefs.getString('$_cachePrefix$key');
    if (raw == null) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return map['data'] as T?;
    } catch (_) { return null; }
  }

  Future<DateTime?> cacheAge(String key) async {
    final prefs = await SharedPreferences.getInstance();
    final raw   = prefs.getString('$_cachePrefix$key');
    if (raw == null) return null;
    try {
      final map = jsonDecode(raw) as Map<String, dynamic>;
      return DateTime.parse(map['ts'] as String);
    } catch (_) { return null; }
  }

  // ── Offline action queue ─────────────────────────────────────────────

  Future<List<Map<String, dynamic>>> _loadQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final raw   = prefs.getString(_queueKey);
    if (raw == null) return [];
    try {
      return List<Map<String, dynamic>>.from(jsonDecode(raw) as List);
    } catch (_) { return []; }
  }

  Future<void> _saveQueue(List<Map<String, dynamic>> queue) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_queueKey, jsonEncode(queue));
  }

  /// Tambah aksi ke antrian offline.
  /// [method] = 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  Future<void> enqueue({
    required String method,
    required String path,
    Map<String, dynamic>? body,
    String? localRef,
  }) async {
    final queue = await _loadQueue();
    queue.add({
      'id'        : DateTime.now().millisecondsSinceEpoch.toString(),
      'method'    : method,
      'path'      : path,
      'body'      : body,
      'local_ref' : localRef,
      'created_at': DateTime.now().toIso8601String(),
    });
    await _saveQueue(queue);
    debugPrint('[Offline] Enqueued: $method $path');
  }

  Future<int> pendingCount() async {
    return (await _loadQueue()).length;
  }

  /// Flush semua aksi di antrian ke server (dipanggil otomatis saat online).
  Future<void> _flushQueue() async {
    final queue = await _loadQueue();
    if (queue.isEmpty) return;

    isSyncingNotifier.value = true;
    debugPrint('[Offline] Syncing ${queue.length} queued actions...');

    final failed = <Map<String, dynamic>>[];
    for (final action in queue) {
      try {
        final method = action['method'] as String;
        final path   = action['path']   as String;
        final body   = action['body']   as Map<String, dynamic>?;
        switch (method) {
          case 'POST'  : await ApiClient.instance.post(path, data: body); break;
          case 'PUT'   : await ApiClient.instance.put(path, data: body); break;
          case 'PATCH' : await ApiClient.instance.put(path, data: body); break;
          case 'DELETE': await ApiClient.instance.delete(path); break;
        }
        debugPrint('[Offline] Synced: $method $path');
      } catch (e) {
        debugPrint('[Offline] Sync failed: $e — will retry later');
        failed.add(action);
      }
    }

    await _saveQueue(failed);
    isSyncingNotifier.value = false;

    if (failed.isEmpty) {
      debugPrint('[Offline] All actions synced.');
    } else {
      debugPrint('[Offline] ${failed.length} actions failed, will retry next time.');
    }
  }

  /// Trigger manual sync (misal dari pull-to-refresh).
  Future<void> syncNow() async {
    if (!isOnline) return;
    await _flushQueue();
  }

  Future<void> clearCache() async {
    final prefs = await SharedPreferences.getInstance();
    final keys  = prefs.getKeys().where((k) => k.startsWith(_cachePrefix));
    for (final k in keys) await prefs.remove(k);
    await prefs.remove(_queueKey);
  }
}
