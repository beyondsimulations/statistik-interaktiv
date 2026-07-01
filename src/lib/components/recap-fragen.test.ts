import { describe, it, expect } from 'vitest';
import { recapForLesson } from './recap-fragen';

describe('recapForLesson', () => {
	it('gibt für die erste Lektion keine Recap-Fragen zurück', () => {
		expect(recapForLesson('was-ist-statistik')).toEqual([]);
	});

	it('gibt für eine mittlere Lektion die Fragen der Vorlektion zurück', () => {
		// hypothesentest (order 6) → Recap von konfidenzintervalle (order 5)
		const qs = recapForLesson('hypothesentest');
		expect(qs.length).toBeGreaterThan(0);
	});

	it('gibt für einen unbekannten slug ein leeres Array zurück', () => {
		expect(recapForLesson('gibt-es-nicht')).toEqual([]);
	});
});
