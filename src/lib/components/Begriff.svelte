<script lang="ts">
	import type { Snippet } from 'svelte';
	import { lookup } from '$lib/glossary';

	type Props = {
		/** Schlüssel ins Glossar (Groß-/Kleinschreibung egal). */
		term: string;
		/** Optional abweichender Anzeigetext; sonst wird `term` angezeigt. */
		children?: Snippet;
	};

	let { term, children }: Props = $props();

	const entry = $derived(lookup(term));
	let open = $state(false);
	// SSR/hydration-stable unique id (see FormelZeigen for why not a counter).
	const popId = $props.id();

	function show() {
		open = true;
	}
	function hide() {
		open = false;
	}
	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') hide();
	}
</script>

{#if entry}
	<span
		class="relative inline-block"
		onmouseenter={show}
		onmouseleave={hide}
		onkeydown={onKeydown}
		role="presentation"
	>
		<button
			type="button"
			class="text-ink decoration-coral-300 hover:text-coral-700 focus-visible:text-coral-700 cursor-help border-0 bg-transparent p-0 font-medium underline decoration-dotted decoration-2 underline-offset-4"
			aria-describedby={open ? popId : undefined}
			onfocus={show}
			onblur={hide}
		>
			{#if children}{@render children()}{:else}{entry.term}{/if}
		</button>

		{#if open}
			<span
				id={popId}
				role="tooltip"
				class="border-ink/10 bg-paper-raised shadow-lifted text-ink-soft absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-xl border px-4 py-3 text-sm leading-relaxed"
			>
				<span class="text-ink mb-0.5 block font-semibold">{entry.term}</span>
				{entry.definition}
			</span>
		{/if}
	</span>
{:else}
	<!-- Unbekannter Begriff: einfach den Text ausgeben, kein Tooltip. -->
	{#if children}{@render children()}{:else}{term}{/if}
{/if}
