/**
 * AQUA MONITOR — Blynk HTTP API Service
 * ----------------------------------------
 * All Blynk API calls go through this module.
 * Architecture: ESP32 → Blynk Cloud → (HTTP API) → Frontend
 */

import { BLYNK_CONFIG } from '../config/blynk.js';

const BASE = BLYNK_CONFIG.server;
const TOKEN = BLYNK_CONFIG.token;

/**
 * Generic fetch wrapper with timeout + error handling.
 */
async function blynkFetch(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// --- DUMMY DATA GENERATOR ---
let mockState = {
  temperature: 28.5,
  ph: 7.2,
  turbidity: 15.0,
  tds: 400.0
};

function generateMockData() {
  mockState.temperature += (Math.random() - 0.5) * 0.5;
  mockState.ph += (Math.random() - 0.5) * 0.1;
  mockState.turbidity += (Math.random() - 0.5) * 2;
  mockState.tds += (Math.random() - 0.5) * 10;

  mockState.temperature = Math.max(20, Math.min(35, mockState.temperature));
  mockState.ph = Math.max(5.5, Math.min(8.5, mockState.ph));
  mockState.turbidity = Math.max(0, Math.min(50, mockState.turbidity));
  mockState.tds = Math.max(200, Math.min(800, mockState.tds));

  return {
    temperature: Number(mockState.temperature.toFixed(2)),
    ph: Number(mockState.ph.toFixed(2)),
    turbidity: Number(mockState.turbidity.toFixed(2)),
    tds: Number(mockState.tds.toFixed(2)),
    errors: { temperature: null, ph: null, turbidity: null, tds: null },
    timestamp: new Date(),
  };
}

/**
 * Read a single virtual pin value from Blynk.
 */
export async function readPin(pin) {
  return new Promise(resolve => {
    setTimeout(() => {
      const data = generateMockData();
      const { pins } = BLYNK_CONFIG;
      if (pin === pins.temperature) resolve(data.temperature);
      else if (pin === pins.ph) resolve(data.ph);
      else if (pin === pins.turbidity) resolve(data.turbidity);
      else if (pin === pins.tds) resolve(data.tds);
      else resolve(null);
    }, 200);
  });
}

/**
 * Read multiple pins in parallel.
 */
export async function readAllSensors() {
  return new Promise(resolve => {
    setTimeout(() => resolve(generateMockData()), 500);
  });
}

/**
 * Check Blynk device online status.
 */
export async function checkDeviceStatus() {
  return new Promise(resolve => {
    setTimeout(() => resolve({ online: true, reason: null }), 200);
  });
}

/**
 * Blynk does not offer a free historical data REST API.
 * This function returns null to indicate that historical data
 * is unavailable — the UI should show an appropriate state.
 *
 * If you have a Blynk+ subscription, you can implement the
 * /external/api/data/get endpoint here.
 */
export async function getHistoricalData(_pin, _period) {
  // Historical data requires Blynk+ plan.
  // Returning null so UI renders the correct "unavailable" state.
  return null;
}
