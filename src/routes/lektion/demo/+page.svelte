<script lang="ts">
	// Throwaway demo route so the 3-track navigation can be verified visually.
	// Real lesson routes (/lektion/<slug>) are added by later tasks.
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Card from '$lib/components/Card.svelte';
	import Button from '$lib/components/Button.svelte';
	import { progress } from '$lib/stores/progress.svelte';

	// Pretend we're viewing the first lesson, so it highlights in the nav.
	const demoSlug = 'was-ist-statistik';
</script>

<svelte:head>
	<title>Demo · Lektions-Layout</title>
</svelte:head>

<LessonLayout slug={demoSlug}>
	<article class="prose-none flex flex-col gap-6">
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Demo · Layout-Vorschau
			</span>
			<h1 class="text-4xl">Lektions-Layout im Test</h1>
			<p class="text-ink-soft max-w-2xl text-lg">
				Diese Seite dient nur zur visuellen Kontrolle der Navigation: links die drei
				Lernpfade, oben die Fortschrittsanzeige und unten die Vor-/Zurück-Schaltflächen.
			</p>
		</header>

		<Card tone="coral" title="Fortschritt ausprobieren">
			<p class="text-ink-soft">
				Markiere ein paar Lektionen als erledigt und beobachte, wie sich die Punkte und der
				Zähler in der Seitenleiste ändern. (Der Zustand wird im Browser gespeichert.)
			</p>
			<div class="mt-4 flex flex-wrap gap-2">
				<Button size="sm" onclick={() => progress.toggle('was-ist-statistik')}>
					„Was ist Statistik?“ umschalten
				</Button>
				<Button size="sm" variant="subtle" onclick={() => progress.toggle('verteilungen')}>
					„Verteilungen“ umschalten
				</Button>
			</div>
		</Card>

		<Card title="Platzhalter-Inhalt">
			<p class="text-ink-soft">
				Hier stünde später der eigentliche Lektionstext mit Erklärungen, Grafiken und
				interaktiven Beispielen. Für die Vorschau reicht dieser Blindtext, damit die
				Spaltenbreite und der Abstand realistisch wirken.
			</p>
		</Card>
	</article>
</LessonLayout>
