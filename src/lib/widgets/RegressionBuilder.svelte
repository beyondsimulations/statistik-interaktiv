<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import SSZerlegung from '$lib/widgets/SSZerlegung.svelte';
	import { linearRegression } from '$lib/stats';
	import { makeLinearScale } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Eine Regressionsgerade zum Anfassen: Körperlänge (x, mm) einer Daphnie
	// gegen die Anzahl ihrer Nachkommen (y). Du kannst Punkte ZIEHEN; die
	// Kleinste-Quadrate-Gerade aktualisiert sich live, mitsamt den senkrechten
	// RESIDUEN-Segmenten von jedem Punkt zur Geraden. Daneben laufen Steigung b,
	// Achsenabschnitt a, R² und der p-Wert der Steigung mit, und die
	// SS-Zerlegung (erklärt vs. unerklärt, R²) als Balken.
	//
	// Der große Aha-Moment: Mit "Hebelpunkt hinzufügen" legst du einen einzelnen
	// Punkt weit draußen in x ab — er kippt die ganze Gerade und lässt R² und
	// die Koeffizienten springen. Genau das macht einflussreiche Punkte gefährlich.

	type Pt = { id: number; x: number; y: number; leverage?: boolean };

	// Datenbereich: x = Körperlänge in mm, y = Anzahl Nachkommen.
	const DOMAIN = { xMin: 0, xMax: 6, yMin: 0, yMax: 40 };

	let nextId = 0;
	function mk(pts: { x: number; y: number; leverage?: boolean }[]): Pt[] {
		return pts.map((p) => ({ id: nextId++, x: p.x, y: p.y, leverage: p.leverage }));
	}

	// Ausgangswolke: sauberer, leicht verrauschter Anstieg (Daphnia-typisch).
	const BASE: { x: number; y: number }[] = [
		{ x: 1.6, y: 5 },
		{ x: 2.0, y: 7 },
		{ x: 2.4, y: 11 },
		{ x: 2.8, y: 10 },
		{ x: 3.2, y: 16 },
		{ x: 3.6, y: 15 },
		{ x: 4.0, y: 21 },
		{ x: 4.4, y: 23 },
		{ x: 4.8, y: 27 }
	];

	let points = $state<Pt[]>(mk(BASE));

	function reset() {
		points = mk(BASE);
	}

	// --- Regression (live) -----------------------------------------------------
	const xs = $derived(points.map((p) => p.x));
	const ys = $derived(points.map((p) => p.y));
	const fit = $derived(linearRegression(xs, ys));

	// Quadratsummen für die SS-Zerlegung direkt aus dem getesteten OLS-Helfer,
	// damit der Balken nicht vom angezeigten R² abdriften kann. Bei degeneriertem
	// Fit (NaN) zeigen wir einen leeren Balken.
	const sums = $derived(
		Number.isFinite(fit.slope)
			? { ssReg: fit.ssExplained, ssRes: fit.ssResidual }
			: { ssReg: 0, ssRes: 0 }
	);

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 520;
	const H = 360;
	const PAD_L = 46;
	const PAD_R = 16;
	const PAD_T = 16;
	const PAD_B = 40;
	const plotW = W - PAD_L - PAD_R;
	const plotH = H - PAD_T - PAD_B;

	// Eine lineare Skala je Achse (Datenraum → Pixel und zurück). y ist im
	// SVG gespiegelt: yMin liegt unten (PAD_T + plotH), yMax oben (PAD_T).
	const scaleX = makeLinearScale(DOMAIN.xMin, DOMAIN.xMax, PAD_L, PAD_L + plotW);
	const scaleY = makeLinearScale(DOMAIN.yMin, DOMAIN.yMax, PAD_T + plotH, PAD_T);
	const toPxX = (x: number) => scaleX.map(x);
	const toPxY = (y: number) => scaleY.map(y);
	const fromPxX = (px: number) => scaleX.invert(px);
	const fromPxY = (py: number) => scaleY.invert(py);

	function clamp(v: number, lo: number, hi: number): number {
		return Math.max(lo, Math.min(hi, v));
	}

	// Regressionsgerade als zwei Endpunkte (linker/rechter Rand).
	const regLine = $derived.by(() => {
		if (!Number.isFinite(fit.slope)) return null;
		const yAt = (x: number) => fit.intercept + fit.slope * x;
		return {
			x1: toPxX(DOMAIN.xMin),
			y1: toPxY(yAt(DOMAIN.xMin)),
			x2: toPxX(DOMAIN.xMax),
			y2: toPxY(yAt(DOMAIN.xMax))
		};
	});

	// Residuen-Segmente: senkrecht von jedem Punkt zur Geraden.
	const residuals = $derived.by(() => {
		if (!Number.isFinite(fit.slope)) return [];
		return points.map((p) => {
			const yhat = fit.intercept + fit.slope * p.x;
			return {
				id: p.id,
				x: toPxX(p.x),
				yPt: toPxY(p.y),
				yLine: toPxY(yhat)
			};
		});
	});

	// --- Drag-Logik (Pointer Events) ------------------------------------------
	let svgEl: SVGSVGElement | null = $state(null);
	let dragId = $state<number | null>(null);
	let selectedId = $state<number | null>(null);

	function svgPointFromEvent(ev: PointerEvent): { px: number; py: number } {
		const rect = svgEl!.getBoundingClientRect();
		const px = ((ev.clientX - rect.left) / rect.width) * W;
		const py = ((ev.clientY - rect.top) / rect.height) * H;
		return { px, py };
	}

	function onPointerDownDot(ev: PointerEvent, id: number) {
		ev.preventDefault();
		ev.stopPropagation();
		dragId = id;
		selectedId = id;
		(ev.currentTarget as Element).setPointerCapture(ev.pointerId);
	}

	function onPointerMove(ev: PointerEvent) {
		if (dragId === null) return;
		const { px, py } = svgPointFromEvent(ev);
		const nx = clamp(fromPxX(px), DOMAIN.xMin, DOMAIN.xMax);
		const ny = clamp(fromPxY(py), DOMAIN.yMin, DOMAIN.yMax);
		points = points.map((p) => (p.id === dragId ? { ...p, x: nx, y: ny } : p));
	}

	function onPointerUp(ev: PointerEvent) {
		if (dragId !== null) {
			try {
				(ev.currentTarget as Element).releasePointerCapture(ev.pointerId);
			} catch {
				// kein Capture aktiv
			}
		}
		dragId = null;
	}

	// Tastatur: ausgewählten Punkt mit den Pfeiltasten verschieben.
	function onDotKeydown(ev: KeyboardEvent, id: number) {
		const stepX = ev.shiftKey ? 0.5 : 0.1;
		const stepY = ev.shiftKey ? 4 : 1;
		let dx = 0;
		let dy = 0;
		if (ev.key === 'ArrowLeft') dx = -stepX;
		else if (ev.key === 'ArrowRight') dx = stepX;
		else if (ev.key === 'ArrowUp') dy = stepY;
		else if (ev.key === 'ArrowDown') dy = -stepY;
		else return;
		ev.preventDefault();
		selectedId = id;
		points = points.map((p) =>
			p.id === id
				? {
						...p,
						x: clamp(p.x + dx, DOMAIN.xMin, DOMAIN.xMax),
						y: clamp(p.y + dy, DOMAIN.yMin, DOMAIN.yMax)
					}
				: p
		);
	}

	// --- Punkte hinzufügen / entfernen ----------------------------------------
	function addLeverage() {
		// Ein einzelner Hebelpunkt weit draußen in x, tief unten in y → kippt die
		// Gerade dramatisch nach unten. (Nur einen aktiven Hebelpunkt zulassen.)
		if (points.some((p) => p.leverage)) return;
		points = [...points, ...mk([{ x: 5.8, y: 4, leverage: true }])];
	}
	function removeLeverage() {
		points = points.filter((p) => !p.leverage);
	}
	function removeLast() {
		if (points.length <= 3) return; // df = n − 2 braucht n ≥ 3
		points = points.slice(0, -1);
	}

	const hasLeverage = $derived(points.some((p) => p.leverage));

	// --- Formatierung ----------------------------------------------------------
	function fmt(v: number, digits = 2): string {
		if (!Number.isFinite(v)) return '–';
		return v.toFixed(digits).replace('.', ',');
	}
	function fmtP(v: number): string {
		if (!Number.isFinite(v)) return '–';
		if (v < 0.0001) return '< 0,0001';
		return v.toFixed(4).replace('.', ',');
	}
	function sigLabel(v: number): string {
		if (!Number.isFinite(v)) return '';
		return v < 0.05 ? 'signifikant (β ≠ 0)' : 'nicht signifikant';
	}

	// Achsen-Ticks.
	const xTicks = [0, 1, 2, 3, 4, 5, 6];
	const yTicks = [0, 10, 20, 30, 40];
