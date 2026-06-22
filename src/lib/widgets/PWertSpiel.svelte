<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import { drawSample, makeRng, welchTTest } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// Coverstory: Jedes „Experiment“ = wir messen erneut die Blattgröße von
	// Sonnen- vs. Schattenpflanzen. Gruppe A (Schatten) kommt aus N(100, 15);
	// Gruppe B (Sonne) aus N(100 + effekt, 15). Pro Experiment ziehen wir zwei
	// Stichproben (drawSample + makeRng), rechnen einen Welch-t-Test (welchTTest,
	// in stats.ts und unit-getestet) und schauen auf den zweiseitigen p-Wert:
	//   p > 0,05  → grün, „nicht signifikant“
	//   p ≤ 0,05  → rot,  „signifikant“
	// Schalter „In Wahrheit kein Unterschied“ setzt effekt = 0 (H0 wahr). Dann
	// kommen über viele Läufe TROTZDEM ~5 % als „signifikant“ heraus — genau α.
	// Das ist die Kernlektion: Signifikanz ≠ Wahrheit.

	const DEFAULTS = { effekt: 0, n: 12 };

	let effekt = $state(DEFAULTS.effekt); // wahrer Größenunterschied (mm) Sonne − Schatten
	let n = $state(DEFAULTS.n); // Stichprobenumfang je Gruppe
	let h0Wahr = $state(true); // „In Wahrheit kein Unterschied (H0 wahr)“

	// Wenn H0 wahr ist, wird der eingestellte Effekt ignoriert (true = 0).
	const trueEffect = $derived(h0Wahr ? 0 : effekt);

	const ALPHA = 0.05;
	const BASE_MEAN = 100; // mittlere Blattgröße Schatten (willkürliche Einheit)

	type Run = { p: number; t: number; signifikant: boolean };
	let runs = $state<Run[]>([]);
	let last = $state<Run | null>(null);

	const total = $derived(runs.length);
	const sig = $derived(runs.filter((r) => r.signifikant).length);
	const sigPct = $derived(total > 0 ? (100 * sig) / total : 0);

	const INITIAL_SEED = 42;
	let seed = $state(INITIAL_SEED);
	let rng = makeRng(INITIAL_SEED);

	function experiment(): Run {
		// drawSample('normal', …) zieht aus N(100, 15); für die Sonnen-Gruppe
		// addieren wir den wahren Effekt auf jede Messung.
		const schatten = drawSample('normal', n, rng);
		const sonne = drawSample('normal', n, rng).map((x) => x + trueEffect);
		const r = welchTTest(sonne, schatten);
		return { p: r.pTwoSided, t: r.t, signifikant: r.pTwoSided <= ALPHA };
	}

	function runMany(count: number) {
		const added: Run[] = [];
		for (let i = 0; i < count; i++) added.push(experiment());
		const MAX = 400;
		const next = [...runs, ...added];
		runs = next.length > MAX ? next.slice(next.length - MAX) : next;
		last = added[added.length - 1] ?? last;
	}

	function reset() {
		seed += 1;
		rng = makeRng(seed);
		runs = [];
		last = null;
	}

	function clearTally() {
		runs = [];
		last = null;
	}

	// Einstellungen ändern verwirft die alte Sammlung (sonst Äpfel + Birnen).
	function setH0(v: boolean) {
		if (v === h0Wahr) return;
		h0Wahr = v;
		clearTally();
	}
	function onEffektInput(e: Event) {
		effekt = Number((e.currentTarget as HTMLInputElement).value);
		clearTally();
	}
	function onNInput(e: Event) {
		n = Number((e.currentTarget as HTMLInputElement).value);
		clearTally();
	}

	function fmtP(p: number): string {
		if (p < 0.001) return '< 0,001';
		return p.toFixed(3).replace('.', ',');
	}
	function fmt1(v: number): string {
		return v.toFixed(1).replace('.', ',');
	}
</script>

