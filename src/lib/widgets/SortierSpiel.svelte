<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import {
		AUSSAGEN,
		BUCKETS,
		BUCKET_LABELS,
		isAssignmentCorrect,
		scoreAssignments,
		type Bucket
	} from './sortier-spiel-logic';

	// Zuordnung pro Aussage-ID; undefined = noch nicht zugeordnet.
	let assignments = $state<Record<string, Bucket | undefined>>({});

	const score = $derived(scoreAssignments(AUSSAGEN, assignments));
	const answeredCount = $derived(AUSSAGEN.filter((a) => assignments[a.id] !== undefined).length);
	const allAnswered = $derived(answeredCount === AUSSAGEN.length);

	function assign(id: string, bucket: Bucket) {
		// Bereits beantwortete Aussagen bleiben fixiert (Feedback ist sichtbar).
		if (assignments[id] !== undefined) return;
		assignments = { ...assignments, [id]: bucket };
	}

	function reset() {
		assignments = {};
	}

	const bucketHints: Record<Bucket, string> = {
		deskriptiv: 'beschreibt / fasst zusammen',
		inferentiell: 'schließt auf die Grundgesamtheit',
		explorativ: 'entdeckt neue Hypothesen'
	};
</script>

<Widget
	title="Sortier-Spiel: Welche Statistik ist das?"
	hint="Lies jede Aussage und ordne sie einem der drei Teilgebiete zu. Du bekommst sofort eine Rückmeldung."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Fortschritt / Punktestand -->
		<div
			class="bg-paper-sunk/60 text-ink-soft flex flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2 text-sm"
			role="status"
			aria-live="polite"
		>
			<span>
				{answeredCount} von {AUSSAGEN.length} zugeordnet
			</span>
			<span class="font-semibold">
				Richtig: {score.correct} / {AUSSAGEN.length}
			</span>
		</div>

		<!-- Aussagen-Liste -->
		<ul class="flex list-none flex-col gap-3 p-0">
			{#each AUSSAGEN as aussage (aussage.id)}
				{@const chosen = assignments[aussage.id]}
				{@const correct = chosen !== undefined && isAssignmentCorrect(aussage, chosen)}
				<li
					class="rounded-xl border p-4 transition-colors {chosen !== undefined
						? correct
							? 'border-sage-300 bg-sage-100'
							: 'border-coral-300 bg-coral-50'
						: 'border-ink/10 bg-paper-raised'}"
				>
					<p class="text-ink leading-relaxed">{aussage.text}</p>

					<div class="mt-3 flex flex-wrap gap-2">
						{#each BUCKETS as bucket (bucket)}
							<button
								type="button"
								class="rounded-xl border px-3 py-1.5 text-sm transition-colors {chosen === bucket
									? 'border-ink/30 bg-ink/5 text-ink font-semibold'
									: 'border-ink/10 bg-paper-raised text-ink enabled:hover:border-coral-200 enabled:hover:bg-coral-50'} disabled:opacity-60"
								disabled={chosen !== undefined}
								aria-pressed={chosen === bucket}
								onclick={() => assign(aussage.id, bucket)}
							>
								{BUCKET_LABELS[bucket]}
								<span class="text-ink-faint ml-1 hidden text-xs sm:inline">
									· {bucketHints[bucket]}
								</span>
							</button>
						{/each}
					</div>

					{#if chosen !== undefined}
						<div
							class="mt-3 flex items-start gap-2 text-sm {correct
								? 'text-sage-500'
								: 'text-coral-700'}"
							role="status"
						>
							<span aria-hidden="true">{correct ? '✓' : '✗'}</span>
							<p class="leading-relaxed">
								{#if correct}
									Richtig!
								{:else}
									Nicht ganz — richtig wäre <strong>{BUCKET_LABELS[aussage.correct]}</strong>.
								{/if}
								{aussage.why}
							</p>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		{#if allAnswered}
			<div
				class="border-amber-200 bg-amber-50 text-amber-600 rounded-2xl border px-5 py-4"
				role="status"
			>
				<p class="font-semibold">
					Geschafft — {score.correct} von {AUSSAGEN.length} richtig zugeordnet.
				</p>
				<p class="text-ink-soft mt-1 text-sm leading-relaxed">
					Magst du es noch einmal versuchen? Setz das Spiel unten zurück.
				</p>
			</div>
		{/if}
	</div>

	{#snippet controls()}
		<div class="flex flex-wrap items-center gap-2">
			<Button variant="secondary" size="sm" onclick={reset}>Noch einmal</Button>
			<span class="text-ink-faint text-sm">
				Tipp: Frag dich, ob die Aussage nur <em>beschreibt</em>, auf die Grundgesamtheit
				<em>schließt</em> oder eine neue Hypothese <em>entdeckt</em>.
			</span>
		</div>
	{/snippet}
</Widget>
