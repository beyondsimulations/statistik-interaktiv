<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { mean, welchTTest, makeRng, standardNormal } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// Die Pseudoreplikations-Falle zum Anfassen. Ein strukturierter biologischer
	// Datensatz: zwei Behandlungen (Kontrolle vs. Dünger), je `plants` ECHTE
	// Einheiten (Pflanzen), je Pflanze `leaves` SUBSAMPLES (Blätter).
	//
	// Modell pro Blatt:
	//   y = Behandlungseffekt + Pflanzeneffekt(zwischen) + Blattrauschen(innerhalb)
	// Der Pflanzeneffekt ist je Pflanze KONSTANT — genau das macht die Blätter
	// derselben Pflanze ABHÄNGIG (sie teilen denselben Pflanzen-Offset).
	//
	// Der Nutzer schaltet die Analysemethode um:
	//   (a) Naiv  — jedes Blatt zählt als unabhängiges Replikat (großes N, df↑)
	//   (b) Korrekt — ein Mittelwert pro Pflanze (kleines n, ehrliche df)
	// Beide Tests laufen über den GETESTETEN welchTTest aus $lib/stats; die
	// naive Methode liefert wegen der aufgeblähten Freiheitsgrade einen künstlich
	// kleinen p-Wert (Schein-Signifikanz), die korrekte oft gar keine.

	const DEFAULTS = {
		plants: 4, // echte Einheiten (Pflanzen) je Gruppe
		leaves: 8, // Subsamples (Blätter) je Pflanze
		effect: 6, // wahrer Behandlungseffekt (Dünger − Kontrolle), z. B. cm Blattlänge
		betweenSd: 5, // Streuung ZWISCHEN den Pflanzen (Pflanzeneffekt)
		withinSd: 4 // Streuung INNERHALB einer Pflanze (Blatt zu Blatt)
	};

	let plants = $state(DEFAULTS.plants);
	let leaves = $state(DEFAULTS.leaves);
	let effect = $state(DEFAULTS.effect);
	let betweenSd = $state(DEFAULTS.betweenSd);
	let withinSd = $state(DEFAULTS.withinSd);
	let method = $state<'naiv' | 'korrekt'>('naiv');

	const BASE = 30; // Bezugswert: mittlere Blattlänge der Kontrolle (cm)

	type Plant = { groupMean: number; leafValues: number[]; jitter: number[] };
	type Group = { name: string; mean: number; plants: Plant[] };

	// Deterministischer Datensatz (fester Seed → reproduzierbar, ruhige Anzeige).
	// Die horizontalen Jitter-Offsets der Blatt-Punkte werden HIER einmal mitberechnet
	// (abhängig nur von plants/leaves/effect/betweenSd/withinSd) — so wird der Jitter
	// nicht bei jedem Umschalten der Analysemethode neu ausgewürfelt.
	const data = $derived.by<Group[]>(() => {
		const rng = makeRng(20240621);
		const groupMeans = [BASE, BASE + effect]; // Kontrolle, Dünger
		const names = ['Kontrolle', 'Dünger'];
		return groupMeans.map((gm, gi) => {
			const ps: Plant[] = [];
			for (let p = 0; p < plants; p++) {
				// Pflanzeneffekt: konstanter Offset für ALLE Blätter dieser Pflanze.
				const plantOffset = betweenSd * standardNormal(rng);
				const center = gm + plantOffset;
				const leafValues: number[] = [];
				for (let l = 0; l < leaves; l++) {
					leafValues.push(center + withinSd * standardNormal(rng));
				}
				// Horizontaler Jitter je Blatt, einmal fest pro Pflanze gewürfelt
				// (Anteil der Spaltenbreite, ±0,25; Pixel-Skalierung im Template).
				const jitterRng = makeRng(1000 * (gi + 1) + p);
				const jitter = leafValues.map(() => (jitterRng() - 0.5) * 0.5);
				ps.push({ groupMean: mean(leafValues), leafValues, jitter });
			}
			return { name: names[gi], mean: gm, plants: ps };
		});
	});

	// --- Die beiden Analysen, beide über den getesteten welchTTest ------------
	// Naiv: alle Blätter als unabhängige Werte.
	const naivResult = $derived.by(() => {
		const a = data[0].plants.flatMap((p) => p.leafValues);
		const b = data[1].plants.flatMap((p) => p.leafValues);
		const res = welchTTest(a, b);
		return { ...res, n1: a.length, n2: b.length };
	});

	// Korrekt: ein Mittelwert pro Pflanze.
	const korrektResult = $derived.by(() => {
		const a = data[0].plants.map((p) => p.groupMean);
		const b = data[1].plants.map((p) => p.groupMean);
		const res = welchTTest(a, b);
		return { ...res, n1: a.length, n2: b.length };
	});

	const active = $derived(method === 'naiv' ? naivResult : korrektResult);
	const significant = $derived(Number.isFinite(active.pTwoSided) && active.pTwoSided < 0.05);

	// Schein-Signifikanz: naiv signifikant, korrekt aber nicht.
	const scheinSignifikanz = $derived(
		method === 'naiv' &&
			significant &&
			!(Number.isFinite(korrektResult.pTwoSided) && korrektResult.pTwoSided < 0.05)
	);

	function reset() {
		plants = DEFAULTS.plants;
		leaves = DEFAULTS.leaves;
		effect = DEFAULTS.effect;
		betweenSd = DEFAULTS.betweenSd;
		withinSd = DEFAULTS.withinSd;
		method = 'naiv';
	}

	// --- Formatierung ----------------------------------------------------------
	function fmt2(v: number): string {
		if (!Number.isFinite(v)) return '∞';
		return v.toFixed(2).replace('.', ',');
	}
	function fmt1(v: number): string {
		if (!Number.isFinite(v)) return '–';
		return v.toFixed(1).replace('.', ',');
	}
	function fmtP(p: number): string {
		if (!Number.isFinite(p)) return '–';
		if (p < 0.001) return '< 0,001';
		return p.toFixed(3).replace('.', ',');
	}

	// --- Visualisierung: Pflanzen als Gruppen von Blatt-Punkten ----------------
	// Wertebereich für die vertikale Skala (Blattlänge cm), grob fixiert.
	const Y_LO = 10;
	const Y_HI = 55;
	function dotY(v: number, h: number): number {
		const clamped = Math.max(Y_LO, Math.min(Y_HI, v));
		return h - ((clamped - Y_LO) / (Y_HI - Y_LO)) * h;
	}

	// Linker Achsen-Streifen (viewBox-Einheiten): reserviert Platz für die
	// y-Achse „Blattlänge (cm)" mit min/max-Tick. Die Punktspalten beginnen
	// erst rechts davon (reine Layout-Verschiebung, die Jitter-Werte bleiben).
	const AX = 26;
	const PLOT_W = 320 - AX;
	// y-Positionen des obersten (Y_HI) und untersten (Y_LO) Tick, konsistent
	// mit der Punkt-Skalierung dotY(v, 132) + 6.
	const yTop = dotY(Y_HI, 132) + 6; // = 6  (Y_HI cm)
	const yBottom = dotY(Y_LO, 132) + 6; // = 138 (Y_LO cm)
