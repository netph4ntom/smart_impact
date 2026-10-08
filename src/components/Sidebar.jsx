import { useSensor } from '../contexts/SensorContext.jsx';

import {
  LayoutDashboard, Activity, Droplets, TrendingUp, 
  AlertTriangle, BrainCircuit, Cpu, Waves,
  ChevronLeft, ChevronRight
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',          icon: <LayoutDashboard size={18} /> },
  { key: 'monitor',     label: 'Realtime Monitoring', icon: <Activity size={18} /> },
  { key: 'water',       label: 'Water Quality',       icon: <Droplets size={18} /> },
  { key: 'trend',       label: 'Trend Analysis',      icon: <TrendingUp size={18} /> },
  { key: 'alerts',      label: 'Alerts',              icon: <AlertTriangle size={18} />, badge: true },
  { key: 'ai',          label: 'AI Analysis',         icon: <BrainCircuit size={18} /> },
  { key: 'system',      label: 'System Status',       icon: <Cpu size={18} /> },
];

export default function Sidebar({ currentPage, onNavigate, isCollapsed, onToggleCollapse }) {
  const { alerts } = useSensor();

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand" style={{ height: '72px', boxSizing: 'border-box', padding: isCollapsed ? '0 0.5rem' : '0 1.25rem', justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
        <div className="sidebar-logo">
          <Waves size={20} color="#fff" strokeWidth={2.5} />
        </div>
        {!isCollapsed && (
          <div className="sidebar-brand-text">
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '0.05em', color: '#fff', margin: 0 }}>
              SMART<span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>IMPACT</span>
            </h1>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {!isCollapsed && <div className="nav-section-label">Main Menu</div>}
        {NAV_ITEMS.slice(0, 5).map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            id={`nav-${item.key}`}
            title={item.label}
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <span>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
            {item.badge && alerts.length > 0 && (
              <span className="nav-badge" style={isCollapsed ? { position: 'absolute', top: 4, right: 4 } : {}}>{alerts.length}</span>
            )}
          </button>
        ))}

        {!isCollapsed && <div className="nav-section-label" style={{ marginTop: '0.5rem' }}>Analytics</div>}
        {NAV_ITEMS.slice(5).map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
            id={`nav-${item.key}`}
            title={item.label}
            style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <span>{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', padding: '0.75rem 0.5rem' }}>
        <button
          className="nav-item"
          onClick={onToggleCollapse}
          title="Toggle Sidebar"
          style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', color: 'var(--text-muted)' }}
        >
          <span>{isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}</span>
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </button>
      </div>

    </aside>
  );
}
