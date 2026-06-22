<script lang="ts">
	// Reusable <head> block: title, description, canonical, Open Graph and Twitter
	// cards. Drop one <Seo …/> per page; it derives the canonical/OG URLs from the
	// current path so individual pages only pass title + description.
	import { page } from '$app/state';
	import { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, OG_IMAGE, OG_IMAGE_ALT } from '$lib/seo';

	type Props = {
		/** Page title, without the brand suffix (added automatically). */
		title?: string;
		/** Meta + OG description. Falls back to the site-wide default. */
		description?: string;
		/** 'website' for landing/overview pages, 'article' for lessons & legal text. */
		type?: 'website' | 'article';
		/** Don't append the `· <brand>` suffix (for the homepage, which leads with it). */
		bareTitle?: boolean;
		/** Keep this page out of search indexes (e.g. the internal component gallery). */
		noindex?: boolean;
		/** Page language ('de' default) — drives og:locale. English legal pages pass 'en'. */
		lang?: string;
	};
	let {
		title,
		description = DEFAULT_DESCRIPTION,
		type = 'website',
		bareTitle = false,
		noindex = false,
		lang = 'de'
	}: Props = $props();

	const ogLocale = $derived(lang === 'en' ? 'en_US' : 'de_DE');

	const fullTitle = $derived(
		!title ? SITE_NAME : bareTitle ? title : `${title} · ${SITE_NAME}`
	);

	// Build absolute URLs from SITE_URL + the route id. `page.route.id` is the
	// base-free route path (e.g. '/lektion/power') — this site has no dynamic
	// params, so it equals the served path. We avoid `$app/paths`' `base` here on
	// purpose: it is relative ('.'/'..') during prerender and would corrupt the URL.
	const routePath = $derived(page.route.id && page.route.id !== '/' ? page.route.id : '');
	const canonical = $derived(routePath ? `${SITE_URL}${routePath}` : `${SITE_URL}/`);
	const ogImage = $derived(`${SITE_URL}${OG_IMAGE}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<!-- Open Graph -->
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content={ogLocale} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={OG_IMAGE_ALT} />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
