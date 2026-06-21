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
export function logGamma(z: number): number {
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
// Power / Stichprobenumfang für den Zweistichproben-t-Test
// ---------------------------------------------------------------------------

/** Eingabe für `twoSampleTPower` (alle Werte je GRUPPE, gleicher Umfang). */
export type TwoSampleTPowerInput = {
	/** Wahre Mittelwertdifferenz (Effektgröße), z. B. Unterschied der Zugdistanz in km. */
	delta: number;
	/** Streuung σ (Standardabweichung innerhalb der Gruppen). */
	sd: number;
	/** Stichprobenumfang PRO Gruppe. */
	n: number;
	/** Signifikanzniveau α (zweiseitig). Standard: 0,05. */
	sigLevel?: number;
};

/**
 * Teststärke (Power = 1 − β) eines ZWEISTICHPROBEN-t-Tests mit gleichem Umfang
 * n je Gruppe, zweiseitig.
 *
 * Exakt wäre die Power über die NICHTZENTRALE t-Verteilung definiert. Wir nutzen
 * eine solide NORMALAPPROXIMATION der nichtzentralen t-Verteilung: die
 * Teststatistik hat unter HA näherungsweise eine N(ncp, 1)-Verteilung, und der
 * kritische Wert kommt aus der (zentralen) t-Verteilung mit df = 2n − 2:
 *
 *   ncp  = δ / (σ · √(2/n))                    (Nichtzentralitätsparameter)
 *   crit = tQuantile(1 − α/2, df = 2n − 2)     (zweiseitige Schranke)
 *   power ≈ Φ(ncp − crit) + Φ(−ncp − crit)
 *
 * Das zweite Glied fängt den (winzigen) Beitrag des gegenüberliegenden
 * Ablehnungsbereichs ein. Die Näherung trifft R `power.t.test` auf etwa ±0,03;
 * qualitativ ist sie exakt: Power steigt mit n und |δ|, fällt mit σ und fällt,
 * wenn α kleiner wird.
 *
 * Rückgabe in [0, 1]. Bei n < 2 oder σ ≤ 0 → NaN (kein definierter Test).
 */
export function twoSampleTPower({ delta, sd, n, sigLevel = 0.05 }: TwoSampleTPowerInput): number {
	if (!(n >= 2) || !(sd > 0) || !(sigLevel > 0) || !(sigLevel < 1)) return NaN;
	const df = 2 * n - 2;
	const ncp = Math.abs(delta) / (sd * Math.sqrt(2 / n));
	const crit = tQuantile(1 - sigLevel / 2, df);
	const power = normalCdf(ncp - crit) + normalCdf(-ncp - crit);
	// Numerisch in [0, 1] halten.
	return Math.min(1, Math.max(0, power));
}

/** Eingabe für `sampleSizeForPower`. */
export type SampleSizeForPowerInput = {
	/** Wahre Mittelwertdifferenz (Effektgröße). */
	delta: number;
	/** Streuung σ. */
	sd: number;
	/** Signifikanzniveau α (zweiseitig). Standard: 0,05. */
	sigLevel?: number;
	/** Geforderte Power (z. B. 0,8). Standard: 0,8. */
	power?: number;
};

/**
 * Kleinster Stichprobenumfang n PRO Gruppe, der für einen zweiseitigen
 * Zweistichproben-t-Test mindestens die geforderte `power` erreicht.
 *
 * Sucht aufsteigend (n = 2, 3, …) das erste n mit twoSampleTPower(…) ≥ power.
 * Liefert eine Obergrenze (Standard 100 000) zurück, falls der Effekt 0 ist
 * oder die Zielpower unrealistisch hoch.
 */
export function sampleSizeForPower({
	delta,
	sd,
	sigLevel = 0.05,
	power = 0.8
}: SampleSizeForPowerInput): number {
	if (!(sd > 0) || delta === 0) return Number.POSITIVE_INFINITY;
	const MAX_N = 100000;
	for (let n = 2; n <= MAX_N; n++) {
		if (twoSampleTPower({ delta, sd, n, sigLevel }) >= power) return n;
	}
	return MAX_N;
}

// ---------------------------------------------------------------------------
// Chi-square distribution & tests
// ---------------------------------------------------------------------------

/**
 * Regularized lower incomplete gamma function P(a, x) = γ(a, x) / Γ(a).
 *
 * Combines the series expansion (fast for x < a + 1) and the Lentz continued
 * fraction (fast for x ≥ a + 1), the standard Numerical-Recipes split. Reuses
 * the Lanczos `logGamma` above so the normalization Γ(a) is exact to machine
 * precision.
 *
 * Domain: a > 0, x ≥ 0. Returns 0 at x = 0 and approaches 1 as x → ∞.
 */
function regularizedGammaP(a: number, x: number): number {
	if (x <= 0) return 0;
	if (a <= 0) return NaN;

	const gln = logGamma(a);

	if (x < a + 1) {
		// Series representation γ*(a, x) = Σ x^n / (a(a+1)...(a+n)).
		let ap = a;
		let sum = 1 / a;
		let del = sum;
		for (let n = 0; n < 500; n++) {
			ap += 1;
			del *= x / ap;
			sum += del;
			if (Math.abs(del) < Math.abs(sum) * 1e-15) break;
		}
		return sum * Math.exp(-x + a * Math.log(x) - gln);
	}

	// Continued fraction for the upper incomplete gamma Q(a, x); P = 1 − Q.
	const FPMIN = 1e-300;
	let b = x + 1 - a;
	let c = 1 / FPMIN;
	let d = 1 / b;
	let h = d;
	for (let i = 1; i <= 500; i++) {
		const an = -i * (i - a);
		b += 2;
		d = an * d + b;
		if (Math.abs(d) < FPMIN) d = FPMIN;
		c = b + an / c;
		if (Math.abs(c) < FPMIN) c = FPMIN;
		d = 1 / d;
		const del = d * c;
		h *= del;
		if (Math.abs(del - 1) < 1e-15) break;
	}
	const q = Math.exp(-x + a * Math.log(x) - gln) * h;
	return 1 - q;
}

/**
 * Cumulative distribution function of the chi-square distribution with `df`
 * degrees of freedom: F(x) = P(df/2, x/2), the regularized lower incomplete
 * gamma function.
 *
 * Contract / tested against R's pchisq():
 *   pchisq(3.84, 1)  ≈ 0.9500   (the 5 %-critical value for df = 1)
 *   pchisq(5.99, 2)  ≈ 0.9500
 *   pchisq(7.81, 3)  ≈ 0.9500
 *
 * Edge cases: x ≤ 0 → 0; df ≤ 0 → NaN.
 */
export function chiSquareCdf(x: number, df: number): number {
	if (df <= 0) return NaN;
	if (x <= 0) return 0;
	return regularizedGammaP(df / 2, x / 2);
}

/** Upper-tail p-value of the chi-square distribution: P(X ≥ x). */
function chiSquareP(x: number, df: number): number {
	if (df <= 0) return NaN;
	if (x <= 0) return 1;
	return 1 - chiSquareCdf(x, df);
}

export interface ChiSquareResult {
	/** Teststatistik χ² = Σ (B − E)² / E. */
	chi2: number;
	/** Freiheitsgrade. */
	df: number;
	/** Oberer (rechtsseitiger) p-Wert P(X ≥ χ² | H0). */
	p: number;
}

/**
 * Chi-Quadrat-Anpassungstest (goodness of fit): Folgen die BEOBACHTETEN
 * Häufigkeiten `observed` der erwarteten Verteilung `expectedProbs`?
 *
 *   E_i  = N · p_i             (N = Σ beobachtet, p_i die erwarteten Anteile)
 *   χ²   = Σ (B_i − E_i)² / E_i
 *   df   = k − 1               (k = Anzahl Kategorien)
 *   p    = P(X ≥ χ² | H0),  X ~ χ²_{df}
 *
 * Klassisches Beispiel: Mendels Erbsen mit dem 9:3:3:1-Spaltungsverhältnis,
 * also expectedProbs = [9/16, 3/16, 3/16, 1/16].
 *
 * `expectedProbs` muss dieselbe Länge wie `observed` haben und wird intern auf
 * Summe 1 normiert (du darfst also auch Verhältnisse wie [9,3,3,1] übergeben).
 *
 * Edge cases: weniger als 2 Kategorien oder Längen-Mismatch → NaNs.
 */
export function chiSquareGof(observed: number[], expectedProbs: number[]): ChiSquareResult {
	const k = observed.length;
	if (k < 2 || expectedProbs.length !== k) {
		return { chi2: NaN, df: NaN, p: NaN };
	}

	let probSum = 0;
	for (const p of expectedProbs) probSum += p;
	if (!(probSum > 0)) return { chi2: NaN, df: NaN, p: NaN };

	let total = 0;
	for (const o of observed) total += o;

	let chi2 = 0;
	for (let i = 0; i < k; i++) {
		const e = total * (expectedProbs[i] / probSum);
		if (e > 0) {
			const diff = observed[i] - e;
			chi2 += (diff * diff) / e;
		}
	}

	const df = k - 1;
	return { chi2, df, p: chiSquareP(chi2, df) };
}

export interface ChiSquareIndependenceResult extends ChiSquareResult {
	/** Erwartete Häufigkeiten E = (Zeilensumme · Spaltensumme) / N je Zelle. */
	expected: number[][];
}

/**
 * Chi-Quadrat-Unabhängigkeitstest für eine Kontingenztafel `table` (Zeilen ×
 * Spalten beobachteter Häufigkeiten). Prüft, ob die beiden Merkmale (Zeile,
 * Spalte) unabhängig sind.
 *
 *   E_{ij} = (Zeilensumme_i · Spaltensumme_j) / N      (N = Gesamtsumme)
 *   χ²     = Σ_{i,j} (B_{ij} − E_{ij})² / E_{ij}
 *   df     = (Zeilen − 1) · (Spalten − 1)
 *   p      = P(X ≥ χ² | H0),  X ~ χ²_{df}
 *
 * Entspricht R `chisq.test(table, correct = FALSE)`. Bei einer 2×2-Tafel
 * (df = 1) verwendet R standardmäßig die Yates-Stetigkeitskorrektur
 * (`correct = TRUE`); setze `yates = true`, um sie nachzubilden — dann wird in
 * jeder Zelle |B − E| um 0,5 verkleinert (aber nie unter 0).
 *
 * Die erwarteten Häufigkeiten werden mitgeliefert (für die Anzeige der „E aus
 * den Rändern“-Idee und die E ≥ 5-Faustregel).
 *
 * Edge cases: weniger als 2 Zeilen/Spalten, leere/ungleich lange Zeilen oder
 * Gesamtsumme 0 → NaNs mit leerer `expected`-Matrix.
 */
export function chiSquareIndependence(
	table: number[][],
	yates = false
): ChiSquareIndependenceResult {
	const rows = table.length;
	const cols = rows > 0 ? table[0].length : 0;
	const bad: ChiSquareIndependenceResult = { chi2: NaN, df: NaN, p: NaN, expected: [] };

	if (rows < 2 || cols < 2) return bad;
	if (!table.every((r) => r.length === cols)) return bad;

	const rowSums = new Array<number>(rows).fill(0);
	const colSums = new Array<number>(cols).fill(0);
	let total = 0;
	for (let i = 0; i < rows; i++) {
		for (let j = 0; j < cols; j++) {
			const v = table[i][j];
			rowSums[i] += v;
			colSums[j] += v;
			total += v;
		}
	}
	if (!(total > 0)) return bad;

	const useYates = yates && rows === 2 && cols === 2;

	const expected: number[][] = [];
	let chi2 = 0;
	for (let i = 0; i < rows; i++) {
		const eRow: number[] = [];
		for (let j = 0; j < cols; j++) {
			const e = (rowSums[i] * colSums[j]) / total;
			eRow.push(e);
			if (e > 0) {
				let diff = Math.abs(table[i][j] - e);
				if (useYates) diff = Math.max(0, diff - 0.5);
				chi2 += (diff * diff) / e;
			}
		}
		expected.push(eRow);
	}

	const df = (rows - 1) * (cols - 1);
	return { chi2, df, p: chiSquareP(chi2, df), expected };
}

// ---------------------------------------------------------------------------
// F-distribution & one-way ANOVA
// ---------------------------------------------------------------------------

/**
 * Cumulative distribution function of the F-distribution with `df1` numerator
 * and `df2` denominator degrees of freedom: F(x) = P(X ≤ x).
 *
 * Built from the regularized incomplete beta function via the standard identity
 *   P(X ≤ x) = I_{y}(df1/2, df2/2)  with  y = (df1·x) / (df1·x + df2).
 *
 * Contract / tested against R's pf():
 *   pf(1, 3, 20)      ≈ 0.5847
 *   pf(3.10, 3, 20)   ≈ 0.95     (≈ the 5 %-critical value qf(0.95, 3, 20))
 *   pf(4.26, 2, 9)    ≈ 0.95
 *
 * The upper-tail p-value of an ANOVA is therefore 1 − fCdf(F, df1, df2).
 *
 * Edge cases: x ≤ 0 → 0; df1 ≤ 0 or df2 ≤ 0 → NaN.
 */
export function fCdf(x: number, df1: number, df2: number): number {
	if (df1 <= 0 || df2 <= 0) return NaN;
	if (x <= 0) return 0;
	const y = (df1 * x) / (df1 * x + df2);
	return incompleteBeta(y, df1 / 2, df2 / 2);
}

export interface OneWayAnovaResult {
	/** Quadratsumme ZWISCHEN den Gruppen (erklärte Streuung). */
	ssBetween: number;
	/** Quadratsumme INNERHALB der Gruppen (unerklärte Streuung / Residuum). */
	ssWithin: number;
	/** Freiheitsgrade zwischen den Gruppen: k − 1. */
	dfBetween: number;
	/** Freiheitsgrade innerhalb der Gruppen: N − k. */
	dfWithin: number;
	/** Mittleres Quadrat zwischen den Gruppen: ssBetween / dfBetween. */
	msBetween: number;
	/** Mittleres Quadrat innerhalb der Gruppen: ssWithin / dfWithin. */
	msWithin: number;
	/** F-Verhältnis = msBetween / msWithin (Signal zu Rausch). */
	F: number;
	/** Rechtsseitiger p-Wert P(X ≥ F | H0), X ~ F(dfBetween, dfWithin). */
	p: number;
	/** Effektstärke η² = ssBetween / ssTotal (Anteil erklärter Streuung). */
	etaSquared: number;
}

/**
 * Einfaktorielle Varianzanalyse (one-way ANOVA) über mehrere Gruppen.
 *
 * Zerlegt die Gesamtstreuung in einen Anteil ZWISCHEN den Gruppen (wie weit die
 * Gruppenmittel vom Gesamtmittel abweichen) und einen Anteil INNERHALB der
 * Gruppen (wie sehr die Werte um ihr eigenes Gruppenmittel streuen):
 *
 *   SS_between = Σ_g n_g · (x̄_g − x̄)²            df_between = k − 1
 *   SS_within  = Σ_g Σ_i (x_{g,i} − x̄_g)²        df_within  = N − k
 *   MS_between = SS_between / df_between
 *   MS_within  = SS_within  / df_within
 *   F          = MS_between / MS_within
 *   p          = P(X ≥ F | H0),  X ~ F(df_between, df_within)
 *   η²         = SS_between / (SS_between + SS_within)
 *
 * Das F-Verhältnis ist ein Signal-zu-Rausch-Maß: Ist die Streuung ZWISCHEN den
 * Gruppenmitteln groß im Vergleich zur Streuung INNERHALB der Gruppen, wird F
 * groß und der (immer rechtsseitige) p-Wert klein.
 *
 * Entspricht R `summary(aov(y ~ gruppe))` in F-value und Pr(>F) auf ~1e−2.
 *
 * Edge cases: weniger als 2 Gruppen, eine leere Gruppe oder df_within ≤ 0
 * (jede Gruppe nur eine Beobachtung) → NaNs (fail-safe statt Throw im Widget).
 * Bei MS_within = 0 (keinerlei Streuung innerhalb) ist F nicht definiert: wir
 * geben F = +∞, p = 0 bei vorhandener Streuung zwischen den Gruppen zurück,
 * sonst F = 0, p = 1.
 */
export function oneWayAnova(groups: number[][]): OneWayAnovaResult {
	const k = groups.length;
	const bad: OneWayAnovaResult = {
		ssBetween: NaN,
		ssWithin: NaN,
		dfBetween: NaN,
		dfWithin: NaN,
		msBetween: NaN,
		msWithin: NaN,
		F: NaN,
		p: NaN,
		etaSquared: NaN
	};
	if (k < 2) return bad;
	if (groups.some((g) => g.length === 0)) return bad;

	let total = 0;
	let n = 0;
	for (const g of groups) {
		for (const x of g) total += x;
		n += g.length;
	}
	const grandMean = total / n;

	let ssBetween = 0;
	let ssWithin = 0;
	for (const g of groups) {
		const gm = mean(g);
		const d = gm - grandMean;
		ssBetween += g.length * d * d;
		for (const x of g) {
			const e = x - gm;
			ssWithin += e * e;
		}
	}

	const dfBetween = k - 1;
	const dfWithin = n - k;
	if (dfWithin <= 0) return bad;

	const msBetween = ssBetween / dfBetween;
	const msWithin = ssWithin / dfWithin;
	const ssTotal = ssBetween + ssWithin;
	const etaSquared = ssTotal > 0 ? ssBetween / ssTotal : 0;

	let F: number;
	let p: number;
	if (msWithin === 0) {
		if (ssBetween > 0) {
			F = Infinity;
			p = 0;
		} else {
			F = 0;
			p = 1;
		}
	} else {
		F = msBetween / msWithin;
		p = 1 - fCdf(F, dfBetween, dfWithin);
	}

	return {
		ssBetween,
		ssWithin,
		dfBetween,
		dfWithin,
		msBetween,
		msWithin,
		F,
		p,
		etaSquared
	};
}

// ---------------------------------------------------------------------------
// Korrelation (Pearson, Spearman) & Signifikanztest
// ---------------------------------------------------------------------------

/**
 * Pearson-Korrelationskoeffizient r — die STANDARDISIERTE Kovarianz.
 *
 *   r = Cov(x, y) / (s_x · s_y)
 *     = Σ (x_i − x̄)(y_i − ȳ) / √( Σ (x_i − x̄)² · Σ (y_i − ȳ)² )
 *
 * r ist einheitenlos und liegt immer in [−1, +1]. Er misst NUR die LINEARE
 * Stärke des Zusammenhangs: r = +1 bei perfekt steigender Gerade, r = −1 bei
 * perfekt fallender Gerade, r ≈ 0 bei keinem LINEAREN Zusammenhang (eine
 * symmetrische U-Form/Parabel kann r ≈ 0 liefern, obwohl klar ein Muster
 * existiert).
 *
 * Da sich der Faktor (n − 1) in Zähler und Nenner kürzt, ist es gleichgültig,
 * ob man Cov und s mit n oder n − 1 bildet — das Ergebnis ist dasselbe.
 *
 * Entspricht R `cor(x, y)` (Standard: method = "pearson").
 *
 * Edge cases: ungleiche Längen oder n < 2 → NaN. Ist eine der beiden Variablen
 * konstant (s = 0), ist r nicht definiert → NaN (fail-safe statt 0/0).
 */
export function pearson(x: number[], y: number[]): number {
	const n = x.length;
	if (n !== y.length || n < 2) return NaN;

	const mx = mean(x);
	const my = mean(y);

	let sxy = 0;
	let sxx = 0;
	let syy = 0;
	for (let i = 0; i < n; i++) {
		const dx = x[i] - mx;
		const dy = y[i] - my;
		sxy += dx * dy;
		sxx += dx * dx;
		syy += dy * dy;
	}

	const denom = Math.sqrt(sxx * syy);
	if (denom === 0) return NaN; // mindestens eine Variable konstant
	return sxy / denom;
}

/**
 * Wandelt eine Zahlenreihe in ihre RÄNGE um (1-basiert). Bindungen (gleiche
 * Werte) bekommen den DURCHSCHNITTSRANG (mid-rank), wie es R `rank()` und der
 * Spearman-/Kendall-Standard verlangen.
 *
 * Beispiel: [10, 20, 20, 40] → [1, 2.5, 2.5, 4].
 */
export function ranks(xs: number[]): number[] {
	const n = xs.length;
	// Indizes nach Wert sortieren (stabil genug; Bindungen behandeln wir danach).
	const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => xs[a] - xs[b]);
	const r = new Array<number>(n);

	let i = 0;
	while (i < n) {
		// Gruppe gleicher Werte [i, j) finden.
		let j = i + 1;
		while (j < n && xs[order[j]] === xs[order[i]]) j++;
		// Durchschnittsrang der Positionen i..j-1 (1-basiert): (i+1 + j) / 2.
		const avg = (i + 1 + j) / 2;
		for (let k = i; k < j; k++) r[order[k]] = avg;
		i = j;
	}
	return r;
}

