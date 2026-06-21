<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { welchTTest, makeRng, drawSample } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// FWER-Roulette: Wir vergleichen g Gruppen paarweise mit t-Tests — auf REIN
	// ZUFÄLLIGEN Daten aus EINER Grundgesamtheit (H0 wahr, es gibt KEINEN echten
	// Unterschied). Bei g Gruppen sind es c = g·(g−1)/2 Vergleiche. Wir simulieren
	// viele Runden und zählen, wie oft MINDESTENS EIN Vergleich fälschlich
	// "signifikant" wird (ein Fehlalarm). Diese empirische Fehlalarmrate klettert
	// mit c entlang der Kurve  1 − (1 − α)^c  nach oben (bei α = 0,05 und 5
	// Vergleichen schon ~23 %). Die Bonferroni-Korrektur (α/c) zieht sie sichtbar
	// zurück auf ~5 %.

	const ALPHA = 0.05;
	const N_PER_GROUP = 15; // Beobachtungen je Gruppe pro Runde
	const ROUNDS = 600; // Simulationsrunden je Knopfdruck

	let nGroups = $state(4); // Anzahl Gruppen g (3…8)
	let bonferroni = $state(false); // Bonferroni-Korrektur α/c an/aus
	let seedCounter = $state(0); // erhöht sich bei jedem "Neu würfeln"

	// Anzahl paarweiser Vergleiche c = g·(g−1)/2.
	const nComparisons = $derived((nGroups * (nGroups - 1)) / 2);

	// Theoretische familienweise Fehlerrate OHNE Korrektur: 1 − (1 − α)^c.
	function fwerTheory(c: number, alpha = ALPHA): number {
		return 1 - Math.pow(1 - alpha, c);
	}
	const theoryUncorrected = $derived(fwerTheory(nComparisons));

	// Empirische Fehlalarmrate aus der Simulation (deterministisch über seedCounter).
	const empirical = $derived.by(() => {
		const rng = makeRng(1000 + seedCounter * 7919 + nGroups * 101 + (bonferroni ? 1 : 0));
		const threshold = bonferroni ? ALPHA / nComparisons : ALPHA;
		let falseAlarms = 0;
		for (let r = 0; r < ROUNDS; r++) {
			// g Gruppen aus DERSELBEN Normalverteilung (H0 wahr).
			const samples: number[][] = [];
			for (let g = 0; g < nGroups; g++) samples.push(drawSample('normal', N_PER_GROUP, rng));
			let anySignificant = false;
			for (let a = 0; a < nGroups && !anySignificant; a++) {
				for (let b = a + 1; b < nGroups; b++) {
					if (welchTTest(samples[a], samples[b]).pTwoSided < threshold) {
						anySignificant = true;
						break;
					}
				}
			}
			if (anySignificant) falseAlarms += 1;
		}
		return falseAlarms / ROUNDS;
	});

	// --- Kurve 1 − (1 − α)^c über c (für die SVG-Linie) ------------------------
	const W = 560;
	const H = 240;
	const PAD_L = 44;
	const PAD_R = 16;
	const PAD_T = 16;
	const PAD_B = 36;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;

	const C_MAX = 28; // g = 8 → c = 28 Vergleiche
	const cToX = (c: number) => PAD_L + (c / C_MAX) * plotW;
	const rateToY = (p: number) => PAD_T + plotH - p * plotH; // 0…1 → unten…oben

	const theoryCurve = $derived.by(() => {
		const pts: string[] = [];
		for (let c = 0; c <= C_MAX; c += 0.5) {
			pts.push(`${cToX(c).toFixed(2)},${rateToY(fwerTheory(c)).toFixed(2)}`);
		}
		return pts.join(' ');
	});

	const alphaY = $derived(rateToY(ALPHA));

	function fmtPct(v: number): string {
		return Number.isFinite(v) ? (v * 100).toFixed(1).replace('.', ',') + ' %' : '–';
	}

	function reroll() {
		seedCounter += 1;
	}
	function reset() {
		nGroups = 4;
		bonferroni = false;
		seedCounter = 0;
	}
</script>

