/**
 * Reine Logik für das "Welcher Test?"-Szenario-Quiz der Abschlusslektion.
 *
 * Bewusst DOM-frei gehalten, damit das Bewerten der Szenario-Antworten
 * (richtiger Test gewählt? in die ≥3-Gruppen-Falle getappt?) unabhängig vom
 * Browser getestet werden kann.
 */

import type { Node } from './AnnahmenBaum.svelte';

/** Eine Antwortoption in einem Szenario. */
export type ScenarioOption = {
	/** Eindeutige Kennung der Option innerhalb des Szenarios. */
	id: string;
	/** Beschriftung (der angebotene Test). */
	label: string;
	/** Ist das die korrekte Wahl? */
	correct: boolean;
	/**
	 * Markiert die verlockende Falsch-Antwort (z. B. "drei t-Tests" bei ≥3
	 * Gruppen). Wird benutzt, um eine besondere Erklärung anzuzeigen.
	 */
	trap?: boolean;
	/** Erklärung, die nach der Wahl dieser Option gezeigt wird. */
	explanation: string;
};

/** Ein einzelnes biologisches Szenario im Quiz. */
export type Scenario = {
	/** Eindeutige ID. */
	id: string;
	/** Kurzer Titel / die Fragestellung. */
	prompt: string;
	/** Die Antwortmöglichkeiten. */
	options: ScenarioOption[];
};

/** Prüft, ob die gewählte Option in einem Szenario korrekt ist. */
export function isScenarioCorrect(scenario: Scenario, chosenId: string): boolean {
	return scenario.options.some((o) => o.id === chosenId && o.correct);
}

/** Schlägt eine Option per ID nach (oder `undefined`). */
export function findOption(scenario: Scenario, chosenId: string): ScenarioOption | undefined {
	return scenario.options.find((o) => o.id === chosenId);
}

/**
 * Zählt die korrekt gelösten Szenarien. `answers` ist nach Szenario-`id`
 * indiziert; fehlende Antworten zählen nicht als korrekt.
 */
export function scoreScenarios(
	scenarios: Scenario[],
	answers: Record<string, string | undefined>
): { correct: number; total: number } {
	let correct = 0;
	for (const s of scenarios) {
		const chosen = answers[s.id];
		if (chosen !== undefined && isScenarioCorrect(s, chosen)) correct += 1;
	}
	return { correct, total: scenarios.length };
}

/**
 * Die sechs kanonischen, biologischen Szenarien — eines pro Test-Familie.
 * Das ANOVA-Szenario (≥3 Gruppen) trägt die "drei t-Tests"-Falle.
 */
