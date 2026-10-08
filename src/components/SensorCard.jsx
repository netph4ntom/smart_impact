import { THRESHOLDS } from '../config/blynk.js';
import { round } from '../utils/helpers.js';
import { useSensor } from '../contexts/SensorContext.jsx';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { Thermometer, Beaker, Droplets, Zap, TrendingUp, TrendingDown, ArrowRight, Activity } from 'lucide-react';

const ICON_MAP = {
  temperature: { icon: <Thermometer size={20} />, cls: 'temp' },
  ph:          { icon: <Beaker size={20} />, cls: 'ph' },
  turbidity:   { icon: <Droplets size={20} />, cls: 'turb' },
  tds:         { icon: <Zap size={20} />, cls: 'tds' },
};

const TREND_CHARS = {
  increasing:  { icon: <TrendingUp size={14} />, cls: 'trend-up' },
  decreasing:  { icon: <TrendingDown size={14} />, cls: 'trend-down' },
  stable:      { icon: <ArrowRight size={14} />, cls: 'trend-stable' },
  fluctuating: { icon: <Activity size={14} />, cls: 'trend-up' },
  unknown:     { icon: <span style={{fontSize: 14}}>·</span>, cls: '' },
};

export default function SensorCard({ paramKey }) {
  const { sensorData, statuses, trends, history } = useSensor();
  const cfg = THRESHOLDS[paramKey];
  const val = sensorData[paramKey];
  const status = statuses[paramKey];
  const trend = trends[paramKey];
  const { icon, cls } = ICON_MAP[paramKey] || {};

  // Build sparkline data from last 20 history points
  const sparkData = history.slice(-20).map(h => ({ v: h[paramKey] }));

  const trendInfo = TREND_CHARS[trend?.direction] || TREND_CHARS.unknown;

  const dispVal = val !== null && val !== undefined
    ? round(val, paramKey === 'tds' ? 0 : paramKey === 'turbidity' ? 0 : 2)
    : '—';

  const change = trend?.change !== undefined && trend.change !== null
    ? (trend.change >= 0 ? '+' : '') + round(trend.change, 2)
    : null;

  return (
    <div className={`sensor-card fade-up`}>
      <div className="sensor-card-header">
        <div className={`sensor-icon ${cls}`}>{icon}</div>
        <span className={`badge badge-${status}`}>
          {status === 'normal' ? ' Normal' : status === 'warning' ? ' Warning' : status === 'critical' ? ' Critical' : '· Unknown'}
        </span>
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{cfg.label}</div>
        <div className="sensor-value-row">
          <span className="sensor-value">{dispVal}</span>
          {val !== null && <span className="sensor-unit">{cfg.unit}</span>}
        </div>
        {change !== null && (
          <div className={`sensor-trend ${trendInfo.cls}`}>
            <span>{trendInfo.icon}</span>
            <span>{change} {cfg.unit} (1h)</span>
          </div>
        )}
      </div>

      {sparkData.length > 2 && (
        <div className="sparkline-wrap">
          <ResponsiveContainer width="100%" height={32}>
            <LineChart data={sparkData}>
              <Line
                type="monotone" dataKey="v"
                stroke={status === 'critical' ? 'var(--danger)' : status === 'warning' ? 'var(--warning)' : 'var(--primary)'}
                strokeWidth={1.5} dot={false}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                formatter={(v) => [round(v, 2) + ' ' + cfg.unit, cfg.label]}
                labelFormatter={() => ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
