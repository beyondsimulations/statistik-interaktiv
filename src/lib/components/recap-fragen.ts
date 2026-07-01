import { orderedLessons } from '$lib/lessons';
import type { Question } from './selbsttest-logic';

/** Recap-Fragen, keyed nach dem slug der Lektion, DIE zusammengefasst wird.
 *  Wird in Task 4 mit echten Fragen für alle Lektionen gefüllt. */
export const recapQuestions: Record<string, Question[]> = {
	// Lektion 5 — Schätzen & Konfidenzintervalle. Diese Fragen sind hier bereits
	// echt hinterlegt, damit der Resolver-Test grün wird und als Vorlage für
	// Task 4 dient.
	konfidenzintervalle: [
		{
			id: 'ki-recap-deutung',
			kind: 'tf',
			prompt:
				'Ein 95%-Konfidenzintervall bedeutet: Der wahre Parameter μ liegt mit 95% Wahrscheinlichkeit in genau diesem berechneten Intervall.',
			correct: false,
			explanation:
				'Häufige Fehldeutung. μ ist fest, das Intervall ist zufällig: Bei wiederholten Stichproben überdecken 95% der so berechneten Intervalle das wahre μ. Für ein konkretes Intervall gilt keine 95%-Wahrscheinlichkeit.'
		},
		{
			id: 'ki-recap-breite',
			kind: 'mc',
			prompt:
				'Wie verändert sich ein Konfidenzintervall für den Mittelwert, wenn der Stichprobenumfang n (bei gleichem Konfidenzniveau) größer wird?',
			options: [
				'Es wird schmaler.',
				'Es wird breiter.',
				'Die Breite bleibt gleich.',
				'Es verschiebt sich systematisch nach rechts.'
			],
			correct: 0,
			explanation:
				'Der Standardfehler sinkt mit wachsendem n (Faktor 1/√n), deshalb wird das Intervall schmaler — die Schätzung wird präziser.'
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
