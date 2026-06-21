<script lang="ts">
	import { orderedLessons } from '$lib/lessons';
	import { progress } from '$lib/stores/progress.svelte';

	type Props = {
		/** Extra classes for the wrapper. */
		class?: string;
	};

	let { class: extraClass = '' }: Props = $props();

	const total = orderedLessons.length;
	const done = $derived(progress.completedCount);
</script>

<div class="flex flex-col gap-2 {extraClass}">
	<p class="text-ink-soft text-sm font-semibold">
		<span class="text-coral-600">{done}</span> von {total} erledigt
	</p>
	<div class="flex flex-wrap gap-1.5" aria-hidden="true">
		{#each orderedLessons as lesson (lesson.slug)}
			<span
				class="h-2 w-2 rounded-full transition-colors duration-200 {progress.isComplete(
					lesson.slug
				)
					? 'bg-coral-500'
					: 'bg-paper-sunk ring-1 ring-ink/10'}"
			></span>
		{/each}
	</div>
</div>
