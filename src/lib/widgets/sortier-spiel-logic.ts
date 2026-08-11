/**
 * Reine Logik für das Sortier-Spiel der Lektion "Was ist Statistik?".
 *
 * Bewusst DOM-frei gehalten, damit das Zuordnen von Aussagen zu den drei
 * Teilgebieten der Statistik unabhängig vom Browser getestet werden kann.
 */

/** Die drei Teilgebiete, denen eine Aussage zugeordnet wird. */
export type Bucket = 'deskriptiv' | 'inferentiell' | 'explorativ';

/** Eine einzelne, zuzuordnende Aussage. */
export type Aussage = {
	/** Eindeutige ID. */
	id: string;
	/** Der Text der Aussage. */
	text: string;
	/** Das korrekte Teilgebiet. */
	correct: Bucket;
	/** Kurze Begründung, warum die Aussage dorthin gehört. */
	why: string;
};

/** Anzeige-Labels für die drei Buckets (mit korrekten Umlauten). */
export const BUCKET_LABELS: Record<Bucket, string> = {
	deskriptiv: 'Deskriptiv',
	inferentiell: 'Inferentiell',
	explorativ: 'Explorativ'
};

/** Die feste Reihenfolge der Buckets in der Oberfläche. */
export const BUCKETS: Bucket[] = ['deskriptiv', 'inferentiell', 'explorativ'];

/**
 * Prüft, ob eine Zuordnung korrekt ist.
 */
export function isAssignmentCorrect(aussage: Aussage, chosen: Bucket): boolean {
	return aussage.correct === chosen;
}

/**
 * Berechnet, wie viele der abgegebenen Zuordnungen korrekt sind.
 * `assignments` ist nach Aussage-`id` indiziert; fehlende Zuordnungen zählen
 * nicht als korrekt.
 */
export function scoreAssignments(
	aussagen: Aussage[],
	assignments: Record<string, Bucket | undefined>
): { correct: number; total: number } {
	let correct = 0;
	for (const a of aussagen) {
		const chosen = assignments[a.id];
		if (chosen !== undefined && isAssignmentCorrect(a, chosen)) correct += 1;
	}
	return { correct, total: aussagen.length };
}

/**
 * Die acht Beispiel-Aussagen für das Spiel.
 */
export const AUSSAGEN: Aussage[] = [
	{
		id: 's1',
		text: 'Der Mittelwert der Körpergröße in der Klasse beträgt 178 cm.',
		correct: 'deskriptiv',
		why: 'Hier werden vorhandene Daten nur zusammengefasst — ein klassischer Kennwert. Das ist deskriptive Statistik.'
	},
	{
		id: 's2',
		text: 'Mit 95 % Sicherheit liegt der wahre Mittelwert zwischen 1,75 m und 1,81 m.',
		correct: 'inferentiell',
		why: 'Aus der Stichprobe wird auf die Grundgesamtheit geschlossen — ein Konfidenzintervall. Das ist schließende (inferentielle) Statistik.'
	},
	{
		id: 's3',
		text: 'Auffällig: Pflanzen im Schatten scheinen kleinere Blätter zu haben — das könnte man testen.',
		correct: 'explorativ',
		why: 'Aus den Daten entsteht eine neue, noch zu prüfende Hypothese. Das ist explorative Statistik.'
	},
	{
		id: 's4',
		text: 'Ein Histogramm zeigt, wie sich die Einkommen in der Befragung verteilen.',
		correct: 'deskriptiv',
		why: 'Eine Grafik, die die erhobenen Daten anschaulich darstellt — beschreibend, also deskriptiv.'
	},
	{
		id: 's5',
		text: 'Aus 50 gefangenen Amseln schließen wir auf die mittlere Flügellänge aller Amseln der Region.',
		correct: 'inferentiell',
		why: 'Von einer Stichprobe wird auf die ganze Grundgesamtheit geschlossen — das ist schließende (inferentielle) Statistik.'
	},
	{
		id: 's6',
		text: 'In den Verkaufszahlen fällt ein Muster auf: montags wird mehr gekauft. Woran könnte das liegen?',
		correct: 'explorativ',
		why: 'Ein im Datensatz entdecktes Muster führt zu einer neuen Frage, die man später prüfen müsste — explorativ.'
	},
	{
		id: 's7',
		text: '63 % der Befragten haben mit "Ja" geantwortet.',
		correct: 'deskriptiv',
		why: 'Ein Anteil, der die vorliegenden Antworten zusammenfasst — rein beschreibend.'
	},
	{
		id: 's8',
		text: 'Wir schätzen, dass der neue Dünger den Ertrag im Mittel um etwa 12 % erhöht.',
		correct: 'inferentiell',
		why: 'Aus den Versuchsdaten wird ein Effekt für die Grundgesamtheit geschätzt — schließende Statistik.'
	}
];
