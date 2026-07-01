# Interaktiv-Audit — UX / Flow / Leserichtung aller Widgets

**Datum:** 2026-07-01 · **Scope:** alle ~20 interaktiven Widgets in `src/lib/widgets/`
**Zweck:** Grundlage für die Betreiber-Entscheidung, welche Fixes umgesetzt werden (Task 9).
**Methode:** Code-Audit jedes Widgets (3 parallele Prüfer), bewertet gegen den Idealfluss
*kurze Erklärung → Visualisierung → verstehen, was man stellt → Regler → Ergebnis*.

**Gemeinsamer Rahmen:** Alle Widgets nutzen `Widget.svelte`, das vertikal rendert:
Kopf (Titel + `hint`) → **Bühne** (`children`: Visualisierung + Ergebnis) → **Controls unten**
(Slider/Buttons in eigener Sektion). Die Regler sitzen also strukturell immer unter der Bühne;
die frei gestaltbare Reihenfolge liegt *innerhalb* der Bühne.

---

## Executive Summary — fünf wiederkehrende Muster

Das Audit zeigt nicht 20 Einzelprobleme, sondern **fünf Muster**, die sich durch viele Widgets ziehen.
Ein Fix pro Muster verbessert jeweils mehrere Widgets konsistent.

### Muster 1 — Ergebniszahl ÜBER der Visualisierung, die sie erklärt  ⟵ größter Hebel
Die große Live-Kennzahl (p, χ², r, t, Power, Trefferquote …) steht ganz oben in der Bühne,
**bevor** man das Bild/die Daten sieht, aus denen sie entsteht. Man liest die Pointe, bevor der
Aha-Effekt aus dem Bild entstehen kann — genau das vom Betreiber benannte Anti-Pattern.
Vorbild dafür, wie es richtig geht: **StichprobenverteilungWidget** (Kennzahl je Zone *neben/unter*
der zugehörigen Grafik).

| Schweregrad | Widgets |
|---|---|
| **[hoch]** | BayesBox, FRatio, KontingenztafelEditor, SamplingMaschine, ScatterBuilder |
| **[mittel]** | FlaechenSchieber, FwerRoulette, SignalRausch, PowerSpielplatz, PowerVisualizer, PseudoreplikationsFalle, RegressionBuilder |

**Einheitlicher Fix:** den Ergebnis-Block innerhalb der Bühne *unter* die Visualisierung ziehen
(reiner Reihenfolgen-Tausch im Markup, keine Logikänderung).

### Muster 2 — Legende / Interaktions-Cue steht unter oder fern vom Element
Farb-Legenden und Hinweise, was anklickbar/ziehbar ist, stehen oft *unter* dem Bild oder ganz
unten in den Controls — beim ersten Blick fehlt die Bedeutung.
Betroffen: BayesBox (Legende unter Raster), SamplingMaschine (Farb-Legende erst im Fließtext),
PWertSpiel (Legende nach dem Raster), ScatterBuilder & RegressionBuilder (Ziehbarkeit nur im Tipp),
FwerRoulette (Bonferroni-Cue unter dem Plot), EntscheidungsbaumSpiel & SortierSpiel (leitender Tipp unten).
**Fix:** Legende/Cue als eine Zeile *über* das jeweilige Element ziehen.

### Muster 3 — Zähler im Leerzustand „0 von 0" / „Richtig: 0/N"
Ein Ergebniszähler zeigt vor der ersten Interaktion eine bedeutungslose (und teils entmutigende) 0.
Betroffen: SamplingMaschine („Treffer 0 von 0"), EntscheidungsbaumSpiel & SortierSpiel („Richtig: 0/N").
**Fix:** den Zähler erst einblenden, sobald es etwas zu zählen gibt (`count > 0`), sonst einen
einladenden Leerzustands-Satz zeigen.

### Muster 4 — fehlende Achsenbeschriftung / Einheit
Betroffen: PowerVisualizer (x-Achse ohne Titel; Ticks enden bei 3, HA wandert in unbeschrifteten
Weißraum), PseudoreplikationsFalle (keine y-Achse/Einheit für die Blattlänge),
Histogram (kein y-Label), DiskreteVerteilung (E[X]-Marker unerklärt).
**Fix:** Achsentitel/Einheit bzw. eine erklärende Zeile ergänzen.

