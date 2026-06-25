import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE = 'http://localhost:8001/api';

// ── Metrics ──────────────────────────────────────────────────────────────────
const errorRate       = new Rate('error_rate');
const totalReqs       = new Counter('total_requests');

// Pipeline
const pipelineListT   = new Trend('pipeline_list_ms',    true);
const pipelineDetailT = new Trend('pipeline_detail_ms',  true);
const pipelineFcastT  = new Trend('pipeline_forecast_ms',true);
const pipelineInsightT= new Trend('pipeline_insight_ms', true);

// Entertain
const entertainListT  = new Trend('entertain_list_ms',   true);
const entertainRekapT = new Trend('entertain_rekap_ms',  true);
const entertainLimitT = new Trend('entertain_limit_ms',  true);

// Revenue
const revSummaryT     = new Trend('revenue_summary_ms',  true);
const revProjectsT    = new Trend('revenue_projects_ms', true);
const revInsightT     = new Trend('revenue_insight_ms',  true);
const revInvoiceT     = new Trend('revenue_invoice_ms',  true);
const revMonthlyT     = new Trend('revenue_monthly_ms',  true);

// ── Load Profile ─────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: '20s', target: 20  },   // warm-up
    { duration: '60s', target: 100 },   // ramp ke 100 user
    { duration: '60s', target: 100 },   // hold
    { duration: '20s', target: 0   },   // ramp down
  ],
  thresholds: {
    http_req_failed:         ['rate<0.05'],   // error < 5%
    http_req_duration:       ['p(95)<3000'],  // 95% < 3s
    'pipeline_list_ms':      ['p(95)<2000'],
    'pipeline_detail_ms':    ['p(95)<1500'],
    'pipeline_forecast_ms':  ['p(95)<2000'],
    'pipeline_insight_ms':   ['p(95)<3000'],
    'entertain_list_ms':     ['p(95)<1500'],
    'entertain_rekap_ms':    ['p(95)<2000'],
    'revenue_summary_ms':    ['p(95)<2000'],
    'revenue_projects_ms':   ['p(95)<2000'],
    'revenue_insight_ms':    ['p(95)<3000'],
    'revenue_invoice_ms':    ['p(95)<2000'],
    'revenue_monthly_ms':    ['p(95)<2000'],
  },
};

// ── Users ────────────────────────────────────────────────────────────────────
const USERS = [
  { email: 'hariman@pkp.co.id', password: 'password123', role: 'admin' },
];

function pickUser() { return USERS[Math.floor(Math.random() * USERS.length)]; }

