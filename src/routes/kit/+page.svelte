<script lang="ts">
	import Callout from '$lib/components/Callout.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import RCode from '$lib/components/RCode.svelte';
	import Widget from '$lib/components/Widget.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	// Triviales interaktives Beispiel für den Widget-Rahmen.
	let n = $state(30);

	const fragen: Question[] = [
		{
			id: 'f1',
			prompt: 'Was beschreibt der Standardfehler?',
			kind: 'mc',
			options: [
				'Die Streuung der einzelnen Messwerte',
				'Wie stark der Mittelwert von Stichprobe zu Stichprobe schwankt',
				'Die Wahrscheinlichkeit der Nullhypothese'
			],
			correct: 1,
			explanation:
				'Der Standardfehler misst die Schwankung des Mittelwerts über viele Stichproben hinweg — er wird mit größerem n kleiner.'
		},
		{
			id: 'f2',
			prompt: 'Ein kleiner p-Wert beweist, dass die Nullhypothese falsch ist.',
			kind: 'tf',
			correct: false,
			explanation:
				'Ein kleiner p-Wert macht die Daten unter der Nullhypothese unwahrscheinlich — ein Beweis ist das aber nicht.'
		},
		{
			id: 'f3',
			prompt: 'Was ist eine Stichprobe?',
			kind: 'mc',
			options: [
				'Alle Fälle, über die du etwas aussagen willst',
				'Die Teilmenge, die du tatsächlich gemessen hast',
				'Der Durchschnitt deiner Daten'
			],
			correct: 1,
			explanation:
				'Die Stichprobe ist die gemessene Teilmenge der Grundgesamtheit — mit ihr arbeitest du konkret.'
		}
	];
</script>

<svelte:head>
	<title>Teaching-Kit — Komponenten</title>
</svelte:head>

<main class="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
	<header class="mb-10">
		<h1 class="text-ink mb-2 text-4xl">Teaching-Kit</h1>
		<p class="text-ink-soft text-lg">
			Eine Demo-Seite aller wiederverwendbaren Inhalts-Komponenten. Hier kannst du jede
			Variante visuell prüfen.
		</p>
	</header>

	<!-- Callouts ------------------------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">Hinweis-Boxen</h2>

		<Intuition>
			Stell dir den <Begriff term="Mittelwert">Mittelwert</Begriff> als Schwerpunkt vor: der
			Punkt, an dem deine Daten "in der Balance" liegen.
		</Intuition>

		<Analogie>
			Eine Stichprobe ist wie ein Löffel Suppe: Du musst nicht den ganzen Topf essen, um zu
			wissen, ob die Suppe gut gewürzt ist.
		</Analogie>

		<Merke>
			Der <Begriff term="Standardfehler">Standardfehler</Begriff> wird mit größerer
			Stichprobe kleiner — mehr Daten bedeuten ein stabileres Ergebnis.
		</Merke>

		<Callout variant="warnung">
			Ein kleiner <Begriff term="p-Wert">p-Wert</Begriff> ist kein Beweis. Er sagt nur, dass die
			Daten unter der <Begriff term="Nullhypothese">Nullhypothese</Begriff> überraschend wären.
		</Callout>

		<Callout variant="intuition" title="Eigener Titel">
			Hinweis-Boxen akzeptieren auch einen eigenen Titel statt des Standard-Labels.
		</Callout>
	</section>

	<!-- FormelZeigen --------------------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">Sanfte Formeln</h2>
		<p class="text-ink-soft mb-2">
			Der Standardfehler des Mittelwerts hängt von der Streuung und der Stichprobengröße ab:
		</p>
		<FormelZeigen
			formula={'SE = \\dfrac{\\sigma}{\\sqrt{n}}'}
			symbols={[
				{ sym: 'SE', bedeutung: 'Standardfehler des Mittelwerts' },
				{ sym: '\\sigma', bedeutung: 'Standardabweichung in der Grundgesamtheit' },
				{ sym: 'n', bedeutung: 'Anzahl der Beobachtungen in der Stichprobe' }
			]}
		/>
	</section>

	<!-- Begriff (im Fließtext) --------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">Begriffe im Text</h2>
		<p class="text-ink-soft">
			Mit einer <Begriff term="Stichprobe">Stichprobe</Begriff> schätzt du Eigenschaften der
			<Begriff term="Grundgesamtheit">Grundgesamtheit</Begriff>. Fahre mit der Maus über die
			unterstrichenen Begriffe oder fokussiere sie mit der Tastatur. Ein
			<Begriff term="UnbekannterBegriff">unbekannter Begriff</Begriff> wird einfach normal
			angezeigt.
		</p>
	</section>

	<!-- RCode ---------------------------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">R-Code</h2>
		<RCode
			code={`# Zwei Gruppen mit einem t-Test vergleichen
ergebnis <- t.test(gruppe_a, gruppe_b)
print(ergebnis)`}
			output={`	Welch Two Sample t-test

data:  gruppe_a and gruppe_b
t = 2.41, df = 57.3, p-value = 0.019
alternative hypothesis: true difference in means is not equal to 0
95 percent confidence interval:
 0.18  1.94
sample estimates:
mean of x mean of y
    5.62      4.56`}
			annotations={{
				't.test()': 'führt den t-Test durch und gibt ein Ergebnisobjekt zurück',
				'p-value': 'hier 0,019 — kleiner als das übliche Signifikanzniveau von 0,05'
			}}
		/>
	</section>

	<!-- Widget --------------------------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">Widget-Rahmen</h2>
		<Widget
			title="Stichprobengröße"
			hint="Verschiebe den Regler und beobachte den Wert."
			onReset={() => (n = 30)}
		>
			<div class="flex items-center justify-center py-6">
				<span class="text-coral-600 font-display text-5xl">n = {n}</span>
			</div>

			{#snippet controls()}
				<label class="flex items-center gap-3 text-sm">
					<span class="text-ink-soft w-24 font-medium">Stichprobe</span>
					<input
						type="range"
						min="2"
						max="200"
						bind:value={n}
						class="accent-coral-500 flex-1"
					/>
					<span class="text-ink-faint w-10 text-right tabular-nums">{n}</span>
				</label>
			{/snippet}
		</Widget>
	</section>

	<!-- Selbsttest ----------------------------------------------------------- -->
	<section class="mb-12">
		<h2 class="text-ink mb-4 text-2xl">Selbsttest</h2>
		<Selbsttest questions={fragen} />
	</section>
</main>
