// Lesson manifest for the DS2 Lernwebsite.
// Single source of truth for the navigation (3 tracks), the prev/next ordering
// and which lessons already have a real page ('live') vs. are still 'coming-soon'.
//
// Each lesson task flips its own `status` to 'live' once its route exists.

export type TrackId = 'grundlagen' | 'klausur' | 'rest';

export type LessonStatus = 'live' | 'coming-soon';

export type Lesson = {
	/** URL slug — the lesson lives at `/lektion/<slug>`. */
	slug: string;
	/** Display title (German, with proper umlauts). */
	title: string;
	/** Which of the three tracks this lesson belongs to. */
	track: TrackId;
	/** 1-based position in the overall ordered list (across all tracks). */
	order: number;
	/** 'live' = page exists and is linkable; 'coming-soon' = greyed out. */
	status: LessonStatus;
};

/** Display order + label for each track. */
export const TRACKS: { id: TrackId; label: string }[] = [
	{ id: 'grundlagen', label: 'Grundlagen' },
	{ id: 'klausur', label: 'Klausur-relevant' },
	{ id: 'rest', label: 'Vertiefung' }
];

/**
 * All 14 lessons in their canonical order. Every lesson starts as
 * 'coming-soon'; the per-lesson tasks switch their entry to 'live'.
 */
export const lessons: Lesson[] = [
	// --- Grundlagen --------------------------------------------------------
	{ slug: 'was-ist-statistik', title: 'Was ist Statistik?', track: 'grundlagen', order: 1, status: 'coming-soon' },
	{ slug: 'wahrscheinlichkeit-bayes', title: 'Wahrscheinlichkeit & Bayes', track: 'grundlagen', order: 2, status: 'coming-soon' },
	{ slug: 'verteilungen', title: 'Verteilungen & die Glockenkurve', track: 'grundlagen', order: 3, status: 'coming-soon' },
	{ slug: 'stichprobenverteilung', title: 'Von der Stichprobe zur Stichprobenverteilung', track: 'grundlagen', order: 4, status: 'live' },
	{ slug: 'konfidenzintervalle', title: 'Schätzen & Konfidenzintervalle', track: 'grundlagen', order: 5, status: 'coming-soon' },
	{ slug: 'hypothesentest', title: 'Hypothesentest & der p-Wert', track: 'grundlagen', order: 6, status: 'coming-soon' },

	// --- Klausur-relevant --------------------------------------------------
	{ slug: 't-tests', title: 't-Tests & nicht-parametrische Alternativen', track: 'klausur', order: 7, status: 'coming-soon' },
	{ slug: 'chi-quadrat', title: 'Chi-Quadrat-Tests', track: 'klausur', order: 8, status: 'coming-soon' },
	{ slug: 'anova', title: 'ANOVA & Mehrstichprobentests', track: 'klausur', order: 9, status: 'coming-soon' },
	{ slug: 'korrelation', title: 'Korrelation & Transformation', track: 'klausur', order: 10, status: 'coming-soon' },
	{ slug: 'regression', title: 'Lineare Regression', track: 'klausur', order: 11, status: 'coming-soon' },

	// --- Vertiefung --------------------------------------------------------
	{ slug: 'power', title: 'Experimentelles Design & Power', track: 'rest', order: 12, status: 'coming-soon' },
	{ slug: 'designtypen', title: 'Designtypen & Pseudoreplikation', track: 'rest', order: 13, status: 'coming-soon' },
	{ slug: 'welcher-test', title: 'Welcher Test?', track: 'rest', order: 14, status: 'coming-soon' }
];

/** Lessons in canonical order (defensive copy, sorted by `order`). */
export const orderedLessons: Lesson[] = [...lessons].sort((a, b) => a.order - b.order);

export type TrackGroup = { id: TrackId; label: string; lessons: Lesson[] };

/**
 * Returns the three tracks in display order, each with its lessons sorted by
 * `order`. Used by the navigation.
 */
export function lessonsByTrack(): TrackGroup[] {
	return TRACKS.map(({ id, label }) => ({
		id,
		label,
		lessons: orderedLessons.filter((lesson) => lesson.track === id)
	}));
}

/** Look up a single lesson by slug, or `undefined` if it does not exist. */
export function getLesson(slug: string): Lesson | undefined {
	return lessons.find((lesson) => lesson.slug === slug);
}

/**
 * The lesson directly after `slug` in the overall ordered list, or `undefined`
 * if `slug` is the last lesson (or unknown).
 */
export function nextLesson(slug: string): Lesson | undefined {
	const index = orderedLessons.findIndex((lesson) => lesson.slug === slug);
	if (index === -1) return undefined;
	return orderedLessons[index + 1];
}

/**
 * The lesson directly before `slug` in the overall ordered list, or `undefined`
 * if `slug` is the first lesson (or unknown).
 */
export function prevLesson(slug: string): Lesson | undefined {
	const index = orderedLessons.findIndex((lesson) => lesson.slug === slug);
	if (index <= 0) return undefined;
	return orderedLessons[index - 1];
}

/** Total number of lessons. */
export const totalLessons = lessons.length;
