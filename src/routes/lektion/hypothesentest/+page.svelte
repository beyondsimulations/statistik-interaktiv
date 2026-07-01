<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import PowerVisualizer from '$lib/widgets/PowerVisualizer.svelte';
	import PWertSpiel from '$lib/widgets/PWertSpiel.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'hypothesentest';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'ht-1',
			kind: 'mc',
			prompt:
				'Dein Test zur Blattgröße von Sonnen- vs. Schattenpflanzen liefert p = 0,03. Was bedeutet dieser p-Wert genau?',
			options: [
				'Die Wahrscheinlichkeit, dass es in Wahrheit keinen Größenunterschied gibt, beträgt 3 %.',
				'Wenn es in Wahrheit keinen Unterschied gäbe (H0), würde ein mindestens so großer Befund nur in 3 % der Wiederholungen rein zufällig auftreten.',
				'Die Wahrscheinlichkeit, dass der gefundene Unterschied echt ist, beträgt 97 %.'
			],
			correct: 1,
			explanation:
				'Genau. Der p-Wert ist P(Daten so extrem oder extremer | H0 wahr) — eine Aussage UNTER der Annahme, dass H0 gilt. Er ist NICHT P(H0 wahr | Daten) und nicht die Wahrscheinlichkeit, dass der Effekt echt ist. Klein heißt nur: So ein Befund wäre überraschend, falls es gar keinen Unterschied gäbe.'
		},
		{
			id: 'ht-2',
			kind: 'mc',
			prompt:
				'Dein Test ergibt p = 0,21 — „nicht signifikant“. Was darfst du daraus schließen?',
			options: [
				'Es ist bewiesen, dass Sonnen- und Schattenblätter gleich groß sind.',
				'Du konntest keinen Unterschied nachweisen — vielleicht gibt es keinen, vielleicht war deine Stichprobe nur zu klein (zu wenig Power).',
				'H0 ist damit zu 79 % bestätigt.'
			],
			correct: 1,
			explanation:
				'Richtig. „Nicht signifikant“ heißt „kein Nachweis“, nicht „kein Unterschied“. Ein echter Effekt kann übersehen worden sein (Fehler 2. Art) — besonders bei kleiner Stichprobe oder schwachem Effekt, also geringer Power. Ein Test kann H0 nie beweisen, nur sie nicht verwerfen.'
		},
		{
			id: 'ht-3',
			kind: 'tf',
			prompt: 'Bei festem Stichprobenumfang n macht ein kleineres α den Fehler 2. Art größer.',
			correct: true,
			explanation:
				'Wahr. Ein strengeres α schiebt die Entscheidungslinie nach außen: Du verwirfst H0 seltener fälschlich (kleiner Fehler 1. Art), übersiehst dafür aber echte Effekte häufiger — β wächst, die Power = 1 − β sinkt. Dieses Tauschgeschäft lässt sich nur durch mehr Daten (größeres n) entschärfen.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Muster vs. Modell, H0 vs. HA, das 8-Schritte-Vorgehen, Signifikanzniveau α, Teststatistik und p-Wert, Fehler 1. & 2. Art und Teststärke. Mit Power-Visualisierer und p-Wert-Würfelspiel — und der zentralen Fehldeutung des p-Werts, biologisch motiviert an Sonnen- vs. Schattenblättern."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Testen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Hypothesentest & der p-Wert</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Stell dir vor, du misst die Blätter von Pflanzen, die in der prallen Sonne stehen, und von
			solchen aus dem Schatten. Die Sonnenblätter wirken im Schnitt etwas kleiner. Aber ist das ein
			<strong>echter</strong> Unterschied oder nur das übliche Rauschen zwischen zwei Stichproben?
			Genau diese Frage beantwortet ein <Begriff term="Hypothesentest" />. In dieser Lektion lernst
			du, wie er funktioniert, was der berühmte <Begriff term="p-Wert" /> wirklich sagt und vor
			allem, was er <em>nicht</em> sagt.
		</p>

		<Callout variant="merke" title="Unser rotes Beispiel durch die ganze Lektion">
			Die Forschungsfrage lautet: <strong
				>Unterscheidet sich die mittlere Blattgröße von Sonnen- und Schattenpflanzen?</strong
			> Daran hängen wir jeden Begriff auf, und beide Widgets messen genau diese Blätter immer wieder
			neu.
		</Callout>

		<!-- Muster vs. Modell ---------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Muster oder nur Zufall? Modell statt Bauchgefühl</h2>
		<p class="text-ink-soft leading-relaxed">
			In deinen Daten siehst du ein <strong>Muster</strong>: Sonnenblätter sind im Mittel kleiner.
			Aber ein Muster in einer einzelnen Stichprobe kann auch reiner Zufall sein. Hättest du andere
			Pflanzen erwischt, sähe es vielleicht umgekehrt aus. Ein Hypothesentest stellt dem Muster ein
			<strong>Modell</strong> gegenüber: die nüchterne Annahme „in Wahrheit gibt es gar keinen
			Unterschied“. Dann fragt er: Wie gut passt mein beobachtetes Muster noch zu diesem langweiligen
			Modell?
		</p>

		<Intuition title="Ein Mittelwertsunterschied ist eine zufällige Ziehung">
			Aus dem Kapitel zur Stichprobenverteilung weißt du: Selbst wenn zwei Gruppen exakt gleich
			groß sind, werden ihre Stichprobenmittelwerte fast nie identisch sein. Ein bisschen Differenz
			gibt es <em>immer</em>, allein durch das Ziehen. Die Kunst ist zu entscheiden, ob deine
			Differenz noch in diesen Zufallsbereich fällt oder schon zu groß dafür ist.
		</Intuition>

		<!-- Gute Hypothese & Popper --------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Warum wir das Gegenteil widerlegen, statt unsere Idee zu beweisen</h2>
		<p class="text-ink-soft leading-relaxed">
			Was du eigentlich zeigen willst: dass sich Sonnen- und Schattenblätter in der Größe
			<strong>unterscheiden</strong>. Der überraschende Kniff der Statistik ist, dass sie genau das
			<em>nicht</em> direkt angeht. Statt „es gibt einen Unterschied“ zu beweisen, versucht sie, das
			Gegenteil zu <strong>widerlegen</strong> — die langweilige Annahme „es gibt keinen
			Unterschied“. Gelingt dieses Widerlegen, bleibt dein vermuteter Unterschied als plausibel
			übrig. Ein indirektes Vorgehen, aber ein logisch sauberes.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Warum dieser Umweg? Eine <Begriff term="Forschungshypothese" /> lässt sich nie endgültig
			<em>beweisen</em>. Egal wie viele Sonnenblätter du misst, der nächste Datensatz könnte deinen
			Befund noch kippen. <em>Widerlegen</em> dagegen kann man eine Behauptung schon mit einem
			einzigen klaren Gegenbeispiel. Deshalb ist eine gute wissenschaftliche Hypothese vor allem
			<strong>überprüfbar</strong> (man kann sie an Daten messen) und <strong>widerlegbar</strong>
			(Daten könnten ihr klar widersprechen). Diese Idee — <Begriff term="Falsifikation" /> statt
			Beweis — geht auf Karl Popper zurück.
		</p>

		<!-- H0 vs HA ------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">H0 und HA: die zwei Hypothesen jedes Tests</h2>
		<p class="text-ink-soft leading-relaxed">
			Jeder Test stellt zwei Hypothesen gegenüber. Die <Begriff term="Nullhypothese" /> H₀ ist die
			langweilige Annahme: <strong>kein Effekt</strong>, Sonnen- und Schattenpflanzen sind im Mittel
			gleich groß. Die <Begriff term="Alternativhypothese">Alternativhypothese</Begriff> HA (oder
			H₁) ist deine eigentliche Vermutung: Es <strong>gibt</strong> einen Unterschied.
		</p>
		<p class="text-ink-soft leading-relaxed">
			In Formelsprache stehen dafür gleich die Symbole μ<sub>Sonne</sub> und μ<sub>Schatten</sub>
			(μ ist die wahre, unbekannte mittlere Blattgröße einer Gruppe). Lies sie einfach als Klartext:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>
				<strong>H₀:</strong> μ<sub>Sonne</sub> = μ<sub>Schatten</sub> heißt schlicht „die
				mittleren Blattgrößen sind <strong>gleich</strong>“.
			</li>
			<li>
				<strong>HA:</strong> μ<sub>Sonne</sub> ≠ μ<sub>Schatten</sub> heißt „die mittleren
				Blattgrößen sind <strong>verschieden</strong>“.
			</li>
		</ul>

		<FormelZeigen
			formula={String.raw`H_0:\ \mu_{\text{Sonne}} = \mu_{\text{Schatten}} \qquad H_A:\ \mu_{\text{Sonne}} \neq \mu_{\text{Schatten}}`}
			symbols={[
				{ sym: String.raw`H_0`, bedeutung: 'Die Nullhypothese: kein Unterschied. Sie ist der Ausgangspunkt, den der Test zu widerlegen versucht.' },
				{ sym: String.raw`H_A`, bedeutung: 'Die Alternativhypothese: es gibt einen Effekt. Enthält immer eine Effektgröße (hier den Unterschied der Mittelwerte).' },
				{ sym: String.raw`\mu_{\text{Sonne}}, \mu_{\text{Schatten}}`, bedeutung: 'Die wahren mittleren Blattgrößen der beiden Grundgesamtheiten — fest und unbekannt.' }
			]}
		/>

		<Merke title="HA enthält immer eine Effektgröße">
			H₀ sagt „nichts ist los“ (Effekt = 0). HA sagt „da ist etwas“ und steckt damit eine
			<Begriff term="Effektgröße" /> ungleich null — grob gesagt eine Aussage darüber, <em>wie
			groß</em> der Unterschied ist (das vertiefen wir in Lektion 7). Bewiesen wird HA nie direkt.
			Der Test kann nur H₀ verwerfen oder sie stehen lassen.
		</Merke>

		<!-- Einseitig vs. zweiseitig -------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Einseitig oder zweiseitig? Die Richtung von HA</h2>
		<p class="text-ink-soft leading-relaxed">
			HA enthält immer eine Effektrichtung. Aber wie viel Richtung? Hier scheiden sich zwei Arten
			von Test. Ein <Begriff term="Zweiseitiger Test">zweiseitiger Test</Begriff> ist
			<strong>ungerichtet</strong>: HA lautet <em>μ₁ ≠ μ₂</em> („irgendein Unterschied, egal in
			welche Richtung“). So fragst du im Blattbeispiel schlicht, <em>ob</em> sich Sonnen- und
			Schattenblätter in der Größe unterscheiden, kleiner oder größer, beides zählt. Das
			Signifikanzniveau α verteilt sich dann auf <strong>beide</strong> Schwänze der Verteilung.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Ein <Begriff term="Einseitiger Test">einseitiger Test</Begriff> ist dagegen
			<strong>gerichtet</strong>: HA lautet <em>μ₁ &gt; μ₂</em> (oder <em>μ₁ &lt; μ₂</em>). Du
			behauptest also nicht nur einen Unterschied, sondern legst dich vorab auf seine
			<strong>Richtung</strong> fest. Das gesamte α liegt dann in <strong>einem</strong> Schwanz.
			Der Test ist in dieser Richtung empfindlicher (kleinere p-Werte), blind aber für eine
			Abweichung in die Gegenrichtung. Ein klassisches biologisches Beispiel: Wenn wir aus der
			Wirkungs-Theorie heraus erwarten, dass eine <strong>Düngung den Ertrag erhöht</strong>
			(nicht senkt), dürfen wir gerichtet einseitig testen — H₀: μ<sub>gedüngt</sub> ≤
			μ<sub>Kontrolle</sub> gegen HA: μ<sub>gedüngt</sub> &gt; μ<sub>Kontrolle</sub>.
		</p>
		<Callout variant="warnung" title="Erst die Richtung begründen, dann testen — nie umgekehrt">
			Einseitig testen darfst du nur, wenn die Richtung <strong>vor</strong> dem Blick in die Daten
			biologisch begründet feststeht. Wer erst die Daten ansieht, die Richtung abliest und
			<em>dann</em> einseitig testet, halbiert sich den p-Wert unredlich und bläht so heimlich den
			Fehler 1. Art (die Fehlalarm-Rate) auf. Im Zweifel, und immer wenn die Richtung offen ist,
			bleibst du ehrlich <strong>zweiseitig</strong>.
		</Callout>

		<Merke title="Einseitig nur mit vorab begründeter Richtung">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Zweiseitig</strong> (Standard): HA: μ₁ ≠ μ₂, ungerichtet, fragt nur <em>ob</em>
					es einen Unterschied gibt. α auf beide Schwänze verteilt.
				</li>
				<li>
					<strong>Einseitig</strong>: HA: μ₁ &gt; μ₂ bzw. μ₁ &lt; μ₂, gerichtet, nur erlaubt, wenn
					die Richtung <strong>vorab</strong> biologisch begründet ist (z. B. „Düngung
					<em>erhöht</em> den Ertrag“). α komplett in einem Schwanz.
				</li>
				<li>
					In <strong>jedem</strong> Fall enthält HA eine Effektrichtung. „Kein Unterschied“ ist
					<strong>nie</strong> HA — das ist immer die Nullhypothese H₀.
				</li>
			</ul>
		</Merke>

		<!-- Das 8-Schritte-Vorgehen --------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Das Vorgehen in acht Schritten</h2>
		<p class="text-ink-soft leading-relaxed">
			Fast jeder klassische Test folgt demselben Ablauf, am Blattgrößen-Beispiel:
		</p>
		<Merke title="Hypothesentest in 8 Schritten">
			<p class="mb-1 font-semibold">Vorbereitung — bevor du auf die Daten schaust:</p>
			<ol class="ml-5 list-decimal space-y-1">
				<li>Forschungsfrage formulieren („Sind Sonnenblätter anders groß als Schattenblätter?“).</li>
				<li>H₀ und HA aufstellen (kein Unterschied vs. Unterschied).</li>
				<li>Passenden Test wählen (hier: t-Test für zwei Mittelwerte).</li>
				<li>
					<Begriff term="Signifikanzniveau" /> α festlegen (meist 0,05) — die Schwelle, ab der du
					ein Ergebnis „signifikant“ nennst. Unbedingt <em>vor</em> dem Test.
				</li>
			</ol>
			<p class="mt-3 mb-1 font-semibold">Durchführung — mit den Daten:</p>
			<ol start="5" class="ml-5 list-decimal space-y-1">
				<li>Daten erheben (Blätter beider Gruppen messen).</li>
				<li>
					<Begriff term="Teststatistik" /> berechnen — eine einzige Zahl, die zusammenfasst, wie
					weit dein Befund von H₀ entfernt liegt.
				</li>
				<li>p-Wert bestimmen.</li>
				<li>Entscheiden: p ≤ α → H₀ verwerfen; p &gt; α → H₀ beibehalten. Biologisch deuten.</li>
			</ol>
		</Merke>

		<!-- Teststatistik & p-Wert ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Teststatistik und p-Wert</h2>
		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Teststatistik" /> presst deinen Befund in eine einzige Zahl: Sie misst den
			beobachteten Unterschied in Einheiten des Standardfehlers. Beim Vergleich zweier Mittelwerte
			ist das ein t-Wert, grob „Signal geteilt durch Rauschen“:
		</p>

		<FormelZeigen
			formula={String.raw`t = \frac{\bar x_{\text{Sonne}} - \bar x_{\text{Schatten}}}{SE_{\text{Differenz}}}`}
			symbols={[
				{ sym: String.raw`\bar x_{\text{Sonne}} - \bar x_{\text{Schatten}}`, bedeutung: 'Der beobachtete Größenunterschied der beiden Stichproben — das „Signal“.' },
				{ sym: String.raw`SE_{\text{Differenz}}`, bedeutung: 'Der Standardfehler der Differenz — das „Rauschen“, also wie stark der Unterschied allein durch Zufall schwanken würde.' },
				{ sym: String.raw`t`, bedeutung: 'Die Teststatistik: Wie viele Standardfehler liegt dein Befund von der Null (kein Unterschied) entfernt? Aus ihr folgt der p-Wert.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Der <Begriff term="p-Wert" /> übersetzt diese Teststatistik in eine Wahrscheinlichkeit:
			<strong>Wie wahrscheinlich wäre ein mindestens so extremer Befund, wenn H₀ stimmte?</strong>
			Ist p klein (kleiner als α), ist dein Befund unter H₀ so unwahrscheinlich, dass du H₀
			verwirfst und von einem „signifikanten“ Ergebnis sprichst.
		</p>

		<FormelZeigen
			formula={String.raw`p = P\big(\text{Daten so extrem oder extremer}\;\big|\;H_0\ \text{wahr}\big)`}
			symbols={[
				{ sym: String.raw`p`, bedeutung: 'Der p-Wert: die Wahrscheinlichkeit für einen mindestens so extremen Befund, UNTER der Annahme, dass H₀ gilt.' },
				{ sym: String.raw`H_0\ \text{wahr}`, bedeutung: 'Die Bedingung: Wir rechnen so, als gäbe es in Wahrheit keinen Unterschied. Der p-Wert sagt nichts darüber, wie wahrscheinlich diese Bedingung selbst ist.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Der senkrechte Strich „|“ in der Formel heißt <strong>„unter der Bedingung, dass“</strong>.
			Lies P(Daten so extrem | H₀ wahr) also als: die Wahrscheinlichkeit, solche (oder extremere)
			Daten zu sehen, <strong>wenn H₀ in Wahrheit gilt</strong>. Entscheidend ist die Leserichtung:
			Wir setzen H₀ als gegeben <em>voraus</em> und fragen nach den Daten — nicht umgekehrt. Der
			p-Wert ist damit gerade <strong>nicht</strong> P(H₀ wahr | Daten), also <em>nicht</em> die
			Wahrscheinlichkeit, dass H₀ stimmt.
		</p>

		<!-- DIE zentrale Fehldeutung -------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die eine Sache, die fast alle am p-Wert falsch verstehen</h2>

		<Callout variant="warnung" title="Der p-Wert ist NICHT die Wahrscheinlichkeit, dass H0 stimmt">
			Der p-Wert ist <strong>P(Daten so extrem oder extremer | H₀ wahr)</strong>, eine Aussage
			<em>unter der Annahme</em>, dass H₀ gilt. Er ist <strong>nicht</strong>
			P(H₀ wahr | Daten) und <strong>nicht</strong> die Wahrscheinlichkeit, dass dein gefundener
			Effekt echt ist. „p = 0,03“ heißt also <em>nicht</em> „es gibt zu 97 % einen echten
			Unterschied“. Das Verwechseln dieser beiden bedingten Wahrscheinlichkeiten, P(Daten | H₀)
			gegen P(H₀ | Daten), ist der häufigste Fehler in der ganzen Statistik.
		</Callout>

		<Intuition title="„Nicht signifikant“ heißt nicht „kein Unterschied“">
			Genauso wichtig die Rückseite: Ein großes p (z. B. 0,21) <strong>beweist H₀ nicht</strong>. Es
			heißt nur „kein Nachweis“. Vielleicht gibt es wirklich keinen Unterschied, vielleicht war
			deine Stichprobe schlicht zu klein, um einen vorhandenen Effekt aufzuspüren (zu wenig Power).
			Absence of evidence ist nicht evidence of absence. Bei den Blättern: „nicht signifikant“ darf
			nie zu „Sonne und Schatten machen keinen Unterschied“ werden.
		</Intuition>

		<Analogie title="Der p-Wert ist wie ein Gerichtsverfahren">
			H₀ ist die Unschuldsvermutung („kein Effekt“). Der p-Wert misst, wie gut die Beweise zur
			Unschuld passen — nicht, wie wahrscheinlich der Angeklagte schuldig ist. Ein Freispruch („nicht
			signifikant“) heißt „nicht genug Beweise“, nicht „unschuldig bewiesen“. Und schuldig gesprochen
			(„signifikant“) wird nur, wenn die Beweise unter der Unschuldsvermutung extrem unwahrscheinlich
			wären.
		</Analogie>

		<!-- p-Wert-Würfelspiel --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: das p-Wert-Würfelspiel</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier wird greifbar, warum Signifikanz nicht dasselbe ist wie Wahrheit. Jedes „Experiment“ misst
			erneut die Blattgröße von Sonnen- und Schattenpflanzen, rechnet einen t-Test und färbt das
			Ergebnis grün (nicht signifikant) oder rot (signifikant). Geh so vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Lass den Schalter <strong>„In Wahrheit kein Unterschied (H0 wahr)“</strong> an und klick auf <strong>„100 Experimente“</strong>.</li>
			<li>Obwohl es <em>keinen</em> Unterschied gibt, leuchten ungefähr <strong>5 %</strong> der Läufe rot: reine Fehlalarme. Das ist α.</li>
			<li>Schalt <strong>„H0 wahr“</strong> aus, dreh den <strong>wahren Unterschied</strong> hoch und lauf erneut: Jetzt werden viel mehr Experimente signifikant.</li>
			<li>Setz den Effekt klein und erhöh <strong>n</strong> — auch mehr Daten machen einen echten Effekt leichter sichtbar.</li>
		</ol>

		<PWertSpiel />

		<Merke title="Was das Spiel zeigt">
			Unter einer wahren H₀ fallen rund <strong>α = 5 %</strong> der Tests rein zufällig
			„signifikant“ aus. Ein einzelnes signifikantes Ergebnis ist also kein Wahrheitsbeweis.
			Deshalb sind Replikation und vorab festgelegte Hypothesen so wichtig.
		</Merke>

		<!-- Fehler 1. & 2. Art --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Zwei Arten, sich zu irren — und die Teststärke</h2>
		<p class="text-ink-soft leading-relaxed">
			Bei jeder Testentscheidung kannst du auf zwei Weisen danebenliegen. Sieh dir beide einzeln an.
		</p>

		<h3 class="mt-2 text-xl">Fehler 1. Art: ein Fehlalarm (α)</h3>
		<p class="text-ink-soft leading-relaxed">
			Beim <Begriff term="Fehler 1. Art" /> verwirfst du eine wahre H₀: Du „findest“ einen
			Größenunterschied, den es in Wahrheit gar nicht gibt — ein <strong>Fehlalarm</strong>. Seine
			Wahrscheinlichkeit ist genau das Signifikanzniveau <strong>α</strong>, das du vorab festlegst
			(meist 5 %).
		</p>

		<h3 class="mt-2 text-xl">Fehler 2. Art: ein übersehener Effekt (β)</h3>
		<p class="text-ink-soft leading-relaxed">
			Beim <Begriff term="Fehler 2. Art" /> ist es umgekehrt: Es gibt einen echten Unterschied, aber
			dein Test übersieht ihn. Du <strong>verpasst</strong> ihn. Seine Wahrscheinlichkeit heißt
			<strong>β</strong>.
		</p>

		<div class="overflow-x-auto">
			<table class="border-ink/10 w-full border-collapse text-left text-sm">
				<thead>
					<tr class="bg-paper-sunk/60">
						<th class="border-ink/10 border px-3 py-2"></th>
						<th class="border-ink/10 border px-3 py-2">H₀ ist wahr (kein Unterschied)</th>
						<th class="border-ink/10 border px-3 py-2">HA ist wahr (echter Unterschied)</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th class="border-ink/10 bg-paper-sunk/60 border px-3 py-2">Test sagt „signifikant“</th>
						<td class="border-ink/10 text-coral-700 border px-3 py-2">Fehler 1. Art (α) — Fehlalarm</td>
						<td class="border-ink/10 text-sage-500 border px-3 py-2">richtig: Effekt erkannt (Power)</td>
					</tr>
					<tr>
						<th class="border-ink/10 bg-paper-sunk/60 border px-3 py-2">Test sagt „nicht signifikant“</th>
						<td class="border-ink/10 text-sage-500 border px-3 py-2">richtig: kein Fehlalarm</td>
						<td class="border-ink/10 text-coral-700 border px-3 py-2">Fehler 2. Art (β) — verpasst</td>
					</tr>
				</tbody>
			</table>
		</div>

		<h3 class="mt-2 text-xl">Teststärke (Power): echte Effekte finden</h3>
		<p class="text-ink-soft leading-relaxed">
			Die <Begriff term="Teststärke" /> (Power) ist die Gegenwahrscheinlichkeit zum Fehler 2. Art:
			<strong>Power = 1 − β</strong>. Sie sagt, wie zuverlässig dein Test einen wirklich vorhandenen
			Unterschied auch als signifikant erkennt.
		</p>

		<FormelZeigen
			formula={String.raw`\text{Power} = 1 - \beta`}
			symbols={[
				{ sym: String.raw`\beta`, bedeutung: 'Die Wahrscheinlichkeit des Fehlers 2. Art: einen echten Effekt zu übersehen.' },
				{ sym: String.raw`1 - \beta`, bedeutung: 'Die Teststärke (Power): die Wahrscheinlichkeit, einen vorhandenen Effekt korrekt zu entdecken.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Der zentrale Haken beim Zusammenspiel: <strong>Bei festem Stichprobenumfang n kannst du α und
			β nicht gleichzeitig kleinmachen.</strong> Ein strengeres α (weniger Fehlalarme) schiebt die
			Entscheidungsschwelle nach außen und vergrößert dadurch β — du übersiehst dann mehr echte
			Effekte. Aus diesem Tauschgeschäft kommst du nur mit mehr Information heraus: Ein
			<strong>größeres n</strong> oder ein <strong>größerer Effekt</strong> hebt die Power, ohne dass
			du α opfern musst.
		</p>

		<Callout variant="merke" title="Welcher Fehler ist schlimmer?">
			Welchen der beiden Fehler du eher vermeiden willst, ist eine bewusste Abwägung. In der
			Biologie ist es meist schlimmer, ein Pflanzenwachstums-Phänomen zu behaupten, das es gar nicht
			gibt (Fehler 1. Art), als vorsichtig zu bleiben. Deshalb hält man α klein — und erkauft sich
			die nötige Power lieber über ein größeres n.
		</Callout>

		<!-- Power-Visualisierer -------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Power-Visualisierer</h2>
		<p class="text-ink-soft leading-relaxed">
			Jetzt siehst du α, β und die Power gleichzeitig. Die linke graue Kurve ist die Welt unter
			<strong>H₀</strong> (kein Unterschied), die rechte grüne die Welt unter <strong>HA</strong> (ein
			echter Unterschied). Die gestrichelte Linie ist deine Entscheidungsschwelle. Probier:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Zieh <strong>α</strong> kleiner: Die Entscheidungslinie wandert nach rechts, die korallene α-Fläche schrumpft, aber die graue β-Fläche wächst und die <strong>Power sinkt</strong>.</li>
			<li>Erhöh die <strong>Effektgröße</strong> — die HA-Kurve rückt nach rechts, β schrumpft, die Power steigt.</li>
			<li>Erhöh <strong>n</strong>: Der Effekt in Standardfehlern wächst, beide Welten trennen sich klarer, die Power steigt ebenfalls.</li>
			<li>Stell die Effektgröße auf <strong>0</strong>: Jetzt liegen H₀ und HA übereinander und die Power fällt auf α — du „findest“ nur noch Fehlalarme.</li>
		</ol>

		<PowerVisualizer />

		<Callout variant="merke" title="Hinweis zum Visualisierer">
			Beide Kurven leben auf der z-Skala der Teststatistik (Standardabweichung 1), und der Test ist
			der Einfachheit halber einseitig dargestellt. So fällt der rechte H₀-Schwanz jenseits der Linie
			exakt mit α zusammen, und die Lage der HA-Kurve ist die Effektgröße in Standardfehlern.
		</Callout>

		<Intuition title="In einem Satz">
			Ein Hypothesentest widerlegt (oder eben nicht) die langweilige H₀; der p-Wert ist die
			Wahrscheinlichkeit deiner Daten <em>unter</em> H₀ — nicht die Wahrscheinlichkeit von H₀; und
			ob du einen echten Effekt findest, hängt von α, der Effektgröße und der Stichprobengröße ab,
			zusammengefasst in der Power = 1 − β.
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
