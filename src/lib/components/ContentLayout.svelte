<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		/** Frontmatter: main page heading. */
		title?: string;
		/** Frontmatter: short subtitle below the heading. */
		subtitle?: string;
		/** Frontmatter: ISO date string, shown as a small "Stand"-line. */
		date?: string;
		/** Page language ('de' default; English legal pages pass 'en'). */
		lang?: string;
		/** The rendered markdown content (mdsvex passes it as a snippet). */
		children: Snippet;
	};

	let { title, subtitle, date, lang = 'de', children }: Props = $props();

	const isDe = $derived(lang === 'de');
	const formattedDate = $derived(
		date
			? new Intl.DateTimeFormat(isDe ? 'de-DE' : 'en-GB', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
					// Format in UTC so the prerendered date can't shift a day on a
					// build machine in a negative-UTC timezone.
					timeZone: 'UTC'
				}).format(new Date(date))
			: ''
	);
	const dateLabel = $derived(isDe ? 'Stand: ' : 'Last updated: ');
	// Note: the <html lang> attribute is set per route in hooks.server.ts via the
	// %lang% placeholder (English legal pages → "en"); `lang` here drives the date.
</script>

<svelte:head>
	{#if title}
		<title>{title} · DS2 Lernwebsite</title>
	{/if}
	{#if subtitle}
		<meta name="description" content={subtitle} />
	{/if}
</svelte:head>

<main class="mx-auto max-w-2xl px-6 py-16 md:py-24">
	<article class="prose-content">
		<header class="mb-10">
			{#if title}
				<h1 class="text-4xl leading-[1.1] font-semibold md:text-5xl">{title}</h1>
			{/if}
			{#if subtitle}
				<p class="text-ink-soft mt-3 text-lg md:text-xl">{subtitle}</p>
			{/if}
			{#if formattedDate}
				<p class="text-ink-faint mt-4 text-sm">{dateLabel}{formattedDate}</p>
			{/if}
		</header>

		<div class="text-ink-soft">
			{@render children()}
		</div>
	</article>
</main>

<style>
	/* Manual prose styling (no @tailwindcss/typography). Targets the rendered
	   mdsvex markdown inside the article, hence :global on the content wrapper. */
	.prose-content :global(h2) {
		color: var(--color-ink);
		font-family: var(--font-display, 'Fraunces', serif);
		font-size: 1.75rem;
		line-height: 1.2;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 0.75rem;
	}

	.prose-content :global(h3) {
		color: var(--color-ink);
		font-family: var(--font-display, 'Fraunces', serif);
		font-size: 1.3rem;
		line-height: 1.25;
		font-weight: 600;
		margin-top: 1.75rem;
		margin-bottom: 0.5rem;
	}

	.prose-content :global(p) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		line-height: 1.75;
	}

	.prose-content :global(ul) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		padding-left: 1.25rem;
		list-style-type: disc;
	}

	.prose-content :global(ol) {
		margin-top: 1rem;
		margin-bottom: 1rem;
		padding-left: 1.25rem;
		list-style-type: decimal;
	}

	.prose-content :global(li) {
		margin-top: 0.4rem;
		margin-bottom: 0.4rem;
		line-height: 1.7;
	}

	.prose-content :global(li > ul),
	.prose-content :global(li > ol) {
		margin-top: 0.4rem;
		margin-bottom: 0.4rem;
	}

	.prose-content :global(a) {
		color: var(--color-coral-600, #c23f2a);
		text-decoration: underline;
		text-underline-offset: 2px;
		transition: color 150ms ease;
	}

	.prose-content :global(a:hover) {
		color: var(--color-coral-700, #9c3322);
	}

	.prose-content :global(strong) {
		color: var(--color-ink);
		font-weight: 600;
	}

	.prose-content :global(hr) {
		margin-top: 2rem;
		margin-bottom: 2rem;
		border: 0;
		border-top: 1px solid color-mix(in srgb, var(--color-ink) 10%, transparent);
	}

	.prose-content :global(code) {
		background: var(--color-paper-sunk, #f3ede6);
		border-radius: 0.375rem;
		padding: 0.1rem 0.35rem;
		font-size: 0.9em;
	}
</style>
