<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import ScatterBuilder from '$lib/widgets/ScatterBuilder.svelte';
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

	const slug = 'korrelation';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'kor-1',
			kind: 'mc',
			prompt:
				'Du misst bei einer Eidechsenart die Umgebungstemperatur und die Aktivität. Die Pearson-Korrelation ist r = 0. Beweist das, dass kein Zusammenhang besteht?',
			options: [
				'Ja. r = 0 heißt, die beiden Merkmale haben nichts miteinander zu tun.',
				'Nein. r = 0 heißt nur, dass es keinen LINEAREN Zusammenhang gibt. Eine U-Form ist gut möglich — etwa Aktivität, die zu kalt UND zu warm absinkt und in der Mitte am höchsten ist. Erst der Scatterplot zeigt das Muster.',
				'Ja, aber nur, wenn die Stichprobe groß genug ist; bei kleinem n kann r = 0 zufällig sein.'
			],
			correct: 1,
			explanation:
				'Genau. Pearson r misst ausschließlich die LINEARE Stärke. Eine symmetrische U-Form (Parabel) kann r ≈ 0 liefern, obwohl ein glasklares Muster vorliegt. Deshalb sieht man sich IMMER zuerst den Scatterplot an: r = 0 bedeutet „kein linearer Zusammenhang“, nicht „kein Zusammenhang“.'
		},
		{
			id: 'kor-2',
			kind: 'mc',
			prompt:
				'Wann greifst du lieber zur Spearman-Korrelation ρ statt zu Pearson r?',
			options: [
				'Immer, weil Spearman grundsätzlich genauer ist als Pearson.',
				'Wenn du Ausreißer hast, der Zusammenhang monoton aber gekrümmt ist (z. B. eine Sättigungskurve), oder die Daten nur ordinal (Rangdaten) sind. Spearman korreliert die Ränge — robust und monoton statt nur linear.',
				'Nur dann, wenn beide Variablen exakt normalverteilt sind.'
			],
			correct: 1,
			explanation:
				'Richtig. Spearman ρ ist der Pearson-Koeffizient der Ränge: Er erfasst MONOTONE Zusammenhänge (auch gekrümmte), ist robust gegen Ausreißer und für ordinale Daten zulässig. Pearson dagegen setzt einen linearen Zusammenhang voraus und reagiert empfindlich auf einzelne Ausreißer.'
		},
		{
			id: 'kor-3',
			kind: 'tf',
			prompt:
				'„Eine hohe Korrelation zwischen zwei Merkmalen beweist, dass das eine das andere verursacht.“',
			correct: false,
			explanation:
				'Falsch. Korrelation ist NICHT Kausalität. Ein hoher Wert kann durch einen dritten Faktor (Confounder) entstehen — eine Scheinkorrelation. Beispiel: Über Inseln hinweg korrelieren Storchenzahl und Geburtenrate, weil beide mit der Fläche/Ländlichkeit zusammenhängen — nicht weil Störche Babys bringen. Kausalität begründet man nur über kontrollierte Experimente.'
		}
	];
</script>

<svelte:head>
	<title>Korrelation & Transformation · DS2</title>
	<meta
		name="description"
		content="Korrelation misst den Zusammenhang zweier zufälliger Variablen — ohne Richtung und ohne Kausalität. Vom Scatterplot über die skalenabhängige Kovarianz zur zentralen Intuition: Pearson r ist die standardisierte Kovarianz, r = Cov(x,y)/(s_x·s_y), einheitenlos in [−1, +1], misst aber nur die LINEARE Stärke (eine U-Form gibt r ≈ 0). Spearman ρ und Kendall τ erfassen rangbasiert monotone Zusammenhänge und sind robust gegen Ausreißer. Signifikanztest ρ = 0 über t mit df = n−2, Korrelation ≠ Kausalität, und Transformationen (log/sqrt/Box-Cox), die Nichtlinearität linearisieren — am Beispiel Körpermasse vs. Hirnmasse bei Säugetieren (log-log). Mit dem interaktiven Scatter-Builder."
	/>
</svelte:head>

