/**
 * Glossar — kurze, alltagssprachliche Erklärungen zentraler statistischer
 * Begriffe für die DS2-Lernwebsite.
 *
 * Bewusst knapp und intuitiv gehalten (ein bis zwei Sätze, neutrales "Du").
 * Wird von der `Begriff`-Komponente als Tooltip angezeigt.
 *
 * Erweitern: einfach einen weiteren Eintrag hinzufügen. Der Schlüssel ist der
 * Begriff, wie er im Text steht (Groß-/Kleinschreibung wird beim Nachschlagen
 * ignoriert).
 */

export type GlossaryEntry = {
	/** Der Begriff in seiner natürlichen Schreibweise. */
	term: string;
	/** Kurze, alltagssprachliche Erklärung. */
	definition: string;
};

export const glossary: Record<string, GlossaryEntry> = {
	Stichprobe: {
		term: 'Stichprobe',
		definition:
			'Die Teilmenge, die du tatsächlich gemessen hast — also deine konkreten Daten, mit denen du arbeitest.'
	},
	Grundgesamtheit: {
		term: 'Grundgesamtheit',
		definition:
			'Alle Fälle, über die du eigentlich etwas aussagen möchtest. Meist zu groß, um sie komplett zu messen — daher die Stichprobe.'
	},
	Mittelwert: {
		term: 'Mittelwert',
		definition:
			'Der Durchschnitt: alle Werte aufaddiert und durch ihre Anzahl geteilt. Der typische "Schwerpunkt" deiner Daten.'
	},
	Standardabweichung: {
		term: 'Standardabweichung',
		definition:
			'Wie weit die einzelnen Werte im Schnitt vom Mittelwert entfernt liegen. Ein Maß für die Streuung der Daten.'
	},
	Standardfehler: {
		term: 'Standardfehler',
		definition:
			'Wie stark der Mittelwert von Stichprobe zu Stichprobe schwanken würde. Wird mit größerer Stichprobe kleiner.'
	},
	Varianz: {
		term: 'Varianz',
		definition:
			'Die quadrierte Standardabweichung — ebenfalls ein Streuungsmaß, nur in quadrierten Einheiten.'
	},
	'p-Wert': {
		term: 'p-Wert',
		definition:
			'Die Wahrscheinlichkeit, ein mindestens so extremes Ergebnis zu sehen, wenn die Nullhypothese stimmt. Klein = überraschend.'
	},
	Konfidenzintervall: {
		term: 'Konfidenzintervall',
		definition:
			'Ein Wertebereich, der den wahren Wert mit einer angegebenen Sicherheit (z. B. 95 %) plausibel einschließt.'
	},
	Nullhypothese: {
		term: 'Nullhypothese',
		definition:
			'Die "langweilige" Annahme, dass es keinen Effekt bzw. keinen Unterschied gibt. Sie ist der Ausgangspunkt jedes Tests.'
	},
	Signifikanzniveau: {
		term: 'Signifikanzniveau',
		definition:
			'Die Schwelle (oft 5 %), ab der du den p-Wert als klein genug ansiehst, um die Nullhypothese zu verwerfen.'
	},
	Zufallsvariable: {
		term: 'Zufallsvariable',
		definition:
			'Eine Größe, deren Wert vom Zufall abhängt — etwa das Ergebnis einer Messung, bevor du es kennst.'
	},
	Verteilung: {
		term: 'Verteilung',
		definition:
			'Beschreibt, welche Werte wie häufig (oder wie wahrscheinlich) auftreten. Das "Profil" deiner Daten oder einer Zufallsvariable.'
	},
	'Deskriptive Statistik': {
		term: 'Deskriptive Statistik',
		definition:
			'Beschreibt und fasst vorhandene Daten zusammen — etwa mit Mittelwert, Anteilen oder einem Histogramm. Sie geht nicht über die gemessenen Daten hinaus.'
	},
	'Inferentielle Statistik': {
		term: 'Inferentielle Statistik',
		definition:
			'Die schließende (induktive) Statistik: Sie schließt von der Stichprobe auf die Grundgesamtheit — durch Schätzen und Testen.'
	},
	'Explorative Statistik': {
		term: 'Explorative Statistik',
		definition:
			'Durchsucht Daten nach Mustern und erzeugt daraus neue, noch zu prüfende Hypothesen. Sie entdeckt, sie bestätigt nicht.'
	},
	Störfaktor: {
		term: 'Störfaktor',
		definition:
			'Eine dritte Größe (Confounder), die sowohl Ursache als auch Wirkung beeinflusst und so einen Scheinzusammenhang vortäuschen kann.'
	},
	Kausalschluss: {
		term: 'Kausalschluss',
		definition:
			'Die Aussage, dass A wirklich B verursacht — nicht nur mit B zusammenhängt. Sauber begründbar nur durch kontrollierte Experimente.'
	},
	Zufallsexperiment: {
		term: 'Zufallsexperiment',
		definition:
			'Ein Vorgang mit ungewissem Ausgang, den man (gedanklich) beliebig oft wiederholen kann — etwa ein Würfelwurf oder ein medizinischer Test.'
	},
	Ergebnisraum: {
		term: 'Ergebnisraum',
		definition:
			'Die Menge aller möglichen Ergebnisse eines Zufallsexperiments. Beim Würfel zum Beispiel {1, 2, 3, 4, 5, 6}.'
	},
	Ereignis: {
		term: 'Ereignis',
		definition:
			'Eine Teilmenge des Ergebnisraums — also eine Aussage, die eintreten kann oder nicht, z. B. "eine gerade Zahl würfeln".'
	},
	Wahrscheinlichkeit: {
		term: 'Wahrscheinlichkeit',
		definition:
			'Eine Zahl zwischen 0 und 1, die angibt, wie sicher ein Ereignis eintritt. 0 = unmöglich, 1 = sicher.'
	},
	'Laplace-Wahrscheinlichkeit': {
		term: 'Laplace-Wahrscheinlichkeit',
		definition:
			'Bei gleich wahrscheinlichen Ergebnissen: günstige durch mögliche Fälle. Etwa 3/6 für eine gerade Augenzahl beim fairen Würfel.'
	},
	'relative Häufigkeit': {
		term: 'relative Häufigkeit',
		definition:
			'Der Anteil, mit dem ein Ereignis tatsächlich eingetreten ist (Treffer geteilt durch Versuche). Sie nähert sich auf Dauer der Wahrscheinlichkeit an.'
	},
	'Bedingte Wahrscheinlichkeit': {
		term: 'Bedingte Wahrscheinlichkeit',
		definition:
			'Die Wahrscheinlichkeit von A, wenn man bereits weiß, dass B eingetreten ist. Geschrieben P(A|B) = P(A∩B)/P(B).'
	},
	'Satz von Bayes': {
		term: 'Satz von Bayes',
		definition:
			'Dreht eine bedingte Wahrscheinlichkeit um: Aus P(B|A) wird P(A|B). So kommt man vom Testergebnis zurück zur eigentlich gesuchten Wahrscheinlichkeit.'
	},
	Prävalenz: {
		term: 'Prävalenz',
		definition:
			'Der Anteil der Menschen, die eine Krankheit tatsächlich haben — also P(krank) in der betrachteten Bevölkerung.'
	},
	Sensitivität: {
		term: 'Sensitivität',
		definition:
			'Wie zuverlässig ein Test Kranke erkennt: P(positiv | krank). Eine hohe Sensitivität heißt, fast alle Kranken werden positiv getestet.'
	},
	Spezifität: {
		term: 'Spezifität',
		definition:
			'Wie zuverlässig ein Test Gesunde als gesund erkennt: P(negativ | gesund). Eine hohe Spezifität heißt wenige falsch-positive Ergebnisse.'
	},
	'Positiver prädiktiver Wert': {
		term: 'Positiver prädiktiver Wert',
		definition:
			'Die eigentlich interessante Größe: P(krank | positiv) — wie wahrscheinlich man wirklich krank ist, wenn der Test positiv anschlägt.'
	},
	Häufigkeitsverteilung: {
		term: 'Häufigkeitsverteilung',
		definition:
			'Zeigt, wie oft jeder Wert in deinen tatsächlich gemessenen Daten vorkommt — beobachtet, aus echten Daten gezählt.'
	},
	Wahrscheinlichkeitsverteilung: {
		term: 'Wahrscheinlichkeitsverteilung',
		definition:
			'Das theoretische Gegenstück: Sie gibt an, mit welcher Wahrscheinlichkeit eine Zufallsvariable welche Werte annimmt — erwartet, nicht gezählt.'
	},
	Normalverteilung: {
		term: 'Normalverteilung',
		definition:
			'Die symmetrische Glockenkurve N(μ, σ). μ legt die Lage des Gipfels fest, σ die Breite. Viele natürliche Größen folgen ihr näherungsweise.'
	},
	Dichtefunktion: {
		term: 'Dichtefunktion',
		definition:
			'Die Kurve einer stetigen Verteilung. Ihre Höhe ist keine Wahrscheinlichkeit — erst die Fläche unter ihr über einem Intervall ergibt eine.'
	},
	Verteilungsfunktion: {
		term: 'Verteilungsfunktion',
		definition:
			'Die aufsummierte Fläche von links: F(x) = P(X ≤ x). In R heißt sie pnorm. Aus ihr liest du P(a < X ≤ b) = F(b) − F(a) ab.'
	},
	'Stetige Zufallsvariable': {
		term: 'Stetige Zufallsvariable',
		definition:
			'Eine Größe, die jeden Wert in einem Bereich annehmen kann (z. B. Körpergröße). Für einen exakten Einzelwert ist P(X = x) = 0; nur Intervalle haben Wahrscheinlichkeit.'
	},
	'Diskrete Zufallsvariable': {
		term: 'Diskrete Zufallsvariable',
		definition:
			'Eine Größe mit abzählbar vielen Werten (z. B. Augenzahl, Anzahl Treffer). Hier hat jeder einzelne Wert eine eigene Wahrscheinlichkeit.'
	},
	'Z-Transformation': {
		term: 'Z-Transformation',
		definition:
			'Standardisierung Z = (X − μ)/σ. Sie überführt jede Normalverteilung in die Standardnormalverteilung N(0, 1); Z misst den Abstand in Standardabweichungen.'
	},
	Standardnormalverteilung: {
		term: 'Standardnormalverteilung',
		definition:
			'Die Normalverteilung mit μ = 0 und σ = 1. Jede Normalverteilung lässt sich per Z-Transformation auf sie zurückführen.'
	},
	Kennwert: {
		term: 'Kennwert',
		definition:
			'Eine aus der Stichprobe berechnete Größe — etwa der Mittelwert x̄ oder die Standardabweichung s. Wird mit lateinischen Buchstaben geschrieben und schwankt von Stichprobe zu Stichprobe.'
	},
	Parameter: {
		term: 'Parameter',
		definition:
			'Eine feste, meist unbekannte Größe der Grundgesamtheit — etwa μ oder σ. Wird mit griechischen Buchstaben geschrieben und ändert sich nicht.'
	},
	Punktschätzer: {
		term: 'Punktschätzer',
		definition:
			'Ein einzelner Zahlenwert aus der Stichprobe, der einen unbekannten Parameter schätzt — z. B. x̄ als Schätzer für μ.'
	},
	Erwartungstreue: {
		term: 'Erwartungstreue',
		definition:
			'Ein Schätzer ist erwartungstreu (unverzerrt), wenn er im Mittel über alle Stichproben den wahren Parameter trifft: E(x̄) = μ.'
	},
	Stichprobenkennwertverteilung: {
		term: 'Stichprobenkennwertverteilung',
		definition:
			'Die Verteilung eines Kennwerts (z. B. von x̄) über alle denkbaren Stichproben. Ein einzelner Mittelwert ist eine zufällige Ziehung aus ihr.'
	},
	Freiheitsgrade: {
		term: 'Freiheitsgrade',
		definition:
			'Die Anzahl der frei variierbaren Werte. Bei der Stichprobenvarianz sind es n − 1, weil ein Freiheitsgrad schon für die Schätzung von x̄ verbraucht ist.'
	},
	Konfidenzniveau: {
		term: 'Konfidenzniveau',
		definition:
			'Der Anteil (z. B. 95 %) der nach demselben Verfahren gebauten Intervalle, die den wahren Parameter enthalten. Es ist 1 − α.'
	},
	'Student-t-Verteilung': {
		term: 'Student-t-Verteilung',
		definition:
			'Eine glockenförmige Verteilung mit schwereren Rändern als die Normalverteilung. Für kleine Stichproben (unbekanntes σ) liefert sie breitere, korrekte Intervalle; mit wachsendem df nähert sie sich N(0, 1).'
	},
	Alternativhypothese: {
		term: 'Alternativhypothese',
		definition:
			'Die Forschungshypothese H₁ (oder Hₐ): die Annahme, dass es einen Effekt gibt. Sie enthält immer eine Effektgröße und wird nie direkt bewiesen — man widerlegt nur die Nullhypothese.'
	},
	Forschungshypothese: {
		term: 'Forschungshypothese',
		definition:
			'Das, was du eigentlich zeigen möchtest (H₁): ein Effekt, ein Unterschied, ein Zusammenhang. Im Test wird sie indirekt gestützt, indem man die Nullhypothese verwirft.'
	},
	Falsifikation: {
		term: 'Falsifikation',
		definition:
			'Poppers Idee: Eine Hypothese lässt sich nie endgültig beweisen, nur widerlegen. Deshalb prüft man die Nullhypothese auf Widerlegung, statt H₁ direkt zu beweisen.'
	},
	Teststatistik: {
		term: 'Teststatistik',
		definition:
			'Eine aus den Daten berechnete Kennzahl (z. B. ein z- oder t-Wert), die misst, wie weit dein Befund von dem entfernt ist, was H₀ erwartet. Aus ihr folgt der p-Wert.'
	},
	'Fehler 1. Art': {
		term: 'Fehler 1. Art',
		definition:
			'Falsch-positiv: Du verwirfst eine wahre Nullhypothese und „findest“ einen Effekt, den es gar nicht gibt. Seine Wahrscheinlichkeit ist genau das Signifikanzniveau α.'
	},
	'Fehler 2. Art': {
		term: 'Fehler 2. Art',
		definition:
			'Falsch-negativ: Es gibt einen echten Effekt, aber dein Test übersieht ihn — du behältst H₀ fälschlich bei. Seine Wahrscheinlichkeit heißt β.'
	},
	Teststärke: {
		term: 'Teststärke',
		definition:
			'Die Power = 1 − β: die Wahrscheinlichkeit, einen wirklich vorhandenen Effekt auch als signifikant zu erkennen. Steigt mit größerem n, größerem Effekt oder größerem α.'
	},
	Effektgröße: {
		term: 'Effektgröße',
		definition:
			'Wie groß der Unterschied bzw. Effekt tatsächlich ist — etwa der Abstand zweier Mittelwerte in Standardfehlern. Große Effekte sind leichter signifikant nachzuweisen.'
	},
	'Kritischer Wert': {
		term: 'Kritischer Wert',
		definition:
			'Die Grenze auf der Skala der Teststatistik, ab der du H₀ verwirfst. Sie trennt den Ablehnungsbereich vom Rest und wird durch α festgelegt.'
	},
	Hypothesentest: {
		term: 'Hypothesentest',
		definition:
			'Ein Verfahren, das anhand der Daten entscheidet, ob ein beobachteter Effekt mit reinem Zufall (H₀) noch erklärbar ist oder so überraschend, dass man H₀ verwirft.'
	},
	't-Test': {
		term: 't-Test',
		definition:
			'Ein Test für Mittelwerte: Er teilt den beobachteten Unterschied durch den Standardfehler und vergleicht das Ergebnis (den t-Wert) mit der Student-t-Verteilung.'
	},
	'Ein-Stichproben-t-Test': {
		term: 'Ein-Stichproben-t-Test',
		definition:
			'Vergleicht den Mittelwert einer einzelnen Stichprobe mit einem festen Erwartungswert μ₀ (z. B. „die mittlere Zugdistanz beträgt 1500 km“).'
	},
	'Student-t-Test': {
		term: 'Student-t-Test',
		definition:
			'Der Zwei-Stichproben-t-Test, der GLEICHE Varianzen in beiden Gruppen annimmt und die Streuung „poolt“. Genauer, aber empfindlich, wenn die Varianzen ungleich sind.'
	},
	'Welch-Test': {
		term: 'Welch-Test',
		definition:
			'Der Zwei-Stichproben-t-Test, der KEINE gleichen Varianzen voraussetzt. Robuster und in R der Standard von t.test(); er korrigiert die Freiheitsgrade (Welch-Satterthwaite).'
	},
	'gepaarter t-Test': {
		term: 'gepaarter t-Test',
		definition:
			'Für abhängige Messpaare (z. B. dieselbe Pflanze vor und nach einer Behandlung): Er bildet die Differenzen und testet, ob deren Mittelwert null ist. Die Normalität betrifft die Differenzen.'
	},
	Varianzhomogenität: {
		term: 'Varianzhomogenität',
		definition:
			'Die Annahme, dass beide Gruppen dieselbe Streuung (Varianz) haben. Prüfbar z. B. mit dem F-Test (var.test). Ist sie verletzt, nimmt man den Welch-Test.'
	},
	'Shapiro-Wilk-Test': {
		term: 'Shapiro-Wilk-Test',
		definition:
			'Ein Test auf Normalverteilung. H₀ ist „die Daten sind normalverteilt“ — ein p > 0,05 bedeutet hier also „Annahme ok“ (umgekehrte Logik gegenüber dem üblichen Test).'
	},
	'Mann-Whitney-U-Test': {
		term: 'Mann-Whitney-U-Test',
		definition:
			'Die rangbasierte, verteilungsfreie Alternative zum unabhängigen t-Test. Er vergleicht die Lage (Mediane/Ränge) zweier Gruppen, ist robuster gegen Ausreißer und braucht keine Normalverteilung.'
	},
	'Wilcoxon-Vorzeichen-Rang-Test': {
		term: 'Wilcoxon-Vorzeichen-Rang-Test',
		definition:
			'Die rangbasierte, verteilungsfreie Alternative zum gepaarten t-Test. Er arbeitet mit den Rängen der Differenzen und kommt ohne Normalverteilungsannahme aus.'
	},
	'Signal-zu-Rausch-Verhältnis': {
		term: 'Signal-zu-Rausch-Verhältnis',
		definition:
			'Die Kernidee des t-Werts: beobachtetes Signal (Mittelwertdifferenz) geteilt durch das Rauschen (Standardfehler). Viel Signal bei wenig Rauschen → großes t → kleiner p-Wert.'
	},
	'nicht-parametrischer Test': {
		term: 'nicht-parametrischer Test',
		definition:
			'Ein verteilungsfreier Test, der keine bestimmte Verteilung (etwa Normalverteilung) der Daten voraussetzt. Meist rang- oder medianbasiert und robust gegen Ausreißer.'
	},
	'Chi-Quadrat-Test': {
		term: 'Chi-Quadrat-Test',
		definition:
			'Eine Gruppe von Tests für kategoriale Häufigkeitsdaten (Anzahlen). Sie vergleichen beobachtete Zählungen B mit den unter H₀ erwarteten Zählungen E über χ² = Σ (B − E)² / E.'
	},
	Anpassungstest: {
		term: 'Anpassungstest',
		definition:
			'Der Chi-Quadrat-Goodness-of-Fit-Test: Folgen die beobachteten Häufigkeiten einer erwarteten Verteilung (z. B. dem Mendel-Verhältnis 9:3:3:1)? Freiheitsgrade df = k − 1.'
	},
	Unabhängigkeitstest: {
		term: 'Unabhängigkeitstest',
		definition:
			'Der Chi-Quadrat-Test auf einer Kontingenztafel: Sind zwei kategoriale Merkmale unabhängig? Die Erwartungswerte folgen aus den Rändern, df = (Zeilen − 1)·(Spalten − 1).'
	},
	Kontingenztafel: {
		term: 'Kontingenztafel',
		definition:
			'Eine Kreuztabelle, die zählt, wie oft jede Kombination zweier kategorialer Merkmale auftritt (z. B. Art × Habitat). Aus ihren Zeilen- und Spaltensummen werden die Erwartungswerte berechnet.'
	},
	Erwartungswert: {
		term: 'Erwartungswert',
		definition:
			'Beim Chi-Quadrat-Test die unter der Nullhypothese erwartete Häufigkeit E einer Zelle. Sie sind keine Daten, sondern verkörpern das Modell (Unabhängigkeit bzw. das genetische Verhältnis).'
	},
	'Yates-Korrektur': {
		term: 'Yates-Korrektur',
		definition:
			'Eine Stetigkeitskorrektur für 2×2-Tafeln (df = 1): In jeder Zelle wird |B − E| um 0,5 verkleinert. Sie macht den Test konservativer. In R ist sie bei chisq.test() der Standard (correct = TRUE).'
	},
	'Fisher-Test': {
		term: 'Fisher-Test',
		definition:
			'Fishers exakter Test: die genaue Alternative zum Chi-Quadrat-Test bei kleinen erwarteten Häufigkeiten (Faustregel E < 5). Er rechnet exakt mit der hypergeometrischen Verteilung statt mit der Näherung.'
	},
	ANOVA: {
		term: 'ANOVA',
		definition:
			'Varianzanalyse (analysis of variance): ein EINZELNER Test, der die Mittelwerte mehrerer Gruppen gleichzeitig vergleicht. Sie heißt „Varianz“-analyse, weil sie Unterschiede in Mittelwerten über das Verhältnis zweier Varianzen prüft.'
	},
	Varianzanalyse: {
		term: 'Varianzanalyse',
		definition:
			'Deutscher Name der ANOVA. Sie zerlegt die Gesamtstreuung in einen Anteil zwischen den Gruppen und einen innerhalb und testet über das F-Verhältnis, ob sich mindestens ein Gruppenmittel von den anderen unterscheidet.'
	},
	'F-Verhältnis': {
		term: 'F-Verhältnis',
		definition:
			'Die Teststatistik der ANOVA: F = Varianz ZWISCHEN den Gruppen / Varianz INNERHALB der Gruppen (MS_zwischen / MS_innerhalb). Ein Signal-zu-Rausch-Maß; großes F → kleiner (rechtsseitiger) p-Wert.'
	},
	'F-Verteilung': {
		term: 'F-Verteilung',
		definition:
			'Die rechtsschiefe Verteilung des F-Verhältnisses unter H₀, charakterisiert durch zwei Freiheitsgrade (df_zwischen, df_innerhalb). Die ANOVA wird immer rechtsseitig getestet.'
	},
	'multiples Testen': {
		term: 'multiples Testen',
		definition:
			'Das Problem vieler gleichzeitiger Tests: Bei c Vergleichen mit je α steigt die Wahrscheinlichkeit für mindestens einen Fehlalarm auf 1 − (1 − α)^c. Schon 5 Vergleiche bei α = 5 % ergeben ~23 %.'
	},
	FWER: {
		term: 'FWER',
		definition:
			'Familienweise Fehlerrate (family-wise error rate): die Wahrscheinlichkeit, in einer ganzen Familie von c Tests MINDESTENS einen Fehler 1. Art zu machen. Ohne Korrektur 1 − (1 − α)^c.'
	},
	'Varianzzerlegung': {
		term: 'Varianzzerlegung',
		definition:
			'Die Aufteilung der Gesamtstreuung: SS_total = SS_zwischen + SS_innerhalb. Die ANOVA fragt, wie groß der erklärte Anteil (zwischen den Gruppen) gegenüber dem unerklärten (innerhalb) ist.'
	},
	'Post-hoc-Test': {
		term: 'Post-hoc-Test',
		definition:
			'Folgetest NACH einer signifikanten ANOVA: Er sagt, WELCHE Gruppen sich konkret unterscheiden. Kontrolliert die familienweise Fehlerrate, z. B. der Tukey-HSD-Test.'
	},
	'Tukey HSD': {
		term: 'Tukey HSD',
		definition:
			'Tukeys „honestly significant difference“-Test: vergleicht nach einer signifikanten ANOVA alle Gruppenpaare und hält dabei die familienweise Fehlerrate auf α. In R: TukeyHSD(aov(...)).'
	},
	'Bonferroni-Korrektur': {
		term: 'Bonferroni-Korrektur',
		definition:
			'Die einfachste FWER-Korrektur: Bei c Vergleichen testet man jeden zum strengeren Niveau α/c. Das hält die familienweise Fehlerrate unter α, ist aber konservativ.'
	},
	'Kruskal-Wallis-Test': {
		term: 'Kruskal-Wallis-Test',
		definition:
			'Die rangbasierte, verteilungsfreie Alternative zur einfaktoriellen ANOVA. Er vergleicht die Lage mehrerer Gruppen über ihre Ränge und braucht keine Normalverteilung.'
	},
	'Levene-Test': {
		term: 'Levene-Test',
		definition:
			'Ein Test auf Varianzhomogenität über mehrere Gruppen (eine ANOVA-Voraussetzung). H₀ ist „gleiche Varianzen“ — ein p > 0,05 bedeutet hier also „Annahme ok“.'
	},
	Effektstärke: {
		term: 'Effektstärke',
		definition:
			'Wie groß ein Effekt tatsächlich ist, unabhängig von der Stichprobengröße. Bei der ANOVA ist η² (Eta-Quadrat) = SS_zwischen / SS_total der Anteil der durch die Gruppen erklärten Streuung.'
	},
	'Eta-Quadrat': {
		term: 'Eta-Quadrat',
		definition:
			'η² = SS_zwischen / SS_total: der Anteil der Gesamtstreuung, den die Gruppenzugehörigkeit erklärt. Das ANOVA-Pendant zum R² der Regression; reicht von 0 (kein Effekt) bis 1.'
	},
	Korrelation: {
		term: 'Korrelation',
		definition:
			'Ein Maß für den Zusammenhang zweier Variablen — wie stark sie gemeinsam schwanken. Sie macht KEINE Aussage über Ursache und Wirkung und kennt keine Richtung; beide Variablen sind zufällig.'
	},
	Kovarianz: {
		term: 'Kovarianz',
		definition:
			'Misst, ob zwei Variablen gemeinsam schwanken: Liegen beide oft gleichzeitig über oder unter ihrem Mittel, ist sie positiv. Sie ist aber skalenabhängig (hängt von den Einheiten ab) und daher nicht zwischen Variablenpaaren vergleichbar.'
	},
	'Pearson-Korrelation': {
		term: 'Pearson-Korrelation',
		definition:
			'Der Korrelationskoeffizient r = Cov(x, y) / (s_x · s_y) — die standardisierte Kovarianz. Einheitenlos, immer in [−1, +1], misst aber NUR die LINEARE Stärke des Zusammenhangs.'
	},
	'Spearman-Korrelation': {
		term: 'Spearman-Korrelation',
		definition:
			'Die Rangkorrelation ρ: der Pearson-Koeffizient der Ränge. Sie erfasst MONOTONE (nicht zwingend lineare) Zusammenhänge, ist für ordinale Daten zulässig und robust gegen Ausreißer.'
	},
	'Kendall-Korrelation': {
		term: 'Kendall-Korrelation',
		definition:
			'Kendalls τ: ein weiteres rangbasiertes Maß. Es zählt konkordante gegen diskordante Paare und erfasst wie Spearman monotone Zusammenhänge — robust und auch für ordinale Daten geeignet.'
	},
	Ausreißer: {
		term: 'Ausreißer',
		definition:
			'Ein einzelner Wert, der weit von den übrigen Daten entfernt liegt. Er kann die Pearson-Korrelation stark verzerren, während rangbasierte Maße (Spearman, Kendall) kaum darauf reagieren.'
	},
	'monotoner Zusammenhang': {
		term: 'monotoner Zusammenhang',
		definition:
			'Ein Zusammenhang, bei dem y durchgehend steigt (oder durchgehend fällt), wenn x wächst — egal ob gerade oder gekrümmt. Spearman ρ und Kendall τ messen genau diese Monotonie.'
	},
	Transformation: {
		term: 'Transformation',
		definition:
			'Eine Umrechnung der Daten (z. B. log, Wurzel, Box-Cox), um einen gekrümmten Zusammenhang zu begradigen oder die Verteilung normaler zu machen — damit lineare Methoden wieder passen.'
	},
	'Box-Cox-Transformation': {
		term: 'Box-Cox-Transformation',
		definition:
			'Eine Familie von Potenz-Transformationen mit Parameter λ: y^λ für λ ≠ 0 und log(y) für λ = 0. Man wählt λ so, dass die Daten möglichst normalverteilt und der Zusammenhang möglichst linear werden.'
	},
	Scheinkorrelation: {
		term: 'Scheinkorrelation',
		definition:
			'Eine Korrelation zwischen zwei Größen, die nicht auf einem direkten Zusammenhang beruht, sondern durch einen dritten Faktor (Confounder) entsteht. Klassische Mahnung: Korrelation ist nicht Kausalität.'
	},
	'Lineare Regression': {
		term: 'Lineare Regression',
		definition:
			'Ein Modell, das eine Gerade ŷ = a + b·x durch die Daten legt, um Y aus X vorherzusagen. Anders als die Korrelation hat sie eine Richtung: X erklärt Y.'
	},
	'Methode der kleinsten Quadrate': {
		term: 'Methode der kleinsten Quadrate',
		definition:
			'Das Verfahren, das die Regressionsgerade bestimmt: Es wählt a und b so, dass die Summe der quadrierten Residuen (senkrechte Abstände der Punkte zur Geraden) möglichst klein wird.'
	},
	Steigung: {
		term: 'Steigung',
		definition:
			'Der Koeffizient b der Regressionsgerade: Um wie viel sich die Vorhersage von Y ändert, wenn X um eine Einheit steigt.'
	},
	Achsenabschnitt: {
		term: 'Achsenabschnitt',
		definition:
			'Der Koeffizient a der Regressionsgerade: der vorhergesagte Y-Wert bei X = 0 (oft nur rechnerisch, wenn X = 0 außerhalb der Daten liegt).'
	},
	Residuum: {
		term: 'Residuum',
		definition:
			'Die Abweichung einer Beobachtung von der Vorhersage: e = y − ŷ. Die Residuen sind die Grundlage aller Regressionsdiagnostik.'
	},
	Bestimmtheitsmaß: {
		term: 'Bestimmtheitsmaß',
		definition:
			'R² — der Anteil der Y-Variabilität, den das Modell erklärt: R² = SS_Regression / SS_Total ∈ [0, 1]. Bei einfacher Regression ist R² = r². Ein kleines R² heißt schlechte Vorhersage, sagt aber nichts über die Signifikanz.'
	},
	Hebelwirkung: {
		term: 'Hebelwirkung',
		definition:
			'Leverage — wie weit ein Punkt in X-Richtung von den übrigen Daten entfernt liegt. Ein Punkt mit hoher Hebelwirkung kann die Regressionsgerade allein stark verändern (kippen).'
	},
	'Cook-Distanz': {
		term: 'Cook-Distanz',
		definition:
			"Cook's Distance — ein Maß dafür, wie stark sich die geschätzte Gerade ändert, wenn man einen einzelnen Punkt weglässt. Große Werte markieren besonders einflussreiche Beobachtungen."
	},
	Randomisierung: {
		term: 'Randomisierung',
		definition:
			'Der Goldstandard im Experiment: Versuchseinheiten werden per Zufall auf die Gruppen verteilt. Das verteilt bekannte UND unbekannte Störvariablen gleichmäßig und schützt vor systematischem Bias.'
	},
	Blocking: {
		term: 'Blocking',
		definition:
			'Ähnliche Versuchseinheiten werden vorab zu Blöcken zusammengefasst (z. B. nach Standort oder Alter) und innerhalb jedes Blocks randomisiert. So rechnet man störende Variation aus dem Fehler heraus und gewinnt Power.'
	},
	Verblindung: {
		term: 'Verblindung',
		definition:
			'Beteiligte wissen nicht, wer in welcher Gruppe ist. Single-blind: die Versuchseinheit/der Beobachter; double-blind: beide. Verhindert (unbewusste) Verzerrung der Messung.'
	},
	Negativkontrolle: {
		term: 'Negativkontrolle',
		definition:
			'Eine Gruppe ohne die eigentliche Behandlung (z. B. nur Lösungsmittel). Sie zeigt, was OHNE Effekt passiert — die Vergleichsbasis.'
	},
	Positivkontrolle: {
		term: 'Positivkontrolle',
		definition:
			'Eine Gruppe mit einer Behandlung, die sicher wirkt. Sie zeigt, dass der Versuchsaufbau einen vorhandenen Effekt überhaupt nachweisen kann.'
	},
	Confounding: {
		term: 'Confounding',
		definition:
			'Ein Störeffekt: eine dritte Variable hängt mit Behandlung und Ergebnis zusammen und verfälscht den Vergleich. Gutes Design (Randomisierung, Kontrollen) isoliert den eigentlichen Effekt.'
	},
	Replikation: {
		term: 'Replikation',
		definition:
			'Mehrere echte, voneinander UNABHÄNGIGE Wiederholungen einer Behandlung. Nur sie erlauben es, den Behandlungseffekt von der zufälligen Streuung zu trennen.'
	},
	Pseudoreplikation: {
		term: 'Pseudoreplikation',
		definition:
			'Scheinbare Replikate, die in Wahrheit nicht unabhängig sind (z. B. mehrere Messungen am selben Tier). Sie blähen die Stichprobe künstlich auf und führen zu falsch kleinen p-Werten.'
	},
	Treffgenauigkeit: {
		term: 'Treffgenauigkeit',
		definition:
			'Accuracy — wie nah die Messungen IM MITTEL am wahren Wert liegen. Geringe Treffgenauigkeit heißt: systematischer Fehler (Bias).'
	},
	Exaktheit: {
		term: 'Exaktheit',
		definition:
			'Precision — wie eng die Messungen UNTEREINANDER streuen (Reproduzierbarkeit). Hohe Exaktheit heißt: kleine Streuung, sagt aber nichts über Bias.'
	},
	Repräsentativität: {
		term: 'Repräsentativität',
		definition:
			'Die Stichprobe spiegelt die Grundgesamtheit in den relevanten Merkmalen wider. Nur dann darfst du von der Stichprobe auf die ganze Population schließen.'
	},
	Versuchsplanung: {
		term: 'Versuchsplanung',
		definition:
			'Das Festlegen des Versuchsaufbaus VOR der Datenerhebung (engl. design of experiments). Die Statistik kann später nur trennen, was das Design vorab getrennt hat.'
	},
	Subsample: {
		term: 'Subsample',
		definition:
			'Eine Mehrfachmessung INNERHALB einer Versuchseinheit (z. B. mehrere Blätter pro Pflanze, mehrere Fische pro Becken). Subsamples sind voneinander abhängig — sie sind keine echten Replikate.'
	},
	Versuchseinheit: {
		term: 'Versuchseinheit',
		definition:
			'Die kleinste Einheit, die unabhängig einer Behandlung zugeordnet wird (z. B. die Pflanze, das Becken). Sie — nicht die Einzelmessung — ist die wahre Replikationseinheit.'
	},
	'Vollständig randomisiertes Design': {
		term: 'Vollständig randomisiertes Design',
		definition:
			'CRD (completely randomized design): Die einfachste Form — jede Versuchseinheit wird rein zufällig einer Behandlung zugeordnet, ohne weitere Struktur. Passt, wenn die Einheiten ähnlich sind.'
	},
	'Randomisiertes Blockdesign': {
		term: 'Randomisiertes Blockdesign',
		definition:
			'RBD: Ähnliche Einheiten werden zu Blöcken zusammengefasst (z. B. nach Beet oder Standort) und INNERHALB jedes Blocks randomisiert. So rechnet man die Blockvariation aus dem Fehler heraus und gewinnt Power.'
	},
	'Repeated Measures': {
		term: 'Repeated Measures',
		definition:
			'Längsschnitt-/Messwiederholungsdesign: Dieselbe Einheit wird mehrmals gemessen (z. B. dasselbe Tier zu mehreren Zeitpunkten). Die Messungen sind abhängig und brauchen einen passenden Fehlerterm oder ein Mixed Model.'
	},
	'Split-Plot-Design': {
		term: 'Split-Plot-Design',
		definition:
			'Ein Design mit zwei Randomisierungsebenen: ein Faktor wird auf großen Einheiten (Hauptparzellen) variiert, ein zweiter auf darin geschachtelten kleinen Einheiten (Teilparzellen). Beide Ebenen haben eigene Fehlerterme.'
	},
	'Verschachteltes Design': {
		term: 'Verschachteltes Design',
		definition:
			'Nested: Eine Faktorstufe kommt nur innerhalb genau einer Stufe eines anderen Faktors vor (z. B. Pflanzen sind in Gruppen verschachtelt — jede Pflanze gehört zu genau einer Behandlung).'
	},
	'Gekreuztes Design': {
		term: 'Gekreuztes Design',
		definition:
			'Crossed: Jede Stufe des einen Faktors tritt mit jeder Stufe des anderen kombiniert auf (z. B. Behandlung × Geschlecht in allen Kombinationen). Erlaubt es, Wechselwirkungen zu schätzen.'
	},

	// --- Skalenniveaus (Lektion „Was ist Statistik?") ----------------------
	Skalenniveau: {
		term: 'Skalenniveau',
		definition:
			'Wie „reichhaltig" eine gemessene Variable ist: nominal, ordinal oder metrisch. Es entscheidet, welche Rechenoperationen und welche Tests überhaupt erlaubt sind.'
	},
	'Nominalskala': {
		term: 'Nominalskala',
		definition:
			'Reine Kategorien ohne Rangfolge — nur gleich oder ungleich (z. B. Art, Geschlecht, Blutgruppe). Man darf zählen, aber nicht ordnen oder rechnen.'
	},
	'Ordinalskala': {
		term: 'Ordinalskala',
		definition:
			'Geordnete Stufen mit Rangfolge, aber ohne gleiche Abstände (z. B. Boniturnoten, Befallsstufen gering/mittel/stark). Man darf ordnen, aber Differenzen nicht sinnvoll rechnen.'
	},
	'Metrische Skala': {
		term: 'Metrische Skala',
		definition:
			'Zahlen mit echten, gleichen Abständen (z. B. Länge, Gewicht, Temperatur). Differenzen sind sinnvoll. Unterteilt in Intervall- und Verhältnisskala.'
	},
	'Intervallskala': {
		term: 'Intervallskala',
		definition:
			'Metrische Skala mit gleichen Abständen, aber ohne echten Nullpunkt (z. B. Temperatur in °C). Differenzen sind sinnvoll, Verhältnisse nicht: 20 °C ist nicht „doppelt so warm".'
	},
	'Verhältnisskala': {
		term: 'Verhältnisskala',
		definition:
			'Metrische Skala mit echtem Nullpunkt (z. B. Länge, Gewicht, Anzahl). Hier sind auch Verhältnisse sinnvoll: 6 cm sind doppelt so lang wie 3 cm.'
	},

	// --- Kombinatorik (Lektion „Wahrscheinlichkeit & Bayes") ---------------
	Kombinatorik: {
		term: 'Kombinatorik',
		definition:
			'Die Kunst des Zählens: Wie viele Möglichkeiten gibt es überhaupt? Liefert die „Anzahl möglicher Fälle" für die Laplace-Wahrscheinlichkeit.'
	},
	'Zählprinzip': {
		term: 'Zählprinzip',
		definition:
			'Fundamentalprinzip des Zählens: Hat ein Schritt a Möglichkeiten und ein unabhängiger zweiter b, so gibt es a · b Kombinationen. Lässt sich über beliebig viele Schritte fortsetzen.'
	},
	Permutation: {
		term: 'Permutation',
		definition:
			'Eine Anordnung, bei der die Reihenfolge zählt. Für k aus n ohne Zurücklegen: n!/(n−k)!. Alle n ordnen: n!.'
	},
	Kombination: {
		term: 'Kombination',
		definition:
			'Eine Auswahl, bei der die Reihenfolge egal ist. k aus n ohne Zurücklegen: der Binomialkoeffizient C(n,k) = n!/(k!·(n−k)!).'
	},
	Binomialkoeffizient: {
		term: 'Binomialkoeffizient',
		definition:
			'C(n,k) = n!/(k!·(n−k)!), gelesen „n über k": die Anzahl der Möglichkeiten, k Objekte aus n auszuwählen, wenn die Reihenfolge keine Rolle spielt.'
	},

	// --- Diskrete Verteilungen (Lektion „Verteilungen") --------------------
	Binomialverteilung: {
		term: 'Binomialverteilung',
		definition:
			'Verteilung der Anzahl Erfolge in n unabhängigen Versuchen mit gleicher Erfolgswahrscheinlichkeit p (z. B. wie viele von n Samen keimen). In R: dbinom/pbinom.'
	},
	Poissonverteilung: {
		term: 'Poissonverteilung',
		definition:
			'Verteilung der Anzahl seltener, unabhängiger Ereignisse pro Einheit mit Rate λ (z. B. Tiere pro Quadrat, Mutationen pro Genom). Mittelwert und Varianz sind beide λ. In R: dpois/ppois.'
	},

	// --- Begriffe, auf die andere Lektionen verweisen ----------------------
	// (Effektstärke und η² existieren bereits weiter oben und bleiben unverändert.)
	'Zweifaktorielle ANOVA': {
		term: 'Zweifaktorielle ANOVA',
		definition:
			'Eine ANOVA mit zwei erklärenden Faktoren gleichzeitig. Sie prüft die beiden Haupteffekte und zusätzlich deren Interaktion (Wechselwirkung).'
	},
	Interaktionseffekt: {
		term: 'Interaktionseffekt',
		definition:
			'Wechselwirkung: Die Wirkung des einen Faktors hängt von der Stufe eines anderen ab (z. B. wirkt ein Dünger nur bei einer bestimmten Lichtstufe). Im Diagramm: nicht-parallele Linien.'
	},
	Vorhersageintervall: {
		term: 'Vorhersageintervall',
		definition:
			'Intervall für eine einzelne neue Beobachtung — nicht für den Mittelwert. Es ist immer breiter als das Konfidenzintervall des Mittelwerts, weil es zusätzlich die Streuung einzelner Werte einschließt.'
	},
	Extrapolation: {
		term: 'Extrapolation',
		definition:
			'Eine Vorhersage außerhalb des beobachteten X-Bereichs. Riskant, weil dort niemand geprüft hat, ob der Zusammenhang noch gilt — die Gerade kann völlig danebenliegen.'
	},
	'Einseitiger Test': {
		term: 'Einseitiger Test',
		definition:
			'Ein Test, dessen Alternativhypothese nur eine Richtung zulässt (z. B. „größer als"). Die gesamte Irrtumswahrscheinlichkeit α liegt in einem Schwanz — empfindlicher, aber nur bei vorab festgelegter Richtung erlaubt.'
	},
	'Zweiseitiger Test': {
		term: 'Zweiseitiger Test',
		definition:
			'Ein Test, der Abweichungen in beide Richtungen prüft (Alternativhypothese „ungleich"). α wird auf beide Schwänze verteilt. Der Standardfall, wenn die Richtung nicht vorab feststeht.'
	},
	'Arkussinus-Transformation': {
		term: 'Arkussinus-Transformation',
		definition:
			'Eine Transformation für Anteile/Prozentwerte (arcsin√p), die deren Varianz stabilisiert, damit sie näherungsweise normalverteilt werden und in einer ANOVA/Regression verwendet werden können.'
	}
};

/**
 * Schlägt einen Begriff im Glossar nach. Groß-/Kleinschreibung wird ignoriert.
 * Gibt `undefined` zurück, wenn der Begriff nicht existiert.
 */
export function lookup(term: string): GlossaryEntry | undefined {
	if (glossary[term]) return glossary[term];
	const key = Object.keys(glossary).find((k) => k.toLowerCase() === term.toLowerCase());
	return key ? glossary[key] : undefined;
}
