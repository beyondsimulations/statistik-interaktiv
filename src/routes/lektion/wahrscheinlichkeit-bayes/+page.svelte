<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import BayesBox from '$lib/widgets/BayesBox.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'wahrscheinlichkeit-bayes';

	// Wird true, sobald der Selbsttest vollständig beantwortet ist.
	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'wb-1',
			kind: 'mc',
			prompt:
				'Ein Test hat eine Sensitivität von 99 %. Was bedeutet diese Zahl genau?',
			options: [
				'P(positiv | krank) — von den Kranken werden 99 % positiv getestet.',
				'P(krank | positiv) — von den positiv Getesteten sind 99 % krank.',
				'P(krank) — 99 % der Bevölkerung sind krank.'
			],
			correct: 0,
			explanation:
				'Genau. Die Sensitivität ist P(positiv | krank): die Richtung "von der Krankheit zum Testergebnis". Die für Betroffene viel wichtigere Frage P(krank | positiv) ist die umgekehrte Richtung — und kann ganz anders ausfallen.'
		},
		{
			id: 'wb-2',
			kind: 'mc',
			prompt:
				'Eine Krankheit ist sehr selten (Prävalenz 0,5 %), der Test ist gut (Sensitivität 99 %, Spezifität 95 %). Warum ist ein positives Ergebnis trotzdem meist ein Fehlalarm?',
			options: [
				'Weil der Test eine zu niedrige Sensitivität hat.',
				'Weil es so viele Gesunde gibt, dass selbst 5 % falsch-positive unter ihnen die wenigen richtig-positiven Kranken zahlenmäßig erschlagen.',
				'Weil die Spezifität niemals eine Rolle spielt.'
			],
			correct: 1,
			explanation:
				'Richtig — das ist der Basisraten-Effekt. Bei 10.000 Personen sind nur etwa 50 krank (davon ~50 positiv), aber 9.950 gesund, von denen 5 % (~498) fälschlich positiv anschlagen. Die falsch-positiven übertreffen die richtig-positiven deutlich, also ist P(krank|positiv) klein (~9 %).'
		},
		{
			id: 'wb-3',
			kind: 'tf',
			prompt:
				'Eine hohe Sensitivität allein garantiert, dass ein positives Testergebnis mit hoher Wahrscheinlichkeit auch wirklich krank bedeutet.',
			correct: false,
			explanation:
				'Falsch. Der positive prädiktive Wert P(krank|positiv) hängt zusätzlich von der Prävalenz und der Spezifität ab. Bei einer seltenen Krankheit kann er trotz hoher Sensitivität sehr niedrig sein.'
		}
	];
</script>

<svelte:head>
	<title>Wahrscheinlichkeit & Bayes · DS2</title>
	<meta
		name="description"
		content="Von der Laplace-Wahrscheinlichkeit über die Rechenregeln bis zum Satz von Bayes — warum ein positiver Test bei seltenen Krankheiten oft ein Fehlalarm ist. Mit interaktiver Bayes-Box."
	/>
</svelte:head>

