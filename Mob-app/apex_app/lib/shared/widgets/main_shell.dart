import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/api_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/services/offline_service.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../features/auth/providers/auth_provider.dart';

class MainShell extends ConsumerStatefulWidget {
  final Widget child;
  const MainShell({super.key, required this.child});

  @override
  ConsumerState<MainShell> createState() => _MainShellState();
}

class _MainShellState extends ConsumerState<MainShell> {
  static const _tabs = [
    _TabItem(path: '/dashboard',    icon: Icons.dashboard_outlined,       activeIcon: Icons.dashboard,        label: 'Dashboard'),
    _TabItem(path: '/pipeline',     icon: Icons.business_center_outlined,  activeIcon: Icons.business_center,  label: 'Pipeline'),
    _TabItem(path: '/checkin',      icon: Icons.place_outlined,            activeIcon: Icons.place,            label: 'Check-in'),
    _TabItem(path: '/contacts',     icon: Icons.people_outline,            activeIcon: Icons.people,           label: 'Kontak'),
    _TabItem(path: '/daily-report', icon: Icons.assignment_outlined,       activeIcon: Icons.assignment,       label: 'Laporan'),
  ];

  @override
  void initState() {
    super.initState();
    OfflineService.instance.isOnlineNotifier .addListener(_rebuild);
    OfflineService.instance.isSyncingNotifier.addListener(_rebuild);
  }

  @override
  void dispose() {
    OfflineService.instance.isOnlineNotifier .removeListener(_rebuild);
    OfflineService.instance.isSyncingNotifier.removeListener(_rebuild);
    super.dispose();
  }

  void _rebuild() { if (mounted) setState(() {}); }

