import React, { useState, useEffect, useRef } from 'react';
import { fitness, select, crossover, mutate, diversity, initPopulation } from './ga';
import { callAI, validateGroqKey } from './ai';

const PARAM_NAMES = ['THRUST', 'MASS·R', 'F·POLR', 'RESONF', 'COIL·D', 'ENERGY', 'PHASE'];

const LOG_COLORS = {
  ga:   '#00ff88',
  ai:   '#00c9a7',
  sys:  '#888888',
  warn: '#f5a623',
  err:  '#ff4444',
  user: '#ffffff',
};

const CONFIGS_DEF = [
  { key: 'popSize',   label: 'POPULATION',  min: 10,    max: 60,   step: 5 },
  { key: 'mutRate',   label: 'MUTATION',    min: 0.001, max: 0.1,  step: 0.001 },
  { key: 'crossRate', label: 'CROSSOVER',   min: 0.5,   max: 1.0,  step: 0.05 },
  { key: 'elitism',   label: 'ELITISM',     min: 0,     max: 5,    step: 1 },
  { key: 'maxGen',    label: 'MAX GENS',    min: 50,    max: 200,  step: 10 },
];

export default function App() {
  // Key Input State
  const [groqKey, setGroqKey] = useState('');
  const [aiMode, setAiMode] = useState('fallback'); // 'groq' | 'fallback'
  const [keyStatus, setKeyStatus] = useState('empty'); // 'empty' | 'testing' | 'valid' | 'invalid'

  // Config State
  const [config, setConfig] = useState({
    popSize: 30,
    mutRate: 0.01,
    crossRate: 0.8,
    elitism: 2,
    maxGen: 100,
    speed: 'normal' // slow, normal, fast
  });

  // GA State
  const [gaState, setGaState] = useState('stopped'); // stopped, running, paused, finished
  const [population, setPopulation] = useState([]);
  const [generation, setGeneration] = useState(0);
  const [bestFitness, setBestFitness] = useState(0);
  const [avgFitness, setAvgFitness] = useState(0);
  const [bestChromosome, setBestChromosome] = useState(null);
  const [diversityScore, setDiversityScore] = useState(0);
  const [genSpeedMs, setGenSpeedMs] = useState(0);
  const [history, setHistory] = useState([]);
  
  // UI State
  const [description, setDescription] = useState('Initialize simulation to generate description.');
  const [logs, setLogs] = useState([{ type: 'sys', text: 'System initialized. Waiting for input...', time: new Date().toTimeString().slice(0,8), id: Date.now() }]);
  const [terminalInput, setTerminalInput] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [eta, setEta] = useState('calculating...');

  // Refs
  const gaLoopRef = useRef(null);
  const chartRef = useRef(null);
  const terminalRef = useRef(null);

  // Logging
  const addLog = (type, text) => {
    const timestamp = new Date().toTimeString().slice(0,8);
    setLogs(prev => [...prev.slice(-199), { type, text, time: timestamp, id: Date.now() }]);
  };

  // Chart setup
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
    script.onload = () => {
      const ctx = document.getElementById('fitnessChart').getContext('2d');
      chartRef.current = new window.Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
          { label: 'Best', data: [], borderColor: '#00ff88', backgroundColor: 'rgba(0,255,136,0.1)', fill: true, borderWidth: 1.5, pointRadius: 0, tension: 0.2 },
          { label: 'Avg', data: [], borderColor: '#00c9a7', borderDash: [5, 5], borderWidth: 1, pointRadius: 0, tension: 0.2 }
        ]},
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          interaction: { intersect: false, mode: 'index' },
          scales: {
            x: { grid: { color: 'rgba(0,255,136,0.04)', drawBorder: false }, ticks: { color: '#555', font: { family: 'JetBrains Mono', size: 9 }, maxTicksLimit: 10 } },
            y: { min: 0, max: 1, grid: { color: 'rgba(0,255,136,0.04)', drawBorder: false }, ticks: { color: '#555', font: { family: 'JetBrains Mono', size: 9 } } }
          },
          plugins: {
            legend: { labels: { color: '#666', font: { family: 'JetBrains Mono', size: 10 }, boxWidth: 12 } },
            tooltip: { backgroundColor: '#1a1a1a', borderColor: 'rgba(0,255,136,0.3)', borderWidth: 1, titleColor: '#00ff88', bodyColor: '#aaa', titleFont: { family: 'JetBrains Mono' }, bodyFont: { family: 'JetBrains Mono' } }
          }
        }
      });
    };
    document.head.appendChild(script);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleKeyChange = async (e) => {
    const key = e.target.value;
    setGroqKey(key);
    if (!key) {
      setKeyStatus('empty');
      setAiMode('fallback');
      return;
    }
    setKeyStatus('testing');
    const result = await validateGroqKey(key);
    if (result.valid) {
      setKeyStatus('valid');
      setAiMode('groq');
      addLog('sys', '✓ Groq API connected — Llama 3.3 70B active');
    } else {
      setKeyStatus('invalid');
      setAiMode('fallback');
      addLog('warn', '✗ Invalid key — running in rule-based mode');
    }
  };

  const updateChart = (gen, best, avg) => {
    if (!chartRef.current) return;
    chartRef.current.data.labels.push(gen);
    chartRef.current.data.datasets[0].data.push(best);
    chartRef.current.data.datasets[1].data.push(avg);
    chartRef.current.update('none');
  };

  const computeETA = (hist) => {
    if (hist.length < 10) return null;
    const last10 = hist.slice(-10);
    const n = last10.length;
    const xs = last10.map((_, i) => i);
    const ys = last10.map(h => h.best);
    const sumX  = xs.reduce((a, b) => a + b, 0);
    const sumY  = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    if (slope <= 0) return '∞';
    const gensNeeded = Math.ceil((0.97 - last10[n-1].best) / slope);
    return gensNeeded > 0 ? gensNeeded : 'imminent';
  };

  const triggerDescription = async () => {
    addLog('ai', '[AI] Generating project description...');
    const prompt = `Generate a 2-sentence technical description of a Genetic Algorithm 
      optimizing propulsion parameters: thrustVector, massRatio, fieldPolarity, 
      resonanceFreq, coilDensity, energyInputKW, wavePhaseDeg. 
      Write as if for a real aerospace research dashboard. Be concise and technical.`;
    const sys = `You are an AI embedded in a GeneFlow propulsion research simulation. Respond with only the description text, no preamble.`;
    try {
      const result = await callAI(prompt, sys, 120, aiMode, groqKey);
      setDescription(result);
      addLog('ai', `[AI] ${result}`);
    } catch(e) {
      addLog('err', `[AI Error] ${e.message}`);
    }
  };

  const triggerAIAnalysis = async (gen, best, avg, div, bestChromo) => {
    const prompt = `Generation ${gen} complete. Best Fitness: ${best.toFixed(4)}. Avg Fitness: ${avg.toFixed(4)}. Diversity: ${div.toFixed(4)}. Best Chromosome: ${JSON.stringify(bestChromo)}. In 1-2 sentences, give a specific technical insight. Mention which parameters are converging and why.`;
    const sys = `You are a genetic algorithm analyst. Be concise and technical. No preamble, just the insight.`;
    addLog('ai', '[AI] Analyzing generation...');
    try {
      const result = await callAI(prompt, sys, 200, aiMode, groqKey);
      addLog('ai', `[AI] ${result}`);
    } catch(e) {
      addLog('err', `[AI Error] ${e.message}`);
    }
  };

  const triggerFinalReport = async (gen, best, bestChromo) => {
    setShowReportModal(true);
    setReportText('Generating research report...');
    const prompt = `GA simulation complete. Total Generations: ${gen}. Best Fitness: ${best.toFixed(4)}. Final Configuration: ${JSON.stringify(bestChromo)}. Write a 3-paragraph academic research conclusion. Interpret each parameter value physically. Discuss what the GA found and suggest future research directions.`;
    const sys = `You are writing for an academic aerospace engineering paper. Use technical language. Structure: findings, interpretation, future work.`;
    try {
      const result = await callAI(prompt, sys, 600, aiMode, groqKey);
      setReportText(result);
    } catch(e) {
      setReportText(`Error generating report: ${e.message}`);
    }
  };

  const handleUserQuestion = async (e) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;
    const question = terminalInput.trim();
    setTerminalInput('');
    addLog('user', `> ${question}`);
    
    const prompt = `The user asked: "${question}"
Current simulation state:
- Generation: ${generation}
- Best Fitness: ${bestFitness.toFixed(4)}
- Avg Fitness: ${avgFitness.toFixed(4)}
- Diversity: ${diversityScore.toFixed(4)}
- Status: ${gaState}
Answer using this real data. Be concise (2-3 sentences max).`;
    const sys = `You are an AI assistant embedded in a live genetic algorithm simulation dashboard. Answer questions about the running GA using the provided data.`;
    try {
      const result = await callAI(prompt, sys, 250, aiMode, groqKey);
      addLog('ai', `[AI] ${result}`);
    } catch(err) {
      addLog('err', `[AI Error] ${err.message}`);
    }
  };

  const startGA = () => {
    if (gaState === 'stopped' || gaState === 'finished') {
      const pop = initPopulation(config.popSize);
      setPopulation(pop);
      setGeneration(0);
      setHistory([]);
      if (chartRef.current) {
        chartRef.current.data.labels = [];
        chartRef.current.data.datasets[0].data = [];
        chartRef.current.data.datasets[1].data = [];
        chartRef.current.update();
      }
      triggerDescription();
    }
    setGaState('running');
  };

  const stepGA = () => {
    setPopulation(pop => {
      const t0 = performance.now();
      const fits = pop.map(fitness);
      const best = Math.max(...fits);
      const avg  = fits.reduce((a, b) => a + b) / fits.length;
      const div  = diversity(pop);
      const bestIdx = fits.indexOf(best);
      const currentBestChromo = pop[bestIdx];
      
      let currentMutRate = config.mutRate;
      if (div < 0.05) {
        currentMutRate = 0.05;
        addLog('warn', `⚠ DIVERSITY CRITICAL (${div.toFixed(3)}) — adaptive mutation → 0.05`);
      }

      const sorted = [...pop].map((c, i) => [c, fits[i]]).sort((a, b) => b[1] - a[1]);
      const newPop = sorted.slice(0, config.elitism).map(x => x[0]);

      while (newPop.length < config.popSize) {
        const p1 = select(pop, fits);
        const p2 = select(pop, fits);
        const [c1, c2] = crossover(p1, p2, config.crossRate);
        newPop.push(mutate(c1, currentMutRate));
        if (newPop.length < config.popSize) newPop.push(mutate(c2, currentMutRate));
      }
      
      const genTime = performance.now() - t0;
      
      setGeneration(g => {
        const nextGen = g + 1;
        updateChart(nextGen, best, avg);
        addLog('ga', `[GEN ${String(nextGen).padStart(3,'0')}] Best: ${best.toFixed(4)} | Avg: ${avg.toFixed(4)} | Div: ${div.toFixed(3)} | ${genTime.toFixed(1)}ms`);
        
        if (nextGen % 25 === 0 && nextGen > 0) {
          triggerAIAnalysis(nextGen, best, avg, div, currentBestChromo);
        }
        
        setHistory(prev => {
          const newHist = [...prev, { best, avg }];
          if (nextGen >= 30) {
            const calculatedEta = computeETA(newHist);
            setEta(calculatedEta !== null ? `~${calculatedEta} generations` : 'calculating...');
          }
          return newHist;
        });

        if (best >= 0.97 || nextGen >= config.maxGen) {
          setGaState('finished');
        }
        
        return nextGen;
      });

      setBestFitness(best);
      setAvgFitness(avg);
      setBestChromosome(currentBestChromo);
      setDiversityScore(div);
      setGenSpeedMs(genTime);
      
      return newPop;
    });
  };

  useEffect(() => {
    if (gaState === 'running') {
      const delay = { slow: 400, normal: 150, fast: 30 }[config.speed] || 150;
      gaLoopRef.current = setTimeout(stepGA, delay);
    }
    return () => clearTimeout(gaLoopRef.current);
  }, [gaState, population, config.speed]);

  const exportJSON = () => {
    const data = {
      project: 'GeneFlow Propulsion Optimizer',
      date: new Date().toISOString(),
      aiMode, config, totalGenerations: generation, bestFitness,
      bestChromosome: bestChromosome ? {
        thrustVector: bestChromosome[0], massRatio: bestChromosome[1], fieldPolarity: bestChromosome[2],
        resonanceFreq: bestChromosome[3], coilDensity: bestChromosome[4], energyInputKW: bestChromosome[5], wavePhaseDeg: bestChromosome[6]
      } : null,
      generationHistory: history,
      terminalLogs: logs.filter(l => l.type === 'ai').map(l => l.text),
      conclusion: reportText,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `geneflow-run-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const barColor = (val) => {
    if (val > 0.7) return '#00ff88';
    if (val > 0.4) return '#f5a623';
    return '#ff4444';
  };

  const isRunning = gaState === 'running';
  const temp = isRunning ? Math.round(45 + (40 / (genSpeedMs / 10 + 1)) + (Math.random() * 4 - 2)) : Math.round(38 + Math.random() * 3);
  const clockMhz = isRunning ? Math.round(2400 + (2400 / (genSpeedMs / 5 + 1)) + (Math.random() * 150 - 75)) : Math.round(1200 + Math.random() * 25 - 12);
  const powerW = isRunning ? Math.round(45 + (105 / (genSpeedMs / 5 + 1)) + (Math.random() * 12 - 6)) : Math.round(25 + Math.random() * 4);
  const memUsed = window.performance?.memory ? (window.performance.memory.usedJSHeapSize / 1e9).toFixed(2) : (1.2 + config.popSize * 0.01).toFixed(2);
  const memTotal = window.performance?.memory ? (window.performance.memory.jsHeapSizeLimit / 1e9).toFixed(2) : '4.00';
  const memPercent = Math.min(100, Math.round((parseFloat(memUsed) / parseFloat(memTotal)) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Key Input Bar */}
      <div style={{ background: '#111', borderBottom: '1px solid var(--border)', padding: '8px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'var(--green)' }}>🤖 AI ENGINE</span>
          <input 
            type="password" 
            placeholder="gsk_..." 
            value={groqKey} 
            onChange={handleKeyChange} 
            style={{ background: '#000', border: '1px solid var(--dim)', color: 'var(--text)', padding: '4px 8px', borderRadius: '3px', width: '200px', fontFamily: 'var(--mono)', fontSize: '11px' }}
          />
          <span style={{ color: keyStatus === 'empty' ? 'var(--dim)' : keyStatus === 'testing' ? 'var(--amber)' : keyStatus === 'valid' ? 'var(--green)' : 'var(--red)' }}>
            {keyStatus === 'empty' ? '○ NO KEY — DEMO MODE' : keyStatus === 'testing' ? '◌ VALIDATING...' : keyStatus === 'valid' ? '● GROQ CONNECTED — Llama 3.3 70B' : '✗ INVALID KEY — DEMO MODE'}
          </span>
        </div>
        <div style={{ color: 'var(--dim)', fontSize: '10px' }}>Get free key → groq.com · Free · No credit card · 14k req/day</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 240px', gap: '16px', padding: '16px', flex: 1, overflow: 'hidden' }}>
        {/* Left Panel */}
        <div className="panel" style={{ padding: '16px', overflowY: 'auto' }}>
          <div className="title">GeneFlow</div>
          <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '16px', letterSpacing: '1px', flexShrink: 0 }}>Research Dashboard</div>
          <div style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.5', marginBottom: '16px', minHeight: '60px', flexShrink: 0 }}>
            {description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexShrink: 0 }}>
            <span style={{ height: '8px', width: '8px', borderRadius: '50%', background: gaState === 'running' ? 'var(--green)' : 'var(--dim)', animation: gaState === 'running' ? 'pulse-dot 1.5s infinite' : 'none' }}></span>
            <span style={{ fontSize: '11px', color: 'var(--text)', textTransform: 'uppercase' }}>{gaState}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button className="btn btn-solid" onClick={startGA} disabled={gaState === 'running'}>RUN</button>
            <button className="btn" onClick={() => setGaState('paused')} disabled={gaState !== 'running'}>PAUSE</button>
            <button className="btn" onClick={() => setGaState('stopped')} disabled={gaState === 'stopped'}>STOP</button>
            <button className="btn" onClick={() => { setGaState('stopped'); setGeneration(0); setHistory([]); if(chartRef.current){ chartRef.current.data.labels=[]; chartRef.current.data.datasets.forEach(d=>d.data=[]); chartRef.current.update(); } }}>RESET</button>
            <button className="btn" onClick={() => triggerFinalReport(generation, bestFitness, bestChromosome)} disabled={gaState !== 'finished'}>REPORT</button>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '12px' }}>CONFIGURATION</div>
            {CONFIGS_DEF.map(c => (
              <div key={c.key} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>
                  <label htmlFor={c.key} style={{ cursor: 'pointer' }}>{c.label}</label>
                  <span>{config[c.key]}</span>
                </div>
                <input 
                  id={c.key}
                  type="range" min={c.min} max={c.max} step={c.step} value={config[c.key]} 
                  onChange={e => setConfig({...config, [c.key]: parseFloat(e.target.value)})}
                  disabled={gaState === 'running'}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '4px', marginTop: '16px' }}>
              {['slow', 'normal', 'fast'].map(s => (
                <button key={s} aria-pressed={config.speed === s} className={`btn ${config.speed === s ? 'active' : ''}`} style={{flex: 1}} onClick={() => setConfig({...config, speed: s})}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {['Python', 'GA', 'Optimization', 'TSP', 'NumPy'].map(t => (
                <span key={t} style={{ background: '#1a1a1a', padding: '2px 6px', borderRadius: '3px', fontSize: '9px', color: 'var(--dim)' }}>{t}</span>
              ))}
            </div>
            <svg width="40" height="60" viewBox="0 0 40 60" style={{ opacity: 0.4 }}>
              <style>{`
                @keyframes helixLeft  { 0%{d:path('M5,0 Q20,15 5,30 Q20,45 5,60')}  50%{d:path('M20,0 Q5,15 20,30 Q5,45 20,60')}  100%{d:path('M5,0 Q20,15 5,30 Q20,45 5,60')} }
                @keyframes helixRight { 0%{d:path('M35,0 Q20,15 35,30 Q20,45 35,60')} 50%{d:path('M20,0 Q35,15 20,30 Q35,45 20,60')} 100%{d:path('M35,0 Q20,15 35,30 Q20,45 35,60')} }
              `}</style>
              <path stroke="#00ff88" strokeWidth="1.5" fill="none" style={{animation:'helixLeft 2s ease-in-out infinite'}} d="M5,0 Q20,15 5,30 Q20,45 5,60"/>
              <path stroke="#00c9a7" strokeWidth="1.5" fill="none" style={{animation:'helixRight 2s ease-in-out infinite'}} d="M35,0 Q20,15 35,30 Q20,45 35,60"/>
              {[10, 20, 30, 40, 50].map(y => (
                <line key={y} x1="5" y1={y} x2="35" y2={y} stroke="rgba(0,255,136,0.25)" strokeWidth="1"/>
              ))}
            </svg>
          </div>
        </div>

        {/* Center Panel */}
        <div className="panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '11px', color: 'var(--dim)' }}>
            <div>DATA SPLIT: <span style={{ color: '#aaa' }}>Train 80% / Test 20%</span></div>
            <div>LAST UPDATE: <span style={{ color: '#aaa' }}>{new Date().toTimeString().slice(0,5)}</span></div>
            <div>ETA TO CONVERGENCE: <span style={{ color: 'var(--amber)' }}>{eta}</span></div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <canvas id="fitnessChart"></canvas>
          </div>
        </div>

        {/* Right Panel */}
        <div className="panel" style={{ padding: '16px', overflowY: 'auto' }}>
          <div style={{ fontSize: '10px', color: 'var(--dim)', marginBottom: '4px' }}>MEM USE: {memUsed} / {memTotal} GB</div>
          <div style={{ background: '#1a1a1a', height: '6px', borderRadius: '3px', marginBottom: '12px' }}>
            <div style={{ width: `${memPercent}%`, height: '100%', background: memPercent > 80 ? 'var(--red)' : 'var(--green)', borderRadius: '3px' }}></div>
          </div>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>POP SIZE: <span style={{ color: 'var(--text)' }}>{config.popSize}</span></div>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>GEN SPEED: <span style={{ color: 'var(--text)' }}>{genSpeedMs.toFixed(1)} ms/gen</span></div>

          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>CROSSOVER: <span style={{ color: 'var(--text)' }}>{config.crossRate.toFixed(2)}</span></div>
          <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>MUTATION:  <span style={{ color: 'var(--text)' }}>{config.mutRate.toFixed(3)}</span></div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>🌡 TEMP:  <span style={{ color: temp > 80 ? 'var(--red)' : 'var(--text)' }}>{temp}°C</span></div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>⚡ CLOCK: <span style={{ color: 'var(--text)' }}>{clockMhz} MHz</span></div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '16px' }}>🔋 POWER: <span style={{ color: 'var(--text)' }}>{powerW}W</span></div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', flex: 1 }}>
            <div style={{ color: 'var(--dim)', fontSize: '10px', marginBottom: '8px' }}>BEST CHROMOSOME</div>
            {PARAM_NAMES.map((name, i) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', marginBottom: '6px', gap: '6px' }}>
                <span style={{ color: 'var(--dim)', fontSize: '9px', width: '44px', flexShrink: 0 }}>{name}</span>
                <div style={{ flex: 1, background: '#1a1a1a', height: '6px', borderRadius: '2px' }}>
                  <div style={{
                    width: `${(bestChromosome?.[i] || 0) * 100}%`,
                    height: '100%',
                    background: barColor(bestChromosome?.[i] || 0),
                    borderRadius: '2px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ color: '#aaa', fontSize: '9px', width: '30px', textAlign: 'right' }}>
                  {(bestChromosome?.[i] || 0).toFixed(2)}
                </span>
              </div>
            ))}

            <div style={{ marginTop: '20px' }}>
              <div style={{ color: diversityScore < 0.05 ? 'var(--amber)' : 'var(--dim)', fontSize: '10px', marginBottom: '6px' }}>
                DIVERSITY {diversityScore < 0.05 ? '⚠ CRITICAL' : ''}
              </div>
              <div style={{ background: '#1a1a1a', height: '6px', borderRadius: '2px' }}>
                <div style={{
                  width: `${Math.min(diversityScore * 200, 100)}%`,
                  height: '100%',
                  background: diversityScore < 0.05 ? 'var(--amber)' : diversityScore > 0.3 ? 'var(--green)' : 'var(--teal)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ color: '#888', fontSize: '9px', marginTop: '4px' }}>
                σ = {diversityScore.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div style={{ height: '200px', background: '#0a0a0a', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '10px', color: 'var(--dim)', padding: '4px 16px', background: '#111', borderBottom: '1px solid #222' }}>TERMINAL / INFERENCE LOGS</div>
        <div ref={terminalRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', fontSize: '11px', lineHeight: '1.6' }}>
          {logs.map(log => (
            <div key={log.id} style={{ color: LOG_COLORS[log.type] }}>
              <span style={{ color: '#333' }}>{log.time} </span>
              {log.text}
            </div>
          ))}
          <span style={{ animation: 'blink-cursor 1s infinite', color: 'var(--green)' }}>▋</span>
        </div>
        <form onSubmit={handleUserQuestion} style={{ display: 'flex', padding: '8px 16px', background: '#111', borderTop: '1px solid #222' }}>
          <span style={{ color: 'var(--green)', marginRight: '8px' }}>&gt;</span>
          <input 
            type="text" 
            value={terminalInput}
            onChange={e => setTerminalInput(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontFamily: 'var(--mono)', fontSize: '11px' }} 
            placeholder="Ask AI about the simulation..."
          />
          <button type="submit" className="btn" style={{ marginLeft: '12px' }}>SEND ↵</button>
        </form>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div style={{
            background: '#111', border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 6, padding: 32, maxWidth: 640, width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ color: '#00ff88', fontFamily: 'Bebas Neue', fontSize: 28, marginBottom: 4 }}>
              RESEARCH REPORT
            </div>
            <div style={{ color: '#444', fontSize: 11, fontFamily: 'JetBrains Mono', marginBottom: 20 }}>
              Fitness: {bestFitness.toFixed(4)} · Generations: {generation} · {new Date().toLocaleString()}
            </div>
            <div style={{ color: '#ccc', fontSize: 12, fontFamily: 'JetBrains Mono', lineHeight: 1.8, whiteSpace: 'pre-wrap', flex: 1, overflowY: 'auto' }}>
              {reportText}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={exportJSON} className="btn btn-solid">⬇ EXPORT JSON</button>
              <button onClick={() => setShowReportModal(false)} className="btn">CLOSE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
