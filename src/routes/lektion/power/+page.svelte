<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import PowerSpielplatz from '$lib/widgets/PowerSpielplatz.svelte';
	import FormelZeigen from '$lib/components/FormelZeigen.svelte';
	import Intuition from '$lib/components/Intuition.svelte';
	import Merke from '$lib/components/Merke.svelte';
	import Analogie from '$lib/components/Analogie.svelte';
	import Callout from '$lib/components/Callout.svelte';
	import RCode from '$lib/components/RCode.svelte';
	import Selbsttest from '$lib/components/Selbsttest.svelte';
	import Begriff from '$lib/components/Begriff.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Question } from '$lib/components/selbsttest-logic';

	const slug = 'power';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'power-1',
			kind: 'mc',
			prompt:
				'Otto vergleicht die Zugdistanz zweier Vogelpopulationen mit je 8 besenderten Vögeln. Der t-Test liefert p = 0,21, also nicht signifikant. Welche Schlussfolgerung ist korrekt?',
			options: [
				'Damit ist bewiesen, dass es keinen Unterschied in der Zugdistanz gibt.',
				'Ein nicht-signifikantes Ergebnis beweist NICHT „kein Effekt“. Bei nur 8 Vögeln pro Gruppe und großer Streuung der Zugdistanz hatte der Test womöglich zu wenig Power. Ein real existierender Unterschied könnte schlicht übersehen worden sein.',
				'Der p-Wert von 0,21 bedeutet, dass die Wahrscheinlichkeit für „kein Unterschied“ 79 % beträgt.'
			],
			correct: 1,
			explanation:
				'Genau. „Nicht signifikant“ heißt nur: Die Daten reichten nicht aus, um H₀ zu verwerfen, nicht, dass H₀ wahr ist. Bei kleinem n und großer Streuung ist die Power niedrig, und dann verfehlt man auch echte Effekte (Fehler 2. Art). Erst eine Power-Analyse zeigt, ob die Stichprobe überhaupt groß genug war, um den interessierenden Unterschied zu entdecken. Abwesenheit von Beweis ist nicht Beweis der Abwesenheit.'
		},
		{
			id: 'power-2',
			kind: 'mc',
			prompt:
				'Otto möchte die Power seiner Vogelzug-Studie erhöhen. Welche Maßnahme tut das NICHT?',
			options: [
				'Mehr Vögel pro Gruppe besendern (größeres n).',
				'Die Messung präziser machen, sodass die Streuung der Zugdistanz σ kleiner wird.',
				'Das Signifikanzniveau strenger setzen, also α von 0,05 auf 0,01 senken.'
			],
			correct: 2,
			explanation:
				'Richtig: α zu senken erhöht die Power NICHT, sondern senkt sie (bei festem n). Power steigt mit größerem n, größerer Effektgröße und kleinerer Streuung σ. α kleiner zu machen schiebt die Entscheidungsschwelle nach außen und schützt stärker vor dem Fehler 1. Art, aber genau dadurch übersieht man echte Effekte häufiger (β steigt). Power und α ziehen bei festem n gegeneinander.'
		},
		{
			id: 'power-3',
			kind: 'tf',
			prompt:
				'„Um einen kleineren Effekt (z. B. einen geringeren Unterschied der Zugdistanz) zuverlässig nachzuweisen, brauchst du eine größere Stichprobe.“',
			correct: true,
			explanation:
				'Wahr. Power hängt von (Effektgröße · √n)/σ ab — der nötige Stichprobenumfang wächst ungefähr mit 1/d² (n ≈ 16·s²/d²). Halbierst du die zu entdeckende Differenz d, vervierfacht sich grob das nötige n. Kleine Effekte sind also nicht „unwichtig“, sondern einfach teuer nachzuweisen: Sie verlangen drastisch größere Stichproben.'
		}
	];
</script>

