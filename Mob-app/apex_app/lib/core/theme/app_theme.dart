import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTheme {
  AppTheme._();

  static ThemeData get dark => _build(
    base:        ThemeData.dark(),
    brightness:  Brightness.dark,
    bg1: AppColors.bg1, bg2: AppColors.bg2, bg3: AppColors.bg3, bg4: AppColors.bg4,
    border:      AppColors.border,
    textPrimary: AppColors.textPrimary,
    textSec:     AppColors.textSecondary,
    textMuted:   AppColors.textMuted,
    statusBar:   Brightness.light,
  );

  static ThemeData get light => _build(
    base:        ThemeData.light(),
    brightness:  Brightness.light,
    bg1: AppColorsLight.bg1, bg2: AppColorsLight.bg2,
    bg3: AppColorsLight.bg3, bg4: AppColorsLight.bg4,
    border:      AppColorsLight.border,
    textPrimary: AppColorsLight.textPrimary,
    textSec:     AppColorsLight.textSecondary,
    textMuted:   AppColorsLight.textMuted,
    statusBar:   Brightness.dark,
  );

  static ThemeData _build({
    required ThemeData  base,
    required Brightness brightness,
    required Color bg1, required Color bg2,
    required Color bg3, required Color bg4,
    required Color border,
    required Color textPrimary, required Color textSec, required Color textMuted,
    required Brightness statusBar,
  }) {
    final textTheme = GoogleFonts.interTextTheme(base.textTheme).apply(
      bodyColor: textPrimary, displayColor: textPrimary,
    );
    return base.copyWith(
      useMaterial3: true,
      colorScheme: ColorScheme(
        brightness:  brightness,
        primary:     AppColors.primary,
        secondary:   AppColors.yellow,
        surface:     bg3,
        error:       AppColors.danger,
        onPrimary:   Colors.white,
        onSecondary: Colors.white,
        onSurface:   textPrimary,
        onError:     Colors.white,
      ),
      scaffoldBackgroundColor: bg1,
      textTheme: textTheme,
      appBarTheme: AppBarTheme(
        backgroundColor: bg2,
        elevation: 0,
        titleTextStyle: GoogleFonts.inter(
          color: textPrimary, fontSize: 16, fontWeight: FontWeight.w600,
        ),
        iconTheme: IconThemeData(color: textPrimary),
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor:          Colors.transparent,
          statusBarIconBrightness: statusBar,
        ),
      ),
      cardTheme: CardThemeData(
        color: bg3, elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: border),
        ),
        margin: EdgeInsets.zero,
      ),
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor:     bg2,
        selectedItemColor:   AppColors.primary,
        unselectedItemColor: textMuted,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true, fillColor: bg4,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: border)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10), borderSide: BorderSide(color: border)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary, width: 1.5)),
        labelStyle:     TextStyle(color: textSec),
        hintStyle:      TextStyle(color: textMuted),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 15),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: AppColors.primary),
      ),
      dividerTheme: DividerThemeData(color: border, space: 1),
      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: bg2,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: bg4,
        labelStyle: TextStyle(color: textSec, fontSize: 12),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
        side: BorderSide(color: border),
      ),
    );
  }
}
