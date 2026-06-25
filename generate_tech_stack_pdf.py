"""
generate_tech_stack_pdf.py
Membuat dokumen PDF Technology Stack CRM DCSS
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether
)
from reportlab.platypus.flowables import BalancedColumns
from datetime import date
import os

# ── Warna brand ────────────────────────────────────────────────────────────────
NAVY_DARK   = colors.HexColor('#0d1b31')
NAVY_MID    = colors.HexColor('#132847')
NAVY_LIGHT  = colors.HexColor('#1e3a5f')
BLUE_ACCENT = colors.HexColor('#3b82f6')
GREEN       = colors.HexColor('#22c55e')
YELLOW      = colors.HexColor('#f59e0b')
RED         = colors.HexColor('#ef4444')
PURPLE      = colors.HexColor('#a855f7')
GRAY_LIGHT  = colors.HexColor('#e5e7eb')
GRAY_MID    = colors.HexColor('#9ca3af')
GRAY_DARK   = colors.HexColor('#374151')
WHITE       = colors.white
TEXT_DARK   = colors.HexColor('#111827')

W, H = A4   # 210 x 297 mm

# ── Output path ────────────────────────────────────────────────────────────────
OUT = os.path.join(os.path.dirname(__file__), 'Technology_Stack_CRM_v2.pdf')

# ── Styles ─────────────────────────────────────────────────────────────────────
def make_styles():
    s = {}

    s['cover_title'] = ParagraphStyle('cover_title',
        fontName='Helvetica-Bold', fontSize=28, leading=34,
        textColor=WHITE, alignment=TA_CENTER, spaceAfter=4*mm)

    s['cover_subtitle'] = ParagraphStyle('cover_subtitle',
        fontName='Helvetica', fontSize=13, leading=18,
        textColor=colors.HexColor('#93c5fd'), alignment=TA_CENTER, spaceAfter=2*mm)

    s['cover_meta'] = ParagraphStyle('cover_meta',
        fontName='Helvetica', fontSize=10,
        textColor=colors.HexColor('#6b7280'), alignment=TA_CENTER)

    s['h1'] = ParagraphStyle('h1',
        fontName='Helvetica-Bold', fontSize=16, leading=20,
        textColor=BLUE_ACCENT, spaceBefore=6*mm, spaceAfter=3*mm)

    s['h2'] = ParagraphStyle('h2',
        fontName='Helvetica-Bold', fontSize=12, leading=15,
        textColor=NAVY_DARK, spaceBefore=4*mm, spaceAfter=2*mm)

    s['h3'] = ParagraphStyle('h3',
        fontName='Helvetica-Bold', fontSize=10, leading=13,
        textColor=colors.HexColor('#1d4ed8'), spaceBefore=3*mm, spaceAfter=1.5*mm)

    s['body'] = ParagraphStyle('body',
        fontName='Helvetica', fontSize=9.5, leading=14,
        textColor=TEXT_DARK, spaceAfter=2*mm, alignment=TA_JUSTIFY)

    s['body_small'] = ParagraphStyle('body_small',
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=GRAY_DARK, spaceAfter=1.5*mm)

    s['bullet'] = ParagraphStyle('bullet',
        fontName='Helvetica', fontSize=9, leading=13,
        textColor=TEXT_DARK, leftIndent=12, firstLineIndent=-8, spaceAfter=1.5*mm)

    s['code'] = ParagraphStyle('code',
        fontName='Courier', fontSize=8, leading=11,
        textColor=colors.HexColor('#1e40af'),
        backColor=colors.HexColor('#eff6ff'),
        leftIndent=8, rightIndent=8,
        spaceBefore=2*mm, spaceAfter=2*mm,
        borderPad=4, borderWidth=0.5, borderColor=colors.HexColor('#bfdbfe'),
        borderRadius=3)

    s['label'] = ParagraphStyle('label',
        fontName='Helvetica-Bold', fontSize=8, leading=10,
        textColor=WHITE)

    s['cell'] = ParagraphStyle('cell',
        fontName='Helvetica', fontSize=8.5, leading=12,
        textColor=TEXT_DARK)

    s['cell_bold'] = ParagraphStyle('cell_bold',
        fontName='Helvetica-Bold', fontSize=8.5, leading=12,
        textColor=TEXT_DARK)

    s['cell_code'] = ParagraphStyle('cell_code',
        fontName='Courier', fontSize=8, leading=11,
        textColor=colors.HexColor('#1e40af'))

    s['caption'] = ParagraphStyle('caption',
        fontName='Helvetica-Oblique', fontSize=8, leading=10,
        textColor=GRAY_MID, alignment=TA_CENTER, spaceAfter=2*mm)

    s['phase_title'] = ParagraphStyle('phase_title',
        fontName='Helvetica-Bold', fontSize=11, leading=14,
        textColor=WHITE)

    s['toc_item'] = ParagraphStyle('toc_item',
        fontName='Helvetica', fontSize=10, leading=16,
        textColor=TEXT_DARK, leftIndent=10)

    s['toc_num'] = ParagraphStyle('toc_num',
        fontName='Helvetica-Bold', fontSize=10, leading=16,
        textColor=BLUE_ACCENT)

    return s

ST = make_styles()

# ── Helper builders ─────────────────────────────────────────────────────────────

def hr(color=BLUE_ACCENT, thickness=0.8):
    return HRFlowable(width='100%', thickness=thickness, color=color, spaceAfter=3*mm, spaceBefore=1*mm)

def sp(mm_val=3):
    return Spacer(1, mm_val * mm)

def p(text, style='body'):
    return Paragraph(text, ST[style])

def bullet(text):
    return Paragraph(f'<bullet>&bull;</bullet> {text}', ST['bullet'])

def section_header(number, title, color=BLUE_ACCENT):
    """Numbered section header with left color bar."""
    data = [[
        Paragraph(f'<font color="#3b82f6">{number}</font>', ParagraphStyle(
            'sh_num', fontName='Helvetica-Bold', fontSize=18, textColor=BLUE_ACCENT)),
        Paragraph(title, ParagraphStyle(
            'sh_title', fontName='Helvetica-Bold', fontSize=14, textColor=NAVY_DARK, leading=18))
    ]]
    t = Table(data, colWidths=[12*mm, None])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (0,0), 0),
        ('RIGHTPADDING', (0,0), (0,0), 4*mm),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2*mm),
        ('TOPPADDING', (0,0), (-1,-1), 4*mm),
    ]))
    return t

def tech_badge(text, bg=BLUE_ACCENT, fg=WHITE):
    """Small colored pill badge."""
    style = ParagraphStyle('badge', fontName='Helvetica-Bold', fontSize=8,
                            textColor=fg, alignment=TA_CENTER)
    return Table([[Paragraph(text, style)]], colWidths=[None],
                  style=TableStyle([
                      ('BACKGROUND', (0,0), (-1,-1), bg),
                      ('ROUNDEDCORNERS', [4,4,4,4]),
                      ('TOPPADDING', (0,0), (-1,-1), 2),
                      ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                      ('LEFTPADDING', (0,0), (-1,-1), 6),
                      ('RIGHTPADDING', (0,0), (-1,-1), 6),
                  ]))

def info_table(rows, col_widths=None):
    """Two-column info table: Key | Value."""
    if col_widths is None:
        col_widths = [45*mm, None]
    data = []
    for k, v in rows:
        data.append([
            Paragraph(k, ST['cell_bold']),
            Paragraph(v, ST['cell'])
        ])
    t = Table(data, colWidths=col_widths, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,0), (-1,-1), [colors.HexColor('#f9fafb'), WHITE]),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, colors.HexColor('#e5e7eb')),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
        ('ROUNDEDCORNERS', [4,4,4,4]),
    ]))
    return t

def stack_table(headers, rows, col_widths=None):
    """Full table with header row."""
    header_row = [Paragraph(h, ST['label']) for h in headers]
    data = [header_row]
    for row in rows:
        data.append([Paragraph(str(c), ST['cell']) for c in row])
    t = Table(data, colWidths=col_widths, hAlign='LEFT', repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), NAVY_LIGHT),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f9fafb'), WHITE]),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#d1d5db')),
    ]))
    return t

def phase_block(number, title, status, color, items):
    """Migration phase block."""
    title_data = [[
        Paragraph(f'Phase {number}', ParagraphStyle('pn', fontName='Helvetica-Bold',
            fontSize=9, textColor=colors.HexColor('#bfdbfe'))),
        Paragraph(title, ST['phase_title']),
        Paragraph(status, ParagraphStyle('ps', fontName='Helvetica-Bold',
            fontSize=9, textColor=WHITE, alignment=TA_RIGHT)),
    ]]
    header = Table(title_data, colWidths=[20*mm, None, 25*mm])
    header.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('ROUNDEDCORNERS', [4,4,0,0]),
    ]))
    body_items = [[bullet(i)] for i in items]
    body = Table(body_items, colWidths=[None])
    body.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('BOX', (0,0), (-1,-1), 0.5, color),
        ('ROUNDEDCORNERS', [0,0,4,4]),
    ]))
    return KeepTogether([header, body, sp(3)])

# ── Page templates ──────────────────────────────────────────────────────────────

def on_first_page(canvas, doc):
    """Cover page background."""
    canvas.saveState()
    # Dark gradient background
    canvas.setFillColor(NAVY_DARK)
    canvas.rect(0, 0, W, H, fill=1, stroke=0)
    # Accent stripe top
    canvas.setFillColor(BLUE_ACCENT)
    canvas.rect(0, H - 3*mm, W, 3*mm, fill=1, stroke=0)
    # Decorative side bar
    canvas.setFillColor(colors.HexColor('#1e3a5f'))
    canvas.rect(0, 0, 8*mm, H, fill=1, stroke=0)
    canvas.setFillColor(BLUE_ACCENT)
    canvas.rect(0, H*0.3, 8*mm, H*0.4, fill=1, stroke=0)
    canvas.restoreState()

def on_later_pages(canvas, doc):
    """Header/footer for all pages after cover."""
    canvas.saveState()
    # Top bar
    canvas.setFillColor(NAVY_DARK)
    canvas.rect(0, H - 14*mm, W, 14*mm, fill=1, stroke=0)
    canvas.setFillColor(BLUE_ACCENT)
    canvas.rect(0, H - 14*mm, W, 0.8*mm, fill=1, stroke=0)
    # Header text
    canvas.setFont('Helvetica-Bold', 9)
    canvas.setFillColor(WHITE)
    canvas.drawString(15*mm, H - 9*mm, 'Technology Stack Documentation — CRM DCSS PKP')
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#93c5fd'))
    canvas.drawRightString(W - 15*mm, H - 9*mm, f'v2.0 · {date.today().strftime("%B %Y")}')
    # Footer
    canvas.setFillColor(colors.HexColor('#f3f4f6'))
    canvas.rect(0, 0, W, 11*mm, fill=1, stroke=0)
    canvas.setFillColor(BLUE_ACCENT)
    canvas.rect(0, 11*mm, W, 0.4*mm, fill=1, stroke=0)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRAY_DARK)
    canvas.drawString(15*mm, 4*mm, 'PT PKP Indonesia Lestari — Divisi DCSS — CONFIDENTIAL')
    canvas.drawRightString(W - 15*mm, 4*mm, f'Halaman {doc.page - 1}')
    canvas.restoreState()

# ── Build document ─────────────────────────────────────────────────────────────

def build():
    doc = SimpleDocTemplate(
        OUT,
        pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=20*mm, bottomMargin=18*mm,
        title='Technology Stack Documentation — CRM DCSS',
        author='PT PKP Indonesia Lestari',
        subject='CRM System Architecture & Technology Stack',
    )

    story = []

    # ════════════════════════════════════════════════════════════
    # COVER PAGE
    # ════════════════════════════════════════════════════════════
    story.append(sp(30))
    story.append(p('<font color="#3b82f6">⬤</font> <font color="#1e3a5f">⬤</font> <font color="#374151">⬤</font>', 'cover_meta'))
    story.append(sp(8))

    # Big title
    cover_title_data = [[
        Paragraph('CRM DCSS', ParagraphStyle('ct', fontName='Helvetica-Bold',
            fontSize=40, textColor=WHITE, alignment=TA_CENTER, leading=48)),
    ]]
    story.append(Table(cover_title_data, colWidths=[W - 40*mm],
        style=TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')])))

    story.append(sp(3))
    story.append(p('Technology Stack Documentation', 'cover_subtitle'))
    story.append(sp(2))
    story.append(p('PT PKP Indonesia Lestari — Divisi DCSS', 'cover_meta'))
    story.append(sp(15))

    # Version badges
    badge_data = [[
        Paragraph(' v2.0 ', ParagraphStyle('bv', fontName='Helvetica-Bold', fontSize=10,
            textColor=WHITE, alignment=TA_CENTER)),
        Paragraph(f' {date.today().strftime("%d %B %Y")} ', ParagraphStyle('bd', fontName='Helvetica',
            fontSize=10, textColor=colors.HexColor('#93c5fd'), alignment=TA_CENTER)),
        Paragraph(' Phase 1–3 Complete ', ParagraphStyle('bp', fontName='Helvetica-Bold', fontSize=10,
            textColor=colors.HexColor('#86efac'), alignment=TA_CENTER)),
    ]]
    badge_tbl = Table(badge_data, colWidths=[25*mm, 50*mm, 50*mm],
        style=TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('BACKGROUND', (0,0), (0,0), BLUE_ACCENT),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#1e3a5f')),
            ('BACKGROUND', (2,0), (2,0), colors.HexColor('#14532d')),
            ('ROUNDEDCORNERS', [4,4,4,4]),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('COLPADDING', (0,0), (1,0), 4),
        ]))
    story.append(Table([[badge_tbl]], colWidths=[None],
        style=TableStyle([('ALIGN', (0,0), (-1,-1), 'CENTER')])))

    story.append(sp(20))

    # Divider line
    story.append(HRFlowable(width='100%', thickness=0.5, color=colors.HexColor('#374151'),
        spaceAfter=10*mm, spaceBefore=0))

    # Summary boxes on cover
    cover_boxes = [
        ('🗄', 'Database', 'PostgreSQL 18'),
        ('⚡', 'Backend', 'FastAPI + Python 3'),
        ('🌐', 'Frontend', 'Nuxt 3 + Vue 3'),
        ('🔐', 'Auth', 'JWT Bearer Token'),
    ]
    box_data = []
    for icon, label, value in cover_boxes:
        box_data.append(Table([[
            Paragraph(icon, ParagraphStyle('ci', fontSize=20, alignment=TA_CENTER)),
            Paragraph(f'<font color="#93c5fd" size="8">{label}</font><br/>'
                      f'<font color="white" size="11"><b>{value}</b></font>',
                      ParagraphStyle('cv', fontName='Helvetica', fontSize=10,
                                     textColor=WHITE, leading=14)),
        ]], colWidths=[16*mm, None],
        style=TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#1e3a5f')),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('ROUNDEDCORNERS', [6,6,6,6]),
            ('BOX', (0,0), (-1,-1), 0.5, BLUE_ACCENT),
        ])))

    row1 = Table([[box_data[0], sp(3), box_data[1]]], colWidths=[None, 5*mm, None])
    row2 = Table([[box_data[2], sp(3), box_data[3]]], colWidths=[None, 5*mm, None])
    story.append(row1)
    story.append(sp(3))
    story.append(row2)
    story.append(sp(20))

    story.append(p('Dokumen ini menjelaskan arsitektur teknis, stack teknologi, dan keputusan desain '
                   'dari sistem CRM Leads Tracker milik Divisi DCSS PT PKP Indonesia Lestari. '
                   'Sistem ini telah melalui 3 fase migrasi: SQLite → PostgreSQL, '
                   'Jinja2 SSR → REST API, dan Frontend → Nuxt 3 SPA.',
                   'cover_meta'))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # TABLE OF CONTENTS
    # ════════════════════════════════════════════════════════════
    story.append(section_header('', 'Daftar Isi'))
    story.append(hr())

    toc_items = [
        ('1', 'Ringkasan Eksekutif'),
        ('2', 'Arsitektur Sistem'),
        ('3', 'Backend — FastAPI & Python'),
        ('4', 'Database — PostgreSQL 18'),
        ('5', 'REST API — Endpoint & Autentikasi'),
        ('6', 'Frontend — Nuxt 3 & Vue 3'),
        ('7', 'Infrastruktur & Deployment'),
        ('8', 'Roadmap Migrasi (Phase 1–4)'),
        ('9', 'Database Schema'),
        ('10', 'Keamanan & Best Practices'),
        ('11', 'Panduan Operasional'),
    ]
    for num, title in toc_items:
        story.append(Table([[
            Paragraph(num, ST['toc_num']),
            Paragraph(title, ST['toc_item']),
        ]], colWidths=[12*mm, None],
        style=TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LINEBELOW', (0,0), (-1,-1), 0.3, colors.HexColor('#e5e7eb')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ])))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 1. RINGKASAN EKSEKUTIF
    # ════════════════════════════════════════════════════════════
    story.append(section_header('1', 'Ringkasan Eksekutif'))
    story.append(hr())

    story.append(p('CRM Leads Tracker adalah sistem manajemen pipeline penjualan dan monitoring revenue '
                   'yang dikembangkan secara internal untuk Divisi DCSS PT PKP Indonesia Lestari. '
                   'Sistem ini mencakup modul <b>Pipeline CRM</b>, <b>Follow-Up Tracking</b>, '
                   '<b>Revenue Monitoring LOB</b>, <b>Invoice & Payment</b>, dan <b>KPI Prospecting</b>.'))

    story.append(p('Pada tahun 2026, sistem mengalami migrasi arsitektur dari aplikasi monolitik '
                   '(FastAPI + Jinja2 + SQLite) menjadi arsitektur <b>REST API + SPA</b> modern '
                   '(FastAPI REST + PostgreSQL + Nuxt 3).'))

    story.append(sp(2))
    story.append(p('Metrik Sistem:', 'h3'))

    kpi_data = [
        ['Metrik', 'Nilai', 'Keterangan'],
        ['Total Records Migrasi', '687 rows', 'Dari 12 tabel SQLite → PostgreSQL'],
        ['Total REST Endpoints', '26 endpoint', 'Auth, Pipeline, Revenue, Master'],
        ['Total Halaman Frontend', '14 halaman', 'Nuxt 3 SPA + 3 komponen shared'],
        ['Total Tabel Database', '12 tabel', 'PostgreSQL dengan 8 performance index'],
        ['Uptime Target', '99.5%', 'Single-server deployment'],
        ['Response Time API', '< 100ms', 'Per endpoint pada data saat ini'],
        ['Data Leads Aktif', '23 leads', 'Per Juni 2026'],
        ['Revenue Projects', '37 proyek', 'Tahun 2026, is_active=true'],
    ]
    story.append(stack_table(kpi_data[0], kpi_data[1:],
        col_widths=[55*mm, 35*mm, None]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 2. ARSITEKTUR SISTEM
    # ════════════════════════════════════════════════════════════
    story.append(section_header('2', 'Arsitektur Sistem'))
    story.append(hr())

    story.append(p('Sistem menggunakan arsitektur <b>3-tier</b> dengan pemisahan yang jelas '
                   'antara Presentation, Business Logic, dan Data layer.'))

    # Architecture diagram (text-based)
    arch_text = [
        ['Layer', 'Teknologi', 'Port', 'Deskripsi'],
        ['Presentation', 'Nuxt 3 + Vue 3 + Tailwind CSS', ':3000',
         'SPA — Single Page Application, dikonsumsi browser'],
        ['API Gateway', 'FastAPI + Python 3.9', ':8001',
         'REST API, JWT auth, CORS, JSON responses'],
        ['Legacy SSR', 'FastAPI + Jinja2 Templates', ':8080',
         'Server-Side Rendering (dipertahankan selama transisi)'],
        ['Data', 'PostgreSQL 18 + psycopg2', ':5432',
         'Relational DB, RealDictCursor, connection pooling'],
    ]
    story.append(stack_table(arch_text[0], arch_text[1:],
        col_widths=[28*mm, 52*mm, 18*mm, None]))
    story.append(sp(3))

    # Request flow
    story.append(p('Alur Request:', 'h3'))

    flow_steps = [
        ('Browser', 'User membuka http://localhost:3000', BLUE_ACCENT),
        ('Middleware', 'Nuxt auth middleware cek JWT di localStorage', PURPLE),
        ('Nuxt Page', 'useAsyncData() memanggil useApi().get()', colors.HexColor('#0891b2')),
        ('REST API', 'FastAPI validasi JWT → query PostgreSQL → return JSON', GREEN),
        ('Database', 'PostgreSQL eksekusi query, return rows via psycopg2', YELLOW),
        ('Render', 'Nuxt Vue component render data ke DOM', BLUE_ACCENT),
    ]

    for i, (step, desc, color) in enumerate(flow_steps):
        arrow = '↓' if i < len(flow_steps)-1 else ''
        row = Table([[
            Table([[Paragraph(step, ParagraphStyle('fs', fontName='Helvetica-Bold',
                fontSize=8, textColor=WHITE, alignment=TA_CENTER))]],
                style=TableStyle([
                    ('BACKGROUND', (0,0), (-1,-1), color),
                    ('TOPPADDING', (0,0), (-1,-1), 4),
                    ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                    ('LEFTPADDING', (0,0), (-1,-1), 4),
                    ('RIGHTPADDING', (0,0), (-1,-1), 4),
                    ('ROUNDEDCORNERS', [4,4,4,4]),
                ])),
            Paragraph(desc, ST['cell']),
        ]], colWidths=[30*mm, None],
        style=TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(row)
        if arrow:
            story.append(p(f'<font color="#9ca3af">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{arrow}</font>', 'body_small'))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 3. BACKEND — FastAPI
    # ════════════════════════════════════════════════════════════
    story.append(section_header('3', 'Backend — FastAPI & Python'))
    story.append(hr())

    story.append(p('Backend dibangun di atas <b>FastAPI</b>, framework Python modern berbasis '
                   'ASGI dengan dukungan async, type hints, dan auto-generate dokumentasi OpenAPI.'))

    story.append(p('Dependensi Backend:', 'h3'))
    deps_data = [
        ['Package', 'Versi', 'Fungsi'],
        ['fastapi', '≥ 0.110', 'Web framework utama — routing, dependency injection, OpenAPI'],
        ['uvicorn[standard]', '≥ 0.29', 'ASGI server — menjalankan FastAPI'],
        ['psycopg2-binary', '2.9.12', 'Driver PostgreSQL untuk Python'],
        ['python-jose[cryptography]', '3.5.0', 'JWT encode/decode — autentikasi REST API'],
        ['pydantic', '≥ 2.0', 'Data validation & serialization (terintegrasi di FastAPI)'],
        ['python-multipart', '≥ 0.0.9', 'Form data parsing (diperlukan FastAPI untuk Form())'],
        ['starlette', '≥ 0.36', 'Middleware SessionMiddleware (digunakan legacy SSR)'],
        ['openpyxl', '≥ 3.1', 'Export data ke format Excel (.xlsx)'],
        ['jinja2', '≥ 3.1', 'Template engine untuk legacy SSR (main.py)'],
    ]
    story.append(stack_table(deps_data[0], deps_data[1:],
        col_widths=[45*mm, 28*mm, None]))
    story.append(sp(3))

    story.append(p('File Utama:', 'h3'))
    files_data = [
        ['File', 'Deskripsi'],
        ['main.py', 'FastAPI SSR — route handler dengan Jinja2 templates (legacy, port 8080)'],
        ['api_app.py', 'FastAPI REST API — 26 endpoint JSON, JWT auth, CORS (port 8001)'],
        ['database_pg.py', 'PostgreSQL connection wrapper — get_conn(), init_db(), helper functions'],
    ]
    story.append(stack_table(files_data[0], files_data[1:], col_widths=[40*mm, None]))
    story.append(sp(3))

    story.append(p('Struktur api_app.py:', 'h3'))
    for section, items in [
        ('Konstanta & Helpers', [
            'SECRET_KEY, ALGORITHM, TOKEN_EXPIRE_HOURS — konfigurasi JWT',
            '_norm(dict) → konversi datetime.date & Decimal ke JSON-compatible types',
            'compute_stale_flag() — kalkulasi status stale lead',
            'auto_status_risk() — kalkulasi status & risk revenue project',
            'sync_project_status() — sinkronisasi actual revenue dari invoice',
        ]),
        ('Auth (OAuth2PasswordBearer)', [
            'create_token() — generate JWT dengan expiry 24 jam',
            'get_current_user() — decode JWT, query user dari DB',
            'require_menu(key) — dependency factory untuk cek role-based access',
        ]),
        ('CORS Middleware', [
            'allow_origins: localhost:3000 (Nuxt dev), configurable via env',
            'allow_credentials: True (untuk cookie jika diperlukan)',
            'allow_methods & allow_headers: * (semua)',
        ]),
    ]:
        story.append(p(f'<b>{section}:</b>'))
        for item in items:
            story.append(bullet(item))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 4. DATABASE — PostgreSQL
    # ════════════════════════════════════════════════════════════
    story.append(section_header('4', 'Database — PostgreSQL 18'))
    story.append(hr())

    story.append(p('Database menggunakan <b>PostgreSQL 18</b> yang diinstall via GUI installer '
                   'di <code>/Library/PostgreSQL/18/</code>. Migrasi dilakukan dari SQLite3 '
                   'dengan 687 rows data yang berhasil dipindahkan 100%.'))

    story.append(p('Konfigurasi Koneksi:', 'h3'))
    story.append(info_table([
        ('Host', 'localhost'),
        ('Port', '5432'),
        ('Database', 'crm_leads'),
        ('User', 'crm_user'),
        ('Password', 'crm_password_2026 (via env CRM_DB_PASS)'),
        ('Cursor Factory', 'psycopg2.extras.RealDictCursor'),
        ('Encoding', 'UTF-8'),
    ]))
    story.append(sp(3))

    story.append(p('Tabel Database (12 tabel):', 'h3'))
    tables_data = [
        ['Tabel', 'Rows', 'Deskripsi', 'Key Columns'],
        ['roles', '3', 'Role pengguna (Admin, Manager, Sales)',
         'id SERIAL, nama, deskripsi'],
        ['role_menus', '45', 'Mapping role → menu yang diizinkan',
         'role_id, menu_key — UNIQUE'],
        ['users', '5', 'Akun pengguna aplikasi',
         'id, nama, email, password (SHA-256), role_id'],
        ['leads', '23', 'Data lead pipeline CRM',
         'lead_id TEXT PK, stage, prioritas, propose_value NUMERIC'],
        ['follow_up_log', '1+', 'Log aktivitas follow-up',
         'fu_id TEXT PK, lead_id FK, tgl_fu DATE, metode_fu'],
        ['contacts', '3+', 'Kontak per perusahaan/lead',
         'id SERIAL, lead_id FK, nama_contact, jabatan'],
        ['win_loss', '0+', 'Rekap lead Won/Lost',
         'id SERIAL, lead_id, hasil, deal_value, tgl_closed'],
        ['revenue_projects', '37', 'Proyek revenue per LOB',
         'project_id TEXT PK, revenue_target, actual_revenue, status GENERATED'],
        ['revenue_monthly', '444', 'Target & actual per bulan per proyek',
         'project_id FK, month_num, month_name, target, actual'],
        ['invoices', '69', 'Invoice & pembayaran',
         'id SERIAL, project_id FK, invoice_amount, paid_amount'],
        ['kpi_prospecting', '40', 'KPI target prospecting per quarter',
         'id SERIAL, kpi_category, q1_target..q4_actual'],
        ['budget_items', '5', 'Monitoring budget BSC',
         'id SERIAL, perspektif_bsc, budget_amount, actual_amount'],
    ]
    story.append(stack_table(tables_data[0], tables_data[1:],
        col_widths=[35*mm, 14*mm, 55*mm, None]))
    story.append(sp(3))

    story.append(p('Perbedaan SQLite → PostgreSQL:', 'h3'))
    diff_data = [
        ['Aspek', 'SQLite (lama)', 'PostgreSQL (baru)'],
        ['Primary Key', 'INTEGER PRIMARY KEY AUTOINCREMENT', 'SERIAL PRIMARY KEY'],
        ['Date Type', 'TEXT (string)', 'DATE (native, returns datetime.date)'],
        ['Placeholder', '? (qmark)', '%s (pyformat)'],
        ['Connection', 'sqlite3.connect() + conn.execute()', 'psycopg2.connect() + cursor'],
        ['Date Arith.', "julianday('now') - julianday(col)", '(CURRENT_DATE - col)::integer'],
        ['Current Date', "date('now','localtime')", 'CURRENT_DATE'],
        ['Current TS', "datetime('now','localtime')", 'NOW()'],
        ['Insert Skip', 'INSERT OR IGNORE INTO', 'INSERT ... ON CONFLICT DO NOTHING'],
        ['Last Insert ID', 'cursor.lastrowid', 'RETURNING id'],
        ['Numeric Type', 'REAL / INTEGER', 'NUMERIC / FLOAT (returns Decimal)'],
        ['Group By', 'Lenient', 'Strict — semua non-aggregate harus di GROUP BY'],
    ]
    story.append(stack_table(diff_data[0], diff_data[1:],
        col_widths=[35*mm, 60*mm, None]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 5. REST API
    # ════════════════════════════════════════════════════════════
    story.append(section_header('5', 'REST API — Endpoint & Autentikasi'))
    story.append(hr())

    story.append(p('<b>Base URL:</b> <code>http://localhost:8001</code>  |  '
                   '<b>Docs:</b> <code>http://localhost:8001/api/docs</code> (Swagger UI)'))
    story.append(sp(2))

    story.append(p('Autentikasi JWT:', 'h3'))
    story.append(p('Semua endpoint (kecuali <code>/api/v1/auth/login</code> dan <code>/api/v1/health</code>) '
                   'menggunakan <b>OAuth2 Bearer Token</b>. Token dikirim via header:'))
    story.append(Paragraph('<code>Authorization: Bearer &lt;JWT_TOKEN&gt;</code>', ST['code']))
    story.append(p('Token berisi payload: <code>sub</code> (user_id), <code>email</code>, '
                   '<code>role_id</code>, <code>exp</code> (24 jam).'))
    story.append(sp(2))

    story.append(p('Daftar Endpoint (26 endpoint):', 'h3'))
    ep_data = [
        ['Method', 'Endpoint', 'Auth', 'Deskripsi'],
        ['POST', '/api/v1/auth/login', '—', 'Login → return JWT token + user info'],
        ['GET', '/api/v1/auth/me', '✓', 'Info user yang sedang login + daftar menu'],
        ['GET', '/api/v1/health', '—', 'Health check — status DB connection'],
        ['GET', '/api/v1/dashboard', '✓', 'Statistik dashboard, by_stage, stale alerts'],
        ['GET', '/api/v1/pipeline', '✓', 'List leads dengan filter stage/segmen/search/sales'],
        ['POST', '/api/v1/pipeline', '✓', 'Buat lead baru — return lead_id'],
        ['GET', '/api/v1/pipeline/{id}', '✓', 'Detail lead + fu_logs + contacts'],
        ['PUT', '/api/v1/pipeline/{id}', '✓', 'Update lead'],
        ['DELETE', '/api/v1/pipeline/{id}', '✓', 'Hapus lead + cascade FU & contacts'],
        ['GET', '/api/v1/today', '✓', 'Overdue, due today, upcoming 7 hari, unscheduled'],
        ['GET', '/api/v1/schedule', '✓', 'FU schedule terurut by date'],
        ['GET', '/api/v1/followup', '✓', 'List FU log dengan filter'],
        ['POST', '/api/v1/followup', '✓', 'Catat FU baru + update last_fu_date di leads'],
        ['GET', '/api/v1/winloss', '✓', 'Win/loss records + statistik'],
        ['GET', '/api/v1/contacts', '✓', 'List kontak dengan search'],
        ['POST', '/api/v1/contacts', '✓', 'Tambah kontak baru'],
        ['GET', '/api/v1/insights', '✓', 'Pipeline insights — funnel, scorecard'],
        ['GET', '/api/v1/revenue/summary', '✓', 'Revenue dashboard summary per tahun'],
        ['GET', '/api/v1/revenue/insights', '✓', 'Revenue insights — zero projects, monthly trend'],
        ['GET', '/api/v1/revenue/projects', '✓', 'List revenue projects dengan filter'],
        ['POST', '/api/v1/revenue/projects', '✓', 'Buat proyek revenue baru'],
        ['GET', '/api/v1/revenue/monthly', '✓', 'Monthly monitoring per bulan'],
        ['GET', '/api/v1/revenue/invoices', '✓', 'List invoice dengan filter'],
        ['POST', '/api/v1/revenue/invoices', '✓', 'Buat invoice baru + sync actual revenue'],
        ['POST', '/api/v1/revenue/invoices/{id}/pay', '✓', 'Konfirmasi pembayaran invoice'],
        ['GET', '/api/v1/revenue/kpi', '✓', 'KPI prospecting data'],
        ['PUT', '/api/v1/revenue/kpi/{id}', '✓', 'Update actual KPI per quarter'],
        ['GET', '/api/v1/revenue/budget', '✓', 'Budget monitoring BSC'],
        ['PUT', '/api/v1/revenue/budget/{id}', '✓', 'Update actual budget item'],
        ['GET', '/api/v1/roles', '✓', 'Master roles + menu mapping'],
        ['GET', '/api/v1/users', '✓', 'Master users + roles'],
        ['GET', '/api/v1/sales', '✓', 'Daftar sales (dari tabel users)'],
        ['GET', '/api/v1/menus', '✓', 'Menu yang diizinkan untuk user aktif'],
    ]
    story.append(stack_table(ep_data[0], ep_data[1:],
        col_widths=[16*mm, 58*mm, 12*mm, None]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 6. FRONTEND — Nuxt 3
    # ════════════════════════════════════════════════════════════
    story.append(section_header('6', 'Frontend — Nuxt 3 & Vue 3'))
    story.append(hr())

    story.append(p('Frontend dibangun menggunakan <b>Nuxt 3</b> (Vue 3 + Vite + TypeScript), '
                   'berjalan sebagai SPA (Single Page Application) di port 3000. '
                   'Semua data-fetching dilakukan client-side melalui REST API di port 8001.'))

    story.append(p('Dependensi Frontend:', 'h3'))
    fe_deps = [
        ['Package', 'Versi', 'Fungsi'],
        ['nuxt', '3.15.x', 'Framework Vue 3 fullstack — routing, SSR, auto-import'],
        ['vue', '3.x', 'Core UI framework — Composition API, reactive()'],
        ['pinia', '2.3.x', 'State management — auth store (JWT + localStorage)'],
        ['@pinia/nuxt', '0.9.x', 'Nuxt module untuk Pinia integration'],
        ['@nuxtjs/tailwindcss', '6.12.x', 'Tailwind CSS integration via PostCSS'],
        ['tailwindcss', '3.x', 'Utility-first CSS framework'],
        ['typescript', '5.x', 'Type safety (via Nuxt built-in)'],
        ['node.js', '22.22.x', 'Runtime environment (via nvm)'],
    ]
    story.append(stack_table(fe_deps[0], fe_deps[1:],
        col_widths=[45*mm, 20*mm, None]))
    story.append(sp(3))

    story.append(p('Struktur File Frontend:', 'h3'))
    struct_data = [
        ['Path', 'Tipe', 'Deskripsi'],
        ['pages/login.vue', 'Page', 'Form login dengan JWT token handling'],
        ['pages/index.vue', 'Page', 'Dashboard — stats, by_stage, stale alerts'],
        ['pages/pipeline/index.vue', 'Page', 'List leads dengan filter & delete'],
        ['pages/pipeline/new.vue', 'Page', 'Form tambah lead baru'],
        ['pages/pipeline/[id].vue', 'Page', 'Detail lead + FU log + tambah FU'],
        ['pages/pipeline/[id]/edit.vue', 'Page', 'Form edit lead'],
        ['pages/today.vue', 'Page', 'Aktivitas hari ini — overdue, due today, upcoming'],
        ['pages/schedule.vue', 'Page', 'Jadwal FU terurut'],
        ['pages/followup.vue', 'Page', 'Log follow-up dengan search & filter'],
        ['pages/winloss.vue', 'Page', 'Win/Loss records + statistik'],
        ['pages/contacts.vue', 'Page', 'Direktori kontak'],
        ['pages/insights.vue', 'Page', 'Pipeline insights — funnel, scorecard'],
        ['pages/revenue/index.vue', 'Page', 'Revenue dashboard per tahun'],
        ['pages/revenue/tracker.vue', 'Page', 'Revenue tracker + tambah proyek'],
        ['pages/revenue/monthly.vue', 'Page', 'Monthly monitoring per bulan'],
        ['pages/revenue/invoice.vue', 'Page', 'Invoice list + bayar + tambah'],
        ['pages/revenue/insights.vue', 'Page', 'Revenue insights detail'],
        ['layouts/default.vue', 'Layout', 'Sidebar + topbar + slot konten'],
        ['middleware/auth.ts', 'Middleware', 'Global route guard — redirect ke /login'],
        ['stores/auth.ts', 'Pinia Store', 'JWT token, user info, localStorage persistence'],
        ['composables/useApi.ts', 'Composable', 'HTTP client wrapper — auto inject Bearer token'],
        ['composables/useFormat.ts', 'Composable', 'Formatter — rupiah, persen, tanggal, badge color'],
        ['components/LeadForm.vue', 'Component', 'Form create/edit lead (reusable)'],
        ['components/LeadList.vue', 'Component', 'Daftar lead mini dengan badge & nilai'],
        ['components/InfoRow.vue', 'Component', 'Row label-value untuk detail view'],
        ['assets/css/main.css', 'Style', 'Design system — card, badge, btn, form, tbl classes'],
    ]
    story.append(stack_table(struct_data[0], struct_data[1:],
        col_widths=[60*mm, 22*mm, None]))

    story.append(sp(3))
    story.append(p('Design System (Tailwind custom classes):', 'h3'))
    ds_items = [
        '.card / .card-sm — container konten utama dengan border navy',
        '.stat-card — kartu statistik dengan ikon dan angka besar',
        '.badge-* — badge berwarna (blue, green, yellow, red, gray, purple)',
        '.btn-* — tombol (primary, secondary, danger, ghost) + size modifier (sm, xs)',
        '.tbl — styled table dengan header navy dan alternating row colors',
        '.form-input / .form-select / .form-textarea — dark-themed form controls',
        '.progress-bar / .progress-fill — progress bar dengan warna dinamis',
        '.nav-item / .nav-group-label — sidebar navigation items',
        '.section-title — label section uppercase dengan tracking',
        '.empty-state — placeholder saat data kosong',
    ]
    for item in ds_items:
        story.append(bullet(item))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 7. INFRASTRUKTUR & DEPLOYMENT
    # ════════════════════════════════════════════════════════════
    story.append(section_header('7', 'Infrastruktur & Deployment'))
    story.append(hr())

    story.append(p('Saat ini sistem berjalan di <b>development environment</b> di MacBook lokal. '
                   'Tiga service berjalan secara paralel:'))

    services_data = [
        ['Service', 'Port', 'Teknologi', 'Log File', 'Status'],
        ['Nuxt 3 Frontend', '3000', 'Node.js v22 + Nuxt dev', '/tmp/crm_nuxt.log', '🟢 Active'],
        ['FastAPI REST API', '8001', 'Python + Uvicorn', '/tmp/crm_api.log', '🟢 Active'],
        ['FastAPI SSR Legacy', '8080', 'Python + Uvicorn', '/tmp/crm_ssr.log', '🟡 Legacy'],
        ['PostgreSQL 18', '5432', 'PostgreSQL daemon', 'PostgreSQL logs', '🟢 Active'],
    ]
    story.append(stack_table(services_data[0], services_data[1:],
        col_widths=[40*mm, 15*mm, 38*mm, 40*mm, None]))
    story.append(sp(3))

    story.append(p('Environment Variables:', 'h3'))
    story.append(info_table([
        ('CRM_DB_HOST', 'localhost (default)'),
        ('CRM_DB_PORT', '5432 (default)'),
        ('CRM_DB_NAME', 'crm_leads'),
        ('CRM_DB_USER', 'crm_user'),
        ('CRM_DB_PASS', 'crm_password_2026 (ganti di production!)'),
        ('CRM_JWT_SECRET', 'crm-dcss-pkp-jwt-2026-super-secret-key'),
        ('CRM_FRONTEND_URL', 'http://localhost:3000 (CORS origin)'),
        ('NUXT_PUBLIC_API_BASE', 'http://localhost:8001'),
    ]))
    story.append(sp(3))

    story.append(p('Cara Menjalankan (satu perintah):', 'h3'))
    story.append(Paragraph(
        'cd /Users/hariman/.../Leads_tracker\n./start_all.sh',
        ST['code']))

    story.append(p('Atau manual:', 'h3'))
    story.append(Paragraph(
        '# Terminal 1 — REST API\npython3 -m uvicorn api_app:app --port 8001 --reload\n\n'
        '# Terminal 2 — Nuxt Frontend\ncd frontend && TMPDIR=/tmp npx nuxt dev --port 3000\n\n'
        '# Terminal 3 — Legacy SSR (optional)\npython3 -m uvicorn main:app --port 8080 --reload',
        ST['code']))

    story.append(sp(2))
    story.append(p('Catatan macOS — Unix Socket Path:', 'h3'))
    story.append(p('Nuxt 3 menggunakan Unix socket untuk komunikasi internal Vite Node. '
                   'Di macOS, default TMPDIR memiliki path yang terlalu panjang (>104 karakter, '
                   'batas UNIX_PATH_MAX). Solusi: set <code>TMPDIR=/tmp</code> sebelum menjalankan Nuxt.'))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 8. ROADMAP MIGRASI
    # ════════════════════════════════════════════════════════════
    story.append(section_header('8', 'Roadmap Migrasi (Phase 1–4)'))
    story.append(hr())

    story.append(phase_block(1, 'Database Migration', '✅ SELESAI', GREEN, [
        'Install PostgreSQL 18 via GUI installer di /Library/PostgreSQL/18/',
        'Buat user crm_user dan database crm_leads (migrate/00_setup_db.sql)',
        'Buat schema 12 tabel dengan tipe data PostgreSQL native (migrate/01_schema_postgres.sql)',
        'Migrasi 687 rows data dari SQLite → PostgreSQL (migrate/02_migrate_data.py)',
        'Verifikasi 100% row count semua tabel cocok (migrate/03_verify.py)',
        'Patch main.py: ganti sqlite3 → psycopg2, ? → %s, julianday → date arithmetic',
        'Buat database_pg.py: wrapper koneksi PostgreSQL dengan RealDictCursor',
        'Fix Decimal/date type compatibility dengan helper _norm() dan float() cast',
        'Hasil: 12/12 routes HTTP 200, zero error',
    ]))

    story.append(phase_block(2, 'REST API', '✅ SELESAI', BLUE_ACCENT, [
        'Install python-jose[cryptography] untuk JWT handling',
        'Buat api_app.py: FastAPI REST API terpisah di port 8001',
        'Implementasi JWT auth: login → token, Bearer token middleware, role-based guard',
        'Tambah CORS middleware untuk localhost:3000 (Nuxt dev server)',
        'Buat 26 endpoint JSON: Auth, Pipeline CRUD, Today, Schedule, FU, WinLoss, Contacts, Revenue',
        'Implementasi Pydantic models untuk request validation (LeadCreate, InvoiceCreate, dll)',
        'Test 22 endpoint GET + semua CRUD (POST/PUT/DELETE) — 100% berhasil',
        'Swagger UI tersedia di /api/docs',
    ]))

    story.append(phase_block(3, 'Nuxt 3 Frontend', '✅ SELESAI', PURPLE, [
        'Install Node.js v22 via nvm, install Nuxt 3 + Pinia + Tailwind CSS',
        'Buat design system di assets/css/main.css (card, badge, btn, form, table, nav)',
        'Implementasi Pinia auth store: JWT persistence di localStorage',
        'Buat composable useApi.ts: HTTP client dengan auto Bearer token injection',
        'Buat composable useFormat.ts: formatter rupiah, tanggal, badge color',
        'Buat middleware auth.ts: global route guard redirect ke /login',
        'Buat default layout: responsive sidebar + topbar',
        '14 halaman Vue: Login, Dashboard, Pipeline (CRUD), Today, Schedule, FU, Win-Loss, Contacts, Insights, Revenue (5 modul)',
        '3 komponen shared: LeadForm, LeadList, InfoRow',
        'Buat start_all.sh: script satu klik untuk start semua service',
    ]))

    story.append(phase_block(4, 'Testing & Production Deploy', '🔄 PLANNED', YELLOW, [
        'Unit testing API endpoints dengan pytest + httpx',
        'End-to-end testing Nuxt pages dengan Playwright',
        'Performance testing — load test dengan k6',
        'Setup production server (VPS/cloud) dengan Nginx reverse proxy',
        'Docker compose untuk containerize semua service',
        'SSL/TLS certificate (Let\'s Encrypt)',
        'Environment-based config (.env.production)',
        'Setup backup otomatis PostgreSQL (pg_dump cronjob)',
        'Monitoring dengan Prometheus + Grafana',
        'CI/CD pipeline (GitHub Actions)',
    ]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 9. DATABASE SCHEMA
    # ════════════════════════════════════════════════════════════
    story.append(section_header('9', 'Database Schema (Key Tables)'))
    story.append(hr())

    story.append(p('Leads Table (tabel utama pipeline):', 'h3'))
    leads_cols = [
        ['Column', 'Type', 'Constraint', 'Deskripsi'],
        ['id', 'SERIAL', 'PRIMARY KEY', 'Auto-increment internal ID'],
        ['lead_id', 'TEXT', 'UNIQUE NOT NULL', 'Business key: LD-001, LD-002, ...'],
        ['nama_company', 'TEXT', 'NOT NULL', 'Nama perusahaan target'],
        ['product', 'TEXT', '', 'Produk/layanan yang ditawarkan'],
        ['stage', 'TEXT', 'DEFAULT "New"', 'New, In Progress, Proposal Sent, Won, Lost, ...'],
        ['prioritas', 'TEXT', 'DEFAULT "Warm"', 'Hot, Warm, Cold'],
        ['propose_value', 'NUMERIC', 'DEFAULT 0', 'Nilai penawaran dalam Rupiah'],
        ['deal_value', 'NUMERIC', 'DEFAULT 0', 'Nilai deal yang disepakati'],
        ['probability', 'NUMERIC', 'DEFAULT 0', 'Probabilitas close dalam %'],
        ['tgl_masuk', 'DATE', '', 'Tanggal lead masuk pipeline'],
        ['next_fu_date', 'DATE', '', 'Jadwal follow-up berikutnya'],
        ['last_fu_date', 'DATE', '', 'Tanggal FU terakhir'],
        ['created_at', 'TIMESTAMP', 'DEFAULT NOW()', 'Waktu record dibuat'],
    ]
    story.append(stack_table(leads_cols[0], leads_cols[1:],
        col_widths=[35*mm, 22*mm, 35*mm, None]))
    story.append(sp(3))

    story.append(p('Revenue Projects Table:', 'h3'))
    rev_cols = [
        ['Column', 'Type', 'Constraint', 'Deskripsi'],
        ['project_id', 'TEXT', 'PRIMARY KEY', 'REV-0001, REV-0002, ...'],
        ['owner', 'TEXT', '', 'AMA, EIW, DCSS'],
        ['kategori', 'TEXT', '', 'Project, Recurring'],
        ['type', 'TEXT', '', 'One Time, Termin, Bulanan, Tahunan'],
        ['tahun', 'INTEGER', '', 'Tahun target (2025, 2026, ...)'],
        ['revenue_target', 'NUMERIC', 'DEFAULT 0', 'Target revenue dalam Rupiah'],
        ['actual_revenue', 'NUMERIC', 'DEFAULT 0', 'Realisasi dari SUM invoices'],
        ['status', 'TEXT GENERATED', 'STORED', 'On Track / At Risk / Critical (auto-calc)'],
        ['achievement_pct', 'NUMERIC GENERATED', 'STORED', 'actual/target × 100 (auto-calc)'],
        ['risk_level', 'TEXT', '', 'HIGH, MEDIUM, LOW'],
    ]
    story.append(stack_table(rev_cols[0], rev_cols[1:],
        col_widths=[38*mm, 28*mm, 28*mm, None]))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 10. KEAMANAN
    # ════════════════════════════════════════════════════════════
    story.append(section_header('10', 'Keamanan & Best Practices'))
    story.append(hr())

    for topic, items in [
        ('Autentikasi & Otorisasi', [
            'JWT HS256 — signed dengan SECRET_KEY 256-bit, expiry 24 jam',
            'Password hashing SHA-256 (upgrade ke bcrypt di production direkomendasikan)',
            'Role-Based Access Control (RBAC) — setiap menu dikontrol per role',
            'require_menu() dependency memastikan setiap endpoint cek hak akses',
            'Token disimpan di localStorage (pertimbangkan httpOnly cookie di production)',
        ]),
        ('Database Security', [
            'Dedicated database user crm_user dengan privilege minimal (bukan postgres superuser)',
            'Konfigurasi via environment variables — password tidak hardcode di kode',
            'Foreign key constraints aktif — mencegah orphan records',
            'Parameterized queries di seluruh codebase — tidak ada raw string concatenation',
        ]),
        ('API Security', [
            'CORS dikonfigurasi untuk origin spesifik (localhost:3000, bukan wildcard *)',
            'Input validation via Pydantic models di semua POST/PUT endpoint',
            'HTTPException dengan status code yang tepat (401, 403, 404, 500)',
            'Auto-logout Nuxt jika API mengembalikan 401',
        ]),
        ('Rekomendasi untuk Production', [
            'Ganti SECRET_KEY dengan random 512-bit key (openssl rand -hex 64)',
            'Ganti password crm_user dengan password complex yang disimpan di vault',
            'Aktifkan SSL/TLS untuk PostgreSQL connection',
            'Setup rate limiting di Nginx (misal 100 req/menit per IP)',
            'Enable PostgreSQL logging untuk audit trail',
            'Backup harian dengan pg_dump dan simpan di storage terpisah',
        ]),
    ]:
        story.append(p(f'<b>{topic}:</b>'))
        for item in items:
            story.append(bullet(item))
        story.append(sp(1))

    story.append(PageBreak())

    # ════════════════════════════════════════════════════════════
    # 11. PANDUAN OPERASIONAL
    # ════════════════════════════════════════════════════════════
    story.append(section_header('11', 'Panduan Operasional'))
    story.append(hr())

    story.append(p('Start Semua Service:', 'h3'))
    story.append(Paragraph('./start_all.sh', ST['code']))

    story.append(p('Akses Aplikasi:', 'h3'))
    story.append(info_table([
        ('Nuxt Frontend', 'http://localhost:3000'),
        ('REST API Docs', 'http://localhost:8001/api/docs'),
        ('Legacy SSR', 'http://localhost:8080'),
        ('Login Email', 'hariman@pkp.co.id'),
        ('Login Password', 'pkp2026'),
    ]))
    story.append(sp(3))

    story.append(p('Troubleshooting Umum:', 'h3'))
    trouble_items = [
        ('Nuxt error: Failed to restrict vite-node socket',
         'Path TMPDIR terlalu panjang. Solusi: TMPDIR=/tmp npx nuxt dev --port 3000'),
        ('API error 401 Unauthorized',
         'Token expired atau invalid. Login ulang di /login'),
        ('PostgreSQL: could not connect',
         'pg_isready -h localhost — pastikan PostgreSQL running. Start via pgAdmin atau pg_ctl'),
        ('FastAPI error 500 pada route tertentu',
         'Cek log /tmp/crm_api.log. Biasanya Decimal/date type mismatch — sudah diatasi dengan _norm()'),
        ('Nuxt: useAuthStore is not defined',
         'Pastikan @pinia/nuxt ada di modules nuxt.config.ts dan npm install sudah dijalankan'),
        ('CSS class tidak terdeteksi Tailwind',
         'Hindari hover: modifier dalam @apply di CSS file. Gunakan plain CSS untuk hover states'),
    ]
    for issue, solution in trouble_items:
        story.append(Table([[
            Paragraph(f'❗ {issue}', ParagraphStyle('ti', fontName='Helvetica-Bold',
                fontSize=9, textColor=colors.HexColor('#dc2626'))),
            Paragraph(f'✓ {solution}', ParagraphStyle('ts', fontName='Helvetica',
                fontSize=9, textColor=colors.HexColor('#166534'))),
        ]], colWidths=[None, None],
        style=TableStyle([
            ('BACKGROUND', (0,0), (0,0), colors.HexColor('#fef2f2')),
            ('BACKGROUND', (1,0), (1,0), colors.HexColor('#f0fdf4')),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 5),
            ('LINEBELOW', (0,0), (-1,-1), 0.3, colors.HexColor('#e5e7eb')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#e5e7eb')),
        ])))
        story.append(sp(1))

    story.append(sp(5))
    # Footer note
    story.append(hr(color=GRAY_MID, thickness=0.5))
    story.append(p(f'Dokumen ini dibuat secara otomatis pada {date.today().strftime("%d %B %Y")}. '
                   'Versi teknologi dapat berubah seiring perkembangan sistem. '
                   'Untuk informasi terbaru, lihat kode sumber di folder project Leads_tracker.',
                   'body_small'))

    # ── Build PDF ────────────────────────────────────────────────
    doc.build(story,
              onFirstPage=on_first_page,
              onLaterPages=on_later_pages)
    print(f"✅ PDF berhasil dibuat: {OUT}")
    print(f"   Ukuran: {os.path.getsize(OUT):,} bytes ({os.path.getsize(OUT)//1024} KB)")

if __name__ == '__main__':
    build()
