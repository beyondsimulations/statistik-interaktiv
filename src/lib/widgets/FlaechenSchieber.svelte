<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { normalCdf } from '$lib/stats';
	import { makeLinearScale, bellCurvePath, bellAreaPath } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Eine Normalverteilungs-Dichtekurve N(μ, σ) über einer x-Achse. Zwei Grenzen
	// a und b (Slider) schneiden ein Intervall heraus; die Fläche darunter wird
	// koralle eingefärbt. Die Live-Anzeige zeigt P(a < X ≤ b) = F(b) − F(a),
	// berechnet ausschließlich über normalCdf (nicht von Hand). μ und σ formen die
	// Kurve um; die Schattierung folgt automatisch. Ein z-Schalter beschriftet die
	// Achse in Standardabweichungen um und macht die Z-Transformation sichtbar.

	const DEFAULTS = { mu: 0, sigma: 1, a: -1, b: 1 };

	let mu = $state(DEFAULTS.mu); // Lage des Gipfels
	let sigma = $state(DEFAULTS.sigma); // Breite
	let a = $state(DEFAULTS.a); // untere Grenze
	let b = $state(DEFAULTS.b); // obere Grenze
	let zView = $state(false); // Achse in Standardabweichungen (z) beschriften
	let showRegel = $state(false); // 68/95/99,7-Markierungen einblenden

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const H = 240;
	const PAD_L = 16;
	const PAD_R = 16;
	const PAD_T = 18;
	const PAD_B = 36; // Platz für die Achsenbeschriftung
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;
	const baseY = PAD_T + plotH; // y der Nulllinie (x-Achse)
	const PEAK_FRAC = 0.92; // Gipfelhöhe als Anteil von plotH (wie zuvor ~92 %)

	// Slider-Grenzen als EINE Wahrheitsquelle: dieselben Consts speisen die Achsen-
	// Mathematik UND die min/max-Attribute der Regler. Weitet jemand einen Slider,
	// wächst die feste Achse strukturell mit — kein stilles Klippen mehr.
	const MU_MAX = 4; // Mittelwert μ ∈ [−MU_MAX, MU_MAX]
	const SIGMA_MAX = 2.5; // Standardabweichung σ (Maximum)

	// KONSTANTE Achse, die den GESAMTEN Reglerbereich abdeckt, damit der Rahmen beim
	// Ziehen steht: μ verschiebt die Kurve, σ staucht/streckt sie — die Achse bleibt.
	// μ ∈ [−MU_MAX, MU_MAX], σ ≤ SIGMA_MAX; die äußerste Kurve reicht bis
	// MU_MAX + 4·SIGMA_MAX = 4 + 10 = 14 (und spiegelbildlich −14). Bei 4σ ist die
	// Dichte außerhalb praktisch null.
	const HALF_SPAN = MU_MAX + 4 * SIGMA_MAX; // = 14
	const lo = -HALF_SPAN; // = −14
	const hi = HALF_SPAN; // = 14

	// Slider-Bereich für a/b folgt der (nun festen) Achse. Wir runden großzügig.
	const boundMin = Math.round((lo - 0.5) * 10) / 10;
	const boundMax = Math.round((hi + 0.5) * 10) / 10;
	const boundStep = $derived(Math.max(0.01, Math.round((sigma / 20) * 100) / 100));

	// Der Slider-Bereich [boundMin, boundMax] ist jetzt konstant und zugleich das
	// min/max der a-/b-Regler — die Range-Inputs klemmen a und b schon selbst in
	// diesen Bereich. Die frühere $effect-Nachführung (nötig, solange sich der
	// Bereich mit μ/σ verschob) entfällt damit ersatzlos.

	// a darf b nicht überholen (und umgekehrt). Wir klemmen beim Lesen, statt die
	// Slider gegenseitig zu zwingen — so bleibt das Ziehen flüssig.
	const aClamped = $derived(Math.min(a, b));
	const bClamped = $derived(Math.max(a, b));

	// --- Die zentrale Zahl: P(a < X ≤ b) = F(b) − F(a) ------------------------
	const prob = $derived(normalCdf(bClamped, mu, sigma) - normalCdf(aClamped, mu, sigma));

	// x-Wert (Datenraum) → SVG-x über die geteilte lineare Skala.
	const scaleX = $derived(makeLinearScale(lo, hi, PAD_L, PAD_L + plotW));
	const sx = $derived(scaleX.map);

	// Kurvenpunkte (Polyline der gesamten Dichte) über die geteilte Helferin.
	const curvePoints = $derived(
		bellCurvePath(
			{ mu, sigma, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: 180 },
			sx
		)
	);

	// Gefülltes Flächenstück zwischen a und b (geschlossenes Polygon auf der Basis).
	const areaPath = $derived(
		bellAreaPath(
			{
				mu,
				sigma,
				xMin: lo,
				xMax: hi,
				baseY,
				plotH,
				peakFrac: PEAK_FRAC,
				nPoints: 120,
				x0: aClamped,
				x1: bClamped
			},
			sx
		)
	);

	// Achsen-Ticks: im Datenmodus μ−3σ … μ+3σ, im z-Modus −3 … +3.
	const ticks = $derived.by(() => {
		const out: { x: number; label: string }[] = [];
		for (let k = -4; k <= 4; k++) {
			const x = mu + k * sigma;
			if (x < lo - 1e-9 || x > hi + 1e-9) continue;
			const label = zView ? (k === 0 ? '0' : `${k > 0 ? '+' : ''}${k}`) : fmtTick(x);
			out.push({ x, label });
		}
		return out;
	});

	// 68/95/99,7-Bereiche (in σ um μ).
	const regelBands = [
		{ k: 1, pct: '68 %', color: 'var(--color-amber-300)' },
		{ k: 2, pct: '95 %', color: 'var(--color-amber-200)' },
		{ k: 3, pct: '99,7 %', color: 'var(--color-amber-100)' }
	];

	function fmtTick(x: number): string {
		// Ganzzahlige σ-Schritte sehen im Datenmodus je nach μ/σ krumm aus; runden.
		const r = Math.round(x * 10) / 10;
		return Number.isInteger(r) ? String(r) : r.toFixed(1).replace('.', ',');
	}

	function fmtVal(x: number): string {
		if (zView) {
			const z = (x - mu) / sigma;
			const r = Math.round(z * 100) / 100;
			return `${r.toFixed(2).replace('.', ',')} σ`;
		}
		const r = Math.round(x * 100) / 100;
		return r.toFixed(2).replace('.', ',');
	}

	const probPct = $derived((prob * 100).toFixed(1).replace('.', ','));

	function reset() {
		mu = DEFAULTS.mu;
		sigma = DEFAULTS.sigma;
		a = DEFAULTS.a;
		b = DEFAULTS.b;
		zView = false;
		showRegel = false;
	}
