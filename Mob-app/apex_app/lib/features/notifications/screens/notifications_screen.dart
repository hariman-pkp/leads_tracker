import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../../entertain/models/claim_model.dart';
import '../../entertain/repositories/entertain_repository.dart';
import '../models/notification_model.dart';
import '../providers/notifications_provider.dart';

const _filterTabs = ['Semua', 'Follow-Up', 'Pipeline', 'Approval'];

// ── Main screen ──────────────────────────────────────────────────────────────

class NotificationsScreen extends ConsumerStatefulWidget {
  const NotificationsScreen({super.key});

  @override
  ConsumerState<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState extends ConsumerState<NotificationsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabCtrl;

  @override
  void initState() {
    super.initState();
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user   = ref.watch(authProvider).user;
    final notifs = ref.watch(notificationsListProvider);
    final isManagerOrAdmin = user != null && (user.roleId == 1 || user.roleId == 2);

    final unreadCount = ref.watch(unreadCountProvider).maybeWhen(
      data: (count) => count,
      orElse: () => 0,
    );

    return Scaffold(
      backgroundColor: AppColors.bg1,
      appBar: AppBar(
        backgroundColor: AppColors.bg2,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Notifikasi',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                    fontWeight: FontWeight.w700)),
            Text(
              unreadCount > 0
                  ? '$unreadCount belum dibaca'
                  : 'Semua sudah dibaca',
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 11),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await ref
                  .read(notificationsRepositoryProvider)
                  .markAllRead();
              ref.invalidate(notificationsListProvider);
              ref.invalidate(unreadCountProvider);
            },
            child: const Text(
              'Tandai Semua',
              style: TextStyle(color: AppColors.primary, fontSize: 12),
            ),
          ),
        ],
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          labelStyle:
              const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
          unselectedLabelStyle: const TextStyle(fontSize: 13),
          tabs: const [
            Tab(text: 'Notifikasi'),
            Tab(text: 'Approval Queue'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabCtrl,
        children: [
          _NotifTab(notifs: notifs),
          isManagerOrAdmin
              ? const _ApprovalQueueTab()
              : const _NotManagerPlaceholder(),
        ],
      ),
    );
  }
}

// ── Tab 1: Notifications ─────────────────────────────────────────────────────

class _NotifTab extends ConsumerStatefulWidget {
  final AsyncValue<List<NotificationModel>> notifs;
  const _NotifTab({required this.notifs});

  @override
  ConsumerState<_NotifTab> createState() => _NotifTabState();
}

class _NotifTabState extends ConsumerState<_NotifTab> {
  String _activeFilter = 'Semua';

