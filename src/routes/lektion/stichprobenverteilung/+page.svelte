<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import StichprobenverteilungWidget from '$lib/widgets/StichprobenverteilungWidget.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'stichprobenverteilung';

	// Wird true, sobald der Selbsttest vollständig beantwortet ist.
	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'sv-1',
			kind: 'mc',
			prompt: 'Du misst die Flügellänge gefangener Amseln. Was wird glockenförmig — die Flügellängen der einzelnen Vögel oder die mittleren Flügellängen vieler Fänge?',
			options: [
				'Die Flügellängen der einzelnen Vögel in der Grundgesamtheit',
				'Die mittleren Flügellängen vieler Fänge (Stichproben)',
				'Beides immer gleichzeitig'
			],
			correct: 1,
			explanation:
				'Genau das ist der Kern: Nicht die einzelnen Flügellängen müssen glockenförmig sein, sondern die Verteilung der Stichprobenmittelwerte wird es, auch wenn die Flügellängen im Wald ganz anders verteilt sind.'
		},
		{
			id: 'sv-2',
			kind: 'mc',
			prompt: 'Was passiert mit dem Standardfehler, wenn du pro Fang mehr Amseln misst (Stichprobenumfang n größer)?',
			options: [
				'Er wird größer.',
				'Er wird kleiner.',
				'Er bleibt unverändert.'
			],
			correct: 1,
			explanation:
				'Richtig. Der Standardfehler ist σ/√n. Größeres n im Nenner heißt: kleinerer Standardfehler, also schwankt die mittlere Flügellänge weniger von Fang zu Fang. Mehr gemessene Vögel, verlässlichere Schätzung.'
		},
		{
			id: 'sv-3',
			kind: 'tf',
			prompt: 'Der Zentrale Grenzwertsatz gilt auch, wenn die Flügellängen im Wald schief (nicht glockenförmig) verteilt sind.',
			correct: true,
			explanation:
				'Wahr. Das ist das Verblüffende daran: Selbst aus einer schiefen Grundgesamtheit werden die Stichprobenmittelwerte mit wachsendem n glockenförmig. Probier es im Widget mit der rechtsschiefen Verteilung aus.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Warum sagt eine kleine Stichprobe etwas über eine riesige Grundgesamtheit aus? Die zentrale Idee der schließenden Statistik — interaktiv erklärt."
>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Kernidee
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">
				Von der Stichprobe zur Stichprobenverteilung
			</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Fast die gesamte schließende Statistik hängt an einer einzigen Idee. Wenn die
			klick macht, verstehst du den Rest viel leichter: Konfidenzintervalle,
			p-Werte, t-Tests. Schauen wir sie uns also in Ruhe an.
		</p>

		<Rueckblick {slug} />

		<p class="text-ink-soft leading-relaxed">
			Die Frage dahinter klingt fast wie ein Zaubertrick: Warum sagt uns eine
			kleine <Begriff term="Stichprobe" /> überhaupt etwas über eine riesige
			<Begriff term="Grundgesamtheit" />? Stell dir vor, du willst die
			Flügellänge <em>aller</em> Amseln in einem großen Wald kennen. Die kannst du
			niemals alle fangen. Du fängst und misst ein paar Dutzend Vögel und willst
			daraus auf den ganzen Bestand schließen. Wie kann das funktionieren? Und vor
			allem: Wie sicher darfst du dir dabei sein?
		</p>

		<p class="text-ink-soft leading-relaxed">
			Stell dir kurz das Setup vor. Die Grundgesamtheit sind alle Amseln des
			Waldes, die dich eigentlich interessieren. Du kannst sie nie ganz messen,
			also ziehst du eine Stichprobe, du fängst ein paar Vögel, und rechnest
			daraus einen <Begriff term="Mittelwert" />, hier die mittlere Flügellänge der
			gefangenen Tiere. Dieser eine Mittelwert ist dein Schätzwert. Die spannende
			Frage ist: Wie sehr würde er schwanken, wenn du noch einmal losziehst und
			andere Amseln fängst? Genau diese Schwankung ist der
			<Begriff term="Standardfehler" />, und sie ist der Schlüssel zu allem, was
			danach kommt.
		</p>

		<Merke title="Worauf es jetzt ankommt">
			Halte zwei Dinge auseinander: die <em>Streuung der Flügellängen</em> in einem
			einzelnen Fang und die <em>Schwankung der mittleren Flügellänge</em> von Fang
			zu Fang. Es geht hier um das Zweite.
		</Merke>

		<!-- Das Widget ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Lass uns die Idee nicht behaupten, sondern bauen. Geh im Widget am besten in
			dieser Reihenfolge vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Zieh ein paar einzelne Stichproben (stell dir vor, du fängst jedes Mal eine Handvoll Amseln) und beobachte, wie jeder Fang eine mittlere Flügellänge liefert.</li>
			<li>Klick dann auf <strong>×100</strong> und sieh zu, wie sich aus den vielen Mittelwerten eine neue Verteilung aufbaut.</li>
			<li>Mach den Stichprobenumfang <strong>n</strong> größer, miss also mehr Vögel pro Fang, und achte darauf, wie schmal die Verteilung der Mittelwerte wird.</li>
			<li>Stell zum Schluss die Grundgesamtheit auf <strong>rechtsschief</strong> um und schau, was mit den Mittelwerten passiert.</li>
		</ol>

		<StichprobenverteilungWidget />

		<!-- Aha-Beat (a): viele Mittelwerte bilden eine neue Verteilung ---------- -->
		<Intuition title="Beat 1 — eine neue Verteilung entsteht">
			Jeder Fang gibt dir genau <em>einen</em> Mittelwert, eine mittlere
			Flügellänge. Für sich genommen ist das nur ein Punkt. Aber wenn du das
			hundertfach wiederholst und alle Mittelwerte sammelst, entsteht eine ganz
			eigene Verteilung: die <strong>Stichprobenverteilung des Mittelwerts</strong>.
			Sie zeigt nicht mehr die einzelnen Flügellängen, sondern wie der Mittelwert
			selbst von Fang zu Fang schwankt.
		</Intuition>

		<!-- Aha-Beat (b): schmaler als die Population, schmaler mit n ------------ -->
		<p class="text-ink-soft leading-relaxed">
			Ist dir aufgefallen, dass diese Verteilung der Mittelwerte deutlich
			<strong>schmaler</strong> ist als die Grundgesamtheit? Das ist kein Zufall.
			Ein Mittelwert mittelt Ausreißer nach oben und unten gegeneinander weg, also
			liegt er fast immer näher an der Wahrheit als ein einzelner Wert. Und je
			größer du n machst, desto stärker passiert dieses Wegmitteln. Die Verteilung
			wird immer schmaler.
		</p>

		<Intuition title="Beat 2 — schmaler mit mehr Daten">
			Diese Breite hat einen Namen: den <Begriff term="Standardfehler" />. Er misst,
			wie weit die Mittelwerte um die Wahrheit streuen. Mehr Daten heißt: kleinerer
			Standardfehler, also eine verlässlichere Schätzung. Genau das siehst du, wenn
			du n hochdrehst.
		</Intuition>

		<!-- Aha-Beat (c): auch bei schiefer Grundgesamtheit eine Glocke --------- -->
		<p class="text-ink-soft leading-relaxed">
			Und jetzt der Teil, der die meisten überrascht. Selbst wenn du die
			Grundgesamtheit auf <strong>rechtsschief</strong> stellst (also auf etwas,
			das überhaupt nicht nach Glocke aussieht), formen die Mittelwerte trotzdem
			eine schöne, symmetrische Glocke. Die Daten dürfen schief sein; die
			Mittelwerte werden es nicht bleiben.
		</p>

		<Intuition title="Beat 3 — der Zentrale Grenzwertsatz">
			Das ist der <strong>Zentrale Grenzwertsatz</strong>: Egal welche Form die
			Grundgesamtheit hat, die Verteilung der Mittelwerte nähert sich mit
			wachsendem n einer Glockenkurve an. Deshalb dürfen wir später so oft mit der
			Normalverteilung rechnen, obwohl die echten Daten ganz anders aussehen.
		</Intuition>

		<!-- Die Formel ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die eine Formel dahinter</h2>
		<p class="text-ink-soft leading-relaxed">
			Die ganze Beobachtung „schmaler mit mehr Daten“ steckt in einer einzigen,
			erstaunlich kurzen Formel. Du musst sie nicht auswendig lernen, schau sie dir
			einfach an und prüfe, ob sie zu dem passt, was du gerade im Widget gesehen hast.
		</p>

		<FormelZeigen
			formula={String.raw`SE = \dfrac{\sigma}{\sqrt{n}}`}
			symbols={[
				{ sym: String.raw`SE`, bedeutung: 'Standardfehler — die Streuung der Mittelwerte von Stichprobe zu Stichprobe.' },
				{ sym: String.raw`\sigma`, bedeutung: 'Standardabweichung der Grundgesamtheit — wie stark die einzelnen Werte streuen.' },
				{ sym: String.raw`n`, bedeutung: 'Stichprobenumfang — wie viele Werte du pro Stichprobe ziehst.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Lies sie ruhig Symbol für Symbol: Oben steht <Begriff term="Standardabweichung">σ</Begriff>,
			die Streuung der Grundgesamtheit. Unten steht <strong>√n</strong>, also die
			Wurzel aus deinem Stichprobenumfang. Weil n unten im Nenner steht, wird der
			ganze Bruch, der Standardfehler, kleiner, sobald n größer wird. Und weil
			dort die <em>Wurzel</em> steht, brauchst du die vierfache Stichprobe, um den
			Standardfehler zu halbieren. Mehr Daten helfen, aber mit abnehmendem Tempo.
		</p>

		<!-- Take-away ------------------------------------------------------------ -->
		<Intuition title="In einem Satz">
			Viele Stichproben ergeben viele Mittelwerte; diese Mittelwerte bilden eine
			eigene, schmalere Glockenkurve — und genau darauf baut die gesamte
			schließende Statistik auf.
		</Intuition>

		<!-- Selbsttest ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Sitzt es? Drei kurze Fragen</h2>
		<p class="text-ink-soft leading-relaxed">
			Keine Prüfung, nur eine Selbstkontrolle. Du bekommst zu jeder Frage sofort
			eine Erklärung.
		</p>

		<Selbsttest questions={fragen} onComplete={markDone} />

		{#if done}
			<div
				class="border-sage-300 bg-sage-100 text-sage-500 flex items-center gap-3 rounded-2xl border px-5 py-4"
				role="status"
			>
				<span class="text-xl" aria-hidden="true">✓</span>
				<p class="font-semibold">
					Geschafft! Diese Lektion ist als abgeschlossen markiert. Den Haken
					findest du jetzt auch in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
