<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import EntscheidungsbaumSpiel from '$lib/widgets/EntscheidungsbaumSpiel.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import RCode from '$lib/components/RCode.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'welcher-test';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'welcher-test-1',
			kind: 'mc',
			prompt:
				'Du misst die Genexpression unter DREI Behandlungsgruppen und willst wissen, ob sich die Mittelwerte unterscheiden. Welcher Test, und was kommt danach?',
			options: [
				'Drei einzelne t-Tests (A–B, A–C, B–C): so deckst du alle Paare ab.',
				'Eine einfaktorielle ANOVA; wird sie signifikant, danach ein Post-hoc-Test (z. B. Tukey HSD).',
				'Ein Chi-Quadrat-Test, weil es drei Kategorien sind.'
			],
			correct: 1,
			explanation:
				'Richtig. Bei drei (oder mehr) Gruppen nimmt man EINEN gemeinsamen Test: die einfaktorielle ANOVA. Drei separate t-Tests würden die familienweise Fehlerrate aufblähen (α-Inflation: bei drei Vergleichen zu je 5 % rund 14 % Fehlalarm-Risiko). Wird die ANOVA signifikant, sagt dir erst ein Post-hoc-Test wie Tukey HSD, welche Paare sich konkret unterscheiden, und hält dabei die Fehlerrate auf α.'
		},
		{
			id: 'welcher-test-2',
			kind: 'mc',
			prompt:
				'Bei welcher dieser Studien sind die Daten GEPAART (abhängig) und nicht unabhängig?',
			options: [
				'Ertrag von Pflanzen unter Dünger A vs. Dünger B, zwei getrennte Pflanzengruppen.',
				'Blutdruck derselben Personen vorher und nachher (nach einer Behandlung).',
				'Cholesterinwerte von Männern vs. Frauen.'
			],
			correct: 1,
			explanation:
				'Richtig. „Vorher/nachher bei denselben Personen“ heißt: jede Messung in der einen Reihe gehört zu genau einer in der anderen, die Daten sind also paarweise verbunden (gepaart). Hier nimmt man den gepaarten t-Test (t.test(..., paired = TRUE)). Die beiden anderen Fälle vergleichen zwei getrennte, unabhängige Gruppen. Dafür ist der unabhängige Zwei-Stichproben-t-Test zuständig. Gepaart und unabhängig nicht zu verwechseln ist entscheidend, sonst verschenkst du Power oder rechnest falsch.'
		},
		{
			id: 'welcher-test-3',
			kind: 'tf',
			prompt:
				'„Den passenden Test wählt man am besten, nachdem man gesehen hat, was signifikant wird.“',
			correct: false,
			explanation:
				'Falsch — und das ist der Kerngedanke dieser Lektion. Den Test wählst du VOR dem Blick auf den p-Wert, allein aus der Fragestellung, dem Datentyp, der Anzahl der Gruppen, gepaart vs. unabhängig und den erfüllten Annahmen. Den Test nach dem Ergebnis auszusuchen („welcher liefert mir Signifikanz?“) ist p-Hacking und macht den p-Wert bedeutungslos.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Die Abschlusslektion bündelt alles: Welchen statistischen Test wählst du? Die zentrale Intuition — den Test wählst du VOR dem Blick auf den p-Wert, aus Datentyp (kategorial → Chi-Quadrat; kontinuierlich → t-Test/ANOVA/Regression), Anzahl der Gruppen (1 vs. Referenz / 2 / ≥3), gepaart vs. unabhängig und den erfüllten Annahmen (sonst nicht-parametrisch). Mit Cheatsheet-Tabelle (Fragestellung → Test → R-Funktion) für die sechs biologischen Beispiele plus die nicht-parametrischen Alternativen, einem interaktiven Entscheidungsbaum-Spiel über alle Test-Familien, einem Szenario-Quiz mit der ≥3-Gruppen-Falle und R-Code-Spickzettel."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-sage-100 text-sage-500 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Vertiefung · Abschluss
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Welcher Test?</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Du hast den ganzen Werkzeugkasten kennengelernt: t-Tests, Chi-Quadrat, ANOVA, Korrelation,
			Regression und ihre nicht-parametrischen Geschwister. Diese letzte Lektion verknüpft alles zu
			der einen praktischen Frage, vor der du in der echten Auswertung stehst:
			<strong>Welchen Test nimmst du eigentlich?</strong> Die gute Nachricht: Es ist kein Raten. Mit
			vier kurzen Fragen landest du fast immer beim richtigen Werkzeug.
		</p>

		<!-- Die zentrale Intuition ----------------------------------------------- -->
		<Intuition title="Den Test wählst du VOR dem Blick auf den p-Wert">
			<p>
				Die wichtigste Regel überhaupt: Welchen Test du rechnest, steht <strong>fest, bevor du das
				Ergebnis siehst</strong>. Du entscheidest ihn aus vier Dingen:
			</p>
			<ol class="mt-2 ml-5 list-decimal space-y-1">
				<li>
					<strong>Datentyp</strong>: kategorial (Häufigkeiten) → <Begriff
						term="Chi-Quadrat-Test">χ²</Begriff>; kontinuierlich (Messwerte) → t-Test / <Begriff
						term="ANOVA"
					/> / <Begriff term="Lineare Regression">Regression</Begriff>.
				</li>
				<li>
					<strong>Anzahl der Gruppen</strong>: eine gegen einen Referenzwert, zwei, oder drei und
					mehr.
				</li>
				<li>
					<strong>Gepaart vs. unabhängig</strong>: dieselben Einheiten zweimal gemessen, oder
					getrennte Gruppen?
				</li>
				<li>
					<strong>Annahmen erfüllt?</strong> Normalverteilung, Varianzhomogenität. Sind sie
					verletzt, weichst du auf einen <Begriff term="nicht-parametrischer Test"
						>nicht-parametrischen Test</Begriff
					> aus.
				</li>
			</ol>
			<p class="mt-2">
				Die Frage lautet also <strong>nicht</strong> „was wird signifikant?“, sondern „was passt zur
				Fragestellung, zum Design und zu den Daten?“. Wer den Test erst nach dem Blick auf den
				<Begriff term="p-Wert" /> aussucht, betreibt p-Hacking.
			</p>
		</Intuition>

		<!-- Cheatsheet ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Der Spickzettel: Fragestellung → Test → R</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier die sechs kanonischen biologischen Beispiele auf einen Blick, jeweils mit dem passenden
			Test und der R-Funktion. Die rechte Spalte zeigt die <strong>Abzweigung „Annahmen
			verletzt“</strong> — den nicht-parametrischen Plan B.
		</p>

		<div class="border-ink/10 bg-paper-raised shadow-soft my-2 overflow-x-auto rounded-2xl border">
			<table class="w-full border-collapse text-left text-sm">
				<thead>
					<tr class="border-ink/10 text-ink border-b">
						<th class="px-4 py-3 font-semibold">Fragestellung (biologisch)</th>
						<th class="px-4 py-3 font-semibold">Passender Test</th>
						<th class="px-4 py-3 font-semibold">R-Funktion</th>
						<th class="px-4 py-3 font-semibold">Annahmen verletzt →</th>
					</tr>
				</thead>
				<tbody class="text-ink-soft">
					<tr class="border-ink/5 border-b">
						<td class="px-4 py-3">Blutgruppen-Verteilung vs. erwartet</td>
						<td class="text-ink px-4 py-3 font-medium">Chi-Quadrat-Anpassungstest</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">chisq.test(b, p=e)</td>
						<td class="px-4 py-3">Fishers exakter Test (E&nbsp;&lt;&nbsp;5)</td>
					</tr>
					<tr class="border-ink/5 border-b">
						<td class="px-4 py-3">Cholesterinwert vs. Referenz&nbsp;200</td>
						<td class="text-ink px-4 py-3 font-medium">Ein-Stichproben-t-Test (einseitig)</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">t.test(x, mu=200)</td>
						<td class="px-4 py-3">Wilcoxon-Vorzeichen-Rang-Test</td>
					</tr>
					<tr class="border-ink/5 border-b">
						<td class="px-4 py-3">Dünger A vs. Dünger B (Ertrag)</td>
						<td class="text-ink px-4 py-3 font-medium">Zwei-Stichproben-t-Test</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">t.test(a, b)</td>
						<td class="px-4 py-3">Mann-Whitney-U-Test</td>
					</tr>
					<tr class="border-ink/5 border-b">
						<td class="px-4 py-3">Blutdruck vorher/nachher (gleiche Personen)</td>
						<td class="text-ink px-4 py-3 font-medium">Gepaarter t-Test</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">t.test(v, n, paired=TRUE)</td>
						<td class="px-4 py-3">Wilcoxon-Vorzeichen-Rang-Test (gepaart)</td>
					</tr>
					<tr class="border-ink/5 border-b">
						<td class="px-4 py-3">Genexpression bei 3 Behandlungen</td>
						<td class="text-ink px-4 py-3 font-medium">Einfaktorielle ANOVA + Tukey-Post-hoc</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">aov(...); TukeyHSD(...)</td>
						<td class="px-4 py-3">Kruskal-Wallis-Test</td>
					</tr>
					<tr>
						<td class="px-4 py-3">Körpergröße → Lungenkapazität</td>
						<td class="text-ink px-4 py-3 font-medium">Lineare Regression</td>
						<td class="text-coral-700 px-4 py-3 font-mono text-xs">lm(y ~ x)</td>
						<td class="px-4 py-3">Spearman-Korrelation / Transformation</td>
					</tr>
				</tbody>
			</table>
		</div>

		<Merke title="Erst der Datentyp, dann der Rest">
			Die allererste Weiche ist immer der <strong>Datentyp</strong>: Zählst du Fälle in Kategorien
			(<Begriff term="Chi-Quadrat-Test">χ²</Begriff>), oder misst du Zahlen auf einer Skala (t-Test
			/ ANOVA / Regression)? Erst danach fragst du nach Gruppenzahl, Paarung und Annahmen. Diese
			Reihenfolge führt dich durch fast jede Auswertung.
		</Merke>

		<!-- R-Code-Spickzettel --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">In R: ein Spickzettel der Aufrufe</h2>
		<p class="text-ink-soft leading-relaxed">
			Dieselben sechs Tests, jeweils als R-Aufruf. Diesen Block kannst du dir gut merken, er deckt
			fast alles ab, was in der Biologie-Auswertung vorkommt.
		</p>

		<RCode
			code={`# (1) Kategorial: Blutgruppen vs. erwartetes Verhaeltnis
chisq.test(beobachtet, p = erwartet)

# (2) Eine Stichprobe vs. fester Referenzwert (einseitig)
t.test(cholesterin, mu = 200, alternative = "greater")

# (3) Zwei unabhaengige Gruppen: Duenger A vs. B
t.test(ertrag ~ duenger)            # in R standardmaessig Welch

# (4) Gepaart: Blutdruck vorher / nachher (gleiche Personen)
t.test(vorher, nachher, paired = TRUE)

# (5) Drei+ Gruppen: ANOVA, dann Post-hoc (NICHT mehrere t-Tests!)
modell <- aov(expression ~ behandlung)
summary(modell)
TukeyHSD(modell)

# (6) Zusammenhang/Vorhersage: Groesse -> Lungenkapazitaet
lm(lungenkapazitaet ~ groesse)`}
			annotations={{
				'chisq.test(beobachtet, p = erwartet)':
					'Kategoriale Häufigkeiten gegen ein erwartetes Verhältnis: der Anpassungstest. Bei kleinen Erwartungswerten stattdessen fisher.test().',
				'mu = 200':
					'Der feste Referenzwert μ₀ beim Ein-Stichproben-t-Test. alternative = "greater" macht ihn einseitig.',
				't.test(ertrag ~ duenger)':
					'Zwei unabhängige Gruppen. R nimmt standardmäßig den Welch-Test (robust gegen ungleiche Varianzen).',
				'paired = TRUE':
					'Macht aus dem Test den gepaarten t-Test — für dieselben Einheiten vorher/nachher. Ohne dieses Flag würde die Paarung ignoriert.',
				'TukeyHSD(modell)':
					'Der Post-hoc-Test NACH einer signifikanten ANOVA: Er sagt, welche Gruppenpaare sich unterscheiden, bei kontrollierter Fehlerrate.',
				'lm(lungenkapazitaet ~ groesse)':
					'Die lineare Regression: legt eine Gerade durch die Daten und sagt Y (Lungenkapazität) aus X (Größe) vorher.'
			}}
		/>

		<!-- Stolpersteine -------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die vier häufigsten Stolpersteine</h2>

		<Callout variant="warnung" title="Stolperstein 1: ≥3 Gruppen → ANOVA, nicht viele t-Tests">
			<p>
				Bei drei oder mehr Gruppen verlockt es, einfach alle Paare per t-Test zu vergleichen. Das
				bläht die <Begriff term="FWER">familienweise Fehlerrate</Begriff> auf (<Begriff
					term="multiples Testen">α-Inflation</Begriff
				>): Schon drei Vergleiche zu je 5 % ergeben rund 14 % Chance auf mindestens einen Fehlalarm.
				Richtig: <strong>eine ANOVA</strong>, und erst <em>danach</em>, falls signifikant, ein
				<Begriff term="Post-hoc-Test" /> wie <Begriff term="Tukey HSD" />.
			</p>
		</Callout>

		<Callout variant="warnung" title="Stolperstein 2: gepaart vs. unabhängig verwechseln">
			<p>
				Dieselben Einheiten zweimal gemessen (Blutdruck vorher/nachher) sind <strong>gepaart</strong>
				— jede Messung hat ihren Partner. Zwei getrennte Gruppen (Dünger A vs. B) sind
				<strong>unabhängig</strong>. Den falschen Typ zu nehmen rechnet die Streuung falsch: Der
				<Begriff term="gepaarter t-Test">gepaarte Test</Begriff> nutzt die Paarung und gewinnt Power; behandelst
				du gepaarte Daten als unabhängig, verschenkst du genau diese Power.
			</p>
		</Callout>

		<Callout variant="warnung" title="Stolperstein 3: kategorial vs. kontinuierlich verwechseln">
			<p>
				Häufigkeiten in Kategorien (wie viele A, B, AB, 0?) gehören zu <Begriff
					term="Chi-Quadrat-Test">χ²</Begriff>. Messwerte auf einer Skala (Ertrag, Cholesterin,
				Größe) gehören zu t-Test, ANOVA oder Regression. Einen Messwert in einen χ²-Test zu zwingen
				(oder umgekehrt) ist von Grund auf der falsche Werkzeugkasten.
			</p>
		</Callout>

		<Callout variant="warnung" title="Stolperstein 4: Annahmen erst NACH der Testwahl prüfen">
			<p>
				Normalverteilung und <Begriff term="Varianzhomogenität" /> entscheiden, ob du den
				parametrischen Test (t-Test, ANOVA, Pearson) nehmen darfst oder auf die rangbasierte,
				<Begriff term="nicht-parametrischer Test">verteilungsfreie</Begriff> Alternative
				(Mann-Whitney, Wilcoxon, Kruskal-Wallis, Spearman) ausweichen musst. Prüfe die Annahmen
				deshalb <strong>als Teil der Testwahl</strong>, nicht als nachträgliche Formalität.
			</p>
		</Callout>

		<!-- Flagship-Widget ------------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Entscheidungsbaum & das Szenario-Spiel</h2>
		<p class="text-ink-soft leading-relaxed">
			Jetzt bist du dran. Das Widget hat zwei Modi. Im <strong>Entscheidungsbaum</strong>
			beantwortest du Schritt für Schritt die vier Fragen und landest auf dem passenden Test, quer
			durch alle Familien. Im <strong>Szenario-Spiel</strong> bekommst du die sechs biologischen
			Studien und wählst jeweils den richtigen Test; achte beim Drei-Gruppen-Fall auf die verlockende
			Falle.
		</p>

		<EntscheidungsbaumSpiel />

		<Merke title="Was das Spiel trainiert">
			Der Baum macht die vier Fragen zur Routine; das Szenario-Spiel übt das Erkennen aus der
			Fragestellung. Achte besonders auf den Drei-Gruppen-Fall: „drei t-Tests“ klingt verlockend, ist
			aber die <strong>α-Inflations-Falle</strong> — richtig sind ANOVA und danach Post-hoc.
		</Merke>

		<!-- Zusammenfassung ------------------------------------------------------ -->
		<Intuition title="In einem Satz">
			Den passenden Test wählst du <strong>vor</strong> dem Blick auf den p-Wert — aus Datentyp
			(kategorial → χ²; kontinuierlich → t-Test / ANOVA / Regression), Anzahl der Gruppen (1 / 2 /
			≥3), gepaart vs. unabhängig und den erfüllten Annahmen (sonst nicht-parametrisch); die Frage ist
			nie „was wird signifikant?“, sondern „was passt zur Fragestellung, zum Design und zu den Daten?“.
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
					Geschafft! Diese Lektion ist als abgeschlossen markiert — du findest den Haken jetzt auch in
					der Seitenleiste.
				</p>
			</div>
		{/if}

		<!-- Abschluss / Gratulation --------------------------------------------- -->
		<Callout variant="intuition" title="Du bist durch — Glückwunsch!">
			<p>
				Das war die letzte Lektion. Du hast den ganzen Bogen geschafft: von „Was ist Statistik?“ über
				Wahrscheinlichkeit, Verteilungen, Schätzen und Testen bis zu t-Tests, Chi-Quadrat, ANOVA,
				Korrelation, Regression und der Frage, <strong>welcher Test wann passt</strong>.
			</p>
			<p class="mt-2">
				Du musst dir nicht jede Formel merken. Was bleibt, ist die Denkweise: erst die Frage, dann das
				Design, dann die Daten — und der Test ergibt sich daraus, lange bevor ein p-Wert auf dem
				Bildschirm steht. Genau das macht aus einer Auswertung saubere Wissenschaft. Du hast jetzt das
				Rüstzeug dafür. Geh es mit Ruhe und Zutrauen an — du kannst das.
			</p>
		</Callout>
	</article>
</LessonLayout>
