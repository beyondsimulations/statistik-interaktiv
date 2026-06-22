import { describe, it, expect } from 'vitest';
import {
	isCorrect,
	computeScore,
	scoreMessage,
	type Question
} from './selbsttest-logic';

const mc: Question = {
	id: 'q1',
	prompt: 'Was ist eine Stichprobe?',
	kind: 'mc',
	options: ['Alle Fälle', 'Die gemessene Teilmenge', 'Ein Mittelwert'],
	correct: 1,
	explanation: 'Die Stichprobe ist die tatsächlich gemessene Teilmenge.'
};

const tf: Question = {
	id: 'q2',
	prompt: 'Der p-Wert ist die Wahrscheinlichkeit, dass die Nullhypothese stimmt.',
	kind: 'tf',
	correct: false,
	explanation: 'Nein — der p-Wert bedingt auf die Nullhypothese, er misst sie nicht.'
};

describe('isCorrect', () => {
	it('akzeptiert den richtigen Multiple-Choice-Index', () => {
		expect(isCorrect(mc, 1)).toBe(true);
	});

	it('lehnt einen falschen Multiple-Choice-Index ab', () => {
		expect(isCorrect(mc, 0)).toBe(false);
		expect(isCorrect(mc, 2)).toBe(false);
	});

	it('akzeptiert die richtige Wahr/Falsch-Antwort', () => {
		expect(isCorrect(tf, false)).toBe(true);
	});

	it('lehnt die falsche Wahr/Falsch-Antwort ab', () => {
		expect(isCorrect(tf, true)).toBe(false);
	});

	it('lehnt typfremde Antworten ab', () => {
		// Boolean auf MC-Frage, Zahl auf TF-Frage.
		expect(isCorrect(mc, true)).toBe(false);
		expect(isCorrect(tf, 1)).toBe(false);
	});
});

describe('computeScore', () => {
	const questions = [mc, tf];

	it('zählt alle richtigen Antworten', () => {
		const r = computeScore(questions, { q1: 1, q2: false });
		expect(r).toEqual({ correct: 2, total: 2, ratio: 1 });
	});

	it('behandelt fehlende Antworten als falsch', () => {
		const r = computeScore(questions, { q1: 1 });
		expect(r.correct).toBe(1);
		expect(r.total).toBe(2);
		expect(r.ratio).toBe(0.5);
	});

	it('behandelt undefined Antworten als falsch', () => {
		const r = computeScore(questions, { q1: undefined, q2: undefined });
		expect(r).toEqual({ correct: 0, total: 2, ratio: 0 });
	});

	it('gibt ratio 0 bei leerer Fragenliste zurück (keine Division durch 0)', () => {
		const r = computeScore([], {});
		expect(r).toEqual({ correct: 0, total: 0, ratio: 0 });
	});
});

describe('scoreMessage', () => {
	it('lobt das perfekte Ergebnis', () => {
		expect(scoreMessage({ correct: 2, total: 2, ratio: 1 })).toMatch(/sitzt/);
	});

	it('ist ermutigend bei mittlerem Ergebnis', () => {
		expect(scoreMessage({ correct: 1, total: 2, ratio: 0.5 })).toBeTruthy();
	});

	it('ist ermutigend bei schwachem Ergebnis', () => {
		const msg = scoreMessage({ correct: 0, total: 3, ratio: 0 });
		expect(msg).toMatch(/Anfang/);
	});

	it('meldet einen leeren Test sachlich', () => {
		expect(scoreMessage({ correct: 0, total: 0, ratio: 0 })).toMatch(/Keine Fragen/);
	});
});
