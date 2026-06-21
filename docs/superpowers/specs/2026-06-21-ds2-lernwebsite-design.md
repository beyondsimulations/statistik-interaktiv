# Design Spec — DS2 Interaktive Lernwebsite

**Datum:** 2026-06-21
**Status:** In Review
**Kurs:** Data Science 2 — „Grundlagen der Statistik und experimentelles Design" (BIO-06.61-015), Dr. Saskia Otto, Universität Hamburg, SoSe 2026
**Quelle der Inhalte:** 13 Vorlesungs-Foliensätze unter https://saskiaotto.github.io/uham-bio-data-science-2/

## 1. Zweck & Kontext

Eine deutschsprachige, intuitions-first Lernwebsite, die einer Biologie-Studentin hilft, die Statistik-Konzepte dieses Kurses **wirklich zu verstehen** (nicht auswendig zu lernen) und die Klausur zu bestehen. Das Kernproblem laut Lernender: „die Logik/Intuition fehlt" — die Vorlesung vermittelt Formeln, aber nicht das *Warum*. Die Website macht die unsichtbare Kern-Idee der Inferenzstatistik — „was passierte, wenn wir das Experiment sehr oft wiederholen" — **sichtbar und spielbar**.

### Lernerin-Profil (steuert alle Entscheidungen)
- Sprache: **Deutsch**
- Mathe-Komfort: **Sanfte Formeln, gut erklärt** — Notation ja, aber jedes Symbol in Klartext daneben; Formeln nie als Verständnis-Blocker, immer optional einklappbar.
- R: **Konzepte zuerst, R leicht** — R-Snippets read-only, dort wo sie das Verständnis stützen (z. B. `t.test()`-Ausgabe lesen). Kein ausführbarer R-Kernel.
- Zeitdruck: **Klausur in wenigen Wochen** → erst eine polierte Keystone-Lektion, dann Ausbau.

## 2. Ziele & Erfolgskriterien

