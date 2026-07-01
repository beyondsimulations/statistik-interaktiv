<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
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
				'Ottos Feldtest auf einen Erreger bei gefangenen Wildtieren hat eine Sensitivität von 99 %. Was bedeutet diese Zahl genau?',
			options: [
				'P(positiv | infiziert) — von den infizierten Tieren werden 99 % positiv getestet.',
				'P(infiziert | positiv) — von den positiv getesteten Tieren sind 99 % infiziert.',
				'P(infiziert) — 99 % der Population sind infiziert.'
			],
			correct: 0,
			explanation:
				'Genau. Die Sensitivität ist P(positiv | infiziert): die Richtung "von der Infektion zum Testergebnis". Die viel wichtigere Frage P(infiziert | positiv) ist die umgekehrte Richtung und kann ganz anders ausfallen.'
		},
		{
			id: 'wb-2',
			kind: 'mc',
			prompt:
				'Der Erreger ist in der Wildpopulation sehr selten (Prävalenz 0,5 %), der Feldtest ist gut (Sensitivität 99 %, Spezifität 95 %). Warum ist ein positiv getestetes Tier trotzdem meist ein Fehlalarm?',
			options: [
				'Weil der Test eine zu niedrige Sensitivität hat.',
				'Weil es so viele gesunde Tiere gibt, dass selbst 5 % falsch-positive unter ihnen die wenigen richtig-positiven Infizierten zahlenmäßig erschlagen.',
				'Weil die Spezifität niemals eine Rolle spielt.'
			],
			correct: 1,
			explanation:
				'Richtig, das ist der Basisraten-Effekt. Bei 10.000 gefangenen Tieren sind nur etwa 50 infiziert (davon ~50 positiv), aber 9.950 gesund, von denen 5 % (~498) fälschlich positiv anschlagen. Die falsch-positiven übertreffen die richtig-positiven deutlich, also ist P(infiziert|positiv) klein (~9 %).'
		},
		{
			id: 'wb-3',
			kind: 'tf',
			prompt:
				'Eine hohe Sensitivität allein garantiert, dass ein positiv getestetes Wildtier mit hoher Wahrscheinlichkeit auch wirklich infiziert ist.',
			correct: false,
			explanation:
				'Falsch. Der positive prädiktive Wert P(infiziert|positiv) hängt zusätzlich von der Prävalenz und der Spezifität ab. Bei einem seltenen Erreger kann er trotz hoher Sensitivität sehr niedrig sein.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Von der Laplace-Wahrscheinlichkeit über die Rechenregeln bis zum Satz von Bayes — warum ein positiver Test bei seltenen Krankheiten oft ein Fehlalarm ist. Mit interaktiver Bayes-Box."
>
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
			rechnet. Und am Ende wartet der vielleicht überraschendste Satz der ganzen
			Statistik. Er erklärt, warum ein positiver Krankheitstest oft viel weniger
			bedeutet, als man denkt, etwa wenn Otto im Feld ein gefangenes Wildtier auf
			einen seltenen Erreger testet.
		</p>

		<Rueckblick {slug} />

		<!-- Grundbegriffe -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Grundbegriffe</h2>
		<p class="text-ink-soft leading-relaxed">
			Alles beginnt mit einem <Begriff term="Zufallsexperiment" />: einem Vorgang,
			dessen Ausgang ungewiss ist und den man sich beliebig oft wiederholt denken
			kann: ein Würfelwurf, ein Münzwurf, ein Erreger-Feldtest. Alle möglichen Ergebnisse
			zusammen bilden den <Begriff term="Ergebnisraum" />. Beim Würfel ist das
			&#123;1, 2, 3, 4, 5, 6&#125;. Ein <Begriff term="Ereignis" /> ist dann
			einfach eine Teilmenge davon, also eine Aussage, die eintreten kann oder
			nicht, zum Beispiel „eine gerade Zahl würfeln“ = &#123;2, 4, 6&#125;.
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
			(wie beim fairen Würfel), nutzt du die
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
			„wahre“ Wahrscheinlichkeit gar nicht, etwa ob eine Reißzwecke auf den Kopf
			oder auf die Seite fällt. Dann hilft die <strong>empirische
			Wahrscheinlichkeit</strong>: Du wiederholst das Experiment oft und nimmst die
			<Begriff term="relative Häufigkeit" /> (Treffer geteilt durch Versuche) als
			Schätzung. Je öfter du wirfst, desto näher liegt dieser Anteil an der wahren
			Wahrscheinlichkeit.
		</p>

		<Merke title="Zwei Wege zur Wahrscheinlichkeit">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Laplace:</strong> günstige/mögliche, nur bei gleich wahrscheinlichen
					Ergebnissen.
				</li>
				<li>
					<strong>Empirisch:</strong> relative Häufigkeit aus vielen Wiederholungen,
					immer möglich, wenn du das Experiment wiederholen kannst.
				</li>
			</ul>
		</Merke>

		<!-- Kombinatorik --------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Kombinatorik: die möglichen Fälle zählen</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Laplace-Formel verlangt die <em>Anzahl möglicher Fälle</em>. Bei einem
			Würfel sind das sechs, leicht abgezählt. Aber wie viele Möglichkeiten gibt es,
			<strong>k von n</strong> markierten Tieren wieder einzufangen, oder in welcher
			Reihenfolge drei Würfel fallen können? Hier hilft die
			<Begriff term="Kombinatorik" />, die Kunst des systematischen Zählens. Schon
			Galileo zählte die Würfe dreier Würfel durch, um zu klären, warum bei drei
			Würfeln die Augensumme 10 etwas häufiger fällt als die 9 — obwohl sich beide
			scheinbar gleich oft als Summe darstellen lassen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Das Fundament ist das <Begriff term="Zählprinzip" /> (fundamental counting):
			Hat ein erster Schritt <strong>a</strong> Möglichkeiten und ein unabhängiger
			zweiter <strong>b</strong>, so gibt es zusammen <strong>a · b</strong>
			Kombinationen. Drei Würfel haben deshalb 6 · 6 · 6 = 216 mögliche Wurf­folgen.
			Genau dieses „mal“ erklärt, warum die Zahl der Möglichkeiten so schnell groß
			wird. Ein anderes berühmtes Würfelrätsel ist das <em>de-Méré-Paradox</em>: Wie
			wahrscheinlich ist mindestens eine Doppelsechs in 24 Würfen zweier Würfel? Auch
			das löst man, indem man die günstigen gegen die 36<sup>24</sup> möglichen
			Wurffolgen abzählt.
		</p>

		<FormelZeigen
			formula={String.raw`N = n_1 \cdot n_2 \cdots n_k`}
			symbols={[
				{ sym: String.raw`N`, bedeutung: 'Gesamtzahl der Möglichkeiten über alle Schritte.' },
				{ sym: String.raw`n_i`, bedeutung: 'Anzahl der Möglichkeiten im i-ten Schritt.' },
				{ sym: String.raw`k`, bedeutung: 'Anzahl der (unabhängigen) Schritte.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Wenn du <strong>k aus n</strong> Objekten auswählst, hängt die Anzahl von zwei
			Fragen ab: Spielt die <em>Reihenfolge</em> eine Rolle? Und legst du ein
			gezogenes Objekt <em>zurück</em> oder nicht? Daraus ergeben sich vier Fälle.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Zählt die <strong>Reihenfolge</strong> und ziehst du <strong>ohne
			Zurücklegen</strong>, sprichst du von einer <Begriff term="Permutation" />: Für
			das erste Tier hast du n Möglichkeiten, fürs zweite nur noch n − 1 und so
			weiter, das führt direkt auf n!/(n−k)!. Werden alle n angeordnet, sind es n!.
		</p>

		<FormelZeigen
			formula={String.raw`P(n, k) = \dfrac{n!}{(n-k)!}`}
			symbols={[
				{ sym: String.raw`P(n,k)`, bedeutung: 'Anzahl geordneter Auswahlen von k aus n ohne Zurücklegen (Permutationen).' },
				{ sym: String.raw`n!`, bedeutung: 'n-Fakultät: n · (n−1) · … · 1 — die Möglichkeiten, alle n anzuordnen.' },
				{ sym: String.raw`(n-k)!`, bedeutung: 'Teilt die nicht gezogenen Plätze heraus, die du nicht mehr unterscheidest.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Ist die <strong>Reihenfolge egal</strong> (auch ohne Zurücklegen), zählst du
			jede Gruppe nur einmal, das ist eine <Begriff term="Kombination" />. Du teilst
			die Permutationen noch durch die k! Anordnungen innerhalb jeder Gruppe und
			erhältst den <Begriff term="Binomialkoeffizient">Binomialkoeffizienten</Begriff>
			„n über k“. So zählst du etwa, auf wie viele Arten du <strong>k von n</strong>
			markierten Lachsen aus dem Netz greifen kannst.
		</p>

		<FormelZeigen
			formula={String.raw`\binom{n}{k} = \dfrac{n!}{k!\,(n-k)!}`}
			symbols={[
				{ sym: String.raw`\binom{n}{k}`, bedeutung: '„n über k": Anzahl ungeordneter Auswahlen von k aus n ohne Zurücklegen (Kombinationen).' },
				{ sym: String.raw`k!`, bedeutung: 'Teilt die k! Reihenfolgen innerhalb einer Gruppe heraus, weil sie hier nicht zählen.' },
				{ sym: String.raw`(n-k)!`, bedeutung: 'Wie bei der Permutation: die nicht gewählten Objekte.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Darf ein Objekt <strong>mehrfach</strong> vorkommen (Ziehen
			<strong>mit Zurücklegen</strong>, Reihenfolge zählt), bleibt es bei jedem der k
			Schritte bei allen n Möglichkeiten, das Zählprinzip liefert direkt
			<strong>n<sup>k</sup></strong>. Genau so entstehen die 6³ = 216 Wurffolgen
			dreier Würfel.
		</p>

		<FormelZeigen
			formula={String.raw`N = n^k`}
			symbols={[
				{ sym: String.raw`n^k`, bedeutung: 'Möglichkeiten beim Ziehen mit Zurücklegen, wenn die Reihenfolge zählt (k Schritte, je n Optionen).' },
				{ sym: String.raw`n`, bedeutung: 'Anzahl der Optionen pro Schritt (bleibt konstant, weil zurückgelegt wird).' },
				{ sym: String.raw`k`, bedeutung: 'Anzahl der Ziehungen.' }
			]}
		/>

		<Merke title="Zwei Fragen entscheiden, was du rechnest">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Reihenfolge zählt, ohne Zurücklegen:</strong> Permutation n!/(n−k)!.
				</li>
				<li>
					<strong>Reihenfolge egal, ohne Zurücklegen:</strong> Kombination
					„n über k“ = n!/(k!·(n−k)!).
				</li>
				<li>
					<strong>Reihenfolge zählt, mit Zurücklegen:</strong> n<sup>k</sup>.
				</li>
			</ul>
			Frag dich also immer zuerst: Spielt die Reihenfolge eine Rolle — und lege ich
			zurück?
		</Merke>

		<Analogie title="Drei markierte Lachse aus dem Netz">
			Du hast n = 10 markierte Lachse im Teich und fängst k = 3. Ist dir egal,
			<em>welche</em> drei (nur die Gruppe zählt), gibt es „10 über 3“ = 120
			Möglichkeiten. Achtest du dagegen auf die <em>Reihenfolge</em> des Fangs, sind
			es 10 · 9 · 8 = 720. Und dürftest du denselben Fisch theoretisch mehrfach
			fangen (mit Zurücklegen, mit Reihenfolge), wären es sogar 10³ = 1000. Dieselbe
			Ausgangslage, drei sehr verschiedene Zahlen.
		</Analogie>

		<!-- Rechenregeln --------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die wichtigsten Rechenregeln</h2>
		<p class="text-ink-soft leading-relaxed">
			Mit drei Regeln kommst du erstaunlich weit. Du musst sie nicht auswendig
			lernen. Wichtiger ist, dass du verstehst, <em>warum</em> sie so aussehen.
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
			abziehen, sonst zählst du sie doppelt.
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
			beide Ereignisse <strong>unabhängig</strong> (beeinflusst das eine das andere
			also nicht), multiplizierst du ihre Wahrscheinlichkeiten einfach.
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
			brauchst aber die andere. Ottos Feldtest sagt ihm P(positiv | infiziert),
			wie gut er infizierte Tiere erkennt. Ihn interessiert aber P(infiziert |
			positiv): Ist das gefangene Tier <em>wirklich</em> infiziert, jetzt wo sein
			Test positiv anschlägt? Der <Begriff term="Satz von Bayes" /> dreht genau
			diese Richtung um.
		</p>

		<FormelZeigen
			formula={String.raw`P(A \mid B) = \dfrac{P(B \mid A) \cdot P(A)}{P(B)}`}
			symbols={[
				{ sym: String.raw`P(A \mid B)`, bedeutung: 'Die gesuchte Richtung, z. B. P(infiziert | positiv).' },
				{ sym: String.raw`P(B \mid A)`, bedeutung: 'Die bekannte Richtung, z. B. P(positiv | infiziert) = Sensitivität.' },
				{ sym: String.raw`P(A)`, bedeutung: 'Die Grundwahrscheinlichkeit von A vor dem Test (z. B. die Prävalenz).' },
				{ sym: String.raw`P(B)`, bedeutung: 'Wie wahrscheinlich B insgesamt ist (z. B. überhaupt positiv getestet zu werden).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Wenden wir das auf Ottos Feldtest an einer Wildpopulation an. Drei Größen
			reichen aus:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>
				die <Begriff term="Prävalenz" /> P(infiziert), also wie verbreitet der Erreger
				in der Population überhaupt ist,
			</li>
			<li>
				die <Begriff term="Sensitivität" /> P(positiv | infiziert), also wie
				zuverlässig der Test infizierte Tiere erkennt,
			</li>
			<li>
				die <Begriff term="Spezifität" /> P(negativ | gesund), also wie zuverlässig er
				gesunde Tiere als gesund erkennt.
			</li>
		</ul>
		<p class="text-ink-soft leading-relaxed">
			Daraus berechnet Bayes den <Begriff term="Positiver prädiktiver Wert">positiven
			prädiktiven Wert</Begriff> P(infiziert | positiv), die Zahl, die Otto bei
			einem positiv getesteten Tier wirklich interessiert.
		</p>

		<!-- DER zentrale Aha-Moment ---------------------------------------------- -->
		<Intuition title="P(A|B) ist nicht P(B|A)">
			Das ist der Kern dieser Lektion — und einer der häufigsten Denkfehler
			überhaupt. <strong>P(positiv | infiziert)</strong> und <strong>P(infiziert |
			positiv)</strong> sind zwei völlig verschiedene Zahlen. Ein Test kann
			infizierte Tiere fast perfekt erkennen (Sensitivität 99 %) und trotzdem kann
			es sein, dass die <em>meisten</em> positiven Ergebnisse Fehlalarme sind. Der
			Grund ist die <strong>Basisrate</strong>: Ist ein Erreger in der Population
			selten, gibt es so viele gesunde Tiere, dass selbst ein kleiner Prozentsatz
			falsch-positiver unter ihnen die wenigen echt Infizierten zahlenmäßig
			überholt. Genau das machst du gleich sichtbar.
		</Intuition>

		<!-- Die Bayes-Box -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus: die Bayes-Box</h2>
		<p class="text-ink-soft leading-relaxed">
			Stell dir 10.000 gefangene Tiere als Raster vor. Mit den drei Reglern teilst
			du sie in vier Gruppen auf. Geh am besten so vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				Lass die Startwerte stehen (Prävalenz 0,5 %, Sensitivität 99 %, Spezifität
				95 %) und schau dir die große Prozentzahl an.
			</li>
			<li>
				Vergleiche die <strong>richtig-positiven</strong> mit den
				<strong>falsch-positiven</strong>: Obwohl der Test gut ist, dominieren die
				Fehlalarme.
			</li>
			<li>
				Zieh nun die <strong>Prävalenz</strong> hoch (z. B. auf 20 %) und beobachte,
				wie P(krank | positiv) plötzlich nach oben springt.
			</li>
		</ol>

		<BayesBox />

		<Intuition title="Der Basisraten-Effekt, in Zahlen">
			Bei 10.000 gefangenen Tieren und 0,5 % Prävalenz sind nur etwa 50 wirklich
			infiziert. Davon erkennt der Test bei 99 % Sensitivität rund 50. Unter den
			9.950 gesunden Tieren schlägt er aber bei 5 % fälschlich an, das sind fast
			500 falsch-positive. Von allen rund 550 positiven Tests sind also nur etwa 50
			echt: knapp 9 %. Eine hohe Sensitivität rettet dich nicht vor einer niedrigen
			Basisrate.
		</Intuition>

		<Merke title="So liest du ein positives Testergebnis">
			Frag immer nach drei Dingen: Wie selten ist der Erreger in der Population
			(Prävalenz)? Wie gut erkennt der Test infizierte Tiere (Sensitivität)? Und
			wie oft schlägt er bei gesunden Tieren fälschlich an (1 − Spezifität)? Erst
			alle drei zusammen ergeben P(infiziert | positiv).
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
					Geschafft! Diese Lektion ist als abgeschlossen markiert. Den Haken
					findest du jetzt auch in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
