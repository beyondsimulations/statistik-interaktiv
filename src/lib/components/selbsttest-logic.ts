/**
 * Reine Logik für den Selbsttest (Selbstkontroll-Quiz).
 *
 * Bewusst DOM-frei gehalten, damit das Prüfen von Antworten und das Berechnen
 * des Ergebnisses unabhängig vom Browser getestet werden kann.
 */

/** Eine einzelne Frage im Selbsttest. */
export type Question =
	| {
			id: string;
			prompt: string;
			kind: 'mc';
			/** Antwortmöglichkeiten (Multiple Choice). */
			options: string[];
			/** Index der richtigen Option in `options`. */
			correct: number;
			/** Erklärung, die nach dem Antworten gezeigt wird. */
			explanation: string;
	  }
	| {
			id: string;
			prompt: string;
			kind: 'tf';
			/** `true` = Aussage stimmt, `false` = Aussage stimmt nicht. */
			correct: boolean;
			explanation: string;
	  };

/** Eine vom Nutzer abgegebene Antwort: Options-Index (mc) oder Boolean (tf). */
export type Answer = number | boolean;

/**
 * Prüft, ob die abgegebene Antwort zur Frage passt.
 *
 * Die Antwort muss typmäßig zur Fragenart passen (Zahl bei `mc`, Boolean bei
 * `tf`); andernfalls gilt sie als falsch.
 */
export function isCorrect(question: Question, answer: Answer): boolean {
	if (question.kind === 'mc') {
		return typeof answer === 'number' && answer === question.correct;
	}
	return typeof answer === 'boolean' && answer === question.correct;
}

export type ScoreResult = {
	/** Anzahl korrekt beantworteter Fragen. */
	correct: number;
	/** Gesamtzahl der Fragen. */
	total: number;
	/** Anteil korrekter Antworten zwischen 0 und 1 (0, falls keine Fragen). */
	ratio: number;
};

/**
 * Berechnet das Gesamtergebnis. `answers` ist nach Fragen-`id` indiziert;
 * fehlende oder `undefined`-Antworten zählen als falsch.
 */
export function computeScore(
	questions: Question[],
	answers: Record<string, Answer | undefined>
): ScoreResult {
	const total = questions.length;
	let correct = 0;
	for (const q of questions) {
		const a = answers[q.id];
		if (a !== undefined && isCorrect(q, a)) correct += 1;
	}
	return { correct, total, ratio: total === 0 ? 0 : correct / total };
}

/**
 * Eine kurze, ermutigende Rückmeldung zum Gesamtergebnis (sachliches "Du").
 */
export function scoreMessage(result: ScoreResult): string {
	const { ratio, total } = result;
	if (total === 0) return 'Keine Fragen vorhanden.';
	if (ratio === 1) return 'Alles richtig — das sitzt!';
	if (ratio >= 0.5) return 'Gut gemacht. Schau dir die offenen Punkte noch einmal an.';
	return 'Ein guter Anfang. Geh die Erklärungen in Ruhe durch — du kommst da rein.';
}
