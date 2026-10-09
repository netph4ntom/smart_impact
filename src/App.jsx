import { useState, useEffect } from 'react';
import './index.css';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { SensorProvider } from './contexts/SensorContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RealtimeMonitorPage from './pages/RealtimeMonitorPage.jsx';
import WaterQualityPage from './pages/WaterQualityPage.jsx';
import TrendAnalysisPage from './pages/TrendAnalysisPage.jsx';
import AlertsPage from './pages/AlertsPage.jsx';
import AIAnalysisPage from './pages/AIAnalysisPage.jsx';
import SystemStatusPage from './pages/SystemStatusPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import Topbar from './components/Topbar.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';

import { LayoutDashboard, Activity, Droplets, TrendingUp, AlertTriangle, BrainCircuit, Cpu } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  monitor:   'Realtime Monitoring',
  water:     'Water Quality',
  trend:     'Trend Analysis',
  alerts:    'Alerts',
  ai:        'AI Analysis',
  system:    'System Status',
};

const PAGE_ICONS = {
  dashboard: <LayoutDashboard size={22} color="var(--primary)" strokeWidth={2.5} />,
  monitor:   <Activity size={22} color="var(--primary)" strokeWidth={2.5} />,
  water:     <Droplets size={22} color="var(--primary)" strokeWidth={2.5} />,
  trend:     <TrendingUp size={22} color="var(--primary)" strokeWidth={2.5} />,
  alerts:    <AlertTriangle size={22} color="var(--primary)" strokeWidth={2.5} />,
  ai:        <BrainCircuit size={22} color="var(--primary)" strokeWidth={2.5} />,
  system:    <Cpu size={22} color="var(--primary)" strokeWidth={2.5} />,
};

function AppShell() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline  = () => setIsOffline(true);
    const goOnline   = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online',  goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online',  goOnline);
    };
  }, []);

  // Fix for Recharts ResponsiveContainer not calculating width correctly
  // during/after the .fade-up CSS animation when switching pages.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 450); // fadeUp animation duration is 0.4s
    return () => clearTimeout(timer);
  }, [currentPage]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div className="login-logo" style={{ width: 56, height: 56, background: 'transparent', boxShadow: 'none' }}>
            <img src="/icons/logo.png" alt="Smart Impact Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="spinner" />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Smart Impact</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;

  function renderPage() {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentPage} />;
      case 'monitor':   return <RealtimeMonitorPage />;
      case 'water':     return <WaterQualityPage />;
      case 'trend':     return <TrendAnalysisPage />;
      case 'alerts':    return <AlertsPage />;
      case 'ai':        return <AIAnalysisPage />;
      case 'system':    return <SystemStatusPage />;
      default:          return <DashboardPage onNavigate={setCurrentPage} />;
    }
  }

  return (
    <div className={`app-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="main-content">
        {isOffline && (
          <div className="offline-banner">
             Kamu sedang offline. Data mungkin tidak diperbarui.
          </div>
        )}
        <Topbar />
        <main className="page-content" role="main">
          <div className="page-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2 }}>
                {PAGE_ICONS[currentPage]}
                {PAGE_TITLES[currentPage]}
              </h1>
            </div>
          </div>
          {renderPage()}
        </main>
      </div>
      <MobileBottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SensorProvider>
        <AppShell />
      </SensorProvider>
    </AuthProvider>
  );
}