  List<NotificationModel> _applyFilter(List<NotificationModel> list) {
    if (_activeFilter == 'Semua') return list;
    return list.where((n) {
      final t = n.type.toLowerCase();
      if (_activeFilter == 'Follow-Up') {
        return t == 'overdue' || t == 'reminder' || t == 'stale';
      }
      if (_activeFilter == 'Pipeline') {
        return t == 'closing' || t == 'comment';
      }
      if (_activeFilter == 'Approval') {
        return t == 'approval';
      }
      return t.contains(_activeFilter.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Filter chips
        SizedBox(
          height: 48,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            itemCount: _filterTabs.length,
            separatorBuilder: (ctx, i) => const SizedBox(width: 8),
            itemBuilder: (_, i) {
              final label    = _filterTabs[i];
              final selected = label == _activeFilter;
              return GestureDetector(
                onTap: () => setState(() => _activeFilter = label),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: selected
                        ? AppColors.primary.withAlpha(30)
                        : AppColors.bg3,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color:
                          selected ? AppColors.primary : AppColors.border,
                    ),
                  ),
                  child: Text(
                    label,
                    style: TextStyle(
                      color: selected
                          ? AppColors.primary
                          : AppColors.textSecondary,
                      fontSize: 12,
                      fontWeight: selected
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        const Divider(height: 1),
        Expanded(
          child: widget.notifs.when(
            loading: () => const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
            error: (e, _) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off,
                      color: AppColors.textMuted, size: 48),
                  const SizedBox(height: 12),
                  Text('$e',
                      style: const TextStyle(
                          color: AppColors.textSecondary)),
                  TextButton(
                    onPressed: () =>
                        ref.invalidate(notificationsListProvider),
                    child: const Text('Coba Lagi'),
                  ),
                ],
              ),
            ),
            data: (list) {
              final filtered = _applyFilter(list);
              if (filtered.isEmpty) {
                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.notifications_none,
                          color: AppColors.textMuted, size: 56),
                      SizedBox(height: 12),
                      Text('Tidak ada notifikasi',
                          style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 14)),
                    ],
                  ),
                );
              }
              final unread =
                  filtered.where((n) => n.isUnread).toList();
              final read =
                  filtered.where((n) => !n.isUnread).toList();

              return RefreshIndicator(
                onRefresh: () =>
                    ref.refresh(notificationsListProvider.future),
                color: AppColors.primary,
                backgroundColor: AppColors.bg3,
                child: ListView(
                  children: [
                    if (unread.isNotEmpty)
                      ...unread.map((n) => _NotifTile(
                            notif: n,
                            onTap: () async {
                              await ref
                                  .read(notificationsRepositoryProvider)
                                  .markRead(n.id);
                              ref.invalidate(notificationsListProvider);
                              ref.invalidate(unreadCountProvider);
                            },
                          )),
                    if (unread.isNotEmpty && read.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                        color: AppColors.bg3,
                        child: const Text(
                          'Sudah dibaca',
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    if (read.isNotEmpty)
                      ...read.map((n) => Opacity(
                            opacity: 0.55,
                            child: _NotifTile(
                              notif: n,
                              onTap: () {},
                            ),
                          )),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// ── Tab 2: Approval Queue ─────────────────────────────────────────────────────

final _approvalQueueProvider =
    FutureProvider.autoDispose<List<ClaimModel>>((ref) async {
  final repo = EntertainRepository();
  final data = await repo.getClaims(
    tahun: DateTime.now().year,
    bulan: 0,
    status: 'Pending',
  );
  final list = data['claims'] as List? ?? [];
  return list
      .map((e) => ClaimModel.fromJson(e as Map<String, dynamic>))
      .toList();
});

// ignore: must_be_immutable
class _ApprovalQueueTab extends ConsumerWidget {
  const _ApprovalQueueTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queue = ref.watch(_approvalQueueProvider);

    return queue.when(
      loading: () => const Center(
          child: CircularProgressIndicator(color: AppColors.primary)),
      error: (e, _) => Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.cloud_off,
                color: AppColors.textMuted, size: 48),
            const SizedBox(height: 12),
            Text('$e',
                style:
                    const TextStyle(color: AppColors.textSecondary)),
            TextButton(
              onPressed: () => ref.invalidate(_approvalQueueProvider),
              child: const Text('Coba Lagi'),
            ),
          ],
        ),
      ),
      data: (claims) {
        if (claims.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle_outline,
                    color: AppColors.success, size: 56),
                SizedBox(height: 12),
                Text('Tidak ada klaim yang menunggu persetujuan',
                    style: TextStyle(
                        color: AppColors.textSecondary, fontSize: 14)),
              ],
            ),
          );
        }
        return RefreshIndicator(
          onRefresh: () =>
              ref.refresh(_approvalQueueProvider.future),
          color: AppColors.primary,
          backgroundColor: AppColors.bg3,
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: claims.length,
            separatorBuilder: (ctx, i) => const SizedBox(height: 10),
            itemBuilder: (_, i) =>
                _ApprovalCard(claim: claims[i]),
          ),
        );
      },
    );
  }
}

