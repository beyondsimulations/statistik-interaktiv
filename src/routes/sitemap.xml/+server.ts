import { base } from '$app/paths';
import { ORIGIN } from '$lib/seo';
import { orderedLessons } from '$lib/lessons';
import type { RequestHandler } from './$types';

// Prerendered XML sitemap. adapter-static writes it to build/sitemap.xml.
export const prerender = true;

// Static, indexable routes. The internal /kit component gallery is intentionally
// left out (and noindex'd).
const STATIC_PATHS = ['', '/ueber', '/impressum', '/datenschutz'];

export const GET: RequestHandler = () => {
	const lessonPaths = orderedLessons
		.filter((lesson) => lesson.status === 'live')
		.map((lesson) => `/lektion/${lesson.slug}`);

	const urls = [...STATIC_PATHS, ...lessonPaths].map((path) => `${ORIGIN}${base}${path || '/'}`);

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((loc) => `\t<url>\n\t\t<loc>${loc}</loc>\n\t</url>`).join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: { 'Content-Type': 'application/xml' }
	});
};
