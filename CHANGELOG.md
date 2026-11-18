# Syntaxlabor — Änderungen und behobene Fehler

## V4.1 · Abiturtraining Q3

### 18. November 2026 · Ableitungspfeile

- Grammatische Ableitungen verwenden durchgängig `->`: Aufgaben, Musterlösungen, Lernhinweise, Eingabefelder, automatisch zusammengesetzte Schritte und erzeugte Unterrichtsdokumente.
- Der Ableitungsprüfer erkennt den neuen Pfeil, auch ohne umgebende Leerzeichen. Ältere gespeicherte Ableitungsantworten bleiben lesbar und werden in der neuen Schreibweise angezeigt.
- Zitierte Terminalzeichen werden beim Erkennen und Umstellen von Pfeilen geschützt. EBNF-Syntax, Produktionsbedeutung und Syntaxdiagramme bleiben erhalten.
- 65 Fachtests sowie 21 Labor- und 24 Trainings-Browsergruppen bestanden; zusätzlich gezielte Tests für Eingabe, Rückmeldung, Musterlösung und alte Lernstände.

### Vorherige V4.1-Erweiterungen

- Nachfolgende Präzisierung: Die vollständige Chomsky-Hierarchie ist auf Wunsch fester Lerninhalt. Typ 0/1 werden in den Aufgaben nicht mehr als freiwillig abgesetzt. Eine zusammenhängende Übersicht erklärt alle vier Typen, Produktionsformen, Beispiele, Maschinenmodelle und Sprachklasseninklusion. Die offizielle GK-Abgrenzung bleibt sachlich dokumentiert.

- Offizielle KCGO-/Abiturvorgaben 2027 und Abgleich 2028 sowie aktuelle Operatorenliste geprüft. Offizieller Grundkurskern und der gewünschte erweiterte Lernumfang sind unterschieden; keine behauptete Vollabdeckung des Landesabiturs. Quellen und Konventionen in `QUELLEN.md`.
- Sieben Hauptbereiche mit 50 eigenen Aufgaben und 166 Teilaufgaben in fünf Modulen ergänzt. Alle sechs vorherigen Kurzübungen bleiben im freien Labor erhalten.
- Interaktive Formate für Grammatikbestandteile, Produktionsform-Klassifikation, Zuordnungen, Auswahl, Wortentscheidungen, eigene Beispiele, Ableitungsfolgen, Ableitungsbäume und Freitext implementiert.
- Der vorhandene Grafik-/EBNF-Editor wird in jede passende Teilaufgabe eingebettet. Arbeitsstände, Startsymbole und Verlauf sind pro Teilaufgabe getrennt. Der freie Laborentwurf wird dadurch nicht überschrieben.
- Beim grafischen Bearbeiten bleibt die mitgeführte EBNF verdeckt. In selbstständigen EBNF-Aufgaben werden automatische Diagramme ebenfalls verdeckt, damit nachfolgende Zeichenaufgaben eigenständig bleiben. Im freien Labor bleibt die Synchronisierung sichtbar.
- Lernmodus mit Hilfen und optionalen Musterlösungen sowie Trainingsmodus mit Abgabe, anschließender Rückmeldung und schreibgeschützten Antworten ergänzt. Die Nutzung von Hilfen bleibt gekennzeichnet.
- Zwei eigene Q3-Übungsklausuren mit je 40 BE integriert. Aufgaben sind vor Abgabe ohne Hilfen bearbeitbar, nach Neuladen fortsetzbar und nach Abgabe eingefroren. Erwartungshorizonte unterscheiden automatisch geprüfte, offene und selbst eingeschätzte BE.
- Lokalen Lernfortschritt, Kompetenzschätzungen sowie validierten JSON-Export/-Import implementiert. Entwurfsschlüssel von V4.0 bleibt erhalten.
- Definitionen und Sonderfälle der Chomsky-Hierarchie ausdrücklich offengelegt: Produktionsform versus Sprachklasse, ε-Ausnahme, einheitliche lineare Richtung, Einheitsregeln, nichtverkürzende Typ-1-Konvention und unerreichbare Regeln.
- Ableitungsprüfer kontrolliert einzelne Ersetzungen einschließlich Links-/Rechtsableitung. Baumaktionen behalten die gewählte Ersetzungsstelle auch bei identischen Satzformen bei.
- Fach-/Inhaltstests kontrollieren alle Muster-EBNF, alle Musterableitungen, die vorgesehenen Chomsky-Einordnungen, beide Klausurpunktesummen und Lernstands-Roundtrips.
- `AUFGABENRASTER.md` und `KLAUSUREN.md` werden aus denselben Aufgabendaten wie die Oberfläche erzeugt. Vorheriger V4.0-Stand bleibt in `archive/v4.0/` gesichert.

