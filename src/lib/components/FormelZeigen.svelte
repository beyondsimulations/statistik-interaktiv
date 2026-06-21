<script lang="ts">
	import Katex from '$lib/Katex.svelte';
	import { useId } from '$lib/use-id';

	export type Symbol = {
		/** Das Symbol als TeX-Ausschnitt (inline gerendert), z. B. `\sigma`. */
		sym: string;
		/** Die alltagssprachliche Bedeutung. */
		bedeutung: string;
	};

	type Props = {
		/** Die Formel als TeX-String (wird im displayMode gerendert). */
		formula: string;
		/** Legende: jedes Symbol mit seiner Bedeutung. */
		symbols?: Symbol[];
	};

	let { formula, symbols = [] }: Props = $props();

	let open = $state(false);
	const panelId = useId('formel');
</script>

<div class="border-ink/10 bg-paper-raised shadow-soft my-5 overflow-hidden rounded-2xl border">
	<button
		type="button"
		class="hover:bg-coral-50 flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={() => (open = !open)}
	>
		<span class="text-coral-700 flex items-center gap-2 font-semibold">
			<span aria-hidden="true">∑</span>
			{open ? 'Formel verbergen' : 'Formel zeigen'}
		</span>
		<span
			class="text-ink-faint transition-transform duration-200"
			class:rotate-180={open}
			aria-hidden="true"
		>
			▾
		</span>
	</button>

	{#if open}
		<div id={panelId} class="border-ink/10 border-t px-5 py-4">
			<Katex math={formula} displayMode={true} />

			{#if symbols.length > 0}
				<dl class="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-[auto_1fr]">
					{#each symbols as { sym, bedeutung } (sym)}
						<dt class="text-ink font-medium sm:text-right">
							<Katex math={sym} />
						</dt>
						<dd class="text-ink-soft">{bedeutung}</dd>
					{/each}
				</dl>
			{/if}
		</div>
	{/if}
</div>
