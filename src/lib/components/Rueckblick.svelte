<script lang="ts">
	import Selbsttest from './Selbsttest.svelte';
	import { recapForLesson } from './recap-fragen';

	let { slug }: { slug: string } = $props();
	const questions = $derived(recapForLesson(slug));
</script>

{#if questions.length > 0}
	<div class="mb-2">
		<p class="text-ink-faint mb-2 text-sm">Kurzer Rückblick auf die letzte Lektion:</p>
		<Selbsttest {questions} title="Weißt du noch?" />
	</div>
{/if}
