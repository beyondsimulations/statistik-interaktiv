import { describe, it, expect } from 'vitest';
import { ProgressStore, STORAGE_KEY, type StorageLike } from './progress.svelte';
import { totalLessons } from '$lib/lessons';

/**
 * A fake, in-memory storage standing in for localStorage. Lets us assert
 * persistence without touching a real browser / jsdom localStorage.
 */
function createFakeStorage(initial: Record<string, string> = {}): StorageLike & {
	dump: () => Record<string, string>;
} {
	const data = new Map<string, string>(Object.entries(initial));
	return {
		getItem: (key) => (data.has(key) ? data.get(key)! : null),
		setItem: (key, value) => {
			data.set(key, value);
		},
		dump: () => Object.fromEntries(data)
	};
}

describe('ProgressStore', () => {
	it('starts empty with no stored data', () => {
		const store = new ProgressStore(createFakeStorage());
		expect(store.completedCount).toBe(0);
		expect(store.isComplete('was-ist-statistik')).toBe(false);
		expect(store.total).toBe(totalLessons);
	});

	it('marks a lesson complete and reports it', () => {
		const store = new ProgressStore(createFakeStorage());
		store.markComplete('verteilungen');
		expect(store.isComplete('verteilungen')).toBe(true);
		expect(store.completedCount).toBe(1);
	});

	it('markComplete is idempotent', () => {
		const store = new ProgressStore(createFakeStorage());
		store.markComplete('anova');
		store.markComplete('anova');
		expect(store.completedCount).toBe(1);
	});

	it('persists completions to the injected storage', () => {
		const fake = createFakeStorage();
		const store = new ProgressStore(fake);
		store.markComplete('regression');
		store.markComplete('t-tests');

		const stored = fake.dump()[STORAGE_KEY];
		expect(stored).toBeDefined();
		expect(JSON.parse(stored)).toEqual(expect.arrayContaining(['regression', 't-tests']));
	});

	it('rehydrates from storage across "reloads" (new instance, same storage)', () => {
		const fake = createFakeStorage();
		const first = new ProgressStore(fake);
		first.markComplete('hypothesentest');
		first.markComplete('korrelation');

		// Simulate a page reload: a brand-new store reading the same storage.
		const second = new ProgressStore(fake);
		expect(second.isComplete('hypothesentest')).toBe(true);
		expect(second.isComplete('korrelation')).toBe(true);
		expect(second.completedCount).toBe(2);
	});

	it('can mark a lesson incomplete again', () => {
		const fake = createFakeStorage();
		const store = new ProgressStore(fake);
		store.markComplete('power');
		store.markIncomplete('power');
		expect(store.isComplete('power')).toBe(false);
		expect(store.completedCount).toBe(0);

		// Persisted state reflects the removal.
		const reloaded = new ProgressStore(fake);
		expect(reloaded.isComplete('power')).toBe(false);
	});

	it('toggles completion state', () => {
		const store = new ProgressStore(createFakeStorage());
		store.toggle('designtypen');
		expect(store.isComplete('designtypen')).toBe(true);
		store.toggle('designtypen');
		expect(store.isComplete('designtypen')).toBe(false);
	});

	it('ignores malformed stored data and starts empty', () => {
		const fake = createFakeStorage({ [STORAGE_KEY]: 'not-json{' });
		const store = new ProgressStore(fake);
		expect(store.completedCount).toBe(0);
	});

	it('works without any storage (SSR / no-window guard)', () => {
		const store = new ProgressStore(null);
		store.markComplete('welcher-test');
		expect(store.isComplete('welcher-test')).toBe(true);
		expect(store.completedCount).toBe(1);
	});
});
