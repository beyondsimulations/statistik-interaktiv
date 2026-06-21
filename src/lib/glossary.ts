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
