/**
 * Gemeinsame SVG-Helfer für die Glockenkurven-Widgets (FlaechenSchieber,
 * PowerVisualizer, SignalRausch, …). Bisher kopierten diese Widgets dieselbe
 * Lineare-Skala- und Pfad-Logik untereinander; hier liegt sie zentral, rein
 * (keine Svelte-Reaktivität) und damit testbar.
 */
import { normalPdf } from '$lib/stats';

/** Eine lineare Skala zwischen einem Daten- und einem Pixel-Intervall. */
export interface LinearScale {
	/** Datenwert → Pixel. */
	map(v: number): number;
	/** Pixel → Datenwert (Umkehrung von `map`). */
	invert(px: number): number;
}

/**
 * Erzeugt eine lineare Skala, die `[domainMin, domainMax]` (Datenraum) auf
 * `[rangeMin, rangeMax]` (Pixelraum) abbildet — plus deren Umkehrung.
 *
 * Sonderfall `domainMin === domainMax`: eine Abbildung wäre nicht definiert
 * (Division durch 0). `map` liefert dann konstant `rangeMin`, `invert` konstant
 * `domainMin`, damit nie `NaN`/`Infinity` in den SVG-Pfad gelangt.
 */
export function makeLinearScale(
	domainMin: number,
	domainMax: number,
	rangeMin: number,
	rangeMax: number
): LinearScale {
	const domainSpan = domainMax - domainMin;
	if (domainSpan === 0) {
		return {
			map: () => rangeMin,
			invert: () => domainMin
		};
	}
	const rangeSpan = rangeMax - rangeMin;
	return {
		map: (v: number) => rangeMin + ((v - domainMin) / domainSpan) * rangeSpan,
		invert: (px: number) => domainMin + ((px - rangeMin) / rangeSpan) * domainSpan
	};
}

/** Gemeinsame Optionen für die Kurvenform N(μ, σ) im Pixelraum. */
export interface BellCurveOpts {
	/** Mittelwert μ (Gipfel der Kurve im Datenraum). */
	mu: number;
	/** Standardabweichung σ. */
	sigma: number;
	/** Linke x-Grenze (Datenraum), über die abgetastet wird. */
	xMin: number;
	/** Rechte x-Grenze (Datenraum). */
	xMax: number;
	/** y-Pixel der Nulllinie (x-Achse). */
	baseY: number;
	/** Höhe des Plotbereichs in Pixeln. */
	plotH: number;
	/** Gipfelhöhe als Anteil von `plotH` (Standard 0.85). */
	peakFrac?: number;
	/** Anzahl der Abtastpunkte (Standard 121). */
	nPoints?: number;
}

/**
 * Dichte → SVG-y: skaliert relativ zum Gipfel `normalPdf(μ; μ, σ)` auf
 * `peakFrac · plotH` und spiegelt an der Basislinie `baseY` (SVG-y wächst nach
 * unten). Der Gipfel ist konstruktionsbedingt invariant gegen σ.
 */
function densityToY(d: number, peak: number, baseY: number, plotH: number, peakFrac: number): number {
	// `!(peak > 0)` also catches NaN (σ = 0 makes the peak NaN); guard `d` too so
	// a degenerate curve collapses to the baseline instead of emitting NaN coords.
	if (!(peak > 0) || !Number.isFinite(d)) return baseY;
	return baseY - (d / peak) * plotH * peakFrac;
}

/**
 * Polyline-`points`-String der gesamten Glockenkurve von `xMin` bis `xMax`.
 * `sx` bildet x (Datenraum) auf Pixel ab. Geeignet für `<polyline points={…}>`
 * (und als `M …`-freier `d`-Rumpf nicht gedacht — dafür gibt es `bellAreaPath`).
 */
export function bellCurvePath(opts: BellCurveOpts, sx: (x: number) => number): string {
	const { mu, sigma, xMin, xMax, baseY, plotH, peakFrac = 0.85, nPoints = 121 } = opts;
	const peak = normalPdf(mu, mu, sigma);
	const pts: string[] = [];
	for (let i = 0; i <= nPoints; i++) {
		const x = xMin + ((xMax - xMin) * i) / nPoints;
		const y = densityToY(normalPdf(x, mu, sigma), peak, baseY, plotH, peakFrac);
		pts.push(`${sx(x).toFixed(2)},${y.toFixed(2)}`);
	}
	return pts.join(' ');
}

/** Optionen für die geschlossene Flächenfüllung von `x0` bis `x1`. */
export interface BellAreaOpts extends BellCurveOpts {
	/** Linke Grenze des gefüllten Bereichs (Datenraum). */
	x0: number;
	/** Rechte Grenze des gefüllten Bereichs (Datenraum). */
	x1: number;
}

/**
 * Geschlossener `d`-Pfad des Flächenstücks unter der Glockenkurve von `x0` bis
 * `x1` (z. B. ein schattierter Schwanz). Baseline liegt auf `baseY`. Liefert
 * einen leeren String, falls `x1 <= x0` (nichts zu füllen).
 */
export function bellAreaPath(opts: BellAreaOpts, sx: (x: number) => number): string {
	const { mu, sigma, x0, x1, baseY, plotH, peakFrac = 0.85, nPoints = 121 } = opts;
	if (!(x1 > x0)) return '';
	const peak = normalPdf(mu, mu, sigma);
	let d = `M ${sx(x0).toFixed(2)} ${baseY.toFixed(2)}`;
	for (let i = 0; i <= nPoints; i++) {
		const x = x0 + ((x1 - x0) * i) / nPoints;
		const y = densityToY(normalPdf(x, mu, sigma), peak, baseY, plotH, peakFrac);
		d += ` L ${sx(x).toFixed(2)} ${y.toFixed(2)}`;
	}
	d += ` L ${sx(x1).toFixed(2)} ${baseY.toFixed(2)} Z`;
	return d;
}
