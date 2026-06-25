function useFormat() {
  function rupiah(val) {
    const n = Number(val || 0);
    if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)}M`;
    if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(1)}Jt`;
    if (n >= 1e3) return `Rp ${(n / 1e3).toFixed(0)}K`;
    return `Rp ${n.toFixed(0)}`;
  }
  function rupiahFull(val) {
    const n = Number(val || 0);
    return "Rp " + n.toLocaleString("id-ID");
  }
  function pct(val, alreadyPct = true) {
    const n = Number(val || 0);
    return (alreadyPct ? n : n * 100).toFixed(1) + "%";
  }
  const TZ = "Asia/Jakarta";
  function parseWib(val) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return /* @__PURE__ */ new Date(val + "T00:00:00+07:00");
    }
    if (!/[Zz]|[+-]\d{2}:?\d{2}$/.test(val)) {
      return /* @__PURE__ */ new Date(val + "+07:00");
    }
    return new Date(val);
  }
  function todayWib() {
    const now = /* @__PURE__ */ new Date();
    const wib = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
    return new Date(wib.getFullYear(), wib.getMonth(), wib.getDate());
  }
  function tgl(val) {
    if (!val) return "—";
    try {
      const d = parseWib(val);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: TZ
      });
    } catch {
      return val;
    }
  }
  function relDate(val) {
    if (!val) return "—";
    try {
      const today = todayWib();
      const d = parseWib(val);
      const dDay = new Date(d.toLocaleString("en-US", { timeZone: TZ }));
      const dNorm = new Date(dDay.getFullYear(), dDay.getMonth(), dDay.getDate());
      const diff = Math.round((dNorm.getTime() - today.getTime()) / 864e5);
      if (diff === 0) return "Hari ini";
      if (diff === 1) return "Besok";
      if (diff === -1) return "Kemarin";
      if (diff > 0) return `${diff} hari lagi`;
      return `${-diff} hari lalu`;
    } catch {
      return val;
    }
  }
  function stageClass(stage) {
    const map = {
      "New": "badge-blue",
      "In Progress": "badge-yellow",
      "Demo Scheduled": "badge-purple",
      "Proposal Sent": "badge-yellow",
      "Negotiation": "badge-yellow",
      "Won": "badge-green",
      "On Hold": "badge-gray",
      "Lost": "badge-red"
    };
    return map[stage] || "badge-gray";
  }
  function priorityClass(p) {
    if (p === "Hot") return "badge-red";
    if (p === "Warm") return "badge-yellow";
    return "badge-blue";
  }
  function riskClass(r) {
    if (r === "HIGH") return "badge-red";
    if (r === "MEDIUM") return "badge-yellow";
    return "badge-green";
  }
  function statusClass(s) {
    if (s === "Critical") return "badge-red";
    if (s === "At Risk") return "badge-yellow";
    if (s === "On Track") return "badge-green";
    return "badge-gray";
  }
  function achColor(pct2) {
    if (pct2 >= 80) return "text-emerald-400";
    if (pct2 >= 50) return "text-yellow-400";
    return "text-red-400";
  }
  function achBgColor(pct2) {
    if (pct2 >= 80) return "bg-emerald-500";
    if (pct2 >= 50) return "bg-yellow-500";
    return "bg-red-500";
  }
  function staleClass(flag) {
    if (flag === "URGENT") return "badge-red";
    if (flag === "WARNING") return "badge-yellow";
    if (flag === "STALE") return "badge-gray";
    return "";
  }
  function num(val) {
    return Number(val || 0).toLocaleString("id-ID");
  }
  return { rupiah, rupiahFull, pct, num, tgl, relDate, stageClass, priorityClass, riskClass, statusClass, achColor, achBgColor, staleClass };
}
export {
  useFormat as u
};
//# sourceMappingURL=useFormat-D7DNHH-1.js.map
