Harzi Edition – C\&C Tiberium Alliances API-Dokumentation

Version: 0.1 – Arbeitsstand

Erstellt: 17.11.2026

Grundlage: öffentliches Repository ConnorPerrin/TiberiumAlliancesMod

Zweck: Zentrale, fortlaufend zu ergänzende Wissensbasis für die Entwicklung und Wartung der Harzi-Edition-Scripte.

1\. Ziel und Arbeitsweise

Diese Dokumentation sammelt API-Klassen, Methoden, vermutete Zusammenhänge, bereits verwendete Zugriffswege und offene Prüfpunkte. Sie soll verhindern, dass Erkenntnisse bei späteren Scriptarbeiten erneut gesucht oder durch Vermutungen ersetzt werden.



Wichtige Regel: Unklare oder nicht vollständig belegte Informationen werden ausdrücklich aufgenommen und als offen markiert. Sie werden nicht stillschweigend als gesicherte API-Fakten behandelt.

Statuskennzeichnung

Status	Bedeutung

BELEGT	Im Quelltext des Referenz-Repositories direkt gefunden oder durch vorhandenen Script-/Konsolentest bestätigt.

PLAUSIBEL	Aus Namen, Aufrufstruktur oder benachbarten Funktionen abgeleitet; noch nicht praktisch verifiziert.

PRÜFEN	Unklar, unvollständig, möglicherweise versionsabhängig oder im Spiel zu testen.

VERALTUNGSRISIKO	Referenzmaterial ist älter oder könnte vom aktuellen Spielclient abweichen.

NICHT VERFÜGBAR	Im untersuchten Material nicht gefunden; das beweist nicht, dass die Funktion im Spiel nicht existiert.





Für jede neue Erkenntnis möglichst festhalten:

1\. API-Pfad und Methode,

2\. Quelltext-/Repository-Link,

3\. Rückgabewert und Parameter,

4\. getestete Spielansicht und Situation,

5\. Ergebnis und Datum,

6\. betroffene Harzi-Edition-Scripte.

2\. Quellenlage und Einschränkungen

Hauptquelle

\- Repository: https://github.com/ConnorPerrin/TiberiumAlliancesMod

\- API-Übersicht: https://github.com/ConnorPerrin/TiberiumAlliancesMod/tree/main/API

\- ClientLib: https://github.com/ConnorPerrin/TiberiumAlliancesMod/tree/main/API/ClientLib

\- Qooxdoo (qx): https://github.com/ConnorPerrin/TiberiumAlliancesMod/tree/main/API/qx

\- Webfrontend: https://github.com/ConnorPerrin/TiberiumAlliancesMod/tree/main/API/webfrontend

\- Tutorials: https://github.com/ConnorPerrin/TiberiumAlliancesMod/tree/main/Tutorials

Das Repository beschreibt sich selbst als unvollständige Sammlung öffentlich zugänglicher Klassen und Funktionen. Der API-README nennt ausdrücklich, dass nicht alle Klassen/Funktionen erfasst wurden. Die Tutorials sind ebenfalls nur teilweise ausgearbeitet.



Stand der untersuchten Repository-Metadaten: letzter Push laut GitHub-Metadaten am 15.12.2024. Deshalb besteht ein VERALTUNGSRISIKO gegenüber dem aktuellen Spielclient.

Wichtige Einschränkung bei den Dateien

Die GitHub-Dateiliste enthält viele Dateien mit sehr kleinem Inhalt oder 0 Byte. Das bedeutet nicht automatisch, dass die zugehörige Methode im Spiel fehlt. Teilweise liegen Implementierungen in einer übergeordneten prototype.js-Datei, während einzelne Methoden-Dateien nur Platzhalter sind.



Die erste Verzeichnisabfrage für API/ClientLib lieferte maximal 1.000 Einträge. Die Verzeichnisliste ist daher in dieser Arbeitsfassung kein vollständiges Inventar. Eine spätere vollständige Erfassung muss über paginierte GitHub-Abfragen bzw. den Git-Tree erfolgen.

3\. Einstieg in die Spiel-API

3.1 MainData

Pfad: ClientLib.Data.MainData



Referenzdateien:

\- MainData.js