<svelte:head>
	<title>Experimentelles Design & Power · DS2</title>
	<meta
		name="description"
		content="Gutes experimentelles Design entscheidet, ob eine Studie überhaupt etwas zeigen kann: Repräsentativität, Randomisierung als Goldstandard, Blocking, Negativ- und Positivkontrollen, Verblindung und das Isolieren von Confounding. Die zentrale Intuition: Power (1 − β), Effektgröße, Streuung σ, α und Stichprobenumfang n bilden ein gekoppeltes System — Power ∝ (Effektgröße·√n)/σ. Kennt man vier Größen, ist die fünfte festgelegt. Ein nicht-signifikantes Ergebnis bedeutet NICHT „kein Effekt“ — vielleicht war einfach zu wenig Power. Mindeststichprobenumfang per Faustformel n ≈ 16·s²/d², R-Funktion power.t.test und ein interaktiver Power-Spielplatz am Beispiel Vogelzug."
	/>
</svelte:head>

<LessonLayout {slug}>
	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-sage-100 text-sage-500 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Vertiefung · Planung & Power
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Experimentelles Design & Power</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			Otto will wissen, ob zwei Vogelpopulationen unterschiedlich weit ziehen. Er besendert ein paar
			Tiere pro Gruppe, misst die Zugdistanz, rechnet einen t-Test und bekommt
			<em>nicht signifikant</em>. Heißt das: kein Unterschied? Nicht unbedingt. Vielleicht war seine
			Studie schlicht <strong>zu klein</strong>, um den Unterschied zu entdecken. Genau hier setzt
			diese Lektion an: <strong>Wie plant man ein Experiment so, dass es eine echte Chance hat, einen
			vorhandenen Effekt auch zu finden?</strong> Die zentrale Größe dafür heißt
			<Begriff term="Teststärke">Power</Begriff>.
		</p>

		<!-- Planungskriterien ---------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Bevor du misst: gutes Design</h2>
		<p class="text-ink-soft leading-relaxed">
			Die schönste Statistik rettet kein schlechtes Experiment. Über Erfolg oder Misserfolg
			entscheidet die <strong>Planung</strong>. Ein paar Kriterien, an denen sich jedes biologische
			Experiment messen lassen muss:
		</p>

		<Merke title="Die Planungskriterien auf einen Blick">
			<ul class="ml-5 list-disc space-y-1.5">
				<li>
					<Begriff term="Repräsentativität" />: deine Stichprobe muss die
					<Begriff term="Grundgesamtheit" /> widerspiegeln. Misst du nur die kräftigsten Vögel,
					darfst du nicht auf die ganze Population schließen.
				</li>
				<li>
					<Begriff term="Randomisierung" /> (der <strong>Goldstandard</strong>): verteile die Tiere
					per Zufall auf die Gruppen. Das streut bekannte UND unbekannte Störvariablen gleichmäßig
					und schützt vor systematischem Bias.
				</li>
				<li>
					<Begriff term="Blocking" />: fasse ähnliche Einheiten zu Blöcken zusammen (z. B. nach
					Fanggebiet oder Alter) und randomisiere innerhalb jedes Blocks. So rechnest du störende
					Variation aus dem Fehler heraus — das senkt σ und hebt die Power.
				</li>
				<li>
					<strong>Kontrollen</strong>: die <Begriff term="Negativkontrolle" /> zeigt, was ohne
					Behandlung passiert, die <Begriff term="Positivkontrolle" /> zeigt, dass dein Aufbau einen
					echten Effekt überhaupt erkennen kann.
				</li>
				<li>
					<Begriff term="Verblindung" />: single-blind (die Versuchseinheit weiß nicht, in welcher
					Gruppe sie ist) oder double-blind (auch der Beobachter nicht). Das verhindert unbewusste
					Verzerrung der Messung.
				</li>
				<li>
					<Begriff term="Confounding" />: isoliere den eigentlichen Effekt, sodass keine dritte
					Variable Behandlung und Ergebnis gleichzeitig beeinflusst und den Vergleich verfälscht.
				</li>
			</ul>
		</Merke>

		<Analogie title="Randomisierung als fairer Münzwurf">
			Stell dir vor, du verteilst deine Vögel von Hand auf zwei Gruppen. Ganz unabsichtlich landen
			die größeren in Gruppe A. Schon ist der Vergleich vergiftet: Findest du später einen
			Unterschied, weißt du nicht, ob er von der Behandlung kommt oder von der Körpergröße. Die
			<strong>Randomisierung</strong> ist der faire Münzwurf, der genau das verhindert — sie verteilt
			auch Störvariablen, an die du gar nicht gedacht hast, im Mittel gleichmäßig.
		</Analogie>

		<!-- Replikation vs. Pseudoreplikation ------------------------------------ -->
		<h2 class="mt-4 text-2xl">Echte Wiederholungen: Replikation vs. Pseudoreplikation</h2>
		<p class="text-ink-soft leading-relaxed">
			Damit du den Behandlungseffekt von der zufälligen Streuung trennen kannst, brauchst du
			<Begriff term="Replikation">echte Replikate</Begriff>, also mehrere voneinander
			<strong>unabhängige</strong> Wiederholungen. Der häufigste Designfehler ist die
			<Begriff term="Pseudoreplikation" />: Du misst denselben Vogel zehnmal und tust so, als hättest
			du zehn unabhängige Tiere. Das bläht die Stichprobe künstlich auf und liefert falsch kleine
			p-Werte. Faustregel: Replikate müssen wirklich unabhängig sein. (Mehr dazu in der nächsten
			Lektion.)
		</p>

		<!-- Accuracy vs. Precision ----------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Treffgenauigkeit vs. Exaktheit</h2>
		<p class="text-ink-soft leading-relaxed">
			Zwei Qualitäten einer Messung, die man leicht verwechselt:
			<Begriff term="Treffgenauigkeit">Treffgenauigkeit (accuracy)</Begriff> heißt, die Messungen
			liegen <em>im Mittel</em> nah am wahren Wert, also wenig systematischer Fehler (Bias).
			<Begriff term="Exaktheit">Exaktheit (precision)</Begriff> heißt, die Messungen streuen
			<em>untereinander</em> wenig, also gute Reproduzierbarkeit. Beides ist unabhängig: Ein Sender kann
			sehr exakt immer dieselbe falsche Distanz liefern (exakt, aber nicht treffgenau) — oder breit
			streuen, aber im Mittel richtig liegen (treffgenau, aber nicht exakt).
		</p>

		<Callout variant="merke" title="Die Zielscheibe">
			Denk an Pfeile auf einer Zielscheibe. <strong>Treffgenau</strong> = die Pfeile gruppieren sich
			ums Schwarze (im Mittel richtig). <strong>Exakt</strong> = die Pfeile liegen eng beieinander
			(egal wo). Gute Messungen sind <strong>beides</strong>: eng beieinander UND mitten im Schwarzen.
		</Callout>

		<!-- Die zentrale Intuition: das gekoppelte System ------------------------ -->
		<Intuition title="Die zentrale Intuition: ein gekoppeltes System">
			<p>
				Das ist der wichtigste Gedanke der Lektion. <strong>Power, Effektgröße, Streuung σ, das
				Signifikanzniveau α und der Stichprobenumfang n hängen alle zusammen</strong>, sie bilden
				ein einziges gekoppeltes System:
			</p>
			<ul class="mt-2 ml-5 list-disc space-y-1">
				<li>
					Die <Begriff term="Teststärke">Power</Begriff> = 1 − β ist die Wahrscheinlichkeit, einen
					<em>real existierenden</em> Effekt auch als signifikant zu entdecken.
				</li>
				<li>
					Sie steigt mit größerer <Begriff term="Effektgröße" />, größerem n und kleinerer Streuung
					σ, und sie sinkt, wenn du α strenger setzt.
				</li>
			</ul>
			<p class="mt-2">
				Kennst du <strong>vier</strong> dieser Größen, ist die <strong>fünfte festgelegt</strong>.
				Das große Aha: <strong>Ein nicht-signifikantes Ergebnis bedeutet NICHT „kein Effekt“.</strong>
				Vielleicht war einfach zu wenig Power — zu kleines n oder zu große Streuung. Abwesenheit von
				Beweis ist nicht Beweis der Abwesenheit.
			</p>
		</Intuition>

		<p class="text-ink-soft leading-relaxed">
			Die Kopplung steckt in einer einzigen Beziehung. Grob gilt: Die Power hängt davon ab, wie groß
			das <strong>Signal</strong> (die Effektgröße, skaliert mit √n) im Verhältnis zum
			<strong>Rauschen</strong> (der Streuung σ) ist:
		</p>

		<FormelZeigen
			formula={String.raw`\text{Power} \;\propto\; \frac{d \,\sqrt{n}}{\sigma}`}
			symbols={[
				{ sym: String.raw`d`, bedeutung: 'Die Effektgröße — der Unterschied, den du entdecken willst (z. B. Differenz der Zugdistanz in km).' },
				{ sym: String.raw`\sigma`, bedeutung: 'Die Streuung innerhalb der Gruppen — das „Rauschen“. Größeres σ → weniger Power.' },
				{ sym: String.raw`n`, bedeutung: 'Der Stichprobenumfang je Gruppe. Mehr n → mehr Power, aber nur mit √n (vierfaches n verdoppelt das Signal).' },
				{ sym: String.raw`\propto`, bedeutung: '„proportional zu“ — bei festem α steigt die Power monoton mit diesem Verhältnis.' }
			]}
		/>

		<Callout variant="warnung" title="Stolpersteine: Power ist nicht Signifikanz">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Power ≠ Signifikanz (α).</strong> α ist die Wahrscheinlichkeit, einen Effekt zu
					„finden“, der gar nicht da ist (Fehler 1. Art). Power ist die Wahrscheinlichkeit, einen
					Effekt zu finden, der wirklich da ist.
				</li>
				<li>
					<strong>α senken senkt (bei festem n) die Power.</strong> Wer strenger gegen falsch-positive
					schützt, übersieht öfter echte Effekte.
				</li>
				<li>
					<strong>Gleiche Mittelwertdifferenz → unterschiedliche Power.</strong> Bei großer Streuung σ
					verschwindet derselbe Unterschied im Rauschen, bei kleiner σ springt er heraus.
				</li>
			</ul>
		</Callout>

		<!-- Mindeststichprobenumfang --------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Wie viele Vögel pro Gruppe? Der Mindeststichprobenumfang</h2>
		<p class="text-ink-soft leading-relaxed">
			Genau Ottos Frage: <em>Wie viele Vögel pro Gruppe brauche ich?</em> Für die typische Vorgabe
			(Power 0,8, α = 0,05, zweiseitig) gibt es eine handliche <strong>Faustformel</strong>:
		</p>

		<FormelZeigen
			formula={String.raw`n \;\approx\; \frac{16\,s^2}{d^2}`}
			symbols={[
				{ sym: String.raw`n`, bedeutung: 'Der nötige Stichprobenumfang PRO Gruppe.' },
				{ sym: String.raw`s`, bedeutung: 'Die (geschätzte) Streuung der Zugdistanz innerhalb einer Gruppe.' },
				{ sym: String.raw`d`, bedeutung: 'Die zu entdeckende Differenz (Effektgröße) — der Unterschied der Zugdistanz, den du nachweisen willst.' },
				{ sym: String.raw`16`, bedeutung: 'Die Konstante für Power 0,8 und α = 0,05 (zweiseitig). Strengere Vorgaben → größere Konstante.' }
			]}
		/>

		<Callout variant="merke" title="Vogelzug-Rechnung: kleinere Differenzen kosten drastisch">
			Nimm an, die Zugdistanz streut mit s = 40 km.
			<ul class="mt-1 ml-5 list-disc space-y-1">
				<li>
					Großer Unterschied <strong>d = 40 km</strong>: n ≈ 16·40²/40² = <strong>16 Vögel</strong>
					pro Gruppe.
				</li>
				<li>
					Halb so groß, <strong>d = 20 km</strong>: n ≈ 16·40²/20² = <strong>64 Vögel</strong> pro
					Gruppe — viermal so viele!
				</li>
				<li>
					Nur <strong>d = 10 km</strong>: n ≈ 16·40²/10² = <strong>256 Vögel</strong> pro Gruppe.
				</li>
			</ul>
			Weil d im Nenner <em>quadriert</em> steht, explodiert das nötige n, sobald der Effekt klein
			wird. Kleine Effekte sind nicht unwichtig — nur teuer nachzuweisen.
		</Callout>

		<!-- R-Code --------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So rechnet R das aus: power.t.test()</h2>
		<p class="text-ink-soft leading-relaxed">
			In R erledigt <code class="font-mono text-sm">power.t.test()</code> die Power-Analyse exakt. Der
			Trick: Du gibst vier der fünf Größen an und setzt die gesuchte fünfte auf
			<code class="font-mono text-sm">NULL</code> — R rechnet sie aus. Hier lässt Otto sich das nötige
			n für Power 0,8 ausgeben:
		</p>

		<RCode
			code={`# Vogelzug-Power-Analyse: Wie viele Voegel pro Gruppe?
# Gesucht: n. Daher n = NULL und power = 0.8 vorgeben.
power.t.test(n = NULL, delta = 20, sd = 40,
             sig.level = 0.05, power = 0.8)`}
			output={`     Two-sample t test power calculation

              n = 63.77
          delta = 20
             sd = 40
      sig.level = 0.05
          power = 0.8
    alternative = two.sided

NOTE: n is number in *each* group`}
			annotations={{
				'power.t.test': 'Die Power-Analyse für den Zweistichproben-t-Test: vier Größen vorgeben, eine auf NULL setzen.',
				'n = NULL': 'Die gesuchte Größe auf NULL setzen — hier der Stichprobenumfang pro Gruppe.',
				'delta = 20': 'Die zu entdeckende Differenz (Effektgröße) der Zugdistanz in km.',
				'sd = 40': 'Die angenommene Streuung σ der Zugdistanz innerhalb einer Gruppe.',
				'sig.level = 0.05': 'Das Signifikanzniveau α (zweiseitig).',
				'power = 0.8': 'Die geforderte Power 1 − β = 0,8.'
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			R sagt: rund <strong>64 Vögel pro Gruppe</strong>, fast identisch zur Faustformel (n ≈ 64).
			Genauso gut könntest du n vorgeben und <code class="font-mono text-sm">power = NULL</code>
			setzen, um die erreichbare Power deiner geplanten Studie abzulesen.
		</p>

		<!-- Flagship-Widget ------------------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Power-Spielplatz</h2>
		<p class="text-ink-soft leading-relaxed">
			Zieh an den vier Schiebern: <strong>Effektgröße δ</strong> (Unterschied der Zugdistanz),
			<strong>Streuung σ</strong>, <strong>Stichprobenumfang n</strong> (pro Gruppe) und
			<strong>α</strong>. Die große Zahl ist die resultierende <strong>Power (1 − β)</strong>, die
			Kurve zeigt die Power als Funktion von n (mit der Ziellinie bei 0,8 und einer Marke am aktuellen
			n). Hol dir diese beiden Aha-Momente:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				<strong>Halte die Power bei 0,8</strong> (n so wählen, dass die Marke die Ziellinie trifft) —
				was passiert mit dem nötigen n, wenn du die <strong>Streuung σ verdoppelst</strong>? Es
				vervierfacht sich grob.
			</li>
			<li>
				<strong>Verkleinere die Effektgröße δ</strong> — beobachte, wie das nötige n geradezu
				<strong>explodiert</strong>, weil n ungefähr mit 1/d² wächst.
			</li>
		</ol>

		<PowerSpielplatz />

		<Merke title="Was der Power-Spielplatz zeigt">
			Die Power ist kein fester Wert, sondern hängt am gesamten Design. Dieselbe
			Mittelwertdifferenz liefert bei kleiner Streuung viel Power und bei großer Streuung kaum
			welche. Und: Liegt die Marke unter der Ziellinie, ist deine Studie unterpowert — ein
			nicht-signifikantes Ergebnis sagt dann <strong>nichts</strong> über die Existenz des Effekts
			aus.
		</Merke>

		<!-- Zusammenfassung ------------------------------------------------------ -->
		<Intuition title="In einem Satz">
			Gutes <strong>experimentelles Design</strong> (Repräsentativität, Randomisierung, Blocking,
			Kontrollen, Verblindung, Confounding isolieren, echte Replikation) sorgt dafür, dass eine
			Studie einen Effekt überhaupt finden kann; die <strong>Power</strong> = 1 − β, die Effektgröße,
			die Streuung σ, α und n bilden <strong>ein gekoppeltes System</strong> (Power ∝ d·√n/σ), und
			weil ein <strong>nicht-signifikantes Ergebnis nicht „kein Effekt“ heißt</strong>, plant man den
			Stichprobenumfang vorab — Faustformel n ≈ 16·s²/d² oder exakt mit
			<code class="font-mono text-sm">power.t.test()</code>.
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
					Geschafft! Diese Lektion ist als abgeschlossen markiert — du findest den Haken jetzt auch
					in der Seitenleiste.
				</p>
			</div>
		{/if}
	</article>
</LessonLayout>
