import { formatTime, formatDateTime } from '../utils/helpers.js';
import { AlertTriangle, ShieldAlert, Info } from 'lucide-react';

export default function AlertItem({ alert, showFull = false }) {
  if (!alert) return null;
  const isWarning = alert.severity === 'warning';
  const isCritical = alert.severity === 'critical';

  return (
    <div className={`alert-item ${alert.severity}`}>
      <span className={`alert-icon ${alert.severity}`}>
        {isCritical ? <ShieldAlert size={18} /> : isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
      </span>
      <div className="alert-body">
        <div className="alert-title">{alert.message}</div>
        <div className="alert-meta">
          {showFull && (
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {alert.value} {alert.unit}
            </span>
          )}
          <span>{alert.parameter}</span>
          <span>{formatTime(alert.timestamp)} WIB</span>
        </div>
        {showFull && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            {alert.threshold}
          </div>
        )}
      </div>
      <div>
        <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
      </div>
    </div>
  );
}