Die aktuelle Browserabnahme ist abgeschlossen: 24/24 Trainingsgruppen bestanden, zusätzlich zu 65 Fachtests und 21 Labor-Browsergruppen. Die Tests wählen Terminalflächen und Gegenbeispielfelder eindeutig aus und vergleichen beim Wiederherstellen einer Zeichnung auch ihre erhaltenen Hilfsproduktionen. Prüfprotokolle und verbleibende fachliche Grenzen stehen in `TESTBERICHT.md`.

## V4.0 · Ausgangsstand der Erweiterung

Die Ausgangsversion aus `index.html` wurde vollständig gelesen und als `archive/index-v2.html` erhalten. Die bisherigen Modelltypen, Diagrammbearbeitung, Beispiele, Wortprüfung, Text-/SVG-/PNG-Exporte und alle drei ursprünglichen Trainingsaufgaben wurden weiterentwickelt. Wegen der zusätzlichen Fachalgorithmen und ihrer Tests sind die bisherigen Inline-Bestandteile jetzt in kleine, separat prüfbare Dateien aufgeteilt.

## Fachliche Korrekturen

1. **Wiederholung:** V2 zeichnete für `{…}` nur den verpflichtenden Hinweg und einen Rückweg. V4 besitzt zusätzlich den Umgehungsweg für null Durchläufe; die Rückführung zeigt nach links und führt erneut in den Baustein.
2. **Verschachtelte Folgen:** V2 kombinierte maximale Kinderhöhe und maximale Mittellinie unabhängig voneinander. Dadurch konnten nach unten versetzte Kinder außerhalb der gemessenen Höhe liegen. V4 berechnet den Platz oberhalb und unterhalb der gemeinsamen Mittellinie getrennt.
3. **Leserichtung:** Alle Konstruktionen haben explizite Ein- und Ausgänge und Richtungspfeile, einschließlich Alternativen und optionaler Wege.
4. **EBNF-Folgen:** V2 verlangte und erzeugte Kommata. V4 erzeugt Folgen mit Leerzeichen. Kommaschreibweise bleibt für das Einlesen alter Texte erhalten.
5. **Leeres Wort:** V2 konnte keine leere Produktion verarbeiten. V4 unterstützt `ε`, `""` und eine leere rechte Seite. Ein leerer Weg wird als ε dargestellt und korrekt geprüft.
6. **Rekursive Wortprüfung:** V2 brach aktive Rekursionspaare mit einem leeren Ergebnis ab und konnte dadurch gültige linksrekursive Wörter ablehnen. V4 verwendet ein CFG-/Earley-Verfahren mit Nullable-Behandlung.
7. **Regelnamen:** Regeldefinitionen werden mit sicheren Maps und Arrays verwaltet. Namen wie `constructor` oder `__proto__` kollidieren nicht mehr mit geerbten Objekteigenschaften.
8. **Escape-Sequenzen:** Parser und Ausgabe verwenden zueinander passende Regeln für Anführungszeichen, Backslashes, Steuerzeichen und Unicode-Escapes.

## Editor und Zustandsverwaltung

