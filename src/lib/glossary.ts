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
