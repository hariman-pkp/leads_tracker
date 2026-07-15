import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:intl/intl.dart';

class PhotoStamper {
  /// Tambahkan stamp berisi tanggal, jam, dan lokasi ke pojok kiri bawah foto.
  static Future<Uint8List> stamp({
    required Uint8List imageBytes,
    required DateTime  dateTime,
    required String    address,
    double?            latitude,
    double?            longitude,
  }) async {
    final codec = await ui.instantiateImageCodec(imageBytes);
    final frame = await codec.getNextFrame();
    final src   = frame.image;
    final w     = src.width.toDouble();
    final h     = src.height.toDouble();

    final recorder = ui.PictureRecorder();
    final canvas   = ui.Canvas(recorder, ui.Rect.fromLTWH(0, 0, w, h));

    // Gambar foto asli
    canvas.drawImage(src, ui.Offset.zero, ui.Paint());

    // Bar hitam semi-transparan di bagian bawah
    final barH = (h * 0.14).clamp(60.0, 140.0);
    canvas.drawRect(
      ui.Rect.fromLTWH(0, h - barH, w, barH),
      ui.Paint()..color = const ui.Color(0xCC000000),
    );

    final pad      = w * 0.025;
    final fontSize = (w * 0.038).clamp(12.0, 28.0);

    // Baris 1: tanggal & jam — kuning
    final dtStr = DateFormat('dd MMM yyyy  HH:mm:ss', 'id_ID').format(dateTime);
    _drawText(canvas,
      text:     dtStr,
      offset:   ui.Offset(pad, h - barH + barH * 0.08),
      fontSize: fontSize,
      bold:     true,
      color:    const ui.Color(0xFFFFD600),
      maxWidth: w - pad * 2,
    );

    // Baris 2: alamat — putih
    _drawText(canvas,
      text:     address,
      offset:   ui.Offset(pad, h - barH + barH * 0.42),
      fontSize: fontSize * 0.78,
      bold:     false,
      color:    const ui.Color(0xFFFFFFFF),
      maxWidth: w - pad * 2,
    );

    // Baris 3: koordinat GPS — abu-abu
    if (latitude != null && longitude != null) {
      final coordStr =
          'GPS ${latitude.toStringAsFixed(6)}, ${longitude.toStringAsFixed(6)}';
      _drawText(canvas,
        text:     coordStr,
        offset:   ui.Offset(pad, h - barH + barH * 0.70),
        fontSize: fontSize * 0.65,
        bold:     false,
        color:    const ui.Color(0xFFB0BEC5),
        maxWidth: w - pad * 2,
      );
    }

    final picture = recorder.endRecording();
    final result  = await picture.toImage(src.width, src.height);
    final bd      = await result.toByteData(format: ui.ImageByteFormat.png);
    final png     = bd!.buffer.asUint8List();

    // Web tidak support flutter_image_compress — kembalikan PNG langsung
    if (kIsWeb) return png;

    // Compress PNG → JPEG quality 75, max 1024px untuk kurangi ukuran payload
    final compressed = await FlutterImageCompress.compressWithList(
      png,
      minWidth:  800,
      minHeight: 800,
      quality:   65,
      format:    CompressFormat.jpeg,
    );
    return compressed;
  }

  static void _drawText(
    ui.Canvas canvas, {
    required String   text,
    required ui.Offset offset,
    required double   fontSize,
    required bool     bold,
    required ui.Color color,
    required double   maxWidth,
  }) {
    final painter = ui.ParagraphBuilder(
      ui.ParagraphStyle(
        textDirection: ui.TextDirection.ltr,
        maxLines: 2,
        ellipsis: '…',
      ),
    )
      ..pushStyle(ui.TextStyle(
        color:      color,
        fontSize:   fontSize,
        fontWeight: bold ? ui.FontWeight.bold : ui.FontWeight.normal,
        shadows: [
          ui.Shadow(
            color:  const ui.Color(0xFF000000),
            blurRadius: 4,
            offset: const ui.Offset(1, 1),
          ),
        ],
      ))
      ..addText(text);

    final para = painter.build()
      ..layout(ui.ParagraphConstraints(width: maxWidth));
    canvas.drawParagraph(para, offset);
  }
}
