/**
 * Pure, dependency-free statistics core for the Data-Science 2 learning site.
 *
 * Everything here is self-contained and exact (no d3, no randomness from
 * `Math.random`). Random draws go through an explicit seeded RNG so widgets
 * and tests are fully reproducible.
 *
 * Statistical correctness is non-negotiable: these functions feed every
 * interactive widget (CLT/sampling distribution, normal-area, confidence
 * intervals, ...), so a wrong number here would teach students wrong things.
 */

// ---------------------------------------------------------------------------
// Descriptive statistics
// ---------------------------------------------------------------------------

/** Arithmetic mean of a sample. */
export function mean(xs: number[]): number {
	if (xs.length === 0) return NaN;
	let sum = 0;
	for (const x of xs) sum += x;
	return sum / xs.length;
}

/**
 * SAMPLE variance: sum of squared deviations divided by (n − 1).
 *
 * Returns 0 for a single observation (n − 1 = 0 is guarded so we never
 * return NaN/Infinity for n = 1). Returns NaN for an empty array.
 */
export function variance(xs: number[]): number {
	const n = xs.length;
	if (n === 0) return NaN;
	if (n === 1) return 0;
	const m = mean(xs);
	let ss = 0;
	for (const x of xs) {
		const d = x - m;
		ss += d * d;
	}
	return ss / (n - 1);
}

/** Sample standard deviation (square root of the sample variance). */
export function sd(xs: number[]): number {
	return Math.sqrt(variance(xs));
}

/** Standard error of the mean: sd / sqrt(n). */
export function standardError(xs: number[]): number {
	return sd(xs) / Math.sqrt(xs.length);
}

// ---------------------------------------------------------------------------
// Bayes / medizinischer Test
// ---------------------------------------------------------------------------

/**
 * Positiver prädiktiver Wert P(krank | positiv) — die Wahrscheinlichkeit,
 * tatsächlich krank zu sein, gegeben ein positives Testergebnis.
 *
 * Über den Satz von Bayes mit den Bausteinen eines medizinischen Tests:
 *   - prevalence  = P(krank)            — Prävalenz in der Bevölkerung
 *   - sensitivity = P(positiv | krank)  — Sensitivität (richtig-positiv-Rate)
 *   - specificity = P(negativ | gesund) — Spezifität (richtig-negativ-Rate)
 *
 * Es gilt:
 *   richtig-positiv = prevalence · sensitivity
 *   falsch-positiv  = (1 − prevalence) · (1 − specificity)
 *   P(krank|positiv) = richtig-positiv / (richtig-positiv + falsch-positiv)
 *
 * Alle drei Argumente sind Wahrscheinlichkeiten in [0, 1]. Gibt es überhaupt
 * keine positiven Tests (Nenner = 0, etwa Prävalenz 0 und perfekte Spezifität),
 * ist der Wert undefiniert; wir geben dann 0 zurück (fail-safe statt NaN).
 */
export function positivePredictiveValue(
	prevalence: number,
	sensitivity: number,
	specificity: number
): number {
	const truePositive = prevalence * sensitivity;
	const falsePositive = (1 - prevalence) * (1 - specificity);
	const positives = truePositive + falsePositive;
	if (positives <= 0) return 0;
	return truePositive / positives;
}

// ---------------------------------------------------------------------------
// Histogram binning
// ---------------------------------------------------------------------------

/**
 * Count how many `values` fall into each of `nBins` equal-width bins spanning
 * the half-open intervals that tile [min, max].
 *
 * Contract:
 *   - Bin `i` covers [min + i·w, min + (i+1)·w) with w = (max − min) / nBins.
 *   - A value exactly equal to `max` is counted in the LAST bin (so the upper
 *     edge is inclusive only for the final bin).
 *   - Values OUTSIDE [min, max] are IGNORED (not clamped), so a histogram only
 *     ever reflects the requested domain. NaN is likewise ignored.
 *   - Requires nBins ≥ 1 and max > min; otherwise an empty/zero array is
 *     returned (nBins ≤ 0 → []) to fail safe rather than throw in a widget.
 *
 * Returns an array of length `nBins` of non-negative integer counts.
 */
export function binCounts(
	values: number[],
	min: number,
	max: number,
	nBins: number
): number[] {
	if (nBins <= 0) return [];
	const counts = new Array<number>(nBins).fill(0);
	if (!(max > min)) return counts;

	const width = (max - min) / nBins;
	for (const v of values) {
		if (!Number.isFinite(v)) continue;
		if (v < min || v > max) continue; // outside domain → ignore
		let idx = Math.floor((v - min) / width);
		// value === max (and tiny float overshoots) land in the last bin.
		if (idx >= nBins) idx = nBins - 1;
		if (idx < 0) idx = 0;
		counts[idx]++;
	}
	return counts;
}

