import 'package:flutter/material.dart';
import '../../core/services/voice_note_service.dart';
import '../../core/theme/app_colors.dart';

/// Text field dengan tombol mikrofon untuk voice-to-text.
class VoiceNoteField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;

  const VoiceNoteField({
    super.key,
    required this.controller,
    this.hint = 'Tambahkan catatan...',
    this.maxLines = 4,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        TextFormField(
          controller: controller,
          maxLines: maxLines,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            alignLabelWithHint: true,
            contentPadding: const EdgeInsets.fromLTRB(16, 12, 48, 12),
          ),
        ),
        Positioned(
          right: 4,
          bottom: 4,
          child: Tooltip(
            message: 'Rekam voice note',
            child: IconButton(
              icon: const Icon(Icons.mic_outlined),
              color: AppColors.primary,
              iconSize: 22,
              onPressed: () => _showRecordSheet(context),
            ),
          ),
        ),
      ],
    );
  }

  void _showRecordSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _RecordSheet(
        onTranscribed: (text) {
          final current = controller.text;
          controller.text = current.isEmpty ? text : '$current $text';
          controller.selection = TextSelection.fromPosition(
            TextPosition(offset: controller.text.length),
          );
        },
      ),
    );
  }
}

// ── Recording Sheet ───────────────────────────────────────────────────────────

enum _RecordState { idle, initializing, recording, done, unavailable }

class _RecordSheet extends StatefulWidget {
  final void Function(String text) onTranscribed;
  const _RecordSheet({required this.onTranscribed});

  @override
  State<_RecordSheet> createState() => _RecordSheetState();
}

class _RecordSheetState extends State<_RecordSheet> {
  final _svc = VoiceNoteService.instance;

  _RecordState _state    = _RecordState.idle;
  String       _text     = '';

  @override
  void dispose() {
    _svc.cancel();
    super.dispose();
  }

  Future<void> _startRecording() async {
    setState(() => _state = _RecordState.initializing);

    final started = await _svc.startListening(
      onResult: (text, isFinal) {
        if (!mounted) return;
        setState(() {
          _text = text;
          if (isFinal && text.isNotEmpty) {
            _state = _RecordState.done;
          }
        });
      },
    );

    if (!mounted) return;

    if (!started) {
      setState(() => _state = _RecordState.unavailable);
      return;
    }

    setState(() => _state = _RecordState.recording);
  }

  Future<void> _stopRecording() async {
    await _svc.stopListening();
    if (!mounted) return;
    setState(() => _state = _RecordState.done);
  }

  void _use() {
    if (_text.isNotEmpty) widget.onTranscribed(_text);
    Navigator.of(context).pop();
  }

  void _retry() {
    setState(() { _state = _RecordState.idle; _text = ''; });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
          24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle bar
          Container(width: 36, height: 4, decoration: BoxDecoration(
              color: AppColors.border, borderRadius: BorderRadius.circular(2))),
          const SizedBox(height: 20),
          const Text('Voice Note', style: TextStyle(
            color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700,
          )),
          const SizedBox(height: 20),

          // Transcript display
          Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: 80, maxHeight: 160),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.bg4,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: SingleChildScrollView(
              child: Text(
                _transcriptLabel(),
                style: TextStyle(
                  color: _text.isEmpty ? AppColors.textMuted : AppColors.textPrimary,
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
            ),
          ),

          const SizedBox(height: 24),
          _buildControls(),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  String _transcriptLabel() {
    switch (_state) {
      case _RecordState.idle:         return 'Ketuk mikrofon untuk mulai merekam';
      case _RecordState.initializing: return 'Meminta izin mikrofon...';
      case _RecordState.recording:    return _text.isEmpty ? 'Mendengarkan...' : _text;
      case _RecordState.done:         return _text.isEmpty ? 'Tidak ada teks terdeteksi' : _text;
      case _RecordState.unavailable:  return 'Speech recognition tidak tersedia di perangkat ini';
    }
  }

  Widget _buildControls() {
    switch (_state) {
      case _RecordState.unavailable:
        return OutlinedButton(
          onPressed: () => Navigator.of(context).pop(),
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.textSecondary,
            side: const BorderSide(color: AppColors.border),
            minimumSize: const Size(double.infinity, 46),
          ),
          child: const Text('Tutup'),
        );

      case _RecordState.done:
        return Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _retry,
                icon: const Icon(Icons.refresh, size: 16),
                label: const Text('Rekam ulang'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.textSecondary,
                  side: const BorderSide(color: AppColors.border),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _text.isEmpty ? null : _use,
                icon: const Icon(Icons.check, size: 16),
                label: const Text('Gunakan teks'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ],
        );

      default: // idle, initializing, recording
        return Column(
          children: [
            GestureDetector(
              onTap: () {
                if (_state == _RecordState.idle) {
                  _startRecording();
                } else if (_state == _RecordState.recording) {
                  _stopRecording();
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 72, height: 72,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: _state == _RecordState.recording
                      ? AppColors.danger
                      : _state == _RecordState.initializing
                          ? AppColors.textMuted
                          : AppColors.primary,
                  boxShadow: _state == _RecordState.recording ? [
                    BoxShadow(
                        color: AppColors.danger.withAlpha(80),
                        blurRadius: 20, spreadRadius: 6),
                  ] : [],
                ),
                child: _state == _RecordState.initializing
                    ? const Padding(
                        padding: EdgeInsets.all(20),
                        child: CircularProgressIndicator(
                            strokeWidth: 2.5, color: Colors.white),
                      )
                    : Icon(
                        _state == _RecordState.recording ? Icons.stop : Icons.mic,
                        color: Colors.white, size: 32,
                      ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _state == _RecordState.recording
                  ? 'Ketuk untuk berhenti'
                  : _state == _RecordState.initializing
                      ? 'Memulai...'
                      : 'Ketuk untuk mulai',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
            ),
          ],
        );
    }
  }
}