\- MainData.GetInstance.js

BELEGT: ClientLib.Data.MainData.GetInstance() liefert eine zentrale MainData-Instanz zurück. Die untersuchte Implementierung erzeugt sie bei Bedarf einmalig und speichert sie anschließend.



Die Instanz stellt unter anderem folgende Getter bereit:

Getter	Bedeutung laut Name/Implementierung	Status

get\_Time()	Zeit-/Step-Daten	BELEGT

get\_Chat()	Chat-Daten	BELEGT

get\_Server()	Serverdaten	BELEGT

get\_World()	Welt-/Weltkartendaten	BELEGT

get\_Player()	Spielerdaten	BELEGT

get\_Alliance()	Allianz-Daten	BELEGT

get\_Cities()	Städteverwaltung	BELEGT

get\_CitiesSupport()	Unterstützungsdaten der Städte	BELEGT

get\_Mail()	Nachrichten	BELEGT

get\_Reports()	Berichte	BELEGT

get\_Missions()	Missionen	BELEGT

get\_BaseColors()	Basen-/Farbdaten	BELEGT

get\_Gift()	Geschenk-/Belohnungsdaten	BELEGT

get\_Forum()	Forum	BELEGT

get\_Notifications()	Benachrichtigungen	BELEGT

get\_Combat()	Kampfdaten	BELEGT

get\_AllianceCombatState()	Allianz-Kampfstatus	BELEGT

get\_AllianceSupportState()	Allianz-Unterstützungsstatus	BELEGT

get\_AllianceTargetWatcher()	Allianz-Zielüberwachung	BELEGT

get\_AllianceWatchListWatcher()	Allianz-Beobachtungsliste	BELEGT

get\_Inventory()	Inventar	BELEGT

get\_ShopCatalog()	Shop-Katalog	BELEGT

get\_PlayerSubstitution()	Urlaubsvertretung/Substitution	BELEGT

get\_EndGame()	Endgame-Daten	BELEGT

get\_Challenge()	Herausforderungen	BELEGT

get\_ArsenalHandler()	Arsenalverwaltung	BELEGT





Noch zu prüfen: Ob alle Getter in jedem Ladezustand bereits ein Objekt liefern oder zunächst null zurückgeben können. Scripts müssen deshalb defensiv prüfen.

3.2 Allgemeines Zugriffsmuster

Der in der Referenz dokumentierte Einstieg lautet:

const mainData = ClientLib.Data.MainData.GetInstance();



if (mainData) {

&#x20;   const cities = mainData.get\_Cities();

&#x20;   const world = mainData.get\_World();

}

Das ist ein schematisches Beispiel, kein vollständiger Beleg dafür, dass jede Unterinstanz zu jedem Zeitpunkt verfügbar ist. Vor Zugriffen auf Unterobjekte immer null-Prüfungen vorsehen.

4\. Stadt- und Basendaten

4.1 ClientLib.Data.City

Referenz: ClientLib.Data.City.prototype.js



Die untersuchte Datei enthält zahlreiche Funktionen. Folgende Methoden wurden direkt im Quelltext gefunden:

Methode	Erkenntnis	Status

get\_Id()	Liefert die interne ID der Stadt/Basis.	BELEGT

get\_Name()	Liefert den Namen.	BELEGT

set\_Name(value)	Setzt den Namen im Objekt. Serverseitige Wirkung nicht daraus ableiten.	BELEGT / Wirkung PRÜFEN

get\_PosX()	X-Koordinate.	BELEGT

get\_PosY()	Y-Koordinate.	BELEGT

get\_Width() / get\_Height()	Abmessungen.	BELEGT

get\_CoordId()	Kombiniert Y und X zu einer Koordinaten-ID (`Y << 16	X`).

get\_OwnerName()	Besitzername.	BELEGT

get\_OwnerAllianceName()	Allianzname des Besitzers.	BELEGT

get\_HasIncommingAttack()	Kennzeichen für eingehenden Angriff. Schreibweise Incomming ist im API-Namen tatsächlich so.	BELEGT

get\_HasOutgoingAttack()	Kennzeichen für ausgehenden Angriff.	BELEGT

get\_LockdownEndStep()	Ende eines Lockdown-Zeitraums.	BELEGT

