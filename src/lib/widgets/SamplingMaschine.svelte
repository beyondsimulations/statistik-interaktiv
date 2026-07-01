<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import { mean, drawSample, makeRng, normalQuantile, POPULATIONS } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// Es gibt EIN festes, wahres μ (rote senkrechte Linie). Jede gezogene
	// Stichprobe (Umfang n, aus einer bekannten Normalverteilung mit bekanntem σ)
	// liefert ein x̄ und ein z-basiertes Konfidenzintervall
	//   x̄ ± z · σ/√n   mit z = normalQuantile(1 − α/2).
	// Jedes KI wird als waagerechte Linie gestapelt. KIs, die μ NICHT enthalten,
	// leuchten rot; die anderen sage/grün. Ein Zähler zeigt "Treffer: k von N",
	// der gegen das Konfidenzniveau (~95 %) konvergiert. Die μ-Linie bewegt sich
	// nie — die Intervalle tun es.
	//
	// Bewusste Vereinfachung (im Lektionstext genannt): σ ist hier BEKANNT, daher
	// das z-basierte KI (exakt und sauber). Bei unbekanntem σ käme die t-Verteilung.

	// Wahre Population: Normalverteilung mit bekanntem μ und σ aus stats.ts.
	const pop = POPULATIONS.normal;
	const mu = pop.mu; // festes, wahres μ (= 100)
	const sigma = pop.sigma; // bekanntes σ (= 15)

	// --- Bedienzustand ---------------------------------------------------------
	let n = $state(20); // Stichprobenumfang
	let niveau = $state<90 | 95 | 99>(95); // Konfidenzniveau in %

	type CI = { mean: number; lo: number; hi: number; hit: boolean };
	let intervals = $state<CI[]>([]);

	// Reseedbarer Zufallsstrom, damit "Zurücksetzen" einen neuen Lauf gibt.
	const INITIAL_SEED = 7;
	let seed = $state(INITIAL_SEED);
	let rng = makeRng(INITIAL_SEED);

	// z-Wert zum gewählten Niveau: z = Φ⁻¹(1 − α/2).
	const zCrit = $derived(normalQuantile(1 - (1 - niveau / 100) / 2));
	// Halbe Breite des KI: z · σ/√n (σ bekannt).
	const halfWidth = $derived(zCrit * (sigma / Math.sqrt(n)));

	// Treffer-Statistik.
	const total = $derived(intervals.length);
	const hits = $derived(intervals.filter((c) => c.hit).length);
	const hitPct = $derived(total > 0 ? (100 * hits) / total : 0);

	// --- Ziehen ----------------------------------------------------------------
	function makeOne(): CI {
		const sample = drawSample('normal', n, rng);
		const m = mean(sample);
		const hw = zCrit * (sigma / Math.sqrt(n));
		const lo = m - hw;
		const hi = m + hw;
		return { mean: m, lo, hi, hit: lo <= mu && mu <= hi };
	}

	function drawMany(count: number) {
		const added: CI[] = [];
		for (let i = 0; i < count; i++) added.push(makeOne());
		// Begrenzen, damit das SVG nicht unendlich wächst (FIFO der ältesten).
		const MAX = 200;
		const next = [...intervals, ...added];
		intervals = next.length > MAX ? next.slice(next.length - MAX) : next;
	}

	function resetCollected() {
		intervals = [];
	}

	function onNInput(e: Event) {
		n = Number((e.currentTarget as HTMLInputElement).value);
		resetCollected(); // KI-Breite hängt von n ab → Sammlung verwerfen
	}

	function setNiveau(v: 90 | 95 | 99) {
		if (v === niveau) return;
		niveau = v;
		resetCollected(); // KI-Breite hängt vom Niveau ab → Sammlung verwerfen
	}

	function reset() {
		seed += 1;
		rng = makeRng(seed);
		resetCollected();
	}

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const PAD_L = 20;
	const PAD_R = 20;
	const PAD_T = 28; // Platz für μ-Beschriftung
	const ROW_H = 7; // Höhe pro KI-Zeile
	const plotW = W - PAD_L - PAD_R;

	// Feste x-Achse um μ: μ ± 4σ/√(n_min) ist zu breit; wir nehmen μ ± 4σ/√n des
	// AKTUELLEN n, damit die Intervalle gut ausgefüllt sind. Da n die Sammlung
	// zurücksetzt, ist die Achse pro Lauf stabil.
	const axisHalf = $derived(Math.max(4 * (sigma / Math.sqrt(n)), halfWidth * 1.4));
	const axisLo = $derived(mu - axisHalf);
	const axisHi = $derived(mu + axisHalf);

	const sx = $derived.by(() => (x: number) => {
		const t = (x - axisLo) / (axisHi - axisLo);
		return PAD_L + Math.max(0, Math.min(1, t)) * plotW;
	});

	const svgH = $derived(PAD_T + Math.max(1, intervals.length) * ROW_H + 14);
	const muX = $derived(sx(mu));

	// Achsen-Ticks: μ−2σ/√n, μ−σ/√n, μ, μ+σ/√n, μ+2σ/√n (Vielfache des SE).
	const ticks = $derived.by(() => {
		const se = sigma / Math.sqrt(n);
		const out: { x: number; label: string }[] = [];
		for (let k = -3; k <= 3; k++) {
			const x = mu + k * se;
			if (x < axisLo || x > axisHi) continue;
			out.push({ x, label: k === 0 ? 'μ' : `${k > 0 ? '+' : '−'}${Math.abs(k)} SE` });
		}
		return out;
	});

	function fmt(v: number, d = 1): string {
		return v.toFixed(d).replace('.', ',');
	}
