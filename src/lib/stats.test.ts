import { describe, it, expect } from 'vitest';
import {
	mean,
	variance,
	sd,
	standardError,
	normalPdf,
	normalCdf,
	normalQuantile,
	tCdf,
	tQuantile,
	makeRng,
	drawSample,
	binCounts,
	positivePredictiveValue,
	welchTTest,
	summaryTTest,
	chiSquareCdf,
	chiSquareGof,
	chiSquareIndependence,
	POPULATIONS,
	type PopulationKind
} from './stats';

describe('positivePredictiveValue', () => {
	it('rare disease: high sensitivity still yields a low predictive value', () => {
		// Prävalenz 0,5 %, Sensitivität 99 %, Spezifität 95 % → ≈ 0,0905.
		const ppv = positivePredictiveValue(0.005, 0.99, 0.95);
		expect(ppv).toBeCloseTo(0.0905, 4);
	});

	it('a perfect test (no false positives) gives PPV = 1 for any positive', () => {
		expect(positivePredictiveValue(0.01, 1, 1)).toBe(1);
	});

	it('matches P(krank∩positiv) / P(positiv) directly', () => {
		const prev = 0.1;
		const sens = 0.9;
		const spec = 0.8;
		const tp = prev * sens;
		const fp = (1 - prev) * (1 - spec);
		expect(positivePredictiveValue(prev, sens, spec)).toBeCloseTo(tp / (tp + fp), 12);
	});

	it('fails safe to 0 when there are no positive tests at all', () => {
		// Prävalenz 0 und perfekte Spezifität → niemand testet positiv.
		expect(positivePredictiveValue(0, 0.99, 1)).toBe(0);
	});
});

describe('binCounts', () => {
	it('counts a known array into known bins', () => {
		// Domain [0,10], 5 bins of width 2: [0,2) [2,4) [4,6) [6,8) [8,10].
		// values:         0   1   2   3   4   5   9
		// bins:           b0  b0  b1  b1  b2  b2  b4
		const v = [0, 1, 2, 3, 4, 5, 9];
		expect(binCounts(v, 0, 10, 5)).toEqual([2, 2, 2, 0, 1]);
	});

	it('value equal to max goes in the LAST bin', () => {
		expect(binCounts([10], 0, 10, 5)).toEqual([0, 0, 0, 0, 1]);
	});

	it('value equal to min goes in the FIRST bin', () => {
		expect(binCounts([0], 0, 10, 5)).toEqual([1, 0, 0, 0, 0]);
	});

	it('values outside [min,max] are ignored', () => {
		expect(binCounts([-1, 11, 5], 0, 10, 5)).toEqual([0, 0, 1, 0, 0]);
	});

	it('NaN values are ignored', () => {
		expect(binCounts([NaN, 3], 0, 10, 5)).toEqual([0, 1, 0, 0, 0]);
	});

	it('total count equals number of in-domain values', () => {
		const v = drawSample('normal', 1000, makeRng(11));
		const lo = 100 - 4 * 15;
		const hi = 100 + 4 * 15;
		const counts = binCounts(v, lo, hi, 30);
		const inDomain = v.filter((x) => x >= lo && x <= hi).length;
		expect(counts.reduce((a, b) => a + b, 0)).toBe(inDomain);
		expect(counts).toHaveLength(30);
	});

	it('returns a zero array when nBins>0 but max<=min', () => {
		expect(binCounts([1, 2, 3], 5, 5, 3)).toEqual([0, 0, 0]);
	});

	it('returns [] for nBins <= 0', () => {
		expect(binCounts([1, 2, 3], 0, 10, 0)).toEqual([]);
	});
});

describe('descriptive', () => {
	const x = [2, 4, 4, 4, 5, 5, 7, 9];
	it('mean', () => expect(mean(x)).toBeCloseTo(5, 10));
	it('sample variance (n-1)', () => expect(variance(x)).toBeCloseTo(4.5714, 3));
	it('sd', () => expect(sd(x)).toBeCloseTo(2.1381, 3));
	it('standard error = sd/sqrt(n)', () =>
		expect(standardError(x)).toBeCloseTo(sd(x) / Math.sqrt(x.length), 10));

	it('mean of single value is itself', () => expect(mean([42])).toBe(42));
	it('variance of single value is 0 (n-1=0 guarded)', () => expect(variance([42])).toBe(0));
});