class _ApprovalCard extends ConsumerWidget {
  final ClaimModel claim;
  const _ApprovalCard({required this.claim});

  static final _fmt =
      NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ', decimalDigits: 0);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bg2,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.warning.withAlpha(30),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'Pending',
                  style: TextStyle(
                      color: AppColors.warning,
                      fontSize: 11,
                      fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                claim.claimNo,
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 11),
              ),
              const Spacer(),
              if (claim.limitWarning)
                const Icon(Icons.warning_amber_rounded,
                    color: AppColors.danger, size: 16),
            ],
          ),
          const SizedBox(height: 10),
          // Sales & klien
          Row(
            children: [
              const Icon(Icons.person_outline,
                  color: AppColors.textMuted, size: 14),
              const SizedBox(width: 4),
              Text(claim.salesNama,
                  style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.groups_outlined,
                  color: AppColors.textMuted, size: 14),
              const SizedBox(width: 4),
              Expanded(
                child: Text(claim.namaKlien,
                    style: const TextStyle(
                        color: AppColors.textSecondary, fontSize: 12)),
              ),
            ],
          ),
          if (claim.leadNama != null) ...[
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.business_outlined,
                    color: AppColors.textMuted, size: 14),
                const SizedBox(width: 4),
                Text(claim.leadNama!,
                    style: const TextStyle(
                        color: AppColors.textMuted, fontSize: 11)),
              ],
            ),
          ],
          const SizedBox(height: 8),
          // Jumlah & tanggal
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _fmt.format(claim.jumlah),
                style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 15,
                    fontWeight: FontWeight.w700),
              ),
              Text(
                _formatDate(claim.tglKlaim),
                style: const TextStyle(
                    color: AppColors.textMuted, fontSize: 11),
              ),
            ],
          ),
          if (claim.keterangan.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              claim.keterangan,
              style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                  height: 1.4),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          const SizedBox(height: 12),
          // Action buttons
          Row(
            children: [
              Expanded(
                child: _ActionButton(
                  label: 'Approve',
                  color: AppColors.success,
                  icon: Icons.check_circle_outline,
                  onPressed: () =>
                      _showDialog(context, ref, 'Approved'),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _ActionButton(
                  label: 'Reject',
                  color: AppColors.danger,
                  icon: Icons.cancel_outlined,
                  onPressed: () =>
                      _showDialog(context, ref, 'Rejected'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _showDialog(
      BuildContext context, WidgetRef ref, String action) async {
    final cataranCtrl = TextEditingController();
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bg2,
        title: Text(
          action == 'Approved' ? 'Approve Klaim' : 'Reject Klaim',
          style: const TextStyle(
              color: AppColors.textPrimary, fontSize: 15),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${claim.claimNo} — ${claim.salesNama}',
              style: const TextStyle(
                  color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: cataranCtrl,
              style: const TextStyle(
                  color: AppColors.textPrimary, fontSize: 13),
              decoration: InputDecoration(
                labelText: 'Catatan (opsional)',
                labelStyle: const TextStyle(
                    color: AppColors.textMuted, fontSize: 12),
                filled: true,
                fillColor: AppColors.bg3,
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(8),
                    borderSide:
                        const BorderSide(color: AppColors.border)),
              ),
              maxLines: 2,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Batal',
                style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: action == 'Approved'
                  ? AppColors.success
                  : AppColors.danger,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(action,
                style: const TextStyle(
                    color: Colors.white, fontSize: 13)),
          ),
        ],
      ),
    );

    if (confirmed != true || !context.mounted) return;

    try {
      await ref.read(notificationsRepositoryProvider).approveClaim(
            claim.id,
            action,
            catatan: cataranCtrl.text.trim(),
          );
      ref.invalidate(_approvalQueueProvider);
      ref.invalidate(notificationsListProvider);
      ref.invalidate(unreadCountProvider);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Klaim ${claim.claimNo} berhasil $action.'),
          backgroundColor: action == 'Approved'
              ? AppColors.success
              : AppColors.danger,
        ));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    }
  }

  String _formatDate(String raw) {
    try {
      final d = DateTime.parse(raw);
      return DateFormat('d MMM yyyy', 'id_ID').format(d);
    } catch (_) {
      return raw;
    }
  }
}

