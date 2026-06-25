"""
Import data dari Revenue_Monitoring_Tool_2026.xlsx ke database SQLite
"""
import pandas as pd
import sqlite3
import re
from datetime import datetime

EXCEL = '/Users/hariman/Library/CloudStorage/OneDrive-Personal/PKP/Management/LOB - FSP/KPI/DCSS 2026/Revenue_Monitoring_Tool_2026.xlsx'
DB    = 'data/leads.db'
MONTHS = ['January','February','March','April','May','June',
          'July','August','September','October','November','December']

def clean(v, default=None):
    if v is None: return default
    s = str(v).strip()
    return None if s in ('nan','NaT','None','') else s

def numval(v, default=0.0):
    try:
        f = float(v)
        return 0.0 if (f != f) else f  # NaN check
    except: return default

def datestr(v):
    if v is None: return None
    try:
        ts = pd.Timestamp(v)
        return ts.strftime('%Y-%m-%d') if not pd.isna(ts) else None
    except: return None

conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
c = conn.cursor()

xl = pd.ExcelFile(EXCEL)

# ── 1. REVENUE PROJECTS ────────────────────────────────────────────────────────
print("\n── Revenue Projects ──")
c.execute("DELETE FROM revenue_projects")
c.execute("DELETE FROM revenue_monthly")

df = pd.read_excel(xl, sheet_name='Revenue Tracker 2026', header=None)
# Cari baris header (ada "Project ID")
header_row = None
for i, row in df.iterrows():
    if 'Project ID' in str(row.values):
        header_row = i
        break

