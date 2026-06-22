<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import SortierSpiel from '$lib/widgets/SortierSpiel.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'was-ist-statistik';

	// Wird true, sobald der Selbsttest vollständig beantwortet ist.
	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'ws-1',
			kind: 'mc',
			prompt:
				'Du berechnest den Durchschnittslohn aller Befragten und zeichnest dazu ein Histogramm. Welches Teilgebiet ist das?',
			options: [
				'Deskriptive Statistik — du beschreibst die vorliegenden Daten.',
				'Inferentielle Statistik — du schließt auf die Grundgesamtheit.',
				'Explorative Statistik — du erzeugst eine neue Hypothese.'
			],
			correct: 0,
			explanation:
				'Richtig. Mittelwert und Histogramm fassen nur die vorhandenen Daten zusammen, ohne über sie hinaus auf eine Grundgesamtheit zu schließen — das ist deskriptive Statistik.'
		},
		{
			id: 'ws-2',
			kind: 'mc',
			prompt:
				'Warum erlauben nur kontrollierte (manipulative) Experimente einen sauberen Kausalschluss?',
			options: [
				'Weil manipulative Experimente immer mehr Daten liefern.',
				'Weil man die Ursache gezielt setzt und durch Zufallszuteilung Störfaktoren ausgleicht.',
				'Weil beobachtende Studien keine Mittelwerte berechnen können.'
			],
			correct: 1,
			explanation:
				'Genau. Indem du selbst eingreifst und die Gruppen zufällig zuteilst, gleichen sich mögliche Störfaktoren im Schnitt aus. Bei reinem Beobachten kann immer ein dritter Faktor den Zusammenhang vortäuschen.'
		},
		{
			id: 'ws-3',
			kind: 'tf',
			prompt:
				'Eine Hypothese, die du explorativ in einem Datensatz entdeckt hast, darfst du an genau denselben Daten als bestätigt ansehen.',
			correct: false,
			explanation:
				'Falsch. Wer am selben Datensatz erst sucht und dann "bestätigt", findet fast zwangsläufig etwas — auch reinen Zufall. Eine explorativ gefundene Hypothese braucht neue, unabhängige Daten zur konfirmatorischen Prüfung.'
		},
		{
			id: 'ws-4',
			kind: 'mc',
			prompt:
				'Du notierst bei gefangenen Fischen den Befall mit Parasiten in den Stufen „gering – mittel – stark“. Welches Skalenniveau hat diese Variable?',
			options: [
				'Nominal — es sind reine Kategorien ohne Rangfolge.',
				'Ordinal — die Stufen haben eine Rangfolge, aber keine gleichen Abstände.',
				'Metrisch — die Stufen haben gleiche, sinnvolle Abstände.'
			],
			correct: 1,
			explanation:
				'Richtig. „gering – mittel – stark“ ist eine Rangfolge, aber der Abstand zwischen den Stufen ist nicht definiert gleich groß — das ist ordinal. Deshalb passen hier Rangverfahren und der Median besser als ein Mittelwert.'
		}
	];
</script>

<svelte:head>
	<title>Was ist Statistik? · DS2</title>
	<meta
		name="description"
		content="Was Statistik eigentlich ist — und ihre drei Teilgebiete: deskriptiv, inferentiell und explorativ. Mit interaktivem Sortier-Spiel."
	/>
</svelte:head>

