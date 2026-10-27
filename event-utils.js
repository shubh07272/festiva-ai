/* Shared, dependency-free helpers for browser code and Node.js tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.EventUtils = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const DAY_MS = 24 * 60 * 60 * 1000;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[char]);
  }

  function safeColor(value, fallback = '#C5A059') {
    return /^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value) : fallback;
  }

  function inlineArg(value) {
    // Percent-encode characters that remain unescaped in encodeURIComponent too.
    return encodeURIComponent(String(value ?? '')).replace(/[!'()*]/g, char => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
  }

  function parseDateOnly(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const time = Date.UTC(year, month - 1, day);
    const date = new Date(time);
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return { year, month, day, time };
  }

  function todayLocalDate(now = new Date()) {
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function daysUntil(dateString, now = new Date()) {
    const target = parseDateOnly(dateString);
    if (!target) return null;
    const today = parseDateOnly(todayLocalDate(now));
    return Math.round((target.time - today.time) / DAY_MS);
  }

  function addDaysToDateOnly(dateString, offsetDays) {
    const parsed = parseDateOnly(dateString);
    if (!parsed || !Number.isFinite(Number(offsetDays))) return null;
    const next = new Date(parsed.time + Math.trunc(Number(offsetDays)) * DAY_MS);
    return `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-${String(next.getUTCDate()).padStart(2, '0')}`;
  }

  function addMonthsDateOnly(monthsAhead, now = new Date()) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const day = date.getDate();
    date.setDate(1);
    date.setMonth(date.getMonth() + Number(monthsAhead || 0));
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    date.setDate(Math.min(day, lastDay));
    return todayLocalDate(date);
  }

  function numeric(value) {
    const result = Number(value);
    return Number.isFinite(result) && result >= 0 ? result : 0;
  }

  function budgetMetrics(budget, items = []) {
    const cap = numeric(budget);
    const rows = Array.isArray(items) ? items : [];
    const allocated = rows.reduce((sum, item) => sum + numeric(item?.allocated), 0);
    const estimated = rows.reduce((sum, item) => sum + numeric(item?.estimated), 0);
    const actual = rows.reduce((sum, item) => sum + numeric(item?.actual), 0);
    return {
      cap, allocated, estimated, actual,
      remaining: cap - actual,
      allocationOverCap: allocated > cap + 0.005,
      estimateOverCap: estimated > cap + 0.005,
      actualOverCap: actual > cap + 0.005,
      allocationAtCap: cap > 0 && allocated >= cap - 0.005,
      alert: allocated > cap + 0.005 || estimated > cap + 0.005 || actual > cap + 0.005
    };
  }

  function guestRsvpCounts(guests) {
    const totals = { attending: 0, declined: 0, pending: 0 };
    if (!Array.isArray(guests)) return totals;
    for (const guest of guests) {
      if (!guest || typeof guest !== 'object' || !Object.hasOwn(totals, guest.rsvp)) continue;
      totals[guest.rsvp] += Math.max(1, Math.trunc(numeric(guest.count) || 1));
    }
    return totals;
  }

  function csvCell(value) {
    let text = String(value ?? '');
    // Prefix spreadsheet formula starters (including whitespace-prefixed starters).
    if (/^\s*[=+\-@]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }

  function csvRow(values) {
    return values.map(csvCell).join(',');
  }

  return { escapeHtml, safeColor, inlineArg, parseDateOnly, todayLocalDate, daysUntil, addDaysToDateOnly, addMonthsDateOnly, numeric, budgetMetrics, guestRsvpCounts, csvCell, csvRow };
});
