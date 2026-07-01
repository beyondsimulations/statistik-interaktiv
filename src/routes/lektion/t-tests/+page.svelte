<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import SignalRausch from '$lib/widgets/SignalRausch.svelte';
	import AnnahmenBaum from '$lib/widgets/AnnahmenBaum.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import RCode from '$lib/components/RCode.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 't-tests';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'tt-1',
			kind: 'mc',
			prompt:
				'Du misst dieselbe Mittelwertdifferenz Δ = 300 km in der Zugdistanz von Buchfink und Mönchsgrasmücke. In welchem Szenario ist das Ergebnis am ehesten signifikant?',
			options: [
				'Große Streuung s innerhalb der Gruppen, kleines n — viel Rauschen, wenig Daten.',
				'Kleine Streuung s innerhalb der Gruppen, großes n — wenig Rauschen, viele Daten.',
				'Die Signifikanz hängt nur von Δ ab, Streuung und n spielen keine Rolle.'
			],
			correct: 1,
			explanation:
				'Genau. Der t-Wert ist Signal ÷ Rausch: t = Δ / SE mit SE = s·√(2/n). Kleine Streuung s macht den Standardfehler klein, großes n drückt ihn über das √n im Nenner zusätzlich. Beides vergrößert t und verkleinert p — derselbe Unterschied wird so von „unbedeutend“ zu „hochsignifikant“.'
		},
		{
			id: 'tt-2',
			kind: 'mc',
			prompt:
				'Du vergleichst die Zugdistanz zweier unabhängiger Arten. Ein F-Test (var.test) auf gleiche Varianzen liefert p = 0,40. Was bedeutet dieser p-Wert hier — und welchen Test wählst du?',
			options: [
				'p = 0,40 > 0,05 → kein Hinweis auf ungleiche Varianzen, die Annahme der Varianzhomogenität ist ok; der Student-t-Test ist vertretbar (in R bleibt Welch trotzdem die sichere Standardwahl).',
				'p = 0,40 beweist, dass die Varianzen exakt gleich sind, also ist zwingend der Student-t-Test vorgeschrieben.',
				'p = 0,40 ist nicht signifikant, also darf gar kein t-Test gerechnet werden.'
			],
			correct: 0,
			explanation:
				'Richtig — und beachte die umgekehrte Logik bei Voraussetzungstests: H₀ ist hier „Varianzen gleich“. Ein großes p (> 0,05) heißt „kein Hinweis auf eine Verletzung“, also Annahme ok. Es beweist die Gleichheit aber nicht. Bei gepaarten Daten (dieselbe Pflanze vorher/nachher) nähme man stattdessen den gepaarten t-Test, der die Differenzen betrachtet.'
		},
		{
			id: 'tt-3',
			kind: 'tf',
			prompt:
				'Wenn die Normalverteilungsannahme verletzt ist, ist der Mann-Whitney-U-Test eine sinnvolle Alternative zum unabhängigen t-Test.',
			correct: true,
			explanation:
				'Wahr. Der Mann-Whitney-U-Test ist rang-/medianbasiert und verteilungsfrei: Er setzt keine Normalverteilung voraus und ist robuster gegen Ausreißer. Er hat nur etwas geringere Power, wenn die Daten eigentlich doch normalverteilt wären. Das gepaarte Pendant ist der Wilcoxon-Vorzeichen-Rang-Test.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Der t-Wert als Signal-zu-Rausch-Verhältnis: Ein-Stichproben-, Student-, Welch- und gepaarter t-Test, ihre Voraussetzungen (Unabhängigkeit, Normalverteilung, Varianzhomogenität) und die nicht-parametrischen Alternativen Mann-Whitney-U und Wilcoxon. Mit Signal-vs-Rausch-Regler und interaktivem Entscheidungsbaum — biologisch motiviert an der Zugdistanz von Buchfink und Mönchsgrasmücke."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Klausur-relevant · Testen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">t-Tests & nicht-parametrische Alternativen</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Zwei Zugvogelarten, Buchfink und Mönchsgrasmücke, legen unterschiedlich weite Strecken ins
			Winterquartier zurück. Du misst die <strong>Zugdistanz</strong> einiger Vögel jeder Art und
			siehst: Im Schnitt fliegt die eine Art ein gutes Stück weiter. Aber ist das ein
			<strong>echter</strong> Artunterschied oder nur Zufall zwischen zwei Stichproben? Der
			<Begriff term="t-Test" /> beantwortet genau das. In dieser Lektion lernst du die eine Intuition,
			die alles zusammenhält: Der t-Wert ist ein <strong>Signal-zu-Rausch-Verhältnis</strong>.
		</p>

		<Rueckblick {slug} />

		<Callout variant="merke" title="Unser rotes Beispiel durch die ganze Lektion">
			Die Forschungsfrage lautet: <strong
				>Unterscheidet sich die mittlere Zugdistanz (km) von Buchfink und Mönchsgrasmücke?</strong
			> Daran hängen wir jeden Begriff auf — und der Signal-vs-Rausch-Regler misst genau diese Distanzen
			immer wieder neu.
		</Callout>

		<!-- DIE zentrale Intuition ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die zentrale Idee: Signal geteilt durch Rauschen</h2>
		<p class="text-ink-soft leading-relaxed">
			Stell dir den t-Wert als eine einzige, ehrliche Frage vor: <em
				>Wie groß ist der beobachtete Unterschied im Vergleich dazu, wie stark er allein durch Zufall
				schwanken würde?</em
			> Oben im Zähler steht das <strong>Signal</strong>, die Differenz der mittleren Zugdistanzen.
			Unten im Nenner steht das <strong>Rauschen</strong>: der <Begriff term="Standardfehler" /> der
			Differenz, also wie stark dieser Unterschied von Stichprobe zu Stichprobe wackeln würde.
		</p>

		<Intuition title="Derselbe Unterschied — mal Lärm, mal Signal">
			Ein Unterschied von 300 km ist für sich genommen nichts wert. Streuen die einzelnen Vögel
			jeder Art stark (großes <Begriff term="Standardabweichung">s</Begriff>), geht der Unterschied
			im Rauschen unter: kleines t, großes p, <strong>nicht signifikant</strong>. Streuen sie eng,
			sticht derselbe Unterschied klar heraus: großes t, kleines p,
			<strong>hochsignifikant</strong>. Und das <strong>√n</strong> steht im Nenner des Standardfehlers:
			Mehr gemessene Vögel machen den Standardfehler kleiner und denselben Unterschied leichter signifikant.
		</Intuition>

		<p class="text-ink-soft leading-relaxed">
			Und woher kommt die <strong>2</strong> unter der Wurzel? Du vergleichst
			<strong>zwei</strong> Gruppen, und jede bringt ihre eigene Streuung mit. Beide
			Unsicherheiten addieren sich zum Rauschen der Differenz — daher die 2. Die folgende Formel
			gilt für den <strong>vereinfachten Fall</strong> gleich großer Gruppen (gleiches n) mit
			gleicher Streuung (gleiches s) — genau die Welt des Reglers gleich unten.
		</p>

		<FormelZeigen
			formula={String.raw`t = \frac{\text{Signal}}{\text{Rausch}} = \frac{\bar x_1 - \bar x_2}{SE_{\text{Differenz}}} \qquad SE_{\text{Differenz}} = s \cdot \sqrt{\tfrac{2}{n}}`}
			symbols={[
				{ sym: String.raw`\bar x_1 - \bar x_2`, bedeutung: 'Das Signal: der beobachtete Unterschied der mittleren Zugdistanzen (Δ).' },
				{ sym: String.raw`SE_{\text{Differenz}}`, bedeutung: 'Das Rauschen: der Standardfehler der Differenz — wie stark der Unterschied allein durch Zufall schwankt.' },
				{ sym: String.raw`s`, bedeutung: 'Die Streuung innerhalb der Gruppen (Standardabweichung). Mehr Streuung → mehr Rauschen → kleineres t.' },
				{ sym: String.raw`n`, bedeutung: 'Der Stichprobenumfang je Gruppe. Das √n im Nenner heißt: mehr Daten → kleinerer Standardfehler → größeres t.' },
				{ sym: String.raw`t`, bedeutung: 'Die Teststatistik. Je weiter von 0 entfernt, desto unwahrscheinlicher unter H₀ — desto kleiner der p-Wert.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Sind die Gruppen unterschiedlich groß oder streuen sie unterschiedlich stark, rechnet man den
			Standardfehler aus beiden Stichprobenvarianzen einzeln — die Signal-durch-Rausch-Intuition
			bleibt dabei genau dieselbe.
		</p>

		<!-- Der Signal-vs-Rausch-Regler ----------------------------------------- -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Signal-vs-Rausch-Regler</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier wird die Intuition zum Anfassen. Die grüne Glocke ist die Zugdistanz der Buchfinken, die
			korallene die der Mönchsgrasmücken; die Punkte sind beispielhafte gemessene Vögel. Oben liest du
			live den t-Wert und den p-Wert ab. Probier:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Lass <strong>Δ</strong> fest und dreh die <strong>Streuung s</strong> hoch: t schrumpft, p wächst, derselbe Unterschied wird unbedeutend.</li>
			<li>Dreh s wieder klein — t wächst, p sinkt, das Ergebnis kippt zurück auf signifikant.</li>
			<li>Erhöh den <strong>Stichprobenumfang n</strong>: über das √n im Standardfehler steigt t ebenfalls, p fällt.</li>
			<li>Setz <strong>Δ = 0</strong>: Es gibt keinen Unterschied mehr, t fällt auf 0 und p geht gegen 1.</li>
		</ol>

		<SignalRausch />

		<Merke title="Was der Regler zeigt">
			Signifikanz ist kein Maß für die Größe eines Effekts. Ein kleiner Unterschied wird bei riesigem
			n signifikant, ein großer Unterschied bleibt bei viel Rauschen unentdeckt. Der t-Wert wägt
			immer <strong>Signal gegen Rausch</strong> ab. Deshalb gehört zu jedem p-Wert auch ein Blick
			auf die Effektgröße.
		</Merke>

		<!-- Effektgröße: Cohen's d ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Wie groß ist der Effekt? Cohen's d</h2>
		<p class="text-ink-soft leading-relaxed">
			Ein p-Wert sagt dir, <em>ob</em> ein Unterschied wahrscheinlich echt ist — aber nicht, wie
			<strong>groß</strong> er ist. Genau das ist der Unterschied zwischen <strong>signifikant</strong>
			und <strong>relevant</strong>. Wie du am Regler gesehen hast, wird bei riesigem n schon eine
			winzige Differenz signifikant: Buchfink und Mönchsgrasmücke könnten sich im Mittel um lächerliche
			5 km unterscheiden, und mit genug Vögeln wäre selbst das „hochsignifikant“, biologisch aber
			völlig belanglos. Deshalb gehört zu jedem p-Wert eine <Begriff term="Effektstärke" />.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Das gängigste Maß beim t-Test ist <strong>Cohen's d</strong>. Die Idee ist verblüffend einfach:
			Miss die Mittelwertdifferenz nicht in Kilometern, sondern in <strong>Standardabweichungen</strong>
			— dann wird sie über Arten und Messgrößen hinweg vergleichbar. Als Maßstab dient dabei die
			<strong>gepoolte Standardabweichung</strong> s<sub>p</sub>: die gemeinsame Streuung, die man aus
			beiden Gruppen zu einem Wert zusammenfasst. Ein d = 1 heißt dann „die beiden Arten liegen im
			Schnitt eine ganze Streuungsbreite auseinander“, eine Aussage, die unabhängig von
			Stichprobengröße und Messeinheit ist.
		</p>

		<FormelZeigen
			formula={String.raw`d = \frac{\bar x_1 - \bar x_2}{s_p}`}
			symbols={[
				{ sym: String.raw`\bar x_1 - \bar x_2`, bedeutung: 'Die rohe Mittelwertdifferenz Δ (z. B. die 310 km Unterschied in der Zugdistanz).' },
				{ sym: String.raw`s_p`, bedeutung: 'Die gepoolte (gemeinsame) Standardabweichung beider Gruppen — das Streuungsmaß, in dem die Differenz gemessen wird.' },
				{ sym: String.raw`d`, bedeutung: 'Cohen\'s d: der Abstand der Mittelwerte in SD-Einheiten. Einheitenlos und unabhängig von n.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Rechnen wir es für die Zugvögel durch. Die beiden Arten unterscheiden sich um Δ = 310 km, und die
			gepoolte Streuung der Zugdistanzen beträgt s<sub>p</sub> ≈ 320 km. Also d = 310 / 320 ≈
			<strong>0,97</strong>, ein <strong>großer</strong> Effekt: Die mittlere Zugdistanz der beiden
			Arten liegt fast eine volle Standardabweichung auseinander. Zur Einordnung dienen Cohens
			Faustwerte:
		</p>

		<Merke title="Faustwerte für Cohen's d">
			<ul class="ml-5 list-disc space-y-1">
				<li><strong>d ≈ 0,2</strong> — kleiner Effekt (die Verteilungen überlappen stark).</li>
				<li><strong>d ≈ 0,5</strong> — mittlerer Effekt (mit bloßem Auge erkennbar).</li>
				<li><strong>d ≈ 0,8</strong> — großer Effekt (die Gruppen trennen sich deutlich).</li>
			</ul>
			Unser d ≈ 0,97 liegt darüber: ein klar großer, biologisch bedeutsamer Artunterschied, nicht
			nur ein signifikanter.
		</Merke>

		<Callout variant="warnung" title="Signifikant heißt nicht relevant">
			Der <strong>p-Wert</strong> hängt von Effekt <em>und</em> Stichprobengröße ab, Cohen's d
			dagegen <strong>nur vom Effekt</strong>. Ein winziges, belangloses d kann bei riesigem n
			signifikant werden; ein großes, biologisch wichtiges d kann bei kleinem n unentdeckt bleiben.
			Berichte deshalb immer <strong>beides</strong>: den p-Wert (gibt es den Effekt?) und die
			Effektstärke (wie groß ist er?). Das gilt genauso für die rangbasierten Alternativen — auch ein
			signifikanter, einseitig getesteter Mann-Whitney-U-Test sagt nur <em>dass</em>, nicht
			<em>wie stark</em> sich die Lagen unterscheiden.
		</Callout>

		<!-- Die drei t-Test-Varianten ------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Drei Situationen, drei t-Tests</h2>
		<p class="text-ink-soft leading-relaxed">
			Je nach Datenlage gibt es verschiedene Spielarten des t-Tests. Die Signal-durch-Rausch-Idee
			steckt in allen.
		</p>

		<h3 class="mt-2 text-xl">1 · Ein-Stichproben-t-Test</h3>
		<p class="text-ink-soft leading-relaxed">
			Nimm ihn, wenn du nur <em>eine</em> Gruppe hast und sie gegen einen festen, vorher bekannten
			Vergleichswert prüfst. Der <Begriff term="Ein-Stichproben-t-Test" /> vergleicht den Mittelwert
			<em>einer</em> Stichprobe mit diesem festen Wert μ₀ (sprich „mü null“ — der erwartete Wert aus
			Theorie oder Literatur). Beispiel: Aus der Literatur „weiß“ man, Buchfinken ziehen im Mittel
			1500 km, also μ₀ = 1500. Stimmt das für deine gemessene Population? Signal ist x̄ − μ₀, Rauschen
			der Standardfehler des einen Mittelwerts.
		</p>

		<h3 class="mt-2 text-xl">2 · Zwei unabhängige Stichproben: Student vs. Welch</h3>
		<p class="text-ink-soft leading-relaxed">
			Nimm sie, wenn du zwei <strong>unabhängige</strong> Gruppen vergleichst (Buchfink vs.
			Mönchsgrasmücke). Hier gibt es zwei Varianten, und sie unterscheiden sich nur in einer Frage:
			Darfst du annehmen, dass beide Gruppen gleich stark streuen? Der
			<Begriff term="Student-t-Test" /> nimmt an, dass beide Gruppen
			<strong>dieselbe Varianz</strong> haben, und „poolt“ die Streuung zu einem gemeinsamen
			Schätzer. Der <Begriff term="Welch-Test" /> verzichtet auf diese Annahme: Er erlaubt
			<strong>ungleiche Varianzen</strong> und korrigiert dafür die Freiheitsgrade (mit einer kleinen
			Korrektur namens Welch-Satterthwaite — die Details brauchst du dir nicht zu merken). In R ist
			Welch der <strong>Standard</strong> von <code class="font-mono text-sm">t.test()</code>, und das
			aus gutem Grund: Er ist robuster und kostet bei gleichen Varianzen kaum Genauigkeit.
		</p>

		<Callout variant="merke" title="Faustregel Student vs. Welch">
			Im Zweifel <strong>Welch</strong>. Sind die Varianzen erkennbar gleich und die Gruppen gleich
			groß, liefern Student und Welch ohnehin fast dasselbe. Sind die Varianzen ungleich, schützt dich
			nur Welch vor einem verfälschten p-Wert.
		</Callout>

		<h3 class="mt-2 text-xl">3 · Gepaarter t-Test</h3>
		<p class="text-ink-soft leading-relaxed">
			Manchmal sind die beiden Messreihen <strong>nicht unabhängig</strong>, sondern paarweise
			verknüpft: dieselbe Pflanze <em>vor</em> und <em>nach</em> einer Düngebehandlung, oder
			derselbe Vogel in zwei aufeinanderfolgenden Jahren. Dann bildet der
			<Begriff term="gepaarter t-Test">gepaarte t-Test</Begriff> für jedes Paar die
			<strong>Differenz</strong> und testet, ob deren Mittelwert null ist. Der entscheidende Vorteil:
			Die Paarbildung rechnet die Schwankung zwischen den Individuen heraus: weniger Rauschen, mehr
			Power. Wichtig: Die Normalverteilungsannahme betrifft hier die <strong>Differenzen</strong>,
			nicht die Rohwerte.
		</p>

		<FormelZeigen
			formula={String.raw`t_{\text{gepaart}} = \frac{\bar d}{s_d / \sqrt{n}}`}
			symbols={[
				{ sym: String.raw`\bar d`, bedeutung: 'Der Mittelwert der paarweisen Differenzen (z. B. nachher − vorher).' },
				{ sym: String.raw`s_d`, bedeutung: 'Die Standardabweichung dieser Differenzen — das Rauschen, das nach der Paarbildung übrig bleibt.' },
				{ sym: String.raw`n`, bedeutung: 'Die Anzahl der Paare. Auch hier verkleinert √n das Rauschen.' }
			]}
		/>

		<!-- Voraussetzungen ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Voraussetzungen — und ihre verdrehte Logik</h2>
		<p class="text-ink-soft leading-relaxed">
			Damit ein t-Test gültige p-Werte liefert, müssen drei Dinge halten:
		</p>
		<Merke title="Die drei Voraussetzungen des t-Tests">
			<ol class="ml-5 list-decimal space-y-1">
				<li><strong>Unabhängigkeit</strong> der Beobachtungen — keine Vögel doppelt zählen, keine versteckte Paarung (sonst gepaart rechnen).</li>
				<li><strong>Normalverteilung</strong> — die Werte je Gruppe (beim gepaarten Test: die Differenzen) sollten <strong>annähernd</strong> normalverteilt sein. „Annähernd“ heißt grob: keine krassen Ausreißer und keine stark schiefe Verteilung. Und schon „annähernd“ reicht meist: Bei <strong>großem n</strong> (Faustregel: ab etwa 30 pro Gruppe) wird der Test dank des zentralen Grenzwertsatzes robust gegen moderate Abweichungen.</li>
				<li><strong>Varianzhomogenität</strong> — gleiche Streuung in beiden Gruppen. Nur für den Student-t-Test nötig; der Welch-Test verzichtet darauf.</li>
			</ol>
		</Merke>

		<p class="text-ink-soft leading-relaxed">
			Prüfen kannst du das mit eigenen Tests: der <Begriff term="Shapiro-Wilk-Test" /> für die
			Normalität (in R <code class="font-mono text-sm">shapiro.test()</code>) und der F-Test für die
			<Begriff term="Varianzhomogenität" /> (in R <code class="font-mono text-sm">var.test()</code>).
			Doch Vorsicht: Hier lauert ein klassischer Stolperstein.
		</p>

		<Callout variant="warnung" title="Bei Voraussetzungstests drehst du die Logik um">
			<strong>Bei einem Voraussetzungstest willst du ein großes p (> 0,05) — genau das
			Gegenteil vom sonstigen Testdenken.</strong> Der Grund: Bei diesen Tests ist die
			<Begriff term="Nullhypothese" /> die Annahme selbst — „die Daten sind normalverteilt“ bzw. „die
			Varianzen sind gleich“. Ein <strong>kleiner</strong> p-Wert (≤ 0,05) ist hier ein
			<em>Warnsignal</em>: Er verwirft die Annahme. Ein <strong>großer</strong> p-Wert (> 0,05) heißt
			„kein Hinweis auf eine Verletzung“, die Annahme darfst du beibehalten. Im eigentlichen
			Forschungstest wünschst du dir dagegen ein <em>kleines</em> p. Und: Ein großes p
			<strong>beweist</strong> die Annahme nicht — es findet nur keinen Widerspruch.
		</Callout>

		<!-- R-Code t.test ------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So sieht das in R aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Der Befehl <code class="font-mono text-sm">t.test()</code> erledigt alles. Standardmäßig rechnet
			er den Welch-Test. So liest du die Ausgabe:
		</p>

		<RCode
			code={`# Zugdistanz (km) zweier unabhaengiger Arten vergleichen
t.test(distanz ~ art, data = voegel)`}
			output={`	Welch Two Sample t-test

data:  distanz by art
t = -3.142, df = 36.8, p-value = 0.003281
alternative hypothesis: true difference in means
  between group Buchfink and group Moenchsgrasmuecke is not equal to 0
95 percent confidence interval:
 -512.4  -108.7
sample estimates:
  mean in group Buchfink  mean in group Moenchsgrasmuecke
                  1487.3                           1797.8`}
			annotations={{
				't = -3.142': 'Die Teststatistik: Signal ÷ Rausch. Negativ, weil die erste Gruppe (Buchfink) den kleineren Mittelwert hat. Entscheidend ist der Betrag, |t| = 3,14.',
				'df = 36.8': 'Die Welch-Freiheitsgrade — nicht ganzzahlig, weil Welch sie aus beiden Varianzen korrigiert. Das verrät dir, dass hier kein gepoolter Student-Test lief.',
				'p-value = 0.003281': 'Klar kleiner als 0,05 → der Unterschied ist signifikant. Unter „kein Unterschied“ wäre ein so großes |t| sehr unwahrscheinlich.',
				'95 percent ...': 'Das Konfidenzintervall der Differenz: −512 bis −109 km. Es schließt die 0 NICHT ein — passt zum signifikanten p-Wert.',
				'sample estimates': 'Die beiden Gruppenmittel: 1487 km vs. 1798 km. Die Differenz von rund 310 km ist dein Signal.'
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			Brauchst du den Student-Test mit gepoolter Varianz, setzt du <code class="font-mono text-sm"
				>var.equal = TRUE</code
			>; für gepaarte Daten <code class="font-mono text-sm">paired = TRUE</code>.
		</p>

		<!-- Nicht-parametrische Alternativen ------------------------------------ -->
		<h2 class="mt-4 text-2xl">Wenn die Normalität nicht hält: rangbasierte Alternativen</h2>
		<p class="text-ink-soft leading-relaxed">
			Ist die Normalverteilungsannahme deutlich verletzt (oder ist deine Stichprobe so klein, dass du
			es nicht beurteilen kannst), dann greifst du zu einem
			<Begriff term="nicht-parametrischer Test">nicht-parametrischen Test</Begriff>. Diese Tests sind
			<strong>rangbasiert</strong>: Statt mit den Rohwerten rechnen sie nur mit deren Reihenfolge, den
			<strong>Rängen</strong>, und vergleichen eher die Lage (Mediane) als die Mittelwerte. Damit sind
			sie <strong>verteilungsfrei</strong> — sie setzen keine bestimmte Verteilung (etwa die
			Normalverteilung) voraus — und <strong>robuster gegen Ausreißer</strong>: Ein einzelner extrem
			weit ziehender Vogel kippt das Ergebnis nicht. Der Preis: etwas geringere Power, wenn die Daten
			in Wahrheit doch normalverteilt wären.
		</p>

		<Merke title="Das parametrische Paar und seine rangbasierte Alternative">
			<ul class="ml-5 list-disc space-y-1">
				<li>Unabhängige Gruppen: unabhängiger t-Test → <Begriff term="Mann-Whitney-U-Test" /> (auch Wilcoxon-Rangsummen-Test).</li>
				<li>Gepaarte Daten: gepaarter t-Test → <Begriff term="Wilcoxon-Vorzeichen-Rang-Test" />.</li>
			</ul>
		</Merke>

		<Callout variant="warnung" title="Namensfalle: dreimal ähnlich, zweimal dasselbe">
			<strong>Mann-Whitney-U-Test</strong> und <strong>Wilcoxon-Rangsummen-Test</strong> sind nur zwei
			Namen für <strong>dasselbe</strong> Verfahren — das für zwei <strong>unabhängige</strong>
			Gruppen. Verwechsle das nicht mit dem <strong>Wilcoxon-Vorzeichen-Rang-Test</strong>: Das ist
			ein <strong>anderes</strong> Verfahren, nämlich das für <strong>gepaarte</strong> Daten.
		</Callout>

		<RCode
			code={`# Verteilungsfreie Alternative: dieselben Daten, ohne Normalitaetsannahme
wilcox.test(distanz ~ art, data = voegel)`}
			output={`	Wilcoxon rank sum test with continuity correction

data:  distanz by art
W = 88, p-value = 0.004713
alternative hypothesis: true location shift is not equal to 0`}
			annotations={{
				'W = 88': 'Die Rangsummen-Teststatistik (Mann-Whitney-U) — sie beruht auf den Rängen der Distanzen, nicht auf ihren genauen Werten. Deshalb robust gegen Ausreißer.',
				'p-value = 0.004713': 'Auch hier signifikant. Das Ergebnis bestätigt den t-Test, ohne Normalverteilung vorauszusetzen.',
				'location shift': 'Getestet wird eine Lageverschiebung (grob: der Median-/Rangunterschied), nicht der Mittelwert. Daher „location shift“ statt „difference in means“.'
			}}
		/>

		<Analogie title="Ränge statt Maßband">
			Beim t-Test misst du jede Distanz aufs Kilometer genau und mittelst. Beim Mann-Whitney-U-Test
			stellst du alle Vögel der Reihe nach auf — vom kürzesten zum längsten Zug — und schaust nur, ob
			sich eine Art systematisch weiter vorne sammelt. Ein einzelner Ausreißer landet einfach ganz
			hinten in der Schlange, statt den Mittelwert wegzureißen.
		</Analogie>

		<!-- Entscheidungsbaum --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Welcher Test? Klick dich durch</h2>
		<p class="text-ink-soft leading-relaxed">
			Der Entscheidungsbaum führt dich durch die vier Schlüsselfragen — Datentyp, Design, Normalität,
			Varianzen — bis zum passenden Test. Beantworte sie für dein Zugvogel-Beispiel und sieh, wo du
			landest. (Genau diesen Baum vertieft später die Lektion „Welcher Test?“.)
		</p>

		<AnnahmenBaum />

		<Intuition title="In einem Satz">
			Der t-Wert ist Signal ÷ Rausch: mehr Differenz oder weniger Streuung/mehr Daten machen ihn groß
			und p klein; welche t-Test-Variante du nimmst, hängt von Design (ein/gepaart/unabhängig) und
			Varianzen ab — und wenn die Normalität nicht hält, sind Mann-Whitney-U und Wilcoxon die
			robusten, rangbasierten Auswege.
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
