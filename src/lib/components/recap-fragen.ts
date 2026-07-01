import { orderedLessons } from '$lib/lessons';
import type { Question } from './selbsttest-logic';

/** Recap-Fragen, keyed nach dem slug der Lektion, DIE zusammengefasst wird.
 *  Wird in Task 4 mit echten Fragen für alle Lektionen gefüllt. */
export const recapQuestions: Record<string, Question[]> = {
	// Lektion 1 — Was ist Statistik?
	'was-ist-statistik': [
		{
			id: 'recap-was-ist-statistik-1',
			kind: 'mc',
			prompt:
				'Du fasst deine erhobenen Daten mit Mittelwert und Histogramm zusammen, ohne auf eine größere Grundgesamtheit zu schließen. Welches Teilgebiet ist das?',
			options: [
				'Deskriptive Statistik — du beschreibst nur die vorliegenden Daten.',
				'Inferentielle Statistik — du schließt von der Stichprobe auf die Grundgesamtheit.'
			],
			correct: 0,
			explanation:
				'Deskriptive Statistik beschreibt die vorhandenen Daten. Erst wenn du über sie hinaus auf eine Grundgesamtheit schließt, wird es inferentiell.'
		},
		{
			id: 'recap-was-ist-statistik-2',
			kind: 'tf',
			prompt:
				'Nur ein kontrolliertes Experiment mit Zufallszuteilung erlaubt einen sauberen Kausalschluss.',
			correct: true,
			explanation:
				'Wahr. Durch das gezielte Eingreifen und die Randomisierung gleichen sich Störfaktoren im Schnitt aus. Bei reinem Beobachten kann immer ein dritter Faktor den Zusammenhang vortäuschen.'
		}
	],

	// Lektion 2 — Wahrscheinlichkeit & Bayes
	'wahrscheinlichkeit-bayes': [
		{
			id: 'recap-wahrscheinlichkeit-bayes-1',
			kind: 'tf',
			prompt:
				'Bei einem seltenen Erreger ist ein positiv getestetes Tier trotz hoher Sensitivität oft ein Fehlalarm.',
			correct: true,
			explanation:
				'Wahr. Wegen der niedrigen Basisrate erschlagen die vielen falsch-positiven unter den gesunden Tieren die wenigen richtig-positiven. P(infiziert | positiv) bleibt klein.'
		},
		{
			id: 'recap-wahrscheinlichkeit-bayes-2',
			kind: 'mc',
			prompt: 'Was bedeutet eine Sensitivität von 99 %?',
			options: [
				'P(positiv | infiziert) — von den Infizierten werden 99 % positiv getestet.',
				'P(infiziert | positiv) — von den positiv Getesteten sind 99 % infiziert.'
			],
			correct: 0,
			explanation:
				'Die Sensitivität geht von der Infektion zum Testergebnis. Die eigentlich interessierende Frage P(infiziert | positiv) ist die umgekehrte Richtung und kann ganz anders ausfallen.'
		}
	],

	// Lektion 3 — Verteilungen & die Glockenkurve
	verteilungen: [
		{
			id: 'recap-verteilungen-1',
			kind: 'mc',
			prompt: 'Was ist bei einer stetigen Verteilung die Wahrscheinlichkeit für ein Intervall [a, b]?',
			options: [
				'Die Fläche unter der Dichtekurve über [a, b].',
				'Die Höhe der Dichtekurve an der Stelle a.'
			],
			correct: 0,
			explanation:
				'Bei stetigen Verteilungen ist die Fläche unter der Kurve die Wahrscheinlichkeit, nicht die Höhe. Ein einzelner exakter Wert hat deshalb die Wahrscheinlichkeit 0.'
		},
		{
			id: 'recap-verteilungen-2',
			kind: 'tf',
			prompt: 'Bei einer Normalverteilung liegen rund 95 % der Werte im Bereich μ ± 2σ.',
			correct: true,
			explanation:
				'Wahr — das ist die 68–95–99,7-Regel: etwa 68 % in μ ± 1σ, 95 % in μ ± 2σ und 99,7 % in μ ± 3σ.'
		}
	],

	// Lektion 4 — Von der Stichprobe zur Stichprobenverteilung
	stichprobenverteilung: [
		{
			id: 'recap-stichprobenverteilung-1',
			kind: 'tf',
			prompt:
				'Der Zentrale Grenzwertsatz sagt: Die Verteilung der Stichprobenmittelwerte wird mit wachsendem n glockenförmig — auch wenn die Grundgesamtheit schief verteilt ist.',
			correct: true,
			explanation:
				'Wahr. Nicht die Einzelwerte, sondern die Mittelwerte vieler Stichproben werden glockenförmig — selbst aus einer schiefen Grundgesamtheit.'
		},
		{
			id: 'recap-stichprobenverteilung-2',
			kind: 'mc',
			prompt: 'Was passiert mit dem Standardfehler σ/√n, wenn der Stichprobenumfang n größer wird?',
			options: ['Er wird kleiner.', 'Er wird größer.'],
			correct: 0,
			explanation:
				'Größeres n steht im Nenner, also sinkt der Standardfehler: Die Schätzung schwankt weniger von Stichprobe zu Stichprobe und wird verlässlicher.'
		}
	],

	// Lektion 5 — Schätzen & Konfidenzintervalle
	konfidenzintervalle: [
		{
			id: 'recap-konfidenzintervalle-1',
			kind: 'tf',
			prompt:
				'Ein 95-%-Konfidenzintervall bedeutet: Der wahre Parameter μ liegt mit 95 % Wahrscheinlichkeit in genau diesem berechneten Intervall.',
			correct: false,
			explanation:
				'Häufige Fehldeutung. μ ist fest, das Intervall ist zufällig: Bei wiederholten Stichproben überdecken 95 % der so berechneten Intervalle das wahre μ. Für ein konkretes Intervall gilt keine 95-%-Wahrscheinlichkeit.'
		},
		{
			id: 'recap-konfidenzintervalle-2',
			kind: 'mc',
			prompt:
				'Wie verändert sich ein Konfidenzintervall für den Mittelwert, wenn der Stichprobenumfang n (bei gleichem Konfidenzniveau) größer wird?',
			options: ['Es wird schmaler.', 'Es wird breiter.', 'Die Breite bleibt gleich.'],
			correct: 0,
			explanation:
				'Der Standardfehler sinkt mit wachsendem n (Faktor 1/√n), deshalb wird das Intervall schmaler — die Schätzung wird präziser.'
		}
	],

	// Lektion 6 — Hypothesentest & der p-Wert
	hypothesentest: [
		{
			id: 'recap-hypothesentest-1',
			kind: 'mc',
			prompt: 'Was besagt ein p-Wert von 0,03?',
			options: [
				'Wenn H0 wahr wäre, träte ein mindestens so extremer Befund nur in 3 % der Wiederholungen rein zufällig auf.',
				'Die Wahrscheinlichkeit, dass H0 wahr ist, beträgt 3 %.'
			],
			correct: 0,
			explanation:
				'Der p-Wert ist P(Daten so extrem oder extremer | H0 wahr) — eine Aussage UNTER der Annahme, dass H0 gilt. Er ist nicht P(H0 wahr | Daten).'
		},
		{
			id: 'recap-hypothesentest-2',
			kind: 'tf',
			prompt: 'Ein nicht-signifikantes Ergebnis (p > α) beweist, dass es keinen Unterschied gibt.',
			correct: false,
			explanation:
				'Falsch. „Nicht signifikant“ heißt „kein Nachweis“, nicht „kein Unterschied“. Ein echter Effekt kann übersehen worden sein — besonders bei kleiner Stichprobe oder geringer Power.'
		}
	],

	// Lektion 7 — t-Tests & nicht-parametrische Alternativen
	't-tests': [
		{
			id: 'recap-t-tests-1',
			kind: 'mc',
			prompt: 'Der t-Wert ist ein Signal-zu-Rausch-Verhältnis. Wann wird derselbe Mittelwertunterschied eher signifikant?',
			options: [
				'Bei kleiner Streuung innerhalb der Gruppen und großem n.',
				'Bei großer Streuung innerhalb der Gruppen und kleinem n.'
			],
			correct: 0,
			explanation:
				'Genau. t = Signal ÷ Rausch = Δ / SE mit SE = s·√(2/n). Kleine Streuung und großes n verkleinern den Standardfehler, vergrößern t und verkleinern p.'
		},
		{
			id: 'recap-t-tests-2',
			kind: 'tf',
			prompt:
				'Ist die Normalverteilungsannahme verletzt, ist der Mann-Whitney-U-Test eine sinnvolle Alternative zum unabhängigen t-Test.',
			correct: true,
			explanation:
				'Wahr. Der Mann-Whitney-U-Test ist rangbasiert und verteilungsfrei, also robuster gegen Ausreißer. Das gepaarte Pendant ist der Wilcoxon-Vorzeichen-Rang-Test.'
		}
	],

	// Lektion 8 — Chi-Quadrat-Tests
	'chi-quadrat': [
		{
			id: 'recap-chi-quadrat-1',
			kind: 'mc',
			prompt: 'Was stellen die „erwarteten“ Werte E in der χ²-Rechnung dar?',
			options: [
				'Die Häufigkeiten, die man unter der Nullhypothese erwarten würde — das Modell, keine Daten.',
				'Eine zweite, unabhängig erhobene Stichprobe zum Vergleich.'
			],
			correct: 0,
			explanation:
				'Die E-Werte folgen aus der Nullhypothese (z. B. Unabhängigkeit oder ein 9:3:3:1-Verhältnis). χ² = Σ(B−E)²/E misst, wie weit die beobachteten Zählungen davon abweichen.'
		},
		{
			id: 'recap-chi-quadrat-2',
			kind: 'tf',
			prompt:
				'Ist eine erwartete Häufigkeit E kleiner als 5, wird die χ²-Näherung unzuverlässig und man wechselt z. B. auf Fishers exakten Test.',
			correct: true,
			explanation:
				'Wahr. Der χ²-Test ist eine Näherung; Faustregel: alle E ≥ 5. Ist das verletzt, nimmt man Fishers exakten Test oder fasst Kategorien zusammen — und rechnet immer mit Anzahlen, nie mit Prozenten.'
		}
	],

	// Lektion 9 — ANOVA & Mehrstichprobentests
	anova: [
		{
			id: 'recap-anova-1',
			kind: 'mc',
			prompt: 'Warum rechnet man bei drei oder mehr Gruppen EINE ANOVA statt vieler paarweiser t-Tests?',
			options: [
				'Weil jeder einzelne t-Test α verbraucht und die familienweise Fehlerrate sonst rasch anwächst.',
				'Weil die ANOVA rechnerisch einfacher und schneller ist.'
			],
			correct: 0,
			explanation:
				'Bei c Vergleichen steigt die familienweise Fehlerrate auf 1 − (1 − α)^c — schon bei drei Gruppen ~14 %. Die ANOVA bündelt alles in einen Test über das F-Verhältnis und hält α ein.'
		},
		{
			id: 'recap-anova-2',
			kind: 'tf',
			prompt: 'Eine signifikante ANOVA sagt dir bereits, WELCHE Gruppen sich unterscheiden.',
			correct: false,
			explanation:
				'Falsch. Die ANOVA sagt nur: „irgendein Gruppenmittel weicht ab“. Welche Paare sich unterscheiden, zeigt erst ein Post-hoc-Test wie Tukey HSD.'
		}
	],

	// Lektion 10 — Korrelation & Transformation
	korrelation: [
		{
			id: 'recap-korrelation-1',
			kind: 'tf',
			prompt: 'Eine Pearson-Korrelation von r = 0 beweist, dass gar kein Zusammenhang besteht.',
			correct: false,
			explanation:
				'Falsch. r = 0 heißt nur „kein LINEARER Zusammenhang“. Eine U-Form kann r ≈ 0 liefern, obwohl ein klares Muster vorliegt — deshalb sieht man sich immer den Scatterplot an.'
		},
		{
			id: 'recap-korrelation-2',
			kind: 'tf',
			prompt: 'Eine hohe Korrelation zwischen zwei Merkmalen beweist, dass das eine das andere verursacht.',
			correct: false,
			explanation:
				'Falsch. Korrelation ist nicht Kausalität. Ein dritter Faktor (Confounder) kann eine Scheinkorrelation erzeugen. Kausalität begründet man nur über kontrollierte Experimente.'
		}
	],

	// Lektion 11 — Lineare Regression
	regression: [
		{
			id: 'recap-regression-1',
			kind: 'mc',
			prompt:
				'Die Steigung deiner Regression ist hochsignifikant (p < 0,001), aber R² = 0,12. Wie liest du das?',
			options: [
				'Ein Zusammenhang EXISTIERT (β ≠ 0), aber das Modell sagt schlecht vorher — „signifikant“ ≠ „sagt gut vorher“.',
				'Ein Widerspruch — bei kleinem R² kann die Steigung nicht signifikant sein.'
			],
			correct: 0,
			explanation:
				'Der p-Wert der Steigung sagt, OB ein Zusammenhang existiert; R² sagt, WIE VIEL Streuung das Modell erklärt. Ein signifikantes b bei kleinem R² ist völlig normal: Der Effekt ist real, aber schwach prädiktiv.'
		}
	],

	// Lektion 12 — Experimentelles Design & Power
	power: [
		{
			id: 'recap-power-1',
			kind: 'tf',
			prompt: 'Ein nicht-signifikantes Ergebnis beweist, dass es keinen Effekt gibt.',
			correct: false,
			explanation:
				'Falsch. Bei kleinem n und großer Streuung ist die Power niedrig, und echte Effekte werden übersehen (Fehler 2. Art). Abwesenheit von Beweis ist nicht Beweis der Abwesenheit.'
		},
		{
			id: 'recap-power-2',
			kind: 'mc',
			prompt: 'Welche Maßnahme erhöht die Power einer Studie NICHT?',
			options: [
				'Das Signifikanzniveau von α = 0,05 auf 0,01 senken.',
				'Mehr Beobachtungen erheben (größeres n).'
			],
			correct: 0,
			explanation:
				'α zu senken erhöht die Power nicht, sondern senkt sie (bei festem n). Power steigt mit größerem n, größerer Effektstärke und kleinerer Streuung σ.'
		}
	],

	// Lektion 13 — Designtypen & Pseudoreplikation
	designtypen: [
		{
			id: 'recap-designtypen-1',
			kind: 'mc',
			prompt:
				'Ein Futter wird auf 5 Becken pro Gruppe verteilt, in jedem Becken werden 20 Fische gemessen. Was ist die echte Stichprobengröße?',
			options: [
				'5 Becken pro Gruppe — das Becken ist die Versuchseinheit; die 20 Fische sind abhängige Subsamples.',
				'100 Fische pro Gruppe — jeder gemessene Fisch ist ein Datenpunkt.'
			],
			correct: 0,
			explanation:
				'Die Behandlung wurde auf Becken-Ebene zugeteilt, also ist das Becken die Replikationseinheit. Wer mit n = 100 rechnet, betreibt Pseudoreplikation und erhält falsch kleine p-Werte.'
		}
	]
};

/** Recap-Fragen der Lektion, die VOR `slug` kommt (oder [] für die erste). */
export function recapForLesson(slug: string): Question[] {
	const idx = orderedLessons.findIndex((l) => l.slug === slug);
	if (idx <= 0) return []; // -1 = unbekannt, 0 = erste Lektion → beide leer
	const prev = orderedLessons[idx - 1];
	return recapQuestions[prev.slug] ?? [];
}
