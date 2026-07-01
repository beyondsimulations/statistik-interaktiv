# Statistikkurs-Verfeinerung — Design

**Datum:** 2026-07-01
**Kontext:** Die DS2-Lernwebsite (14 Lektionen, SvelteKit + Svelte 5 runes, Tailwind v4)
ist gebaut und live. Dieser Durchlauf verfeinert den bestehenden Kurs — kein Neubau,
sondern ein chirurgischer Refinement-Pass entlang von sechs Anmerkungen des Betreibers.

**Zielgruppe unverändert:** intuition-first, deutschsprachig, für eine Biologie-Studentin,
die mit Statistik kämpft. Deutsche Umlaute (ö/ä/ü/ß), biologische Beispiele, Ton: neutrales „Du".

## Leitprinzipien

- **Chirurgisch, nicht Neubau.** Was funktioniert, bleibt unangetastet: Biologie-Beispiele
  (Vogelzug, Blattgröße, Sonne/Schatten), Analogien (Hufeisen, Gericht, Signal/Rausch),
  `Merke`-Boxen, `Selbsttest`-Blöcke, die interaktiven Widgets.
- **Ein Spec, sequenziell** abgearbeitet: mechanisch/risikoarm zuerst, inhaltlich/design-schwer zuletzt.
- **Verifikation eingebaut:** jede geänderte Lektion/Widget in Chrome prüfen; `svelte-check`
  und `vitest` durchgehend grün halten.
- **Textfeinschliff:** Am Ende `/humanizer` über die neu geschriebenen/überarbeiteten
  deutschen Texte laufen lassen, damit sie natürlich klingen.

---

## Workstream 1 — Konstante x-Achse bei Verteilungs-/Kurven-Graphen

**Problem:** Bei Graphen mit Normalverteilungen/Kurven skaliert die x-Achse beim Reglerziehen
mit, sodass der Rahmen „mitwandert". Das ist unintuitiv — man sieht nicht, wie sich die Kurve
relativ zu einer festen Skala bewegt.

**Lösung:** Bei allen Verteilungs-/Kurven-Widgets die x-Achsen-Domain auf einen konstanten,
großzügig gewählten Bereich fixieren. Nur die Kurve (und ggf. die y-Achse) bewegt sich, der
x-Rahmen bleibt stehen.

**Betroffene Kandidaten (vor Umsetzung verifizieren, welche tatsächlich x mitskalieren):**
`FRatio`, `FlaechenSchieber`, `Histogram`, `PowerSpielplatz`, `PowerVisualizer`,
`SamplingMaschine`, `SignalRausch`, `StichprobenverteilungWidget`.

**Ausgenommen:** `RegressionBuilder`, `ScatterBuilder` — Streudiagramme, keine
Verteilungskurven; deren x-Achse bildet echte Datenbereiche ab.

**Akzeptanz:** Beim Ziehen aller Regler bleibt der x-Achsenbereich jedes betroffenen Widgets
konstant; nur die Kurve verändert sich sichtbar. Chrome-verifiziert.

---

## Workstream 2 — Dice-Game-Redesign (`PWertSpiel.svelte`)

**Problem:** Die Kopfzeile „signifikant X von Y" steht ganz oben, bevor der Nutzende versteht,
was sie bedeutet — und die große Coral-Box lässt „signifikant" wie das Ziel wirken. Farben
verwirren.

**Lösung:**
- **Reihenfolge umdrehen:** oben das letzte Experiment + Punkteraster der Läufe; darunter ein
  klarer erklärender Satz; **ganz unten** der Zähler als Fazit.
