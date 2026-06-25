/**
 * composables/useFormat.ts
 * Helpers untuk format angka, tanggal, currency
 */

export function useFormat() {
  /** Format rupiah: 1500000 → "Rp 1,5Jt" */
  function rupiah(val: number | null | undefined): string {
    const n = Number(val || 0)
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`
    if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(1)}Jt`
    if (n >= 1_000)         return `Rp ${(n / 1_000).toFixed(0)}K`
    return `Rp ${n.toFixed(0)}`
  }

  /** Format angka kompak tanpa "Rp": 1500000 → "1,5Jt" */
  function compact(val: number | null | undefined): string {
    const n = Number(val || 0)
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}M`
    if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}Jt`
    if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`
    return n.toFixed(0)
  }

  /** Format rupiah lengkap: 1500000 → "Rp 1.500.000" */
  function rupiahFull(val: number | null | undefined): string {
    const n = Number(val || 0)
    return 'Rp ' + n.toLocaleString('id-ID')
  }

  /** Format persen: 0.75 atau 75 → "75%" */
  function pct(val: number | null | undefined, alreadyPct = true): string {
    const n = Number(val || 0)
    return (alreadyPct ? n : n * 100).toFixed(1) + '%'
  }

  const TZ = 'Asia/Jakarta'

  /** Parse tanggal string ke Date dengan timezone WIB */
  function parseWib(val: string): Date {
    // Jika hanya date (YYYY-MM-DD), tambahkan waktu tengah malam WIB
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(val + 'T00:00:00+07:00')
    }
    // Jika ada komponen waktu tapi tanpa offset, anggap WIB
    if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(val)) {
      return new Date(val + '+07:00')
    }
    return new Date(val)
  }

  /** Hari ini dalam WIB (midnight WIB) */
  function todayWib(): Date {
    const now = new Date()
    const wib = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
    return new Date(wib.getFullYear(), wib.getMonth(), wib.getDate())
  }

  /** Hari ini sebagai string YYYY-MM-DD dalam WIB — gunakan ini, bukan new Date().toISOString().slice(0,10) */
  function todayStr(): string {
    const d = todayWib()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  /** Bulan ini sebagai string YYYY-MM dalam WIB */
  function thisMonthStr(): string {
    return todayStr().slice(0, 7)
  }

  /** Format tanggal Indonesia: "2026-06-08" → "8 Jun 2026" */
  function tgl(val: string | null | undefined): string {
    if (!val) return '—'
    try {
      const d = parseWib(val)
      return d.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        timeZone: TZ,
      })
    } catch { return val }
  }

  /** Relative date: "3 hari lalu", "hari ini", "besok" */
  function relDate(val: string | null | undefined): string {
    if (!val) return '—'
    try {
      const today = todayWib()
      const d     = parseWib(val)
      const dDay  = new Date(d.toLocaleString('en-US', { timeZone: TZ }))
      const dNorm = new Date(dDay.getFullYear(), dDay.getMonth(), dDay.getDate())
      const diff  = Math.round((dNorm.getTime() - today.getTime()) / 86400000)
      if (diff === 0)  return 'Hari ini'
      if (diff === 1)  return 'Besok'
      if (diff === -1) return 'Kemarin'
      if (diff > 0)    return `${diff} hari lagi`
      return `${-diff} hari lalu`
    } catch { return val }
  }

  /** Stage badge color */
  function stageClass(stage: string): string {
    const map: Record<string, string> = {
      'New':           'badge-blue',
      'In Progress':   'badge-yellow',
      'Demo Scheduled':'badge-purple',
      'Proposal Sent': 'badge-yellow',
      'Negotiation':   'badge-yellow',
      'Won':           'badge-green',
      'On Hold':       'badge-gray',
      'Lost':          'badge-red',
    }
    return map[stage] || 'badge-gray'
  }

  /** Priority badge color */
  function priorityClass(p: string): string {
    if (p === 'Hot')  return 'badge-red'
    if (p === 'Warm') return 'badge-yellow'
    return 'badge-blue'
  }

  /** Risk level color */
  function riskClass(r: string): string {
    if (r === 'HIGH')   return 'badge-red'
    if (r === 'MEDIUM') return 'badge-yellow'
    return 'badge-green'
  }

  /** Status color (revenue) */
  function statusClass(s: string): string {
    if (s === 'Critical') return 'badge-red'
    if (s === 'At Risk')  return 'badge-yellow'
    if (s === 'On Track') return 'badge-green'
    return 'badge-gray'
  }

  /** Progress bar color based on achievement % */
  function achColor(pct: number): string {
    if (pct >= 80) return 'text-emerald-400'
    if (pct >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  function achBgColor(pct: number): string {
    if (pct >= 80) return 'bg-emerald-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  /** Stale flag color */
  function staleClass(flag: string): string {
    if (flag === 'URGENT')  return 'badge-red'
    if (flag === 'WARNING') return 'badge-yellow'
    if (flag === 'STALE')   return 'badge-gray'
    return ''
  }

  /** Format integer dengan separator ribuan: 1500 → "1.500" */
  function num(val: number | null | undefined): string {
    return Number(val || 0).toLocaleString('id-ID')
  }

  function datetime(val: string | null | undefined): string {
    if (!val) return '—'
    const d = new Date(val)
    return d.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return { rupiah, compact, rupiahFull, pct, num, tgl, relDate, datetime, stageClass, priorityClass, riskClass, statusClass, achColor, achBgColor, staleClass, todayStr, thisMonthStr, todayWib, parseWib }
}