describe('normal pdf', () => {
	it('pdf(0) = 1/sqrt(2*pi)', () => expect(normalPdf(0)).toBeCloseTo(0.3989422804, 9));
	it('pdf(1) standard normal', () => expect(normalPdf(1)).toBeCloseTo(0.2419707245, 9));
	it('pdf is symmetric', () => expect(normalPdf(-1.3)).toBeCloseTo(normalPdf(1.3), 12));
	it('pdf with mu/sigma: peak height = 1/(sigma*sqrt(2*pi))', () =>
		expect(normalPdf(10, 10, 2)).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 9));
});

describe('normal cdf', () => {
	it('cdf(0)=0.5', () => expect(normalCdf(0)).toBeCloseTo(0.5, 4));
	it('cdf(1.96)≈0.975', () => expect(normalCdf(1.96)).toBeCloseTo(0.975, 3));
	it('cdf(-1.96)≈0.025', () => expect(normalCdf(-1.96)).toBeCloseTo(0.025, 3));
	it('cdf(1)≈0.8413', () => expect(normalCdf(1)).toBeCloseTo(0.8413447461, 4));
	it('cdf(-2.5758)≈0.005', () => expect(normalCdf(-2.5758)).toBeCloseTo(0.005, 3));
	it('cdf with mu/sigma', () => expect(normalCdf(100, 100, 15)).toBeCloseTo(0.5, 6));
	it('cdf(115, 100, 15) ≈ cdf(1)', () =>
		expect(normalCdf(115, 100, 15)).toBeCloseTo(normalCdf(1), 4));
});

describe('normal quantile', () => {
	it('quantile(0.5)=0', () => expect(normalQuantile(0.5)).toBeCloseTo(0, 6));
	it('quantile(0.975)≈1.96', () => expect(normalQuantile(0.975)).toBeCloseTo(1.96, 2));
	it('quantile(0.025)≈-1.96', () => expect(normalQuantile(0.025)).toBeCloseTo(-1.96, 2));
	it('quantile(0.995)≈2.5758', () => expect(normalQuantile(0.995)).toBeCloseTo(2.5758, 3));
	it('quantile is inverse of cdf', () => {
		for (const p of [0.01, 0.1, 0.3, 0.5, 0.7, 0.9, 0.99]) {
			expect(normalCdf(normalQuantile(p))).toBeCloseTo(p, 4);
		}
	});
	it('quantile with mu/sigma', () =>
		expect(normalQuantile(0.975, 100, 15)).toBeCloseTo(100 + 1.959964 * 15, 2));
});

describe('student-t cdf', () => {
	it('cdf(0, df)=0.5 (symmetric)', () => {
		expect(tCdf(0, 5)).toBeCloseTo(0.5, 8);
		expect(tCdf(0, 30)).toBeCloseTo(0.5, 8);
	});
	it('cdf is symmetric around 0', () => {
		expect(tCdf(-1.7, 9)).toBeCloseTo(1 - tCdf(1.7, 9), 8);
	});
	it('cdf(2.262, 9) ≈ 0.975 (matches R pt)', () => {
		expect(tCdf(2.262, 9)).toBeCloseTo(0.975, 3);
	});
	it('approaches the normal cdf for large df', () => {
		expect(tCdf(1.96, 1e7)).toBeCloseTo(normalCdf(1.96), 4);
	});
});