  int _currentIndex(BuildContext context) {
    final loc = GoRouterState.of(context).matchedLocation;
    for (int i = 0; i < _tabs.length; i++) {
      if (loc.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final current   = _currentIndex(context);
    final isOnline  = OfflineService.instance.isOnlineNotifier.value;
    final isSyncing = OfflineService.instance.isSyncingNotifier.value;

    final auth = ref.watch(authProvider);
    final user = auth.user;

    return Scaffold(
      drawer: _AppDrawer(user: user),
      body: Column(
        children: [
          if (!isOnline || isSyncing)
            _OfflineBanner(isSyncing: isSyncing),
          Expanded(child: widget.child),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.bg2,
          border: Border(top: BorderSide(color: AppColors.border, width: 1)),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 60,
            child: Row(
              children: List.generate(_tabs.length, (i) {
                final tab      = _tabs[i];
                final selected = i == current;
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: () => context.go(tab.path),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          selected ? tab.activeIcon : tab.icon,
                          color: selected ? AppColors.primary : AppColors.textMuted,
                          size: 22,
                        ),
                        const SizedBox(height: 2),
                        Text(
                          tab.label,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                            color: selected ? AppColors.primary : AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}

class _OfflineBanner extends StatelessWidget {
  final bool isSyncing;
  const _OfflineBanner({required this.isSyncing});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: isSyncing ? const Color(0xFF0EA5E9) : const Color(0xFF6B7280),
      child: SafeArea(
        bottom: false,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 5),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (isSyncing)
                const SizedBox(
                  width: 12, height: 12,
                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                )
              else
                const Icon(Icons.wifi_off, color: Colors.white, size: 14),
              const SizedBox(width: 6),
              Text(
                isSyncing ? 'Menyinkronkan data...' : 'Tidak ada koneksi — data offline',
                style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TabItem {
  final String path;
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _TabItem({required this.path, required this.icon, required this.activeIcon, required this.label});
}

// ── App Drawer ────────────────────────────────────────────────────────────────
class _AppDrawer extends ConsumerWidget {
  final dynamic user;
  const _AppDrawer({required this.user});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userModel = ref.watch(authProvider).user;
    final nama      = userModel?.nama     ?? '-';
    final email     = userModel?.email    ?? '';
    final roleNama  = userModel?.roleName ?? '';
    final avatarBg  = userModel?.resolvedAvatarColor ?? AppColors.primary;

    void go(String path) {
      Navigator.of(context).pop();
      context.push(path);
    }

    return Drawer(
      backgroundColor: AppColors.bg2,
      child: SafeArea(
        child: Column(children: [
          // Header profil
          Container(
            width: double.infinity,
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
            color: AppColors.bg1,
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              GestureDetector(
                onTap: () => _showAvatarOptions(context, ref, avatarBg, userModel?.avatarPhoto),
                child: Stack(
                  children: [
                    _buildAvatar(avatarBg, nama, userModel?.avatarPhoto),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.bg1, width: 2),
                        ),
                        child: const Icon(Icons.edit, color: Colors.white, size: 11),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(nama, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
              if (email.isNotEmpty)
                Text(email, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              if (roleNama.isNotEmpty)
                Container(
                  margin: const EdgeInsets.only(top: 6),
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(roleNama, style: const TextStyle(color: AppColors.primary, fontSize: 11)),
                ),
            ]),
          ),
          const SizedBox(height: 8),
          Expanded(
            child: ListView(padding: EdgeInsets.zero, children: [
              _section('Utama'),
              _item(context, Icons.dashboard,          'Dashboard',          '/dashboard', go),
              _item(context, Icons.business_center,    'Pipeline',           '/pipeline',  go),
              _item(context, Icons.people,             'Kontak',             '/contacts',  go),
              _item(context, Icons.assignment,         'Laporan Harian',     '/daily-report', go),
              _item(context, Icons.place,              'Check-in',           '/checkin',   go),

              const Divider(color: AppColors.border, height: 24),
              _section('Analitik'),
              _item(context, Icons.bar_chart,          'Analitik Personal',  '/analytics', go),
              _item(context, Icons.show_chart,         'Pipeline Forecast',  '/forecast',  go),
              _item(context, Icons.track_changes,      'Target Sales',       '/sales-target', go),

              const Divider(color: AppColors.border, height: 24),
              _section('Klaim'),
              _item(context, Icons.receipt_long,       'Entertainment Claim','/entertain', go,
                  highlight: true),

              const Divider(color: AppColors.border, height: 24),
              _section('Lainnya'),
              _item(context, Icons.format_list_bulleted,'Follow-up Hari Ini','/followup-list', go),
              _item(context, Icons.notifications,      'Notifikasi',         '/notifications', go),

              const Divider(color: AppColors.border, height: 24),
              _section('Bantuan'),
              _helpItem(context, Icons.menu_book_outlined, 'Panduan Penggunaan'),
            ]),
          ),
          // Logout
          const Divider(color: AppColors.border, height: 1),
          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.danger, size: 20),
            title: const Text('Keluar', style: TextStyle(color: AppColors.danger, fontSize: 14)),
            onTap: () {
              Navigator.of(context).pop();
              ref.read(authProvider.notifier).logout();
            },
          ),
          const SizedBox(height: 8),
        ]),
      ),
    );
  }

  Widget _buildAvatar(Color avatarBg, String nama, String? photoUrl) {
    if (photoUrl != null) {
      final url = '${ApiConstants.baseUrl}/v1/static/$photoUrl';
      return CircleAvatar(
        radius: 30,
        backgroundColor: avatarBg.withValues(alpha: 0.2),
        backgroundImage: NetworkImage(url),
      );
    }
    return CircleAvatar(
      radius: 30,
      backgroundColor: avatarBg.withValues(alpha: 0.25),
      child: Text(
        nama.isNotEmpty ? nama[0].toUpperCase() : '?',
        style: TextStyle(color: avatarBg, fontSize: 24, fontWeight: FontWeight.bold),
      ),
    );
  }

  void _showAvatarOptions(BuildContext context, WidgetRef ref, Color avatarBg, String? photoUrl) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            Container(width: 36, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2))),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.photo_camera_outlined, color: AppColors.textPrimary),
              title: const Text('Ambil Foto', style: TextStyle(color: AppColors.textPrimary)),
              onTap: () async {
                Navigator.pop(ctx);
                await _pickAndUpload(context, ref, ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined, color: AppColors.textPrimary),
              title: const Text('Pilih dari Galeri', style: TextStyle(color: AppColors.textPrimary)),
              onTap: () async {
                Navigator.pop(ctx);
                await _pickAndUpload(context, ref, ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.palette_outlined, color: AppColors.textPrimary),
              title: const Text('Ganti Warna', style: TextStyle(color: AppColors.textPrimary)),
              onTap: () {
                Navigator.pop(ctx);
                _showColorPicker(context, ref, avatarBg);
              },
            ),
            if (photoUrl != null)
              ListTile(
                leading: const Icon(Icons.delete_outline, color: AppColors.danger),
                title: const Text('Hapus Foto', style: TextStyle(color: AppColors.danger)),
                onTap: () async {
                  Navigator.pop(ctx);
                  try {
                    await ref.read(authProvider.notifier).deleteAvatarPhoto();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Foto avatar dihapus.')),
                      );
                    }
                  } catch (e) {
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Gagal: $e')),
                      );
                    }
                  }
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _pickAndUpload(BuildContext context, WidgetRef ref, ImageSource source) async {
    try {
      final picker = ImagePicker();
      final xfile  = kIsWeb
          ? await picker.pickImage(source: ImageSource.gallery)
          : await picker.pickImage(source: source, imageQuality: 80, maxWidth: 512);
      if (xfile == null) return;

      await ref.read(authProvider.notifier).uploadAvatarPhoto(xfile);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Foto avatar berhasil diperbarui.')),
        );
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal upload: $e')),
        );
      }
    }
  }

  static const _palette = [
    '#3B82F6', // biru (default)
    '#8B5CF6', // ungu
    '#EC4899', // pink
    '#EF4444', // merah
    '#F97316', // oranye
    '#EAB308', // kuning
    '#22C55E', // hijau
    '#14B8A6', // teal
    '#64748B', // slate
    '#6B7280', // abu
  ];

  void _showColorPicker(BuildContext context, WidgetRef ref, Color current) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Pilih Warna Avatar',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: _palette.map((hex) {
                final color = Color(int.parse('FF${hex.substring(1)}', radix: 16));
                final isSelected = hex == (ref.read(authProvider).user?.avatarColor ?? '#3B82F6');
                return GestureDetector(
                  onTap: () async {
                    Navigator.pop(ctx);
                    try {
                      await ref.read(authProvider.notifier).updateAvatarColor(hex);
                    } catch (e) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Gagal: $e')),
                        );
                      }
                    }
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: color.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSelected ? color : Colors.transparent,
                        width: 3,
                      ),
                    ),
                    child: Center(
                      child: Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                        child: isSelected
                            ? const Icon(Icons.check, color: Colors.white, size: 16)
                            : null,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _section(String label) => Padding(
    padding: const EdgeInsets.fromLTRB(16, 4, 16, 4),
    child: Text(label.toUpperCase(),
        style: const TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
  );

  Widget _helpItem(BuildContext context, IconData icon, String label) {
    return ListTile(
      dense: true,
      leading: Icon(icon, color: AppColors.textSecondary, size: 20),
      title: Text(label, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
      trailing: const Icon(Icons.open_in_new, color: AppColors.textMuted, size: 14),
      onTap: () async {
        Navigator.of(context).pop();
        final uri = Uri.parse('https://apex.hariman.online/panduan.pdf');
        if (await canLaunchUrl(uri)) {
          await launchUrl(uri, mode: LaunchMode.externalApplication);
        }
      },
    );
  }

  Widget _item(BuildContext context, IconData icon, String label, String path, Function(String) go,
      {bool highlight = false}) {
    final color = highlight ? AppColors.yellow : AppColors.textSecondary;
    return ListTile(
      dense: true,
      leading: Icon(icon, color: color, size: 20),
      title: Text(label, style: TextStyle(color: highlight ? AppColors.yellow : AppColors.textPrimary, fontSize: 14)),
      onTap: () => go(path),
    );
  }
}