- **Zähler-Framing:** deutlich als das benennen, was er ist — bei H0 wahr:
  „= reine Fehlalarme in einer zufälligen Stichprobe (in Wahrheit **kein** Unterschied — und
  trotzdem fällt rund jedes zwanzigste Experiment ‚signifikant' aus, ≈ α = 5 %)".
- **Farben:** **Coral bleibt** = signifikant, **Sage** = nicht signifikant (keine neuen
  Warnfarben). Die große Coral-Kopfbox oben wird entschärft/neutralisiert, damit „signifikant"
  nicht wie eine Errungenschaft aussieht. Legende so formulieren, dass auch Statistik-Laien
  sofort verstehen: signifikant unter H0-wahr = Fehlalarm.

**Unangetastet:** Simulationslogik (`welchTTest`, `drawSample`, seed/rng), Regler, Buttons.

**Akzeptanz:** Zähler steht am Ende, klar als Fehlalarm-Quote gerahmt; jemand ohne
Statistik-Vorwissen versteht beim Lesen, dass ~5 % signifikante Treffer reiner Zufall sind.
Chrome-verifiziert.

---

## Workstream 3 — Recap-Fragen am Lektions-Anfang

**Problem:** Kein roter Faden zwischen Lektionen; Vorwissen wird nicht aktiviert.

**Lösung:** Jede Lektion außer der ersten startet mit einem kurzen **„Weißt du noch?"**-Block:
1–2 Fragen zu den **Kernpunkten der vorherigen Lektion** (Frage → aufdecken).

**Umsetzung:** Auf der bestehenden `Selbsttest`-Komponente aufbauen (Q&A mit Aufdecken).
Bei Bedarf eine leichte Recap-Variante/Framing („Weißt du noch?" statt „Selbsttest"). Inhalt:
je Lektion 1–2 Fragen, abgeleitet aus den Kernaussagen der direkt vorangehenden Lektion.

**Umfang:** Lektionen 2–14 (13 Recaps), in kanonischer Reihenfolge (`lessons.ts`).

**Akzeptanz:** Jede Lektion 2–14 beginnt mit einem Recap der Vorlektion; Fragen treffen die
tatsächlichen Kernpunkte; UX konsistent mit bestehendem Selbsttest.

---

## Workstream 4 — Vereinfachung Lektionen 5/6/7 (chirurgisch, intuition-first)

**Betroffen:** `konfidenzintervalle` (5), `hypothesentest` (6), `t-tests` (7).

**Diagnostizierte gemeinsame Muster:** Formeln vor Intuition; dichte 2–3-Konzept-Abschnitte;
geballter Fachjargon; kritische Intuitions-Umkehrungen in Callouts vergraben.

**Einheitliche Policy pro Lektion:**
1. **Intuition vor Formel.** Jede harte Idee bekommt zuerst Klartext; die Formel folgt. Schwere
   Formeln in ausklappbares `FormelZeigen` verlagern (optional für Neugierige, nicht im Weg).
2. **De-densifizieren.** Dichte Abschnitte in kleine Ein-Konzept-Schritte splitten.
3. **Jargon glossieren.** Fachbegriffe bei Erstnutzung kurz erklären (`Begriff`-Tooltip/inline).
4. **Caveats hochziehen.** Vergrabene Schlüssel-Umkehrungen in den Haupttext holen.

**Konkrete Hotspots (aus Analyse, nicht abschließend):**
- **L5:** Latein/Griechisch-Notation als Ordnungsprinzip; `E(X̄)=μ` ohne Intuition; „warum n−1"
  stapelt drei Konzepte; z-Werte (1,96 …) ohne Herkunft; σ-unbekannt-Problem kommt zu spät
  (nach Widget); t-Verteilung setzt Dichte-Intuition voraus.
- **L6:** Popper/Falsifikation wirkt philosophisch statt praktisch; H0/HA-Subskript-Notation
  ohne visuelle Stütze; einseitig/zweiseitig zu dicht (zwei Merke am Stück); p-Wert-Formel mit
  Bedingungsstrich „|" ohne Intuition; Fehler 1./2. Art + Power in einem Abschnitt.
- **L7:** `SE=s·√(2/n)` mit unerklärtem „2"; Cohen's d als neues Konzept mit „gepoolter" SD;
  drei t-Test-Varianten am Stück; Voraussetzungen setzen „groß"/„annähernd" als selbstverständlich
  voraus; Mann-Whitney vs. Wilcoxon Namensverwirrung.

**Unangetastet:** Biologie-Beispiele, Analogien, Merke, Self-Tests, Widget-Platzierung.

**Akzeptanz:** Jede der drei Lektionen liest sich für eine Anfängerin spürbar leichter (Intuition
zuerst, ein Konzept pro Schritt, Formeln optional einklappbar), ohne Substanzverlust bei den
klausurrelevanten Inhalten. Inhaltlich vom Betreiber gegengelesen.

---

## Workstream 5 — Interaktiv-Audit (~20 Widgets): erst Report, dann fixen

**Problem:** Nicht alle interaktiven Elemente folgen einem guten UX-Flow / einer klaren
Leserichtung.

**Vorgehen (zweistufig, mit Review-Gate):**
1. **Audit-Report** über alle Widgets: pro Widget eine Befund-Liste — Flow, Leserichtung
   (Erklärung → Visualisierung → Regler → Ergebnis?), Verständlichkeit, Schweregrad,
   konkreter Fix-Vorschlag.
2. **Betreiber hakt ab**, welche Fixes umgesetzt werden.
3. **Erst dann** implementieren.

**Akzeptanz:** Vollständiger Audit-Report geliefert und abgenommen; nur abgehakte Fixes
umgesetzt und Chrome-verifiziert.

---

## Workstream 6 — Verifikation & Textfeinschliff (durchgängig / abschließend)

- Jede geänderte Lektion/Widget in Chrome nachprüfen (Leserichtung, Regler-Verhalten, Layout).
- `svelte-check` und `vitest` grün halten; ggf. Widget-Logik-Tests anpassen.
- **Abschluss:** `/humanizer` über die neu geschriebenen/überarbeiteten deutschen Texte laufen
  lassen (Recap-Fragen, überarbeitete 5/6/7-Passagen, Würfelspiel-Texte).

---

## Sequenz

1. Workstream 1 (x-Achse) — mechanisch, risikoarm
2. Workstream 2 (Würfelspiel) — klar umrissen
3. Workstream 3 (Recap: Komponente + Rollout 2–14)
4. Workstream 4 (5/6/7 Vereinfachung)
5. Workstream 5 (Audit-Report → Review → Fixes)
6. Workstream 6 (Verifikation durchgängig; Humanizer-Feinschliff am Ende)

## Bewusste Annahmen

- Recap auf **allen** Lektionen 2–14, nicht nur 5/6/7.
- `RegressionBuilder`/`ScatterBuilder` von der x-Achsen-Regel **ausgenommen** (Streudiagramme).
- Farbpalette des Würfelspiels bleibt (Coral/Sage); Fix über Reihenfolge + Framing.
