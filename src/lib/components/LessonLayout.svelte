<script lang="ts">
	import type { Snippet } from 'svelte';
	import { base } from '$app/paths';
	import { getLesson, nextLesson, prevLesson, type Lesson } from '$lib/lessons';
	import { progress } from '$lib/stores/progress.svelte';
	import TrackNav from './TrackNav.svelte';
	import ProgressDots from './ProgressDots.svelte';
	import Button from './Button.svelte';

	type Props = {
		/** Slug of the lesson being rendered. Drives the title, footer and nav highlight. */
		slug: string;
		children: Snippet;
	};

	let { slug, children }: Props = $props();

	const lesson = $derived(getLesson(slug));
	const prev = $derived(prevLesson(slug));
	const next = $derived(nextLesson(slug));

	// Mobile sidebar drawer state.
	let drawerOpen = $state(false);

	// Lesson routes are added by later tasks and aren't in the typed route table
	// yet, so we build the href from the base path directly.
	function href(target: Lesson): string {
		return `${base}/lektion/${target.slug}`;
	}

	// A footer link is only usable if the target lesson actually has a page.
	const prevLive = $derived(prev?.status === 'live');
	const nextLive = $derived(next?.status === 'live');
</script>

{#snippet sidebar()}
	<div class="flex flex-col gap-6">
		<ProgressDots />
		<TrackNav currentSlug={slug} />
	</div>
{/snippet}

<div class="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 md:px-6 lg:py-10">
	<!-- Sidebar (desktop): sticky, scrollable -->
	<aside class="hidden w-72 shrink-0 lg:block">
		<div
			class="bg-paper-raised shadow-soft sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto rounded-2xl p-5"
		>
			{@render sidebar()}
		</div>
	</aside>

	<!-- Main content column -->
	<div class="min-w-0 flex-1">
		<!-- Mobile: toggle for the nav drawer -->
		<div class="mb-4 lg:hidden">
			<Button variant="subtle" size="sm" onclick={() => (drawerOpen = true)}>
				<svg class="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
					<path
						d="M2 4h12M2 8h12M2 12h12"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
					/>
				</svg>
				Lektionen
			</Button>
		</div>

		<main class="min-w-0">
			{@render children()}
		</main>

		<!-- Prev / next footer -->
		<nav
			class="border-ink/10 mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2"
			aria-label="Weitere Lektionen"
		>
			<div class="flex">
				{#if prev && prevLive}
					<a
						href={href(prev)}
						class="group bg-paper-raised shadow-soft hover:shadow-lifted flex w-full flex-col gap-1 rounded-2xl p-4 transition-all duration-200 hover:-translate-y-0.5"
					>
						<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">
							&larr; Vorherige
						</span>
						<span class="text-ink group-hover:text-coral-700 font-semibold">{prev.title}</span>
					</a>
				{:else if prev}
					<div
						class="bg-paper-sunk/60 text-ink-faint/70 flex w-full flex-col gap-1 rounded-2xl p-4"
						aria-disabled="true"
					>
						<span class="text-xs font-semibold tracking-wide uppercase">&larr; Vorherige</span>
						<span class="font-semibold">{prev.title} <span class="font-normal">(bald)</span></span>
					</div>
				{/if}
			</div>

			<div class="flex sm:justify-end">
				{#if next && nextLive}
					<a
						href={href(next)}
						class="group bg-paper-raised shadow-soft hover:shadow-lifted flex w-full flex-col gap-1 rounded-2xl p-4 text-right transition-all duration-200 hover:-translate-y-0.5"
					>
						<span class="text-ink-faint text-xs font-semibold tracking-wide uppercase">
							Nächste &rarr;
						</span>
						<span class="text-ink group-hover:text-coral-700 font-semibold">{next.title}</span>
					</a>
				{:else if next}
					<div
						class="bg-paper-sunk/60 text-ink-faint/70 flex w-full flex-col gap-1 rounded-2xl p-4 text-right"
						aria-disabled="true"
					>
						<span class="text-xs font-semibold tracking-wide uppercase">Nächste &rarr;</span>
						<span class="font-semibold">{next.title} <span class="font-normal">(bald)</span></span>
					</div>
				{/if}
			</div>
		</nav>

		{#if !lesson}
			<p class="text-ink-faint mt-6 text-sm">Unbekannte Lektion: {slug}</p>
		{/if}
	</div>
</div>

<!-- Mobile drawer -->
{#if drawerOpen}
	<div class="fixed inset-0 z-40 lg:hidden">
		<button
			class="absolute inset-0 bg-ink/30"
			aria-label="Navigation schließen"
			onclick={() => (drawerOpen = false)}
		></button>
		<div
			class="bg-paper-raised absolute top-0 bottom-0 left-0 w-80 max-w-[85vw] overflow-y-auto p-5 shadow-lifted"
		>
			<div class="mb-4 flex items-center justify-between">
				<span class="text-ink font-semibold">Lektionen</span>
				<Button variant="ghost" size="sm" onclick={() => (drawerOpen = false)}>Schließen</Button>
			</div>
			{@render sidebar()}
		</div>
	</div>
{/if}
