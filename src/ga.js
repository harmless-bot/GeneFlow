// src/ga.js

export function fitness(c) {
  const [tv, mr, fp, rf, cd, ei, wp] = c;
  const thrustEff  = tv * (1 - Math.abs(mr - 0.618));        // golden ratio peak
  const fieldRes   = Math.sin(rf * Math.PI) * fp;             // resonance coupling
  const coilSync   = cd * Math.cos((wp / 360) * 2 * Math.PI);// phase alignment
  const energyBal  = 1 - Math.abs(ei - 0.5) * 2;             // penalize extremes
  const raw = thrustEff * 0.30 + fieldRes * 0.25 + coilSync * 0.25 + energyBal * 0.20;
  return Math.max(0, Math.min(1, raw + (Math.random() - 0.5) * 0.015));
}

// Tournament selection (k=3)
export function select(pop, fits) {
  const k = 3;
  let best = Math.floor(Math.random() * pop.length);
  for (let i = 1; i < k; i++) {
    const c = Math.floor(Math.random() * pop.length);
    if (fits[c] > fits[best]) best = c;
  }
  return pop[best];
}

// Uniform crossover
export function crossover(p1, p2, rate = 0.8) {
  if (Math.random() > rate) return [[...p1], [...p2]];
  const c1 = p1.map((g, i) => Math.random() < 0.5 ? g : p2[i]);
  const c2 = p2.map((g, i) => Math.random() < 0.5 ? g : p1[i]);
  return [c1, c2];
}

// Gaussian mutation
export function mutate(ind, rate = 0.01, sigma = 0.1) {
  return ind.map(g => {
    if (Math.random() < rate) {
      const noise = sigma * (Math.random() + Math.random() - 1); // Box-Muller approx
      return Math.max(0, Math.min(1, g + noise));
    }
    return g;
  });
}

// Diversity: mean std-dev across genes
export function diversity(pop) {
  if (!pop || pop.length === 0) return 0;
  return pop[0].map((_, gi) => {
    const vals = pop.map(c => c[gi]);
    const mean = vals.reduce((a, b) => a + b) / vals.length;
    const variance = vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length;
    return Math.sqrt(variance);
  }).reduce((a, b) => a + b) / 7;
}

// Generate random individual
export function randomIndividual() {
  return Array.from({ length: 7 }, () => Math.random());
}

// Generate initial population
export function initPopulation(size) {
  return Array.from({ length: size }, randomIndividual);
}
