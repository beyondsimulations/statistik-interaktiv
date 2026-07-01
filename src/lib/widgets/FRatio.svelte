<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import SSZerlegung from './SSZerlegung.svelte';
	import { oneWayAnova, makeRng, standardNormal, mean } from '$lib/stats';
	import { makeLinearScale, bellCurvePath } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Drei Käfigtypen, in denen wir die Größe (cm) von Lachsen (Salmo salar)
	// vergleichen. Zwei Regler steuern die Kernintuition des F-Verhältnisses:
	//   • Abstand der Gruppenmittel   (zwischen-Gruppen-Streuung) = SIGNAL
	//   • Streuung innerhalb der Gruppen (within, SD je Gruppe)   = RAUSCHEN
	// F = Varianz ZWISCHEN den Gruppen / Varianz INNERHALB der Gruppen.
	// Aha: Derselbe Mittelwert-Abstand ist signifikant, wenn die Streuung
	// innerhalb klein ist — und unbedeutend, wenn sie groß ist.
	//
	// Wir erzeugen je Gruppe deterministisch (fester Seed) n Werte um das
	// jeweilige Gruppenmittel mit SD = within. Die Punkte sind echte Daten, aus
	// denen oneWayAnova SS, F und p rechnet — Bild und Statistik passen zusammen.

	const N_PER_GROUP = 12; // Lachse je Käfigtyp
	const BASE = 60; // mittlere Größe (cm), Lage der mittleren Gruppe
	const DEFAULTS = { spacing: 8, within: 6 };

	// spacing = Abstand benachbarter Gruppenmittel (cm); within = SD je Gruppe.
	let spacing = $state(DEFAULTS.spacing);
	let within = $state(DEFAULTS.within);

	const CAGE_LABELS = ['Netzkäfig', 'Festkäfig', 'Tiefkäfig'];
	const SEEDS = [11, 22, 33];

	// Gruppenmittel symmetrisch um BASE: BASE−spacing, BASE, BASE+spacing.
	const groupMeans = $derived([BASE - spacing, BASE, BASE + spacing]);

	// Echte (deterministische) Gruppendaten: um das Gruppenmittel mit SD = within.
	// Wir zentrieren jede Gruppe exakt auf ihr Soll-Mittel, damit die optische
	// Lage (und der zwischen-Gruppen-Anteil) sauber dem Regler folgt.
	const groups = $derived.by(() => {
		return groupMeans.map((mu, gi) => {
			const rng = makeRng(SEEDS[gi]);
			const raw: number[] = [];
			for (let i = 0; i < N_PER_GROUP; i++) raw.push(standardNormal(rng));
			const m = mean(raw);
			// Zentrieren auf 0, dann auf within skalieren und um mu verschieben.
			return raw.map((z) => mu + (z - m) * within);
		});
	});

	const res = $derived(oneWayAnova(groups));
	const significant = $derived(Number.isFinite(res.p) && res.p < 0.05);

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const H = 230;
	const PAD_L = 16;
	const PAD_R = 16;
	const PAD_T = 18;
	const PAD_B = 40;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;
	const baseY = PAD_T + plotH;

	// Slider-Maxima (auch die max-Attribute der Regler weiter unten).
	const SPACING_MAX = 20; // Abstand der Gruppenmittel (cm)
	const WITHIN_MAX = 20; // Streuung innerhalb der Gruppen (SD, cm)

	// KONSTANTE cm-Achse — bewusst auf den STANDARD-Zustand gerahmt (nicht auf die
	// Slider-Extreme), damit die drei Kurven per Default den Rahmen gut füllen. Der
	// Rahmen bleibt beim Ziehen fest; bei sehr großer Streuung laufen die äußeren
	// Schwänze über den Rand hinaus — genau das zeigt, wie breit die Kurven werden.
	// Default spacing=8, within=6 → Spannweite spacing+3·within = 26 cm ⇒ füllt ~62 %.
	const AXIS_HALF_SPAN = 42; // cm
	const lo = BASE - AXIS_HALF_SPAN;
	const hi = BASE + AXIS_HALF_SPAN;
	const scaleX = $derived(makeLinearScale(lo, hi, PAD_L, PAD_L + plotW));
	const sx = $derived(scaleX.map);
	// sy bildet einen Höhen-Anteil (0..1, Gipfel = 1) auf die SVG-y-Achse ab;
	// peakFrac 0.8 hält die Gipfelhöhe wie zuvor (Gipfel ist σ-invariant).
	const PEAK_FRAC = 0.8;
	const sy = $derived.by(() => (frac: number) => baseY - frac * plotH * PEAK_FRAC);

	// Eine Glockenkurve je Gruppenmittel — aus dem Template gehoben, damit sie
	// nicht bei jedem reaktiven Render neu evaluiert wird.
	const groupCurves = $derived(
		groupMeans.map((mu) =>
			bellCurvePath(
				{ mu, sigma: within, xMin: lo, xMax: hi, baseY, plotH, peakFrac: PEAK_FRAC, nPoints: 120 },
				sx
			)
		)
	);

	const COLORS = ['var(--color-sage-500)', 'var(--color-coral-500)', 'var(--color-amber-400)'];

	// Jitter der echten Datenpunkte über der Achse (vertikaler Versatz fest pro
	// Punkt). Ebenfalls aus dem Template in ein $derived gehoben (reseedet den RNG
	// sonst bei jedem Render).
	const groupDots = $derived(
		groups.map((g, gi) => {
			const rng = makeRng(SEEDS[gi] + 500);
			return g.map((v) => ({ x: sx(v), y: baseY - (6 + rng() * 20) }));
		})
	);

	function fmt1(v: number): string {
		return Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : '–';
	}
	function fmt2(v: number): string {
		if (v === Infinity) return '∞';
		return Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '–';
	}
	function fmtP(p: number): string {
		if (!Number.isFinite(p)) return '–';
		if (p < 0.001) return '< 0,001';
		return p.toFixed(3).replace('.', ',');
	}

	function reset() {
		spacing = DEFAULTS.spacing;
		within = DEFAULTS.within;
	}
