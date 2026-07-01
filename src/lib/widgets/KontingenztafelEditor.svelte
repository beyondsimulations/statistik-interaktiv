<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { chiSquareIndependence } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// Eine editierbare 2×2-Kontingenztafel BEOBACHTETER Häufigkeiten (Anzahlen):
	// Zeilen = zwei Arten, Spalten = zwei Habitate. Aus den Zeilen- und
	// Spaltensummen (den „Rändern“) berechnen wir live die ERWARTETEN Werte
	//   E = (Zeilensumme · Spaltensumme) / N,
	// pro Zelle den Beitrag (B − E)²/E (farbcodiert nach Größe) und unten die
	// Summen χ², df und den p-Wert. Alles über die getestete Helferfunktion
	// chiSquareIndependence. Eine Warnung erscheint, sobald ein E < 5 ist.

	const ROW_LABELS = ['Art A', 'Art B'];
	const COL_LABELS = ['Habitat 1', 'Habitat 2'];

	const DEFAULTS: number[][] = [
		[30, 10],
		[12, 28]
	];

	// Beobachtete Zählungen (editierbar). Tiefe Kopie der Defaults.
	let observed = $state<number[][]>(DEFAULTS.map((r) => [...r]));
	let yates = $state(true); // R-Default bei 2×2: correct = TRUE

	const rows = 2;
	const cols = 2;

	// Ränder ------------------------------------------------------------------
	const rowSums = $derived(observed.map((r) => r.reduce((a, b) => a + b, 0)));
	const colSums = $derived(
		Array.from({ length: cols }, (_, j) => observed.reduce((a, r) => a + r[j], 0))
	);
	const total = $derived(rowSums.reduce((a, b) => a + b, 0));

	// Test (erwartete Werte aus den Rändern, χ², df, p) ------------------------
	const result = $derived(chiSquareIndependence(observed, yates));
	const expected = $derived(result.expected);

	// Pro-Zelle-Beitrag (B − E)²/E. Mit Yates wird |B − E| um 0,5 verkleinert,
	// damit die angezeigten Beiträge zur angezeigten χ²-Summe passen.
	function contribution(i: number, j: number): number {
		const e = expected[i]?.[j];
		if (!e || e <= 0) return 0;
		let d = Math.abs(observed[i][j] - e);
		if (yates && rows === 2 && cols === 2) d = Math.max(0, d - 0.5);
		return (d * d) / e;
	}

	const anyExpectedTooSmall = $derived(
		expected.length > 0 && expected.some((r) => r.some((e) => e < 5))
	);

	const significant = $derived(Number.isFinite(result.p) && result.p < 0.05);

	// Farbton eines Beitrags: je größer, desto kräftiger koralle.
	function contribColor(c: number): string {
		if (c >= 6) return 'bg-coral-200 text-coral-700';
		if (c >= 2) return 'bg-coral-100 text-coral-700';
		if (c >= 0.5) return 'bg-amber-50 text-amber-600';
		return 'bg-paper-sunk text-ink-soft';
	}

	function setCell(i: number, j: number, raw: string) {
		const n = Math.max(0, Math.round(Number(raw)));
		const next = observed.map((r) => [...r]);
		next[i][j] = Number.isFinite(n) ? n : 0;
		observed = next;
	}

	function fmt0(v: number): string {
		return Number.isFinite(v) ? Math.round(v).toString() : '–';
	}
	function fmt1(v: number): string {
		return Number.isFinite(v) ? v.toFixed(1).replace('.', ',') : '–';
	}
	function fmt2(v: number): string {
		return Number.isFinite(v) ? v.toFixed(2).replace('.', ',') : '–';
	}
	function fmtP(p: number): string {
		if (!Number.isFinite(p)) return '–';
		if (p < 0.001) return '< 0,001';
		return p.toFixed(3).replace('.', ',');
	}

	function reset() {
		observed = DEFAULTS.map((r) => [...r]);
		yates = true;
	}
</script>

<Widget
	title="Kontingenztafel-Editor: χ² zum Anfassen"
	hint="Tipp beobachtete Anzahlen ein (Art × Habitat). Rechts berechnen sich die erwarteten Werte E aus den Rändern, der Beitrag (B − E)²/E je Zelle und unten χ², df und der p-Wert — live."
	onReset={reset}
