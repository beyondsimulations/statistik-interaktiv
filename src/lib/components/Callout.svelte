<script lang="ts">
	import type { Snippet } from 'svelte';

	export type CalloutVariant = 'intuition' | 'analogie' | 'merke' | 'warnung';

	type Props = {
		/** Bestimmt Farbe, Symbol und Standard-Label. */
		variant?: CalloutVariant;
		/** Optionaler eigener Titel; ersetzt das Standard-Label. */
		title?: string;
		children: Snippet;
	};

	let { variant = 'intuition', title, children }: Props = $props();

	type Style = { label: string; icon: string; box: string; chip: string; heading: string };

	const styles: Record<CalloutVariant, Style> = {
		intuition: {
			label: 'Intuition',
			icon: '💡',
			box: 'border-coral-200 bg-coral-50',
			chip: 'bg-coral-100 text-coral-700',
			heading: 'text-coral-700'
		},
		analogie: {
			label: 'Analogie',
			icon: '🔗',
			box: 'border-sage-300/60 bg-sage-100',
			chip: 'bg-sage-300/30 text-sage-500',
			heading: 'text-sage-500'
		},
		merke: {
			label: 'Merke dir',
			icon: '📌',
			box: 'border-amber-200 bg-amber-50',
			chip: 'bg-amber-100 text-amber-600',
			heading: 'text-amber-600'
		},
		warnung: {
			label: 'Achtung',
			icon: '⚠️',
			box: 'border-coral-300 bg-coral-100/70',
			chip: 'bg-coral-200 text-coral-700',
			heading: 'text-coral-700'
		}
	};

	const s = $derived(styles[variant]);
	const label = $derived(title ?? s.label);
</script>

<aside class="rounded-2xl border {s.box} shadow-soft my-5 p-5">
	<div class="mb-2 flex items-center gap-2.5">
		<span
			class="inline-flex h-7 w-7 items-center justify-center rounded-full text-base {s.chip}"
			aria-hidden="true"
		>
			{s.icon}
		</span>
		<span class="text-sm font-bold tracking-wide uppercase {s.heading}">{label}</span>
	</div>
	<div class="text-ink-soft leading-relaxed">
		{@render children()}
	</div>
</aside>
