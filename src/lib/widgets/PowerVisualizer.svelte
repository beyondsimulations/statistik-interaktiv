<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { normalCdf, normalQuantile } from '$lib/stats';
	import { makeLinearScale, bellCurvePath, bellAreaPath } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Zwei Glockenkurven auf der Skala der Teststatistik (z-Skala, SD = 1):
	//   • H0 (kein Größenunterschied zwischen Sonnen- und Schattenblättern) liegt
	//     bei 0.
	//   • HA (es GIBT einen echten Unterschied) liegt rechts davon, bei der
	//     Effektgröße in Standardfehlern.
	// Ein einseitiger Test (HA: Sonnenblätter größer) hat einen kritischen Wert
	//   c = Φ⁻¹(1 − α)  — die senkrechte Entscheidungslinie.
	//   α-Fläche  = rechter H0-Schwanz jenseits von c        = 1 − Φ(c) = α   (koralle, Fehler 1. Art)
	//   β-Fläche  = HA links von c (Effekt übersehen)         = Φ(c − δ)       (gedämpft, Fehler 2. Art)
	//   Power     = 1 − β = HA rechts von c                   = 1 − Φ(c − δ)
	// Alle Flächen über normalCdf / normalQuantile, nichts von Hand gerechnet.
	//
	// Die Effektgröße auf der z-Achse ist  δ = d · √(n/2):  d ist der biologische
	// Effekt pro Messung (in SD), und mit größerem n „schärfen“ sich beide Kurven
	// im Verhältnis zur Achse, also wandert δ nach rechts → mehr Power.

	const DEFAULTS = { d: 0.5, alpha: 0.05, n: 20 };

	let d = $state(DEFAULTS.d); // biologischer Effekt pro Messung (in SD): Cohen's d
	let alpha = $state(DEFAULTS.alpha); // Signifikanzniveau α (Fehler 1. Art)
	let n = $state(DEFAULTS.n); // Stichprobenumfang je Gruppe

	// Effektgröße in Standardfehlern (Lage des HA-Gipfels auf der z-Achse).
	const delta = $derived(d * Math.sqrt(n / 2));

	// Einseitiger kritischer Wert (Entscheidungslinie).
	const crit = $derived(normalQuantile(1 - alpha));

	// Die drei zentralen Größen — ausschließlich über normalCdf.
	const alphaArea = $derived(1 - normalCdf(crit, 0, 1)); // = α (rechter H0-Schwanz)
	const beta = $derived(normalCdf(crit, delta, 1)); // Fehler 2. Art
	const power = $derived(1 - beta); // Teststärke = 1 − β

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const H = 260;
	const PAD_L = 16;
	const PAD_R = 16;
	const PAD_T = 20;
	const PAD_B = 36;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;
	const baseY = PAD_T + plotH;

	// Slider-Grenzen als EINE Wahrheitsquelle: dieselben Consts speisen die Achsen-
	// Mathematik UND die max-Attribute der Regler. Weitet jemand einen Slider, wächst
	// die feste Achse strukturell mit — kein stilles Klippen mehr.
	const D_MAX = 1.5; // Effektgröße d (Cohen's d)
	const N_MAX = 120; // Stichprobenumfang je Gruppe

	// KONSTANTE z-Achse, die den GESAMTEN Reglerbereich abdeckt, damit der Rahmen
	// beim Ziehen steht und nur die HA-Kurve wandert. δ = d·√(n/2) wird maximal bei
	// D_MAX und N_MAX: δ_max = 1,5·√60 ≈ 11,62. Links reicht −3,5 (der H0-Schwanz,
	// links von 0 passiert nichts weiter), rechts δ_max + 3,5 für den HA-Schwanz bei
	// maximalem Effekt. Asymmetrisch, weil H0 fest bei 0 sitzt.
	const DELTA_MAX = D_MAX * Math.sqrt(N_MAX / 2); // ≈ 11,62 (D_MAX · √(N_MAX/2))
	const lo = -3.5;
	const hi = DELTA_MAX + 3.5; // ≈ 15,12

	const scaleX = $derived(makeLinearScale(lo, hi, PAD_L, PAD_L + plotW));
	const sx = $derived(scaleX.map);
	// sy bildet einen Höhen-Anteil (0..1, Gipfel = 1) auf SVG-y ab; peakFrac 0.9
	// hält die Gipfelhöhe wie zuvor. Wird für die H0/HA-Beschriftung gebraucht.
	const PEAK_FRAC = 0.9;
	const sy = $derived.by(() => (frac: number) => baseY - frac * plotH * PEAK_FRAC);

	const N_POINTS = 200;
	const h0Curve = $derived(
		bellCurvePath({ mu: 0, sigma: 1, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: N_POINTS }, sx)
	);
	const haCurve = $derived(
		bellCurvePath({ mu: delta, sigma: 1, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: N_POINTS }, sx)
	);

	// α-Fläche: H0 rechts von c. β-Fläche: HA links von c. Power: HA rechts von c.
	const AREA_POINTS = 120;
	const alphaPath = $derived(
		bellAreaPath({ mu: 0, sigma: 1, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: AREA_POINTS, x0: crit, x1: hi }, sx)
	);
	const betaPath = $derived(
		bellAreaPath({ mu: delta, sigma: 1, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: AREA_POINTS, x0: lo, x1: crit }, sx)
	);
	const powerPath = $derived(
		bellAreaPath({ mu: delta, sigma: 1, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: AREA_POINTS, x0: crit, x1: hi }, sx)
	);

	function pct(v: number): string {
		return (v * 100).toFixed(1).replace('.', ',');
	}
	function fmt2(v: number): string {
		return v.toFixed(2).replace('.', ',');
	}

	function reset() {
		d = DEFAULTS.d;
		alpha = DEFAULTS.alpha;
		n = DEFAULTS.n;
	}
