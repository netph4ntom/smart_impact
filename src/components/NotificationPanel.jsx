import { useState, useRef, useEffect } from 'react';
import { useSensor } from '../contexts/SensorContext.jsx';
import { formatDateTime } from '../utils/helpers.js';

export default function NotificationPanel() {
  const { alerts, unreadCount, clearUnread } = useSensor();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function toggle() {
    setOpen(v => !v);
    if (!open) clearUnread();
  }

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      <button className="notif-btn" onClick={toggle} id="notif-btn" aria-label="Notifikasi">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unreadCount > 0 && (
          <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-panel fade-up">
          <div className="notif-panel-header">
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifikasi</span>
            {alerts.length > 0 && (
              <span className="badge badge-warning">{alerts.length} aktif</span>
            )}
          </div>
          <div className="notif-list">
            {alerts.length === 0 ? (
              <div className="notif-empty">
                <div style={{ fontSize: '1.5rem', marginBottom: 8 }}></div>
                Tidak ada notifikasi aktif
              </div>
            ) : (
              alerts.map(a => (
                <div key={a.id} className="notif-item">
                  <div className={`notif-item-dot ${a.severity}`} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 2 }}>{a.message}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {a.parameter} · {a.value} {a.unit}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDateTime(a.timestamp)}
                    </div>
                  </div>
                  <span className={`badge badge-${a.severity}`}>{a.severity}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
