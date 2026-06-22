<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import FlaechenSchieber from '$lib/widgets/FlaechenSchieber.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'verteilungen';

	// Wird true, sobald der Selbsttest vollständig beantwortet ist.
	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'vt-1',
			kind: 'mc',
			prompt: 'Die Flügellänge einer Vogelart ist näherungsweise normalverteilt. Was beschreibt die Fläche unter der Dichtekurve über dem Intervall [a, b]?',
			options: [
				'Die Höhe der Verteilung an dieser Stelle.',
				'Die Wahrscheinlichkeit, dass ein zufällig gefangener Vogel eine Flügellänge zwischen a und b hat.',
				'Den Mittelwert μ der Flügellänge.'
			],
			correct: 1,
			explanation:
				'Genau. Bei stetigen Verteilungen ist nicht die Höhe der Kurve die Wahrscheinlichkeit, sondern die Fläche darunter. Die Fläche über [a, b] ist P(a < X ≤ b) = F(b) − F(a) — der Anteil der Vögel, deren Flügellänge dazwischen liegt.'
		},
		{
			id: 'vt-2',
			kind: 'mc',
			prompt:
				'Die Blütenblattlänge einer Iris ist eine stetige Zufallsvariable. Wie groß ist die Wahrscheinlichkeit, dass ein Blütenblatt exakt 50,000… mm lang ist — auf unendlich viele Nachkommastellen genau?',
			options: ['Genau 0.', 'Ungefähr 50 %.', 'Hängt nur von σ ab.'],
			correct: 0,
			explanation:
				'Richtig — bei einer stetigen Variable ist P(X = ein exakter Wert) = 0. Ein einzelner Punkt hat keine Fläche. Nur Intervalle (Flächen) tragen eine positive Wahrscheinlichkeit.'
		},
		{
			id: 'vt-3',
			kind: 'tf',
			prompt:
				'Ist die Flügellänge einer Vogelart normalverteilt, liegen rund 95 % aller Vögel im Bereich μ ± 2σ.',
			correct: true,
			explanation:
				'Wahr. Das ist die 68–95–99,7-Regel: etwa 68 % liegen in μ ± 1σ, etwa 95 % in μ ± 2σ und etwa 99,7 % in μ ± 3σ. Probier es im Flächen-Schieber mit a = μ − 2σ und b = μ + 2σ aus.'
		}
	];
</script>

<svelte:head>
	<title>Verteilungen & die Glockenkurve · DS2</title>
	<meta
		name="description"
		content="Häufigkeits- vs. Wahrscheinlichkeitsverteilung, diskret vs. stetig, die Normalverteilung und die zentrale Idee: Die Fläche unter der Dichtekurve ist die Wahrscheinlichkeit. Mit interaktivem Flächen-Schieber."
	/>
</svelte:head>

