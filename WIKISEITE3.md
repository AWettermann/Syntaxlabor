# Wikiseite 3 – Chomsky-Hierarchie

Erweiterung des bestehenden Syntaxlabors V4.1, Stand 19. November 2026. Öffne `index.html` oder die [veröffentlichte Anwendung](https://awettermann.github.io/Syntaxlabor/) und wähle **3 · Chomsky-Hierarchie**. Die sechs Arbeitsblatt-Blöcke W0–W5 sind Teil des neuen Vier-Modul-Lernpfads; [Gesamtübersicht](LERNPFAD.md). Die vollständige Chomsky-Hierarchie bleibt enthalten.

## Grundlage und Vollständigkeit

Fachliche Grundlage ist das vom Nutzer bereitgestellte `Chomsky_Hierarchie_korrigiertes_Arbeitsblatt (1).docx`. Die [unveränderte lokale Kopie](materials/wiki3/arbeitsblatt.docx) ist auch direkt im Modul herunterladbar. Die Aufgaben sind Unterrichtsmaterial; Aufforderungen zur Recherche oder Präsentation richten sich an die Lernenden.

Die Vorlage nummeriert die Grammatikanalyse vor dem Zug als Aufgabe 4 beziehungsweise 3. Die App ordnet die fünf gewünschten Bereiche einheitlich und nennt jeweils die Originalnummer. Hinzu kommt die vorbereitende Hierarchietabelle. Die sechs Aufgabenblöcke besitzen jetzt 33 Teilaufgaben, einschließlich des ergänzten Korrektheits-/Vollständigkeitsnachweises beim Intercity-Zug. Der neue Gesamtbestand umfasst 74 Aufgaben und 283 Teilaufgaben. Die BE und AFB der neuen Teilaufgaben sind didaktische Setzungen der App, keine Vorgaben des Arbeitsblatts.

| App | Arbeitsblatt | Inhalt und Materialien |
| --- | --- | --- |
| W0 · Vorbereitung | Aufgabe 1 | Gruppenrecherche, vier Tabellenzeilen für Typ 0–3: Regeln, Beispielgrammatik mit Sprache, Automat; Präsentationsauftrag |
| W1 · 1 | Aufgabe 2 | Originalgrammatik über a,b,c,d; alle drei Wörter; vollständige Ableitungen der erzeugbaren Wörter; Ausschlussbegründung |
| W2 · 2 | Aufgabe 4 | Originalgrammatik mit Start Z über u,v,w; Typ, Sprache, Beispiele; uv²wu²v; zulässiger aussichtsloser Ableitungszweig und Begründung |
| W3 · 3 | Aufgabe 3 | Intercity mit genau t, n-mal 1, s und 2n-mal 2, n ≥ 1; kürzester Zug; eigene Grammatik; deren Typ; unabhängiger Regularitätsbeweis |
| W4 · 4 | Aufgabe 5 | Alle vier Originalaussagen mit Entscheidung, Begründung und Gegenbeispielen |
| W5 · 5 | Aufgabe 6 | Vollständige LaTeX-Aufgabe; Quellcode, drei Listen, beide Diagramme; Listenauswahl und Begründung; Diagrammbeschreibung; eigenes Diagramm Zahl; Gesamtgrammatik; Ableitung mit dieser Grammatik |

Material 1 wurde als kopierbarer Quellcode übernommen. Die beiden eingebetteten Originalabbildungen sind in [Material 2](materials/wiki3/material2-listen.png) und [Material 3](materials/wiki3/material3-diagramme.png) unverändert erhalten und in der App aufklappbar. Die drei Listen sind zusätzlich als lesbares HTML dargestellt. Die Diagramme wurden mit dem vorhandenen SVG-Renderer sprachlich gleichwertig nachgezeichnet und bieten Zoom, horizontales Verschieben und Tastaturzugriff. Im SVG werden Terminalzeichenfolgen wie im übrigen Labor zitiert; Backslashes erscheinen daher maskiert. Die Originale zeigen die Zeichen ohne diese Notationskonvention.

## Bearbeitung und Speicherung

Das Modul nutzt die bestehende Navigation, Aufgabenkarten, Modi, Bewertung und Lernstandsverwaltung. Für Zahl wird derselbe vorhandene grafische Editor eingebettet. Es gibt keine zweite Anwendung. Der freie Laborentwurf sowie Aufgaben- und Klausurantworten bleiben getrennt.

Eigene Produktionsgrammatiken unterstützen einzelne Großbuchstaben und benannte Nichtterminale wie `<Liste>`. Beispiel:

```text
<Start> → "t" <Wagen>
<Wagen> → "1" <Wagen> "22" | "1s22"
```

Hier ist das Startsymbol `<Start>`. Eine Produktion pro Zeile, Alternativen mit `|`; `→` und `->` sind als Regeltrenner lesbar. Benannte Nichtterminale werden in spitzen Klammern notiert. Terminalfolgen in Anführungszeichen müssen Backslashes verdoppeln, beispielsweise `"\\item"`. Außerhalb von Anführungszeichen ist Leerraum Layout. In der LaTeX-Aufgabe wird gemäß Arbeitsblatt zusätzlich Leerraum innerhalb zitierter Terminalfolgen und in Ableitungsschritten ignoriert; dies verändert die Leerraumbedeutung anderer Aufgaben und der freien EBNF nicht. Leerraum im Worttest der eigenen Grammatik wird entsprechend der Modellierung ignoriert. Ableitungsschritte verwenden einheitlich `->`; eine Satzform pro Zeile ist ebenfalls möglich.

Die eigene Grammatik kann als Diagramm betrachtet und an frei gewählten Wörtern erprobt werden. Das Ergebnis dieser Wortprobe sagt ausschließlich etwas über das gewählte Wort aus. Nach einer Änderung werden alte Diagrammvorschauen entfernt. Grammatik, Startsymbol, Ableitungen und grafische Entwürfe bleiben im lokalen Lernstand erhalten und werden mit exportiert/importiert. Die neuen Formate fließen in die passenden bestehenden Kompetenzanzeigen ein.

Im Lernmodus stehen nacheinander drei bis vier Hilfestufen zur Verfügung. Musterlösungen erscheinen erst auf Wunsch oder nach Prüfung. Im Trainingsmodus bleiben Hilfen und Lösungen bis zur Abgabe verdeckt; danach sind die Antworten gesperrt. Genutzte Hilfen werden wie bisher gekennzeichnet.

## Was wird automatisch geprüft?

| Bereich | Vollständig automatisch prüfbarer Anteil | Selbstkontrolle / Grenze |
| --- | --- | --- |
| W0 | Kein automatisches Inhaltsurteil über die Recherche | Alle vier Zeilen mit Erwartungshorizont und getrennten Selbstpunkten |
| W1 | Wortzugehörigkeit; jede einzelne Regelanwendung und Zielwort der beiden Ableitungen | Begründung des nicht erzeugbaren Wortes |
| W2 | Produktionsform; Gültigkeit verschiedener eigener Beispielwörter; vollständige Zielableitung; zulässiger begonnener Zweig und Unerreichbarkeit des Ziels | Präzise Sprachbeschreibung, Klassifikationsbegründung und Begründung zum eigenen Ableitungszweig |
| W3 | Kürzeste Wagenfolge; Produktionsform der tatsächlich eingegebenen eigenen Grammatik; Entscheidung zur Regularität | Grammatikgleichwertigkeit nur bei Beweis automatisch bestätigt, sonst offen; Begründungen und Nichtregularitätsbeweis manuell |
| W4 | Die vier Wahrheitswerte unter der angegebenen ε-Konvention | Sämtliche Begründungen und Gegenbeispiele als Freitext |
| W5 | Wahl der passenden Liste; Sprachgleichheit des regulären Zahl-Diagramms im unterstützten Automatenbereich; sämtliche Schritte der Ableitung mit der eigenen Grammatik | Erläuterungen zu Liste und Diagrammen; Gesamtgrammatik nur bei Gleichwertigkeitsbeweis bestätigt, sonst offen |

Auch ein korrekt eingeordneter Typ oder eine korrekte Einzelableitung beweist nicht, dass die eigene Grammatik die gesamte geforderte Sprache erzeugt. Diese Prüfungen sind ausdrücklich getrennt.

### Alternative Grammatiken und Ableitungen

Der Prüfer vergleicht keine Mustertexte. Er zerlegt Produktionen in Terminalzeichen und Nichtterminale. Für freie kontextfreie Grammatiken kann eine bijektive Umbenennung aller erreichbaren Nichtterminale mit Erhaltung der Produktionen und des Startsymbols einen exakten Gleichwertigkeitsnachweis liefern. Regel- und Alternativenreihenfolge, doppelte Regeln, unbenutzte definierte Regeln und die Aufteilung zitierter Terminalblöcke spielen dabei keine Rolle. Beispielsweise wird die umbenannte Zuggrammatik oben vollständig akzeptiert.

Wo anwendbar, steht außerdem der vorhandene exakte Automatenvergleich zur Verfügung. Für andere rekursive Konstruktionen werden feste positive und negative Prüfwörter sowie begrenzt erzeugte Wörter geprüft. Ein tatsächliches Gegenbeispiel belegt einen Fehler und wird angezeigt. Übereinstimmung auf endlich vielen Wörtern ergibt ausdrücklich **„fachlich offen“**, keine falsche Ablehnung und keinen behaupteten Beweis. Musterlösung und konkrete Prüfaspekte ermöglichen die Selbstkontrolle; offene automatische BE bleiben bis zur fachlichen Prüfung offen. Sie werden nicht durch Schlüsselwörter oder Selbstpunkte als bewiesen verbucht.

Zulässige andere Ableitungsreihenfolgen werden anhand jeder einzelnen Regelanwendung akzeptiert. Der aussichtslose Zweig in W2 wird mit einer kontextfreien Wortprüfung ab seiner letzten Satzform untersucht. Eine bereits abgeschlossene falsche Terminalfolge zählt dort nicht als begonnene Ableitung; mindestens ein Nichtterminal muss verbleiben.

### Fachliche Eckpunkte

- W1 erzeugt genau Wörter über {a,b,c,d}, die ein Teilwort `abcd` mit mindestens einem folgenden Zeichen besitzen. `abcd` allein genügt nicht, weil D keine ε-Regel hat.
- W2 erzeugt `{uⁿvᵐwuᵐvⁿ | n,m ≥ 0} ∪ {uⁿvᵐ⁺¹uᵐvⁿ | n,m ≥ 0}`. Beide Abschlussregeln von X müssen berücksichtigt werden.
- W3 hat Sprache `{t1ⁿs2²ⁿ | n ≥ 1}`. Die Mustergrammatik ist Typ 2; Nichtregularität folgt unabhängig davon etwa durch die paarweise unterscheidbaren Präfixe t1ⁿ.
- W4 unterscheidet Grammatikbedingungen und Sprachklasseninklusion. „Jede kontextfreie Sprache ist kontextsensitiv“ gilt hier unter der ausdrücklich angegebenen ε-erweiterten Konvention. Bei strikt ε-freier Typ-1-Definition muss die Aussage für ε-haltige Sprachen eingeschränkt werden.
- Bei Typ 0 ist die linke Seite auch ohne weitere Typbedingungen nicht leer und enthält mindestens ein Nichtterminal. „Keine Einschränkung“ aus der Vorlagetabelle wird entsprechend präzisiert.
- W5 verlangt nichtleere Listen auf jeder Schachtelungsebene. Zahl umfasst auch die Dollarzeichen, weil diese im vorgegebenen Elemente-Diagramm nicht separat erscheinen. Natürliche Zahlen enthalten 0; positive Nenner und führende Nullfreiheit sind getrennt modelliert. Die Grammatik erlaubt beliebige endliche Schachtelung; die interaktiven Algorithmen behalten ihre ausdrücklich begrenzten Ressourcen.

## Architektur und reproduzierbare Prüfung

`wiki3.js` ergänzt den bestehenden Aufgabenkatalog; `q31.js` ordnet ihn dem neuen Modul 3 zu; `wiki3-engine.js` enthält die fachlichen Zusatzprüfer. `assessment.js` delegiert diese Formate und reicht den Antwortkontext für eigene Grammatiken weiter. `academy.js` bindet die Formate und Materialien in die vorhandenen Karten ein. Die erweiterte Nichtterminalnotation in `formal.js` ist für die neuen Grammatiken zuschaltbar; der bisherige Parsermodus bleibt erhalten. Die nachfolgende Vier-Modul-Anpassung erweitert den EBNF-Parser um den Punktabschluss und den Laborcontroller um aufklappbare vorbereitete Hilfsdiagramme. Der SVG-Renderer bleibt unverändert.

```sh
npm test
npm run test:wiki3
npm run test:browser
npm run test:academy
node scripts/content-docs.cjs
```

Die neuen Fachtests prüfen auch unabhängig festgelegte Sprachen und Gegenbeispiele, Umbenennungen, alternative Konstruktionen, unerreichbare Ableitungszweige, Nullnenner, führende Nullen, nichtleere Unterlisten, Materialgleichwertigkeit und Lernstandsimport. Der spezielle Browserlauf prüft alle neuen Formate, Hilfestufen, Originalmaterialien, eigenes Zeichnen, Grammatikvorschau, Wortproben, Fortschritt, Export/Import, Reload, Trainingssperre, Tastatur und Offline-Betrieb.

Ansichten: Desktop 1440 × 1000; iPad-Simulation mit Touch bei 820 × 1180 und 1180 × 820; zusätzlich 390 Pixel Breite. Das sind automatisierte Chrome-Tests und visuell geprüfte Bildschirmaufnahmen, keine Abnahme auf einem physischen iPad mit Safari. Rohprotokolle und Bilder stehen unter `test-results/`; abschließende Zahlen im [Testbericht](TESTBERICHT.md).
