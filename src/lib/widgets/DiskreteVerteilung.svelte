<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Histogram from './Histogram.svelte';
	import { binomialPmf, poissonPmf } from '$lib/stats';

	type Modus = 'binomial' | 'poisson';

	let modus = $state<Modus>('binomial');

	// Binomial-Parameter.
	let n = $state(10);
	let p = $state(0.4);

	// Poisson-Parameter.
	let lambda = $state(3);

	// Die maximale k-Achse: bei Binomial fest 0…n, bei Poisson dynamisch bis
	// einige Standardabweichungen über λ (mindestens 12), damit der rechte
	// Schwanz sichtbar bleibt.
	const poissonMax = $derived(Math.max(12, Math.ceil(lambda + 4 * Math.sqrt(lambda))));
	const kMax = $derived(modus === 'binomial' ? n : poissonMax);

	// Ein Balken pro ganzzahligem k = 0 … kMax. Histogram erwartet
	// gleichbreite Bins über [min, max]; mit min = −0.5 und max = kMax + 0.5
	// landet jeder Balken mittig über seinem k.
	const bars = $derived.by(() => {
		const out: number[] = [];
		for (let k = 0; k <= kMax; k++) {
			out.push(modus === 'binomial' ? binomialPmf(k, n, p) : poissonPmf(k, lambda));
		}
		return out;
	});

	// Erwartungswert als Markierung.
	const erwartung = $derived(modus === 'binomial' ? n * p : lambda);

	function reset() {
		modus = 'binomial';
		n = 10;
		p = 0.4;
		lambda = 3;
	}
</script>

<Widget
	title="PMF-Erkunder: Binomial & Poisson"
	hint="Stell die Parameter ein und sieh, wie sich die Wahrscheinlichkeitsfunktion verändert."
	onReset={reset}
>
	<Histogram
		bins={bars}
		min={-0.5}
		max={kMax + 0.5}
		title={modus === 'binomial'
			? `Binomialverteilung B(${n}, ${p.toFixed(2)})`
			: `Poissonverteilung mit λ = ${lambda.toFixed(1)}`}
		xLabel={modus === 'binomial' ? 'Anzahl Erfolge k' : 'Anzahl Ereignisse k'}
		barColor="var(--color-coral-300)"
		markers={[{ x: erwartung, label: `E[X] = ${erwartung.toFixed(2)}`, color: 'var(--color-ink)' }]}
	/>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<!-- Verteilungs-Auswahl -->
			<div>
				<div class="text-ink-soft mb-2 text-sm font-semibold">Verteilung</div>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class="rounded-xl border px-3 py-1.5 text-sm transition-colors {modus === 'binomial'
							? 'border-coral-300 bg-coral-50 text-coral-700 font-semibold'
							: 'border-ink/10 bg-paper-raised text-ink hover:border-coral-200 hover:bg-coral-50'}"
						aria-pressed={modus === 'binomial'}
						onclick={() => (modus = 'binomial')}
					>
						Binomial
					</button>
					<button
						type="button"
						class="rounded-xl border px-3 py-1.5 text-sm transition-colors {modus === 'poisson'
							? 'border-coral-300 bg-coral-50 text-coral-700 font-semibold'
							: 'border-ink/10 bg-paper-raised text-ink hover:border-coral-200 hover:bg-coral-50'}"
						aria-pressed={modus === 'poisson'}
						onclick={() => (modus = 'poisson')}
					>
						Poisson
					</button>
				</div>
			</div>

			{#if modus === 'binomial'}
				<!-- n -->
				<div>
					<label for="n-slider" class="text-ink-soft mb-1 block text-sm font-semibold">
						Anzahl Versuche n = {n}
					</label>
					<input
						id="n-slider"
						type="range"
						min="1"
						max="40"
						step="1"
						bind:value={n}
						class="accent-coral-500 w-full"
					/>
					<div class="text-ink-faint flex justify-between text-xs">
						<span>1</span>
						<span>40</span>
					</div>
				</div>

				<!-- p -->
				<div>
					<label for="p-slider" class="text-ink-soft mb-1 block text-sm font-semibold">
						Erfolgswahrscheinlichkeit p = {p.toFixed(2)}
					</label>
					<input
						id="p-slider"
						type="range"
						min="0"
						max="1"
						step="0.01"
						bind:value={p}
						class="accent-coral-500 w-full"
					/>
					<div class="text-ink-faint flex justify-between text-xs">
						<span>0</span>
						<span>1</span>
					</div>
				</div>
			{:else}
				<!-- λ -->
				<div>
					<label for="lambda-slider" class="text-ink-soft mb-1 block text-sm font-semibold">
						Rate λ = {lambda.toFixed(1)}
					</label>
					<input
						id="lambda-slider"
						type="range"
						min="0.1"
						max="15"
						step="0.1"
						bind:value={lambda}
						class="accent-coral-500 w-full"
					/>
					<div class="text-ink-faint flex justify-between text-xs">
						<span>0,1</span>
						<span>15</span>
					</div>
				</div>
			{/if}
		</div>
	{/snippet}
</Widget>
