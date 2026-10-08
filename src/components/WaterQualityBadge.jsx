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
    color = 'var(--danger)';
    bg = 'rgba(239, 68, 68, 0.12)';
  } else if (q.cls === 'attention' || q.cls === 'warning') {
    Icon = AlertTriangle;
    color = 'var(--warning)';
    bg = 'rgba(245, 158, 11, 0.12)';
  } else {
    Icon = CheckCircle;
    color = 'var(--success)';
    bg = 'rgba(6, 214, 160, 0.12)';
  }

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: bg, color: color, flexShrink: 0 }}>
          <Icon size={24} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{q.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{q.count}/{total} parameters normal</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: `1px solid ${bg}`, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: '50%', background: bg, color: color, flexShrink: 0 }}>
        <Icon size={34} strokeWidth={2.5} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem', fontWeight: 600 }}>
          Water Quality Status
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color, letterSpacing: '0.02em', textTransform: 'uppercase', marginBottom: '0.35rem', lineHeight: 1 }}>
          {q.label}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.count} of {total}</span> parameters within target range
        </div>
        {q.cls !== 'good' && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 600, color: color, display: 'flex', alignItems: 'center', gap: '0.35rem', background: bg, padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-md)', width: 'fit-content' }}>
            <Activity size={14} strokeWidth={2.5} /> Water quality requires immediate attention
          </div>
        )}
      </div>
    </div>
  );
}
