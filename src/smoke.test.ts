import { describe, it, expect } from 'vitest';

describe('test harness smoke test', () => {
	it('runs Vitest and basic arithmetic works', () => {
		expect(1 + 1).toBe(2);
	});
});