</script>

<Widget
	title="Pseudoreplikations-Falle: zählt jedes Blatt?"
	hint="Zwei Behandlungen, je ein paar Pflanzen (echte Einheiten), je Pflanze mehrere Blätter (Subsamples). Schalte zwischen „jedes Blatt zählt“ und „Mittelwert pro Pflanze“ um — und sieh, wie sich df, t und p ändern."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Methodenumschalter -->
		<div
			class="border-ink/10 bg-paper-sunk/60 inline-flex w-fit gap-1 rounded-xl border p-1"
			role="group"
			aria-label="Analysemethode"
		>
			<button
				type="button"
				class={[
					'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
					method === 'naiv' ? 'bg-coral-500 text-white shadow-soft' : 'text-ink-soft hover:bg-paper-raised'
				]}
				aria-pressed={method === 'naiv'}
				onclick={() => (method = 'naiv')}
			>
				Naiv: jedes Blatt zählt
			</button>
			<button
				type="button"
				class={[
					'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
					method === 'korrekt' ? 'bg-sage-500 text-white shadow-soft' : 'text-ink-soft hover:bg-paper-raised'
				]}
				aria-pressed={method === 'korrekt'}
				onclick={() => (method = 'korrekt')}
			>
				Korrekt: Mittelwert pro Pflanze
			</button>
		</div>

		<!-- Visualisierung: zwei Gruppen, je Pflanzen als Cluster von Blatt-Punkten -->
		<div class="grid gap-4 sm:grid-cols-2">
			{#each data as group, gi (group.name)}
				{@const color = gi === 0 ? 'var(--color-ink-soft)' : 'var(--color-coral-500)'}
				<div class="border-ink/10 bg-paper-sunk/40 rounded-xl border p-3">
					<div class="mb-1 flex items-baseline justify-between">
						<span class="text-ink font-semibold">{group.name}</span>
						<span class="text-ink-faint text-xs tabular-nums">
							{plants} Pflanzen · {leaves} Blätter
						</span>
					</div>
					<svg
						viewBox="0 0 320 150"
						class="block h-auto w-full"
						role="img"
						aria-label="{group.name}: {plants} Pflanzen mit je {leaves} Blättern. Die Blätter einer Pflanze stehen als Punktwolke beieinander. Die Höhe eines Punktes ist die Blattlänge in cm (unten {Y_LO}, oben {Y_HI})."
					>
						<!-- y-Achse: Blattlänge (cm) mit min/max-Tick -->
						<line x1={AX} y1={yTop} x2={AX} y2={yBottom} stroke="var(--color-ink)" stroke-opacity="0.25" />
						<line x1={AX - 3} y1={yTop} x2={AX} y2={yTop} stroke="var(--color-ink)" stroke-opacity="0.4" />
						<text x={AX - 5} y={yTop + 3} text-anchor="end" font-size="8" fill="var(--color-ink-faint)">
							{Y_HI}
						</text>
						<line x1={AX - 3} y1={yBottom} x2={AX} y2={yBottom} stroke="var(--color-ink)" stroke-opacity="0.4" />
						<text x={AX - 5} y={yBottom} text-anchor="end" font-size="8" fill="var(--color-ink-faint)">
							{Y_LO}
						</text>
						<text
							x={8}
							y={(yTop + yBottom) / 2}
							text-anchor="middle"
							font-size="8.5"
							fill="var(--color-ink-faint)"
							transform="rotate(-90 8 {(yTop + yBottom) / 2})"
						>
							Blattlänge (cm)
						</text>

						{#each group.plants as plant, pi (pi)}
							{@const colW = PLOT_W / plants}
							{@const cx = AX + colW * pi + colW / 2}
							<!-- Trennlinie zwischen Pflanzen -->
							{#if pi > 0}
								<line
									x1={AX + colW * pi}
									y1="6"
									x2={AX + colW * pi}
									y2="150"
									stroke="var(--color-ink)"
									stroke-opacity="0.06"
								/>
							{/if}
							<!-- Pflanzen-Mittelwertstrich -->
							<line
								x1={cx - colW * 0.32}
								y1={dotY(plant.groupMean, 132) + 6}
								x2={cx + colW * 0.32}
								y2={dotY(plant.groupMean, 132) + 6}
								stroke={color}
								stroke-width="2"
								stroke-opacity="0.55"
							/>
							<!-- Blatt-Punkte dieser Pflanze (leicht horizontal gejittert) -->
							{#each plant.leafValues as leaf, li (li)}
								{@const jx = plant.jitter[li] * colW}
								<circle
									cx={cx + jx}
									cy={dotY(leaf, 132) + 6}
									r="2.4"
									fill={color}
									fill-opacity="0.6"
								/>
							{/each}
							<!-- Pflanzen-Label -->
							<text
								x={cx}
								y="146"
								text-anchor="middle"
								font-size="8"
								fill="var(--color-ink-faint)"
							>
								P{pi + 1}
							</text>
						{/each}
					</svg>
				</div>
			{/each}
		</div>

		<!-- Live-Kennzahlen -->
		<div class="flex flex-wrap items-stretch gap-3">
			<div class="border-ink/10 bg-paper-sunk/50 flex flex-col rounded-2xl border px-4 py-2">
				<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">
					Replikationseinheit
				</span>
				<span class="text-ink font-semibold">
					{method === 'naiv' ? 'jedes Blatt' : 'jede Pflanze'}
				</span>
			</div>
			<div class="border-ink/10 bg-paper-sunk/50 flex flex-col rounded-2xl border px-4 py-2 tabular-nums">
				<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">n je Gruppe</span>
				<span class="text-ink text-xl font-bold">{active.n1}</span>
			</div>
			<div class="border-ink/10 bg-paper-sunk/50 flex flex-col rounded-2xl border px-4 py-2 tabular-nums">
				<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">Freiheitsgrade</span>
				<span class="text-ink text-xl font-bold">{fmt1(active.df)}</span>
			</div>
			<div class="border-ink/10 bg-paper-sunk/50 flex flex-col rounded-2xl border px-4 py-2 tabular-nums">
				<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">t-Wert</span>
				<span class="text-ink text-xl font-bold">{fmt2(active.t)}</span>
			</div>
			<div
				class={[
					'flex flex-col rounded-2xl px-4 py-2 tabular-nums',
					significant ? 'bg-coral-100 text-coral-700' : 'bg-sage-100 text-sage-500'
				]}
			>
				<span class="text-xs font-semibold tracking-wide uppercase">p-Wert</span>
				<span class="text-xl font-bold">{fmtP(active.pTwoSided)}</span>
			</div>
		</div>

		<!-- Verdikt -->
		<div
			class={[
				'rounded-xl border px-4 py-3 text-sm leading-relaxed',
				scheinSignifikanz
					? 'border-coral-300 bg-coral-100/70 text-coral-700'
					: significant
						? 'border-sage-300 bg-sage-100 text-sage-500'
						: 'border-ink/10 bg-paper-sunk/60 text-ink-soft'
			]}
			role="status"
		>
			{#if scheinSignifikanz}
				<strong>Schein-Signifikanz!</strong> Naiv ist p = {fmtP(active.pTwoSided)} (signifikant) — aber
				nur, weil die {naivResult.n1} Blätter je Gruppe die Freiheitsgrade künstlich aufblähen. Schalte
				auf <em>Mittelwert pro Pflanze</em>: mit ehrlichen {korrektResult.n1} Pflanzen je Gruppe ist
				p = {fmtP(korrektResult.pTwoSided)} — <strong>nicht</strong> signifikant.
			{:else if significant}
				<strong>Signifikant</strong> (p = {fmtP(active.pTwoSided)}). {method === 'korrekt'
					? 'Auch mit ehrlichen Freiheitsgraden hält der Effekt — hier ist das Signal stark genug.'
					: 'Aber prüfe gegen: Hält der Effekt auch bei „Mittelwert pro Pflanze“?'}
			{:else}
				<strong>Nicht signifikant</strong> (p = {fmtP(active.pTwoSided)}). {method === 'korrekt'
					? 'Mit der ehrlichen Replikationseinheit (Pflanze) reichen die Daten nicht aus.'
					: 'Selbst naiv kein Effekt — dann ist auch korrekt keiner zu erwarten.'}
			{/if}
		</div>

		<p class="text-ink-faint text-xs leading-relaxed">
			Jede <strong>Punktwolke</strong> ist eine Pflanze, jeder Punkt ein Blatt, der Strich der
			Pflanzenmittelwert. Die Blätter einer Pflanze klumpen zusammen — sie sind eben
			<strong>nicht unabhängig</strong>. Naiv tut der Test so, als wären alle {naivResult.n1} Blätter
			je Gruppe eigenständige Tiere; korrekt zählt nur, was wirklich unabhängig ist: die
			<strong>{korrektResult.n1} Pflanzen</strong>.
		</p>
	</div>

	{#snippet controls()}
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="prf-plants" class="text-ink-soft mb-1 block text-sm font-semibold">
					Pflanzen je Gruppe = {plants}
					<span class="text-ink-faint font-normal">(echte Einheiten)</span>
				</label>
				<input
					id="prf-plants"
					type="range"
					min="2"
					max="10"
					step="1"
					bind:value={plants}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>2</span><span>10</span></div>
			</div>

			<div>
				<label for="prf-leaves" class="text-ink-soft mb-1 block text-sm font-semibold">
					Blätter je Pflanze = {leaves}
					<span class="text-ink-faint font-normal">(Subsamples)</span>
				</label>
				<input
					id="prf-leaves"
					type="range"
					min="1"
					max="20"
					step="1"
					bind:value={leaves}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>1</span><span>20</span></div>
			</div>

			<div>
				<label for="prf-effect" class="text-ink-soft mb-1 block text-sm font-semibold">
					Behandlungseffekt = {fmt1(effect)} cm
					<span class="text-ink-faint font-normal">(Dünger − Kontrolle)</span>
				</label>
				<input
					id="prf-effect"
					type="range"
					min="0"
					max="20"
					step="0.5"
					bind:value={effect}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>0 (kein Effekt)</span><span>20</span>
				</div>
			</div>

			<div>
				<label for="prf-between" class="text-ink-soft mb-1 block text-sm font-semibold">
					Streuung ZWISCHEN Pflanzen σ = {fmt1(betweenSd)} cm
				</label>
				<input
					id="prf-between"
					type="range"
					min="0"
					max="15"
					step="0.5"
					bind:value={betweenSd}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>0 (Pflanzen gleich)</span><span>15</span>
				</div>
			</div>

			<div class="sm:col-span-2">
				<label for="prf-within" class="text-ink-soft mb-1 block text-sm font-semibold">
					Streuung INNERHALB einer Pflanze σ = {fmt1(withinSd)} cm
					<span class="text-ink-faint font-normal">(Blatt zu Blatt)</span>
				</label>
				<input
					id="prf-within"
					type="range"
					min="0.5"
					max="15"
					step="0.5"
					bind:value={withinSd}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>0,5 (eng)</span><span>15</span></div>
			</div>
		</div>
	{/snippet}
</Widget>
