import { describe, it, expect } from 'vitest';
import {
	mean,
	variance,
	sd,
	standardError,
	normalPdf,
	normalCdf,
	normalQuantile,
	makeRng,
	drawSample,
	POPULATIONS,
	type PopulationKind
} from './stats';

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