<LessonLayout {slug}>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Verteilungen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Verteilungen & die Glockenkurve</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			In dieser Lektion lernst du, wie man beschreibt, welche Werte wie häufig oder wie
			wahrscheinlich auftreten. Viele biologische Messgrößen — die Flügellänge einer Vogelart,
			die Blütenblattlänge einer Iris, die Größe von Blättern — sind näherungsweise
			normalverteilt, und genau daran machen wir die Idee fest. Am Ende steht ein einziger,
			großer Gedanke, den du in fast jedem weiteren Kapitel wiedersehen wirst: <strong>Die
			Fläche unter einer Kurve ist eine Wahrscheinlichkeit.</strong> Bauen wir uns langsam
			dorthin.
		</p>

		<!-- Beobachtet vs. theoretisch ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Beobachtet oder erwartet?</h2>
		<p class="text-ink-soft leading-relaxed">
			Wenn du echte Daten sammelst und zählst, wie oft jeder Wert vorkommt, erhältst du eine
			<Begriff term="Häufigkeitsverteilung" />. Sie ist <em>beobachtet</em> — du liest sie direkt
			aus deinen Messungen ab, etwa als Histogramm. Würfelst du 60-mal, könntest du jede Augenzahl
			vielleicht 8- bis 12-mal sehen.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Dem gegenüber steht die <Begriff term="Wahrscheinlichkeitsverteilung" />. Sie ist
			<em>theoretisch</em> und sagt dir, was du <em>erwarten</em> würdest, wenn du unendlich oft
			messen könntest. Beim fairen Würfel: jede Augenzahl mit Wahrscheinlichkeit 1/6. Die
			beobachtete Häufigkeit nähert sich dieser theoretischen Verteilung an, je mehr Daten du
			sammelst.
		</p>

		<Merke title="Zwei Sichtweisen auf dieselbe Sache">
			Die <strong>Häufigkeitsverteilung</strong> kommt aus deinen echten Daten (beobachtet). Die
			<strong>Wahrscheinlichkeitsverteilung</strong> ist das theoretische Modell dahinter
			(erwartet). Statistik schlägt die Brücke zwischen beiden.
		</Merke>

		<!-- Diskret vs. stetig --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Diskret oder stetig?</h2>
		<p class="text-ink-soft leading-relaxed">
			Eine <Begriff term="Diskrete Zufallsvariable" /> nimmt abzählbar viele Werte an — die
			Augenzahl eines Würfels, die Anzahl der Treffer. Hier hat <em>jeder einzelne Wert</em> eine
			eigene Wahrscheinlichkeit: P(Würfel = 3) = 1/6. Das ist anschaulich und unproblematisch.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Bei einer <Begriff term="Stetige Zufallsvariable">stetigen Zufallsvariable</Begriff> wird es
			subtiler. Sie kann <em>jeden</em> Wert in einem Bereich annehmen — die Flügellänge einer
			Amsel etwa könnte 130 mm sein, oder 130,1 mm, oder 130,03471… mm. Es gibt unendlich viele
			mögliche Werte. Und genau deshalb gilt etwas, das im ersten Moment irritiert.
		</p>

		<Intuition title="Bei stetigen Variablen ist P(X = x) = 0">
			Frag nach der Wahrscheinlichkeit für einen <em>exakten</em> Wert — etwa eine Flügellänge von
			genau 130,000… mm auf unendlich viele Stellen genau — dann ist die Antwort <strong>0</strong>.
			Ein einzelner Punkt ist unendlich dünn, er hat keine Breite und damit keine Fläche. Sinnvoll
			fragen kannst du nur nach <strong>Intervallen</strong>: Wie wahrscheinlich ist eine
			Flügellänge <em>zwischen</em> 129,5 und 130,5 mm? Das hat eine Breite — und eine Fläche — und
			damit eine Wahrscheinlichkeit.
		</Intuition>

		<Analogie title="Der Punkt und das Stück Kuchen">
			Stell dir die Verteilung als einen langen, flachen Kuchen vor. Nach einem unendlich dünnen
			Schnitt zu fragen, ist wie nach der „Menge Kuchen an genau einer Stelle“ zu fragen — null.
			Erst wenn du ein <em>Stück</em> mit einer gewissen Breite herausschneidest, bekommst du etwas
			auf den Teller. Die Breite des Stücks ist dein Intervall, die Menge Kuchen ist die
			Wahrscheinlichkeit.
		</Analogie>

		<!-- Die Normalverteilung ------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Normalverteilung</h2>
		<p class="text-ink-soft leading-relaxed">
			Die wichtigste stetige Verteilung ist die <Begriff term="Normalverteilung" />, kurz N(μ, σ)
			— die berühmte Glockenkurve. Sie ist symmetrisch, hat ihren Gipfel beim Mittelwert
			<strong>μ</strong> und ihre Breite bestimmt die <Begriff term="Standardabweichung" />
			<strong>σ</strong>. Verschiebst du μ, wandert die ganze Glocke nach links oder rechts;
			machst du σ größer, wird sie flacher und breiter, machst du σ kleiner, wird sie schmal und
			hoch.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Die Kurve selbst ist die <Begriff term="Dichtefunktion" /> (in R: <code>dnorm</code>). Ihre
			Formel musst du nicht auswendig können — schau sie dir nur einmal an, damit du μ und σ darin
			wiedererkennst.
		</p>

		<FormelZeigen
			formula={String.raw`f(x) = \dfrac{1}{\sigma\sqrt{2\pi}}\, e^{-\frac{1}{2}\left(\frac{x-\mu}{\sigma}\right)^2}`}
			symbols={[
				{ sym: String.raw`f(x)`, bedeutung: 'Die Höhe der Dichtekurve an der Stelle x — keine Wahrscheinlichkeit, nur die Form der Glocke.' },
				{ sym: String.raw`\mu`, bedeutung: 'Mittelwert: die Lage des Gipfels. Verschiebt die Kurve nach links oder rechts.' },
				{ sym: String.raw`\sigma`, bedeutung: 'Standardabweichung: die Breite. Staucht oder streckt die Glocke.' },
				{ sym: String.raw`e`, bedeutung: 'Die eulersche Zahl ≈ 2,718 — sorgt für die glockenförmige Abnahme nach außen.' }
			]}
		/>

		<!-- DIE zentrale Idee ---------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die zentrale Idee: Fläche = Wahrscheinlichkeit</h2>
		<p class="text-ink-soft leading-relaxed">
			Jetzt kommt der Gedanke, auf den alles hinausläuft. Die Höhe der Dichtekurve ist für sich
			genommen keine Wahrscheinlichkeit. Eine Wahrscheinlichkeit bekommst du erst, wenn du die
			<strong>Fläche</strong> unter der Kurve über einem Intervall betrachtest.
		</p>

		<Intuition title="Die Fläche unter der Dichtekurve ist die Wahrscheinlichkeit">
			Die gesamte Fläche unter der Glocke ist genau <strong>1</strong> — irgendeine Flügellänge hat
			jeder Vogel schließlich. Die Fläche über einem Teilstück [a, b] ist dann
			<strong>P(a &lt; X ≤ b)</strong>: der Anteil der Tiere, deren Flügellänge in dieses Intervall
			fällt — also die Wahrscheinlichkeit, dass ein zufällig gefangener Vogel zwischen a und b misst.
			Schiebst du a und b zusammen auf einen einzigen Punkt, schrumpft die Fläche auf null — genau
			deshalb ist P(X = x) = 0. Diese eine Idee macht später Konfidenzintervalle, p-Werte und
			Streubereiche verständlich.
		</Intuition>

		<p class="text-ink-soft leading-relaxed">
			Wie berechnet man so eine Fläche? Dafür gibt es die <Begriff term="Verteilungsfunktion" />
			F (in R: <code>pnorm</code>). Sie ist die <em>aufsummierte Fläche von links</em>: F(x) sagt
			dir, wie viel Fläche bis zur Stelle x angesammelt ist, also <strong>P(X ≤ x)</strong>. Die
			Fläche eines Intervalls ist dann einfach die Differenz zweier solcher „Flächen von links“.
		</p>

		<FormelZeigen
			formula={String.raw`P(a < X \le b) = F(b) - F(a)`}
			symbols={[
				{ sym: String.raw`F(x)`, bedeutung: 'Verteilungsfunktion: die Fläche von links bis x, also P(X ≤ x). In R: pnorm.' },
				{ sym: String.raw`F(b)`, bedeutung: 'Gesamte Fläche bis zur oberen Grenze b.' },
				{ sym: String.raw`F(a)`, bedeutung: 'Fläche bis zur unteren Grenze a — die wird abgezogen, weil sie nicht zum Intervall gehört.' }
			]}
		/>

		<!-- Das Widget ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus: der Flächen-Schieber</h2>
		<p class="text-ink-soft leading-relaxed">
			Lass uns die Idee nicht behaupten, sondern anfassbar machen. Denk dir die Achse als die
			Flügellänge unserer Vogelart in Millimetern. Geh am besten in dieser Reihenfolge vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Zieh die Grenzen <strong>a</strong> und <strong>b</strong> auseinander und beobachte, wie die korallene Fläche und der Wert <strong>P(a &lt; X ≤ b)</strong> — der Anteil der Vögel mit Flügellänge dazwischen — wachsen.</li>
			<li>Schieb a und b ganz dicht zusammen — die Fläche und damit die Wahrscheinlichkeit gehen gegen null.</li>
			<li>Verschieb <strong>μ</strong> und ändere <strong>σ</strong> und sieh zu, wie sich die Glocke (und die schattierte Fläche) umformt.</li>
			<li>Schalte <strong>„in Standardabweichungen (z) anzeigen“</strong> ein: Die Achse zeigt nun z-Werte — so sieht jede Normalverteilung gleich aus.</li>
			<li>Blende die <strong>68/95/99,7-Bereiche</strong> ein und stell a = μ − 2σ, b = μ + 2σ ein. Du solltest rund 95 % ablesen.</li>
		</ol>

		<FlaechenSchieber />

		<!-- Z-Transformation ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Z-Transformation</h2>
		<p class="text-ink-soft leading-relaxed">
			Es gibt unendlich viele Normalverteilungen — für jede Kombination aus μ und σ eine. Wäre es
			nicht praktisch, sie alle auf <em>eine</em> gemeinsame zurückzuführen? Genau das leistet die
			<Begriff term="Z-Transformation" />: Du ziehst von jedem Wert den Mittelwert ab und teilst
			durch die Standardabweichung.
		</p>

		<FormelZeigen
			formula={String.raw`Z = \dfrac{X - \mu}{\sigma}`}
			symbols={[
				{ sym: String.raw`Z`, bedeutung: 'Der standardisierte Wert — gemessen in Standardabweichungen vom Mittelwert.' },
				{ sym: String.raw`X`, bedeutung: 'Dein ursprünglicher Wert in seiner eigenen Einheit (z. B. cm).' },
				{ sym: String.raw`\mu`, bedeutung: 'Mittelwert der Verteilung — wird abgezogen, sodass μ zu z = 0 wird.' },
				{ sym: String.raw`\sigma`, bedeutung: 'Standardabweichung — durch sie wird geteilt, sodass die Einheit „Standardabweichungen“ wird.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Das Ergebnis ist die <Begriff term="Standardnormalverteilung" /> N(0, 1): Mittelwert 0,
			Standardabweichung 1. Ein z-Wert von +1 bedeutet „eine Standardabweichung über dem
			Mittelwert“, unabhängig davon, ob es um Körpergrößen, Testergebnisse oder Temperaturen geht.
			Genau das siehst du, wenn du im Flächen-Schieber den z-Schalter aktivierst — die Achse wird
			in Standardabweichungen beschriftet.
		</p>

		<!-- 68/95/99,7-Regel ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Streubereiche: die 68–95–99,7-Regel</h2>
		<p class="text-ink-soft leading-relaxed">
			Weil sich jede Normalverteilung auf N(0, 1) zurückführen lässt, gelten überall dieselben
			Flächen. Drei davon solltest du dir merken:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>etwa <strong>68 %</strong> aller Werte liegen in <strong>μ ± 1σ</strong>,</li>
			<li>etwa <strong>95 %</strong> in <strong>μ ± 2σ</strong>,</li>
			<li>etwa <strong>99,7 %</strong> in <strong>μ ± 3σ</strong>.</li>
		</ul>
		<p class="text-ink-soft leading-relaxed">
			Diese Faustregel ist nichts anderes als die Fläche unter der Glocke zwischen den jeweiligen
			Grenzen — wieder die zentrale Idee. Werte jenseits von 3σ sind extrem selten; deshalb wirkt
			ein solcher Ausreißer auffällig.
		</p>

		<Merke title="dnorm ist die Höhe, pnorm ist die Fläche">
			Verwechsle die beiden nicht: <code>dnorm</code> (die Dichte) gibt dir die <em>Höhe</em> der
			Kurve — das ist <strong>keine</strong> Wahrscheinlichkeit. <code>pnorm</code> (die
			Verteilungsfunktion) gibt dir die <em>Fläche von links</em>, also P(X ≤ x) — und Flächen
			<strong>sind</strong> Wahrscheinlichkeiten. Willst du P(a &lt; X ≤ b), rechnest du
			pnorm(b) − pnorm(a).
		</Merke>

		<Intuition title="In einem Satz">
			Eine stetige Verteilung beschreibst du über eine Dichtekurve; ihre <em>Fläche</em> über
			einem Intervall ist die Wahrscheinlichkeit — und die Z-Transformation führt jede
			Glockenkurve auf dieselbe Standardnormalverteilung zurück.
		</Intuition>

		<!-- Selbsttest ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Sitzt es? Drei kurze Fragen</h2>
		<p class="text-ink-soft leading-relaxed">
			Keine Prüfung, nur eine Selbstkontrolle. Du bekommst zu jeder Frage sofort eine Erklärung.
		</p>

		<Selbsttest questions={fragen} onComplete={markDone} />

		{#if done}
			<div
				class="border-sage-300 bg-sage-100 text-sage-500 flex items-center gap-3 rounded-2xl border px-5 py-4"
				role="status"
			>
				<span class="text-xl" aria-hidden="true">✓</span>
				<p class="font-semibold">
					Geschafft! Diese Lektion ist als abgeschlossen markiert — du findest den Haken jetzt
					auch in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
