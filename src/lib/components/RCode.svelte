<script lang="ts">
	type Props = {
		/** Der R-Code (read-only Anzeige). */
		code: string;
		/** Optionale Konsolenausgabe, in einem eigenen Block. */
		output?: string;
		/** Optionale Anmerkungen: Label/Zeile → Hinweistext. */
		annotations?: Record<string, string>;
	};

	let { code, output, annotations }: Props = $props();

	const annotationList = $derived(annotations ? Object.entries(annotations) : []);

	// Sehr leichtgewichtige Tönung: Kommentare hervorheben, sonst klares Monospace.
	// Kein vollständiger Highlighter — bewusst zurückhaltend.
	type Token = { text: string; comment: boolean };

	function tokenizeLine(line: string): Token[] {
		const hash = line.indexOf('#');
		if (hash === -1) return [{ text: line, comment: false }];
		return [
			{ text: line.slice(0, hash), comment: false },
			{ text: line.slice(hash), comment: true }
		];
	}

	// Newlines are baked into each line's text (except the last) so the rendered
	// <pre> keeps its line breaks without a literal-string mustache.
	const lines = $derived(
		code
			.replace(/\n$/, '')
			.split('\n')
			.map((raw, idx, all) => tokenizeLine(idx < all.length - 1 ? raw + '\n' : raw))
	);
</script>

<div class="border-ink/10 bg-paper-raised shadow-soft my-5 overflow-hidden rounded-2xl border">
	<div class="border-ink/10 bg-paper-sunk flex items-center gap-2 border-b px-4 py-2">
		<span class="bg-coral-100 text-coral-700 rounded-md px-2 py-0.5 text-xs font-bold">R</span>
		<span class="text-ink-faint text-xs">Code (nur Anzeige)</span>
	</div>

	<pre class="overflow-x-auto px-4 py-3 text-sm leading-relaxed"><code class="font-mono"
			>{#each lines as line, i (i)}{#each line as tok, j (j)}{#if tok.comment}<span
						class="text-sage-500 italic">{tok.text}</span
					>{:else}<span class="text-ink">{tok.text}</span>{/if}{/each}{/each}</code
		></pre>

	{#if output !== undefined}
		<div class="border-ink/10 bg-paper-sunk/60 border-t">
			<div class="text-ink-faint px-4 pt-2 text-xs font-semibold tracking-wide uppercase">
				Ausgabe
			</div>
			<pre
				class="text-ink-soft overflow-x-auto px-4 pb-3 pt-1 font-mono text-sm leading-relaxed">{output}</pre>
		</div>
	{/if}

	{#if annotationList.length > 0}
		<div class="border-ink/10 border-t px-4 py-3">
			<dl class="grid gap-x-3 gap-y-1.5 text-sm sm:grid-cols-[auto_1fr]">
				{#each annotationList as [label, note] (label)}
					<dt class="text-coral-700 font-mono font-semibold sm:text-right">{label}</dt>
					<dd class="text-ink-soft">{note}</dd>
				{/each}
			</dl>
		</div>
	{/if}
</div>
