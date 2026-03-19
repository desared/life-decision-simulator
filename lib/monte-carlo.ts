// Monte Carlo Simulation Engine
// Runs lightweight client-side simulations to produce probability distributions

export interface MonteCarloParams {
  probability: number   // 0-1, likelihood of this outcome
  impactScore: number   // 0-100, how favorable the outcome is
  volatility: number    // 0-1, uncertainty level
}

export interface HistogramBin {
  min: number
  max: number
  count: number
  frequency: number
}

export interface MonteCarloOutcomeResult {
  mean: number
  median: number
  stdDev: number
  p5: number
  p25: number
  p75: number
  p95: number
}

export interface MonteCarloResult {
  compositeScore: number
  compositeHistogram: HistogramBin[]
  outcomeResults: MonteCarloOutcomeResult[]
  p5: number
  p95: number
  iterations: number
  riskOfPoorOutcome: number    // P(score < 40)
  chanceOfGoodOutcome: number  // P(score >= 70)
}

/** Box-Muller transform for Gaussian random numbers */
function gaussianRandom(): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

/** Compute percentile from a sorted array */
function percentile(sorted: number[], p: number): number {
  const idx = Math.floor(sorted.length * (p / 100))
  return Math.round(sorted[Math.min(idx, sorted.length - 1)] * 10) / 10
}

/** Build histogram from samples */
function buildHistogram(samples: number[], binCount: number): HistogramBin[] {
  const binWidth = 100 / binCount
  const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    min: i * binWidth,
    max: (i + 1) * binWidth,
    count: 0,
    frequency: 0,
  }))
  for (const s of samples) {
    const bin = Math.min(Math.floor(s / binWidth), binCount - 1)
    bins[bin].count++
  }
  bins.forEach(b => (b.frequency = b.count / samples.length))
  return bins
}

/** Derive MC params from confidence level when Gemini doesn't return numerical values */
export function deriveParamsFromConfidence(
  confidence: "high" | "medium" | "low"
): MonteCarloParams {
  switch (confidence) {
    case "high":
      return { probability: 0.80, impactScore: 80, volatility: 0.15 }
    case "medium":
      return { probability: 0.55, impactScore: 60, volatility: 0.30 }
    case "low":
      return { probability: 0.30, impactScore: 40, volatility: 0.50 }
  }
}

/**
 * Run Monte Carlo simulation.
 *
 * For each iteration:
 * 1. Select an outcome via weighted random sampling (by probability)
 * 2. Sample its impact with Gaussian noise scaled by volatility
 * 3. Record the sample
 *
 * Returns distribution statistics and a histogram.
 */
export function runMonteCarloSimulation(
  params: MonteCarloParams[],
  iterations: number = 1000
): MonteCarloResult {
  // Normalize probabilities
  const totalProb = params.reduce((s, p) => s + p.probability, 0)
  const normalized = params.map(p => ({
    ...p,
    probability: totalProb > 0 ? p.probability / totalProb : 1 / params.length,
    // Enforce minimum volatility so distribution has visual spread
    volatility: Math.max(p.volatility, 0.10),
  }))

  // Per-outcome sample collectors
  const outcomeSamples: number[][] = params.map(() => [])
  const compositeSamples: number[] = []

  for (let i = 0; i < iterations; i++) {
    // 1. Weighted random outcome selection
    const r = Math.random()
    let cumProb = 0
    let selectedIdx = 0
    for (let j = 0; j < normalized.length; j++) {
      cumProb += normalized[j].probability
      if (r <= cumProb) {
        selectedIdx = j
        break
      }
    }

    const selected = normalized[selectedIdx]

    // 2. Sample impact with Gaussian noise
    const noise = gaussianRandom() * selected.volatility * 30
    const sample = Math.max(0, Math.min(100, selected.impactScore + noise))

    outcomeSamples[selectedIdx].push(sample)
    compositeSamples.push(sample)
  }

  // Sort composite for percentiles
  compositeSamples.sort((a, b) => a - b)

  const mean = compositeSamples.reduce((s, v) => s + v, 0) / compositeSamples.length
  const variance = compositeSamples.reduce((s, v) => s + (v - mean) ** 2, 0) / compositeSamples.length

  // Per-outcome results
  const outcomeResults: MonteCarloOutcomeResult[] = outcomeSamples.map(samples => {
    if (samples.length === 0) {
      return { mean: 0, median: 0, stdDev: 0, p5: 0, p25: 0, p75: 0, p95: 0 }
    }
    samples.sort((a, b) => a - b)
    const m = samples.reduce((s, v) => s + v, 0) / samples.length
    const v = samples.reduce((s, val) => s + (val - m) ** 2, 0) / samples.length
    return {
      mean: Math.round(m * 10) / 10,
      median: percentile(samples, 50),
      stdDev: Math.round(Math.sqrt(v) * 10) / 10,
      p5: percentile(samples, 5),
      p25: percentile(samples, 25),
      p75: percentile(samples, 75),
      p95: percentile(samples, 95),
    }
  })

  return {
    compositeScore: Math.round(mean * 10) / 10,
    compositeHistogram: buildHistogram(compositeSamples, 20),
    outcomeResults,
    p5: percentile(compositeSamples, 5),
    p95: percentile(compositeSamples, 95),
    iterations,
    riskOfPoorOutcome: Math.round((compositeSamples.filter(s => s < 40).length / compositeSamples.length) * 100) / 100,
    chanceOfGoodOutcome: Math.round((compositeSamples.filter(s => s >= 70).length / compositeSamples.length) * 100) / 100,
  }
}