export const SCENARIOS: Scenario[] = [
	{
		id: 'sz-chi',
		prompt:
			'Du zählst in einer Population die vier Blutgruppen A, B, AB und 0 und willst prüfen, ob ihre Verteilung von einem erwarteten Verhältnis abweicht.',
		options: [
			{
				id: 'chi',
				label: 'Chi-Quadrat-Anpassungstest',
				correct: true,
				explanation:
					'Richtig. Die Daten sind kategorial (Häufigkeiten je Blutgruppe), und du vergleichst beobachtete mit erwarteten Anzahlen — das ist genau der Chi-Quadrat-Anpassungstest. R: chisq.test(beob, p = erwartet).'
			},
			{
				id: 't',
				label: 'Ein-Stichproben-t-Test',
				correct: false,
				explanation:
					'Nicht ganz. Ein t-Test braucht metrische Messwerte und einen Mittelwert. Hier hast du Häufigkeiten in Kategorien — dafür ist der Chi-Quadrat-Anpassungstest zuständig.'
			},
			{
				id: 'anova',
				label: 'Einfaktorielle ANOVA',
				correct: false,
				explanation:
					'Nein. Die ANOVA vergleicht Mittelwerte metrischer Daten über Gruppen. Hier zählst du Kategorien — das ist ein Fall für den Chi-Quadrat-Anpassungstest.'
			}
		]
	},
	{
		id: 'sz-ein',
		prompt:
			'Du misst den Cholesterinwert bei einer Patientengruppe und willst wissen, ob er im Mittel über dem Referenzwert von 200 mg/dl liegt.',
		options: [
			{
				id: 't1',
				label: 'Ein-Stichproben-t-Test (einseitig)',
				correct: true,
				explanation:
					'Richtig. Ein metrischer Messwert, EINE Stichprobe, verglichen mit einem festen Referenzwert μ₀ = 200 — und die Frage „darüber?“ ist gerichtet, also einseitig. R: t.test(chol, mu = 200, alternative = "greater").'
			},
			{
				id: 't2',
				label: 'Zwei-Stichproben-t-Test',
				correct: false,
				explanation:
					'Nein. Du hast nur EINE Gruppe und vergleichst sie mit einem festen Referenzwert, nicht mit einer zweiten Gruppe — das ist der Ein-Stichproben-t-Test.'
			},
			{
				id: 'chi',
				label: 'Chi-Quadrat-Test',
				correct: false,
				explanation:
					'Nein. Der Cholesterinwert ist ein metrischer Messwert, keine Kategorie. Chi-Quadrat ist für Häufigkeiten. Hier passt der Ein-Stichproben-t-Test.'
			}
		]
	},
	{
		id: 'sz-zwei',
		prompt:
			'Du vergleichst den Ertrag von Pflanzen unter Dünger A mit dem unter Dünger B — zwei getrennte, unabhängige Gruppen von Pflanzen.',
		options: [
			{
				id: 't2',
				label: 'Zwei-Stichproben-t-Test',
				correct: true,
				explanation:
					'Richtig. Metrischer Messwert (Ertrag), ZWEI unabhängige Gruppen — das ist der Zwei-Stichproben-t-Test (in R standardmäßig Welch). R: t.test(ertrag ~ duenger).'
			},
			{
				id: 'paired',
				label: 'Gepaarter t-Test',
				correct: false,
				explanation:
					'Nein. Gepaart wäre es nur, wenn dieselbe Pflanze beide Dünger bekäme. Hier sind es zwei getrennte Gruppen — also der unabhängige Zwei-Stichproben-t-Test.'
			},
			{
				id: 'anova',
				label: 'Einfaktorielle ANOVA',
				correct: false,
				explanation:
					'Knapp daneben. Bei genau ZWEI Gruppen nimmt man den t-Test. Die ANOVA brauchst du erst ab drei Gruppen (sie liefert bei zwei Gruppen dasselbe Ergebnis wie der t-Test).'
			}
		]
	},
	{
		id: 'sz-paired',
		prompt:
			'Du misst bei denselben Personen den Blutdruck vorher und nachher (nach einer Behandlung) und willst wissen, ob sich etwas geändert hat.',
		options: [
			{
				id: 'paired',
				label: 'Gepaarter t-Test',
				correct: true,
				explanation:
					'Richtig. Es sind dieselben Personen vorher/nachher — die Messungen sind PAARWEISE verbunden. Der gepaarte t-Test testet, ob der Mittelwert der Differenzen null ist. R: t.test(vorher, nachher, paired = TRUE).'
			},
			{
				id: 't2',
				label: 'Zwei-Stichproben-t-Test (unabhängig)',
				correct: false,
				trap: true,
				explanation:
					'Aufgepasst — das ist die häufigste Verwechslung. „Vorher“ und „nachher“ stammen von DENSELBEN Personen, sind also abhängig (gepaart). Der unabhängige t-Test würde diese Paarung ignorieren und verschenkt Power. Richtig ist der gepaarte t-Test.'
			},
			{
				id: 'chi',
				label: 'Chi-Quadrat-Test',
				correct: false,
				explanation:
					'Nein. Blutdruck ist ein metrischer Messwert, keine Kategorie. Da es dieselben Personen vorher/nachher sind, ist der gepaarte t-Test richtig.'
			}
		]
	},
	{
		id: 'sz-anova',
		prompt:
			'Du misst die Genexpression unter DREI verschiedenen Behandlungen und willst wissen, ob sich die Mittelwerte unterscheiden.',
		options: [
			{
				id: 'anova',
				label: 'Einfaktorielle ANOVA (danach Tukey-Post-hoc)',
				correct: true,
				explanation:
					'Richtig. Drei Gruppen, metrischer Messwert → EIN gemeinsamer Test: die einfaktorielle ANOVA. Wird sie signifikant, sagt dir der Tukey-Post-hoc-Test, WELCHE Paare sich unterscheiden — bei kontrollierter Fehlerrate. R: aov(y ~ gruppe) und TukeyHSD(...).'
			},
			{
				id: 'three-t',
				label: 'Drei einzelne t-Tests (A–B, A–C, B–C)',
				correct: false,
				trap: true,
				explanation:
					'Das ist die klassische Falle. Drei separate t-Tests blähen die familienweise Fehlerrate auf (α-Inflation): Bei drei Vergleichen zu je 5 % liegt die Chance auf mindestens einen Fehlalarm schon bei rund 14 %. Stattdessen EINE ANOVA, und erst danach — falls signifikant — ein Post-hoc-Test wie Tukey HSD, der die Fehlerrate kontrolliert.'
			},
			{
				id: 't2',
				label: 'Ein Zwei-Stichproben-t-Test',
				correct: false,
				explanation:
					'Nein. Ein einzelner Zwei-Stichproben-t-Test kann nur zwei Gruppen vergleichen. Bei drei Behandlungen brauchst du die ANOVA, gefolgt von einem Post-hoc-Test.'
			}
		]
	},
	{
		id: 'sz-reg',
		prompt:
			'Du willst aus der Körpergröße die Lungenkapazität vorhersagen — beides sind metrische Messwerte, und du vermutest einen linearen Zusammenhang mit klarer Richtung.',
		options: [
			{
				id: 'reg',
				label: 'Lineare Regression',
				correct: true,
				explanation:
					'Richtig. Zwei metrische Variablen, eine erklärt die andere (Größe → Lungenkapazität): Die lineare Regression legt eine Gerade durch die Daten und sagt Y aus X vorher. R: lm(lunge ~ groesse).'
			},
			{
				id: 'anova',
				label: 'Einfaktorielle ANOVA',
				correct: false,
				explanation:
					'Nein. Die ANOVA vergleicht Gruppenmittelwerte. Hier ist die Körpergröße aber kontinuierlich (keine Gruppen), und du willst vorhersagen — das ist die lineare Regression.'
			},
			{
				id: 't2',
				label: 'Zwei-Stichproben-t-Test',
				correct: false,
				explanation:
					'Nein. Es gibt keine zwei Gruppen. Du untersuchst den Zusammenhang zweier kontinuierlicher Variablen mit Richtung — das ist die lineare Regression.'
			}
		]
	}
];