/**
 * Spearman-Rangkorrelationskoeffizient ρ — der PEARSON-Koeffizient der RÄNGE.
 *
 * Statt die Originalwerte zu korrelieren, korreliert Spearman ihre Ränge. Damit
 * erfasst ρ MONOTONE (nicht zwingend lineare) Zusammenhänge: Bei jeder streng
 * monoton steigenden Beziehung — auch einer gekrümmten wie y = x³ oder
 * y = log(x) — ist ρ = 1, während Pearson r < 1 bliebe. ρ ist außerdem robust
 * gegen Ausreißer und für ordinale Daten zulässig.
 *
 * Bindungen werden über Durchschnittsränge behandelt (siehe `ranks`), sodass
 * das Ergebnis R `cor(x, y, method = "spearman")` entspricht.
 *
 * Edge cases: wie bei `pearson` (ungleiche Längen / n < 2 / konstante Reihe →
 * NaN).
 */
export function spearman(x: number[], y: number[]): number {
	const n = x.length;
	if (n !== y.length || n < 2) return NaN;
	return pearson(ranks(x), ranks(y));
}

/**
 * Zweiseitiger p-Wert für die Nullhypothese ρ = 0 (kein Zusammenhang), gegeben
 * der beobachtete Korrelationskoeffizient `r` und der Stichprobenumfang `n`.
 *
 * Über die t-Teststatistik mit df = n − 2:
 *   t = r · √( (n − 2) / (1 − r²) )
 *   p = 2 · P(T ≥ |t|),  T ~ t_{n−2}
 *
 * Funktioniert für Pearson r (exakt unter Normalität) ebenso wie als gängige
 * Approximation für Spearman ρ. Entspricht R `cor.test(...)$p.value`.
 *
 * Edge cases: n < 3 → NaN (df = n − 2 < 1). |r| = 1 → t = ±∞, p = 0
 * (perfekter Zusammenhang). |r| = 0 → p = 1.
 */