</script>

<Widget
	title="F-Verhältnis zum Anfassen: Signal zwischen, Rauschen innerhalb"
	hint="Drei Käfigtypen, Lachsgröße in cm. Schieb den Abstand der Gruppenmittel (Signal) und die Streuung innerhalb der Gruppen (Rauschen) — und sieh, wie F und p reagieren."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Drei Glockenkurven der Lachsgröße in drei Käfigtypen. F = {fmt2(
				res.F
			)}, p = {fmtP(res.p)}."
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

			<!-- Datenpunkte + Kurven je Gruppe -->
			{#each groupMeans as mu, gi (gi)}
				{#each groupDots[gi] as dot, i (i)}
					<circle cx={dot.x} cy={dot.y} r="2.5" fill={COLORS[gi]} fill-opacity="0.5" />
				{/each}
				<polyline points={groupCurves[gi]} fill="none" stroke={COLORS[gi]} stroke-width="2.5" />
				<line
					x1={sx(mu)}
					y1={sy(1)}
					x2={sx(mu)}
					y2={baseY}
					stroke={COLORS[gi]}
					stroke-width="1.5"
					stroke-dasharray="4 3"
				/>
				<text x={sx(mu)} y={baseY + 16} text-anchor="middle" font-size="10" fill={COLORS[gi]}>
					{CAGE_LABELS[gi]}
				</text>
			{/each}

			<!-- Achsenbeschriftung -->
			<text x={W - PAD_R} y={baseY + 32} text-anchor="end" font-size="10" fill="var(--color-ink-faint)">
				Größe (cm) →
			</text>
		</svg>

		<!-- Live-Anzeige F und p -->
		<div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {significant
					? 'bg-sage-100'
					: 'bg-paper-sunk'}"
			>
				<span class="text-ink-soft font-semibold">F = </span>
				<span class="text-ink text-2xl font-bold tabular-nums">{fmt2(res.F)}</span>
			</div>
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {significant
					? 'bg-sage-100 text-sage-500'
					: 'bg-coral-50 text-coral-700'}"
			>
				<span class="font-semibold">p = </span>
				<span class="text-2xl font-bold tabular-nums">{fmtP(res.p)}</span>
				<span class="text-sm font-semibold"
					>{significant ? '· signifikant' : '· nicht signifikant'}</span
				>
			</div>
			<div class="text-ink-soft flex items-baseline gap-2 text-sm tabular-nums">
				<span>MS<sub>zw.</sub> = {fmt1(res.msBetween)}</span>
				<span>·</span>
				<span>MS<sub>inn.</sub> = {fmt1(res.msWithin)}</span>
			</div>
		</div>

		<!-- SS-Zerlegung (zwischen vs. innerhalb) via die geteilte Komponente -->
		<SSZerlegung
			ssExplained={res.ssBetween}
			ssResidual={res.ssWithin}
			explainedLabel="zwischen den Gruppen"
			residualLabel="innerhalb der Gruppen"
			ratioSymbol="η²"
			caption="Varianzzerlegung: SS_total = SS_zwischen + SS_innerhalb"
		/>

		<p class="text-ink-faint text-xs leading-relaxed">
			Das <strong>F-Verhältnis</strong> teilt die Varianz <strong>zwischen</strong> den
			Gruppenmitteln durch die Varianz <strong>innerhalb</strong> der Gruppen. Schieb die
			<span class="text-ink-soft font-semibold">Streuung innerhalb</span> hoch → das Rauschen wächst,
			F schrumpft, p steigt (derselbe Abstand wird unbedeutend). Mehr
			<span class="text-ink-soft font-semibold">Abstand der Mittel</span> → F wächst, p sinkt.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<div>
				<label for="fr-spacing" class="text-ink-soft mb-1 block text-sm font-semibold">
					Abstand der Gruppenmittel = {fmt1(spacing)} cm
					<span class="text-ink-faint font-normal">(Signal, zwischen den Gruppen)</span>
				</label>
				<input
					id="fr-spacing"
					type="range"
					min="0"
					max={SPACING_MAX}
					step="0.5"
					bind:value={spacing}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>0 (alle gleich)</span><span>20 cm</span>
				</div>
			</div>

			<div>
				<label for="fr-within" class="text-ink-soft mb-1 block text-sm font-semibold">
					Streuung innerhalb der Gruppen = {fmt1(within)} cm
					<span class="text-ink-faint font-normal">(Rauschen, SD je Gruppe)</span>
				</label>
				<input
					id="fr-within"
					type="range"
					min="1"
					max={WITHIN_MAX}
					step="0.5"
					bind:value={within}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>1 (leise)</span><span>20 (laut)</span>
				</div>
			</div>
		</div>
	{/snippet}
</Widget>
