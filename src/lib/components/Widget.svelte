<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from './Button.svelte';

	type Props = {
		/** Titel in der Kopfzeile. */
		title: string;
		/** Optionaler Hinweis unter dem Titel. */
		hint?: string;
		/** Steuerelemente (Slider, Buttons …). */
		controls?: Snippet;
		/** Die Bühne / Leinwand des Widgets. */
		children: Snippet;
		/** Wenn gesetzt, erscheint ein "Zurücksetzen"-Button. */
		onReset?: () => void;
	};

	let { title, hint, controls, children, onReset }: Props = $props();
</script>

<section
	class="border-ink/10 bg-paper-raised shadow-soft my-6 overflow-hidden rounded-2xl border"
	aria-label={title}
>
	<header class="border-ink/10 flex items-start justify-between gap-4 border-b px-5 py-3">
		<div>
			<h3 class="text-ink text-lg">{title}</h3>
			{#if hint}
				<p class="text-ink-faint mt-0.5 text-sm">{hint}</p>
			{/if}
		</div>
		{#if onReset}
			<Button variant="subtle" size="sm" onclick={onReset}>Zurücksetzen</Button>
		{/if}
	</header>

	<!-- Bühne / Leinwand -->
	<div class="p-5">
		{@render children()}
	</div>

	{#if controls}
		<div class="border-ink/10 bg-paper-sunk/60 border-t px-5 py-4">
			{@render controls()}
		</div>
	{/if}
</section>
