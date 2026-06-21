# DS2 Lernwebsite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a German, intuition-first interactive SvelteKit website that teaches the UHH "Data Science 2 — Grundlagen der Statistik und experimentelles Design" course, starting with a fully polished keystone lesson (Zentraler Grenzwertsatz) and a reusable teaching kit.

**Architecture:** SvelteKit (Svelte 5 runes) prerendered to static files. A correctness-tested `lib/stats.ts` module is the numerical foundation. A reusable "teaching kit" of Svelte components (layout, callouts, formula reveal, quiz, widget frame) is built once, then every lesson is an mdsvex page that composes the kit plus a lesson-specific interactive widget. Foundation + keystone lesson ship first as the usable milestone; remaining 13 lessons follow the same established pattern.

**Tech Stack:** SvelteKit + Svelte 5, `@sveltejs/adapter-static`, Tailwind CSS v4, mdsvex, KaTeX, D3 helpers (`d3-scale`, `d3-shape`, `d3-random`), Vitest.

**Execution note — current APIs:** Svelte 5 runes, SvelteKit, mdsvex, and Tailwind v4 APIs move fast. For every Svelte/SvelteKit task, the implementer MUST consult the **Svelte MCP** (`list-sections` → `get-documentation`) and **context7** for current syntax before writing components, and validate `.svelte` files with the Svelte MCP autofixer. Use the `svelte:svelte-file-editor` agent for `.svelte` files where available.

**Design note — look & feel:** Visual polish is driven by the `frontend-design` skill per the spec's direction (warm & encouraging, neutrales „Du", light only; coral `#F2654E` / amber `#F5A623` on off-white `#FBF8F4`; rounded-2xl, soft shadows, friendly sans). Every lesson is verified end-to-end in **`chrome`** (click every control, check visuals/numbers, responsiveness, clean console) before it counts as done.

**Reference:** `docs/superpowers/specs/2026-06-21-ds2-lernwebsite-design.md`

---

### Task 0: Project setup & toolchain

**Goal:** A running SvelteKit + Svelte 5 app that builds to static files, with Tailwind v4, mdsvex, KaTeX, and Vitest wired up.

**Files:**
- Create: project scaffold (`package.json`, `svelte.config.js`, `vite.config.ts`, `src/app.css`, `src/routes/+layout.ts`, `src/routes/+page.svelte`)
- Create: `tailwind.config` integration per Tailwind v4 (CSS-first `@import "tailwindcss"`)

**Acceptance Criteria:**
- [ ] `npm run dev` serves a page at localhost
- [ ] `npm run build` produces a static `build/` (adapter-static, `prerender = true`)
- [ ] `npm run test` runs Vitest (even with zero tests) and exits 0
- [ ] An `.md`/`.svx` file renders via mdsvex on a route
- [ ] A KaTeX formula renders on the test page

**Verify:** `npm run build && npm run test` → build succeeds, tests pass

**Steps:**