get\_FoundStep()	Step der Gründung.	BELEGT

get\_ProtectionEndStep()	Ende des Schutzzeitraums.	BELEGT

get\_isProtected()	Prüft Schutz anhand des aktuellen Spiel-Steps.	BELEGT

get\_MoveCooldownEndStep()	End-Step des Umsiedlungs-Cooldowns.	BELEGT

get\_MoveRestictionEndStep()	Liefert den spätesten ermittelten Restriktions-Step. Schreibweise Restiction ist im API-Namen tatsächlich so.	BELEGT

get\_CityBuildingsData()	Zugriff auf Gebäudedatenobjekt.	BELEGT

get\_CityUnitsData()	Zugriff auf Einheitendatenobjekt.	BELEGT

get\_CityRepairData()	Zugriff auf Reparaturdatenobjekt.	BELEGT

get\_CityArmyFormationsManager()	Zugriff auf Formationsverwaltung.	BELEGT

GetNumBuildings()	Anzahl Gebäude laut internem Gebäudecontainer.	BELEGT

GetImpactStep()	Ermittelt einen Impact-Step, sonst -1.	BELEGT





Wichtige Hinweise:

\- Die API verwendet intern Spiel-Steps. Eine Umrechnung in reale Zeit muss separat und anhand der aktuellen Spielzeit-/Step-Logik geprüft werden.

\- get\_MoveCooldownEndStep() ist nicht automatisch identisch mit allen Umsiedlungsstufen-/Sektorwechselregeln, die unsere Sektorsprung-Logik berechnet.

\- get\_MoveRestictionEndStep() enthält einen Schreibfehler im Methodennamen. Bei Verwendung exakt die API-Schreibweise übernehmen.

\- set\_Name() zeigt nur, dass ein Setter existiert. Ob und wie dadurch eine Serveränderung ausgelöst wird, muss separat geprüft werden.

4.2 ClientLib.Data.Cities

Referenz: ClientLib.Data.Cities.prototype.js

Methode	Bedeutung	Status

get\_CurrentCityId()	ID der aktuell ausgewählten Stadt/Basis.	BELEGT

set\_CurrentCityId(id)	Setzt die aktuelle Auswahl im Datenmodell. Nebenwirkungen/GUI-Kopplung beachten.	BELEGT / Wirkung PRÜFEN

get\_CurrentCity()	Aktuell ausgewähltes Stadtobjekt.	BELEGT

get\_CurrentOwnCity()	Aktuell ausgewählte eigene Stadt.	BELEGT

get\_CurrentOwnCityId()	ID der aktuellen eigenen Stadt.	BELEGT

get\_HomeCityId()	Heimatstadt-ID.	BELEGT

get\_CurrentForeignCityId()	ID der aktuell ausgewählten fremden Stadt.	BELEGT

GetCity(id)	Sucht Stadt anhand der ID; liefert null, wenn nicht gefunden.	BELEGT

GetCityByCoord(x, y)	Sucht eine Stadt anhand von Koordinaten.	BELEGT

CollectAll()	Führt Sammelaktionen für sammelbare eigene Städte aus. Nicht ohne Test aufrufen.	BELEGT / Wirkung PRÜFEN

hasCollectables()	Prüft, ob sammelbare Elemente vorhanden sind.	BELEGT

GetNextFreeCityName()	Ermittelt einen freien Stadtnamen.	BELEGT





Noch zu prüfen: Verhalten von GetCityByCoord() bei fremden Basen, Lagern, Vorposten und nicht geladenen Kartenobjekten.

4.3 Gebäude- und Einheitendaten

Die Stadt stellt die Unterobjekte über folgende Getter bereit:

const city = ClientLib.Data.MainData.GetInstance()

&#x20;   .get\_Cities()

&#x20;   .get\_CurrentCity();



if (city) {

&#x20;   const buildings = city.get\_CityBuildingsData();

&#x20;   const units = city.get\_CityUnitsData();

&#x20;   const repair = city.get\_CityRepairData();

}

BELEGT: Diese Getter sind in ClientLib.Data.City.prototype.js enthalten.



PRÜFEN:

\- konkrete Methoden und Datenstrukturen von CityBuildingsData,