<Widget
	title="FWER-Roulette: wie der Fehlalarm mit vielen Vergleichen explodiert"
	hint="Vergleiche g Gruppen REIN ZUFÄLLIGER Daten (H0 wahr) paarweise mit t-Tests. Wie oft schlägt mindestens einer fälschlich an? Schalte die Bonferroni-Korrektur dazu."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Live-Kennzahlen -->
		<div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<div class="bg-paper-sunk flex items-baseline gap-2 rounded-2xl px-4 py-2">
				<span class="text-ink-soft font-semibold">c = </span>
				<span class="text-ink text-xl font-bold tabular-nums">{nComparisons}</span>
				<span class="text-ink-faint text-sm">Vergleiche</span>
			</div>
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {empirical > 0.1
					? 'bg-coral-50 text-coral-700'
					: 'bg-sage-100 text-sage-500'}"
			>
				<span class="font-semibold">Fehlalarm (empirisch) = </span>
				<span class="text-2xl font-bold tabular-nums">{fmtPct(empirical)}</span>
			</div>
			<div class="text-ink-soft flex items-baseline gap-2 text-sm tabular-nums">
				<span>Theorie 1 − (1 − α)<sup>c</sup> = {fmtPct(theoryUncorrected)}</span>
			</div>
		</div>

		<svg
			viewBox="0 0 {W} {H}"
			class="block h-auto w-full"
			role="img"
			aria-label="Familienweise Fehlerrate über der Anzahl Vergleiche: theoretische Kurve 1 − (1 − α)^c, der α = 5 %-Level und der aktuelle empirische Punkt bei c = {nComparisons} mit {fmtPct(
				empirical
			)}."
		>
			<!-- Achsen -->
			<line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="var(--color-ink)" stroke-opacity="0.25" />
			<line x1={PAD_L} y1={PAD_T + plotH} x2={W - PAD_R} y2={PAD_T + plotH} stroke="var(--color-ink)" stroke-opacity="0.25" />

			<!-- y-Gitter 0/25/50/75/100 % -->
			{#each [0, 0.25, 0.5, 0.75, 1] as gy (gy)}
				<line x1={PAD_L} y1={rateToY(gy)} x2={W - PAD_R} y2={rateToY(gy)} stroke="var(--color-ink)" stroke-opacity="0.06" />
				<text x={PAD_L - 6} y={rateToY(gy) + 3} text-anchor="end" font-size="9" fill="var(--color-ink-faint)">
					{gy * 100} %
				</text>
			{/each}

			<!-- α = 5 %-Linie -->
			<line x1={PAD_L} y1={alphaY} x2={W - PAD_R} y2={alphaY} stroke="var(--color-sage-500)" stroke-width="1.5" stroke-dasharray="5 3" />
			<text x={W - PAD_R} y={alphaY - 4} text-anchor="end" font-size="9.5" fill="var(--color-sage-500)">
				α = 5 % (gewünscht)
			</text>

			<!-- Theoriekurve 1 − (1 − α)^c -->
			<polyline points={theoryCurve} fill="none" stroke="var(--color-coral-500)" stroke-width="2.5" />

			<!-- Aktueller empirischer Punkt -->
			<line
				x1={cToX(nComparisons)}
				y1={PAD_T + plotH}
				x2={cToX(nComparisons)}
				y2={rateToY(empirical)}
				stroke="var(--color-ink-soft)"
				stroke-width="1"
				stroke-dasharray="3 3"
			/>
			<circle cx={cToX(nComparisons)} cy={rateToY(empirical)} r="6" fill="var(--color-amber-400)" stroke="white" stroke-width="2" />

			<!-- Achsentitel -->
			<text x={(PAD_L + W - PAD_R) / 2} y={H - 6} text-anchor="middle" font-size="10" fill="var(--color-ink-faint)">
				Anzahl paarweiser Vergleiche c →
			</text>
		</svg>

		<p class="text-ink-faint text-xs leading-relaxed">
			Der gelbe Punkt ist die <strong>gemessene</strong> Fehlalarmrate aus {ROUNDS} Runden, die
			korallene Kurve die <strong>Theorie 1 − (1 − α)<sup>c</sup></strong>. Ohne Korrektur klettert
			der Fehlalarm weit über die gewünschten 5 %. Schalte die
			<span class="text-ink-soft font-semibold">Bonferroni-Korrektur</span> (α/c) ein — der Punkt
			fällt zurück Richtung grüne 5 %-Linie.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<div>
				<label for="fwer-groups" class="text-ink-soft mb-1 block text-sm font-semibold">
					Anzahl Gruppen g = {nGroups}
					<span class="text-ink-faint font-normal">(→ c = {nComparisons} paarweise Vergleiche)</span>
				</label>
				<input
					id="fwer-groups"
					type="range"
					min="3"
					max="8"
					step="1"
					bind:value={nGroups}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>3</span><span>8</span></div>
			</div>

			<div class="flex flex-wrap items-center justify-between gap-3">
				<label class="text-ink-soft flex items-center gap-2 text-sm font-semibold">
					<input type="checkbox" bind:checked={bonferroni} class="accent-sage-500 h-4 w-4" />
					Bonferroni-Korrektur (Schwelle α/c)
				</label>
				<button
					type="button"
					onclick={reroll}
					class="bg-coral-100 text-coral-700 hover:bg-coral-200 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors"
				>
					🎲 Neu würfeln
				</button>
			</div>
		</div>
	{/snippet}
</Widget>
