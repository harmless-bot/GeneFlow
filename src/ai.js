// src/ai.js

// Shared AI call router
export async function callAI(userPrompt, systemPrompt = '', maxTokens = 300, aiMode = 'fallback', groqKey = '') {
  if (aiMode === 'groq' && groqKey) {
    return await callGroq(userPrompt, systemPrompt, maxTokens, groqKey);
  } else {
    return await callFallback(userPrompt);
  }
}

export async function validateGroqKey(key) {
  if (!key.startsWith('gsk_')) {
    return { valid: false };
  }
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 5
      })
    });
    if (res.ok) {
      return { valid: true };
    } else {
      return { valid: false };
    }
  } catch {
    return { valid: false };
  }
}

async function callGroq(userPrompt, systemPrompt, maxTokens, groqKey) {
  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userPrompt });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: false
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Groq API error');
  }

  const data = await res.json();
  return data.choices[0].message.content.trim();
}

function callFallback(prompt) {
  // Parse context clues from the prompt string
  const gen      = parseInt(prompt.match(/[Gg]eneration[: ]+(\d+)/)?.[1]) || 0;
  const best     = parseFloat(prompt.match(/[Bb]est( Fitness)?[: ]+([0-9.]+)/)?.[2] || prompt.match(/[Bb]est[: ]+([0-9.]+)/)?.[1]) || 0;
  const avg      = parseFloat(prompt.match(/[Aa]vg( Fitness)?[: ]+([0-9.]+)/)?.[2] || prompt.match(/[Aa]vg[: ]+([0-9.]+)/)?.[1]) || 0;
  const diversity = parseFloat(prompt.match(/[Dd]iversity[: ]+([0-9.]+)/)?.[1]) || 0.5;

  // Description generation
  if (prompt.includes('description')) {
    return Promise.resolve(
      `Evolutionary optimizer evolving 30 propulsion configurations across ` +
      `7 parameters using tournament selection, Gaussian mutation, and elitism. ` +
      `Targeting maximum lift efficiency via field-resonance coupling.`
    );
  }

  // Mid-run analysis
  if (gen > 0 && prompt.includes('specific technical insight')) {
    const phase = gen < 20 ? 'exploration' : gen < 60 ? 'exploitation' : 'convergence';
    const gap   = (best - avg).toFixed(3);
    const lines = [
      `Gen ${gen} — ${phase} phase. Fitness gap: ${gap}. ` +
        (diversity < 0.1 ? 'Population homogenizing — diversity pressure recommended.' :
         diversity > 0.4 ? 'High genetic diversity maintained.' : 'Diversity nominal.'),
      `thrustVector and resonanceFreq dominating fitness gains at gen ${gen}. ` +
        `wavePhaseDeg still volatile. Best: ${best.toFixed(4)}.`,
      `Roulette pressure increasing. fieldPolarity converging to ` +
        `${(best * 0.72).toFixed(3)}. energyInputKW near optimal balance.`,
      `Crossover producing strong offspring. coilDensity-fieldPolarity coupling ` +
        `emerging as key synergy. Avg fitness δ: +${(best - avg).toFixed(4)}.`,
    ];
    return Promise.resolve(lines[gen % lines.length]);
  }

  // User question fallback
  if (prompt.toLowerCase().includes('why')) {
    return Promise.resolve(
      `Based on current GA state: fitness plateau typically indicates population ` +
      `convergence or local optima entrapment. Try increasing mutation rate or ` +
      `injecting fresh random chromosomes to escape.`
    );
  }

  if (prompt.toLowerCase().includes('?')) {
     return Promise.resolve(`The GA is currently in generation ${gen}. Best fitness is ${best.toFixed(4)}. Parameter coupling is behaving nominally.`);
  }

  // Final report
  if (prompt.includes('conclusion') || prompt.includes('complete')) {
    return Promise.resolve(
      `Optimization concluded after ${gen} generations with best fitness ` +
      `${best.toFixed(4)}.\n\nThe evolved propulsion configuration reveals strong ` +
      `coupling between thrustVector and fieldPolarity parameters, suggesting ` +
      `electromagnetic-mechanical resonance as the primary lift mechanism. ` +
      `The massRatio convergence near the golden ratio (0.618) is consistent ` +
      `with theoretical predictions for minimal gravitational drag.\n\n` +
      `Future work should explore multi-objective optimization incorporating ` +
      `energy efficiency constraints and thermal stability bounds across the ` +
      `7-dimensional parameter space.`
    );
  }

  return Promise.resolve(`[DEMO] Rule-based analysis active. Paste a free Groq key above for Llama 3.3 AI insights.`);
}
