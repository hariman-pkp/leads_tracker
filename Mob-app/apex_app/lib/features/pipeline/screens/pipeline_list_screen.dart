import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/date_utils.dart';
import '../models/lead_model.dart';
import '../providers/pipeline_provider.dart';

const _stages = ['Semua', 'Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

class PipelineListScreen extends ConsumerStatefulWidget {
  const PipelineListScreen({super.key});

  @override
  ConsumerState<PipelineListScreen> createState() => _PipelineListScreenState();
}

class _PipelineListScreenState extends ConsumerState<PipelineListScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedStage = 'Semua';

  @override
  void dispose() {
    _searchCtrl.dispose();
    _searchFocus.dispose();
    super.dispose();
  }

  void _onStageSelected(String stage) {
    setState(() => _selectedStage = stage);
    ref.read(pipelineFilterProvider.notifier).update((s) => s.copyWith(
      stage: stage == 'Semua' ? null : stage,
      clearStage: stage == 'Semua',
    ));
  }

  final _searchFocus = FocusNode();

  void _onSearch(String v) {
    ref.read(pipelineFilterProvider.notifier).update((s) => v.isEmpty
        ? s.copyWith(clearSearch: true)
        : s.copyWith(search: v),
    );
  }

  @override
  Widget build(BuildContext context) {
    final leads = ref.watch(pipelineLeadsProvider);

    return Scaffold(
      backgroundColor: AppColors.bg1,
      body: SafeArea(
        child: Column(
          children: [
            // ── Header ───────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              decoration: const BoxDecoration(
                color: Color(0xFF0A1628),
                border: Border(
                  bottom: BorderSide(color: AppColors.border),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Pipeline',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Consumer(builder: (_, ref, __) {
                          final leads = ref.watch(pipelineLeadsProvider);
                          return leads.maybeWhen(
                            data: (list) {
                              final active = list.where(
                                (l) => l.stage != 'Won' && l.stage != 'Lost'
                              ).toList();
                              double total = 0;
                              for (final l in active) {
                                total += l.dealValue ?? l.proposeValue ?? 0;
                              }
                              String fmt = '';
                              if (total >= 1e9) fmt = 'Rp ${(total/1e9).toStringAsFixed(1)}M';
                              else if (total >= 1e6) fmt = 'Rp ${(total/1e6).toStringAsFixed(0)}Jt';
                              return Text(
                                '${active.length} leads aktif · $fmt',
                                style: const TextStyle(
                                  color: AppColors.textSecondary,
                                  fontSize: 12,
                                ),
                              );
                            },
                            orElse: () => const SizedBox.shrink(),
                          );
                        }),
                      ],
                    ),
                  ),
                  GestureDetector(
                    onTap: () => _searchFocus.requestFocus(),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.bg3,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: const Icon(Icons.search,
                          color: AppColors.textSecondary, size: 18),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () => context.push('/pipeline/new'),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.add,
                          color: Colors.white, size: 18),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Search ────────────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _searchCtrl,
                focusNode: _searchFocus,
                onChanged: _onSearch,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Cari nama perusahaan...',
                  prefixIcon: const Icon(Icons.search, color: AppColors.textMuted, size: 18),
                  suffixIcon: _searchCtrl.text.isNotEmpty
                      ? IconButton(
                          onPressed: () {
                            _searchCtrl.clear();
                            _onSearch('');
                          },
                          icon: const Icon(Icons.close, color: AppColors.textMuted, size: 16),
                        )
                      : null,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // ── Stage Filter Chips ─────────────────────────────────
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _stages.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final stage    = _stages[i];
                  final selected = stage == _selectedStage;
                  final color    = _stageColor(stage);
                  return GestureDetector(
                    onTap: () => _onStageSelected(stage),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 150),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: selected ? color.withAlpha(40) : AppColors.bg3,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: selected ? color : AppColors.border,
                        ),
                      ),
                      child: Text(
                        stage,
                        style: TextStyle(
                          color: selected ? color : AppColors.textSecondary,
                          fontSize: 12,
                          fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 10),
            const Divider(height: 1),

            // ── Lead List ─────────────────────────────────────────────
            Expanded(
              child: leads.when(
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
                        'Gagal memuat leads\n$e',
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                      ),
                      const SizedBox(height: 12),
                      TextButton(
                        onPressed: () => ref.invalidate(pipelineLeadsProvider),
                        child: const Text('Coba Lagi'),
                      ),
                    ],
                  ),
                ),
                data: (list) => list.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.inbox_outlined, color: AppColors.textMuted, size: 48),
                            const SizedBox(height: 12),
                            Text(
                              _selectedStage == 'Semua'
                                  ? 'Belum ada lead'
                                  : 'Tidak ada lead di stage $_selectedStage',
                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: () => ref.refresh(pipelineLeadsProvider.future),
                        color: AppColors.primary,
                        backgroundColor: AppColors.bg3,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: list.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 8),
                          itemBuilder: (_, i) => _SwipeableLeadCard(
                            lead:  list[i],
                            onTap: () => context.push('/pipeline/${list[i].leadId}'),
                            onFu:  () => context.push(
                              '/pipeline/${list[i].leadId}/followup',
                              extra: {'nama': list[i].namaCompany},
                            ),
                            onEdit: () => context.push('/pipeline/${list[i].leadId}/edit'),
                          ),
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Lead Card ─────────────────────────────────────────────────────────────────