\- wie Gebäude-IDs, Level, Positionen und Bauzustände abgerufen werden,

\- wie Einheiten nach Off/Deff, Gruppe, Level und Reparaturstatus unterschieden werden,

\- ob die Daten bei Stadt-, Vorposten- und Lageransicht dieselbe Struktur haben.

Relevanz: Building \& Off Saver, RaidHelper, Info Sticker, Basen- und Einheitenübersichten.

5\. Weltkarte und Sektoren

5.1 ClientLib.Data.World

Referenz: ClientLib.Data.World.prototype.js



Direkt gefundene Methoden:

Methode	Erkenntnis	Status

GetSector(id)	Sucht einen Sektor über eine ID.	BELEGT

GetWorldSectorByCoords(x, y)	Ermittelt den Weltsektor anhand von Koordinaten; verwendet intern 32er-Sektorblöcke.	BELEGT

IsBlocked(x, y)	Prüft blockierte Koordinaten.	BELEGT

IsWater(x, y)	Prüft Wasser anhand der geladenen Sektordaten.	BELEGT

GetOwner(x, y)	Ermittelt einen Besitzerwert für Koordinaten.	BELEGT

GetTerritoryTypeByCoordinates(x, y)	Ordnet Koordinaten einem Gebietstyp zu.	BELEGT

CheckMoveBaseRestrictions(x, y, city)	Prüft Bewegungsrestriktionen für eine Basis.	BELEGT

CheckMoveBaseControlHub(x, y, city)	Prüft Kontrollhub-Beschränkungen.	BELEGT

CheckFoundBase(x, y)	Prüft, ob an Koordinaten eine Basis gegründet werden kann.	BELEGT





GetTerritoryTypeByCoordinates() unterscheidet im untersuchten Code unter anderem:

\- Neutral,

\- Own,

\- Alliance,

\- SpawnZone,

\- Restricted,

\- Enemy.

Wichtig: Die Rückgabe von GetOwner() ist ein codierter numerischer Wert. Nicht ungeprüft als Spieler-ID oder Allianz-ID interpretieren. Die Methode GetTerritoryTypeByCoordinates() dekodiert im Quelltext Teile dieses Werts anhand von Gebietstyp und ID.

5.2 Offene Weltkartenfragen

Frage	Warum wichtig?	Status

Wie wird ein Kartenobjekt eindeutig als Lager erkannt?	FollowPostTracker verwechselt aktuell teilweise Lager und Vorposten.	PRÜFEN

Wie wird ein Vorposten zuverlässig erkannt?	Korrekte Markierung und Chat-Ausgabe.	PRÜFEN

Welche API liefert die tatsächlichen Objektkoordinaten?	Vermeidung von Koordinatenabweichungen.	PRÜFEN

Wie unterscheiden sich POI, Lager, Vorposten und Stadt intern?	Gemeinsame Erkennung für mehrere Scripte.	PRÜFEN

Welche Daten sind nach Kartenbewegung bereits geladen?	Vermeidung von null und veralteten Referenzen.	PRÜFEN

Gibt es Ereignisse für neu geladene/aktualisierte Kartenbereiche?	Effizienter Tracker ohne Dauer-Polling.	PRÜFEN





Relevanz: FollowPostTracker, Sektorsprung, Lister UI, Map-/POI-Tools.

6\. Allianz-Daten

ClientLib.Data.Alliance

Referenz: ClientLib.Data.Alliance.prototype.js



Im untersuchten Quelltext enthalten:

Methode	Bedeutung	Status

get\_Id()	Allianz-ID.	BELEGT

get\_Name()	Allianzname.	BELEGT

get\_Abbreviation()	Allianz-Kürzel.	BELEGT

get\_Announcement()	Ankündigung.	BELEGT

get\_Description()	Beschreibung.	BELEGT

get\_Rank()	Rang.	BELEGT

get\_EventRank()	Event-Rang.	BELEGT

get\_EventScore()	Event-Punktzahl.	BELEGT

get\_TotalScore()	Gesamtpunktzahl.	BELEGT

get\_AverageScore()	Durchschnittspunktzahl.	BELEGT

get\_NumMembers()	Mitgliederzahl.	BELEGT

