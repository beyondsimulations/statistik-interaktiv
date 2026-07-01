<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import SamplingMaschine from '$lib/widgets/SamplingMaschine.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import { tQuantile, normalQuantile } from '$lib/stats';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'konfidenzintervalle';

	// Wird true, sobald der Selbsttest vollständig beantwortet ist.
	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	// Kleines z-vs-t-Rechenbeispiel (im Text gezeigt): gleiche Stichprobe,
	// einmal mit z (große Stichprobe / σ bekannt), einmal mit t (kleines n).
	function fmt(v: number): string {
		return v.toFixed(3).replace('.', ',');
	}
	const zExample = normalQuantile(0.975); // ≈ 1,960
	const tExample9 = tQuantile(0.975, 9); // ≈ 2,262 (n = 10 → df = 9)
	const tExample30 = tQuantile(0.975, 30); // ≈ 2,042 (n = 31 → df = 30)

	const fragen: Question[] = [
		{
			id: 'ki-1',
			kind: 'mc',
			prompt:
				'Otto hat aus 20 besenderten Vögeln ein 95-%-Konfidenzintervall für die mittlere Zugdistanz der Art berechnet. Welche Aussage ist die korrekte frequentistische Deutung?',
			options: [
				'Die wahre mittlere Zugdistanz μ liegt mit 95 % Wahrscheinlichkeit in genau diesem Intervall.',
				'Würde man das Verfahren sehr oft wiederholen, enthielten 95 % der so gebauten Intervalle die wahre mittlere Zugdistanz.',
				'95 % der gemessenen Vögel haben eine Zugdistanz innerhalb dieses Intervalls.'
			],
			correct: 1,
			explanation:
				'Genau. Der Parameter μ (die wahre mittlere Zugdistanz der Art) ist fest: Er liegt entweder in Ottos Intervall oder nicht. Zufällig ist das Intervall, weil es aus einer zufälligen Auswahl von Vögeln entsteht. Die 95 % beziehen sich auf das Verfahren über viele Wiederholungen, nicht auf dieses eine Intervall.'
		},
		{
			id: 'ki-2',
			kind: 'mc',
			prompt:
				'Warum teilt man bei der Stichprobenvarianz durch n − 1, und was passiert mit der Breite des Konfidenzintervalls, wenn n wächst?',
			options: [
				'Durch n − 1, weil die Streuung um das selbst geschätzte x̄ gemessen wird; mit größerem n wird das KI schmaler.',
				'Durch n − 1, damit die Varianz größer wird; mit größerem n wird das KI breiter.',
				'Durch n − 1 aus Konvention; die Breite des KI hängt nicht von n ab.'
			],
			correct: 0,
			explanation:
				'Richtig. Die rohe Varianz streut um x̄ (selbst aus den Daten geschätzt) statt um das wahre μ und unterschätzt σ² systematisch; n − 1 (die Freiheitsgrade) korrigiert das und macht den Schätzer erwartungstreu. Und weil der Standardfehler σ/√n mit wachsendem n kleiner wird, wird auch das Konfidenzintervall schmaler: mehr Daten, präzisere Schätzung.'
		},
		{
			id: 'ki-3',
			kind: 'tf',
			prompt: 'Ein 99-%-Konfidenzintervall ist breiter als ein 95-%-Konfidenzintervall.',
			correct: true,
			explanation:
				'Wahr. Mehr Sicherheit verlangt einen größeren kritischen Wert (z geht von 1,96 auf 2,58), also ein breiteres Intervall. Sicherheit und Präzision sind ein Tauschgeschäft: Willst du dir sicherer sein, das wahre μ einzufangen, musst du ein breiteres Netz auswerfen.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Kennwert vs. Parameter, Punktschätzer & Erwartungstreue, warum n−1, Standardfehler und das Konfidenzintervall x̄ ± z·SE. Mit der Sampling-Maschine zur korrekten Deutung: der Parameter ist fest, das Intervall ist zufällig."
>
	<Rueckblick {slug} />

	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Grundlagen · Schätzen
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Schätzen & Konfidenzintervalle</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Im letzten Kapitel hast du gesehen: Ein Stichprobenmittelwert ist nicht „die Wahrheit“,
			sondern eine zufällige Ziehung. In dieser Lektion machen wir das nutzbar. Otto hat 20 Vögel
			einer Art besendert und ihre Zugdistanz gemessen; daraus will er auf die <em>wahre mittlere
			Zugdistanz der ganzen Art</em> schließen, und <strong>ehrlich dazu sagen, wie präzise</strong>
			er sie damit eingegrenzt hat. Am Ende steht ein Satz, den fast alle falsch deuten, und du
			wirst ihn richtig verstehen.
		</p>

		<!-- Kennwert vs. Parameter ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Kennwert oder Parameter?</h2>
		<p class="text-ink-soft leading-relaxed">
			Die ganze schließende Statistik dreht sich um eine einzige Unterscheidung: zwischen dem, was
			du <em>misst</em>, und dem, was du eigentlich <em>wissen willst</em>. Otto misst 20 Vögel —
			das sind seine Daten. Wissen will er aber etwas über <em>alle</em> Vögel der Art, und die kann
			er nie alle fangen. Für diese zwei Seiten gibt es zwei Namen.
		</p>
		<p class="text-ink-soft leading-relaxed">
			<strong>Was du misst</strong>, heißt <Begriff term="Kennwert" />: eine Größe, die du aus
			deiner <Begriff term="Stichprobe" /> berechnest, etwa der Mittelwert <strong>x̄</strong> oder
			die Standardabweichung <strong>s</strong>. Kennwerte schreibt man mit <em>lateinischen</em>
			Buchstaben, und sie schwanken von Stichprobe zu Stichprobe.
		</p>
		<p class="text-ink-soft leading-relaxed">
			<strong>Was du wissen willst</strong>, heißt <Begriff term="Parameter" />: eine feste, meist
			unbekannte Größe der <Begriff term="Grundgesamtheit" /> — also aller Vögel der Art zusammen.
			Das ist der wahre Mittelwert <strong>μ</strong> oder die wahre Standardabweichung
			<strong>σ</strong>. Parameter schreibt man mit <em>griechischen</em> Buchstaben, und sie ändern
			sich nicht. Dein Ziel: vom beobachteten Kennwert auf den unbekannten Parameter schließen.
		</p>

		<Merke title="Lateinisch schätzt griechisch">
			<strong>Kennwerte</strong> (x̄, s) kommen aus der Stichprobe, sind lateinisch und zufällig.
			<strong>Parameter</strong> (μ, σ) gehören zur Grundgesamtheit, sind griechisch und fest. Wir
			benutzen den Kennwert, um den Parameter zu <em>schätzen</em>.
		</Merke>

		<Intuition title="Ein Mittelwert ist eine zufällige Ziehung — nicht die Wahrheit">
			Das ist die Brücke aus dem letzten Kapitel: Dein x̄ ist <strong>ein</strong> Wert aus der
			<Begriff term="Stichprobenkennwertverteilung" />, der Verteilung aller Mittelwerte, die du
			bei lauter verschiedenen Stichproben bekommen würdest. Hätte Otto andere Vögel besendert,
			läge sein x̄ woanders. Deshalb darfst du x̄ nie mit μ verwechseln: x̄ ist ein zufälliger
			Schätzer, μ ist der feste, gesuchte Wert dahinter.
		</Intuition>

		<!-- Punktschätzer & Erwartungstreue ------------------------------------- -->
		<h2 class="mt-4 text-2xl">Der Punktschätzer und seine Treue</h2>
		<p class="text-ink-soft leading-relaxed">
			Der einfachste Weg, μ zu schätzen, ist ein <Begriff term="Punktschätzer" />: eine einzelne
			Zahl. Für μ nimmt man naheliegenderweise x̄. Was diesen Schätzer gut macht, ist seine
			<Begriff term="Erwartungstreue" /> (englisch <em>unbiased</em>): Er trifft im Mittel über
			alle möglichen Stichproben genau den wahren Wert. Er ist also nicht systematisch zu hoch oder
			zu niedrig, nur eben von Stichprobe zu Stichprobe verstreut.
		</p>
		<p class="text-ink-soft leading-relaxed">
			In eine Formel gegossen heißt das, mit dem <Begriff term="Erwartungswert" />-Operator E(·) —
			gemeint ist der Mittelwert über unendlich viele Wiederholungen der Stichprobenziehung —
			schlicht: der Erwartungswert von x̄ ist genau μ.
		</p>

		<FormelZeigen
			formula={String.raw`\mathbb{E}(\bar X) = \mu`}
			symbols={[
				{ sym: String.raw`\bar X`, bedeutung: 'Der Stichprobenmittelwert — unser Punktschätzer für μ. Selbst eine Zufallsgröße.' },
				{ sym: String.raw`\mathbb{E}(\cdot)`, bedeutung: 'Der Erwartungswert: der Mittelwert über unendlich viele Wiederholungen der Stichprobenziehung.' },
				{ sym: String.raw`\mu`, bedeutung: 'Der wahre, feste Parameter der Grundgesamtheit, den wir schätzen wollen.' }
			]}
		/>

		<!-- Warum n-1 ------------------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Warum durch n − 1? Die Sache mit den Freiheitsgraden</h2>
		<p class="text-ink-soft leading-relaxed">
			Bei der Stichprobenvarianz teilst du die Summe der quadrierten Abweichungen nicht durch n,
			sondern durch <strong>n − 1</strong>. Das wirkt willkürlich — ist es aber nicht. Gehen wir es
			in drei kleinen Schritten durch.
		</p>
		<p class="text-ink-soft leading-relaxed">
			<strong>Erstens: Du misst um die falsche Mitte.</strong> Die Abweichungen berechnest du
			gegenüber <em>x̄</em> — und x̄ hast du selbst aus denselben Daten geschätzt. Die Daten liegen
			per Konstruktion möglichst nah an ihrem eigenen x̄, näher, als sie im Schnitt am wahren μ
			lägen.
		</p>
		<p class="text-ink-soft leading-relaxed">
			<strong>Zweitens: „Durch n“ wäre deshalb zu klein.</strong> Weil die Abweichungen um das
			eigene x̄ kleiner ausfallen als um das wahre μ, würdest du σ² systematisch unterschätzen, wenn
			du durch n teilst. Die rohe Varianz kommt zu niedrig heraus.
		</p>
		<p class="text-ink-soft leading-relaxed">
			<strong>Drittens: n − 1 sind die Freiheitsgrade.</strong> Ein
			<Begriff term="Freiheitsgrade">Freiheitsgrad</Begriff> ist schon dafür „verbraucht“, dass du
			x̄ aus den Daten geschätzt hast. Stell es dir konkret vor: Kennst du x̄ und alle Werte bis auf
			einen einzigen, dann liegt dieser letzte Wert zwangsläufig fest — er muss die Summe genau so
			ergänzen, dass wieder x̄ herauskommt. Frei wählbar sind also nur n − 1 der Abweichungen, und
			genau durch diese Zahl teilst du.
		</p>

		<FormelZeigen
			formula={String.raw`s^2 = \frac{1}{n-1}\sum_{i=1}^{n}\left(x_i - \bar x\right)^2`}
			symbols={[
				{ sym: String.raw`s^2`, bedeutung: 'Die Stichprobenvarianz — erwartungstreuer Schätzer für die wahre Varianz σ².' },
				{ sym: String.raw`x_i - \bar x`, bedeutung: 'Abweichung jedes Werts vom geschätzten Mittelwert x̄ (nicht vom wahren μ — daher die Korrektur).' },
				{ sym: String.raw`n-1`, bedeutung: 'Die Freiheitsgrade: ein Wert ist durch die Schätzung von x̄ gebunden, n − 1 bleiben frei.' }
			]}
		/>

		<Merke title="n − 1 macht den Schätzer ehrlich">
			Durch n − 1 (statt n) zu teilen, korrigiert die Unterschätzung, die entsteht, weil die
			Varianz um das selbst geschätzte x̄ statt um das wahre μ gemessen wird. So wird s² zu einem
			<strong>erwartungstreuen</strong> Schätzer für σ². Für große n ist der Unterschied winzig,
			bei kleinem n aber spürbar.
		</Merke>

		<!-- Standardfehler ------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Der Standardfehler: wie sehr x̄ schwankt</h2>
		<p class="text-ink-soft leading-relaxed">
			Wenn x̄ von Stichprobe zu Stichprobe schwankt — wie <em>stark</em> tut es das? Das misst der
			<Begriff term="Standardfehler" /> (SE). Er ist die Standardabweichung der
			Stichprobenkennwertverteilung und damit das Maß für die Unsicherheit deiner Schätzung.
		</p>

		<FormelZeigen
			formula={String.raw`SE = \frac{\sigma}{\sqrt{n}} \quad\text{bzw.}\quad SE \approx \frac{s}{\sqrt{n}}`}
			symbols={[
				{ sym: String.raw`SE`, bedeutung: 'Standardfehler des Mittelwerts: wie weit x̄ typischerweise um μ streut.' },
				{ sym: String.raw`\sigma`, bedeutung: 'Wahre Standardabweichung der Grundgesamtheit. Ist sie unbekannt, ersetzt man sie durch s.' },
				{ sym: String.raw`\sqrt{n}`, bedeutung: 'Die Wurzel des Stichprobenumfangs — deshalb halbiert erst die Vervierfachung von n den Standardfehler.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Der <strong>√n</strong> im Nenner ist die zentrale Botschaft: Mehr Daten machen die Schätzung
			präziser, aber mit abnehmendem Ertrag. Willst du den Standardfehler halbieren, brauchst du
			die <em>vierfache</em> Stichprobe.
		</p>

		<!-- Konfidenzintervall --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Vom Punkt zum Intervall: das Konfidenzintervall</h2>
		<p class="text-ink-soft leading-relaxed">
			Ein einzelner Punktschätzer verschweigt seine Unsicherheit. Ehrlicher ist ein
			<Begriff term="Konfidenzintervall" /> (KI): ein ganzer Bereich um x̄ herum, der den wahren
			Wert plausibel einschließt. Du baust ihn, indem du an x̄ ein Vielfaches des Standardfehlers
			anhängst, nach beiden Seiten, denn ein KI ist immer <strong>zweiseitig</strong>.
		</p>

		<FormelZeigen
			formula={String.raw`\bar x \;\pm\; z \cdot \frac{\sigma}{\sqrt{n}}`}
			symbols={[
				{ sym: String.raw`\bar x`, bedeutung: 'Dein Punktschätzer — die Mitte des Intervalls.' },
				{ sym: String.raw`z`, bedeutung: 'Der kritische z-Wert zum Konfidenzniveau: 90 % → 1,65; 95 % → 1,96; 99 % → 2,58.' },
				{ sym: String.raw`\sigma/\sqrt{n}`, bedeutung: 'Der Standardfehler — die natürliche „Einheit“ der Unsicherheit.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Das <Begriff term="Konfidenzniveau" /> (z. B. 95 %) legt fest, wie „großzügig“ das Intervall
			ist; sein Gegenstück ist das Risiko <strong>α</strong> = 1 − Niveau (bei 95 % also α = 5 %),
			das sich zu gleichen Teilen auf beide Enden verteilt. Die wichtigsten z-Werte solltest du im
			Kopf haben:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>90 % Konfidenz → z ≈ <strong>1,65</strong></li>
			<li>95 % Konfidenz → z ≈ <strong>1,96</strong></li>
			<li>99 % Konfidenz → z ≈ <strong>2,58</strong></li>
		</ul>
		<p class="text-ink-soft leading-relaxed">
			Diese drei Zahlen sind keine Willkür, die man auswendig lernen muss: Es sind die
			<Begriff term="Kritischer Wert">kritischen Werte</Begriff> der
			<Begriff term="Standardnormalverteilung" /> — genau die Grenzen, die symmetrisch um die Mitte
			90 %, 95 % bzw. 99 % der Fläche unter der Glockenkurve einschließen. Mehr Konfidenz bedeutet
			mehr Fläche, und mehr Fläche bedeutet einen größeren z-Wert.
		</p>

		<!-- DIE zentrale Fehldeutung -------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Die eine Deutung, die fast alle falsch machen</h2>

		<Callout variant="warnung" title="Vorsicht: der berühmte Trugschluss">
			Es ist <strong>verlockend</strong> (und <strong>falsch</strong>), zu sagen: „Der wahre Wert
			liegt mit 95 % Wahrscheinlichkeit in diesem Intervall.“ Der Parameter μ ist
			<strong>fest</strong>. Er ist keine Zufallsgröße. Er liegt in deinem konkreten Intervall —
			oder eben nicht. Eine Wahrscheinlichkeit von „95 %, dass μ hier drin ist“ gibt es für dein
			eines, schon berechnetes Intervall nicht.
		</Callout>

		<Intuition title="Das Intervall ist zufällig, der Parameter ist fest">
			Dreh die Sicht um: Zufällig ist nicht μ, sondern <strong>das Intervall</strong>, denn es
			entsteht aus einer zufälligen Stichprobe. Die korrekte Aussage lautet daher:
			<strong
				>Bei sehr häufiger Wiederholung enthalten 95 % der so konstruierten Intervalle den
				wahren Wert.</strong
			> Die 95 % sind eine Eigenschaft des <em>Verfahrens</em> über viele Stichproben, nicht eine
			Wahrscheinlichkeit für dein eines Intervall. Genau das machst du gleich in der
			Sampling-Maschine mit eigenen Augen sichtbar.
		</Intuition>

		<Analogie title="Hufeisenwerfen auf einen festen Pflock">
			Der Pflock (μ) steht fest im Boden, er bewegt sich nie. Jeder Wurf ist ein Hufeisen
			(ein KI), das mal über den Pflock fällt, mal daneben. „95 % Konfidenz“ heißt: Auf lange
			Sicht landen 95 % deiner Würfe um den Pflock. Bei einem einzelnen, schon geworfenen Hufeisen
			zu sagen „es liegt mit 95 % um den Pflock“ ergibt keinen Sinn, es liegt drum herum oder
			nicht. Nicht der Pflock wackelt, die Würfe streuen.
		</Analogie>

		<!-- Das Flaggschiff-Widget ---------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Probier es selbst aus: die Sampling-Maschine</h2>
		<p class="text-ink-soft leading-relaxed">
			Hier wird die richtige Deutung anfassbar. Das wahre μ, die wahre mittlere Zugdistanz der Art,
			steht als rote Linie fest und bewegt sich <em>nie</em>. Jede Stichprobe (eine neue Gruppe
			besenderter Vögel) erzeugt ein Konfidenzintervall, das darunter gestapelt wird. Geh am besten
			so vor:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>Klick ein paarmal auf <strong>„Stichprobe ziehen“</strong> (als würdest du jedes Mal eine neue Gruppe Vögel besendern) und beobachte, wie die Intervalle um die feste μ-Linie tanzen; manche treffen, manche verfehlen.</li>
			<li>Drück <strong>„100 ziehen“</strong> und sieh zu, wie der Trefferanteil sich beim <strong>Konfidenzniveau</strong> einpendelt (~95 %).</li>
			<li>Stell das Niveau auf <strong>99 %</strong>: Die Intervalle werden breiter und es gibt weniger Fehlschüsse. Auf <strong>90 %</strong> werden sie schmaler, dafür verfehlen mehr.</li>
			<li>Erhöh <strong>n</strong>: Die Intervalle werden schmaler (der Standardfehler sinkt), der Trefferanteil bleibt aber beim Niveau.</li>
		</ol>

		<Callout variant="merke" title="Bevor du loslegst: σ ist hier bekannt">
			Ein Vorab-Hinweis, damit du die Maschine richtig einordnest: Sie <strong>tut so, als
			kenntest du σ</strong> (wir kennen ja die ganze Population) und rechnet daher sauber mit dem
			z-basierten KI x̄ ± z·σ/√n und z = Φ⁻¹(0,975) für 95 %. Im echten Leben kennst du σ fast nie —
			dann schätzt du es aus den Daten durch s, und diese zusätzliche Unsicherheit verlangt die
			t-Verteilung. Dazu gleich nach dem Widget mehr.
		</Callout>

		<SamplingMaschine />

		<!-- z vs. t -------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">z oder t? Kleine Stichproben brauchen breitere Netze</h2>
		<p class="text-ink-soft leading-relaxed">
			Den z-Wert darfst du nur verwenden, wenn σ bekannt ist oder die Stichprobe groß ist. Bei
			<strong>kleinem n</strong> und <strong>unbekanntem σ</strong> musst du σ durch s schätzen. Das
			ist ein Schätzer mehr, der selbst schwanken kann — und diese zusätzliche Unsicherheit muss
			ehrlich mit ins Intervall.
		</p>
		<p class="text-ink-soft leading-relaxed">
			Dafür gibt es die <Begriff term="Student-t-Verteilung" />: glockenförmig wie die
			Normalverteilung, aber mit <strong>schwereren Rändern</strong>. „Schwerere Ränder“ heißt
			anschaulich: Die Kurve ist flacher und breiter, extreme Werte sind etwas wahrscheinlicher.
			Genau so bildet sie die Extra-Unsicherheit bei kleinem n ab — und das führt zu
			<strong>größeren kritischen Werten</strong>, also zu einem breiteren Intervall. Wie stark, das
			hängt von den Freiheitsgraden <strong>df = n − 1</strong> ab: je kleiner n, desto breiter die
			Kurve.
		</p>

		<FormelZeigen
			formula={String.raw`\bar x \;\pm\; t_{\,df}\cdot \frac{s}{\sqrt{n}}, \qquad df = n-1`}
			symbols={[
				{ sym: String.raw`t_{\,df}`, bedeutung: 'Der kritische t-Wert zu df Freiheitsgraden. Für kleines df größer als z → breiteres Intervall.' },
				{ sym: String.raw`s`, bedeutung: 'Die Stichproben-Standardabweichung, die hier σ ersetzt.' },
				{ sym: String.raw`df = n-1`, bedeutung: 'Die Freiheitsgrade. Mit wachsendem df nähert sich t der Normalverteilung an.' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Konkret für ein 95-%-KI (zweiseitig, also das 0,975-Quantil): Der z-Wert ist
			<strong>{fmt(zExample)}</strong>. Bei einer kleinen Stichprobe von n = 10 (df = 9) ist der
			t-Wert dagegen <strong>{fmt(tExample9)}</strong>, deutlich größer, das Intervall also
			breiter. Bei n = 31 (df = 30) sind es nur noch <strong>{fmt(tExample30)}</strong>, schon
			nah an z. Je größer die Stichprobe, desto kleiner der Unterschied — bei großem n sind t-Wert
			und z-Wert praktisch nicht mehr zu unterscheiden.
		</p>

		<Merke title="Im Zweifel t — es ist nie falsch">
			Bei <strong>kleinem n / unbekanntem σ</strong> liefert die breitere t-Verteilung das
			korrekte, ehrlich-breitere Intervall. Für große n ist der Unterschied verschwindend (t → z),
			weshalb t nie schadet. Die Sampling-Maschine bleibt der Klarheit halber z-basiert, weil sie σ
			als bekannt voraussetzt.
		</Merke>

		<!-- Mindeststichprobenumfang -------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Wie viele Daten brauche ich? Der Mindeststichprobenumfang</h2>
		<p class="text-ink-soft leading-relaxed">
			Die KI-Formel lässt sich umdrehen. Will Otto, dass sein 95-%-Intervall für die mittlere
			Zugdistanz höchstens eine gewünschte Genauigkeit E (die halbe Intervallbreite, der „Fehler“)
			hat, kann er den nötigen Stichprobenumfang (also wie viele Vögel er besendern muss) vorab
			ausrechnen:
		</p>

		<FormelZeigen
			formula={String.raw`n = \left(\frac{z\cdot\sigma}{E}\right)^2`}
			symbols={[
				{ sym: String.raw`n`, bedeutung: 'Der mindestens nötige Stichprobenumfang (aufrunden auf die nächste ganze Zahl).' },
				{ sym: String.raw`z`, bedeutung: 'Der kritische z-Wert zum gewünschten Konfidenzniveau (z. B. 1,96 für 95 %).' },
				{ sym: String.raw`\sigma`, bedeutung: 'Die (geschätzte oder bekannte) Standardabweichung der Grundgesamtheit.' },
				{ sym: String.raw`E`, bedeutung: 'Die gewünschte maximale Genauigkeit — die halbe Breite des Intervalls (Fehlermarge).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Das Quadrat ist die Kehrseite des √n von vorhin: Doppelt so genau (halbes E) zu sein,
			kostet die <em>vierfache</em> Stichprobe. Präzision ist teuer.
		</p>

		<Intuition title="In einem Satz">
			Ein Konfidenzintervall ist x̄ ± (kritischer Wert) · Standardfehler — ein
			<em>zufälliges</em> Netz um eine <em>feste</em>, unbekannte Wahrheit; „95 % Konfidenz“ ist
			eine Eigenschaft des Verfahrens auf lange Sicht, kein Wahrscheinlichkeitsurteil über dein
			eines Intervall.
		</Intuition>

		<!-- Selbsttest ----------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Sitzt es? Drei kurze Fragen</h2>
		<p class="text-ink-soft leading-relaxed">
			Keine Prüfung, nur eine Selbstkontrolle. Du bekommst zu jeder Frage sofort eine Erklärung.
		</p>

		<Selbsttest questions={fragen} onComplete={markDone} />

		{#if done}
			<div
				class="border-sage-300 bg-sage-100 text-sage-500 flex items-center gap-3 rounded-2xl border px-5 py-4"
				role="status"
			>
				<span class="text-xl" aria-hidden="true">✓</span>
				<p class="font-semibold">
					Geschafft! Diese Lektion ist als abgeschlossen markiert. Den Haken findest du jetzt
					auch in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
