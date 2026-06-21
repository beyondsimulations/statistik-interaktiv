<script lang="ts">
	import katex from 'katex';

	let { math, displayMode = false }: { math: string; displayMode?: boolean } = $props();

	const html = $derived(
		katex.renderToString(math, {
			displayMode,
			throwOnError: false
		})
	);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html html}
