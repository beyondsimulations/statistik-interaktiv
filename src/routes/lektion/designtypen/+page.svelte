<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import PseudoreplikationsFalle from '$lib/widgets/PseudoreplikationsFalle.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import RCode from '$lib/components/RCode.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'designtypen';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'designtypen-1',
			kind: 'mc',
			prompt:
				'Eine Studie verteilt ein neues Futter auf 5 Becken pro Gruppe und misst in jedem Becken 20 Fische, also 100 Fische je Gruppe. Was ist die echte Stichprobengröße (Replikationseinheit)?',
			options: [
				'100 Fische pro Gruppe: jeder gemessene Fisch ist ein Datenpunkt.',
				'5 Becken pro Gruppe: die Becken bekamen unabhängig das Futter, die 20 Fische je Becken sind nur Subsamples.',
				'2 Gruppen: Kontrolle und Behandlung.'
			],
			correct: 1,
			explanation:
				'Genau. Das Futter wurde auf BECKEN-Ebene zugeteilt, also ist das Becken die Versuchseinheit. Die 20 Fische in einem Becken teilen Wasser, Temperatur und Futterportion. Sie sind voneinander abhängig (Subsamples), keine unabhängigen Replikate. Die wahre Stichprobengröße ist 5 Becken pro Gruppe, nicht 100 Fische. Wer mit n = 100 rechnet, betreibt Pseudoreplikation.'
		},
		{
			id: 'designtypen-2',
			kind: 'mc',
			prompt:
				'Warum liefert die naive Analyse (jeder Fisch als unabhängig) einen irreführend kleinen p-Wert?',
			options: [
				'Weil mehr Fische die wahre Streuung verkleinern und der Effekt dadurch echt größer wird.',
				'Weil die künstlich aufgeblähten Freiheitsgrade (n = 100 statt 5) den kritischen Wert senken und die abhängigen Subsamples als echte Information zählen. So wird der Test zu optimistisch.',
				'Weil der Mittelwert pro Becken dadurch genauer geschätzt wird.'
			],
			correct: 1,
			explanation:
				'Richtig. Tut man so, als hätte man 100 unabhängige Beobachtungen, blähen sich die Freiheitsgrade auf, der Standardfehler wirkt künstlich klein und die kritische Schranke rückt näher an null. Die zusätzlichen Blätter/Fische tragen aber kaum neue, unabhängige Information bei, sie sind ja abhängig. Ergebnis: ein viel zu kleiner p-Wert, also Schein-Signifikanz. Die Information steckt in der Zahl der unabhängigen Einheiten, nicht in der Zahl der Messungen.'
		},
		{
			id: 'designtypen-3',
			kind: 'tf',
			prompt:
				'„Mehrere Messungen am selben Individuum (z. B. dreimal dasselbe Tier wiegen) sind unabhängige Replikate und dürfen als getrennte Datenpunkte in den Test eingehen.“',
			correct: false,
			explanation:
				'Falsch. Wiederholte Messungen an derselben Einheit sind abhängig, sie teilen alles, was diese Einheit ausmacht (Genetik, Vorgeschichte, Messsituation). Sie sind Subsamples, keine echten Replikate. Behandelt man sie als unabhängig, entsteht Pseudoreplikation mit aufgeblähten Freiheitsgraden und falsch kleinen p-Werten. Korrekt: einen Mittelwert pro Individuum bilden, einen Error()-Term verwenden oder ein Mixed Model rechnen.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Jeder Messwert ist eine Summe trennbarer Quellen: Y = Behandlungseffekt + biologischer Effekt + technischer Effekt + Fehler. Gutes Versuchsdesign ordnet diese Quellen VORAB so an, dass der Behandlungseffekt nicht mit Störquellen vermischt wird — die Statistik kann nur trennen, was das Design getrennt hat. Designtypen: vollständig randomisiert (CRD), randomisiertes Blockdesign (RBD), Messwiederholung/Längsschnitt, Split-Plot, verschachtelt vs. gekreuzt. Die zentrale Warnung: Pseudoreplikation. Subsamples (mehrere Blätter pro Pflanze, mehrere Fische pro Becken) sind abhängig; als unabhängige Replikate behandelt blähen sie die Freiheitsgrade auf und erzeugen Schein-Signifikanz. Die wahre Replikationseinheit ist die unabhängige Einheit, nicht die Einzelmessung. Mit interaktiver Pseudoreplikations-Falle und R-Code (naiv vs. Error()/Mittelwerte)."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-sage-100 text-sage-500 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Vertiefung · Design & Replikation
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Designtypen & Pseudoreplikation</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Stell dir vor, du willst wissen, ob ein Dünger Blätter wachsen lässt. Du nimmst ein paar
			Pflanzen, misst an jeder viele Blätter, rechnest einen t-Test und bekommst einen winzigen
			p-Wert. Klingt nach einem klaren Effekt. Aber Vorsicht: Vielleicht hast du dich gerade selbst
			betrogen. Diese Lektion handelt davon, <strong>wie man ein Experiment so anordnet</strong>, dass
			die Statistik den Behandlungseffekt überhaupt sauber herausrechnen kann — und vom häufigsten
			Trugschluss dabei, der <Begriff term="Pseudoreplikation" />.
		</p>

		<Rueckblick {slug} />

		<!-- Grundgleichung der Versuchsplanung ----------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Grundgleichung der Versuchsplanung</h2>
		<p class="text-ink-soft leading-relaxed">
			Jeder einzelne Messwert ist eine <strong>Summe trennbarer Quellen</strong>. Misst du die Länge
			eines Blattes, steckt darin nicht nur der Dünger, sondern auch die individuelle Pflanze, der
			Messfehler des Lineals und reiner Zufall. Schematisch:
		</p>

		<FormelZeigen
			formula={String.raw`Y \;=\; \underbrace{\tau}_{\text{Behandlung}} \;+\; \underbrace{\beta}_{\text{biologisch}} \;+\; \underbrace{\gamma}_{\text{technisch}} \;+\; \underbrace{\varepsilon}_{\text{Fehler}}`}
			symbols={[
				{
					sym: String.raw`Y`,
					bedeutung: 'Der beobachtete Messwert (z. B. die Länge eines Blattes).'
				},
				{
					sym: String.raw`\tau`,
					bedeutung:
						'Der Behandlungseffekt — das, was du eigentlich messen willst (z. B. der Dünger).'
				},
				{
					sym: String.raw`\beta`,
					bedeutung:
						'Der biologische Effekt — Unterschiede zwischen den Einheiten (welche Pflanze, welches Becken, welches Tier).'
				},
				{
					sym: String.raw`\gamma`,
					bedeutung:
						'Der technische Effekt — Mess- und Aufbau-Variation (Lineal, Beobachter, Charge, Tag).'
				},
				{
					sym: String.raw`\varepsilon`,
					bedeutung: 'Der nicht weiter zerlegbare Zufallsfehler.'
				}
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Gutes <Begriff term="Versuchsplanung">Design</Begriff> ordnet diese Quellen <strong>vorab</strong>
			so an, dass der Behandlungseffekt τ nicht mit einer Störquelle vermischt (konfundiert) wird. Der
			entscheidende Satz dahinter: <em>„Careful planning must precede data collection, not follow
			it.“</em> Die Statistik kann hinterher nämlich nur trennen, <strong>was das Design schon getrennt
			hat</strong> — keine noch so raffinierte Auswertung rettet einen Aufbau, in dem Dünger und
			Pflanzenidentität untrennbar zusammenfallen.
		</p>

		<Merke title="Die Statistik trennt nur, was das Design getrennt hat">
			Wenn alle gedüngten Pflanzen zufällig auch die kräftigsten waren, kannst du den Düngereffekt
			nie vom Pflanzeneffekt unterscheiden, egal wie viele Blätter du misst. Deshalb entscheidet die
			<strong>Anordnung vor der Messung</strong> über Erfolg oder Misserfolg, nicht die Wahl des
			Tests danach.
		</Merke>

		<!-- Designtypen ---------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Ein kleiner Zoo der Designtypen</h2>
		<p class="text-ink-soft leading-relaxed">
			Es gibt nicht „das eine“ richtige Design. Die Struktur der Störquellen bestimmt, welches passt.
			Die wichtigsten Typen, jeweils mit einem biologischen Beispiel:
		</p>

		<Merke title="Die gängigen Designtypen auf einen Blick">
			<ul class="ml-5 list-disc space-y-1.5">
				<li>
					<Begriff term="Vollständig randomisiertes Design">CRD (vollständig randomisiert)</Begriff>:
					jede Pflanze wird rein zufällig Kontrolle oder Dünger zugeteilt. Einfach und sauber, solange
					die Einheiten ähnlich sind.
				</li>
				<li>
					<Begriff term="Randomisiertes Blockdesign">RBD (randomisiertes Blockdesign)</Begriff>:
					liegen die Pflanzen in mehreren Beeten mit unterschiedlichem Boden, fasst du jedes Beet als
					<Begriff term="Blocking">Block</Begriff> auf und randomisierst INNERHALB jedes Beets. Die
					Beet-Variation wird so aus dem Fehler herausgerechnet.
				</li>
				<li>
					<Begriff term="Repeated Measures">Repeated Measures / Längsschnitt</Begriff>: du misst
					dasselbe Tier zu mehreren Zeitpunkten (Wachstum über Wochen). Die Messungen am selben Tier
					sind abhängig und verlangen einen passenden Fehlerterm.
				</li>
				<li>
					<Begriff term="Split-Plot-Design">Split-Plot</Begriff>: Bewässerung wird auf ganzen
					Parzellen variiert, die Düngersorte auf Teilflächen darin. Zwei Randomisierungsebenen, zwei
					Fehlerterme.
				</li>
				<li>
					<Begriff term="Verschachteltes Design">nested (verschachtelt)</Begriff> vs.
					<Begriff term="Gekreuztes Design">crossed (gekreuzt)</Begriff>: Pflanzen sind in
					Behandlungen <em>verschachtelt</em> (jede Pflanze gehört zu genau einer Behandlung); Faktoren
					wie Behandlung × Geschlecht sind <em>gekreuzt</em> (jede Kombination kommt vor), nur dann
					lassen sich Wechselwirkungen schätzen.
				</li>
			</ul>
		</Merke>

		<!-- Die zentrale Warnung: Pseudoreplikation ------------------------------ -->
		<Callout variant="warnung" title="Die zentrale Falle: Pseudoreplikation">
			<p>
				Das ist der wichtigste Gedanke der Lektion. <strong>Subsamples</strong> — mehrere Blätter pro
				Pflanze, mehrere Fische pro Becken, wiederholte Messungen am selben Tier — sind statistisch
				<strong>abhängig</strong>. Sie teilen alles, was ihre Einheit ausmacht.
			</p>
			<ul class="mt-2 ml-5 list-disc space-y-1">
				<li>
					Behandelt man sie als <em>unabhängige</em> Replikate, bläht man die
					<Begriff term="Freiheitsgrade" /> künstlich auf (n = 100 Fische statt 5 Becken).
				</li>
				<li>
					Aufgeblähte Freiheitsgrade → ein künstlich kleiner Standardfehler → <strong>künstlich
					kleine p-Werte</strong> → <strong>Schein-Signifikanz</strong>.
				</li>
				<li>
					Die <strong>wahre Replikationseinheit</strong> ist die unabhängige
					<Begriff term="Versuchseinheit" /> (die Pflanze, das Becken) — <strong>nicht</strong> die
					Einzelmessung.
				</li>
			</ul>
			<p class="mt-2">
				<strong>Lösungen:</strong> einen <em>Mittelwert pro Einheit</em> bilden und damit testen,
				einen <code class="font-mono text-sm">Error()</code>-Term setzen, oder gleich ein
				<strong>Mixed Model</strong> rechnen. Alle drei zählen ehrlich nur die unabhängigen Einheiten.
			</p>
		</Callout>

		<p class="text-ink-soft leading-relaxed">
			Warum genau wird der p-Wert zu klein? Der t-Wert ist Signal geteilt durch Rauschen, und das
			Rauschen, der Standardfehler, schrumpft mit √n. Schiebst du fälschlich die Zahl der
			<em>Messungen</em> als n ein statt die Zahl der <em>unabhängigen Einheiten</em>, wird der
			Standardfehler künstlich klein und die Freiheitsgrade groß. Der Test hält das für viel mehr
			Information, als wirklich da ist.
		</p>

		<!-- Faktor vs. numerisch -------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Faktor oder Zahl? Wie du eine Variable kodierst</h2>
		<p class="text-ink-soft leading-relaxed">
			Eine zweite, leise Designentscheidung: Behandelst du eine Variable als <strong>kategorial
			(Faktor)</strong> oder als <strong>kontinuierlich (numerisch)</strong>? Kontrolle vs. Dünger ist
			kategorial → <Begriff term="ANOVA" />. Eine Düngermenge in Gramm (0, 5, 10, 15 …) ist
			kontinuierlich → <Begriff term="Lineare Regression">Regression</Begriff>. Die falsche Kodierung
			kostet: Kodierst du eine echte Dosis als bloßen Faktor, wirfst du die Information über die
			Reihenfolge und die Abstände weg und verlierst Power. Behandelst du umgekehrt reine Kategorien
			als Zahlen, erzeugst du einen Schein-Trend, der gar nicht existiert.
		</p>

		<!-- R-Code: naiv vs. korrekt --------------------------------------------- -->
		<h2 class="mt-4 text-2xl">In R: der naive Fehler und zwei saubere Wege</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier dieselbe Studie dreimal: einmal falsch (jedes Blatt als unabhängig), einmal über
			Mittelwerte pro Pflanze, einmal mit einem <code class="font-mono text-sm">Error()</code>-Term,
			der R sagt, wo die echte Replikationsebene liegt.
		</p>

		<RCode
			code={`# Daten: pflanze = echte Einheit, blatt-Messungen sind Subsamples.
# behandlung: Kontrolle vs. Duenger.

# (1) NAIV — jedes Blatt zaehlt als unabhaengig  -> PSEUDOREPLIKATION
aov(blattlaenge ~ behandlung, data = blaetter)   # df aufgeblaeht, p zu klein!

# (2) KORREKT A — erst Mittelwert pro Pflanze, dann testen
library(dplyr)
pro_pflanze <- blaetter |>
  group_by(behandlung, pflanze) |>
  summarise(m = mean(blattlaenge), .groups = "drop")
aov(m ~ behandlung, data = pro_pflanze)          # df = Anzahl Pflanzen - ...

# (3) KORREKT B — Error()-Term: Pflanze als Fehlerebene
aov(blattlaenge ~ behandlung + Error(pflanze), data = blaetter)

# Alternative: ein Mixed Model
# library(lme4)
# lmer(blattlaenge ~ behandlung + (1 | pflanze), data = blaetter)`}
			annotations={{
				'aov(... ~ behandlung)':
					'Die naive ANOVA über alle Blätter: Sie nimmt jedes Blatt als eigenständige Beobachtung, die Freiheitsgrade werden aufgebläht, der p-Wert künstlich klein.',
				'group_by + summarise':
					'Bildet EINEN Mittelwert pro Pflanze. Danach hat jede Pflanze genau einen Wert — die ehrliche Replikationseinheit.',
				'aov(m ~ behandlung)':
					'Die korrekte ANOVA über die Pflanzen-Mittelwerte: df folgen aus der Zahl der Pflanzen, nicht der Blätter.',
				'Error(pflanze)':
					'Sagt R, dass die Behandlung auf Pflanzen-Ebene wirkt. R legt den Test auf die richtige Fehlerebene — das ist der Standardweg gegen Pseudoreplikation.',
				'(1 | pflanze)':
					'Im Mixed Model: ein zufälliger Achsenabschnitt je Pflanze. Modelliert die Abhängigkeit der Blätter explizit, statt zu mitteln.'
			}}
		/>

		<!-- Flagship-Widget ------------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: die Pseudoreplikations-Falle</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier siehst du den Trugschluss live. Zwei Behandlungen (Kontrolle vs. Dünger), je ein paar
			<strong>Pflanzen</strong> (echte Einheiten), je Pflanze mehrere <strong>Blätter</strong>
			(Subsamples). Schalte oben zwischen <strong>„Naiv: jedes Blatt zählt“</strong> und
			<strong>„Korrekt: Mittelwert pro Pflanze“</strong> um und beobachte, wie sich n, die
			Freiheitsgrade, der t-Wert und der p-Wert ändern. Hol dir diese Aha-Momente:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				Stell viele <strong>Blätter pro Pflanze</strong> ein. Naiv wird der p-Wert winzig
				(signifikant) — schalte auf <em>korrekt</em>: oft ist der Effekt plötzlich
				<strong>nicht</strong> signifikant. Das ist die <strong>Schein-Signifikanz</strong>.
			</li>
			<li>
				Dreh die <strong>Streuung zwischen den Pflanzen</strong> hoch. Je stärker sich die Pflanzen
				untereinander unterscheiden, desto deutlicher führt die naive Methode in die Irre.
			</li>
		</ol>

		<PseudoreplikationsFalle />

		<Merke title="Was die Pseudoreplikations-Falle zeigt">
			Mehr Blätter zu messen vergrößert nicht die echte Stichprobe, sondern nur die Zahl der
			abhängigen Subsamples. Die naive Analyse verwechselt „viele Messungen“ mit „viel unabhängige
			Information“ und meldet deshalb Schein-Signifikanz. Erst der Mittelwert pro Pflanze (oder ein
			<code class="font-mono text-sm">Error()</code>-Term / Mixed Model) zählt ehrlich die
			unabhängigen Einheiten.
		</Merke>

		<!-- Zusammenfassung ------------------------------------------------------ -->
		<Intuition title="In einem Satz">
			Jeder Messwert ist eine Summe trennbarer Quellen (Y = Behandlung + Biologie + Technik + Fehler),
			gutes <strong>Design</strong> ordnet sie vorab so an, dass der Behandlungseffekt nicht
			konfundiert wird — die Statistik trennt nur, was das Design getrennt hat; und die häufigste
			Falle ist die <strong>Pseudoreplikation</strong>, bei der abhängige Subsamples (Blätter pro
			Pflanze, Fische pro Becken) als unabhängige Replikate gezählt werden, die Freiheitsgrade
			aufblähen und Schein-Signifikanz erzeugen — die wahre Replikationseinheit ist die unabhängige
			Einheit, nicht die Einzelmessung.
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
					Geschafft! Diese Lektion ist als abgeschlossen markiert — du findest den Haken jetzt auch
					in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
