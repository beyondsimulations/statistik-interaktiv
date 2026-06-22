import type { Handle } from '@sveltejs/kit';

// Routes whose content is English; everything else is German.
// Sets the <html lang> attribute (via the %lang% placeholder in app.html) so the
// English legal pages aren't announced as German by screen readers. endsWith()
// keeps it correct regardless of the GitHub Pages base-path prefix.
const ENGLISH_ROUTES = ['/impressum', '/datenschutz'];

export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.replace(/\/$/, '');
	const lang = ENGLISH_ROUTES.some((r) => path.endsWith(r)) ? 'en' : 'de';
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
