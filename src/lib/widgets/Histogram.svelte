<script lang="ts">
	import { scaleLinear } from 'd3-scale';

	/** A vertical reference line drawn on top of the bars. */
	export type Marker = { x: number; label?: string; color?: string };

	type Props = {
		/**
		 * Bin counts (one number per equal-width bin). The component is fully
		 * Svelte-controlled: it does NOT bin data itself — pass counts produced
		 * by `binCounts(values, min, max, bins.length)` so the domain and the
		 * counts stay in sync.
		 */
		bins: number[];
		/** Lower edge of the first bin (data units). */
		min: number;
		/** Upper edge of the last bin (data units). */
		max: number;
		/**
		 * Optional density/overlay curve in DATA units. Returns a y-value that is
		 * compared against the bar heights; it is auto-scaled so that the supplied
		 * `overlayPeak` (or the curve's own sampled max) maps to the tallest bar.
		 */
		overlayCurve?: (x: number) => number;
		/**
		 * Optional explicit peak value of `overlayCurve` used for scaling. If
		 * omitted the curve is sampled to find its own maximum. Useful when you
		 * want the normal density peak 1/(σ√2π) to align with the bar axis.
		 */
		overlayPeak?: number;
		/** Vertical reference lines (e.g. true μ, mean-of-means). */
		markers?: Marker[];
		/** Accessible title / aria-label. */
		title?: string;
		/** Axis label under the x-axis. */
		xLabel?: string;
		/** Axis label along the y-axis (rendered rotated). Omit to render nothing. */
		yLabel?: string;
		/** Bar fill colour (warm palette default). */
		barColor?: string;
		/** Height of the drawing area in viewBox units. */
		height?: number;
	};

	let {
		bins,
		min,
		max,
		overlayCurve,
		overlayPeak,
		markers = [],
		title = 'Histogramm',
		xLabel,
		yLabel,
		barColor = 'var(--color-amber-300)',
		height = 200
	}: Props = $props();

	// --- Geometry (viewBox units; the SVG itself is responsive via width:100%) ---
	const W = 520;
	const margin = { top: 12, right: 12, bottom: 34, left: 12 };

	const innerW = $derived(W - margin.left - margin.right);
	const innerH = $derived(height - margin.top - margin.bottom);

	const x = $derived(scaleLinear().domain([min, max]).range([0, innerW]));

	// Tallest count drives the y-axis; guard the all-zero case so bars don't NaN.
	const maxCount = $derived(Math.max(1, ...bins));
	const y = $derived(scaleLinear().domain([0, maxCount]).range([innerH, 0]));

	const binWidthPx = $derived(bins.length > 0 ? innerW / bins.length : innerW);

	// --- Overlay curve sampled across the domain, scaled so its peak == maxCount. ---
	const SAMPLES = 120;
	const overlayPath = $derived.by(() => {
		if (!overlayCurve) return '';
		const pts: { px: number; raw: number }[] = [];
		let peak = overlayPeak ?? 0;
		for (let i = 0; i <= SAMPLES; i++) {
			const xv = min + ((max - min) * i) / SAMPLES;
			const raw = overlayCurve(xv);
			if (overlayPeak === undefined && raw > peak) peak = raw;
			pts.push({ px: x(xv), raw });
		}
		if (!(peak > 0)) return '';
		// Map the curve's peak onto the tallest bar height.
		return pts
			.map((p, i) => {
				const py = y((p.raw / peak) * maxCount);
				return `${i === 0 ? 'M' : 'L'}${p.px.toFixed(2)},${py.toFixed(2)}`;
			})
			.join(' ');
	});

	// Sensible x-axis ticks (≈5) using d3's nice tick generator.
	const ticks = $derived(x.ticks(5));

	function fmt(v: number): string {
		if (Math.abs(v) >= 100) return v.toFixed(0);
		if (Number.isInteger(v)) return String(v);
		return v.toFixed(1);
	}
</script>

<svg
	viewBox="0 0 {W} {height}"
	class="block h-auto w-full"
	role="img"
	aria-label={title}
	preserveAspectRatio="xMidYMid meet"
>
	<title>{title}</title>
	<g transform="translate({margin.left},{margin.top})">
		<!-- baseline -->
		<line x1="0" y1={innerH} x2={innerW} y2={innerH} stroke="var(--color-ink)" stroke-opacity="0.25" />

		<!-- bars -->
		{#each bins as count, i (i)}
			{@const bh = innerH - y(count)}
			<rect
				x={i * binWidthPx + 0.5}
				y={y(count)}
				width={Math.max(0, binWidthPx - 1)}
				height={Math.max(0, bh)}
				fill={barColor}
				fill-opacity="0.85"
				rx="1"
			/>
		{/each}

		<!-- overlay normal curve -->
		{#if overlayPath}
			<path
				d={overlayPath}
				fill="none"
				stroke="var(--color-coral-500)"
				stroke-width="2.5"
				stroke-linejoin="round"
				stroke-linecap="round"
			/>
		{/if}

		<!-- markers (vertical reference lines) -->
		{#each markers as m, i (i)}
			{@const mx = x(m.x)}
			{#if mx >= 0 && mx <= innerW}
				<line
					x1={mx}
					y1="0"
					x2={mx}
					y2={innerH}
					stroke={m.color ?? 'var(--color-ink)'}
					stroke-width="2"
					stroke-dasharray="4 3"
				/>
				{#if m.label}
					<text
						x={mx}
						y="-2"
						text-anchor="middle"
						font-size="11"
						fill={m.color ?? 'var(--color-ink)'}
					>
						{m.label}
					</text>
				{/if}
			{/if}
		{/each}

		<!-- x-axis ticks -->
		{#each ticks as t (t)}
			{@const tx = x(t)}
			<line x1={tx} y1={innerH} x2={tx} y2={innerH + 4} stroke="var(--color-ink)" stroke-opacity="0.4" />
			<text x={tx} y={innerH + 16} text-anchor="middle" font-size="11" fill="var(--color-ink-faint)">
				{fmt(t)}
			</text>
		{/each}

		{#if xLabel}
			<text
				x={innerW / 2}
				y={innerH + 30}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
			>
				{xLabel}
			</text>
		{/if}

		{#if yLabel}
			<text
				x={-2}
				y={innerH / 2}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
				transform="rotate(-90 {-2} {innerH / 2})"
			>
				{yLabel}
			</text>
		{/if}
	</g>
</svg>
