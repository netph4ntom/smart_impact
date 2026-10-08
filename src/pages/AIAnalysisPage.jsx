import { useState } from 'react';
import { useSensor } from '../contexts/SensorContext.jsx';
import { runAIAnalysis } from '../services/aiService.js';
import { overallQuality } from '../utils/helpers.js';
import { Bot, Search, BarChart2, Info, AlertTriangle, ShieldAlert, Thermometer, Beaker, Droplets, Zap } from 'lucide-react';

const AI_CONFIGURED = !!(import.meta.env.VITE_AI_API_KEY);

export default function AIAnalysisPage() {
  const { sensorData, statuses, trends, alerts } = useSensor();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const q = overallQuality(statuses);

  async function handleAnalyze() {
    setLoading(true);
    setError('');
    try {
      const res = await runAIAnalysis({ sensors: sensorData, statuses, trends, alerts });
      setResult(res);
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan saat menjalankan analisis AI.');
    } finally {
      setLoading(false);
    }
  }

  // Rule-based fallback analysis when AI is not configured
  function getFallbackInsight() {
    const lines = [];
    const q = overallQuality(statuses);
    if (q.cls === 'good') {
      lines.push('Semua parameter berada dalam rentang normal.');
    } else {
      alerts.forEach(a => lines.push(`${a.message} (${a.value} ${a.unit}).`));
    }
    return {
      condition: q.cls === 'good' ? 'GOOD' : q.cls === 'critical' ? 'CRITICAL' : 'NEEDS_ATTENTION',
      analysis: lines.join(' ') || 'Data sensor saat ini tidak mencukupi untuk analisis.',
      recommendation: q.cls === 'good'
        ? 'Lanjutkan monitoring rutin. Periksa sensor secara berkala.'
        : 'Pantau parameter yang berada di luar batas normal. Lakukan pengecekan fisik kondisi kolam.',
      isRuleBased: true,
    };
  }

  const insight = result || (AI_CONFIGURED ? null : getFallbackInsight());

  return (
    <div className="fade-up">
      {/* Header */}
      <div className="ai-card" style={{ marginBottom: '1.25rem' }}>
        <div className="ai-header">
          <span className="ai-badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Bot size={16} /> AI INSIGHT</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.7 }}>
          Analisis kondisi kualitas air berdasarkan data sensor aktual dan memberikan rekomendasi tindakan pemeliharaan yang tepat.
        </p>

        {AI_CONFIGURED && (
          <button
            id="run-ai-btn"
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Menganalisis...</>
            ) : <><Search size={16} /> Jalankan Analisis AI</>}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.875rem 1.25rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} /> {error}
        </div>
      )}

      {/* Insight result */}
      {insight && (
        <div className="ai-card fade-up" style={{ marginBottom: '1.25rem' }}>

          <span className={`ai-condition ${insight.condition}`}>
            {insight.condition === 'GOOD' ? '✓ GOOD' : insight.condition === 'NEEDS_ATTENTION' ? '⚡ NEEDS ATTENTION' : '⛔ CRITICAL'}
          </span>

          <div style={{ marginBottom: '1rem' }}>
            <div className="ai-section-title">Analisis</div>
            <p className="ai-text">{insight.analysis}</p>
          </div>

          <div>
            <div className="ai-section-title">Rekomendasi</div>
            <p className="ai-text">{insight.recommendation}</p>
          </div>

          {insight.generatedAt && (
            <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Dianalisis pada {insight.generatedAt.toLocaleTimeString('id-ID')} WIB
            </div>
          )}
        </div>
      )}

      {/* Current sensor context */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><BarChart2 size={18} /> Data Sensor Saat Ini</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {[
            { key: 'temperature', label: 'Temperature', unit: '°C', icon: <Thermometer size={14} /> },
            { key: 'ph', label: 'pH', unit: '', icon: <Beaker size={14} /> },
            { key: 'turbidity', label: 'Turbidity', unit: 'NTU', icon: <Droplets size={14} /> },
            { key: 'tds', label: 'TDS/EC', unit: 'ppm', icon: <Zap size={14} /> },
          ].map(({ key, label, unit, icon }) => (
            <div key={key} style={{ background: 'var(--bg-card-2)', borderRadius: 'var(--radius-md)', padding: '0.875rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {sensorData[key] !== null ? sensorData[key] : '—'}
                <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: 4 }}>{unit}</span>
              </div>
              <span className={`badge badge-${statuses[key]}`} style={{ marginTop: 6 }}>{statuses[key]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ marginTop: '1rem', padding: '0.875rem 1rem', background: 'rgba(100,116,139,0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', border: '1px solid var(--border)', lineHeight: 1.6, display: 'flex', gap: 12 }}>
        <AlertTriangle size={24} style={{ flexShrink: 0, marginTop: 2, color: 'var(--warning)' }} />
        <div>
          <strong>Disclaimer AI:</strong> Analisis ini hanya sebagai decision support. AI tidak mendiagnosis penyakit,
          tidak mengklaim kondisi udang, dan tidak memberikan rekomendasi dosis bahan kimia.
          Selalu konsultasikan dengan ahli akuakultur untuk keputusan penting.
        </div>
      </div>
    </div>
  );
}
