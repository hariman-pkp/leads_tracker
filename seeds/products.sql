-- Master Produk APEX CRM
-- Generated: 2026-06-17
-- Total: 29 produk | SW×8 · SD×6 · MS×5 · PS×1 · IT×6 · MB×2

INSERT INTO products (kode, nama, kategori, deskripsi, is_active, created_at) VALUES

-- ── Software Product / Lisensi ────────────────────────────────────────────
('SW-001', 'Fincore',            'Software Product', 'Core platform fintech',                    true, NOW()),
('SW-002', 'LOS Fincore',        'Software Product', 'Loan Origination System berbasis Fincore', true, NOW()),
('SW-003', 'CFin+',              'Software Product', 'Platform keuangan CFin+',                  true, NOW()),
('SW-004', 'iColls',             'Software Product', 'Sistem collection iColls',                 true, NOW()),
('SW-005', 'Mile-Colls',         'Software Product', 'Sistem collection Mile-Colls',             true, NOW()),
('SW-006', 'iMove',              'Software Product', 'Aplikasi mobile iMove',                    true, NOW()),
('SW-007', 'Jari',               'Software Product', 'Aplikasi Jari',                            true, NOW()),
('SW-008', 'VeriID',             'Software Product', 'Verifikasi identitas digital',             true, NOW()),

-- ── System Development ────────────────────────────────────────────────────
('SD-001', 'Reengineering Collection System',  'System Development', 'Rekayasa ulang sistem collection',         true, NOW()),
('SD-002', 'Reengineering Module Marketing',   'System Development', 'Rekayasa ulang modul marketing',           true, NOW()),
('SD-003', 'Reengineering Sehati Jasa PMO',    'System Development', 'Rekayasa ulang sistem Sehati Jasa PMO',    true, NOW()),
('SD-004', 'CFin+ Development',                'System Development', 'Pengembangan custom platform CFin+',       true, NOW()),
('SD-005', 'SMM Web Compro',                   'System Development', 'Pengembangan web company profile SMM',     true, NOW()),
('SD-006', 'MCD Smart Lawyer Finance',         'System Development', 'Pengembangan sistem MCD Smart Lawyer',     true, NOW()),

-- ── Managed Services / AMC ────────────────────────────────────────────────
('MS-001', 'FM Maintenance',      'Managed Services', 'Fix Maintenance — modul maintenance',        true, NOW()),
('MS-002', 'FM Verification',     'Managed Services', 'Fix Maintenance — modul verifikasi',         true, NOW()),
('MS-003', 'FM UI',               'Managed Services', 'Fix Maintenance — modul UI',                 true, NOW()),
('MS-004', 'FM Collection',       'Managed Services', 'Fix Maintenance — modul collection',         true, NOW()),
('MS-005', 'CFin+ ATS Operation', 'Managed Services', 'Application Technical Support operasional CFin+', true, NOW()),

-- ── Professional Services ─────────────────────────────────────────────────
('PS-001', 'Bulk Mandays',        'Professional Services', 'Layanan mandays konsultasi dan development', true, NOW()),

-- ── Infrastructure & Third-Party ─────────────────────────────────────────
('IT-001', 'Alibaba Cloud MongoDB', 'Infrastructure', 'Layanan database MongoDB via Alibaba Cloud', true, NOW()),
('IT-002', 'Alibaba Cloud OSS',     'Infrastructure', 'Object Storage Service via Alibaba Cloud',   true, NOW()),
('IT-003', 'CRIF Service',          'Infrastructure', 'Layanan data bureau CRIF (Prod & Dev)',      true, NOW()),
('IT-004', 'SMTP Relay Service',    'Infrastructure', 'Layanan pengiriman email SMTP relay',        true, NOW()),
('IT-005', 'E-Materai',             'Infrastructure', 'Layanan e-materai terintegrasi',             true, NOW()),
('IT-006', 'Messaging Service',     'Infrastructure', 'Layanan messaging (SMS/WhatsApp/push)',      true, NOW()),

-- ── Membership / Asosiasi ─────────────────────────────────────────────────
('MB-001', 'IMA Membership',    'Membership', 'Iuran keanggotaan IMA',    true, NOW()),
('MB-002', 'APJAPI Membership', 'Membership', 'Iuran keanggotaan APJAPI', true, NOW())

ON CONFLICT (kode) DO UPDATE
  SET nama       = EXCLUDED.nama,
      kategori   = EXCLUDED.kategori,
      deskripsi  = EXCLUDED.deskripsi,
      updated_at = NOW();
