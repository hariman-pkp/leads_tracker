import pandas as pd
import sqlite3
from database import init_db, get_conn

init_db()

xl = pd.ExcelFile('/Users/hariman/Library/CloudStorage/OneDrive-Personal/PKP/Management/LOB - FSP/KPI/DCSS 2026/CRM_Lead_Tracker.xlsx')
df = pd.read_excel(xl, sheet_name='Pipeline', header=1)
df.columns = [str(c).strip() for c in df.columns]

conn = get_conn()
c = conn.cursor()
c.execute("DELETE FROM leads")

col_map = {
    'ID': 'lead_id', 'Nama Company': 'nama_company', 'Product': 'product',
    'Contact Person': 'contact_person', 'Segmen': 'segmen', 'Sub-segmen': 'sub_segmen',
    'Source': 'source', 'Stage': 'stage', 'Prioritas': 'prioritas',
    'Tgl Masuk': 'tgl_masuk', 'Propose Value': 'propose_value', 'Deal Value (Rp)': 'deal_value',
    'Probability (%)': 'probability', 'Exp. Close Date': 'exp_close_date',
    'Weighted Value': 'weighted_value', 'Sales Owner': 'sales_owner',
    'Next FU Date': 'next_fu_date', 'Last FU Date': 'last_fu_date',
    'Last FU Notes': 'last_fu_notes', 'FU Count': 'fu_count',
    'Days in Stage': 'days_in_stage', 'Remarks': 'remarks'
}

imported = 0
for _, row in df.iterrows():
    lid = str(row.get('ID', '')).strip()
    if not lid or lid == 'nan' or not lid.startswith('LD-'):
        continue
    nama = str(row.get('Nama Company', '')).strip()
    if not nama or nama == 'nan':
        continue

    def val(col, default=None):
        v = row.get(col)
        if pd.isna(v) if pd.notna(v) != v else False:
            return default
        s = str(v).strip()
        return None if s in ('nan', 'NaT', '') else s

    def numval(col):
        v = row.get(col)
        try:
            return float(v) if pd.notna(v) else 0.0
        except:
            return 0.0

    def datestr(col):
        v = row.get(col)
        if pd.isna(v) if not isinstance(v, str) else False:
            return None
        try:
            import pandas as pd2
            ts = pd2.Timestamp(v)
            return ts.strftime('%Y-%m-%d') if not pd.isna(ts) else None
        except:
            return str(v)[:10] if v else None

    pv = numval('Propose Value')
    dv = numval('Deal Value (Rp)')
    prob = numval('Probability (%)')
    wv = dv * (prob/100) if dv else pv * (prob/100)

    conn.execute("""INSERT OR REPLACE INTO leads
        (lead_id,nama_company,product,contact_person,segmen,sub_segmen,source,stage,prioritas,
         tgl_masuk,propose_value,deal_value,probability,exp_close_date,weighted_value,
         sales_owner,next_fu_date,last_fu_date,last_fu_notes,fu_count,days_in_stage,remarks)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (lid, nama, val('Product'), val('Contact Person'), val('Segmen'), val('Sub-segmen'),
         val('Source'), val('Stage','New'), val('Prioritas','Warm'),
         datestr('Tgl Masuk'), pv, dv, prob, datestr('Exp. Close Date'), wv,
         val('Sales Owner'), datestr('Next FU Date'), datestr('Last FU Date'),
         val('Last FU Notes'), int(numval('FU Count')), int(numval('Days in Stage')),
         val('Remarks')))
    imported += 1

conn.commit()
conn.close()
print(f"Imported {imported} leads successfully.")
