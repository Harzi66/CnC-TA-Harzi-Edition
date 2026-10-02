# C&C Tiberium Alliances PvP/PvE Ranking, POI Holding and split base kill score

> Erweiterte Spielerinformationen für **C&C Tiberium Alliances**.

Dieses Script erweitert das normale **PlayerInfoWindow** des Spiels um zusätzliche Informationen zu einem Spieler und dessen Allianz.

## Funktionen

### 📊 PvP-/PvE-Ranking

Im Spielerfenster wird ein eigener Tab **„Ranking“** hinzugefügt.

Dort werden die PvP- und PvE-Werte der Allianzmitglieder angezeigt:

| Spieler | PvP | PvE |
|---|---:|---:|
| Spielername | PvP-Wert | PvE-Wert |

Die Spielernamen können dabei direkt aus der Tabelle ausgewählt werden.

### 🏆 POI des Spielers

Der Tab **„POI“** zeigt die POIs, die der betreffende Spieler hält.

Angezeigt werden:

- POI-Typ
- Level
- Score
- Koordinaten
- Basisname

Die Koordinaten können zur direkten Zentrierung auf der Weltkarte verwendet werden.

### 🏰 Allianz-POIs

Der zusätzliche Tab **„Alliance POIs“** zeigt die von Allianzmitgliedern gehaltenen POIs.

Zusätzlich werden angezeigt:

- POI-Typ
- Level
- Score
- Koordinaten
- Spielername
- Basisname

### 🏠 Base Levels

Der Tab **„Base Levels“** stellt Informationen zu den Basen des Spielers bereit.

Unter anderem werden Basis-, Offensiv- und Defensivlevel sowie relevante Unterstützungs-/Gebäudedaten ermittelt.

### ⚔️ Aufteilung von PvP und PvE

Das Script trennt die vom Spiel gelieferten Werte für zerstörte Spielerbasen und zerstörte Vergessenenbasen und stellt daraus getrennte **PvP- und PvE-Werte** dar.

---

## 🌐 Browser-Kompatibilität

Das Script ist für die Verwendung mit **Firefox und Chrome** vorgesehen.

### Chrome-Kompatibilitätsfix

In Chrome trat beim Öffnen des normalen Spielerfensters ein Qooxdoo-Fehler auf, weil das Script eine bereits belegte Grid-Zelle des PlayerInfoWindow erneut verwendet hat.

Die Version **1.7.4** enthält dafür eine Anpassung:

- freie Grid-Positionen werden dynamisch ermittelt
- bereits belegte Zellen werden nicht erneut verwendet
- das normale Spielerfenster bleibt dadurch erhalten
- PvP/PvE-Anzeigen werden anschließend in freien Positionen eingefügt

Der Fix wurde von **Harzi** in die gepflegte Version dieses Repositories übernommen.

> **Wichtig:** Es gibt keine separate Chrome- und Firefox-Version. Beide Browser verwenden dieselbe Script-Version.

---

## 📥 Installation

Das Script kann direkt über die Raw-Datei installiert werden:

**[Script installieren / herunterladen](https://raw.githubusercontent.com/Harzi66/CnC-TA-Harzi-Edition/main/Weitere%20C%26C%20TA%20Scripts/C%26C%20Tiberium%20Alliances%20PvPPvE%20Ranking%2C%20POI%20Holding%20and%20split%20base%20kill%20score.user.js)**

Das Script benötigt einen Userscript-Manager wie **Tampermonkey**.

---

## 🔄 Updates

Die installierte Version verwendet die GitHub-Raw-Datei sowohl für Download als auch für Updates.

**Aktuelle Version: 1.7.4**

- Originalautoren: **ViolentVin, KRS_L, YiannisS**
- Weiterpflege / Chrome-Kompatibilitätsanpassung: **Harzi**

---

## 📜 Hinweis zu den ursprünglichen Autoren

Dieses Script basiert auf der ursprünglichen Arbeit von **ViolentVin, KRS_L und YiannisS**.

Die vorhandenen Funktionen wurden für die Verwendung im **Harzi C&C TA Script Repository** übernommen und um die notwendige Chrome-Kompatibilitätsanpassung ergänzt.

Die ursprünglichen Autorenangaben bleiben im Script erhalten.

---

## 🔗 Links

- **[Script-Datei](https://github.com/Harzi66/CnC-TA-Harzi-Edition/blob/main/Weitere%20C%26C%20TA%20Scripts/C%26C%20Tiberium%20Alliances%20PvPPvE%20Ranking%2C%20POI%20Holding%20and%20split%20base%20kill%20score.user.js)**
- **[Raw-Version / Installation](https://raw.githubusercontent.com/Harzi66/CnC-TA-Harzi-Edition/main/Weitere%20C%26C%20TA%20Scripts/C%26C%20Tiberium%20Alliances%20PvPPvE%20Ranking%2C%20POI%20Holding%20and%20split%20base%20kill%20score.user.js)**
- **[Harzi C&C TA Script Repository](https://github.com/Harzi66/CnC-TA-Harzi-Edition)**

---

**Version 1.7.4 – Chrome-Kompatibilitätsfix by Harzi**