describe('student-t quantile', () => {
	// Reference values from R's qt().
	it('qt(0.975, 9) ≈ 2.262', () => {
		expect(tQuantile(0.975, 9)).toBeCloseTo(2.262, 2);
	});
	it('qt(0.975, 30) ≈ 2.042', () => {
		expect(tQuantile(0.975, 30)).toBeCloseTo(2.042, 2);
	});
	it('qt(0.975, 1e7) ≈ 1.96 (converges to z)', () => {
		expect(tQuantile(0.975, 1e7)).toBeCloseTo(1.96, 2);
	});
	it('qt(0.95, 1) ≈ 6.314 (heavy tails at df=1)', () => {
		expect(tQuantile(0.95, 1)).toBeCloseTo(6.314, 2);
	});
	it('is symmetric: qt(0.025, df) = -qt(0.975, df)', () => {
		expect(tQuantile(0.025, 9)).toBeCloseTo(-tQuantile(0.975, 9), 6);
	});
	it('qt(0.5, df) = 0', () => {
		expect(tQuantile(0.5, 12)).toBe(0);
	});
	it('is the inverse of tCdf', () => {
		for (const p of [0.05, 0.25, 0.6, 0.9, 0.99]) {
			expect(tCdf(tQuantile(p, 7), 7)).toBeCloseTo(p, 4);
		}
	});
	it('t quantile is wider than z for small df (same p)', () => {
		expect(tQuantile(0.975, 5)).toBeGreaterThan(normalQuantile(0.975));
	});
});

describe('rng', () => {
	it('is deterministic for a given seed', () => {
		const r1 = makeRng(123);
		const r2 = makeRng(123);
		const a = [r1(), r1(), r1(), r1()];
		const b = [r2(), r2(), r2(), r2()];
		expect(a).toEqual(b);
	});
	it('produces values in [0,1)', () => {
		const r = makeRng(7);
		for (let i = 0; i < 1000; i++) {
			const u = r();
			expect(u).toBeGreaterThanOrEqual(0);
			expect(u).toBeLessThan(1);
		}
	});
	it('different seeds give different streams', () => {
		const a = makeRng(1)();
		const b = makeRng(2)();
		expect(a).not.toEqual(b);
	});
});

describe('sampling', () => {
	it('is deterministic with a seed', () => {
		const a = drawSample('exponential', 50, makeRng(42));
		const b = drawSample('exponential', 50, makeRng(42));
		expect(a).toEqual(b);
		expect(a).toHaveLength(50);
	});

	const kinds: PopulationKind[] = ['normal', 'exponential', 'bimodal', 'uniform'];
	for (const kind of kinds) {
		it(`draws n values for kind ${kind}`, () => {
			const s = drawSample(kind, 25, makeRng(1));
			expect(s).toHaveLength(25);
			expect(s.every((v) => Number.isFinite(v))).toBe(true);
		});
	}

	it('uniform draws fall within declared range', () => {
		const s = drawSample('uniform', 2000, makeRng(99));
		const lo = POPULATIONS.uniform.range![0];
		const hi = POPULATIONS.uniform.range![1];
		for (const v of s) {
			expect(v).toBeGreaterThanOrEqual(lo);
			expect(v).toBeLessThan(hi);
		}
	});

	it('exponential draws are all positive', () => {
		const s = drawSample('exponential', 1000, makeRng(5));
		expect(s.every((v) => v > 0)).toBe(true);
	});
});

describe('generators match declared population mu/sigma', () => {
	// Monte-Carlo checks: with N = 200k the realized mean/sd must land within a
	// small relative band of the declared population parameters. We use a 1.5%
	// relative tolerance, comfortably above the sampling noise (~σ/√N) yet tight
	// enough to catch a mis-parameterized generator.
	const REL_TOL = 0.015;
	const kinds: PopulationKind[] = ['normal', 'exponential', 'bimodal', 'uniform'];
	for (const kind of kinds) {
		it(`${kind}: large-sample mean ≈ declared mu`, () => {
			const s = drawSample(kind, 200_000, makeRng(2024));
			const { mu } = POPULATIONS[kind];
			expect(Math.abs(mean(s) - mu)).toBeLessThan(REL_TOL * Math.abs(mu));
		});
		it(`${kind}: large-sample sd ≈ declared sigma`, () => {
			const s = drawSample(kind, 200_000, makeRng(2025));
			const { sigma } = POPULATIONS[kind];
			expect(Math.abs(sd(s) - sigma)).toBeLessThan(REL_TOL * sigma);
		});
	}
});