</script>

<Widget
	title="Flächen-Schieber: Fläche = Wahrscheinlichkeit"
	hint="Zieh die Grenzen a und b und beobachte, wie die schattierte Fläche und P(a < X ≤ b) sich ändern. Mit μ und σ formst du die Kurve um."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Live-Anzeige der gesuchten Wahrscheinlichkeit -->
		<div class="bg-coral-50 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-2xl px-4 py-3">
			<span class="text-coral-700 font-semibold">P({fmtVal(aClamped)} &lt; X ≤ {fmtVal(bClamped)})</span>
			<span class="text-ink-faint text-sm">= F(b) − F(a) =</span>
			<span class="text-coral-700 text-2xl font-bold tabular-nums">{probPct} %</span>
		</div>

		<!-- Die Dichtekurve mit schattierter Fläche -->
		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Dichtekurve der Normalverteilung mit der schattierten Fläche zwischen a und b, die P(a < X ≤ b) = {probPct} % entspricht"
		>
			<!-- 68/95/99,7-Bänder (optional, hinter der Kurve) -->
			{#if showRegel}
				{#each regelBands as band (band.k)}
					<rect
						x={sx(mu - band.k * sigma)}
						y={PAD_T}
						width={sx(mu + band.k * sigma) - sx(mu - band.k * sigma)}
						height={plotH}
						fill={band.color}
						fill-opacity="0.35"
					/>
				{/each}
			{/if}

			<!-- Nulllinie / x-Achse -->
			<line x1={PAD_L} y1={baseY} x2={W - PAD_R} y2={baseY} stroke="var(--color-ink)" stroke-opacity="0.25" />

			<!-- Achsen-Ticks + Beschriftung -->
			{#each ticks as t (t.x)}
				<line x1={sx(t.x)} y1={baseY} x2={sx(t.x)} y2={baseY + 5} stroke="var(--color-ink)" stroke-opacity="0.3" />
				<text x={sx(t.x)} y={baseY + 20} text-anchor="middle" font-size="11" fill="var(--color-ink-faint)">
					{t.label}
				</text>
			{/each}

			<!-- Schattierte Fläche zwischen a und b -->
			{#if areaPath}
				<path d={areaPath} fill="var(--color-coral-400)" fill-opacity="0.55" />
			{/if}

			<!-- Die Dichtekurve selbst -->
			<polyline points={curvePoints} fill="none" stroke="var(--color-coral-600)" stroke-width="2.5" />

			<!-- Grenzlinien a und b -->
			<line x1={sx(aClamped)} y1={PAD_T} x2={sx(aClamped)} y2={baseY} stroke="var(--color-ink)" stroke-width="1.5" stroke-dasharray="4 3" />
			<line x1={sx(bClamped)} y1={PAD_T} x2={sx(bClamped)} y2={baseY} stroke="var(--color-ink)" stroke-width="1.5" stroke-dasharray="4 3" />
			<text x={sx(aClamped)} y={PAD_T - 4} text-anchor="middle" font-size="12" font-weight="600" fill="var(--color-ink)">a</text>
			<text x={sx(bClamped)} y={PAD_T - 4} text-anchor="middle" font-size="12" font-weight="600" fill="var(--color-ink)">b</text>

			<!-- μ-Markierung -->
			<text x={sx(mu)} y={baseY + 33} text-anchor="middle" font-size="11" fill="var(--color-ink-soft)">
				{zView ? 'μ (z = 0)' : 'μ'}
			</text>
		</svg>

		<p class="text-ink-faint text-xs">
			Die Höhe der Kurve ist <strong>keine</strong> Wahrscheinlichkeit — erst die
			<span class="text-coral-700 font-semibold">korallene Fläche</span> über dem Intervall ist eine.
			Sie wird über <code>pnorm</code> (die Verteilungsfunktion F) berechnet: F(b) − F(a).
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<!-- Grenzen a und b -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="fs-a" class="text-ink-soft mb-1 block text-sm font-semibold">
						untere Grenze a = {fmtVal(aClamped)}
					</label>
					<input
						id="fs-a"
						type="range"
						min={boundMin}
						max={boundMax}
						step={boundStep}
						bind:value={a}
						class="accent-coral-500 w-full"
					/>
				</div>
				<div>
					<label for="fs-b" class="text-ink-soft mb-1 block text-sm font-semibold">
						obere Grenze b = {fmtVal(bClamped)}
					</label>
					<input
						id="fs-b"
						type="range"
						min={boundMin}
						max={boundMax}
						step={boundStep}
						bind:value={b}
						class="accent-coral-500 w-full"
					/>
				</div>
			</div>

			<!-- μ und σ -->
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="fs-mu" class="text-ink-soft mb-1 block text-sm font-semibold">
						Mittelwert μ = {mu.toFixed(1).replace('.', ',')}
					</label>
					<input id="fs-mu" type="range" min={-MU_MAX} max={MU_MAX} step="0.1" bind:value={mu} class="accent-sage-500 w-full" />
					<div class="text-ink-faint flex justify-between text-xs"><span>verschiebt die Kurve</span></div>
				</div>
				<div>
					<label for="fs-sigma" class="text-ink-soft mb-1 block text-sm font-semibold">
						Standardabweichung σ = {sigma.toFixed(1).replace('.', ',')}
					</label>
					<input id="fs-sigma" type="range" min="0.4" max={SIGMA_MAX} step="0.1" bind:value={sigma} class="accent-sage-500 w-full" />
					<div class="text-ink-faint flex justify-between text-xs"><span>staucht / streckt die Kurve</span></div>
				</div>
			</div>

			<!-- Schalter -->
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<label class="text-ink-soft flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={zView} class="accent-coral-500" />
					in Standardabweichungen (z) anzeigen
				</label>
				<label class="text-ink-soft flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={showRegel} class="accent-amber-500" />
					68/95/99,7-Bereiche einblenden
				</label>
			</div>

			{#if zView}
				<p class="text-ink-faint text-xs">
					Im z-Modus ist die Achse in <strong>Standardabweichungen um μ</strong> beschriftet:
					Z = (X − μ)/σ. So sieht jede Normalverteilung gleich aus — das ist die Z-Transformation
					auf N(0, 1).
				</p>
			{/if}
		</div>
	{/snippet}
</Widget>