get\_MemberData()	Mitgliederdatenobjekt.	BELEGT

get\_MemberDataAsArray()	Mitgliederdaten als Array.	BELEGT

GetMember(id)	Mitglied nach ID.	BELEGT

getMemberIds()	Liste der Mitglieder-IDs.	BELEGT

getMemberIdsByRole(role)	Mitglieder-IDs nach Rollenwert.	BELEGT

RefreshMemberData()	Fordert Mitgliederdaten beim Server an.	BELEGT / Wirkung PRÜFEN





Weitere gefundene Berechtigungs-Getter betreffen u. a. Admin-/Offiziersstatus, Einladen, Kicken, Marker bearbeiten, Militärdaten sehen und ausgehende Angriffe verfolgen.



PRÜFEN: Welche Mitgliederdaten nach RefreshMemberData() verfügbar sind und wie Rang-/Rollencodes zuverlässig zu interpretieren sind.



Relevanz: Lister UI, Ranking-Export, Allianz-Tools.

7\. Weitere interessante ClientLib-Bereiche

Die folgenden Dateien wurden im Repository gefunden und sind als nächste Untersuchungskandidaten vorgemerkt:

Bereich / Datei	Möglicher Nutzen	Status

ClientLib.Base.PointOfInterestTypes.js	POI-Typen und Klassifizierung	PRÜFEN

ClientLib.Base.ItemCategories.js	Kategorien von Gegenständen/Einheiten	PRÜFEN

ClientLib.Base.Resource.js	Ressourcenobjekte	PRÜFEN

ClientLib.Base.Tech.js	Technologie-/Gebäudedaten	PRÜFEN

ClientLib.Base.MatVector2.prototype.js	Koordinaten-/Vektorobjekt	PRÜFEN

ClientLib.Base.MatVector2f.prototype.js	Fließkomma-Vektoroperationen	PRÜFEN

ClientLib.Base.MathUtil.js	Hilfsfunktionen für Berechnungen	PRÜFEN

ClientLib.Data.Arsenal.ArsenalHandler.prototype.js	Arsenal, Einheiten, Gebäude und Level	PRÜFEN

ClientLib.Data.CitiesSupport.prototype.js	Unterstützungsdaten	PRÜFEN

ClientLib.Net.CommunicationManager.GetInstance	Spiel-Kommunikation / Commands	PRÜFEN





7.1 ArsenalHandler

Referenz: ArsenalHandler.prototype.js



Gefundene Methoden:

\- GetArsenalEntity(entity)

\- GetCurrentLevel(entity, level)

\- GetCurrentRepairBuildingLevel(entity, level)

\- GetArsenalUnits(faction, filter)

\- GetArsenalBuildings(faction, filter)

Der Code unterscheidet unter anderem Unit, Building, MCV und SupportBuilding. Die Bedeutung aller Parameter und Filterwerte muss noch dokumentiert und getestet werden.

8\. Qooxdoo und Webfrontend

Neben der eigentlichen Spiel-Daten-API enthält das Repository GUI-Code.

8.1 Qooxdoo (qx)

Pfad: API/qx



Der untersuchte Verzeichnisbaum enthält qx/ui/container. Das ist für Fenster, Container und Layouts relevant.



PRÜFEN / für Harzi Edition wichtig:

\- Aufbau und Lebenszyklus von Fenstern,

\- Composite und Container,

\- Layouts und Größenberechnung,

\- Event-Listener und deren korrektes Entfernen,

\- Verhalten beim Öffnen/Schließen der Stadt-, Vorposten- und Lageransicht,

\- Verankerung eigener UI-Elemente außerhalb des zentralen Spiel-Overlays.

Diese Punkte sind besonders relevant für Building \& Off Saver und die Positionierung eigener Buttons/Fenster.

8.2 webfrontend

Pfad: API/webfrontend



Im Repository vorhanden:

\- Application

\- gui

\- phe

\- res

\- theme

Der GUI-Bereich enthält u. a. Unterbereiche wie Allianz- und Infofenster. Der API-README nennt als erfasste Klassen beispielsweise:

\- webfrontend.gui.alliance.alliance

\- webfrontend.gui.alliance.AllianceOverlay

