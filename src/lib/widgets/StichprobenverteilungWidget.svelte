<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import Histogram from './Histogram.svelte';
	import {
		mean,
		sd,
		normalPdf,
		drawSample,
		makeRng,
		POPULATIONS,
		binCounts,
		type PopulationKind
	} from '$lib/stats';

	// --- Reproducible RNG -----------------------------------------------------
	// One stream for the static reference population (so it doesn't reshuffle on
	// every interaction) and a separate, reseedable stream for user draws.
	const POP_SEED = 20240621;
	const INITIAL_DRAW_SEED = 1;
	let drawSeed = $state(INITIAL_DRAW_SEED);
	let rng = makeRng(INITIAL_DRAW_SEED);

	// --- Selectable populations ----------------------------------------------
	const kinds: PopulationKind[] = ['normal', 'exponential', 'bimodal', 'uniform'];
	const kindLabels: Record<PopulationKind, string> = {
		normal: 'Normalverteilung',
		exponential: 'Rechtsschief (Exponential)',
		bimodal: 'Bimodal',
		uniform: 'Gleichförmig'
	};

	let kind = $state<PopulationKind>('normal');
	let n = $state(10);

	// Collected sample means — this is the sampling distribution that builds up.
	let means = $state<number[]>([]);
	// The most recently drawn sample (for the "one sample → one mean" strip).
	let currentSample = $state<number[]>([]);
	let currentMean = $state<number | null>(null);
	// Drives the drop animation of the newest mean. Each draw bumps `dropKey`; an
	// $effect below retriggers the CSS animation on a STABLE wrapper (no remount).
	let dropKey = $state(0);
	// TRUE while the drop animation plays; toggled on by the $effect, off on
	// animationend. Drives the `.dropped` class without remounting the Histogram.
	let dropping = $state(false);
	let lastDropKey = 0;

	$effect(() => {
		// React to dropKey changes only. Restart the animation by toggling the
		// class off and back on (a microtask gap lets the browser see the reset).
		if (dropKey !== lastDropKey) {
			lastDropKey = dropKey;
			if (dropKey > 0) {
				dropping = false;
				queueMicrotask(() => {
					dropping = true;
				});
			}
		}
	});

	// --- True population parameters (always from stats.ts) --------------------
	const pop = $derived(POPULATIONS[kind]);
	const mu = $derived(pop.mu);
	const sigma = $derived(pop.sigma);
	// Theoretical standard error of the mean for the current n.
	const theoreticalSE = $derived(sigma / Math.sqrt(n));

	// --- Reference population sample (large, redrawn only when kind changes) ---
	const POP_N = 5000;
	const popValues = $derived.by(() => {
		const r = makeRng(POP_SEED);
		return drawSample(kind, POP_N, r);
	});

	// X-domain for the population histogram: μ ± 4σ (exponential is one-sided).
	const popDomain = $derived.by((): [number, number] => {
		if (kind === 'exponential') return [0, mu + 5 * sigma];
		if (kind === 'uniform' && pop.range) return pop.range;
		return [mu - 4 * sigma, mu + 4 * sigma];
	});

	const POP_BINS = 36;
	const popCounts = $derived(binCounts(popValues, popDomain[0], popDomain[1], POP_BINS));

	// --- Sampling-distribution domain: zoomed around μ at scale of the SE ------
	// Use the THEORETICAL spread so the axis is stable as means accumulate and
	// so the "narrowing with larger n" is visible (the window shrinks with SE).
	const meansDomain = $derived.by((): [number, number] => {
		const half = Math.max(4 * theoreticalSE, 1e-6);
		return [mu - half, mu + half];
	});

	const MEAN_BINS = 30;
	const meanCounts = $derived(binCounts(means, meansDomain[0], meansDomain[1], MEAN_BINS));

	// Observed statistics of the collected means.
	const meanOfMeans = $derived(means.length > 0 ? mean(means) : null);
	const observedSD = $derived(means.length > 1 ? sd(means) : null);

	// Theoretical normal curve N(μ, SE) for the overlay (data units).
	const overlayCurve = $derived.by(() => {
		const m = mu;
		const se = theoreticalSE;
		return (xv: number) => normalPdf(xv, m, se);
	});
	const overlayPeak = $derived(normalPdf(mu, mu, theoreticalSE));

	// --- Drawing actions ------------------------------------------------------
	function drawOne() {
		const sample = drawSample(kind, n, rng);
		const m = mean(sample);
		currentSample = sample;
		currentMean = m;
		means = [...means, m];
		dropKey++;
	}

	function drawMany(count: number) {
		const added: number[] = [];
		for (let i = 0; i < count; i++) {
			added.push(mean(drawSample(kind, n, rng)));
		}
		// After a batch we show the aggregate, not one arbitrary leftover sample —
		// clear the single-sample strip so its mean line can't appear to contradict
		// the mean-of-means marker in the sampling-distribution zone.
		currentSample = [];
		currentMean = null;
		means = [...means, ...added];
		dropKey++;
	}

	// Changing population OR n invalidates the collected sampling distribution
	// (because SE = σ/√n depends on both). Reset it whenever either changes.
	function resetCollected() {
		means = [];
		currentSample = [];
		currentMean = null;
	}

	function changeKind(k: PopulationKind) {
		if (k === kind) return;
		kind = k;
		resetCollected();
	}

	function onNInput(e: Event) {
		const v = Number((e.currentTarget as HTMLInputElement).value);
		n = v;
		resetCollected();
	}

	function reset() {
		drawSeed += 1;
		rng = makeRng(drawSeed);
		resetCollected();
	}

	// --- Current-sample strip geometry ----------------------------------------
	const STRIP_W = 520;
	const STRIP_H = 64;
	const stripScale = $derived.by(() => {
		const [lo, hi] = popDomain;
		return (v: number) => {
			const t = (v - lo) / (hi - lo);
			return Math.max(0, Math.min(1, t)) * (STRIP_W - 16) + 8;
		};
	});

	function fmt(v: number | null, digits = 2): string {
		if (v === null || !Number.isFinite(v)) return '–';
		return v.toFixed(digits);
	}
