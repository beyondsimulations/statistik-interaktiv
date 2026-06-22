<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { lessonsByTrack } from '$lib/lessons';
	import { progress } from '$lib/stores/progress.svelte';

	type Props = {
		/** Slug of the lesson currently being viewed (highlighted in the nav). */
		currentSlug?: string;
		class?: string;
	};

	let { currentSlug, class: extraClass = '' }: Props = $props();

	const groups = lessonsByTrack();

	// Fall back to the route's pathname so the current lesson is highlighted even
	// if no explicit slug is passed.
	const activeSlug = $derived(currentSlug ?? page.url.pathname.split('/').filter(Boolean).at(-1));

	// Lesson routes are added by later tasks and aren't in the typed route table
	// yet, so we build the href from the base path directly.
	function href(slug: string): string {
		return `${base}/lektion/${slug}`;
	}
</script>

<nav class="flex flex-col gap-6 {extraClass}" aria-label="Lektionen">
	{#each groups as group (group.id)}
		<div class="flex flex-col gap-2">
			<h3 class="text-ink-faint text-xs font-semibold tracking-wide uppercase">
				{group.label}
			</h3>
			<ul class="flex flex-col gap-0.5">
				{#each group.lessons as lesson (lesson.slug)}
					{@const isCurrent = lesson.slug === activeSlug}
					{@const isDone = progress.isComplete(lesson.slug)}
					<li>
						{#if lesson.status === 'live'}
							<a
								href={href(lesson.slug)}
								aria-current={isCurrent ? 'page' : undefined}
								class="group flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors duration-150 {isCurrent
									? 'bg-coral-50 text-coral-700 font-semibold'
									: 'text-ink-soft hover:bg-paper-sunk hover:text-ink'}"
							>
								<span
									class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold {isDone
										? 'bg-sage-300 text-white'
										: isCurrent
											? 'bg-coral-200 text-coral-700'
											: 'bg-paper-sunk text-ink-faint'}"
								>
									{#if isDone}
										<svg
											class="h-3 w-3"
											viewBox="0 0 12 12"
											fill="none"
											aria-hidden="true"
										>
											<path
												d="M2.5 6.5 5 9l4.5-5"
												stroke="currentColor"
												stroke-width="1.8"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else}
										{lesson.order}
									{/if}
								</span>
								<span class="leading-snug">{lesson.title}</span>
							</a>
						{:else}
							<div
								class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink-faint/70"
								aria-disabled="true"
							>
								<span
									class="bg-paper-sunk text-ink-faint/60 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
								>
									{lesson.order}
								</span>
								<span class="leading-snug">{lesson.title}</span>
								<span
									class="bg-paper-sunk text-ink-faint ml-auto shrink-0 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tracking-wide"
								>
									bald
								</span>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{/each}
</nav>