// ---------------------------------------------------------------------------
// Normal distribution
// ---------------------------------------------------------------------------

const SQRT_2PI = Math.sqrt(2 * Math.PI);

/** Probability density of N(mu, sigma^2) at x. */
export function normalPdf(x: number, mu = 0, sigma = 1): number {
	const z = (x - mu) / sigma;
	return Math.exp(-0.5 * z * z) / (sigma * SQRT_2PI);
}

/**
 * Error function via Abramowitz & Stegun 7.1.26.
 * Maximum absolute error ~1.5e−7, which is far better than the 1e−4 we need.
 */
function erf(x: number): number {
	const sign = x < 0 ? -1 : 1;
	const ax = Math.abs(x);

	const t = 1 / (1 + 0.3275911 * ax);
	const y =
		1 -
		((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
			t *
			Math.exp(-ax * ax);

	return sign * y;
}

/** Cumulative distribution function of N(mu, sigma^2) at x. */
export function normalCdf(x: number, mu = 0, sigma = 1): number {
	const z = (x - mu) / sigma;
	return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Inverse normal CDF (quantile function) for N(mu, sigma^2).
 *
 * Uses Peter Acklam's rational approximation (relative error < 1.15e−9 in the
 * central region; the tails are slightly less accurate but well within the
 * ~1e−4 we need). Edge cases p<=0 / p>=1 map to ∓Infinity.
 */
export function normalQuantile(p: number, mu = 0, sigma = 1): number {
	if (p <= 0) return -Infinity;
	if (p >= 1) return Infinity;

	// Coefficients for Acklam's algorithm.
	const a = [
		-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2,
		-3.066479806614716e1, 2.506628277459239
	];
	const b = [
		-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1,
		-1.328068155288572e1
	];
	const c = [
		-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734,
		4.374664141464968, 2.938163982698783
	];
	const d = [
		7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416
	];

	// Break-points.
	const pLow = 0.02425;
	const pHigh = 1 - pLow;

	let z: number;
	if (p < pLow) {
		// Lower tail.
		const q = Math.sqrt(-2 * Math.log(p));
		z =
			(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
			((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
	} else if (p <= pHigh) {
		// Central region.
		const q = p - 0.5;
		const r = q * q;
		z =
			((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q) /
			(((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
	} else {
		// Upper tail.
		const q = Math.sqrt(-2 * Math.log(1 - p));
		z =
			-(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
			((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
	}

	// One step of Halley's rational refinement to push accuracy to ~machine
	// precision in the central region (cheap and keeps the tails honest).
	const e = normalCdf(z) - p;
	const u = e * SQRT_2PI * Math.exp(0.5 * z * z);
	z = z - u / (1 + (z * u) / 2);

	return mu + sigma * z;
}

// ---------------------------------------------------------------------------
// Student-t distribution
// ---------------------------------------------------------------------------

/**
 * Regularized incomplete beta function I_x(a, b) via the Lentz continued
 * fraction (Numerical Recipes). Needed for the Student-t CDF below.
 *
 * Converges for 0 < x < 1; the symmetry I_x(a,b) = 1 − I_{1−x}(b,a) is used
 * by the caller to keep x in the fast-converging region.
 */
function betacf(x: number, a: number, b: number): number {
	const FPMIN = 1e-300;
	const qab = a + b;
	const qap = a + 1;
	const qam = a - 1;
	let c = 1;
	let d = 1 - (qab * x) / qap;
	if (Math.abs(d) < FPMIN) d = FPMIN;
	d = 1 / d;
	let h = d;
	for (let m = 1; m <= 200; m++) {
		const m2 = 2 * m;
		let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
		d = 1 + aa * d;
		if (Math.abs(d) < FPMIN) d = FPMIN;
		c = 1 + aa / c;
		if (Math.abs(c) < FPMIN) c = FPMIN;
		d = 1 / d;
		h *= d * c;
		aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
		d = 1 + aa * d;
		if (Math.abs(d) < FPMIN) d = FPMIN;
		c = 1 + aa / c;
		if (Math.abs(c) < FPMIN) c = FPMIN;
		d = 1 / d;
		const del = d * c;
		h *= del;
		if (Math.abs(del - 1) < 1e-12) break;
	}
	return h;
}

/** Natural log of the gamma function (Lanczos approximation). */
function logGamma(z: number): number {
	const g = [
		676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
		12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
	];
	if (z < 0.5) {
		// Reflection formula.
		return Math.log(Math.PI / Math.sin(Math.PI * z)) - logGamma(1 - z);
	}
	z -= 1;
	let x = 0.99999999999980993;
	for (let i = 0; i < g.length; i++) x += g[i] / (z + i + 1);
	const t = z + g.length - 0.5;
	return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/** Regularized incomplete beta function I_x(a, b). */
function incompleteBeta(x: number, a: number, b: number): number {
	if (x <= 0) return 0;
	if (x >= 1) return 1;
	const bt = Math.exp(
		logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x)
	);
	// Use the continued fraction in its fast-converging region.
	if (x < (a + 1) / (a + b + 2)) {
		return (bt * betacf(x, a, b)) / a;
	}
	return 1 - (bt * betacf(1 - x, b, a)) / b;
}

/**
 * Cumulative distribution function of Student's t with `df` degrees of freedom.
 * Built from the regularized incomplete beta function:
 *   F(t) = 1 − ½ · I_{df/(df+t²)}(df/2, ½)   for t ≥ 0  (symmetric for t < 0).
 */
export function tCdf(t: number, df: number): number {
	if (df <= 0) return NaN;
	const xBeta = df / (df + t * t);
	const ib = incompleteBeta(xBeta, df / 2, 0.5);
	const tail = 0.5 * ib; // P(T ≥ |t|)
	return t >= 0 ? 1 - tail : tail;
}

/**
 * Inverse Student-t CDF (quantile function): returns the value q such that
 * P(T ≤ q) = p for `df` degrees of freedom.
 *
 * Implemented by numerically inverting `tCdf` with a robust bisection that is
 * bracketed using the normal quantile as a starting scale. Accurate to well
 * within the ~1e−2 tolerance the lesson needs; as df → ∞ it converges to the
 * standard-normal quantile (e.g. tQuantile(0.975, 1e7) ≈ 1.96).
 *
 * Contract / tested against R's qt():
 *   qt(0.975, 9)  ≈ 2.262
 *   qt(0.975, 30) ≈ 2.042
 *   qt(0.975, 1e7) ≈ 1.96  (→ z)
 *
 * Edge cases: p ≤ 0 → −Infinity, p ≥ 1 → +Infinity, df ≤ 0 → NaN.
 */
export function tQuantile(p: number, df: number): number {
	if (df <= 0) return NaN;
	if (p <= 0) return -Infinity;
	if (p >= 1) return Infinity;
	if (p === 0.5) return 0;

	// The t quantile is at least as far from 0 as the normal quantile (t has
	// heavier tails), so the normal quantile gives a safe lower magnitude. We
	// widen a generous bracket around it and bisect.
	const z = normalQuantile(p);
	let lo = -1000;
	let hi = 1000;
	// Tighten the bracket toward z to speed convergence while staying safe.
	if (z > 0) lo = 0;
	else if (z < 0) hi = 0;

	for (let i = 0; i < 200; i++) {
		const mid = 0.5 * (lo + hi);
		const f = tCdf(mid, df) - p;
		if (Math.abs(f) < 1e-12 || hi - lo < 1e-12) return mid;
		if (f > 0) hi = mid;
		else lo = mid;
	}
	return 0.5 * (lo + hi);
}

// ---------------------------------------------------------------------------
// Two-sample test (Welch's t-test)
// ---------------------------------------------------------------------------

export interface TwoSampleResult {
	/** Test statistic t = (x̄₁ − x̄₂) / SE der Differenz. */
	t: number;
	/** Welch-Freiheitsgrade (i. A. nicht ganzzahlig). */
	df: number;
	/** Zweiseitiger p-Wert P(|T| ≥ |t| | H0). */
	pTwoSided: number;
}

/**
 * Welch's two-sample t-test (does NOT assume equal variances), comparing the
 * means of two independent samples. Returns the test statistic, the
 * Welch–Satterthwaite degrees of freedom and the TWO-sided p-value.
 *
 * Built purely from the descriptive helpers and the Student-t CDF above:
 *   SE = √(s₁²/n₁ + s₂²/n₂)
 *   t  = (x̄₁ − x̄₂) / SE
 *   df = (s₁²/n₁ + s₂²/n₂)² / [ (s₁²/n₁)²/(n₁−1) + (s₂²/n₂)²/(n₂−1) ]
 *   p  = 2 · P(T ≥ |t|)  with T ~ t_df
 *
 * Matches R's `t.test(x, y)` (Welch default) to ~1e−2 in t, df and p.
 *
 * Edge cases: needs n ≥ 2 in each group (otherwise the variance / df are not
 * defined) → returns NaNs to fail safe rather than throw inside a widget. If
 * the pooled standard error is 0 (both samples constant), t is ±∞/NaN; we map a
 * zero difference to t = 0, p = 1, and a non-zero difference to p = 0.
 */
export function welchTTest(a: number[], b: number[]): TwoSampleResult {
	const n1 = a.length;
	const n2 = b.length;
	if (n1 < 2 || n2 < 2) return { t: NaN, df: NaN, pTwoSided: NaN };

	const m1 = mean(a);
	const m2 = mean(b);
	const v1 = variance(a);
	const v2 = variance(b);

	const s1 = v1 / n1;
	const s2 = v2 / n2;
	const seSq = s1 + s2;
	const se = Math.sqrt(seSq);
	const diff = m1 - m2;

	if (se === 0) {
		// Both samples are constant: either identical (no difference) or a sharp,
		// zero-variance separation.
		if (diff === 0) return { t: 0, df: n1 + n2 - 2, pTwoSided: 1 };
		return { t: diff > 0 ? Infinity : -Infinity, df: n1 + n2 - 2, pTwoSided: 0 };
	}

	const t = diff / se;
	// Welch–Satterthwaite degrees of freedom.
	const df = (seSq * seSq) / ((s1 * s1) / (n1 - 1) + (s2 * s2) / (n2 - 1));
	const pTwoSided = 2 * (1 - tCdf(Math.abs(t), df));

	return { t, df, pTwoSided };
}

// ---------------------------------------------------------------------------
// Summary-based two-sample t-test (Signal-zu-Rausch)
// ---------------------------------------------------------------------------

export interface SummaryTTestResult {
	/** Teststatistik t = Δ / SE der Differenz. */
	t: number;
	/** Freiheitsgrade df = 2·n − 2 (gleiche n, gleiche Streuung). */
	df: number;
	/** Standardfehler der Differenz SE = s·√(2/n). */
	se: number;
	/** Zweiseitiger p-Wert P(|T| ≥ |t| | H0). */
	pTwoSided: number;
}

/**
 * Zwei-Stichproben-t-Test aus Kennzahlen (Signal-zu-Rausch-Intuition), für den
 * vereinfachten Fall GLEICHER Gruppengrößen `n` und GLEICHER Streuung `s` je
 * Gruppe. Das macht die zentrale Intuition sichtbar:
 *
 *   Signal  = Δ (die Mittelwertdifferenz)
 *   Rausch  = SE = s · √(2/n)  (der Standardfehler der Differenz)
 *   t       = Δ / SE = Δ / (s · √(2/n))
 *   df      = 2n − 2
 *   p       = 2 · P(T ≥ |t|),  T ~ t_df
 *
 * Dieselbe Differenz Δ wird bei großer Streuung `s` unbedeutend (kleines t,
 * großes p) und bei kleiner Streuung hochsignifikant. Mehr Daten (√n im Nenner
 * von SE) verkleinern den Standardfehler → größeres t, kleineres p.
 *
 * Entspricht dem gepoolten Student-t-Test (bei gleichem n und gleichem s sind
 * Student und Welch identisch). Edge cases: n < 2 → NaNs; s = 0 → t = 0/p = 1
 * bei Δ = 0, sonst ±∞/p = 0 (fail-safe statt Throw im Widget).
 */
export function summaryTTest(delta: number, s: number, n: number): SummaryTTestResult {
	if (n < 2) return { t: NaN, df: NaN, se: NaN, pTwoSided: NaN };
	const df = 2 * n - 2;
	const se = s * Math.sqrt(2 / n);

	if (se === 0) {
		if (delta === 0) return { t: 0, df, se: 0, pTwoSided: 1 };
		return { t: delta > 0 ? Infinity : -Infinity, df, se: 0, pTwoSided: 0 };
	}

	const t = delta / se;
	const pTwoSided = 2 * (1 - tCdf(Math.abs(t), df));
	return { t, df, se, pTwoSided };
}

// ---------------------------------------------------------------------------
// Seeded RNG
// ---------------------------------------------------------------------------

/**
 * mulberry32 — a tiny, fast, deterministic PRNG.
 *
 * Given an integer seed it returns a function producing values in [0, 1).
 * The same seed always yields the same stream, which is what makes draws
 * reproducible for tests and for "re-run with same seed" in widgets.
 */
export function makeRng(seed: number): () => number {
	let a = seed >>> 0;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// ---------------------------------------------------------------------------
// Population descriptors & sampling
// ---------------------------------------------------------------------------

export type PopulationKind = 'normal' | 'exponential' | 'bimodal' | 'uniform';

export interface PopulationDescriptor {
	/** German label for display in widgets. */
	label: string;
	/** TRUE population mean μ. */
	mu: number;
	/** TRUE population standard deviation σ. */
	sigma: number;
	/** For bounded populations (e.g. uniform): the [min, max) support. */
	range?: [number, number];
}

// --- Chosen parameterizations (documented) ---------------------------------
//
// normal:       N(μ=100, σ=15).  Classic "IQ-style" bell curve.
// exponential:  rate λ = 1/10 → μ = 1/λ = 10, σ = 1/λ = 10.
// uniform:      U[a=0, b=20).  μ = (a+b)/2 = 10, σ = (b−a)/√12 = 20/√12 ≈ 5.7735.
// bimodal:      equal 50/50 mixture of N(μ1=70, τ) and N(μ2=130, τ) with
//               component sd τ = 10. The mixture mean is (70+130)/2 = 100.
//               Mixture variance = τ² + (spread of component means)²
//                                = τ² + ((130−70)/2)² = 10² + 30² = 1000,
//               so σ = √1000 ≈ 31.6228.
//
// All generators below are written so their realized μ/σ match these declared
// values (verified by large-sample tests in stats.test.ts).
const UNIFORM_RANGE: [number, number] = [0, 20];
const EXP_RATE = 1 / 10;
const BIMODAL_MU1 = 70;
const BIMODAL_MU2 = 130;
const BIMODAL_TAU = 10;

export const POPULATIONS: Record<PopulationKind, PopulationDescriptor> = {
	normal: {
		label: 'Normalverteilung',
		mu: 100,
		sigma: 15
	},
	exponential: {
		label: 'Exponentialverteilung',
		mu: 1 / EXP_RATE,
		sigma: 1 / EXP_RATE
	},
	bimodal: {
		label: 'Bimodale Verteilung',
		mu: (BIMODAL_MU1 + BIMODAL_MU2) / 2,
		sigma: Math.sqrt(
			BIMODAL_TAU * BIMODAL_TAU + Math.pow((BIMODAL_MU2 - BIMODAL_MU1) / 2, 2)
		)
	},
	uniform: {
		label: 'Gleichverteilung',
		mu: (UNIFORM_RANGE[0] + UNIFORM_RANGE[1]) / 2,
		sigma: (UNIFORM_RANGE[1] - UNIFORM_RANGE[0]) / Math.sqrt(12),
		range: UNIFORM_RANGE
	}
};

/**
 * Draw a standard normal variate using the Box–Muller transform.
 * Consumes two RNG draws. (We use the cosine branch; the sine branch is
 * intentionally discarded to keep the RNG-consumption pattern simple and
 * predictable per call.)
 */
function standardNormal(rng: () => number): number {
	// Guard against u1 = 0 so log() stays finite.
	let u1 = rng();
	if (u1 <= 0) u1 = Number.MIN_VALUE;
	const u2 = rng();
	return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Draw `n` independent observations from the chosen population, consuming the
 * supplied seeded RNG. With a freshly seeded RNG the output is deterministic.
 *
 * Parameterizations match `POPULATIONS` (see notes above).
 */
export function drawSample(kind: PopulationKind, n: number, rng: () => number): number[] {
	const out = new Array<number>(n);

	switch (kind) {
		case 'normal': {
			const { mu, sigma } = POPULATIONS.normal;
			for (let i = 0; i < n; i++) {
				out[i] = mu + sigma * standardNormal(rng);
			}
			return out;
		}

		case 'exponential': {
			// Inverse-CDF: x = −ln(1 − u) / λ, u ∈ [0,1).
			for (let i = 0; i < n; i++) {
				const u = rng();
				out[i] = -Math.log(1 - u) / EXP_RATE;
			}
			return out;
		}

		case 'bimodal': {
			// 50/50 mixture of two separated normals of sd BIMODAL_TAU.
			for (let i = 0; i < n; i++) {
				const pick = rng() < 0.5 ? BIMODAL_MU1 : BIMODAL_MU2;
				out[i] = pick + BIMODAL_TAU * standardNormal(rng);
			}
			return out;
		}

		case 'uniform': {
			const [a, b] = UNIFORM_RANGE;
			const span = b - a;
			for (let i = 0; i < n; i++) {
				out[i] = a + span * rng();
			}
			return out;
		}

		default: {
			// Exhaustiveness guard: if a new kind is added the compiler flags this.
			const _exhaustive: never = kind;
			throw new Error(`Unknown population kind: ${String(_exhaustive)}`);
		}
	}
}
