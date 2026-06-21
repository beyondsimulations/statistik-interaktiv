// Progress store — tracks which lessons the learner has marked as complete.
//
// Rune-based (`$state`/`$derived`) so any component that reads it stays
// reactive. State is keyed by lesson slug and persisted to localStorage so it
// survives reloads.
//
// Storage is *injectable*: the constructor takes a storage-like object so unit
// tests can pass a fake (in-memory) implementation instead of a real
// localStorage, and so we can safely no-op during SSR / when there is no
// window.

import { totalLessons } from '$lib/lessons';

/** Stable localStorage key. Bump only if the stored shape changes. */
export const STORAGE_KEY = 'ds2:progress:v1';

/** Minimal subset of the Web Storage API we depend on. */
export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

/**
 * Returns the browser's localStorage when available, otherwise `null`.
 * Guards against SSR (no `window`) and environments where storage access throws
 * (e.g. privacy mode).
 */
function defaultStorage(): StorageLike | null {
	try {
		if (typeof localStorage !== 'undefined') return localStorage;
	} catch {
		// Accessing localStorage can throw (sandboxed iframes, blocked cookies).
	}
	return null;
}

export class ProgressStore {
	/** Set of completed slugs, kept reactive via $state. */
	#completed = $state(new Set<string>());
	#storage: StorageLike | null;

	/**
	 * @param storage Storage backend. Defaults to localStorage in the browser,
	 *   or `null` (in-memory only) during SSR / tests that pass nothing.
	 */
	constructor(storage: StorageLike | null = defaultStorage()) {
		this.#storage = storage;
		this.#load();
	}

	/** Hydrate the in-memory set from storage (ignores malformed data). */
	#load() {
		if (!this.#storage) return;
		try {
			const raw = this.#storage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed: unknown = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				this.#completed = new Set(parsed.filter((s): s is string => typeof s === 'string'));
			}
		} catch {
			// Corrupt JSON — start fresh rather than crashing.
		}
	}

	/** Persist the current set to storage (no-op without a backend). */
	#persist() {
		if (!this.#storage) return;
		try {
			this.#storage.setItem(STORAGE_KEY, JSON.stringify([...this.#completed]));
		} catch {
			// Quota exceeded or storage blocked — keep working in memory.
		}
	}

	/** Mark a lesson complete (idempotent) and persist. */
	markComplete(slug: string) {
		if (this.#completed.has(slug)) return;
		// Reassign so $state notices the change (Set mutation also works, but a
		// fresh Set keeps intent explicit and avoids proxy edge cases).
		this.#completed = new Set(this.#completed).add(slug);
		this.#persist();
	}

	/** Remove a lesson's completed flag and persist. */
	markIncomplete(slug: string) {
		if (!this.#completed.has(slug)) return;
		const next = new Set(this.#completed);
		next.delete(slug);
		this.#completed = next;
		this.#persist();
	}

	/** Toggle a lesson's completed flag. */
	toggle(slug: string) {
		if (this.#completed.has(slug)) this.markIncomplete(slug);
		else this.markComplete(slug);
	}

	/** Whether a given lesson is marked complete. */
	isComplete(slug: string): boolean {
		return this.#completed.has(slug);
	}

	/** Number of completed lessons (reactive derived value). */
	completedCount = $derived(this.#completed.size);

	/** Total number of lessons in the curriculum. */
	get total(): number {
		return totalLessons;
	}
}

/** App-wide singleton used by the navigation components. */
export const progress = new ProgressStore();