</script>

<Widget
	title="Regression-Builder: die Gerade zum Anfassen"
	hint="Körperlänge x (mm) einer Daphnie gegen die Anzahl Nachkommen y. Zieh Punkte — die Kleinste-Quadrate-Gerade, die Residuen, b, a, R² und der p-Wert laufen live mit."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Live-Kennzahlen -->
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
			<div class="bg-coral-50 rounded-2xl px-4 py-3">
				<div class="text-coral-700 text-sm font-semibold">Steigung b</div>
				<div class="text-ink text-2xl font-bold tabular-nums">{fmt(fit.slope)}</div>
				<div class="text-ink-faint text-xs">Nachkommen pro mm</div>
			</div>
			<div class="bg-sage-100 rounded-2xl px-4 py-3">
				<div class="text-sage-500 text-sm font-semibold">Achsenabschnitt a</div>
				<div class="text-ink text-2xl font-bold tabular-nums">{fmt(fit.intercept)}</div>
				<div class="text-ink-faint text-xs">ŷ bei x = 0</div>
			</div>
			<div class="bg-paper-sunk rounded-2xl px-4 py-3">
				<div class="text-ink-soft text-sm font-semibold">R²</div>
				<div class="text-ink text-2xl font-bold tabular-nums">{fmt(fit.r2)}</div>
				<div class="text-ink-faint text-xs">erklärter Anteil</div>
			</div>
			<div class="bg-paper-sunk rounded-2xl px-4 py-3">
				<div class="text-ink-soft text-sm font-semibold">p-Wert (b)</div>
				<div class="text-ink text-2xl font-bold tabular-nums">{fmtP(fit.pSlope)}</div>
				<div class="text-ink-faint text-xs">{sigLabel(fit.pSlope)}</div>
			</div>
		</div>

		<!-- Streudiagramm mit Gerade und Residuen -->
		<svg
			bind:this={svgEl}
			viewBox="0 0 {W} {H}"
			class="border-ink/10 bg-paper-sunk/40 block h-auto w-full touch-none rounded-xl border select-none"
			role="img"
			aria-label="Streudiagramm Körperlänge gegen Anzahl Nachkommen. Steigung b = {fmt(
				fit.slope
			)}, Achsenabschnitt a = {fmt(fit.intercept)}, R² = {fmt(fit.r2)}, p-Wert der Steigung {fmtP(
				fit.pSlope
			)}. {points.length} Punkte."
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
		>
			<!-- Gitter / Achsen -->
			{#each xTicks as t (t)}
				<line
					x1={toPxX(t)}
					y1={PAD_T}
					x2={toPxX(t)}
					y2={PAD_T + plotH}
					stroke="var(--color-ink)"
					stroke-opacity="0.06"
				/>
				<text x={toPxX(t)} y={PAD_T + plotH + 16} text-anchor="middle" font-size="10" fill="var(--color-ink-faint)">{t}</text>
			{/each}
			{#each yTicks as t (t)}
				<line
					x1={PAD_L}
					y1={toPxY(t)}
					x2={W - PAD_R}
					y2={toPxY(t)}
					stroke="var(--color-ink)"
					stroke-opacity="0.06"
				/>
				<text x={PAD_L - 8} y={toPxY(t) + 3} text-anchor="end" font-size="10" fill="var(--color-ink-faint)">{t}</text>
			{/each}

			<!-- Rahmen -->
			<line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="var(--color-ink)" stroke-opacity="0.3" />
			<line x1={PAD_L} y1={PAD_T + plotH} x2={W - PAD_R} y2={PAD_T + plotH} stroke="var(--color-ink)" stroke-opacity="0.3" />

			<!-- Achsentitel -->
			<text x={PAD_L + plotW / 2} y={H - 4} text-anchor="middle" font-size="11" fill="var(--color-ink-faint)">
				Körperlänge (mm) →
			</text>
			<text
				x={13}
				y={PAD_T + plotH / 2}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
				transform="rotate(-90 13 {PAD_T + plotH / 2})"
			>
				Anzahl Nachkommen →
			</text>

			<!-- Residuen-Segmente (senkrecht von Punkt zur Geraden) -->
			{#each residuals as res (res.id)}
				<line
					x1={res.x}
					y1={res.yPt}
					x2={res.x}
					y2={res.yLine}
					stroke="var(--color-coral-400)"
					stroke-width="1.5"
					stroke-opacity="0.55"
					stroke-dasharray="3 2"
				/>
			{/each}

			<!-- Regressionsgerade -->
			{#if regLine}
				<line
					x1={regLine.x1}
					y1={regLine.y1}
					x2={regLine.x2}
					y2={regLine.y2}
					stroke="var(--color-coral-500)"
					stroke-width="2.5"
				/>
			{/if}

			<!-- Datenpunkte -->
			{#each points as p (p.id)}
				<circle
					cx={toPxX(p.x)}
					cy={toPxY(p.y)}
					r={dragId === p.id || selectedId === p.id ? 9 : 7}
					fill={p.leverage ? 'var(--color-coral-500)' : 'var(--color-sage-500)'}
					fill-opacity={dragId === p.id ? 0.95 : 0.8}
					stroke="var(--color-paper-raised)"
					stroke-width="2"
					class="cursor-grab focus:outline-none"
					style="touch-action: none;"
					role="button"
					tabindex="0"
					aria-label="{p.leverage ? 'Hebelpunkt' : 'Punkt'} bei Körperlänge {fmt(p.x)} mm, {fmt(
						p.y,
						0
					)} Nachkommen. Mit den Pfeiltasten verschieben."
					onpointerdown={(ev) => onPointerDownDot(ev, p.id)}
					onkeydown={(ev) => onDotKeydown(ev, p.id)}
					onfocus={() => (selectedId = p.id)}
				/>
			{/each}
		</svg>

		<!-- SS-Zerlegung: erklärt vs. unerklärt, Symbol R² -->
		<SSZerlegung
			ssExplained={sums.ssReg}
			ssResidual={sums.ssRes}
			ratioSymbol="R²"
			caption="Streuungszerlegung: vom Modell erklärt vs. unerklärt (Residuen)"
		/>

		<p class="text-ink-faint text-xs leading-relaxed">
			<strong>Probier es:</strong> Klick <em>Hebelpunkt hinzufügen</em> — der koralle Punkt liegt
			weit rechts (große Körperlänge) und tief unten. Beobachte, wie die Gerade <em>kippt</em> und
			R² einbricht, obwohl sich an den restlichen Punkten nichts geändert hat. So stark kann ein
			einziger einflussreicher Punkt (hohe Hebelwirkung) eine Regression verzerren.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap gap-2">
				{#if hasLeverage}
					<Button variant="primary" size="sm" onclick={removeLeverage}>Hebelpunkt entfernen</Button>
				{:else}
					<Button variant="subtle" size="sm" onclick={addLeverage}>Hebelpunkt hinzufügen</Button>
				{/if}
				<Button variant="subtle" size="sm" onclick={removeLast}>− letzten Punkt</Button>
			</div>
			<p class="text-ink-faint text-xs">
				Tipp: Punkte mit der Maus ziehen oder einen Punkt anklicken und mit den Pfeiltasten
				verschieben (Umschalt = größere Schritte). Der koralle <strong>Hebelpunkt</strong> zeigt,
				wie ein einzelner Ausreißer in x die ganze Gerade kippt.
			</p>
		</div>
	{/snippet}
</Widget>
