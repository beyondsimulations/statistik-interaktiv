<script lang="ts">
	import Widget from '$lib/components/Widget.svelte';
	import Button from '$lib/components/Button.svelte';
	import { pearson, spearman, linearRegression } from '$lib/stats';
	import { makeLinearScale } from '$lib/widgets/curve';

	// --- Idee ------------------------------------------------------------------
	// Ein Streudiagramm zum Anfassen: Körpermasse (x) vs. Hirnmasse (y) bei
	// Säugetieren. Du kannst Punkte ZIEHEN, hinzufügen und entfernen. Live
	// rechnen wir Pearson r und Spearman ρ nebeneinander und zeichnen die lineare
	// Trendgerade.
	//
	// Zwei Aha-Momente lassen sich reproduzieren:
	//   (a) U-Form/Parabel  → Pearson r ≈ 0, obwohl klar ein Muster da ist
	//                         (r misst nur die LINEARE Stärke).
	//   (b) ein Ausreißer   → Pearson schlägt dramatisch aus, Spearman bleibt
	//                         stabil (rangbasiert, robust).

	type Pt = { id: number; x: number; y: number };

	// Datenbereich (logische Koordinaten, willkürliche Einheiten der Achsen).
	const DOMAIN = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 };

	let nextId = 0;
	function mk(pts: { x: number; y: number }[]): Pt[] {
		return pts.map((p) => ({ id: nextId++, x: p.x, y: p.y }));
	}

	// --- Presets ---------------------------------------------------------------
	const PRESETS: Record<string, { x: number; y: number }[]> = {
		// Sauberer, näherungsweise linearer Anstieg (mit etwas Streuung).
		linear: [
			{ x: 10, y: 18 }, { x: 20, y: 25 }, { x: 30, y: 40 }, { x: 40, y: 42 },
			{ x: 50, y: 55 }, { x: 60, y: 58 }, { x: 70, y: 72 }, { x: 80, y: 80 },
			{ x: 90, y: 88 }
		],
		// Symmetrische U-Form/Parabel: Pearson ≈ 0, Muster aber offensichtlich.
		parabel: [
			{ x: 10, y: 85 }, { x: 20, y: 55 }, { x: 30, y: 33 }, { x: 40, y: 18 },
			{ x: 50, y: 12 }, { x: 60, y: 18 }, { x: 70, y: 33 }, { x: 80, y: 55 },
			{ x: 90, y: 85 }
		],
		// Monoton, aber stark gekrümmt (sättigt): Spearman = 1, Pearson < 1.
		monoton: [
			{ x: 10, y: 12 }, { x: 20, y: 30 }, { x: 30, y: 48 }, { x: 40, y: 62 },
			{ x: 50, y: 72 }, { x: 60, y: 80 }, { x: 70, y: 85 }, { x: 80, y: 89 },
			{ x: 90, y: 92 }
		],
		// Featureless Wolke + ein weit entfernter Ausreißer oben rechts:
		// Pearson springt hoch (Scheinkorrelation), Spearman bleibt niedrig.
		ausreisser: [
			{ x: 15, y: 30 }, { x: 25, y: 18 }, { x: 18, y: 38 }, { x: 30, y: 25 },
			{ x: 35, y: 35 }, { x: 22, y: 22 }, { x: 32, y: 30 }, { x: 95, y: 95 }
		]
	};

	const PRESET_LABELS: { key: keyof typeof PRESETS; label: string }[] = [
		{ key: 'linear', label: 'linear' },
		{ key: 'parabel', label: 'U-Form / Parabel' },
		{ key: 'monoton', label: 'monoton, aber gekrümmt' },
		{ key: 'ausreisser', label: 'mit Ausreißer' }
	];

	let activePreset = $state<keyof typeof PRESETS>('linear');
	let points = $state<Pt[]>(mk(PRESETS.linear));

	function loadPreset(key: keyof typeof PRESETS) {
		activePreset = key;
		points = mk(PRESETS[key]);
	}
	function reset() {
		loadPreset('linear');
	}

	// --- Kennzahlen (live) -----------------------------------------------------
	const xs = $derived(points.map((p) => p.x));
	const ys = $derived(points.map((p) => p.y));
	const r = $derived(pearson(xs, ys));
	const rho = $derived(spearman(xs, ys));

	// Lineare Trendgerade über den getesteten OLS-Helfer (Kleinste-Quadrate, nur
	// zur Anschauung). Bei konstantem x oder < 3 Punkten liefert er NaN → keine
	// Gerade.
	const trend = $derived.by(() => {
		const { slope, intercept } = linearRegression(xs, ys);
		if (!Number.isFinite(slope) || !Number.isFinite(intercept)) return null;
		return { slope, intercept };
	});

	// --- SVG-Geometrie ---------------------------------------------------------
	const W = 520;
	const H = 360;
	const PAD_L = 44;
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

	// Trendgerade als zwei Endpunkte (an den linken/rechten Rand geklemmt).
	const trendLine = $derived.by(() => {
		if (!trend) return null;
		const x1 = DOMAIN.xMin;
		const x2 = DOMAIN.xMax;
		return {
			x1: toPxX(x1),
			y1: toPxY(clamp(trend.intercept + trend.slope * x1, DOMAIN.yMin, DOMAIN.yMax)),
			x2: toPxX(x2),
			y2: toPxY(clamp(trend.intercept + trend.slope * x2, DOMAIN.yMin, DOMAIN.yMax))
		};
	});

	// --- Drag-Logik (Pointer Events) ------------------------------------------
	let svgEl: SVGSVGElement | null = $state(null);
	let dragId = $state<number | null>(null);

	function svgPointFromEvent(ev: PointerEvent): { px: number; py: number } {
		const rect = svgEl!.getBoundingClientRect();
		// viewBox ist W×H, das Element wird skaliert → zurückrechnen.
		const px = ((ev.clientX - rect.left) / rect.width) * W;
		const py = ((ev.clientY - rect.top) / rect.height) * H;
		return { px, py };
	}

	function onPointerDownDot(ev: PointerEvent, id: number) {
		ev.preventDefault();
		dragId = id;
		(ev.currentTarget as Element).setPointerCapture(ev.pointerId);
		activePreset = 'custom' as keyof typeof PRESETS;
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
				// Kein Capture aktiv — ignorieren.
			}
		}
		dragId = null;
	}

	// Tastatur: ausgewählten Punkt mit den Pfeiltasten verschieben.
	let selectedId = $state<number | null>(null);
	function onDotKeydown(ev: KeyboardEvent, id: number) {
		const step = ev.shiftKey ? 5 : 1;
		let dx = 0;
		let dy = 0;
		if (ev.key === 'ArrowLeft') dx = -step;
		else if (ev.key === 'ArrowRight') dx = step;
		else if (ev.key === 'ArrowUp') dy = step;
		else if (ev.key === 'ArrowDown') dy = -step;
		else return;
		ev.preventDefault();
		selectedId = id;
		activePreset = 'custom' as keyof typeof PRESETS;
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

	// --- Punkt hinzufügen / entfernen ------------------------------------------
	function addPoint() {
		// Neuen Punkt sichtbar in der Mitte ablegen, dann kann man ihn ziehen.
		points = [...points, ...mk([{ x: 50, y: 50 }])];
		activePreset = 'custom' as keyof typeof PRESETS;
	}
	function addOutlier() {
		// Bewusst ein Ausreißer oben rechts.
		points = [...points, ...mk([{ x: 95, y: 95 }])];
		activePreset = 'custom' as keyof typeof PRESETS;
	}
	function removeLast() {
		if (points.length <= 2) return; // mindestens 2 Punkte behalten
		points = points.slice(0, -1);
		activePreset = 'custom' as keyof typeof PRESETS;
	}

	// Klick auf die freie Fläche fügt dort einen Punkt hinzu.
	function onCanvasClick(ev: PointerEvent) {
		// Nur reagieren, wenn nicht gerade ein Punkt gezogen wurde.
		if (dragId !== null) return;
		const target = ev.target as Element;
		if (target.tagName === 'circle') return; // Punkt selbst → kein Neuanlegen
		const { px, py } = svgPointFromEvent(ev);
		if (px < PAD_L || px > W - PAD_R || py < PAD_T || py > PAD_T + plotH) return;
		const nx = clamp(fromPxX(px), DOMAIN.xMin, DOMAIN.xMax);
		const ny = clamp(fromPxY(py), DOMAIN.yMin, DOMAIN.yMax);
		points = [...points, ...mk([{ x: nx, y: ny }])];
		activePreset = 'custom' as keyof typeof PRESETS;
	}

	// --- Formatierung ----------------------------------------------------------
	function fmt(v: number): string {
		if (!Number.isFinite(v)) return '–';
		return v.toFixed(2).replace('.', ',');
	}
	function strength(v: number): string {
		const a = Math.abs(v);
		if (!Number.isFinite(v)) return '';
		if (a < 0.1) return 'praktisch null';
		if (a < 0.3) return 'schwach';
		if (a < 0.6) return 'mittel';
		if (a < 0.85) return 'stark';
		return 'sehr stark';
	}
</script>

<Widget
	title="Scatter-Builder: r und ρ zum Anfassen"
	hint="Körpermasse (x) vs. Hirnmasse (y) bei Säugetieren. Zieh Punkte, füge welche hinzu oder probier die Vorlagen — und beobachte Pearson r und Spearman ρ live nebeneinander."
	onReset={reset}
>
	<div class="flex flex-col gap-4">
		<!-- Live-Kennzahlen: Pearson und Spearman nebeneinander -->
		<div class="grid grid-cols-2 gap-3">
			<div class="bg-coral-50 rounded-2xl px-4 py-3">
				<div class="text-coral-700 text-sm font-semibold">Pearson r (linear)</div>
				<div class="text-ink text-3xl font-bold tabular-nums">{fmt(r)}</div>
				<div class="text-ink-faint text-xs">{strength(r)}</div>
			</div>
			<div class="bg-sage-100 rounded-2xl px-4 py-3">
				<div class="text-sage-500 text-sm font-semibold">Spearman ρ (monoton)</div>
				<div class="text-ink text-3xl font-bold tabular-nums">{fmt(rho)}</div>
				<div class="text-ink-faint text-xs">{strength(rho)}</div>
			</div>
		</div>

		<!-- Streudiagramm -->
		<svg
			bind:this={svgEl}
			viewBox="0 0 {W} {H}"
			class="border-ink/10 bg-paper-sunk/40 block h-auto w-full touch-none rounded-xl border select-none"
			role="img"
			aria-label="Streudiagramm Körpermasse gegen Hirnmasse. Pearson r = {fmt(
				r
			)}, Spearman ρ = {fmt(rho)}. {points.length} Punkte."
			onpointermove={onPointerMove}
			onpointerup={onPointerUp}
			onpointerdown={onCanvasClick}
		>
			<!-- Rahmen / Achsen -->
			<line
				x1={PAD_L}
				y1={PAD_T}
				x2={PAD_L}
				y2={PAD_T + plotH}
				stroke="var(--color-ink)"
				stroke-opacity="0.3"
			/>
			<line
				x1={PAD_L}
				y1={PAD_T + plotH}
				x2={W - PAD_R}
				y2={PAD_T + plotH}
				stroke="var(--color-ink)"
				stroke-opacity="0.3"
			/>

			<!-- Achsentitel -->
			<text
				x={PAD_L + plotW / 2}
				y={H - 6}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
			>
				Körpermasse →
			</text>
			<text
				x={14}
				y={PAD_T + plotH / 2}
				text-anchor="middle"
				font-size="11"
				fill="var(--color-ink-faint)"
				transform="rotate(-90 14 {PAD_T + plotH / 2})"
			>
				Hirnmasse →
			</text>

			<!-- Trendgerade (linear) -->
			{#if trendLine}
				<line
					x1={trendLine.x1}
					y1={trendLine.y1}
					x2={trendLine.x2}
					y2={trendLine.y2}
					stroke="var(--color-coral-500)"
					stroke-width="2"
					stroke-opacity="0.6"
					stroke-dasharray="6 4"
				/>
			{/if}

			<!-- Datenpunkte -->
			{#each points as p (p.id)}
				<circle
					cx={toPxX(p.x)}
					cy={toPxY(p.y)}
					r={dragId === p.id || selectedId === p.id ? 9 : 7}
					fill="var(--color-sage-500)"
					fill-opacity={dragId === p.id ? 0.95 : 0.75}
					stroke="var(--color-paper-raised)"
					stroke-width="2"
					class="cursor-grab focus:outline-none"
					style="touch-action: none;"
					role="button"
					tabindex="0"
					aria-label="Punkt bei Körpermasse {fmt(p.x)}, Hirnmasse {fmt(
						p.y
					)}. Mit den Pfeiltasten verschieben."
					onpointerdown={(ev) => onPointerDownDot(ev, p.id)}
					onkeydown={(ev) => onDotKeydown(ev, p.id)}
					onfocus={() => (selectedId = p.id)}
				/>
			{/each}
		</svg>

		<p class="text-ink-faint text-xs leading-relaxed">
			<strong>Probier es:</strong> Bei der Vorlage <em>U-Form / Parabel</em> ist Pearson r ≈ 0,
			obwohl ein klares Muster sichtbar ist — r misst eben nur die <em>lineare</em> Stärke. Bei
			<em>mit Ausreißer</em> schlägt Pearson dramatisch aus, während Spearman ρ ruhig bleibt: die
			Ränge lassen sich von einem einzelnen Punkt nicht so leicht täuschen. Zieh den Ausreißer ins
			Feld zurück und beide nähern sich wieder an.
		</p>
	</div>

	{#snippet controls()}
		<div class="flex flex-col gap-3">
			<div class="flex flex-wrap gap-2">
				{#each PRESET_LABELS as { key, label } (key)}
					<Button
						variant={activePreset === key ? 'primary' : 'subtle'}
						size="sm"
						onclick={() => loadPreset(key)}
					>
						{label}
					</Button>
				{/each}
			</div>
			<div class="flex flex-wrap gap-2">
				<Button variant="subtle" size="sm" onclick={addPoint}>+ Punkt</Button>
				<Button variant="subtle" size="sm" onclick={addOutlier}>+ Ausreißer</Button>
				<Button variant="subtle" size="sm" onclick={removeLast}>− letzten Punkt</Button>
			</div>
			<p class="text-ink-faint text-xs">
				Tipp: Punkte mit der Maus ziehen, in die freie Fläche klicken legt einen neuen an, oder
				einen Punkt anklicken und mit den Pfeiltasten verschieben (Umschalt = größere Schritte).
			</p>
		</div>
	{/snippet}
</Widget>
