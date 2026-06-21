import { describe, it, expect } from 'vitest';
import {
	isScenarioCorrect,
	findOption,
	scoreScenarios,
	SCENARIOS,
	ENTSCHEIDUNGSBAUM_NODES,
	ENTSCHEIDUNGSBAUM_ROOT,
	type Scenario
} from './welcher-test-logic';

const beispiel: Scenario = {
	id: 'x1',
	prompt: 'Drei Gruppen vergleichen.',
	options: [
		{ id: 'anova', label: 'ANOVA', correct: true, explanation: 'Richtig.' },
		{ id: 'three-t', label: 'Drei t-Tests', correct: false, trap: true, explanation: 'Falle.' }
	]
};

describe('isScenarioCorrect', () => {
	it('akzeptiert die korrekte Option', () => {
		expect(isScenarioCorrect(beispiel, 'anova')).toBe(true);
	});

	it('lehnt eine falsche Option ab', () => {
		expect(isScenarioCorrect(beispiel, 'three-t')).toBe(false);
	});

	it('lehnt eine unbekannte Option ab', () => {
		expect(isScenarioCorrect(beispiel, 'gibts-nicht')).toBe(false);
	});
});

describe('findOption', () => {
	it('findet eine vorhandene Option', () => {
		expect(findOption(beispiel, 'three-t')?.trap).toBe(true);
	});

	it('gibt undefined für unbekannte IDs', () => {
		expect(findOption(beispiel, 'xyz')).toBeUndefined();
	});
});

describe('scoreScenarios', () => {
	it('zählt nur korrekte Antworten', () => {
		const answers = {
			'sz-chi': 'chi', // korrekt
			'sz-anova': 'three-t', // Falle, falsch
			'sz-paired': 'paired' // korrekt
		};
		const { correct, total } = scoreScenarios(SCENARIOS, answers);
		expect(correct).toBe(2);
		expect(total).toBe(SCENARIOS.length);
	});

	it('zählt fehlende Antworten nicht als korrekt', () => {
		expect(scoreScenarios(SCENARIOS, {}).correct).toBe(0);
	});

	it('erreicht die volle Punktzahl bei lauter richtigen Antworten', () => {
		const all: Record<string, string> = {};
		for (const s of SCENARIOS) {
			const right = s.options.find((o) => o.correct);
			if (right) all[s.id] = right.id;
		}
		const { correct, total } = scoreScenarios(SCENARIOS, all);
		expect(correct).toBe(total);
	});
});

describe('SCENARIOS-Datensatz', () => {
	it('hat sechs Szenarien mit eindeutigen IDs', () => {
		expect(SCENARIOS).toHaveLength(6);
		const ids = new Set(SCENARIOS.map((s) => s.id));
		expect(ids.size).toBe(6);
	});

	it('hat in jedem Szenario genau eine korrekte Option', () => {
		for (const s of SCENARIOS) {
			expect(s.options.filter((o) => o.correct)).toHaveLength(1);
		}
	});

	it('enthält das ANOVA-Szenario mit der "drei t-Tests"-Falle', () => {
		const anova = SCENARIOS.find((s) => s.id === 'sz-anova');
		expect(anova).toBeDefined();
		const trap = anova!.options.find((o) => o.trap);
		expect(trap).toBeDefined();
		expect(trap!.correct).toBe(false);
	});

	it('hat in jedem Szenario eindeutige Options-IDs', () => {
		for (const s of SCENARIOS) {
			const ids = new Set(s.options.map((o) => o.id));
			expect(ids.size).toBe(s.options.length);
		}
	});
});

describe('Entscheidungsbaum-Daten', () => {
	it('hat einen vorhandenen Wurzelknoten', () => {
		expect(ENTSCHEIDUNGSBAUM_NODES[ENTSCHEIDUNGSBAUM_ROOT]).toBeDefined();
	});

	it('verweist nur auf existierende Folgeknoten', () => {
		for (const node of Object.values(ENTSCHEIDUNGSBAUM_NODES)) {
			for (const opt of node.options) {
				if (opt.next) {
					expect(ENTSCHEIDUNGSBAUM_NODES[opt.next]).toBeDefined();
				}
			}
		}
	});

	it('hat in jeder Option entweder einen Folgeknoten oder ein Ergebnis', () => {
		for (const node of Object.values(ENTSCHEIDUNGSBAUM_NODES)) {
			for (const opt of node.options) {
				expect(Boolean(opt.next) || Boolean(opt.result)).toBe(true);
			}
		}
	});

	it('erreicht alle wichtigen Test-Familien als Blatt', () => {
		const tests = new Set<string>();
		for (const node of Object.values(ENTSCHEIDUNGSBAUM_NODES)) {
			for (const opt of node.options) {
				if (opt.result) tests.add(opt.result.test);
			}
		}
		for (const t of [
			'Chi-Quadrat-Anpassungstest',
			'Chi-Quadrat-Unabhängigkeitstest',
			'Fishers exakter Test',
			'Ein-Stichproben-t-Test',
			'Gepaarter t-Test',
			'Student-t-Test (gleiche Varianzen)',
			'Welch-Test (ungleiche Varianzen)',
			'Einfaktorielle ANOVA (danach Tukey-Post-hoc)',
			'Kruskal-Wallis-Test',
			'Lineare Regression'
		]) {
			expect(tests).toContain(t);
		}
	});
});
