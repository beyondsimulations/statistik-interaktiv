<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { summaryTTest, makeRng, standardNormal } from '$lib/stats';
	import { makeLinearScale, bellCurvePath } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Zwei Vogelarten, deren Zugdistanz (km) wir vergleichen: Buchfink (grün) und
	// Mönchsgrasmücke (koralle). Drei Regler steuern die Kernintuition des t-Werts
	// als Signal-zu-Rausch-Verhältnis:
	//   • Δ  = Mittelwertdifferenz der Zugdistanz   → das SIGNAL
	//   • s  = Streuung innerhalb jeder Gruppe (SD) → das RAUSCHEN
	//   • n  = Stichprobenumfang je Gruppe          → √n im Nenner des SE
	// Bei gleichem n und gleichem s gilt exakt
	//   SE = s·√(2/n),  t = Δ / SE,  df = 2n − 2,  p = 2·P(T ≥ |t|).
	// Wir rechnen t/p deterministisch aus diesen Kennzahlen (summaryTTest), die
	// gezeichneten Stichprobenpunkte sind reine Illustration (fester Seed).

	const BASE = 1500; // Bezugswert der Zugdistanz (km), nur für die Achsenlage
	const DEFAULTS = { delta: 300, s: 250, n: 20 };

	let delta = $state(DEFAULTS.delta); // Mittelwertdifferenz Δ in km (Signal)
	let s = $state(DEFAULTS.s); // Streuung je Gruppe in km (Rausch)
	let n = $state(DEFAULTS.n); // Stichprobenumfang je Gruppe

	// Lage der beiden Gruppenmittel, symmetrisch um BASE.
	const muFink = $derived(BASE - delta / 2); // Buchfink (linke, grüne Kurve)
	const muMoench = $derived(BASE + delta / 2); // Mönchsgrasmücke (rechte, korallene Kurve)

	// t, df, SE und p deterministisch aus den Kennzahlen.
	const res = $derived(summaryTTest(delta, s, n));
	const significant = $derived(res.pTwoSided < 0.05);

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const H = 260;
	const PAD_L = 16;
	const PAD_R = 16;
	const PAD_T = 18;
	const PAD_B = 40;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;
	const baseY = PAD_T + plotH;

	// Slider-Grenzen als EINE Wahrheitsquelle: dieselben Consts speisen die Achsen-
	// Mathematik UND die max-Attribute der Regler. Weitet jemand einen Slider, wächst
	// die feste Achse strukturell mit — kein stilles Klippen mehr.
	const DELTA_MAX = 800; // Mittelwertdifferenz Δ (km)
	const S_MAX = 700; // Streuung je Gruppe (SD, km)

	// KONSTANTE km-Achse, die den GESAMTEN Reglerbereich abdeckt, damit der Rahmen
	// beim Ziehen steht und sich nur die Kurven bewegen. Die äußerste Kurve liegt bei
	// BASE + DELTA_MAX/2 mit einem 3σ-Schwanz (σ = S_MAX):
	//   HALF_SPAN = DELTA_MAX/2 + 3·S_MAX = 2500 km.
	// Damit passt jede Kombination aus Δ und s vollständig in den festen Rahmen.
	const HALF_SPAN = DELTA_MAX / 2 + 3 * S_MAX; // = 2500 km
	const lo = BASE - HALF_SPAN;
	const hi = BASE + HALF_SPAN;

	const scaleX = $derived(makeLinearScale(lo, hi, PAD_L, PAD_L + plotW));
	const sx = $derived(scaleX.map);
	// Höhe relativ zur höchsten Glocke (kleinstes s → spitzeste Kurve). peakFrac
	// 0.82 hält die Gipfelhöhe wie zuvor; sy wird noch für die Mittelwert- und
	// Δ-Linien gebraucht (Gipfelhöhe ist σ-invariant).
	const PEAK_FRAC = 0.82;
	const sy = $derived.by(() => (frac: number) => baseY - frac * plotH * PEAK_FRAC);

	const finkCurve = $derived(
		bellCurvePath({ mu: muFink, sigma: s, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: 160 }, sx)
	);
	const moenchCurve = $derived(
		bellCurvePath({ mu: muMoench, sigma: s, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: 160 }, sx)
	);

	// Illustrative Stichprobenpunkte (deterministisch, fester Seed). Sie dienen
	// nur der Veranschaulichung der Streuung; die Statistik kommt aus summaryTTest.
	// Die Standardnormal-z-Werte und der feste vertikale Versatz werden EINMAL
	// (seed-stabil, nur abhängig von n) gezogen; nur die x-Projektion (mu + s·z)
	// reagiert auf Δ und s, damit das Ziehen des Rausch-Reglers die Wolke nicht
	// neu auswürfelt.
	function sampleZ(seed: number): { z: number; jitter: number }[] {
		const rng = makeRng(seed);
		const count = Math.min(n, 40); // höchstens 40 Punkte je Gruppe zeichnen
		const out: { z: number; jitter: number }[] = [];
		for (let i = 0; i < count; i++) {
			const z = standardNormal(rng);
			const jitter = 6 + rng() * 22; // vertikaler Versatz über der Achse
			out.push({ z, jitter });
		}
		return out;
	}
	const finkZ = $derived(sampleZ(101));
	const moenchZ = $derived(sampleZ(202));

	const finkDots = $derived(
		finkZ.map(({ z, jitter }) => ({ x: sx(muFink + s * z), y: baseY - jitter }))
	);
	const moenchDots = $derived(
		moenchZ.map(({ z, jitter }) => ({ x: sx(muMoench + s * z), y: baseY - jitter }))
	);

	function fmt0(v: number): string {
		return Math.round(v).toLocaleString('de-DE');
	}
	function fmt2(v: number): string {
		if (!Number.isFinite(v)) return '∞';
		return v.toFixed(2).replace('.', ',');
	}
	function fmtP(p: number): string {
		if (p < 0.001) return '< 0,001';
		return p.toFixed(3).replace('.', ',');
	}

	function reset() {
		delta = DEFAULTS.delta;
		s = DEFAULTS.s;
		n = DEFAULTS.n;
	}
