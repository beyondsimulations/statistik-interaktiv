<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import { twoSampleTPower, sampleSizeForPower } from '$lib/stats';

	// --- Idee ------------------------------------------------------------------
	// Power, Effektgröße δ, Streuung σ, α und Stichprobenumfang n sind EIN
	// gekoppeltes System. Vier Schieber — δ, σ, n und α — steuern die fünfte
	// Größe: die Power = 1 − β für einen zweiseitigen Zweistichproben-t-Test.
	//
	// Biologisches Beispiel (Otto): Vogelzug. δ ist der Unterschied der
	// Zugdistanz zwischen zwei Gruppen (km), σ die Streuung der Distanz innerhalb
	// einer Gruppe (km), n die Anzahl besenderter Vögel PRO Gruppe.
	//
	// Live: eine große Power-Zahl UND eine Power-Kurve (Power als Funktion von n
	// bei aktuellem δ/σ/α), mit Ziellinie bei 0,8 und einer Marke am aktuellen n.
	// Alle Werte kommen aus der getesteten Stats-Funktion twoSampleTPower.

	const DEFAULTS = { delta: 30, sd: 40, n: 20, alpha: 0.05 };

	let delta = $state(DEFAULTS.delta); // Unterschied der Zugdistanz (km)
	let sd = $state(DEFAULTS.sd); // Streuung der Zugdistanz je Gruppe (km)
	let n = $state(DEFAULTS.n); // Vögel je Gruppe
	let alpha = $state(DEFAULTS.alpha); // Signifikanzniveau α (zweiseitig)

	// Die fünfte Größe: live aus der getesteten Funktion.
	const power = $derived(twoSampleTPower({ delta, sd, n, sigLevel: alpha }));

	// Benötigtes n für Power 0,8 bei aktuellem δ/σ/α.
	const nFor80 = $derived(sampleSizeForPower({ delta, sd, sigLevel: alpha, power: 0.8 }));

	function reset() {
		delta = DEFAULTS.delta;
		sd = DEFAULTS.sd;
		n = DEFAULTS.n;
		alpha = DEFAULTS.alpha;
	}

	// --- Power-Kurve: Power als Funktion von n --------------------------------
	const N_MAX = 120; // rechtes Ende der n-Achse
	const N_MIN = 2;

	type Sample = { n: number; power: number };
	const samples = $derived.by<Sample[]>(() => {
		const out: Sample[] = [];
		for (let k = N_MIN; k <= N_MAX; k++) {
			out.push({ n: k, power: twoSampleTPower({ delta, sd, n: k, sigLevel: alpha }) });
		}
		return out;
	});

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 560;
	const H = 280;
	const PAD_L = 48;
	const PAD_R = 18;
	const PAD_T = 18;
	const PAD_B = 40;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;
	const baseY = PAD_T + plotH;

	function sx(nv: number): number {
		return PAD_L + ((nv - N_MIN) / (N_MAX - N_MIN)) * plotW;
	}
	function sy(p: number): number {
		// Power läuft von 0 (unten) bis 1 (oben).
		return baseY - p * plotH;
	}

	const curvePoints = $derived(
		samples.map((s) => `${sx(s.n).toFixed(2)},${sy(s.power).toFixed(2)}`).join(' ')
	);

	// Marke am aktuellen n (auf der Kurve).
	const markerX = $derived(sx(Math.min(n, N_MAX)));
	const markerY = $derived(sy(power));

	// --- Formatierung ----------------------------------------------------------
	function pct(v: number): string {
		if (!Number.isFinite(v)) return '–';
		return (v * 100).toFixed(0).replace('.', ',');
	}
	function fmtN(v: number): string {
		if (!Number.isFinite(v)) return '∞';
		return String(v);
	}

	// Farbgebung der großen Zahl: rot bei zu wenig Power, grün ab 0,8.
	const powerTone = $derived(
		power >= 0.8 ? 'sage' : power >= 0.5 ? 'amber' : 'coral'
	);

	const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];
	const xTicks = [2, 20, 40, 60, 80, 100, 120];
