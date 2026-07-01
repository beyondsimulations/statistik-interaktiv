<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import KontingenztafelEditor from '$lib/widgets/KontingenztafelEditor.svelte';
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

	const slug = 'chi-quadrat';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'cq-1',
			kind: 'mc',
			prompt:
				'Du testest eine Kontingenztafel Art × Habitat auf Unabhängigkeit. Was stellen die „erwarteten“ Werte E in der χ²-Rechnung dar?',
			options: [
				'Eine zweite, unabhängig erhobene Stichprobe, mit der du deine Zählungen vergleichst.',
				'Die Häufigkeiten, die du unter der Nullhypothese erwarten würdest — hier: dass Art und Habitat unabhängig sind. Sie verkörpern das Modell, sind keine Daten.',
				'Die durchschnittliche Anzahl Tiere pro Zelle, also der Mittelwert der vier Zellen.'
			],
			correct: 1,
			explanation:
				'Genau. Die E-Werte sind keine gemessenen Daten, sondern folgen aus der Nullhypothese. Beim Unabhängigkeitstest heißt H₀ „Art und Habitat sind unabhängig“, und daraus berechnet man E = (Zeilensumme·Spaltensumme)/N. Beim Anpassungstest verkörpern die E ein genetisches Modell (z. B. das 9:3:3:1-Verhältnis). χ² = Σ(B−E)²/E misst, wie weit die beobachteten Zählungen von diesem Modell abweichen.'
		},
		{
			id: 'cq-2',
			kind: 'mc',
			prompt:
				'In deiner 2×2-Tafel Befall (ja/nein) × Behandlung (behandelt/unbehandelt) ist eine Zelle mit erwartetem Wert E = 3 dabei. Was tust du?',
			options: [
				'Nichts — χ² funktioniert immer, egal wie klein die erwarteten Häufigkeiten sind.',
				'Du wechselst auf Fishers exakten Test (oder fasst Kategorien zusammen), denn die Faustregel E ≥ 5 ist verletzt und die χ²-Näherung wird unzuverlässig.',
				'Du rechnest einfach mit Prozenten statt Anzahlen weiter, dann ist E ≥ 5 kein Problem mehr.'
			],
			correct: 1,
			explanation:
				'Richtig. Der χ²-Test ist eine Näherung, die zu kleine erwartete Häufigkeiten schlecht verträgt — Faustregel: alle E ≥ 5 (höchstens 20 % unter 5 und keiner < 1). Ist das verletzt, nimmst du Fishers exakten Test oder fasst Kategorien zusammen. Und niemals mit Prozenten rechnen: χ² braucht immer echte Anzahlen.'
		},
		{
			id: 'cq-3',
			kind: 'mc',
			prompt:
				'Du prüfst Mendels dihybride Erbsen gegen das erwartete Verhältnis 9:3:3:1 (vier Phänotyp-Klassen). Wie viele Freiheitsgrade hat dieser Anpassungstest?',
			options: ['df = 4 (eine je Klasse)', 'df = 3 (k − 1 bei k = 4 Klassen)', 'df = 1 (immer 1 bei Genetik)'],
			correct: 1,
			explanation:
				'Korrekt. Beim Anpassungstest gilt df = k − 1, mit k = Anzahl Kategorien. Bei vier Phänotyp-Klassen also df = 4 − 1 = 3. (Zum Vergleich: Beim Unabhängigkeitstest einer Tafel gilt df = (Zeilen − 1)·(Spalten − 1), für eine 2×2-Tafel daher df = 1.)'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Chi-Quadrat-Tests für kategoriale Häufigkeitsdaten: der Anpassungstest (goodness of fit) an Mendels 9:3:3:1-Erbsen und der Unabhängigkeitstest auf einer Kontingenztafel (Art × Habitat). Die zentrale Intuition χ² = Σ(B−E)²/E, die Erwartungswerte aus den Rändern, Voraussetzungen (E ≥ 5, Fisher-Test, Yates-Korrektur) und chisq.test() in R — mit einem interaktiven Kontingenztafel-Editor."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Klausur-relevant · Testen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Chi-Quadrat-Tests</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Bisher ging es um Mittelwerte und Streuungen, gemessene Größen wie die Zugdistanz in
			Kilometern. Jetzt geht es um etwas anderes: ums <strong>Zählen</strong>. Wie viele Erbsen sind
			gelb-rund, wie viele grün-runzlig? Wie viele Tiere einer Art leben in welchem Habitat? Solche
			<strong>kategorialen Häufigkeitsdaten</strong> wertet der
			<Begriff term="Chi-Quadrat-Test">Chi-Quadrat-Test (χ²)</Begriff> aus. In dieser Lektion lernst
			du die eine Intuition, die alles trägt: χ² misst, wie weit das, was du
			<strong>gezählt</strong> hast, von dem abweicht, was du bei reinem Zufall
			<strong>erwarten</strong> würdest.
		</p>

		<Rueckblick {slug} />

		<Callout variant="warnung" title="Chi-Quadrat will Anzahlen — keine Prozente, keine Mittelwerte">
			Der erste und häufigste Fehler: χ² in eine Prozent- oder Mittelwerttabelle stecken. Das geht
			schief. χ² rechnet immer mit <strong>absoluten Häufigkeiten</strong> (ganze Anzahlen, „counts“).
			36 von 80 ist etwas anderes als „45 %“: Die Stichprobengröße steckt in der Zahl drin, und genau
			die braucht der Test.
		</Callout>

		<!-- Die zentrale Intuition ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die zentrale Idee: beobachtet gegen erwartet</h2>
		<p class="text-ink-soft leading-relaxed">
			Stell dir χ² als ehrliche Buchhaltung der Überraschung vor. Für jede Kategorie hast du eine
			<strong>beobachtete</strong> Anzahl <em>B</em> (das, was du gezählt hast) und eine
			<strong>erwartete</strong> Anzahl <em>E</em> (das, was ein Modell vorhersagt). χ² summiert die
			quadrierten Abweichungen <em>(B − E)²</em>, jede aber relativiert an ihrem eigenen
			Erwartungswert <em>E</em>. So zählt eine Abweichung von 10 bei E = 5 viel schwerer als
			dieselbe 10 bei E = 1000.
		</p>

		<Intuition title="χ² = Σ (B − E)² / E — Abweichung, relativiert an der Erwartung">
			Jede Kategorie fragt: <em>Wie weit liegt meine Zählung daneben — gemessen an dem, was ich
			erwartet hätte?</em> Quadrieren macht alle Abweichungen positiv und bestraft große
			Ausreißer stärker. Das Teilen durch <strong>E</strong> setzt die Abweichung ins richtige
			Verhältnis: 3 Tiere zu wenig sind bei einer Erwartung von 5 dramatisch, bei einer Erwartung
			von 500 ein Nichts. Stimmen Beobachtung und Modell überall überein, ist jeder Summand 0 und
			χ² = 0. Je größer χ², desto unwahrscheinlicher unter H₀ — desto kleiner der p-Wert.
			Entscheidend: Die <strong>erwarteten Werte sind keine Daten</strong>. Sie verkörpern die
			Nullhypothese, also das genetische Modell bzw. die Unabhängigkeit zweier Merkmale.
		</Intuition>

		<FormelZeigen
			formula={String.raw`\chi^2 = \sum_{i} \frac{(B_i - E_i)^2}{E_i}`}
			symbols={[
				{ sym: String.raw`B_i`, bedeutung: 'Die beobachtete Häufigkeit in Kategorie i — eine echte, gezählte Anzahl aus deinen Daten.' },
				{ sym: String.raw`E_i`, bedeutung: 'Die unter H₀ erwartete Häufigkeit. Sie ist kein Messwert, sondern folgt aus dem Modell (genetisches Verhältnis bzw. Unabhängigkeit).' },
				{ sym: String.raw`(B_i - E_i)^2`, bedeutung: 'Die quadrierte Abweichung: immer positiv, große Abweichungen wiegen überproportional schwer.' },
				{ sym: String.raw`/\,E_i`, bedeutung: 'Relativierung: dieselbe absolute Abweichung zählt bei kleiner Erwartung viel mehr als bei großer.' },
				{ sym: String.raw`\chi^2`, bedeutung: 'Die Teststatistik. 0 bei perfekter Übereinstimmung; je größer, desto unwahrscheinlicher unter H₀.' }
			]}
		/>

		<!-- Anpassungstest ------------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Variante 1: Der Anpassungstest (goodness of fit)</h2>
		<p class="text-ink-soft leading-relaxed">
			Der <Begriff term="Anpassungstest" /> beantwortet die Frage: <em>Folgen meine beobachteten
			Häufigkeiten einer erwarteten Verteilung?</em> Das klassische Beispiel kommt aus der
			Genetik. Mendel kreuzte Erbsen, die sich in zwei Merkmalen unterschieden (Form und Farbe),
			und erwartete in der F₂-Generation das berühmte <strong>9:3:3:1-Spaltungsverhältnis</strong>
			der vier Phänotyp-Klassen.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Aus N = 556 Pflanzen zählte Mendel: 315 rund-gelb, 101 runzlig-gelb, 108 rund-grün, 32
			runzlig-grün. Das Modell 9:3:3:1 sagt für N = 556 die erwarteten Anzahlen
			<strong>312,8 · 104,3 · 104,3 · 34,8</strong> voraus (also N mal 9/16, 3/16, 3/16, 1/16).
			Passt das beobachtete zum erwarteten Verhältnis?
		</p>

		<Merke title="Anpassungstest in Kürze">
			<ul class="ml-5 list-disc space-y-1">
				<li>H₀: Die Daten folgen der erwarteten Verteilung (z. B. dem 9:3:3:1-Modell).</li>
				<li>Erwartete Häufigkeit je Kategorie: <strong>E<sub>i</sub> = N · p<sub>i</sub></strong> (p<sub>i</sub> = erwarteter Anteil).</li>
				<li>Freiheitsgrade: <strong>df = k − 1</strong> (k = Anzahl Kategorien). Bei 9:3:3:1 also df = 4 − 1 = 3.</li>
			</ul>
		</Merke>

		<FormelZeigen
			formula={String.raw`E_i = N \cdot p_i \qquad \chi^2 = \sum_{i=1}^{k} \frac{(B_i - E_i)^2}{E_i} \qquad df = k - 1`}
			symbols={[
				{ sym: String.raw`N`, bedeutung: 'Die Gesamtzahl der gezählten Fälle (Summe aller beobachteten Häufigkeiten).' },
				{ sym: String.raw`p_i`, bedeutung: 'Der unter H₀ erwartete Anteil der Kategorie i — beim Mendel-Modell z. B. 9/16, 3/16, 3/16, 1/16.' },
				{ sym: String.raw`k`, bedeutung: 'Die Anzahl der Kategorien. Bei den vier Mendel-Phänotypen ist k = 4.' }
			]}
		/>

		<Analogie title="Der erwartete Bauplan">
			Das 9:3:3:1-Verhältnis ist wie ein Bauplan, den die Vererbungsregeln vorgeben. Der
			Anpassungstest legt deine gezählten Erbsen über diesen Bauplan und fragt: Weicht die
			Realität so stark ab, dass der Bauplan widerlegt ist — oder sind die kleinen Abweichungen
			bloß das normale Rauschen einer endlichen Stichprobe? Für Mendels Daten ergibt sich
			χ² ≈ 0,47 bei df = 3 und p ≈ 0,93: Die Abweichungen sind winzig, das Modell passt
			hervorragend.
		</Analogie>

		<!-- Unabhängigkeitstest ------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Variante 2: Der Unabhängigkeitstest (Kontingenztafel)</h2>
		<p class="text-ink-soft leading-relaxed">
			Die zweite Variante prüft, ob <strong>zwei kategoriale Merkmale unabhängig</strong> sind.
			Beispiel: Du fängst Tiere zweier Arten und notierst, in welchem von zwei Habitaten sie
			leben. Das ergibt eine <Begriff term="Kontingenztafel" />, eine Kreuztabelle der Anzahlen:
		</p>

		<div class="border-ink/10 bg-paper-raised shadow-soft my-3 overflow-x-auto rounded-2xl border">
			<table class="w-full border-collapse text-center text-sm">
				<thead>
					<tr class="border-ink/10 border-b">
						<th class="px-4 py-2"></th>
						<th class="text-ink-soft px-4 py-2 font-semibold">Habitat 1</th>
						<th class="text-ink-soft px-4 py-2 font-semibold">Habitat 2</th>
						<th class="text-ink-faint px-4 py-2 text-xs font-semibold">Σ Zeile</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th class="text-ink-soft px-4 py-2 text-left font-semibold">Art A</th>
						<td class="px-4 py-2 tabular-nums">30</td>
						<td class="px-4 py-2 tabular-nums">10</td>
						<td class="text-ink-faint px-4 py-2 tabular-nums">40</td>
					</tr>
					<tr>
						<th class="text-ink-soft px-4 py-2 text-left font-semibold">Art B</th>
						<td class="px-4 py-2 tabular-nums">12</td>
						<td class="px-4 py-2 tabular-nums">28</td>
						<td class="text-ink-faint px-4 py-2 tabular-nums">40</td>
					</tr>
					<tr class="border-ink/10 border-t">
						<th class="text-ink-faint px-4 py-2 text-left text-xs font-semibold">Σ Spalte</th>
						<td class="text-ink-faint px-4 py-2 tabular-nums">42</td>
						<td class="text-ink-faint px-4 py-2 tabular-nums">38</td>
						<td class="text-ink px-4 py-2 font-semibold tabular-nums">80</td>
					</tr>
				</tbody>
			</table>
		</div>

		<p class="text-ink-soft leading-relaxed">
			Die Nullhypothese lautet: <strong>Art und Habitat sind unabhängig</strong>. Die
			Habitatwahl hängt nicht von der Art ab. Wären sie unabhängig, müsste sich jede Zelle aus
			ihren <strong>Rändern</strong> ergeben: aus der Zeilensumme (wie viele Tiere der Art) und
			der Spaltensumme (wie viele Tiere im Habitat), geteilt durch die Gesamtzahl N. Genau das
			ist die Formel für die <Begriff term="Erwartungswert">Erwartungswerte</Begriff>.
		</p>

		<FormelZeigen
			formula={String.raw`E_{ij} = \frac{(\text{Zeilensumme}_i)\cdot(\text{Spaltensumme}_j)}{N} \qquad df = (r-1)(c-1)`}
			symbols={[
				{ sym: String.raw`E_{ij}`, bedeutung: 'Die unter Unabhängigkeit erwartete Häufigkeit der Zelle in Zeile i, Spalte j.' },
				{ sym: String.raw`\text{Zeilensumme}_i`, bedeutung: 'Die Summe der beobachteten Häufigkeiten in Zeile i (z. B. alle Tiere der Art A).' },
				{ sym: String.raw`\text{Spaltensumme}_j`, bedeutung: 'Die Summe der beobachteten Häufigkeiten in Spalte j (z. B. alle Tiere in Habitat 1).' },
				{ sym: String.raw`N`, bedeutung: 'Die Gesamtsumme aller Zellen.' },
				{ sym: String.raw`r,\ c`, bedeutung: 'Anzahl der Zeilen r und Spalten c. Bei einer 2×2-Tafel ist df = (2−1)(2−1) = 1.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Für unsere Tafel ist z. B. E<sub>11</sub> = (40·42)/80 = 21 erwartete Tiere der Art A in
			Habitat 1, beobachtet sind aber 30. Die Art A sitzt also häufiger in Habitat 1, als
			Unabhängigkeit erwarten ließe. Ob diese Abweichung signifikant ist, sagt χ².
			Probier es gleich selbst aus.
		</p>

		<!-- Flagship-Widget ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Kontingenztafel-Editor</h2>
		<p class="text-ink-soft leading-relaxed">
			Tipp links die <strong>beobachteten Anzahlen</strong> ein. Rechts berechnen sich live die
			<strong>erwarteten Werte E</strong> aus den Rändern, der <strong>Beitrag (B − E)²/E</strong>
			jeder Zelle (je kräftiger gefärbt, desto mehr trägt sie bei) und unten
			<strong>χ², df und der p-Wert</strong>. Probier:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Mach die Verteilung gleichmäßiger (z. B. überall 20): Die Beiträge schrumpfen, χ² geht gegen 0, p steigt, kein Zusammenhang mehr.</li>
			<li>Verschärf den Kontrast (z. B. 38/2 und 4/36): Die Beiträge leuchten auf, χ² steigt, p sinkt.</li>
			<li>Setz eine Zelle sehr klein, bis ein <strong>E &lt; 5</strong> auftaucht — die Warnung erscheint: lieber Fisher-Test.</li>
			<li>Schalte die <strong>Yates-Korrektur</strong> an und aus — bei 2×2 verkleinert sie χ² etwas (konservativer).</li>
		</ol>

		<KontingenztafelEditor />

		<Merke title="Was der Editor zeigt">
			Die erwarteten Werte kommen ausschließlich aus den <strong>Rändern</strong> (Zeilen- und
			Spaltensummen): Sie sind das, was bei Unabhängigkeit „herauskommen müsste“. χ² ist die
			Summe der vier Zellbeiträge. Eine einzige stark abweichende Zelle kann den Test schon
			signifikant machen.
		</Merke>

		<!-- Voraussetzungen & Stolpersteine ------------------------------------ -->
		<h2 class="mt-4 text-2xl">Voraussetzungen & Stolpersteine</h2>
		<p class="text-ink-soft leading-relaxed">
			Der χ²-Test ist eine <strong>Näherung</strong>: Die Teststatistik folgt nur ungefähr einer
			χ²-Verteilung. Damit die Näherung trägt, müssen ein paar Dinge stimmen:
		</p>

		<Merke title="Die Stolpersteine des χ²-Tests">
			<ol class="ml-5 list-decimal space-y-1">
				<li><strong>Nur Häufigkeiten.</strong> Echte Anzahlen, niemals Prozente oder Mittelwerte.</li>
				<li><strong>Faustregel E ≥ 5.</strong> Alle erwarteten Häufigkeiten sollten ≥ 5 sein (gelockert: höchstens 20 % der Zellen unter 5 und keine unter 1). Sonst <Begriff term="Fisher-Test">Fishers exakter Test</Begriff> oder Kategorien zusammenfassen.</li>
				<li><strong>Yates-Korrektur bei 2×2 (df = 1).</strong> Die <Begriff term="Yates-Korrektur" /> macht den Test bei einer 2×2-Tafel konservativer. In R ist sie der Default (<code class="font-mono text-sm">correct = TRUE</code>).</li>
				<li><strong>df korrekt wählen.</strong> Anpassungstest: df = k − 1. Unabhängigkeitstest: df = (r − 1)(c − 1).</li>
			</ol>
		</Merke>

		<Callout variant="warnung" title="Erwartungswert < 5 — die Näherung wackelt">
			Sind einzelne erwartete Häufigkeiten zu klein, kann χ² den p-Wert deutlich verzerren. Dann
			ist <Begriff term="Fisher-Test">Fishers exakter Test</Begriff> die saubere Wahl: Er rechnet
			exakt mit der hypergeometrischen Verteilung statt mit einer Näherung. Alternativ fasst du
			seltene Kategorien sinnvoll zusammen, bis alle E ≥ 5 sind.
		</Callout>

		<!-- R-Code -------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So sieht das in R aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Beide Varianten erledigt <code class="font-mono text-sm">chisq.test()</code>. Für den
			Unabhängigkeitstest übergibst du die Tafel als Matrix. So liest du die Ausgabe:
		</p>

		<RCode
			code={`# Unabhaengigkeitstest: Art x Habitat (beobachtete Anzahlen)
tafel <- matrix(c(30, 10,
                  12, 28), nrow = 2, byrow = TRUE)
chisq.test(tafel)`}
			output={`	Pearson's Chi-squared test with Yates' continuity correction

data:  tafel
X-squared = 14.486, df = 1, p-value = 0.0001416`}
			annotations={{
				"X-squared = 14.486": "Die Teststatistik χ². Hier mit Yates-Korrektur (R-Default bei 2×2), daher etwas kleiner als die 16,24 ohne Korrektur.",
				"df = 1": "Freiheitsgrade (Zeilen−1)·(Spalten−1) = 1·1 = 1 für eine 2×2-Tafel.",
				"p-value = 0.0001416": "Klar kleiner als 0,05 → Art und Habitat sind NICHT unabhängig. Die Habitatwahl hängt von der Art ab.",
				"continuity correction": "Verrät, dass R die Yates-Korrektur angewandt hat. Mit chisq.test(tafel, correct = FALSE) bekommst du χ² = 16,24."
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			Wichtig: Schau dir immer <code class="font-mono text-sm">chisq.test(tafel)$expected</code> an.
			Das gibt die erwarteten Häufigkeiten aus. So prüfst du direkt die Faustregel E ≥ 5, bevor
			du dem p-Wert traust. Warnt R „Chi-squared approximation may be incorrect“, ist genau das
			verletzt, und du wechselst auf <code class="font-mono text-sm">fisher.test(tafel)</code>.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Für den Anpassungstest übergibst du die gezählten Klassen und die erwarteten Anteile
			<code class="font-mono text-sm">p</code>:
		</p>

		<RCode
			code={`# Anpassungstest: Mendels Erbsen gegen das 9:3:3:1-Verhaeltnis
beobachtet <- c(315, 101, 108, 32)
chisq.test(beobachtet, p = c(9, 3, 3, 1) / 16)`}
			output={`	Chi-squared test for given probabilities

data:  beobachtet
X-squared = 0.47002, df = 3, p-value = 0.9254`}
			annotations={{
				"X-squared = 0.47002": "Sehr kleines χ²: die gezählten Anzahlen liegen dicht an den erwarteten 312,8 / 104,3 / 104,3 / 34,8.",
				"df = 3": "k − 1 = 4 − 1 = 3 Freiheitsgrade bei vier Phänotyp-Klassen.",
				"p-value = 0.9254": "Weit über 0,05 → kein Hinweis gegen das Modell. Die Daten passen hervorragend zum 9:3:3:1-Verhältnis."
			}}
		/>

		<Callout variant="merke" title="Großes p ist hier kein Beweis — aber Rückenwind fürs Modell">
			Wie bei Voraussetzungstests ist die Logik beim Anpassungstest „umgekehrt“: H₀ ist das Modell
			selbst (9:3:3:1). Ein <strong>großes</strong> p (wie 0,93) heißt „kein Widerspruch zum
			Modell“: Die Daten sind damit gut verträglich. Es <em>beweist</em> das Modell nicht, aber es
			gibt keinen Grund, es zu verwerfen. Ein <strong>kleines</strong> p würde das genetische
			Modell in Frage stellen.
		</Callout>

		<!-- Zusammenfassung ----------------------------------------------------- -->
		<Intuition title="In einem Satz">
			Chi-Quadrat ist eine Familie von Tests für <strong>gezählte kategoriale Daten</strong>: χ² =
			Σ(B − E)²/E misst die Abweichung der beobachteten von den unter H₀ erwarteten Häufigkeiten —
			beim <strong>Anpassungstest</strong> gegen ein Modell (Mendel, df = k − 1), beim
			<strong>Unabhängigkeitstest</strong> gegen die Unabhängigkeit zweier Merkmale (Erwartung aus
			den Rändern, df = (r − 1)(c − 1)) — und bei zu kleinen Erwartungswerten (E &lt; 5) weicht man
			auf Fishers exakten Test aus.
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
