# Statistikkurs-Verfeinerung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers-extended-cc:subagent-driven-development (recommended) or superpowers-extended-cc:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verfeinere den bestehenden DS2-Statistikkurs entlang sechs Anmerkungen des Betreibers, ohne das Funktionierende zu zerstören.

**Architecture:** Chirurgischer Refinement-Pass über eine bestehende SvelteKit-Site (Svelte 5 runes). Sechs Workstreams, sequenziell. Widgets werden punktuell angepasst (konstante x-Achse, Würfelspiel-Redesign), Lektions-Inhalte 5/6/7 intuition-first umgebaut, ein Recap-Feature quer über alle Lektionen ergänzt, und ein UX-Audit der interaktiven Elemente mit Review-Gate durchgeführt.

**Tech Stack:** SvelteKit + adapter-static, Svelte 5 runes, Tailwind v4, mdsvex-Style `.svelte`-Lektionsseiten, KaTeX, Vitest, svelte-check. Gemeinsame Kurven-Helfer in `src/lib/widgets/curve.ts`. Lektions-Reihenfolge in `src/lib/lessons.ts`. Selbsttest-Komponente in `src/lib/components/Selbsttest.svelte`.

**Spec:** `docs/superpowers/specs/2026-07-01-statistikkurs-verfeinerung-design.md`

**Konventionen:** Deutsch mit echten Umlauten (ö/ä/ü/ß). Biologische Beispiele. Ton: neutrales „Du". R-Code nutzt ASCII-Bezeichner, Umlaute nur in Prosa. Nach jeder Widget-/Lektionsänderung: `npm run check` grün, betroffene Seite in Chrome sichten.

**Globale Verify-Befehle:**
- `npm run check` → svelte-check, 0 errors
- `npm run test` → vitest, alle grün
- `npm run build` → statischer Build ohne Fehler

---

### Task 1: Konstante x-Achse bei Verteilungs-/Kurven-Widgets

**Goal:** Bei allen Glockenkurven-Widgets bleibt der x-Achsenbereich beim Reglerziehen konstant; nur die Kurve bewegt sich.

**Files:**
- Modify: `src/lib/widgets/SignalRausch.svelte` (Domain `lo`/`hi` aus `delta`,`s` abgeleitet — `halfSpan` bei `:46`)
- Modify: `src/lib/widgets/FlaechenSchieber.svelte` (`lo = mu - 4*sigma`, `hi = mu + 4*sigma` bei `:36-37`)
- Modify: `src/lib/widgets/PowerVisualizer.svelte` (`lo/hi` aus `delta` bei `:52-53`)
- Modify: `src/lib/widgets/FRatio.svelte` (`lo/hi = BASE ∓ halfSpan` bei `:63-64`)
- Investigate (fix nur falls x mit Slider skaliert): `src/lib/widgets/Histogram.svelte`, `src/lib/widgets/PowerSpielplatz.svelte`, `src/lib/widgets/SamplingMaschine.svelte`, `src/lib/widgets/StichprobenverteilungWidget.svelte`
- Ausgenommen: `RegressionBuilder.svelte`, `ScatterBuilder.svelte` (Streudiagramme, echte Datenbereiche)

**Acceptance Criteria:**
- [ ] In SignalRausch, FlaechenSchieber, PowerVisualizer, FRatio ist die x-Achsen-Domain eine Konstante (nicht mehr `$derived` aus Slider-State), großzügig genug für den gesamten Reglerbereich.
- [ ] Beim Ziehen jedes Reglers bleibt der x-Rahmen stehen; die Kurve wird sichtbar breiter/schmaler/verschoben.
- [ ] Die vier Investigate-Widgets sind geprüft; wo x mit dem Slider skaliert, ebenso fixiert; sonst dokumentiert warum unverändert (Commit-Message).
- [ ] `npm run check` und `npm run test` grün (bestehende `curve.test.ts` bleibt gültig).

**Verify:** `npm run check && npm run test` → 0 errors, alle Tests grün; danach `npm run dev`, jedes Widget in Chrome öffnen, Regler ziehen, x-Achse steht.

**Steps:**