\- webfrontend.gui.alliance.MemberListPage

\- webfrontend.gui.alliance.RosterPage

\- webfrontend.gui.info.BaseDataOverviewTab

\- webfrontend.gui.info.BaseDataWindow

\- webfrontend.gui.info.BaseInfoWindow

\- webfrontend.gui.info.playerInfoWindow

\- webfrontend.gui.layout.Loader

\- webfrontend.gui.region.RegionCityMenu

PRÜFEN: Die konkrete Verfügbarkeit und Signatur der Methoden muss jeweils aus den passenden Dateien und im laufenden Client ermittelt werden.

9\. Zuordnung zu unseren Harzi-Edition-Scripten

Diese Zuordnung ist eine Arbeitsplanung, keine Behauptung, dass die jeweilige API bereits vollständig integriert ist.

Harzi-Edition-Script	API-Bereiche mit hoher Priorität	Ziel

Building \& Off Saver - HE	City, CityBuildingsData, CityUnitsData, Qooxdoo	Gebäude-/Einheitenstatus und Fensterintegration zuverlässig behandeln.

FollowPostTracker	World, Sektor-/POI-Daten, Kartenobjekte	Lager, Vorposten und Folgeposten eindeutig unterscheiden; korrekte Koordinaten.

Sektorsprung	City, World, Zeit-/Step-Daten	Cooldown, Restriktionen und mögliche Sprünge gegen echte Clientdaten prüfen.

Lister UI	Alliance, Player, Cities	Spieler-/Allianzlisten und Datenexport.

RaidHelper	CityUnitsData, Combat, ArsenalHandler	Off-/Deff-Stärken und Einheiteninformationen verlässlich ermitteln.

Info Sticker / Basinfo	City, World, GUI- und Infofenster	Basisinformationen und Anzeigeintegration.

SubSender - HE	PlayerSubstitution, MainData, Kommunikation	Vertretungsstatus und sichere Auslösung prüfen.

CnC Opt Builder	Gebäude-/Technologie-/Ressourcendaten	Spieldaten mit Optimierungsdaten abgleichen.





10\. Offene Prüfliste – zentraler Parkplatz

Alle unklaren Punkte bleiben hier erhalten, auch wenn sie zunächst nicht weiter untersucht werden.

A. Datenobjekte und Erkennung

\- \[ ] CityBuildingsData: vollständige Methodenliste, Datenstruktur und Gebäudestatus.

\- \[ ] CityUnitsData: Off/Deff, Einheitengruppen, Level, Reparatur, Headcount.

\- \[ ] CityRepairData: Reparaturkosten, Reparaturstatus, Zeit-/Step-Werte.

\- \[ ] Stadt vs. Vorposten vs. Lager: gemeinsame und unterschiedliche Objektklassen.

\- \[ ] POI-Typen aus PointOfInterestTypes.js auslesen und mit Live-Kartenobjekten vergleichen.

\- \[ ] Verlässliche Kennzeichnung von Folgeposten.

\- \[ ] Koordinatenquelle für Kartenobjekte und Umrechnung in CoordId.

\- \[ ] Verhalten von GetCityByCoord() bei fremden Objekten und nicht geladenen Bereichen.

B. Zeit, Cooldown und Umsiedlung

\- \[ ] Bedeutung und Einheit der Spiel-Steps feststellen.

\- \[ ] Umrechnung Step ↔ Datum/Uhrzeit aus aktueller Spielzeit ableiten.

\- \[ ] get\_MoveCooldownEndStep() im Live-Spiel gegen beobachtete Umsiedlungszeiten testen.

\- \[ ] get\_MoveRestictionEndStep() und mehrere Restriktionen testen.

\- \[ ] Prüfen, welche Umsiedlungsstufen serverseitig sichtbar sind und welche unsere eigene Berechnung bleiben müssen.

\- \[ ] Schutz-, Lockdown- und Found-Step im Spiel verifizieren.

C. Weltkarte und Sektoren

\- \[ ] Rückgabeformat von GetOwner() vollständig dekodieren.

\- \[ ] Bedeutung der numerischen Gebietstypen und IDs prüfen.

\- \[ ] Sektorgröße 32 × 32 anhand verschiedener Weltkoordinaten testen.