function login(user) {
  const res = http.post(
    `${BASE}/v1/auth/login`,
    JSON.stringify({ email: user.email, password: user.password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  totalReqs.add(1);
  const ok = check(res, {
    'login 200':  (r) => r.status === 200,
    'has token':  (r) => { try { return !!JSON.parse(r.body).access_token; } catch { return false; } },
  });
  errorRate.add(!ok);
  if (!ok) return null;
  return JSON.parse(res.body).access_token;
}

function h(token) {
  return { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
}

function req(method, url, token, body = null) {
  const opts = h(token);
  const res  = method === 'POST'
    ? http.post(url, body ? JSON.stringify(body) : null, opts)
    : http.get(url, opts);
  totalReqs.add(1);
  return res;
}

// ── Main VU ──────────────────────────────────────────────────────────────────
export default function () {
  const user  = pickUser();
  const token = login(user);
  if (!token) { sleep(1); return; }

  const tahun = 2026;

  // ════════════════════════════════════════════════════════════════════
  // PIPELINE
  // ════════════════════════════════════════════════════════════════════
  group('pipeline', () => {

    // List dengan berbagai filter
    group('list', () => {
      const stages  = ['', 'New', 'In Progress', 'Proposal Sent', 'Won', 'Lost'];
      const stage   = stages[Math.floor(Math.random() * stages.length)];
      const url     = stage
        ? `${BASE}/v1/pipeline?page=1&limit=20&stage=${encodeURIComponent(stage)}`
        : `${BASE}/v1/pipeline?page=1&limit=20`;
      const res = req('GET', url, token);
      pipelineListT.add(res.timings.duration);
      errorRate.add(!check(res, {
        'pipeline list 200': (r) => r.status === 200,
        'has leads key':     (r) => { try { return 'leads' in JSON.parse(r.body); } catch { return false; } },
      }));
    });

    sleep(0.2);

    // Pagination halaman 2
    group('pagination', () => {
      const res = req('GET', `${BASE}/v1/pipeline?page=2&limit=10`, token);
      pipelineListT.add(res.timings.duration);
      errorRate.add(!check(res, { 'pipeline page2 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Forecast
    group('forecast', () => {
      const res = req('GET', `${BASE}/v1/pipeline/forecast`, token);
      pipelineFcastT.add(res.timings.duration);
      errorRate.add(!check(res, { 'forecast 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Insights (heavy query)
    group('insights', () => {
      const res = req('GET', `${BASE}/v1/insights`, token);
      pipelineInsightT.add(res.timings.duration);
      errorRate.add(!check(res, {
        'insights 200':     (r) => r.status === 200,
        'insights has data':(r) => { try { const b = JSON.parse(r.body); return 'stages' in b || 'total' in b; } catch { return false; } },
      }));
    });

    sleep(0.2);

    // Detail lead (coba LD-001 jika ada)
    group('detail', () => {
      const res = req('GET', `${BASE}/v1/pipeline/LD-001`, token);
      pipelineDetailT.add(res.timings.duration);
      // 200 = found, 404 = tidak ada data (acceptable)
      errorRate.add(!check(res, { 'pipeline detail no 5xx': (r) => r.status !== 500 }));
    });
  });

  sleep(0.5);

  // ════════════════════════════════════════════════════════════════════
  // ENTERTAIN
  // ════════════════════════════════════════════════════════════════════
  group('entertain', () => {

    // List claims — semua status
    group('list all', () => {
      const res = req('GET', `${BASE}/v1/entertain/claims`, token);
      entertainListT.add(res.timings.duration);
      errorRate.add(!check(res, { 'entertain list 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // List claims — filter Pending (antrian approval admin)
    group('list pending', () => {
      const res = req('GET', `${BASE}/v1/entertain/claims?status=Pending`, token);
      entertainListT.add(res.timings.duration);
      errorRate.add(!check(res, { 'entertain pending 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Rekap bulanan
    group('rekap', () => {
      const res = req('GET', `${BASE}/v1/entertain/rekap?tahun=${tahun}`, token);
      entertainRekapT.add(res.timings.duration);
      errorRate.add(!check(res, { 'entertain rekap 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Sales limits
    group('limits', () => {
      const res = req('GET', `${BASE}/v1/entertain/sales-limits`, token);
      entertainLimitT.add(res.timings.duration);
      errorRate.add(!check(res, { 'entertain limits 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Settings (admin only)
    if (user.role === 'admin') {
      group('settings', () => {
        const res = req('GET', `${BASE}/v1/entertain/settings`, token);
        entertainLimitT.add(res.timings.duration);
        errorRate.add(!check(res, { 'entertain settings 200': (r) => r.status === 200 }));
      });
    }
  });

  sleep(0.5);

  // ════════════════════════════════════════════════════════════════════
  // REVENUE
  // ════════════════════════════════════════════════════════════════════
  group('revenue', () => {

    // Summary dashboard revenue
    group('summary', () => {
      const res = req('GET', `${BASE}/v1/revenue/summary?tahun=${tahun}`, token);
      revSummaryT.add(res.timings.duration);
      errorRate.add(!check(res, {
        'revenue summary 200':     (r) => r.status === 200,
        'revenue summary no error':(r) => { try { return !JSON.parse(r.body).detail; } catch { return true; } },
      }));
    });

    sleep(0.2);

    // Revenue projects list — berbagai filter
    group('projects list', () => {
      const types = ['', 'Recurring', 'One Time'];
      const type  = types[Math.floor(Math.random() * types.length)];
      const url   = type
        ? `${BASE}/v1/revenue/projects?tahun=${tahun}&type=${encodeURIComponent(type)}`
        : `${BASE}/v1/revenue/projects?tahun=${tahun}`;
      const res = req('GET', url, token);
      revProjectsT.add(res.timings.duration);
      errorRate.add(!check(res, { 'revenue projects 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Revenue insights (heavy aggregation)
    group('insights', () => {
      const res = req('GET', `${BASE}/v1/revenue/insights?tahun=${tahun}`, token);
      revInsightT.add(res.timings.duration);
      errorRate.add(!check(res, {
        'revenue insights 200':     (r) => r.status === 200,
        'revenue insights no 5xx':  (r) => r.status < 500,
      }));
    });

    sleep(0.2);

    // Invoice list
    group('invoices', () => {
      const res = req('GET', `${BASE}/v1/revenue/invoices?tahun=${tahun}`, token);
      revInvoiceT.add(res.timings.duration);
      errorRate.add(!check(res, { 'revenue invoices 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Monthly realisasi
    group('monthly', () => {
      const res = req('GET', `${BASE}/v1/revenue/monthly?tahun=${tahun}`, token);
      revMonthlyT.add(res.timings.duration);
      errorRate.add(!check(res, { 'revenue monthly 200': (r) => r.status === 200 }));
    });

    sleep(0.2);

    // Project monthly detail (REV-0001 jika ada)
    group('project monthly detail', () => {
      const res = req('GET', `${BASE}/v1/revenue/projects/REV-0001/monthly`, token);
      revMonthlyT.add(res.timings.duration);
      // 404 acceptable jika belum ada data
      errorRate.add(!check(res, { 'project monthly no 5xx': (r) => r.status !== 500 }));
    });

    sleep(0.2);

    // KPI revenue
    group('kpi', () => {
      const res = req('GET', `${BASE}/v1/revenue/kpi?tahun=${tahun}`, token);
      revSummaryT.add(res.timings.duration);
      errorRate.add(!check(res, { 'revenue kpi 200': (r) => r.status === 200 }));
    });
  });

  sleep(1);
}
