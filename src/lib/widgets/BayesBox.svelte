<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { positivePredictiveValue } from '$lib/stats';

	// --- Rendering-Ansatz ------------------------------------------------------
	// 10.000 Personen = ein 100×100-Raster. Jede Person ist ein SVG-<rect>.
	// 10.000 Rechtecke rendert der Browser problemlos flüssig, solange wir die
	// Zellen NICHT bei jeder Slider-Bewegung neu erzeugen: Wir bauen das Gitter
	// einmal (statische Positionen) und ändern nur noch die Füllfarbe pro Zelle.
	// Die vier Gruppen werden als zusammenhängende Blöcke (zeilenweise von oben)
	// eingefärbt, damit man die Größenverhältnisse als Flächen sofort sieht.

	const SIDE = 100; // 100×100
	const TOTAL = SIDE * SIDE; // 10.000 Personen
	const CELL = 6; // Pixel pro Zelle im viewBox
	const GAP = 0.6; // kleine Lücke für Gitteroptik

	// --- Startwerte: das dramatische Beispiel ----------------------------------
	// Prävalenz 0,5 %, Sensitivität 99 %, Spezifität 95 % → P(krank|positiv) ≈ 9 %.
	const DEFAULTS = { prevalence: 0.005, sensitivity: 0.99, specificity: 0.95 };

	let prevalence = $state(DEFAULTS.prevalence); // P(krank)
	let sensitivity = $state(DEFAULTS.sensitivity); // P(positiv | krank)
	let specificity = $state(DEFAULTS.specificity); // P(negativ | gesund)

	// --- Aufteilung der 10.000 Personen in vier Gruppen ------------------------
	// Wir runden so, dass die vier Zahlen exakt 10.000 ergeben.
	const counts = $derived.by(() => {
		const ill = Math.round(prevalence * TOTAL); // wirklich krank
		const healthy = TOTAL - ill; // wirklich gesund
		const truePos = Math.round(sensitivity * ill); // krank & positiv
		const falseNeg = ill - truePos; // krank & negativ
		const trueNeg = Math.round(specificity * healthy); // gesund & negativ
		const falsePos = healthy - trueNeg; // gesund & positiv
		return { truePos, falsePos, falseNeg, trueNeg, ill };
	});

	// P(krank | positiv) — die Schlagzeile, exakt aus dem Stats-Helper.
	const ppv = $derived(positivePredictiveValue(prevalence, sensitivity, specificity));
	const positiveTotal = $derived(counts.truePos + counts.falsePos);

	// --- Farbzuordnung pro Zelle ----------------------------------------------
	// Zeilenweise von oben: zuerst richtig-positiv, dann falsch-positiv,
	// dann falsch-negativ, dann richtig-negativ. So liegen die beiden
	// "positiv getestet"-Gruppen (Koralle) oben beieinander und sind als Block
	// gut mit der Gesamtfläche vergleichbar.
	type Group = 'truePos' | 'falsePos' | 'falseNeg' | 'trueNeg';

	const palette: Record<Group, string> = {
		truePos: 'var(--color-coral-600)', // positiv getestet & wirklich krank
		falsePos: 'var(--color-coral-200)', // positiv getestet, aber gesund (Fehlalarm)
		falseNeg: 'var(--color-sage-500)', // negativ getestet, aber krank (übersehen)
		trueNeg: 'var(--color-sage-100)' // negativ getestet & gesund
	};

	// Für jede der 10.000 Zellen die Gruppe. Wird nur neu berechnet, wenn sich
	// die counts ändern.
	const cellGroups = $derived.by(() => {
		const { truePos, falsePos, falseNeg } = counts;
		const out = new Uint8Array(TOTAL); // 0=tp 1=fp 2=fn 3=tn
		const tpEnd = truePos;
		const fpEnd = tpEnd + falsePos;
		const fnEnd = fpEnd + falseNeg;
		for (let i = 0; i < TOTAL; i++) {
			out[i] = i < tpEnd ? 0 : i < fpEnd ? 1 : i < fnEnd ? 2 : 3;
		}
		return out;
	});

	const GROUP_BY_CODE: Group[] = ['truePos', 'falsePos', 'falseNeg', 'trueNeg'];

	// Statische Zellpositionen (einmal berechnet).
	const cells = Array.from({ length: TOTAL }, (_, i) => ({
		x: (i % SIDE) * CELL,
		y: Math.floor(i / SIDE) * CELL
	}));

	const VIEW = SIDE * CELL;

	function reset() {
		prevalence = DEFAULTS.prevalence;
		sensitivity = DEFAULTS.sensitivity;
		specificity = DEFAULTS.specificity;
	}

	function pct(p: number, digits = 1): string {
		return (p * 100).toFixed(digits).replace('.', ',') + ' %';
	}
	function num(n: number): string {
		return n.toLocaleString('de-DE');
	}
