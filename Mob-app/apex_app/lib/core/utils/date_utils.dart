import 'package:intl/intl.dart';

/// Semua operasi tanggal/waktu menggunakan WIB (UTC+7)
class WibDate {
  WibDate._();

  static const _offsetHours = 7;
  static final _wibOffset   = const Duration(hours: _offsetHours);

  /// Waktu sekarang dalam WIB
  static DateTime now() {
    return DateTime.now().toUtc().add(_wibOffset);
  }

  /// Tengah malam WIB hari ini (untuk perbandingan tanggal)
  static DateTime today() {
    final n = now();
    return DateTime(n.year, n.month, n.day);
  }

  /// Parse string dari API menjadi DateTime WIB.
  /// - String date-only (YYYY-MM-DD): dianggap WIB
  /// - String datetime tanpa offset: dianggap WIB
  /// - String dengan offset/Z: dikonversi ke WIB
  static DateTime parse(String s) {
    if (s.isEmpty) return now();
    try {
      // Date only: YYYY-MM-DD
      if (RegExp(r'^\d{4}-\d{2}-\d{2}$').hasMatch(s)) {
        final d = DateTime.parse(s);
        return DateTime(d.year, d.month, d.day);
      }
      // Has timezone offset or Z
      if (s.contains('Z') || RegExp(r'[+-]\d{2}:?\d{2}$').hasMatch(s)) {
        return DateTime.parse(s).toUtc().add(_wibOffset);
      }
      // No offset — assume WIB
      return DateTime.parse(s);
    } catch (_) {
      return now();
    }
  }

  /// Format tanggal: "8 Jun 2026"
  static String format(String? s, {String fmt = 'd MMM yyyy'}) {
    if (s == null || s.isEmpty) return '—';
    try {
      return DateFormat(fmt, 'id_ID').format(parse(s));
    } catch (_) {
      return s;
    }
  }

  /// Cek apakah tanggal string sudah overdue (sebelum hari ini WIB)
  static bool isOverdue(String? s) {
    if (s == null || s.isEmpty) return false;
    try {
      final d = parse(s);
      final t = today();
      return DateTime(d.year, d.month, d.day).isBefore(t);
    } catch (_) {
      return false;
    }
  }

  /// Cek apakah tanggal string adalah hari ini WIB
  static bool isToday(String? s) {
    if (s == null || s.isEmpty) return false;
    try {
      final d = parse(s);
      final t = today();
      return DateTime(d.year, d.month, d.day) == t;
    } catch (_) {
      return false;
    }
  }

  /// Tanggal relatif: "Hari ini", "Besok", "Kemarin", "3 hari lagi", "5 hari lalu"
  static String relative(String? s) {
    if (s == null || s.isEmpty) return '—';
    try {
      final d    = parse(s);
      final t    = today();
      final dDay = DateTime(d.year, d.month, d.day);
      final diff = dDay.difference(t).inDays;
      if (diff == 0)  return 'Hari ini';
      if (diff == 1)  return 'Besok';
      if (diff == -1) return 'Kemarin';
      if (diff > 0)   return '$diff hari lagi';
      return '${-diff} hari lalu';
    } catch (_) {
      return s;
    }
  }

  /// Format ke YYYY-MM-DD untuk dikirim ke API
  static String toApiDate(DateTime d) =>
      DateFormat('yyyy-MM-dd').format(d);

  /// Tanggal hari ini sebagai string YYYY-MM-DD (WIB)
  static String todayString() => toApiDate(today());
}