</script>

<Widget
	title="Signal-zu-Rausch-Regler: der t-Wert zum Anfassen"
	hint="Zwei Vogelarten und ihre Zugdistanz: Buchfink (grün) gegen Mönchsgrasmücke (koralle). Δ ist das Signal, die Streuung s das Rauschen, n die Datenmenge. Sieh zu, wie t und p reagieren."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Zwei Glockenkurven der Zugdistanz: Buchfink bei {fmt0(
				muFink
			)} km und Mönchsgrasmücke bei {fmt0(muMoench)} km. t = {fmt2(res.t)}, p = {fmtP(
				res.pTwoSided
			)}."
		>
			<!-- Nulllinie -->
			<line
				x1={PAD_L}
				y1={baseY}
				x2={W - PAD_R}
				y2={baseY}
				stroke="var(--color-ink)"
				stroke-opacity="0.25"
			/>

			<!-- Stichprobenpunkte (Illustration der Streuung) -->
			{#each finkDots as dot, i (i)}
				<circle cx={dot.x} cy={dot.y} r="2.5" fill="var(--color-sage-500)" fill-opacity="0.55" />
			{/each}
			{#each moenchDots as dot, i (i)}
				<circle cx={dot.x} cy={dot.y} r="2.5" fill="var(--color-coral-500)" fill-opacity="0.55" />
			{/each}

			<!-- Die beiden Glockenkurven -->
			<polyline points={finkCurve} fill="none" stroke="var(--color-sage-500)" stroke-width="2.5" />
			<polyline
				points={moenchCurve}
				fill="none"
				stroke="var(--color-coral-500)"
				stroke-width="2.5"
			/>

			<!-- Mittelwertlinien -->
			<line
				x1={sx(muFink)}
				y1={sy(1)}
				x2={sx(muFink)}
				y2={baseY}
				stroke="var(--color-sage-500)"
				stroke-width="1.5"
				stroke-dasharray="4 3"
			/>
			<line
				x1={sx(muMoench)}
				y1={sy(1)}
				x2={sx(muMoench)}
				y2={baseY}
				stroke="var(--color-coral-500)"
				stroke-width="1.5"
				stroke-dasharray="4 3"
			/>

			<!-- Δ-Klammer zwischen den Gipfeln -->
			<line
				x1={sx(muFink)}
				y1={sy(1) - 10}
				x2={sx(muMoench)}
				y2={sy(1) - 10}
				stroke="var(--color-ink-soft)"
				stroke-width="1.5"
			/>
			<text
				x={sx(BASE)}
				y={sy(1) - 14}
				text-anchor="middle"
				font-size="11"
				font-weight="700"
				fill="var(--color-ink-soft)"
			>
				Δ = {fmt0(delta)} km
			</text>

			<!-- Kurvenbeschriftung -->
			<text
				x={sx(muFink)}
				y={baseY + 16}
				text-anchor="middle"
				font-size="10.5"
				fill="var(--color-sage-500)"
			>
				Buchfink
			</text>
			<text
				x={sx(muMoench)}
				y={baseY + 16}
				text-anchor="middle"
				font-size="10.5"
				fill="var(--color-coral-700)"
			>
				Mönchsgrasmücke
			</text>

			<!-- Achsenbeschriftung -->
			<text
				x={W - PAD_R}
				y={baseY + 32}
				text-anchor="end"
				font-size="10"
				fill="var(--color-ink-faint)"
			>
				Zugdistanz (km) →
			</text>
		</svg>

		<!-- Live-Anzeige t und p -->
		<div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {significant
					? 'bg-sage-100'
					: 'bg-paper-sunk'}"
			>
				<span class="text-ink-soft font-semibold">t = </span>
				<span class="text-ink text-2xl font-bold tabular-nums">{fmt2(res.t)}</span>
			</div>
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {significant
					? 'bg-sage-100 text-sage-500'
					: 'bg-coral-50 text-coral-700'}"
			>
				<span class="font-semibold">p = </span>
				<span class="text-2xl font-bold tabular-nums">{fmtP(res.pTwoSided)}</span>
				<span class="text-sm font-semibold"
					>{significant ? '· signifikant' : '· nicht signifikant'}</span
				>
			</div>
			<div class="text-ink-soft flex items-baseline gap-2 text-sm tabular-nums">
				<span>SE = {fmt0(res.se)} km</span>
				<span>·</span>
				<span>df = {res.df}</span>
			</div>
		</div>

		<p class="text-ink-faint text-xs leading-relaxed">
			Der t-Wert ist <strong>Signal ÷ Rausch</strong>: t = Δ / SE mit SE = s·√(2/n). Dreh die
			<span class="text-ink-soft font-semibold">Streuung s</span> hoch → der Standardfehler wächst,
			t schrumpft, p steigt (dieselbe Differenz wird unbedeutend). Mehr
			<span class="text-ink-soft font-semibold">Daten n</span> oder ein größeres
			<span class="text-ink-soft font-semibold">Δ</span> → t wächst, p sinkt.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<div>
				<label for="sr-delta" class="text-ink-soft mb-1 block text-sm font-semibold">
					Mittelwertdifferenz Δ = {fmt0(delta)} km
					<span class="text-ink-faint font-normal">(Signal)</span>
				</label>
				<input
					id="sr-delta"
					type="range"
					min="0"
					max={DELTA_MAX}
					step="10"
					bind:value={delta}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>0 (kein Unterschied)</span><span>800 km</span>
				</div>
			</div>

			<div>
				<label for="sr-s" class="text-ink-soft mb-1 block text-sm font-semibold">
					Streuung s = {fmt0(s)} km
					<span class="text-ink-faint font-normal">(Rauschen, SD je Gruppe)</span>
				</label>
				<input
					id="sr-s"
					type="range"
					min="50"
					max={S_MAX}
					step="10"
					bind:value={s}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>50 (leise)</span><span>700 (laut)</span>
				</div>
			</div>

			<div>
				<label for="sr-n" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang je Gruppe n = {n}
				</label>
				<input
					id="sr-n"
					type="range"
					min="3"
					max="120"
					step="1"
					bind:value={n}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>3</span><span>120</span></div>
			</div>
		</div>
	{/snippet}
</Widget>
