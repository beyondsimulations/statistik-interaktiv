<script lang="ts">
	import LessonLayout from '$lib/components/LessonLayout.svelte';
	import Rueckblick from '$lib/components/Rueckblick.svelte';
	import RegressionBuilder from '$lib/widgets/RegressionBuilder.svelte';
	import SSZerlegung from '$lib/widgets/SSZerlegung.svelte';
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

	const slug = 'regression';

	let done = $state(progress.isComplete(slug));

	function markDone() {
		progress.markComplete(slug);
		done = true;
	}

	const fragen: Question[] = [
		{
			id: 'reg-1',
			kind: 'mc',
			prompt:
				'Du regressierst die Anzahl Nachkommen auf die Körperlänge von Daphnien. Die Steigung ist hochsignifikant (p < 0,001), aber R² = 0,12. Wie liest du das richtig?',
			options: [
				'Beides sagt dasselbe: Der Zusammenhang ist stark und das Modell sagt sehr gut vorher.',
				'Die Steigung ist signifikant → ein Zusammenhang zwischen Länge und Nachkommen EXISTIERT (β ≠ 0). Das kleine R² heißt aber: Die Länge erklärt nur 12 % der Streuung der Nachkommenzahl — das Modell sagt trotzdem SCHLECHT vorher. „Signifikant“ ≠ „sagt gut vorher“.',
				'Wegen R² = 0,12 ist die Steigung in Wahrheit nicht signifikant; das p muss ein Rechenfehler sein.'
			],
			correct: 1,
			explanation:
				'Genau. Die beiden Aussagen beantworten verschiedene Fragen. Der p-Wert der Steigung sagt: Existiert der Zusammenhang überhaupt (ist β von 0 verschieden)? R² sagt: Wie viel der Y-Streuung erklärt das Modell, also wie gut sagt es vorher? Ein hochsignifikantes b bei kleinem R² ist völlig normal. Der Effekt ist real, aber schwach prädiktiv. Bei großem n wird selbst ein winziger Effekt signifikant.'
		},
		{
			id: 'reg-2',
			kind: 'mc',
			prompt:
				'Dein p-Wert für die Steigung ist winzig. Warum solltest du dir trotzdem die Diagnoseplots (Residuals-vs-Fitted, Q-Q) ansehen?',
			options: [
				'Muss man nicht — ein kleines p garantiert, dass das Modell passt.',
				'Weil ein kleines p NICHT garantiert, dass die Annahmen halten. Erst die Residuenplots zeigen, ob Linearität, Varianzhomogenität und Normalität stimmen: Ein Bogen oder Trichter in Residuals-vs-Fitted oder eine gekrümmte Q-Q-Linie machen das Modell ungültig — egal wie klein p ist.',
				'Nur um die Grafik im Bericht schöner aussehen zu lassen; statistisch sagen die Plots nichts aus.'
			],
			correct: 1,
			explanation:
				'Richtig. Der p-Wert prüft nur H0: β = 0 — er sagt nichts über die GÜLTIGKEIT des Modells. Ist der Zusammenhang in Wahrheit gekrümmt (Bogen in Residuals-vs-Fitted), nimmt die Streuung mit den Vorhersagen zu (Trichter → Heteroskedastie) oder sind die Residuen schief (Q-Q weicht von der Diagonale ab), dann sind p-Wert und Konfidenzintervalle nicht vertrauenswürdig. Die Diagnoseplots sind die zweite Hürde nach der Signifikanz.'
		},
		{
			id: 'reg-3',
			kind: 'tf',
			prompt:
				'„Ein einzelner einflussreicher Punkt (hohe Hebelwirkung) kann die Regressionsgerade stark verändern.“',
			correct: true,
			explanation:
				'Wahr. Ein Punkt mit hoher Hebelwirkung liegt weit draußen in X-Richtung und zieht die Kleinste-Quadrate-Gerade förmlich zu sich — er kann Steigung, Achsenabschnitt und R² dramatisch kippen, obwohl alle anderen Punkte unverändert bleiben. Genau das zeigt der Regression-Builder mit dem Hebelpunkt. Solche Punkte spürt man über Hebelwirkung (leverage) und Cook-Distanz auf.'
		}
	];
</script>

