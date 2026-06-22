<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';

	// --- Wiederverwendbarer Entscheidungsbaum ----------------------------------
	// Der Nutzer beantwortet Schritt für Schritt Fragen (Datentyp? · gepaart oder
	// unabhängig? · normalverteilt? · Varianzen gleich?) und der Baum landet auf
	// dem empfohlenen Test. Die Schritte sind als Daten modelliert, damit Lektion
	// 14 ("Welcher Test?") den Baum erweitern oder ersetzen kann, ohne das Markup
	// anzufassen. Standard ist der Mittelwertvergleichs-Ast dieser Lektion.
	//
	// Der gesamte Zustand steckt in `chosen` (den gewählten Antwort-Indizes);
	// Pfad, aktueller Knoten und Ergebnis werden daraus abgeleitet. So bleibt der
	// Baum mit beliebigen `nodes`/`root`-Props reaktiv und ohne State-Fallen.

	export type Recommendation = {
		/** Anzeigename des empfohlenen Tests. */
		test: string;
		/** Ein Satz, warum dieser Test passt. */
		why: string;
		/** Beispielhafter R-Aufruf. */
		rcall?: string;
	};

	export type Option = {
		/** Beschriftung der Antwortmöglichkeit. */
		label: string;
		/** Folgeknoten (id) ODER direkt eine Empfehlung. */
		next?: string;
		result?: Recommendation;
	};

	export type Node = {
		/** Die Frage an dieser Verzweigung. */
		question: string;
		/** Optionaler erklärender Zusatz. */
		hint?: string;
		options: Option[];
	};

	type Props = {
		/** Knoten-Map des Baums. Default: Mittelwertvergleich (diese Lektion). */
		nodes?: Record<string, Node>;
		/** Wurzelknoten-id. */
		root?: string;
		/** Titel im Widget-Rahmen. */
		title?: string;
		/** Hinweis im Widget-Kopf. */
		hint?: string;
	};

	// --- Standardbaum: Mittelwertvergleich -------------------------------------
	const DEFAULT_NODES: Record<string, Node> = {
		typ: {
			question: 'Sind deine Daten metrisch (Messwerte wie Zugdistanz in km)?',
			hint: 'Mittelwertvergleiche brauchen metrische Daten. Häufigkeiten/Kategorien gehören zu anderen Tests (Chi-Quadrat).',
			options: [
				{ label: 'Ja, metrisch', next: 'design' },
				{
					label: 'Nein, Häufigkeiten/Kategorien',
					result: {
						test: 'Anderer Test nötig (z. B. Chi-Quadrat)',
						why: 'Für Häufigkeiten und kategoriale Daten ist ein t-Test nicht das richtige Werkzeug — das kommt in der Chi-Quadrat-Lektion.',
						rcall: 'chisq.test(tabelle)'
					}
				}
			]
		},
		design: {
			question: 'Sind die beiden Messreihen gepaart oder unabhängig?',
			hint: 'Gepaart = jede Messung in Gruppe A gehört zu genau einer in Gruppe B (z. B. dieselbe Pflanze vorher/nachher). Unabhängig = zwei getrennte Gruppen.',
			options: [
				{ label: 'Eine einzelne Stichprobe gegen festen Wert μ₀', next: 'einNorm' },
				{ label: 'Gepaart (abhängige Paare)', next: 'paarNorm' },
				{ label: 'Unabhängig (zwei getrennte Gruppen)', next: 'unabhNorm' }
			]
		},
		// --- Ein-Stichproben-Ast ---
		einNorm: {
			question: 'Ist die Stichprobe (näherungsweise) normalverteilt?',
			hint: 'Bei n ≳ 30 ist der t-Test wegen des zentralen Grenzwertsatzes recht robust gegen leichte Abweichungen.',
			options: [
				{
					label: 'Ja (oder n groß genug)',
					result: {
						test: 'Ein-Stichproben-t-Test',
						why: 'Du vergleichst einen Mittelwert mit einem festen Erwartungswert μ₀ und die Normalität ist plausibel.',
						rcall: 't.test(x, mu = 1500)'
					}
				},
				{
					label: 'Nein, klar verletzt',
					result: {
						test: 'Wilcoxon-Vorzeichen-Rang-Test (Ein-Stichproben)',
						why: 'Ist die Normalität verletzt, weicht man auf die rangbasierte, verteilungsfreie Variante aus.',
						rcall: 'wilcox.test(x, mu = 1500)'
					}
				}
			]
		},
		// --- Gepaarter Ast ---
		paarNorm: {
			question: 'Sind die Differenzen der Paare (näherungsweise) normalverteilt?',
			hint: 'Beim gepaarten Test zählt die Normalität der DIFFERENZEN, nicht der Rohwerte.',
			options: [
				{
					label: 'Ja, die Differenzen sind normalverteilt',
					result: {
						test: 'Gepaarter t-Test',
						why: 'Abhängige Paare mit normalverteilten Differenzen — der gepaarte t-Test testet, ob deren Mittelwert null ist.',
						rcall: 't.test(vorher, nachher, paired = TRUE)'
					}
				},
				{
					label: 'Nein, die Differenzen sind nicht normalverteilt',
					result: {
						test: 'Wilcoxon-Vorzeichen-Rang-Test',
						why: 'Die verteilungsfreie Alternative zum gepaarten t-Test: rangbasiert, robust gegen Ausreißer.',
						rcall: 'wilcox.test(vorher, nachher, paired = TRUE)'
					}
				}
			]
		},
		// --- Unabhängiger Ast ---
		unabhNorm: {
			question: 'Sind beide Gruppen (näherungsweise) normalverteilt?',
			hint: 'Prüfbar mit dem Shapiro-Wilk-Test — Achtung: dort heißt p > 0,05 „Normalität ok“.',
			options: [
				{ label: 'Ja (oder n je Gruppe groß genug)', next: 'unabhVar' },
				{
					label: 'Nein, klar verletzt',
					result: {
						test: 'Mann-Whitney-U-Test',
						why: 'Bei verletzter Normalität ist der rangbasierte, verteilungsfreie U-Test die robuste Wahl für zwei unabhängige Gruppen.',
						rcall: 'wilcox.test(a, b)'
					}
				}
			]
		},
		unabhVar: {
			question: 'Sind die Varianzen beider Gruppen gleich (Varianzhomogenität)?',
			hint: 'Prüfbar mit dem F-Test (var.test). Im Zweifel: Welch nehmen — er ist der R-Standard und robuster.',
			options: [
				{
					label: 'Ja, Varianzen gleich',
					result: {
						test: 'Student-t-Test (gleiche Varianzen)',
						why: 'Zwei unabhängige, normalverteilte Gruppen mit gleicher Streuung — der gepoolte Student-t-Test passt.',
						rcall: 't.test(a, b, var.equal = TRUE)'
					}
				},
				{
					label: 'Nein / unsicher',
					result: {
						test: 'Welch-Test (ungleiche Varianzen)',
						why: 'Bei ungleichen oder unsicheren Varianzen ist der Welch-Test richtig — er ist in R der Standard von t.test().',
						rcall: 't.test(a, b)'
					}
				}
			]
		}
	};

	let {
		nodes = DEFAULT_NODES,
		root = 'typ',
		title = 'Entscheidungsbaum: Welcher Mittelwert-Test?',
		hint = 'Beantworte die Fragen Schritt für Schritt — am Ende leuchtet der passende Test auf. Jederzeit zurücksetzen.'
	}: Props = $props();

	// Einziger Zustand: die Folge der gewählten Antwort-Indizes.
	let chosen = $state<number[]>([]);

	// Pfad der durchlaufenen Knoten-ids, abgeleitet aus `chosen`. Bricht ab,
	// sobald eine Antwort direkt zu einer Empfehlung führt.
	const path = $derived.by(() => {
		const ids = [root];
		let nodeId = root;
		for (const idx of chosen) {
			const opt = nodes[nodeId]?.options[idx];
			if (!opt || opt.result || !opt.next || !nodes[opt.next]) break;
			nodeId = opt.next;
			ids.push(nodeId);
		}
		return ids;
	});

	// Eine Empfehlung liegt vor, wenn die letzte Antwort ein `result` trägt.
	const result = $derived.by((): Recommendation | null => {
		if (chosen.length === 0) return null;
		const lastNodeId = path[path.length - 1];
		const lastIdx = chosen[chosen.length - 1];
		return nodes[lastNodeId]?.options[lastIdx]?.result ?? null;
	});

	const current = $derived(result ? null : nodes[path[path.length - 1]]);

	// Verlauf der bereits beantworteten Fragen (für die Anzeige).
	const trail = $derived(
		chosen.map((idx, i) => {
			const node = nodes[path[i]];
			return { question: node.question, answer: node.options[idx].label };
		})
	);

	function choose(index: number) {
		chosen = [...chosen, index];
	}

	function back() {
		if (chosen.length > 0) chosen = chosen.slice(0, -1);
	}

	function reset() {
		chosen = [];
	}