<LessonLayout {slug}>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Klausur-relevant · Zusammenhänge
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Korrelation & Transformation</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Bisher haben wir Gruppen <em>verglichen</em>. Jetzt fragen wir: Hängen zwei Messgrößen
			<strong>zusammen</strong>? Wenn ein Säugetier schwerer ist — hat es dann auch ein größeres
			Gehirn? Misst man bei vielen Arten <strong>Körpermasse</strong> und
			<strong>Hirnmasse</strong>, schwanken beide gemeinsam. Genau das fasst die
			<Begriff term="Korrelation" /> in einer einzigen Zahl. In dieser Lektion lernst du, was diese
			Zahl wirklich misst — und wo sie täuscht.
		</p>

		<!-- Korrelation vs. Regression ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Korrelation: Zusammenhang ohne Richtung</h2>
		<p class="text-ink-soft leading-relaxed">
			Wichtig vorab: Korrelation misst nur die <strong>Stärke des Zusammenhangs</strong> — sie kennt
			<strong>keine Richtung</strong> und behauptet <strong>keine Ursache</strong>. Beide Variablen
			sind gleichberechtigt und zufällig; es ist egal, welche du als x und welche als y aufträgst.
			Das ist der Unterschied zur <strong>Regression</strong> (nächste Lektion): Dort gibt es eine
			erklärende und eine vorhergesagte Größe, also eine Richtung. Hier nicht.
		</p>

		<Callout variant="merke" title="Zuerst gucken, dann rechnen">
			Bevor du irgendeinen Korrelationskoeffizienten ausrechnest, schau dir den
			<strong>Scatterplot</strong> (das Streudiagramm) an. Frag dich: Welche <strong>Form</strong>
			hat die Punktwolke (gerade? gekrümmt?), welche <strong>Richtung</strong> (steigend/fallend),
			welche <strong>Stärke</strong> (eng oder breit gestreut), und gibt es <Begriff
				term="Ausreißer">Ausreißer</Begriff>? Eine einzelne Zahl kann dir all das verbergen.
		</Callout>

		<!-- Kovarianz ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Der erste Schritt: die Kovarianz</h2>
		<p class="text-ink-soft leading-relaxed">
			Wie fasst man „gemeinsames Schwanken“ in Zahlen? Über die <Begriff term="Kovarianz" />. Sie
			schaut für jeden Datenpunkt, ob er bei <em>beiden</em> Variablen gleichzeitig über oder unter
			dem jeweiligen Mittel liegt. Liegen schwere Tiere meist auch über dem mittleren Hirngewicht,
			werden die Produkte positiv und die Kovarianz wird positiv.
		</p>

		<FormelZeigen
			formula={String.raw`\mathrm{Cov}(x, y) = \frac{1}{n-1}\sum_{i=1}^{n}(x_i - \bar{x})\,(y_i - \bar{y})`}
			symbols={[
				{ sym: String.raw`x_i,\, y_i`, bedeutung: 'Die beiden Messwerte des i-ten Tieres (z. B. Körper- und Hirnmasse).' },
				{ sym: String.raw`\bar{x},\, \bar{y}`, bedeutung: 'Die Mittelwerte der beiden Variablen.' },
				{ sym: String.raw`(x_i-\bar{x})(y_i-\bar{y})`, bedeutung: 'Positiv, wenn beide Werte gemeinsam über oder gemeinsam unter ihrem Mittel liegen; negativ bei gegenläufiger Lage.' },
				{ sym: String.raw`n-1`, bedeutung: 'Wie bei der Stichprobenvarianz: Teilung durch n − 1 statt n.' }
			]}
		/>

		<Callout variant="warnung" title="Die Kovarianz ist skalenabhängig">
			Die Kovarianz hat einen Haken: Ihr Wert hängt von den <strong>Einheiten</strong> ab. Misst du
			die Körpermasse in Gramm statt in Kilogramm, wird die Kovarianz tausendmal so groß — obwohl
			sich am Zusammenhang nichts geändert hat. Deshalb kannst du Kovarianzen verschiedener
			Variablenpaare <strong>nicht vergleichen</strong>. Genau dieses Problem löst der nächste
			Schritt.
		</Callout>

		<!-- Die zentrale Intuition: Pearson = standardisierte Kovarianz -------- -->
		<h2 class="mt-4 text-2xl">Die zentrale Intuition: Pearson r ist standardisierte Kovarianz</h2>
		<p class="text-ink-soft leading-relaxed">
			Jetzt die wichtigste Idee der Lektion. Man teilt die Kovarianz durch das Produkt der beiden
			<Begriff term="Standardabweichung">Standardabweichungen</Begriff> s<sub>x</sub>·s<sub>y</sub>.
			Damit kürzen sich die Einheiten heraus und man erhält die
			<Begriff term="Pearson-Korrelation">Pearson-Korrelation</Begriff> r.
		</p>

		<FormelZeigen
			formula={String.raw`r = \frac{\mathrm{Cov}(x, y)}{s_x \cdot s_y}`}
			symbols={[
				{ sym: String.raw`\mathrm{Cov}(x,y)`, bedeutung: 'Die Kovarianz — das gemeinsame Schwanken, aber noch skalenabhängig.' },
				{ sym: String.raw`s_x,\, s_y`, bedeutung: 'Die Standardabweichungen der beiden Variablen. Sie „normieren“ die Kovarianz auf ihre eigene Streuung.' },
				{ sym: String.raw`r`, bedeutung: 'Der Pearson-Koeffizient: einheitenlos und immer in [−1, +1]. +1 = perfekt steigende Gerade, −1 = perfekt fallende, 0 = kein linearer Zusammenhang.' }
			]}
		/>

		<Intuition title="r ist die standardisierte Kovarianz — und misst NUR Lineares">
			<p>
				<strong>r = Cov(x, y) / (s<sub>x</sub>·s<sub>y</sub>).</strong> Durch das Teilen wird r
				<strong>einheitenlos</strong> und liegt immer zwischen <strong>−1 und +1</strong> — egal in
				welchen Einheiten du misst. Deshalb sind Korrelationen verschiedener Variablenpaare
				<strong>vergleichbar</strong>, Kovarianzen nicht.
			</p>
			<p class="mt-2">
				Aber Vorsicht — und das ist der zweite Teil der Intuition: r misst nur die
				<strong>LINEARE</strong> Stärke. <strong>r ≈ 0 heißt „kein <em>linearer</em>
				Zusammenhang“, nicht „kein Zusammenhang“.</strong> Eine symmetrische U-Form (Parabel) kann
				r ≈ 0 liefern, obwohl ein glasklares Muster vorliegt. Genau das machst du gleich im
				Scatter-Builder sichtbar.
			</p>
		</Intuition>

		<Analogie title="Zwei Tänzer im Gleichschritt">
			Stell dir zwei Tänzer vor. Die <strong>Kovarianz</strong> sagt nur: Bewegen sie sich in
			dieselbe Richtung? Aber sie hängt davon ab, ob sie kleine oder große Schritte machen — nicht
			vergleichbar. <strong>r</strong> rechnet die Schrittgröße heraus und fragt nur noch: Wie
			<em>synchron</em> sind sie, auf einer Skala von −1 (perfekter Gegentakt) über 0 (völlig
			unabhängig) bis +1 (perfekter Gleichschritt)? Aber nur im <em>geraden</em> Tanz — drehen sie
			eine Kurve, sieht r plötzlich nichts mehr.
		</Analogie>

		<!-- Flagship-Widget: Scatter-Builder ------------------------------------ -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Scatter-Builder</h2>
		<p class="text-ink-soft leading-relaxed">
			Zieh Punkte, füge welche hinzu, oder lade eine Vorlage — und beobachte
			<strong>Pearson r</strong> und <strong>Spearman ρ</strong> live nebeneinander. Zwei
			Aha-Momente solltest du dir holen:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				Lade <strong>U-Form / Parabel</strong>: Das Muster ist offensichtlich, aber
				<strong>Pearson r ≈ 0</strong> — denn es gibt keinen <em>linearen</em> Trend.
			</li>
			<li>
				Lade <strong>mit Ausreißer</strong> (oder klick <em>+ Ausreißer</em>): Ein einziger weit
				entfernter Punkt treibt <strong>Pearson</strong> dramatisch nach oben (Scheinkorrelation),
				während <strong>Spearman ρ</strong> ruhig bleibt. Zieh den Ausreißer ins Feld zurück — beide
				nähern sich wieder an.
			</li>
		</ol>

		<ScatterBuilder />

		<Merke title="Was der Scatter-Builder zeigt">
			Eine einzelne Korrelationszahl kann lügen. Bei der U-Form übersieht Pearson r das ganze
			Muster, weil es nicht <em>gerade</em> ist. Bei einem Ausreißer überschätzt Pearson den
			Zusammenhang massiv, während die <strong>rangbasierte</strong> Spearman-Korrelation robust
			bleibt. Deshalb: erst der <strong>Scatterplot</strong>, dann die Zahl.
		</Merke>

		<!-- Spearman & Kendall -------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Rangbasiert & robust: Spearman ρ und Kendall τ</h2>
		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Spearman-Korrelation">Spearman-Korrelation ρ</Begriff> ist einfach der
			Pearson-Koeffizient der <strong>Ränge</strong>: Statt der Originalwerte korreliert man ihre
			Rangplätze. Das hat drei schöne Folgen. Sie erfasst jeden <Begriff term="monotoner Zusammenhang"
				>monotonen Zusammenhang</Begriff> — auch gekrümmte wie eine Sättigungskurve y = log(x).
			Sie ist <strong>robust gegen Ausreißer</strong>, weil ein extremer Wert nur einen Rangplatz
			weiterrückt, nicht beliebig weit. Und sie ist für <strong>ordinale</strong> (Rang-)Daten
			zulässig, für die Pearson gar nicht definiert ist.
		</p>

		<p class="text-ink-soft leading-relaxed">
			<Begriff term="Kendall-Korrelation">Kendalls τ</Begriff> verfolgt dieselbe Idee über einen
			anderen Weg: Es zählt, wie viele Paare <em>konkordant</em> (gleichsinnig geordnet) gegenüber
			<em>diskordant</em> sind. Auch τ erfasst monotone Zusammenhänge und ist robust — es wird oft
			bei vielen Bindungen oder kleinen Stichproben bevorzugt.
		</p>

		<Merke title="Pearson oder Spearman/Kendall?">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Pearson r</strong> — wenn der Zusammenhang <strong>linear</strong> ist, die Daten
					metrisch und ohne grobe Ausreißer.
				</li>
				<li>
					<strong>Spearman ρ / Kendall τ</strong> — bei <strong>Ausreißern</strong>, bei
					<strong>monotonen, aber gekrümmten</strong> Zusammenhängen, oder bei
					<strong>ordinalen</strong> Daten.
				</li>
			</ul>
		</Merke>

		<!-- Signifikanztest ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Ist die Korrelation echt? Der Test auf ρ = 0</h2>
		<p class="text-ink-soft leading-relaxed">
			Auch eine kleine Stichprobe aus völlig unkorrelierten Variablen zeigt selten exakt r = 0 —
			etwas Korrelation ergibt sich immer durch Zufall. Der Signifikanztest prüft die
			<Begriff term="Nullhypothese">Nullhypothese</Begriff> ρ = 0 („kein Zusammenhang“) mit einem
			<Begriff term="t-Test">t-Test</Begriff>: Die Teststatistik t folgt unter H₀ einer
			<Begriff term="Student-t-Verteilung" /> mit <Begriff term="Freiheitsgrade">df = n − 2</Begriff>.
		</p>

		<FormelZeigen
			formula={String.raw`t = r\sqrt{\frac{n-2}{1-r^2}}, \qquad df = n-2`}
			symbols={[
				{ sym: String.raw`r`, bedeutung: 'Der beobachtete Korrelationskoeffizient.' },
				{ sym: String.raw`n`, bedeutung: 'Der Stichprobenumfang (Anzahl der Wertepaare).' },
				{ sym: String.raw`n-2`, bedeutung: 'Die Freiheitsgrade: zwei Parameter (Achsenabschnitt und Steigung der gedachten Geraden) sind „verbraucht“.' },
				{ sym: String.raw`t`, bedeutung: 'Die Teststatistik. Großes |t| → kleiner p-Wert → die Korrelation ist signifikant von 0 verschieden.' }
			]}
		/>

		<Merke title="Signifikant heißt nicht stark">
			Bei sehr großem n wird schon ein winziges r „signifikant“ (p &lt; 0,05), obwohl der
			Zusammenhang praktisch belanglos ist. Schau also immer auf <strong>beides</strong>: die
			Stärke (|r|) <em>und</em> den p-Wert. Ein signifikantes r = 0,05 ist statistisch von 0
			verschieden, aber inhaltlich nichtssagend.
		</Merke>

		<!-- Korrelation ≠ Kausalität ------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die große Warnung: Korrelation ≠ Kausalität</h2>
		<p class="text-ink-soft leading-relaxed">
			Zwei Größen können stark korrelieren, ohne dass die eine die andere <em>verursacht</em>. Oft
			steckt ein dritter Faktor dahinter — ein <Begriff term="Störfaktor">Confounder</Begriff> —,
			der beide gemeinsam beeinflusst. Das nennt man eine
			<Begriff term="Scheinkorrelation" />.
		</p>

		<Callout variant="warnung" title="Störche und Geburten">
			Über mehrere Regionen hinweg korreliert die Zahl der <strong>Storchenpaare</strong> mit der
			<strong>Geburtenrate</strong> — positiv und deutlich. Bringen Störche also Babys? Natürlich
			nicht. Der versteckte dritte Faktor ist die <strong>Ländlichkeit/Fläche</strong>: Große,
			ländliche Regionen haben mehr Störche <em>und</em> mehr Einwohner und damit mehr Geburten. Die
			Korrelation ist echt — die Kausalgeschichte ist erfunden. Eine Korrelation darf dich nie
			direkt zu einem <Begriff term="Kausalschluss" /> verleiten; den begründet man nur über
			kontrollierte Experimente.
		</Callout>

		<!-- Transformationen ---------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Transformationen: Krummes gerade biegen</h2>
		<p class="text-ink-soft leading-relaxed">
			Zurück zu unseren Säugetieren. Trägt man <strong>Körpermasse gegen Hirnmasse</strong> roh auf,
			ergibt sich eine stark gekrümmte Wolke: Wenige Riesen (Elefant, Wal) quetschen alle kleinen
			Tiere in eine Ecke, und Pearson r passt nicht zur klaren Wolke. Die Lösung ist eine
			<Begriff term="Transformation" />: Logarithmiert man <em>beide</em> Achsen, wird aus der
			Kurve eine schöne Gerade — der berühmte log-log-Zusammenhang zwischen Hirn- und Körpermasse.
		</p>

		<Merke title="Die gängigen Transformationen">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>log</strong> — für rechtsschiefe Größen, die über mehrere Größenordnungen reichen
					(Massen, Konzentrationen). Macht multiplikative Zusammenhänge linear.
				</li>
				<li>
					<strong>√ (Wurzel)</strong> — milder als log, klassisch für Zähldaten (z. B. Anzahl
					Individuen), stabilisiert die Streuung.
				</li>
				<li>
					<strong><Begriff term="Box-Cox-Transformation">Box-Cox</Begriff> (Parameter λ)</strong> —
					eine ganze Familie: y<sup>λ</sup> für λ ≠ 0, log(y) für λ = 0. Man wählt λ so, dass die
					Daten möglichst normal und der Zusammenhang möglichst linear werden.
				</li>
			</ul>
		</Merke>

		<Intuition title="Warum log-log bei Hirn vs. Körper?">
			Der Zusammenhang zwischen Körpermasse und Hirnmasse ist nicht additiv, sondern
			<strong>multiplikativ</strong> (eine Potenzfunktion: Hirn ≈ a · Körper<sup>b</sup>). Logarithmieren
			verwandelt Multiplikation in Addition und Potenzen in Geraden: log(Hirn) ≈ log(a) + b · log(Körper).
			Aus der Kurve wird eine Linie — und Pearson r darf wieder ran.
		</Intuition>

		<h2 class="mt-4 text-2xl">Welche Transformation wann? Eine Entscheidungshilfe</h2>
		<p class="text-ink-soft leading-relaxed">
			Welche Transformation passt, hängt von der <strong>Art der Daten</strong> ab — und das lässt sich
			zu einer kleinen Faustregel verdichten. Drei typische biologische Datensorten, drei typische
			Transformationen, mit Box-Cox als allgemeinem Rahmen darüber:
		</p>

		<div class="overflow-x-auto">
			<table class="border-ink/10 w-full border-collapse text-left text-sm">
				<thead>
					<tr class="bg-paper-sunk/60">
						<th class="border-ink/10 border px-3 py-2">Datentyp</th>
						<th class="border-ink/10 border px-3 py-2">Transformation</th>
						<th class="border-ink/10 border px-3 py-2">Biologisches Beispiel</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="border-ink/10 border px-3 py-2">Anteile / Prozente (in [0, 1])</td>
						<td class="border-ink/10 border px-3 py-2"><strong>Arkussinus</strong> (arcsin√p)</td>
						<td class="border-ink/10 border px-3 py-2">Keimungsrate, Anteil befallener Blätter, Geschlechterverhältnis</td>
					</tr>
					<tr>
						<td class="border-ink/10 border px-3 py-2">Zähldaten (Poisson)</td>
						<td class="border-ink/10 border px-3 py-2"><strong>Wurzel</strong> (√y)</td>
						<td class="border-ink/10 border px-3 py-2">Anzahl Individuen pro Quadrat, Eier pro Gelege, Mutationen</td>
					</tr>
					<tr>
						<td class="border-ink/10 border px-3 py-2">Varianz ≫ Mittelwert / multiplikativ</td>
						<td class="border-ink/10 border px-3 py-2"><strong>Logarithmus</strong> (log y)</td>
						<td class="border-ink/10 border px-3 py-2">Körper-/Hirnmasse, Konzentrationen, Populationsgröße</td>
					</tr>
					<tr>
						<td class="border-ink/10 border px-3 py-2">unklar / allgemeiner Fall</td>
						<td class="border-ink/10 border px-3 py-2"><strong>Box-Cox</strong> (λ datengetrieben)</td>
						<td class="border-ink/10 border px-3 py-2">λ wird so gewählt, dass Wurzel, log usw. als Spezialfälle herauskommen</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="text-ink-soft leading-relaxed">
			Der Grund hinter der Tabelle ist immer derselbe: <strong>Varianzstabilisierung</strong>. Bei
			Anteilen ist die Streuung an den Rändern (nahe 0 % und 100 %) kleiner als in der Mitte — die
			<Begriff term="Arkussinus-Transformation" /> zieht sie gerade. Bei Zähldaten wächst die Varianz
			mit dem Mittelwert (bei Poisson sind beide gleich λ), und die Wurzel fängt genau das ab. Bei
			multiplikativen Größen wächst die Streuung proportional zum Wert, und der Logarithmus macht daraus
			eine konstante Streuung. Erst danach passen lineare Methoden — Korrelation, t-Test, ANOVA,
			Regression — wieder sauber.
		</p>

		<!-- R-Code -------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So sieht das in R aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Korrelation samt Signifikanztest rechnest du mit
			<code class="font-mono text-sm">cor.test()</code>. Über das Argument
			<code class="font-mono text-sm">method</code> wählst du Pearson oder Spearman:
		</p>

		<RCode
			code={`# Saeugetiere: Koerpermasse vs. Hirnmasse (Datensatz "mammals").
# Pearson auf den ROHEN Daten — durch die Kruemmung verzerrt:
cor.test(mammals$body, mammals$brain, method = "pearson")`}
			output={`	Pearson's product-moment correlation

t = 11.802, df = 60, p-value < 2.2e-16
sample estimates:
      cor
0.9341638`}
			annotations={{
				method: 'method = "pearson" ist der Standard; er misst die LINEARE Stärke.',
				t: 'Die Teststatistik t = r·√((n−2)/(1−r²)).',
				df: 'Freiheitsgrade df = n − 2 = 60 (also n = 62 Arten).',
				'p-value': 'Der zweiseitige p-Wert für H₀: ρ = 0. Hier winzig → signifikant von 0 verschieden.',
				cor: 'Der geschätzte Pearson-Koeffizient r.'
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			Spearman ρ ist robuster gegen die Ausreißer (Elefant, Wal) und erfasst die Monotonie direkt —
			und genau dieselbe Linearisierung erreichst du mit der log-log-Transformation:
		</p>

		<RCode
			code={`# Rangbasiert (robust gegen die grossen Ausreisser):
cor(mammals$body, mammals$brain, method = "spearman")

# Oder die Nichtlinearitaet per log-log begradigen, dann Pearson:
cor(log(mammals$body), log(mammals$brain), method = "pearson")`}
			output={`[1] 0.9534637

[1] 0.9595748`}
			annotations={{
				spearman: 'method = "spearman" korreliert die Raenge — robust und erfasst monotone (auch gekruemmte) Zusammenhaenge.',
				log: 'log() auf BEIDEN Variablen linearisiert den Potenzzusammenhang; danach passt Pearson wieder sauber.'
			}}
		/>

		<!-- Zusammenfassung ----------------------------------------------------- -->
		<Intuition title="In einem Satz">
			Die <strong>Korrelation</strong> misst den Zusammenhang zweier zufälliger Variablen
			<strong>ohne Richtung und ohne Kausalität</strong>; <strong>Pearson r</strong> ist die
			<strong>standardisierte Kovarianz</strong> (Cov / (s<sub>x</sub>·s<sub>y</sub>), einheitenlos
			in [−1, +1]) und misst nur die <strong>lineare</strong> Stärke — weshalb eine U-Form r ≈ 0
			liefert; die rangbasierten <strong>Spearman ρ</strong> und <strong>Kendall τ</strong> erfassen
			robust auch <strong>monotone</strong> Zusammenhänge, getestet wird ρ = 0 über t mit
			<strong>df = n − 2</strong>, und <strong>Transformationen</strong> (log/√/Box-Cox) biegen
			Krummes gerade — wie log-log bei Hirn- gegen Körpermasse.
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