</script>

<Widget
	title="Power-Spielplatz: das gekoppelte System zum Anfassen"
	hint="Vogelzug: Wie viele Vögel pro Gruppe brauchst du, um einen Unterschied in der Zugdistanz nachzuweisen? Zieh an δ, σ, n und α — Power (1 − β) und die Power-Kurve laufen live mit."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Power-Kurve: Power über n -->
		<svg
			viewBox="0 0 {W} {H}"
			class="border-ink/10 bg-paper-sunk/40 block h-auto w-full rounded-xl border"
			role="img"
			aria-label="Power-Kurve: Power als Funktion des Stichprobenumfangs n pro Gruppe, bei einem Unterschied von {delta} km, einer Streuung von {sd} km und α = {alpha}. Bei n = {n} beträgt die Power {pct(
				power
			)} Prozent. Die Ziellinie liegt bei 80 Prozent."
		>
			<!-- waagerechte Gitterlinien + y-Achsen-Beschriftung -->
			{#each yTicks as t (t)}
				<line
					x1={PAD_L}
					y1={sy(t)}
					x2={W - PAD_R}
					y2={sy(t)}
					stroke="var(--color-ink)"
					stroke-opacity="0.06"
				/>
				<text
					x={PAD_L - 8}
					y={sy(t) + 3}
					text-anchor="end"
					font-size="10"
					fill="var(--color-ink-faint)"
				>
					{(t * 100).toFixed(0)}%
				</text>
			{/each}

			<!-- x-Achsen-Ticks -->
			{#each xTicks as t (t)}
				<line
					x1={sx(t)}
					y1={baseY}
					x2={sx(t)}
					y2={baseY + 5}
					stroke="var(--color-ink)"
					stroke-opacity="0.3"
				/>
				<text
					x={sx(t)}
					y={baseY + 18}
					text-anchor="middle"
					font-size="10"
					fill="var(--color-ink-faint)"
				>
					{t}
				</text>
			{/each}

			<!-- Rahmen -->
			<line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={baseY} stroke="var(--color-ink)" stroke-opacity="0.3" />
			<line x1={PAD_L} y1={baseY} x2={W - PAD_R} y2={baseY} stroke="var(--color-ink)" stroke-opacity="0.3" />

			<!-- Achsentitel -->
			<text x={PAD_L + plotW / 2} y={H - 4} text-anchor="middle" font-size="11" fill="var(--color-ink-faint)">
				Stichprobenumfang n je Gruppe →
			</text>
			<text
				x={14}
				y={PAD_T + plotH / 2}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
				transform="rotate(-90 14 {PAD_T + plotH / 2})"
			>
				Power (1 − β) →
			</text>

			<!-- Ziellinie bei Power = 0,8 -->
			<line
				x1={PAD_L}
				y1={sy(0.8)}
				x2={W - PAD_R}
				y2={sy(0.8)}
				stroke="var(--color-coral-500)"
				stroke-width="1.5"
				stroke-dasharray="5 3"
			/>
			<text
				x={W - PAD_R - 2}
				y={sy(0.8) - 5}
				text-anchor="end"
				font-size="10"
				font-weight="700"
				fill="var(--color-coral-700)"
			>
				Ziel: 80 %
			</text>

			<!-- Power-Kurve -->
			<polyline points={curvePoints} fill="none" stroke="var(--color-sage-500)" stroke-width="2.5" />

			<!-- senkrechte Linie + Marke am aktuellen n -->
			<line
				x1={markerX}
				y1={PAD_T}
				x2={markerX}
				y2={baseY}
				stroke="var(--color-ink)"
				stroke-opacity="0.3"
				stroke-dasharray="3 3"
			/>
			<circle cx={markerX} cy={markerY} r="6" fill="var(--color-coral-500)" stroke="var(--color-paper-raised)" stroke-width="2" />
			<text
				x={markerX}
				y={markerY - 12}
				text-anchor="middle"
				font-size="11"
				font-weight="700"
				fill="var(--color-coral-700)"
			>
				n = {n}
			</text>
		</svg>

		<!-- Große Live-Power-Zahl + Kennwerte -->
		<div class="flex flex-wrap items-center gap-x-6 gap-y-2">
			<div
				class={[
					'flex items-baseline gap-2 rounded-2xl px-5 py-3',
					powerTone === 'sage' && 'bg-sage-100',
					powerTone === 'amber' && 'bg-amber-100',
					powerTone === 'coral' && 'bg-coral-50'
				]}
			>
				<span
					class={[
						'font-semibold',
						powerTone === 'sage' && 'text-sage-500',
						powerTone === 'amber' && 'text-amber-600',
						powerTone === 'coral' && 'text-coral-700'
					]}
				>
					Power = 1 − β
				</span>
				<span class="text-ink text-4xl font-bold tabular-nums">{pct(power)} %</span>
			</div>
			<div class="text-ink-soft flex flex-col gap-0.5 text-sm tabular-nums">
				<span>
					β (Effekt übersehen) = <strong>{pct(1 - power)} %</strong>
				</span>
				<span>
					Für Power 0,8 nötig: <strong>n ≈ {fmtN(nFor80)}</strong> pro Gruppe
				</span>
			</div>
		</div>

		<p class="text-ink-faint text-xs leading-relaxed">
			Die <span class="text-sage-500 font-semibold">grüne Kurve</span> zeigt, wie die Power mit
			größerem n steigt. Die <span class="text-coral-700 font-semibold">korallene Linie</span> ist
			die übliche Zielmarke 0,8. Liegt die <span class="text-coral-700 font-semibold">Marke</span> unter
			der Ziellinie, hast du zu wenig Power — ein nicht-signifikantes Ergebnis hieße dann
			<strong>nicht</strong> „kein Effekt“, sondern vielleicht nur „zu kleines n“.
		</p>
	</div>

	{#snippet controls()}
		<div class="grid gap-4 sm:grid-cols-2">
			<div>
				<label for="ps-delta" class="text-ink-soft mb-1 block text-sm font-semibold">
					Effektgröße δ = {delta} km
					<span class="text-ink-faint font-normal">(Unterschied der Zugdistanz)</span>
				</label>
				<input id="ps-delta" type="range" min="5" max="120" step="1" bind:value={delta} class="accent-sage-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>5 (klein)</span><span>120 (groß)</span></div>
			</div>

			<div>
				<label for="ps-sd" class="text-ink-soft mb-1 block text-sm font-semibold">
					Streuung σ = {sd} km
					<span class="text-ink-faint font-normal">(Variation je Gruppe)</span>
				</label>
				<input id="ps-sd" type="range" min="10" max="120" step="1" bind:value={sd} class="accent-coral-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>10 (eng)</span><span>120 (breit)</span></div>
			</div>

			<div>
				<label for="ps-n" class="text-ink-soft mb-1 block text-sm font-semibold">
					Stichprobenumfang n = {n}
					<span class="text-ink-faint font-normal">(Vögel je Gruppe)</span>
				</label>
				<input id="ps-n" type="range" min="2" max="120" step="1" bind:value={n} class="accent-sage-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>2</span><span>120</span></div>
			</div>

			<div>
				<label for="ps-alpha" class="text-ink-soft mb-1 block text-sm font-semibold">
					Signifikanzniveau α = {alpha.toFixed(2).replace('.', ',')}
				</label>
				<input id="ps-alpha" type="range" min="0.01" max="0.2" step="0.01" bind:value={alpha} class="accent-coral-500 w-full" />
				<div class="text-ink-faint flex justify-between text-xs"><span>0,01 (streng)</span><span>0,20 (locker)</span></div>
			</div>
		</div>
	{/snippet}
</Widget>