### Muster 5 — primäre Aktion (Buttons) unten vergraben
Die wichtigste Einstiegsaktion („Experiment laufen lassen", „Stichprobe ziehen") liegt ganz unten
in den Controls, weit weg von der Bühne.
Betroffen: PWertSpiel (Lauf-Buttons unter zwei Slidern), SamplingMaschine &
StichprobenverteilungWidget (Zieh-Buttons weit unter hohen Bühnen).
**Fix:** primäre Buttons an den Anfang der Controls (über die Slider) und/oder einen „→ zieh unten"-Cue
in der Bühne.

**Bereits gut, kein Handlungsbedarf:** AnnahmenBaum (sauberer sequenzieller Fluss),
StichprobenverteilungWidget (Vorbild-Fluss), SortierSpiel (Flow stimmig), SSZerlegung (reine Anzeige, ok).
**Im Vorlauf bereits angefasst:** FRatio, FlaechenSchieber, PowerVisualizer, SignalRausch (konstante
x-Achse — erledigt), PWertSpiel (Fehlalarm-Fazit ans Ende — erledigt). Deren *verbleibende* Punkte
sind oben mit erfasst.

---

## Priorisierte Empfehlung (zum Abhaken)

Gebündelt nach Muster, damit du in Blöcken statt 20 Einzelfällen entscheiden kannst.

**Bündel A — Ergebnis unter die Visualisierung (empfohlen, höchster Impact, [hoch]-Fälle):**
BayesBox, FRatio, KontingenztafelEditor, SamplingMaschine, ScatterBuilder.

