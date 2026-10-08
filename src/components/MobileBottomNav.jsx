import { useSensor } from '../contexts/SensorContext.jsx';

const MOBILE_ITEMS = [
  { key: 'dashboard', label: 'Home',    icon: HomeIcon },
  { key: 'monitor',   label: 'Monitor', icon: MonitorIcon },
  { key: 'trend',     label: 'Trend',   icon: TrendIcon },
  { key: 'alerts',    label: 'Alerts',  icon: AlertIcon, badge: true },
];

function HomeIcon()    { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function MonitorIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>; }
function TrendIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>; }
function AlertIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }

export default function MobileBottomNav({ currentPage, onNavigate }) {
  const { alerts } = useSensor();

  return (
    <nav className="mobile-bottom-nav" id="mobile-bottom-nav" role="navigation" aria-label="Bottom navigation">
      {MOBILE_ITEMS.map(({ key, label, icon: Icon, badge }) => (
        <button
          key={key}
          className={`mobile-nav-item ${currentPage === key ? 'active' : ''}`}
          onClick={() => onNavigate(key)}
          id={`mobile-nav-${key}`}
          aria-label={label}
        >
          {badge && alerts.length > 0 && (
            <span className="mobile-nav-badge">{alerts.length > 9 ? '9+' : alerts.length}</span>
          )}
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