<LessonLayout
	{slug}
	description="Die lineare Regression legt mit der Methode der kleinsten Quadrate eine Gerade ŷ = a + b·x durch die Daten und sagt Y aus X vorher — anders als die Korrelation hat sie eine Richtung. Steigung b (Änderung von Y pro Einheit X), Achsenabschnitt a (Y bei X = 0), Residuen als Grundlage der Diagnostik, Bestimmtheitsmaß R² = SS_Regression / SS_Total und der t-Test auf die Steigung (t = b/SE_b, df = n − 2, H0: β = 0). Die zentrale Intuition: R² ≠ Signifikanz — eine Steigung kann hochsignifikant sein (Zusammenhang existiert) und R² trotzdem klein (schlechte Vorhersage). Annahmen und Diagnoseplots (Residuals-vs-Fitted, Q-Q), Hebelwirkung und Cook-Distanz. Am Beispiel Daphnia: Anzahl Nachkommen ~ Körperlänge, mit interaktivem Regression-Builder."
>
	<Rueckblick {slug} />

	<article class="flex flex-col gap-5">
		<!-- Hinführung ----------------------------------------------------------- -->
		<header class="flex flex-col gap-3">
			<span
				class="bg-amber-100 text-amber-600 inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
			>
				Klausur-relevant · Zusammenhänge
			</span>
			<h1 class="text-4xl leading-tight md:text-5xl">Lineare Regression</h1>
		</header>

		<p class="text-ink-soft text-lg leading-relaxed">
			In der letzten Lektion haben wir gefragt: <em>Hängen</em> zwei Größen zusammen? Jetzt gehen wir
			einen Schritt weiter und fragen: Kann ich aus der einen Größe die andere
			<strong>vorhersagen</strong>? Bei der Wasserfloh-Art <em>Daphnia</em> beobachten wir: Größere
			Tiere bekommen mehr Nachkommen. Die <Begriff term="Lineare Regression">lineare Regression</Begriff>
			legt eine <strong>Gerade</strong> durch die Punktwolke
			<strong>Körperlänge → Anzahl Nachkommen</strong> und macht aus „hängt zusammen“ ein
			handfestes „so viele Nachkommen erwarte ich bei dieser Länge“.
		</p>

		<!-- Korrelation vs. Regression ------------------------------------------ -->
		<h2 class="mt-4 text-2xl">Von der Korrelation zur Regression: jetzt mit Richtung</h2>
		<p class="text-ink-soft leading-relaxed">
			Der entscheidende Unterschied zur <Begriff term="Korrelation" />: Die Regression hat eine
			<strong>Richtung</strong>. Sie behandelt die beiden Variablen nicht mehr gleichberechtigt,
			sondern unterscheidet eine <strong>erklärende</strong> Größe X (hier: die Körperlänge) und
			eine <strong>vorhergesagte</strong> Größe Y (die Nachkommenzahl). X erklärt Y, nicht
			umgekehrt. Und sie liefert nicht nur eine Zahl, sondern ein <strong>Vorhersagemodell</strong>:
			eine Gerade, mit der du für jede Länge eine erwartete Nachkommenzahl ablesen kannst.
		</p>

		<p class="text-ink-soft leading-relaxed">
			Dahinter stehen zwei Gleichungen, die man sauber auseinanderhalten muss. In der
			<strong>Population</strong> (der ganzen Daphnien-Welt) gilt der wahre, unbekannte Zusammenhang:
		</p>

		<FormelZeigen
			formula={String.raw`y = \alpha + \beta\,x + \varepsilon`}
			symbols={[
				{ sym: String.raw`\alpha`, bedeutung: 'Der WAHRE Achsenabschnitt der Population (unbekannt).' },
				{ sym: String.raw`\beta`, bedeutung: 'Die WAHRE Steigung der Population (unbekannt) — was wir eigentlich wissen wollen.' },
				{ sym: String.raw`\varepsilon`, bedeutung: 'Der Fehlerterm: alles, was die Gerade nicht erklärt (zufällige Streuung um die wahre Gerade).' }
			]}
		/>

		<p class="text-ink-soft leading-relaxed">
			Aus deiner <Begriff term="Stichprobe" /> kannst du α und β nur <strong>schätzen</strong>. Die
			geschätzte Gerade heißt:
		</p>

		<FormelZeigen
			formula={String.raw`\hat{y} = a + b\,x`}
			symbols={[
				{ sym: String.raw`\hat{y}`, bedeutung: 'Die VORHERSAGE — die erwartete Nachkommenzahl bei Länge x (mit Dach: geschätzt).' },
				{ sym: String.raw`a`, bedeutung: 'Der geschätzte Achsenabschnitt (schätzt α).' },
				{ sym: String.raw`b`, bedeutung: 'Die geschätzte Steigung (schätzt β).' }
			]}
		/>

		<Callout variant="merke" title="ŷ, ε und a, b — wer ist wer?">
			<strong>ŷ</strong> ist die Vorhersage auf der Geraden. Der Abstand einer echten Beobachtung
			von dieser Vorhersage ist das <Begriff term="Residuum">Residuum</Begriff> e = y − ŷ, die
			Stichproben-Entsprechung des wahren Fehlers ε. Und <strong>a, b</strong> sind unsere
			Schätzungen für die wahren, aber unbekannten <strong>α, β</strong>.
		</Callout>

		<!-- Kleinste Quadrate --------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Wie findet man die beste Gerade? Kleinste Quadrate</h2>
		<p class="text-ink-soft leading-relaxed">
			Durch eine Punktwolke kann man unendlich viele Geraden legen. Welche ist die beste? Die
			<Begriff term="Methode der kleinsten Quadrate">Methode der kleinsten Quadrate</Begriff> gibt
			eine klare Antwort: jene Gerade, die die <strong>Summe der quadrierten Residuen</strong>
			minimiert. Für jeden Punkt misst man den senkrechten Abstand zur Geraden, also das Residuum,
			quadriert ihn (damit Über- und Unterschätzungen sich nicht aufheben und große Abstände stärker
			zählen) und summiert. Die Gerade, die diese Summe so klein wie möglich macht, gewinnt.
		</p>

		<FormelZeigen
			formula={String.raw`b = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sum_{i=1}^{n}(x_i - \bar{x})^2}, \qquad a = \bar{y} - b\,\bar{x}`}
			symbols={[
				{ sym: String.raw`b`, bedeutung: 'Die STEIGUNG: um wie viele Nachkommen die Vorhersage steigt, wenn die Länge um 1 mm zunimmt.' },
				{ sym: String.raw`a`, bedeutung: 'Der ACHSENABSCHNITT: die vorhergesagte Nachkommenzahl bei Länge 0 (oft nur rechnerisch).' },
				{ sym: String.raw`\bar{x},\, \bar{y}`, bedeutung: 'Die Mittelwerte — die Gerade geht immer durch den Schwerpunkt (x̄, ȳ).' }
			]}
		/>

		<Merke title="Steigung und Achsenabschnitt biologisch lesen">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					Die <Begriff term="Steigung">Steigung b</Begriff> ist die <strong>Effektgröße</strong>:
					b = 6 hieße „pro zusätzlichem Millimeter Körperlänge erwarte ich rund 6 Nachkommen mehr“.
				</li>
				<li>
					Der <Begriff term="Achsenabschnitt">Achsenabschnitt a</Begriff> ist die Vorhersage bei
					X = 0. Hier oft nur ein <strong>rechnerischer</strong> Wert — eine Daphnie mit 0 mm Länge
					gibt es nicht, der Punkt liegt außerhalb der Daten.
				</li>
			</ul>
		</Merke>

		<!-- Residuen ------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Residuen: das Übriggebliebene</h2>
		<p class="text-ink-soft leading-relaxed">
			Das <Begriff term="Residuum">Residuum</Begriff> eines Tieres ist schlicht
			<strong>Beobachtung − Vorhersage</strong>: e = y − ŷ. Liegt ein Tier über der Geraden, ist
			sein Residuum positiv (mehr Nachkommen als erwartet), liegt es darunter, negativ. Die
			Residuen sind nicht bloß „Rest“. Sie sind die <strong>Grundlage aller Diagnostik</strong>:
			An ihnen liest man später ab, ob das Modell überhaupt passt.
		</p>

		<!-- Bestimmtheitsmaß R² ------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Wie gut sagt das Modell vorher? Das Bestimmtheitsmaß R²</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Nachkommenzahl streut. Ein Teil dieser Streuung erklärt das Modell (weil größere Tiere
			eben mehr Nachkommen haben), ein Teil bleibt unerklärt (die Residuen). Das
			<Begriff term="Bestimmtheitsmaß">Bestimmtheitsmaß R²</Begriff> ist der <strong>Anteil der
			Y-Variabilität, den das Modell erklärt</strong>, die <Begriff term="Varianzzerlegung"
				>Streuungszerlegung</Begriff> in erklärt und unerklärt:
		</p>

		<FormelZeigen
			formula={String.raw`R^2 = \frac{SS_{\text{Regression}}}{SS_{\text{Total}}} = 1 - \frac{SS_{\text{Residuum}}}{SS_{\text{Total}}}`}
			symbols={[
				{ sym: String.raw`SS_{\text{Total}}`, bedeutung: 'Gesamtstreuung von Y: Σ (yᵢ − ȳ)² — wie stark die Nachkommenzahl insgesamt schwankt.' },
				{ sym: String.raw`SS_{\text{Regression}}`, bedeutung: 'Vom Modell erklärt: Σ (ŷᵢ − ȳ)² — wie stark allein die Gerade schwankt.' },
				{ sym: String.raw`SS_{\text{Residuum}}`, bedeutung: 'Unerklärt: Σ (yᵢ − ŷᵢ)² — die Summe der quadrierten Residuen.' },
				{ sym: String.raw`R^2`, bedeutung: 'Anteil in [0, 1]. R² = 0,8 heißt: 80 % der Streuung der Nachkommenzahl erklärt die Länge. Bei einfacher Regression ist R² = r².' }
			]}
		/>

		<SSZerlegung
			ssExplained={80}
			ssResidual={20}
			ratioSymbol="R²"
			caption="Beispiel: R² = 0,80 — die Länge erklärt 80 % der Streuung der Nachkommenzahl"
		/>

		<Analogie title="Der Kuchen der Streuung">
			Stell dir die gesamte Streuung der Nachkommenzahl als einen <strong>Kuchen</strong> vor. Die
			Regression schneidet ihn in zwei Stücke: das Stück, das die Körperlänge <em>erklärt</em>, und
			den Rest, der unerklärt bleibt (die Residuen). <strong>R²</strong> ist schlicht der Anteil des
			erklärten Stücks am ganzen Kuchen. Ein großes erklärtes Stück (R² nahe 1) heißt: Die Länge
			sagt die Nachkommenzahl gut vorher.
		</Analogie>

		<!-- Test auf die Steigung ----------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Ist der Zusammenhang echt? Der Test auf die Steigung</h2>
		<p class="text-ink-soft leading-relaxed">
			Auch aus völlig zusammenhanglosen Daten ergibt sich rein zufällig fast nie eine perfekt
			waagerechte Gerade. Ein bisschen Steigung entsteht immer. Der Test prüft die
			<Begriff term="Nullhypothese">Nullhypothese</Begriff> H₀: β = 0, also „die wahre Steigung ist
			null, die Gerade bringt nichts gegenüber dem reinen Mittelwert von Y“. Die Teststatistik ist
			ein <Begriff term="t-Test">t-Wert</Begriff> mit <Begriff term="Freiheitsgrade">df = n − 2</Begriff>:
		</p>

		<FormelZeigen
			formula={String.raw`t = \frac{b}{SE_b}, \qquad df = n - 2`}
			symbols={[
				{ sym: String.raw`b`, bedeutung: 'Die geschätzte Steigung.' },
				{ sym: String.raw`SE_b`, bedeutung: 'Der Standardfehler der Steigung — wie stark b von Stichprobe zu Stichprobe schwanken würde.' },
				{ sym: String.raw`n-2`, bedeutung: 'Die Freiheitsgrade: zwei Parameter (a und b) sind „verbraucht“.' },
				{ sym: String.raw`t`, bedeutung: 'Großes |t| → kleiner p-Wert → die Steigung ist signifikant von 0 verschieden, der Zusammenhang existiert.' }
			]}
		/>

		<!-- Die zentrale Intuition ---------------------------------------------- -->
		<Intuition title="Die zentrale Intuition: R² ≠ Signifikanz">
			<p>
				Das ist der wichtigste Gedanke der Lektion. <strong>Signifikanz und R² beantworten zwei
				verschiedene Fragen.</strong>
			</p>
			<ul class="mt-2 ml-5 list-disc space-y-1">
				<li>
					Der <strong>p-Wert der Steigung</strong> sagt: <em>Existiert</em> der Zusammenhang
					überhaupt (ist β ≠ 0)? „Signifikant“ heißt nur „der Zusammenhang ist real“.
				</li>
				<li>
					<strong>R²</strong> sagt: Wie <em>gut</em> sagt das Modell vorher? Es misst die Qualität
					der Vorhersage.
				</li>
			</ul>
			<p class="mt-2">
				Beides kann auseinanderfallen: Eine Steigung kann <strong>hochsignifikant</strong> sein
				(β ≠ 0, der Zusammenhang existiert), während <strong>R² klein</strong> ist (das Modell sagt
				trotzdem schlecht vorher). „Signifikant“ heißt also <strong>nicht</strong> „sagt gut
				vorher“. Und eine zweite Hürde: Ein winziges p garantiert <strong>nicht</strong>, dass die
				Annahmen halten — erst die Diagnoseplots entscheiden über die Gültigkeit des Modells.
			</p>
		</Intuition>

		<!-- Flagship-Widget ----------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Selbst ausprobieren: der Regression-Builder</h2>
		<p class="text-ink-soft leading-relaxed">
			Zieh die Punkte und beobachte, wie sich die Kleinste-Quadrate-Gerade, die senkrechten
			<strong>Residuen-Segmente</strong> und die Kennzahlen <strong>b, a, R²</strong> und der
			<strong>p-Wert der Steigung</strong> live mitbewegen. Der untere Balken zeigt die
			Streuungszerlegung (erklärt vs. unerklärt). Hol dir vor allem diesen Aha-Moment:
		</p>
		<ol class="text-ink-soft ml-5 list-decimal space-y-1 leading-relaxed">
			<li>
				Klick <strong>Hebelpunkt hinzufügen</strong>: Ein einziger Punkt weit draußen in x (große
				Länge, wenige Nachkommen) <strong>kippt die ganze Gerade</strong> und lässt R² einbrechen —
				obwohl alle anderen Punkte unverändert bleiben. So gefährlich ist ein einzelner
				einflussreicher Punkt.
			</li>
			<li>
				Zieh einen Punkt weit nach oben oder unten: Sein <strong>Residuum-Segment</strong> wächst,
				und R² verschlechtert sich, während die Steigung sich nur leicht dreht.
			</li>
		</ol>

		<RegressionBuilder />

		<Merke title="Was der Regression-Builder zeigt">
			Die Gerade ist ein Kompromiss über alle Punkte (kleinste Summe der quadrierten Residuen).
			Ein <strong>Hebelpunkt</strong> weit draußen in x hat überproportionalen Einfluss und kann
			Steigung, Achsenabschnitt und R² dramatisch verändern. Deshalb reicht es nie, nur auf b und
			den p-Wert zu schauen. Man muss die <strong>Punktwolke und die Residuen</strong> ansehen.
		</Merke>

		<!-- Annahmen & Diagnostik ----------------------------------------------- -->
		<h2 class="mt-4 text-2xl">Hält das Modell? Annahmen & Diagnoseplots</h2>
		<p class="text-ink-soft leading-relaxed">
			Ein kleiner p-Wert allein macht ein Modell noch nicht gültig. Die lineare Regression ruht auf
			vier Annahmen, die man an den Residuen überprüft:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li><strong>Linearität</strong>: der Zusammenhang ist wirklich gerade, kein Bogen.</li>
			<li><strong>Unabhängigkeit</strong>: die Beobachtungen beeinflussen sich nicht gegenseitig.</li>
			<li>
				<Begriff term="Varianzhomogenität" />: die Streuung der Residuen ist über den ganzen
				X-Bereich gleich groß (kein Trichter).
			</li>
			<li><strong>Normalität der Residuen</strong>: die Residuen sind ungefähr normalverteilt.</li>
		</ul>

		<Merke title="Die zwei wichtigsten Diagnoseplots">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Residuals-vs-Fitted</strong> soll <strong>strukturlos</strong> sein — eine
					formlose Punktwolke um die Nulllinie. Ein <em>Bogen</em> verrät fehlende Linearität, ein
					<em>Trichter</em> (Streuung wächst nach rechts) verrät Varianzheterogenität.
				</li>
				<li>
					Der <strong>Q-Q-Plot</strong> soll möglichst auf der <strong>Diagonale</strong> liegen;
					systematische Abweichungen an den Enden zeigen schiefe oder schwere Verteilungsränder
					(Normalität verletzt).
				</li>
			</ul>
		</Merke>

		<Callout variant="warnung" title="Einflussreiche Punkte: Hebelwirkung & Cook-Distanz">
			Ein einzelner Punkt kann das ganze Modell dominieren. Die
			<Begriff term="Hebelwirkung">Hebelwirkung (leverage)</Begriff> misst, wie weit ein Punkt in
			X-Richtung von den anderen entfernt liegt — solche Punkte haben viel „Hebel“ auf die Gerade.
			Die <Begriff term="Cook-Distanz" /> kombiniert Hebel und Residuum zu einem Maß dafür, wie sehr
			sich die Schätzung ändert, wenn man den Punkt weglässt. Ein einziger Hebelpunkt kann die
			Gerade kippen — genau das siehst du oben im Regression-Builder.
		</Callout>

		<!-- R-Code -------------------------------------------------------------- -->
		<h2 class="mt-4 text-2xl">So sieht das in R aus</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Regression rechnest du mit <code class="font-mono text-sm">lm()</code> (linear model),
			die Kennzahlen liest du aus <code class="font-mono text-sm">summary()</code> ab:
		</p>

		<RCode
			code={`# Daphnia: Anzahl Nachkommen aus der Koerperlaenge vorhersagen.
model <- lm(nachkommen ~ laenge, data = daphnia)
summary(model)`}
			output={`Coefficients:
            Estimate Std. Error t value Pr(>|t|)
(Intercept) -10.1786     1.1333  -8.982 0.000288 ***
laenge        6.7857     0.3113  21.794 3.77e-06 ***

Multiple R-squared:  0.9896,	Adjusted R-squared:  0.9875
F-statistic: 475.0 on 1 and 5 DF,  p-value: 3.774e-06`}
			annotations={{
				lm: 'lm(y ~ x) passt das Modell ŷ = a + b·x mit kleinsten Quadraten an.',
				Estimate: 'Die Schätzungen: (Intercept) = a, laenge = b (die Steigung, ≈ 6,79 Nachkommen pro mm).',
				'Std. Error': 'SE_b — der Standardfehler der Steigung, geht in t = b/SE_b ein.',
				't value': 't = b / SE_b = 6,79 / 0,311 ≈ 21,79 für die Steigung.',
				'Pr(>|t|)': 'Der p-Wert für H0: β = 0. Hier winzig (3,77e−6) → die Steigung ist hochsignifikant.',
				'Multiple R-squared': 'R² = 0,99 — die Länge erklärt 99 % der Streuung der Nachkommenzahl (sehr gute Vorhersage).'
			}}
		/>

		<p class="text-ink-soft leading-relaxed">
			Mit <code class="font-mono text-sm">plot(model)</code> bekommst du die vier Diagnoseplots:
			<strong>Residuals vs Fitted</strong> (soll strukturlos sein), den <strong>Q-Q-Plot</strong>
			(soll auf der Diagonale liegen), den Scale-Location-Plot (Varianzhomogenität) und
			<strong>Residuals vs Leverage</strong> mit den Cook-Distanz-Konturen, die einflussreiche
			Punkte markieren. Erst wenn diese Plots in Ordnung sind, darfst du dem winzigen p-Wert
			vertrauen.
		</p>

		<!-- Vorhersage: KI vs. Vorhersageintervall & Extrapolation -------------- -->
		<h2 class="mt-4 text-2xl">Vorhersagen mit Unsicherheit: KI vs. Vorhersageintervall</h2>
		<p class="text-ink-soft leading-relaxed">
			Die Gerade liefert für jede Länge x einen Punktwert ŷ. Doch eine Vorhersage ohne Unsicherheit ist
			wertlos. Und hier lauert eine feine, klausurrelevante Unterscheidung. Es gibt
			<strong>zwei</strong> Intervalle, die ganz unterschiedliche Fragen beantworten:
		</p>
		<ul class="text-ink-soft ml-5 list-disc space-y-1 leading-relaxed">
			<li>
				Das <strong>Konfidenzintervall des Mittelwerts</strong> (mean response) fragt:
				<em>Wo liegt die mittlere Nachkommenzahl ALLER Daphnien dieser Länge?</em> Es umschließt die
				wahre Regressionsgerade und ist relativ <strong>schmal</strong>.
			</li>
			<li>
				Das <Begriff term="Vorhersageintervall">Vorhersageintervall</Begriff> fragt:
				<em>In welchem Bereich liegt die Nachkommenzahl EINER EINZELNEN neuen Daphnie dieser Länge?</em>
				Es ist immer <strong>breiter</strong>.
			</li>
		</ul>
		<p class="text-ink-soft leading-relaxed">
			Warum ist das Vorhersageintervall breiter? Weil es <strong>zwei</strong> Quellen von Unsicherheit
			addiert: die Unsicherheit über die Lage der Geraden selbst (wie beim KI) <em>plus</em> die
			zusätzliche Streuung eines einzelnen Tieres um die Gerade (der Fehlerterm ε). Ein einzelnes Tier
			streut eben um den Mittelwert seiner Längenklasse, und diese Extra-Streuung steckt nur im
			Vorhersageintervall.
		</p>

		<Merke title="Mittelwert oder Einzelfall?">
			<ul class="ml-5 list-disc space-y-1">
				<li>
					<strong>Konfidenzintervall</strong>: für die <em>mittlere</em> Antwort vieler Tiere dieser
					Länge. Schmal.
				</li>
				<li>
					<strong>Vorhersageintervall</strong>: für <em>eine</em> einzelne neue Beobachtung. Immer
					breiter, weil zusätzlich die individuelle Streuung ε eingeht.
				</li>
			</ul>
		</Merke>

		<p class="text-ink-soft leading-relaxed">
			In R steuerst du beides über das Argument <code class="font-mono text-sm">interval</code> von
			<code class="font-mono text-sm">predict()</code>:
		</p>

		<RCode
			code={`# Vorhersage fuer eine neue Daphnie mit Laenge 3.5 mm
neu <- data.frame(laenge = 3.5)

# (a) Konfidenzintervall des Mittelwerts (schmal):
predict(model, newdata = neu, interval = "confidence")

# (b) Vorhersageintervall fuer eine EINZELNE neue Daphnie (breiter):
predict(model, newdata = neu, interval = "prediction")`}
			output={`       fit      lwr      upr
1 13.5714 12.8329 14.3099

       fit      lwr      upr
1 13.5714 10.8762 16.2666`}
			annotations={{
				'interval = "confidence"': 'Liefert das KI der MITTLEREN Antwort: wo die wahre Gerade bei x = 3,5 liegt. Hier 12,83 bis 14,31 — schmal.',
				'interval = "prediction"': 'Liefert das Vorhersageintervall für EINE neue Daphnie: 10,88 bis 16,27, deutlich breiter, weil die individuelle Streuung dazukommt.',
				'fit': 'Der Punktwert ŷ ist in beiden Fällen identisch (13,57), nur die Breite des Intervalls unterscheidet sich.'
			}}
		/>

		<Callout variant="warnung" title="Niemals außerhalb des beobachteten X-Bereichs vorhersagen (Extrapolation)">
			Deine Daphnien waren z. B. zwischen 2 und 4 mm lang. Eine Vorhersage <em>innerhalb</em> dieses
			Bereichs ist Interpolation, also solide. Eine Vorhersage <strong>außerhalb</strong>, etwa die
			Nachkommenzahl einer 8 mm langen Daphnie, ist <Begriff term="Extrapolation" /> — und riskant:
			Dort hat niemand geprüft, ob der lineare Zusammenhang überhaupt noch gilt. Vielleicht knickt die
			Nachkommenzahl bei großen Tieren ab oder sättigt; die Gerade läuft aber stur weiter und liefert
			eine womöglich völlig unsinnige Zahl. Bleib mit Vorhersagen im Bereich, den deine Daten
			tatsächlich abdecken.
		</Callout>

		<!-- Zusammenfassung ----------------------------------------------------- -->
		<Intuition title="In einem Satz">
			Die <strong>lineare Regression</strong> schätzt mit der <strong>Methode der kleinsten
			Quadrate</strong> die Gerade ŷ = a + b·x (Schätzer für die wahren α, β) und sagt Y aus X
			vorher — sie hat im Gegensatz zur Korrelation eine <strong>Richtung</strong> (X erklärt Y);
			die <strong>Steigung b</strong> ist die
			Effektgröße, <strong>R² = SS_Regression/SS_Total</strong> der erklärte Anteil, und der
			<strong>t-Test auf β = 0</strong> (df = n − 2) prüft, ob der Zusammenhang existiert — wobei
			<strong>Signifikanz ≠ gute Vorhersage</strong> (R² ≠ Signifikanz) ist und erst die
			<strong>Diagnoseplots</strong> samt Hebelwirkung und Cook-Distanz über die Gültigkeit
			entscheiden.
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