1. **Intuition vor Formel.** Jede Lektion startet mit Bild/Analogie/Interaktion; Formeln sind optional („Formel zeigen").
2. **Eine fertige, polierte Keystone-Lektion zuerst** (Zentraler Grenzwertsatz / Stichprobenverteilung), end-to-end gebaut und in Chrome verifiziert — sofort nutzbar.
3. **Wiederverwendbares Lehr-Kit**, das alle weiteren Lektionen schnell und konsistent macht.
4. **Korrektheit der Statistik** ist nicht verhandelbar — eine falsche p-Wert-Animation lehrt Falsches. Statistik-Berechnungen werden unit-getestet.
5. **Klausur-Abdeckung:** alle 13 Vorlesungsthemen sind am Ende abgedeckt, priorisiert nach Klausur-Relevanz.

### Nicht-Ziele (YAGNI)
- Kein Backend, keine Accounts, keine Server-Logik. Fortschritt nur via `localStorage`.
- Kein ausführbarer R-/Code-Kernel — R ist nur annotierte, statische Darstellung.
- Keine Mehrsprachigkeit (nur Deutsch), kein Dark-Mode (Light only).
- Keine Inhalte über den Kurs-Scope hinaus.

## 3. Tech-Stack

- **SvelteKit (Svelte 5, Runes)** mit `@sveltejs/adapter-static` → vollständig prerendered, kostenlos auf GitHub Pages / Netlify deploybar.
- **Tailwind CSS v4** für Velocity; Design-Tokens als CSS-Variablen.
- **mdsvex** — Lektions-Inhalte als Markdown mit inline eingebetteten Svelte-Widgets (deutsche Prosa + lebende Interaktion nebeneinander, leicht editierbar).
- **KaTeX** für die „Formel zeigen"-Reveals.
- **D3-Hilfsmodule** (`d3-scale`, `d3-shape`, `d3-random`) nur als Mathe-/Skalen-Helfer; das eigentliche Rendering der Interaktionen erfolgt über Svelte-kontrolliertes SVG/Canvas (volle Kontrolle über Interaktivität, kein Chart-Lib-Lock-in).
- **Vitest** für Unit-Tests des `stats`-Moduls.
- **Aktuelle Paketversionen**: Vor dem Bauen werden über **context7** und den **Svelte MCP** die neuesten API-Patterns/Versionen verifiziert (Svelte 5 Runes, SvelteKit, mdsvex, Tailwind v4).

## 4. Design-Richtung

`frontend-design` führt die eigentliche Politur aus; diese Richtung geht als Vorgabe in die Umsetzung, jede Lektion wird in `chrome` end-to-end verifiziert.

- **Persönlichkeit:** Warm & ermutigend („du schaffst das"). Weiche, runde Formen, großzügiger Weißraum, ruhige Taktung.
- **Tonfall der Texte:** Neutrales **„Du", sachlich** — direkt und klar, informell, ohne übertriebene Anbiederung.
- **Theme:** **Light only** (beste Lesbarkeit für Mathe/Diagramme).
- **Start-Tokens (von frontend-design final justiert):**
  - Hintergrund: warmes Off-White (~`#FBF8F4`)
  - Akzent primär: Koralle (~`#F2654E`), sekundär: Amber (~`#F5A623`)
  - Text: warmes Dunkelgrau (~`#2B2724`)
  - Karten: `rounded-2xl`, weiche Schatten
  - Typo: freundliche Sans (Inter oder Nunito) für Fließtext; klare Display-Variante für Überschriften
- **Bewusst vermieden:** generische „AI-Aesthetic", kalte Corporate-Optik, überladene Dashboards.

## 5. Architektur — Wiederverwendbares Lehr-Kit

Jede Komponente hat **einen klaren Zweck**, ein definiertes Prop-Interface und ist isoliert testbar.

| Komponente | Zweck | Wichtigste Props / Abhängigkeiten |
|---|---|---|
| `LessonLayout` | Seiten-Shell: Sidebar-Nav (3 Tracks + Fortschritt), Inhalts-Slot, Zurück/Weiter | lessons-manifest, progress-store |
| `TrackNav` | Rendert die 3-Track-Navigation mit Lektionsliste | lessons-manifest |
| `ProgressDots` + `progress` store | Fortschritt pro Lektion, persistiert in `localStorage` | — |
| `Intuition` / `Analogie` / `Merke` | Gestylte Callout-Boxen mit Slot-Inhalt | variant |
| `FormelZeigen` | Einklappbare KaTeX-Formel **mit Symbol-Legende** in Klartext | `formula` (TeX), `symbols: {sym, bedeutung}[]` |
| `Begriff` | Inline-Glossar-Tooltip für Fachbegriffe | `term` → glossary-map |
| `RCode` | Read-only R-Code + annotierte Ausgabe, Syntax-Highlight | `code`, `output`, `annotations` |
| `Selbsttest` | Quiz (MC / wahr-falsch / numerisch), sofortiges Feedback + Erklärung | `questions[]` |
| `Widget` | Einheitlicher Rahmen für Interaktionen (Titel, Steuerung, Bühne, Reset) | slot |
| `lib/stats.ts` | Statistik-Helfer (mean, var, sd, normal pdf/cdf/quantil, t, Stichproben-Ziehung …) — **unit-getestet** | — |

### Geteilte „rote-Faden"-Widgets (in mehreren Lektionen wiederverwendet)
- **`SSZerlegung`** — Zerlegung der Gesamtstreuung in erklärt/unerklärt. Trägt ANOVA (η²), Korrelation (r) und Regression (R²).
- **`AnnahmenBaum`** — Entscheidungsbaum Normalität + Varianzhomogenität → parametrisch vs. rangbasiert/transformieren. Wiederkehrend in t-Test, ANOVA, Korrelation, Regression.

## 6. Site-Struktur — 14 Lektionen, 3 Tracks

Reihenfolge der **Lernerin** wählbar; Build-Reihenfolge siehe §8.

### Track 1 · Grundlagen
| # | Lektion | Flagship-Widget | Klausur |
|---|---|---|---|
| 1 ⭐ | Von der Stichprobe zur Stichprobenverteilung (ZGW) | **Keystone** (siehe §7) | hoch |
| 2 | Was ist Statistik? (deskriptiv/inferentiell/explorativ) | Sortier-Spiel: Aussagen in Schubladen ziehen | niedrig-mittel |
| 3 | Wahrscheinlichkeit & Bayes | Bayes-Box: 10.000-Personen-Raster, Prävalenz/Sensitivität/Spezifität-Regler | hoch |
| 4 | Verteilungen & die Glockenkurve | Flächen-Schieber: a/b über N(μ,σ), `pnorm` live | hoch |
| 5 | Schätzen & Konfidenzintervalle | Sampling-Maschine: 100 KIs, ~95 % treffen das fixe μ | hoch |
| 6 | Hypothesentest & der p-Wert | α/β/Power-Schieberegler + p-Wert-Würfelspiel | hoch |

### Track 2 · Klausur-relevant
| # | Lektion | Flagship-Widget | Klausur |
|---|---|---|---|
| 7 | t-Tests & nicht-parametrische Alternativen | Signal-vs-Rausch-Regler (Δμ, s, n → t, p) | hoch |
| 8 | Chi-Quadrat-Tests | Kontingenztafel-Editor mit Live-Erwartungswerten | hoch |
| 9 | ANOVA & Mehrstichprobentests | F-Ratio-Regler (between/within) + FWER-Roulette | hoch |
| 10 | Korrelation & Transformation | Scatter-Builder: Punkte ziehen, Pearson vs. Spearman live | mittel-hoch |
| 11 | Lineare Regression | Punkte ziehen → Gerade, Residuen, R², Hebelpunkt | hoch |

### Track 3 · Der Rest
| # | Lektion | Flagship-Widget | Klausur |
|---|---|---|---|
| 12 | Experimentelles Design & Power | Power-Spielplatz (4 gekoppelte Regler) | hoch |
| 13 | Designtypen & Pseudoreplikation | Pseudoreplikations-Falle (p-Wert/df blähen sich auf) | hoch |
| 14 | Welcher Test? (Auswahl & Interpretation) | „Welcher Test?"-Entscheidungsbaum-Spiel | hoch |

**Wiederkehrende Stolpersteine** (über mehrere Lektionen explizit adressiert): p-Wert-Fehldeutung · KI-Fehldeutung (fixes μ, zufälliges Intervall) · Power ≠ Signifikanz · Replikation ≠ Pseudoreplikation · P(A\|B) ≠ P(B\|A) · r misst nur *linearen* Zusammenhang · R² ≠ Signifikanz.

## 7. Keystone-Lektion 1 — „Von der Stichprobe zur Stichprobenverteilung"

Die erste vollständig gebaute, polierte Lektion (Vertical Slice). Sie beweist das gesamte Lehr-Kit und liefert die Kern-Intuition, die den restlichen Kurs aufschließt.

**Aufbau der Seite (mdsvex):**
1. Kurze, ermutigende Hinführung (sachliches „Du"): „Fast die gesamte Inferenzstatistik hängt an *einer* Idee. Schauen wir sie uns an."
2. **`StichprobenverteilungWidget`** (Flagship):
   - **Grundgesamtheit:** wählbare Form (normal, rechtsschief/exponentiell, bimodal, gleichverteilt). Zeigt Populations-Histogramm + wahres μ (rot markiert).
   - **Steuerung:** Schieberegler Stichprobengröße `n` (2–100); Button „Stichprobe ziehen" (eine); Button „×100 ziehen" (animiert viele).
   - **Aktuelle Stichprobe:** als Punkte dargestellt, ihr Mittelwert markiert.
   - **Stichprobenverteilung:** Histogramm der Mittelwerte baut sich live auf; überlagerte Normalkurve; Anzeige Mittelwert-der-Mittelwerte ≈ μ und beobachtete vs. theoretische Streuung.
   - **Live-Anzeigen:** Populations-μ/σ, aktueller Stichproben-Mittelwert, **SE = σ/√n** (theoretisch vs. beobachtet).
   - **Geführte Beats:** „Erhöhe `n` — was passiert mit der Breite?" → ZGW-Reveal: egal wie schief die Grundgesamtheit, die Mittelwerte werden glockenförmig und schmaler mit größerem n.
3. **`FormelZeigen`**: `SE = σ/√n` mit Symbol-Legende (σ = Streuung der Grundgesamtheit, n = Stichprobengröße, SE = Streuung der Mittelwerte).
4. **`Intuition`-Box**: Kernaussage in einem Satz.
5. **`Selbsttest`** (3 Fragen): (a) Was wird glockenförmig — die Daten oder die Mittelwerte? (b) Was passiert mit SE, wenn n steigt? (c) Gilt der ZGW auch bei schiefer Grundgesamtheit?

**Definition of Done (Keystone):** Kit-Komponenten existieren; Widget mathematisch korrekt (gegen `stats`-Unit-Tests); in `chrome` end-to-end verifiziert (jeder Regler/Button geklickt, Visuals & Zahlen korrekt, responsiv, Konsole sauber).

## 8. Build-Reihenfolge

1. **Projekt-Setup** — SvelteKit + Svelte 5 + adapter-static, Tailwind v4, mdsvex, KaTeX, Vitest; aktuelle Versionen via context7/Svelte MCP verifiziert.
2. **`lib/stats.ts` + Unit-Tests** — die Statistik-Korrektheit als Fundament.
3. **Lehr-Kit** — `LessonLayout`, `TrackNav`, `progress`-store, Callouts, `FormelZeigen`, `Begriff`, `RCode`, `Selbsttest`, `Widget`.
4. **Design-System** via `frontend-design` (Tokens, Typo, Karten) auf eine Beispielseite angewandt.
5. **Keystone-Lektion 1** komplett + `chrome`-Verifikation. → **Erster nutzbarer Meilenstein.**
6. **Rest Track 1** (Lektionen 2–6) → **Track 2** (7–11) → **Track 3** (12–14). Jede Lektion: bauen → `chrome`-Verifikation. Geteilte Widgets `SSZerlegung`/`AnnahmenBaum` entstehen bei ihrer ersten Verwendung und werden danach wiederverwendet.

## 9. Verifikations-Workflow

Jede Lektion gilt erst als fertig, wenn:
- `frontend-design` für die Optik genutzt wurde,
- in **`chrome`** end-to-end gefahren: jeder Regler/Button geklickt, Mathe & Visuals stichprobenartig gegen erwartete Werte geprüft, Responsivität geprüft, Konsole ohne Fehler,
- `stats`-Unit-Tests grün.

## 10. Offene Punkte
- Konkrete finale Farbwerte/Typo: von `frontend-design` festzulegen.
- Genaue Auswahl der Beispiel-Datensätze pro Lektion (Orientierung an Otto's Beispielen: Vogelzug, Iris, Daphnia, Lachs/Käfig, Mendel) — pro Lektion beim Bau entschieden.