- [ ] **Step 1:** Consult Svelte MCP (`list-sections`) and context7 for the current SvelteKit scaffold + Svelte 5 + adapter-static + Tailwind v4 + mdsvex setup. Scaffold with the current `sv create` (or equivalent) into the repo root.
- [ ] **Step 2:** Configure `@sveltejs/adapter-static`; set `export const prerender = true` in `src/routes/+layout.ts`.
- [ ] **Step 3:** Add Tailwind v4 (`@import "tailwindcss"` in `src/app.css`), mdsvex (extensions in `svelte.config.js`), KaTeX, and D3 helper deps.
- [ ] **Step 4:** Add a temporary `src/routes/+page.svelte` rendering "DS2 Lernwebsite" + one mdsvex snippet + one KaTeX formula to prove the pipeline.
- [ ] **Step 5:** Verify `npm run build` and `npm run test`, then open in `chrome` to confirm the page + formula render with a clean console.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "chore: scaffold SvelteKit + Tailwind + mdsvex + KaTeX + Vitest"`

---

### Task 1: `lib/stats.ts` — correctness-tested statistics core

**Goal:** A pure, dependency-light statistics module with unit tests, so every widget computes correct numbers.

**Files:**
- Create: `src/lib/stats.ts`
- Test: `src/lib/stats.test.ts`

**Acceptance Criteria:**
- [ ] `mean`, `variance` (sample, n−1), `sd`, `standardError` correct against known values
- [ ] `normalPdf`, `normalCdf`, `normalQuantile` correct to 1e−3 against reference values
- [ ] `drawSample(populationKind, n, rng)` returns n draws for `'normal' | 'exponential' | 'bimodal' | 'uniform'`
- [ ] A seeded RNG makes draws deterministic (for tests and reproducible widgets)
- [ ] All tests pass

**Verify:** `npm run test src/lib/stats.test.ts` → all pass

**Steps:**

- [ ] **Step 1: Write failing tests** (`src/lib/stats.test.ts`):

```ts
import { describe, it, expect } from 'vitest';
import { mean, variance, sd, standardError, normalCdf, normalQuantile, makeRng, drawSample } from './stats';

describe('descriptive', () => {
  const x = [2, 4, 4, 4, 5, 5, 7, 9];
  it('mean', () => expect(mean(x)).toBeCloseTo(5, 10));
  it('sample variance (n-1)', () => expect(variance(x)).toBeCloseTo(4.5714, 3));
  it('sd', () => expect(sd(x)).toBeCloseTo(2.1381, 3));
  it('standard error = sd/sqrt(n)', () => expect(standardError(x)).toBeCloseTo(sd(x) / Math.sqrt(x.length), 10));
});

describe('normal', () => {
  it('cdf(0)=0.5', () => expect(normalCdf(0)).toBeCloseTo(0.5, 4));
  it('cdf(1.96)≈0.975', () => expect(normalCdf(1.96)).toBeCloseTo(0.975, 3));
  it('quantile(0.975)≈1.96', () => expect(normalQuantile(0.975)).toBeCloseTo(1.96, 2));
});

