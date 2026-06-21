import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/** @type {import('mdsvex').MdsvexOptions} */
const mdsvexOptions = {
	extensions: ['.svx', '.md']
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
		})
	}
};

export default config;
