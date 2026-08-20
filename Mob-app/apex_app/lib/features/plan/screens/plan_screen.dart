import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../models/plan_model.dart';
import '../providers/plan_provider.dart';

// ── Helpers ───────────────────────────────────────────────────────────────────

const _fuLabels = {
  'call': 'Call', 'whatsapp': 'WhatsApp', 'kunjungan': 'Kunjungan',
  'meeting': 'Meeting', 'online': 'Online',
};
const _fuIcons = {
  'call': Icons.phone, 'whatsapp': Icons.chat, 'kunjungan': Icons.directions_car,
  'meeting': Icons.groups, 'online': Icons.videocam,
};
const _fuTypes = ['call', 'whatsapp', 'kunjungan', 'meeting', 'online'];

Color _prioritasColor(String p) {
  switch (p) {
    case 'Hot':  return const Color(0xFFEF4444);
    case 'Warm': return const Color(0xFFF97316);
    default:     return const Color(0xFF3B82F6);
  }
}

String _toISO(DateTime d) =>
    '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

// ── Main Screen ───────────────────────────────────────────────────────────────

class PlanScreen extends ConsumerStatefulWidget {
  const PlanScreen({super.key});

  @override
  ConsumerState<PlanScreen> createState() => _PlanScreenState();
}

class _PlanScreenState extends ConsumerState<PlanScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabCtrl;
  int _selectedDay = 0;
  final _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _selectedDay = (now.weekday - 1).clamp(0, 6);
    _tabCtrl = TabController(length: 7, vsync: this, initialIndex: _selectedDay);
    _tabCtrl.addListener(() {
      if (!_tabCtrl.indexIsChanging) setState(() => _selectedDay = _tabCtrl.index);
    });
    _searchCtrl.addListener(() {
      setState(() => _searchQuery = _searchCtrl.text.toLowerCase());
    });
  }

  @override
  void dispose() {
    _tabCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  List<PlanLead> _filter(List<PlanLead> leads) {
    if (_searchQuery.isEmpty) return leads;
    return leads.where((l) =>
      l.namaCompany.toLowerCase().contains(_searchQuery) ||
      (l.product?.toLowerCase().contains(_searchQuery) ?? false) ||
      l.salesOwner.toLowerCase().contains(_searchQuery),
    ).toList();
  }

  List<DateTime> _weekDays(DateTime weekStart) =>
      List.generate(7, (i) => weekStart.add(Duration(days: i)));

  @override
  Widget build(BuildContext context) {
    final planState = ref.watch(planProvider);
    final notifier  = ref.read(planProvider.notifier);
    final weekStart = planState.weekStart;
    final days      = _weekDays(weekStart);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(children: [
          _buildHeader(context, weekStart, notifier),
          _buildDayTabBar(days),
          Expanded(
            child: planState.data.when(
              loading: () => const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              ),
              error: (e, _) => Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  const Icon(Icons.error_outline, color: AppColors.danger, size: 36),
                  const SizedBox(height: 8),
                  const Text('Gagal memuat data',
                      style: TextStyle(color: AppColors.textSecondary)),
                  const SizedBox(height: 12),
                  TextButton(onPressed: notifier.refresh, child: const Text('Coba Lagi')),
                ]),
              ),
              data: (plan) => _buildBody(context, plan, days, notifier),
            ),
          ),
        ]),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showQuickLeadModal(context, days[_selectedDay]),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('Leads & Agenda Baru',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, DateTime weekStart, PlanNotifier notifier) {
    final weekEnd   = weekStart.add(const Duration(days: 6));
    final fmt       = DateFormat('d MMM', 'id_ID');
    final fmtYear   = DateFormat('d MMM yyyy', 'id_ID');
    final rangeText = '${fmt.format(weekStart)} – ${fmtYear.format(weekEnd)}';

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 8, 8),
      child: Row(children: [
        const Expanded(
          child: Text('Weekly Planner',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 20,
                  fontWeight: FontWeight.w700)),
        ),
        Text(rangeText,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        const SizedBox(width: 4),
        IconButton(
          icon: const Icon(Icons.chevron_left, color: AppColors.primary),
          onPressed: notifier.prevWeek,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        ),
        IconButton(
          icon: const Icon(Icons.chevron_right, color: AppColors.primary),
          onPressed: notifier.nextWeek,
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        ),
        IconButton(
          icon: const Icon(Icons.today, color: AppColors.primary, size: 20),
          onPressed: () {
            notifier.goToday();
            final d = (DateTime.now().weekday - 1).clamp(0, 6);
            _tabCtrl.animateTo(d);
          },
          tooltip: 'Hari ini',
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
        ),
      ]),
    );
  }

  Widget _buildDayTabBar(List<DateTime> days) {
    final today = _toISO(DateTime.now());
    final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return Container(
      color: AppColors.bg2,
      child: TabBar(
        controller: _tabCtrl,
        isScrollable: false,
        indicatorColor: AppColors.primary,
        indicatorWeight: 3,
        labelPadding: EdgeInsets.zero,
        tabs: List.generate(7, (i) {
          final isToday    = _toISO(days[i]) == today;
          final isSelected = _selectedDay == i;
          return Tab(
            height: 56,
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Text(dayNames[i],
                  style: TextStyle(
                    fontSize: 10,
                    color: isSelected ? AppColors.primary : AppColors.textMuted,
                  )),
              const SizedBox(height: 2),
              Container(
                width: 28, height: 28,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isToday ? AppColors.primary : Colors.transparent,
                ),
                alignment: Alignment.center,
                child: Text(
                  '${days[i].day}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isToday
                        ? Colors.white
                        : isSelected ? AppColors.primary : AppColors.textSecondary,
                  ),
                ),
              ),
            ]),
          );
        }),
      ),
    );
  }

  Widget _buildBody(
    BuildContext context, WeekPlanData plan, List<DateTime> days, PlanNotifier notifier) {
    final dateStr  = _toISO(days[_selectedDay]);
    final dayLeads = plan.byDate[dateStr] ?? [];

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
      children: [
        // ── Jadwal hari ini ──────────────────────────────────────────────
        Row(children: [
          const Text('Agenda Hari Ini',
              style: TextStyle(color: AppColors.textPrimary, fontSize: 14,
                  fontWeight: FontWeight.w600)),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text('${dayLeads.length}',
                style: const TextStyle(color: AppColors.primary, fontSize: 12,
                    fontWeight: FontWeight.w600)),
          ),
        ]),
        const SizedBox(height: 8),
        if (dayLeads.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.bg3,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: Text('Belum ada agenda untuk hari ini',
                  style: TextStyle(color: AppColors.textMuted, fontSize: 13)),
            ),
          )
        else
          ...dayLeads.map((lead) => _LeadCard(
            lead: lead,
            onEdit: () => _showAssignModal(context, lead, days,
                currentDate: dateStr, isEdit: true),
            onRemove: () async {
              try {
                await notifier.removeSchedule(lead);
              } catch (_) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Gagal menghapus jadwal')));
                }
              }
            },
          )),

        const SizedBox(height: 20),

        // ── Search bar ───────────────────────────────────────────────────
        TextField(
          controller: _searchCtrl,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: 'Cari leads...',
            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
            prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 20),
            suffixIcon: _searchQuery.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted, size: 18),
                    onPressed: () => _searchCtrl.clear(),
                  )
                : null,
            filled: true,
            fillColor: AppColors.bg3,
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // ── Tanpa Jadwal ─────────────────────────────────────────────────
        _CollapsibleSection(
          title: 'Tanpa Jadwal',
          count: _filter(plan.unscheduled).length,
          color: const Color(0xFFF97316),
          children: _filter(plan.unscheduled).map((lead) => _LeadCard(
            lead: lead,
            onAssign: () => _showAssignModal(context, lead, days,
                currentDate: dateStr),
          )).toList(),
        ),

        const SizedBox(height: 12),

        // ── Overdue ──────────────────────────────────────────────────────
        _CollapsibleSection(
          title: 'Overdue',
          count: _filter(plan.overdue).length,
          color: const Color(0xFFEF4444),
          children: _filter(plan.overdue).map((lead) => _LeadCard(
            lead: lead,
            showOverdue: true,
            onAssign: () => _showAssignModal(context, lead, days,
                currentDate: dateStr),
          )).toList(),
        ),
      ],
    );
  }

  // ── Modal: Assign jadwal ──────────────────────────────────────────────────
  void _showAssignModal(
    BuildContext context, PlanLead lead, List<DateTime> days, {
    required String currentDate, bool isEdit = false,
  }) {
    String selectedDate = isEdit ? (lead.nextFuDate ?? currentDate) : currentDate;
    String selectedType = lead.nextFuType;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) {
          return Padding(
            padding: EdgeInsets.only(
              left: 20, right: 20, top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            ),
            child: Column(mainAxisSize: MainAxisSize.min, children: [
              // Handle
              Container(width: 40, height: 4,
                  decoration: BoxDecoration(color: AppColors.border,
                      borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Text(isEdit ? 'Ubah Jadwal' : 'Tambahkan ke Jadwal',
                  style: const TextStyle(color: AppColors.textPrimary,
                      fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 4),
              Text(lead.namaCompany,
                  style: const TextStyle(color: AppColors.primary, fontSize: 14)),
              const SizedBox(height: 20),

              // Pilih hari
              Align(
                alignment: Alignment.centerLeft,
                child: const Text('Hari',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 64,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: days.map((d) {
                    final iso      = _toISO(d);
                    final selected = iso == selectedDate;
                    final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
                    final name     = dayNames[d.weekday - 1];
                    return GestureDetector(
                      onTap: () => setModal(() => selectedDate = iso),
                      child: Container(
                        width: 46,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: selected ? AppColors.primary : AppColors.bg3,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: selected ? AppColors.primary : AppColors.border),
                        ),
                        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                          Text(name,
                              style: TextStyle(
                                  color: selected ? Colors.white : AppColors.textMuted,
                                  fontSize: 10)),
                          Text('${d.day}',
                              style: TextStyle(
                                  color: selected ? Colors.white : AppColors.textPrimary,
                                  fontSize: 16, fontWeight: FontWeight.w700)),
                        ]),
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: 16),

              // Pilih tipe FU
              Align(
                alignment: Alignment.centerLeft,
                child: const Text('Tipe FU',
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8, runSpacing: 8,
                children: _fuTypes.map((t) {
                  final sel = t == selectedType;
                  return GestureDetector(
                    onTap: () => setModal(() => selectedType = t),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: sel ? AppColors.primary.withValues(alpha: 0.15) : AppColors.bg3,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                            color: sel ? AppColors.primary : AppColors.border),
                      ),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(_fuIcons[t], size: 14,
                            color: sel ? AppColors.primary : AppColors.textSecondary),
                        const SizedBox(width: 6),
                        Text(_fuLabels[t]!,
                            style: TextStyle(
                                color: sel ? AppColors.primary : AppColors.textSecondary,
                                fontSize: 13)),
                      ]),
                    ),
                  );
                }).toList(),
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    Navigator.of(ctx).pop();
                    try {
                      await ref.read(planProvider.notifier)
                          .assign(lead, selectedDate, selectedType);
                    } catch (_) {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Gagal menyimpan jadwal')));
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(isEdit ? 'Simpan Perubahan' : 'Jadwalkan',
                      style: const TextStyle(color: Colors.white,
                          fontWeight: FontWeight.w600, fontSize: 15)),
                ),
              ),
            ]),
          );
        },
      ),
    );
  }

  // ── Modal: Quick Lead ─────────────────────────────────────────────────────
  void _showQuickLeadModal(BuildContext context, DateTime day) {
    final namaCtrl    = TextEditingController();
    final productCtrl = TextEditingController();
    final salesCtrl   = TextEditingController();
    String selectedDate = _toISO(day);
    String selectedType = 'call';
    bool saving = false;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppColors.bg2,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setModal) {
          final days = List.generate(7,
              (i) => ref.read(planProvider).weekStart.add(Duration(days: i)));
          final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

          return Padding(
            padding: EdgeInsets.only(
              left: 20, right: 20, top: 20,
              bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
            ),
            child: SingleChildScrollView(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Container(width: 40, height: 4,
                    decoration: BoxDecoration(color: AppColors.border,
                        borderRadius: BorderRadius.circular(2))),
                const SizedBox(height: 16),
                const Text('Leads & Agenda Baru',
                    style: TextStyle(color: AppColors.textPrimary,
                        fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(height: 20),

                _inputField('Nama Perusahaan', namaCtrl, 'PT. Contoh Sejahtera'),
                const SizedBox(height: 12),
                _inputField('Produk', productCtrl, 'Nama produk'),
                const SizedBox(height: 12),
                _inputField('Sales Owner', salesCtrl, 'Nama sales'),
                const SizedBox(height: 16),

                Align(
                  alignment: Alignment.centerLeft,
                  child: const Text('Hari',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ),
                const SizedBox(height: 8),
                SizedBox(
                  height: 64,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: days.map((d) {
                      final iso = _toISO(d);
                      final sel = iso == selectedDate;
                      return GestureDetector(
                        onTap: () => setModal(() => selectedDate = iso),
                        child: Container(
                          width: 46,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: BoxDecoration(
                            color: sel ? AppColors.primary : AppColors.bg3,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: sel ? AppColors.primary : AppColors.border),
                          ),
                          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                            Text(dayNames[d.weekday - 1],
                                style: TextStyle(
                                    color: sel ? Colors.white : AppColors.textMuted,
                                    fontSize: 10)),
                            Text('${d.day}',
                                style: TextStyle(
                                    color: sel ? Colors.white : AppColors.textPrimary,
                                    fontSize: 16, fontWeight: FontWeight.w700)),
                          ]),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 16),

                Align(
                  alignment: Alignment.centerLeft,
                  child: const Text('Tipe FU',
                      style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8, runSpacing: 8,
                  children: _fuTypes.map((t) {
                    final sel = t == selectedType;
                    return GestureDetector(
                      onTap: () => setModal(() => selectedType = t),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        decoration: BoxDecoration(
                          color: sel ? AppColors.primary.withValues(alpha: 0.15) : AppColors.bg3,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                              color: sel ? AppColors.primary : AppColors.border),
                        ),
                        child: Row(mainAxisSize: MainAxisSize.min, children: [
                          Icon(_fuIcons[t], size: 14,
                              color: sel ? AppColors.primary : AppColors.textSecondary),
                          const SizedBox(width: 6),
                          Text(_fuLabels[t]!,
                              style: TextStyle(
                                  color: sel ? AppColors.primary : AppColors.textSecondary,
                                  fontSize: 13)),
                        ]),
                      ),
                    );
                  }).toList(),
                ),

                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: saving ? null : () async {
                      if (namaCtrl.text.trim().isEmpty) {
                        ScaffoldMessenger.of(ctx).showSnackBar(
                          const SnackBar(content: Text('Nama perusahaan wajib diisi')));
                        return;
                      }
                      setModal(() => saving = true);
                      try {
                        await ref.read(planProvider.notifier).createAndAssign(
                          namaCompany: namaCtrl.text.trim(),
                          product:     productCtrl.text.trim(),
                          salesOwner:  salesCtrl.text.trim(),
                          date:        selectedDate,
                          fuType:      selectedType,
                        );
                        if (ctx.mounted) Navigator.of(ctx).pop();
                      } catch (_) {
                        setModal(() => saving = false);
                        if (ctx.mounted) {
                          ScaffoldMessenger.of(ctx).showSnackBar(
                            const SnackBar(content: Text('Gagal menyimpan')));
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10)),
                    ),
                    child: saving
                        ? const SizedBox(width: 20, height: 20,
                            child: CircularProgressIndicator(
                                color: Colors.white, strokeWidth: 2))
                        : const Text('Simpan & Jadwalkan',
                            style: TextStyle(color: Colors.white,
                                fontWeight: FontWeight.w600, fontSize: 15)),
                  ),
                ),
              ]),
            ),
          );
        },
      ),
    );
  }

  Widget _inputField(String label, TextEditingController ctrl, String hint) =>
      Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        const SizedBox(height: 4),
        TextField(
          controller: ctrl,
          style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
            filled: true,
            fillColor: AppColors.bg3,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.border),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: AppColors.primary),
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ]);
}

