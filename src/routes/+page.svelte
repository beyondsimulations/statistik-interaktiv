<script lang="ts">
	import Katex from '$lib/Katex.svelte';
	import Intro from '$lib/content/intro.svx';
</script>

<svelte:head>
	<title>DS2 Lernwebsite</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-8">
	<h1 class="text-4xl font-bold tracking-tight text-slate-900">DS2 Lernwebsite</h1>

	<section class="prose mt-8">
		<Intro />
	</section>

	<section class="mt-8">
		<h2 class="text-2xl font-semibold text-slate-800">Standardfehler</h2>
		<p class="mt-2 text-slate-700">
			Der Standardfehler des Mittelwerts ist
			<Katex math={String.raw`SE = \dfrac{\sigma}{\sqrt{n}}`} />.
		</p>

		<div class="mt-4">
			<Katex math={String.raw`SE = \dfrac{\sigma}{\sqrt{n}}`} displayMode />
		</div>
	</section>
</main>