<LessonLayout {slug}>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Überblick
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Was ist Statistik?</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Bevor wir uns in Formeln und Tests stürzen, lohnt ein Schritt zurück: Was
			macht Statistik eigentlich? Kurz gesagt ist sie die Kunst, aus Daten
			vernünftige Schlüsse zu ziehen — und ehrlich zu sagen, wie sicher diese
			Schlüsse sind. In dieser Lektion bekommst du die Landkarte, auf der sich
			alle späteren Themen einordnen lassen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Man teilt die Statistik traditionell in drei Teilgebiete ein. Sie schließen
			sich nicht aus, sondern beantworten unterschiedliche Fragen an deine Daten.
			Schauen wir sie der Reihe nach an.
		</p>

		<!-- Die drei Teilgebiete -------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die drei Teilgebiete</h2>

		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Deskriptive Statistik" /> ist die bescheidenste der drei:
			Sie <strong>beschreibt und fasst zusammen</strong>, was du ohnehin schon hast.
			Ein Mittelwert, ein Anteil in Prozent, ein Histogramm — all das verdichtet
			einen Haufen Zahlen zu etwas Greifbarem. Sie geht aber nie über die
			gemessenen Daten hinaus; sie behauptet nichts über Fälle, die du nicht
			gesehen hast.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Inferentielle Statistik" /> — auch schließende oder
			induktive Statistik genannt — geht den entscheidenden Schritt weiter. Sie
			<strong>schließt von der <Begriff term="Stichprobe" /> auf die
			<Begriff term="Grundgesamtheit" /></strong>. Du hast nur ein paar Hundert
			Menschen befragt, möchtest aber etwas über Millionen sagen. Das passiert auf
			zwei Wegen: durch <strong>Schätzen</strong> (z. B. ein
			<Begriff term="Konfidenzintervall" /> für den wahren Wert) und durch
			<strong>Testen</strong> (z. B. die Frage, ob ein beobachteter Unterschied
			echt ist oder bloß Zufall).
		</p>

		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Explorative Statistik" /> schließlich durchstöbert Daten
			auf der Suche nach Mustern und <strong>erzeugt daraus neue, testbare
			Hypothesen</strong>. Sie liefert noch keine gesicherten Antworten, sondern
			gute Fragen: „Hier scheint etwas zu sein — das sollten wir genauer
			untersuchen.“ Sie entdeckt, sie bestätigt nicht.
		</p>

		<Merke title="Drei Fragen, drei Teilgebiete">
			<ul class="ml-5 list-disc space-y-1">
				<li><strong>Deskriptiv:</strong> Wie sehen meine Daten aus?</li>
				<li><strong>Inferentiell:</strong> Was sagen meine Daten über die ganze Grundgesamtheit?</li>
				<li><strong>Explorativ:</strong> Welche neue Hypothese legen mir die Daten nahe?</li>
			</ul>
		</Merke>

		<!-- Grundgesamtheit vs. Stichprobe --------------------------------------- -->
		<h2 class="mt-4 text-2xl">Grundgesamtheit und Stichprobe</h2>
		<p class="text-ink-soft leading-relaxed">
			Diese beiden Begriffe begleiten dich durch die gesamte schließende
			Statistik, also lohnt es sich, sie sauber auseinanderzuhalten. Die
			<Begriff term="Grundgesamtheit" /> sind <em>alle</em> Fälle, über die du
			eigentlich etwas wissen möchtest — etwa alle Wahlberechtigten eines Landes.
			Die <Begriff term="Stichprobe" /> ist die Teilmenge, die du tatsächlich
			gemessen hast. Fast immer ist die Grundgesamtheit zu groß, um sie komplett
			zu erfassen; deshalb arbeitest du mit einer Stichprobe und schließt von ihr
			zurück.
		</p>

		<Analogie title="Die Suppe abschmecken">
			Du musst nicht den ganzen Topf essen, um zu wissen, ob die Suppe gut
			gewürzt ist. Ein gut umgerührter Löffel genügt. Der Topf ist die
			Grundgesamtheit, der Löffel die Stichprobe — und „gut umgerührt“ heißt:
			zufällig und repräsentativ gezogen. Schöpfst du nur oben den Schaum ab, hilft
			dir der beste Löffel nichts.
		</Analogie>

		<!-- Skalenniveaus -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Skalenniveaus: Wie reichhaltig ist eine Messung?</h2>
		<p class="text-ink-soft leading-relaxed">
			Bevor du eine einzige Zahl berechnest, lohnt eine Frage: <em>Was für eine Art
			von Variable</em> hast du da überhaupt gemessen? Nicht jede Zahl darf man
			gleich behandeln. Das <Begriff term="Skalenniveau" /> sagt dir, wie „reichhaltig“
			eine Variable ist — und damit, welche Rechnungen und welche Tests erlaubt sind.
			Man unterscheidet drei Stufen, die aufeinander aufbauen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Auf der untersten Stufe steht die <Begriff term="Nominalskala" />. Hier gibt
			es nur <strong>Kategorien ohne Rangfolge</strong> — du kannst nur sagen, ob
			zwei Fälle gleich oder ungleich sind. Die <em>Art</em> eines gefangenen Tieres
			(Lachs, Forelle, Hecht), das <em>Geschlecht</em> oder die <em>Blutgruppe</em>
			sind nominal. „Lachs ist größer als Forelle“ ergibt als Skala keinen Sinn; du
			darfst nur <strong>zählen</strong>, wie oft jede Kategorie vorkommt.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Eine Stufe darüber liegt die <Begriff term="Ordinalskala" />. Jetzt gibt es
			eine <strong>Rangfolge</strong>, aber die Abstände sind nicht gleich groß.
			Klassische Beispiele aus der Biologie sind <em>Bonituren</em> und
			<em>Rangstufen</em>: ein Befall „gering – mittel – stark“, eine Blühintensität
			von 1 bis 5. Du darfst die Stufen <strong>ordnen</strong>, aber nicht sagen,
			der Sprung von „gering“ zu „mittel“ sei genauso groß wie der von „mittel“ zu
			„stark“. Mittelwerte sind hier mit Vorsicht zu genießen — der Median passt
			besser.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Ganz oben steht die <Begriff term="Metrische Skala">metrische Skala</Begriff>:
			echte Zahlen mit <strong>gleichen, sinnvollen Abständen</strong>. Die
			<em>Körperlänge</em> eines Lachses, das <em>Gewicht</em> einer Daphnie, die
			<em>Temperatur</em> eines Gewässers. Hier darfst du Differenzen bilden und
			rechnen. Die metrische Skala teilt man noch einmal feiner auf:
		</p>

		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>
				Die <Begriff term="Intervallskala" /> hat gleiche Abstände, aber
				<strong>keinen echten Nullpunkt</strong>. Die Temperatur in °C ist das
				Standardbeispiel: 20 °C ist nicht „doppelt so warm“ wie 10 °C, weil der
				Nullpunkt willkürlich gesetzt ist. Differenzen sind sinnvoll, Verhältnisse
				nicht.
			</li>
			<li>
				Die <Begriff term="Verhältnisskala" /> hat zusätzlich einen
				<strong>echten Nullpunkt</strong> (null bedeutet „nichts davon“). Länge,
				Gewicht, Anzahl Eier. Hier sind auch Verhältnisse sinnvoll: ein 6 cm langer
				Fisch ist doppelt so lang wie ein 3 cm langer.
			</li>
		</ul>

		<FormelZeigen
			formula={String.raw`\text{nominal} \;\subset\; \text{ordinal} \;\subset\; \underbrace{\text{Intervall} \;\subset\; \text{Verhältnis}}_{\text{metrisch}}`}
			symbols={[
				{ sym: String.raw`\text{nominal}`, bedeutung: 'Nur Kategorien (gleich/ungleich). Erlaubt: zählen.' },
				{ sym: String.raw`\text{ordinal}`, bedeutung: 'Zusätzlich eine Rangfolge. Erlaubt: ordnen, Median.' },
				{ sym: String.raw`\text{Intervall}`, bedeutung: 'Gleiche Abstände, kein echter Nullpunkt (z. B. °C). Erlaubt: Differenzen, Mittelwert.' },
				{ sym: String.raw`\text{Verhältnis}`, bedeutung: 'Zusätzlich echter Nullpunkt (z. B. Länge). Erlaubt: auch Verhältnisse.' },
				{ sym: String.raw`\subset`, bedeutung: 'Jede höhere Skala kann alles, was die niedrigere kann, und mehr.' }
			]}
		/>

		<Merke title="Das Skalenniveau bestimmt den Test">
			Welcher Test erlaubt ist, hängt direkt vom Skalenniveau ab. Ein t-Test oder
			eine Korrelation brauchen <strong>metrische</strong> Daten; bei
			<strong>ordinalen</strong> greifst du zu Rangverfahren (z. B. Spearman statt
			Pearson), bei <strong>nominalen</strong> zählst du Häufigkeiten und nutzt den
			Chi-Quadrat-Test. Deshalb steht die Frage nach dem Skalenniveau ganz am Anfang
			jeder Testwahl — du triffst sie wieder, wenn es um „welcher Test passt?“ geht.
		</Merke>

		<Analogie title="Vom Etikett zum Lineal">
			Stell dir drei Werkzeuge vor. Nominal ist ein <em>Etikett</em>: es benennt nur,
			ohne zu ordnen. Ordinal ist eine <em>Treppe</em>: du weißt, welche Stufe höher
			liegt, aber nicht, wie hoch jede einzelne ist. Metrisch ist ein <em>Lineal</em>
			mit gleichmäßigen Strichen — und die Verhältnisskala ein Lineal, das echt bei
			null beginnt. Je weiter rechts, desto mehr darfst du damit anstellen.
		</Analogie>

		<!-- Sortier-Spiel -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Theorie sitzt am besten, wenn du sie anwendest. Unten findest du acht
			alltägliche Aussagen. Entscheide bei jeder, ob sie nur <em>beschreibt</em>
			(deskriptiv), auf die Grundgesamtheit <em>schließt</em> (inferentiell) oder
			eine neue Hypothese <em>entdeckt</em> (explorativ). Du bekommst sofort eine
			Rückmeldung mit kurzer Begründung.
		</p>

		<SortierSpiel />

		<!-- Beobachtend vs. manipulativ ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Beobachten oder eingreifen?</h2>
		<p class="text-ink-soft leading-relaxed">
			Eine der wichtigsten Unterscheidungen überhaupt betrifft die Art, wie Daten
			entstehen. In einer <strong>beobachtenden</strong> Studie schaust du nur zu
			und misst, was ohnehin passiert. In einem <strong>manipulativen</strong>
			(kontrollierten) Experiment greifst du selbst ein: Du setzt gezielt eine
			Ursache und teilst die Fälle am besten zufällig auf Gruppen auf.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Dieser Unterschied entscheidet darüber, ob du einen
			<Begriff term="Kausalschluss" /> ziehen darfst. Nur das kontrollierte
			Experiment erlaubt die Aussage „A verursacht B“. Beim reinen Beobachten
			lauert immer ein <Begriff term="Störfaktor" />: eine dritte Größe, die
			sowohl A als auch B beeinflusst und so einen Zusammenhang vortäuscht, den es
			gar nicht gibt.
		</p>

		<Analogie title="Eis und Sonnenbrände">
			An Tagen mit viel Eisverkauf gibt es auch viele Sonnenbrände. Verursacht das
			Eis den Sonnenbrand? Natürlich nicht — die <em>Sonne</em> treibt beides
			gleichzeitig nach oben. Sie ist der Störfaktor. Erst wenn du gezielt
			eingreifst (und nicht nur beobachtest), kannst du solche Scheinzusammenhänge
			ausschließen.
		</Analogie>

		<!-- Explorativ vs. konfirmatorisch --------------------------------------- -->
		<h2 class="mt-4 text-2xl">Entdecken oder prüfen?</h2>
		<p class="text-ink-soft leading-relaxed">
			Eng damit verwandt ist die Frage, ob du Daten <strong>explorativ</strong>
			oder <strong>konfirmatorisch</strong> verwendest. Explorativ heißt: Du
			durchsuchst die Daten offen nach Auffälligkeiten und entwickelst Hypothesen.
			Konfirmatorisch heißt: Du hast vorab eine klare Hypothese und prüfst gezielt,
			ob die Daten sie stützen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Die Falle dabei: Eine Hypothese, die du erst in einem Datensatz
			<em>gefunden</em> hast, darfst du nicht an <em>genau denselben</em> Daten als
			„bestätigt“ ausgeben. Wer lange genug sucht, findet in jedem Datensatz ein
			Muster — auch eines, das nur Zufall ist. Eine explorativ entdeckte Hypothese
			braucht zur Bestätigung <strong>neue, unabhängige Daten</strong>.
		</p>

		<Merke title="Die goldene Regel">
			Such und prüf nie am selben Datensatz. Erst explorieren, dann mit frischen
			Daten konfirmatorisch testen — sonst bestätigst du dir nur deinen eigenen
			Zufallsfund.
		</Merke>

		<!-- Kernbotschaft -------------------------------------------------------- -->
		<Intuition title="Statistik ist kein Kochbuch">
			Die wichtigste Botschaft dieser Lektion: Statistik kann schlecht erhobene
			Daten nicht reparieren. Keine Formel rettet eine verzerrte Stichprobe oder
			einen übersehenen Störfaktor. Deshalb zählt das Verständnis der
			<em>Annahmen</em> hinter einem Verfahren mehr als das Auswendiglernen der
			Formel. Wenn du weißt, <em>warum</em> und <em>wann</em> etwas funktioniert,
			triffst du bessere Entscheidungen als jeder, der nur Rezepte abarbeitet.
		</Intuition>

		<!-- Selbsttest ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Sitzt es? Vier kurze Fragen</h2>
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