class _LeadCard extends StatelessWidget {
  final LeadModel lead;
  final VoidCallback onTap;
  const _LeadCard({required this.lead, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final stageC    = _stageColor(lead.stage);
    final initials  = _initials(lead.namaCompany);
    final fuStatus  = _fuStatus(lead.tglFu);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: AppColors.bg2,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          children: [
            // Avatar
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                color: stageC.withAlpha(25),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: stageC.withAlpha(60)),
              ),
              alignment: Alignment.center,
              child: Text(
                initials,
                style: TextStyle(
                  color: stageC,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 10),
            // Main info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    lead.namaCompany,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 3),
                  Text(
                    lead.contactPerson.isNotEmpty
                        ? lead.contactPerson
                        : lead.salesOwner,
                    style: const TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      // FU date indicator
                      if (lead.tglFu != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: fuStatus.color.withAlpha(25),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            '⏰ ${fuStatus.label}',
                            style: TextStyle(
                              color: fuStatus.color,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Right column: badge + value
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                _StageBadge(stage: lead.stage, color: stageC),
                const SizedBox(height: 6),
                Text(
                  _formatRupiah(lead.dealValue ?? lead.proposeValue ?? 0),
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _initials(String name) {
    final words = name.trim().split(RegExp(r'\s+'));
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.length >= 2
        ? name.substring(0, 2).toUpperCase()
        : name.toUpperCase();
  }

  _FuStatus _fuStatus(String? tglFu) {
    if (tglFu == null || tglFu.isEmpty) {
      return _FuStatus('—', AppColors.textMuted);
    }
    try {
      if (WibDate.isOverdue(tglFu)) {
        return _FuStatus('Overdue', AppColors.danger);
      }
      if (WibDate.isToday(tglFu)) {
        return _FuStatus('Hari Ini', const Color(0xFFFF8C42));
      }
      return _FuStatus(
        WibDate.format(tglFu, fmt: 'd MMM'),
        AppColors.textSecondary,
      );
    } catch (_) {
      return _FuStatus(tglFu, AppColors.textMuted);
    }
  }

  String _formatRupiah(double v) {
    if (v <= 0)   return '—';
    if (v >= 1e9) return 'Rp ${(v/1e9).toStringAsFixed(1)}M';
    if (v >= 1e6) return 'Rp ${(v/1e6).toStringAsFixed(0)}Jt';
    return NumberFormat.currency(
        locale: 'id', symbol: 'Rp ', decimalDigits: 0).format(v);
  }
}

class _FuStatus {
  final String label;
  final Color  color;
  const _FuStatus(this.label, this.color);
}

class _StageBadge extends StatelessWidget {
  final String stage;
  final Color  color;
  const _StageBadge({required this.stage, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
    decoration: BoxDecoration(
      color: color.withAlpha(30),
      borderRadius: BorderRadius.circular(6),
      border: Border.all(color: color.withAlpha(80)),
    ),
    child: Text(
      stage,
      style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.w600),
    ),
  );
}

Color _stageColor(String stage) {
  final s = stage.toLowerCase();
  if (s == 'prospect')    return AppColors.stageProspect;
  if (s == 'qualified')   return AppColors.stageQualified;
  if (s == 'proposal')    return AppColors.stageProposal;
  if (s == 'negotiation') return AppColors.stageNegotiation;
  if (s == 'won')         return AppColors.stageWon;
  if (s == 'lost')        return AppColors.stageLost;
  return AppColors.primary;
}

// ── Swipeable Lead Card ───────────────────────────────────────────────────────
// Swipe kanan → Catat FU  |  Swipe kiri → Edit lead
// Menggunakan GestureDetector custom (bukan Dismissible) untuk menghindari
// konflik GlobalKey dengan Navigator GoRouter ShellRoute.

class _SwipeableLeadCard extends StatefulWidget {
  final LeadModel    lead;
  final VoidCallback onTap;
  final VoidCallback onFu;
  final VoidCallback onEdit;

  const _SwipeableLeadCard({
    required this.lead,
    required this.onTap,
    required this.onFu,
    required this.onEdit,
  });

  @override
  State<_SwipeableLeadCard> createState() => _SwipeableLeadCardState();
}

class _SwipeableLeadCardState extends State<_SwipeableLeadCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  double _dragStart  = 0;
  double _dragDelta  = 0;
  bool   _triggered  = false;

  static const double _threshold    = 80.0;
  static const double _maxReveal    = 100.0;
  static const Duration _snapDur    = Duration(milliseconds: 200);

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: _snapDur);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _onHorizontalStart(DragStartDetails d) {
    _dragStart = d.localPosition.dx;
    _dragDelta = 0;
    _triggered = false;
  }

  void _onHorizontalUpdate(DragUpdateDetails d) {
    _dragDelta = (d.localPosition.dx - _dragStart).clamp(-_maxReveal, _maxReveal);
    setState(() {});
  }

  void _onHorizontalEnd(DragEndDetails d) {
    if (_triggered) return;

    if (_dragDelta > _threshold) {
      // Swipe kanan → Catat FU
      _triggered = true;
      _snapBack(() => widget.onFu());
    } else if (_dragDelta < -_threshold) {
      // Swipe kiri → Edit
      _triggered = true;
      _snapBack(() => widget.onEdit());
    } else {
      // Belum cukup — kembalikan
      _snapBack(null);
    }
  }

  void _snapBack(VoidCallback? action) {
    final startDelta = _dragDelta;
    _ctrl.forward(from: 0).then((_) {
      if (mounted) setState(() => _dragDelta = 0);
      action?.call();
    });
    // Animasikan _dragDelta → 0 tiap frame
    _ctrl.addListener(() {
      if (mounted) {
        setState(() {
          _dragDelta = startDelta * (1 - _ctrl.value);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final swipeRight = _dragDelta > 0;
    final swipeLeft  = _dragDelta < 0;
    final revealPct  = (_dragDelta.abs() / _maxReveal).clamp(0.0, 1.0);

    return GestureDetector(
      onTap: widget.onTap,
      onHorizontalDragStart:  _onHorizontalStart,
      onHorizontalDragUpdate: _onHorizontalUpdate,
      onHorizontalDragEnd:    _onHorizontalEnd,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            // Background kiri (Catat FU) — saat swipe kanan
            if (swipeRight)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.primary.withAlpha((revealPct * 255).round()),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(12),
                      bottomLeft: Radius.circular(12),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  alignment: Alignment.centerLeft,
                  child: Opacity(
                    opacity: revealPct,
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.phone_outlined, color: Colors.white, size: 20),
                        SizedBox(width: 8),
                        Text('Catat FU',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                ),
              ),
            // Background kanan (Edit) — saat swipe kiri
            if (swipeLeft)
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    color: AppColors.warning.withAlpha((revealPct * 255).round()),
                    borderRadius: const BorderRadius.only(
                      topRight: Radius.circular(12),
                      bottomRight: Radius.circular(12),
                    ),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  alignment: Alignment.centerRight,
                  child: Opacity(
                    opacity: revealPct,
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Edit',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 13,
                                fontWeight: FontWeight.w700)),
                        SizedBox(width: 8),
                        Icon(Icons.edit_outlined, color: Colors.white, size: 20),
                      ],
                    ),
                  ),
                ),
              ),
            // Card utama — geser horizontal saat drag
            Transform.translate(
              offset: Offset(_dragDelta, 0),
              child: _LeadCard(lead: widget.lead, onTap: widget.onTap),
            ),
          ],
        ),
      ),
    );
  }
}