export function corTestP(r: number, n: number): number {
	if (!Number.isFinite(r) || n < 3) return NaN;
	const df = n - 2;
	if (Math.abs(r) >= 1) return 0;
	if (r === 0) return 1;
	const t = r * Math.sqrt(df / (1 - r * r));
	return 2 * (1 - tCdf(Math.abs(t), df));
}

// ---------------------------------------------------------------------------
// Einfache lineare Regression (Kleinste Quadrate / OLS)
// ---------------------------------------------------------------------------

export interface LinearRegressionResult {
	/** Steigung b: Änderung von Y pro Einheit X. */
	slope: number;
	/** Achsenabschnitt a: vorhergesagtes Y bei X = 0. */
	intercept: number;
	/** Bestimmtheitsmaß R² = SS_Regression / SS_Total ∈ [0, 1]. */
	r2: number;
	/** Standardfehler der Steigung SE_b. */
	slopeSE: number;
	/** Teststatistik der Steigung t = b / SE_b (H0: β = 0). */
	tSlope: number;
	/** Zweiseitiger p-Wert der Steigung, T ~ t_{n−2}. */
	pSlope: number;
	/** Freiheitsgrade df = n − 2. */
	df: number;
}

/**
 * Einfache lineare Regression nach der Methode der KLEINSTEN QUADRATE (OLS):
 * Sie sucht die Gerade ŷ = a + b·x, die die Summe der quadrierten Residuen
 * Σ (yᵢ − ŷᵢ)² minimiert. Anders als die Korrelation hat die Regression eine
 * RICHTUNG: X erklärt Y und sagt Y vorher.
 *
 *   b  = Σ (xᵢ − x̄)(yᵢ − ȳ) / Σ (xᵢ − x̄)²        (Steigung)
 *   a  = ȳ − b·x̄                                   (Achsenabschnitt)
 *   SS_Total = Σ (yᵢ − ȳ)²                          (Gesamtstreuung von Y)
 *   SS_Reg   = Σ (ŷᵢ − ȳ)²                          (vom Modell erklärt)
 *   SS_Res   = Σ (yᵢ − ŷᵢ)²                          (Residuen, unerklärt)
 *   R²  = SS_Reg / SS_Total                          (= pearson(x,y)² bei einfacher Regression)
 *   SE_b = √( (SS_Res / (n−2)) / Σ (xᵢ − x̄)² )       (Standardfehler der Steigung)
 *   t   = b / SE_b ,   df = n − 2 ,   p = 2·P(T ≥ |t|)
 *
 * Der Test auf die Steigung prüft H0: β = 0 — „die Gerade bringt nichts
 * gegenüber dem reinen Mittelwert von Y“. Entspricht R `summary(lm(y ~ x))`
 * in Estimate, Std. Error, t value, Pr(>|t|) und Multiple R².
 *
 * Edge cases: ungleiche Längen oder n < 3 → NaNs (df = n − 2 < 1). Sind alle x
 * gleich (Σ (xᵢ − x̄)² = 0), gibt es keine Gerade → NaNs (fail-safe). Liegen
 * alle Punkte exakt auf einer Geraden (SS_Res = 0), ist R² = 1, SE_b = 0,
 * |t| = ∞ und p = 0.
 */
