import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// mdsvex both reads the layout file from disk (fs, cwd-relative) AND injects it
// as a literal `import` into each `.svx` (bundler-resolved, relative to that file).
// An absolute path is the only value that satisfies both contexts.
const contentLayout = fileURLToPath(
	new URL('./src/lib/components/ContentLayout.svelte', import.meta.url)
);

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.svx', '.md'],
	// Long-form content pages (about/legal) are authored as `.svx` and wrapped in
	// a shared, warmly-styled article layout that also renders the frontmatter.
	layout: {
		_: contentLayout
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations#preprocessors
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)],

	kit: {
		// adapter-static prerenders the whole app to static files (GitHub Pages ready)
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		// GitHub Pages serves a project site under /<repo>/, so asset + link URLs
		// need that prefix. CI builds with BASE_PATH=/statistik-interaktiv; local dev and
		// the test build use '' (root). All internal links go through `base`.
		paths: {
			base: process.env.BASE_PATH ?? ''
		}
	}
};

export default config;
