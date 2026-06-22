<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import AnnahmenBaum from './AnnahmenBaum.svelte';
	import {
		SCENARIOS,
		isScenarioCorrect,
		findOption,
		scoreScenarios,
		ENTSCHEIDUNGSBAUM_NODES,
		ENTSCHEIDUNGSBAUM_ROOT
	} from './welcher-test-logic';

	// Zwei Modi: der erweiterte Entscheidungsbaum (REUSE AnnahmenBaum) und das
	// Szenario-Quiz ("das Spiel"). Standard ist der Baum.
	let mode = $state<'baum' | 'quiz'>('baum');

	// --- Szenario-Quiz --------------------------------------------------------
	// Antwort pro Szenario-ID; undefined = noch nicht beantwortet.
	let answers = $state<Record<string, string | undefined>>({});

	const score = $derived(scoreScenarios(SCENARIOS, answers));
	const answeredCount = $derived(SCENARIOS.filter((s) => answers[s.id] !== undefined).length);
	const allAnswered = $derived(answeredCount === SCENARIOS.length);

	function answer(scenarioId: string, optionId: string) {
		// Einmal beantwortet bleibt fixiert (Feedback ist sichtbar).
		if (answers[scenarioId] !== undefined) return;
		answers = { ...answers, [scenarioId]: optionId };
	}

	function resetQuiz() {
		answers = {};
	}
</script>

<Widget
	title="„Welcher Test?“ — Entscheidungsbaum & Szenario-Spiel"
	hint="Zwei Modi: Lauf den Entscheidungsbaum durch oder spiel die sechs biologischen Szenarien."
>
	<div class="flex flex-col gap-4">
		<!-- Modus-Umschalter -->
		<div class="bg-paper-sunk/60 inline-flex w-fit gap-1 rounded-xl p-1" role="tablist">
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'baum'}
				class="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors {mode === 'baum'
					? 'bg-paper-raised text-ink shadow-soft'
					: 'text-ink-faint hover:text-ink'}"
				onclick={() => (mode = 'baum')}
			>
				Entscheidungsbaum
			</button>
			<button
				type="button"
				role="tab"
				aria-selected={mode === 'quiz'}
				class="rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors {mode === 'quiz'
					? 'bg-paper-raised text-ink shadow-soft'
					: 'text-ink-faint hover:text-ink'}"
				onclick={() => (mode = 'quiz')}
			>
				Szenario-Spiel
			</button>
		</div>

		{#if mode === 'baum'}
			<!-- Erweiterter Entscheidungsbaum (REUSE AnnahmenBaum mit custom nodes) -->
			<p class="text-ink-soft text-sm leading-relaxed">
				Beantworte Schritt für Schritt: erst der <strong>Datentyp</strong>, dann die
				<strong>Anzahl der Gruppen</strong>, ob <strong>gepaart</strong>, und ob die
				<strong>Annahmen</strong> erfüllt sind. Am Ende leuchtet der passende Test auf — quer durch
				alle Familien (χ², t-Tests, ANOVA, Regression und die nicht-parametrischen Alternativen).
			</p>
			<AnnahmenBaum
				nodes={ENTSCHEIDUNGSBAUM_NODES}
				root={ENTSCHEIDUNGSBAUM_ROOT}
				title="Entscheidungsbaum: Welcher Test passt?"
				hint="Datentyp → Gruppenzahl → gepaart? → Annahmen erfüllt? → passender Test. Jederzeit zurücksetzen."
			/>
		{:else}
			<!-- Szenario-Quiz ("das Spiel") -->
			<div
				class="bg-paper-sunk/60 text-ink-soft flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2 text-sm"
				role="status"
				aria-live="polite"
			>
				<span>{answeredCount} von {SCENARIOS.length} gelöst</span>
				<span class="font-semibold">Richtig: {score.correct} / {SCENARIOS.length}</span>
			</div>

			<ol class="flex list-none flex-col gap-4 p-0">
				{#each SCENARIOS as scenario, idx (scenario.id)}
					{@const chosenId = answers[scenario.id]}
					{@const chosenOpt = chosenId !== undefined ? findOption(scenario, chosenId) : undefined}
					{@const correct = chosenId !== undefined && isScenarioCorrect(scenario, chosenId)}
					<li
						class="rounded-xl border p-4 transition-colors {chosenId !== undefined
							? correct
								? 'border-sage-300 bg-sage-100'
								: 'border-coral-300 bg-coral-50'
							: 'border-ink/10 bg-paper-raised'}"
					>
						<p class="text-ink leading-relaxed">
							<span class="text-ink-faint font-semibold">Szenario {idx + 1}.</span>
							{scenario.prompt}
						</p>

						<div class="mt-3 flex flex-col gap-2">
							{#each scenario.options as opt (opt.id)}
								<button
									type="button"
									class="rounded-xl border px-4 py-2.5 text-left text-sm transition-colors {chosenId ===
									opt.id
										? 'border-ink/30 bg-ink/5 text-ink font-semibold'
										: 'border-ink/10 bg-paper-raised text-ink enabled:hover:border-coral-200 enabled:hover:bg-coral-50'} disabled:opacity-60"
									disabled={chosenId !== undefined}
									aria-pressed={chosenId === opt.id}
									onclick={() => answer(scenario.id, opt.id)}
								>
									{opt.label}
								</button>
							{/each}
						</div>

						{#if chosenOpt}
							<div
								class="mt-3 flex items-start gap-2 text-sm {correct
									? 'text-sage-500'
									: chosenOpt.trap
										? 'text-amber-600'
										: 'text-coral-700'}"
								role="status"
							>
								<span aria-hidden="true">{correct ? '✓' : chosenOpt.trap ? '⚠️' : '✗'}</span>
								<p class="leading-relaxed">{chosenOpt.explanation}</p>
							</div>
						{/if}
					</li>
				{/each}
			</ol>

			{#if allAnswered}
				<div
					class="border-amber-200 bg-amber-50 text-amber-600 rounded-2xl border px-5 py-4"
					role="status"
				>
					<p class="font-semibold">
						Durch — {score.correct} von {SCENARIOS.length} richtig.
					</p>
					<p class="text-ink-soft mt-1 text-sm leading-relaxed">
						{#if score.correct === SCENARIOS.length}
							Alles getroffen — du wählst den Test sicher aus Frage, Design und Daten.
						{:else}
							Schau dir die Erklärungen zu den verfehlten Szenarien noch einmal an und spiel gern
							erneut.
						{/if}
					</p>
				</div>
			{/if}
		{/if}
	</div>

	{#snippet controls()}
		{#if mode === 'quiz'}
			<div class="flex flex-wrap items-center gap-2">
				<Button variant="secondary" size="sm" onclick={resetQuiz}>Noch einmal spielen</Button>
				<span class="text-ink-faint text-sm">
					Tipp: erst <em>Datentyp</em>, dann <em>Gruppen</em>, dann <em>gepaart?</em> — nicht „was wird
					signifikant?“.
				</span>
			</div>
		{/if}
	{/snippet}
</Widget>