if header_row is not None:
    df.columns = df.iloc[header_row]
    df = df.iloc[header_row+1:].reset_index(drop=True)

    inserted = 0
    for _, row in df.iterrows():
        pid = clean(row.get('Project ID'))
        if not pid or pid in ('nan','None'): continue
        try: pid_int = int(float(pid))
        except: continue

        project_id = f"REV-{pid_int:04d}"
        c.execute("""INSERT OR REPLACE INTO revenue_projects
            (project_id,lob,owner,product,client,kategori,type,target_month,
             revenue_target,actual_revenue,status,invoice_date,payment_date,
             notes,risk_level,action_required,pic)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
            project_id,
            clean(row.get('LOB'), 'DCSS'),
            clean(row.get('Owner')),
            clean(row.get('Product')),
            clean(row.get('Client')),
            clean(row.get('Kategori')),
            clean(row.get('Type')),
            datestr(row.get('Target Month')),
            numval(row.get('Revenue Target')),
            numval(row.get('Actual Revenue')),
            clean(row.get('Status'), 'Critical'),
            datestr(row.get('Invoice Date')),
            datestr(row.get('Payment Date')),
            clean(row.get('Notes')),
            clean(row.get('Risk Level'), 'HIGH'),
            clean(row.get('Action Required')),
            clean(row.get('PIC')),
        ))
        inserted += 1
    print(f"  Imported {inserted} projects")

# ── 2. MONTHLY REVENUE DETAIL ─────────────────────────────────────────────────
print("\n── Monthly Revenue Detail ──")
df2 = pd.read_excel(xl, sheet_name='Monthly Revenue Detail', header=None)

# Build flat header dari row 0-2
cols = []
cur_month = None
for ci in range(df2.shape[1]):
    v0 = str(df2.iloc[0, ci]).strip()
    v2 = str(df2.iloc[2, ci]).strip()
    if v0 in MONTHS: cur_month = v0
    if v2 in ('nan','None',''):
        # base columns: No, LOB, Product, Client
        base = ['no','lob','product','client']
        cols.append(base[ci] if ci < 4 else f'col_{ci}')
    else:
        suffix = v2.split('-')[-1].lower().replace(' ','_') if '-' in v2 else v2.lower().replace(' ','_')
        cols.append(f"{cur_month}_{suffix}" if cur_month else v2)

df2.columns = cols
df2 = df2.iloc[3:].reset_index(drop=True)  # skip header rows

ins_m = 0
for _, row in df2.iterrows():
    pid_raw = clean(row.get('no'))
    if not pid_raw: continue
    try: pid_int = int(float(pid_raw))
    except: continue
    project_id = f"REV-{pid_int:04d}"

    # Check project exists
    c.execute("SELECT id FROM revenue_projects WHERE project_id=?", (project_id,))
    if not c.fetchone(): continue

    for mi, month in enumerate(MONTHS, 1):
        tgt_col = f"{month}_target" if f"{month}_target" in df2.columns else None
        ach_col  = None
        sts_col  = None
        for col in df2.columns:
            if col.lower().startswith(month.lower()):
                if 'ach' in col.lower() and 'ach' in col.lower()[-8:]:
                    ach_col = col
                elif 'sts' in col.lower() or 'status' in col.lower():
                    sts_col = col

        tgt = numval(row.get(tgt_col, 0)) if tgt_col else 0
        ach = numval(row.get(ach_col, 0)) if ach_col else 0
        sts_raw = clean(row.get(sts_col)) if sts_col else None
        sts = 'Achieve' if sts_raw and 'achive' in sts_raw.lower() else \
              'Not Achieve' if sts_raw and 'not' in sts_raw.lower() else 'Pending'

        c.execute("""INSERT OR REPLACE INTO revenue_monthly
            (project_id,month_num,month_name,target,actual,status)
            VALUES (?,?,?,?,?,?)""",
            (project_id, mi, month, tgt, ach, sts))
        ins_m += 1

print(f"  Imported {ins_m} monthly records")

# ── 3. INVOICES ───────────────────────────────────────────────────────────────
print("\n── Invoices ──")
c.execute("DELETE FROM invoices")
df3 = pd.read_excel(xl, sheet_name='Detail invoice', header=0)

ins_i = 0
for _, row in df3.iterrows():
    pid_raw = clean(row.get('Project ID'))
    if not pid_raw: continue
    try: pid_int = int(float(pid_raw))
    except: continue
    project_id = f"REV-{pid_int:04d}"

    # Multiple invoice numbers in one cell
    inv_nos = str(row.get('Invoice No','')).replace('\n','; ').strip()
    if inv_nos in ('nan','None',''): inv_nos = None

    c.execute("""INSERT INTO invoices
        (project_id,lob,owner,product,client,invoice_no,invoice_date,period,
         invoice_amount,paid_amount,paid_date,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""", (
        project_id,
        clean(row.get('LOB'),'DCSS'),
        clean(row.get('Owner')),
        clean(row.get('Product')),
        clean(row.get('Client')),
        inv_nos,
        datestr(row.get('Invoice Date')),
        clean(row.get('Period')),
        numval(row.get('Invoice Amount')),
        numval(row.get('Paid Amount')),
        datestr(row.get('Paid Date')),
        clean(row.get('NOTES')),
    ))
    ins_i += 1
print(f"  Imported {ins_i} invoices")

# ── 4. KPI PROSPECTING ────────────────────────────────────────────────────────
print("\n── KPI Prospecting ──")
c.execute("DELETE FROM kpi_prospecting")
df4 = pd.read_excel(xl, sheet_name='KPI Prospecting Tracker', header=None)

header_row = None
for i, row in df4.iterrows():
    if 'KPI Category' in str(row.values):
        header_row = i
        break

if header_row is not None:
    df4.columns = df4.iloc[header_row]
    df4 = df4.iloc[header_row+1:].reset_index(drop=True)

    current_cat = None
    sort_n = 0
    for _, row in df4.iterrows():
        cat = clean(row.get('KPI Category'))
        name = clean(row.get('KPI Name'))
        if cat and not name:
            current_cat = cat
            continue
        if not name: continue
        if cat: current_cat = cat

        sort_n += 1
        cols_map = {
            'Q1 Target': 'q1_target', 'Q1 Actual': 'q1_actual',
            'Q2 Target': 'q2_target', 'Q2 Actual': 'q2_actual',
            'Q3 Target': 'q3_target', 'Q3 Actual': 'q3_actual',
            'Q4 Target': 'q4_target', 'Q4 Actual': 'q4_actual',
        }
        vals = {v: numval(row.get(k)) for k, v in cols_map.items()}

        c.execute("""INSERT INTO kpi_prospecting
            (kpi_category,kpi_name,unit,target_annual,
             q1_target,q1_actual,q2_target,q2_actual,
             q3_target,q3_actual,q4_target,q4_actual,sort_order)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""", (
            current_cat, name,
            clean(row.get('Unit'),'Count'),
            numval(row.get('Target 2026')),
            vals['q1_target'], vals['q1_actual'],
            vals['q2_target'], vals['q2_actual'],
            vals['q3_target'], vals['q3_actual'],
            vals['q4_target'], vals['q4_actual'],
            sort_n,
        ))

c.execute("SELECT COUNT(*) FROM kpi_prospecting")
print(f"  Imported {c.fetchone()[0]} KPI items")

# ── 5. BUDGET ITEMS ───────────────────────────────────────────────────────────
print("\n── Budget Items ──")
c.execute("DELETE FROM budget_items")

df5 = pd.read_excel(xl, sheet_name='Budget Summary', header=None)
bsc_cats = ['Financial','Customer','Internal Process','Learning & Growth']
ins_b = 0
current_bsc = None
for i, row in df5.iterrows():
    vals = [clean(v) for v in row if clean(v)]
    if not vals: continue
    # Detect BSC perspective header
    for cat in bsc_cats:
        if any(cat.lower() in str(v).lower() for v in vals):
            current_bsc = cat; break
    if len(vals) >= 2:
        cat_name = vals[0]
        try:
            budget = float(str(vals[1]).replace(',',''))
        except: continue
        if budget > 0 and current_bsc:
            c.execute("""INSERT INTO budget_items
                (perspektif_bsc,category,budget_amount,status)
                VALUES (?,?,?,'Planning')""",
                (current_bsc, cat_name, budget))
            ins_b += 1

# Also add total from Budget Category section
totals = [
    ('Operasional','Initiative Budget', 400_000_000),
    ('Operasional','Marketing Budget',   50_000_000),
    ('Operasional','Recruitment Cost',   30_000_000),
    ('Operasional','Contingency (10%)',  48_000_000),
]
for bsc, cat, amt in totals:
    c.execute("INSERT OR IGNORE INTO budget_items (perspektif_bsc,category,budget_amount,status) VALUES (?,?,?,'Planning')",
              (bsc, cat, amt))

print(f"  Imported {ins_b} budget items")

conn.commit()
conn.close()

print("\n✅ Import selesai!")

# Summary
conn2 = sqlite3.connect(DB)
c2 = conn2.cursor()
for tbl in ['revenue_projects','revenue_monthly','invoices','kpi_prospecting','budget_items']:
    c2.execute(f"SELECT COUNT(*) FROM {tbl}")
    print(f"  {tbl}: {c2.fetchone()[0]} rows")
conn2.close()
