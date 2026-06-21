<script lang="ts">
	import '../app.css';
	// KaTeX styles for rendered formulas.
	import 'katex/dist/katex.min.css';

	let { children } = $props();
</script>

{@render children()}
