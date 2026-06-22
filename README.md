# Statistik interaktiv — Data Science 2

An intuition-first, German interactive learning website for the University of
Hamburg course **"Data Science 2 – Grundlagen der Statistik und experimentelles
Design"** (Dr. Saskia Otto). It turns the statistics curriculum into 14 lessons,
each pairing warm, plain-German explanations with a hands-on interactive widget
and a self-check.

**Live site:** https://beyondsimulations.github.io/statistik-interaktiv/

## What's inside

Three tracks, 14 lessons (Grundlagen → Klausur-relevant → Vertiefung): sampling
distribution & CLT, descriptive vs. inferential statistics, probability & Bayes,
distributions, confidence intervals, hypothesis testing & p-values, t-tests,
chi-square, ANOVA, correlation, regression, experimental design & power,
pseudoreplication, and a "which test?" decision game. Every lesson is
biology-framed (Vogelzug, Iris, Daphnia, Lachs, Mendel, …) and intuition-first,
with optional "Formel zeigen" reveals. All statistics are powered by a
unit-tested core (`src/lib/stats.ts`, verified against R).

## Tech

SvelteKit (Svelte 5 runes) · `@sveltejs/adapter-static` · Tailwind CSS v4 ·
mdsvex · KaTeX · Vitest. The whole site prerenders to static files.

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run test     # unit tests (Vitest)
npm run check    # svelte-check
npm run build    # static build → ./build
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/statistik-interaktiv` and publishes the static `build/` to GitHub Pages.

## Credits & license

This is an adaptation of Dr. Saskia Otto's **Data Science 2** course
(https://saskiaotto.github.io/uham-bio-data-science-2/), which is licensed under
**Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)**.

Following the ShareAlike term, this project is likewise released under
[CC BY-SA 4.0](./LICENSE). Credit goes to Dr. Saskia Otto for the original
course; this site is an independent learning aid and is not officially endorsed
by the original author.
