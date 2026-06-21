let counter = 0;
/** Stable, SSR-safe unique id (deterministic counter — matches across prerender + hydration). */
export function useId(prefix = 'id'): string {
	return `${prefix}-${counter++}`;
}
