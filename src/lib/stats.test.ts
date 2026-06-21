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
