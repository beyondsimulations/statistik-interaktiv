<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Tone = 'default' | 'coral' | 'amber' | 'sage';

	type Props = {
		/** Optional heading rendered above the body. Ignored if the `title` snippet is used. */
		title?: string;
		/** Accent tone for the left border + heading. */
		tone?: Tone;
		/** Adds a hover-lift interaction (use for clickable / linked cards). */
		interactive?: boolean;
		/** Tightens the inner padding. */
		compact?: boolean;
		/** Snippet for a richer title (overrides the `title` string prop). */
		titleSnippet?: Snippet;
		children: Snippet;
	} & HTMLAttributes<HTMLElement>;

	let {
		title,
		tone = 'default',
		interactive = false,
		compact = false,
		class: extraClass = '',
		titleSnippet,
		children,
		...rest
	}: Props = $props();

	const toneAccent: Record<Tone, string> = {
		default: 'border-l-ink/10',
		coral: 'border-l-coral-400',
		amber: 'border-l-amber-300',
		sage: 'border-l-sage-300'
	};

	const toneHeading: Record<Tone, string> = {
		default: 'text-ink',
		coral: 'text-coral-700',
		amber: 'text-amber-600',
		sage: 'text-sage-500'
	};

	const base =
		'relative rounded-2xl bg-paper-raised shadow-soft border-l-4 ' +
		'transition-all duration-200 ease-out';

	const interactiveCls =
		'hover:-translate-y-1 hover:shadow-lifted ' +
		'focus-within:-translate-y-1 focus-within:shadow-lifted';

	const cls = $derived(
		`${base} ${compact ? 'p-5' : 'p-7'} ${toneAccent[tone]} ` +
			`${interactive ? interactiveCls : ''} ${extraClass}`
	);
</script>

<section class={cls} {...rest}>
	{#if titleSnippet}
		<header class="mb-3 {toneHeading[tone]}">
			{@render titleSnippet()}
		</header>
	{:else if title}
		<h3 class="mb-3 text-xl {toneHeading[tone]}">{title}</h3>
	{/if}
	<div class="text-ink-soft leading-relaxed">
		{@render children()}
	</div>
</section>