- [ ] **Step 1: Fix-Muster an SignalRausch anwenden.** Die abgeleitete Spanne durch eine feste ersetzen, die den ganzen Slider-Bereich abdeckt (Δ bis 800, s bis 700 → `3·700 = 2100` plus halbes max-Δ). Konkret in `SignalRausch.svelte` die Zeilen um `:46` ersetzen:

```ts
// vorher:
// const halfSpan = $derived(Math.max(delta / 2 + 3 * s, 600));
// const lo = $derived(BASE - halfSpan);
// const hi = $derived(BASE + halfSpan);

// nachher: feste km-Achse, weit genug für max. Δ (800) und max. s (700).
const HALF_SPAN = 800 / 2 + 3 * 700; // = 2500 km, deckt jeden Reglerstand ab
const lo = BASE - HALF_SPAN;
const hi = BASE + HALF_SPAN;
```

`scaleX` bleibt `$derived` (hängt jetzt nur noch von Konstanten ab — funktioniert unverändert). Nichts weiter in der SVG-Geometrie ändern.

- [ ] **Step 2: Verify SignalRausch visuell.** `npm run dev`, Widget in `/lektion/t-tests` öffnen. Streuung `s` hochdrehen → die Kurven werden flacher/breiter, aber die „Zugdistanz (km)"-Achse bleibt stehen. Vorher wanderte der Rahmen mit.

- [ ] **Step 3: Gleiches Muster auf FlaechenSchieber anwenden.** In `:36-37` `lo`/`hi` von `mu`/`sigma` entkoppeln. Feste Domain um den festen Bezugspunkt der z-/Werteachse spannen (max. `sigma` aus dem Slider ablesen, `mu ± 4·sigma_max` als Konstante). Slider-Grenzen der Komponente prüfen und `HALF_SPAN` entsprechend fest wählen, sodass die Kurve bei jedem `sigma` vollständig sichtbar bleibt.

- [ ] **Step 4: Gleiches Muster auf PowerVisualizer anwenden.** In `:52-53` die von `delta` abhängige Domain durch eine feste ersetzen, die den ganzen `delta`-Reglerbereich plus `±3.5` abdeckt. Die α-/β-Flächen (`bellAreaPath`) und die Entscheidungslinie beziehen sich weiter auf `sx` — nur die Domain-Konstanten ändern.

- [ ] **Step 5: Gleiches Muster auf FRatio anwenden.** In `:63-64` `halfSpan` fixieren.

- [ ] **Step 6: Vier Investigate-Widgets prüfen.** Für Histogram, PowerSpielplatz, SamplingMaschine, StichprobenverteilungWidget: hängt die x-Achsen-Domain von veränderlichem State ab? Falls ja und es eine Verteilungs-/Kurvenachse ist → fixieren. SamplingMaschine zeigt Konfidenzintervalle um ein festes μ — die Hauptachse sollte bereits fest sein; nur bestätigen. Histogram/StichprobenverteilungWidget bilden ggf. echte Datenbereiche ab → dann bewusst NICHT anfassen.

- [ ] **Step 7: Verify & Commit.**

```bash
npm run check && npm run test
git add src/lib/widgets/
git commit -m "fix: keep x-axis constant on distribution widgets so curves visibly move"
```

---

### Task 2: Würfelspiel-Redesign (`PWertSpiel.svelte`)

**Goal:** Der Fehlalarm-Zähler steht am Ende und ist klar als solcher gerahmt; „signifikant" wirkt nicht mehr wie das Ziel.

**Files:**
- Modify: `src/lib/widgets/PWertSpiel.svelte` (nur Template/Reihenfolge/Texte im `<Widget>`-Body, `:96-160`)

**Acceptance Criteria:**
- [ ] Reihenfolge im Body: (1) letztes Experiment, (2) Punkteraster der Läufe, (3) erklärender Fließtext, (4) **ganz unten** der Zähler „signifikant X von Y (…%)".
- [ ] Der Zähler ist als Fehlalarm-Quote gerahmt: bei H0 wahr explizit „= reine Fehlalarme in einer zufälligen Stichprobe — in Wahrheit **kein** Unterschied, trotzdem ~5 %".
- [ ] Die große Coral-`bg-coral-50`-Kopfbox oben entfällt/wird neutralisiert; Coral bleibt nur als Kodierung „signifikant" im Raster und in der Legende.
- [ ] Simulationslogik (`experiment`, `runMany`, `reset`, rng/seed) unverändert.
- [ ] `npm run check` grün.

