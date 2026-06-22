<script lang="ts">
	import { base } from '$app/paths';
	import Katex from '$lib/Katex.svelte';
	import Button from '$lib/components/Button.svelte';
	import Card from '$lib/components/Card.svelte';
	import TrackNav from '$lib/components/TrackNav.svelte';

	// Erste freigeschaltete Lektion — Ziel des Haupt-CTA.
	const startHref = `${base}/lektion/stichprobenverteilung`;
</script>

<svelte:head>
	<title>DS2 Lernwebsite</title>
	<meta
		name="description"
		content="Statistik für Data Science 2 — Schritt für Schritt, ohne Panik."
	/>
</svelte:head>

<main class="mx-auto max-w-3xl px-6 py-16 md:py-24">
	<!-- Hero ---------------------------------------------------------------- -->
	<header class="flex flex-col items-start gap-6">
		<span
			class="bg-amber-100 text-amber-600 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide"
		>
			<span class="bg-coral-400 h-2 w-2 rounded-full"></span>
			Data Science 2 · Statistik
		</span>

		<h1 class="text-5xl leading-[1.05] font-semibold md:text-6xl">
			Statistik, die <em class="text-coral-500 not-italic">Klick</em> macht.
		</h1>

		<p class="text-ink-soft max-w-xl text-lg md:text-xl">
			Hier lernst du Statistik in deinem Tempo: mit Intuition zuerst, kleinen
			Schritten und interaktiven Beispielen. Du musst nichts auswendig können.
			Du schaffst das.
		</p>

		<div class="mt-2 flex flex-wrap items-center gap-3">
			<Button href={startHref} size="lg">Los geht&rsquo;s</Button>
			<Button href="#kapitel" variant="subtle" size="lg">
				Alle Lektionen
			</Button>
		</div>
	</header>

	<!-- Lektions-Index ------------------------------------------------------ -->
	<section id="kapitel" class="mt-[var(--spacing-section)] scroll-mt-12">
		<h2 class="text-3xl">Womit fangen wir an?</h2>
		<p class="text-ink-soft mt-2 max-w-xl">
			Die Lektionen bauen aufeinander auf, jede für sich verständlich. Am besten
			startest du mit der ersten freigeschalteten, der Rest ergibt sich.
		</p>

		<div class="bg-paper-raised shadow-soft mt-8 rounded-2xl p-6">
			<TrackNav />
		</div>

		<div class="mt-6">
			<Button href={startHref} size="lg">Erste Lektion öffnen</Button>
		</div>
	</section>

	<!-- Math styling showcase ----------------------------------------------- -->
	<section class="mt-[var(--spacing-section)]">
		<h2 class="text-3xl">Formeln, die nicht abschrecken</h2>
		<p class="text-ink-soft mt-2 max-w-xl">
			Mathe darf hier ruhig und lesbar sein. Der Standardfehler des Mittelwerts
			misst zum Beispiel, wie verlässlich ein Stichprobenmittel ist:
		</p>

		<Card class="mt-6" tone="coral">
			<p class="text-ink">
				Im Fließtext sieht eine Formel so aus:
				<Katex math={String.raw`SE = \dfrac{\sigma}{\sqrt{n}}`} />. Je größer
				die Stichprobe&nbsp;<Katex math={String.raw`n`} />, desto kleiner der
				Fehler.
			</p>

			<Katex math={String.raw`SE = \dfrac{\sigma}{\sqrt{n}}`} displayMode />

			<p class="text-ink-soft mt-3 text-sm">
				Keine Sorge, wenn das jetzt noch fremd wirkt — wir leiten jede Formel
				gemeinsam her.
			</p>
		</Card>
	</section>

	<!-- Design system swatch / primitive showcase --------------------------- -->
	<section id="designsystem" class="mt-[var(--spacing-section)] scroll-mt-12">
		<h2 class="text-3xl">Das Design-System</h2>
		<p class="text-ink-soft mt-2 max-w-xl">
			Warme Farben, weiche Ecken, klare Typografie — damit du dich beim Lernen
			wohlfühlst.
		</p>

		<Card class="mt-6" title="Buttons">
			<div class="flex flex-wrap items-center gap-3">
				<Button>Primär</Button>
				<Button variant="secondary">Sekundär</Button>
				<Button variant="subtle">Dezent</Button>
				<Button variant="ghost">Ghost</Button>
				<Button disabled>Deaktiviert</Button>
			</div>
			<div class="mt-4 flex flex-wrap items-center gap-3">
				<Button size="sm">Klein</Button>
				<Button size="md">Mittel</Button>
				<Button size="lg">Groß</Button>
			</div>
		</Card>

		<div class="mt-5">
			<h3 class="text-ink-faint mb-3 text-sm font-semibold tracking-wide uppercase">
				Farbpalette
			</h3>
			<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
				<div class="flex flex-col gap-1.5">
					<div class="bg-paper-raised ring-ink/10 h-14 rounded-2xl ring-1"></div>
					<span class="text-ink-faint text-xs">Paper</span>
				</div>
				<div class="flex flex-col gap-1.5">
					<div class="bg-coral-400 h-14 rounded-2xl shadow-soft"></div>
					<span class="text-ink-faint text-xs">Coral</span>
				</div>
				<div class="flex flex-col gap-1.5">
					<div class="bg-amber-300 h-14 rounded-2xl shadow-soft"></div>
					<span class="text-ink-faint text-xs">Amber</span>
				</div>
				<div class="flex flex-col gap-1.5">
					<div class="bg-sage-300 h-14 rounded-2xl shadow-soft"></div>
					<span class="text-ink-faint text-xs">Sage</span>
				</div>
				<div class="flex flex-col gap-1.5">
					<div class="bg-ink h-14 rounded-2xl shadow-soft"></div>
					<span class="text-ink-faint text-xs">Ink</span>
				</div>
				<div class="flex flex-col gap-1.5">
					<div class="bg-paper-sunk ring-ink/10 h-14 rounded-2xl ring-1"></div>
					<span class="text-ink-faint text-xs">Sunk</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Reassuring closing note --------------------------------------------- -->
	<section class="mt-[var(--spacing-section)]">
		<div
			class="from-coral-50 to-amber-50 ring-coral-100 rounded-3xl bg-gradient-to-br p-8 text-center ring-1 md:p-12"
		>
			<h2 class="text-coral-700 text-3xl">Bereit, anzufangen?</h2>
			<p class="text-ink-soft mx-auto mt-3 max-w-md">
				Du brauchst keinen Plan und keine Vorkenntnisse. Klick dich einfach ins
				erste Kapitel — der Rest ergibt sich.
			</p>
			<div class="mt-6 flex justify-center">
				<Button href={startHref} size="lg">Erste Lektion öffnen</Button>
			</div>
		</div>
	</section>
</main>
