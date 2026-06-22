import { describe, it, expect } from 'vitest';
import {
	isAssignmentCorrect,
	scoreAssignments,
	AUSSAGEN,
	BUCKETS,
	type Aussage,
	type Bucket
} from './sortier-spiel-logic';

const beispiel: Aussage = {
	id: 'x1',
	text: 'Der Mittelwert beträgt 178 cm.',
	correct: 'deskriptiv',
	why: 'Beschreibt vorhandene Daten.'
};

describe('isAssignmentCorrect', () => {
	it('akzeptiert das richtige Teilgebiet', () => {
		expect(isAssignmentCorrect(beispiel, 'deskriptiv')).toBe(true);
	});

	it('lehnt ein falsches Teilgebiet ab', () => {
		expect(isAssignmentCorrect(beispiel, 'inferentiell')).toBe(false);
		expect(isAssignmentCorrect(beispiel, 'explorativ')).toBe(false);
	});
});

describe('scoreAssignments', () => {
	it('zählt nur korrekte Zuordnungen', () => {
		const assignments: Record<string, Bucket | undefined> = {
			s1: 'deskriptiv', // korrekt
			s2: 'deskriptiv', // falsch (richtig wäre inferentiell)
			s3: 'explorativ' // korrekt
		};
		const { correct, total } = scoreAssignments(AUSSAGEN, assignments);
		expect(correct).toBe(2);
		expect(total).toBe(AUSSAGEN.length);
	});

	it('zählt fehlende Zuordnungen nicht als korrekt', () => {
		expect(scoreAssignments(AUSSAGEN, {}).correct).toBe(0);
	});

	it('erreicht die volle Punktzahl, wenn alles korrekt zugeordnet ist', () => {
		const all: Record<string, Bucket> = {};
		for (const a of AUSSAGEN) all[a.id] = a.correct;
		const { correct, total } = scoreAssignments(AUSSAGEN, all);
		expect(correct).toBe(total);
	});
});

describe('AUSSAGEN-Datensatz', () => {
	it('hat acht Aussagen mit eindeutigen IDs', () => {
		expect(AUSSAGEN).toHaveLength(8);
		const ids = new Set(AUSSAGEN.map((a) => a.id));
		expect(ids.size).toBe(8);
	});

	it('verwendet nur gültige Buckets', () => {
		for (const a of AUSSAGEN) {
			expect(BUCKETS).toContain(a.correct);
		}
	});

	it('deckt alle drei Teilgebiete ab', () => {
		const used = new Set(AUSSAGEN.map((a) => a.correct));
		expect(used).toEqual(new Set(BUCKETS));
	});
});
