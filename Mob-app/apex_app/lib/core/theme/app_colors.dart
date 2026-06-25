import 'package:flutter/material.dart';

/// PKP Brand Colors — matches web APEX dark theme
class AppColors {
  AppColors._();

  // ── Brand ──────────────────────────────────────────────────────────────
  static const primary   = Color(0xFF29ABE2); // PKP Blue
  static const primaryDk = Color(0xFF0E87BF); // Darker Blue
  static const yellow    = Color(0xFFF7B731); // PKP Yellow
  static const danger    = Color(0xFFE74C3C);
  static const success   = Color(0xFF2ECC71);
  static const warning   = Color(0xFFF39C12);

  // ── Dark Background Layers ─────────────────────────────────────────────
  static const bg1 = Color(0xFF0F1923); // deepest
  static const bg2 = Color(0xFF162032);
  static const bg3 = Color(0xFF1E2D40);
  static const bg4 = Color(0xFF243447); // card surface

  // ── Text ───────────────────────────────────────────────────────────────
  static const textPrimary   = Color(0xFFE8F4FD);
  static const textSecondary = Color(0xFF8BA3B8);
  static const textMuted     = Color(0xFF4A6278);

  // ── Border / Divider ───────────────────────────────────────────────────
  static const border = Color(0xFF243447);

  // ── Pipeline Stage Colors ──────────────────────────────────────────────
  static const stageProspect   = Color(0xFF5B8DEF);
  static const stageQualified  = Color(0xFF29ABE2);
  static const stageProposal   = Color(0xFFF7B731);
  static const stageNegotiation= Color(0xFFE67E22);
  static const stageWon        = Color(0xFF2ECC71);
  static const stageLost       = Color(0xFFE74C3C);

  // ── Gradient ───────────────────────────────────────────────────────────
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryDk, primary],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}

/// Light theme palette
class AppColorsLight {
  AppColorsLight._();

  static const bg1 = Color(0xFFDDE3EC); // page background
  static const bg2 = Color(0xFFEDF1F7); // surface / card
  static const bg3 = Color(0xFFE4EAF2); // elevated card
  static const bg4 = Color(0xFFD4DBE7); // input fill

  static const border = Color(0xFF5A6A82); // strong border

  static const textPrimary   = Color(0xFF0D1520); // near black
  static const textSecondary = Color(0xFF253040);
  static const textMuted     = Color(0xFF3D4F66);
}