<Widget
	title="p-Wert-Würfelspiel: Signifikanz ist nicht Wahrheit"
	hint="Jedes Experiment misst erneut die Blattgröße von Sonnen- vs. Schattenpflanzen. Lauf viele Experimente — und schau, wie oft der Zufall allein „signifikant“ ausspuckt."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Zähler -->
		<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-2xl bg-coral-50 px-4 py-3">
			<span class="text-coral-700 font-semibold">signifikant</span>
			<span class="text-ink text-2xl font-bold tabular-nums">{sig} von {total}</span>
			<span class="text-ink-soft tabular-nums">({total > 0 ? fmt1(sigPct) : '–'} %)</span>
			<span class="text-ink-faint text-sm">
				{#if h0Wahr}
					H0 ist wahr → Treffer sind reine Fehlalarme (≈ α = 5 %)
				{:else}
					wahrer Unterschied = {fmt1(effekt)} Einheiten
				{/if}
			</span>
		</div>

		<!-- Letztes Experiment -->
		{#if last}
			<div
				class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border px-4 py-3 {last.signifikant
					? 'border-coral-300 bg-coral-100/70'
					: 'border-sage-300 bg-sage-100'}"
				role="status"
			>
				<span class="text-xl" aria-hidden="true">{last.signifikant ? '⚠️' : '✓'}</span>
				<span class="text-ink font-semibold">
					{last.signifikant ? 'signifikant' : 'nicht signifikant'}
				</span>
				<span class="text-ink-soft tabular-nums">p = {fmtP(last.p)}</span>
				<span class="text-ink-faint tabular-nums text-sm">t = {fmt1(last.t)}</span>
				<span class="text-ink-faint text-sm">
					{last.signifikant ? '(p ≤ 0,05)' : '(p > 0,05)'}
				</span>
			</div>
		{/if}

		<!-- Punkteraster der Läufe -->
		{#if total > 0}
			<div class="flex flex-wrap gap-1" aria-hidden="true">
				{#each runs as r, i (i)}
					<span
						class="inline-block h-3 w-3 rounded-sm {r.signifikant
							? 'bg-coral-500'
							: 'bg-sage-300'}"
						title="p = {fmtP(r.p)}"
					></span>
				{/each}
			</div>
		{:else}
			<p class="text-ink-faint text-sm">
				Noch kein Experiment gelaufen — klick unten auf „1 Experiment“ oder „100 Experimente“.
			</p>
		{/if}

		<p class="text-ink-faint text-xs">
			<span class="text-sage-500 font-semibold">Grün</span> = nicht signifikant (p &gt; 0,05),
			<span class="text-coral-600 font-semibold">rot</span> = signifikant (p ≤ 0,05). Mit
			„H0 wahr“ gibt es in Wahrheit <strong>keinen</strong> Unterschied — und trotzdem fällt rund
			jedes zwanzigste Experiment „signifikant“ aus. Genau das ist der Fehler 1. Art mit α = 5 %.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-4">
			<!-- H0-Schalter -->
			<label class="text-ink-soft flex cursor-pointer items-center gap-2 text-sm font-semibold">
				<input type="checkbox" checked={h0Wahr} onchange={() => setH0(!h0Wahr)} class="accent-coral-500" />
				In Wahrheit kein Unterschied (H0 wahr)
			</label>

			<!-- Effekt-Slider (nur relevant, wenn H0 nicht wahr) -->
			<div class:opacity-40={h0Wahr}>
				<label for="ps-effekt" class="text-ink-soft mb-1 block text-sm font-semibold">
					Wahrer Unterschied (Sonne − Schatten) = {fmt1(effekt)} Einheiten
				</label>
				<input
					id="ps-effekt"
					type="range"
					min="0"
					max="20"
					step="0.5"
					value={effekt}
					oninput={onEffektInput}
					disabled={h0Wahr}
					class="accent-sage-500 w-full"
				/>
				<div class="text-ink-faint flex justify-between text-xs"><span>0</span><span>20</span></div>
			</div>

			<!-- n-Slider -->
			<div>
				<label for="ps-n" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang je Gruppe n = {n}
				</label>
				<input id="ps-n" type="range" min="4" max="60" step="1" value={n} oninput={onNInput} class="accent-coral-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>4</span><span>60</span></div>
			</div>

			<!-- Lauf-Buttons -->
			<div class="flex flex-wrap gap-2">
				<Button variant="primary" size="sm" onclick={() => runMany(1)}>1 Experiment</Button>
				<Button variant="secondary" size="sm" onclick={() => runMany(20)}>20 Experimente</Button>
				<Button variant="secondary" size="sm" onclick={() => runMany(100)}>100 Experimente</Button>
			</div>
		</div>
	{/snippet}
</Widget>
