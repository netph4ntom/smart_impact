import { useSensor } from '../contexts/SensorContext.jsx';
import { overallQuality } from '../utils/helpers.js';
import { CheckCircle, AlertTriangle, AlertOctagon, Activity } from 'lucide-react';

export default function WaterQualityBadge({ compact = false }) {
  const { statuses } = useSensor();
  const q = overallQuality(statuses);
  const total = Object.keys(statuses).length;

  let Icon;
  let color;
  let bg;
  
  if (q.cls === 'critical') {
    Icon = AlertOctagon;
  } else if (q.cls === 'attention' || q.cls === 'warning') {
    Icon = AlertTriangle;
  } else {
    Icon = CheckCircle;
  }

  if (compact) {
    return (
      <div className={`wq-status-card compact ${q.cls}`}>
        <div className={`wq-icon ${q.cls}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className={`wq-label ${q.cls}`}>{q.label}</div>
          <div className="wq-sub">{q.count}/{total} parameters normal</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`wq-status-card ${q.cls}`}>
      <div className={`wq-icon ${q.cls}`}>
        <Icon size={30} strokeWidth={2.5} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>
          Water Quality Status
        </div>
        <div className={`wq-label ${q.cls}`} style={{ marginBottom: '0.35rem' }}>
          {q.label}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.count} of {total}</span> parameters within target range
        </div>
        {q.cls !== 'good' && (
          <div className={`badge badge-${q.cls === 'attention' || q.cls === 'warning' ? 'warning' : 'critical'}`} style={{ marginTop: '0.75rem', padding: '0.4rem 0.75rem' }}>
            <Activity size={14} strokeWidth={2.5} /> Water quality requires immediate attention
          </div>
        )}
      </div>
    </div>
  );
}
