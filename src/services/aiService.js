/**
 * AQUA MONITOR — AI Analysis Service
 * -------------------------------------
 * Uses Gemini (or any configured provider) to analyze sensor data
 * and provide water quality decision support.
 *
 * AI will NOT:
 *  - diagnose shrimp diseases
 *  - claim shrimp are healthy based on sensors alone
 *  - recommend chemical dosages without sufficient data
 *  - fabricate sensor values
 */

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY || '';
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'https://generativelanguage.googleapis.com/v1beta';
const AI_MODEL = import.meta.env.VITE_AI_MODEL || 'gemini-2.0-flash';

/**
 * Build a structured prompt from sensor context.
 */
function buildPrompt(context) {
  const { sensors, statuses, trends, alerts } = context;

  const sensorLines = [
    `- Temperature: ${sensors.temperature !== null ? sensors.temperature + ' °C' : 'unavailable'} (${statuses.temperature})`,
    `- pH: ${sensors.ph !== null ? sensors.ph : 'unavailable'} (${statuses.ph})`,
    `- Turbidity: ${sensors.turbidity !== null ? sensors.turbidity + ' NTU' : 'unavailable'} (${statuses.turbidity})`,
    `- TDS/EC: ${sensors.tds !== null ? sensors.tds + ' ppm' : 'unavailable'} (${statuses.tds})`,
  ].join('\n');

  const alertLines = alerts.length
    ? alerts.map(a => `- ${a.severity.toUpperCase()}: ${a.parameter} = ${a.value} (${a.message})`).join('\n')
    : '- No active alerts';

  const trendLines = Object.entries(trends)
    .map(([k, v]) => `- ${k}: ${v?.direction || 'unknown'} (${v?.changePercent?.toFixed(1) || 0}%)`)
    .join('\n');

  return `You are a water quality monitoring assistant for an aquaculture system.
Analyze the following sensor data and provide a concise analysis and recommendation.

IMPORTANT RESTRICTIONS:
- Do NOT diagnose animal diseases
- Do NOT claim animals are healthy or sick based only on sensor data
- Do NOT recommend specific chemical dosages without lab data
- Do NOT fabricate any data
- Respond in Indonesian (Bahasa Indonesia)
- Keep the analysis under 100 words
- Keep the recommendation under 80 words

SENSOR DATA:
${sensorLines}

ACTIVE ALERTS:
${alertLines}

PARAMETER TRENDS:
${trendLines}

Respond ONLY with valid JSON in this exact format:
{
  "condition": "GOOD" | "NEEDS_ATTENTION" | "CRITICAL",
  "analysis": "...",
  "recommendation": "..."
}`;
}

/**
 * Run AI analysis using the Gemini API.
 * Returns null if AI is not configured (graceful fallback).
 */
export async function runAIAnalysis(context) {
  if (!AI_API_KEY) {
    return null; // AI not configured — UI shows fallback state
  }

  const prompt = buildPrompt(context);
  const url = `${AI_API_URL}/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!res.ok) throw new Error(`AI API error: ${res.status}`);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid AI response format');

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      condition: parsed.condition || 'UNKNOWN',
      analysis: parsed.analysis || '',
      recommendation: parsed.recommendation || '',
      generatedAt: new Date(),
    };
  } catch (err) {
    console.error('[AI] Analysis failed:', err);
    throw err;
  }
}