**Verify:** `npm run dev` → `/lektion/hypothesentest`, 100 Experimente mit H0-wahr laufen lassen: der Zähler unten zeigt ~5 % und ist eindeutig als Fehlalarm-Quote lesbar; ein Statistik-Laie versteht die Botschaft ohne Vorwissen.

**Steps:**

- [ ] **Step 1: Kopf-Zähler-Box entfernen.** Den Block `:102-114` (`<!-- Zähler -->` … `bg-coral-50`) aus dem oberen Bereich herausnehmen.

- [ ] **Step 2: Reihenfolge herstellen.** Im Body zuerst „Letztes Experiment" (`:116-134`), dann „Punkteraster" (`:136-152`), dann den erklärenden `<p>` (`:154-159`).

- [ ] **Step 3: Zähler als Fazit ans Ende setzen.** Nach dem Raster/Erklärtext einen neuen, ruhig gestalteten Fazit-Block einfügen (keine schreiende Coral-Fläche, z. B. `bg-paper-sunk`/neutral), der den Zähler trägt:

```svelte
{#if total > 0}
  <div class="border-ink/10 bg-paper-sunk mt-1 rounded-2xl border px-4 py-3">
    <div class="flex flex-wrap items-baseline gap-x-3">
      <span class="text-ink-soft font-semibold">Ergebnis nach {total} Experimenten:</span>
      <span class="text-ink text-2xl font-bold tabular-nums">{sig} von {total}</span>
      <span class="text-ink-soft tabular-nums">signifikant ({fmt1(sigPct)} %)</span>
    </div>
    <p class="text-ink-faint mt-1 text-sm">
      {#if h0Wahr}
        Das sind <strong>reine Fehlalarme</strong>: In Wahrheit gibt es keinen Unterschied —
        und trotzdem ruft rund jedes zwanzigste Experiment „signifikant" (≈ α = 5 %).
      {:else}
        Wahrer Unterschied = {fmt1(effekt)} Einheiten — hier sind signifikante Treffer echte Funde.
      {/if}
    </p>
  </div>
{/if}
```

- [ ] **Step 4: Legende prüfen.** Der bestehende Legenden-`<p>` (`:154-159`) bleibt, aber so umstellen, dass er VOR dem Fazit-Zähler steht und Coral/Sage nur als „signifikant/nicht signifikant" erklärt — ohne Wertung, die Wertung („Fehlalarm") liefert der Fazit-Block.

- [ ] **Step 5: Verify & Commit.**

```bash
npm run check
git add src/lib/widgets/PWertSpiel.svelte
git commit -m "feat: reframe p-value dice game — false-alarm tally moved to the end"
```

---

### Task 3: Recap-Mechanik (`Rueckblick`-Komponente + Auflösung der Vorlektion)

**Goal:** Eine wiederverwendbare „Weißt du noch?"-Komponente, die zu einer Lektion automatisch die Recap-Fragen der VORHERIGEN Lektion rendert.

**Files:**
- Create: `src/lib/components/recap-fragen.ts` (Datenmodul: slug → Recap-`Question[]`, + `recapForLesson(slug)`-Resolver)
- Create: `src/lib/components/recap-fragen.test.ts` (Resolver-Tests)
- Create: `src/lib/components/Rueckblick.svelte` (dünner Wrapper um `Selbsttest`)
- Reference: `src/lib/lessons.ts` (`orderedLessons`, um Vorgänger zu finden), `src/lib/components/selbsttest-logic.ts` (`Question`-Typ)