</script>

<Widget
	title="Bayes-Box: 10.000 Personen, ein Test"
	hint="Stell die drei Regler ein und beobachte, wie sich die 10.000 Personen auf die vier Gruppen verteilen — und wie wenige der positiv Getesteten am Ende wirklich krank sind."
	onReset={reset}
>
	<div class="flex flex-col gap-5">
		<!-- Schlagzeile: P(krank | positiv) -->
		<div class="bg-coral-50 border-coral-200 rounded-2xl border px-5 py-4">
			<div class="text-coral-700 text-sm font-semibold">
				P(krank | positiv) — wie viele der positiv Getesteten sind wirklich krank?
			</div>
			<div class="text-coral-700 mt-1 text-5xl font-bold tabular-nums">
				{pct(ppv)}
			</div>
			<div class="text-ink-soft mt-1 text-sm">
				{num(counts.truePos)} wirklich Kranke von {num(positiveTotal)} positiv Getesteten.
			</div>
		</div>

		<!-- Das Raster: 10.000 Personen -->
		<div>
			<svg
				viewBox="0 0 {VIEW} {VIEW}"
				class="block h-auto w-full rounded-xl"
				role="img"
				aria-label="Raster aus 10.000 Personen, eingefärbt nach Testergebnis und tatsächlichem Krankheitsstatus"
			>
				{#each cells as cell, i (i)}
					<rect
						x={cell.x + GAP / 2}
						y={cell.y + GAP / 2}
						width={CELL - GAP}
						height={CELL - GAP}
						fill={palette[GROUP_BY_CODE[cellGroups[i]]]}
					/>
				{/each}
			</svg>
			<p class="text-ink-faint mt-2 text-xs">
				Jedes Kästchen ist eine Person (10.000 insgesamt). Oben liegen die positiv
				Getesteten (Koralle), unten die negativ Getesteten (Salbeigrün). Dunkel =
				wirklich krank, hell = wirklich gesund.
			</p>
		</div>

		<!-- Live-Zähler der vier Gruppen -->
		<div class="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
			<div class="bg-coral-600 rounded-xl px-3 py-2 text-white">
				<div class="text-xs opacity-90">Richtig-positiv</div>
				<div class="text-lg font-bold tabular-nums">{num(counts.truePos)}</div>
				<div class="text-xs opacity-90">krank &amp; positiv</div>
			</div>
			<div class="bg-coral-200 text-coral-700 rounded-xl px-3 py-2">
				<div class="text-xs">Falsch-positiv</div>
				<div class="text-lg font-bold tabular-nums">{num(counts.falsePos)}</div>
				<div class="text-xs">gesund &amp; positiv</div>
			</div>
			<div class="bg-sage-500 rounded-xl px-3 py-2 text-white">
				<div class="text-xs opacity-90">Falsch-negativ</div>
				<div class="text-lg font-bold tabular-nums">{num(counts.falseNeg)}</div>
				<div class="text-xs opacity-90">krank &amp; negativ</div>
			</div>
			<div class="bg-sage-100 text-sage-500 border-sage-300 rounded-xl border px-3 py-2">
				<div class="text-xs">Richtig-negativ</div>
				<div class="text-lg font-bold tabular-nums">{num(counts.trueNeg)}</div>
				<div class="text-xs">gesund &amp; negativ</div>
			</div>
		</div>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<div>
				<label for="bb-prev" class="text-ink-soft mb-1 block text-sm font-semibold">
					Prävalenz P(krank) = {pct(prevalence)}
				</label>
				<input
					id="bb-prev"
					type="range"
					min="0"
					max="0.5"
					step="0.001"
					bind:value={prevalence}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>0 %</span>
					<span>50 %</span>
				</div>
			</div>

			<div>
				<label for="bb-sens" class="text-ink-soft mb-1 block text-sm font-semibold">
					Sensitivität P(positiv | krank) = {pct(sensitivity)}
				</label>
				<input
					id="bb-sens"
					type="range"
					min="0.5"
					max="1"
					step="0.001"
					bind:value={sensitivity}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>50 %</span>
					<span>100 %</span>
				</div>
			</div>

			<div>
				<label for="bb-spec" class="text-ink-soft mb-1 block text-sm font-semibold">
					Spezifität P(negativ | gesund) = {pct(specificity)}
				</label>
				<input
					id="bb-spec"
					type="range"
					min="0.5"
					max="1"
					step="0.001"
					bind:value={specificity}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>50 %</span>
					<span>100 %</span>
				</div>
			</div>
		</div>
	{/snippet}
</Widget>
