import 'package:flutter/foundation.dart';
import 'package:speech_to_text/speech_to_text.dart';

/// Service speech-to-text untuk voice note.
/// `speech_to_text` sudah handle permission mikrofon secara internal.
class VoiceNoteService {
  VoiceNoteService._();
  static final VoiceNoteService instance = VoiceNoteService._();

  final SpeechToText _stt   = SpeechToText();
  bool _initialized          = false;
  bool _available            = false;

  bool get isListening => _stt.isListening;

  Future<bool> initialize() async {
    if (_initialized) return _available;
    _available = await _stt.initialize(
      onError: (e) => debugPrint('[Voice] STT error: ${e.errorMsg}'),
      onStatus: (s) => debugPrint('[Voice] STT status: $s'),
    );
    _initialized = true;
    debugPrint('[Voice] STT available: $_available');
    return _available;
  }

  /// Mulai mendengarkan. [onResult] dipanggil setiap ada perubahan teks.
  Future<bool> startListening({
    required void Function(String text, bool isFinal) onResult,
  }) async {
    final ready = await initialize();
    if (!ready) return false;
    if (_stt.isListening) await _stt.stop();

    await _stt.listen(
      onResult: (r) => onResult(r.recognizedWords, r.finalResult),
      localeId: 'id_ID',
      listenMode: ListenMode.dictation,
      cancelOnError: false,
      partialResults: true,
      listenFor: const Duration(minutes: 2),
      pauseFor: const Duration(seconds: 4),
    );
    return true;
  }

  Future<void> stopListening() async {
    if (_stt.isListening) await _stt.stop();
  }

  Future<void> cancel() async {
    if (_stt.isListening) await _stt.cancel();
  }
}
