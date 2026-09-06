CnC-TA-Ghostfinder-HE
Ghostfinder - HE
Der Ghostfinder - HE ist ein Userscript für Command & Conquer: Tiberium Alliances, mit dem schwebende bzw. verlassene Basen einer Allianz auf der Karte sichtbar gemacht werden können.
Das Script basiert auf dem CnCTA Base Finder und wurde für die Harzi-Edition mit einem eigenen Ghost-Renderer und einer eigenen Darstellung weiterentwickelt. Die Grundlage und ursprünglichen Beiträge stammen von bloofi und ffi82.
---
✨ Funktionen
Auswahl einer Allianz aus der vorhandenen Allianzliste
Allianz zusätzlich über den Namen suchen
Favoriten für häufig verwendete Allianzen
Aktualisieren der Allianz-Daten
Anzeige schwebender Basen direkt auf der Spielkarte
Eigener Ghost-Renderer
Transparente rote Ghost-Kreise
Mehrere Ghosts gleichzeitig darstellbar
Basisname und Besitzer werden am Ghost angezeigt
Ghost-Marker können wieder vollständig entfernt werden
Auswahl der anzuzeigenden Ghost-Basen:
Alle schwebenden Basen
Nur Main-Basen
Main + zweitbeste Ghost-Basen
Mehrsprachige Benutzeroberfläche:
🇩🇪 Deutsch
🇬🇧 English
🇫🇷 Français
🇪🇸 Español
Die gewählte Sprache wird pro Spielwelt gespeichert
---
🖥️ Oberfläche
Ghostfinder öffnen
Das Script wird über das Scripte-Menü im Spiel geöffnet.
![Ghostfinder Oberfläche](Screenshot_1.png)
---
Ghost-Auswahl
Über Ghost-Auswahl kann festgelegt werden, welche schwebenden Basen angezeigt werden sollen.
![Ghost-Auswahl](Screenshot_2.png)
Die drei verfügbaren Varianten sind:
Auswahl	Funktion
Alle schwebenden Basen	Zeigt alle gefundenen schwebenden Basen der ausgewählten Allianz.
Nur Main-Basen	Zeigt nur die jeweils stärksten/Main-Basen der Spieler.
Main + zweitbeste Ghost-Basen	Berücksichtigt neben der Main-Basis auch die zweitbeste Ghost-Basis entsprechend der Auswahl.
---
Ghosts auf der Karte
Die gefundenen Basen werden direkt auf der Karte dargestellt. Die roten Kreise markieren die Ghost-Basen; zusätzlich werden Basisname und Besitzer angezeigt.
![Ghosts auf der Karte](Screenshot_3.png)
---
🌐 Sprache
Die Sprache kann direkt im Ghostfinder über die Sprachauswahl geändert werden.
Die Auswahl wird automatisch gespeichert und beim nächsten Öffnen wieder verwendet.
---
📥 Installation
Das Script benötigt Tampermonkey.
Tampermonkey installieren und aktivieren.
Die Datei `CnC-TA-Ghostfinder-HE.user.js` öffnen.
In GitHub auf Raw klicken.
Tampermonkey öffnet die Installationsseite.
Script installieren.
C&C Tiberium Alliances neu laden bzw. das Spiel öffnen.
Das Script anschließend über das Scripte-Menü starten.
Direkte Installation / Update
Das Script enthält eine `@downloadURL` und `@updateURL`, sodass Tampermonkey die aktuelle Version direkt von diesem Repository beziehen kann.
---
🔧 Technischer Hintergrund
Der Ghostfinder verwendet für die Darstellung keinen normalen QX-Overlay-Marker. Stattdessen wird der vorhandene C&C-TA-Renderbaum genutzt.
Der eigene Renderer basiert unter anderem auf VKVAYK und bindet die Ghost-Darstellung direkt in die Karten-Renderstruktur ein.
Dadurch können mehrere Ghosts gleichzeitig dargestellt und anschließend gezielt wieder entfernt werden.
---
📜 Grundlage / Credits
Weiterentwicklung: Harzi  
Original: CnCTA Base Finder  
Original Author: bloofi  
Contributor: ffi82
Die Weiterentwicklung umfasst insbesondere:
eigenen Ghost-Renderer
eigene Ghost-Darstellung
transparente rote Ghost-Kreise
Beschriftung von Basis und Besitzer
Mehrfachdarstellung von Ghosts
Ghost-Auswahlfilter
mehrsprachige Benutzeroberfläche
---
📌 Hinweis
Der Ghostfinder ist für C&C: Tiberium Alliances entwickelt und greift auf interne Strukturen des Spiels zu. Änderungen am Spiel können deshalb dazu führen, dass einzelne Funktionen angepasst werden müssen.
---
📁 Repository
GitHub:  
https://github.com/Harzi66/CnC-TA-Ghostfinder-HE
Userscript:  
`CnC-TA-Ghostfinder-HE.user.js`

---

## 👻 Ghostfinder – HE

Findet schwebende Ghost-Basen der ausgewählten Allianz und stellt sie direkt auf der Weltkarte dar.

**Funktionen**

- Allianz aus der vorhandenen Allianzliste auswählen
- Allianz zusätzlich über den Namen suchen
- Favoriten für häufig verwendete Allianzen
- Allianz-Daten aktualisieren
- Schwebende Basen direkt auf der Weltkarte anzeigen
- Eigener Ghost-Renderer
- Transparente rote Ghost-Kreise
- Mehrere Ghosts gleichzeitig anzeigen
- Basisname und Besitzer am Ghost anzeigen
- Ghost-Marker wieder vollständig löschen
- Auswahl zwischen:
  - **Alle schwebenden Basen**
  - **Nur Main-Basen**
  - **Main + zweitbeste Ghost-Basen**
- Mehrsprachige Oberfläche
- Deutsch, Englisch, Französisch und Spanisch
- Sprache wird pro Welt gespeichert

**Hinweis:**

Der Ghostfinder verwendet einen eigenen Renderer innerhalb des C&C-TA-Renderbaums und keine normalen QX-Overlay-Marker.

➡️ **Repository:**

https://github.com/Harzi66/CnC-TA-Ghostfinder-HE