9. **Entfernen im Baumeditor:** V2 griff beim Löschen eines Array-Kindes auf `parent.items` zu, obwohl `parent` bereits das Array war. V4 verwendet durchgängig Knotenpfade und normalisiert Folgen/Alternativen nach dem Löschen.
10. **Vollständig leere Grammatik:** V2 ersetzte entfernte letzte Bausteine durch vorgegebene Terminale. V4 unterscheidet leere Produktion und gelöschte Grammatik. Eine neue Regel enthält einen leeren Weg, keine vorgegebenen Wörter.
11. **Mehrere Nichtterminale:** V2 hielt Zusatzregeln zwar im Speicher, zeigte und bearbeitete jedoch nur die erste. V4 zeigt alle Regeln, erlaubt Bearbeitung und Export jeder Regel und bietet eine Startsymbolauswahl.
12. **Umbenennen:** V2 änderte den Regelnamen ohne konsistente Referenzpflege. V4 benennt alle Verweise mit um und prüft auf Namenskollisionen. Löschen weist auf danach fehlende Definitionen hin.
13. **Automatische Synchronisierung:** Beide bisherigen Umwandlungsschaltflächen waren die einzige Möglichkeit zum Übertragen. V4 synchronisiert selbstständig und behält die Schaltflächen als Formatieren/sofortige Übernahme bei.
14. **Ungültiger Entwurf:** Syntaxfehler zerstören das letzte gültige Modell nicht. Der fehlerhafte Text bleibt bearbeitbar und wird gemeinsam mit dem gültigen Modell lokal gespeichert. Grafische Änderungen überschreiben ihn nicht.
15. **Verlauf:** Rückgängig/Wiederherstellen erfasst Grafik, Text, Regelnamen und Startsymbol; auch Löschen und Aufgabenstart sind reversibel.
16. **Auswahl:** Pfade werden beim Modellwechsel verworfen bzw. überprüft. Damit bleibt nach Löschen, Laden oder Aufgabenwechsel kein veralteter Pfad aktiv.
17. **Direktes Bearbeiten:** Doppelklick ermöglicht Texteingabe im Diagramm. Formularfelder, Strukturübersicht und Tastaturbedienung bleiben als zugängliche Wege erhalten.
18. **Verschieben:** Kinder von Folgen und Alternativen können umgeordnet werden.
19. **Export:** Selbstständige SVG-Dateien enthalten ihre Gestaltung und Pfeilmarker. Exporte enthalten keine Editor-Auswahl. PNG-Fehler, URL-Freigabe und Canvas-Größengrenzen werden behandelt.

## Sprache und Training

20. **Sprachbereich:** Begrenzte, sortierte Wortgenerierung, nachgewiesene Nichtwörter, wählbares Startsymbol und zuverlässige Beschreibungen für erkannte Strukturen.
21. **Analysegrenzen:** Keine erfundenen allgemeinen Formeln. Begrenzte Wortmengen und offene Vergleichsergebnisse werden als solche bezeichnet. Vorherige Analyseergebnisse verschwinden sofort bei Modelländerungen, bis die neue Analyse vorliegt.
22. **Trainingsreferenzen:** Die ursprüngliche Zahlenaufgabe lud ihr Diagramm ohne Definition von `ziffer`. In V4 sind beide Produktionen Teil der Aufgaben- und Lösungsmodelle.
23. **Lösungskontrolle:** V2 zeigte nur Mustertexte. V4 vergleicht die Sprachen mit Automaten oder transparent begrenzten Tests. Gleichwertige Formulierungen werden im nachgewiesenen Bereich akzeptiert; Unterschiede werden mit einem Gegenbeispiel erklärt.
24. **Aufgaben:** Die drei Originalaufgaben bleiben erhalten. Drei weitere Aufgaben ergänzen feste Präfixe mit Wiederholung, Blockwiederholung mit ε und die rekursive Sprache `aⁿbⁿ`. Alle Aufgaben können geschrieben oder gezeichnet werden.
25. **Unterrichtsansicht:** Übersichtliche Bereiche für Diagramme/EBNF, Sprache und Training; warme Orange-/Apricotfarben, responsive Ansicht, keine zusätzlichen Bestätigungsdialoge.
