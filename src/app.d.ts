// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

// Make @testing-library/jest-dom matchers (e.g. toBeInTheDocument) known to svelte-check.
/// <reference types="@testing-library/jest-dom" />

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
