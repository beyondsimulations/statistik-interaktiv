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