**Bündel B — dieselbe Umstellung für die [mittel]-Fälle (Konsistenz):**
FlaechenSchieber, FwerRoulette, SignalRausch, PowerSpielplatz, PowerVisualizer, PseudoreplikationsFalle,
RegressionBuilder. (Bei PowerSpielplatz ist die Kopplung via „n"-Marke schon da → niedrigste Prio.)

**Bündel C — Legenden/Cues über das Element (Muster 2):**
BayesBox, SamplingMaschine, PWertSpiel, ScatterBuilder, RegressionBuilder, FwerRoulette,
EntscheidungsbaumSpiel, SortierSpiel.

**Bündel D — Leerzustands-Zähler entschärfen (Muster 3):**
SamplingMaschine, EntscheidungsbaumSpiel, SortierSpiel.

**Bündel E — Achsen/Einheiten ergänzen (Muster 4):**
PowerVisualizer (x-Titel + Ticks bis HA), PseudoreplikationsFalle (y-Achse „Blattlänge (cm)"),
Histogram (optionales y-Label), DiskreteVerteilung (E[X]-Zeile).

**Bündel F — primäre Aktion prominenter (Muster 5):**
PWertSpiel (Lauf-Buttons zuerst), SamplingMaschine & StichprobenverteilungWidget (Zieh-Cue in der Bühne).

**Einzelfälle mit eigener Note:**
- **PseudoreplikationsFalle [mittel]:** Visualisierung steht *unter* Kennzahlen + Verdikt — intuition-first
  wäre erst die klumpenden Punkte zeigen, dann das „Schein-Signifikanz!"-Verdikt. (Teil von Bündel A/B-Logik,
  aber inhaltlich etwas mehr als ein Blocktausch.)
- **RegressionBuilder / ScatterBuilder [mittel]:** Drag-Affordanz — dass Punkte ziehbar sind, ist beim
  ersten Blick nicht sichtbar (nur in aria-labels/Tipp). Cue an der Grafik.

---

## Per-Widget-Befunde (Kurzform)

### Bereits gut
- **AnnahmenBaum** — sequenzieller Entscheidungsbaum; gelöste Schritte oben, aktuelle Aktion darunter. Buttons-in-Bühne ist hier korrekt. Keine Änderung.
- **StichprobenverteilungWidget** — drei nummerierte Zonen (Population → Stichprobe → Verteilung der Mittelwerte), Kennzahl je Zone bei der Grafik. Vorbild. *Klein:* Zieh-Cue in der Bühne (Muster 5), Leerzustands-Satz in Zone 3.
- **SortierSpiel** — Zuordnungs-Quiz, Aktion an der Karte, Feedback direkt. *Klein:* „Richtig: 0/N" erst nach erster Antwort (Muster 3); Bucket-Hinweise auch auf kleinen Screens sichtbar.
- **SSZerlegung** — reine Anzeige (Stapelbalken erklärt/unerklärt + η²/R²). *Klein:* Aufrufer sollten immer `caption` setzen.

### Muster-1-Fälle (Ergebnis über Viz)
- **BayesBox [hoch]** — 9%-Schlagzeile über dem 10.000er-Raster; Legende unter dem Raster. → Schlagzeile unter/zwischen Raster und Zähler; Legende als Zeile über das SVG.
- **FRatio [hoch]** *(x-Achse erledigt)* — F/p/MS über den drei Glockenkurven. → Kennzahl-Zeile unter das SVG.
- **KontingenztafelEditor [hoch]** — χ²/df/p über der noch zu befüllenden Tabelle. → Ergebniszeile unter das Beobachtet/Erwartet-Grid; Yates-Cue näher am Effekt.
- **SamplingMaschine [hoch]** — „Treffer 0 von 0" über dem KI-Plot; Farb-Legende erst im Fließtext; n/Niveau-Wechsel verwirft Sammlung ohne UI-Hinweis. → Zähler unter das SVG (bzw. Leerzustands-Satz), Farb-Legende oben, Reset-Hinweis an den Controls.
- **ScatterBuilder [hoch]** — r und ρ (3xl) über der Punktwolke; Ziehbarkeit nur im Tipp unten. → Kennzahlen unter das Diagramm; Interaktions-Cue an der Grafik; optional „(willkürliche Einheiten)".
- **FlaechenSchieber [mittel]** *(x-Achse erledigt)* — P(a<X≤b) über der Kurve. Grenzfall (Zahl läuft live mit). → optional P-Anzeige unter das SVG.
- **FwerRoulette [mittel]** — empirische/theoretische Fehlalarmrate über dem Plot; Bonferroni-Toggle-Wirkung nur im Text unter dem Plot. → Kennzahlen unter das SVG; Cue „schalte Bonferroni um → Punkt fällt zur Linie"; Hinweis, dass „Neu würfeln" den Punkt leicht wackeln lässt.
- **SignalRausch [mittel]** *(x-Achse erledigt)* — t/p über den Kurven. → t/p unter die Kurven *oder* „t = Signal ÷ Rausch" direkt an die Box; Regler-Labels mit Bildelementen verknüpfen (Δ = Gipfelabstand, s = Glockenbreite).
- **PowerSpielplatz [mittel]** — Power-Zahl (4xl) über der Power-über-n-Kurve. *Aber:* „n = {n}"-Marke koppelt Slider sichtbar an die Kurve → niedrigste Prio. → Zahl unter die Kurve oder als Overlay an die Marke.
- **PowerVisualizer [mittel]** *(x-Achse erledigt)* — Power/α/β über den Kurven; **x-Achse ohne Titel**, Ticks enden bei 3 während HA bis ≈15 wandert. → Kennzahlen unter das SVG; x-Achsentitel „Teststatistik (Standardfehler) →"; Ticks bis in den HA-Bereich.
- **PseudoreplikationsFalle [mittel]** — Kennzahlen + „Schein-Signifikanz!"-Verdikt *über* der erklärenden Punktwolke; **keine y-Achse/Einheit** für die Blattlänge. → Visualisierung über Kennzahlen/Verdikt (Toggle → Plot → Zahlen → Verdikt); y-Achse „Blattlänge (cm)".
- **RegressionBuilder [mittel]** — b/a/R²/p über dem ziehbaren Streudiagramm; Drag-Affordanz nur in aria/Tipp. → Kennzahlen unter das Diagramm; Cue „zieh die Punkte" an der Grafik. (Achsen/WCAG bereits vorbildlich.)

### Muster-4/kleinere Anzeige-Primitive
- **Histogram** — Chart-Primitive; kein y-Label; Marker-Labels können bei Nähe überlappen. → optionales `yLabel`; Marker-Labels versetzen.
- **DiskreteVerteilung** — PMF-Explorer; E[X]-Marker unerklärt; ggf. kein y-Label. → Zeile „schwarzer Strich = Erwartungswert E[X]"; y-Label „P(X = k)" prüfen.
- **EntscheidungsbaumSpiel** — Baum+Quiz; Score-Leiste „0/6" vor erster Aufgabe; leitender Tipp unten. → Score erst nach erster Antwort; Tipp über die Szenarienliste.

---

## Verifikations-Hinweis
Dieser Report ist ein Code-Audit. Die konkreten Fixes in Task 9 werden nach Umsetzung jeweils im
Browser (Chrome) auf tatsächlich verbesserte Leserichtung/Flow geprüft.
