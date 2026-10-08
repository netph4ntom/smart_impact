import { useState } from 'react';
import { useSensor } from '../contexts/SensorContext.jsx';
import { THRESHOLDS } from '../config/blynk.js';
import { downloadCSV, round, formatChartTime } from '../utils/helpers.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { Download, BarChart2, Info } from 'lucide-react';

const PARAMS  = ['temperature', 'ph', 'turbidity', 'tds'];
const PERIODS = ['1H', '6H', '24H', '7D'];
const COLORS  = { temperature: '#ef7444', ph: '#0ea5e9', turbidity: '#8b5cf6', tds: '#06d6a0' };

function filterHistory(history, period) {
  const now = Date.now();
  const ms = { '1H': 3600e3, '6H': 6 * 3600e3, '24H': 24 * 3600e3, '7D': 7 * 24 * 3600e3 };
  const cutoff = now - (ms[period] || 3600e3);
  return history.filter(h => new Date(h.timestamp).getTime() >= cutoff);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 8, padding: '0.625rem 0.875rem', fontSize: 11 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {THRESHOLDS[p.dataKey]?.label}: {round(p.value, 2)} {THRESHOLDS[p.dataKey]?.unit}
        </div>
      ))}
    </div>
  );
};

export default function WaterQualityPage() {
  const { history } = useSensor();
  const [period, setPeriod] = useState('1H');
  const [activeParams, setActiveParams] = useState(new Set(PARAMS));

  const chartData = filterHistory(history, period).map(h => ({
    ...h,
    time: formatChartTime(h.timestamp),
  }));

  function toggleParam(p) {
    setActiveParams(prev => {
      const next = new Set(prev);
      if (next.has(p)) { if (next.size > 1) next.delete(p); }
      else next.add(p);
      return next;
    });
  }

  function handleExport() {
    if (!chartData.length) return;
    const rows = chartData.map(h => ({
      timestamp: h.timestamp ? new Date(h.timestamp).toISOString() : '',
      temperature: h.temperature ?? '',
      ph: h.ph ?? '',
      turbidity: h.turbidity ?? '',
      tds_ec: h.tds ?? '',
    }));
    downloadCSV(rows, `aquamonitor_${period}_${new Date().toISOString().slice(0,10)}.csv`);
  }

  return (
    <div className="fade-up">
      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {/* Period tabs */}
          <div className="chart-tabs">
            {PERIODS.map(pd => (
              <button key={pd} className={`chart-tab ${period === pd ? 'active' : ''}`} onClick={() => setPeriod(pd)}>{pd}</button>
            ))}
          </div>
          {/* Param toggles */}
          <div className="chart-tabs">
            {PARAMS.map(p => (
              <button key={p} className={`param-tab ${activeParams.has(p) ? 'active' : ''}`} onClick={() => toggleParam(p)}
                style={activeParams.has(p) ? { borderColor: COLORS[p], color: COLORS[p], background: COLORS[p] + '22' } : {}}>
                {THRESHOLDS[p].label}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleExport} id="export-csv-btn" disabled={chartData.length === 0} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <BarChart2 size={18} /> Water Quality History — {period}
          <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {chartData.length} titik data (in-memory)
          </span>
        </div>

        {chartData.length < 2 ? (
          <div className="state-box" style={{ padding: '2.5rem' }}>
            <div className="state-icon"><BarChart2 size={48} color="var(--border-md)" /></div>
            <h3>Data history belum tersedia</h3>
            <p>
              Data historical dikumpulkan dari sesi monitoring aktif.<br />
              <strong>Catatan:</strong> Blynk API gratis tidak menyediakan historical endpoint.
              Data hanya tersedia selama sesi aplikasi berjalan.
            </p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={v => THRESHOLDS[v]?.label || v}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                />
                {PARAMS.filter(p => activeParams.has(p)).map(p => {
                  const t = THRESHOLDS[p];
                  return [
                    <ReferenceLine key={`rmin-${p}`} y={t.normal.min} stroke={COLORS[p]} strokeOpacity={0.2} strokeDasharray="4 4" />,
                    <ReferenceLine key={`rmax-${p}`} y={t.normal.max} stroke={COLORS[p]} strokeOpacity={0.2} strokeDasharray="4 4" />,
                    <Line
                      key={p} type="monotone" dataKey={p}
                      stroke={COLORS[p]} strokeWidth={2} dot={false}
                      activeDot={{ r: 4 }}
                    />,
                  ];
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Parameter Summary */}
      <div className="grid-4">
        {PARAMS.map(p => {
          const vals = chartData.map(h => h[p]).filter(v => v !== null && !isNaN(v));
          const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
          const min = vals.length ? Math.min(...vals) : null;
          const max = vals.length ? Math.max(...vals) : null;
          const t = THRESHOLDS[p];
          return (
            <div key={p} className="card" style={{ borderLeft: `3px solid ${COLORS[p]}` }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                {t.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Rata-rata</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{avg !== null ? round(avg, 2) : '—'} {t.unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Min</span>
                  <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{min !== null ? round(min, 2) : '—'} {t.unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max</span>
                  <span style={{ fontWeight: 600, color: '#ef7444' }}>{max !== null ? round(max, 2) : '—'} {t.unit}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Normal</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.normal.min}–{t.normal.max} {t.unit}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
