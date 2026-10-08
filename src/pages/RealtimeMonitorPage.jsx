import { useSensor } from '../contexts/SensorContext.jsx';
import { THRESHOLDS } from '../config/blynk.js';
import { round, formatDateTime, formatTime } from '../utils/helpers.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatChartTime } from '../utils/helpers.js';

const PARAMS = ['temperature', 'ph', 'turbidity', 'tds'];
const PARAM_COLORS = { temperature: '#ef7444', ph: '#0ea5e9', turbidity: '#8b5cf6', tds: '#06d6a0' };
const ICONS = { temperature: '', ph: '', turbidity: '', tds: '' };

export default function RealtimeMonitorPage() {
  const { sensorData, statuses, loadingState, pollInterval, setPollInterval, refetch, history } = useSensor();

  const chartData = history.slice(-30).map(h => ({
    ...h,
    time: formatChartTime(h.timestamp),
  }));

  return (
    <div className="fade-up">
      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Auto refresh:</span>
          <select
            className="form-select"
            value={pollInterval}
            onChange={e => setPollInterval(Number(e.target.value))}
            id="poll-interval-select"
          >
            <option value={10000}>10 detik</option>
            <option value={15000}>15 detik</option>
            <option value={30000}>30 detik</option>
            <option value={60000}>1 menit</option>
          </select>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={refetch} id="manual-refresh-btn">
           Refresh Manual
        </button>
      </div>

      {/* Big sensor grid */}
      <div className="grid-4 stagger" style={{ marginBottom: '1.5rem' }}>
        {PARAMS.map(p => {
          const val = sensorData[p];
          const status = statuses[p];
          const t = THRESHOLDS[p];
          const dispVal = val !== null ? round(val, p === 'tds' ? 0 : p === 'turbidity' ? 0 : 2) : '—';
          return (
            <div key={p} className="card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>{ICONS[p]}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)', marginBottom: 4 }}>
                {loadingState === 'loading' ? <div className="shimmer" style={{ height: 40, width: 80, margin: '0 auto', borderRadius: 6 }} /> : dispVal}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 12 }}>{t.unit}</div>
              <span className={`badge badge-${status}`}>
                {status === 'normal' ? ' Normal' : status === 'warning' ? ' Warning' : status === 'critical' ? ' Critical' : '· —'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live Sensor Data Table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}> Live Sensor Data</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Nilai</th>
                <th>Unit</th>
                <th>Status</th>
                <th>Normal Range</th>
                <th>Last Update</th>
              </tr>
            </thead>
            <tbody>
              {PARAMS.map(p => {
                const val = sensorData[p];
                const t = THRESHOLDS[p];
                const status = statuses[p];
                return (
                  <tr key={p}>
                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{ICONS[p]} {t.label}</td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
                      {val !== null ? round(val, p === 'tds' ? 0 : 2) : '—'}
                    </td>
                    <td>{t.unit}</td>
                    <td><span className={`badge badge-${status}`}>{status}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{t.normal.min} – {t.normal.max} {t.unit}</td>
                    <td style={{ fontSize: '0.8rem' }}>{sensorData.timestamp ? formatTime(sensorData.timestamp) + ' WIB' : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Line Chart (last 30 points) */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.875rem' }}> Live Chart (Last 30 samples)</div>
        {chartData.length < 2 ? (
          <div className="state-box" style={{ padding: '1.5rem' }}>
            <p>Belum ada data history. Tunggu beberapa siklus polling.</p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v, name) => [round(v, 2) + ' ' + (THRESHOLDS[name]?.unit || ''), THRESHOLDS[name]?.label || name]}
                />
                {PARAMS.map(p => (
                  <Line key={p} type="monotone" dataKey={p} name={p} stroke={PARAM_COLORS[p]} strokeWidth={1.5} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
