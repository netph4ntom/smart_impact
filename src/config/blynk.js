/**
 * AQUA MONITOR — Blynk Configuration
 * ------------------------------------
 * Update your Blynk Auth Token and Virtual Pin mapping here,
 * or set the corresponding VITE_* environment variables in .env
 *
 * Virtual Pin mapping — match these to your actual Blynk datastreams:
 *   VITE_PIN_TEMPERATURE  → V pin for temperature sensor
 *   VITE_PIN_PH           → V pin for pH sensor
 *   VITE_PIN_TURBIDITY    → V pin for turbidity sensor
 *   VITE_PIN_TDS          → V pin for TDS/EC sensor
 */

export const BLYNK_CONFIG = {
  token: import.meta.env.VITE_BLYNK_TOKEN || '',
  server: import.meta.env.VITE_BLYNK_SERVER || 'https://blynk.cloud',
  deviceId: import.meta.env.VITE_BLYNK_DEVICE_ID || '',

  /** Virtual Pin mapping — edit to match your datastreams */
  pins: {
    temperature: import.meta.env.VITE_PIN_TEMPERATURE || 'V0',
    ph: import.meta.env.VITE_PIN_PH || 'V1',
    turbidity: import.meta.env.VITE_PIN_TURBIDITY || 'V2',
    tds: import.meta.env.VITE_PIN_TDS || 'V3',
  },

  /** Polling interval in milliseconds (default 15 s) */
  pollInterval: 15000,
};

/**
 * Parameter threshold configuration.
 * Adjust these ranges to match your monitoring requirements.
 * status: 'normal' | 'warning' | 'critical'
 */
export const THRESHOLDS = {
  temperature: {
    unit: '°C',
    label: 'Temperature',
    normal: { min: 26, max: 32 },
    warning: { min: 24, max: 35 },
    // outside warning range → critical
  },
  ph: {
    unit: '',
    label: 'pH',
    normal: { min: 7.5, max: 8.5 },
    warning: { min: 7.0, max: 9.0 },
  },
  turbidity: {
    unit: 'NTU',
    label: 'Turbidity',
    normal: { min: 0, max: 20 },
    warning: { min: 0, max: 40 },
  },
  tds: {
    unit: 'ppm',
    label: 'TDS / EC',
    normal: { min: 800, max: 2000 },
    warning: { min: 500, max: 2500 },
  },
};

/**
 * Derive status string from a value and its threshold config.
 * @param {string} param - key in THRESHOLDS
 * @param {number|null} value
 * @returns {'normal'|'warning'|'critical'|'unknown'}
 */
export function getStatus(param, value) {
  if (value === null || value === undefined || isNaN(value)) return 'unknown';
  const t = THRESHOLDS[param];
  if (!t) return 'unknown';
  if (value >= t.normal.min && value <= t.normal.max) return 'normal';
  if (value >= t.warning.min && value <= t.warning.max) return 'warning';
  return 'critical';
}
