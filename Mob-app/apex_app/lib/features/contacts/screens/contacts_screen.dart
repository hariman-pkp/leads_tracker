import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/api_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../models/contact_model.dart';
import '../providers/contacts_provider.dart';

const _waGreen  = Color(0xFF1a7a43);
const _callBlue = AppColors.primary;

class ContactsScreen extends ConsumerStatefulWidget {
  const ContactsScreen({super.key});

  @override
  ConsumerState<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends ConsumerState<ContactsScreen> {
  final _searchCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >=
        _scrollCtrl.position.maxScrollExtent - 200) {
      ref.read(contactsListProvider.notifier).loadMore();
    }
  }

  void _onSearch(String v) {
    ref.read(contactsSearchProvider.notifier).state = v;
    ref.read(contactsListProvider.notifier).applySearch(v);
    setState(() {});
  }

  void _showAddForm() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ContactForm(
        onSaved: (data) async {
          await ref.read(contactsRepositoryProvider).createContact(data);
          ref.read(contactsListProvider.notifier).refresh();
        },
      ),
    );
  }

  void _showDetail(ContactModel contact) {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bg2,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ContactDetail(
        contact: contact,
        onDelete: () async {
          try {
            await ref.read(contactsRepositoryProvider).deleteContact(contact.id);
            ref.read(contactsListProvider.notifier).refresh();
            if (mounted) Navigator.pop(context);
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                content: Text('Gagal menghapus: $e'),
                backgroundColor: AppColors.danger,
              ));
            }
          }
        },
        onEdit: (sheetCtx) {
          Navigator.of(sheetCtx).pop();
          _showEditForm(contact);
        },
        onChangeFoto: () => _changeFoto(contact),
      ),
    );
  }

  void _showEditForm(ContactModel contact) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _ContactForm(
        existing: contact,
        onSaved: (data) async {
          await ref.read(contactsRepositoryProvider).updateContact(contact.id, data);
          ref.read(contactsListProvider.notifier).refresh();
        },
      ),
    );
  }

  Future<void> _changeFoto(ContactModel contact) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      imageQuality: 85,
    );
    if (picked == null) return;
    try {
      await ref.read(contactsRepositoryProvider).uploadFoto(contact.id, picked);
      ref.read(contactsListProvider.notifier).refresh();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal upload foto: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    }
  }

  Future<void> _makeCall(String phone) async {
    final uri = Uri.parse('tel:$phone');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  Future<void> _openWhatsApp(ContactModel contact) async {
    var digits = (contact.phone ?? '').replaceAll(RegExp(r'[^\d]'), '');
    if (digits.startsWith('0')) digits = '62${digits.substring(1)}';
    showDialog<void>(
      context: context,
      builder: (_) => _WhatsAppDialog(contact: contact),
    );
  }

  @override
  Widget build(BuildContext context) {
    final contactsState = ref.watch(contactsListProvider);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(
          children: [
            // ── App Bar ─────────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 12, 14),
              color: AppColors.bg1,
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Kontak',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        contactsState.maybeWhen(
                          data: (s) => Text(
                            '${s.total} kontak',
                            style: const TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                          orElse: () => const SizedBox.shrink(),
                        ),
                      ],
                    ),
                  ),
                  _AppBarButton(
                    onTap: _showAddForm,
                    child: const Icon(Icons.add, color: AppColors.textPrimary, size: 20),
                  ),
                ],
              ),
            ),

            // ── Search Bar ───────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 12),
              color: AppColors.bg2,
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.bg3,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.border.withAlpha(180)),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  children: [
                    const Icon(Icons.search, color: AppColors.textMuted, size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: TextField(
                        controller: _searchCtrl,
                        onChanged: _onSearch,
                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                        decoration: const InputDecoration(
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                          border: InputBorder.none,
                          hintText: 'Cari nama, perusahaan...',
                          hintStyle: TextStyle(color: AppColors.textMuted, fontSize: 14),
                        ),
                      ),
                    ),
                    if (_searchCtrl.text.isNotEmpty)
                      GestureDetector(
                        onTap: () { _searchCtrl.clear(); _onSearch(''); },
                        child: const Icon(Icons.close, color: AppColors.textMuted, size: 16),
                      ),
                  ],
                ),
              ),
            ),

            // ── Contact List ─────────────────────────────────────────────
            Expanded(
              child: contactsState.when(
                loading: () => const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                ),
                error: (e, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.cloud_off, color: AppColors.textMuted, size: 48),
                      const SizedBox(height: 12),
                      Text(
                        'Gagal memuat kontak\n$e',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.read(contactsListProvider.notifier).refresh(),
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                ),
                data: (s) {
                  if (s.contacts.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.people_outline, color: AppColors.textMuted, size: 56),
                          const SizedBox(height: 16),
                          const Text(
                            'Belum ada kontak',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: 6),
                          const Text(
                            'Tambah kontak baru',
                            style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                          ),
                          const SizedBox(height: 20),
                          ElevatedButton.icon(
                            onPressed: _showAddForm,
                            icon: const Icon(Icons.add, size: 16),
                            label: const Text('Tambah Kontak'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: () => ref.read(contactsListProvider.notifier).refresh(),
                    color: AppColors.primary,
                    backgroundColor: AppColors.bg3,
                    child: ListView.builder(
                      controller: _scrollCtrl,
                      padding: const EdgeInsets.fromLTRB(12, 8, 12, 100),
                      itemCount: s.contacts.length + (s.hasMore ? 1 : 0),
                      itemBuilder: (context, i) {
                        if (i == s.contacts.length) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Center(
                              child: SizedBox(
                                width: 24, height: 24,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          );
                        }
                        final c = s.contacts[i];
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: _ContactCard(
                            contact: c,
                            onTap: () => _showDetail(c),
                            onCall: c.phone != null ? () => _makeCall(c.phone!) : null,
                            onWhatsApp: c.phone != null ? () => _openWhatsApp(c) : null,
                          ),
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddForm,
        backgroundColor: AppColors.primary,
        elevation: 4,
        child: const Icon(Icons.person_add_outlined, color: Colors.white, size: 24),
      ),
    );
  }
}

// ── Contact Card ──────────────────────────────────────────────────────────────

class _ContactCard extends StatelessWidget {
  final ContactModel contact;
  final VoidCallback onTap;
  final VoidCallback? onCall;
  final VoidCallback? onWhatsApp;

  const _ContactCard({
    required this.contact,
    required this.onTap,
    this.onCall,
    this.onWhatsApp,
  });

  Color _avatarColor() {
    const colors = [
      AppColors.primary,
      AppColors.yellow,
      AppColors.success,
      AppColors.stageProposal,
      AppColors.stageNegotiation,
      AppColors.stageProspect,
    ];
    return colors[contact.nama.length % colors.length];
  }

  @override
  Widget build(BuildContext context) {
    final color = _avatarColor();
    final fotoUrl = contact.foto != null && contact.foto!.isNotEmpty
        ? '${ApiConstants.storageUrl}/${contact.foto}'
        : null;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bg2,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border.withAlpha(180)),
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Foto / Avatar
            fotoUrl != null
                ? CircleAvatar(
                    radius: 28,
                    backgroundImage: NetworkImage(fotoUrl),
                    backgroundColor: AppColors.bg3,
                  )
                : Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: color.withAlpha(28),
                      shape: BoxShape.circle,
                      border: Border.all(color: color.withAlpha(60), width: 1.5),
                    ),
                    alignment: Alignment.center,
                    child: Text(
                      contact.initials,
                      style: TextStyle(
                        color: color,
                        fontWeight: FontWeight.w700,
                        fontSize: 18,
                      ),
                    ),
                  ),
            const SizedBox(width: 12),

            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    contact.nama,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (contact.jabatan != null && contact.jabatan!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      contact.jabatan!,
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  if (contact.company != null && contact.company!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.business_outlined, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            contact.company!,
                            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (contact.phone != null && contact.phone!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        const Icon(Icons.phone_outlined, size: 12, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            contact.phone!,
                            style: const TextStyle(color: AppColors.primary, fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),

            // Quick action: WA + Call
            if (contact.phone != null) ...[
              const SizedBox(width: 8),
              Column(
                children: [
                  GestureDetector(
                    onTap: onWhatsApp,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: _waGreen,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.chat_outlined, color: Colors.white, size: 16),
                    ),
                  ),
                  const SizedBox(height: 6),
                  GestureDetector(
                    onTap: onCall,
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: _callBlue,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.phone_outlined, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── App Bar Button ────────────────────────────────────────────────────────────

class _AppBarButton extends StatelessWidget {
  final VoidCallback onTap;
  final Widget child;
  const _AppBarButton({required this.onTap, required this.child});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppColors.bg3,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: AppColors.border),
          ),
          alignment: Alignment.center,
          child: child,
        ),
      );
}

// ── Contact Detail Bottom Sheet ───────────────────────────────────────────────

class _ContactDetail extends StatelessWidget {
  final ContactModel contact;
  final VoidCallback onDelete;
  final void Function(BuildContext) onEdit;
  final VoidCallback onChangeFoto;

  const _ContactDetail({
    required this.contact,
    required this.onDelete,
    required this.onEdit,
    required this.onChangeFoto,
  });

  Future<void> _call() async {
    final uri = Uri.parse('tel:${contact.phone}');
    try {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }

  Future<void> _whatsApp(BuildContext context) async {
    showDialog<void>(
      context: context,
      builder: (_) => _WhatsAppDialog(contact: contact),
    );
  }

  @override
  Widget build(BuildContext context) {
    final fotoUrl = contact.foto != null && contact.foto!.isNotEmpty
        ? '${ApiConstants.storageUrl}/${contact.foto}'
        : null;
    const colors = [
      AppColors.primary, AppColors.yellow, AppColors.success,
      AppColors.stageProposal, AppColors.stageNegotiation, AppColors.stageProspect,
    ];
    final color = colors[contact.nama.length % colors.length];

    return DraggableScrollableSheet(
      initialChildSize: 0.55,
      minChildSize: 0.4,
      maxChildSize: 0.9,
      expand: false,
      builder: (_, ctrl) => SingleChildScrollView(
        controller: ctrl,
        child: Padding(
          padding: EdgeInsets.only(
            left: 20, right: 20, top: 8,
            bottom: MediaQuery.of(context).viewInsets.bottom + 32,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Center(
                child: Container(
                  width: 40, height: 4,
                  decoration: BoxDecoration(
                    color: AppColors.border,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Avatar / foto — tap to change
              GestureDetector(
                onTap: onChangeFoto,
                child: Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    fotoUrl != null
                        ? CircleAvatar(
                            radius: 36,
                            backgroundImage: NetworkImage(fotoUrl),
                            backgroundColor: AppColors.bg3,
                          )
                        : Container(
                            width: 72, height: 72,
                            decoration: BoxDecoration(
                              color: color.withAlpha(30),
                              shape: BoxShape.circle,
                              border: Border.all(color: color.withAlpha(80), width: 1.5),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              contact.initials,
                              style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 24),
                            ),
                          ),
                    Container(
                      width: 24, height: 24,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.bg2, width: 2),
                      ),
                      alignment: Alignment.center,
                      child: const Icon(Icons.camera_alt, color: Colors.white, size: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 10),
              Text(
                contact.nama,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w700),
              ),
              if (contact.jabatan != null) ...[
                const SizedBox(height: 4),
                Text(contact.jabatan!, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              ],
              if (contact.company != null) ...[
                const SizedBox(height: 2),
                Text(contact.company!, style: const TextStyle(color: AppColors.primary, fontSize: 13)),
              ],
              const SizedBox(height: 20),

              if (contact.phone != null) ...[
                Row(
                  children: [
                    Expanded(
                      child: _DetailActionButton(
                        label: 'WhatsApp', icon: Icons.chat_outlined, color: _waGreen,
                        onTap: () => _whatsApp(context),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _DetailActionButton(
                        label: 'Telepon', icon: Icons.phone_outlined, color: AppColors.primary,
                        onTap: _call,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],

              const Divider(color: AppColors.border),
              const SizedBox(height: 8),

              if (contact.phone != null)
                _DetailRow(icon: Icons.phone_outlined, label: 'Telepon', value: contact.phone!),
              if (contact.email != null)
                _DetailRow(icon: Icons.email_outlined, label: 'Email', value: contact.email!),
              if (contact.notes != null)
                _DetailRow(icon: Icons.notes_outlined, label: 'Catatan', value: contact.notes!),

              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => onEdit(context),
                      icon: const Icon(Icons.edit_outlined, size: 16),
                      label: const Text('Edit'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primary,
                        side: const BorderSide(color: AppColors.primary),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  OutlinedButton(
                    onPressed: onDelete,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.danger,
                      side: const BorderSide(color: AppColors.danger),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    ),
                    child: const Icon(Icons.delete_outline, size: 18),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Detail Action Button ──────────────────────────────────────────────────────

class _DetailActionButton extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _DetailActionButton({required this.label, required this.icon, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) => ElevatedButton.icon(
        onPressed: onTap,
        icon: Icon(icon, size: 16),
        label: Text(label),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
}

// ── Detail Row ────────────────────────────────────────────────────────────────

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _DetailRow({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 7),
        child: Row(
          children: [
            Icon(icon, color: AppColors.textMuted, size: 16),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
            const Spacer(),
            Flexible(
              child: Text(value,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                  textAlign: TextAlign.right),
            ),
          ],
        ),
      );
}

// ── WhatsApp Dialog ───────────────────────────────────────────────────────────

class _WhatsAppDialog extends StatefulWidget {
  final ContactModel contact;
  const _WhatsAppDialog({required this.contact});

  @override
  State<_WhatsAppDialog> createState() => _WhatsAppDialogState();
}

class _WhatsAppDialogState extends State<_WhatsAppDialog> {
  final _msgCtrl = TextEditingController();

  @override
  void dispose() { _msgCtrl.dispose(); super.dispose(); }

  Future<void> _send() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    var digits = (widget.contact.phone ?? '').replaceAll(RegExp(r'[^\d]'), '');
    if (digits.startsWith('0')) digits = '62${digits.substring(1)}';
    Navigator.of(context).pop();
    final uri = Uri.parse('https://wa.me/$digits?text=${Uri.encodeComponent(text)}');
    try { await launchUrl(uri, mode: LaunchMode.externalApplication); } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.bg2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(context).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.chat_outlined, color: _waGreen, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Pesan WhatsApp',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.w700)),
                      Text(widget.contact.nama,
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close, color: AppColors.textSecondary, size: 20),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _msgCtrl,
              maxLines: 6, minLines: 4, autofocus: true,
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
              decoration: InputDecoration(
                hintText: 'Tulis pesan...',
                filled: true, fillColor: AppColors.bg3,
                contentPadding: const EdgeInsets.all(12),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
                focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: _waGreen, width: 1.5)),
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _msgCtrl.text.trim().isEmpty ? null : _send,
                style: ElevatedButton.styleFrom(
                  backgroundColor: _waGreen,
                  disabledBackgroundColor: AppColors.bg4,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                icon: const Icon(Icons.send, size: 18),
                label: const Text('Kirim WhatsApp', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Contact Form ──────────────────────────────────────────────────────────────

class _ContactForm extends StatefulWidget {
  final Future<void> Function(Map<String, dynamic>) onSaved;
  final ContactModel? existing;
  const _ContactForm({required this.onSaved, this.existing});

  @override
  State<_ContactForm> createState() => _ContactFormState();
}

class _ContactFormState extends State<_ContactForm> {
  late final TextEditingController _namaCtrl;
  late final TextEditingController _jabatanCtrl;
  late final TextEditingController _phoneCtrl;
  late final TextEditingController _emailCtrl;
  late final TextEditingController _companyCtrl;
  late final TextEditingController _notesCtrl;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final c = widget.existing;
    _namaCtrl    = TextEditingController(text: c?.nama ?? '');
    _jabatanCtrl = TextEditingController(text: c?.jabatan ?? '');
    _phoneCtrl   = TextEditingController(text: c?.phone ?? '');
    _emailCtrl   = TextEditingController(text: c?.email ?? '');
    _companyCtrl = TextEditingController(text: c?.company ?? '');
    _notesCtrl   = TextEditingController(text: c?.notes ?? '');
  }

  @override
  void dispose() {
    _namaCtrl.dispose(); _jabatanCtrl.dispose(); _phoneCtrl.dispose();
    _emailCtrl.dispose(); _companyCtrl.dispose(); _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_namaCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    try {
      await widget.onSaved({
        'nama_contact': _namaCtrl.text.trim(),
        if (_jabatanCtrl.text.isNotEmpty) 'jabatan': _jabatanCtrl.text.trim(),
        if (_phoneCtrl.text.isNotEmpty) 'no_hp': _phoneCtrl.text.trim(),
        if (_emailCtrl.text.isNotEmpty) 'email': _emailCtrl.text.trim(),
        if (_companyCtrl.text.isNotEmpty) 'nama_company': _companyCtrl.text.trim(),
        if (_notesCtrl.text.isNotEmpty) 'catatan': _notesCtrl.text.trim(),
      });
      if (mounted) Navigator.of(context).pop();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Gagal menyimpan: $e'),
          backgroundColor: AppColors.danger,
        ));
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 8,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: Text(
                    widget.existing != null ? 'Edit Kontak' : 'Tambah Kontak',
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
                  ),
                ),
                TextButton(
                  onPressed: _saving ? null : _save,
                  child: _saving
                      ? const SizedBox(width: 14, height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                      : const Text('Simpan', style: TextStyle(color: AppColors.primary)),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _formField(_namaCtrl, 'Nama *', Icons.person_outline),
            const SizedBox(height: 10),
            _formField(_jabatanCtrl, 'Jabatan', Icons.work_outline),
            const SizedBox(height: 10),
            _formField(_companyCtrl, 'Perusahaan', Icons.business_outlined),
            const SizedBox(height: 10),
            _formField(_phoneCtrl, 'Telepon', Icons.phone_outlined, type: TextInputType.phone),
            const SizedBox(height: 10),
            _formField(_emailCtrl, 'Email', Icons.email_outlined, type: TextInputType.emailAddress),
            const SizedBox(height: 10),
            _formField(_notesCtrl, 'Catatan', Icons.notes_outlined),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _formField(TextEditingController ctrl, String label, IconData icon, {TextInputType? type}) =>
      TextField(
        controller: ctrl,
        keyboardType: type,
        style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon, color: AppColors.textSecondary, size: 18),
        ),
      );
}