describe('sampling', () => {
  it('is deterministic with a seed', () => {
    const a = drawSample('exponential', 50, makeRng(42));
    const b = drawSample('exponential', 50, makeRng(42));
    expect(a).toEqual(b);
    expect(a).toHaveLength(50);
  });
});
```

- [ ] **Step 2:** Run `npm run test src/lib/stats.test.ts` → expect FAIL (module not implemented).
- [ ] **Step 3: Implement `src/lib/stats.ts`** — pure functions: `mean`, `variance` (divide by n−1), `sd`, `standardError`; `normalPdf`; `normalCdf` (Abramowitz-Stegun erf approximation); `normalQuantile` (Acklam/Beasley-Springer inverse-normal); `makeRng(seed)` (mulberry32) returning `() => number` in [0,1); `drawSample(kind, n, rng)` using Box-Muller for normal, inverse-CDF for exponential, mixture for bimodal, identity for uniform. Export a `PopulationKind` type and a `POPULATIONS` descriptor map (label DE, true μ, true σ) for widgets.
- [ ] **Step 4:** Run tests → expect PASS.
- [ ] **Step 5: Commit** — `git add src/lib/stats.* && git commit -m "feat: add correctness-tested statistics core"`

---

### Task 2: Design system & global styling

**Goal:** Warm/encouraging light-only design tokens and base typography applied globally, per spec direction, via `frontend-design`.

**Files:**
- Modify: `src/app.css` (tokens as CSS variables + Tailwind v4 `@theme`)
- Create: `src/lib/components/Button.svelte`, `src/lib/components/Card.svelte` (base primitives)
- Modify: `src/routes/+page.svelte` (apply to the sample page)

**Acceptance Criteria:**
- [ ] CSS variables for background, text, primary (coral), secondary (amber), radii, shadow defined
- [ ] Friendly sans loaded (Inter or Nunito); headings styled
- [ ] `Button` and `Card` primitives render with rounded-2xl + soft shadow
- [ ] Sample page restyled and visually verified in `chrome`

**Verify:** `npm run build` succeeds; `chrome` shows warm light theme, clean console

**Steps:**

- [ ] **Step 1:** Invoke `frontend-design` to produce the token set + base primitives in the spec's direction (coral/amber on off-white, rounded, soft, generous spacing). Wire fonts.
- [ ] **Step 2:** Define tokens in `src/app.css` (Tailwind v4 `@theme`), build `Button` and `Card`.
- [ ] **Step 3:** Restyle the sample page; verify in `chrome` (layout, fonts, colors, responsiveness, console).
- [ ] **Step 4: Commit** — `git add -A && git commit -m "feat: warm light design system + base primitives"`

---

### Task 3: Teaching kit — structure (manifest, progress, layout, nav)

**Goal:** The lesson shell: a lessons manifest, a localStorage progress store, and the 3-track navigation layout.

**Files:**
- Create: `src/lib/lessons.ts` (manifest: 14 lessons, 3 tracks, slug/title/track/order)
- Create: `src/lib/stores/progress.svelte.ts` (rune-based store persisted to `localStorage`)
- Create: `src/lib/components/LessonLayout.svelte`, `TrackNav.svelte`, `ProgressDots.svelte`
- Test: `src/lib/stores/progress.test.ts`

**Acceptance Criteria:**
- [ ] `lessons.ts` lists all 14 lessons grouped into Grundlagen / Klausur-relevant / Der Rest (per spec §6)
- [ ] Progress store marks a lesson complete and persists across reload; unit-tested with a mocked storage
- [ ] `LessonLayout` renders sidebar (`TrackNav` + `ProgressDots`), content slot, prev/next
- [ ] Verified in `chrome`: nav shows 3 tracks, marking complete persists after reload

**Verify:** `npm run test src/lib/stores/progress.test.ts` passes; `chrome` confirms nav + persistence

**Steps:**

- [ ] **Step 1:** Consult Svelte MCP for current rune-store + `$state`/`$effect` + snippet/slot patterns.
- [ ] **Step 2: Write failing test** for `progress` (mark complete → `isComplete` true; persists to injected storage). Run → FAIL.
- [ ] **Step 3:** Implement `lessons.ts` manifest and `progress.svelte.ts` (rune state synced to `localStorage`, storage injectable for tests). Run test → PASS.
- [ ] **Step 4:** Build `LessonLayout`, `TrackNav`, `ProgressDots`; mount on a throwaway `/lektion/test` route. Validate `.svelte` with Svelte MCP autofixer.
- [ ] **Step 5:** Verify in `chrome` (3 tracks render, complete-toggle persists across reload, clean console).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: lesson manifest, progress store, 3-track layout"`

---

### Task 4: Teaching kit — content components

**Goal:** The reusable content components every lesson composes.

**Files:**
- Create: `src/lib/components/Intuition.svelte`, `Analogie.svelte`, `Merke.svelte` (callouts via one `Callout.svelte` + variant)
- Create: `src/lib/components/FormelZeigen.svelte` (collapsible KaTeX + symbol legend)
- Create: `src/lib/components/Begriff.svelte` (glossary tooltip) + `src/lib/glossary.ts`
- Create: `src/lib/components/RCode.svelte` (read-only R + annotated output)
- Create: `src/lib/components/Widget.svelte` (frame: title, controls slot, stage slot, reset)
- Create: `src/lib/components/Selbsttest.svelte` (quiz: MC / true-false / numeric, instant feedback)
- Test: `src/lib/components/Selbsttest.test.ts`

**Acceptance Criteria:**
- [ ] Callouts render with variant styling and slot content
- [ ] `FormelZeigen` toggles a KaTeX formula and renders a per-symbol legend from props
- [ ] `Begriff` shows a tooltip definition from `glossary.ts`
- [ ] `RCode` renders code + annotated output, read-only
- [ ] `Selbsttest` scores answers, shows correct/incorrect + explanation; scoring logic unit-tested
- [ ] All components shown together on a `/kit` demo route, verified in `chrome`

