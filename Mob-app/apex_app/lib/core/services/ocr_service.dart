import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

/// Hasil parsing OCR kartu nama
class BusinessCardResult {
  final String? company;
  final String? name;
  final String? phone;
  final String? email;
  final String? rawText;

  const BusinessCardResult({
    this.company,
    this.name,
    this.phone,
    this.email,
    this.rawText,
  });
}

/// Service OCR on-device untuk scan kartu nama menggunakan Google ML Kit.
class OcrService {
  OcrService._();
  static final OcrService instance = OcrService._();

  final _recognizer = TextRecognizer(script: TextRecognitionScript.latin);

  Future<BusinessCardResult?> scanBusinessCard(String imagePath) async {
    try {
      final inputImage = InputImage.fromFile(File(imagePath));
      final recognized = await _recognizer.processImage(inputImage);
      final text       = recognized.text;

      debugPrint('[OCR] Raw text:\n$text');

      return _parseBusinessCard(text);
    } catch (e) {
      debugPrint('[OCR] Error: $e');
      return null;
    }
  }

  BusinessCardResult _parseBusinessCard(String raw) {
    final lines = raw.split('\n').map((l) => l.trim()).where((l) => l.isNotEmpty).toList();

    String? phone;
    String? email;
    String? company;
    String? name;

    // Regex patterns
    final phoneRe = RegExp(r'(?:\+62|62|0)[\s\-]?(?:\d[\s\-]?){8,12}\d');
    final emailRe = RegExp(r'[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}');
    final urlRe   = RegExp(r'https?://|www\.', caseSensitive: false);
    final corpRe  = RegExp(
      r'\b(?:PT|CV|UD|PD|Tbk|Corp|Inc|Ltd|LLC|Group|International|Indonesia)\b',
      caseSensitive: false,
    );
    final titleRe = RegExp(
      r'\b(?:Manager|Director|CEO|CFO|CTO|Staff|Engineer|Sales|Marketing|HRD|'
      r'Direktur|Manajer|Kepala|Supervisor|Koordinator|Admin|Staf)\b',
      caseSensitive: false,
    );

    for (final line in lines) {
      // Phone
      if (phone == null) {
        final m = phoneRe.firstMatch(line);
        if (m != null) {
          phone = m.group(0)!.replaceAll(RegExp(r'\s'), '');
          continue;
        }
      }

      // Email
      if (email == null) {
        final m = emailRe.firstMatch(line);
        if (m != null) {
          email = m.group(0);
          continue;
        }
      }

      // Skip URLs
      if (urlRe.hasMatch(line)) continue;

      // Company — line dengan kata kunci korporat
      if (company == null && corpRe.hasMatch(line)) {
        company = line;
        continue;
      }

      // Name — baris pendek tanpa angka, bukan judul jabatan, huruf kapital wajar
      if (name == null && !titleRe.hasMatch(line) && !RegExp(r'\d').hasMatch(line) && line.length < 50) {
        name = line;
      }
    }

    // Fallback: company = baris pertama jika belum terisi
    if (company == null && name == null && lines.isNotEmpty) {
      company = lines.first;
    }

    return BusinessCardResult(
      company: company,
      name:    name,
      phone:   phone,
      email:   email,
      rawText: raw,
    );
  }

  void dispose() => _recognizer.close();
}