// --- Entscheidungsbaum: erweitert über ALLE Test-Familien -------------------
// Wird als custom `nodes`/`root` an AnnahmenBaum übergeben. Erst Datentyp,
// dann für kategorial → Anpassung vs. Unabhängigkeit (mit Fisher-Abzweig),
// für kontinuierlich → Anzahl Gruppen (1/2/≥3) + gepaart? + Normalverteilung?
// → bis zum konkreten Test (inkl. nicht-parametrischer Alternativen).

export const ENTSCHEIDUNGSBAUM_ROOT = 'datentyp';

export const ENTSCHEIDUNGSBAUM_NODES: Record<string, Node> = {
	datentyp: {
		question: 'Welcher Datentyp liegt vor?',
		hint: 'Zählst du Fälle in Kategorien (Blutgruppe, Geschlecht, Habitat)? Oder misst du Zahlen auf einer Skala (Ertrag, Cholesterin, Größe)?',
		options: [
			{ label: 'Kategorial / Häufigkeiten', next: 'katFrage' },
			{ label: 'Kontinuierlich / metrische Messwerte', next: 'anzahl' }
		]
	},
	// --- Kategorialer Ast -----------------------------------------------------
	katFrage: {
		question: 'Was möchtest du mit den Häufigkeiten prüfen?',
		hint: 'Eine Verteilung gegen ein erwartetes Verhältnis? Oder ob zwei Merkmale zusammenhängen (Kreuztabelle)?',
		options: [
			{
				label: 'Beobachtete Verteilung vs. erwartetes Verhältnis',
				result: {
					test: 'Chi-Quadrat-Anpassungstest',
					why: 'Du vergleichst beobachtete Häufigkeiten mit einer erwarteten Verteilung (z. B. Blutgruppen gegen ein Soll-Verhältnis).',
					rcall: 'chisq.test(beob, p = erwartet)'
				}
			},
			{ label: 'Zusammenhang zweier Merkmale (Kontingenztafel)', next: 'katErwartung' }
		]
	},
	katErwartung: {
		question: 'Sind alle erwarteten Zellhäufigkeiten groß genug (Faustregel E ≥ 5)?',
		hint: 'Bei kleinen erwarteten Häufigkeiten ist die Chi-Quadrat-Näherung unzuverlässig.',
		options: [
			{
				label: 'Ja, alle E ≥ 5',
				result: {
					test: 'Chi-Quadrat-Unabhängigkeitstest',
					why: 'Zwei kategoriale Merkmale in einer Kontingenztafel, ausreichend große Erwartungswerte — der Chi-Quadrat-Unabhängigkeitstest passt.',
					rcall: 'chisq.test(tabelle)'
				}
			},
			{
				label: 'Nein, kleine Erwartungswerte (E < 5)',
				result: {
					test: 'Fishers exakter Test',
					why: 'Bei kleinen erwarteten Häufigkeiten ist die Chi-Quadrat-Näherung unzuverlässig — Fishers exakter Test rechnet exakt.',
					rcall: 'fisher.test(tabelle)'
				}
			}
		]
	},
	// --- Kontinuierlicher Ast -------------------------------------------------
	anzahl: {
		question: 'Wie viele Gruppen vergleichst du?',
		hint: 'Eine Stichprobe gegen einen festen Referenzwert? Zwei Gruppen? Oder drei und mehr? Oder geht es um den Zusammenhang zweier metrischer Variablen?',
		options: [
			{ label: 'Eine Stichprobe gegen festen Referenzwert μ₀', next: 'einNorm' },
			{ label: 'Zwei Gruppen', next: 'paarung' },
			{ label: 'Drei oder mehr Gruppen', next: 'anovaNorm' },
			{ label: 'Zusammenhang zweier metrischer Variablen', next: 'zusammenhang' }
		]
	},
	// Eine Stichprobe
	einNorm: {
		question: 'Ist die Stichprobe (näherungsweise) normalverteilt?',
		hint: 'Bei n ≳ 30 ist der t-Test wegen des zentralen Grenzwertsatzes recht robust.',
		options: [
			{
				label: 'Ja (oder n groß genug)',
				result: {
					test: 'Ein-Stichproben-t-Test',
					why: 'Ein Mittelwert gegen einen festen Referenzwert μ₀ (z. B. Cholesterin gegen 200), Normalität plausibel.',
					rcall: 't.test(x, mu = 200)'
				}
			},
			{
				label: 'Nein, klar verletzt',
				result: {
					test: 'Wilcoxon-Vorzeichen-Rang-Test (Ein-Stichproben)',
					why: 'Verletzte Normalität → die rangbasierte, verteilungsfreie Variante.',
					rcall: 'wilcox.test(x, mu = 200)'
				}
			}
		]
	},
	// Zwei Gruppen: gepaart?
	paarung: {
		question: 'Sind die beiden Gruppen gepaart oder unabhängig?',
		hint: 'Gepaart = dieselbe Einheit zweimal gemessen (Blutdruck vorher/nachher). Unabhängig = zwei getrennte Gruppen (Dünger A vs. B).',
		options: [
			{ label: 'Gepaart (dieselben Einheiten zweimal)', next: 'paarNorm' },
			{ label: 'Unabhängig (zwei getrennte Gruppen)', next: 'unabhNorm' }
		]
	},
	paarNorm: {
		question: 'Sind die Differenzen der Paare (näherungsweise) normalverteilt?',
		hint: 'Beim gepaarten Test zählt die Normalität der DIFFERENZEN, nicht der Rohwerte.',
		options: [
			{
				label: 'Ja, Differenzen normalverteilt',
				result: {
					test: 'Gepaarter t-Test',
					why: 'Abhängige Paare (z. B. Blutdruck vorher/nachher) mit normalverteilten Differenzen.',
					rcall: 't.test(vorher, nachher, paired = TRUE)'
				}
			},
			{
				label: 'Nein, nicht normalverteilt',
				result: {
					test: 'Wilcoxon-Vorzeichen-Rang-Test',
					why: 'Die verteilungsfreie Alternative zum gepaarten t-Test: rangbasiert, robust gegen Ausreißer.',
					rcall: 'wilcox.test(vorher, nachher, paired = TRUE)'
				}
			}
		]
	},
	unabhNorm: {
		question: 'Sind beide Gruppen (näherungsweise) normalverteilt?',
		hint: 'Prüfbar mit dem Shapiro-Wilk-Test — dort heißt p > 0,05 „Normalität ok“.',
		options: [
			{ label: 'Ja (oder n je Gruppe groß genug)', next: 'unabhVar' },
			{
				label: 'Nein, klar verletzt',
				result: {
					test: 'Mann-Whitney-U-Test',
					why: 'Verletzte Normalität bei zwei unabhängigen Gruppen → der rangbasierte, verteilungsfreie U-Test.',
					rcall: 'wilcox.test(a, b)'
				}
			}
		]
	},
	unabhVar: {
		question: 'Sind die Varianzen beider Gruppen gleich (Varianzhomogenität)?',
		hint: 'Prüfbar mit var.test. Im Zweifel: Welch nehmen — er ist der R-Standard und robuster.',
		options: [
			{
				label: 'Ja, Varianzen gleich',
				result: {
					test: 'Student-t-Test (gleiche Varianzen)',
					why: 'Zwei unabhängige, normalverteilte Gruppen mit gleicher Streuung — der gepoolte Student-t-Test.',
					rcall: 't.test(a, b, var.equal = TRUE)'
				}
			},
			{
				label: 'Nein / unsicher',
				result: {
					test: 'Welch-Test (ungleiche Varianzen)',
					why: 'Bei ungleichen oder unsicheren Varianzen ist der Welch-Test richtig — in R der Standard von t.test().',
					rcall: 't.test(a, b)'
				}
			}
		]
	},
	// Drei oder mehr Gruppen
	anovaNorm: {
		question: 'Sind die Gruppen (näherungsweise) normalverteilt mit ähnlichen Varianzen?',
		hint: 'Voraussetzungen der ANOVA: annähernde Normalverteilung der Residuen und Varianzhomogenität (Levene-Test).',
		options: [
			{
				label: 'Ja, Annahmen erfüllt',
				result: {
					test: 'Einfaktorielle ANOVA (danach Tukey-Post-hoc)',
					why: 'Drei oder mehr Gruppen → EIN gemeinsamer Test (keine mehrfachen t-Tests!). Wird sie signifikant, klärt Tukey HSD, welche Paare sich unterscheiden.',
					rcall: 'aov(y ~ gruppe); TukeyHSD(aov(y ~ gruppe))'
				}
			},
			{
				label: 'Nein, Annahmen verletzt',
				result: {
					test: 'Kruskal-Wallis-Test',
					why: 'Die rangbasierte, verteilungsfreie Alternative zur einfaktoriellen ANOVA bei verletzten Annahmen.',
					rcall: 'kruskal.test(y ~ gruppe)'
				}
			}
		]
	},
	// Zusammenhang zweier metrischer Variablen
	zusammenhang: {
		question: 'Willst du vorhersagen/erklären oder nur die Stärke des Zusammenhangs messen?',
		hint: 'Vorhersage mit Richtung (X erklärt Y) → Regression. Reine Zusammenhangsstärke ohne Richtung → Korrelation.',
		options: [
			{ label: 'Y aus X vorhersagen (klare Richtung)', next: 'regLinear' },
			{ label: 'Nur die Zusammenhangsstärke messen', next: 'korrLinear' }
		]
	},
	regLinear: {
		question: 'Ist der Zusammenhang näherungsweise linear (mit normalverteilten Residuen)?',
		hint: 'Prüfbar im Streudiagramm und in den Residuenplots.',
		options: [
			{
				label: 'Ja, linear',
				result: {
					test: 'Lineare Regression',
					why: 'Zwei metrische Variablen, eine erklärt die andere (z. B. Größe → Lungenkapazität): eine Gerade durch die Daten.',
					rcall: 'lm(y ~ x)'
				}
			},
			{
				label: 'Nein, gekrümmt',
				result: {
					test: 'Lineare Regression nach Transformation',
					why: 'Bei gekrümmtem Zusammenhang erst begradigen (z. B. log) und dann linear regressieren.',
					rcall: 'lm(log(y) ~ x)'
				}
			}
		]
	},
	korrLinear: {
		question: 'Ist der Zusammenhang linear und sind beide Variablen normalverteilt?',
		hint: 'Pearson misst linearen Zusammenhang und reagiert empfindlich auf Ausreißer; Spearman misst monotone Zusammenhänge und ist robuster.',
		options: [
			{
				label: 'Ja, linear & normalverteilt',
				result: {
					test: 'Pearson-Korrelation',
					why: 'Linearer Zusammenhang zweier normalverteilter Variablen — der Pearson-Korrelationskoeffizient r.',
					rcall: 'cor.test(x, y)'
				}
			},
			{
				label: 'Nein, monoton/ordinal oder Ausreißer',
				result: {
					test: 'Spearman-Korrelation',
					why: 'Für monotone (nicht zwingend lineare) Zusammenhänge, ordinale Daten oder bei Ausreißern: die rangbasierte Spearman-Korrelation.',
					rcall: 'cor.test(x, y, method = "spearman")'
				}
			}
		]
	}
};
