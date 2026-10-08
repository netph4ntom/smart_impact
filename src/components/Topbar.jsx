import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useSensor } from '../contexts/SensorContext.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import FreshnessBar from './FreshnessBar.jsx';
import { formatDateTime } from '../utils/helpers.js';
import { LogOut, ChevronDown } from 'lucide-react';

export default function Topbar() {
  const { user, logout } = useAuth();
  const { sensorData } = useSensor();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const now = sensorData.timestamp || Date.now();

  return (
    <header className="topbar">
      <div className="topbar-left" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FreshnessBar />
        </div>
      </div>

      <div className="topbar-center" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
          {formatDateTime(now)}
        </span>
      </div>

      <div className="topbar-right" style={{ flex: 1, justifyContent: 'flex-end' }}>
        <NotificationPanel />
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, 
              background: 'var(--bg-hover)', 
              borderRadius: 'var(--radius-md)', padding: '0.4rem 0.875rem', 
              border: '1px solid var(--border)', cursor: 'pointer', 
              color: 'inherit', outline: 'none'
            }}
          >
            <div className="user-avatar" style={{ width: 28, height: 28, fontSize: '0.65rem' }}>
              {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div className="user-details" style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{user?.username || 'Admin'}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Administrator</div>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
          </button>
          
          {showProfileMenu && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% + 4px)', right: 0, minWidth: '150px',
              background: 'var(--bg-surface)', border: '1px solid var(--border)', 
              borderRadius: 'var(--radius-md)', padding: '0.35rem', 
              zIndex: 100, boxShadow: 'var(--shadow-md)'
            }}>
              <button 
                onClick={logout}
                style={{ 
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, 
                  padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', 
                  color: 'var(--text-primary)', fontSize: '0.85rem', cursor: 'pointer', 
                  borderRadius: '4px', fontWeight: 500
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                <LogOut size={16} /> <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
