// Ambient type declarations for mdsvex-rendered markdown files (.svx / .md)
// imported as Svelte components. Kept in a dedicated, import-free file so the
// `declare module` wildcards stay global.
declare module '*.svx' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
	export const metadata: Record<string, unknown>;
}

declare module '*.md' {
	import type { Component } from 'svelte';
	const component: Component;
	export default component;
	export const metadata: Record<string, unknown>;
}
