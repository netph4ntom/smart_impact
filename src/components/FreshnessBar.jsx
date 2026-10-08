import { useSensor } from '../contexts/SensorContext.jsx';
import { timeAgo } from '../utils/helpers.js';

export default function FreshnessBar() {
  const { sensorData, loadingState, isStale, deviceStatus } = useSensor();

  if (loadingState === 'loading' || loadingState === 'idle') {
    return (
      <div className="freshness-bar loading">
        <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
        Memuat data...
      </div>
    );
  }

  if (!deviceStatus.online && deviceStatus.reason === 'not_configured') {
    return (
      <div className="freshness-bar offline">
         Token Blynk belum dikonfigurasi
      </div>
    );
  }

  if (deviceStatus.online === false) {
    return (
      <div className="freshness-bar offline">
        <div className="live-dot danger" />
         Device ESP32 Offline
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="freshness-bar offline">
         Tidak dapat terhubung ke Blynk
      </div>
    );
  }

  if (isStale) {
    return (
      <div className="freshness-bar stale">
         Data mungkin sudah lama · {timeAgo(sensorData.timestamp)}
      </div>
    );
  }

  return (
    <div className="freshness-bar live">
      <div className="live-dot" />
      LIVE · Updated {timeAgo(sensorData.timestamp)}
    </div>
  );
}