class _NotManagerPlaceholder extends StatelessWidget {
  const _NotManagerPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.lock_outline, color: AppColors.textMuted, size: 48),
          SizedBox(height: 12),
          Text(
            'Hanya Manager dan Admin\nyang dapat mengakses halaman ini',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

// ── Notification Tile ─────────────────────────────────────────────────────────

class _NotifTile extends StatelessWidget {
  final NotificationModel notif;
  final VoidCallback      onTap;
  const _NotifTile({required this.notif, required this.onTap});

  Color _typeColor(String type) {
    switch (type) {
      case 'overdue':   return AppColors.danger;
      case 'reminder':  return AppColors.yellow;
      case 'stale':     return AppColors.warning;
      case 'closing':   return AppColors.stageNegotiation;
      case 'comment':   return AppColors.primary;
      case 'approval':  return AppColors.success;
      case 'warning':   return AppColors.danger;
      default:          return AppColors.textSecondary;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'overdue':   return Icons.schedule;
      case 'reminder':  return Icons.notifications_active_outlined;
      case 'stale':     return Icons.hourglass_empty;
      case 'closing':   return Icons.flag_outlined;
      case 'comment':   return Icons.comment_outlined;
      case 'approval':  return Icons.thumb_up_outlined;
      case 'warning':   return Icons.warning_amber_outlined;
      default:          return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color   = _typeColor(notif.type);
    final icon    = _typeIcon(notif.type);
    final timeStr = _relativeTime(notif.createdAt);

    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: notif.isUnread
              ? AppColors.primary.withAlpha(10)
              : Colors.transparent,
          border: Border(
            left: BorderSide(
              color: notif.isUnread ? color : Colors.transparent,
              width: 3,
            ),
            bottom: const BorderSide(color: AppColors.border, width: 0.5),
          ),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 18),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 13,
                            fontWeight: notif.isUnread
                                ? FontWeight.w600
                                : FontWeight.w400,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        timeStr,
                        style: const TextStyle(
                            color: AppColors.textMuted, fontSize: 10),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    notif.body,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 12,
                      height: 1.4,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (notif.leadNama != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.business_outlined,
                            color: AppColors.textMuted, size: 11),
                        const SizedBox(width: 3),
                        Text(
                          notif.leadNama!,
                          style: const TextStyle(
                              color: AppColors.textMuted, fontSize: 11),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            if (notif.isUnread)
              Container(
                width: 7,
                height: 7,
                margin: const EdgeInsets.only(top: 4, left: 6),
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _relativeTime(String dt) {
    try {
      final d    = DateTime.parse(dt).toLocal();
      final diff = DateTime.now().difference(d);
      if (diff.inMinutes < 1) return 'Baru saja';
      if (diff.inHours < 1)   return '${diff.inMinutes}m';
      if (diff.inDays < 1)    return '${diff.inHours}j';
      if (diff.inDays < 7)    return '${diff.inDays}h';
      return DateFormat('d MMM', 'id_ID').format(d);
    } catch (_) {
      return '';
    }
  }
}

// ── Shared action button ──────────────────────────────────────────────────────

class _ActionButton extends StatelessWidget {
  final String   label;
  final Color    color;
  final IconData icon;
  final VoidCallback onPressed;
  const _ActionButton({
    required this.label,
    required this.color,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 15, color: color),
      label: Text(label,
          style: TextStyle(
              fontSize: 13, color: color, fontWeight: FontWeight.w600)),
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: color.withAlpha(120)),
        padding: const EdgeInsets.symmetric(vertical: 10),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8)),
      ),
    );
  }
}
