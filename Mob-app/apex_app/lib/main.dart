import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/network/api_client.dart';
import 'core/services/offline_service.dart';
import 'core/services/local_notification_service.dart';
import 'core/services/background_location_service.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor:          Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  await initializeDateFormatting('id_ID', null);

  ApiClient.instance.init();
  OfflineService.instance.init();
  await LocalNotificationService.instance.init();
  await BackgroundLocationService.instance.init();

  runApp(const ProviderScope(child: ApexApp()));
}

class ApexApp extends ConsumerWidget {
  const ApexApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title:                    'APEX',
      debugShowCheckedModeBanner: false,
      theme:                    AppTheme.dark,
      routerConfig:             router,
    );
  }
}