</script>

<Widget {title} {hint} onReset={reset}>
	<div class="flex flex-col gap-4">
		<!-- Bereits getroffene Entscheidungen -->
		{#if trail.length > 0}
			<ol class="flex flex-col gap-1.5">
				{#each trail as step, i (i)}
					<li class="text-ink-soft flex items-start gap-2 text-sm">
						<span
							class="bg-sage-100 text-sage-500 mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-xs font-bold"
						>
							{i + 1}
						</span>
						<span>
							<span class="text-ink-faint">{step.question}</span>
							<span class="text-ink font-semibold">→ {step.answer}</span>
						</span>
					</li>
				{/each}
			</ol>
		{/if}

		<!-- Aktuelle Frage ODER Ergebnis -->
		{#if current}
			<div class="border-ink/10 bg-paper-sunk/40 rounded-2xl border p-4">
				<p class="text-ink mb-1 font-semibold">{current.question}</p>
				{#if current.hint}
					<p class="text-ink-faint mb-3 text-sm leading-relaxed">{current.hint}</p>
				{/if}
				<div class="flex flex-col gap-2">
					{#each current.options as opt, i (i)}
						<button
							type="button"
							class="border-ink/10 hover:border-coral-300 hover:bg-coral-50 text-ink rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors"
							onclick={() => choose(i)}
						>
							{opt.label}
						</button>
					{/each}
				</div>
			</div>
		{:else if result}
			<div class="border-sage-300 bg-sage-100 rounded-2xl border p-5">
				<div class="text-sage-500 mb-1 text-xs font-bold tracking-wide uppercase">
					Empfohlener Test
				</div>
				<p class="text-ink text-xl font-bold">{result.test}</p>
				<p class="text-ink-soft mt-2 leading-relaxed">{result.why}</p>
				{#if result.rcall}
					<code
						class="bg-paper-raised text-coral-700 mt-3 inline-block rounded-lg px-3 py-1.5 font-mono text-sm"
					>
						{result.rcall}
					</code>
				{/if}
			</div>
		{/if}

		<!-- Zurück-Schritt -->
		{#if chosen.length > 0}
			<button
				type="button"
				class="text-ink-faint hover:text-ink self-start text-sm font-medium underline decoration-dotted underline-offset-4"
				onclick={back}
			>
				← einen Schritt zurück
			</button>
		{/if}
	</div>
</Widget>