**Verify:** `npm run test src/lib/components/Selbsttest.test.ts` passes; `chrome` confirms all kit components on `/kit`

**Steps:**

- [ ] **Step 1:** Consult Svelte MCP/context7 for current snippet props + KaTeX-in-Svelte usage.
- [ ] **Step 2: Write failing test** for `Selbsttest` scoring (given questions + answers → correct count + per-question correctness). Run → FAIL.
- [ ] **Step 3:** Implement scoring helper + components above; build a `/kit` demo route composing all of them. Validate `.svelte` with Svelte MCP autofixer.
- [ ] **Step 4:** Run `Selbsttest` test → PASS. Apply `frontend-design` polish to the kit components.
- [ ] **Step 5:** Verify `/kit` in `chrome` (every component interactive, formula reveal, tooltip, quiz feedback, clean console).
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: teaching-kit content components"`

---

### Task 5: Keystone widget — `StichprobenverteilungWidget`

**Goal:** The flagship interactive: draw samples from a chosen population and watch the sampling distribution of the mean assemble, demonstrating the ZGW and SE = σ/√n.

**Files:**
- Create: `src/lib/widgets/StichprobenverteilungWidget.svelte`
- Create: `src/lib/widgets/Histogram.svelte` (reusable SVG histogram, Svelte-controlled, d3-scale for axes)
- Test: `src/lib/widgets/histogram-bins.test.ts` (binning helper in `src/lib/stats.ts` if added)

**Acceptance Criteria:**
- [ ] Population selector: normal / rechtsschief (exponential) / bimodal / gleichverteilt; shows population histogram + true μ marker
- [ ] Slider `n` (2–100); "Stichprobe ziehen" draws one sample (shown as points, its mean marked); "×100 ziehen" accumulates many means (animated)
- [ ] Sampling-distribution histogram of means builds live, with overlaid normal curve, Mittelwert-der-Mittelwerte ≈ μ, and SE = σ/√n shown (theoretical vs. observed)
- [ ] Increasing `n` visibly narrows the sampling distribution; skewed populations still yield a bell — the ZGW reveal
- [ ] Uses `lib/stats.ts` for all draws/stats; binning unit-tested; deterministic via seeded RNG option
- [ ] Verified in `chrome`: every control exercised, numbers sanity-checked, responsive, clean console

**Verify:** `npm run test` passes (binning); `chrome` end-to-end exercise of all controls

**Steps:**

- [ ] **Step 1:** Consult Svelte MCP for reactive `$state`/`$derived` + SVG patterns; confirm d3-scale usage via context7.
- [ ] **Step 2: Write failing test** for a `binCounts(values, min, max, nBins)` helper (add to `stats.ts`): known array → known bin counts. Run → FAIL.
- [ ] **Step 3:** Implement `binCounts`; build `Histogram.svelte` (props: values/bins/overlayCurve/markers) and `StichprobenverteilungWidget.svelte` composing it inside the kit `Widget` frame, using `lib/stats.ts` for draws and SE. Validate with Svelte MCP autofixer.
- [ ] **Step 4:** Run tests → PASS. Apply `frontend-design` polish.
- [ ] **Step 5:** Verify in `chrome`: switch all 4 populations, sweep `n`, draw single + ×100, confirm distribution narrows with n and bells out for skewed populations, SE readout matches σ/√n.
- [ ] **Step 6: Commit** — `git add -A && git commit -m "feat: keystone Stichprobenverteilung widget"`

---

### Task 6: Keystone lesson page + wire into nav  — FIRST USABLE MILESTONE

**Goal:** Lektion 1 "Von der Stichprobe zur Stichprobenverteilung" as a complete mdsvex page composing the kit + keystone widget, reachable from the nav.

