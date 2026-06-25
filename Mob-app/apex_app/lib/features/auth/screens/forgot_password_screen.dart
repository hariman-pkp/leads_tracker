import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_colors.dart';
import '../repositories/auth_repository.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  // Step 1 = input email, Step 2 = input OTP + password baru
  int _step = 1;

  final _emailCtrl   = TextEditingController();
  final _otpCtrl     = TextEditingController();
  final _passCtrl    = TextEditingController();
  final _confirmCtrl = TextEditingController();

  bool _obsPass    = true;
  bool _obsConfirm = true;
  bool _loading    = false;
  String? _error;
  String? _submittedEmail;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _otpCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      setState(() => _error = 'Masukkan email yang valid');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await AuthRepository().forgotPassword(email);
      setState(() {
        _submittedEmail = email;
        _step = 2;
      });
    } catch (e) {
      setState(() => _error = 'Gagal mengirim OTP. Coba lagi.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resetPassword() async {
    final otp     = _otpCtrl.text.trim();
    final pass    = _passCtrl.text;
    final confirm = _confirmCtrl.text;

    if (otp.length != 6) {
      setState(() => _error = 'OTP harus 6 digit'); return;
    }
    if (pass.length < 6) {
      setState(() => _error = 'Password minimal 6 karakter'); return;
    }
    if (pass != confirm) {
      setState(() => _error = 'Konfirmasi password tidak cocok'); return;
    }

    setState(() { _loading = true; _error = null; });
    try {
      await AuthRepository().resetPassword(
        email:       _submittedEmail!,
        otp:         otp,
        newPassword: pass,
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
          content: Text('Password berhasil direset. Silakan login.'),
          backgroundColor: AppColors.success,
        ));
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() => _error = 'OTP tidak valid atau sudah kadaluarsa.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg1,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              color: AppColors.textPrimary, size: 18),
          onPressed: () {
            if (_step == 2) {
              setState(() { _step = 1; _error = null; });
            } else {
              Navigator.of(context).pop();
            }
          },
        ),
        title: const Text('Lupa Password',
            style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 16,
                fontWeight: FontWeight.w700)),
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 32),

              // Step indicator
              Row(children: [
                _StepDot(active: _step >= 1, done: _step > 1, label: '1'),
                Expanded(child: Container(height: 2,
                    color: _step > 1 ? AppColors.primary : AppColors.border)),
                _StepDot(active: _step >= 2, done: false, label: '2'),
              ]),
              const SizedBox(height: 8),
              Row(children: [
                Expanded(child: Text('Verifikasi Email',
                    style: TextStyle(
                        color: _step >= 1 ? AppColors.primary : AppColors.textMuted,
                        fontSize: 11),
                    textAlign: TextAlign.center)),
                Expanded(child: Text('Reset Password',
                    style: TextStyle(
                        color: _step >= 2 ? AppColors.primary : AppColors.textMuted,
                        fontSize: 11),
                    textAlign: TextAlign.center)),
              ]),

              const SizedBox(height: 36),

              if (_step == 1) ...[
                const Text('Masukkan Email',
                    style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                const Text(
                  'Kami akan mengirimkan kode OTP 6 digit.\nHubungi admin jika tidak menerima kode.',
                  style: TextStyle(color: AppColors.textSecondary, fontSize: 13, height: 1.5),
                ),
                const SizedBox(height: 28),
                TextField(
                  controller: _emailCtrl,
                  keyboardType: TextInputType.emailAddress,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: const InputDecoration(
                    labelText: 'Email',
                    prefixIcon: Icon(Icons.email_outlined,
                        color: AppColors.textSecondary, size: 20),
                  ),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _requestOtp,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : const Text('Kirim OTP',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w600)),
                  ),
                ),
              ] else ...[
                const Text('Masukkan OTP & Password Baru',
                    style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w700)),
                const SizedBox(height: 8),
                Text(
                  'Kode OTP telah dikirim untuk ${_submittedEmail ?? "email kamu"}.\nOTP berlaku 15 menit.',
                  style: const TextStyle(
                      color: AppColors.textSecondary, fontSize: 13, height: 1.5),
                ),
                const SizedBox(height: 28),

                // OTP field
                TextField(
                  controller: _otpCtrl,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 22,
                      letterSpacing: 8,
                      fontWeight: FontWeight.w700),
                  textAlign: TextAlign.center,
                  decoration: InputDecoration(
                    labelText: 'Kode OTP',
                    counterText: '',
                    prefixIcon: const Icon(Icons.pin_outlined,
                        color: AppColors.textSecondary, size: 20),
                    filled: true,
                    fillColor: AppColors.bg3,
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: const BorderSide(color: AppColors.border)),
                  ),
                ),
                const SizedBox(height: 14),

                // Password baru
                TextField(
                  controller: _passCtrl,
                  obscureText: _obsPass,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Password Baru',
                    prefixIcon: const Icon(Icons.lock_outline,
                        color: AppColors.textSecondary, size: 20),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obsPass = !_obsPass),
                      icon: Icon(
                          _obsPass ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          color: AppColors.textMuted, size: 18),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Konfirmasi password
                TextField(
                  controller: _confirmCtrl,
                  obscureText: _obsConfirm,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    labelText: 'Konfirmasi Password Baru',
                    prefixIcon: const Icon(Icons.lock_outline,
                        color: AppColors.textSecondary, size: 20),
                    suffixIcon: IconButton(
                      onPressed: () => setState(() => _obsConfirm = !_obsConfirm),
                      icon: Icon(
                          _obsConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          color: AppColors.textMuted, size: 18),
                    ),
                  ),
                ),
                const SizedBox(height: 20),

                SizedBox(
                  width: double.infinity, height: 50,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _resetPassword,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: _loading
                        ? const SizedBox(width: 20, height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : const Text('Reset Password',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 15,
                                fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: _loading ? null : _requestOtp,
                    child: const Text('Kirim ulang OTP',
                        style: TextStyle(
                            color: AppColors.primary, fontSize: 13)),
                  ),
                ),
              ],

              // Error box
              if (_error != null) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withAlpha(25),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.danger.withAlpha(80)),
                  ),
                  child: Row(children: [
                    const Icon(Icons.error_outline,
                        color: AppColors.danger, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(_error!,
                        style: const TextStyle(
                            color: AppColors.danger, fontSize: 13))),
                  ]),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _StepDot extends StatelessWidget {
  final bool   active;
  final bool   done;
  final String label;
  const _StepDot({required this.active, required this.done, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 28, height: 28,
      decoration: BoxDecoration(
        color: active ? AppColors.primary : AppColors.border,
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: done
          ? const Icon(Icons.check, color: Colors.white, size: 14)
          : Text(label,
              style: TextStyle(
                  color: active ? Colors.white : AppColors.textMuted,
                  fontSize: 13,
                  fontWeight: FontWeight.w700)),
    );
  }
}
