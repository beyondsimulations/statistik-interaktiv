import { describe, it, expect } from 'vitest';
import { makeLinearScale, bellCurvePath, bellAreaPath, type BellCurveOpts } from './curve';

describe('makeLinearScale', () => {
	const s = makeLinearScale(0, 10, 100, 300);

	it('maps the domain endpoints to the range endpoints', () => {
		expect(s.map(0)).toBeCloseTo(100, 10);
		expect(s.map(10)).toBeCloseTo(300, 10);
	});

	it('maps the midpoint linearly', () => {
		expect(s.map(5)).toBeCloseTo(200, 10);
	});

	it('inverts the range endpoints back to the domain', () => {
		expect(s.invert(100)).toBeCloseTo(0, 10);
		expect(s.invert(300)).toBeCloseTo(10, 10);
	});

	it('invert round-trips map for arbitrary values', () => {
		for (const v of [-3, 0, 1.7, 4, 9.99, 13]) {
			expect(s.invert(s.map(v))).toBeCloseTo(v, 10);
		}
	});

	it('handles inverted / negative pixel ranges (SVG y grows downward)', () => {
		const inv = makeLinearScale(-3, 3, 240, 0);
		expect(inv.map(-3)).toBeCloseTo(240, 10);
		expect(inv.map(3)).toBeCloseTo(0, 10);
		expect(inv.map(0)).toBeCloseTo(120, 10);
		expect(inv.invert(inv.map(1.5))).toBeCloseTo(1.5, 10);
	});

	it('guards against a degenerate (zero-width) domain', () => {
		const deg = makeLinearScale(5, 5, 0, 200);
		expect(deg.map(5)).toBe(0);
		expect(deg.map(999)).toBe(0);
		expect(Number.isFinite(deg.map(123))).toBe(true);
		expect(deg.invert(150)).toBe(5);
	});
});

describe('bellCurvePath', () => {
	const sx = makeLinearScale(-3, 3, 0, 600).map;
	const baseOpts: BellCurveOpts = {
		mu: 0,
		sigma: 1,
		xMin: -3,
		xMax: 3,
		baseY: 200,
		plotH: 180
	};

	it('produces a non-empty points string with nPoints + 1 vertices (default 121)', () => {
		const pts = bellCurvePath(baseOpts, sx);
		expect(pts.length).toBeGreaterThan(0);
		expect(pts.trim().split(/\s+/)).toHaveLength(122);
	});

	it('respects a custom nPoints', () => {
		const pts = bellCurvePath({ ...baseOpts, nPoints: 10 }, sx);
		expect(pts.trim().split(/\s+/)).toHaveLength(11);
	});

	it('peaks at mu near peakFrac * plotH above the baseline', () => {
		const pts = bellCurvePath(baseOpts, sx).split(' ');
		const ys = pts.map((p) => Number(p.split(',')[1]));
		const minY = Math.min(...ys); // höchster Punkt = kleinstes y in SVG
		// Gipfel ≈ baseY − peakFrac·plotH = 200 − 0.85·180 = 47.
		expect(minY).toBeCloseTo(200 - 0.85 * 180, 1);
	});

	it('every vertex is a finite "x,y" pair', () => {
		const pts = bellCurvePath(baseOpts, sx).split(' ');
		for (const p of pts) {
			const [x, y] = p.split(',').map(Number);
			expect(Number.isFinite(x)).toBe(true);
			expect(Number.isFinite(y)).toBe(true);
		}
	});
});

describe('bellAreaPath', () => {
	const sx = makeLinearScale(-3, 3, 0, 600).map;
	const opts = {
		mu: 0,
		sigma: 1,
		xMin: -3,
		xMax: 3,
		baseY: 200,
		plotH: 180,
		x0: 1,
		x1: 3
	};

	it('returns a closed path starting with M and ending with Z', () => {
		const d = bellAreaPath(opts, sx);
		expect(d.length).toBeGreaterThan(0);
		expect(d.startsWith('M ')).toBe(true);
		expect(d.trim().endsWith('Z')).toBe(true);
	});

	it('returns an empty string when the interval is empty (x1 <= x0)', () => {
		expect(bellAreaPath({ ...opts, x0: 2, x1: 2 }, sx)).toBe('');
		expect(bellAreaPath({ ...opts, x0: 3, x1: 1 }, sx)).toBe('');
	});

	it('drops back to the baseline at both interval ends', () => {
		const d = bellAreaPath(opts, sx);
		// Erster Punkt nach "M" liegt auf baseY; letztes "L … Z" ebenso.
		expect(d).toContain(`M ${sx(opts.x0).toFixed(2)} ${opts.baseY.toFixed(2)}`);
		expect(d).toContain(`L ${sx(opts.x1).toFixed(2)} ${opts.baseY.toFixed(2)} Z`);
	});
});