\- \[ ] Wasser-/Blockadeprüfungen bei nicht geladenen Sektoren testen.

\- \[ ] Karten-Events und Aktualisierung von Objektreferenzen finden.

D. GUI / Qooxdoo

\- \[ ] Fensterinstanz der Stadt-/Vopo-/Lageransicht zuverlässig erkennen.

\- \[ ] Ereignis beim Schließen der Ansichten finden.

\- \[ ] Unterschied zwischen close, destroy, exclude, hide und Overlay-Wechsel dokumentieren.

\- \[ ] Desktop-/Overlay-Geometrie beim Resize testen.

\- \[ ] Event-Listener sauber registrieren und wieder entfernen.

\- \[ ] GUI-Container außerhalb des zentralen Overlays stabil positionieren.

E. Kommunikation / Aktionen

\- \[ ] CommunicationManager.GetInstance() und erlaubte öffentliche Methoden untersuchen.

\- \[ ] SendSimpleCommand() Parameter, Callback und Fehlerbehandlung dokumentieren.

\- \[ ] Keine schreibenden/spielverändernden Methoden ohne gezielten Test verwenden.

\- \[ ] Prüfen, welche Daten lokal gecacht sind und welche einen Serverabruf benötigen.

F. Repository-Vollständigkeit

\- \[ ] Vollständigen Git-Tree statt der auf 1.000 Einträge begrenzten Directory-Abfrage auslesen.

\- \[ ] Dateien mit 0 Byte, 24 Byte, 44 Byte etc. systematisch klassifizieren.

\- \[ ] Doppelte Dateinamen mit Zusätzen wie (1) untersuchen.

\- \[ ] Verfügbare prototype.js-Dateien den einzelnen Methodendateien zuordnen.

\- \[ ] API-Stand mit dem aktuellen Spielclient vergleichen.

11\. Praktisches Testprotokoll

Für jede offene Methode soll ein kurzer Testeintrag angelegt werden.

Test-ID:

Datum:

Script / Testumgebung:

Spielwelt:

Ansicht (Stadt / Vorposten / Lager / Weltkarte):

API-Klasse:

Methode:

Aufruf / Parameter:

Erwartetes Ergebnis:

Tatsächliches Ergebnis:

Rückgabewert / Typ:

Fehler / Besonderheiten:

Status: BELEGT / PLAUSIBEL / PRÜFEN

Bei Konsolentests bevorzugt zuerst nur lesende Methoden verwenden. Bei unbekannten Funktionen keine Aktionen auslösen, die Basen verschieben, Ressourcen ausgeben, Truppen versenden oder andere Spielzustände verändern.

12\. Erste konkrete nächste Schritte

1\. POI- und Kartenobjekte: PointOfInterestTypes.js sowie passende World-/Sector-Klassen untersuchen. Das adressiert direkt die bekannten Lager-/Vorposten-Verwechslungen im FollowPostTracker.

2\. Gebäudedaten: CityBuildingsData und die zugehörigen Building-Klassen vollständig auswerten. Das hilft beim Building \& Off Saver.

3\. Einheitendaten: CityUnitsData und ArsenalHandler untersuchen. Das ist wichtig für RaidHelper und Off-/Deff-Auswertungen.

4\. Zeit-/Step-System: MainData.get\_Time() und die Zeitobjekte analysieren. Das hilft bei Sektorsprung und Cooldown-Berechnungen.

5\. GUI-Lebenszyklus: Qooxdoo-Fenster und Overlay-Ereignisse untersuchen. Das hilft bei automatischem Schließen und stabiler Positionierung.

13\. Änderungsverlauf

Version	Datum	Änderung

0.1	17.11.2026	Erste Arbeitsfassung erstellt. Quellenlage, Einstieg, MainData, City, Cities, World, Alliance, erste weitere API-Kandidaten, Script-Zuordnung und offene Prüfliste aufgenommen.





Grundsatz für alle Folgeversionen: Neue Erkenntnisse ergänzen und frühere Annahmen bei Bedarf korrigieren. Ungeklärte Punkte bleiben sichtbar und werden nicht gelöscht, nur weil sie aktuell nicht untersucht werden.