<LessonLayout {slug}>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Wahrscheinlichkeit
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Wahrscheinlichkeit & Bayes</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Wahrscheinlichkeit ist die Sprache, in der die ganze schließende Statistik
			spricht. In dieser Lektion legen wir die Bausteine: Was ein Zufallsexperiment
			ist, wie man Wahrscheinlichkeiten überhaupt bestimmt, mit welchen Regeln man
			rechnet — und am Ende der vielleicht überraschendste Satz der ganzen
			Statistik. Er erklärt, warum ein positiver medizinischer Test oft viel
			weniger bedeutet, als man denkt.
		</p>

		<!-- Grundbegriffe -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Grundbegriffe</h2>
		<p class="text-ink-soft leading-relaxed">
			Alles beginnt mit einem <Begriff term="Zufallsexperiment" />: einem Vorgang,
			dessen Ausgang ungewiss ist und den man sich beliebig oft wiederholt denken
			kann — ein Würfelwurf, ein Münzwurf, ein Bluttest. Alle möglichen Ergebnisse
			zusammen bilden den <Begriff term="Ergebnisraum" />. Beim Würfel ist das
			&#123;1, 2, 3, 4, 5, 6&#125;. Ein <Begriff term="Ereignis" /> ist dann
			einfach eine Teilmenge davon, also eine Aussage, die eintreten kann oder nicht
			— zum Beispiel „eine gerade Zahl würfeln“ = &#123;2, 4, 6&#125;.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Wahrscheinlichkeit" /> eines Ereignisses ist eine Zahl
			zwischen 0 und 1: 0 heißt unmöglich, 1 heißt sicher. Bleibt die Frage, woher
			diese Zahl kommt.
		</p>

		<!-- Laplace vs. empirisch ------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Woher kommt die Wahrscheinlichkeit?</h2>
		<p class="text-ink-soft leading-relaxed">
			Es gibt zwei klassische Wege. Wenn alle Ergebnisse gleich wahrscheinlich sind
			— wie beim fairen Würfel — nutzt du die
			<Begriff term="Laplace-Wahrscheinlichkeit" />: <strong>günstige durch
			mögliche</strong> Fälle. Für „gerade Zahl“ sind 3 von 6 Ergebnissen günstig,
			also ist die Wahrscheinlichkeit 3/6 = 0,5.
		</p>

		<FormelZeigen
			formula={String.raw`P(A) = \dfrac{\text{Anzahl günstiger Fälle}}{\text{Anzahl möglicher Fälle}}`}
			symbols={[
				{ sym: String.raw`P(A)`, bedeutung: 'Wahrscheinlichkeit des Ereignisses A.' },
				{
					sym: String.raw`\text{günstige}`,
					bedeutung: 'Wie viele Ergebnisse zum Ereignis A gehören.'
				},
				{
					sym: String.raw`\text{mögliche}`,
					bedeutung: 'Wie viele Ergebnisse es insgesamt gibt (alle gleich wahrscheinlich).'
				}
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Oft sind die Ergebnisse aber nicht gleich wahrscheinlich, oder du kennst die
			„wahre“ Wahrscheinlichkeit gar nicht — etwa ob eine Reißzwecke auf den Kopf
			oder auf die Seite fällt. Dann hilft die <strong>empirische
			Wahrscheinlichkeit</strong>: Du wiederholst das Experiment oft und nimmst die
			<Begriff term="relative Häufigkeit" /> (Treffer geteilt durch Versuche) als
			Schätzung. Je öfter du wirfst, desto näher liegt dieser Anteil an der wahren
			Wahrscheinlichkeit.
		</p>

		<Merke title="Zwei Wege zur Wahrscheinlichkeit">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Laplace:</strong> günstige/mögliche — nur bei gleich wahrscheinlichen
					Ergebnissen.
				</li>
				<li>
					<strong>Empirisch:</strong> relative Häufigkeit aus vielen Wiederholungen —
					immer möglich, wenn du das Experiment wiederholen kannst.
				</li>
			</ul>
		</Merke>

		<!-- Rechenregeln --------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die wichtigsten Rechenregeln</h2>
		<p class="text-ink-soft leading-relaxed">
			Mit drei Regeln kommst du erstaunlich weit. Du musst sie nicht auswendig
			lernen — wichtiger ist, dass du verstehst, <em>warum</em> sie so aussehen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Die <strong>Komplementregel</strong> ist die einfachste: Die
			Wahrscheinlichkeit, dass A <em>nicht</em> eintritt, ist eins minus die
			Wahrscheinlichkeit, dass es eintritt. Oft ist „nicht A“ viel leichter zu
			zählen als A selbst.
		</p>

		<FormelZeigen
			formula={String.raw`P(\bar{A}) = 1 - P(A)`}
			symbols={[
				{ sym: String.raw`P(A)`, bedeutung: 'Wahrscheinlichkeit, dass A eintritt.' },
				{
					sym: String.raw`P(\bar{A})`,
					bedeutung: 'Gegenwahrscheinlichkeit — dass A gerade nicht eintritt.'
				}
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Die <strong>Additionsregel</strong> beantwortet „A <em>oder</em> B“. Du
			addierst beide Wahrscheinlichkeiten, musst aber die Überschneidung wieder
			abziehen — sonst zählst du sie doppelt.
		</p>

		<FormelZeigen
			formula={String.raw`P(A \cup B) = P(A) + P(B) - P(A \cap B)`}
			symbols={[
				{ sym: String.raw`A \cup B`, bedeutung: 'A oder B (oder beide) treten ein.' },
				{ sym: String.raw`A \cap B`, bedeutung: 'A und B treten gleichzeitig ein (die Überschneidung).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Die <strong>Multiplikationsregel</strong> beantwortet „A <em>und</em> B“. Sind
			beide Ereignisse <strong>unabhängig</strong> — beeinflusst das eine das andere
			also nicht —, multiplizierst du ihre Wahrscheinlichkeiten einfach.
		</p>

		<FormelZeigen
			formula={String.raw`P(A \cap B) = P(A) \cdot P(B) \quad (\text{wenn unabhängig})`}
			symbols={[
				{ sym: String.raw`A \cap B`, bedeutung: 'A und B treten beide ein.' },
				{
					sym: String.raw`\text{unabhängig}`,
					bedeutung: 'Das Eintreten von A ändert nichts an der Wahrscheinlichkeit von B.'
				}
			]}
		/>

		<Analogie title="Zwei Münzwürfe">
			Zwei Mal hintereinander Kopf zu werfen: Jeder Wurf ist unabhängig vom anderen,
			beide haben P = 0,5. Also ist „zwei Mal Kopf“ = 0,5 · 0,5 = 0,25. Die Münze
			hat kein Gedächtnis — genau das meint Unabhängigkeit.
		</Analogie>

		<!-- Bedingte Wahrscheinlichkeit ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Bedingte Wahrscheinlichkeit</h2>
		<p class="text-ink-soft leading-relaxed">
			Spannend wird es, wenn Ereignisse <em>nicht</em> unabhängig sind. Dann ändert
			das Wissen über B die Wahrscheinlichkeit von A. Genau das beschreibt die
			<Begriff term="Bedingte Wahrscheinlichkeit" /> P(A|B), gelesen „A unter der
			Bedingung B“. Du schränkst die Welt auf die Fälle ein, in denen B eingetreten
			ist, und fragst, welcher Anteil davon auch A ist.
		</p>

		<FormelZeigen
			formula={String.raw`P(A \mid B) = \dfrac{P(A \cap B)}{P(B)}`}
			symbols={[
				{
					sym: String.raw`P(A \mid B)`,
					bedeutung: 'Wahrscheinlichkeit von A, wenn B bereits feststeht.'
				},
				{ sym: String.raw`P(A \cap B)`, bedeutung: 'Wahrscheinlichkeit, dass A und B beide eintreten.' },
				{ sym: String.raw`P(B)`, bedeutung: 'Wahrscheinlichkeit der Bedingung B (muss > 0 sein).' }
			]}
		/>

		<!-- Satz von Bayes ------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Der Satz von Bayes</h2>
		<p class="text-ink-soft leading-relaxed">
			Häufig kennst du eine bedingte Wahrscheinlichkeit in der einen Richtung,
			brauchst aber die andere. Ein Test sagt dir P(positiv | krank) — wie gut er
			Kranke erkennt. Dich interessiert aber P(krank | positiv) — bist <em>du</em>
			krank, jetzt wo dein Test positiv ist? Der <Begriff term="Satz von Bayes" />
			dreht genau diese Richtung um.
		</p>

		<FormelZeigen
			formula={String.raw`P(A \mid B) = \dfrac{P(B \mid A) \cdot P(A)}{P(B)}`}
			symbols={[
				{ sym: String.raw`P(A \mid B)`, bedeutung: 'Die gesuchte Richtung, z. B. P(krank | positiv).' },
				{ sym: String.raw`P(B \mid A)`, bedeutung: 'Die bekannte Richtung, z. B. P(positiv | krank) = Sensitivität.' },
				{ sym: String.raw`P(A)`, bedeutung: 'Die Grundwahrscheinlichkeit von A vor dem Test (z. B. die Prävalenz).' },
				{ sym: String.raw`P(B)`, bedeutung: 'Wie wahrscheinlich B insgesamt ist (z. B. überhaupt positiv getestet zu werden).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Wenden wir das auf einen medizinischen Test an. Drei Größen reichen aus:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>
				die <Begriff term="Prävalenz" /> P(krank) — wie verbreitet die Krankheit
				überhaupt ist,
			</li>
			<li>
				die <Begriff term="Sensitivität" /> P(positiv | krank) — wie zuverlässig
				der Test Kranke erkennt,
			</li>
			<li>
				die <Begriff term="Spezifität" /> P(negativ | gesund) — wie zuverlässig er
				Gesunde als gesund erkennt.
			</li>
		</ul>
		<p class="text-ink-soft leading-relaxed">
			Daraus berechnet Bayes den <Begriff term="Positiver prädiktiver Wert">positiven
			prädiktiven Wert</Begriff> P(krank | positiv) — die Zahl, die dich als
			Betroffenen wirklich interessiert.
		</p>

		<!-- DER zentrale Aha-Moment ---------------------------------------------- -->
		<Intuition title="P(A|B) ist nicht P(B|A)">
			Das ist der Kern dieser Lektion — und einer der häufigsten Denkfehler
			überhaupt. <strong>P(positiv | krank)</strong> und <strong>P(krank |
			positiv)</strong> sind zwei völlig verschiedene Zahlen. Ein Test kann Kranke
			fast perfekt erkennen (Sensitivität 99 %) und trotzdem kann es sein, dass die
			<em>meisten</em> positiven Ergebnisse Fehlalarme sind. Der Grund ist die
			<strong>Basisrate</strong>: Ist eine Krankheit selten, gibt es so viele
			Gesunde, dass selbst ein kleiner Prozentsatz falsch-positiver unter ihnen die
			wenigen echten Kranken zahlenmäßig überholt. Genau das machst du gleich
			sichtbar.
		</Intuition>

		<!-- Die Bayes-Box -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus: die Bayes-Box</h2>
		<p class="text-ink-soft leading-relaxed">
			Stell dir 10.000 Personen als Raster vor. Mit den drei Reglern teilst du sie
			in vier Gruppen auf. Geh am besten so vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				Lass die Startwerte stehen (Prävalenz 0,5 %, Sensitivität 99 %, Spezifität
				95 %) und schau dir die große Prozentzahl an.
			</li>
			<li>
				Vergleiche die <strong>richtig-positiven</strong> mit den
				<strong>falsch-positiven</strong> — obwohl der Test gut ist, dominieren die
				Fehlalarme.
			</li>
			<li>
				Zieh nun die <strong>Prävalenz</strong> hoch (z. B. auf 20 %) und beobachte,
				wie P(krank | positiv) plötzlich nach oben springt.
			</li>
		</ol>

		<BayesBox />

		<Intuition title="Der Basisraten-Effekt, in Zahlen">
			Bei 10.000 Personen und 0,5 % Prävalenz sind nur etwa 50 wirklich krank.
			Davon erkennt der Test bei 99 % Sensitivität rund 50. Unter den 9.950 Gesunden
			schlägt er aber bei 5 % fälschlich an — das sind fast 500 falsch-positive. Von
			allen rund 550 positiven Tests sind also nur etwa 50 echt: knapp 9 %. Eine
			hohe Sensitivität rettet dich nicht vor einer niedrigen Basisrate.
		</Intuition>

		<Merke title="So liest du ein positives Testergebnis">
			Frag immer nach drei Dingen: Wie selten ist die Krankheit (Prävalenz)? Wie gut
			erkennt der Test Kranke (Sensitivität)? Und wie oft schlägt er bei Gesunden
			fälschlich an (1 − Spezifität)? Erst alle drei zusammen ergeben P(krank |
			positiv).
		</Merke>

		<!-- Selbsttest ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Sitzt es? Drei kurze Fragen</h2>
		<p class="text-ink-soft leading-relaxed">
			Keine Prüfung, nur eine Selbstkontrolle. Du bekommst zu jeder Frage sofort
			eine Erklärung.
		</p>

		<Selbsttest questions={fragen} onComplete={markDone} />

		{#if done}
			<div
				class="border-sage-300 bg-sage-100 text-sage-500 flex items-center gap-3 rounded-2xl border px-5 py-4"
				role="status"
			>
				<span class="text-xl" aria-hidden="true">✓</span>
				<p class="font-semibold">
					Geschafft! Diese Lektion ist als abgeschlossen markiert — du findest den
					Haken jetzt auch in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