>
	<div class="flex flex-col gap-5">
		{#if anyExpectedTooSmall}
			<div
				class="border-coral-300 bg-coral-100/70 text-coral-700 flex items-start gap-2 rounded-xl border px-4 py-2.5 text-sm"
				role="status"
			>
				<span aria-hidden="true">⚠️</span>
				<span>
					Ein <strong>Erwartungswert E &lt; 5</strong> — die χ²-Näherung wird unzuverlässig. Lieber
					den <strong>Fisher-Test</strong> rechnen oder Kategorien zusammenfassen.
				</span>
			</div>
		{/if}

		<div class="grid gap-6 md:grid-cols-2">
			<!-- Beobachtete Tafel (editierbar) -->
			<div>
				<h4 class="text-ink mb-2 text-sm font-bold tracking-wide uppercase">Beobachtet (B)</h4>
				<table class="w-full border-collapse text-center text-sm">
					<thead>
						<tr>
							<th class="px-2 py-1"></th>
							{#each COL_LABELS as col (col)}
								<th class="text-ink-soft px-2 py-1 font-semibold">{col}</th>
							{/each}
							<th class="text-ink-faint px-2 py-1 text-xs font-semibold">Σ Zeile</th>
						</tr>
					</thead>
					<tbody>
						{#each ROW_LABELS as row, i (row)}
							<tr>
								<th class="text-ink-soft px-2 py-1 text-left font-semibold">{row}</th>
								{#each COL_LABELS as col, j (col)}
									<td class="px-1 py-1">
										<input
											type="number"
											min="0"
											step="1"
											value={observed[i][j]}
											oninput={(e) => setCell(i, j, e.currentTarget.value)}
											aria-label="Beobachtet {row}, {col}"
											class="border-ink/15 bg-paper focus:border-coral-300 focus:ring-coral-200 w-16 rounded-lg border px-2 py-1 text-center tabular-nums focus:ring-2 focus:outline-none"
										/>
									</td>
								{/each}
								<td class="text-ink-faint px-2 py-1 tabular-nums">{fmt0(rowSums[i])}</td>
							</tr>
						{/each}
						<tr>
							<th class="text-ink-faint px-2 py-1 text-left text-xs font-semibold">Σ Spalte</th>
							{#each colSums as cs, j (j)}
								<td class="text-ink-faint px-2 py-1 tabular-nums">{fmt0(cs)}</td>
							{/each}
							<td class="text-ink px-2 py-1 font-semibold tabular-nums">{fmt0(total)}</td>
						</tr>
					</tbody>
				</table>
				<p class="text-ink-faint mt-2 text-xs leading-relaxed">
					Nur ganze <strong>Anzahlen</strong> — keine Prozente, keine Mittelwerte. Die Zeilen- und
					Spaltensummen (die Ränder) speisen die erwarteten Werte.
				</p>
			</div>

			<!-- Erwartete Tafel + Beiträge -->
			<div>
				<h4 class="text-ink mb-2 text-sm font-bold tracking-wide uppercase">
					Erwartet (E) &amp; Beitrag (B − E)²/E
				</h4>
				<table class="w-full border-collapse text-center text-sm">
					<thead>
						<tr>
							<th class="px-2 py-1"></th>
							{#each COL_LABELS as col (col)}
								<th class="text-ink-soft px-2 py-1 font-semibold">{col}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each ROW_LABELS as row, i (row)}
							<tr>
								<th class="text-ink-soft px-2 py-1 text-left font-semibold">{row}</th>
								{#each COL_LABELS as col, j (col)}
									{@const e = expected[i]?.[j] ?? NaN}
									{@const c = contribution(i, j)}
									<td class="px-1 py-1">
										<div class="rounded-lg px-2 py-1 {contribColor(c)} {e < 5 ? 'ring-coral-300 ring-2' : ''}">
											<div class="text-xs opacity-80">E = {fmt1(e)}</div>
											<div class="font-semibold tabular-nums">{fmt2(c)}</div>
										</div>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
				<p class="text-ink-faint mt-2 text-xs leading-relaxed">
					E = (Zeilensumme · Spaltensumme) / N. Je kräftiger die Zelle, desto mehr trägt sie zu
					χ² bei. Die Summe aller Beiträge ergibt <strong>χ² = {fmt2(result.chi2)}</strong>.
					{#if yates}
						<span>(Beiträge mit Yates-Korrektur gerechnet.)</span>
					{/if}
				</p>
			</div>
		</div>

		<!-- Live-Anzeige χ², df, p -->
		<div class="flex flex-wrap items-baseline gap-x-5 gap-y-1">
			<div class="bg-paper-sunk flex items-baseline gap-2 rounded-2xl px-4 py-2">
				<span class="text-ink-soft font-semibold">χ² = </span>
				<span class="text-ink text-2xl font-bold tabular-nums">{fmt2(result.chi2)}</span>
			</div>
			<div class="text-ink-soft flex items-baseline gap-2 rounded-2xl px-4 py-2">
				<span class="font-semibold">df = </span>
				<span class="text-ink text-xl font-bold tabular-nums">{fmt0(result.df)}</span>
			</div>
			<div
				class="flex items-baseline gap-2 rounded-2xl px-4 py-2 {significant
					? 'bg-sage-100 text-sage-500'
					: 'bg-coral-50 text-coral-700'}"
			>
				<span class="font-semibold">p = </span>
				<span class="text-2xl font-bold tabular-nums">{fmtP(result.p)}</span>
				<span class="text-sm font-semibold">
					{significant ? '· signifikant' : '· nicht signifikant'}
				</span>
			</div>
		</div>

		<p class="text-ink-faint text-xs leading-relaxed">
			Die „erwarteten“ Werte sind <strong>keine Daten</strong>: Sie verkörpern die Nullhypothese,
			dass Art und Habitat <strong>unabhängig</strong> sind. χ² misst, wie weit die beobachteten
			Zählungen von dieser Unabhängigkeit abweichen — jede Abweichung relativiert an ihrem eigenen
			Erwartungswert.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-wrap items-center gap-3">
			<label class="text-ink-soft flex items-center gap-2 text-sm font-semibold">
				<input type="checkbox" bind:checked={yates} class="accent-coral-500 h-4 w-4" />
				Yates-Korrektur (R-Default bei 2×2, df = 1)
			</label>
		</div>
	{/snippet}
</Widget>