</script>

<Widget
	title="Sampling-Maschine: Was 95 % Konfidenz wirklich bedeuten"
	hint="Das wahre μ steht fest (rote Linie). Zieh Stichproben — jede liefert ein Intervall. Beobachte, wie ungefähr 95 % der Intervalle das feste μ einfangen. Nicht das μ wandert, sondern die Intervalle."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Gestapelte Konfidenzintervalle gegen das feste μ -->
		<svg
			viewBox="0 0 {W} {svgH}"
			class="block h-auto w-full"
			role="img"
			aria-label="Gestapelte Konfidenzintervalle gegen das feste wahre μ. {hits} von {total} Intervallen enthalten μ."
		>
			<!-- SE-Ticks und Achsenbeschriftung (oben) -->
			{#each ticks as t (t.x)}
				<line
					x1={sx(t.x)}
					y1={PAD_T - 6}
					x2={sx(t.x)}
					y2={svgH - 12}
					stroke="var(--color-ink)"
					stroke-opacity={t.label === 'μ' ? 0 : 0.08}
				/>
				<text
					x={sx(t.x)}
					y={svgH - 2}
					text-anchor="middle"
					font-size="10"
					fill="var(--color-ink-faint)"
				>
					{t.label}
				</text>
			{/each}

			<!-- Das feste, wahre μ: die rote senkrechte Linie, die sich NIE bewegt -->
			<line
				x1={muX}
				y1={PAD_T - 10}
				x2={muX}
				y2={svgH - 12}
				stroke="var(--color-coral-600)"
				stroke-width="2"
			/>
			<text
				x={muX}
				y={PAD_T - 14}
				text-anchor="middle"
				font-size="12"
				font-weight="700"
				fill="var(--color-coral-700)"
			>
				wahres μ = {fmt(mu, 0)}
			</text>

			<!-- Die gestapelten Intervalle -->
			{#each intervals as c, i (i)}
				{@const y = PAD_T + i * ROW_H + ROW_H / 2}
				{@const stroke = c.hit ? 'var(--color-sage-500)' : 'var(--color-coral-500)'}
				<line
					x1={sx(c.lo)}
					y1={y}
					x2={sx(c.hi)}
					y2={y}
					{stroke}
					stroke-width={c.hit ? 2 : 2.5}
					stroke-opacity={c.hit ? 0.7 : 1}
				/>
				<!-- Punktschätzer x̄ in der Mitte -->
				<circle cx={sx(c.mean)} cy={y} r="1.6" fill={stroke} />
			{/each}

			{#if intervals.length === 0}
				<text
					x={W / 2}
					y={PAD_T + 24}
					text-anchor="middle"
					font-size="12"
					fill="var(--color-ink-faint)"
				>
					Noch keine Stichprobe gezogen — klick unten auf „Stichprobe ziehen“.
				</text>
			{/if}
		</svg>

		<!-- Treffer-Zähler -->
		<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl bg-sage-100 px-4 py-3">
			<span class="text-sage-500 font-semibold">Treffer</span>
			<span class="text-ink text-2xl font-bold tabular-nums">
				{hits} von {total}
			</span>
			<span class="text-ink-soft tabular-nums">
				({total > 0 ? fmt(hitPct, 1) : '–'} %)
			</span>
			<span class="text-ink-faint text-sm">
				Ziel: {niveau} % · {total - hits} verfehlt
			</span>
		</div>

		<p class="text-ink-faint text-xs">
			Jede waagerechte Linie ist ein 95-%-KI (hier mit <strong>bekanntem σ</strong>, daher
			z-basiert: x̄ ± z·σ/√n). <span class="text-sage-500 font-semibold">Grüne</span> Intervalle
			enthalten das feste μ, <span class="text-coral-600 font-semibold">rote</span> verfehlen es.
			Der Trefferanteil pendelt sich beim Konfidenzniveau ein.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<!-- Konfidenzniveau -->
			<div>
				<div class="text-ink-soft mb-2 text-sm font-semibold">Konfidenzniveau</div>
				<div class="flex flex-wrap gap-2">
					{#each [90, 95, 99] as const as v (v)}
						<button
							type="button"
							class="rounded-xl border px-3 py-1.5 text-sm transition-colors {v === niveau
								? 'border-coral-300 bg-coral-50 text-coral-700 font-semibold'
								: 'border-ink/10 bg-paper-raised text-ink hover:border-coral-200 hover:bg-coral-50'}"
							aria-pressed={v === niveau}
							onclick={() => setNiveau(v)}
						>
							{v} %
						</button>
					{/each}
					<span class="text-ink-faint self-center text-xs">
						z = {fmt(zCrit, 2)} · KI-Breite ±{fmt(halfWidth, 1)}
					</span>
				</div>
			</div>

			<!-- n-Slider -->
			<div>
				<label for="sm-n" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang n = {n}
				</label>
				<input
					id="sm-n"
					type="range"
					min="5"
					max="100"
					step="1"
					value={n}
					oninput={onNInput}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>5</span>
					<span>100</span>
				</div>
			</div>

			<!-- Zieh-Buttons -->
			<div class="flex flex-wrap gap-2">
				<Button variant="primary" size="sm" onclick={() => drawMany(1)}>Stichprobe ziehen</Button>
				<Button variant="secondary" size="sm" onclick={() => drawMany(10)}>10 ziehen</Button>
				<Button variant="secondary" size="sm" onclick={() => drawMany(100)}>100 ziehen</Button>
			</div>
		</div>
	{/snippet}
</Widget>
