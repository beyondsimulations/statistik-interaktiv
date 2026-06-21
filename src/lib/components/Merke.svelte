<script lang="ts">
	import type { Snippet } from 'svelte';
	import Callout from './Callout.svelte';

	let { title, children }: { title?: string; children: Snippet } = $props();
</script>

<Callout variant="merke" {title}>
	{@render children()}
</Callout>