describe('welchTTest', () => {
	// Reference values from R:
	//   x <- c(5.1, 4.9, 6.2, 5.5, 5.8); y <- c(4.4, 5.0, 4.1, 4.8, 4.6)
	//   t.test(x, y)  →  t = 3.265, df = 6.9655, p-value = 0.01387 (Welch default)
	const x = [5.1, 4.9, 6.2, 5.5, 5.8];
	const y = [4.4, 5.0, 4.1, 4.8, 4.6];

	it('matches R t.test() for t, df and the two-sided p-value', () => {
		const r = welchTTest(x, y);
		expect(r.t).toBeCloseTo(3.265, 2);
		expect(r.df).toBeCloseTo(6.9655, 2);
		expect(r.pTwoSided).toBeCloseTo(0.01387, 2);
	});

	it('is antisymmetric in its arguments: swapping flips the sign of t, keeps p', () => {
		const r1 = welchTTest(x, y);
		const r2 = welchTTest(y, x);
		expect(r2.t).toBeCloseTo(-r1.t, 10);
		expect(r2.pTwoSided).toBeCloseTo(r1.pTwoSided, 10);
		expect(r2.df).toBeCloseTo(r1.df, 10);
	});

	it('identical samples give t = 0 and p = 1', () => {
		const r = welchTTest([1, 2, 3, 4], [1, 2, 3, 4]);
		expect(r.t).toBe(0);
		expect(r.pTwoSided).toBe(1);
	});

	it('under a true H0 (no real effect), ~5 % of experiments are significant', () => {
		// Draw two independent normal samples (same population → H0 true) many
		// times; the false-positive rate at α = 0.05 should be ≈ 5 %.
		const rng = makeRng(4242);
		const RUNS = 3000;
		const n = 30;
		let significant = 0;
		for (let i = 0; i < RUNS; i++) {
			const sa = drawSample('normal', n, rng);
			const sb = drawSample('normal', n, rng);
			if (welchTTest(sa, sb).pTwoSided < 0.05) significant += 1;
		}
		const rate = significant / RUNS;
		// Allow a generous band around the nominal 5 % (Monte-Carlo noise).
		expect(rate).toBeGreaterThan(0.03);
		expect(rate).toBeLessThan(0.07);
	});

	it('returns NaNs when a group has fewer than two observations', () => {
		const r = welchTTest([1], [1, 2, 3]);
		expect(Number.isNaN(r.t)).toBe(true);
		expect(Number.isNaN(r.df)).toBe(true);
		expect(Number.isNaN(r.pTwoSided)).toBe(true);
	});
});

describe('summaryTTest (Signal-zu-Rausch)', () => {
	it('computes t, df, se and p for a known case', () => {
		// Δ = 2, s = 3, n = 10 → SE = 3·√(2/10) = 1.34164, t = 1.49071, df = 18.
		const r = summaryTTest(2, 3, 10);
		expect(r.se).toBeCloseTo(1.341641, 5);
		expect(r.t).toBeCloseTo(1.490712, 5);
		expect(r.df).toBe(18);
		expect(r.pTwoSided).toBeCloseTo(0.153353, 5);
	});

	it('a large signal-to-noise ratio is highly significant', () => {
		// Δ = 5, s = 1, n = 4 → t = 7.0711, df = 6, p ≈ 0.0004.
		const r = summaryTTest(5, 1, 4);
		expect(r.t).toBeCloseTo(7.071068, 5);
		expect(r.df).toBe(6);
		expect(r.pTwoSided).toBeCloseTo(0.000401, 5);
	});

	it('same Δ: more noise s → smaller t and larger p', () => {
		const quiet = summaryTTest(2, 1, 20);
		const loud = summaryTTest(2, 4, 20);
		expect(quiet.t).toBeGreaterThan(loud.t);
		expect(quiet.pTwoSided).toBeLessThan(loud.pTwoSided);
	});

	it('same Δ and s: more data n → larger t and smaller p (√n im Nenner des SE)', () => {
		const few = summaryTTest(1, 3, 8);
		const many = summaryTTest(1, 3, 80);
		expect(many.t).toBeGreaterThan(few.t);
		expect(many.pTwoSided).toBeLessThan(few.pTwoSided);
	});

	it('agrees with welchTTest on equal-n, equal-variance samples', () => {
		// Two samples with identical n and identical sample SD, shifted by Δ.
		const base = [-2, -1, 0, 1, 2]; // mean 0, sample sd √2.5
		const a = base.map((x) => x + 10);
		const b = base.map((x) => x); // same spread, Δ = 10
		const sSample = sd(a); // = sd(b)
		const summary = summaryTTest(10, sSample, base.length);
		const welch = welchTTest(a, b);
		expect(summary.t).toBeCloseTo(welch.t, 6);
		expect(summary.df).toBeCloseTo(welch.df, 6);
		expect(summary.pTwoSided).toBeCloseTo(welch.pTwoSided, 6);
	});

	it('fails safe: n < 2 → NaNs; zero noise with Δ = 0 → t = 0, p = 1', () => {
		const tiny = summaryTTest(1, 1, 1);
		expect(Number.isNaN(tiny.t)).toBe(true);
		expect(Number.isNaN(tiny.pTwoSided)).toBe(true);

		const exact = summaryTTest(0, 0, 10);
		expect(exact.t).toBe(0);
		expect(exact.pTwoSided).toBe(1);
	});
});

