<script lang="ts">
	import {
		isCorrect,
		computeScore,
		scoreMessage,
		type Question,
		type Answer
	} from './selbsttest-logic';
	import Button from './Button.svelte';

	type Props = {
		/** Die Fragen des Selbsttests. */
		questions: Question[];
		/** Optionaler Titel über dem Test. */
		title?: string;
		/**
		 * Wird einmal aufgerufen, sobald alle Fragen beantwortet wurden.
		 * Nützlich, um eine Lektion als abgeschlossen zu markieren.
		 */
		onComplete?: () => void;
	};

	let { questions, title = 'Selbsttest', onComplete }: Props = $props();

	// Abgegebene Antworten je Fragen-id.
	let answers = $state<Record<string, Answer | undefined>>({});

	// Stellt sicher, dass onComplete nur ein einziges Mal feuert.
	let completedFired = $state(false);

	function answered(q: Question): boolean {
		return answers[q.id] !== undefined;
	}

	function choose(q: Question, value: Answer) {
		if (answered(q)) return; // Antwort steht fest, sobald gewählt.
		answers = { ...answers, [q.id]: value };
	}

	const allAnswered = $derived(questions.every(answered));
	const score = $derived(computeScore(questions, answers));

	$effect(() => {
		if (allAnswered && questions.length > 0 && !completedFired) {
			completedFired = true;
			onComplete?.();
		}
	});

	function reset() {
		answers = {};
		completedFired = false;
	}

	function optionState(q: Question, value: Answer): 'correct' | 'wrong' | 'idle' {
		if (!answered(q)) return 'idle';
		const picked = answers[q.id] === value;
		const right = isCorrect(q, value);
		if (right) return 'correct'; // richtige Lösung immer markieren
		if (picked) return 'wrong'; // falsch gewählte Option
		return 'idle';
	}

	const stateClasses: Record<'correct' | 'wrong' | 'idle', string> = {
		correct: 'border-sage-300 bg-sage-100 text-sage-500',
		wrong: 'border-coral-300 bg-coral-50 text-coral-700',
		idle: 'border-ink/10 bg-paper-raised hover:border-coral-200 hover:bg-coral-50 text-ink'
	};
</script>

<section
	class="border-ink/10 bg-paper-raised shadow-soft my-6 rounded-2xl border p-6"
	aria-label={title}
>
	<h3 class="text-ink mb-1 text-xl">{title}</h3>
	<p class="text-ink-faint mb-5 text-sm">
		Beantworte die Fragen. Du bekommst sofort eine Rückmeldung.
	</p>

	<ol class="space-y-6">
		{#each questions as q, i (q.id)}
			{@const done = answered(q)}
			{@const right = done && isCorrect(q, answers[q.id] as Answer)}
			<li>
				<p class="text-ink mb-3 font-semibold">
					<span class="text-ink-faint">{i + 1}.</span>
					{q.prompt}
				</p>

				<div class="space-y-2">
					{#if q.kind === 'mc'}
						{#each q.options as opt, oi (oi)}
							{@const st = optionState(q, oi)}
							<button
								type="button"
								class="block w-full rounded-xl border px-4 py-2.5 text-left transition-colors {stateClasses[
									st
								]}"
								disabled={done}
								onclick={() => choose(q, oi)}
							>
								{opt}
							</button>
						{/each}
					{:else}
						<div class="flex gap-2">
							{#each [{ v: true, l: 'Wahr' }, { v: false, l: 'Falsch' }] as choice (choice.l)}
								{@const st = optionState(q, choice.v)}
								<button
									type="button"
									class="flex-1 rounded-xl border px-4 py-2.5 font-medium transition-colors {stateClasses[
										st
									]}"
									disabled={done}
									onclick={() => choose(q, choice.v)}
								>
									{choice.l}
								</button>
							{/each}
						</div>
					{/if}
				</div>

				{#if done}
					<div
						class="mt-3 rounded-xl border px-4 py-3 text-sm leading-relaxed {right
							? 'border-sage-300 bg-sage-100'
							: 'border-coral-200 bg-coral-50'}"
						role="status"
					>
						<span class="font-semibold {right ? 'text-sage-500' : 'text-coral-700'}">
							{right ? 'Richtig.' : 'Noch nicht ganz.'}
						</span>
						<span class="text-ink-soft">{q.explanation}</span>
					</div>
				{/if}
			</li>
		{/each}
	</ol>

	{#if allAnswered && questions.length > 0}
		<div class="border-ink/10 mt-6 flex items-center justify-between gap-4 border-t pt-5">
			<div>
				<p class="text-ink font-semibold">
					{score.correct} von {score.total} richtig
				</p>
				<p class="text-ink-soft text-sm">{scoreMessage(score)}</p>
			</div>
			<Button variant="subtle" size="sm" onclick={reset}>Nochmal</Button>
		</div>
	{/if}
</section>
