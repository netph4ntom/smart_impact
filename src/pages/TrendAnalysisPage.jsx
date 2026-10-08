import { useSensor } from '../contexts/SensorContext.jsx';
import { THRESHOLDS } from '../config/blynk.js';
import { trendLabel, round } from '../utils/helpers.js';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatChartTime } from '../utils/helpers.js';

const PARAMS = ['temperature', 'ph', 'turbidity', 'tds'];
const COLORS = { temperature: '#ef7444', ph: '#0ea5e9', turbidity: '#8b5cf6', tds: '#06d6a0' };

export default function TrendAnalysisPage() {
  const { trends, history, statuses } = useSensor();

  const chartData = history.slice(-50).map(h => ({
    ...h, time: formatChartTime(h.timestamp),
  }));

  return (
    <div className="fade-up">
      {/* Trend cards */}
      <div className="grid-adaptive stagger" style={{ marginBottom: '1.5rem' }}>
        {PARAMS.map(p => {
          const t = THRESHOLDS[p];
          const trend = trends[p] || {};
          const { icon, label, cls } = trendLabel(trend.direction);
          const current = trend.current;
          const previous = trend.previous;
          const pct = trend.changePercent;

          return (
            <div key={p} className="trend-card">
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {t.label} Trend
              </div>
              <div className={`trend-direction ${cls}`}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                {label}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{current !== null && current !== undefined ? round(current, 2) : '—'} {t.unit}</span>
                </div>
                {previous !== null && previous !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Previous</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{round(previous, 2)} {t.unit}</span>
                  </div>
                )}
                {pct !== null && pct !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Change</span>
                    <span style={{ fontWeight: 600, color: pct > 0 ? 'var(--warning)' : pct < 0 ? 'var(--primary-light)' : 'var(--success)' }}>
                      {pct > 0 ? '+' : ''}{round(pct, 1)}%
                    </span>
                  </div>
                )}
                <span className={`badge badge-${statuses[p]}`} style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                  {statuses[p]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Parameter Summary Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}> Parameter Summary</div>
        {chartData.length === 0 ? (
          <div className="state-box" style={{ padding: '1.5rem' }}>
            <p>Belum ada data trend. Tunggu beberapa polling interval.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Current</th>
                  <th>Min (session)</th>
                  <th>Max (session)</th>
                  <th>Trend</th>
                  <th>Change %</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PARAMS.map(p => {
                  const t = THRESHOLDS[p];
                  const trend = trends[p] || {};
                  const vals = history.map(h => h[p]).filter(v => v !== null && !isNaN(v));
                  const mn = vals.length ? Math.min(...vals) : null;
                  const mx = vals.length ? Math.max(...vals) : null;
                  const { icon, label } = trendLabel(trend.direction);
                  const pct = trend.changePercent;
                  return (
                    <tr key={p}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        <span style={{ marginRight: 6, color: COLORS[p] }}>●</span>{t.label}
                      </td>
                      <td style={{ fontWeight: 700 }}>{trend.current !== null && trend.current !== undefined ? round(trend.current, 2) : '—'} {t.unit}</td>
                      <td>{mn !== null ? round(mn, 2) : '—'} {t.unit}</td>
                      <td>{mx !== null ? round(mx, 2) : '—'} {t.unit}</td>
                      <td style={{ fontWeight: 600 }}>{icon} {label}</td>
                      <td style={{ color: pct > 0 ? 'var(--warning)' : pct < 0 ? 'var(--primary-light)' : 'var(--success)', fontWeight: 600 }}>
                        {pct !== null && pct !== undefined ? (pct > 0 ? '+' : '') + round(pct, 1) + '%' : '—'}
                      </td>
                      <td><span className={`badge badge-${statuses[p]}`}>{statuses[p]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multi-param trend chart */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}> Trend Chart (Last 50 samples)</div>
        {chartData.length < 2 ? (
          <div className="state-box" style={{ padding: '1.5rem' }}><p>Belum ada data cukup untuk grafik trend.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {PARAMS.map(p => {
              const t = THRESHOLDS[p];
              return (
                <div key={p}>
                  <div style={{ fontSize: '0.75rem', color: COLORS[p], fontWeight: 600, marginBottom: 4 }}>{t.label} ({t.unit})</div>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={100}>
                      <LineChart data={chartData} margin={{ top: 2, right: 10, left: -30, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="time" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                        <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} domain={['auto', 'auto']} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 10 }}
                          formatter={v => [round(v, 2) + ' ' + t.unit, t.label]}
                        />
                        <ReferenceLine y={t.normal.min} stroke={COLORS[p]} strokeOpacity={0.25} strokeDasharray="3 3" />
                        <ReferenceLine y={t.normal.max} stroke={COLORS[p]} strokeOpacity={0.25} strokeDasharray="3 3" />
                        <Line type="monotone" dataKey={p} stroke={COLORS[p]} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
