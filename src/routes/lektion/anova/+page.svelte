<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import FRatio from '$lib/widgets/FRatio.svelte';
	import FwerRoulette from '$lib/widgets/FwerRoulette.svelte';
	import SSZerlegung from '$lib/widgets/SSZerlegung.svelte';
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

	const slug = 'anova';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'an-1',
			kind: 'mc',
			prompt:
				'Du willst die Größe von Lachsen in drei Käfigtypen vergleichen. Warum rechnest du EINE ANOVA statt mehrerer einzelner paarweiser t-Tests?',
			options: [
				'Weil die ANOVA rechnerisch einfacher ist als drei t-Tests und schneller läuft.',
				'Weil jeder einzelne t-Test das Niveau α verbraucht: Schon bei drei Vergleichen steigt die familienweise Fehlerrate auf 1 − (1 − 0,05)³ ≈ 14 %, und mit jeder weiteren Gruppe wächst sie rasant. Die ANOVA prüft alle Gruppen in einem Test und hält α ein.',
				'Weil t-Tests nur für genau zwei Gruppen erlaubt sind und bei mehr Gruppen falsche Mittelwerte berechnen.'
			],
			correct: 1,
			explanation:
				'Genau. Das ist das Problem des multiplen Testens: Jeder Vergleich hat seine eigene 5 %-Chance auf einen Fehlalarm. Bei c Vergleichen wächst die familienweise Fehlerrate (FWER) auf 1 − (1 − α)^c — bei drei Gruppen sind das c = 3 Vergleiche und schon ~14 %, bei fünf Gruppen schon c = 10 Vergleiche. Die ANOVA bündelt alles in einen einzigen Test über das F-Verhältnis und kontrolliert α.'
		},
		{
			id: 'an-2',
			kind: 'mc',
			prompt:
				'Was vergleicht das F-Verhältnis in deiner ANOVA — und was bedeutet ein großes F?',
			options: [
				'F = größter Gruppenmittelwert / kleinster Gruppenmittelwert. Ein großes F heißt, die Gruppen sind sehr unterschiedlich groß.',
				'F = Varianz ZWISCHEN den Gruppen / Varianz INNERHALB der Gruppen. Ein großes F heißt: Die Gruppenmittel liegen weit auseinander im Vergleich zur Streuung innerhalb der Gruppen — Signal schlägt Rauschen, der (rechtsseitige) p-Wert wird klein.',
				'F = Stichprobenumfang / Anzahl Gruppen. Ein großes F heißt einfach, dass du viele Daten hast.'
			],
			correct: 1,
			explanation:
				'Richtig. Das F-Verhältnis ist ein Signal-zu-Rausch-Maß: die Streuung zwischen den Gruppenmitteln (erklärt) geteilt durch die Streuung innerhalb der Gruppen (Rauschen). Liegen die Mittel weit auseinander und streut es innerhalb wenig, wird F groß. F wird immer rechtsseitig getestet — großes F → kleiner p-Wert → mindestens ein Gruppenmittel weicht ab.'
		},
		{
			id: 'an-3',
			kind: 'tf',
			prompt:
				'„Eine signifikante ANOVA (p < 0,05) sagt dir bereits, WELCHE Käfigtypen sich in der Lachsgröße unterscheiden.“',
			correct: false,
			explanation:
				'Falsch. Die ANOVA sagt nur: „irgendein Gruppenmittel weicht ab“ — aber nicht welches. Um die konkreten Paare zu finden, brauchst du einen Post-hoc-Test wie Tukey HSD, der die familienweise Fehlerrate kontrolliert. Die ANOVA ist das Eingangstor; Tukey HSD sagt dir dann, welche Türen offen sind.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Die einfaktorielle Varianzanalyse (ANOVA) vergleicht die Mittelwerte mehrerer Gruppen in EINEM Test — am Beispiel der Lachsgröße in verschiedenen Käfigtypen. Das Problem des multiplen Testens und die familienweise Fehlerrate 1 − (1 − α)^c, die Varianzzerlegung SS_total = SS_zwischen + SS_innerhalb, die zentrale Intuition F = Varianz zwischen / Varianz innerhalb, Voraussetzungen (Normalität, Varianzhomogenität/Levene, Unabhängigkeit), die nicht-parametrische Alternative Kruskal-Wallis, Post-hoc-Tests (Tukey HSD), die Effektstärke η² und aov()/TukeyHSD() in R — mit zwei interaktiven Widgets."
>
	<Rueckblick {slug} />

	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Klausur-relevant · Testen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">ANOVA & Mehrstichprobentests</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Der t-Test vergleicht zwei Gruppen. Aber was, wenn du <strong>mehr</strong> hast? Otto
			züchtet Lachse (<em>Salmo salar</em>) in drei verschiedenen Käfigtypen und will wissen, ob
			der Käfigtyp die <strong>Größe</strong> der Fische beeinflusst. Drei Gruppen: Der naive
			Reflex wäre, einfach alle Paare mit t-Tests durchzuprobieren. Genau das geht schief. In
			dieser Lektion lernst du, warum man stattdessen <strong>einen</strong> Test über alle Gruppen
			rechnet: die <Begriff term="ANOVA">Varianzanalyse (ANOVA)</Begriff>.
		</p>

		<!-- Das Problem des multiplen Testens ----------------------------------- -->
		<h2 class="mt-4 text-2xl">Das Problem: viele Vergleiche blähen den Fehler auf</h2>
		<p class="text-ink-soft leading-relaxed">
			Bei drei Käfigtypen gibt es <strong>drei</strong> Paare (Netz–Fest, Netz–Tief, Fest–Tief),
			bei vier Gruppen wären es schon sechs und bei fünf zehn.
			Jeder einzelne t-Test hat seine eigene 5 %-Chance auf einen <Begriff term="Fehler 1. Art"
				>Fehlalarm</Begriff
			>, auch wenn in Wahrheit gar kein Unterschied besteht. Diese kleinen Risiken summieren sich.
			Die Wahrscheinlichkeit, in der ganzen Familie von Tests <strong>mindestens einen</strong>
			Fehlalarm zu erwischen, heißt <Begriff term="FWER">familienweise Fehlerrate (FWER)</Begriff>.
		</p>

		<FormelZeigen
			formula={String.raw`\text{FWER} = 1 - (1 - \alpha)^{c}`}
			symbols={[
				{ sym: String.raw`\alpha`, bedeutung: 'Das Signifikanzniveau je Einzeltest, üblich 0,05.' },
				{ sym: String.raw`c`, bedeutung: 'Die Anzahl der paarweisen Vergleiche. Bei g Gruppen ist c = g·(g−1)/2.' },
				{ sym: String.raw`(1 - \alpha)^{c}`, bedeutung: 'Die Wahrscheinlichkeit, dass ALLE c Tests korrekt „nicht signifikant“ liefern.' },
				{ sym: String.raw`\text{FWER}`, bedeutung: 'Das Gegenstück: mindestens ein Fehlalarm in der Familie. Schon bei 5 Vergleichen ~23 %.' }
			]}
		/>

		<Callout variant="warnung" title="Viele t-Tests = aufgeblähtes Fehlerrisiko">
			Schon bei <strong>c = 3</strong> Vergleichen (unsere drei Käfigtypen) ist die familienweise
			Fehlerrate 1 − (1 − 0,05)³ ≈ <strong>14 %</strong>, bei fünf Vergleichen ~23 % und bei zehn
			schon ~40 %. Du würdest also
			mit wachsender Wahrscheinlichkeit einen Unterschied „finden“, den es gar nicht gibt. Deshalb:
			<strong>nicht</strong> viele paarweise t-Tests, sondern <strong>ein</strong> Test über alle
			Gruppen.
		</Callout>

		<p class="text-ink-soft leading-relaxed">
			Probier es im <strong>FWER-Roulette</strong> unten gleich selbst aus: rein zufällige Daten,
			keinerlei echter Unterschied, und trotzdem klettert die Fehlalarmrate mit jedem Vergleich
			nach oben. Die <Begriff term="Bonferroni-Korrektur" /> (jeden Test zum strengeren Niveau
			α/c) zieht sie wieder herunter.
		</p>

		<FwerRoulette />

		<!-- Die Idee der ANOVA: Varianzzerlegung -------------------------------- -->
		<h2 class="mt-4 text-2xl">Die Lösung: ein Test über die Varianzzerlegung</h2>
		<p class="text-ink-soft leading-relaxed">
			Die ANOVA prüft alle Gruppen <strong>auf einmal</strong>. Ihr Trick ist die
			<Begriff term="Varianzzerlegung" />: Die gesamte Streuung in den Lachsgrößen lässt sich
			sauber in zwei Teile zerlegen — einen Teil <strong>zwischen</strong> den Gruppen (wie weit
			die Käfig-Mittelwerte voneinander abweichen) und einen Teil <strong>innerhalb</strong> der
			Gruppen (wie sehr die Fische desselben Käfigs um ihr eigenes Mittel streuen).
		</p>

		<FormelZeigen
			formula={String.raw`\underbrace{SS_{\text{total}}}_{\text{Gesamtstreuung}} = \underbrace{SS_{\text{zwischen}}}_{\text{erklärt}} + \underbrace{SS_{\text{innerhalb}}}_{\text{unerklärt}}`}
			symbols={[
				{ sym: String.raw`SS_{\text{total}}`, bedeutung: 'Die gesamte Quadratsumme: alle Abweichungen vom Gesamtmittel, quadriert und summiert.' },
				{ sym: String.raw`SS_{\text{zwischen}}`, bedeutung: 'Die erklärte Streuung: Abweichungen der Gruppenmittel vom Gesamtmittel — das, was die Gruppenzugehörigkeit erklärt.' },
				{ sym: String.raw`SS_{\text{innerhalb}}`, bedeutung: 'Die unerklärte Streuung (Residuum): Abweichungen der Einzelwerte von ihrem eigenen Gruppenmittel — das Rauschen.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Anschaulich teilt sich die Gesamtstreuung wie dieser Balken auf: Der korallene Anteil ist
			das, was die Käfigtypen <strong>erklären</strong>, der gedämpfte Teil bleibt
			<strong>unerklärt</strong>:
		</p>

		<div class="border-ink/10 bg-paper-raised shadow-soft my-3 rounded-2xl border p-5">
			<SSZerlegung
				ssExplained={106.17}
				ssResidual={18.75}
				explainedLabel="zwischen den Gruppen (Käfigtyp)"
				residualLabel="innerhalb der Gruppen (Rauschen)"
				ratioSymbol="η²"
				caption="Beispiel: Lachsgröße in drei Käfigtypen"
			/>
		</div>

		<!-- Die zentrale Intuition: F = zwischen / innerhalb ------------------- -->
		<h2 class="mt-4 text-2xl">Die zentrale Intuition: F = zwischen ÷ innerhalb</h2>
		<p class="text-ink-soft leading-relaxed">
			Jetzt die wichtigste Idee der Lektion. Die ANOVA heißt
			<Begriff term="Varianzanalyse" />, aber sie testet Unterschiede in den
			<strong>Mittelwerten</strong>. Über einen Umweg: Sie setzt die beiden Streuungsanteile ins
			Verhältnis. Aus den Quadratsummen werden zuerst <strong>mittlere Quadrate (MS)</strong>
			(Quadratsumme geteilt durch Freiheitsgrade), und ihr Quotient ist das
			<Begriff term="F-Verhältnis">F-Verhältnis</Begriff>.
		</p>

		<Intuition title="Das F-Verhältnis ist Signal ÷ Rauschen">
			<p>
				<strong>F = Varianz ZWISCHEN den Gruppen / Varianz INNERHALB der Gruppen.</strong> Frag
				dich: Ist die Streuung zwischen den Käfig-Mittelwerten groß im Vergleich zur Streuung
				innerhalb der Käfige? Dann liegt ein echtes Signal über dem Rauschen, und F wird groß.
				Streuen die Mittelwerte dagegen kaum mehr als die Fische innerhalb eines Käfigs, ist F nahe
				1: kein erkennbarer Effekt.
			</p>
			<p class="mt-2">
				F wird <strong>immer rechtsseitig</strong> getestet: nur ein <em>großes</em> F spricht
				gegen H₀. Derselbe Mittelwert-Abstand kann signifikant sein, wenn die Streuung innerhalb
				klein ist, und unbedeutend, wenn sie groß ist. Genau das machst du gleich im Widget
				sichtbar.
			</p>
		</Intuition>

		<FormelZeigen
			formula={String.raw`MS_{\text{zw.}} = \frac{SS_{\text{zw.}}}{k-1}, \quad MS_{\text{inn.}} = \frac{SS_{\text{inn.}}}{N-k}, \quad F = \frac{MS_{\text{zw.}}}{MS_{\text{inn.}}}`}
			symbols={[
				{ sym: String.raw`k`, bedeutung: 'Die Anzahl der Gruppen (Käfigtypen).' },
				{ sym: String.raw`N`, bedeutung: 'Die Gesamtzahl aller Beobachtungen über alle Gruppen.' },
				{ sym: String.raw`k-1`, bedeutung: 'Freiheitsgrade zwischen den Gruppen (df_zwischen).' },
				{ sym: String.raw`N-k`, bedeutung: 'Freiheitsgrade innerhalb der Gruppen (df_innerhalb).' },
				{ sym: String.raw`MS`, bedeutung: 'Mittleres Quadrat = Quadratsumme / Freiheitsgrade. Eine Varianzschätzung.' },
				{ sym: String.raw`F`, bedeutung: 'Das F-Verhältnis. Unter H₀ folgt es der F-Verteilung mit (k−1, N−k) Freiheitsgraden; großes F → kleiner rechtsseitiger p-Wert.' }
			]}
		/>

		<Analogie title="Käfige im Chor">
			Stell dir die drei Käfige als drei Sängergruppen vor. Die
			<strong>Streuung innerhalb</strong> ist das Gemurmel innerhalb jeder Gruppe — das Grundrauschen.
			Die <strong>Streuung zwischen</strong> ist, wie deutlich sich die Gruppen in ihrer Tonhöhe
			voneinander abheben. Hört man die Gruppen klar auseinander (großes Signal) trotz des Gemurmels
			(kleines Rauschen), ist F groß und du sagst: Die Käfige klingen wirklich verschieden. Verschluckt
			das Gemurmel die Unterschiede, bleibt F nahe 1.
		</Analogie>

		<!-- Flagship-Widget 1: FRatio ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: das F-Verhältnis</h2>
		<p class="text-ink-soft leading-relaxed">
			Drei Käfigtypen, Lachsgröße in cm. Mit dem ersten Regler veränderst du den
			<strong>Abstand der Gruppenmittel</strong> (das Signal), mit dem zweiten die
			<strong>Streuung innerhalb</strong> der Gruppen (das Rauschen). Unten zerlegt sich die
			Streuung live in „zwischen“ und „innerhalb“, und du siehst F, p und η². Probier:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Setz einen klaren <strong>Abstand</strong> und dreh die <strong>Streuung innerhalb klein</strong>: F schießt hoch, p wird winzig, der korallene „zwischen“-Anteil dominiert.</li>
			<li>Lass den Abstand stehen, aber dreh die <strong>Streuung innerhalb groß</strong> — dasselbe Signal, jetzt im Rauschen ertränkt: F fällt, p steigt, nicht mehr signifikant.</li>
			<li>Zieh den <strong>Abstand auf 0</strong>: alle Käfige gleich, F geht gegen 0, η² gegen 0.</li>
		</ol>

		<FRatio />

		<Merke title="Was das F-Widget zeigt">
			Nicht der Abstand allein entscheidet, sondern der Abstand <strong>relativ zur Streuung
			innerhalb</strong>. Derselbe Mittelwert-Abstand ist signifikant bei kleinem Rauschen und
			unbedeutend bei großem. Genau dafür steht F = zwischen ÷ innerhalb.
		</Merke>

		<!-- Voraussetzungen ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Voraussetzungen & die nicht-parametrische Alternative</h2>
		<p class="text-ink-soft leading-relaxed">
			Wie der t-Test ist auch die ANOVA an Annahmen geknüpft. Sind sie verletzt, wird der p-Wert
			unzuverlässig:
		</p>

		<Merke title="Die Voraussetzungen der ANOVA">
			<ol class="ml-5 list-decimal space-y-1">
				<li><strong>Normalverteilung</strong> der Werte je Gruppe (bzw. der Residuen). Bei größeren n robust.</li>
				<li><strong><Begriff term="Varianzhomogenität" /></strong> — alle Gruppen sollten ähnlich streuen. Prüfbar mit dem <Begriff term="Levene-Test" />.</li>
				<li><strong>Unabhängigkeit</strong> der Beobachtungen: jeder Lachs zählt nur einmal, keine verdeckten Abhängigkeiten.</li>
			</ol>
		</Merke>

		<Callout variant="merke" title="Wenn die Annahmen wackeln: Kruskal-Wallis">
			Sind Normalverteilung oder Varianzhomogenität deutlich verletzt (oder hast du nur
			Rangdaten), nimmst du den <Begriff term="Kruskal-Wallis-Test" />: die rangbasierte,
			verteilungsfreie Alternative zur einfaktoriellen ANOVA. Er vergleicht die Lage mehrerer
			Gruppen über ihre Ränge, ganz ohne Normalverteilungsannahme. In R:
			<code class="font-mono text-sm">kruskal.test(groesse ~ kaefig)</code>.
		</Callout>

		<!-- Nach der ANOVA: Post-hoc + Effektstärke ----------------------------- -->
		<h2 class="mt-4 text-2xl">Nach der ANOVA: welche Gruppen? Und wie stark?</h2>
		<p class="text-ink-soft leading-relaxed">
			Ein signifikantes Ergebnis sagt nur: <strong>irgendein</strong> Käfig-Mittelwert weicht ab,
			aber nicht welcher. Diese Frage beantwortet ein
			<Begriff term="Post-hoc-Test">Post-hoc-Test</Begriff>. Der gängigste ist
			<Begriff term="Tukey HSD" />: Er vergleicht alle Gruppenpaare und hält dabei die
			familienweise Fehlerrate auf α. Er löst das multiple-Testen-Problem also sauber, statt es
			wie naive t-Tests zu ignorieren.
		</p>

		<Callout variant="warnung" title="ANOVA ist das Eingangstor, nicht das Ziel">
			Eine signifikante ANOVA <strong>allein</strong> verrät dir nie, welche Käfige sich
			unterscheiden. Wer aus p &lt; 0,05 direkt „Käfig 1 unterscheidet sich von Käfig 3“ liest,
			überspringt den Post-hoc-Test. Erst <strong>Tukey HSD</strong> nennt die konkreten Paare,
			mit kontrollierter Fehlerrate.
		</Callout>

		<p class="text-ink-soft leading-relaxed">
			Und wie <strong>stark</strong> ist der Effekt? Dafür gibt es die
			<Begriff term="Effektstärke" /> <Begriff term="Eta-Quadrat">η² (Eta-Quadrat)</Begriff>: der
			Anteil der Gesamtstreuung, den die Gruppenzugehörigkeit erklärt. Es ist genau der korallene
			Anteil aus der Varianzzerlegung, und das ANOVA-Pendant zum R² der Regression.
		</p>

		<FormelZeigen
			formula={String.raw`\eta^2 = \frac{SS_{\text{zwischen}}}{SS_{\text{total}}}`}
			symbols={[
				{ sym: String.raw`\eta^2`, bedeutung: 'Eta-Quadrat: der durch die Gruppen erklärte Anteil der Gesamtstreuung, zwischen 0 (kein Effekt) und 1.' },
				{ sym: String.raw`SS_{\text{zwischen}}`, bedeutung: 'Die erklärte Quadratsumme (zwischen den Gruppen).' },
				{ sym: String.raw`SS_{\text{total}}`, bedeutung: 'Die gesamte Quadratsumme (zwischen + innerhalb).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Rechnen wir es für die Lachse durch. Aus der Varianzzerlegung kennen wir SS<sub>zwischen</sub> =
			106,17 und SS<sub>innerhalb</sub> = 18,75, zusammen SS<sub>total</sub> = 124,92. Also η² =
			106,17 / 124,92 ≈ <strong>0,85</strong>: Der Käfigtyp erklärt rund 85 % der gesamten Streuung in
			der Lachsgröße, genau der korallene Anteil aus dem Balken oben. Zur Einordnung dienen Cohens
			Faustwerte für η²:
		</p>

		<Merke title="Faustwerte für η²">
			<ul class="ml-5 list-disc space-y-1">
				<li><strong>η² ≈ 0,01</strong> — kleiner Effekt.</li>
				<li><strong>η² ≈ 0,06</strong> — mittlerer Effekt.</li>
				<li><strong>η² ≈ 0,14</strong> — großer Effekt.</li>
			</ul>
			Unser η² ≈ 0,85 liegt weit über der 0,14-Schwelle: ein sehr großer Effekt des Käfigtyps. Der
			Unterschied ist nicht bloß signifikant, er erklärt auch den Löwenanteil der Streuung.
		</Merke>

		<!-- R-Code -------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So sieht das in R aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Die ANOVA rechnest du mit <code class="font-mono text-sm">aov()</code> und liest sie mit
			<code class="font-mono text-sm">summary()</code>. Für die konkreten Paare folgt
			<code class="font-mono text-sm">TukeyHSD()</code>. So liest du die Ausgabe:
		</p>

		<RCode
			code={`# Lachsgroesse (cm) je Kaefigtyp; "kaefig" ist ein Faktor mit 3 Stufen.
modell <- aov(groesse ~ kaefig, data = lachse)
summary(modell)`}
			output={`            Df Sum Sq Mean Sq F value   Pr(>F)
kaefig       2 106.17   53.08   25.48 0.000197 ***
Residuals    9  18.75   2.083
---
Signif. codes:  0 '***' 0.001 '**' 0.01 '*' 0.05 '.' 0.1 ' ' 1`}
			annotations={{
				"kaefig": "Die Zeile „zwischen den Gruppen“: hier steckt die durch den Käfigtyp erklärte Streuung.",
				"Residuals": "Die Zeile „innerhalb der Gruppen“: das unerklärte Rauschen.",
				"Df": "Freiheitsgrade: k − 1 = 2 zwischen, N − k = 9 innerhalb.",
				"Sum Sq": "Die Quadratsummen SS: 106,17 zwischen und 18,75 innerhalb (zusammen SS_total).",
				"Mean Sq": "Mittlere Quadrate MS = Sum Sq / Df: 53,08 und 2,083 — die beiden Varianzschätzungen.",
				"F value": "Das F-Verhältnis = 53,08 / 2,083 = 25,48. Signal deutlich über Rauschen.",
				"Pr(>F)": "Der rechtsseitige p-Wert = 0,000197 < 0,05 → mindestens ein Käfig-Mittel weicht ab."
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			Die ANOVA war signifikant. Aber welche Käfige unterscheiden sich? Das sagt der Post-hoc-Test:
		</p>

		<RCode
			code={`# Post-hoc: welche Kaefig-Paare unterscheiden sich? FWER bleibt kontrolliert.
TukeyHSD(modell)`}
			output={`  Tukey multiple comparisons of means
    95% family-wise confidence level

$kaefig
                       diff     lwr     upr   p adj
Festkaefig-Netzkaefig   7.0   4.227   9.773  0.0002
Tiefkaefig-Netzkaefig   3.0   0.227   5.773  0.0345
Tiefkaefig-Festkaefig  -4.0  -6.773  -1.227  0.0079`}
			annotations={{
				"family-wise confidence level": "Tukey hält die FAMILIENWEISE Fehlerrate auf 5 % — es korrigiert das multiple Testen für dich.",
				"diff": "Die geschätzte Mittelwertdifferenz des Paares (in cm).",
				"lwr": "Untere Grenze des 95 %-Konfidenzintervalls der Differenz. Schließt es die 0 ein, ist das Paar nicht signifikant.",
				"p adj": "Der für alle Vergleiche KORRIGIERTE p-Wert. Hier sind alle drei Paare < 0,05 — sie unterscheiden sich alle."
			}}
		/>

		<!-- Zweifaktorielle ANOVA & Interaktion --------------------------------- -->
		<h2 class="mt-4 text-2xl">Zwei Faktoren auf einmal: die zweifaktorielle ANOVA</h2>
		<p class="text-ink-soft leading-relaxed">
			Bisher hatten wir <strong>einen</strong> Faktor (den Käfigtyp). Oft wirken aber zwei Einflüsse
			gleichzeitig. Stell dir vor, du untersuchst das Wachstum von Pflanzen unter zwei Faktoren:
			<strong>Düngung</strong> (mit/ohne) und <strong>Lichtmenge</strong> (wenig/viel). Werden beide
			Faktoren in allen Kombinationen geprüft (sie sind also
			<Begriff term="Gekreuztes Design">gekreuzt</Begriff>), dann rechnet man eine
			<Begriff term="Zweifaktorielle ANOVA">zweifaktorielle ANOVA</Begriff>. Sie liefert nicht einen,
			sondern <strong>drei</strong> Tests: den Haupteffekt der Düngung, den Haupteffekt des Lichts und,
			besonders spannend, ihre <strong>Wechselwirkung</strong>.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Ein <Begriff term="Interaktionseffekt">Interaktionseffekt</Begriff> bedeutet: Die Wirkung des
			einen Faktors <strong>hängt von der Stufe des anderen ab</strong>. Vielleicht hilft die Düngung
			den Pflanzen nur, <em>wenn</em> genug Licht da ist, und bleibt im Schatten wirkungslos. Dann
			kannst du den Düngeeffekt nicht mehr für sich allein angeben, er ist eben licht-abhängig. Genau
			diese „es kommt darauf an“-Situation steckt im Interaktionsterm.
		</p>

		<Merke title="Interaktion im Diagramm: parallel oder nicht?">
			Zeichnet man die Gruppenmittel als Linien (eine Linie je Lichtstufe, Düngung auf der x-Achse),
			verrät die Form sofort die Interaktion:
			<ul class="mt-2 ml-5 list-disc space-y-1">
				<li>
					<strong>Parallele Linien</strong> → <strong>kein</strong> Interaktionseffekt: Die Düngung
					wirkt bei wenig und bei viel Licht gleich stark (die Haupteffekte addieren sich einfach).
				</li>
				<li>
					<strong>Sich kreuzende oder spreizende Linien</strong> → <strong>Interaktion</strong>: Die
					Wirkung der Düngung ist je nach Lichtstufe verschieden — der Abstand der Linien ändert sich.
				</li>
			</ul>
		</Merke>

		<Callout variant="warnung" title="Erst die Interaktion lesen, dann die Haupteffekte">
			Ist die Interaktion signifikant, sind die einzelnen Haupteffekte mit Vorsicht zu genießen: Ein
			gemittelter „Düngeeffekt“ ist dann irreführend, weil er bei wenig und viel Licht ganz
			unterschiedlich ausfällt. Sieh dir in diesem Fall die Kombinationen einzeln an, statt die
			Faktoren getrennt zu interpretieren.
		</Callout>

		<!-- Zusammenfassung ----------------------------------------------------- -->
		<Intuition title="In einem Satz">
			Die <strong>ANOVA</strong> vergleicht die Mittelwerte mehrerer Gruppen in
			<strong>einem</strong> Test (statt vieler t-Tests, die die familienweise Fehlerrate
			1 − (1 − α)^c aufblähen), indem sie die Gesamtstreuung in
			<strong>zwischen</strong> und <strong>innerhalb</strong> zerlegt und ihr Verhältnis
			<strong>F = Varianz zwischen / Varianz innerhalb</strong> rechtsseitig testet; ist sie
			signifikant, nennt erst ein <strong>Post-hoc-Test (Tukey HSD)</strong> die konkreten Paare,
			und <strong>η²</strong> sagt, wie stark der Effekt ist.
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
