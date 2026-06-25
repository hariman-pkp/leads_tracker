class ApiConstants {
  ApiConstants._();

  // Ganti dengan IP server saat deploy ke device fisik
  // Untuk simulator/emulator lokal gunakan:
  //   Android emulator: 10.0.2.2
  //   iOS simulator: 127.0.0.1
  // static const String baseUrl = 'http://192.168.1.6:8002/api';
  static const String baseUrl = 'http://localhost:8002/api';

  // Base URL untuk static files (foto, upload) — FastAPI port 8001
  static String get storageUrl =>
      baseUrl.replaceFirst(RegExp(r':\d+/api$'), ':8001/storage');

  // Base API URL FastAPI port 8001 — untuk endpoint yang belum ada di proxy 8002
  static String get fastApiUrl =>
      baseUrl.replaceFirst(RegExp(r':\d+/api$'), ':8001/api');

  // Auth
  static const String login           = '/v1/auth/login';
  static const String me              = '/v1/auth/me';
  static const String changePassword  = '/v1/auth/change-password';
  static const String forgotPassword  = '/v1/auth/forgot-password';
  static const String resetPassword   = '/v1/auth/reset-password';

  // Dashboard
  static const String dashboard = '/v1/dashboard';

  // Pipeline
  static const String pipeline = '/v1/pipeline';

  // Follow-up
  static const String followup = '/v1/followup';

  // Field Activity (Check-in/out)
  static const String fieldActivity        = '/v1/field-activity';
  static const String fieldActivityCheckin = '/v1/field-activity/checkin';

  // Contacts
  static const String contacts = '/v1/contacts';

  // Daily Report
  static const String dailyReport        = '/v1/daily-report';
  static const String dailyReportSummary = '/v1/daily-report/summary';
  static const String dailyReportTeam    = '/v1/daily-report/team';

  // Notifications
  static const String notifications            = '/v1/notifications';
  static const String notificationsUnreadCount = '/v1/notifications/unread-count';

  // Location
  static const String location       = '/v1/location';
  static const String locationMe     = '/v1/location/me';
  static const String locationTeam   = '/v1/location/team';

  // Entertainment Claim
  static const String entertainClaims = '/v1/entertain/claims';

  // Timeouts
  static const int connectTimeoutMs = 10000;
  static const int receiveTimeoutMs = 15000;
}