// ── Lead Card ─────────────────────────────────────────────────────────────────

class _LeadCard extends StatelessWidget {
  final PlanLead lead;
  final VoidCallback? onAssign;
  final VoidCallback? onEdit;
  final VoidCallback? onRemove;
  final bool showOverdue;

  const _LeadCard({
    required this.lead,
    this.onAssign,
    this.onEdit,
    this.onRemove,
    this.showOverdue = false,
  });

  @override
  Widget build(BuildContext context) {
    final pColor = _prioritasColor(lead.prioritas);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bg3,
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: pColor, width: 3)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(lead.namaCompany,
                style: const TextStyle(color: AppColors.textPrimary,
                    fontSize: 14, fontWeight: FontWeight.w600),
                maxLines: 1, overflow: TextOverflow.ellipsis),
            const SizedBox(height: 4),
            Row(children: [
              if (lead.product != null && lead.product!.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(lead.product!,
                      style: const TextStyle(color: Color(0xFF3B82F6), fontSize: 10)),
                ),
                const SizedBox(width: 6),
              ],
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: pColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(lead.prioritas,
                    style: TextStyle(color: pColor, fontSize: 10)),
              ),
            ]),
            if (showOverdue && lead.daysOverdue != null) ...[
              const SizedBox(height: 4),
              Row(children: [
                const Icon(Icons.warning_amber, color: Color(0xFFEF4444), size: 12),
                const SizedBox(width: 4),
                Text('${lead.daysOverdue} hari overdue',
                    style: const TextStyle(color: Color(0xFFEF4444), fontSize: 11)),
              ]),
            ],
            if (lead.nextFuType.isNotEmpty) ...[
              const SizedBox(height: 4),
              Row(children: [
                Icon(_fuIcons[lead.nextFuType] ?? Icons.phone,
                    size: 12, color: AppColors.textMuted),
                const SizedBox(width: 4),
                Text(_fuLabels[lead.nextFuType] ?? lead.nextFuType,
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
              ]),
            ],
          ]),
        ),
        const SizedBox(width: 8),
        Column(children: [
          if (onAssign != null)
            _iconBtn(Icons.calendar_today, AppColors.primary, onAssign!),
          if (onEdit != null)
            _iconBtn(Icons.edit_outlined, AppColors.primary, onEdit!),
          if (onRemove != null)
            _iconBtn(Icons.close, AppColors.danger, onRemove!),
        ]),
      ]),
    );
  }

  Widget _iconBtn(IconData icon, Color color, VoidCallback onTap) => GestureDetector(
    onTap: onTap,
    child: Container(
      margin: const EdgeInsets.only(bottom: 4),
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Icon(icon, color: color, size: 16),
    ),
  );
}

