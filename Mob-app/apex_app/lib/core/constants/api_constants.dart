class ApiConstants {
  ApiConstants._();

  static const String baseUrl    = 'https://apex.hariman.online/api-proxy';
  static const String storageUrl = 'https://apex.hariman.online/storage';
  static const String fastApiUrl = 'https://apex.hariman.online/api-proxy';

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
  static const int connectTimeoutMs = 15000;
  static const int receiveTimeoutMs = 20000;
}