</script>

<Widget
	title="Stichprobenverteilung & Zentraler Grenzwertsatz"
	hint="Zieh ein paar Stichproben und beobachte, wie sich aus vielen Mittelwerten eine Glocke formt. Erhöhe dann n und sieh, wie die Verteilung schmaler wird."
	onReset={reset}
>
	<div class="flex flex-col gap-6">
			<!-- ZONE 1: Grundgesamtheit -->
			<div>
				<div class="mb-1 flex items-baseline justify-between gap-3">
					<h4 class="text-ink font-semibold">1. Grundgesamtheit</h4>
					<p class="text-ink-faint text-sm">
						wahres μ = {fmt(mu, 1)}, σ = {fmt(sigma, 1)}
					</p>
				</div>
				<Histogram
					bins={popCounts}
					min={popDomain[0]}
					max={popDomain[1]}
					title="Histogramm der Grundgesamtheit ({kindLabels[kind]})"
					xLabel="Merkmalswert"
					barColor="var(--color-paper-sunk)"
					markers={[{ x: mu, label: 'μ', color: 'var(--color-ink-soft)' }]}
				/>
				<p class="text-ink-faint mt-1 text-xs">
					{POP_N.toLocaleString('de-DE')} Beobachtungen aus der gewählten Verteilung. Die gestrichelte
					Linie zeigt das wahre μ.
				</p>
			</div>

			<!-- ZONE 2: Aktuelle Stichprobe -->
			<div>
				<div class="mb-1 flex items-baseline justify-between gap-3">
					<h4 class="text-ink font-semibold">2. Aktuelle Stichprobe (n = {n})</h4>
					<p class="text-ink-faint text-sm">
						{#if currentMean !== null}
							Mittelwert dieser Stichprobe x̄ = {fmt(currentMean)}
						{:else}
							noch keine Stichprobe gezogen
						{/if}
					</p>
				</div>
				<svg
					viewBox="0 0 {STRIP_W} {STRIP_H}"
					class="block h-auto w-full"
					role="img"
					aria-label="Streifen mit den Einzelwerten der aktuellen Stichprobe und ihrem Mittelwert"
				>
					<line
						x1="8"
						y1={STRIP_H / 2}
						x2={STRIP_W - 8}
						y2={STRIP_H / 2}
						stroke="var(--color-ink)"
						stroke-opacity="0.15"
					/>
					{#each currentSample as v, i (i)}
						<circle
							cx={stripScale(v)}
							cy={STRIP_H / 2}
							r="4"
							fill="var(--color-amber-300)"
							fill-opacity="0.65"
						/>
					{/each}
					{#if currentMean !== null}
						<line
							x1={stripScale(currentMean)}
							y1="8"
							x2={stripScale(currentMean)}
							y2={STRIP_H - 8}
							stroke="var(--color-coral-500)"
							stroke-width="2.5"
						/>
						<text
							x={stripScale(currentMean)}
							y="6"
							text-anchor="middle"
							font-size="11"
							fill="var(--color-coral-600)"
						>
							x̄
						</text>
					{/if}
				</svg>
				<p class="text-ink-faint mt-1 text-xs">
					Jeder Punkt ist eine Beobachtung. Die rote Linie ist der Mittelwert dieser einen
					Stichprobe — genau dieser Wert wandert unten in die Verteilung.
				</p>
			</div>

			<!-- ZONE 3: Stichprobenverteilung der Mittelwerte -->
			<div>
				<div class="mb-1 flex items-baseline justify-between gap-3">
					<h4 class="text-ink font-semibold">3. Stichprobenverteilung der Mittelwerte</h4>
					<p class="text-ink-faint text-sm">{means.length} Stichproben gesammelt</p>
				</div>
				<!-- Stabiler Wrapper: das Histogramm bleibt montiert (keine ~40 SVG-Knoten
				     werden bei jeder Ziehung neu erzeugt); die „Drop“-Animation wird per
				     Klassen-Toggle ausgelöst und am animationend zurückgesetzt. -->
				<div class:dropped={dropping} onanimationend={() => (dropping = false)}>
					<Histogram
						bins={meanCounts}
						min={meansDomain[0]}
						max={meansDomain[1]}
						{overlayCurve}
						{overlayPeak}
						title="Histogramm der Stichprobenmittelwerte mit theoretischer Normalkurve N(μ, SE)"
						xLabel="Stichprobenmittelwert x̄"
						barColor="var(--color-sage-300)"
						markers={[
							{ x: mu, label: 'μ', color: 'var(--color-ink-soft)' },
							...(meanOfMeans !== null
								? [{ x: meanOfMeans, label: 'x̄̄', color: 'var(--color-coral-500)' }]
								: [])
						]}
					/>
				</div>
				<div class="text-ink-soft mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
					<div class="bg-paper-sunk/60 rounded-xl px-3 py-2">
						<div class="text-ink-faint text-xs">Anzahl Stichproben</div>
						<div class="text-ink font-semibold">{means.length}</div>
					</div>
					<div class="bg-paper-sunk/60 rounded-xl px-3 py-2">
						<div class="text-ink-faint text-xs">Beobachtete SD der Mittelwerte</div>
						<div class="text-ink font-semibold">{fmt(observedSD)}</div>
					</div>
					<div class="bg-coral-50 rounded-xl px-3 py-2">
						<div class="text-coral-700 text-xs">Theoretischer SE = σ/√n</div>
						<div class="text-coral-700 font-semibold">{fmt(theoreticalSE)}</div>
					</div>
				</div>
				<p class="text-ink-faint mt-2 text-xs">
					Die rote Kurve ist die theoretische Normalverteilung N(μ, SE). Je mehr Stichproben du
					ziehst, desto besser passt das Histogramm dazu — auch bei schiefen oder bimodalen
					Grundgesamtheiten. Das ist der Zentrale Grenzwertsatz. Beim Ändern von Verteilung oder n
					wird die Sammlung zurückgesetzt, weil SE = σ/√n davon abhängt.
				</p>
			</div>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<!-- Population selector -->
			<div>
				<div class="text-ink-soft mb-2 text-sm font-semibold">Grundgesamtheit</div>
				<div class="flex flex-wrap gap-2">
					{#each kinds as k (k)}
						<button
							type="button"
							class="rounded-xl border px-3 py-1.5 text-sm transition-colors {k === kind
								? 'border-coral-300 bg-coral-50 text-coral-700 font-semibold'
								: 'border-ink/10 bg-paper-raised text-ink hover:border-coral-200 hover:bg-coral-50'}"
							aria-pressed={k === kind}
							onclick={() => changeKind(k)}
						>
							{kindLabels[k]}
						</button>
					{/each}
				</div>
			</div>

			<!-- n slider -->
			<div>
				<label for="n-slider" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang n = {n}
				</label>
				<input
					id="n-slider"
					type="range"
					min="2"
					max="100"
					step="1"
					value={n}
					oninput={onNInput}
					class="accent-coral-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs">
					<span>2</span>
					<span>100</span>
				</div>
			</div>

			<!-- Draw buttons -->
			<div class="flex flex-wrap gap-2">
				<Button variant="primary" size="sm" onclick={drawOne}>Stichprobe ziehen</Button>
				<Button variant="secondary" size="sm" onclick={() => drawMany(100)}>×100 ziehen</Button>
			</div>
		</div>
	{/snippet}
</Widget>

<style>
	/* The freshest mean "drops" into the sampling-distribution histogram. */
	.dropped {
		animation: drop-in 0.35s ease-out;
	}
	@keyframes drop-in {
		from {
			transform: translateY(-8px);
			opacity: 0.4;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.dropped {
			animation: none;
		}
	}
</style>