</script>

<Widget
	title="Power-Visualisierer: α, β und die Teststärke"
	hint="Links die H0-Kurve (kein Unterschied zwischen Sonnen- und Schattenblättern), rechts die HA-Kurve (es gibt einen echten Unterschied). Verschieb die Entscheidungslinie mit α und sieh zu, wie α und β gegeneinander kippen."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Zwei Glockenkurven: H0 bei 0 und HA bei {fmt2(delta)} SE. α-Fläche {pct(
				alphaArea
			)} %, β-Fläche {pct(beta)} %, Power {pct(power)} %."
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

			<!-- β-Fläche (HA links von c): Fehler 2. Art, gedämpft -->
			{#if betaPath}
				<path d={betaPath} fill="var(--color-ink)" fill-opacity="0.14" />
			{/if}
			<!-- Power-Fläche (HA rechts von c): grün -->
			{#if powerPath}
				<path d={powerPath} fill="var(--color-sage-500)" fill-opacity="0.3" />
			{/if}
			<!-- α-Fläche (H0 rechts von c): Fehler 1. Art, koralle -->
			{#if alphaPath}
				<path d={alphaPath} fill="var(--color-coral-500)" fill-opacity="0.5" />
			{/if}

			<!-- Die beiden Kurven -->
			<polyline points={h0Curve} fill="none" stroke="var(--color-ink-soft)" stroke-width="2" />
			<polyline points={haCurve} fill="none" stroke="var(--color-sage-500)" stroke-width="2.5" />

			<!-- Entscheidungslinie (kritischer Wert c) -->
			<line
				x1={sx(crit)}
				y1={PAD_T - 6}
				x2={sx(crit)}
				y2={baseY}
				stroke="var(--color-coral-700)"
				stroke-width="2"
				stroke-dasharray="5 3"
			/>
			<text
				x={sx(crit)}
				y={PAD_T - 9}
				text-anchor="middle"
				font-size="11"
				font-weight="700"
				fill="var(--color-coral-700)"
			>
				Entscheidungslinie
			</text>

			<!-- Kurvenbeschriftung -->
			<text x={sx(0)} y={sy(1) - 6} text-anchor="middle" font-size="11" fill="var(--color-ink-soft)">
				H0
			</text>
			<text
				x={sx(delta)}
				y={sy(1) - 6}
				text-anchor="middle"
				font-size="11"
				font-weight="700"
				fill="var(--color-sage-500)"
			>
				HA
			</text>

			<!-- Achsen-Ticks: −3…3 plus Marken im HA-Bereich (5, 10, 15), damit auch
			     ein weit rechts liegender HA-Gipfel auf der Achse verortet ist. -->
			{#each [-3, -2, -1, 0, 1, 2, 3, 5, 10, 15] as k (k)}
				{#if k >= lo && k <= hi}
					<line
						x1={sx(k)}
						y1={baseY}
						x2={sx(k)}
						y2={baseY + 5}
						stroke="var(--color-ink)"
						stroke-opacity="0.3"
					/>
					<text
						x={sx(k)}
						y={baseY + 20}
						text-anchor="middle"
						font-size="11"
						fill="var(--color-ink-faint)"
					>
						{k}
					</text>
				{/if}
			{/each}

			<!-- Achsentitel -->
			<text
				x={W - PAD_R}
				y={baseY + 32}
				text-anchor="end"
				font-size="10"
				fill="var(--color-ink-faint)"
			>
				Teststatistik (in Standardfehlern) →
			</text>
		</svg>

		<!-- Live-Anzeige Power = 1 − β -->
		<div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<div class="bg-sage-100 flex items-baseline gap-2 rounded-2xl px-4 py-2">
				<span class="text-sage-500 font-semibold">Power = 1 − β</span>
				<span class="text-ink text-2xl font-bold tabular-nums">{pct(power)} %</span>
			</div>
			<div class="text-ink-soft flex items-baseline gap-2 text-sm tabular-nums">
				<span class="text-coral-700 font-semibold">α = {pct(alphaArea)} %</span>
				<span>·</span>
				<span>β = {pct(beta)} %</span>
				<span>·</span>
				<span>Effekt δ = {fmt2(delta)} SE</span>
				<span>·</span>
				<span>krit. Wert c = {fmt2(crit)}</span>
			</div>
		</div>

		<p class="text-ink-faint text-xs">
			<span class="text-coral-700 font-semibold">Koralle</span> = α (Fehler 1. Art: ein Unterschied
			„gefunden“, den es nicht gibt). <span class="font-semibold text-ink-soft">Grau</span> = β
			(Fehler 2. Art: echten Unterschied übersehen).
			<span class="text-sage-500 font-semibold">Grün</span> = Power = 1 − β. Mach α kleiner → die
			Linie wandert nach rechts, β wächst, die Power sinkt. Mehr n oder ein größerer Effekt schieben
			HA nach rechts → mehr Power.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<div>
				<label for="pv-d" class="text-ink-soft mb-1 block text-sm font-semibold">
					Effektgröße d = {fmt2(d)} <span class="text-ink-faint font-normal">(Größenunterschied der Blätter, in SD pro Messung)</span>
				</label>
				<input id="pv-d" type="range" min="0" max={D_MAX} step="0.05" bind:value={d} class="accent-sage-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>0 (kein Effekt)</span><span>großer Effekt</span></div>
			</div>

			<div>
				<label for="pv-alpha" class="text-ink-soft mb-1 block text-sm font-semibold">
					Signifikanzniveau α = {fmt2(alpha)}
				</label>
				<input id="pv-alpha" type="range" min="0.01" max="0.2" step="0.01" bind:value={alpha} class="accent-coral-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>0,01 (streng)</span><span>0,20 (locker)</span></div>
			</div>

			<div>
				<label for="pv-n" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang je Gruppe n = {n}
				</label>
				<input id="pv-n" type="range" min="3" max={N_MAX} step="1" bind:value={n} class="accent-sage-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>3</span><span>120</span></div>
			</div>
		</div>
	{/snippet}
</Widget>
