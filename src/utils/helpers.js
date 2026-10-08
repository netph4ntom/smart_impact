/** Shared utility helpers */

/** Format seconds ago into human-readable string */
export function timeAgo(date) {
  if (!date) return 'Never';
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5)   return 'Just now';
  if (seconds < 60)  return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  return `${Math.floor(seconds / 3600)} hours ago`;
}

/** Format date to WIB local time string */
export function formatTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function formatDateTime(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(date));
}

export function formatChartTime(date, period = '1H') {
  if (!date) return '';
  const d = new Date(date);
  
  if (period === '1H') {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } else if (period === '6H' || period === '24H') {
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  } else {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'short', hour: '2-digit',
      timeZone: 'Asia/Jakarta',
    }).format(d);
  }
}

/** Round to N decimal places */
export function round(val, decimals = 1) {
  if (val === null || val === undefined) return null;
  return Math.round(val * 10 ** decimals) / 10 ** decimals;
}

/** CSV download helper */
export function downloadCSV(data, filename = 'aquamonitor_export.csv') {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const v = row[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'string' && v.includes(',')) return `"${v}"`;
      return v;
    }).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/** Trend arrow + label */
export function trendLabel(direction) {
  switch (direction) {
    case 'increasing':  return { icon: '↑', label: 'Meningkat',    cls: 'increasing' };
    case 'decreasing':  return { icon: '↓', label: 'Menurun',      cls: 'decreasing' };
    case 'stable':      return { icon: '→', label: 'Stabil',       cls: 'stable' };
    case 'fluctuating': return { icon: '↕', label: 'Berfluktuasi', cls: 'fluctuating' };
    default:            return { icon: '?', label: 'Tidak diketahui', cls: 'unknown' };
  }
}

/** Overall water quality from individual statuses */
export function overallQuality(statuses) {
  const vals = Object.values(statuses);
  if (vals.includes('critical'))    return { label: 'CRITICAL',       cls: 'critical',  icon: '', count: vals.filter(v => v === 'normal').length };
  if (vals.includes('warning'))     return { label: 'NEEDS ATTENTION', cls: 'attention', icon: '', count: vals.filter(v => v === 'normal').length };
  if (vals.every(v => v === 'normal')) return { label: 'GOOD',         cls: 'good',      icon: '', count: vals.length };
  return { label: 'CHECKING…', cls: 'good', icon: '…', count: 0 };
}
