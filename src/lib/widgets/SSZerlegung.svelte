<script lang="ts">
	// --- Idee ------------------------------------------------------------------
	// Ein kleiner, wiederverwendbarer horizontaler Stapelbalken, der die
	// Gesamtstreuung (SS_total) in einen ERKLÄRTEN und einen UNERKLÄRTEN Anteil
	// zerlegt. Generisch gehalten, damit ihn sowohl die ANOVA (η² = SS_between /
	// SS_total) als auch die lineare Regression (R² = SS_explained / SS_total)
	// nutzen können — nur die Beschriftungen und das Symbol unterscheiden sich.

	type Props = {
		/** Erklärte Quadratsumme (ANOVA: zwischen den Gruppen; Regression: durch das Modell). */
		ssExplained: number;
		/** Unerklärte / residuale Quadratsumme (ANOVA: innerhalb; Regression: Residuum). */
		ssResidual: number;
		/** Beschriftung des erklärten Anteils. */
		explainedLabel?: string;
		/** Beschriftung des unerklärten Anteils. */
		residualLabel?: string;
		/** Symbol für den Anteil, z. B. "η²" (ANOVA) oder "R²" (Regression). */
		ratioSymbol?: string;
		/** Optionale Überschrift über dem Balken. */
		caption?: string;
	};

	let {
		ssExplained,
		ssResidual,
		explainedLabel = 'erklärt',
		residualLabel = 'unerklärt',
		ratioSymbol = 'η²',
		caption
	}: Props = $props();

	const ssTotal = $derived(Math.max(0, ssExplained) + Math.max(0, ssResidual));
	const ratio = $derived(ssTotal > 0 ? Math.max(0, ssExplained) / ssTotal : 0);
	const explainedPct = $derived(ratio * 100);
	const residualPct = $derived((1 - ratio) * 100);

	function fmt2(v: number): string {
		return Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '–';
	}
	function fmtPct(v: number): string {
		return Number.isFinite(v) ? v.toFixed(0) : '–';
	}
</script>

<div class="flex flex-col gap-2">
	{#if caption}
		<div class="text-ink-soft text-sm font-semibold">{caption}</div>
	{/if}

	<!-- Der Stapelbalken: erklärt (koralle) + unerklärt (gedämpft) -->
	<div
		class="border-ink/10 flex h-9 w-full overflow-hidden rounded-xl border"
		role="img"
		aria-label="{explainedLabel} {fmtPct(explainedPct)} Prozent, {residualLabel} {fmtPct(
			residualPct
		)} Prozent. {ratioSymbol} = {fmt2(ratio)}."
	>
		{#if explainedPct > 0}
			<div
				class="bg-coral-400 flex items-center justify-center overflow-hidden text-xs font-bold whitespace-nowrap text-white transition-all duration-200"
				style="width: {explainedPct}%"
			>
				{#if explainedPct >= 14}{fmtPct(explainedPct)} %{/if}
			</div>
		{/if}
		{#if residualPct > 0}
			<div
				class="bg-paper-sunk text-ink-soft flex items-center justify-center overflow-hidden text-xs font-semibold whitespace-nowrap transition-all duration-200"
				style="width: {residualPct}%"
			>
				{#if residualPct >= 14}{fmtPct(residualPct)} %{/if}
			</div>
		{/if}
	</div>

	<!-- Legende + Anteil -->
	<div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs">
		<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
			<span class="text-ink-soft flex items-center gap-1.5">
				<span class="bg-coral-400 inline-block h-3 w-3 rounded-sm" aria-hidden="true"></span>
				{explainedLabel} (SS = {fmt2(ssExplained)})
			</span>
			<span class="text-ink-soft flex items-center gap-1.5">
				<span class="bg-paper-sunk border-ink/15 inline-block h-3 w-3 rounded-sm border" aria-hidden="true"></span>
				{residualLabel} (SS = {fmt2(ssResidual)})
			</span>
		</div>
		<span class="text-coral-700 font-semibold tabular-nums">
			{ratioSymbol} = {fmt2(ratio)}
		</span>
	</div>
</div>
