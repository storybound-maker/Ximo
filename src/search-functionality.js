(() => {
  const KEY = 'ximo-recent-searches';
  const MAX = 6;
  const read = () => { try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v.filter(Boolean).slice(0, MAX) : []; } catch { return []; } };
  const write = items => { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX))); } catch {} };
  window.ximoSearch = {
    recent() { return read(); },
    remember(value) { const q = String(value || '').trim(); if (!q) return read(); const next = [q, ...read().filter(x => x.toLowerCase() !== q.toLowerCase())]; write(next); return next.slice(0, MAX); },
    clear() { write([]); return []; },
    remove(value) { const q = String(value || '').toLowerCase(); const next = read().filter(x => x.toLowerCase() !== q); write(next); return next; }
  };
})();
