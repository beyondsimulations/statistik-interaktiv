<script lang="ts">
	import '../app.css';
	// KaTeX styles for rendered formulas.
	import 'katex/dist/katex.min.css';
	import { base } from '$app/paths';

	let { children } = $props();
</script>

<div class="page-shell">
	{@render children()}

	<!-- Site-wide footer: keeps the Impressum reachable from every page
	     (German Impressumspflicht) and carries the course attribution. -->
<footer class="text-ink-faint mt-16 border-t border-ink/10 px-6 py-8 text-center text-sm">
	<p class="mx-auto max-w-xl">
		Angelehnt an den
		<a
			class="hover:text-coral-600 underline underline-offset-2"
			href="https://saskiaotto.github.io/uham-bio-data-science-2/"
			target="_blank"
			rel="noopener noreferrer">Kurs „Data Science 2“ von Dr. Saskia Otto</a
		>
		·
		<a
			class="hover:text-coral-600 underline underline-offset-2"
			href="https://creativecommons.org/licenses/by-sa/4.0/"
			target="_blank"
			rel="noopener noreferrer">CC&nbsp;BY-SA&nbsp;4.0</a
		>
	</p>
	<nav class="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1" aria-label="Weitere Seiten">
		<a class="hover:text-coral-600 underline underline-offset-2" href="{base}/ueber">Über</a>
		<a class="hover:text-coral-600 underline underline-offset-2" href="{base}/impressum">Impressum</a>
		<a class="hover:text-coral-600 underline underline-offset-2" href="{base}/datenschutz"
			>Datenschutz</a
		>
	</nav>
</footer>
</div>

<style>
	/* Reserve a fixed right region for the Oshu chat sidebar on wide screens so
	   the panel never covers the page. The content (centered via mx-auto inside)
	   then sits in the space that remains to the left. Tune --oshu-space to the
	   Oshu sidebar width; it only applies from 1280px up (below that the chat
	   should overlay / go full-width). */
	.page-shell {
		--oshu-space: 24rem; /* 384px reserved on the right */
	}
	@media (min-width: 1280px) {
		.page-shell {
			padding-right: var(--oshu-space);
		}
	}
</style>
