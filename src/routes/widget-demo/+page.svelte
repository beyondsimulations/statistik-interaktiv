<script lang="ts">
	// Temporäre Demo-Route, damit das Widget im Browser geprüft werden kann.
	// Die echte Lektionsseite folgt in einer späteren Aufgabe.
	import StichprobenverteilungWidget from '$lib/widgets/StichprobenverteilungWidget.svelte';
</script>

<svelte:head>
	<title>Widget-Demo · Stichprobenverteilung</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-4 py-10">
	<h1 class="text-ink font-display mb-2 text-3xl">Widget-Demo</h1>
	<p class="text-ink-soft mb-6">
		Vorschau des Stichprobenverteilungs-Widgets (Zentraler Grenzwertsatz).
	</p>
	<StichprobenverteilungWidget />
</main>