describe('chiSquareCdf', () => {
	// Reference values from R's pchisq() at the classic 5 %-critical values.
	it('pchisq(3.841, 1) ≈ 0.95', () => {
		expect(chiSquareCdf(3.841459, 1)).toBeCloseTo(0.95, 4);
	});
	it('pchisq(5.991, 2) ≈ 0.95', () => {
		expect(chiSquareCdf(5.991465, 2)).toBeCloseTo(0.95, 4);
	});
	it('pchisq(7.815, 3) ≈ 0.95', () => {
		expect(chiSquareCdf(7.814728, 3)).toBeCloseTo(0.95, 4);
	});
	it('pchisq(11.07, 5) ≈ 0.95', () => {
		expect(chiSquareCdf(11.0705, 5)).toBeCloseTo(0.95, 4);
	});
	it('cdf(0, df) = 0 and is 0 for negative x', () => {
		expect(chiSquareCdf(0, 3)).toBe(0);
		expect(chiSquareCdf(-1, 3)).toBe(0);
	});
	it('df ≤ 0 → NaN', () => {
		expect(Number.isNaN(chiSquareCdf(1, 0))).toBe(true);
	});
	it('grows toward 1 in the upper tail', () => {
		expect(chiSquareCdf(20, 3)).toBeGreaterThan(0.999);
	});
});

describe('chiSquareGof (Anpassungstest)', () => {
	// Mendel's classic dihybrid pea data, expected 9:3:3:1 ratio.
	//   R: chisq.test(c(315,101,108,32), p = c(9,3,3,1)/16)
	//      X-squared = 0.47002, df = 3, p-value = 0.9254
	it('matches R for Mendel 9:3:3:1 (315,101,108,32)', () => {
		const r = chiSquareGof([315, 101, 108, 32], [9, 3, 3, 1]);
		expect(r.chi2).toBeCloseTo(0.47002, 3);
		expect(r.df).toBe(3);
		expect(r.p).toBeCloseTo(0.9254, 3);
	});

	it('accepts probabilities that already sum to 1 (same result)', () => {
		const ratios = chiSquareGof([315, 101, 108, 32], [9, 3, 3, 1]);
		const probs = chiSquareGof([315, 101, 108, 32], [9 / 16, 3 / 16, 3 / 16, 1 / 16]);
		expect(probs.chi2).toBeCloseTo(ratios.chi2, 10);
	});

	// Mendel monohybrid 3:1 (round vs. wrinkled): 5474 round, 1850 wrinkled.
	//   R: chisq.test(c(5474,1850), p = c(3,1)/4)
	//      X-squared = 0.26288, df = 1, p-value = 0.6081
	it('matches R for a 3:1 monohybrid cross (5474, 1850)', () => {
		const r = chiSquareGof([5474, 1850], [3, 1]);
		expect(r.chi2).toBeCloseTo(0.26288, 3);
		expect(r.df).toBe(1);
		expect(r.p).toBeCloseTo(0.6081, 3);
	});

	it('a perfect fit gives χ² = 0 and p = 1', () => {
		const r = chiSquareGof([90, 30, 30, 10], [9, 3, 3, 1]);
		expect(r.chi2).toBeCloseTo(0, 10);
		expect(r.p).toBeCloseTo(1, 10);
	});

	it('fails safe with fewer than two categories or a length mismatch', () => {
		expect(Number.isNaN(chiSquareGof([10], [1]).chi2)).toBe(true);
		expect(Number.isNaN(chiSquareGof([10, 20], [1, 1, 1]).chi2)).toBe(true);
	});
});

