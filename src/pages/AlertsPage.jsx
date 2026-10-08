import { useSensor } from '../contexts/SensorContext.jsx';
import AlertItem from '../components/AlertItem.jsx';
import { THRESHOLDS } from '../config/blynk.js';
import { formatDateTime } from '../utils/helpers.js';

export default function AlertsPage() {
  const { alerts, sensorData, statuses } = useSensor();

  const hasAny = alerts.length > 0;
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts  = alerts.filter(a => a.severity === 'warning');

  return (
    <div className="fade-up">
      {/* Summary cards */}
      <div className="grid-3 stagger" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '3px solid var(--success)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Normal</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
            {Object.values(statuses).filter(s => s === 'normal').length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Parameter dalam batas normal</div>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Warning</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>{warningAlerts.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Mendekati batas threshold</div>
        </div>
        <div className="card" style={{ borderLeft: '3px solid var(--danger)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Critical</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>{criticalAlerts.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Melebihi batas critical</div>
        </div>
      </div>

      {/* Alert list */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           Active Alerts
          {hasAny && <span className="badge badge-warning">{alerts.length} aktif</span>}
        </div>

        {!hasAny ? (
          <div className="state-box">
            <div className="state-icon"></div>
            <h3>Semua Parameter Normal</h3>
            <p>Tidak ada alert aktif saat ini. Semua sensor dalam batas aman.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {criticalAlerts.length > 0 && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                   Critical
                </div>
                {criticalAlerts.map(a => <AlertItem key={a.id} alert={a} showFull />)}
              </div>
            )}
            {warningAlerts.length > 0 && (
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: criticalAlerts.length > 0 ? 12 : 0 }}>
                   Warning
                </div>
                {warningAlerts.map(a => <AlertItem key={a.id} alert={a} showFull />)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Threshold configuration reference */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem' }}> Threshold Configuration</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Normal Min</th>
                <th>Normal Max</th>
                <th>Warning Min</th>
                <th>Warning Max</th>
                <th>Current Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(THRESHOLDS).map(([key, t]) => (
                <tr key={key}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.label}</td>
                  <td>{t.normal.min} {t.unit}</td>
                  <td>{t.normal.max} {t.unit}</td>
                  <td>{t.warning.min} {t.unit}</td>
                  <td>{t.warning.max} {t.unit}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {sensorData[key] !== null ? sensorData[key] + ' ' + t.unit : '—'}
                  </td>
                  <td><span className={`badge badge-${statuses[key]}`}>{statuses[key]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
