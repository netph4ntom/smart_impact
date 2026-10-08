/**
 * AQUA MONITOR — Sensor Data Context
 * Manages polling, sensor state, alerts, trends, and history buffer.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { get, set } from 'idb-keyval';
import { readAllSensors, checkDeviceStatus } from '../services/blynkApi.js';
import { getStatus, THRESHOLDS } from '../config/blynk.js';

const SensorContext = createContext(null);

const HISTORY_MAX = 20000; // in-memory history points (approx 3.5 days at 15s)
const DEFAULT_POLL_MS = 15000;
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 min

export function SensorProvider({ children }) {
  const [sensorData, setSensorData] = useState({
    temperature: null,
    ph: null,
    turbidity: null,
    tds: null,
    errors: {},
    timestamp: null,
  });
  const [deviceStatus, setDeviceStatus] = useState({
    online: null,
    reason: null,
  });
  const [history, setHistory] = useState([]); // [{timestamp, temperature, ph, turbidity, tds}]
  const [alerts, setAlerts] = useState([]);
  const [loadingState, setLoadingState] = useState('idle'); // idle | loading | error | ok
  const [pollInterval, setPollInterval] = useState(DEFAULT_POLL_MS);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const historyLoaded = useRef(false);

  useEffect(() => {
    get('aqua_history').then(val => {
      if (val && Array.isArray(val)) setHistory(val);
      historyLoaded.current = true;
    }).catch(() => {
      historyLoaded.current = true;
    });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Derive trend from last N history points
  const computeTrends = useCallback((hist) => {
    if (hist.length < 2) return {};
    const recent = hist.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const params = ['temperature', 'ph', 'turbidity', 'tds'];
    const trends = {};
    for (const p of params) {
      const a = first[p];
      const b = last[p];
      if (a === null || b === null) {
        trends[p] = { direction: 'unknown', changePercent: 0, current: b, previous: a };
        continue;
      }
      const pct = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
      const absChange = b - a;
      let direction;
      if (Math.abs(pct) < 1) direction = 'stable';
      else if (pct > 5) direction = 'increasing';
      else if (pct < -5) direction = 'decreasing';
      else direction = Math.abs(pct) > 2 ? 'fluctuating' : 'stable';
      trends[p] = { direction, changePercent: pct, change: absChange, current: b, previous: a };
    }
    return trends;
  }, []);

  // Generate alerts from current sensor values
  const generateAlerts = useCallback((data, ts) => {
    const params = ['temperature', 'ph', 'turbidity', 'tds'];
    const newAlerts = [];
    for (const p of params) {
      const val = data[p];
      const status = getStatus(p, val);
      if (status === 'warning' || status === 'critical') {
        const t = THRESHOLDS[p];
        newAlerts.push({
          id: p,
          parameter: t.label,
          paramKey: p,
          value: val,
          unit: t.unit,
          status,
          severity: status,
          threshold:
            status === 'warning'
              ? `Normal range: ${t.normal.min}–${t.normal.max}`
              : `Critical: outside ${t.warning.min}–${t.warning.max}`,
          message:
            status === 'warning'
              ? `${t.label} mendekati batas threshold`
              : `${t.label} melebihi batas critical`,
          timestamp: ts,
        });
      }
    }
    return newAlerts;
  }, []);

  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return;
    setLoadingState((s) => (s === 'idle' ? 'loading' : s));

    const [dataResult, statusResult] = await Promise.allSettled([
      readAllSensors(),
      checkDeviceStatus(),
    ]);

    if (!mountedRef.current) return;

    if (statusResult.status === 'fulfilled') {
      setDeviceStatus(statusResult.value);
    }

    if (dataResult.status === 'fulfilled') {
      const data = dataResult.value;
      const ts = data.timestamp;

      setSensorData(data);
      setLoadingState('ok');

      // Update in-memory history
      setHistory((prev) => {
        const point = {
          timestamp: ts,
          temperature: data.temperature,
          ph: data.ph,
          turbidity: data.turbidity,
          tds: data.tds,
        };
        const next = [...prev, point];
        const newHist = next.length > HISTORY_MAX ? next.slice(-HISTORY_MAX) : next;
        if (historyLoaded.current) set('aqua_history', newHist).catch(() => {});
        return newHist;
      });

      // Generate alerts
      const newAlerts = generateAlerts(data, ts);
      
      let newAlertsCount = 0;
      setAlerts(prevAlerts => {
        const prevMap = new Map(prevAlerts.map(a => [a.id, a]));
        for (const na of newAlerts) {
          const pa = prevMap.get(na.id);
          if (!pa || (pa.severity === 'warning' && na.severity === 'critical')) {
            newAlertsCount++;
          } else {
            na.timestamp = pa.timestamp; // preserve original timestamp
          }
        }
        return newAlerts;
      });

      if (newAlertsCount > 0 && notificationsEnabled) {
        setUnreadCount((c) => c + newAlertsCount);
      }
    } else {
      setLoadingState('error');
    }
  }, [generateAlerts, notificationsEnabled]);

  // Polling
  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, pollInterval);
    return () => clearInterval(timerRef.current);
  }, [fetchData, pollInterval]);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const statuses = {
    temperature: getStatus('temperature', sensorData.temperature),
    ph: getStatus('ph', sensorData.ph),
    turbidity: getStatus('turbidity', sensorData.turbidity),
    tds: getStatus('tds', sensorData.tds),
  };

  const trends = computeTrends(history);

  const isStale =
    sensorData.timestamp &&
    new Date() - new Date(sensorData.timestamp) > STALE_THRESHOLD_MS;

  return (
    <SensorContext.Provider
      value={{
        sensorData,
        deviceStatus,
        history,
        alerts,
        statuses,
        trends,
        loadingState,
        isStale,
        pollInterval,
        setPollInterval,
        notificationsEnabled,
        setNotificationsEnabled,
        unreadCount,
        clearUnread,
        refetch: fetchData,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensor must be within SensorProvider');
  return ctx;
}