**Files:**
- Create: `src/routes/lektion/stichprobenverteilung/+page.svx` (or `+page.svelte` importing mdsvex content)
- Modify: `src/lib/lessons.ts` (mark Lektion 1 live), `src/routes/+page.svelte` (home → lesson entry)

**Acceptance Criteria:**
- [ ] Page follows spec §7: encouraging intro (neutrales „Du") → widget → `FormelZeigen` SE=σ/√n with symbol legend → `Intuition` box → `Selbsttest` (3 questions: which becomes normal — data or means; effect of n on SE; ZGW under skew)
- [ ] Reachable from `TrackNav`; completing the Selbsttest marks the lesson done (progress persists)
- [ ] Full lesson verified end-to-end in `chrome`; `npm run build` produces static output
- [ ] German copy reviewed for clarity and tone (sachliches „Du")

**Verify:** `npm run build` succeeds; `chrome` walks the whole lesson incl. quiz + progress persistence

**Steps:**

- [ ] **Step 1:** Author the German lesson content in mdsvex, importing `StichprobenverteilungWidget`, `FormelZeigen`, `Intuition`, `Selbsttest`.
- [ ] **Step 2:** Wire into `lessons.ts` + home; ensure prev/next + progress integration.
- [ ] **Step 3:** Apply `frontend-design` pass for the full lesson page.
- [ ] **Step 4:** Verify end-to-end in `chrome` (read flow, every widget control, quiz feedback, completion persists, responsive, clean console). Build.
- [ ] **Step 5: Commit** — `git add -A && git commit -m "feat: keystone lesson Stichprobenverteilung (first usable milestone)"`

---

## Remaining lessons (Tasks 7–19)

Each remaining lesson is one task = its mdsvex content page + its flagship widget, composed from the established kit (Tasks 3–4) and `lib/stats.ts` (Task 1), following the keystone pattern (Tasks 5–6). **Per-lesson Definition of Done (applies to every task below):** content in German (sachliches „Du"); flagship widget uses tested `stats` helpers (add + unit-test any new helper); `FormelZeigen` with symbol legend where formulas appear; a 3-question `Selbsttest`; `frontend-design` polish; **verified end-to-end in `chrome`** (every control, numbers sane, responsive, clean console); wired into `lessons.ts` nav + progress; committed. Implementer consults Svelte MCP/context7 for current APIs and validates `.svelte` files with the autofixer. Build the two shared "rote-Faden" widgets (`SSZerlegung`, `AnnahmenBaum`) on first use and reuse thereafter.

### Task 7: Lektion 2 — Was ist Statistik? (Grundlagen)
**Widget:** Sortier-Spiel — drag statements into Deskriptiv / Inferentiell / Explorativ buckets, instant feedback. **Files:** `src/routes/lektion/was-ist-statistik/+page.svx`, `src/lib/widgets/SortierSpiel.svelte`. **Key content:** 3 Teildisziplinen, Grundgesamtheit vs. Stichprobe, beobachtend vs. manipulativ, explorativ vs. konfirmatorisch, „Statistik repariert keine schlechten Daten". **Verify:** chrome end-to-end.

### Task 8: Lektion 3 — Wahrscheinlichkeit & Bayes (Grundlagen)
**Widget:** Bayes-Box — 100×100 (10.000-Personen) grid; sliders Prävalenz / Sensitivität / Spezifität; cells recolor (true/false pos/neg); shows P(infiziert|positiv). **Files:** `src/routes/lektion/wahrscheinlichkeit-bayes/+page.svx`, `src/lib/widgets/BayesBox.svelte`. **Key content:** P(A|B)≠P(B|A), Basisraten-Effekt, bedingte Wahrscheinlichkeit, Sensitivität/Spezifität. Add+test any Bayes helper in `stats.ts`. **Verify:** chrome end-to-end.

### Task 9: Lektion 4 — Verteilungen & die Glockenkurve (Grundlagen)
**Widget:** Flächen-Schieber — drag bounds a/b over an N(μ,σ) curve with μ/σ sliders; shaded area + live `pnorm` value; optional z↔x toggle. **Files:** `src/routes/lektion/verteilungen/+page.svx`, `src/lib/widgets/FlaechenSchieber.svelte`. **Key content:** Fläche = Wahrscheinlichkeit, PDF vs. CDF, Z-Transformation, 68-95-99,7-Regel. Uses `normalPdf`/`normalCdf`. **Verify:** chrome end-to-end.

### Task 10: Lektion 5 — Schätzen & Konfidenzintervalle (Grundlagen)
**Widget:** Sampling-Maschine — repeatedly draw samples; each draws a horizontal CI; intervals missing the fixed μ glow red; counter converges to confidence level. **Files:** `src/routes/lektion/konfidenzintervalle/+page.svx`, `src/lib/widgets/SamplingMaschine.svelte`. **Key content:** KI-Fehldeutung (fixes μ, zufälliges Intervall), z vs. t, SE vs. SD, Konfidenz↔Breite Trade-off. Add+test t-quantile helper. **Verify:** chrome end-to-end.

### Task 11: Lektion 6 — Hypothesentest & der p-Wert (Grundlagen)
**Widget:** α/β/Power-Schieberegler (two overlapping H0/HA bells; sliders effect, α, n; shaded α & β areas, Power readout) + p-Wert-Würfelspiel (toggle "H0 wahr" → ~5% still significant). **Files:** `src/routes/lektion/hypothesentest/+page.svx`, `src/lib/widgets/PowerVisualizer.svelte`, `src/lib/widgets/PWertSpiel.svelte`. **Key content:** p = P(Daten|H0), Fehler 1./2. Art, „nicht signifikant ≠ kein Unterschied", 8-Schritte-Schema. **Verify:** chrome end-to-end.

### Task 12: Lektion 7 — t-Tests & nicht-parametrische Alternativen (Klausur-relevant)
**Widget:** Signal-vs-Rausch-Regler — sliders Δμ, s, n → live t, p, overlapping histograms. **Files:** `src/routes/lektion/t-tests/+page.svx`, `src/lib/widgets/SignalRausch.svelte`. Build shared **`AnnahmenBaum`** here (first use). **Key content:** t = Signal/Rausch, Welch vs. Student default, gepaart vs. unabhängig, Voraussetzungstests rückwärts lesen, Wilcoxon/Mann-Whitney. Add+test t-statistic helper. **Verify:** chrome end-to-end.

### Task 13: Lektion 8 — Chi-Quadrat-Tests (Klausur-relevant)
**Widget:** Kontingenztafel-Editor — type observed counts; auto-compute expected from margins, per-cell (B−E)²/E (color-coded), χ², df, p; warn E<5 → Fisher. **Files:** `src/routes/lektion/chi-quadrat/+page.svx`, `src/lib/widgets/KontingenztafelEditor.svelte`. **Key content:** E aus Randsummen = Unabhängigkeits-H0, df, Yates, Fisher bei kleinem E, nur Häufigkeiten. Add+test chi-square helpers. **Verify:** chrome end-to-end.

### Task 14: Lektion 9 — ANOVA & Mehrstichprobentests (Klausur-relevant)
**Widget:** F-Ratio-Regler (sliders group-mean spread + within-group spread → 3 bells, SS between/within bar, F, p) + FWER-Roulette (simulate many random tests, count false hits, `1−(1−α)^c` curve, Bonferroni toggle). **Files:** `src/routes/lektion/anova/+page.svx`, `src/lib/widgets/FRatio.svelte`, `src/lib/widgets/FwerRoulette.svelte`. Build shared **`SSZerlegung`** here (first use). **Key content:** F = zwischen/innerhalb, FWER, η², Annahmen, Tukey/Post-hoc. Add+test SS/F helpers. **Verify:** chrome end-to-end.

### Task 15: Lektion 10 — Korrelation & Transformation (Klausur-relevant)
**Widget:** Scatter-Builder — drag points / add outlier; Pearson r and Spearman ρ update side by side (U-shape → Pearson≈0; outlier kicks Pearson, not Spearman). **Files:** `src/routes/lektion/korrelation/+page.svx`, `src/lib/widgets/ScatterBuilder.svelte`. **Key content:** r = standardisierte Kovarianz, r misst nur linear, Korrelation≠Kausalität, Pearson vs. Spearman, Box-Cox/λ. Add+test Pearson/Spearman helpers. **Verify:** chrome end-to-end.

### Task 16: Lektion 11 — Lineare Regression (Klausur-relevant)
**Widget:** drag data points → least-squares line, vertical residuals, R², SS-decomposition bar (reuse `SSZerlegung`); a leverage point dramatically tilts the line. **Files:** `src/routes/lektion/regression/+page.svx`, `src/lib/widgets/RegressionBuilder.svelte`. **Key content:** R² ≠ Signifikanz, Residuen-Diagnostik, Kleinste-Quadrate, Hebelpunkt/Cook's D. Add+test OLS (slope/intercept/R²) helpers. **Verify:** chrome end-to-end.

### Task 17: Lektion 12 — Experimentelles Design & Power (Der Rest)
**Widget:** Power-Spielplatz — 4 coupled sliders (Effektgröße/delta, SD, n, α) → live Power + power curve; task prompts ("hold Power=0.8, double variance → what happens to n?"). **Files:** `src/routes/lektion/power/+page.svx`, `src/lib/widgets/PowerSpielplatz.svelte`. **Key content:** Power ≠ Signifikanz, gekoppeltes System Power∝ES·√n/σ, Replikation vs. Pseudoreplikation (intro), Effektgröße. Add+test power.t.test-style helper. **Verify:** chrome end-to-end.

### Task 18: Lektion 13 — Designtypen & Pseudoreplikation (Der Rest)
**Widget:** Pseudoreplikations-Falle — dataset with subsamples; choose analysis (naive `aov` vs. per-unit means vs. `Error()`); p-value and df inflate/correct live. **Files:** `src/routes/lektion/designtypen/+page.svx`, `src/lib/widgets/PseudoreplikationsFalle.svelte`. **Key content:** Grundgleichung (Behandlung+Biologie+Technik+Fehler), CRD/RBD/nested/split-plot, Faktor vs. numerisch, Pseudoreplikation bläht df. **Verify:** chrome end-to-end.

### Task 19: Lektion 14 — Welcher Test? (Der Rest)
**Widget:** „Welcher Test?"-Entscheidungsbaum-Spiel — answer Datentyp / Gruppenzahl / gepaart? / Annahmen? → lands on the right test; counters with traps (3 Gruppen → 3 t-Tests?). Reuse `AnnahmenBaum`. **Files:** `src/routes/lektion/welcher-test/+page.svx`, `src/lib/widgets/EntscheidungsbaumSpiel.svelte`. **Key content:** Testwahl aus Frage+Design+Datentyp (vor p), gepaart vs. unabhängig, ANOVA statt mehrerer t-Tests, parametrisch vs. rangbasiert. Fallbeispiel-Sandbox optional. **Verify:** chrome end-to-end.

---

## Self-Review

**Spec coverage:** §1–4 context/design → Tasks 0,2 + global notes. §5 teaching kit → Tasks 3–4 (every component mapped). §6 all 14 lessons → Tasks 6–19 (each lesson present). §7 keystone → Tasks 5–6. §8 build order → task order. §9 verification → per-task chrome verify + DoD. §2 stats correctness → Task 1 + per-widget helper tests. Shared widgets `SSZerlegung`/`AnnahmenBaum` → first-use in Tasks 14/12. No gaps.

**Placeholders:** None unresolved — Tasks 0–6 carry concrete steps/code; Tasks 7–19 carry concrete widget behavior, files, and a shared Definition of Done. Per-widget numeric helpers are TDD'd as they arise.

**Type consistency:** `lib/stats.ts` is the single source for numeric functions; widgets import from it. Component names match between manifest, layout, and lesson pages.