describe('chiSquareIndependence (Unabhängigkeitstest)', () => {
	// 2×2 contingency table, Art (A/B) × Habitat (1/2):
	//   A: 30 in Habitat 1, 10 in Habitat 2
	//   B: 12 in Habitat 1, 28 in Habitat 2
	// R: chisq.test(matrix(c(30,12,10,28), nrow = 2), correct = FALSE)
	//    X-squared = 16.241, df = 1, p-value = 5.57e-05
	const table = [
		[30, 10],
		[12, 28]
	];

	it('matches R chisq.test(correct = FALSE) on a 2×2 table', () => {
		const r = chiSquareIndependence(table);
		expect(r.chi2).toBeCloseTo(16.2406, 2);
		expect(r.df).toBe(1);
		expect(r.p).toBeCloseTo(5.566e-5, 6);
	});

	it('computes expected values from the margins E = (rowSum·colSum)/N', () => {
		const r = chiSquareIndependence(table);
		// rowSums = 40,40; colSums = 42,38; N = 80 → E11 = 40·42/80 = 21.
		expect(r.expected[0][0]).toBeCloseTo(21, 6);
		expect(r.expected[0][1]).toBeCloseTo(19, 6);
		expect(r.expected[1][0]).toBeCloseTo(21, 6);
		expect(r.expected[1][1]).toBeCloseTo(19, 6);
	});

	it('matches R chisq.test(correct = TRUE) with the Yates correction on 2×2', () => {
		// R default: X-squared = 14.486, df = 1, p-value = 0.0001416
		const r = chiSquareIndependence(table, true);
		expect(r.chi2).toBeCloseTo(14.4862, 2);
		expect(r.p).toBeCloseTo(0.0001416, 6);
	});

	// A 2×3 table (df = 2), Yates does NOT apply.
	//   R: chisq.test(matrix(c(10,20,30, 6,9,17), nrow = 2, byrow = TRUE),
	//                  correct = FALSE) → X-squared = 0.27157, df = 2, p = 0.8730
	it('matches R on a 2×3 table (df = 2)', () => {
		const r = chiSquareIndependence([
			[10, 20, 30],
			[6, 9, 17]
		]);
		expect(r.chi2).toBeCloseTo(0.27157, 3);
		expect(r.df).toBe(2);
		expect(r.p).toBeCloseTo(0.873, 3);
	});

	it('perfect independence gives χ² ≈ 0', () => {
		// Rows proportional → no association.
		const r = chiSquareIndependence([
			[10, 20],
			[20, 40]
		]);
		expect(r.chi2).toBeCloseTo(0, 8);
	});

	it('fails safe for degenerate tables', () => {
		expect(Number.isNaN(chiSquareIndependence([[1, 2]]).chi2)).toBe(true);
		expect(chiSquareIndependence([[1, 2]]).expected).toEqual([]);
		expect(
			Number.isNaN(
				chiSquareIndependence([
					[0, 0],
					[0, 0]
				]).chi2
			)
		).toBe(true);
	});
});

describe('POPULATIONS descriptor', () => {
	it('has a German label and numeric mu/sigma for every kind', () => {
		const kinds: PopulationKind[] = ['normal', 'exponential', 'bimodal', 'uniform'];
		for (const kind of kinds) {
			const p = POPULATIONS[kind];
			expect(typeof p.label).toBe('string');
			expect(p.label.length).toBeGreaterThan(0);
			expect(Number.isFinite(p.mu)).toBe(true);
			expect(Number.isFinite(p.sigma)).toBe(true);
			expect(p.sigma).toBeGreaterThan(0);
		}
	});
});
