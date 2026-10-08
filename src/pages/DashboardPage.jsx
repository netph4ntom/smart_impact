import { useState } from 'react';
import { useSensor } from '../contexts/SensorContext.jsx';
import SensorCard from '../components/SensorCard.jsx';
import WaterQualityBadge from '../components/WaterQualityBadge.jsx';
import AlertItem from '../components/AlertItem.jsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatChartTime, round } from '../utils/helpers.js';
import { THRESHOLDS } from '../config/blynk.js';
import { CheckCircle, AlertTriangle, Droplets, BrainCircuit, Cpu, Activity } from 'lucide-react';

const PARAMS   = ['temperature', 'ph', 'turbidity', 'tds'];
const PERIODS  = ['1H', '6H', '24H', '7D'];
const PARAM_COLORS = { temperature: '#ef7444', ph: '#0ea5e9', turbidity: '#8b5cf6', tds: '#06d6a0' };

function filterHistory(history, period) {
  const now = Date.now();
  const ms = { '1H': 3600e3, '6H': 6 * 3600e3, '24H': 24 * 3600e3, '7D': 7 * 24 * 3600e3 };
  const cutoff = now - (ms[period] || 3600e3);
  return history.filter(h => new Date(h.timestamp).getTime() >= cutoff);
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-md)', borderRadius: 8, padding: '0.5rem 0.875rem', fontSize: 12 }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {round(p.value, 2)} {THRESHOLDS[p.dataKey]?.unit}
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage({ onNavigate }) {
  const { history, alerts, loadingState, refetch } = useSensor();
  const [chartPeriod, setChartPeriod] = useState('1H');
  const [chartParam, setChartParam] = useState('temperature');

  const chartData = filterHistory(history, chartPeriod).map(h => ({
    ...h,
    time: formatChartTime(h.timestamp, chartPeriod),
  }));

  const t = THRESHOLDS[chartParam];

  return (
    <div className="fade-up">
      {/* Error state */}
      {loadingState === 'error' && (
        <div className="state-box" style={{ marginBottom: '1rem' }}>
          <div className="state-icon"><AlertTriangle size={48} color="var(--danger)" /></div>
          <h3>Tidak dapat mengambil data sensor</h3>
          <p>Periksa konfigurasi Blynk atau koneksi internet.</p>
          <button className="btn btn-primary btn-sm" onClick={refetch}> Coba Lagi</button>
        </div>
      )}

      {/* Sensor cards */}
      <div className="grid-4 stagger" style={{ marginBottom: '1.25rem' }}>
        {PARAMS.map(p => <SensorCard key={p} paramKey={p} />)}
      </div>

      {/* Quality + Alerts row */}
      <div className="dashboard-row-1">
        <WaterQualityBadge />

        {/* Recent Alerts */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}> Recent Alerts</span>
            {alerts.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('alerts')}>
                View all →
              </button>
            )}
          </div>
          {alerts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: 'var(--success)' }}>
                <CheckCircle size={32} />
              </div>
              Tidak ada alert aktif
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {alerts.slice(0, 2).map(a => <AlertItem key={a.id} alert={a} showFull />)}
            </div>
          )}
        </div>
      </div>

      {/* Chart + System Status row */}
      <div className="dashboard-row-2">
        {/* Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}> Water Quality Trend</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <select 
                value={chartParam} 
                onChange={(e) => setChartParam(e.target.value)}
                style={{
                  background: 'var(--bg-hover)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {PARAMS.map(p => (
                  <option key={p} value={p}>{THRESHOLDS[p].label}</option>
                ))}
              </select>
              <div className="chart-tabs">
                {PERIODS.map(pd => (
                  <button key={pd} className={`chart-tab ${chartPeriod === pd ? 'active' : ''}`} onClick={() => setChartPeriod(pd)}>
                    {pd}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {chartData.length < 2 ? (
            <div className="state-box" style={{ padding: '2rem' }}>
              <div className="state-icon"><Activity size={48} color="var(--border-md)" /></div>
              <p>Data history belum cukup untuk menampilkan grafik.<br />Tunggu beberapa polling interval.</p>
            </div>
          ) : (
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={t.normal.min} stroke="rgba(6,214,160,0.3)" strokeDasharray="4 4" />
                  <ReferenceLine y={t.normal.max} stroke="rgba(6,214,160,0.3)" strokeDasharray="4 4" />
                  <Line
                    type="monotone" dataKey={chartParam} name={t.label}
                    stroke={PARAM_COLORS[chartParam]}
                    strokeWidth={2} dot={false}
                    activeDot={{ r: 4, fill: PARAM_COLORS[chartParam] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* System Status */}
        <SystemStatusMini />
      </div>

      {/* Quick Links for Analytics (Especially useful for Mobile) */}
      <div className="grid-3 stagger" style={{ marginTop: '1.25rem' }}>
        <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => onNavigate('water')}>
          <div className="sensor-icon turb"><Droplets size={24} /></div>
          <div><div style={{ fontWeight: 600 }}>Water Quality</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Historical Data</div></div>
        </div>
        <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => onNavigate('ai')}>
          <div className="sensor-icon" style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--primary)' }}><BrainCircuit size={24} /></div>
          <div><div style={{ fontWeight: 600 }}>AI Analysis</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Smart Insights</div></div>
        </div>
        <div className="card" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }} onClick={() => onNavigate('system')}>
          <div className="sensor-icon" style={{ background: 'rgba(100,116,139,0.15)', color: 'var(--neutral)' }}><Cpu size={24} /></div>
          <div><div style={{ fontWeight: 600 }}>System Status</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Device Health</div></div>
        </div>
      </div>
    </div>
  );
}

function SystemStatusMini() {
  const { deviceStatus, sensorData, loadingState } = useSensor();
  const activeSensors = [sensorData.temperature, sensorData.ph, sensorData.turbidity, sensorData.tds]
    .filter(v => v !== null).length;

  return (
    <div className="card">
      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}> System Status</div>
      <div className="status-row">
        <span className="status-label">ESP32</span>
        <span className={`status-value ${deviceStatus.online ? 'status-ok' : deviceStatus.online === false ? 'status-err' : 'status-neutral'}`}>
          <div className={`live-dot ${!deviceStatus.online ? 'danger' : ''}`} />
          {deviceStatus.online === true ? 'Online' : deviceStatus.online === false ? 'Offline' : 'Checking…'}
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">Internet</span>
        <span className="status-value status-ok">
          <div className="live-dot" />Connected
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">Data Stream</span>
        <span className={`status-value ${loadingState === 'ok' ? 'status-ok' : loadingState === 'error' ? 'status-err' : 'status-neutral'}`}>
          <div className={`live-dot ${loadingState === 'error' ? 'danger' : ''}`} />
          {loadingState === 'ok' ? 'Active' : loadingState === 'error' ? 'Error' : 'Connecting…'}
        </span>
      </div>
      <div className="status-row">
        <span className="status-label">Sensors</span>
        <span className={`status-value ${activeSensors === 4 ? 'status-ok' : 'status-warn'}`}>
          {activeSensors}/4 Active
        </span>
      </div>
      <div style={{ marginTop: '1rem', fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        Last updated: see freshness bar above
      </div>
    </div>
  );
}
