// Site-wide SEO constants. Single source of truth for the brand name, the social
// share image and the production origin used to build absolute canonical/OG URLs.
//
// GitHub Pages serves this project under `/statistik-interaktiv/`, so absolute
// URLs are ORIGIN + base + path. `base` is only known at runtime (it's '' in dev
// and the test build), so it is read from `$app/paths` where the URLs are built —
// this module only holds the scheme + host.

/** Production scheme + host (no path, no trailing slash). */
export const ORIGIN = 'https://beyondsimulations.github.io';

/**
 * Canonical production base URL, including the fixed GitHub-Pages project path
 * (`BASE_PATH=/statistik-interaktiv` in the deploy workflow). Canonical and OG
 * URLs are built from this constant — NOT from `$app/paths`' `base`, which
 * resolves to a relative `.`/`..` during prerender (paths.relative) and would
 * mangle absolute URLs. Canonical URLs always point at production, even in a
 * local build, which is the desired behaviour.
 */
export const SITE_URL = `${ORIGIN}/statistik-interaktiv`;

/** Brand name — used as the og:site_name and the `· <name>` title suffix. */
export const SITE_NAME = 'Statistik interaktiv';

/** Fallback meta description for pages that don't supply their own. */
export const DEFAULT_DESCRIPTION =
	'Statistik für Data Science 2 — Intuition zuerst, Schritt für Schritt, ohne Panik. 14 interaktive Lektionen mit biologischen Beispielen.';

/** Social share image, relative to the site root (1200×630). */
export const OG_IMAGE = '/og-image.png';

/** Alt text describing the share image, for accessibility. */
export const OG_IMAGE_ALT = 'Statistik interaktiv — Statistik, die Klick macht.';
