import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/providers/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/pipeline/screens/pipeline_list_screen.dart';
import '../../features/pipeline/screens/pipeline_detail_screen.dart';
import '../../features/pipeline/screens/pipeline_form_screen.dart';
import '../../features/checkin/screens/checkin_screen.dart';
import '../../features/contacts/screens/contacts_screen.dart';
import '../../features/schedule/screens/schedule_screen.dart';
import '../../features/daily_report/screens/daily_report_screen.dart';
import '../../features/followup/screens/followup_form_screen.dart';
import '../../features/notifications/screens/notifications_screen.dart';
import '../../features/followup/screens/followup_list_screen.dart';
import '../../features/analytics/screens/analytics_screen.dart';
import '../../features/forecast/screens/forecast_screen.dart';
import '../../features/sales_target/screens/sales_target_screen.dart';
import '../../features/entertain/screens/entertain_list_screen.dart';
import '../../features/entertain/screens/entertain_form_screen.dart';
import '../../features/entertain/screens/entertain_detail_screen.dart';
import '../../shared/widgets/main_shell.dart';

final _rootNavigatorKey  = GlobalKey<NavigatorState>(debugLabel: 'root');
final _shellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'shell');

// Listenable wrapper agar GoRouter tidak direkonstruksi ulang saat auth berubah
class _AuthNotifier extends ChangeNotifier {
  _AuthNotifier(this._ref) {
    _ref.listen<AuthState>(authProvider, (_, __) => notifyListeners());
  }
  final Ref _ref;
  AuthStatus get status => _ref.read(authProvider).status;
}

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = _AuthNotifier(ref);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/dashboard',
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final status = authNotifier.status;
      final isAuth = status == AuthStatus.authenticated;
      final isInit = status == AuthStatus.initial || status == AuthStatus.loading;

      if (isInit) return '/splash';
      if (!isAuth && state.matchedLocation != '/login') return '/login';
      if (isAuth  && state.matchedLocation == '/login') return '/dashboard';
      if (isAuth  && state.matchedLocation == '/splash') return '/dashboard';
      return null;
    },
    routes: [
      // ── Splash (ditampilkan saat session sedang di-restore) ───────────
      GoRoute(
        path: '/splash',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const _SplashScreen(),
      ),

      // ── Login (root navigator, no shell) ─────────────────────────────
      GoRoute(
        path: '/login',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const LoginScreen(),
      ),

      // ── Notifications (root navigator, full screen) ───────────────────
      GoRoute(
        path: '/notifications',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const NotificationsScreen(),
      ),

      // ── Follow-Up Hari Ini (root navigator, full screen) ─────────────
      GoRoute(
        path: '/followup-list',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const FollowupListScreen(),
      ),

      // ── Analytics Personal (root navigator, full screen) ─────────────
      GoRoute(
        path: '/analytics',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const AnalyticsScreen(),
      ),

      // ── Forecast & Sales Target ───────────────────────────────────────
      GoRoute(
        path: '/forecast',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const ForecastScreen(),
      ),
      GoRoute(
        path: '/sales-target',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const SalesTargetScreen(),
      ),

      // ── Entertain Claim ──────────────────────────────────────────────────
      GoRoute(
        path: '/entertain',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const EntertainListScreen(),
      ),
      GoRoute(
        path: '/entertain/new',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const EntertainFormScreen(),
      ),
      GoRoute(
        path: '/entertain/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => EntertainDetailScreen(
          claimId: int.parse(state.pathParameters['id']!),
        ),
      ),

      // ── Pipeline detail & form — root navigator agar tidak konflik key
      //    dengan ShellRoute inner navigator (GoRouter 15.x known issue)
      GoRoute(
        path: '/pipeline/new',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, __) => const PipelineFormScreen(leadId: null),
      ),
      GoRoute(
        path: '/pipeline/:leadId/edit',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => PipelineFormScreen(
          leadId: state.pathParameters['leadId'],
        ),
      ),
      GoRoute(
        path: '/pipeline/:leadId/followup',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => FollowupFormScreen(
          leadId:    state.pathParameters['leadId']!,
          leadNama:  state.uri.queryParameters['nama'] ?? '',
          leadPhone: state.uri.queryParameters['phone'],
        ),
      ),
      GoRoute(
        path: '/pipeline/:leadId',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (_, state) => PipelineDetailScreen(
          leadId: state.pathParameters['leadId']!,
        ),
      ),

      // ── Main Shell with bottom nav ───────────────────────────────────
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (_, __) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/pipeline',
            builder: (_, __) => const PipelineListScreen(),
          ),
          GoRoute(
            path: '/checkin',
            builder: (_, __) => const CheckinScreen(),
          ),
          GoRoute(
            path: '/contacts',
            builder: (_, __) => const ContactsScreen(),
          ),
          GoRoute(
            path: '/schedule',
            builder: (_, __) => const ScheduleScreen(),
          ),
          GoRoute(
            path: '/daily-report',
            builder: (_, __) => const DailyReportScreen(),
          ),
        ],
      ),
    ],
  );
});

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF0F172A),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'APEX',
              style: TextStyle(
                color: Color(0xFF3B82F6),
                fontSize: 32,
                fontWeight: FontWeight.w800,
                letterSpacing: 4,
              ),
            ),
            SizedBox(height: 24),
            CircularProgressIndicator(
              color: Color(0xFF3B82F6),
              strokeWidth: 2,
            ),
          ],
        ),
      ),
    );
  }
}