export function linearRegression(x: number[], y: number[]): LinearRegressionResult {
	const n = x.length;
	const bad: LinearRegressionResult = {
		slope: NaN,
		intercept: NaN,
		r2: NaN,
		slopeSE: NaN,
		tSlope: NaN,
		pSlope: NaN,
		df: NaN
	};
	if (n !== y.length || n < 3) return bad;

	const mx = mean(x);
	const my = mean(y);

	let sxx = 0;
	let sxy = 0;
	let syy = 0;
	for (let i = 0; i < n; i++) {
		const dx = x[i] - mx;
		const dy = y[i] - my;
		sxx += dx * dx;
		sxy += dx * dy;
		syy += dy * dy;
	}
	if (sxx === 0) return bad; // alle x gleich → keine Gerade

	const slope = sxy / sxx;
	const intercept = my - slope * mx;
	const df = n - 2;

	// Quadratsummen.
	let ssRes = 0;
	for (let i = 0; i < n; i++) {
		const fit = intercept + slope * x[i];
		const e = y[i] - fit;
		ssRes += e * e;
	}
	const ssTotal = syy;
	const ssReg = Math.max(0, ssTotal - ssRes);
	const r2 = ssTotal > 0 ? ssReg / ssTotal : 0;

	// Standardfehler der Steigung und Test auf β = 0.
	const mse = ssRes / df; // residuales mittleres Quadrat
	const slopeSE = Math.sqrt(mse / sxx);

	let tSlope: number;
	let pSlope: number;
	if (slopeSE === 0) {
		// Perfekte Gerade: kein Residuum → t = ±∞, p = 0 (bzw. p = 1 bei b = 0).
		if (slope === 0) {
			tSlope = 0;
			pSlope = 1;
		} else {
			tSlope = slope > 0 ? Infinity : -Infinity;
			pSlope = 0;
		}
	} else {
		tSlope = slope / slopeSE;
		pSlope = 2 * (1 - tCdf(Math.abs(tSlope), df));
	}

	return { slope, intercept, r2, slopeSE, tSlope, pSlope, df };
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