// ── Collapsible Section ───────────────────────────────────────────────────────

class _CollapsibleSection extends StatefulWidget {
  final String title;
  final int count;
  final Color color;
  final List<Widget> children;

  const _CollapsibleSection({
    required this.title,
    required this.count,
    required this.color,
    required this.children,
  });

  @override
  State<_CollapsibleSection> createState() => _CollapsibleSectionState();
}

class _CollapsibleSectionState extends State<_CollapsibleSection> {
  bool _expanded = true;

  @override
  Widget build(BuildContext context) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      GestureDetector(
        onTap: () => setState(() => _expanded = !_expanded),
        child: Row(children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: widget.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              Text(widget.title,
                  style: TextStyle(color: widget.color, fontSize: 13,
                      fontWeight: FontWeight.w600)),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                decoration: BoxDecoration(
                  color: widget.color.withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text('${widget.count}',
                    style: TextStyle(color: widget.color, fontSize: 11,
                        fontWeight: FontWeight.w700)),
              ),
            ]),
          ),
          const Spacer(),
          Icon(_expanded ? Icons.expand_less : Icons.expand_more,
              color: AppColors.textMuted, size: 20),
        ]),
      ),
      if (_expanded) ...[
        const SizedBox(height: 8),
        if (widget.children.isEmpty)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Text('Tidak ada data',
                style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
          )
        else
          ...widget.children,
      ],
    ]);
  }
}