**Acceptance Criteria:**
- [ ] `recapForLesson(slug)` liefert die Recap-Fragen der direkt vorangehenden Lektion (nach `order`), oder `[]` für die erste Lektion.
- [ ] `Rueckblick.svelte` rendert nichts, wenn keine Fragen vorliegen (erste Lektion), sonst einen `Selbsttest` mit Recap-Rahmung (Titel „Weißt du noch?", kurzer Intro-Satz, **kein** `onComplete` → markiert die Lektion nicht als abgeschlossen).
- [ ] Tests für den Resolver grün (erste Lektion → leer; mittlere Lektion → Fragen der Vorlektion; unbekannter slug → leer).
- [ ] `npm run check` und `npm run test` grün.

**Verify:** `npm run test -- recap-fragen` → PASS.

**Steps:**

- [ ] **Step 1: Failing test für den Resolver.** `src/lib/components/recap-fragen.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { recapForLesson } from './recap-fragen';

describe('recapForLesson', () => {
  it('gibt für die erste Lektion keine Recap-Fragen zurück', () => {
    expect(recapForLesson('was-ist-statistik')).toEqual([]);
  });

  it('gibt für eine mittlere Lektion die Fragen der Vorlektion zurück', () => {
    // hypothesentest (order 6) → Recap von konfidenzintervalle (order 5)
    const qs = recapForLesson('hypothesentest');
    expect(qs.length).toBeGreaterThan(0);
  });

  it('gibt für einen unbekannten slug ein leeres Array zurück', () => {
    expect(recapForLesson('gibt-es-nicht')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test — erwartet FAIL** (`recap-fragen.ts` existiert noch nicht). `npm run test -- recap-fragen`.

- [ ] **Step 3: `recap-fragen.ts` implementieren.** Datenmodul mit den Recap-Fragen je Lektion (keyed nach der Lektion, die zusammengefasst wird) und Resolver, der über `orderedLessons` den Vorgänger findet:

```ts
import { orderedLessons } from '$lib/lessons';
import type { Question } from './selbsttest-logic';

/** Recap-Fragen, keyed nach dem slug der Lektion, DIE zusammengefasst wird. */
export const recapQuestions: Record<string, Question[]> = {
  // wird in Task 4 mit echten Fragen für alle Lektionen 1–13 gefüllt.
};

/** Recap-Fragen der Lektion, die VOR `slug` kommt (oder [] für die erste). */
export function recapForLesson(slug: string): Question[] {
  const idx = orderedLessons.findIndex((l) => l.slug === slug);
  if (idx <= 0) return [];
  const prev = orderedLessons[idx - 1];
  return recapQuestions[prev.slug] ?? [];
}
```

Für den Test in Step 1 mindestens die Recap-Fragen für `konfidenzintervalle` (Vorgänger von `hypothesentest`) hier eintragen; der Rest folgt in Task 4.

- [ ] **Step 4: Run test — erwartet PASS.** `npm run test -- recap-fragen`.

- [ ] **Step 5: `Rueckblick.svelte` implementieren.**

```svelte
<script lang="ts">
  import Selbsttest from './Selbsttest.svelte';
  import { recapForLesson } from './recap-fragen';

  let { slug }: { slug: string } = $props();
  const questions = recapForLesson(slug);
</script>

{#if questions.length > 0}
  <div class="mb-2">
    <p class="text-ink-faint mb-2 text-sm">Kurzer Rückblick auf die letzte Lektion:</p>
    <Selbsttest {questions} title="Weißt du noch?" />
  </div>
{/if}
```

- [ ] **Step 6: Verify & Commit.**

```bash
npm run check && npm run test
git add src/lib/components/recap-fragen.ts src/lib/components/recap-fragen.test.ts src/lib/components/Rueckblick.svelte
git commit -m "feat: add Rueckblick recap component resolving the previous lesson"
```

---

### Task 4: Recap-Inhalte verfassen + Rollout auf Lektionen 2–14

**Goal:** Für jede Lektion 1–13 sind 1–2 Recap-Fragen zu ihren Kernpunkten verfasst; jede Lektion 2–14 zeigt oben `<Rueckblick>`.

**Files:**
- Modify: `src/lib/components/recap-fragen.ts` (`recapQuestions` mit Fragen für alle 13 zusammenzufassenden Lektionen füllen)
- Modify: die 13 Lektionsseiten `src/routes/lektion/<slug>/+page.svelte` für alle außer `was-ist-statistik` (Reihenfolge/slugs siehe `lessons.ts`)

**Acceptance Criteria:**
- [ ] `recapQuestions` enthält für jede der Lektionen 1–13 (alle außer `welcher-test`) 1–2 Fragen, die deren zentrale Aussage treffen (mc oder true/false, mit Erklärung).
- [ ] Jede Lektionsseite 2–14 rendert `<Rueckblick slug="<eigener-slug>" />` an prominenter Stelle ganz oben im Lektions-Inhalt (nach dem LessonLayout-Kopf, vor dem ersten Fachabschnitt).
- [ ] `was-ist-statistik` bleibt ohne Recap (erste Lektion).
- [ ] Umlaute korrekt; biologischer Kontext wo passend; `npm run check` & `npm run test` grün; `npm run build` erfolgreich.

**Verify:** `npm run dev` → mehrere Lektionen (z. B. `/lektion/hypothesentest`, `/lektion/anova`) öffnen: oben erscheint „Weißt du noch?" mit Fragen zur jeweils vorigen Lektion; `/lektion/was-ist-statistik` zeigt keinen Recap.

**Steps:**

- [ ] **Step 1: Kernaussagen sammeln.** Für jede Lektion 1–13 aus ihrer bestehenden Seite + ihrem `Selbsttest` die 1–2 zentralen Punkte destillieren (der end-of-lesson Selbsttest ist die beste Quelle für die Kernmissverständnisse).

- [ ] **Step 2: `recapQuestions` füllen.** Je Lektion 1–2 `Question`-Objekte (Format wie in bestehenden Selbsttests: `{ id, kind: 'mc'|'tf', prompt, options?, answer, explanation }` — exaktes Schema aus `selbsttest-logic.ts` übernehmen). IDs eindeutig prefixen, z. B. `recap-<slug>-1`.

- [ ] **Step 3: `<Rueckblick>` in jede Seite 2–14 einbauen.** Import ergänzen und direkt nach dem Lektions-Kopf einsetzen. Muster pro `+page.svelte`:

```svelte
<script>
  import Rueckblick from '$lib/components/Rueckblick.svelte';
  // …bestehende Imports
</script>

<!-- ganz oben im Inhalt, vor dem ersten Fachabschnitt: -->
<Rueckblick slug="hypothesentest" />
```

Den `slug` je Seite auf den EIGENEN slug setzen (die Komponente löst daraus die Vorlektion auf). Bestehendes Muster einer Lektionsseite prüfen und die Einfügestelle konsistent wählen.

- [ ] **Step 4: Verify & Commit.**

```bash
npm run check && npm run test && npm run build
git add src/lib/components/recap-fragen.ts src/routes/lektion/
git commit -m "feat: recap questions at the start of lessons 2-14"
```

---

### Task 5: Vereinfachung Lektion 5 — Schätzen & Konfidenzintervalle

**Goal:** `konfidenzintervalle` liest sich intuition-first; harte Formeln optional eingeklappt, dichte Abschnitte gesplittet, Jargon glossiert, Schlüssel-Caveats im Haupttext.

**Files:**
- Modify: `src/routes/lektion/konfidenzintervalle/+page.svelte`
- Verfügbare Bausteine: `FormelZeigen`, `Begriff`, `Merke`, `Intuition`, `Callout`, `Analogie` (in `src/lib/components/`)

**Acceptance Criteria:**
- [ ] Jede harte Idee hat Klartext-Intuition VOR der Formel; `E(X̄)=μ`, `SE=σ/√n`, `x̄ ± z·SE` in `FormelZeigen` eingeklappt oder klar nach der Intuition platziert.
- [ ] „Warum n−1" in kleine Ein-Konzept-Schritte gesplittet (Erwartungstreue / Freiheitsgrade nicht mehr im selben Absatz gestapelt).
- [ ] Kritische z-Werte (1,65/1,96/2,58) bekommen einen Satz Herkunft (Quantile der Normalverteilung), nicht nur eine Liste zum Auswendiglernen.
- [ ] „σ unbekannt"-Caveat steht VOR dem SamplingMaschine-Widget, nicht danach.
- [ ] Neuer Jargon (Erwartungstreue, Freiheitsgrade, Grundgesamtheit) bei Erstnutzung mit `Begriff` kurz erklärt.
- [ ] Biologie-Beispiel (Vogelmarkierung), Hufeisen-Analogie, Merke-Boxen, Selbsttest, Widget-Platzierung unverändert erhalten.
- [ ] `npm run check` grün, `npm run build` erfolgreich.

**Verify:** `npm run dev` → `/lektion/konfidenzintervalle` von oben lesen: Reihenfolge Intuition→Formel stimmt, keine Formel steht nackt vor ihrer Erklärung, Widget-Vorlauf enthält den σ-Hinweis.

**Steps:**

- [ ] **Step 1: Seite lesen und Umbau-Punkte markieren** (Hotspots aus Spec: Latein/Griechisch-Notation, `E(X̄)`, n−1, z-Werte, σ-Timing, t-Verteilung).
- [ ] **Step 2: Intuition-first-Umbau je Hotspot.** Pro Hotspot: Klartext-Satz davor, Formel in `FormelZeigen` oder direkt danach. Dichte Absätze in mehrere kurze Absätze/Schritte teilen. `Begriff`-Glossierung bei Erstnutzung.
- [ ] **Step 3: σ-Caveat vor das Widget ziehen.** Den „σ bekannt"-Callout aus dem Nach-Widget-Bereich vor die Widget-Einbettung verschieben und als Vorab-Hinweis umformulieren.
- [ ] **Step 4: Verify visuell & Commit.**

```bash
npm run check && npm run build
git add src/routes/lektion/konfidenzintervalle/
git commit -m "refactor: intuition-first simplification of lesson 5 (confidence intervals)"
```

---

### Task 6: Vereinfachung Lektion 6 — Hypothesentest & der p-Wert

**Goal:** `hypothesentest` intuition-first: Popper praktischer, Notation gestützt, einseitig/zweiseitig entzerrt, p-Wert-Bedingung intuitiv, Fehler/Power entflochten.

**Files:**
- Modify: `src/routes/lektion/hypothesentest/+page.svelte`
- Bausteine: `FormelZeigen`, `Begriff`, `Merke`, `Intuition`, `Callout`

**Acceptance Criteria:**
- [ ] Popper/Falsifikation an das konkrete Blatt-Beispiel gebunden statt philosophisch vorangestellt.
- [ ] H0/HA mit visueller Stütze (Klartext „gleich" vs. „verschieden") neben der Subskript-Notation.
- [ ] Abschnitt „einseitig vs. zweiseitig" entzerrt: nicht zwei `Merke` am Stück; Richtungswahl-Warnung (erst Daten, dann einseitig = p-hacking) sichtbar hervorgehoben.
- [ ] p-Wert-Formel mit Bedingungsstrich `|` bekommt einen Klartext-Satz: „Wahrscheinlichkeit solcher Daten, WENN H0 gilt" — und expliziten Kontrast zu `P(H0 | Daten)`.
- [ ] Fehler 1. Art, Fehler 2. Art und Power nicht mehr in einem Block; der α-β-Tradeoff aus dem Callout in den Haupttext gezogen.
- [ ] Gericht-Analogie, „Absence of evidence"-Intuition, Merke, Selbsttest, beide Widgets (PWertSpiel, PowerVisualizer) unverändert erhalten.
- [ ] `npm run check` grün, `npm run build` erfolgreich.

**Verify:** `npm run dev` → `/lektion/hypothesentest` lesen: die genannten Abschnitte sind entzerrt; die p-Wert-Bedingungsrichtung ist in Klartext erklärt.

**Steps:**

- [ ] **Step 1: Seite lesen, Hotspots markieren** (Popper, H0/HA-Notation, einseitig/zweiseitig-Dichte, `|`-Bedingung, Fehler+Power-Block).
- [ ] **Step 2: Umbau je Hotspot** nach dem Muster aus Task 5 (Intuition/Klartext vor Formel, splitten, glossieren, Caveats hochziehen). Den Fehler/Power-Abschnitt in klar getrennte Unterabschnitte teilen.
- [ ] **Step 3: Verify & Commit.**

```bash
npm run check && npm run build
git add src/routes/lektion/hypothesentest/
git commit -m "refactor: intuition-first simplification of lesson 6 (hypothesis test)"
```

---

### Task 7: Vereinfachung Lektion 7 — t-Tests & nicht-parametrische Alternativen

**Goal:** `t-tests` intuition-first: `√(2/n)` motiviert, Cohen's d schrittweise, drei Varianten entzerrt, Voraussetzungen mit Schwellen-Klartext.

**Files:**
- Modify: `src/routes/lektion/t-tests/+page.svelte`
- Bausteine: `FormelZeigen`, `Begriff`, `Merke`, `Intuition`, `Callout`

**Acceptance Criteria:**
- [ ] `SE = s·√(2/n)`: die „2" wird erklärt (zwei Gruppen) BEVOR die Formel steht; der „vereinfachter Fall"-Hinweis vor die Formel.
- [ ] Cohen's d schrittweise: erst Intuition „Miss in Standardabweichungen statt km", dann Formel; „gepoolte SD" mit `Begriff` erklärt; Faustwerte (0,2/0,5/0,8) mit einem Satz Einordnung.
- [ ] Drei t-Test-Varianten entzerrt (jede kurz motiviert, nicht als Block); „Satterthwaite" als optionaler `FormelZeigen`/Nebensatz statt nackter Fachbegriff.
- [ ] Voraussetzungen: „groß"/„annähernd" mit grober Orientierung; die umgekehrte Logik (p > 0,05 = Voraussetzung behalten) als eigenständige Kernaussage, nicht nur Callout.
- [ ] Mann-Whitney-U vs. Wilcoxon-Namensverhältnis in einem Satz geklärt.
- [ ] Signal/Rausch-Framing, „Ränge statt Maßband"-Analogie, Merke, Selbsttest, Widgets (SignalRausch, AnnahmenBaum) unverändert erhalten.
- [ ] `npm run check` grün, `npm run build` erfolgreich.

**Verify:** `npm run dev` → `/lektion/t-tests` lesen: `√(2/n)` und Cohen's d sind vor der Formel motiviert; die Voraussetzungs-Umkehrung steht als Kernaussage.

**Steps:**

- [ ] **Step 1: Seite lesen, Hotspots markieren.**
- [ ] **Step 2: Umbau je Hotspot** nach dem Muster aus Task 5/6.
- [ ] **Step 3: Verify & Commit.**

```bash
npm run check && npm run build
git add src/routes/lektion/t-tests/
git commit -m "refactor: intuition-first simplification of lesson 7 (t-tests)"
```

---

### Task 8: Interaktiv-Audit-Report (Deliverable, kein Code)

**Goal:** Ein vollständiger Befund-Report über alle ~20 Widgets als Grundlage für die Review-Entscheidung des Betreibers.

**Files:**
- Create: `docs/superpowers/audits/2026-07-01-interaktiv-audit.md`
- Untersucht: alle `src/lib/widgets/*.svelte`

**Acceptance Criteria:**
- [ ] Der Report listet jedes Widget mit: (a) Zweck in einem Satz, (b) aktuelle Reihenfolge/Leserichtung (Erklärung → Visualisierung → Regler → Ergebnis?), (c) konkrete Probleme (Flow, Leserichtung, Verständlichkeit) mit Schweregrad (hoch/mittel/niedrig), (d) konkreter Fix-Vorschlag.
- [ ] Widgets, die in Tasks 1–7 schon angefasst wurden, sind als solche markiert (kein Doppel-Fix).
- [ ] Am Ende eine Prioritätenliste (welche Fixes lohnen am meisten).

**Verify:** Report existiert, deckt alle Widgets aus `src/lib/widgets/` ab, ist scannbar strukturiert.

**Steps:**

- [ ] **Step 1: Jedes Widget sichten** (Code + im Browser), Zweck, aktuelle Anordnung, Probleme notieren.
- [ ] **Step 2: Report schreiben** in der vorgegebenen Struktur, mit Schweregraden und Fix-Vorschlägen.
- [ ] **Step 3: Commit.**

```bash
git add docs/superpowers/audits/2026-07-01-interaktiv-audit.md
git commit -m "docs: interactive-element UX audit report"
```

- [ ] **Step 4: REVIEW-GATE.** Report dem Betreiber vorlegen; er hakt ab, welche Fixes in Task 9 umgesetzt werden. NICHT ohne Freigabe mit Task 9 fortfahren.

---

### Task 9: Interaktiv-Fixes (nur die vom Betreiber abgehakten)

**Goal:** Die in Task 8 freigegebenen Fix-Vorschläge umsetzen.

**Files:**
- Modify: die in Task 8 identifizierten und freigegebenen `src/lib/widgets/*.svelte` (konkrete Liste = Output des Review-Gates)

**Acceptance Criteria:**
- [ ] Jeder vom Betreiber abgehakte Fix ist umgesetzt.
- [ ] Kein nicht-freigegebener Umbau vorgenommen.
- [ ] Widget-Logik-Tests (falls vorhanden) angepasst und grün; `npm run check` & `npm run test` grün.
- [ ] Jedes geänderte Widget in Chrome verifiziert (Leserichtung/Flow verbessert, nichts kaputt).

**Verify:** `npm run check && npm run test` grün; Chrome-Sichtung jedes geänderten Widgets.

**Steps:**

- [ ] **Step 1: Freigegebene Fixes in einzelne Edits übersetzen** (pro Widget ein kohärenter Commit).
- [ ] **Step 2: Umsetzen + je Widget Chrome-Check.**
- [ ] **Step 3: Verify & Commit** (pro Widget oder logischer Gruppe).

```bash
npm run check && npm run test
git add src/lib/widgets/
git commit -m "fix: apply approved UX/flow improvements to interactive widgets"
```

---

### Task 10: Textfeinschliff (`/humanizer`) + finale Verifikation

**Goal:** Alle neu geschriebenen/überarbeiteten deutschen Texte klingen natürlich; die gesamte Site ist verifiziert grün.

**Files:**
- Modify: die in Tasks 2–7 geänderten Texte (Würfelspiel-Texte, Recap-Fragen, überarbeitete Passagen in Lektion 5/6/7) und ggf. Task-9-Texte

**Acceptance Criteria:**
- [ ] `/humanizer` über die neu verfassten/überarbeiteten deutschen Texte gelaufen; KI-typische Muster entfernt, Umlaute intakt, Ton „Du" konsistent.
- [ ] `npm run check`, `npm run test`, `npm run build` alle grün.
- [ ] Finale Chrome-Sichtung der geänderten Lektionen/Widgets.

**Verify:** `npm run check && npm run test && npm run build` → alles grün; stichprobenartige Chrome-Sichtung.

**Steps:**

- [ ] **Step 1: `/humanizer`** über die neuen/überarbeiteten Passagen laufen lassen (Würfelspiel, Recap-Fragen, Lektion 5/6/7). Vorschläge sichten und einarbeiten, ohne fachliche Korrektheit oder Umlaute zu verändern.
- [ ] **Step 2: Volle Verifikation.** `npm run check && npm run test && npm run build`.
- [ ] **Step 3: Commit.**

```bash
git add -A
git commit -m "polish: humanize refined German copy across course refinement"
```

---

## Self-Review — Spec-Abdeckung

- Spec Workstream 1 (x-Achse) → **Task 1** ✓
- Spec Workstream 2 (Würfelspiel) → **Task 2** ✓
- Spec Workstream 3 (Recap) → **Task 3 + 4** ✓
- Spec Workstream 4 (5/6/7) → **Task 5 + 6 + 7** ✓
- Spec Workstream 5 (Audit erst Report, dann fixen) → **Task 8 (Report + Gate) + Task 9 (Fixes)** ✓
- Spec Workstream 6 (Verifikation + Humanizer) → durchgängige Verify-Schritte + **Task 10** ✓

**Abhängigkeiten:** Task 4 blockiert von Task 3. Task 9 blockiert von Task 8 (Review-Gate). Task 10 blockiert von Tasks 2–7 (und 9, falls Fixes anfallen). Tasks 1, 2, 3, 5, 6, 7, 8 sind untereinander unabhängig und können in Reihenfolge abgearbeitet werden.
