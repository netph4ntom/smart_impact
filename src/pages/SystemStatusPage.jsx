import { useSensor } from '../contexts/SensorContext.jsx';
import { BLYNK_CONFIG } from '../config/blynk.js';
import { timeAgo } from '../utils/helpers.js';
import { Cable, Info, Activity, Settings2, RefreshCw } from 'lucide-react';

export default function SystemStatusPage() {
  const { sensorData, deviceStatus, loadingState, refetch } = useSensor();

  const activeSensors = ['temperature', 'ph', 'turbidity', 'tds']
    .filter(k => sensorData[k] !== null).length;

  const isOnline = navigator.onLine;
  const blynkConfigured = BLYNK_CONFIG.token && BLYNK_CONFIG.token !== 'YourBlynkAuthTokenHere';

  return (
    <div className="fade-up">
      <div className="system-status-grid">
        {/* Hardware & Connectivity */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cable size={18} /> Hardware & Connectivity
          </div>

          <div className="status-row">
            <div>
              <div className="status-label" style={{ fontWeight: 500 }}>ESP32</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Microcontroller</div>
            </div>
            <span className={`status-value ${deviceStatus.online ? 'status-ok' : deviceStatus.online === false ? 'status-err' : 'status-neutral'}`}>
              <div className={`live-dot ${deviceStatus.online === false ? 'danger' : ''}`} />
              {deviceStatus.online === true ? 'Online' : deviceStatus.online === false ? 'Offline' : 'Checking…'}
            </span>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label" style={{ fontWeight: 500 }}>Internet</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Browser network</div>
            </div>
            <span className={`status-value ${isOnline ? 'status-ok' : 'status-err'}`}>
              <div className={`live-dot ${!isOnline ? 'danger' : ''}`} />
              {isOnline ? 'Connected' : 'Offline'}
            </span>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label" style={{ fontWeight: 500 }}>Blynk Cloud</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Data broker</div>
            </div>
            <span className={`status-value ${loadingState === 'ok' ? 'status-ok' : loadingState === 'error' ? 'status-err' : 'status-neutral'}`}>
              <div className={`live-dot ${loadingState === 'error' ? 'danger' : ''}`} />
              {loadingState === 'ok' ? 'Connected' : loadingState === 'error' ? 'Error' : 'Connecting…'}
            </span>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label" style={{ fontWeight: 500 }}>Data Stream</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Blynk → Frontend</div>
            </div>
            <span className={`status-value ${loadingState === 'ok' ? 'status-ok' : 'status-neutral'}`}>
              <div className={`live-dot ${loadingState !== 'ok' ? 'danger' : ''}`} />
              {loadingState === 'ok' ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="status-row">
            <div>
              <div className="status-label" style={{ fontWeight: 500 }}>Sensors</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active datastreams</div>
            </div>
            <span className={`status-value ${activeSensors === 4 ? 'status-ok' : activeSensors > 0 ? 'status-warn' : 'status-err'}`}>
              {activeSensors}/4 Active
            </span>
          </div>

          <div className="status-row">
            <span className="status-label">Last Update</span>
            <span className="status-value status-neutral">
              {sensorData.timestamp ? timeAgo(sensorData.timestamp) : '—'}
            </span>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={refetch} id="system-refresh-btn" style={{ marginTop: '0.875rem', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={14} /> Refresh Status
          </button>
        </div>

        {/* Device Information */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} /> Device Information</div>

            <div className="status-row">
              <span className="status-label">Firmware</span>
              <span className="status-value status-neutral">ESP32 (Blynk)</span>
            </div>
            <div className="status-row">
              <span className="status-label">Blynk Server</span>
              <span className="status-value status-neutral" style={{ fontSize: '0.78rem' }}>{BLYNK_CONFIG.server}</span>
            </div>
            <div className="status-row">
              <span className="status-label">Token</span>
              <span className={`status-value ${blynkConfigured ? 'status-ok' : 'status-err'}`}>
                {blynkConfigured ? '✓ Configured' : '⚠ Not set'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Pin Config</span>
              <span className="status-value status-neutral" style={{ fontSize: '0.75rem' }}>
                {Object.entries(BLYNK_CONFIG.pins).map(([k, v]) => `${k}:${v}`).join(', ')}
              </span>
            </div>
          </div>

          {/* Sensor health per param */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} /> Sensor Health</div>
            {['temperature', 'ph', 'turbidity', 'tds'].map(k => {
              const active = sensorData[k] !== null;
              const errMsg = sensorData.errors?.[k];
              return (
                <div key={k} className="status-row">
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem', textTransform: 'capitalize' }}>{k}</div>
                    {errMsg && <div style={{ fontSize: '0.7rem', color: 'var(--danger)' }}>{errMsg}</div>}
                  </div>
                  <span className={`status-value ${active ? 'status-ok' : 'status-err'}`}>
                    <div className={`live-dot ${!active ? 'danger' : ''}`} />
                    {active ? 'Active' : 'No Data'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Blynk setup guide */}
      {!blynkConfigured && (
        <div style={{ marginTop: '1.25rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--warning)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><Settings2 size={18} /> Setup Blynk</div>
          <ol style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 2 }}>
            <li>Buat akun di <a href="https://blynk.cloud" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>blynk.cloud</a></li>
            <li>Buat template dan tambahkan datastream sesuai sensor ESP32 kamu</li>
            <li>Copy Auth Token dari Blynk console</li>
            <li>Edit file <code>.env</code> dan isi <code>VITE_BLYNK_TOKEN</code></li>
            <li>Sesuaikan <code>VITE_PIN_*</code> dengan virtual pin yang digunakan di ESP32</li>
            <li>Restart dev server (<code>npm run dev</code>)</li>
          </ol>
        </div>
      )}
    </div>
  );
}
