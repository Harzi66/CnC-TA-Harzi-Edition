// ==UserScript==
// @name         CnC-TA Kampfsimulator Auswahl - Harzi Edition
// @namespace    CnC-TA-Harzi-Edition
// @version      0.8.5
// @description  Auswahlmenü für TACS und TABS V2 mit integriertem Originalcode der jeweiligen Autoren.
// @author       Harzi
// @contributor  TACS: KRS_L | Contributions/Updates by WildKatana, CodeEcho, PythEch, Matthias Fuchs, Enceladus, TheLuminary, Panavia2, Da Xue, MrHIDEn, TheStriker, JDuarteDJ, null, g3gg0.de, Netquik
// @contributor  TABS V2: Eistee & TheStriker & VisiG & Lobotommi & XDaast
// @contributor  TACS/TABS V2: NetquiK (see original source headers below)
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        unsafeWindow
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Kampfsimulator-HE/main/CnC-TA%20Kampfsimulator%20Auswahl%20-%20Harzi%20Edition.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Kampfsimulator-HE/main/CnC-TA%20Kampfsimulator%20Auswahl%20-%20Harzi%20Edition.user.js
// ==/UserScript==



(function () {

    'use strict';

    var activeSimulator =
        GM_getValue(
            "HCTAT_ActiveSimulator_080",
            "TACS"
        );

    var BACKGROUND_IMAGE_URL =
        "https://raw.githubusercontent.com/Harzi66/CnC-TA-Kampfsimulator-HE/main/Image%203.%20Sept.%202026%2C%2014_15_04.png";

    var SimulatorAuswahlWindow = null;


    function findScriptsButton(widget) {

        if (!widget || !widget.getChildren) {
            return null;
        }

        var children = widget.getChildren();

        for (var i = 0; i < children.length; i++) {

            var child = children[i];

            try {

                if (child.getLabel) {

                    var label = child.getLabel();

                    if (
                        label &&
                        (
                            label.toLowerCase() === "skripte" ||
                            label.toLowerCase() === "scripts"
                        )
                    ) {
                        return child;
                    }
                }

            } catch (e) {}

            var result = findScriptsButton(child);

            if (result) {
                return result;
            }
        }

        return null;
    }


    function injectOriginalSimulator(source, name) {
        console.log("Kampfsimulator HE 0.8.0: Injiziere Originalcode =", name);
        try {
            var script = document.createElement("script");
            script.textContent = source;
            script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(script);
            console.log("Kampfsimulator HE 0.8.0: Originalcode injiziert =", name);
        } catch (e) {
            console.error("Kampfsimulator HE 0.8.0: Fehler bei " + name + ":", e);
        }
    }

    var TACS_ORIGINAL_SOURCE = `// ==UserScript==
// @name           TACS (Tiberium Alliances Combat Simulator)
// @description    Allows you to simulate combat before actually attacking.
// @namespace      https://*.alliances.commandandconquer.com/*/index.aspx*
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @version        3.80
// @author         KRS_L | Contributions/Updates by WildKatana, CodeEcho, PythEch, Matthias Fuchs, Enceladus, TheLuminary, Panavia2, Da Xue, MrHIDEn, TheStriker, JDuarteDJ, null, g3gg0.de, Netquik
// @contributor    NetquiK (https://github.com/netquik) (see first comment for changelog)
// @translator     TR: PythEch | DE: Matthias Fuchs, Leafy & sebb912 | PT: JDuarteDJ & Contosbarbudos | IT: Hellcco | NL: SkeeterPan | HU: Mancika | FR: Pyroa & NgXAlex | FI: jipx | RO: MoshicVargur | ES: Nefrontheone
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_TACS.user.js
// @grant none
// ==/UserScript==
//window.TACS_version = GM_info.script.version;

/* 
codes by NetquiK
----------------
- PlayArea(MainOverlay) positioning to unhide First Line Defense
- Fixed TACS Options
- Changed side bars for better view
- New code for sidebar LEFT/RIGHT placing option
- New code for detecting Desktop Resize and improve View
- Other minor GUI fixes
- Some recode for new functions
- 20.1|20.2 Patch Ready
- TopBar display management recoded
- Fix for statbox and replays + hide setup button
- Patch for 22.2
- NOEVIL for all code
- New Fixes for simulation + ReplayBar + Date hidden
- New SkipSimulation Function
- Fix FOR CP Calculation on PLAYERS
- Patch for 22.3
- Fix for getAttackUnits
- PHE FIX
----------------
*/


(function () {
    'use strict';
    var TASuite_mainFunction = function () {
        console.log("TACS: Simulator loaded");
        //Sound sample B64LOBs
        window.soundRepairImpact = {
            info: "Impact Wrench Sound; Used in TACS; courtesy of: http://www.freesfx.co.uk",
            d: "data:video/ogg;base64,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"
        };
        window.soundRepairReload = {
            info: "Reload sound; Used in TACS; courtesy of: http://www.freesfx.co.uk; 7806 bytes",
            d: "data:video/ogg;base64,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"
        };
        /* not used
        		function compare(a, b) {
        		return a - b;
        		}
        		function sort_and_unique(my_array) {
        		my_array.sort(compare);
        		for (var i = 1; i < my_array.length; i++) {
        		if (my_array[i] === my_array[i - 1]) {
        		my_array.splice(i--, 1);
        		}
        		}
        		return my_array;
        		}*/
        var locale = null;
        var languages = ["tr_TR", "de_DE", "pt_PT", "it_IT", "nl_NL", "hu_HU", "fr_FR", "fi_FI", "ro_RO", "es_ES"]; //en is default
        var translations = {
            "Stats": ["İstatistik", "Statistik", "Estatística", "Statistiche", "Statistieken", "Statisztika", "Statistiques", "Tiedot", "Statistici", "Estadísticas"],
            "Enemy Base:": ["Düşman Üssü:", "Feindliche Basis:", "Base Inimiga:", "Base Nemica:", "Vijandelijke Basis:", "Ellenséges bázis:", "Base Ennemie:", "Vihollisen tukikohta:", "Baza inamică", "Base enemiga"],
            "Defences:": ["Savunma Üniteleri:", "Verteidigung:", "Defesas:", "Difesa:", "Verdediging:", "Védelem:", "Défenses:", "Puolustus:", "Apărare", "Defensas"],
            "Buildings:": ["Binalar:", "Gebäude:", "Edifícios:", "Strutture:", "Gebouwen:", "Épületek:", "Bâtiments:", "Rakennelmat:", "Clădiri", "Edificios"],
            "Construction Yard:": ["Şantiye:", "Bauhof:", "Estaleiro:", "Cantiere:", "Bouwplaats:", "Központ:", "Chantier De Construction:", "Rakennustukikohta:", "Șantierul de construcții", "Centro de construcciones"],
            "Defense Facility:": ["Savunma Tesisi:", "Verteidigungseinrichtung:", "Instalações de Defesa:", "Stazione di Difesa:", "Defensiefaciliteit:", "Védelmi Bázis:", "Complexe De Défense:", "Puolustuslaitos:", "Unitate de apărare", "Instalación defensiva"],
            "Command Center:": ["Komuta Merkezi:", "Kommandozentrale:", "Centro de Comando:", "Centro di Comando:", "Commandocentrum:", "Parancsnoki központ:", "Centre De Commandement:", "Komentokeskus:", "Centrul de comandă", "Centro de mando"],
            "Available Repair:": ["Mevcut Onarım:", "Verfügbare Reparaturen", "", "", "", "", "", "Korjausaikaa jäljellä:", "Timp de reparare disponibil", "Reparación disponible"],
            "Available Attacks:": ["Mevcut Saldırılar:", "Verfügbare Angriffe", "", "", "", "", "", "Hyökkäyksiä:", "Atacuri disponibile", "Ataques disponibles"],
            "Overall:": ["Tüm Birlikler:", "Gesamt:", "Geral:", "Totale:", "Totaal:", "Áttekintés:", "Total:", "Yhteensä:", "Ansamblu", "Total"],
            "Infantry:": ["Piyadeler:", "Infanterie:", "Infantaria:", "Fanteria:", "Infanterie:", "Gyalogság:", "Infanterie:", "Jalkaväki:", "Infanterie", "Infantería"],
            "Vehicle:": ["Motorlu Birlikler:", "Fahrzeuge:", "Veículos:", "Veicoli:", "Voertuigen:", "Jármu:", "Véhicules:", "Ajoneuvot:", "Vehicule", "Vehículos"],
            "Aircraft:": ["Hava Araçları:", "Flugzeuge:", "Aviões:", "Velivoli:", "Vliegtuigen:", "Légiero:", "Avions:", "Lentokoneet:", "Aviație", "Aviación"],
            "Outcome:": ["Sonuç:", "Ergebnis:", "Resultado:", "Esito:", "Uitkomst:", "Eredmény:", "Résultat:", "Lopputulos:", "Rezultat", "Probable"],
            "Unknown": ["Bilinmiyor", "Unbekannt", "Desconhecido", "Sconosciuto", "Onbekend", "Ismeretlen", "Inconnu", "Tuntematon", "Necunoscut", "Desconocido"],
            "Battle Time:": ["Savaş Süresi:", "Kampfdauer:", "Tempo de Batalha:", "Tempo di Battaglia:", "Gevechtsduur:", "Csata ideje:", "Durée Du Combat:", "Taistelun kesto:", "Timp de atac", "Duración batalla"],
            "Layouts": ["Diziliş", "Layouts", "Formações", "Formazione", "Indelingen", "Elrendezés", "Dispositions", "Asetelmat", "Scheme", "Diseño"],
            "Load": ["Yükle", "Laden", "Carregar", "Carica", "Laad", "Töltés", "Charger", "Lataa", "Încarcă", "Cargar"],
            "Load this saved layout.": ["Kayıtlı dizilişi yükle.", "Gespeichertes Layout laden.", "Carregar esta formação guardada.", "Carica questa formazione salvata.", "Laad deze opgeslagen indeling.", "Töltsd be ezt az elmentett elrendezést.", "Charger Cette Disposition.", "Lataa valittu asetelma.", "Încarcă acest formație salvată.", "Carga este diseño grabado."],
            "Delete": ["Sil", "Löschen", "Apagar", "Cancella", "Verwijder", "Törlés", "Effacer", "Poista", "Șterge", "Borra"],
            "Name: ": ["İsim: ", "Name: ", "Nome: ", "Nome: ", "Naam: ", "Név: ", "Nom: ", "Nimi: ", "Nume: ", "Nombre: "],
            "Delete this saved layout.": ["Kayıtlı dizilişi sil.", "Gewähltes Layout löschen.", "Apagar esta formação guardada.", "Cancella questa formazione salvata.", "Verwijder deze opgeslagen indeling.", "Töröld ezt az elmentett elrendezést.", "Effacer Cette Disposition.", "Poista valittu asetelma.", "Șterge acest formație salvat.", "Borra este diseño grabado."],
            "Save": ["Kaydet", "Speichern", "Guardar", "Salva", "Opslaan", "Mentés", "Sauvegarder", "Tallenna", "Salvează", "Guardar"],
            "Save this layout.": ["Bu dizilişi kaydet.", "Layout speichern.", "Guardar esta formação.", "Salva questa formazione.", "Deze indeling opslaan.", "Mentsd el ezt az elrendezést.", "Sauvegarder Cette Disposition.", "Tallenna nykyinen asetelma.", "Salvează acest formație ", "Guarda este diseño."],
            "Info": ["Bilgi", "Info", "Info", "Info", "Info", "Info", "Infos", "Tietoa", "Info", "Información"],
            "Forums": ["Forum", "Forum", "Fóruns", "Forum", "Forums", "Fórum", "Forums", "Keskustelupalsta", "Forum", "Foros"],
            "Spoils": ["Ganimetler", "Rohstoffausbeute", "Espólios", "Bottino", "Opbrengst", "Zsákmény", "Butin", "Sotasaalis", "Pradă", "Botín"],
            "Options": ["Seçenekler", "Optionen", "Opções:", "Opzioni:", "Opties:", "Opciók:", "Options:", "Asetukset", "Opțiuni", "Opciones"],
            "TACS Options": ["TACS Seçenekleri", "TACS Optionen", "", "", "", "", "", "", "Opțiuni TACS: ", "Opciones TACS"],
            "Auto display stats": ["İstatistik penceresini otomatik olarak göster", "Dieses Fenster automatisch öffnen", "Mostrar esta caixa automaticamente", "Apri automaticamente la finestra Strumenti", "Dit venster automatisch weergeven", "Ezen ablak autómatikus megjelenítése", "Affich. Auto. de cette Fenêtre", "Näytä simuloinnin tiedot automaattisesti", "Afișează automat statisticile", "Mostrar estadísticas automáticamente"],
            // need to change translations
            "Show shift buttons": ["Kaydırma tuşlarını göster", "Bewegungstasten anzeigen", "Mostrar botões de deslocamento", "Mostra i pulsanti di spostamento", "Verschuifknoppen weergeven", "Eltoló gombok megjelenítése", "Affich. Auto. Boutons de Déplacement", "Näytä armeijan siirtopainikkeet", "Afișează butoanele de deplasare", "Mostrar botones de movimiento"],
            "Warning!": ["Uyarı!", "Warnung!", "Aviso!", "Attenzione!", "Waarschuwing!", "Figyelem!", "Attention!", "Varoitus!", "Atenție!", "¡Aviso!"],
            "Simulate": ["Simule et", "Simulieren", "Simular", "Simula", "Simuleer", "Szimuláció", "Simuler", "Simuloi", "Simulează", "Simular"],
            "Start Combat Simulation": ["Savaş Simulasyonunu Başlat", "Kampfsimulation starten", "Começar a simalação de combate", "Avvia simulazione", "Start Gevechtssimulatie", "Csata szimuláció elindítása", "Démarrer La Simulation Du Combat", "Aloita taistelun simulaatio", "Începe simularea luptei", "Comenzar simulación de combate"],
            "Setup": ["Düzen", "Aufstellung", "Configuração", "Setup", "Opzet", "Elrendezés", "Organisation", "Takaisin", "Pregătire", "Configuración"],
            "Return to Combat Setup": ["Ordu düzenini göster", "Zurück zur Einheitenaufstellung", "Voltar à configuração de combate", "Ritorna alla configurazione", "Keer terug naar Gevechtsopzet", "Vissza az egységek elrendezéséhez", "Retourner à l'Organisation Des Troupes", "Return to Combat Setup", "Întoarcere la ecranul pentru pregătirea luptei", "Regresar a configuración de ataque"],
            "Unlock": ["Kilidi aç", "Freigabe", "Desbloquear", "Sblocca", "Ontgrendel", "Felold", "Debloquer", "Avaa", "Descuie", "Desbloquear"],
            //"Tools" : ["Araçlar", "Extras", "Ferramentas", "Strumenti", "Gereedschap", "Eszközök", "Outils", "Työkalut", "Herramientas"],
            "Open Simulator Tools": ["Simulatör Araçlarını Göster", "Extras öffnen", "Abrir as ferramentas do simulador", "Apri strumenti", "Open Simulator Gereedschap", "Megnyitja a szimulátor információs ablakát", "Ouvrir Les Réglages Du Simulateur", "Avaa simulaattorin työkalut", "Deschide opțiunile simulatorului", "Abrir estadísticas de simulación"],
            "Shift units left": ["Birlikleri sola kaydır", "Einheiten nach links bewegen", "Deslocar as unidades para a esquerda", "Spostare le unità a sinistra", "Verschuif eenheden links", "Egységek eltolása balra", "Déplacer Les Unités Vers La Gauche", "Siirtää yksikköjä vasemmalle", "Deplasează unitățile la stânga", "Desplazar unidades a la izquierda"],
            "Shift units right": ["Birlikleri sağa kaydır", "Einheiten nach rechts bewegen", "Deslocar as unidades para a direita", "Spostare le unità a destra", "Verschuif eenheden rechts", "Egységek eltolása jobbra", "Déplacer Les Unités Vers La Droite", "Siirtää yksikköjä oikealle", "Deplasează unitățile la dreapta", "Desplazar unidades a la derecha"],
            "Shift units up": ["Birlikleri yukarı kaydır", "Einheiten nach oben bewegen", "Deslocar as unidades para cima", "Spostare le unità in alto", "Verschuif eenheden omhoog", "Egységek eltolása fel", "Déplacer Les Unités Vers Le Haut", "Siirtää yksikköjä ylös", "Deplasează unitățile mai sus", "Desplazar unidades arriba"],
            "Shift units down": ["Birlikleri aşağı kaydır", "Einheiten nach unten bewegen", "Deslocar as unidades para baixo", "Spostare le unità in basso", "Verschuif eenheden omlaag", "Egységek eltolása le", "Déplacer Les Unités Vers Le Bas", "Siirtää yksikköjä alas", "Deplasează unitățile mai jos", "Desplazar unidades abajo"],
            //"Battle Simulator" : ["Savaş Simulatörü", "Kampfsimulator", "Simulador de Combate", "Simulatore", "Gevechtssimulator", "Csata szimulátor", "Simulateur De Combat", "Taistelusimulaattori", "Simulador de combate"],
            "Total Victory": ["Mutlak Zafer", "Gesamtsieg", "Vitória Total", "Vittoria Totale", "Totale Overwinning", "Teljes gyozelem", "Victoire Totale", "Totaalinen Voitto", "Victorie totală", "Victoria total"],
            "Victory": ["Zafer", "Sieg", "Vitória", "Vittoria", "Overwinning", "Gyozelem", "Victoire", "Voitto", "Victorie", "Victoria"],
            "Total Defeat": ["Mutlak Yenilgi", "Totale Niederlage", "Derrota total", "Sconfitta Totale", "Totale Nederlaag", "Teljes vereség", "Défaite Totale", "Total Tappio", "Înfrângere totală", "Derrota total"],
            "Support lvl ": ["Takviye seviyesi ", "Stufe Supportwaffe ", "Nível do Suporte ", "Supporto lvl ", "Ondersteuningsniveau ", '"Support" épület szintje ', "Lvl. Du Support ", "Tukitykistön taso ", "Nivelul suportului ", "Nivel de soporte "],
            "Refresh": ["Yenile", "Erfrischen", "Actualizar", "Rinfrescare", "Verversen", "Felfrissít", "Actualiser", "Päivitä", "Împrospătează", "Recargar"],
            //google translate non-PT langs
            "Refresh Stats": ["İstatistikleri Yenile", "Erfrischen Statistik", "Estatística", "Rinfrescare Statistiche", "Verversen Statistieken", "Frissítés Stats", "Actualiser Les Stats", "Päivitä tiedot", "Împrospătează statisticile", "Recargar estadísticas"],
            //google translate non-PT langs 'refresh' + statistics label
            "Side:": ["Taraf:", "Seite", "Lado:", "", "Zijde", "", "Côté", "Sijainti:", "Lateral", "Lado"],
            "Left": ["Sol", "Links", "Esquerda", "", "Links", "", "Gauche", "Vasen", "Stânga", "Izquierdo"],
            "Right": ["Sağ", "Rechts", "Direita", "", "Rechts", "", "Droite", "Oikea", "Dreapta", "Derecho"],
            "Locks:": ["Kilitler:", "Freigabe", "Bloquear:", "", "Vergrendelingen:", "", "Vérouiller:", "Varmistimet:", "Blochează:", "Bloquear:"],
            "Attack": ["Saldırı", "Angriff", "Atacar", "", "Aanvallen", "", "Attaquer", "Hyökkäys", "Atacă ", "Atacar:"],
            "Repair": ["Onarım", "Reparatur", "Reparar", "", "Repareren", "", "Réparer", "Korjaus", "Reparare", "Reparar"],
            "Reset": ["Sıfırla", "Zurücksetzen", "", "", "", "", "", "Palauta", "Resetare", "Reiniciar"],
            "Simulation will be based on most recently refreshed stats!": ["Simulasyon en son güncellenen istatistiklere göre yapılacaktır!", "Die Simulation basiert auf den zuletzt aktualisierten Stand", "A simulação vai ser baseada na mais recente data!", "", "Simulatie zal gebaseerd worden op meest recentelijke ververste statistieken!", "", "La Simulation sera basée en fonction des dernières stats actualisées !", "Simulaatio suoritetaan viimeisimmän päivityksen tiedoilla!", "Simularea se va baza pe cele mai recente statistici!", "Simulación basada en las últimas estadísticas obtenidas"],
            "Unlock Attack Button": ["Saldırı Düğmesinin Kilidini Aç", "Angriffsbutton freigeben", "Desbloquear o botão de ataque", "Sblocca pulsante d'attacco", "Ontgrendel Aanvalsknop", "a Támadás gomb feloldása", "Débloquer Le Bouton d'Attaque", "Poista hyökkäusnapin lukitus", "Descuie butonul de atac", "Desbloquear botón de ataque"],
            "Unlock Repair Button": ["Onarım Düğmesinin Kilidini Aç", "Reparaturbutton freigeben", "Desbloquear botão de reparação", "", "Ontgrendel Repareerknop", "", "Débloquer Le Bouton de Réparation", "Poista korjausnapin lukitus", "Descuie butonul de reparare", "Desbloquear botón de reparación"],
            "Unlock Reset Button": ["Sıfırlama Düğmesinin Kilidini Aç", "", "", "", "", "", "", "Avaa Tyhjennä nappi", "Descuie butonul de resetare", "Desbloquear botón de reinicio"],
            "SKIP": ["ATLA", "Überspringen", "", "", "", "", "", "", "", "SALTAR"],
            "Skip to end": ["Simulasyonu atla", "Zum Ende Vorspringen", "", "", "", "", "", "Mene loppuun", "Sari la final", "Saltar al final"],
            "Reset Formation": ["Dizilişi Sıfırla", "Formation zurücksetzen", "", "", "", "", "", "Palauta armeijan oletusasetelma", "Resetează formația", "Reiniciar formación"],
            "Flip Horizontal": ["Yatay Çevir", "Horizontal Spiegeln", "", "", "", "", "", "Käännä vaakasuunnassa", "Întoarce orizontal", "Girar horizontalmente"],
            "Flip Vertical": ["Dikey Çevir", "Vertikal Spiegeln", "", "", "", "", "", "Käännä pystysuunnassa", "Întoarce vertical", "Girar verticalmente"],
            "Activate All": ["Hepsini Aktifleştir", "Alle Aktivieren", "", "", "", "", "", "Aktivoi kaikki", "Activează totul", "Activar todo"],
            "Deactivate All": ["Hepsini Deaktifleştir", "Alle Deaktivieren", "", "", "", "", "", "Poista kaikki käytöstä", "Dezactivează totul", "Desactivar todo"],
            "Activate Infantry": ["Piyadeleri Aktifleştir", "Infanterie Aktivieren", "", "", "", "", "", "Aktivoi jalkaväki", "Activează infanteria", "Activar infantería"],
            "Deactivate Infantry": ["Piyadeleri Deaktifleştir", "Infanterie Deaktivieren", "", "", "", "", "", "Poista jalkaväki käytöstä", "Dezactivează infanteria", "Desactivar infantería"],
            "Activate Vehicles": ["Motorlu Birlikleri Aktifleştir", "Fahrzeuge Aktivieren", "", "", "", "", "", "Aktivoi ajoneuvot", "Activează vehiculele", "Activar vehículos"],
            "Deactivate Vehicles": ["Motorlu Birlikleri Deaktifleştir", "Fahrzeuge Deaktivieren", "", "", "", "", "", "Poista ajoneuvot käytöstä", "Dezactivează vehiculele", "Desactivar vehículos"],
            "Activate Air": ["Hava Araçlarını Aktifleştir", "Flugzeuge Aktivieren", "", "", "", "", "", "Aktivoi lentokoneet", "Activează avioanele", "Activar aviación"],
            "Deactivate Air": ["Hava Araçlarını Deaktifleştir", "Flugzeuge Deaktivieren", "", "", "", "", "", "Poista lentokoneet käytöstä", "Dezactivează avioanele", "Desactivar aviación"],
            "Activate Repair Mode": ["Onarım Modunu Aç", "Reparatur Modus Aktivieren", "", "", "", "", "", "Aktivoi korjaustila", "Activează modul de reparare", "Activar modo de reparación"],
            "Deactivate Repair Mode": ["Onarım Modunu Kapat", "Reparatur Modus Deaktivieren", "", "", "", "", "", "Poista korjaustila käytöstä", "Dezactivează modul de reparare", "Desactivar modo de reparación"],
            "Version: ": ["Sürüm: ", "", "", "", "", "", "", "Versio: ", "Versiunea: ", "Versión: "],
            "Mark saved targets on region map": ["Kaydedilmiş hedefleri haritada işaretle", "Gespeicherte Ziele auf der Karte Markieren", "", "", "", "", "", "Merkitse tallennetut kohteet alue kartalle", "Marchează țintele salvate pe harta regiunii", "Mostrar en el mapa los objetivos grabados"],
            // region view
            "Enable 'Double-click to (De)activate units'": ["Çift-tıklama ile birlikleri (de)aktifleştirmeyi etkinleştir", "Doppel-Klick zum Einheiten (De)-Aktivieren ", "", "", "", "", "", "Tuplaklikkaus aktivoi/deaktivoi yksiköt", "Activează \"Dublu click pentru a (De)activa unitățile\"", "Habilitar doble clic para des/activar unidades"],
            "Show Loot Summary": ["", "Zeige Beute-Zusammenfassung", "", "", "", "", "", "", "Afișează rezumatul prăzii", "Mostrar resumen de botín"],
            "Show Resource Layout Window": ["", "", "", "", "", "", "", "", "Afișează fereastra cu schema resurselor", "Mostrar ventana de recursos de diseño"],
            "Show Stats During Attack": ["İstatistikleri saldırı sırasında göster", "Zeige Statistik während des Angriffs", "", "", "", "", "", "Näytä tiedot -ikkuna hyökkäyksen aikana", "Afișează statisticile în timpul atacului", "Mostrar estadísticas durante el ataque"],
            "Show Stats During Simulation": ["İstatistikleri simulasyondayken göster", "Zeige Statistik während der Simulation", "", "", "", "", "", "Näytä tiedot -ikkuna simuloinnin aikana", "Afișează statisticile în timpul simulării", "Mostrar estadísticas durante la simulación"],
            "Skip Victory-Popup After Battle": ["Savaş Bitiminde Zafer Bildirimini Atla", "Siegesbildschirm überspringen", "", "", "", "", "", "Ohita taistelun jälkeinen voittoruutu", "Sari peste popup-ul victoriei după luptă", "Saltar ventana de victoria total tras la batalla"],
            "Stats Window Opacity": ["İstatistik Penceresi Saydamlığı", "Transparenz des Statistik-Fenster", "", "", "", "", "", "Tiedot -ikkunan läpinäkyvyys", "Opacitatea ferestrei de statistici", "Opacidad de la ventana de estadísticas"],
            "Disable Unit Tooltips In Army Formation Manager": ["Ordu Dizilişi Yöneticisinde Birlik İpuçlarını Gizle", "", "", "", "", "", "", "Poista käytöstä yksiköiden työkaluvihjeet armeijan muodostamisikkunassa", "Dezactivează tooltip-urile unităților în managerul formației armatei", "Desactivar globo de las unidades en la ventana de  de formación"],
            "Disable Tooltips In Attack Preparation View": ["Saldırı Hazırlık Görünümünde İpuçlarını Gizle", "", "", "", "", "", "", "Poista työkaluvihjeet käytöstä hyökkäyksen valmisteluikkunassa", "Dezactivează tooltip-urile unităților în ecranul preparării armatei", "Desactivar globo en la ventana de preparación de ataque"],
            "Undo": ["Geri Al", "", "", "", "", "", "", "Kumoa", "Anulează", "Deshacer"],
            "Redo": ["İleri Al", "", "", "", "", "", "", "Tee uudelleen", "Refă", "Rehacer"],
            "Open Stats Window": ["İstatistik Penceresini Aç", "Statistik öffnen", "", "", "", "", "", "Avaa tiedot -ikkuna", "Deschide fereastra de statistici", "Abrir ventana de estadísticas"]
        };

        function lang(text) {
            try {
                if (languages.indexOf(locale) > -1) {
                    var translated = translations[text][languages.indexOf(locale)];
                    if (translated !== "") {
                        return translated;
                    } else {
                        return text;
                    }
                } else {
                    return text;
                }
            } catch (e) {
                console.log(e);
                //console.log("Text is undefined: "+text);
                return text;
            }
        }

        function CreateTweak() {
            var TASuite = {};
            qx.Class.define("TACS", {
                type: "singleton",
                extend: qx.core.Object,
                members: {
                    // Default settings
                    saveObj: {
                        // section.option
                        section: {
                            option: "foo"
                        },
                        bounds: {
                            battleResultsBoxLeft: 125,
                            battleResultsBoxTop: 125,
                            resourceLayoutWindowLeft: 125,
                            resourceLayoutWindowTop: 550
                        },
                        checkbox: {
                            showLootSummary: true,
                            showResourceLayoutWindow: true,
                            showStatsDuringAttack: true,
                            showStatsDuringSimulation: true,
                            skipVictoryPopup: false,
                            disableArmyFormationManagerTooltips: false,
                            disableAttackPreparationTooltips: false
                        },
                        audio: {
                            playRepairSound: true
                        },
                        slider: {
                            statsOpacity: 100
                        }
                    },
                    buttons: {
                        attack: {
                            layout: {
                                save: null,
                                // buttonLayoutSave
                                load: null // buttonLayoutLoad
                            },
                            simulate: null,
                            // buttonSimulateCombat
                            unlock: null,
                            // buttonUnlockAttack
                            repair: null,
                            // buttonUnlockRepair
                            unlockReset: null,
                            // buttonUnlockReset
                            tools: null,
                            // buttonTools
                            refreshStats: null,
                            // buttonRefreshStats
                            formationReset: null,
                            // buttonResetFormation
                            flipVertical: null,
                            // buttonFlipVertical
                            flipHorizontal: null,
                            // buttonFlipHorizontal
                            activateInfantry: null,
                            // buttonActivateInfantry
                            activateVehicles: null,
                            // buttonActivateVehicles
                            activateAir: null,
                            // buttonActivateAir
                            activateAll: null,
                            // buttonActivateAll
                            repairMode: null,
                            // buttonToggleRepairMode
                            toolbarRefreshStats: null,
                            // buttontoolbarRefreshStats
                            toolbarShowStats: null,
                            toolbarUndo: null,
                            toolbarRedo: null,
                            options: null // buttonOptions
                        },
                        simulate: {
                            back: null,
                            // buttonReturnSetup
                            skip: null // buttonSkipSimulation
                        },
                        shiftFormationUp: null,
                        shiftFormationDown: null,
                        shiftFormationLeft: null,
                        shiftFormationRight: null,
                        optionStats: null
                    },
                    stats: {
                        spoils: {
                            tiberium: null,
                            // tiberiumSpoils
                            crystal: null,
                            // crystalSpoils
                            credit: null,
                            // creditSpoils
                            research: null // researchSpoils
                        },
                        health: {
                            infantry: null,
                            // lastInfantryPercentage
                            vehicle: null,
                            // lastVehiclePercentage
                            aircraft: null,
                            // lastAirPercentage
                            overall: null // lastPercentage
                        },
                        repair: {
                            infantry: null,
                            // lastInfantryRepairTime
                            vehicle: null,
                            // lastVehicleRepairTime
                            aircraft: null,
                            // lastAircraftRepairTime
                            overall: null,
                            // lastRepairTime
                            available: null,
                            // storedRepairTime
                            max: null // maxRepairCharges
                        },
                        attacks: {
                            availableCP: null,
                            attackCost: null,
                            availableAttacksCP: null,
                            availableAttacksAtFullStrength: null,
                            availableAttacksWithCurrentRepairCharges: null
                        },
                        damage: {
                            units: {
                                overall: null // lastEnemyUnitsPercentage
                            },
                            structures: {
                                construction: null,
                                // lastCYPercentage
                                defense: null,
                                // lastDFPercentage
                                command: null,
                                // lastCCPercentage
                                support: null,
                                overall: null // lastEnemyBuildingsPercentage
                            },
                            overall: null // lastEnemyPercentage
                        },
                        resourcesummary: {
                            research: null,
                            credits: null,
                            crystal: null,
                            tiberium: null
                        },
                        time: null,
                        supportLevel: null
                    },
                    labels: {
                        health: {
                            infantry: null,
                            // infantryTroopStrengthLabel
                            vehicle: null,
                            // vehicleTroopStrengthLabel
                            aircraft: null,
                            // airTroopStrengthLabel
                            overall: null // simTroopDamageLabel
                        },
                        repair: {
                            available: null
                        },
                        repairinfos: {
                            infantry: null,
                            vehicle: null,
                            aircraft: null,
                            available: null
                        },
                        attacks: {
                            available: null
                        },
                        damage: {
                            units: {
                                overall: null // enemyUnitsStrengthLabel
                            },
                            structures: {
                                construction: null,
                                // CYTroopStrengthLabel
                                defense: null,
                                // DFTroopStrengthLabel
                                command: null,
                                // CCTroopStrengthLabel
                                support: null,
                                // enemySupportStrengthLabel
                                overall: null // enemyBuildingsStrengthLabel
                            },
                            overall: null,
                            // enemyTroopStrengthLabel
                            outcome: null // simVictoryLabel
                        },
                        resourcesummary: {
                            research: null,
                            credits: null,
                            crystal: null,
                            tiberium: null
                        },
                        time: null,
                        // simTimeLabel
                        supportLevel: null,
                        // enemySupportLevelLabel
                        countDown: null // countDownLabel
                    },
                    view: {
                        playerCity: null,
                        playerCityDefenseBonus: null,
                        ownCity: null,
                        ownCityId: null,
                        targetCityId: null,
                        lastUnits: null,
                        lastUnitList: null
                    },
                    layouts: {
                        label: null,
                        list: null,
                        all: null,
                        current: null,
                        restore: null
                    },
                    options: {
                        autoDisplayStats: null,
                        showShift: null,
                        sideLabel: null,
                        locksLabel: null,
                        leftSide: null,
                        rightSide: null,
                        attackLock: null,
                        repairLock: null,
                        markSavedTargets: null,
                        dblClick2DeActivate: null,
                        showLootSummary: null,
                        showResourceLayoutWindow: null,
                        showStatsDuringAttack: null,
                        showStatsDuringSimulation: null,
                        skipVictoryPopup: null,
                        statsOpacityLabel: null,
                        statsOpacity: null,
                        statsOpacityOutput: null,
                        disableArmyFormationManagerTooltips: null,
                        disableAttackPreparationTooltips: null
                    },
                    audio: {
                        soundRepairImpact: null,
                        soundRepairReload: null
                    },
                    _Application: null,
                    _MainData: null,
                    _Cities: null,
                    _VisMain: null,
                    _ActiveView: null,
                    _PlayArea: null,
                    _armyBarContainer: null,
                    _armyBar: null,
                    PBIS: null,
                    PBIS_L: null,
                    PBIS_S: null,
                    PBIS_SK: null,
                    TopAttackerPos: null,
                    SkippingSim: null,
                    attacker_modules: null,
                    defender_modules: null,
                    resourceSummaryVerticalBox: null,
                    battleResultsBox: null,
                    optionsWindow: null,
                    resourceLayoutWindow: null,
                    statsPage: null,
                    lastSimulation: null,
                    count: null,
                    counter: null,
                    statsOnly: null,
                    simulationWarning: null,
                    warningIcon: null,
                    userInterface: null,
                    infantryActivated: null,
                    vehiclesActivated: null,
                    airActivated: null,
                    allActivated: null,
                    toolBar: null,
                    toolBarParent: null,
                    //TOOL_BAR_LOW: 113,
                    // hidden
                    TOOL_BAR_HIGH: 155,
                    // popped-up
                    TOOL_BAR_WIDTH: 740,
                    resourceLayout: null,
                    repairInfo: null,
                    repairButtons: [],
                    repairButtonsRedrawTimer: null,
                    armybarClickCount: null,
                    armybarClearnClickCounter: null,
                    repairModeTimer: null,
                    curPAVM: null,
                    curViewMode: null,
                    DEFAULTS: null,
                    undoCache: [],
                    ts1: null,
                    //timestamps
                    ts2: null,
                    attackUnitsLoaded: null,
                    loadData: function () {
                        var str = localStorage.getItem("TACS");
                        var temp;
                        // this needs to be thoroughly checked
                        if (str != null) {
                            //previous options found
                            temp = JSON.parse(str);
                            for (var i in this.saveObj) {
                                if (typeof temp[i] == "object") {
                                    for (var j in this.saveObj[i]) {
                                        if (typeof temp[i][j] == "object") {
                                            //recurse deeper?
                                        } else if (typeof temp[i][j] == "undefined") {
                                            // create missing option
                                            console.log("Creating missing save option: " + i + "." + j);
                                            temp[i][j] = this.saveObj[i][j];
                                        }
                                    }
                                } else if (typeof temp[i] == "undefined") {
                                    // create missing option section
                                    console.log("Creating missing option section: " + i);
                                    temp[i] = this.saveObj[i];
                                }
                            }
                            this.saveObj = temp;
                            this.saveData();
                        }
                    },
                    saveData: function () {
                        var obj = this.saveObj || window.TACS.getInstance().saveObj;
                        var str = JSON.stringify(obj);
                        localStorage.setItem("TACS", str);
                    },
                    initialize: function () {
                        try {
                            this.loadData();
                            locale = ClientLib.Config.Main.GetInstance().GetConfig(ClientLib.Config.Main.CONFIG_LANGUAGE);
                            this.targetCityId = "0";
                            // Store references
                            this._Application = qx.core.Init.getApplication();
                            this._MainData = ClientLib.Data.MainData.GetInstance();
                            this._VisMain = ClientLib.Vis.VisMain.GetInstance();
                            this._ActiveView = this._VisMain.GetActiveView();
                            this._PlayArea = this._Application.getPlayArea();
                            this._PlayAreaHUD = this._Application.getPlayArea().getHUD();
                            this.ArmySetupAttackBar = this._Application.getArmySetupAttackBar();
                            this._armyBar = this._Application.getUIItem(ClientLib.Data.Missions.PATH.BAR_ATTACKSETUP);
                            // Just some shortcuts by Netquik
                            this.ArmySetupAttackBarMainChildren = this._armyBar.getChildren();
                            this.ArmySetupAttackBarChildren = this.ArmySetupAttackBar.getChildren();
                            this._playAreaChildren = this._PlayArea.getChildren();
                            this.MainOverlay = this._Application.getMainOverlay();

                            //MOD New Play Button Icon Selector
                            this.ReplayBar = this._Application.getReportReplayOverlay();
                            var PBIS_S = webfrontend.gui.reports.ReportReplayOverlay.$$original.toString(); //GameVersion
                            var PBIS_M = PBIS_S.match(/this\.[_a-zA-Z]+,this\);this.+this\.([_a-zA-Z]+)\.addListener\([a-z],this\.([_a-zA-Z]+),this\);this.+this\.[_a-zA-Z]+,this\);this\.([_a-zA-Z]+)\.addListener\([a-z]/);
                            "object" == typeof this.ReplayBar[PBIS_M[1]] && "btn_play" == this.ReplayBar[PBIS_M[1]].objid && (this.PBIS = PBIS_M[1]);
                            "object" == typeof this.ReplayBar[PBIS_M[3]] && "btn_skip" == this.ReplayBar[PBIS_M[3]].objid && (this.PBIS_SK = PBIS_M[3]);
                            // MOD 22.3 - 1
                            PBIS_M = webfrontend.gui.reports.ReportReplayOverlay.prototype[PBIS_M[2]].toString().match(/(?:if\(|,)this\.([_a-zA-Z]+)\){this\.[_a-zA-Z]+\((?:false|!1)\).+this\.([_a-zA-Z]+)\.setValue/);
                            "boolean" == typeof this.ReplayBar[PBIS_M[1]] && (this.PBIS_S = PBIS_M[1]);
                            "object" == typeof this.ReplayBar[PBIS_M[2]] && "lbl_speed" == this.ReplayBar[PBIS_M[2]].objid && (this.PBIS_L = PBIS_M[2]);
                            //MOD New Autoscroll Button Selector
                            var ABS_S = webfrontend.gui.PlayArea.PlayAreaHUD.$$original.toString();//GameVersion
                            var ABS_M = ABS_S.match(/COMBATAUTOSCROLL\),10\)==1;this\.([_a-zA-Z]+)=/);
                            "object" == typeof this._PlayAreaHUD[ABS_M[1]] && (this.ABS_B = ABS_M[1]);

                            if (PerforceChangelist >= 443425) { // 16.1 patch
                                for (var i in this.ArmySetupAttackBar) {
                                    if (typeof this.ArmySetupAttackBar[i] == "object" && this.ArmySetupAttackBar[i] != null) {
                                        if (this.ArmySetupAttackBar[i].objid == "btn_disable") {
                                            console.log(this.ArmySetupAttackBar[i].objid);
                                            var nativeSimBarDisableButton = this.ArmySetupAttackBar[i];
                                        }
                                        if (this.ArmySetupAttackBar[i].objid == "cnt_controls" || this.ArmySetupAttackBar[i].objid == "btn_toggle") {
                                            this.ArmySetupAttackBar[i].setVisibility("excluded");
                                        }
                                    }
                                }

                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "pane-armysetup-right") {
                                        //console.log(this.ArmySetupAttackBarMainChildren[i].$$user_decorator)
                                        this.armySetupRight = this.ArmySetupAttackBarMainChildren[i];
                                        this.armySetupRight.removeAt(1);
                                        this.armySetupRight.addAt(nativeSimBarDisableButton, 1);
                                        break;
                                    }
                                }
                            }
                            // Fix Defense Bonus Rounding
                            // MOD NOEVIL 2 by NetquiK
                            /* for (var key in ClientLib.Data.City.prototype) {
                                if (typeof ClientLib.Data.City.prototype[key] === 'function') {
                                    var strFunction = ClientLib.Data.City.prototype[key].toString();
                                    if (strFunction.indexOf("Math.floor(a.adb)") > -1) {
                                        //ClientLib.Data.City.prototype[key] = this.fixBonusRounding(ClientLib.Data.City.prototype[key], "a");
                                        var UCMa = key;
                                        break;
                                    }
                                }
                            } */
                            var updatecitys = ClientLib.Data.Cities.prototype.UpdateCity.toString();
                            // MOD 22.3-4
                            var UCM = updatecitys.match(/(?:}}|,)[a-z]\.([A-Z]{6})\([a-z]\);/);
                            var UCMe = ClientLib.Data.City.prototype[UCM[1]].toString().match(/this\.([A-Z]{6})=Math.floor/);
                            ClientLib.Data.City.prototype['_' + UCM[1]] = ClientLib.Data.City.prototype[UCM[1]]
                            ClientLib.Data.City.prototype[UCM[1]] = function (a) {
                                this['_' + UCM[1]](a);
                                this[UCMe[1]] = Math.round(a.adb);
                            }

                            this.ArmySetupAttackBarMainChildren[0].setMarginTop(40); // NOTE Resizing ArmySetup for topbuttons remove
                            //this.ArmySetupAttackBarChildren[1].setOpacity(0.4); //  setting opacity to next setup
                            //this.ArmySetupAttackBarChildren[1].setVisibility("hidden"); // REVIEW   setting hidden to next setup 
                            this.ArmySetupAttackBar.removeAt(1); // removing Next Army Setup msg

                            // MOD NEW PATCH for moving Map (adjusted for 20.1 Patch)
                            var source = ClientLib.Vis.VisMain.GetInstance().get_CombatSetup().get_MinYPosition.toString();
                            // MOD Fix1 for 22.2 Patch
                            // MOD 22.3 - 2
                            var CombatMinY = source.match(/return {0,1}\(?\$I\.([A-Z]{6})\.([A-Z]{6})-/);
                            if (typeof $I[CombatMinY[1]] === "function") $I[CombatMinY[1]][CombatMinY[2]] = -178;

                            if (PerforceChangelist >= 472233) { // NOTE  20.2 patch RETRO
                                this.COMBATEXTENDEDSETUP = webfrontend.phe.cnc.Util.getConfigBoolean(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP);
                                if (this.COMBATEXTENDEDSETUP === false) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, true);
                                    this.ArmySetupAttackBar.showSetup(true);
                                }
                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "bg-armysetup-top") {
                                        console.log('armysetup-top detected! : ArmySetupAttackBarMainChildren at ' + i);
                                        this._armyBar.addAt(this.ArmySetupAttackBarMainChildren[i], 3);
                                        break;

                                    }
                                    //var patch211body = patch211.substring(patch211.indexOf('{') + 1, patch211.lastIndexOf('}'));
                                    var source = this.ArmySetupAttackBar.showSetup.toString();
                                    // MOD 22.3-3
                                    var extendsetupF = source.match(/[,;]this\.([A-Za-z_]+)\(\).this\.show/)[1];
                                    // MOD NOEVIL 1 by NetquiK
                                    this.ArmySetupAttackBar[extendsetupF] = function () {
                                        return;
                                    }
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, this.COMBATEXTENDEDSETUP);
                                    this.ArmySetupAttackBar.showSetup(false);

                                }
                            }

                            this.ArmySetupAttackBarMainChildren[3].exclude(); // NOTE TACS doesn't need newtopButtons
                            console.log('armysetup-top excluded');


                            // REVIEW adjusting rightbar and set left hidden
                            // by Netquik 

                            this.ArmySetupAttackBarMainChildren[2].setVisibility("hidden");
                            this.armySetupRight.resetDecorator();
                            this.armySetupRight.set({
                                paddingTop: 8,
                                marginTop: 40,
                                paddingLeft: 20,
                                paddingRight: 10,
                                zIndex: 12
                            });



                            // Event Handlers
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.API.Battleground.GetInstance(), "OnSimulateBattleFinished", ClientLib.API.OnSimulateBattleFinished, this, this.onSimulateBattleFinishedEvent);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.API.Battleground.GetInstance(), "OnSimulateCombatReport", ClientLib.API.OnSimulateCombatReport, this, this.OnSimulateCombatReportEvent);
                            webfrontend.phe.cnc.Util.attachNetEvent(this._VisMain, "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this.viewChangeHandler);
                            webfrontend.phe.cnc.Util.attachNetEvent(this._MainData.get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.ownCityChangeHandler);
                            // Setup Button
                            //MOD Original Style Buttons
                            this.buttons.simulate.back = new qx.ui.form.Button();
                            this.buttons.simulate.back.set({
                                width: 48,
                                height: 48,
                                appearance: "button-addpoints",
                                toolTipText: this._Application.tr("tnf:tt replay back button"),
                                icon: "FactionUI/icons/icon_return.png",
                                appearance: "button-friendlist-scroll"
                            });
                            this.buttons.simulate.back.addListener("click", this.returnSetup, this);
                            // Skip to end Button 
                            this.buttons.simulate.skip = new qx.ui.form.Button();
                            this.buttons.simulate.skip.set({
                                width: 35,
                                height: 24,
                                appearance: "button-addpoints",
                                icon: "FactionUI/icons/icon_replay_skip.png",
                                toolTipText: this._Application.tr("tnf:tt replay skip"),
                                appearance: "button-friendlist-scroll"
                            });
                            this.buttons.simulate.skip.addListener("click", this.skipSimulation, this);
                            var replayBar = this._Application.getReportReplayOverlay();
                            //MOD close statbox for simple replays 
                            replayBar.addListener("appear", this.onAppear_replayBar, this);
                            replayBar.add(this.buttons.simulate.back, {
                                top: 11,
                                left: 346
                            });

                            if (typeof (CCTAWrapper_IsInstalled) != 'undefined' && CCTAWrapper_IsInstalled) {
                                replayBar.add(this.buttons.simulate.skip, {
                                    top: 21,
                                    left: 665
                                });
                            }

                            // Unlock Button
                            this.buttons.attack.unlock = new qx.ui.form.Button(lang("Unlock"));
                            this.buttons.attack.unlock.set({
                                width: 54,
                                height: 37,
                                padding: 0,
                                appearance: "button-text-small",
                                toolTipText: lang("Unlock Attack Button"),
                                zIndex: 12
                            });
                            this.buttons.attack.unlock.addListener("click", this.unlockAttacks, this);
                            this.buttons.attack.unlock.setOpacity(0.5);
                            var temp = localStorage.ta_sim_attackLock;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_attackLock);
                            } else {
                                temp = true;
                            }
                            if (temp) {
                                this._armyBar.add(this.buttons.attack.unlock, {
                                    top: 148,
                                    right: 10
                                });
                            }
                            // Unlock Repair
                            this.buttons.attack.repair = new qx.ui.form.Button(lang("Unlock"));
                            this.buttons.attack.repair.set({
                                width: 54,
                                height: 44,
                                padding: 0,
                                appearance: "button-text-small",
                                toolTipText: lang("Unlock Repair Button"),
                                zIndex: 12
                            });
                            this.buttons.attack.repair.addListener("click", this.unlockRepairs, this);
                            this.buttons.attack.repair.setOpacity(0.5);
                            var temp = localStorage.ta_sim_repairLock;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_repairLock);
                            } else {
                                temp = true;
                            }
                            if (temp) {
                                this._armyBar.add(this.buttons.attack.repair, {
                                    top: 63,
                                    right: 10
                                });
                            }
                            var battleUnitData = ClientLib.Data.CityPreArmyUnit.prototype;
                            if (!battleUnitData.set_Enabled_Original) {
                                battleUnitData.set_Enabled_Original = battleUnitData.set_Enabled;
                            }
                            battleUnitData.set_Enabled = function (a) {
                                this.set_Enabled_Original(a);
                                window.TACS.getInstance().formationChangeHandler();
                            };
                            if (!battleUnitData.MoveBattleUnit_Original) {
                                battleUnitData.MoveBattleUnit_Original = battleUnitData.MoveBattleUnit;
                            }
                            battleUnitData.MoveBattleUnit = function (a, b) {
                                var _this = window.TACS.getInstance();
                                if (_this.options.dblClick2DeActivate.getValue()) {
                                    if (_this.armybarClickCount >= 2) {
                                        if (this.get_CoordX() === a && this.get_CoordY() === b) {
                                            var enabledState = this.get_Enabled();
                                            enabledState ^= true;
                                            this.set_Enabled_Original(enabledState);
                                        }
                                    }
                                }
                                this.MoveBattleUnit_Original(a, b);
                                _this.formationChangeHandler();
                                _this.armybarClickCount = 0;
                                clearInterval(_this.armybarClearnClickCounter);
                            };
                            this.loadLayouts();
                            // The Options Window
                            this.optionsWindow = new qx.ui.window.Window(lang("Options"), "FactionUI/icons/icon_forum_properties.png").set({
                                contentPaddingTop: 1,
                                contentPaddingBottom: 8,
                                contentPaddingRight: 8,
                                contentPaddingLeft: 8,
                                //width : 400,
                                height: 400,
                                showMaximize: false,
                                showMinimize: false,
                                allowMaximize: false,
                                allowMinimize: false,
                                resizable: false
                            });
                            this.optionsWindow.getChildControl("icon").set({
                                scale: true,
                                width: 25,
                                height: 25
                            });
                            this.optionsWindow.setLayout(new qx.ui.layout.VBox());
                            var optionsWindowTop = localStorage.ta_sim_options_top;
                            if (optionsWindowTop) {
                                optionsWindowTop = JSON.parse(localStorage.ta_sim_options_top);
                                var optionsWindowLeft = JSON.parse(localStorage.ta_sim_options_left);
                                this.optionsWindow.moveTo(optionsWindowLeft, optionsWindowTop);
                            } else {
                                this.optionsWindow.center();
                            }
                            this.optionsWindow.addListener("close", function () {
                                localStorage.ta_sim_options_top = JSON.stringify(this.optionsWindow.getLayoutProperties().top);
                                localStorage.ta_sim_options_left = JSON.stringify(this.optionsWindow.getLayoutProperties().left);
                                this.saveData();
                            }, this);
                            // Resource Layout Window
                            this.resourceLayoutWindow = new qx.ui.window.Window().set({
                                contentPaddingTop: 1,
                                contentPaddingBottom: 8,
                                contentPaddingRight: 8,
                                contentPaddingLeft: 8,
                                width: 185,
                                showMaximize: false,
                                showMinimize: false,
                                allowMaximize: false,
                                allowMinimize: false,
                                resizable: false
                            });
                            /*this.resourceLayoutWindow.getChildControl("icon").set({
                            								scale : true,
                            								width : 25,
                            								height : 25
                            							});*/
                            this.resourceLayoutWindow.setLayout(new qx.ui.layout.HBox());
                            this.resourceLayoutWindow.moveTo(this.saveObj.bounds.resourceLayoutWindowLeft, this.saveObj.bounds.resourceLayoutWindowTop);
                            this.resourceLayoutWindow.addListener("move", function () {
                                this.saveObj.bounds.resourceLayoutWindowLeft = this.resourceLayoutWindow.getBounds().left;
                                this.saveObj.bounds.resourceLayoutWindowTop = this.resourceLayoutWindow.getBounds().top;
                                this.saveData();
                            }, this);
                            this.resourceLayoutWindow.addListener("close", function () {
                                localStorage.ta_sim_layout_top = JSON.stringify(this.resourceLayoutWindow.getLayoutProperties().top);
                                localStorage.ta_sim_layout_left = JSON.stringify(this.resourceLayoutWindow.getLayoutProperties().left);
                            }, this);
                            // The Battle Simulator box
                            this.battleResultsBox = new qx.ui.window.Window("TACS", "FactionUI/icons/icon_res_plinfo_command_points.png").set({
                                contentPaddingTop: 0,
                                contentPaddingBottom: 2,
                                contentPaddingRight: 2,
                                contentPaddingLeft: 6,
                                width: 245,
                                showMaximize: false,
                                showMinimize: false,
                                allowMaximize: false,
                                allowMinimize: false,
                                resizable: false
                            });
                            this.battleResultsBox.getChildControl("icon").set({
                                scale: true,
                                width: 20,
                                height: 20,
                                alignY: "middle"
                            });
                            this.battleResultsBox.setLayout(new qx.ui.layout.HBox());
                            this.battleResultsBox.moveTo(this.saveObj.bounds.battleResultsBoxLeft, this.saveObj.bounds.battleResultsBoxTop);
                            this.battleResultsBox.addListener("move", function () {
                                this.saveObj.bounds.battleResultsBoxLeft = this.battleResultsBox.getBounds().left;
                                this.saveObj.bounds.battleResultsBoxTop = this.battleResultsBox.getBounds().top;
                                this.saveData();
                            }, this);
                            this.battleResultsBox.addListener("appear", function () {
                                this.battleResultsBox.setOpacity(this.saveObj.slider.statsOpacity / 100);
                            }, this);
                            var tabView = new qx.ui.tabview.TabView().set({
                                contentPaddingTop: 3,
                                width: 255,
                                contentPaddingBottom: 6,
                                contentPaddingRight: 7,
                                contentPaddingLeft: 3
                            });
                            this.battleResultsBox.add(tabView);
                            this.initializeStats(tabView);
                            this.initializeLayout(tabView);
                            this.initializeInfo(tabView);
                            this.initializeOptions();
                            this.setupInterface();
                            this.createHasAttackFormationFunction();
                            this.createBasePlateFunction(ClientLib.Vis.Region.RegionNPCCamp);
                            this.createBasePlateFunction(ClientLib.Vis.Region.RegionNPCBase);
                            this.createBasePlateFunction(ClientLib.Vis.Region.RegionCity);
                            // Fix armyBar container divs, the mouse has a horrible offset in the armybar when this is enabled
                            // if this worked it would essentially fix a layout bug, shame... using zIndex instead
                            // Abort, Retry, Fail?
                            /*
                            							this._armyBar.getLayoutParent().getContentElement().getParent().setStyles({
                            							height : "155px"
                            							});
                            							this._armyBar.getLayoutParent().getContentElement().setStyles({
                            							height : "155px"
                            							});
                            							this._armyBar.getLayoutParent().setLayoutProperties({
                            							bottom : 0
                            							});
                            							this._armyBar.getLayoutParent().setHeight(155);
                            							this._armyBar.setLayoutProperties({
                            							top : -5
                            							});
                            							 */
                            // putting overlays in front so we have 19 layers to work with behind them
                            // zIndex 5 is reserved for Shiva
                            this.gameOverlaysToFront();
                        } catch (e) {
                            console.log(e);
                        }
                    },

                    /* fixBonusRounding: function (bonus, data) {
                        try {
                            if (data == null) data = "";
                            var strFunction = bonus.toString();
                            strFunction = strFunction.replace("floor", "round");
                            var functionBody = strFunction.substring(strFunction.indexOf("{") + 1, strFunction.lastIndexOf("}"));
                            var fn = Evil(data, functionBody);
                            return fn;
                        } catch (e) {
                            console.log("fixBonusRounding error: ", e);
                        }
                    }, */
                    initializeStats: function (tabView) {
                        try {
                            ////////////////// Stats ////////////////////
                            this.statsPage = new qx.ui.tabview.Page(lang("Stats"));
                            this.statsPage.setLayout(new qx.ui.layout.VBox(1));
                            tabView.add(this.statsPage);
                            // Refresh Vertical Box
                            var container = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(0, "left", "middle");
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnFlex(0, 1);
                            layout.setRowHeight(0, 22);
                            container.setLayout(layout);
                            container.setThemedFont("bold");
                            container.setThemedBackgroundColor("#eef");
                            this.statsPage.add(container);
                            // Countdown for next refresh
                            this.labels.countDown = new qx.ui.basic.Label("");
                            this.labels.countDown.set({
                                width: 0,
                                height: 10,
                                marginLeft: 5,
                                backgroundColor: "#B40404"
                            });
                            container.add(this.labels.countDown, {
                                row: 0,
                                column: 0
                            });
                            this.buttons.attack.refreshStats = new qx.ui.form.Button(lang("Refresh"));
                            this.buttons.attack.refreshStats.set({
                                width: 90,
                                height: 21,
                                appearance: "button-text-small",
                                toolTipText: lang("Refresh Stats")
                            });
                            this.buttons.attack.refreshStats.addListener("click", this.refreshStatistics, this);
                            container.add(this.buttons.attack.refreshStats, {
                                row: 0,
                                column: 1
                            });
                            // The Enemy Vertical Box
                            var container = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnFlex(0, 1);
                            container.setLayout(layout);
                            container.setThemedFont("bold");
                            container.setThemedBackgroundColor("#eef");
                            this.statsPage.add(container);
                            // The Enemy Troop Strength Label
                            container.add(new qx.ui.basic.Label(lang("Enemy Base:")), {
                                row: 0,
                                column: 0
                            });
                            this.labels.damage.overall = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.overall, {
                                row: 0,
                                column: 1
                            });
                            // Units
                            container.add(new qx.ui.basic.Label(lang("Defences:")), {
                                row: 1,
                                column: 0
                            });
                            this.labels.damage.units.overall = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.units.overall, {
                                row: 1,
                                column: 1
                            });
                            // Buildings
                            container.add(new qx.ui.basic.Label(lang("Buildings:")), {
                                row: 2,
                                column: 0
                            });
                            this.labels.damage.structures.overall = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.structures.overall, {
                                row: 2,
                                column: 1
                            });
                            // Command Center
                            container.add(new qx.ui.basic.Label(lang("Construction Yard:")), {
                                row: 3,
                                column: 0
                            });
                            this.labels.damage.structures.construction = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.structures.construction, {
                                row: 3,
                                column: 1
                            });
                            // Defense Facility
                            container.add(new qx.ui.basic.Label(lang("Defense Facility:")), {
                                row: 4,
                                column: 0
                            });
                            this.labels.damage.structures.defense = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.structures.defense, {
                                row: 4,
                                column: 1
                            });
                            // Command Center
                            container.add(new qx.ui.basic.Label(lang("Command Center:")), {
                                row: 5,
                                column: 0
                            });
                            this.labels.damage.structures.command = new qx.ui.basic.Label("100");
                            container.add(this.labels.damage.structures.command, {
                                row: 5,
                                column: 1
                            });
                            // The Support Horizontal Box
                            this.labels.supportLevel = new qx.ui.basic.Label("");
                            container.add(this.labels.supportLevel, {
                                row: 6,
                                column: 0
                            });
                            this.labels.damage.structures.support = new qx.ui.basic.Label("");
                            container.add(this.labels.damage.structures.support, {
                                row: 6,
                                column: 1
                            });
                            // The Troops Vertical Box
                            container = new qx.ui.container.Composite();
                            layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnFlex(0, 1);
                            container.setLayout(layout);
                            container.setThemedFont("bold");
                            container.setThemedBackgroundColor("#eef");
                            this.statsPage.add(container);
                            // The Troop Strength Label
                            container.add(new qx.ui.basic.Label(lang("Overall:")), {
                                row: 0,
                                column: 0
                            });
                            this.labels.health.overall = new qx.ui.basic.Label("100");
                            container.add(this.labels.health.overall, {
                                row: 0,
                                column: 1
                            });
                            // The Infantry Troop Strength Label
                            container.add(new qx.ui.basic.Label(lang("Infantry:")), {
                                row: 1,
                                column: 0
                            });
                            this.labels.health.infantry = new qx.ui.basic.Label("100");
                            container.add(this.labels.health.infantry, {
                                row: 1,
                                column: 1
                            });
                            // The Vehicle Troop Strength Label
                            container.add(new qx.ui.basic.Label(lang("Vehicle:")), {
                                row: 2,
                                column: 0
                            });
                            this.labels.health.vehicle = new qx.ui.basic.Label("100");
                            container.add(this.labels.health.vehicle, {
                                row: 2,
                                column: 1
                            });
                            // The Air Troop Strength Label
                            container.add(new qx.ui.basic.Label(lang("Aircraft:")), {
                                row: 3,
                                column: 0
                            });
                            this.labels.health.aircraft = new qx.ui.basic.Label("100");
                            container.add(this.labels.health.aircraft, {
                                row: 3,
                                column: 1
                            });
                            // The inner Vertical Box
                            container = new qx.ui.container.Composite();
                            layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnFlex(0, 1);
                            container.setLayout(layout);
                            container.setThemedFont("bold");
                            container.setThemedBackgroundColor("#eef");
                            this.statsPage.add(container);
                            // The Victory Label
                            container.add(new qx.ui.basic.Label(lang("Outcome:")), {
                                row: 0,
                                column: 0
                            });
                            this.labels.damage.outcome = new qx.ui.basic.Label(lang("Unknown"));
                            container.add(this.labels.damage.outcome, {
                                row: 0,
                                column: 1
                            });
                            // The Battle Time Label
                            container.add(new qx.ui.basic.Label(lang("Battle Time:")), {
                                row: 1,
                                column: 0
                            });
                            this.labels.time = new qx.ui.basic.Label("120");
                            container.add(this.labels.time, {
                                row: 1,
                                column: 1
                            });
                            // Available RT/Attacks Vertical Box
                            container = new qx.ui.container.Composite();
                            layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnFlex(0, 1);
                            container.setLayout(layout);
                            container.setThemedFont("bold");
                            container.setThemedBackgroundColor("#eef");
                            this.statsPage.add(container);
                            // Available Repair Time Label
                            container.add(new qx.ui.basic.Label(lang("Available Repair:")), {
                                row: 0,
                                column: 0
                            });
                            this.labels.repair.available = new qx.ui.basic.Label("00:00:00");
                            container.add(this.labels.repair.available, {
                                row: 0,
                                column: 1
                            });
                            // Available Attacks Label
                            container.add(new qx.ui.basic.Label(lang("Available Attacks:")), {
                                row: 1,
                                column: 0
                            });
                            this.labels.attacks.available = new qx.ui.basic.Label("CP:- / FR:- / CFR:-");
                            container.add(this.labels.attacks.available, {
                                row: 1,
                                column: 1
                            });
                            // Resource Summary Vertical Box
                            this.resourceSummaryVerticalBox = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(1, "right", "middle");
                            layout.setColumnWidth(0, 90);
                            this.resourceSummaryVerticalBox.setLayout(layout);
                            this.resourceSummaryVerticalBox.setThemedFont("bold");
                            this.resourceSummaryVerticalBox.setThemedBackgroundColor("#eef");
                            if (this.saveObj.checkbox.showLootSummary) {
                                this.statsPage.add(this.resourceSummaryVerticalBox);
                            }
                            // Research Icon/Label
                            this.labels.resourcesummary.research = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_research_mission.png");
                            this.resourceSummaryVerticalBox.add(this.labels.resourcesummary.research, {
                                row: 0,
                                column: 0
                            });
                            // Tiberium Icon/Label
                            this.labels.resourcesummary.tiberium = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_tiberium.png");
                            this.resourceSummaryVerticalBox.add(this.labels.resourcesummary.tiberium, {
                                row: 0,
                                column: 1
                            });
                            // Credits Icon/Label
                            this.labels.resourcesummary.credits = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_dollar.png");
                            this.resourceSummaryVerticalBox.add(this.labels.resourcesummary.credits, {
                                row: 1,
                                column: 0
                            });
                            // Crystal Icon/Label
                            this.labels.resourcesummary.crystal = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_chrystal.png");
                            this.resourceSummaryVerticalBox.add(this.labels.resourcesummary.crystal, {
                                row: 1,
                                column: 1
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    initializeLayout: function (tabView) {
                        try {
                            ////////////////// Layouts ////////////////////
                            var layoutPage = new qx.ui.tabview.Page(lang("Layouts"));
                            layoutPage.setLayout(new qx.ui.layout.VBox());
                            tabView.add(layoutPage);
                            this.layouts.list = new qx.ui.form.List();
                            this.layouts.list.set({
                                height: 174,
                                selectionMode: "one"
                            });
                            layoutPage.add(this.layouts.list);
                            // Add the two buttons for save and load
                            var layHBox = new qx.ui.container.Composite();
                            layHBox.setLayout(new qx.ui.layout.HBox(5));
                            // Load button
                            this.buttons.attack.layout.load = new qx.ui.form.Button(lang("Load"));
                            this.buttons.attack.layout.load.set({
                                width: 80,
                                appearance: "button-text-small",
                                toolTipText: lang("Load this saved layout.")
                            });
                            this.buttons.attack.layout.load.addListener("click", this.loadCityLayout, this);
                            layHBox.add(this.buttons.attack.layout.load);
                            // Delete button
                            this.buttonLayoutDelete = new qx.ui.form.Button(lang("Delete"));
                            this.buttonLayoutDelete.set({
                                width: 80,
                                appearance: "button-text-small",
                                toolTipText: lang("Delete this saved layout.")
                            });
                            this.buttonLayoutDelete.addListener("click", this.deleteCityLayout, this);
                            layHBox.add(this.buttonLayoutDelete);
                            layoutPage.add(layHBox);
                            var layVBox = new qx.ui.container.Composite();
                            layVBox.setLayout(new qx.ui.layout.VBox(1));
                            layVBox.setThemedFont("bold");
                            layVBox.setThemedPadding(2);
                            layVBox.setThemedBackgroundColor("#eef");
                            // The Label Textbox
                            var layHBox2 = new qx.ui.container.Composite();
                            layHBox2.setLayout(new qx.ui.layout.HBox(5));
                            layHBox2.add(new qx.ui.basic.Label(lang("Name: ")));
                            this.layouts.label = new qx.ui.form.TextField();
                            this.layouts.label.setValue("");
                            layHBox2.add(this.layouts.label);
                            layVBox.add(layHBox2);
                            // Save Button
                            this.buttons.attack.layout.save = new qx.ui.form.Button(lang("Save"));
                            this.buttons.attack.layout.save.set({
                                width: 80,
                                appearance: "button-text-small",
                                toolTipText: lang("Save this layout.")
                            });
                            this.buttons.attack.layout.save.addListener("click", this.saveCityLayout, this);
                            layVBox.add(this.buttons.attack.layout.save);
                            layoutPage.add(layVBox);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    initializeInfo: function (tabView) {
                        try {
                            ////////////////// Info ////////////////////
                            var infoPage = new qx.ui.tabview.Page(lang("Info"));
                            infoPage.setLayout(new qx.ui.layout.VBox(1));
                            tabView.add(infoPage);
                            // The Help Vertical Box
                            var pVBox = new qx.ui.container.Composite();
                            pVBox.setLayout(new qx.ui.layout.VBox(1));
                            pVBox.setThemedFont("bold");
                            pVBox.setThemedPadding(2);
                            pVBox.setThemedBackgroundColor("#eef");
                            infoPage.add(pVBox);
                            var proHelpBar = new qx.ui.basic.Label().set({
                                value: "<a target='_blank' href='http://cncscripts.com/'>cncscripts.com</a>",
                                rich: true
                            });
                            pVBox.add(proHelpBar);
                            // The Spoils
                            var psVBox = new qx.ui.container.Composite();
                            psVBox.setLayout(new qx.ui.layout.VBox(1));
                            psVBox.setThemedFont("bold");
                            psVBox.setThemedPadding(2);
                            psVBox.setThemedBackgroundColor("#eef");
                            infoPage.add(psVBox);
                            psVBox.add(new qx.ui.basic.Label(lang("Spoils")));
                            // Tiberium
                            this.stats.spoils.tiberium = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_tiberium.png");
                            psVBox.add(this.stats.spoils.tiberium);
                            // Crystal
                            this.stats.spoils.crystal = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_chrystal.png");
                            psVBox.add(this.stats.spoils.crystal);
                            // Credits
                            this.stats.spoils.credit = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_dollar.png");
                            psVBox.add(this.stats.spoils.credit);
                            // Research
                            this.stats.spoils.research = new qx.ui.basic.Atom("0", "webfrontend/ui/common/icn_res_research_mission.png");
                            psVBox.add(this.stats.spoils.research);
                            // Options Page
                            var pssVBox = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid();
                            //layout.setColumnFlex(2, 1);
                            pssVBox.setLayout(layout);
                            pssVBox.setThemedFont("bold");
                            pssVBox.setThemedBackgroundColor("#eef");
                            infoPage.add(pssVBox);
                            this.buttons.optionStats = new qx.ui.form.Button().set({
                                height: 25,
                                width: 160,
                                margin: 15,
                                alignX: "center",
                                label: lang("Options"),
                                appearance: "button-text-small",
                                icon: "FactionUI/icons/icon_forum_properties.png",
                                toolTipText: lang("TACS Options")
                            });
                            this.buttons.optionStats.addListener("click", this.toggleOptionsWindow, this);
                            pssVBox.add(this.buttons.optionStats, {
                                row: 0,
                                column: 0
                            });
                            /*
                            							// Popup Checkbox
                            							this.options.autoDisplayStats = new qx.ui.form.CheckBox(lang("Auto display this box"));
                            							var temp = localStorage.ta_sim_autoDisplayStats;
                            							if (temp) {
                            							temp = JSON.parse(localStorage.ta_sim_autoDisplayStats);
                            							this.options.autoDisplayStats.setValue(temp);
                            							} else {
                            							this.options.autoDisplayStats.setValue(true);
                            							}
                            							this.options.autoDisplayStats.addListener("click", this.optionPopup, this);
                            							pssVBox.add(this.options.autoDisplayStats, {
                            							row: 1,
                            							column: 0,
                            							colSpan: 3
                            							});
                            							// showShift Checkbox
                            							this.options.showShift = new qx.ui.form.CheckBox(lang("Show shift buttons"));
                            							var temp = localStorage.ta_sim_showShift;
                            							if (temp) {
                            							temp = JSON.parse(localStorage.ta_sim_showShift);
                            							this.options.showShift.setValue(temp);
                            							} else {
                            							this.options.showShift.setValue(true);
                            							}
                            							this.options.showShift.addListener("click", this.optionShowShift, this);
                            							pssVBox.add(this.options.showShift, {
                            							row: 3,
                            							column: 0,
                            							colSpan: 3
                            							});
                            							// side RadioButtons
                            							this.options.sideLabel = new qx.ui.basic.Label(lang("Side:"));
                            							this.options.leftSide = new qx.ui.form.RadioButton(lang("Left"));
                            							this.options.rightSide = new qx.ui.form.RadioButton(lang("Right"));
                            							var sideRadioGroup = new qx.ui.form.RadioGroup();
                            							sideRadioGroup.add(this.options.leftSide, this.options.rightSide);
                            							var temp = localStorage.ta_sim_side;
                            							if (temp) {
                            							temp = JSON.parse(localStorage.ta_sim_side);
                            							this.options.rightSide.setValue(temp);
                            							} else {
                            							this.options.rightSide.setValue(true);
                            							}
                            							sideRadioGroup.addListener("changeSelection", this.setupInterface, this);
                            							pssVBox.add(this.options.sideLabel, {
                            							row: 4,
                            							column: 0
                            							});
                            							pssVBox.add(this.options.leftSide, {
                            							row: 4,
                            							column: 1
                            							});
                            							pssVBox.add(this.options.rightSide, {
                            							row: 4,
                            							column: 2
                            							});
                            							// locks Checkboxes
                            							this.options.locksLabel = new qx.ui.basic.Label(lang("Locks:"));
                            							this.options.attackLock = new qx.ui.form.CheckBox(lang("Attack"));
                            							var temp = localStorage.ta_sim_attackLock;
                            							if (temp) {
                            							temp = JSON.parse(localStorage.ta_sim_attackLock);
                            							this.options.attackLock.setValue(temp);
                            							} else {
                            							this.options.attackLock.setValue(true);
                            							}
                            							this.options.repairLock = new qx.ui.form.CheckBox(lang("Repair"));
                            							var temp = localStorage.ta_sim_repairLock;
                            							if (temp) {
                            							temp = JSON.parse(localStorage.ta_sim_repairLock);
                            							this.options.repairLock.setValue(temp);
                            							} else {
                            							this.options.repairLock.setValue(true);
                            							}
                            							this.options.attackLock.addListener("click", this.optionAttackLock, this);
                            							this.options.repairLock.addListener("click", this.optionRepairLock, this);
                            							pssVBox.add(this.options.locksLabel, {
                            							row: 5,
                            							column: 0
                            							});
                            							pssVBox.add(this.options.attackLock, {
                            							row: 5,
                            							column: 1
                            							});
                            							pssVBox.add(this.options.repairLock, {
                            							row: 5,
                            							column: 2
                            							});*/
                            this.battleResultsBox.add(tabView);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    initializeOptions: function () {
                        try {
                            var options = new qx.ui.container.Composite(); //hello
                            options.setLayout(new qx.ui.layout.VBox(1)); //hey
                            options.setThemedPadding(10);
                            options.setThemedBackgroundColor("#eef");
                            this.optionsWindow.add(options);
                            // Options Page
                            var pssVBox = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid(5, 5);
                            layout.setColumnFlex(2, 1);
                            pssVBox.setLayout(layout);
                            pssVBox.setThemedFont("bold");
                            pssVBox.setThemedBackgroundColor("#eef");
                            options.add(pssVBox);
                            window.TACS_version = (window.TACS_version === undefined) ? "Script Pack Version" : window.TACS_version;
                            pssVBox.add(new qx.ui.basic.Label(lang("Version: ") + window.TACS_version), {
                                row: 0,
                                column: 0,
                                colSpan: 3
                            });
                            // Popup Checkbox
                            this.options.autoDisplayStats = new qx.ui.form.CheckBox(lang("Auto display stats"));
                            var temp = localStorage.ta_sim_popup;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_popup);
                                this.options.autoDisplayStats.setValue(temp);
                            } else {
                                this.options.autoDisplayStats.setValue(true);
                            }
                            this.options.autoDisplayStats.addListener("click", this.optionPopup, this);
                            pssVBox.add(this.options.autoDisplayStats, {
                                row: 1,
                                column: 0,
                                colSpan: 3
                            });
                            // Mark Saved Targets Checkbox
                            this.options.markSavedTargets = new qx.ui.form.CheckBox(lang("Mark saved targets on region map"));
                            var temp = localStorage.ta_sim_marksavedtargets;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_marksavedtargets);
                                this.options.markSavedTargets.setValue(temp);
                            } else {
                                this.options.markSavedTargets.setValue(true);
                            }
                            this.options.markSavedTargets.addListener("click", function () {
                                localStorage.ta_sim_marksavedtargets = JSON.stringify(this.options.markSavedTargets.getValue());
                            }, this);
                            pssVBox.add(this.options.markSavedTargets, {
                                row: 2,
                                column: 0,
                                colSpan: 3
                            });
                            // Double-click to (De)activate Checkbox
                            this.options.dblClick2DeActivate = new qx.ui.form.CheckBox(lang("Enable 'Double-click to (De)activate units'"));
                            var temp = localStorage.ta_sim_dblClick2DeActivate;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_dblClick2DeActivate);
                                this.options.dblClick2DeActivate.setValue(temp);
                            } else {
                                this.options.dblClick2DeActivate.setValue(true);
                            }
                            this.options.dblClick2DeActivate.addListener("click", function () {
                                localStorage.ta_sim_dblClick2DeActivate = JSON.stringify(this.options.dblClick2DeActivate.getValue());
                            }, this);
                            pssVBox.add(this.options.dblClick2DeActivate, {
                                row: 3,
                                column: 0,
                                colSpan: 3
                            });
                            // showShift Checkbox
                            this.options.showShift = new qx.ui.form.CheckBox(lang("Show shift buttons"));
                            var temp = localStorage.ta_sim_showShift;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_showShift);
                                this.options.showShift.setValue(temp);
                            } else {
                                this.options.showShift.setValue(true);
                            }
                            this.options.showShift.addListener("click", this.optionShowShift, this);
                            pssVBox.add(this.options.showShift, {
                                row: 4,
                                column: 0,
                                colSpan: 3
                            });
                            // side RadioButtons
                            this.options.sideLabel = new qx.ui.basic.Label(lang("Side:"));
                            this.options.leftSide = new qx.ui.form.RadioButton(lang("Left"));
                            this.options.rightSide = new qx.ui.form.RadioButton(lang("Right"));
                            var sideRadioGroup = new qx.ui.form.RadioGroup();
                            sideRadioGroup.add(this.options.leftSide, this.options.rightSide);
                            var temp = localStorage.ta_sim_side;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_side);
                                this.options.rightSide.setValue(temp);
                            } else {
                                this.options.rightSide.setValue(true);
                            }
                            sideRadioGroup.addListener("changeSelection", this.setupInterface, this);
                            pssVBox.add(this.options.sideLabel, {
                                row: 5,
                                column: 0
                            });
                            pssVBox.add(this.options.leftSide, {
                                row: 5,
                                column: 1
                            });
                            pssVBox.add(this.options.rightSide, {
                                row: 5,
                                column: 2
                            });
                            // locks Checkboxes
                            this.options.locksLabel = new qx.ui.basic.Label(lang("Locks:"));
                            this.options.attackLock = new qx.ui.form.CheckBox(lang("Attack"));
                            var temp = localStorage.ta_sim_attackLock;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_attackLock);
                                this.options.attackLock.setValue(temp);
                            } else {
                                this.options.attackLock.setValue(true);
                            }
                            this.options.repairLock = new qx.ui.form.CheckBox(lang("Repair"));
                            var temp = localStorage.ta_sim_repairLock;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_repairLock);
                                this.options.repairLock.setValue(temp);
                            } else {
                                this.options.repairLock.setValue(true);
                            }
                            this.options.attackLock.addListener("click", this.optionAttackLock, this);
                            this.options.repairLock.addListener("click", this.optionRepairLock, this);
                            pssVBox.add(this.options.locksLabel, {
                                row: 6,
                                column: 0
                            });
                            pssVBox.add(this.options.attackLock, {
                                row: 6,
                                column: 1
                            });
                            pssVBox.add(this.options.repairLock, {
                                row: 6,
                                column: 2
                            });
                            // showLootSummary Checkbox
                            this.options.showLootSummary = new qx.ui.form.CheckBox(lang("Show Loot Summary"));
                            this.options.showLootSummary.saveLocation = "showLootSummary";
                            this.options.showLootSummary.setValue(this.saveObj.checkbox.showLootSummary);
                            this.options.showLootSummary.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.showLootSummary, {
                                row: 7,
                                column: 0,
                                colSpan: 3
                            });
                            // showResourceLayoutWindow Checkbox
                            this.options.showResourceLayoutWindow = new qx.ui.form.CheckBox(lang("Show Resource Layout Window"));
                            this.options.showResourceLayoutWindow.saveLocation = "showResourceLayoutWindow";
                            this.options.showResourceLayoutWindow.setValue(this.saveObj.checkbox.showResourceLayoutWindow);
                            this.options.showResourceLayoutWindow.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.showResourceLayoutWindow, {
                                row: 8,
                                column: 0,
                                colSpan: 3
                            });
                            // showStatsDuringAttack Checkbox
                            this.options.showStatsDuringAttack = new qx.ui.form.CheckBox(lang("Show Stats During Attack"));
                            this.options.showStatsDuringAttack.saveLocation = "showStatsDuringAttack";
                            this.options.showStatsDuringAttack.setValue(this.saveObj.checkbox.showStatsDuringAttack);
                            this.options.showStatsDuringAttack.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.showStatsDuringAttack, {
                                row: 9,
                                column: 0,
                                colSpan: 3
                            });
                            // showStatsDuringSimulation Checkbox
                            this.options.showStatsDuringSimulation = new qx.ui.form.CheckBox(lang("Show Stats During Simulation"));
                            this.options.showStatsDuringSimulation.saveLocation = "showStatsDuringSimulation";
                            this.options.showStatsDuringSimulation.setValue(this.saveObj.checkbox.showStatsDuringSimulation);
                            this.options.showStatsDuringSimulation.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.showStatsDuringSimulation, {
                                row: 10,
                                column: 0,
                                colSpan: 3
                            });
                            // skipVictoryPopup Checkbox
                            this.options.skipVictoryPopup = new qx.ui.form.CheckBox(lang("Skip Victory-Popup After Battle"));
                            this.options.skipVictoryPopup.saveLocation = "skipVictoryPopup";
                            this.options.skipVictoryPopup.setValue(this.saveObj.checkbox.skipVictoryPopup);
                            this.options.skipVictoryPopup.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.skipVictoryPopup, {
                                row: 11,
                                column: 0,
                                colSpan: 3
                            });
                            webfrontend.gui.reports.CombatVictoryPopup.getInstance().addListener("appear", function () {

                                if (this.saveObj.checkbox.skipVictoryPopup) {
                                    webfrontend.gui.reports.CombatVictoryPopup.getInstance()._onBtnClose();
                                }
                            }, this);
                            // disableTooltipsInAttackPreparationView Checkbox
                            this.options.disableAttackPreparationTooltips = new qx.ui.form.CheckBox(lang("Disable Tooltips In Attack Preparation View"));
                            this.options.disableAttackPreparationTooltips.saveLocation = "disableAttackPreparationTooltips";
                            this.options.disableAttackPreparationTooltips.setValue(this.saveObj.checkbox.disableAttackPreparationTooltips);
                            this.options.disableAttackPreparationTooltips.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.disableAttackPreparationTooltips, {
                                row: 12,
                                column: 0,
                                colSpan: 3
                            });
                            // disableArmyFormationManagerTooltips Checkbox
                            this.options.disableArmyFormationManagerTooltips = new qx.ui.form.CheckBox(lang("Disable Unit Tooltips In Army Formation Manager"));
                            this.options.disableArmyFormationManagerTooltips.saveLocation = "disableArmyFormationManagerTooltips";
                            this.options.disableArmyFormationManagerTooltips.setValue(this.saveObj.checkbox.disableArmyFormationManagerTooltips);
                            this.options.disableArmyFormationManagerTooltips.addListener("click", this.toggleCheckboxOption, this);
                            pssVBox.add(this.options.disableArmyFormationManagerTooltips, {
                                row: 13,
                                column: 0,
                                colSpan: 3
                            });
                            this.options.statsOpacityLabel = new qx.ui.basic.Label(lang("Stats Window Opacity"));
                            this.options.statsOpacityLabel.setMarginTop(10);
                            pssVBox.add(this.options.statsOpacityLabel, {
                                row: 14,
                                column: 0,
                                colSpan: 3
                            });
                            this.options.statsOpacity = new qx.ui.form.Slider();
                            pssVBox.add(this.options.statsOpacity, {
                                row: 15,
                                column: 1,
                                colSpan: 2
                            });
                            this.options.statsOpacity.setValue(this.saveObj.slider.statsOpacity);
                            this.options.statsOpacityOutput = new qx.ui.basic.Label(String(this.saveObj.slider.statsOpacity) + "%");
                            pssVBox.add(this.options.statsOpacityOutput, {
                                row: 16,
                                column: 0
                            });
                            this.options.statsOpacity.addListener("changeValue", function () {
                                var val = this.options.statsOpacity.getValue();
                                this.battleResultsBox.setOpacity(val / 100);
                                this.options.statsOpacityOutput.setValue(String(val) + "%");
                                this.saveObj.slider.statsOpacity = val;
                            }, this);
                            // The Help Vertical Box
                            var pVBox = new qx.ui.container.Composite();
                            pVBox.setLayout(new qx.ui.layout.VBox(1));
                            pVBox.setThemedFont("bold");
                            pVBox.setThemedPadding(10);
                            //pVBox.setThemedMargin(3);
                            pVBox.setThemedBackgroundColor("#eef");
                            options.add(pVBox);
                            var proHelpBar = new qx.ui.basic.Label().set({
                                value: "<a target='_blank' href='http://cncscripts.com/'>cncscripts.com</a>",
                                rich: true
                            });
                            pVBox.add(proHelpBar);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    toggleCheckboxOption: function (evt) {
                        var tgt = evt.getTarget();
                        var val = tgt.getValue();
                        this.saveObj.checkbox[tgt.saveLocation] = val;
                        //console.log("this.saveObj.checkbox[\"" + tgt.saveLocation + "\"] = " + this.saveObj.checkbox[tgt.saveLocation]);
                        //console.log("val = " + val);
                        if (tgt == this.options.showLootSummary) {
                            if (this.saveObj.checkbox.showLootSummary) {
                                this.statsPage.add(this.resourceSummaryVerticalBox);
                            } else {
                                this.statsPage.remove(this.resourceSummaryVerticalBox);
                            }
                        }
                        if (tgt == this.options.showResourceLayoutWindow) {
                            if (this.saveObj.checkbox.showResourceLayoutWindow) {
                                this.resourceLayoutWindow.open();
                            } else {
                                this.resourceLayoutWindow.close();
                            }
                        }
                        this.saveData();
                    },
                    createHasAttackFormationFunction: function () {
                        try {
                            ClientLib.Data.City.prototype.HasAttackFormation = function (targetCity) {
                                var $createHelper;
                                var ownCity = this.get_Id();
                                if (TACS.getInstance().layouts.all.hasOwnProperty(targetCity)) {
                                    if (TACS.getInstance().layouts.all[targetCity].hasOwnProperty(ownCity)) {
                                        var count = 0;
                                        for (var key in TACS.getInstance().layouts.all[targetCity][ownCity]) {
                                            if (TACS.getInstance().layouts.all[targetCity][ownCity].hasOwnProperty(key)) {
                                                count++;
                                            }
                                        }
                                        if (count > 0) return true;
                                    } else {
                                        return false;
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    createBasePlateFunction: function (r) {
                        try {
                            var regionObject = r.prototype;
                            for (var key in regionObject) {
                                if (typeof regionObject[key] === 'function') {
                                    var strFunction = regionObject[key].toString();
                                    if (strFunction.indexOf("Blue") > -1 && strFunction.indexOf("Black") > -1) {
                                        if (r == ClientLib.Vis.Region.RegionNPCCamp || r == ClientLib.Vis.Region.RegionNPCBase) {
                                            regionObject[key] = function () {
                                                var $createHelper;
                                                var basePlateColor = ClientLib.Vis.EBackgroundPlateColor.Black;
                                                if ((ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity() != null) && ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().HasAttackFormation(this.get_Id())) {
                                                    var playerFaction = ClientLib.Data.MainData.GetInstance().get_Player().get_Faction();
                                                    basePlateColor = ((this.get_PlayerFaction() == 1) ? ClientLib.Vis.EBackgroundPlateColor.Orange : ClientLib.Vis.EBackgroundPlateColor.Cyan);
                                                }
                                                return basePlateColor;
                                            }
                                            break;
                                        } else {
                                            regionObject[key] = function () {
                                                var $createHelper;
                                                var basePlateColor = ClientLib.Vis.EBackgroundPlateColor.Black;
                                                if (this.get_Type() == ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) {
                                                    basePlateColor = ((this.get_PlayerFaction() == 1) ? ClientLib.Vis.EBackgroundPlateColor.Cyan : ClientLib.Vis.EBackgroundPlateColor.Orange);
                                                } else {
                                                    basePlateColor = ClientLib.Vis.EBackgroundPlateColor.Black;
                                                }
                                                if (((this.get_Type() != ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) && (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity() != null)) && ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().HasAttackFormation(this.get_Id())) {
                                                    basePlateColor = ((this.get_PlayerFaction() == 1) ? ClientLib.Vis.EBackgroundPlateColor.Orange : ClientLib.Vis.EBackgroundPlateColor.Cyan);
                                                }
                                                return basePlateColor;
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    initToolBarListeners: function () {
                        // MOD TOOLBAR LISTENERS
                        // by Netquik
                        try {
                            this.ArmySetupAttackBar.addListener("appear", function () {
                                this.toolBarMouse.show();
                            }, this);
                            this.ArmySetupAttackBar.addListener("changeVisibility", function () {
                                if (!this.ArmySetupAttackBar.isVisible()) {
                                    this.toolBarMouse.exclude();
                                } else {
                                    this.toolBarMouse.show();
                                }
                            }, this);
                            this.MainOverlay.addListener('changeWidth', function () {
                                this.toolBarMouse.setLayoutProperties({
                                    left: (this._Application.getDesktop().getBounds().width - this.TOOL_BAR_WIDTH) / 2
                                })
                            }, this);
                            this.toolBarMouse.addListener("mouseover", function () {
                                this.toolBar.show();

                            }, this);
                            this.toolBarMouse.addListener("mouseout", function () {
                                this.toolBar.hide();

                            }, this);
                            this._armyBar.addListener("click", function () {
                                this.armybarClickCount += 1;
                                if (this.armybarClickCount == 1) {
                                    this.armybarClearnClickCounter = setInterval(this.resetDblClick, 500);
                                }
                            }, this);
                        } catch (err) {
                            console.log(err);
                        }
                    },
                    setupInterface: function () {
                        try {
                            ////////////////// Interface Side ////////////////////
                            localStorage.ta_sim_side = JSON.stringify(this.options.rightSide.getValue());
                            // qx.core.Init.getApplication().getPlayArea()
                            // might need to use this instead, mouseovers are not being registered during attacks
                            var playArea = this._Application.getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA);
                            var playAreaWidth = this._Application.getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA).getLayoutParent().getLayoutParent().getBounds().width;
                            this.armybarClickCount = 0;
                            var playerFaction = this._MainData.get_Player().get_Faction();
                            var statsIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAB3RJTUUH3QMQFzoqkrYqRAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAGrUlEQVRYw52WyY9c1RXGf+fe+4aqrqG7qgd6wm2MjYnBKFFIskAifwASipRlttlHkSJlkb8iUnYRy6yyyzKgDEgBJYRJcUAYhGkPZWx6qK7pDffek0W1CSB6Uf2WT+/q/t53zvedI5zx/Oa3v/tT3d1+yQhqtCZUHkTEGBAiUQURQVVI04zJbIogIIIxQFQ9GM30sIpmOdU7r/zy57vfdo87CyB0t176xcsv++PhF3Z5fJebH30kNarOOVnrdrh3OKTbTCnqSPCe1b01eivr5I0EQH0x4/dvfiRIL9TlbOese84EODkZ6r/++YYdBqXPiMFwqtPpROrZhG6rxXA0QSTiAyTOYW9Bv7+BNaogItHr7TsPdCDHZk18XBhgf3+fQVpx+fr3qIrAlWvX+ezuPf7x19eYjE7I0hQABRLrOB4OmU1HNFsdEUStEeoQpDg85NiqLAzgg6fbacnOek8//uSIVNpy5cpVfXg8ltHREaPjQ1QEVUjTlOYGfLp/i6efuc5sfEJZVXRXepJ88J7e/uDfiwOIIFHRNGvI8soKeSPXaEQ67Q4mCs4YQowYa3HWIVmOtykbq6vqux2ZFgXLvb5WdSWDT/7LwgDLvT6XrzwneWOFrc0GIiI+Rp576hl88KBz+QUQBDHwYDTm9ZufyaeDQ3JrGN+/Ixvbe2w88yN49W+LAeR5g53HtsnSDCMZcipie6mLflMtIHVCee8h77z1MeMKUivkS132NaXf6S2ugI+Rg6MDGlHwdYVqnP+rCMZarDFf+14Vdpcyfv3Cs9w6OMIIjGZTru3t8tqfP14cIIaazwcD0mkAjYSqIIrBWWG5t8HO5hrhW8z1w16HH6cwrUr2R/fwjTEF1eIARiydTgfTzIkhYJs51lmSJKXT7lD7uSLGyP9LospoBqOZUIVIWVg6zT6ZSc8EMGeXQIhRcdahGKxzCEKr1SHLskc3oqqIKqgiIlgrWAtGFCXiYySoLq4AMVBWFVQFo/GUdiPBpQ3EGKJGjDUQ5z7QRyByqoZy+v6RmsI5csCQ5znd7jLOOjJnUQzGCM4ZxqMReaMF6gFzOph0HiCn6lgMSI3IORQQI5RlyeDuHUbTgmaWkmeOW7dv0+0uY7Xm8GRKb7nNxb0ncM59zZdBA6N6xGQ2owzleZpQeOyxTda2tyhKT+KE6aTg8XnlSdMmT5nArAzIqSXlVGpVJXNNLrQvsLXR4tX03cUB6qrivbffonh/CWMgz3N6nRbT6YyD4ZjhwV12n7zOD777LNaYufynEEaEUXHEjcMP+cvwU+6N7y8OkGQZ33n2Ou3+GrPZDFXFWkdRlVxOHNY+T1lWaFRUFPMViKhKK+vx/fXn2Vx7gf3WK+dIwhA4PDpiVBRMixJjLWVZ0e32OCom+DCX3sfI2uraly74ZpbUKFHDOZIwKjFGfFCQZJ4HydxuW5s71CHQWlrCWIM1BplvY6jO+2dazxiM73PPjhj7yfmaUGPEe49GwVpLmrYQMYgREpPgnKOqCibjMc4IdVQSY0AMtZaU0xnWpUi05wgiZB4lNsVRMZmM2bv4JK1mTohxPoYFJuMRDwYDqnpGHR0mVNisgcRARFgJGyTnATBG6PdXSVoroJ6g0GzkgOBsAsxrniQpS60l2qZJ4SHRGnUNEiucnAzJckfgHEHkfc3b77xLo9Oh9DVBLZcuXuLypSe+HM3GwnQ65s03Xmdra4OTaQRfkjc7EEtqhAd3b/PFwdHiAHne4MUXX6S50sfXnuADxlpUIyIGRIlRWFlZ5yc//RkhKkYUBOo6Yq3B1zW72x1ufP5gcYAQPDf+8z5Zd5XaRxILFy89SavZJEYFnU+9w4P73PzwBuvbewzu3MJZQ9Lo4AxUVcHNGykPvjg8RxOKsLq6Tqu/rr4upQ4RNKqqytzzc8u12m12LlwAjWzuPk7mBHE5BqUoC/a2d/n7BzcWB9CoTKZTTdqVxLrSMih1VUmdJIQwbyprDUVRUhY1vi6YemFlKcdXM4xGQlRGowne+8UXEmtFG3mGiqhJUvLUMRrPqOpIkiQ4ZxExrPTWuHrtOls7j+PEE22CL2ZUviTNLVkmjxaEBUugqoqKsVY1ICFUgoimaSpiDBrt6T6sxAhZo0O328e4jCxJKUtDVQnHRw5/nhzwQU3HutBMU6N1Qae/rdPJidRHD9m4uIlNvrqUA7S5uPv0l+cPB/Dwc1hpgymTcywkxfDDX/3hj1e77VaMihhrJMRA9IEkTbDOgJ6OX4SoEdVTHAHvoa4hM8JnD88ex/8DigFIoHwdTR8AAAAASUVORK5CYII=";
                            var undoIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAzdJREFUeNq8ll2ITGEYx+edj901i2UNaaiVyFdK3PgohUJSyo3ykVsXeyFy7+NOElfkjpBy5Yoil5S4EclolfK5YwfL7JwzX8f/af5Hj9eZs2P3nD3165yZc877/N//857nfUwi5PA8T05GLo0xiTiO5DjBe8BaMIDfZsoEMHg32Akug00gNZUOSLD14CQYAu9BMw4B6YDZi9WrwGnQC56A161bf9Lg6Xcmsz7SAcHz4BTIge+gClaA5QxcBqO8Fn7hvTGcXVAXp/5HkLHyPhucAdvAGAV2B6RHjmGKk+c+gLfgKd0qiiAI8ToSwOAzwVFwGPxgzvUAnvXbv29IimI/g0fgNiiAWpgjvgB5eR+tL9PKoOA2TXXWgqZxnEvgrrjUTkRSnXO03Jtg8AaFO2CEv0+AI6CPLrcVUANXwXUwS+XZn1FSYRSJABH+ucy1sB8MyrhBIuxF2AeOgUOgRCEVDtYMcKeXC1dm/ZPP1pUbDcYQd2+BG/KMTkdaf8sQIYvvPBfTHg58H9zkqrfFT6eIzWALWMxZV5UI4RPYC16Bx7qope2CQhEXafdusJIDD+F+3aobJV6+AXfALnCA/5WUAIfjyb0C3iv6LvxTinlDPqULnL0UoNWg386hPEvqfEecOsfUZRi8Rke+ggUsaiZ0L2ABEdvOsrAsA9nQgtISLjN9CK6BebS6RiEVitwIutruBVoEDhFxnIvoy3gllimUkvwAbOf4dTpQowuLWPSKof0AB5QZvAPPcF3pqLa3REqge3StpigzPTk/nclOBpzAbifCn6sU+OvAUXtMZwImcVSt4FXumA47LRO6BiJqdhpW8Cq38mzcDhh+OQ4Du0pIimlIxOlAF+vHNxXcVRWy4pf0yB3g6s6z4Iyo4C7XQ4bOxJYCcXUDv/+yCu6oDW20bSmOYPZSbreym66o4C5TM0ZhsTggu+gOBhu2gksq5qr/oxWA2SfZzq8DLzlLx7J/DrfkRqQCaP18cBB8ZDvvWg7MkBaeW7cXtQOG3ZTMrB+sAUs5Y/9TXwJe6AX4V0sWUQqy7CnlMxwAC/lfhuKu2LuqiakO+I1sD3vGPHvGAoI39PO/BRgAhgJgQiBnZrUAAAAASUVORK5CYII=";
                            var redoIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAx9JREFUeNq8l8uPDFEUxvtWV8/o7hmPTCeeC4bJYIhHIhZYiNjZ2CEidlYWHrEwEyxn7x+wtbSxFqyJiEeEeGS0kU4YY3qobt3lO/HdOK6q6mrd5Sa/VLoe93zn3HPuPZ3LZTTCMDSg43teRsZ9XDaD1SLkvwvAKIFT4DqoJEUiKwFN8A5sB+fB0jgRXo+hdjEMeQM8BE/BCXAWlKNE+N0mFi55UABLwDAY4GO5N8LnOT6vglFwEnwBNzDHgjG/08Kk8ZKREmMbwU4wAVaBNfKKhBgsA21i5/0BAjoqeXEJ3JZ7VoRJ4bFMvgMcB7s5mUzccpbSOE7puQ0jJblxDtyHgHaiABiXUG4CZ8B+ehIog54ybK9RaBFFUAPHwKxEwU8wLnV8lWGuMdR5tcba+3ZCQmsRErUyGIxNQhiXibayfIbAR06Sj5nYJEQiR+F2Cb6CKUlOmwN+xJqvBRcZrk807DtrOcTnkvnv6ZlxRA3QW8OKmGc5PoLxVlwEilyfYRr3nVAv57274A54xYkbEdHZA06DbUy+C67xPwTQ+w1gnyQIQxcq4yvAGzANXjMhf2WyqmuWrZTkGPNInLoCHrjG3QjIi0fo0aIT9gpFXZaQY6Kww/myBexisk2y9htRL/tK9Up+NMM6t6PMj6eZPJ3OWBGwHoyDa+CW3njiIuDxAzG0oDLecN1vgud28+gwWsyRl+BJknEtwOem8wF8V/v7IH/fiwvhX0Vv5DwKq7rUkoavDo5KREbLDJ/lfprJlIjU71oBeWZ0nSWTU5tILa33/zJ8Z+0CJwHrjE4hKwGe8jSkp4G6LvI0LKZpMHsR0KTnniOizjIcS9M79CKgwUOnwKy3R+837vUHuFFlJqBFASUVgYBiZtgJjXZqsXvNgSrXu+VEYZ4cUvtDJgJmmQcF5b1dhhc81db1Oxk9tXHMsZevOEsQ8JnkwlFZpn6K8Jw/E4/ZgrWdZQjUH42D3bbzqQTwlHvGtmmEZVeioAl2xHW24/l+CTAR/eBecFhtvxL+t2xGava86Ga/70aA/WM5TsNz3A2bUd1PP8ZPAQYA6tkaX3nBq4MAAAAASUVORK5CYII=";
                            var resetIcon = "data:image/png;base64,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";
                            switch (playerFaction) {
                                case ClientLib.Base.EFactionType.GDIFaction:
                                    var iconFlipHorizontal = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFTElEQVR4XtWVW28bRRTHz5nZ9Xrt2IlzKUlanJReiEhLpUpFPAQJBIUH4K1IXEQf+AZIfIE+9oXPgAChPlb0DVGFXlBBlFJoaakobVVCkxbiJI7ttdfeOfwnySo18UXIlRBnd+X1zP/8/mfO7tj0v4lvStKDtseYfVAiGxeCBt8Q8a5Hkj67JGkRYVyEe/2LwSWioNnMeZRx4so1vhLK0Km7xbdO3Fw6fnYpOvr+ye9e/uDzi4NnlqIdGJvC3PjVUNzPfrr66IzP/ylk47pI4tTc6psnbi3/cPmvslxalZPvfjz74dFPZnfj/hDGXsPcc9CMQ8txbrdQ3QQzI0xn7ghXyjRKrJ59aiA5dWAoRa6mEWau4zKOogTGGHN90OTKZUoix+b2XoCNTJ7U/EppplKrHx7w9BpViEwsEHsiMEfQDC+slHLZCbK63gs4VxGqBpR3tDs9PZDMu0p7QSTEQg34xhCxY5jT0PjQZoMK+cjtvQAlolbLwcFSJTjiOUosUta5EW2GyEYboCFox5CTVdJDAefLGy5GdpLwwcmsNzzqu5mFqgi3aK4ds3PQuNC6yBlAbipm/esCZtJMXwfiSGSmqtXakX7PcSuRkOKmZysPf7Nz0Ai0jJwx5PaBwWC1L6DT6o0x+XK5drg/6aZ3pt3MPaxQNbOEpKkAshpoE8jRyB0Bw+/UBdVu9ecC8VzhPVFkXnoy6w0CTA63fLObyFYDrezFY0DuMBhpsFS7Lqh2q1ck4w8Kq28orf3RpPYLoV09dzS3YTVWO5bUWuEEY1yxeO26oNqs3nci3stKP/3CY37+Rqnl6hmXMG2tymptDnJTYGScBveBqVt1QbVavato273F4juseMDX7IRGhLllC0Vo616zWpuDXAbDAWs7mIlWXVAPm9sKz1clFVWjfVrrna+O+buvFI1YDrWLNjM2x+aCkQbLMjNg2y5Yr60FxO3xFA09WCkf6XPV9lq0JmhvTiw4AGj7hrNlgJUEcxRsN/ZqKiCu6EJd/GKx9oyQmnx+JDnxa5m4w+LbGDc/CssAywczBXYOHk2eKq5oVoQSQsOlIHwxn3KmCnWK93wnfxZEpyZZBlgEZh/YQ/BIfIWUuAsqriRDlLi/WJlBy/ZP9bu5Qkga7G5L7NYiEgRYDGaiZigLj0F4cdwFZSs5EwhTSKPG0MHpfndfsaHcxrp15/6LqG41ItiywOTprJuBR7/UKAlPst6KEP1JUvOLpZnVavhKznPcSEgZibdepxCbz93eA8sCk8FmeIzMF0o5eK7Blf3PrlQo7ypnen8u+YSjdHqlLtQdvEZXpKxF12DLBNuBRwpeGXj61lu5ZHi5WDqwVCy/5zqarLVsPr8tV/xzO7e6QMaIE0WRvbdjHXNiLjwYXnl4ZuBNjkTAsdufz8jg4/gXu1sWSur2azIb7/z2vlGl+LpmxHhm1Nqzp7jjzlkKiSbSrrOYSVCRXRfeKEAMaUUVY/Q1T1FmV4al1QYXEaqbBtrowFL05T/uBJGIz4T7udvRrt0TtR0+SWjqktAuKVbUIthhotW6UZETrRXrOKwkCMKb399d+PTcbxpANoKTpPnXFmAuBMs84GVVKHWZm1vZI0LfGkO10xfnwt+Xq/MeJ6hQXZbh1CAldOIf6+D1A67LK8X05LahYHIkRSygHPvicvbSrfn9IiYkhDAsTfMLp5hZ44hMxICwh4epFF+AYAgML6xHYsDSrMTeIVr8d8oGT6m940P3j79+qM7UY7z90WlX4i2LE9a0vrvtZ1wEPuNvwsQs9OPte42fjx3t2bzH/C/pP4+/ARzr/zZI4lPKAAAAAElFTkSuQmCC";
                                    var iconFlipVertical = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAEz0lEQVR4XsWX3W8U5RfHz3lmd2Z2drftdinQjRhKE02MV7SIhZYLSUyIMcZ45wVeatQ/4BfwlxiF+A8Yb8WXC68QiBFjIEYwigQiYFEoFVBCX3ZL931nd555zvFkQnphu11Td/VMJvMkm8l8crLn+/0ehDXqXIkxbhECKgBFPOFZDD2qNQHOl2hbzff3C4BWSHOZAe8axqG4SyH9OwBF8xo16h8YpsZik34eSLnHLQsvZwfcKy2G6h4bdW8Blun/kxl850HAXPB1I+8HQSHg722Fl/tT7lkvFZtuGqhNuRj0qAN0eKIfjtyoAmx1EUKikNno6VKwXCe4CGRubR3sO6kcmBGQ8j4XdVcBzhXDQ3v71dHpKgMCsKsQXQsgabG2kfmbRf8uI94Ephu5bPp4GIM7oYLCVAypSx3Qh/f0W0euC4CFCMwMDMC2gCAAbEtAyMz01YJ/ywKetxRcHMqkvtAIdycTON8FgFAA1ArAw4pApFg4UMnh8TTwckD++ULzLhhT8pz4l17K/pZR3Z5KqrnuAayula4kY4gjHsLtmi7PVIOlZissD6QTn7IFP9m2fXMyifPdAmgLEjLwsIu42UG4WgqWykHYKjSCxcE+7xNN5peBVOJqTEFhzEH6WwBf52uH929KCgCtAHQqYgbNwKOewoQFcL3SetDShv+o6dk+zzkFQFeGB7xLTR2UdqcdvS7Ah7dnDx3cPnp0NUDnMsxADDySVMhyXvB1pdQM+Z5vrsYVXEi59ulMyrk05mGtLcDpxcpbzw6l371WEQCEDZVhAAWRjsgZmMjo36pBuFAPvsumvbf7U/aFXR7ymgCn8oX/PT+06T3fMKBcLNdGixkgrkBuBJLzmXvlkOLuwcG089nudBuA1z+/8NFLUzseybpZKDZLvNkbjF6W6tQPbjNpFiPEhAPqmu+0CD4GwDP7Mm0AXj529jlLwQEEDAkgVIgEzAaiJ0YDiIgMUa10EVfuiAPVWgNHRM7EEzvef2PX9lmQagfwmGUBICtiBFaoonlDRGCIvg+IEXvEg5FiI0a/yTGCih6re0GG1eSTo3Ov7ny00RbgzZM/7nxx74iddbKw3CzBluQgELfrdscpiXjlRkvOtZD9gODevoxaagtwYiE//sKWoZxvmHvwJzQUd64cyCXm1hvDcRnDYRlD7uIYsowhyRgWN6W9mf2bneJ6QjT2yshobloAuiBEWoQIRIgq0oViyo3nRYjKIkRmPSkeFykeFiXkDUoxihS3RIpBpLguUrwIQGWR4rJIsRYp5k5mNC55YDVAZzNCMaOWmBGJGbXEjO5rMhUxo+ruBLZWUW8IoL0da7HjQOw4FDu+zxaUxI7rYscrH94YQOdAQhJIGmBMKIEkL4FkiVH5Ekia/ySSCUAsAmgTyYiZQSJZ3QJuWgpKEsnyGqExKa3uRigdk1Cak1DKfwmlZCODhNIGI9aBqSahdCGMQX3CxqCbsVw6AMO/VoEfxnJiNiyxPKgTlIFMTWL5onKhLhOmJZZzV2P5D2Uee7oPcrKYUMHXRhYTKgRcikurJV4tJdOxqh+CmXKRerKYHLs+/8xoJulqIpLVrCqr2bxlYVlWs0qLIZTVjHu6mp34vbLFcWLxyA+RmrKcVp5yUPdmO/6P609VRf8/TUkZ4wAAAABJRU5ErkJggg%3D%3D";
                                    var iconRefresh = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFfUlEQVR4Xu2Va2wUVRTHz9zZme6zpbQVSgxU21r64hUSUIkPFFPhCx/kFTEkkhYwNYX4ICFRoTFEKomhIajBICRNSgSifrBWHpaAChUhPFtqIVKUAm63y86+ZmfmzvXcnWWxBaoy+9Gb/DJ7956Z//+ee8+9AmSw1XZpIj5kxIm4EAcSRFTE2F4hs+ECjgwJ84lISDZSgIxF8lJGTiA3EQW5ywDJkLicEizLl4QXnxvt2Lx4rNTycqG0c4pPrAEALyIWVMyuwHiSQshUBkQkBymp9pJl1V5xGRHufJdZ5kh77ZIlotNZ2/F2/SfPNm39hi8LmkjYN2AJjBnvJLMn+8TlfCCo0f7j3b8NXLr4q6fwmTlHTzY3VRBJXpUzplAun1T93sU9LdkTFyzlJvwE7LcCpBRn/yrv9EfUa1t27o1917qbXDi0Xzm+bYt7sLdn/ahHSzwL65ZPWNNQV/rEtOrGKwfalgLAQ5kwMAGpzJWE8bzT0nZE0CJhoKp6XvL41gd6uqpyi0u7Zy94Kf78jCl5PGburOn5MyZXLASAYttl+OWf5kH+odGSUGSYptnddz2e7XGrntxR7e0DxjoeU+Uli3Ezbhou0BszP7Zt4LNrdFupm6waPnA6TNeej5i7eacm37ExGrxVo0RjzvIJhS4HIWRQZ1cA4LLtJegM0b0HzvSe+fvAV8fP/rzz/Y3lh9asmN/Z1Dhlw1vviJ+27At+e+JCiIvzmLYBYwfSSMB+u9x5puuLth9+GeCdg52nA9/v2esKXu4tzyurOK9Hw+ux/Kpkrw+Wzn2KJatEZ1fxcQHpu28ZzmrY+kokFn/XZOye40QQwOdxr8bOsaI5c1t+2tMS7Dl5ak332XNhdTCg5U2s3DDztYbY9cMHsksmPhadWf6IO1cWx3GBcxFzB98CiP++e+Dx+uZmg9LXix8eCyIR0meogBjUhJ6+a+B2OddVrlyx6fb5j4fMvEj/Hysll2t7zfbWw3guLMLybIJUMxkY5yJ0FxrYhd0eZHCkJUgwlG2smw9b3lgEH622aH5zEaxdNg9ww3MzGl4wJo9FFDzhWrH8VqB4K9fj4wyAGgwS1xPs1P6AsRbFPweAS0gIof94EiaoCQkDI00rBxRldWoOibFuuXSSuhCCRLAS2pFA6jbkzxuIH1EQnb83ogHG0DoKq5RBSh+owE0xPjbiq0gU6UeOIAYSTxnhWaP/5jpGFbRpchOQTDlLvkBAH1E8nRE9RXikWMcIsxe4gzhlIFGTG0hffSr2UxmwTdrA1NoPO4NKeOrtfr/fL1aWFMPur4+C5CDgcTuhZs4McDqz0kuAZM5AQtcLqkqKpKenlQH/bpYkgRdFCZjQdzOEBCGiUaAiTe4Jg1IQBCGYMQOMMeoQCZ5W0yGVbS4AWRjRceoqXOoPWKlH+LMwPw8CIaVhWt3mGr5chAhElqTOY1sbmh7UQHKd/RFrvbk4b7JMIKzqIACDmGECReI6hXEFeZCb7ZoUjcUn8YyFonEIhpTpAPBgBtBB8oQLaUa65DhZKK1Syk2lDagYQCmD+oUvQFlRLuBrUP9BKyjRuGZnCcBAkcEEHRIgA4GYbmUlblAwdAoqAgxjUe9GGE2Z1p5gGGPLAEWRIDcgDDUQRWF2x0A6IyGNgj9h/Tas0rRngM8ipNMhH5KYgBmwRPixTBENAezfQgMyN8D/t8rSfgYUfehMHGCCapjJDKi6AQ4igpYyxPcLiRupDFD7BpjJQIkl+O90GRIUi6MwRQxNTwKSAxivCkaAmAIwhJo2M2AyJuuJBBxp3Tc8xtpcKPB7ekxIbpOb+ztAlCQMADSm8UzID2wgx+vtCITCT95rFoKVjruNKeEhMTk+34//Uf9/4C/OeihXxgLfsQAAAABJRU5ErkJggg%3D%3D";
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABklBMVEUAAAD///8bfqbc3Nyhop/T09PZ2dnY2Njx8fHy8vLz8/Oen5t2d3XW1tZyc3C5ubnJycnLy8ugoZ6hoZ7X19bX19eKioiXmJTa2tqXmJXg4ODh4eHi4uLr6+ucnZmcnZqdnpr09PTR0dHS0tLV1dV0dXPj4+Pq6uqen52LjIrK09eMjIvOzs3Q0NC3t7e4uLiRko9qa2iWl5NtbmsbfqZ0dHK9vr3b29t2dnTf39/IyMifoJygoZ3CwsLo6Ojp6enDw8Pu7u7w8PCGh4OIiYewsLC0tLR1dnRnoblsbWqpqairq6irrKmsrKutrq2ur6xub22zs7OHiISHiIW4uLZub26Jioi5uri6urq7vLtvb22Ki4dvb27FxcVra2nIz9KNjoqOjouQkY5zc3HOzs7O1djPz8+Sk4+TlJCVlpNpamd0dXJubmyYmJaZmpeam5ibm5l1dnNqpbxubm2enptub2x4eXd6enh8fXuCgoGEhYKEhYOioqHt7e2io6Hv7++jo6OkpaKlpaOlpqOmp6Wnp6Um7BAdAAAAA3RSTlMAAH5Ny5jlAAACu0lEQVR4Xu3b1Y/bQBDA4Wtm1+wgM8MhMzOUmZmZmfH/rtc5K6kq9SGbac/qjnSv38NPymmccbr2oM3vtKC7nPGMdXRaaM/THuAZSZLYX9kBmrRnqwekDkyZQpyacUmyaEe+5MjcNFj0xEdGN2rcAO5p0ABxaz6/ZLQj80+DZjYcfsdoVoPJS+sDg+2Pz+cHp7VJ4X6O0awzkzf8k8npdieZTEERbDoepxRO6Ixu1Fg6EqiuaGq7o2kFJV0CgDLLYR7wzlr0jrwRSH9SeEbVlORNRgPI3a+Ozln0mP1JWfdXmcxlFzIli6YgR18cexRiNLAZmFxReEfLSIw2T05dHso36cGkxk/XGA2bUwkSDJEmPa1y0+qiTY8HCQkRDJoO6yR2W/9LtMI/Ng0VwsY9NGKQ/6a1aC1ai9Z3rSC3cFpfzJPYUB4lSOQQWmuQfxAdJwhA//MYFk37TtVxgrBZw6O9WEEoJl1BC/JHWrQWrfv2YtH9b58gfdDlXiNRR6EjUSOB9P96+14Caw8ZDZJYzG3LAnh1QnS3LWZ0lLirNT8t9mvRWrQWrQ281uH9aK1B/obVmj3dfSFINIQn6nhL8Coe7XXlfl35N0FEa9E6fBCrtdz7eg0niBw9ey6LQoejxhWkPcQwEijLgnMDQ6HFHiJ2PtFatBatRettJBr/BkaIG29gx7O75QYm9mvxLCNau/EGdm3VdTewbvac5LYb2HB+F+0hYucTrUVrzHeC3UNjBnF/a4x33cfJr1/G+TpAqws2vWm5wVALnSpwF1lO2UHMfaGR1pf/Z0DROO0P6YhNg/x15GquSUOxqhQ0jt9wqMtpU4KdG9h3Mhts0lBKZTK1xXantpCKSODQcCY710LDdSrxjMxkOwgUKbzRbbqT4+zXz3IItA0Ezj/GomcePMQKcuH9HSx6fv70T0KzcLgY6GqkAAAAAElFTkSuQmCC";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABsFBMVEX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb3Nzb29va2trZ2dnY2NjY2dnY2NfX19fW1tbX19bV1dXU1dXT09PN1djS0tLJ09fR0dHJ0tfQ0NDPz8/Ozs7Pzs7Ozs3Hz9LMzMzLy8vJycnIyMjFxcXDw8PCwsK9vr27vLu6urq5uri5ubm4uLiQwNS3t7e4uLaPwNO0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmmp6Wnp6WlpqOlpaOkpaKkpKSio6Ghop+ioqGgoZ6goZ2hoZ6foJyen52en5udnpqenpucnZmcnZqam5ibm5mZmpdqpLyXmJWYmJaXmJSWl5OVlpNnoLmTlJCSk4+Rko+QkY6OjouNjoqMjYuNjYyLi4mKi4eKi4mIiYeHiISHiIWGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN2dnR1dnR0dXJ0dXN0dHJyc3Bzc3FvcG5ub25ub2xvb21vb25ubmxubm1tbmscf6ZsbWobfqZqa2hra2lpamf///8wScmyAAAAkHRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wADZeeHAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAt5JREFUaIHtm/1P00AYxytLEBnr2MFukzIrDN8ZAupAQXzF1zomnZviUnyZClMUXzOnMN8V8eVf9u7ajRoTf+D6lBy5b9Jk2ZJPms/68r08rfIbLIpE/4Ne9TIrY250h5Md8Xi8g2486bs56kJjjDU9GtV17EFQ7+3RNfTl4aimI+QNGqP9dTZBv7oUZUnYP3Fnp+OEoJ+9t79KeENusAm68AXpWt01SqXTIxyZGKRs5oSgzQ8Rvf43oiRSVbV93elMjVM2803QV2unNCaEbD2hgKIoTetPW//xQccJQU89fjmHbfTucIA3of5xmz1G0NnrTz6WMTn4yE63KAovuy01QR30rVB0rvSg+qiLonHLFu7dDnQeZcfJKkEbJMVqlQrB2zxAh0f+QhvGMkO3NvGj211o845lmD+YEIHQLEu2EH6yX2i3EHHQ0rV/aOnaP7Sgru8SIb9AhORKlpH7Ceb6RBeMENM4F0MwaOvaLoRAhEwf2acDoRfs7gohpAaJ1qGELEGipevN4DoChz67F+xEf/00CXV5KlbmMdBF1SxWyjGoHmK9/QZzA7MswwBCA5YF0zDMmmidT0zXsl8HpOuNQkvX/qGhXVfAXJ/uhnJ9PgbTQ4yLdG0HImR6uBuq8y3ClWDQ6g5WgkGXSdL1ZnAdgXN9EuxEX3gxj4HQ+YefnBkYwPX6fqW8HereWKzA3MDcMzCP0bKH+IeWrv1DS9f+oaVr/9DQrr+LNgMjEXAGlj8m4gxM0H4t1zLS9f/RQs7AFt+JOAOjq6Q54WZg9N6Ykz1Edr6NQEvX/qHFfyZYHLTArpfhnnV/w9BBD/Y6nG6gs7nSbPaMxoSozdxkRXWhC/dmLzgzMBzays1GAw10JpOZdGZgCGuhZo43ONhbHEnUQE/lD6E6muy3Ggy2ckTtQWto83mjBDM2V/Q9yIUufHWjPQtF3/h8gH1OeI+emRmAQt+6chBKyOGhIRD0H2r7n40x6THiAAAAAElFTkSuQmCC";
                                    break;
                                case ClientLib.Base.EFactionType.NODFaction:
                                    var iconFlipHorizontal = "data:image/png;base64,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%3D";
                                    var iconFlipVertical = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFMElEQVR4XsWXXWwUZRfHz5nZ7213u91u2W26RRFfaoCgiSDbxpiYKIitcueFGKM3mhhD64WJ0Qgx75WxkBATjRdcCBdyIYlEJNF4gdrlI6AUiNBCtFK3Le2W3S3dnZl9nnnOe7ZbQJp2obDre+bZZDMXk9+cc+Z//gdhgaCxIwhKIAAf0glbtxDUKBYEyJ3bu8Kpw5MAKIkco75w01nQtQxGNql/BWDohx37w/FHXyJZtOT0lXOBYONB1N2nPeHIGRDyOrY8L2oKMHZi9/7ohp6XwRwnMztSsHIjRciPJEH3nK4LhH/U6+vPkyFmtLbuYk0ARo/t2hfbuH0bTJ0A8D8AyhbSlkoYqeQ1XWROWkq71Ngc/wZc+pA0VM65vEtUFSCV7PuyJdH7CqT7gVAj1H0IDh8oLSBI81Bh6MAwgj0oleNiQzR+EED9WRSuSXfbs6o6GejnDHT0bIN0EkBzABABXwzimQUm/ypJpFThwt5LipxjpLlOBiPRb0HZw9j64tj990By975oYvstgHLMgQAh6giIQKHHSRXGDfPy18NFW8t6vHXfef11R5n6D2zbOno/JfisJdHzJqSP3Q4AMA9GETqDCIHVIKfO5qzxX9OmVcgFg+H9iPCb7vQOYhtnZMklSO76PJbY/sY8gMVBVJHQ/yCCLw7F0aNpkU9bRjZ1NRSK7BO2/N0TCA+A1zWJoWfUXfZA3x7ugbfnAVQOshlEEAbXIDjrwEr1TwnLIuva4GV/XcMhBXjG1xw/BcLIYqxL3KEEn+xs2di7A6bKAEsKJculCaxGJgIrOzxdnEmTnb04AJr7uM/fcMTV1HgKw5tnFgfo7/u0paPnLZj8GQArAVTOCKAG4F/OfyVJYQtzckAamSu/1DdGdnqDDcdxWTct1gPvxxK9/wW7UCZChHsOUgCaCwCdAKBg6vxXps8pX/OGIgdw2ZaFAQa///DdSHztKiVFOyJeI6ViCFB+AmDpENwKJJq9hYu1Oc4FoE65iWGtMRx5rz4SO4zRzQsDHNrV1e30eLodqBEBSNRKnKjKPyBAPogAxIeonCKkOQbCf/bXPFSwTNO9sn3dx+2bPrq0aA8c3rN1ldvrAx21Ej6V4G++eYkZae4eAdGNGtHshbcSgTRHgEQ3y2gaBj78yLqRh57+YLa+i5VgZaR1jV/Zog5QK4Kt3ICkISAt1BM0R1F+XYTb3lwr39G0ErgO2YlhDIcjFwJrX5+oIER9a2OJd1ZwE6oaNKHkJhzwtb86WukzXN/S0RuFyZ+oap+htMmcGFBG5q9MoHHZkPc/2zKVhGgdj+M2VkKqghAJFiJgIZpmIcqwEE2wEOVYiOxKUrw+VspAOkn3KMVopZKWsExgKc6zFF9VgDmW4hwIQ7AU052G0ROxRE+EAZY6jLCYOmqJQlrxMLJCjZGUkHKah1HJR1pLGccbuATNDLCEcXxOWOOnizyOJY/jFCJkeRzneRxb92JIOtmQhO7SkCg2JAU2JJINyYS3rj4NhAYbEvN+LFknj+NQBUumiBSwJcsrcpqku7LBpugEKFXA1hesapjSTi5BaAFTqkjzAJvSAoKdl8ox0xBtHQegPDdWsZq2vDO2kTMwdfyGLVe2VMS2vKiLbM5SOMO2/Cq49LxtKOFY3kXVXkw6eDEJgzmmzOzfNi8miheTLOieLC8maV5MrpMhbF5MVK1Ws6ea4o/5lbQUr2bXA8HwGOquHK9m0yCk5E+KarqaZc580ex2O1ygkAgcJi+n0xh9TtRmO/4/x/8AHKjlP9O9djoAAAAASUVORK5CYII%3D";
                                    var iconRefresh = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAFmklEQVR4Xu2VfWxT5QLGn3P6tbasU9nGAO+GczjQOUaAuyioSPxjSC6BmAiEixjMEEz4UiJxfs2PoJL9gyFeVDJGgID4gd443R8oRByyTRBwiDg23YAxVrvSru1pT895j4+n/WMyGHHtnz7Lr+3es/M+z/u8Z28lpFFG/WwLADvJIE5iJX4SJZo050sDV8maJmMJgI14SA7JIyOTQVrIZRIkgwLIaTK3Jw2L4c6ZjcI5NSip3IW7V9Qhb1oFgBHEMuku550MKyeR0tWAhWSRIuSULUVe+VJI8oB5DYaDPLO6cZHDKlU+UtO09eP15fUAogwRk5G67GQUssbNwuh7njDNI5e7zx7dd+rDujfa4W09/MzOH++026SVhaNcrvKyopc3159bBCCXZKQjQA4Zj9ypy0DF/R0Xt71XE3n3o4PyZ43nglW7j7nOXAhVj89zu9cu+U/Bs0+/MH7KtH+/uvtw53/BEOkIUEDugjMnH9QXn9ZJgYgGJS5aPW5rdWtXsKR4jPvMsrnTlfKZ80eCmvHQgmyGeBTA7RJSlPHLtgPgRHDmjoMWE+c7TigjMrOiN3tuakD7/qpER5MWYvS9b+Fq9bX+L/UAJze+g1tKVuJqXTqyAd6TewEw3vyN/uCVilB/IONfhWVOWB0ylN7fALSnvgUXDn/0c/MnJzFAx77a2byuZufEuZu+m/dU7YmylVUvW2q3v+s/3lgfMM0ptH1cS16Vkbraj7U07/v2wAe/g2o6tN9X+/9G59nu8MSSfE9rMKxVO21ySZbLiofnPW6AguLtAnCadFpxHb22pmhJNBx5SRgC15IsyXCOcK8F8PXi+wp2ba5v9h851bbuh9Md/b5QXL07P/OVjYunRD5s6fGUTrg9XFz6gAuuUWNAoff7WrAD4pVwHb2y6ra3dU1fNTa/AJJkAYxEeP4CITSc7+iAw5lR9WJF8ZsAHCSDh8ycC33RFU679f1D1dMPIW/qAuRO24SkYPDGnqYd8J7YAeAs6RtqC2KGMLBk+WZUrt6DyrW7Eqzei4WPvQ5dCDCMmvyCiZEgT7g9Mc14kuZ7AAhAUhlch9BiCHUdR8cnG2i+HcA5EiC6FTeQoUUBKICIJxuw01zFQCVDEFM/EZmE0NPSQHwAosRHeoiXBEmc4Y0hAxis3YjTXAsDEEhIMFSE14bOTcKkm3xDNKIkg6g01pGUdchJJEDoMUAoMHSdIxyS4wylYiglG4kn6ccQsg6xeskQoFkYRtSe2HPKIlkg2AqvIwUNDvBc5dimULB/MpLq7fFZ7phQiIYDdZBlG1wZbsyaMQ9Wp5ttRM0AJH0BNFXNKRxfZCuZNNNs3+50wOn0QBcy/L52+Ho7occC0CXNfAZ0XYckSf60BWCjuixbcf+DqwBJgAINOO7Eubb98F5qg87qhcSVqwqyc7MR8AfWPL/81grB7ZIhyTaHral6y6+bhhnAgBACQrtovtM8EcJwQIsFYQiZxmEwJ7R4BDl5eXC5biqNRCKlgEAkFELwSv9UAMMNANaqIR72AQOOX5stgwEU8yHU1RDt4wwSMc+X+QvXI3vkZAAatm5ZDKUrrIIafgOaBhHpveogcrD6UKIdGgvEE1thANFQLwxPJz/rHOO9HEwhAEwTXfEBA+YRNgdElAEYUGMADTY2EmUjBsf7oPd3m+0IoZlzpNSAxga0SB+MASuRbHYah01DXaUxNPNwoif0iB96iAENwXsIE6S2BToniV4ZOBHDWCHiUZoaiHPlNlgZVDXbiocZwCVB530Mn3oA/kBRgubn5L8h65aJAk3oUGlCGAJmS1Y9DEmRIJmHUuoN2KOqhtqGo7haggZCAmrPdyeCyeYrPvd5YbPKHABUVQe3yT7sAO5M98FQIDD9Wi3SHBYMVsj4699ketyNQAB/R//oD9nHCW2twSEjAAAAAElFTkSuQmCC";
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABj1BMVEX///+hop/p6el0dXOXmJSTlJBqa2jY2NihoZ6XmJV2d3XX19egoZ6dnprOzs3X19aIiYeKiojQ0NDr6+vq6uqen51sbWqnp6WRko+cnZl0dHKMjIuur6yLjIro6Oh2dnTIyMh1dnRtbmupqajCwsLu7u6enpuWl5OGh4OgoZ2EhYJ0dXKHiIWHiIR6eniSk49ub2yam5hpameJioiNjoqlpqOkpaK9vr25uritrq18fXtvb22Ki4d1dnOOjou4uLZzc3Fra2mrq6irrKnPz8/t7e2lpaOQkY6mp6W7vLvOzs6CgoFubm1vb26bm5mYmJaZmpfFxcWVlpO6urrc3NzZ2dnT09PV1dXa2trg4ODz8/PW1tbJycnLy8u0tLTi4uLSvbq5ubnDw8OwsLC3t7fb29vw8PDR0dHv7+/f39+uRDqvRTzj4+Px8fGcnZrh4eGsrKv09PSioqHTwL2mGxvW19by8vJyc3Czs7Ojo6KfoJxubmyEhYPOuri4uLjS0tK9vb2en5tub254eXdub21rpm98AAAAAXRSTlMAQObYZgAAAr9JREFUeF7s0MUOwzAURNF+5DxTEIrMzPDhjRtZztqx1E2vNNuzmNZv+rf2Wl0epWgSEelxA9TkYQryEGcQLBBENfkC8kSjpO9L+8YKjatoQJQdXj5loKK1jffZvKHlvGhf3cuyEObrgOE0NT9rOQ47cuCalDP08KWFYAzPh30j30fjrtq6ptRiktwAcH3HZr47WjmOkv6nffPsbRoKozBva+oRO6NJS5OSpIWWTubee+/xxqgOqCBGQaobpUKOxIdW/udwrUgOX/jA7UGxeM8PeBQ90rWOc65DnURBuHZHoZnN+rGjS+oMJifl49tNRdZid8u7v9A+m6UTqycthWaVT5+/hLoJyi2Fbp9unpnyUvTOWqCPrig0zzZtci1K0d8ibXQ0kqBrLpFFCLQ/FpOxP/5H6FA/CZpHSSU7aKCQ/8a1uBbX4vpUTMZxjOubHhlTHkRI7iDMNZsHKMYIYR4/YqDQfv7CBEaIShGH7qGE+Ej0KEzIH9HiWlznD6PQ48tXQQfdnHZszOMpV3Js0PN6csVG9ZBDLhlG1soC92KiGFbMYK4J63r40NKvxbW4FtcOznXhNsw1m2dRrtXb3TkCoblwfgJXghfh1R3fr/FovBBxLa4LF1GuzelLRYwQs3T5ShWCLpSca6Ae4jg2oCykGxgELT1EOp+4FtfiWlxPgtD4DYwoixvY9eqwbGDSr+VdRlxncQO7sZi5Dazu2ERZ28DGvCHqIdL5xLW4Rt4Jzg4aKST7rhF33Wv0+4X0D3uAjhoJetYicq0BdKerbWS+kwhp37IWBi//z3AYaLLvruf6G9i9hftbKZo3NsNuoPENRzS/3m5xfwN7QD/cFM27nXK5MvK3qTQ66jf30fywujSA5kd+SyemIidCeMPnx3GC3tP0+/WTLQCaVd49fYZCzzx/gRLycvsVCj039/onvUF9K+HA7eQAAAAASUVORK5CYII%3D";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABqlBMVEX////09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb29vc29va2trZ2dnZ2NjY2NjX19fY2NfW19bW1tbX19bV1dXV1NTT09PS0tLR0dHQ0NDPz8/Ozs7Pzs7Ozs3MzMzLy8vJycnIyMjFxcXDw8PTv7zCwsLSvLm9vr29vb3Oube7vLu6urq5ubm5uri4uLi4uLa3t7e0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmnp6Wmp6WlpqOkpaKlpaOkpKOhop+ioqGgoZ2hoZ6goZ6foJyen5uen52enpudnpqcnZmcnZqam5ibm5mZmpeXmJWXmJSYmJaWl5OVlpOTlJCSk4+Rko+QkY6NjoqOjouNjYyMjYuKi4mLi4mKi4eIiYeHiIWHiISGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN1dnR2dnR0dXN0dXJ0dHJyc3Bzc3FvcG5vb21vb25ub25ub2xtbmtubmxubm1sbWpra2lqa2hpamewRT2vRDumHBymGxsjsLVTAAAAjnRSTlMA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0TDHVgAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAALNSURBVGiB7ZvpU9NAGIeJdAaR0pQudFu01FBPiki9Kop4gddCazCt0gxqVbCieE61SL3vg//Z7KZpwxc/sHnDLLO/mcx02plnMk9z/HbepK1NxseseZm/69B9jeyOxWJ9dONJ5rcbjTFOaNGopmEPgjJ/XOjpo9GEhpA3aIyOudivrkVZkvZP3DnccvLsvf1V0huym138irSE4xqls9kxjkyMULbjRP8U0Zy/EaWQqqo9G05vepyyHd/X6+d3MSHWNhgKKIrSvvF0D50ZaTmZefJyEdvoveEAb0JD4y127ubjzxVsHXzWTncqCi+7Oz1BHWToeZkzyvdrD/spGndu497tQO9pdpysWWhipVSrUSF4hwfo8Ng6NCGrDN3Vzo/ucaH1OybRfzIhAqFZVmwh/GS/0G4h4qCla//Q0rV/aEFd37WE/AIRYpRNYvwAc322H0aITqbiCAZt3tiDEIiQ2ZMHNCD0kt1dIYTUIdEalJAVSLR0vRVcR+DQk/vBTvTXT1NQl6dSdQEDXVT1UrUSh+oh5tsvMDcw0yQECA1YFnRC9LponU9M17JfB6TrzUJL1/6hoV1XwVxfGIByfTkO00PIFbq2AxEye2QAqvMtw5Vg0OoOVoJBl0nS9VZwHYFzfQ7sRF96sYCB0IVHHxozMIDr9YNqZSfUvbFUhbmBuWdgHqNlD/EPLV37h5au/UNL1/6hoV1/F20GZkXAGVjhlIgzMEH7tVzLSNf/Rws5A1t+J+IMjK6SFoWbgdF7oyF7iOx8m4GWrv1Di/9MsDhogV2vwj3r/oahgx7sdTjbROeM8nzuYoIJUTu4yYrqQhfvzV9tzMBwaDs3Gw030fl8/lJjBoZwItTB8QYHe4sjhZromcJx5KCt/VaDwS6OqIOohdafN0swY3NF24dc6OI3N9qzUPStjwfZ56T36Lm5YSj07elDUEJOjI6CoP8Bxks+VXu6zlMAAAAASUVORK5CYII=";
                                    break;
                            }

                            this.toolBarParent = this._armyBar.getLayoutParent().getLayoutParent().getLayoutParent();

                            if (this.toolBarMouse) { // REVIEW added toolBarMouseRemove
                                this.toolBarParent.remove(this.toolBarMouse);
                            }
                            if (this.repairInfo) {
                                playArea.remove(this.repairInfo);
                            }
                            // Repair Time Infobox
                            this.repairInfo = new qx.ui.container.Composite();
                            var layout = new qx.ui.layout.Grid();
                            layout.setColumnAlign(0, "right", "middle");
                            //layout.setColumnFlex(0, 1);
                            //layout.setColumnWidth(1, 70);
                            this.repairInfo.setLayout(layout);
                            this.repairInfo.setThemedFont("bold");
                            this.repairInfo.set({
                                visibility: false
                            });
                            //this.repairInfo.setThemedBackgroundColor("#eef");
                            // Available Repair Label
                            this.repairInfo.add(new qx.ui.basic.Image("webfrontend/ui/icons/icn_repair_off_points.png"), {
                                row: 0,
                                column: 1
                            });
                            this.labels.repairinfos.available = new qx.ui.basic.Label("100").set({
                                textColor: "white"
                            });
                            this.repairInfo.add(this.labels.repairinfos.available, {
                                row: 0,
                                column: 0
                            });
                            // Max Infantry Repaircharge Label
                            this.repairInfo.add(new qx.ui.basic.Image("webfrontend/ui/icons/icon_res_repair_inf.png"), {
                                row: 1,
                                column: 1
                            });
                            this.labels.repairinfos.infantry = new qx.ui.basic.Label("100").set({
                                textColor: "white"
                            });
                            this.repairInfo.add(this.labels.repairinfos.infantry, {
                                row: 1,
                                column: 0
                            });
                            // Max Vehicle Repaircharge Label
                            this.repairInfo.add(new qx.ui.basic.Image("webfrontend/ui/icons/icon_res_repair_tnk.png"), {
                                row: 2,
                                column: 1
                            });
                            this.labels.repairinfos.vehicle = new qx.ui.basic.Label("100").set({
                                textColor: "white"
                            });
                            this.repairInfo.add(this.labels.repairinfos.vehicle, {
                                row: 2,
                                column: 0
                            });
                            // Max Air Repaircharge Label
                            this.repairInfo.add(new qx.ui.basic.Image("webfrontend/ui/icons/icon_res_repair_air.png"), {
                                row: 3,
                                column: 1
                            });
                            this.labels.repairinfos.aircraft = new qx.ui.basic.Label("100").set({
                                textColor: "white"
                            });
                            this.repairInfo.add(this.labels.repairinfos.aircraft, {
                                row: 3,
                                column: 0
                            });
                            playArea.add(this.repairInfo, {
                                bottom: 180,
                                right: 3
                            });
                            // Toolbar // NOTE TOOLBAR
                            this.toolBar = new qx.ui.container.Composite();
                            this.toolBar.setLayout(new qx.ui.layout.Grid());
                            this.toolBar.set({
                                decorator: new qx.ui.decoration.Decorator().set({
                                    backgroundImage: "FactionUI/menues/victory_screen/bgr_victscr_header.png"
                                }),
                                visibility: "hidden",
                                ZIndex: 10,
                                padding: 10,
                                paddingBottom: 4
                            });

                            this.toolBarMouse = new qx.ui.container.Composite();
                            this.toolBarMouse.setLayout(new qx.ui.layout.Canvas());
                            this.toolBarMouse.setZIndex(12);
                            this.toolBarMouse.setHeight(53);
                            this.toolBarMouse.setWidth(this.TOOL_BAR_WIDTH);
                            this.toolBarParent.add(this.toolBarMouse, {
                                bottom: this.TOOL_BAR_HIGH,
                                left: (playAreaWidth - this.TOOL_BAR_WIDTH) / 2
                            });
                            this.toolBarMouse.add(this.toolBar);
                            if (!this.ArmySetupAttackBar.isVisible()) this.toolBarMouse.exclude();

                            this.initToolBarListeners();

                            // (De)activate All Button
                            this.buttons.attack.activateAll = new qx.ui.form.ToggleButton("", "FactionUI/icons/icon_disable_unit_active.png");
                            this.buttons.attack.activateAll.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Deactivate All") + "</strong>"
                            });
                            this.buttons.attack.activateAll.addListener("changeValue", function () {
                                var btnActivateAll = this.buttons.attack.activateAll;
                                if (!btnActivateAll.getValue()) {
                                    btnActivateAll.setOpacity(1);
                                    btnActivateAll.setToolTipText("<strong>" + lang("Deactivate All") + "</strong>");
                                } else {
                                    btnActivateAll.setOpacity(0.75);
                                    btnActivateAll.setToolTipText("<strong>" + lang("Activate All") + "</strong>");
                                }
                            }, this);
                            this.buttons.attack.activateAll.addListener("execute", function () {
                                var btnActivateAll = this.buttons.attack.activateAll;
                                if (this.buttons.attack.activateInfantry.getValue() !== btnActivateAll.getValue()) {
                                    this.buttons.attack.activateInfantry.setValue(btnActivateAll.getValue());
                                }
                                if (this.buttons.attack.activateVehicles.getValue() !== btnActivateAll.getValue()) {
                                    this.buttons.attack.activateVehicles.setValue(btnActivateAll.getValue());
                                }
                                if (this.buttons.attack.activateAir.getValue() !== btnActivateAll.getValue()) {
                                    this.buttons.attack.activateAir.setValue(btnActivateAll.getValue());
                                }
                            }, this);
                            // (De)activate Infantry Button
                            this.buttons.attack.activateInfantry = new qx.ui.form.ToggleButton("", "FactionUI/icons/icon_alliance_bonus_inf.png");
                            this.buttons.attack.activateInfantry.set({
                                width: 44,
                                height: 40,
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Deactivate Infantry") + "</strong>"
                            });
                            this.buttons.attack.activateInfantry.addListener("changeValue", function () {
                                var btnActivateInfantry = this.buttons.attack.activateInfantry;
                                if (btnActivateInfantry.getValue() === this.buttons.attack.activateVehicles.getValue() && btnActivateInfantry.getValue() === this.buttons.attack.activateAir.getValue()) {
                                    this.buttons.attack.activateAll.setValue(btnActivateInfantry.getValue());
                                }
                                this.activateUnits('infantry', !btnActivateInfantry.getValue());
                                if (!btnActivateInfantry.getValue()) {
                                    btnActivateInfantry.setOpacity(1);
                                    btnActivateInfantry.setToolTipText("<strong>" + lang("Deactivate Infantry") + "</strong>");
                                } else {
                                    btnActivateInfantry.setOpacity(0.75);
                                    btnActivateInfantry.setToolTipText("<strong>" + lang("Activate Infantry") + "</strong>");
                                }
                            }, this);
                            // (De)activate Vehicles Button
                            this.buttons.attack.activateVehicles = new qx.ui.form.ToggleButton("", "FactionUI/icons/icon_alliance_bonus_tnk.png");
                            this.buttons.attack.activateVehicles.set({
                                width: 44,
                                height: 40,
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Deactivate Vehicles") + "</strong>"
                            });
                            this.buttons.attack.activateVehicles.addListener("changeValue", function () {
                                var btnActivateVehicles = this.buttons.attack.activateVehicles;
                                if (btnActivateVehicles.getValue() === this.buttons.attack.activateInfantry.getValue() && btnActivateVehicles.getValue() === this.buttons.attack.activateAir.getValue()) {
                                    this.buttons.attack.activateAll.setValue(btnActivateVehicles.getValue());
                                }
                                this.activateUnits('vehicles', !btnActivateVehicles.getValue());
                                if (!btnActivateVehicles.getValue()) {
                                    btnActivateVehicles.setOpacity(1);
                                    btnActivateVehicles.setToolTipText("<strong>" + lang("Deactivate Vehicles") + "</strong>");
                                } else {
                                    btnActivateVehicles.setOpacity(0.75);
                                    btnActivateVehicles.setToolTipText("<strong>" + lang("Activate Vehicles") + "</strong>");
                                }
                            }, this);
                            // (De)activate Air Button
                            this.buttons.attack.activateAir = new qx.ui.form.ToggleButton("", "FactionUI/icons/icon_alliance_bonus_air.png");
                            this.buttons.attack.activateAir.set({
                                width: 44,
                                height: 40,
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Deactivate Air") + "</strong>"
                            });
                            this.buttons.attack.activateAir.addListener("changeValue", function () {
                                var btnActivateAir = this.buttons.attack.activateAir;
                                if (btnActivateAir.getValue() === this.buttons.attack.activateInfantry.getValue() && btnActivateAir.getValue() === this.buttons.attack.activateVehicles.getValue()) {
                                    this.buttons.attack.activateAll.setValue(btnActivateAir.getValue());
                                }
                                this.activateUnits('air', !btnActivateAir.getValue());
                                if (!btnActivateAir.getValue()) {
                                    btnActivateAir.setOpacity(1);
                                    btnActivateAir.setToolTipText("<strong>" + lang("Deactivate Air") + "</strong>");
                                } else {
                                    btnActivateAir.setOpacity(0.75);
                                    btnActivateAir.setToolTipText("<strong>" + lang("Activate Air") + "</strong>");
                                }
                            }, this);
                            // Reset Formation Button
                            this.buttons.attack.formationReset = new qx.ui.form.Button("", resetIcon);
                            this.buttons.attack.formationReset.set({
                                width: 44,
                                height: 40,
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Reset Formation") + "</strong>"
                            });
                            this.buttons.attack.formationReset.addListener("click", this.resetFormation, this);
                            // Flip Horizontal Button
                            this.buttons.attack.flipHorizontal = new qx.ui.form.Button("", iconFlipHorizontal);
                            this.buttons.attack.flipHorizontal.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Flip Horizontal") + "</strong>"
                            });
                            this.buttons.attack.flipHorizontal.addListener("click", function () {
                                this.flipFormation('horizontal');
                            }, this);
                            // Flip Vertical Button
                            this.buttons.attack.flipVertical = new qx.ui.form.Button("", iconFlipVertical);
                            this.buttons.attack.flipVertical.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Flip Vertical") + "</strong>"
                            });
                            this.buttons.attack.flipVertical.addListener("click", function () {
                                this.flipFormation('vertical');
                            }, this);
                            // Repair Mode Button
                            this.buttons.attack.repairMode = new qx.ui.form.ToggleButton("", "FactionUI/icons/icon_mode_repair_active.png");
                            this.buttons.attack.repairMode.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Activate Repair Mode") + "</strong>"
                            });
                            this.buttons.attack.repairMode.addListener("execute", this.toggleRepairMode, this);
                            this.buttons.attack.repairMode.addListener("changeValue", function () {
                                var btnRepairMode = this.buttons.attack.repairMode;
                                if (!btnRepairMode.getValue()) {
                                    btnRepairMode.setToolTipText("<strong>" + lang("Deactivate Repair Mode") + "</strong>");
                                } else {
                                    btnRepairMode.setToolTipText("<strong>" + lang("Activate Repair Mode") + "</strong>");
                                }
                            }, this);
                            // The new refresh button
                            this.buttons.attack.toolbarRefreshStats = new qx.ui.form.Button("", iconRefresh);
                            this.buttons.attack.toolbarRefreshStats.addListener("click", this.refreshStatistics, this);
                            this.buttons.attack.toolbarRefreshStats.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Refresh Stats") + "</strong>"
                            });
                            // The new stats window button
                            this.buttons.attack.toolbarShowStats = new qx.ui.form.Button("", statsIcon);
                            this.buttons.attack.toolbarShowStats.addListener("click", this.toggleTools, this);
                            this.buttons.attack.toolbarShowStats.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                toolTipText: "<strong>" + lang("Open Stats Window") + "</strong>"
                            });
                            // Undo
                            this.buttons.attack.toolbarUndo = new qx.ui.form.Button("", undoIcon);
                            this.buttons.attack.toolbarUndo.addListener("click", function () {
                                console.log("Undo");
                            }, this);
                            this.buttons.attack.toolbarUndo.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                enabled: false,
                                toolTipText: "<strong>" + lang("Undo") + "</strong>"
                            });
                            // Redo (if possible)
                            this.buttons.attack.toolbarRedo = new qx.ui.form.Button("", redoIcon);
                            this.buttons.attack.toolbarRedo.addListener("click", function () {
                                console.log("Redo");
                            }, this);
                            this.buttons.attack.toolbarRedo.set({
                                width: 44,
                                height: 40,
                                padding: 0,
                                show: "icon",
                                appearance: "button-text-small",
                                enabled: false,
                                toolTipText: "<strong>" + lang("Redo") + "</strong>"
                            });
                            // Options Button
                            this.buttons.attack.options = new qx.ui.form.Button().set({
                                width: 44,
                                height: 40,
                                appearance: "button-text-small",
                                icon: "FactionUI/icons/icon_forum_properties.png",
                                toolTipText: "<strong>" + lang("Options") + "</strong>"
                            });
                            this.buttons.attack.options.addListener("click", this.toggleOptionsWindow, this);
                            this.toolBar.add(this.buttons.attack.flipVertical, {
                                row: 0,
                                column: 1
                            });
                            this.toolBar.add(this.buttons.attack.flipHorizontal, {
                                row: 0,
                                column: 2
                            });
                            this.toolBar.add(new qx.ui.core.Spacer().set({
                                width: 25
                            }), {
                                row: 0,
                                column: 3
                            });
                            this.toolBar.add(this.buttons.attack.activateAll, {
                                row: 0,
                                column: 4
                            });
                            this.toolBar.add(this.buttons.attack.activateInfantry, {
                                row: 0,
                                column: 5
                            });
                            this.toolBar.add(this.buttons.attack.activateVehicles, {
                                row: 0,
                                column: 6
                            });
                            this.toolBar.add(this.buttons.attack.activateAir, {
                                row: 0,
                                column: 7
                            });
                            this.toolBar.add(new qx.ui.core.Spacer().set({
                                width: 20
                            }), {
                                row: 0,
                                column: 8
                            });
                            this.toolBar.add(this.buttons.attack.toolbarRefreshStats, {
                                row: 0,
                                column: 9
                            });
                            this.toolBar.add(new qx.ui.core.Spacer().set({
                                width: 18
                            }), {
                                row: 0,
                                column: 10
                            });
                            // right bound buttons
                            this.toolBar.add(this.buttons.attack.options, {
                                row: 0,
                                column: 18
                            });
                            this.toolBar.add(new qx.ui.core.Spacer().set({
                                width: 10
                            }), {
                                row: 0,
                                column: 17
                            });
                            this.toolBar.add(this.buttons.attack.repairMode, {
                                row: 0,
                                column: 16
                            });
                            this.toolBar.add(this.buttons.attack.toolbarShowStats, {
                                row: 0,
                                column: 15
                            });
                            this.toolBar.add(new qx.ui.core.Spacer().set({
                                width: 10
                            }), {
                                row: 0,
                                column: 14
                            });
                            this.toolBar.add(this.buttons.attack.toolbarRedo, {
                                row: 0,
                                column: 13
                            });
                            this.toolBar.add(this.buttons.attack.toolbarUndo, {
                                row: 0,
                                column: 12
                            });
                            this.toolBar.add(this.buttons.attack.formationReset, {
                                row: 0,
                                column: 11
                            });
                            if (this.userInterface) {
                                this._armyBar.remove(this.userInterface);
                            }
                            // REVIEW Modded interface for bars
                            // by Netquik 
                            if (this.options.rightSide.getValue()) {
                                var canvasWidth = 75;
                                var interfaceBG = rightBG;
                                var buttonsLeftPosition = 5;
                                var shiftRRightPos = 0;
                                var shiftLRightPos = 30;
                                var shiftURightPos = 15;
                                var shiftDRightPos = 15;
                            } else {
                                var canvasWidth = 90;
                                var interfaceBG = leftBG;
                                var buttonsLeftPosition = 15;
                                var shiftRRightPos = 16;
                                var shiftLRightPos = 46;
                                var shiftURightPos = 30;
                                var shiftDRightPos = 30;
                            }
                            // Interface Canvas
                            this.userInterface = new qx.ui.container.Composite();
                            this.userInterface.setLayout(new qx.ui.layout.Canvas());
                            this.userInterface.setHeight(160);
                            this.userInterface.setWidth(canvasWidth);
                            this.userInterface.set({
                                decorator: new qx.ui.decoration.Decorator().set({
                                    backgroundImage: interfaceBG

                                }),
                                zIndex: 12
                            });
                            // REVIEW Place right/left bars on change
                            // by Netquik
                            if (this.rightBGbar) {
                                this._armyBar.remove(this.rightBGbar);
                            }
                            this.rightBGbar = new qx.ui.container.Composite();
                            this.rightBGbar.setLayout(new qx.ui.layout.Canvas());
                            this.rightBGbar.setHeight(160);
                            if (this.options.rightSide.getValue()) {
                                this.rightBGbar.setWidth(100);
                                this.rightBGbar.set({
                                    decorator: new qx.ui.decoration.Decorator().set({
                                        backgroundImage: rightBG,
                                        backgroundRepeat: "scale"
                                    })
                                });
                                this._armyBar.add(this.rightBGbar, {
                                    top: 40,
                                    right: 0
                                });
                                this.userInterface.setPaddingLeft(10);
                                this._armyBar.add(this.userInterface, {
                                    top: 40,
                                    right: 65
                                });
                                if (this.leftBGbar) {
                                    this._armyBar.remove(this.leftBGbar);
                                }
                                this.leftBGbar = new qx.ui.container.Composite();
                                this.leftBGbar.setLayout(new qx.ui.layout.Canvas());
                                this.leftBGbar.setHeight(160);
                                this.leftBGbar.setWidth(90);
                                this.leftBGbar.set({
                                    decorator: new qx.ui.decoration.Decorator().set({
                                        backgroundImage: leftBG,
                                    })
                                });
                                this._armyBar.add(this.leftBGbar, {
                                    top: 40,
                                    left: 5
                                });


                                // MOD cntWaves manage 
                                // by Netquik
                                //var TRwave = qx.locale.Manager.tr("tnf:army wave 1");
                                //TRwave = TRwave.substring(0, TRwave.indexOf(' '));
                                var match;
                                for (i = 0; i < this.ArmySetupAttackBarMainChildren.length - 1; i++) {
                                    var wavechild = this.ArmySetupAttackBarMainChildren[i];
                                    findwave = wavechild._hasChildren() && wavechild.basename === "Composite" ? wavechild.getChildren()[0].$$user_value : false;
                                    this.cntWave = (typeof (findwave) === 'string' && (match = findwave.match(/.+\s{1}([1-4]{1})/))) ? true : false;
                                    if (this.cntWave) {
                                        wavechild.setZIndex(12);
                                        if (match[1] === "1") wavechild.setPaddingTop(7);
                                        wavechild.setPaddingLeft(5);
                                        if (match[1] === "4") break;
                                    }

                                }
                            } else {
                                this.rightBGbar.setWidth(canvasWidth);
                                this.rightBGbar.set({
                                    decorator: new qx.ui.decoration.Decorator().set({
                                        backgroundImage: rightBG,
                                    })
                                });
                                this._armyBar.add(this.rightBGbar, {
                                    top: 40,
                                    right: 0
                                });
                                this._armyBar.add(this.userInterface, {
                                    top: 40,
                                    left: 5
                                });
                            }
                            // Simulate Button
                            this.buttons.attack.simulate = new qx.ui.form.Button();
                            this.buttons.attack.simulate.set({
                                width: 58,
                                height: 37,
                                appearance: "button-baseviews",
                                icon: "FactionUI/icons/icon_play.png",
                                toolTipText: lang("Start Combat Simulation")
                            });
                            this.buttons.attack.simulate.addListener("click", this.startSimulation, this);
                            // Tools Button
                            this.buttons.attack.tools = new qx.ui.form.Button(lang("Stats"));
                            this.buttons.attack.tools.set({
                                width: 58,
                                appearance: "button-text-small",
                                toolTipText: lang("Open Simulator Tools")
                            });
                            this.buttons.attack.tools.addListener("click", this.toggleTools, this);
                            //Shift Buttons
                            this.buttons.shiftFormationLeft = new qx.ui.form.Button("<");
                            this.buttons.shiftFormationLeft.set({
                                width: 30,
                                appearance: "button-text-small",
                                toolTipText: lang("Shift units left")
                            });
                            this.buttons.shiftFormationLeft.addListener("click", function () {
                                this.shiftFormation('l');
                            }, this);
                            this.buttons.shiftFormationRight = new qx.ui.form.Button(">");
                            this.buttons.shiftFormationRight.set({
                                width: 30,
                                appearance: "button-text-small",
                                toolTipText: lang("Shift units right")
                            });
                            this.buttons.shiftFormationRight.addListener("click", function () {
                                this.shiftFormation('r');
                            }, this);
                            this.buttons.shiftFormationUp = new qx.ui.form.Button("^");
                            this.buttons.shiftFormationUp.set({
                                width: 30,
                                appearance: "button-text-small",
                                toolTipText: lang("Shift units up")
                            });
                            this.buttons.shiftFormationUp.addListener("click", function () {
                                this.shiftFormation('u');
                            }, this);
                            this.buttons.shiftFormationDown = new qx.ui.form.Button("v");
                            this.buttons.shiftFormationDown.set({
                                width: 30,
                                appearance: "button-text-small",
                                toolTipText: lang("Shift units down")
                            });
                            this.buttons.shiftFormationDown.addListener("click", function () {
                                this.shiftFormation('d');
                            }, this);
                            var temp = localStorage.ta_sim_showShift;
                            if (temp) {
                                temp = JSON.parse(localStorage.ta_sim_showShift);
                            } else {
                                temp = true;
                            }
                            if (temp) {
                                this.userInterface.add(this.buttons.shiftFormationUp, {
                                    top: 16,
                                    right: shiftURightPos
                                });
                                this.userInterface.add(this.buttons.shiftFormationLeft, {
                                    top: 35,
                                    right: shiftLRightPos
                                });
                                this.userInterface.add(this.buttons.shiftFormationRight, {
                                    top: 35,
                                    right: shiftRRightPos
                                });
                                this.userInterface.add(this.buttons.shiftFormationDown, {
                                    top: 54,
                                    right: shiftDRightPos
                                });
                            }
                            this.userInterface.add(this.buttons.attack.tools, {
                                top: 82,
                                left: buttonsLeftPosition
                            });
                            this.userInterface.add(this.buttons.attack.simulate, {
                                top: 108,
                                left: buttonsLeftPosition
                            });
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    getAttackUnits: function () {
                        try {
                            var base_city = this._MainData.get_Cities().get_CurrentOwnCity();
                            var target_city = this._MainData.get_Cities().get_CurrentCity();
                            if (target_city != null) {
                                var target_city_id = target_city.get_Id();
                                var units = base_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(target_city_id);
                                // MOD Make sure get_ArmyUnits is a function
                                if (typeof units.get_ArmyUnits === "function") {
                                    this.view.lastUnits = units;
                                    this.view.lastUnitList = units.get_ArmyUnits().l;
                                }
                            }
                            this.attackUnitsLoaded = true;
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    optionPopup: function () {
                        localStorage.ta_sim_popup = JSON.stringify(this.options.autoDisplayStats.getValue());
                    },
                    optionShowShift: function () {
                        localStorage.ta_sim_showShift = JSON.stringify(this.options.showShift.getValue());
                        if (this.options.showShift.getValue()) {
                            this.setupInterface();
                        } else {
                            this.userInterface.remove(this.buttons.shiftFormationUp);
                            this.userInterface.remove(this.buttons.shiftFormationLeft);
                            this.userInterface.remove(this.buttons.shiftFormationRight);
                            this.userInterface.remove(this.buttons.shiftFormationDown);
                        }
                    },
                    optionAttackLock: function () {
                        try {
                            localStorage.ta_sim_attackLock = JSON.stringify(this.options.attackLock.getValue());
                            if (this.options.attackLock.getValue()) {
                                this._armyBar.add(this.buttons.attack.unlock, {
                                    top: 148,
                                    right: 10
                                });
                            } else {
                                this._armyBar.remove(this.buttons.attack.unlock);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    optionRepairLock: function () {
                        try {
                            localStorage.ta_sim_repairLock = JSON.stringify(this.options.repairLock.getValue());
                            if (this.options.repairLock.getValue()) {
                                this._armyBar.add(this.buttons.attack.repair, {
                                    top: 63,
                                    right: 10
                                });
                            } else {
                                this._armyBar.remove(this.buttons.attack.repair);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    toggleTools: function () {
                        this.battleResultsBox.isVisible() ? this.battleResultsBox.close() : this.battleResultsBox.open();
                    },
                    toggleOptionsWindow: function () {
                        this.optionsWindow.isVisible() ? this.optionsWindow.close() : this.optionsWindow.open();
                    },
                    getAllUnitsDeactivated: function () {
                        var f = this.getFormation();
                        var unitEnabled = false;
                        for (var i = 0; i < f.length; i++) {
                            if (f[i].e) {
                                unitEnabled = true;
                                break;
                            }
                        }
                        //console.log(unitEnabled);
                        if (unitEnabled) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    refreshStatistics: function () {
                        try {
                            var ownCity = this._MainData.get_Cities().get_CurrentOwnCity();
                            if (!this.getAllUnitsDeactivated() && ownCity.GetOffenseConditionInPercent() > 0) {
                                this.timerStart();
                                ClientLib.API.Battleground.GetInstance().SimulateBattle();
                                this.buttons.attack.refreshStats.setEnabled(false);
                                this.buttons.attack.toolbarRefreshStats.setEnabled(false);
                                this.buttons.attack.simulate.setEnabled(false);
                                this.labels.countDown.setWidth(110);
                                this.count = 10;
                                this.statsOnly = true;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    countDownToNextSimulation: function () {
                        try {
                            var _this = window.TACS.getInstance();
                            _this.count = _this.count - 1;
                            _this.labels.countDown.setWidth(_this.labels.countDown.getWidth() - 11);
                            if (_this.count <= 0) {
                                clearInterval(_this.counter);
                                _this.buttons.attack.refreshStats.setEnabled(true);
                                _this.buttons.attack.toolbarRefreshStats.setEnabled(true);
                                if (_this.warningIcon) {
                                    _this._armyBar.remove(_this.simulationWarning);
                                    _this.warningIcon = false;
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    formationChangeHandler: function () {
                        try {
                            var _this = this;
                            if (this.labels.countDown.getWidth() != 0) {
                                if (!_this.warningIcon) {
                                    // Simulation Warning
                                    _this.simulationWarning = new qx.ui.basic.Image("https://eaassets-a.akamaihd.net/cncalliancesgame/cdn/data/d75cf9c68c248256dfb416d8b7a86037.png");
                                    _this.simulationWarning.set({
                                        toolTipText: lang("Simulation will be based on most recently refreshed stats!")
                                    });
                                    if (this.options.rightSide.getValue()) {
                                        this._armyBar.add(_this.simulationWarning, {
                                            top: 122,
                                            right: 67
                                        });
                                    } else {
                                        this._armyBar.add(_this.simulationWarning, {
                                            top: 122,
                                            left: 27
                                        });
                                    }
                                    _this.warningIcon = true;
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    calculateLoot: function () {
                        try {
                            // Adapted from the CNC Loot script:
                            // http://userscripts.org/scripts/show/135953
                            //var city = this._MainData.get_Cities().get_CurrentCity(); // not used
                            var mod;
                            var spoils = {
                                1: 0,
                                2: 0,
                                3: 0,
                                6: 0,
                                7: 0
                            };
                            var loot = ClientLib.API.Battleground.GetInstance().GetLootFromCurrentCity();
                            for (var i in loot) {
                                spoils[loot[i].Type] += loot[i].Count;
                            }
                            this.stats.spoils.tiberium.setLabel(this.formatNumberWithCommas(spoils[1]));
                            this.stats.spoils.crystal.setLabel(this.formatNumberWithCommas(spoils[2]));
                            this.stats.spoils.credit.setLabel(this.formatNumberWithCommas(spoils[3]));
                            this.stats.spoils.research.setLabel(this.formatNumberWithCommas(spoils[6]));
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    getRepairCost: function (unitStartHealth, unitEndHealth, unitMaxHealth, unitLevel, unitMDBID) {
                        if (unitStartHealth != unitEndHealth) {
                            if (unitEndHealth > 0) {
                                var damageRatio = ((unitStartHealth - unitEndHealth) / 16) / unitMaxHealth;
                            } else {
                                var damageRatio = ((unitStartHealth / 16) / unitMaxHealth);
                            }
                            var repairCosts = ClientLib.API.Util.GetUnitRepairCosts(unitLevel, unitMDBID, damageRatio);
                            // var crystal = 0;  // crystal didn't use, only RT
                            var repairTime = 0;
                            for (var j = 0; j < repairCosts.length; j++) {
                                var c = repairCosts[j];
                                var type = parseInt(c.Type);
                                switch (type) {
                                    /*case ClientLib.Base.EResourceType.Crystal: // crystal ddidn't use, only RT
                                    									crystal += c.Count;
                                    									break;*/
                                    case ClientLib.Base.EResourceType.RepairChargeBase:
                                    case ClientLib.Base.EResourceType.RepairChargeInf:
                                    case ClientLib.Base.EResourceType.RepairChargeVeh:
                                    case ClientLib.Base.EResourceType.RepairChargeAir:
                                        repairTime += c.Count;
                                        break;
                                }
                            }
                            return repairTime;
                        }
                        return 0;
                    },
                    setLabelColor: function (obj, val, dir) {
                        var colors = ['green', 'blue', 'black', 'red'];
                        var color = colors[0];
                        var v = val;
                        if (dir >= 0) v = 100.0 - v;
                        if (v > 99.99) color = colors[3];
                        else if (v > 50) color = colors[2];
                        else if (v > 0) color = colors[1];
                        obj.setTextColor(color);
                    },
                    updateLabel100: function (obj, val, dir) {
                        this.setLabelColor(obj, val, dir);
                        val = Math.ceil(val * 100) / 100;
                        obj.setValue(val.toFixed(2).toString());
                    },
                    updateLabel100time: function (obj, val, dir, time) {
                        var s = val.toFixed(2).toString() + " @ " + webfrontend.phe.cnc.Util.getTimespanString(time);
                        this.setLabelColor(obj, val, dir);
                        obj.setValue(s);
                    },
                    updateStatsWindow: function () {
                        var _this = this;
                        var colors = ['black', 'blue', 'green', 'red'];
                        var s = "";
                        var n = 0;
                        if (this.stats.damage.structures.construction === 0) {
                            s = lang("Total Victory");
                            n = 0;
                        } else if (this.stats.damage.structures.overall < 100) {
                            s = lang("Victory");
                            n = 1;
                        } else {
                            s = lang("Total Defeat");
                            n = 3;
                        }
                        this.labels.damage.outcome.setValue(s);
                        this.labels.damage.outcome.setTextColor(colors[n]);
                        this.updateLabel100(this.labels.damage.overall, this.stats.damage.overall, -1);
                        this.updateLabel100(this.labels.damage.units.overall, this.stats.damage.units.overall, -1);
                        this.updateLabel100(this.labels.damage.structures.overall, this.stats.damage.structures.overall, -1);
                        this.updateLabel100(this.labels.damage.structures.construction, this.stats.damage.structures.construction, -1);
                        this.updateLabel100(this.labels.damage.structures.defense, this.stats.damage.structures.defense, -1);
                        // Command Center
                        if (this.view.playerCity) this.updateLabel100(this.labels.damage.structures.command, this.stats.damage.structures.command, -1);
                        else {
                            this.labels.damage.structures.command.setValue("--");
                            this.labels.damage.structures.command.setTextColor("green");
                        }
                        // SUPPORT
                        var SLabel = (this.stats.supportLevel > 0) ? this.stats.supportLevel.toString() : '--';
                        this.labels.supportLevel.setValue(lang('Support lvl ') + SLabel + ': ');
                        this.updateLabel100(this.labels.damage.structures.support, this.stats.damage.structures.support, -1);
                        // AVAILABLE RT
                        this.labels.repair.available.setValue(webfrontend.phe.cnc.Util.getTimespanString(this.stats.repair.available));
                        // AVAILABLE ATTACKS
                        this.labels.attacks.available.setValue('CP:' + this.stats.attacks.availableAttacksCP + ' / F:' + this.stats.attacks.availableAttacksAtFullStrength + '/ C:' + this.stats.attacks.availableAttacksWithCurrentRepairCharges);
                        // OVERALL
                        this.updateLabel100time(this.labels.health.overall, this.stats.health.overall, 1, this.stats.repair.overall);
                        // INF
                        this.updateLabel100time(this.labels.health.infantry, this.stats.health.infantry, 1, this.stats.repair.infantry);
                        // VEH
                        this.updateLabel100time(this.labels.health.vehicle, this.stats.health.vehicle, 1, this.stats.repair.vehicle);
                        // AIR
                        this.updateLabel100time(this.labels.health.aircraft, this.stats.health.aircraft, 1, this.stats.repair.aircraft);
                        // BATTLE TIME
                        setTimeout(function () {
                            _this.stats.time = _this._VisMain.get_Battleground().get_BattleDuration() / 1000;
                            _this.setLabelColor(_this.labels.time, _this.stats.time / 120.0, -1); // max is 120s
                            _this.labels.time.setValue(_this.stats.time.toFixed(2).toString());
                        }, 1);
                        //this.saveUndoState();
                    },
                    formatNumberWithCommas: function (x) {
                        return Math.floor(x).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    },
                    /* Not used:
                    					formatSecondsAsTime: function (secs, format) {
                    					var hr = Math.floor(secs / 3600);
                    					var min = Math.floor((secs - (hr * 3600)) / 60);
                    					var sec = Math.floor(secs - (hr * 3600) - (min * 60));
                    					if (hr < 10) hr = "0" + hr;
                    					if (min < 10) min = "0" + min;
                    					if (sec < 10) sec = "0" + sec;
                    					if (format !== null) {
                    					var formatted_time = format.replace('hh', hr);
                    					formatted_time = formatted_time.replace('h', hr * 1 + "");
                    					formatted_time = formatted_time.replace('mm', min);
                    					formatted_time = formatted_time.replace('m', min * 1 + "");
                    					formatted_time = formatted_time.replace('ss', sec);
                    					formatted_time = formatted_time.replace('s', sec * 1 + "");
                    					return formatted_time;
                    					} else {
                    					return hr + ':' + min + ':' + sec;
                    					}
                    					},
                    					 */
                    unlockAttacks: function () {
                        this._armyBar.remove(this.buttons.attack.unlock);
                        var _this = this;
                        setTimeout(function () {
                            _this._armyBar.add(_this.buttons.attack.unlock);
                        }, 2000);
                    },
                    unlockRepairs: function () {
                        this._armyBar.remove(this.buttons.attack.repair);
                        var _this = this;
                        setTimeout(function () {
                            _this._armyBar.add(_this.buttons.attack.repair);
                        }, 5000);
                    },
                    /*calculateDefenseBonus : function (context, data) {
                    						try {
                    							var score = data.rpois[6].s;
                    							var rank = data.rpois[6].r;
                    							this.view.playerCityDefenseBonus = Math.round(ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(ClientLib.Base.EPOIType.DefenseBonus, rank, score));
                    						} catch (e) {
                    							console.log(e);
                    						}
                    					},*/
                    hideAll: function () {
                        if (this.buttons.attack.repairMode.getValue()) this.buttons.attack.repairMode.execute();
                        if (this.battleResultsBox.isVisible()) this.battleResultsBox.close();
                        if (this.resourceLayoutWindow.isVisible()) this.resourceLayoutWindow.close();
                        if (this.optionsWindow.isVisible()) this.optionsWindow.close();

                    },
                    gameOverlaysToFront: function () {
                        webfrontend.gui.reports.ReportsOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.mail.MailOverlay.getInstance().setZIndex(20);
                        //webfrontend.gui.mail.MailMessageOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.alliance.AllianceOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.forum.ForumOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.research.ResearchOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.monetization.ShopOverlay.getInstance().setZIndex(20);
                        webfrontend.gui.ranking.RankingOverlay.getInstance().setZIndex(20);
                    },
                    ownCityChangeHandler: function (oldId, newId) {
                        console.log("CurrentOwnChange event");
                        if (this.ArmySetupAttackBar.isVisible()) {
                            this.buttons.attack.refreshStats.setEnabled(false);
                            this.buttons.attack.toolbarRefreshStats.setEnabled(false);
                            this.buttons.attack.simulate.setEnabled(false);
                            this.onCityLoadComplete();
                            this.resetDisableButtons();
                        }
                    },
                    //onViewChange
                    viewChangeHandler: function (oldMode, newMode) {
                        //console.log("ViewModeChange event");
                        this.curViewMode = newMode;
                        this.buttons.attack.simulate.setEnabled(false);
                        this.buttons.attack.refreshStats.setEnabled(false);
                        this.buttons.attack.toolbarRefreshStats.setEnabled(false);
                        try {
                            this.hideAll();
                            //this.getAvailableRepairAndCP();
                            switch (newMode) {
                                /*
                                								case ClientLib.Vis.Mode.None:
                                								break;
                                								case ClientLib.Vis.Mode.City: //own base
                                								break;
                                								case ClientLib.Vis.Mode.Region: //the map
                                								break;
                                								 */
                                case ClientLib.Vis.Mode.Battleground:
                                    // 3: while attacking or simming
                                    this.curPAVM = qx.core.Init.getApplication().getPlayArea().getViewMode();
                                    this.onCityLoadComplete();
                                    break;
                                    /*
                                    								case ClientLib.Vis.Mode.ArmySetup: //in own base / add upgrade units
                                    								break;
                                    								case ClientLib.Vis.Mode.DefenseSetup:
                                    								break;
                                    								case ClientLib.Vis.Mode.World: //world button
                                    								break;
                                    								 */
                                case ClientLib.Vis.Mode.CombatSetup:
                                    // 7: formation setup
                                    this.curPAVM = qx.core.Init.getApplication().getPlayArea().getViewMode();
                                    this.onCityLoadComplete();
                                    break;
                            }
                            //console.log("\nViewMode: " + ClientLib.Vis.VisMain.GetInstance().get_Mode() + "\n");
                            //console.log("curPAVM: " + this.curPAVM);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    resetDisableButtons: function () {
                        try {
                            if (this.buttons.attack.activateInfantry.getValue(true)) this.buttons.attack.activateInfantry.setValue(false);
                            if (this.buttons.attack.activateVehicles.getValue(true)) this.buttons.attack.activateVehicles.setValue(false);
                            if (this.buttons.attack.activateAir.getValue(true)) this.buttons.attack.activateAir.setValue(false);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    onCityLoadComplete: function () {
                        try {
                            var _this = this;
                            //console.log("Running onCityLoadComplete...");
                            if (this._VisMain.GetActiveView().get_VisAreaComplete()) {
                                /*setTimeout(function () {
                                									var cbtSetup = ClientLib.Vis.VisMain.GetInstance().get_CombatSetup(); // No longer needed. They've fixed the issue in-game. Leaving here just in case.
                                									cbtSetup.SetPosition(0, cbtSetup.get_MinYPosition() + cbtSetup.get_DefenseOffsetY() * cbtSetup.get_GridHeight());
                                									//qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA).getLayoutParent().setZIndex(1);
                                								}, 500);*/
                                this.checkAttackRange();
                                // MOD FIX error can't get getAttackUnits
                                if (this.curPAVM > 3 && this.curPAVM != 7) {
                                    this.showCombatTools();
                                    var currentcity = this._MainData.get_Cities().get_CurrentCity();
                                    if (currentcity != null) {
                                        var ownCity = this._MainData.get_Cities().get_CurrentOwnCity();
                                        var cityFaction = currentcity.get_CityFaction();
                                        /* this.stats.attacks.attackCost = ownCity.CalculateAttackCommandPointCostToCoord(currentcity.get_PosX(), currentcity.get_PosY()); */
                                        // MOD Fix FOR CP Calculation on PLAYERS
                                        this.stats.attacks.attackCost = ownCity.CalculateAttackCommandPointCostToCoord(currentcity.get_PosX(), currentcity.get_PosY(), cityFaction === ClientLib.Base.EFactionType.GDIFaction || cityFaction === ClientLib.Base.EFactionType.NODFaction, true);
                                        this.getAvailableRepairAndCP();
                                        this.calculateLoot();
                                        this.updateLayoutsList();
                                        this.getAttackUnits();
                                        //if opened new city then reset disable buttons and calculate defense bonus
                                        if (this.targetCityId != null && this.targetCityId !== currentcity.get_Id()) {
                                            this.labels.repair.available.setValue(webfrontend.phe.cnc.Util.getTimespanString(this.stats.repair.available));
                                            //this.labels.attacks.available.setValue('CP:' + Math.floor(this.stats.attacks.availableCP / this.stats.attacks.attackCost) + ' / F:' + Math.floor(this.stats.repair.available / this.stats.repair.max) + '/ C:-');
                                            this.labels.attacks.available.setValue('CP:' + this.stats.attacks.availableAttacksCP + ' / F:' + this.stats.attacks.availableAttacksAtFullStrength + '/ C:-');
                                            this.resetDisableButtons();
                                            this.view.playerCity = cityFaction === ClientLib.Base.EFactionType.GDIFaction || cityFaction === ClientLib.Base.EFactionType.NODFaction;
                                            if (this.view.playerCity) {
                                                this.view.playerCityDefenseBonus = currentcity.get_AllianceDefenseBonus();
                                                /*var cityAllianceId = currentcity.get_OwnerAllianceId();
                                                												ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                                                													id : cityAllianceId
                                                												}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.calculateDefenseBonus), null);*/
                                            }
                                        }
                                        if (cityFaction >= 4 && cityFaction <= 6) this.createLayoutPreview();
                                        this.targetCityId = currentcity.get_Id();
                                    }
                                }
                                return;
                            }
                            setTimeout(function () {
                                _this.onCityLoadComplete();
                            }, 200);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    createLayoutPreview: function () {
                        try {
                            var fileManager = ClientLib.File.FileManager.GetInstance();
                            var images = {
                                0: fileManager.GetPhysicalPath('ui/menues/main_menu/misc_empty_pixel.png'),
                                1: fileManager.GetPhysicalPath('ui/common/icn_res_chrystal.png'),
                                2: fileManager.GetPhysicalPath('ui/common/icn_res_tiberium.png')
                            }
                            var currenLayout = this.getLayout();
                            var tibCount = currenLayout.match(/2/g).length;
                            switch (this._MainData.get_Player().get_Faction()) {
                                case ClientLib.Base.EFactionType.GDIFaction:
                                    var playerFaction = "G";
                                    break;
                                case ClientLib.Base.EFactionType.NODFaction:
                                    var playerFaction = "N";
                                    break;
                            }
                            var cncOptURL = "http://cnctaopt.com/?map=2~" + playerFaction + "~" + playerFaction + "~~" + this.encodeToCNCOpt(currenLayout) + "....................................~newEconomy";
                            var html = '<table border="2" cellspacing="0" cellpadding="0">';
                            for (var i = 0; i < 72; i++) {
                                var row = Math.floor(i / 9);
                                var column = i - Math.floor(i / 9) * 9;
                                if (column == 0) html += '<tr>';
                                html += '<td><img width="14" height="14" src="' + images[currenLayout.charAt(i)] + '"></td>';
                                if (column == 8) html += '</tr>';
                            }
                            html += '</table><a href="' + cncOptURL + '" target="_blank" style="color:#FFFFFF;">CNCTAOpt';
                            this.resourceLayout = new qx.ui.basic.Label().set({
                                backgroundColor: "#303030",
                                value: html,
                                padding: 10,
                                rich: true
                            });
                            if (tibCount == 7) {
                                this.resourceLayout.setBackgroundColor("#202820");
                            } else if (tibCount == 5) {
                                this.resourceLayout.setBackgroundColor("#202028");
                            }
                            this.resourceLayoutWindow.removeAll();
                            this.resourceLayoutWindow.add(this.resourceLayout);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    getLayout: function () {
                        try {
                            var resourceLayout = "";
                            for (var y = 0; y < 16; y++) {
                                for (var x = 0; x < 9; x++) {
                                    resourceLayout += this._MainData.get_Cities().get_CurrentCity().GetResourceType(x, y);
                                }
                            }
                            return resourceLayout;
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    encodeToCNCOpt: function (data) {
                        try {
                            var str = ".ct-jhlk";
                            for (var i = 0; i < 8; i++) {
                                var re = new RegExp(i, 'g');
                                var char = str.charAt(i);
                                data = data.replace(re, char);
                            }
                            return data;
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    showCombatTools: function () {
                        this.curPAVM = qx.core.Init.getApplication().getPlayArea().getViewMode();
                        //console.log("showCombatTools PAVM: " + this.curPAVM);
                        switch (this.curPAVM) {
                            //4 Scrolled up (when more than ~50% of the top is in view) this should never be the case
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupBase: {
                                console.log("!!!\n TACS Warning\n!!!\n onCityLoadComplete, unexpected case pavmCombatSetupBase");
                                break;
                            }
                            //5 Scrolled down -- normal combat setup
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense: {
                                if (this.options.autoDisplayStats.getValue()) {
                                    this.battleResultsBox.open();
                                }
                                if (this.options.showResourceLayoutWindow.getValue()) {
                                    this.resourceLayoutWindow.open();
                                }
                                break;
                            }
                            //6 While attacking a target
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatAttacker: {
                                if (this.options.autoDisplayStats.getValue() && this.saveObj.checkbox.showStatsDuringAttack) {
                                    this.battleResultsBox.open();

                                }
                                break;
                            }
                            //8
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatViewerAttacker: {
                                console.log("pavmCombatViewerAttacker");
                                break;
                            }
                            //9
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatViewerDefender: {
                                console.log("pavmCombatViewerDefender");
                                break;
                            }
                            //10 Watching a "sim" OR replay
                            //MOD not open statbox for replay not simulating and hide setup button
                            case ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay: {
                                var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                                if (city === null) {
                                    this.buttons.simulate.back.hide();
                                } else this.buttons.simulate.back.show();
                                if (this.saveObj.checkbox.showStatsDuringSimulation && city !== null) {
                                    console.log("simulation case 10");
                                    this.battleResultsBox.open();
                                }
                                break;
                            }
                        }
                    },
                    getAvailableRepairAndCP: function () {
                        try {
                            var ownCity = this._MainData.get_Cities().get_CurrentOwnCity();
                            var offHealth = ownCity.GetOffenseConditionInPercent();
                            var unitData = ownCity.get_CityUnitsData();
                            //var availableInfRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                            //var availableVehRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh);
                            //var availableAirRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir);
                            var maxInfRepairCharge = unitData.GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Infantry, false);
                            var maxVehRepairCharge = unitData.GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false);
                            var maxAirRepairCharge = unitData.GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false);
                            //this.stats.repair.available = this._MainData.get_Time().GetTimeSpan(Math.min(availableInfRT, availableAirRT, availableVehRT));
                            this.stats.repair.available = ClientLib.Base.Resource.GetResourceCount(ownCity.get_RepairOffenseResources().get_RepairChargeOffense());
                            this.stats.repair.max = this._MainData.get_Time().GetTimeSpan(Math.max(maxInfRepairCharge, maxAirRepairCharge, maxVehRepairCharge));
                            this.stats.attacks.availableCP = this._MainData.get_Player().GetCommandPointCount();
                            this.stats.attacks.availableAttacksCP = Math.floor(this.stats.attacks.availableCP / this.stats.attacks.attackCost);
                            this.stats.attacks.availableAttacksAtFullStrength = Math.floor(this.stats.repair.available / this.stats.repair.max) + 1;
                            this.stats.attacks.availableAttacksWithCurrentRepairCharges = Math.floor(this.stats.repair.available / this.stats.repair.overall) + 1;
                            if (offHealth !== 100) {
                                this.stats.attacks.availableAttacksAtFullStrength--;
                                this.stats.attacks.availableAttacksAtFullStrength += '*';
                            } // Decrease number of attacks by 1 when unit unhealthy. Borrowed from Maelstrom Tools - by krisan
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    returnSetup: function () {
                        // Set the scene again, just in case it didn't work the first time
                        try {
                            this._Application.getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, localStorage.ta_sim_last_city, 0, 0);
                        } catch (e) {
                            this._Application.getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, localStorage.ta_sim_last_city, 0, 0);
                            console.log(e);
                        }
                    },
                    //MOD close statbox for simple replays function
                    onAppear_replayBar: function () {
                        try {
                            var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            if (city === null) {
                                if (this.battleResultsBox.isVisible()) this.battleResultsBox.close();
                            }
                            //MOD REMOVE ORIGINAL SKIP BUTTON
                            null != this.ReplayBar[this.PBIS_SK] && this.ReplayBar[this.PBIS_SK].exclude();
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    checkAttackRange: function () {
                        try {
                            var cities = this._MainData.get_Cities();
                            var target_city = cities.get_CurrentCity();
                            if (target_city != null) {
                                var base_city = cities.get_CurrentOwnCity();
                                var attackDistance = ClientLib.Base.Util.CalculateDistance(target_city.get_PosX(), target_city.get_PosY(), base_city.get_PosX(), base_city.get_PosY());
                                if (attackDistance <= 10) {
                                    //console.log("Target in range");
                                    this.buttons.attack.simulate.setEnabled(true);
                                    if (this.count <= 0) {
                                        this.buttons.attack.refreshStats.setEnabled(true);
                                        this.buttons.attack.toolbarRefreshStats.setEnabled(true);
                                    }
                                } else {
                                    //console.log("Target Out of range");
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    //MOD New SKIP SIMULATION 1 by NetquiK
                    onTick_btnSkip: function () {
                        var bA = ClientLib.Vis.VisMain.GetInstance();
                        var bG = bA.get_Battleground();
                        if (this.curPAVM != ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay || bG.get_LastFrameTime() == 0) {
                            webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                            this.ReplayBar.setEnabled(true)
                            this.SkippingSim = null;
                            if (this.ResetAutoscroll) {
                                ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                ClientLib.Config.Main.GetInstance().SaveToDB();
                                this.ResetAutoscroll = 0;
                            }
                            return
                        }
                        if (bG.get_CombatComplete() == true && this.curPAVM == ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay) {
                            bG.SkipToEnd()
                            if (this.ResetAutoscroll) {
                                ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                ClientLib.Config.Main.GetInstance().SaveToDB();
                                this.ResetAutoscroll = 0;
                            }
                            if (this.TopAttackerPos) bA.SetPosition(0, this.TopAttackerPos);
                            window.setTimeout(function () {
                                qx.core.Init.getApplication().getPlayArea().autoScroll = 1
                            }, 1000);
                            this.ReplayBar.setEnabled(true)
                            this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().show();
                            webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                            this.SkippingSim = null;
                        }
                    },

                    //MOD New SKIP SIMULATION 2 by NetquiK
                    skipSimulation: function () {
                        try {
                            var bA = ClientLib.Vis.VisMain.GetInstance();
                            var bG = bA.get_Battleground();
                            //var bA = ClientLib.Vis.VisMain.GetInstance();
                            if (bG.get_Simulation !== undefined && bG.get_Simulation().DoStep !== undefined) {
                                if (!this.SkippingSim) {
                                    this.SkippingSim = true;
                                    if (bG.get_CombatComplete() == true) bG.RestartReplay();
                                    //this.TopAttackerPos = bA.get_PositionY() - 400;
                                    if (!this._playAreaChildren[11].isVisible()) {
                                        var overall = (this.stats.damage.overall / 100) * bG.get_ViewHeight();
                                        this.TopAttackerPos = this.stats.damage.overall < 25 ? bG.get_MinYPosition() : bG.get_MinYPosition() + overall;
                                    } else {
                                        this.TopAttackerPos = null;
                                    }
                                    webfrontend.phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onTick_btnSkip, this);
                                    this.ResetAutoscroll = this._PlayArea.getPlayerAutoScrollPreference();
                                    this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().hide();
                                    this.ReplayBar.setEnabled(false);
                                    this.buttons.simulate.back.setEnabled(true);
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 0);
                                    ClientLib.Config.Main.GetInstance().SaveToDB();
                                    while (bG.get_Simulation().DoStep(false)) {} //LIKE 
                                    this._PlayArea.autoScroll = 0
                                    bG.set_ReplaySpeed(10);
                                    //ClientLib.Vis.VisMain.GetInstance().get_Battleground().set_ReplaySpeed(10000); // AUTOCAMFAIL
                                }
                            } else {

                                bG.SkipToEnd();

                            }

                        } catch (e) {
                            console.log(e);
                        }
                    },
                    startSimulation: function () {
                        try {
                            if (PerforceChangelist >= 448942) {
                                var simTimeLimit = 3000;
                            } else {
                                var simTimeLimit = 10000;
                            }
                            if (Date.now() - this.lastSimulation > simTimeLimit) {
                                var ownCity = this._MainData.get_Cities().get_CurrentOwnCity();
                                if (!this.getAllUnitsDeactivated() && ownCity.GetOffenseConditionInPercent() > 0) {
                                    ClientLib.API.Battleground.GetInstance().SimulateBattle();
                                    this.buttons.attack.refreshStats.setEnabled(false);
                                    this.buttons.attack.toolbarRefreshStats.setEnabled(false);
                                    this.buttons.attack.simulate.setEnabled(false);
                                    this.labels.countDown.setWidth(110);
                                    this.count = 10;
                                    this.statsOnly = false;
                                }
                            } else {
                                this.enterSimulationView();
                                this._VisMain.get_Battleground().RestartReplay();
                                this._VisMain.get_Battleground().set_ReplaySpeed(1);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    OnSimulateCombatReportEvent: function (data) {
                        // console.log(data);
                        this.timerEnd("OnSimulateCombatReportEvent");
                        try {
                            // Resource Summary
                            this.stats.resourcesummary.research = data.GetAttackerTotalResourceReceived(ClientLib.Base.EResourceType.ResearchPoints);
                            this.stats.resourcesummary.credits = data.GetAttackerTotalResourceReceived(ClientLib.Base.EResourceType.Gold);
                            this.stats.resourcesummary.crystal = data.GetAttackerTotalResourceReceived(ClientLib.Base.EResourceType.Crystal);
                            this.stats.resourcesummary.tiberium = data.GetAttackerTotalResourceReceived(ClientLib.Base.EResourceType.Tiberium);
                            this.labels.resourcesummary.research.setLabel(webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(this.stats.resourcesummary.research));
                            this.labels.resourcesummary.credits.setLabel(webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(this.stats.resourcesummary.credits));
                            this.labels.resourcesummary.crystal.setLabel(webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(this.stats.resourcesummary.crystal));
                            this.labels.resourcesummary.tiberium.setLabel(webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(this.stats.resourcesummary.tiberium));
                        } catch (e) {
                            console.log('OnSimulateCombatReportEvent()', e);
                        }
                    },
                    onSimulateBattleFinishedEvent: function (data) {
                        //console.log("data:");
                        //console.log(data);
                        this.timerEnd("onSimulateBattleFinishedEvent");
                        try {
                            if (!this.statsOnly) {
                                this.enterSimulationView();
                                qx.event.Timer.once(function () {
                                    //MOD FIX PLAY BUTTON + Date
                                    // _this = TACS.getInstance();
                                    this._VisMain.get_Battleground().RestartReplay();
                                    let r = this.ReplayBar;
                                    null != r[this.PBIS] && r[this.PBIS].setIcon('FactionUI/icons/icon_replay_pause_button.png');
                                    null != r[this.PBIS_S] && (r[this.PBIS_S] = !1);
                                    null != r[this.PBIS_L] && r[this.PBIS_L].setValue('x1.0');

                                    this._VisMain.get_Battleground().set_ReplaySpeed(1);
                                    if (typeof this._playAreaChildren[11].getChildren == 'function' && typeof Date.parse(this._playAreaChildren[11].getChildren()[0].getValue()) == 'number') {
                                        this._playAreaChildren[11].exclude();
                                    }
                                }, this, 1);
                            }
                            var total_hp = 0;
                            var end_hp = 0;
                            var e_total_hp = 0;
                            var e_end_hp = 0;
                            var eb_total_hp = 0;
                            var eb_end_hp = 0;
                            var eu_total_hp = 0;
                            var eu_end_hp = 0;
                            var i_end_hp = 0;
                            var v_end_hp = 0;
                            var a_end_hp = 0;
                            var v_total_hp = 0;
                            var a_total_hp = 0;
                            var i_total_hp = 0;
                            var costInf = 0;
                            var costAir = 0;
                            var costVeh = 0;
                            this.stats.damage.structures.defense = 0;
                            this.stats.damage.structures.construction = 0;
                            this.stats.damage.structures.command = 0;
                            this.stats.supportLevel = 0;
                            this.stats.damage.structures.support = 0;
                            this.stats.repair.infantry = 0;
                            this.stats.repair.vehicle = 0;
                            this.stats.repair.aircraft = 0;
                            this.lastSimulation = Date.now();
                            if (PerforceChangelist >= 448942) {
                                var countDownInterval = 300;
                            } else {
                                var countDownInterval = 1000;
                            }
                            if (this.count == 10) this.counter = setInterval(this.countDownToNextSimulation, countDownInterval);
                            for (var i = 0; i < data.length; i++) {
                                var unitData = data[i].Value;
                                var unitMDBID = unitData.t;
                                var unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(unitMDBID);
                                var placementType = unit.pt;
                                var movementType = unit.mt;
                                var unitLevel = unitData.l;
                                var unitStartHealth = unitData.sh;
                                var unitEndHealth = unitData.h;
                                var unitMaxHealth = ClientLib.API.Util.GetUnitMaxHealthByLevel(unitLevel, unit, false);
                                switch (placementType) {
                                    case ClientLib.Base.EPlacementType.Defense:
                                        if (this.view.playerCity) {
                                            var defenseBonus = this.view.playerCityDefenseBonus;
                                            var nerfBoostModifier = ClientLib.Base.Util.GetNerfAndBoostModifier(unitLevel, defenseBonus);
                                            unitMaxHealth = Math.floor((unitMaxHealth * nerfBoostModifier) / 100 * 16) / 16;
                                        }
                                        eu_total_hp += unitMaxHealth;
                                        eu_end_hp += unitEndHealth;
                                        e_total_hp += unitMaxHealth;
                                        e_end_hp += unitEndHealth;
                                        break;
                                    case ClientLib.Base.EPlacementType.Offense:
                                        total_hp += unitMaxHealth;
                                        end_hp += unitEndHealth;
                                        switch (movementType) {
                                            case ClientLib.Base.EUnitMovementType.Feet:
                                                i_total_hp += unitMaxHealth;
                                                i_end_hp += unitEndHealth;
                                                costInf += this.getRepairCost(unitStartHealth, unitEndHealth, unitMaxHealth, unitLevel, unitMDBID);
                                                break;
                                            case ClientLib.Base.EUnitMovementType.Wheel:
                                            case ClientLib.Base.EUnitMovementType.Track:
                                                v_total_hp += unitMaxHealth;
                                                v_end_hp += unitEndHealth;
                                                costVeh += this.getRepairCost(unitStartHealth, unitEndHealth, unitMaxHealth, unitLevel, unitMDBID);
                                                break;
                                            case ClientLib.Base.EUnitMovementType.Air:
                                            case ClientLib.Base.EUnitMovementType.Air2:
                                                a_total_hp += unitMaxHealth;
                                                a_end_hp += unitEndHealth;
                                                costAir += this.getRepairCost(unitStartHealth, unitEndHealth, unitMaxHealth, unitLevel, unitMDBID);
                                                break;
                                        }
                                        break;
                                    case ClientLib.Base.EPlacementType.Structure:
                                        if (this.view.playerCity) {
                                            var defenseBonus = this.view.playerCityDefenseBonus;
                                            var nerfBoostModifier = ClientLib.Base.Util.GetNerfAndBoostModifier(unitLevel, defenseBonus);
                                            unitMaxHealth = Math.floor((unitMaxHealth * nerfBoostModifier) / 100 * 16) / 16;
                                        }
                                        eb_total_hp += unitMaxHealth;
                                        eb_end_hp += unitEndHealth;
                                        e_total_hp += unitMaxHealth;
                                        e_end_hp += unitEndHealth;
                                        break;
                                }
                                if (unitMDBID >= 200 && unitMDBID <= 205) {
                                    this.stats.supportLevel = unitLevel;
                                    this.stats.damage.structures.support = (unitEndHealth / 16 / unitMaxHealth) * 100;
                                } else {
                                    switch (unitMDBID) {
                                        case 131:
                                            // GDI DF
                                        case 158:
                                            // NOD DF
                                        case 195:
                                            // Forgotten DF
                                            this.stats.damage.structures.defense = (unitStartHealth > 0) ? (unitEndHealth / 16 / unitMaxHealth) * 100 : 0;
                                            break;
                                        case 112:
                                            // GDI CY
                                        case 151:
                                            // NOD CY
                                        case 177:
                                            // Forgotten CY
                                        case 251:
                                            // Mutated Forgotten CY
                                            this.stats.damage.structures.construction = (unitEndHealth / 16 / unitMaxHealth) * 100;
                                            break;
                                        case 111:
                                            // GDI CC
                                        case 159:
                                            // NOD CC
                                            this.stats.damage.structures.command = (unitEndHealth / 16 / unitMaxHealth) * 100;
                                            break;
                                    }
                                }
                            }
                            // Calculate Percentages
                            this.stats.health.infantry = i_total_hp ? (i_end_hp / 16 / i_total_hp) * 100 : 100;
                            this.stats.health.vehicle = v_total_hp ? (v_end_hp / 16 / v_total_hp) * 100 : 100;
                            this.stats.health.aircraft = a_total_hp ? (a_end_hp / 16 / a_total_hp) * 100 : 100;
                            this.stats.damage.units.overall = eu_total_hp ? (eu_end_hp / 16 / eu_total_hp) * 100 : 0;
                            this.stats.damage.structures.overall = (eb_end_hp / 16 / eb_total_hp) * 100;
                            this.stats.damage.overall = (e_end_hp / 16 / e_total_hp) * 100;
                            this.stats.health.overall = end_hp ? (end_hp / 16 / total_hp) * 100 : 0;
                            // Calculate the repair time
                            var _this = this;
                            this.stats.repair.infantry = _this._MainData.get_Time().GetTimeSpan(costInf);
                            this.stats.repair.aircraft = _this._MainData.get_Time().GetTimeSpan(costAir);
                            this.stats.repair.vehicle = _this._MainData.get_Time().GetTimeSpan(costVeh);
                            this.stats.repair.overall = _this._MainData.get_Time().GetTimeSpan(Math.max(costInf, costAir, costVeh));
                            this.getAvailableRepairAndCP();
                            this.updateStatsWindow();
                            this.buttons.attack.simulate.setEnabled(true);
                        } catch (e) {
                            console.log('onSimulateBattleFinishedEvent()\n check getRepairCost()', e);
                        }
                    },
                    enterSimulationView: function () {
                        try {
                            var city = this._MainData.get_Cities().get_CurrentCity();
                            var ownCity = this._MainData.get_Cities().get_CurrentOwnCity();
                            ownCity.get_CityArmyFormationsManager().set_CurrentTargetBaseId(city.get_Id());
                            localStorage.ta_sim_last_city = city.get_Id();
                            this._Application.getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay, city.get_Id(), 0, 0);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    //Undo / Redo
                    saveUndoState: function () {
                        var formation = this.getFormation();
                        var ts = this.getTimestamp();
                        var stats = this.badClone(this.stats);
                        this.undoCache[0] = {
                            f: formation,
                            t: ts,
                            s: stats
                        };
                        console.log(this.undoCache[0]);
                        /*
                        						f.d = {
                        							eb : 0,
                        							de : 0,
                        							bu : 0,
                        							cy : 0,
                        							df : 0,
                        							cc : 0,
                        							sl : 0,
                        							ovr : this.stats.health.overall,
                        							inf : this.stats.health.infantry,
                        							veh : this.stats.health.vehicle,
                        							air : this.stats.health.aircraft,
                        							ou : 0,
                        							bt : 0
                        						};
                        						*/
                    },
                    wipeUndoStateAfter: function (timestamp) {
                        var i;
                        for (i = 0; i < this.undoCache.length; i++) {
                            if (this.undoCache[i].t > timestamp) {
                                break;
                            }
                        }
                        this.undoCache = this.undoCache.slice(0, i);
                    },
                    //Layouts
                    updateLayoutsList: function () {
                        try {
                            this.layouts.list.removeAll();
                            // Load the saved layouts for this city
                            this.loadCityLayouts();
                            if (this.layouts.current) {
                                for (var i in this.layouts.current) {
                                    var layout = this.layouts.current[i];
                                    var item = new qx.ui.form.ListItem(layout.label, null, layout.id);
                                    //item.addListener("cellDblclick", function (){},this)
                                    this.layouts.list.add(item);
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    deleteCityLayout: function () {
                        try {
                            var list = this.layouts.list.getSelection();
                            if (list != null && list.length > 0) {
                                var lid = list[0].getModel();
                                if (this.layouts.current && typeof this.layouts.current[lid] !== 'undefined') {
                                    delete this.layouts.current[lid];
                                    this.saveLayouts();
                                    this.updateLayoutsList();
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    loadCityLayout: function (lid) {
                        try {
                            var list = this.layouts.list.getSelection();
                            if (list != null && list.length > 0) {
                                var layout = typeof lid === 'object' ? list[0].getModel() : lid;
                                if (this.layouts.current && typeof this.layouts.current[layout] !== 'undefined') {
                                    //console.log("layout: ");
                                    //console.log(layout);
                                    //console.log(this.layouts.current[layout].layout);
                                    this.loadFormation(this.layouts.current[layout].layout);
                                }
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    saveCityLayout: function () {
                        var formation = [],
                            lid, title;
                        try {
                            formation = this.getFormation();
                            lid = new Date().getTime().toString();
                            if (this.stats.damage.structures.construction !== null) {
                                title = this.layouts.label.getValue() + " (" + this.stats.damage.structures.construction.toFixed(0).toString() + ":" + this.stats.damage.structures.defense.toFixed(0).toString() + ":" + this.stats.damage.units.overall.toFixed(0).toString() + ")";
                            } else {
                                title = this.layouts.label.getValue() + " (??:??:??)";
                            }
                            this.layouts.current[lid] = {
                                id: lid,
                                label: title,
                                layout: formation
                            };
                            this.saveLayouts();
                            this.updateLayoutsList();
                            this.layouts.label.setValue("");
                        } catch (e) {
                            console.log(e);
                        }
                        return lid; // return value at the end
                    },
                    loadCityLayouts: function () {
                        try {
                            if (this._MainData.get_Cities().get_CurrentCity() == null) return;
                            var target_city = this._MainData.get_Cities().get_CurrentCity().get_Id();
                            var base_city = this._MainData.get_Cities().get_CurrentOwnCity().get_Id();
                            if (!this.layouts.all.hasOwnProperty(target_city)) this.layouts.all[target_city] = {};
                            if (!this.layouts.all[target_city].hasOwnProperty(base_city)) this.layouts.all[target_city][base_city] = {};
                            this.layouts.current = this.layouts.all[target_city][base_city];
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    loadLayouts: function () {
                        try {
                            var temp = localStorage.ta_sim_layouts;
                            if (temp) this.layouts.all = JSON.parse(temp);
                            else this.layouts.all = {};
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    saveLayouts: function () {
                        try {
                            localStorage.ta_sim_layouts = JSON.stringify(this.layouts.all);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    //Formations
                    loadFormation: function (formation) {
                        try {
                            this.layouts.restore = true;
                            //console.log("this.view = ");
                            //console.log(this.view);
                            for (var i = 0; i < formation.length; i++) {
                                var unit = formation[i];
                                if (i == formation.length - 1) this.layouts.restore = false;
                                for (var j = 0; j < this.view.lastUnitList.length; j++) {
                                    if (this.view.lastUnitList[j].get_Id() === unit.id) {
                                        this.view.lastUnitList[j].MoveBattleUnit(unit.x, unit.y);
                                        if (unit.e === undefined) this.view.lastUnitList[j].set_Enabled(true);
                                        else this.view.lastUnitList[j].set_Enabled(unit.e);
                                    }
                                }
                            }
                            //this.view.lastUnits.RefreshData(); // RefreshData() has been obfuscated ?
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    getFormation: function () {
                        var formation = [];
                        try {
                            for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                var unit = this.view.lastUnitList[i];
                                var armyUnit = {};
                                armyUnit.x = unit.get_CoordX();
                                armyUnit.y = unit.get_CoordY();
                                armyUnit.id = unit.get_Id();
                                armyUnit.e = unit.get_Enabled();
                                formation.push(armyUnit);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                        return formation; // return value at the end
                    },
                    shiftFormation: function (direction) { //left right up down
                        var Army = [],
                            v_shift = 0,
                            h_shift = 0;
                        if (direction === "u") v_shift = -1;
                        if (direction === "d") v_shift = 1;
                        if (direction === "l") h_shift = -1;
                        if (direction === "r") h_shift = 1;
                        //read army, consider use getFormation(?)
                        for (var i = 0; i < this.view.lastUnitList.length; i++) {
                            var unit = this.view.lastUnitList[i];
                            var armyUnit = {};
                            var x = unit.get_CoordX() + h_shift;
                            switch (x) {
                                case 9:
                                    x = 0;
                                    break;
                                case -1:
                                    x = 8;
                                    break;
                            }
                            var y = unit.get_CoordY() + v_shift;
                            switch (y) {
                                case 4:
                                    y = 0;
                                    break;
                                case -1:
                                    y = 3;
                                    break;
                            }
                            armyUnit.x = x;
                            armyUnit.y = y;
                            armyUnit.id = unit.get_Id();
                            armyUnit.e = unit.get_Enabled();
                            Army.push(armyUnit);
                        }
                        this.loadFormation(Army);
                    },
                    flipFormation: function (axis) {
                        var Army = [];
                        try {
                            for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                var unit = this.view.lastUnitList[i];
                                var armyUnit = {};
                                var x = unit.get_CoordX();
                                var y = unit.get_CoordY();
                                if (axis === 'horizontal') {
                                    x = Math.abs(x - 8);
                                } else if (axis === 'vertical') {
                                    y = Math.abs(y - 3);
                                }
                                armyUnit.x = x;
                                armyUnit.y = y;
                                armyUnit.id = unit.get_Id();
                                armyUnit.e = unit.get_Enabled();
                                Army.push(armyUnit);
                            }
                            this.loadFormation(Army);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    activateUnits: function (type, activate) {
                        var Army = [];
                        try {
                            for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                var unit = this.view.lastUnitList[i];
                                var armyUnit = {};
                                switch (type) {
                                    case 'air':
                                        if (unit.get_UnitGameData_Obj().mt === ClientLib.Base.EUnitMovementType.Air || unit.get_UnitGameData_Obj().mt === ClientLib.Base.EUnitMovementType.Air2) unit.set_Enabled(activate);
                                        break;
                                    case 'infantry':
                                        if (unit.get_UnitGameData_Obj().mt === ClientLib.Base.EUnitMovementType.Feet) unit.set_Enabled(activate);
                                        break;
                                    case 'vehicles':
                                        if (unit.get_UnitGameData_Obj().mt === ClientLib.Base.EUnitMovementType.Wheel || unit.get_UnitGameData_Obj().mt === ClientLib.Base.EUnitMovementType.Track) unit.set_Enabled(activate);
                                        break;
                                }
                                armyUnit.x = unit.get_CoordX();
                                armyUnit.y = unit.get_CoordY();
                                armyUnit.e = unit.get_Enabled();
                                armyUnit.id = unit.get_Id();
                                Army.push(armyUnit);
                            }
                            this.loadFormation(Army);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    resetFormation: function () {
                        var Army = [];
                        try {
                            for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                var unit = this.view.lastUnitList[i];
                                var armyUnit = {};
                                armyUnit.x = unit.GetCityUnit().get_CoordX();
                                armyUnit.y = unit.GetCityUnit().get_CoordY();
                                armyUnit.id = unit.get_Id();
                                Army.push(armyUnit);
                            }
                            this.loadFormation(Army);
                            if (this.buttons.attack.activateInfantry.getValue(true)) this.buttons.attack.activateInfantry.setValue(false);
                            if (this.buttons.attack.activateVehicles.getValue(true)) this.buttons.attack.activateVehicles.setValue(false);
                            if (this.buttons.attack.activateAir.getValue(true)) this.buttons.attack.activateAir.setValue(false);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    //Audio
                    playSound: function (str, _this) {
                        var temp = _this.audio[str].cloneNode(true);
                        temp.volume = _this.getAudioSettings().ui / 100;
                        temp.play();
                    },
                    getAudioSettings: function () {
                        return JSON.parse(localStorage.getItem("CNC_Audio"));
                    },
                    //Repair
                    repairUnit: function () {
                        try {
                            ClientLib.Net.CommunicationManager.GetInstance().SendCommand("Repair", {
                                cityid: this.ownCityId,
                                entityId: this.unitId,
                                mode: 4
                            }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, window.TACS.getInstance().repairResult), this.buttonId, true);
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    repairResult: function (buttonId, result) {
                        // result erroneously true when not enough RT, button deletes/sound plays but unit does not repair.
                        try {
                            if (result) {
                                var _this = window.TACS.getInstance();
                                if (_this.saveObj.audio.playRepairSound) {
                                    if (_this.repairButtons[buttonId].unitType == "Inf") {
                                        _this.playSound("soundRepairReload", _this);
                                    } else {
                                        _this.playSound("soundRepairImpact", _this);
                                    }
                                }
                                _this._armyBar.remove(_this.repairButtons[buttonId]);
                                delete _this.repairButtons[buttonId];
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    removeAllRepairButtons: function () {
                        for (var i in this.repairButtons) {
                            this._armyBar.remove(this.repairButtons[i]);
                        }
                        this.repairButtons = [];
                    },
                    setResizeTimer: function () {
                        var _this = this;
                        if (this.repairButtonsRedrawTimer) {
                            clearTimeout(_this.repairButtonsRedrawTimer);
                        }
                        this.repairButtonsRedrawTimer = setTimeout(function () {
                            _this.redrawRepairButtons(_this);
                        }, 500);
                    },
                    redrawRepairButtons: function (that) {
                        var _this = that || this;
                        var base_city_id = _this._MainData.get_Cities().get_CurrentOwnCity().get_Id();
                        if (_this.repairButtons.length > 0) {
                            _this.removeAllRepairButtons();
                        }
                        var cbtSetup = _this._VisMain.get_CombatSetup();
                        var zoomFactor = cbtSetup.get_ZoomFactor();
                        var startX = Math.round(cbtSetup.get_MinXPosition() * zoomFactor * -1) + 10; //qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_ATTACKSETUP).getChildren()[1].getBounds().left;
                        var startY = 7;
                        var gridWidth = Math.round(cbtSetup.get_GridWidth() * zoomFactor);
                        var gridHeight = 38;
                        for (var i = 0; i < _this.view.lastUnitList.length; i++) {
                            var unit = _this.view.lastUnitList[i];
                            if (unit.get_HitpointsPercent() < 1) {
                                var cityUnit = unit.GetCityUnit();
                                var unitRepairCharges = cityUnit.GetResourceCostForFullRepair().d;
                                var resourceCost, repairCharge, unitType;
                                for (var type in unitRepairCharges) {
                                    type = parseInt(type);
                                    switch (type) {
                                        case ClientLib.Base.EResourceType.Crystal:
                                            resourceCost = unitRepairCharges[type];
                                            break;
                                        case ClientLib.Base.EResourceType.RepairChargeInf:
                                            repairCharge = unitRepairCharges[type];
                                            unitType = "Inf";
                                            break;
                                        case ClientLib.Base.EResourceType.RepairChargeVeh:
                                            repairCharge = unitRepairCharges[type];
                                            unitType = "Veh";
                                            break;
                                        case ClientLib.Base.EResourceType.RepairChargeAir:
                                            repairCharge = unitRepairCharges[type];
                                            unitType = "Air";
                                            break;
                                    }
                                }
                                repairCharge = webfrontend.phe.cnc.Util.getTimespanString(_this._MainData.get_Time().GetTimeSpan(repairCharge));
                                resourceCost = _this.formatNumberWithCommas(resourceCost);
                                _this.repairButtons[i] = new qx.ui.form.Button("", "data:image/png;base64,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%3D%3D");
                                _this.repairButtons[i].set({
                                    decorator: new qx.ui.decoration.Decorator().set({
                                        backgroundColor: 'transparent'
                                    }),
                                    width: gridWidth,
                                    height: gridHeight,
                                    show: "icon",
                                    center: false,
                                    padding: 3,
                                    appearance: "button-text-small",
                                    cursor: "pointer",
                                    toolTipText: "Crystal: " + resourceCost + " / Time: " + repairCharge + " / Type: " + unitType
                                });
                                _this.repairButtons[i].addListener("execute", _this.repairUnit, {
                                    ownCityId: base_city_id,
                                    unitId: unit.get_Id(),
                                    buttonId: i,
                                    frm: _this
                                });
                                _this.repairButtons[i].unitType = unitType;
                                //        allowGrowY: false
                                _this._armyBar.add(_this.repairButtons[i], {
                                    left: startX + gridWidth * unit.get_CoordX(),
                                    top: startY + gridHeight * unit.get_CoordY()
                                });
                            }
                        }
                    },
                    toggleRepairMode: function () {
                        try {
                            var _this = this;
                            if (!this.audio.soundRepairImpact) {
                                this.audio.soundRepairImpact = new Audio(window.soundRepairImpact.d);
                                this.audio.soundRepairReload = new Audio(window.soundRepairReload.d);
                                this.audio.soundRepairImpact.volume = this.getAudioSettings().ui / 100;
                                this.audio.soundRepairReload.volume = this.getAudioSettings().ui / 100;
                            }
                            this._armyBar.getLayoutParent().toggleEnabled();
                            this._armyBar.setEnabled(true);
                            this.userInterface.toggleEnabled();
                            this.battleResultsBox.toggleEnabled();
                            if (this.buttons.attack.repairMode.getValue()) {
                                this.redrawRepairButtons();
                                this._armyBar.addListener("changeHeight", this.setResizeTimer, this);
                                this.repairInfo.show();
                                this.updateRepairTimeInfobox();
                                this.repairModeTimer = setInterval(this.updateRepairTimeInfobox, 1000);
                            } else {
                                this.removeAllRepairButtons();
                                this._armyBar.removeListener("resize", this.setResizeTimer, this);
                                this.repairInfo.hide();
                                clearInterval(this.repairModeTimer);
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    updateRepairTimeInfobox: function () {
                        try {
                            var _this = window.TACS.getInstance();
                            var ownCity = _this._MainData.get_Cities().get_CurrentOwnCity();
                            var availableInfRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                            var availableVehRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh);
                            var availableAirRT = ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir);
                            _this.stats.repair.available = ClientLib.Base.Resource.GetResourceCount(ownCity.get_RepairOffenseResources().get_RepairChargeOffense());
                            _this.labels.repairinfos.available.setValue(webfrontend.phe.cnc.Util.getTimespanString(_this.stats.repair.available));
                            _this.labels.repairinfos.infantry.setValue(webfrontend.phe.cnc.Util.getTimespanString(availableInfRT - _this.stats.repair.available));
                            _this.labels.repairinfos.vehicle.setValue(webfrontend.phe.cnc.Util.getTimespanString(availableVehRT - _this.stats.repair.available));
                            _this.labels.repairinfos.aircraft.setValue(webfrontend.phe.cnc.Util.getTimespanString(availableAirRT - _this.stats.repair.available));
                            /*var unitGroupData = webfrontend.phe.cnc.gui.RepairUtil.getUnitGroupCityData(ownCity);
                            							if (unitGroupData[ClientLib.Data.EUnitGroup.Infantry].lowestUnitDmgRatio == 1) console.log("No damage to Infantry");
                            							if (unitGroupData[ClientLib.Data.EUnitGroup.Vehicle].lowestUnitDmgRatio == 1) console.log("No damage to Vehicles");
                            							if (unitGroupData[ClientLib.Data.EUnitGroup.Aircraft].lowestUnitDmgRatio == 1) console.log("No damage to Aircraft");*/
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    resetDblClick: function () {
                        try {
                            var _this = window.TACS.getInstance();
                            clearInterval(_this.armybarClearnClickCounter);
                            _this.armybarClickCount = 0;
                        } catch (e) {
                            console.log(e);
                        }
                    },
                    //Util
                    getDateFromMillis: function (ms) {
                        return new Date(ms);
                    },
                    getTimestamp: function () {
                        return new Date().getTime();
                    },
                    timerStart: function () {
                        this.ts1 = this.getTimestamp();
                    },
                    timerEnd: function (functionName) {
                        functionName = functionName || "nullName";
                        this.ts2 = this.getTimestamp();
                        var diff = this.ts2 - this.ts1;
                        console.log(diff + "ms to run " + functionName)
                    },
                    badClone: function (obj) {
                        // broken
                        var stringied = JSON.stringify(obj);
                        //var p = JSON.parse(stringied);
                        return stringied;
                    }
                }
            });
        }
        var TASuite_timeout = 0; // 10 seconds

        function TASuite_checkIfLoaded() {
            try {
                if (typeof qx !== 'undefined') {
                    var a = qx.core.Init.getApplication(); // application
                    var mb = qx.core.Init.getApplication().getMenuBar();
                    var v = ClientLib.Vis.VisMain.GetInstance();
                    var md = ClientLib.Data.MainData.GetInstance();
                    if (a && mb && v && md && typeof PerforceChangelist !== 'undefined') {
                        if (TASuite_timeout > 10 || typeof CCTAWrapper_IsInstalled !== 'undefined') {
                            CreateTweak();
                            window.TACS.getInstance().initialize();
                            /*if (typeof ClientLib.API.Util.GetUnitMaxHealthByLevel == 'undefined') {
                            								for (var key in ClientLib.Base.Util) {
                            									var strFunction = ClientLib.Base.Util[key].toString();
                            									if (typeof ClientLib.Base.Util[key] === 'function' & strFunction.indexOf("1.1") > -1 & strFunction.indexOf("*=") > -1) {
                            										ClientLib.API.Util.GetUnitMaxHealthByLevel = ClientLib.Base.Util[key];
                            										break;
                            									}
                            								}
                            							}*/
                            if (PerforceChangelist >= 392583) { //endgame patch - repair costs fix
                                //MOD NOEVIL 5 by NetquiK
                                /* var currentCity = ClientLib.Data.Cities.prototype.get_CurrentCity.toString();
                                for (var i in ClientLib.Data.Cities.prototype) {
                                    if (ClientLib.Data.Cities.prototype.hasOwnProperty(i) && typeof (ClientLib.Data.Cities.prototype[i]) === 'function') {
                                        var strCityFunction = ClientLib.Data.Cities.prototype[i].toString();
                                        if (strCityFunction.indexOf(currentCity) > -1) {
                                            if (i.length == 6) {
                                                currentCity = i;
                                                break;
                                            }
                                        }
                                    }
                                } */
                                /* var currentOwnCity = ClientLib.Data.Cities.prototype.get_CurrentOwnCity.toString();
                                for (var y in ClientLib.Data.Cities.prototype) {
                                    if (ClientLib.Data.Cities.prototype.hasOwnProperty(y) && typeof (ClientLib.Data.Cities.prototype[y]) === 'function') {
                                        var strOwnCityFunction = ClientLib.Data.Cities.prototype[y].toString();
                                        if (strOwnCityFunction.indexOf(currentOwnCity) > -1) {
                                            if (y.length == 6) {
                                                currentOwnCity = y;
                                                break;
                                            }
                                        }
                                    }
                                } */
                                /* var strFunction = ClientLib.API.Util.GetUnitRepairCosts.toString();
                                strFunction = strFunction.replace(currentCity, currentOwnCity);
                                var functionBody = strFunction.substring(strFunction.indexOf("{") + 1, strFunction.lastIndexOf("}"));
                                var fn = Evil('a,b,c', functionBody); */
                                /*  var CAUGRCM = ClientLib.API.Battleground.legacy_GetLootFromCurrentCity.toString().match(/\$I\.([A-Z]{6})\.([A-Z]{6})\([a-z]\.[a-z]\.[A-Z]{6}\(\),/); */
                                //$I[CAUGRCM[1]][CAUGRCM[2]] 
                                ClientLib.API.Util.GetUnitRepairCosts = function (a, b, c) {
                                    var $createHelper;
                                    return ClientLib.API.Util.GetUnitRepairCostsForCity(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity(), a, b, c);
                                }
                            }
                            //MOD NO EVIL 4
                            // Solution for OnSimulateBattleFinishedEvent issue
                            /* for (var key in ClientLib.API.Battleground.prototype) {
                                if (typeof ClientLib.API.Battleground.prototype[key] === 'function') {
                                    strFunction = ClientLib.API.Battleground.prototype[key].toString();
                                    if (strFunction.indexOf(",-1,0,0,0);") > -1) {
                                        strFunction = strFunction.substring(strFunction.indexOf("{") + 1, strFunction.lastIndexOf("}"));
                                        var re = /.I.[A-Z]{6}.[A-Z]{6}\(.I.[A-Z]{6}.[a-zA-Z]+,-1,0,0,0\)\;/;
                                        //$I.QPYKHN.IVAYJF($I.XIMKGT.pavmCombatSimulation,-1,0,0,0);
                                        strFunction = strFunction.replace(re, "");
                                        var re2 = /.I.[A-Z]{6}.[A-Z]{6}\(\).[A-Z]{6}\(\).[A-Z]{6}\([a-z].[a-z]\)\;/;
                                        //$I.BFALSI.DZYMBX().JLBGOK().KLRGNI(b.d);
                                        var temp = strFunction.match(re2).toString();
                                        console.log(temp);
                                        strFunction = strFunction.replace(re2, "");
                                        strFunction = strFunction.replace("}}", "}}" + temp);
                                        //strFunction = strFunction.replace("var $createHelper;", "var $createHelper;var offenseData = b.d.a;var baseData = b.d.s;var defenseData = b.d.d;var simResults = b.e;for (var i in offenseData) {simResults[offenseData[i].ci-1].Value.x = offenseData[i].x;simResults[offenseData[i].ci-1].Value.y = offenseData[i].y;}for (var u in baseData) {simResults[baseData[u].ci-1].Value.x = baseData[u].x;simResults[baseData[u].ci-1].Value.y = baseData[u].y;}for (var e in defenseData) {simResults[defenseData[e].ci-1].Value.x = defenseData[e].x;simResults[defenseData[e].ci-1].Value.y = defenseData[e].y;}"); // Add Coords
                                        var fn = Evil('a,b', strFunction);
                                        ClientLib.API.Battleground.prototype[key] = fn;
                                        break;
                                    }
                                }
                            } */
                            //MOD NOEVIL 3 by NetquiK
                            /* for (var key in ClientLib.Vis.BaseView.BaseView.prototype) {
                                if (typeof ClientLib.Vis.BaseView.BaseView.prototype[key] === 'function') {
                                    strFunction = ClientLib.Vis.BaseView.BaseView.prototype[key].toString();
                                    if (strFunction.indexOf(ClientLib.Vis.BaseView.BaseView.prototype.ShowToolTip.toString()) > -1) { */
                            // MOD 22.3 - 5
                            var TTM = ClientLib.Vis.ArmySetup.ArmyUnit.prototype.MouseOver.toString().match(/this\.[A-Z]{6}\.([A-Z]{6})\(this\);/);
                            console.log("ClientLib.Vis.BaseView.BaseView.prototype.ShowToolTip_Original = ClientLib.Vis.BaseView.BaseView.prototype." + TTM[1]);
                            ClientLib.Vis.BaseView.BaseView.prototype.ShowToolTip_Original = ClientLib.Vis.BaseView.BaseView.prototype[TTM[1]];
                            // var stto = Evil('', showToolTip_Original);
                            // stto();
                            ClientLib.Vis.BaseView.BaseView.prototype[TTM[1]] = function (a) {
                                if (ClientLib.Vis.VisMain.GetInstance().get_Mode() == 7 && TACS.getInstance().saveObj.checkbox.disableAttackPreparationTooltips) {
                                    return;
                                } else {
                                    this.ShowToolTip_Original(a);
                                }

                            }
                            //var sttn = Evil('', showToolTip_New);
                            //sttn();
                            //console.log(showToolTip_New);
                            //break;
                            //}
                            //}
                            //}
                            qx.core.Init.getApplication().getArmyUnitTooltipOverlay().setVisibility_Original = qx.core.Init.getApplication().getArmyUnitTooltipOverlay().setVisibility;
                            qx.core.Init.getApplication().getArmyUnitTooltipOverlay().setVisibility = function (a) {
                                if (window.TACS.getInstance().saveObj.checkbox.disableArmyFormationManagerTooltips) {
                                    qx.core.Init.getApplication().getArmyUnitTooltipOverlay().setVisibility_Original(false);
                                } else {
                                    qx.core.Init.getApplication().getArmyUnitTooltipOverlay().setVisibility_Original(a);
                                }
                            };
                        } else {
                            TASuite_timeout++;
                            window.setTimeout(TASuite_checkIfLoaded, 1000);
                        }
                    } else window.setTimeout(TASuite_checkIfLoaded, 1000);
                } else {
                    window.setTimeout(TASuite_checkIfLoaded, 1000);
                }
            } catch (e) {
                if (typeof console !== 'undefined') console.log(e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
        }
        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(TASuite_checkIfLoaded, 1000);
        }
    };
    // injecting, because there seem to be problems when creating game interface with unsafeWindow
    var TASuiteScript = document.createElement("script");
    var txt = TASuite_mainFunction.toString();
    TASuiteScript.textContent = "(" + txt + ")();";
    TASuiteScript.type = "text/javascript";
    if (/commandandconquer\.com/i.test(document.domain)) document.getElementsByTagName("head")[0].appendChild(TASuiteScript);

})();`
    var TABS_ORIGINAL_SOURCE = `// ==UserScript==
// @name            Tiberium Alliances Battle Simulator V2
// @description     Allows you to simulate combat before actually attacking.
// @author          Eistee & TheStriker & VisiG & Lobotommi & XDaast
// @version         23.05.31
// @contributor     zbluebugz (https://github.com/zbluebugz) changed cncopt.com code block to cnctaopt.com code block
// @contributor     NetquiK (https://github.com/netquik) (see first comment for changelog)
// @namespace       https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @match           https://*.alliances.commandandconquer.com/*/index.aspx*
// @icon            http://eistee82.github.io/ta_simv2/icon.png
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Tiberium_Alliances_Battle_Simulator_V2.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- MovableBox Save Position
- New Top Bar Button
- Native Unit Enabling
- Skip Victory
- 20.2 FIX + MAP MOVE
- MovableBox in Battleground
- Some Sim Presets Fixes+
- Fix for Sim View with Autorepair
- Fix open/close stats for replays
- Back Button fix also for replays
- Skip Button removed
- Patch for 22.2
- NOEVIL for all code
- New Fixes for simulation + ReplayBar + Date hidden
- New SkipSimulation Function
- Patch for 22.3
- PHE FIX
- Add native formation saver button
----------------
*/

(function () {
    var script = document.createElement("script");
    script.textContent = "(" +
        function () {
            function createClasses() {
                qx.Class.define("qx.ui.form.ModelButton", { //				qx.ui.form.Button with model property
                    extend: qx.ui.form.Button,
                    include: [qx.ui.form.MModelProperty],
                    implement: [qx.ui.form.IModel]
                });
                qx.Class.define("TABS", { // [singleton]	Main Class
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.self(arguments).Init();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS constructor", e);
                            console.groupEnd();
                        }
                    },
                    statics: {
                        _Init: [],
                        addInit: function (func) {
                            this._Init.push(func);
                        },
                        Init: function () {
                            for (var i in this._Init)
                                qx.Class.getByName(this._Init[i]).getInstance();
                        }
                    }
                });
                qx.Class.define("TABS.RES", { // [static]		Ressources
                    type: "static",
                    statics: {
                        getDisplayName: function (ETechName, EFactionType) {
                            return ClientLib.Base.Tech.GetTechDisplayNameFromTechId(ClientLib.Base.Tech.GetTechIdFromTechNameAndFaction(ETechName, EFactionType));
                        }
                    }
                });
                qx.Class.define("TABS.RES.IMG", { // [static]		Ressources: Images
                    type: "static",
                    statics: {
                        Menu: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAADAFBMVEUAAAAAAAAAAAAABgAAAgACDQAAAAAAAAAAAAAAAAAAAAAAAQCV3icGGAETNwQIDAIAAAABBgBwsi9KghoUKwZFih0YVQlpph4iZAksYg8AAQACCABlmxmr0ieayiuM3SFMsBR/wymM0CFtsSQ5bhVFfRgRNQaY1DOLzCZYiRVJqhSDuylc2RiQzCSb2S9epyqVzjOi4TgWZQwecxIGLQQEFgJJgB07exh3niGHwCSv0zG01y////9RkhuX+yaR/iGd2zj///2hpEb//vNllSRijx9yoS5s2RdpmyhorB6GpDjE5GKL2Spjoh9y5h1hqRd36h9nniGm/Stv6Rhc2BNn7hGs/yhwzh6ttUvy5Z24sFvD01vo3Y2zvk61r2X9+emoqEvHuXytqFv58cmswFG9x1JS3Q3DuXCTmkSgvUL49L6LqEaWr09osh2P/idTpxV3pym2ymr1/NqPuje3vV2ewFB2tSWWrEN8mjZupyv7+9iCsy3z+rpplCZs3hqjyUaFnDHY63uJzi6AvivP3W6On0KRrDlcsRDK32CY/yeS9SJitRSHwzHc5Y+Ot0JlmiOg7TWAozB4rSqC4huWp0qz2E1bxxNanR6s2Ex/+hZi4Q9zySKc0EB5zyFgqCOq8jJ4+xKf+yVVnRpMsBJooyij4D6F0iqr0lNt9BlzwyFz9hSM/Rt72CJo+g+ysVF3rivWxmyEqzLt3qJwvCPMw4O6r3BJihSwzE/Bw3fXzYja2I3QwHqpuFnj6Zd7oTCCmC+0ymbl04zLv2zx3qHz8Kzs3pehrUjK33ieskrp7ax99CK502j7/tDI2GdajhpHkhFquCNj1xSnsE/M6G7i8KJXkxl4nSajq1qz9jW+6FLL9Fjb9W2530+btEJhwxiS2jRsrx9/2yZGvQxy1h3L5mW24U1foRtSzg2oyVZWrhZevxFLnheO9x+B+xxo5hac4TyVyTt/yy5f0Bej9jGu/TS5/zJxqymF4ix86xxvwx168RNW0hGh4Cqb3yl69R2T+iQ+CJL9AAAAPHRSTlMAERguJDYNAQgEFSn2P1dIHDytf0uNaLV4iB8ypdnX6Lbe3sJ2gVDp6ZKoxufO9ann+JScbl2lpMXW4/FzYe/CAAACJklEQVQoz2IAA3YOAV4TYzNzI1NWLk4GBOBkEtE3/BIWFvb1s4EoKxs7TJyDRXRC59rQAL+A4BULgtTFmDih6pmFOlfVLVvmsNThvc/jYPv5qgLsYHEWoby02U1Nc2ZM9X7y1MHHfeYNFS6QDKPw/5DNPc3126NTzrZ03Lm11N1ughoHUANArDxpuWXVxZnREamxqS2Ntx18/Oy1WdgZ2IS78j3Xb0yJjViXEJN1ssP75tyHM+fzcTCw6D73rSwoL3Fyiop0trEpuux9f827hTJcDIKTFz8L3Od1LCFqQ7wNEFyZOmPu919yLAz8bxYF9ruVnig5FOkIkqhZPmf2mlBraQb+t7bTfUsLG48cPWwDAlUvPvwM//dXEDAG/tWv51X2HT9jE38wGajFubdv+crwVX+AEisWz1uSc7rIxjlm96bkrN671T0fw9daMTMw6zya7pJ9oMaxamdiemL6pbb65lefVltIMTBp+dl6uGQX7t21ZWtcklPDteL2lbOCJBkZOPhO5bvVuubs2RGXlJGxvy2zrPveAj1WTgZ2KYUAWw/XiorWKddbG8onTsrtBmkAxQavvPs2l3OutVO8vLwKPP3bL9orc4NjhI2PZ/L5q/1uHoG+kx74X6jLU+TlgEQ4o4hS17RFtkv8v3m+nBa6UJwVKA6RYZPW5LH7EfI7JNjeTkOChQMpNXCxSojLycpayogxM4LjFSHFJsDNzc3CxAZLPQCSE8MJTTlJqQAAAABJRU5ErkJggg==",
                        Stats: "FactionUI/icons/icn_build_slots.png",
                        Stop: "FactionUI/icons/icon_replay_stop_button.png",
                        Arrange: {
                            Left: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA+VBMVEUAAABkZGT19fX39/fj4+MVFRXc3NwZGRlLS0sVFRXd3d0LCwvu7u7JycmioqKIiIgkJCSIiIj///9WVlb7+/vW1tbx8fHo6Ohqampubm7MzMx1dXX///+tra0eHh6srKyzs7N6enrNzc309PS7u7v7+/vQ0NC/v7/ExMT7+/tgYGChoaHu7u5bW1vs7OzAwMB0dHSsrKzS0tJ1dXWsrKxFRUUpKSkmJiahoaHAwMCampomJibV1dWJiYm5ubk0NDQ3Nzfp6en///+vr69BQUGTk5NBQUHj4+PX19f+/v7Jycnj4+PR0dHc3NyXl5eMjIz09PSCgoIyMjIoy70QAAAAU3RSTlMADweHhxMFCgIDhwUbAgsODh4UHoeHh4cFCgQUChQeD4cchw6HDw8ehx4vOoc8hzw6PDwKhxQaKB4UGh4ZKCgyHhQoNSgyOSiHNYc8hzU8PDw8EBrmavEAAACkSURBVAjXJYtVFoJQAEQfgoh0iYggIgJSit3dHftfjI/D/M3cO4DBddtxbNc1TY7rqwTQdJH2fZr2vIlgVSsEyImyjKKK0i5jZKmBqHDYXT/3XqcbHpeZQaNQiFIeSMNCEeS25yfkr28SHOb5dFgoUfZvNeuDHwXw6WofvpM4Pq3HtdTADQwjL48b5LBTBGBYYyZYkrQZpRiG0ViWQxCE5yGG/Q+LDRO5PtzwzwAAAABJRU5ErkJggg==",
                            Center: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA51BMVEU6OjpTU1P///9MTEz39/f8/Pz+/v7///9TU1MAAADv7+/7+/uVlZWDg4MvLy/39/fj4+MvLy/9/f3e3t7X19c9PT3U1NStra2ZmZlkZGTo6Oj09PRxcXGVlZXOzs7Ly8t+fn7c3NyZmZnc3NyysrL8/Pyenp6JiYlZWVm/v7/Pz8+7u7vo6Oj4+PiTk5Pj4+PT09Ps7Ozv7+/JycnT09PAwMB+fn7b29t1dXWTk5P////j4+M+Pj5PT0////+kpKSFhYWenp7Kysq1tbX////+/v62trbBwcHf39/CwsLk5ORubm5TU1MeHJAiAAAATXRSTlMCHocFAgoPAw0AhwUNDw8NDR4eh4c7Hjs8O4eHCgoFChkDDxOHhx4eLw+Hhx6HOoeHhzqHOjw8hxQUFBkSGhoaIy8vhy8jHocvh4c8PH2ldZMAAACpSURBVAjXHYzXAkIAFECvvUIUJRWZmYnS3nv8//dEz2cAzhEiSYrNILAsvo8BUMR6L8uxqt4931z2ATjSdZNEZ6e9Sasd8hhQonzN89m80+2mJ69RJeQN1XW29261M/TIA4ya8bPm5UfTxggNMLTZul9kYfGInC1WGeq5k5baV1GUv4ETG7TaF6/o4qDmAIChCPvgI4gkSbuVQTHA4JzR4GlaEAR6MMSZHypxEyTcEZPmAAAAAElFTkSuQmCC",
                            Right: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA9lBMVEXw8PAODg7s7OzW1tbs7OxgYGD9/f0AAABPT08VFRUBAQHU1NTk5OQAAABwcHD9/f38/PxfX1/7+/v9/f3S0tKjo6MRERE/Pz/AwMDp6enIyMh0dHRubm709PTR0dGSkpKmpqZBQUFubm66urro6OjOzs6xsbH19fXd3d3Hx8dBQUGhoaGGhobw8PBWVlb///8AAAB1dXWenp6vr69nZ2cAAAAKCgoiIiIHBwetra1dXV2hoaFnZ2e1tbUpKSmxsbEVFRX39/fPz8+MjIw3Nze6uropKSnY2NjY2Njj4+NkZGTQ0NDe3t6ysrKvr6/R0dGXl5fDw8OkAsOLAAAAUnRSTlMCDoeHBQUKAAIGCQqHFAoPFBSHHg8PHhyHh4c7DQ4UHocPGh4ehyiHhx48OjyHPBoaFIcSCigZFDWHKB41hyiHPCiHMjWHPB4tMjyHhzI8OTw8yAOJWAAAAKdJREFUCNcli1UCgkAABVcBWVBBGglJQULs7u66/2UEfZ/zZgBACzpN6zwvCIJGYRCAQqXFce4pcGaG3aEgQGmWZX2/ma+WGkidwTKD21xen2cUq/PpH7jn7L8jN0WWCACKtcB7RO9YTcL9ckQAlM9nd9or8mIyJDPD8XbqNQmP6/GgnCZosWcgW0U+rEyzmwIcxyHF2JIkimK7TMIfwPqaZeXSkQT8Aiw9E02m3A8KAAAAAElFTkSuQmCC"
                        },
                        Arrows: {
                            Up: "webfrontend/theme/arrows/up.png",
                            Down: "webfrontend/theme/arrows/down.png",
                            Left: "webfrontend/theme/arrows/left.png",
                            Right: "webfrontend/theme/arrows/right.png"
                        },
                        //Added by Netquik
                        Arrows2: {
                            Up: "FactionUI/icons/icon_step_up_button.png",
                            Down: "FactionUI/icons/icon_step_down_button.png",
                            Left: "FactionUI/icons/icon_step_left_button.png",
                            Right: "FactionUI/icons/icon_step_right_button.png",
                        },
                        Flip: {
                            H: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACo0lEQVQ4T2PABkJq+rjmH7nUdPrV119nXn/9s+7S/R1NCzc4rTx1a8ay41c7WuYsl5WRkWGEKicM4honSux7+Pb42Tdf/4LwwacfP7Wv3pOz8sydVavO3lk5f9cx15jCGhaocsJgys7jAUeffXiGZODn1lW7Claeub16xelb64C4Ma+lnx+qHD/wySpjXnnqeifQq79RDFy5qxBq4PqVp25Ombxmhw4QQHXhAdH1fWL77r++DDToD04Dz9xeteDAuajc1gn4ve0UkciU3zvT4vTrb79ghmEzEOTtNefvL8pomyrExsYG1Y0FxNT18my4dH8KKGYJGLgeGDkrJqzeoR9ZWMMM1Y4Jercctjr46N1NZMNwGQhy5YpTN/PzWvu5oNpRgUdGGdOc/WfST736guJdPAauX3HiekfH4vXyUCNQQVhtn8D2W8+2nEGKDEIGgrw9a+cxeyUlJdRE7pldxZjcOlXj6LOPj9ENw2cgkL9m2dHL2TGljZxQoyAgrKaHdfmZWxVA734jxUAQXnXm9tS6yXMlTG2doKYBQWrrZIHNVx4sBWrG8C4I4zNw5enbi+ftPuGSVNGMiO2edXstjz3/9BabYSBMwMC1y09cr2pbvFEIbJh/RinrlI1744CRAc9q6BifgSC8+tzdpT1rdmuAE3l80yTZ/UglCzZMyECQ+MID58NiyprYGGbuO5t1/MWn99gMgmFCBoLwytO3Wir6ZggzLDpycQJyyYINH3r66WP7mj25wPDCZ+DsSRv2WTAsPHCmChgh7068/PwTGz4OlFtz+npX7/p9LstP3WwA4hZseMXp2w3Td56wYyho6lSdsfNY6YzdJydM330CBYPEQHIVnROVIzMLOIvb+oVq+meIVPVOQ8EgsYqeqUJJpfWcAKWymA2EsiGlAAAAAElFTkSuQmCC",
                            V: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAClklEQVQ4T2MgB/iVd7CH1/SI9G3YF7D4+JUlR59/+nH61dff8w6cnQBVgh+EN01hjGqZxpY9eYlI39YjNvMOni888Ojd0aNP3z8+8/rr77Nvvv498+brn/n7T0+HasEOIlpnMIc1TBIJq+vX3HjtSd/ma4/WnHj59TtQM9gQZAwycO7ekzOhWhHAo6CRKaymh6d69krVWfvOpO19+O700WcfYS75g24QDGMYCPQWS1TzFKmktmkmO26/XLHv3sujwHD5CVSM0xBkDDcwqLJLcMHxa/FLT17rOPz04/PTb779wqaBEIYbOHv/2ZxjLz6/BglgU0gshhu44MDZaUABigwDYbCB+07NZJi29WDFvrsvLu+78/waDnwdixgmBpoxbduhMgav6ETZyNxSm+j8creoPPJwdH4FkC6z9o1NlWaYsnGf0ZpzdyeuOnt3GSUYZMZUoFkMk7ceDV555s6KFadvrQPi9eRioBmrpu44EcLQvHijweJDFzJWnrrRu/LM7VVASbIMBupdPWX78TAGt8Bw1oSsfL6qCbMUp2855Lvk+LXGFaduTgcpACpci64RF4YbCALe3t6MLi4uTC6BEZwhqXnC3Us3ms7acSxi+YlrLaDwgRqO1SAYRjEQGYAMB2JmN08v9vCMAuGWafPVFu4/E7H8+NWaVWduz11x+vYakgyEAaChDEBXM3r5+rOGJmVwlzZ1Svav2m656NDFghWnbk0FGrAEaBAoSMBhTtBAdAByuZOrO4t7eDxfWlWz7IztR70WHDiXA3T1jFVn76wE4hVTtx8PhionDoBc7eDgwODq4ckcFJPEHp9TJNA0e5n6tPU77ZcfvZLaNnupClQpeQDkaktLS2Y3Hz9Ov8h4XltnV3YAMTRvewY5T1wAAAAASUVORK5CYII="
                        },
                        //Added by Netquik
                        Flip2: {
                            H: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACo0lEQVQ4T2PABkJq+rjmH7nUdPrV119nXn/9s+7S/R1NCzc4rTx1a8ay41c7WuYsl5WRkWGEKicM4honSux7+Pb42Tdf/4LwwacfP7Wv3pOz8sydVavO3lk5f9cx15jCGhaocsJgys7jAUeffXiGZODn1lW7Claeub16xelb64C4Ma+lnx+qHD/wySpjXnnqeifQq79RDFy5qxBq4PqVp25Ombxmhw4QQHXhAdH1fWL77r++DDToD04Dz9xeteDAuajc1gn4ve0UkciU3zvT4vTrb79ghmEzEOTtNefvL8pomyrExsYG1Y0FxNT18my4dH8KKGYJGLgeGDkrJqzeoR9ZWMMM1Y4Jercctjr46N1NZMNwGQhy5YpTN/PzWvu5oNpRgUdGGdOc/WfST736guJdPAauX3HiekfH4vXyUCNQQVhtn8D2W8+2nEGKDEIGgrw9a+cxeyUlJdRE7pldxZjcOlXj6LOPj9ENw2cgkL9m2dHL2TGljZxQoyAgrKaHdfmZWxVA734jxUAQXnXm9tS6yXMlTG2doKYBQWrrZIHNVx4sBWrG8C4I4zNw5enbi+ftPuGSVNGMiO2edXstjz3/9BabYSBMwMC1y09cr2pbvFEIbJh/RinrlI1744CRAc9q6BifgSC8+tzdpT1rdmuAE3l80yTZ/UglCzZMyECQ+MID58NiyprYGGbuO5t1/MWn99gMgmFCBoLwytO3Wir6ZggzLDpycQJyyYINH3r66WP7mj25wPDCZ+DsSRv2WTAsPHCmChgh7068/PwTGz4OlFtz+npX7/p9LstP3WwA4hZseMXp2w3Td56wYyho6lSdsfNY6YzdJydM330CBYPEQHIVnROVIzMLOIvb+oVq+meIVPVOQ8EgsYqeqUJJpfWcAKWymA2EsiGlAAAAAElFTkSuQmCC",
                            V: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAOCAMAAAD32Kf8AAAAA3NCSVQICAjb4U/gAAAA51BMVEX////u1ZNVVVVUVF5TU2Du1ZNVVVVUVF7u1ZNVVVVUVF5UVFlTU2Du1ZPs05LbxY21pXykl3t6dG5UVF5TU2Ds05JUVF5UVFnq0ZHp0ZHnz5BUVFpUVF5TU2Dnz5BUVF5TU2Dnz5DlzY/Zw4qaj3FUVFlTU2Dp0ZHlzY/jy45TU2JTU2DlzY+ckHeNhGyLgmt0b2tiYF1TU2BTU13lzY+EfGluamBTU2Dnz5DlzY/Uv4lva2hrZ2Tp0ZHnz5BsaGbp0ZHnz5DQvIe5qX6VinOPhnGFfmzu1ZPs05Lt05Pq0ZHWwYrUv4k2s1xpAAAATXRSTlMAERERESIiIjMzMzMzRERERERERERVVVVmZmZmZmZ3d3eIiIiIiIiZmZmZmaqqqqqqqqqqu7u7u8zMzMzM3d3d7u7u7u7u7v///////2WvYGIAAAAJcEhZcwAADpwAAA6cAQeUU90AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAAqklEQVQYlV3O6RaBUBSG4UrpiMwyRqZMmTIlJBlOhvu/HmdLVnl/Pt/aa22K+kbTHELJcnPQTjMecBwSC5WWtjSsk212omCoVO9rW4uAe8cYO5MYUdQ7WPbDxX7OFFQ0cChPU+bzFey8As2ML9dgtzVodrY7BtvPQROKrm8CLbqgbF5WFFUd+o2q8C/F8ryQk2oymWBTPf3ERniBbGRqFBkqFAtHUvxPf70BysEmbzfULiYAAAAASUVORK5CYII="
                        },
                        DisableUnit: "FactionUI/icons/icon_disable_unit.png",
                        Undo: "FactionUI/icons/icon_refresh_funds.png",
                        Outcome: {
                            total_defeat: "FactionUI/icons/icon_reports_total_defeat.png",
                            victory: "FactionUI/icons/icon_reports_victory.png",
                            total_victory: "FactionUI/icons/icon_reports_total_victory.png"
                        },
                        Enemy: {
                            All: "FactionUI/icons/icon_arsnl_show_all.png",
                            Base: "FactionUI/icons/icon_arsnl_base_buildings.png",
                            Defense: "FactionUI/icons/icon_def_army_points.png"
                        },
                        Defense: {
                            Infantry: "FactionUI/icons/icon_arsnl_def_squad.png",
                            Vehicle: "FactionUI/icons/icon_arsnl_def_vehicle.png",
                            Building: "FactionUI/icons/icon_arsnl_def_building.png"
                        },
                        Offense: {
                            SaveLoad: "FactionUI/icons/icon_load_save.png",
                            Infantry: "FactionUI/icons/icon_arsnl_off_squad.png",
                            Vehicle: "FactionUI/icons/icon_arsnl_off_vehicle.png",
                            Aircraft: "FactionUI/icons/icon_arsnl_off_plane.png",
                            //DS-MOd
                            ResetFormLine: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAfSURBVHjaYvz//z8DJYCJgUIwasCoAaMGDBYDAAIMAGOaAx1bYuPGAAAAAElFTkSuQmCC",
                            ResetFormation: "data:image/png;base64,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"
                        },
                        //DS-MOD-END
                        RepairCharge: {
                            Base: "webfrontend/ui/icons/icn_repair_points.png",
                            Offense: "webfrontend/ui/icons/icn_repair_off_points.png",
                            Infantry: "webfrontend/ui/icons/icon_res_repair_inf.png",
                            Vehicle: "webfrontend/ui/icons/icon_res_repair_tnk.png",
                            Aircraft: "webfrontend/ui/icons/icon_res_repair_air.png"
                        },
                        Resource: {
                            Tiberium: "webfrontend/ui/common/icn_res_tiberium.png",
                            Crystal: "webfrontend/ui/common/icn_res_chrystal.png",
                            Credits: "webfrontend/ui/common/icn_res_dollar.png",
                            Power: "webfrontend/ui/common/icn_res_power.png",
                            ResearchPoints: "webfrontend/ui/common/icn_res_research_mission.png",
                            Transfer: "FactionUI/icons/icon_transfer_resource.png"
                        },
                        Simulate: "FactionUI/icons/icon_attack_simulate_combat.png",
                        CNCTAOpt: "data:image/gif;base64,R0lGODlhEAAQAJECAAAAzFZWzP///wAAACH5BAEAAAIALAAAAAAQABAAAAIplI+py+0PUQAgSGoNQFt0LWTVOE6GuX1H6onTVHaW2tEHnJ1YxPc+UwAAOw==",
                        one: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEYElEQVQ4jbWVaWxUVRTHf/fN63Q6004X0BYsUsCiUJGA8AFESCoEEpe4IMpiQiQISJBaEFMFxfiBqIkFibIESEnrwpI0UYoYlsgmstWWpbUtrVOmbFNamNLpLJ33rh+4V0f0qyc5ue/Dub/3P/977ntCSomOxgohABfgBJIBE3AAQpVIwALiQBSIAZGhcxIgKoQGK2iKSrdKp4InguMKGAZ69HovXEgpE6FuIBVIPdtI9vafGH++mcJgiDwJDtMglJ1JbeFoqopnUAOEVIZVxvULREM5un03kAZ4SzZTuO80xT0RBmgFhsBKTuJm3MbVGyc9P5fte9ZQqsBaeURbY6pWXYAHSFu+galVJ1hjSxwADgex0flUlMzihz7pRBwGdsV+hnR04VZ7HECS4hiAaKwQYTPB19Rj53ngYDVFGpqcRGfxDN6bO43fla8WIN5+mVoFcta3kl7TjHtmIY2JZ6HVugH3tweZ2BOhv25/yhg2z51GQ4KPcaUqWe1xvbOR+U1tPB/oZN7S6ZxRB2wbSq0HSKnzMUlDM1Jp/nQhh++ZAu2jBbByK+Oa2ngBEBUHWNEVwqtYLgNIPlhNzqHf6NedoLZ/H+rrW3FfvYmp4HENBMSpejL3/spCXd8V4pHFa5mprTUAo3QXryz6nB3dPQzUhQ1+ps1YzY49J8hWQFu1aQDmqm0sCEXIJSGqm5j7ZSUFgNMA7HVLKPN6aLDlX+Zj2ZgD7ufHN56lSam1NXRLFQ/5A0x1GMR0vSGw4xaeymNMB4RjyYukZqUhOoJcP9/CFKkmwuvh0tYVfNjHyx3uXl9bjZYrJwuem8Bef4DI5QCjANI8+DYtY/6kkRx9MJtbhjqQUMlsTj42mDIAh0Hv7Mmsz88lpNpHQU3A7N+X+PCBhFquMUIrdprcGldAYMIIAkDUUKfcA/RsXs72jFQuFAziu6LpXEgAuvh73p2AWbqLR6/eZIwGD83liBYJhLXiMNDt9XD7+vWAXXtJvpY/K/a9UugGvEC6Wj2VR8k7F3j8fZ/PJ6SUSCk5fkEW5T61f5wSGdGjFAFEvyd3Dk9yuqJ2b/BsPHyjuWwfeVfayZr3NPUpTmR1E5lfH2DCyTrm7Ny9KsPn8+H3X7aGPTywOTMjoyspbXBfLVQAJHyIXINfurZSWpGkbn/lsbeWFmfsPsxHlo0HwLZJsWxM3X7fdM58sGjYhgUllWMN0x21orcOtVaN3K+EqrktR1ix25Olio5zH0+0YsHTkVB7jb+10Vd3saa9uOjNKzlZHCkYRNm7rw9ZFu6o3WLbvXeklFLaVjDcfmKYEvnPkFKuVUWtXX98M6o31FYau9OyPhps+Cp6u27jjVOLn2koZ3Tnxc9eta3olbulsbZ4tPOTYEt5v0SouAdcA4wE1jVWiBL+4xflHTTHmzO+7BeEIw1A2rHjQjhshOOQEGK1ZpkJ0DwFBfhZ+RQHerl74wxA3Df2i1kaCiAM5xPqcdu/LPg/4k/+d/H1IH1wmQAAAABJRU5ErkJggg==",
                        two: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEcElEQVQ4jbWVWWxUVRjHf+fe2+msXSi0iG2hSIlawYg8gBYLDZsQoSiWsCRiDAoSBCuSYDDggyESIxhi1IaSEsYI8lCCLDaACyVBoJQ2IGW6QIdi0ZaltJ3pdGbuPT5wbhmJr37Jl/vynd/5f8v5rpBSYluTXwjACTiAZMAAdECoEAmYQBwYAKJAZOyyBIgyYYMV1KXcrdyh4InguAL2A2H7+yhcSCkToW7AC3gvNJG1p5oXLrVSfD/EKAm6oRHKSqeheAJHykqpB0LK+5XH7QtEYC92+m7AB6RsLKf4p/OUhSPk2Ao0gZmcxO24hTMWJzU/mz2Ht7JdgW3lEbs0hkrVCXgA3/qvmXXkDFstiQ6g60Qn5OPfuIQfM1KJ6BqW/zhP3OnBrc7oQJLiaIBo8ot+I6Gu3tOXePxkHetsaHISd8tK+Wj5bK6qupqAeP91GhTI0Rgktb4V9+JimhJ7Yat1A+7vT/JSOMIIO/0ZEylfPptAQh3jSlWyOuP88BtWNN+kpPMub61dSK1qsKUptR7AdaWNIhua5qV120p+e2QK7DqaAJsqmNx8kwWA8J9gQ0+IFMVyakDyyTqG/3yRx/oS1I7IoLExiLvjNoaCx20gIM41kn70d1ba8T0hnly9g8V2aTVA236ARau+YH9fmJF2YKCd2aVb2H/4DFkKaKk0NcD4eDfvhCJkk2B1zSz/qooCwKEB1pdrqEzxELDkYPExLYycTI69/QrNSq1lQ3cdYUx7J7N0jagdrwmsuImn6jQLAaGveRXvEB/izn3+unSNGVJNRIqHlooNbM5IoZcHz9dSo+UcPgTmFXK0vZPIjU6eA/B5aPv2A1YUPUtNbhb3NNWQ0MalnB0/mkoAXSO2dDo787MJqfRRUAMwRgwl/vRIQtduMc5W7DC4N7mAzsJxdAIDmupyGAiXr2dPmpfLBXnsW7eQywlAJw/n3QEY2w/wTMdtJtrgsdmcskUC/SKwlyQe7Aff6AXBTw1P7jI72Ir1trTsT3lDNU+qSxxVNeR9Usm2ZHfasIMHD1JUNDilWPG+6pZ9vlJ7lCJ5Ja1zdeewMVas9zxYmpSm1tcXdpUfzyua9/z1OpcDWddM+ncnKDx7hWXROGmLlpSg65p5p+tGa3paWo/QkuJCc3iBfgGQsIicgCtn5qn5ujNzfGPgWvakwjkTTQsPgGXhMi0MW93QVGpXzefzTTuvTtUM94AwvAMgL7T+kHFgMIXAXoQZ7Z5uWbEaqSzae93fETj0WXuwqe3KH/Vd586eCTXU13YX5FH55su821DBpFBH9XsywSwrNg0eLg2klDuAtQDSih2Odl/eFTw64WLunNolmuHLRZoaSGFGujraj089lP5UWaYrc0qmtGJdt2pKz49dGq9C6FOAaUKIX4WCbgE2qzuCQBvS1EId1av//GXu3/zHL2r0a7fWGa7hZUirB2QQoY8D7gOjhBDdNrgbSOXfFmzyi3we7FpN+SA4Z+apbNewF48htNwEQSVCiHr+T/sHWt7fucgXQnUAAAAASUVORK5CYII=",
                        three: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEdElEQVQ4jbWVa2wUZRSGn29mdrvdbbdbaChikQUtGstFkGAgjU2qCIlKRBCDYNJIQIwhYgUExUBMDKhENMaoBMjiVio0AYKAGq7ShluhtCm2bmtra7ElSyl2y17o7sznD77BDTHxlyc5mWRyvmfe854zM0JKiR0tFUIALsAJZAAGoANClUjABFLALWAQSIxdlAZRIWywgmaqdKt0Kng6OKWAcSBmX++GCyllOtQNZAFZF1vI3/kT0xvbKO2P4pegGxrR/FwaSidzqHw+9UBUZVxlyn6ACAWx23cD2YB37VZKf6ylPJZgpK1AE5gZDnpTFq5kipzCAnYe3MgWBbaVJ2xrDNWqC/AA2Su/ZOahM2y0JDqArjM4uZCKtS/x/dAcErqGVXGE+69HcKszOuBQHA0QLRUibqT5mlXTyL3H6lhhQzMc9JXP552yWfyqfDUB8eYLNCiQs7mTnPo23AtKaUmfha3WDbgrj/F4LMEIu/0ZU9haNotQmo8ppSpDnXGt+oolrVd4LtzH4jfmcUEN2NKUWg+Q2dRBiQ31ZdH20TJ+vmsLbB9NgHXbmdZ6hTmAqDjK6kgUr2K5NCDjWB3Dj1/inptpakcMpbm5E3d3L4aCp2wgIM43k3v4LMvs+kiUh17/lAW2tRqgbanixdc+YffNGKPswlAXs+ZvYPfBM+QroKXa1ADjvR28Gk1QQFrUtVL2xT6KAKcGWJ8tJ+D1ELLkHfMxLYyRw/hh6bO0KrWWDd12iAe6wszUNQbtek1gpUw8+2qYBwh9+fNkDclGXO/namM7M6TaCK+H37avZv1QLwPcfn0ttVqu4UNgdjGHu8Ik/ggzCSDbQ8fXb7GkZCLV9+VzQ1MDia5dyLkJYwgA6BrJhU/yeWEBUdU+CmoAxog8Ug+PItrew3hbsdPgxrQiwsXjCQO3NDXlGBDbupKdviwuF43muxXzuJwGdPHPvjsBY0sV47p7mWKDxxZwyhYJxAkFcYSC5PbULBpnDvbXyrRIxrqrQ0Gmh4I8FgoyNRRkWihIyaallGU6CQcCASmllFV7KgdObJsy2xyMnLdS8dN9TZtH2quUyJu0qURojpSVHKgFS5PS1KJxM++DIFMXP01zphNZ10rut0cpPtfEosEUPp/PR01NtWlFLn796BPleUIzTKTVce3iyqvGgy8jQ0ES7XsLdgC7xsztWSfNhENatxzVR/bLPSd5u/I4HgDLItO0MAD8fj89f7Z3TxjrPT0sY/M3Tl/jU5aZOCXN+HElVu1tEGElo3PTrYj8vuuV7tCBD7s6Wzqafqm/dv7cmWhD/YW/ikYTOHuyskr+S1hWcg5qykgp/YAfaGupEFrhwuQpIYxi3ZV/M9ebc0Mz5OFhOU4NHMJMXOve+z4H/JMmL7GSA7VCM0yEkS00RxGAEMYJUF8jKeUGYD3QD3QAE5FWpK/p4/G9l9Yk+I9fVOGC+Cqhu94FGoQQj9xRDASAMmAUMBHolDI1p/fSmh5uf2s1lelgS2VS6K5n1P39/N/xN04bEQuMNx/QAAAAAElFTkSuQmCC",
                        // SkipVictory Button graphic by Netquik
                        VictoryPop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAA3NCSVQICAjb4U/gAAACClBMVEVfBgCuejziQyyPTyZ4LhTXpFTMZjPBlktiFwfgul//JibQcD2haDOHPx7WVjNdCgHPolPowWS6iURwIw71LieYXC3OiEbbtFx+ORnRlEyLRyJmAACocTfYr1rTYTdtGQrvyWnrOCplDgSZZjOyfj/WrVjPdj/UnVF5PBmTVCjht1/TqValbja9kEfdTS/Hn09mCgPLnlDVVjNzJhDtx2dqFAiFPx1tHQuNTCTQazuWXCuGQh9mDwXjvGDz0GzNfkKfbjRmAAC1g0F7MhZjCQLNdD7cr1rbr1l9NhiqdDnYp1Z2KBHEl0yCPRzdTTHQpVSjajTxzGretl1oFAeTUiiMSiJqFgnju2CJRiFsGgq9jUbBkkmbXCyPTiTQi0jJnE5wHAzXsFlmDARiCALsyWjasVvlvmGvfD7VqVftOCp9MRdyJA9nEgbPdD7iuV/atVyPSyS2hEKmbDaRUCZsFgjcUDKEQR50JRDbqVbSp1VmDgXPiEjXplbqw2WpcznZr1i/kEjNoVDHmUybXi70LijdTDFkCQLhuV+vejzTYTjrOirVnVHlu2DVq1bcsVvJnU+7i0VkCgN8MxdsHAqrdTqZXi2jaDLtyWbbsVrdtFx6LhXPpVKLSCLbr1puGAqzgD9mCgRvIA2JQh5mEgbPfkLbsVjZqVZ2KRLzzWpqGQloDQXPdj6nbzZ1JhG/XJyLAAAArnRSTlP///////////////////////////////////8A//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Kf6MJAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAZZJREFUKJFjkMYJGAhIMYABQgzCAwnM49Ustgg1W7sKIpMwh8czYFEJSIqhIEPQVjxVWyUrGSRjGpNhEmgiwAvWWLSi1M9Pr7WPJxhk2qT4ai4ukfAQsFRzbSkXEFQ3zALyJk61ZeLiUquE6HKOlwRJyamGJkszZE9YxsXVosW4EOwMpWZORaBUSxpPDkOyRaocUJV2qAtYKnlSfxxIW02hMcPK9PAWLi43J2EGiL9yZLSAfC7XxjJ+idn2QE2ymlVQLydba1sCpZiCrDiUw4Fme0UtZ4AFlPl8d5CJcxk1dNW5uPy0pirBw9DFQpYPKCXG7pAIdIR6NAsDXIpBWAiomssoXx+oW5Gz2QYp5CeKtgM92pJi6wr0uo8HA5IUg3OTGFAbq50il2J4QBhKfAXrpAHdz93NxWVv6JuMIpVs5g80q6uUq2VmXSRaLEem54Hcz6XmH9GGJpUcKysHkupLX4ieNhiyhSqAMp2yzBMxkk1SsbaJgonWlHIGDClpeakAzzWa3gbSmFLSScGmplVt0tik0AAA+3Zy/SYJ5fgAAAAASUVORK5CYII=",
                        VictoryPop2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAA3NCSVQICAjb4U/gAAACkVBMVEUzAADStraGbkVsHAy2nI3UICD7xcNHIxSyfj9zXDHbyrdZAAD2zsZ7RCCnf3/tx2fzsrJ9VVE+Dw3GeHJ3LyDMZjNmMzPo2cm2SkrArIdJAACNdk3MZjNiEwf16tLUqFbguF9tRz2lGRmZXi3CpqZRMRjz48+NXTHWv7s8CAixn3KnbzaQFRX/Jiajj2TWnpPf0sLIrahmAADLt6SsmHXi1LRkUClEExNXNRmeiWFAAAB2KBHHkYJ3VUSIHx+KQzTt4M2lOCS6jEdaGAqAUCdPJR/5x8TNu51gRiWKYl+YcDvrIyNRAABmDARpPDmihkTm18eJa1eNUz98aDhoEhJeAAB0RETx2crTurjcycDXxr6MSiLjj4+9HBz47dO9mU6KXl49EBA0CQZnMReZZjNsIw9TMB5pEgdmMzNJBAB4LhRKGxmYa1FYDAQ+AAD/w8PPb2/QrZidf0FPLhiCRSDSwqKRelhBBADayb/i0sXx2sqKcDm7pJHz58+RIiJRBADaqFfv0sY8CgN8NCaTVCiLRyJ6TEzs38umhIGqdDnSu7mvmXxfBAA8FgtJCAS2hkPCsolyQUGRUCb779JqFAhVJSRWOBt7Wy1pGAyjajT369NkDwW4nJXv5c72JSXYrVk/DQ2OYWHz0cf4y8RBEBBaBAD16NGBWlQ+EwhOAABeMRdFAADbxr/v38rey8F9MRdFBACtlnrj18ZNAwBWAwB+RSFBCAjJsap3WT6LIxltKBSFPx1mAADv487GpqZUAABBEw/3srJpGAjvyWnj0sKmhoJWMRhNGxtMIhJZJCRmAADTv7r679Xo2sqNeUvTqVZZHAyKYWG6mlE5CghUNCB5MRg+AwDv18aqdT1lEAjgzsIQtHt1AAAA23RSTlP//////////////////////////////////////////////////////////////////wD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8hz8AoAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAhlJREFUKJFjMMIJGIA4NDQUTXT//lCwVKhm9rWlPUAAk+jJFBLaDJZavXxdYPHW6N3WvhAZ5lU7uIxPHAJKcV++VRs3ITj+PMd6sD5ZC8szZ85IJ/cwGOV5Bpzh4dEXcZyfkg6U2XLCZG1+Pptp8VKGleYRlXE8+fkH7dSdsnqMVibVzFqcn19Va7uaIa8tYs1ctXwgCKou6VkptL29FqhplvicawwrkxK6Kme5AaXYtKY1Td13a9mi/PxFtSwHfBiMQvP81sxdC9JW260YoXE2jo2NbVl370qwv8pduWaxAaXC567riqytAmrSO5YLDY3MtNJwoNTiWZWnQWYfZJq+qwciZdTj7CEJMnHZ2QoHtfyYZn/l2dAwNDLy5TWzAUqt3RuwbNHBEC+QL2BSS1eUgdy/SG7usvx84WCX2bCQN+LWFKwEeZTtTBzQzrXu7JkwKZ8kvog1e0Hurz3jlu8WF2AotBoitXLBvogIjQCgfwpygMZWzY2MiJhqFWrEEGp1EigTERFZGy6hs9P+IJucuAaQG8bAzeAjFgEGGlznlLznxdYV1q4D8xPy4FIdV4pEdXV1WTk3akCkrBhC8/jALM0L/Q1AKdH4Y34g/j5Nbgaj/QuALDEGbt9J8vyH+RU6U8uPAy0XkwK50GrivuN5wBTE3DqzU7sFmEKkFvDxMYSCQ36bphQ4tfmmT5kCTjo+SZo+sIDCCgA7QOw3tEIRUgAAAABJRU5ErkJggg=="
                        

                    }
                });
                qx.Class.define("TABS.SETTINGS", { // [static]		Settings
                    type: "static",
                    statics: {
                        __name: null,
                        __store: null,
                        __upload: null,
                        __file: null,
                        __reader: null,
                        _Init: function () {
                            var localStorage = ClientLib.Base.LocalStorage,
                                player = ClientLib.Data.MainData.GetInstance().get_Player(),
                                server = ClientLib.Data.MainData.GetInstance().get_Server();
                            this.__name = "TABS.SETTINGS." + player.get_Id() + "." + server.get_WorldId();
                            if (this.__store === null) {
                                if (localStorage.get_IsSupported() && localStorage.GetItem(this.__name) !== null) this.__store = localStorage.GetItem(this.__name);
                                else this.__store = {};
                            }
                            this.__store.$$Player = player.get_Name();
                            this.__store.$$Server = server.get_Name();
                            this.__store.$$Update = Date.now();
                            if (localStorage.get_IsSupported()) localStorage.SetItem(this.__name, this.__store);
                        },
                        get: function (prop, init) { //get or initialize a prop
                            this._Init();
                            if (this.__store[prop] === undefined && init !== undefined) {
                                this.__store[prop] = init;
                                this._Init();
                            }
                            return this.__store[prop];
                        },
                        set: function (prop, value) {
                            this._Init();
                            this.__store[prop] = value;
                            this._Init();
                            return value;
                        },
                        "delete": function (prop) {
                            this._Init();
                            delete this.__store[prop];
                            this._Init();
                            return true;
                        },
                        reset: function () {
                            var player = ClientLib.Data.MainData.GetInstance().get_Player(),
                                server = ClientLib.Data.MainData.GetInstance().get_Server();
                            this.__name = "TABS.SETTINGS." + player.get_Id() + "." + server.get_WorldId();
                            window.localStorage.removeItem(this.__name);
                            this.__store = null;
                            this.__name = null;
                            this._Init();
                        },
                        save: function () {
                            var textFileAsBlob = new Blob([JSON.stringify(this.__store)], {
                                    type: 'text/plain'
                                }),
                                downloadLink = document.createElement("a");
                            downloadLink.download = "TABS_Backup.json";
                            if (window.webkitURL !== undefined) downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                            else {
                                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                                downloadLink.style.display = "none";
                                document.body.appendChild(downloadLink);
                            }
                            downloadLink.click();
                        },
                        load: function () {
                            if (this.__upload === null) {
                                this.__upload = document.createElement("input");
                                this.__upload.type = "file";
                                this.__upload.id = "files";
                                this.__upload.addEventListener('change', (function (e) {
                                    var files = e.target.files;
                                    if (files.length > 0) this.__reader.readAsText(files[0], 'UTF-8');
                                }).bind(this), false);
                                this.__upload.style.display = "none";
                                document.body.appendChild(this.__upload);
                            }
                            if (this.__reader === null) {
                                this.__reader = new FileReader();
                                this.__reader.addEventListener("load", (function (e) {
                                    var fileText = e.target.result;
                                    try {
                                        var fileObject = JSON.parse(fileText);
                                        this.reset();
                                        for (var i in fileObject)
                                            this.set(i, fileObject[i]);
                                        alert("Game will reload now.");
                                        window.location.reload();
                                    } catch (f) {
                                        console.group("Tiberium Alliances Battle Simulator V2");
                                        console.error("Error loading file", f);
                                        console.groupEnd();
                                    }
                                }).bind(this), false);
                            }
                            this.__upload.click();
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Formation", { // [static]		Utilities for Army Formation
                    type: "static",
                    statics: {
                        GetFormation: function (cityid, ownid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCity = ((ownid !== undefined && ownid !== null) ? ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ownid) : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity());
                            if (OwnCity !== null) return OwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(CityId);
                            else return null;
                        },
                        GetUnits: function (cityid, ownid) {
                            var formation = this.GetFormation(cityid, ownid);
                            if (formation !== null) {
                                var units = formation.get_ArmyUnits();
                                if (units !== null) return units.l;
                            }
                            return null;
                        },
                        GetUnitById: function (id, cityid, ownid) {
                            var units = this.GetUnits(cityid, ownid);
                            if (units !== null)
                                for (var i = 0; i < units.length; i++)
                                    if (units[i].get_Id() == id) return units[i];
                            return null;
                        },
                        Get: function (cityid, ownid) {
                            /**
                             *	[{
                             *		id: [Number],		// UnitId (internal)
                             *		gid: [Number],		// Garnison Id (internal)
                             *		gs: [Number],		// Garnison State
                             *		i: [Number],		// MdbId
                             *		l: [Number],		// Level
                             *		h: [Number],		// Health
                             *		enabled: [Bool],	// Enabled (internal)
                             *		x: [Number],		// CoordX
                             *		y: [Number],		// CoordY
                             *		t: [Bool]			// IsTransportedCityEntity (internal/todo:kommt weg)
                             *	},{...}]
                             */
                            var units = this.GetUnits(cityid, ownid),
                                formation = [];
                            if (units !== null) {
                                for (var i = 0; i < units.length; i++) {
                                    formation.push({
                                        id: units[i].get_Id(),
                                        gid: (units[i].get_IsTransportedCityEntity() ? units[i].get_TransporterCityEntity().get_Id() : (units[i].get_TransportedCityEntity() !== null ? units[i].get_TransportedCityEntity().get_Id() : 0)),
                                        gs: (units[i].get_IsTransportedCityEntity() ? 2 : (units[i].get_TransportedCityEntity() !== null ? 1 : 0)),
                                        i: units[i].get_MdbUnitId(),
                                        l: units[i].get_CurrentLevel(),
                                        h: Math.ceil(units[i].get_Health()),
                                        enabled: units[i].get_Enabled(),
                                        x: units[i].get_CoordX(),
                                        y: units[i].get_CoordY(),
                                        t: units[i].get_IsTransportedCityEntity()
                                    });
                                }
                                return formation;
                            }
                            return null;
                        },
                        Set: function (formation, cityid, ownid) {
                            /**
                             *	[{
                             *		id: [Number],		// UnitId
                             *		enabled: [Bool],	// Enabled
                             *		x: [Number],		// CoordX
                             *		y: [Number],		// CoordY
                             *		t: [Bool]			// IsTransportedCityEntity
                             *	},{...}]
                             */
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                unit, target, /* freePos,*/ transported = [],
                                i, targetFormation = this.GetFormation(CityId, OwnId)
                            /*,
                                                            getFreePos = function (formation) {
                                                                for (var x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                                                    for (var y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                                                        if (formation.GetUnitByCoord(x, y) === null) return {
                                                                            x: x,
                                                                            y: y
                                                                        };
                                                                    }
                                                                }
                                                                return null;
                                                            },
                                                             freeTransported = function (unit, freePos) {
                                                                if (unit.get_TransportedCityEntity() !== null) unit = unit.get_TransportedCityEntity();
                                                                if (unit.get_IsTransportedCityEntity() && freePos !== null) unit.MoveBattleUnit(freePos.x, freePos.y);
                                                            }*/
                            ;
                            if (targetFormation !== null) {
                                for (i = 0; i < formation.length; i++) {
                                    unit = this.GetUnitById(formation[i].id, CityId, OwnId);
                                    if (formation[i].gs == 2) {
                                        transported.push(formation[i]);
                                        continue;
                                    }
                                    target = targetFormation.GetUnitByCoord(formation[i].x, formation[i].y);
                                    /* freePos = getFreePos(targetFormation);
                                    if (freePos !== null && target !== null) freeTransported(target, freePos);
                                    freePos = getFreePos(targetFormation);
                                    if (freePos !== null) freeTransported(unit, freePos); */
                                    unit.set_Enabled(formation[i].enabled);
                                    /* target = targetFormation.GetUnitByCoord(formation[i].x, formation[i].y);*/
                                    if (target !== null && ClientLib.Base.Unit.CanBeTransported(target.get_UnitGameData_Obj(), unit.get_UnitGameData_Obj())) target.MoveBattleUnit(unit.get_CoordX(), unit.get_CoordY());
                                    unit.MoveBattleUnit(formation[i].x, formation[i].y);
                                }
                                // MOD transported units  Functions Deactiveted
                                // Modded  by Nequik  for revert to native unit enabling
                                for (i = 0; i < transported.length; i++) {
                                    unit = this.GetUnitById(transported[i].id, CityId, OwnId); //unit being trasported
                                    target = targetFormation.GetUnitByCoord(transported[i].x, transported[i].y); //unit trasporter
                                    if (target !== null && target.get_Enabled()) unit.set_Enabled(true);
                                    /*freePos = getFreePos(targetFormation); //find free spaces
                                    if (freePos !== null && target !== null) freeTransported(target, freePos); //if trasporter and free space
                                    freePos = getFreePos(targetFormation); //find other free spaces
                                    if (freePos !== null) freeTransported(unit, freePos); // if other spaces so from function if trasported is also trasporter so unit = second unit trasported and if second unit trasported move it free
                                    target = targetFormation.GetUnitByCoord(transported[i].x, transported[i].y); // trasporter = xy original
                                    if (target !== null) target.set_Enabled(true); if xy exist xy enabled
                                    unit.set_Enabled(true); unit being trasported enabled 
                                    unit.MoveBattleUnit(transported[i].x, transported[i].y); unit being trasported move to xy
                                    
                                    
                                    if (target !== null) target.set_Enabled(transported[i].enabled); // if trasporter exist toggle enable with trasported state
                                    else unit.set_Enabled(transported[i].enabled); // if not exist unit being trasported toggle enable with trasported state
                                    if (target !== null) target.MoveBattleUnit(transported[i].x, transported[i].y); // if trasporter exist move to xy original
                                
                              */
                                }
                            }
                        },
                        Merge: function (formation, attacker) {
                            for (var i in formation) {
                                for (var j in attacker) {
                                    if (formation[i].gs == attacker[j].gs && formation[i].i == attacker[j].i && formation[i].l == attacker[j].l && formation[i].x == attacker[j].x && formation[i].y == attacker[j].y) {
                                        for (var k in attacker[j])
                                            formation[i][k] = attacker[j][k];
                                    }
                                }
                            }
                            return formation;
                        },
                        IsFormationInCache: function () {
                            var cache = TABS.CACHE.getInstance().check(this.Get());
                            return (cache.result !== null);
                        },
                        Mirror: function (formation, pos, sel) {
                            switch (pos) {
                                case "h":
                                case "v":
                                    break;
                                default:
                                    return;
                            }
                            for (var i = 0; i < formation.length; i++) {
                                if ((sel === null || formation[i].y == sel) && pos == "h") formation[i].x = Math.abs(formation[i].x - ClientLib.Base.Util.get_ArmyMaxSlotCountX() + 1);
                                if ((sel === null || formation[i].x == sel) && pos == "v") formation[i].y = Math.abs(formation[i].y - ClientLib.Base.Util.get_ArmyMaxSlotCountY() + 1);
                            }
                            return formation;
                        },
                        SwapLines: function (formation, lineA, lineB) {
                            lineAZoroBasedIndex = lineA - 1;
                            lineBZeroBasedIndex = lineB - 1;
                            for (var f = 0; f < formation.length; f++) {
                                switch (formation[f].y) {
                                    case lineAZoroBasedIndex:
                                        formation[f].y = lineBZeroBasedIndex;
                                        break;
                                    case lineBZeroBasedIndex:
                                        formation[f].y = lineAZoroBasedIndex;
                                        break;
                                }
                            }
                            return formation;
                        },
                        Shift: function (formation, pos, sel) {
                            var v_shift = 0,
                                h_shift = 0;
                            switch (pos) {
                                case "u":
                                    v_shift = -1;
                                    break;
                                case "d":
                                    v_shift = 1;
                                    break;
                                case "l":
                                    h_shift = -1;
                                    break;
                                case "r":
                                    h_shift = 1;
                                    break;
                                default:
                                    return;
                            }
                            for (var i = 0; i < formation.length; i++) {
                                if ((sel === null || formation[i].y === sel) && (pos == "l" || pos == "r")) formation[i].x += h_shift;
                                if ((sel === null || formation[i].x === sel) && (pos == "u" || pos == "d")) formation[i].y += v_shift;
                                switch (formation[i].x) {
                                    case ClientLib.Base.Util.get_ArmyMaxSlotCountX():
                                        formation[i].x = 0;
                                        break;
                                    case -1:
                                        formation[i].x = ClientLib.Base.Util.get_ArmyMaxSlotCountX() - 1;
                                        break;
                                }
                                switch (formation[i].y) {
                                    case ClientLib.Base.Util.get_ArmyMaxSlotCountY():
                                        formation[i].y = 0;
                                        break;
                                    case -1:
                                        formation[i].y = ClientLib.Base.Util.get_ArmyMaxSlotCountY() - 1;
                                        break;
                                }
                            }
                            return formation;
                        },
                        set_Enabled: function (formation, set, EUnitGroup) {
                            if (set === null) set = true;
                            var all = (EUnitGroup != ClientLib.Data.EUnitGroup.Infantry && EUnitGroup != ClientLib.Data.EUnitGroup.Vehicle && EUnitGroup != ClientLib.Data.EUnitGroup.Aircraft);
                            for (var i = 0; i < formation.length; i++) {
                                var unitGroup = this.GetUnitGroupTypeFromUnit(ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(formation[i].i));
                                if (all || (EUnitGroup == unitGroup /* && formation[i].gs === 0 */ )) formation[i].enabled = set;
                            }
                            return formation;
                        },

                        // Mooded by Netquik

                        toggle_Enabled: function (formation, EUnitGroup) {
                            var all = (EUnitGroup != ClientLib.Data.EUnitGroup.Infantry && EUnitGroup != ClientLib.Data.EUnitGroup.Vehicle && EUnitGroup != ClientLib.Data.EUnitGroup.Aircraft);
                            for (var i = 0, num_total = 0, num_enabled = 0; i < formation.length; i++) {
                                var unitGroup = this.GetUnitGroupTypeFromUnit(ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(formation[i].i));
                                if (all || (EUnitGroup == unitGroup /* && formation[i].gs === 0 */ )) {
                                    num_total++;
                                    if (formation[i].enabled) num_enabled++;
                                }
                            }
                            return this.set_Enabled(formation, (num_enabled < (num_total / 2)), EUnitGroup);
                        },
                        GetUnitGroupTypeFromUnit: function (unit) {
                            if (unit === null) return ClientLib.Data.EUnitGroup.None;
                            if (unit.pt == ClientLib.Base.EPlacementType.Offense) switch (unit.mt) {
                                    case ClientLib.Base.EUnitMovementType.Feet:
                                        return ClientLib.Data.EUnitGroup.Infantry;
                                    case ClientLib.Base.EUnitMovementType.Wheel:
                                    case ClientLib.Base.EUnitMovementType.Track:
                                        return ClientLib.Data.EUnitGroup.Vehicle;
                                    case ClientLib.Base.EUnitMovementType.Air:
                                    case ClientLib.Base.EUnitMovementType.Air2:
                                        return ClientLib.Data.EUnitGroup.Aircraft;
                                } else if (unit.pt == ClientLib.Base.EPlacementType.Defense) return ClientLib.Data.EUnitGroup.Defense;
                                else return ClientLib.Data.EUnitGroup.None;
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Stats", { // [static]		Utilities for Stats calculation
                    type: "static",
                    statics: {
                        get_LootFromCurrentCity: function () {
                            var LootFromCurrentCity = ClientLib.API.Battleground.GetInstance().GetLootFromCurrentCity(),
                                LootClass = new TABS.STATS.Entity.Resource(),
                                Loot = LootClass.getAny();
                            if (LootFromCurrentCity !== null) {
                                for (var i = 0; i < LootFromCurrentCity.length; i++)
                                    Loot[LootFromCurrentCity[i].Type] = LootFromCurrentCity[i].Count;
                                LootClass.setAny(Loot);
                                return LootClass;
                            } else return null;
                        },
                        get_RepairCosts: function (mdbId, level, HealthPoints, AttackCounter) {
                            var ResourcesClass = new TABS.STATS.Entity.Resource(),
                                Resources = ResourcesClass.getAny(),
                                unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(mdbId),
                                Health, dmgRatio, costs;
                            AttackCounter = (AttackCounter !== undefined && AttackCounter !== null ? AttackCounter : 0);
                            if (HealthPoints instanceof TABS.STATS.Entity.HealthPoints) Health = HealthPoints;
                            else Health = new TABS.STATS.Entity.HealthPoints(HealthPoints);
                            if (Health.getStart() != Health.getEnd()) {
                                dmgRatio = (Health.getStart() - Health.getEnd()) / Health.getMax();
                                if (unit.pt !== ClientLib.Base.EPlacementType.Offense || ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) costs = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null ? ClientLib.API.Util.GetUnitRepairCosts(level, mdbId, dmgRatio) : null;
                                else costs = ClientLib.API.Util.GetOwnUnitRepairCosts(level, mdbId, dmgRatio);
                                for (var i = 0; costs !== null && i < costs.length; i++)
                                    switch (costs[i].Type) {
                                        case ClientLib.Base.EResourceType.Tiberium:
                                        case ClientLib.Base.EResourceType.Crystal:
                                        case ClientLib.Base.EResourceType.Gold:
                                        case ClientLib.Base.EResourceType.ResearchPoints:
                                            Resources[costs[i].Type] = costs[i].Count * Math.pow(0.7, AttackCounter);
                                            break;
                                        default:
                                            Resources[costs[i].Type] = costs[i].Count;
                                            break;
                                    }
                            }
                            if (Resources[ClientLib.Base.EResourceType.ResearchPoints] > 0) Resources[ClientLib.Base.EResourceType.ResearchPoints] = Math.max(1, Math.floor(Resources[ClientLib.Base.EResourceType.ResearchPoints] * dmgRatio));
                            ResourcesClass.setAny(Resources);
                            return ResourcesClass;
                        },
                        get_BuildingInfo: function (cityid) {
                            var BuildingInfo = {},
                                City = ((cityid !== undefined && cityid !== null) ? ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityid) : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity());
                            if (City !== null) {
                                var CityBuildingsData = City.get_CityBuildingsData(),
                                    get_BuildingInfo = function (Building) {
                                        if (Building !== null) return {
                                            MdbId: Building.get_TechGameData_Obj().c,
                                            x: Building.get_CoordX(),
                                            y: Building.get_CoordY()
                                        };
                                        else return null;
                                    };
                                BuildingInfo.Construction_Yard = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Construction_Yard) || CityBuildingsData.GetBuildingByMDBId(ClientLib.Base.ETech.FOR_Fortress_ConstructionYard));
                                BuildingInfo.Command_Center = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Command_Center));
                                BuildingInfo.Barracks = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Barracks));
                                BuildingInfo.Factory = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Factory));
                                BuildingInfo.Airport = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Airport));
                                BuildingInfo.Defense_Facility = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_Facility));
                                BuildingInfo.Defense_HQ = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_HQ));
                                BuildingInfo.Support = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Air) || CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Art) || CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Ion));
                            }
                            return BuildingInfo;
                        },
                        _GetModuleByType: function (modules, type) {
                            for (var i = 0; i < modules.length; i++) {
                                if (modules[i].t == type) return modules[i];
                            }
                            return null;
                        },
                        _patchUnitLifePoints: function (unit, activeModules) {
                            var newUnit = qx.lang.Object.clone(unit, true),
                                module = this._GetModuleByType(newUnit.m, ClientLib.Base.EUnitModuleType.HitpointOverride);
                            if (module !== null && activeModules.indexOf(module.i) != -1) newUnit.lp = module.h;
                            return newUnit;
                        },
                        get_UnitMaxHealthByLevel: function (level, unit, bonus, activeModules) {
                            return Math.floor(ClientLib.API.Util.GetUnitMaxHealthByLevel(level, this._patchUnitLifePoints(unit, activeModules), bonus)) * 16;
                        },
                        get_Stats: function (data) {
                            try {
                                var StatsClass = new TABS.STATS(),
                                    Stats = StatsClass.getAny(),
                                    sim = {},
                                    buildings = data.d.s,
                                    buildingInfo = this.get_BuildingInfo(data.d.di),
                                    efficiency = 0,
                                    ve_level = 1,
                                    defender = data.d.d,
                                    attacker = data.d.a,
                                    unit, unitHealthPoints = new TABS.STATS.Entity.HealthPoints(),
                                    unitRepairCosts, unitMaxHealthPoints, i;

                                function addObject(a, b) {
                                    for (var i in a)
                                        a[i] += b[i];
                                    return a;
                                }
                                //simulation
                                for (i = 0; i < data.e.length; i++)
                                    sim[data.e[i].Key] = data.e[i].Value;
                                //BattleDuration
                                Stats.BattleDuration = (data.d.cs * 100) + (data.d.cs < (data.d.md * 10) ? 3000 : 0);
                                for (i = 0; i < buildings.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(buildings[i].i);
                                    //maxHealth
                                    switch (data.d.df) {
                                        case ClientLib.Base.EFactionType.GDIFaction:
                                        case ClientLib.Base.EFactionType.NODFaction:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(buildings[i].l, unit, true, data.d.dm);
                                            unitHealthPoints.setMax(sim[buildings[i].ci].mh);
                                            unitHealthPoints.setStart(sim[buildings[i].ci].h);
                                            break;
                                        default:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(buildings[i].l, unit, false, data.d.dm);
                                            unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, buildings[i].h * 16));
                                            unitHealthPoints.setStart(buildings[i].h * 16);
                                            break;
                                    }
                                    unitHealthPoints.setEnd(sim[buildings[i].ci].h);
                                    unitRepairCosts = this.get_RepairCosts(buildings[i].i, buildings[i].l, unitHealthPoints);
                                    addObject(Stats.Enemy.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Overall.Resource, unitRepairCosts.getAny());
                                    addObject(Stats.Enemy.Structure.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Structure.Resource, unitRepairCosts.getAny());
                                    switch (parseInt(ClientLib.Base.Tech.GetTechNameFromTechId(unit.tl, unit.f), 10)) {
                                        case ClientLib.Base.ETechName.Construction_Yard:
                                            addObject(Stats.Enemy.Construction_Yard.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Construction_Yard.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Command_Center:
                                            addObject(Stats.Enemy.Command_Center.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Command_Center.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Barracks:
                                            addObject(Stats.Enemy.Barracks.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Barracks.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Factory:
                                            addObject(Stats.Enemy.Factory.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Factory.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Airport:
                                            addObject(Stats.Enemy.Airport.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Airport.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Defense_Facility:
                                            addObject(Stats.Enemy.Defense_Facility.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Defense_Facility.Resource, unitRepairCosts.getAny());
                                            efficiency = 0.7 * (unitHealthPoints.getEnd() / unitHealthPoints.getMax());
                                            ve_level = buildings[i].l;
                                            break;
                                        case ClientLib.Base.ETechName.Defense_HQ:
                                            addObject(Stats.Enemy.Defense_HQ.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Defense_HQ.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Support_Air:
                                        case ClientLib.Base.ETechName.Support_Ion:
                                        case ClientLib.Base.ETechName.Support_Art:
                                            addObject(Stats.Enemy.Support.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Support.Resource, unitRepairCosts.getAny());
                                            break;
                                    }
                                    if (buildingInfo.Construction_Yard !== undefined) {
                                        if (buildingInfo.Construction_Yard !== null && buildingInfo.Construction_Yard.x == buildings[i].x && buildingInfo.Construction_Yard.y < buildings[i].y) {
                                            Stats.Enemy.Construction_Yard.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Construction_Yard.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Construction_Yard.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Command_Center !== null && buildingInfo.Command_Center.x == buildings[i].x && buildingInfo.Command_Center.y < buildings[i].y) {
                                            Stats.Enemy.Command_Center.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Command_Center.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Command_Center.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Barracks !== null && buildingInfo.Barracks.x == buildings[i].x && buildingInfo.Barracks.y < buildings[i].y) {
                                            Stats.Enemy.Barracks.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Barracks.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Barracks.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Factory !== null && buildingInfo.Factory.x == buildings[i].x && buildingInfo.Factory.y < buildings[i].y) {
                                            Stats.Enemy.Factory.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Factory.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Factory.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Airport !== null && buildingInfo.Airport.x == buildings[i].x && buildingInfo.Airport.y < buildings[i].y) {
                                            Stats.Enemy.Airport.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Airport.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Airport.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_Facility !== null && buildingInfo.Defense_Facility.x == buildings[i].x && buildingInfo.Defense_Facility.y < buildings[i].y) {
                                            Stats.Enemy.Defense_Facility.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_Facility.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_Facility.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_HQ !== null && buildingInfo.Defense_HQ.x == buildings[i].x && buildingInfo.Defense_HQ.y < buildings[i].y) {
                                            Stats.Enemy.Defense_HQ.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_HQ.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_HQ.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Support !== null && buildingInfo.Support.x == buildings[i].x && buildingInfo.Support.y < buildings[i].y) {
                                            Stats.Enemy.Support.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Support.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Support.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                    }
                                }
                                for (i = 0; i < defender.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(defender[i].i);
                                    //maxHealth
                                    switch (data.d.df) {
                                        case ClientLib.Base.EFactionType.GDIFaction:
                                        case ClientLib.Base.EFactionType.NODFaction:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(defender[i].l, unit, true, data.d.dm);
                                            break;
                                        default:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(defender[i].l, unit, false, data.d.dm);
                                            break;
                                    }
                                    unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, defender[i].h * 16));
                                    unitHealthPoints.setStart(defender[i].h * 16);
                                    unitHealthPoints.setEnd(sim[defender[i].ci].h);
                                    unitHealthPoints.setRep((((defender[i].h * 16) - (sim[defender[i].ci].h)) * efficiency * ve_level) / Math.max(ve_level, defender[i].l));
                                    unitRepairCosts = this.get_RepairCosts(defender[i].i, defender[i].l, unitHealthPoints, defender[i].ac);
                                    addObject(Stats.Enemy.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Overall.Resource, unitRepairCosts.getAny());
                                    addObject(Stats.Enemy.Defense.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Defense.Resource, unitRepairCosts.getAny());
                                    if (unit.ptt == ClientLib.Base.EArmorType.NONE) {
                                        addObject(Stats.Enemy.DefenseNonArmored.HealthPoints, unitHealthPoints.getAny());
                                        addObject(Stats.Enemy.DefenseNonArmored.Resource, unitRepairCosts.getAny());
                                    } else {
                                        addObject(Stats.Enemy.DefenseArmored.HealthPoints, unitHealthPoints.getAny());
                                        addObject(Stats.Enemy.DefenseArmored.Resource, unitRepairCosts.getAny());
                                    }
                                    if (buildingInfo.Construction_Yard !== undefined && unit.mt == ClientLib.Base.EUnitMovementType.Structure) {
                                        if (buildingInfo.Construction_Yard !== null && buildingInfo.Construction_Yard.x == defender[i].x) {
                                            Stats.Enemy.Construction_Yard.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Construction_Yard.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Construction_Yard.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Command_Center !== null && buildingInfo.Command_Center.x == defender[i].x) {
                                            Stats.Enemy.Command_Center.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Command_Center.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Command_Center.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Barracks !== null && buildingInfo.Barracks.x == defender[i].x) {
                                            Stats.Enemy.Barracks.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Barracks.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Barracks.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Factory !== null && buildingInfo.Factory.x == defender[i].x) {
                                            Stats.Enemy.Factory.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Factory.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Factory.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Airport !== null && buildingInfo.Airport.x == defender[i].x) {
                                            Stats.Enemy.Airport.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Airport.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Airport.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_Facility !== null && buildingInfo.Defense_Facility.x == defender[i].x) {
                                            Stats.Enemy.Defense_Facility.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_Facility.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_Facility.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_HQ !== null && buildingInfo.Defense_HQ.x == defender[i].x) {
                                            Stats.Enemy.Defense_HQ.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_HQ.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_HQ.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Support !== null && buildingInfo.Support.x == defender[i].x) {
                                            Stats.Enemy.Support.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Support.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Support.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                    }
                                }
                                if (ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(data.d.ai);
                                for (i = 0; i < attacker.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(attacker[i].i);
                                    //maxHealth
                                    unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(attacker[i].l, unit, false, data.d.am);
                                    unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, attacker[i].h * 16));
                                    unitHealthPoints.setStart(attacker[i].h * 16);
                                    if (sim[attacker[i].ci] !== undefined) unitHealthPoints.setEnd(sim[attacker[i].ci].h);
                                    else unitHealthPoints.setEnd(attacker[i].h * 16);
                                    unitRepairCosts = this.get_RepairCosts(attacker[i].i, attacker[i].l, unitHealthPoints);
                                    addObject(Stats.Offense.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Offense.Overall.Resource, unitRepairCosts.getAny());
                                    switch (unit.mt) {
                                        case ClientLib.Base.EUnitMovementType.Feet:
                                            addObject(Stats.Offense.Infantry.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Infantry.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.EUnitMovementType.Wheel:
                                        case ClientLib.Base.EUnitMovementType.Track:
                                            addObject(Stats.Offense.Vehicle.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Vehicle.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.EUnitMovementType.Air:
                                        case ClientLib.Base.EUnitMovementType.Air2:
                                            addObject(Stats.Offense.Aircraft.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Aircraft.Resource, unitRepairCosts.getAny());
                                            break;
                                    }
                                }
                                if (ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(data.d.di);
                                StatsClass.setAny(Stats);
                                return StatsClass;
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in TABS.UTIL.Stats.get_Stats()", e);
                                console.groupEnd();
                            }
                        },
                        patchGetUnitRepairCosts: function () {
                            try {
                                /*  for (var i in ClientLib.Data.Cities.prototype) {
                                     if (typeof ClientLib.Data.Cities.prototype[i] === "function" && ClientLib.Data.Cities.prototype[i] == ClientLib.Data.Cities.prototype.get_CurrentCity && i !== "get_CurrentCity") break;
                                 }
                                 var GetOwnUnitRepairCosts = ClientLib.API.Util.GetUnitRepairCosts.toString().replace(i, "get_CurrentOwnCity"),
                                     args = GetOwnUnitRepairCosts.substring(GetOwnUnitRepairCosts.indexOf("(") + 1, GetOwnUnitRepairCosts.indexOf(")")),
                                     body = GetOwnUnitRepairCosts.substring(GetOwnUnitRepairCosts.indexOf("{") + 1, GetOwnUnitRepairCosts.lastIndexOf("}")); /*jslint evil: true */
                                //ClientLib.API.Util.GetOwnUnitRepairCosts = Evil(args, body); /*jslint evil: false */ 
                                //MOD NOEVIL 1
                                ClientLib.API.Util.GetOwnGetUnitRepairCosts = function (a, b, c) {
                                    var $createHelper;
                                    return ClientLib.API.Util.GetUnitRepairCostsForCity(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity(), a, b, c);
                                }
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error setting up ClientLib.API.Util.GetOwnUnitRepairCosts", e);
                                console.groupEnd();
                            }
                        }
                    },
                    defer: function (statics) {
                        try {
                            statics.patchGetUnitRepairCosts();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up UTIL.Stats defer", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Battleground", { // [static]		Battleground
                    type: "static",
                    statics: {
                        StartReplay: function (cityid, combat) {
                            qx.core.Init.getApplication().getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay, cityid, 0, 0);
                            ClientLib.Vis.VisMain.GetInstance().get_Battleground().Init();
                            ClientLib.Vis.VisMain.GetInstance().get_Battleground().LoadCombatDirect(combat);
                            qx.event.Timer.once(function () {
                                ClientLib.Vis.VisMain.GetInstance().get_Battleground().RestartReplay();
                                //MOD FIX DATE APPEAR
                                _this = TABS.GUI.PlayArea.getInstance();
                                if (typeof _this._playAreaChildren[11].getChildren == 'function' && typeof Date.parse(_this._playAreaChildren[11].getChildren()[0].getValue()) == 'number') {
                                    _this._playAreaChildren[11].exclude();
                                }
                                //MOD FIX PLAY BUTTON
                                //_this = TABS.GUI.ReportReplayOverlay.getInstance();
                                let r = this.ReportReplayOverlay;
                                null != r[this.PBIS] && r[this.PBIS].setIcon('FactionUI/icons/icon_replay_pause_button.png');
                                null != r[this.PBIS_S] && (r[this.PBIS_S] = !1);
                                null != r[this.PBIS_L] && r[this.PBIS_L].setValue('x1.0');

                                ClientLib.Vis.VisMain.GetInstance().get_Battleground().set_ReplaySpeed(1);
                            }, TABS.GUI.ReportReplayOverlay.getInstance(), 0);
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.CNCTAOpt", { // [static]		CNCTAOpt
                    type: "static",
                    statics: {
                        keymap: {
                            "GDI_Accumulator": "a",
                            "GDI_Refinery": "r",
                            "GDI_Trade Center": "u",
                            "GDI_Silo": "s",
                            "GDI_Power Plant": "p",
                            "GDI_Construction Yard": "y",
                            "GDI_Airport": "d",
                            "GDI_Barracks": "b",
                            "GDI_Factory": "f",
                            "GDI_Defense HQ": "q",
                            "GDI_Defense Facility": "w",
                            "GDI_Command Center": "e",
                            "GDI_Support_Art": "z",
                            "GDI_Support_Air": "x",
                            "GDI_Support_Ion": "i",
                            "GDI_Harvester": "h",
                            "GDI_Harvester_Crystal": "n",
                            "FOR_Silo": "s",
                            "FOR_Refinery": "r",
                            "FOR_Tiberium Booster": "b",
                            "FOR_Crystal Booster": "v",
                            "FOR_Trade Center": "u",
                            "FOR_Defense Facility": "w",
                            "FOR_Construction Yard": "y",
                            "FOR_Harvester_Tiberium": "h",
                            "FOR_Defense HQ": "q",
                            "FOR_Harvester_Crystal": "n",
                            "NOD_Refinery": "r",
                            "NOD_Power Plant": "p",
                            "NOD_Harvester": "h",
                            "NOD_Construction Yard": "y",
                            "NOD_Airport": "d",
                            "NOD_Trade Center": "u",
                            "NOD_Defense HQ": "q",
                            "NOD_Barracks": "b",
                            "NOD_Silo": "s",
                            "NOD_Factory": "f",
                            "NOD_Harvester_Crystal": "n",
                            "NOD_Command Post": "e",
                            "NOD_Support_Art": "z",
                            "NOD_Support_Ion": "i",
                            "NOD_Accumulator": "a",
                            "NOD_Support_Air": "x",
                            "NOD_Defense Facility": "w",
                            "GDI_Wall": "w",
                            "GDI_Cannon": "c",
                            "GDI_Antitank Barrier": "t",
                            "GDI_Barbwire": "b",
                            "GDI_Turret": "m",
                            "GDI_Flak": "f",
                            "GDI_Art Inf": "r",
                            "GDI_Art Air": "e",
                            "GDI_Art Tank": "a",
                            "GDI_Def_APC Guardian": "g",
                            "GDI_Def_Missile Squad": "q",
                            "GDI_Def_Pitbull": "p",
                            "GDI_Def_Predator": "d",
                            "GDI_Def_Sniper": "s",
                            "GDI_Def_Zone Trooper": "z",
                            "NOD_Def_Antitank Barrier": "t",
                            "NOD_Def_Art Air": "e",
                            "NOD_Def_Art Inf": "r",
                            "NOD_Def_Art Tank": "a",
                            "NOD_Def_Attack Bike": "p",
                            "NOD_Def_Barbwire": "b",
                            "NOD_Def_Black Hand": "z",
                            "NOD_Def_Cannon": "c",
                            "NOD_Def_Confessor": "s",
                            "NOD_Def_Flak": "f",
                            "NOD_Def_MG Nest": "m",
                            "NOD_Def_Militant Rocket Soldiers": "q",
                            "NOD_Def_Reckoner": "g",
                            "NOD_Def_Scorpion Tank": "d",
                            "NOD_Def_Wall": "w",
                            "FOR_Wall": "w",
                            "FOR_Barbwire_VS_Inf": "b",
                            "FOR_Barrier_VS_Veh": "t",
                            "FOR_Inf_VS_Inf": "g",
                            "FOR_Inf_VS_Veh": "r",
                            "FOR_Inf_VS_Air": "q",
                            "FOR_Sniper": "n",
                            "FOR_Mammoth": "y",
                            "FOR_Veh_VS_Inf": "o",
                            "FOR_Veh_VS_Veh": "s",
                            "FOR_Veh_VS_Air": "u",
                            "FOR_Turret_VS_Inf": "m",
                            "FOR_Turret_VS_Inf_ranged": "a",
                            "FOR_Turret_VS_Veh": "v",
                            "FOR_Turret_VS_Veh_ranged": "d",
                            "FOR_Turret_VS_Air": "f",
                            "FOR_Turret_VS_Air_ranged": "e",
                            "GDI_APC Guardian": "g",
                            "GDI_Commando": "c",
                            "GDI_Firehawk": "f",
                            "GDI_Juggernaut": "j",
                            "GDI_Kodiak": "k",
                            "GDI_Mammoth": "m",
                            "GDI_Missile Squad": "q",
                            "GDI_Orca": "o",
                            "GDI_Paladin": "a",
                            "GDI_Pitbull": "p",
                            "GDI_Predator": "d",
                            "GDI_Riflemen": "r",
                            "GDI_Sniper Team": "s",
                            "GDI_Zone Trooper": "z",
                            "NOD_Attack Bike": "b",
                            "NOD_Avatar": "a",
                            "NOD_Black Hand": "z",
                            "NOD_Cobra": "r",
                            "NOD_Commando": "c",
                            "NOD_Confessor": "s",
                            "NOD_Militant Rocket Soldiers": "q",
                            "NOD_Militants": "m",
                            "NOD_Reckoner": "k",
                            "NOD_Salamander": "l",
                            "NOD_Scorpion Tank": "o",
                            "NOD_Specter Artilery": "p",
                            "NOD_Venom": "v",
                            "NOD_Vertigo": "t",
                            "<last>": "."
                        },
                        createLink: function (city, own_city) {
                            city = ((city !== undefined && city !== null) ? city : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity());
                            own_city = ((own_city !== undefined && own_city !== null) ? own_city : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity());

                            function findTechLayout(city) {
                                for (var k in city)
                                    if ((typeof (city[k]) == "object") && city[k] && 0 in city[k] && 8 in city[k])
                                        if ((typeof (city[k][0]) == "object") && city[k][0] && city[k][0] && 0 in city[k][0] && 15 in city[k][0])
                                            if ((typeof (city[k][0][0]) == "object") && city[k][0][0] && "BuildingIndex" in city[k][0][0]) return city[k];
                                return null;
                            }

                            function findBuildings(city) {
                                var cityBuildings = city.get_CityBuildingsData();
                                for (var k in cityBuildings) {
                                    if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "d" in cityBuildings[k] && "c" in cityBuildings[k] && cityBuildings[k].c > 0) return cityBuildings[k].d;
                                }
                            }

                            function getUnitArrays(city) {
                                var ret = [];
                                for (var k in city)
                                    if ((typeof (city[k]) == "object") && city[k])
                                        for (var k2 in city[k])
                                            if ((typeof (city[k][k2]) == "object") && city[k][k2] && "d" in city[k][k2]) {
                                                var lst = city[k][k2].d;
                                                if ((typeof (lst) == "object") && lst)
                                                    for (var i in lst)
                                                        if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) ret.push(lst);
                                            }
                                return ret;
                            }

                            function getDefenseUnits(city) {
                                var arr = getUnitArrays(city);
                                for (var i = 0; i < arr.length; ++i)
                                    for (var j in arr[i])
                                        if (TABS.UTIL.Formation.GetUnitGroupTypeFromUnit(arr[i][j].get_UnitGameData_Obj()) == ClientLib.Data.EUnitGroup.Defense) return arr[i];
                                return [];
                            }

                            function getFactionKey(faction) {
                                switch (faction) {
                                    case ClientLib.Base.EFactionType.GDIFaction:
                                        return "G";
                                    case ClientLib.Base.EFactionType.NODFaction:
                                        return "N";
                                    case ClientLib.Base.EFactionType.FORFaction:
                                    case ClientLib.Base.EFactionType.NPCBase:
                                    case ClientLib.Base.EFactionType.NPCCamp:
                                    case ClientLib.Base.EFactionType.NPCOutpost:
                                    case ClientLib.Base.EFactionType.NPCFortress:
                                        return "F";
                                    default:
                                        console.log("cnctaopt: Unknown faction: " + city.get_CityFaction());
                                        return "E";
                                }
                            }

                            function getUnitKey(unit) {
                                if (typeof TABS.UTIL.CNCTAOpt.keymap[unit.n] !== "undefined") {
                                    return TABS.UTIL.CNCTAOpt.keymap[unit.n];
                                } else {
                                    return ".";
                                }
                            }
                            var link = "http://www.cnctaopt.com/?map=",
                                defense_units = [],
                                offense_units = [],
                                defense_unit_list = getDefenseUnits(city),
                                army = own_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(city.get_Id()),
                                offense_unit_list, techLayout = findTechLayout(city),
                                buildings = findBuildings(city),
                                row, spot, level, building, defense_unit, offense_unit, alliance = ClientLib.Data.MainData.GetInstance().get_Alliance(),
                                i;
                            link += "3~"; // link version
                            link += getFactionKey(city.get_CityFaction()) + "~";
                            link += getFactionKey(own_city.get_CityFaction()) + "~";
                            link += city.get_Name() + "~";
                            for (i = 0; i < 20; ++i) {
                                defense_units.push([null, null, null, null, null, null, null, null, null]);
                                offense_units.push([null, null, null, null, null, null, null, null, null]);
                            }
                            for (i in defense_unit_list)
                                defense_units[defense_unit_list[i].get_CoordX()][defense_unit_list[i].get_CoordY() + 8] = defense_unit_list[i];
                            if (army.get_ArmyUnits() !== null) offense_unit_list = army.get_ArmyUnits().l;
                            else offense_unit_list = city.get_CityUnitsData().get_OffenseUnits().d;
                            for (i in offense_unit_list)
                                if (offense_unit_list[i].get_Enabled() && !offense_unit_list[i].get_IsTransportedCityEntity()) offense_units[offense_unit_list[i].get_CoordX()][offense_unit_list[i].get_CoordY() + 16] = offense_unit_list[i];
                            for (i = 0; i < 20; ++i) {
                                row = [];
                                for (var j = 0; j < 9; ++j) {
                                    spot = i > 16 ? null : techLayout[j][i];
                                    level = 0;
                                    building = null;
                                    if (spot && spot.BuildingIndex >= 0) {
                                        building = buildings[spot.BuildingIndex];
                                        level = building.get_CurrentLevel();
                                    }
                                    defense_unit = defense_units[j][i];
                                    if (defense_unit) {
                                        level = defense_unit.get_CurrentLevel();
                                    }
                                    offense_unit = offense_units[j][i];
                                    if (offense_unit) {
                                        level = offense_unit.get_CurrentLevel();
                                    }
                                    if (level > 1) {
                                        link += level;
                                    }
                                    switch (i > 16 ? 0 : city.GetResourceType(j, i)) {
                                        case ClientLib.Data.ECityTerrainType.NONE:
                                            if (building) {
                                                link += getUnitKey(GAMEDATA.Tech[building.get_MdbBuildingId()]);
                                            } else if (defense_unit) {
                                                link += getUnitKey(defense_unit.get_UnitGameData_Obj());
                                            } else if (offense_unit) {
                                                link += getUnitKey(offense_unit.get_UnitGameData_Obj());
                                            } else {
                                                link += ".";
                                            }
                                            break;
                                        case ClientLib.Data.ECityTerrainType.CRYSTAL:
                                            if (spot.BuildingIndex < 0) link += "c";
                                            else link += "n";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.TIBERIUM:
                                            if (spot.BuildingIndex < 0) link += "t";
                                            else link += "h";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.FOREST:
                                            link += "j";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.BRIAR:
                                            link += "h";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.SWAMP:
                                            link += "l";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.WATER:
                                            link += "k";
                                            break;
                                        default:
                                            console.log("cnctaopt [4]: Unhandled resource type: " + city.GetResourceType(j, i));
                                            link += ".";
                                            break;
                                    }
                                }
                            }
                            if (alliance) {
                                link += "~" + alliance.get_POITiberiumBonus();
                                link += "~" + alliance.get_POICrystalBonus();
                                link += "~" + alliance.get_POIPowerBonus();
                                link += "~" + alliance.get_POIInfantryBonus();
                                link += "~" + alliance.get_POIVehicleBonus();
                                link += "~" + alliance.get_POIAirBonus();
                                link += "~" + alliance.get_POIDefenseBonus();
                            }
                            if (ClientLib.Data.MainData.GetInstance().get_Server().get_TechLevelUpgradeFactorBonusAmount() != 1.20) {
                                link += "~newEconomy";
                            }
                            // append cnctaopt.com's extra parameters ...
                            var coordX = city.get_X();
                            var coordY = city.get_Y();
                            // append base's coords to link
                            link += "~X" + coordX + "Y" + coordY;
                            // append world id and world name
                            link += "~WID=" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                            link += "~WN=" + ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                            return link;
                        },
                        parseLink: function (link) {
                            var formation = TABS.UTIL.Formation.Get();

                            function getFaction(faction) {
                                switch (faction) {
                                    case "G":
                                        return ClientLib.Base.EFactionType.GDIFaction;
                                    case "N":
                                        return ClientLib.Base.EFactionType.NODFaction;
                                    case "F":
                                        return ClientLib.Base.EFactionType.FORFaction;
                                    default:
                                        return ClientLib.Base.EFactionType.NotInitialized;
                                }
                            }

                            function initMapRev() {
                                var units = GAMEDATA.units,
                                    keys = Object.keys(GAMEDATA.units),
                                    len = keys.length,
                                    unit, data = {
                                        1: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        },
                                        2: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        },
                                        3: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        }
                                    };
                                while (len--) {
                                    unit = units[keys[len]];
                                    if (typeof TABS.UTIL.CNCTAOpt.keymap[unit.n] !== "undefined") {
                                        switch (unit.pt) {
                                            case ClientLib.Base.EPlacementType.Offense:
                                                data[unit.f][2][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            case ClientLib.Base.EPlacementType.Defense:
                                                data[unit.f][1][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            case ClientLib.Base.EPlacementType.Structure:
                                                data[unit.f][0][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            default:
                                                console.log("Unknown map: " + unit.n);
                                                break;
                                        }
                                    }
                                }
                                return data;
                            }

                            function findFreePos(formation) {
                                var x, y, i, map = [];
                                for (x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                    map[x] = [];
                                    for (y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                        map[x][y] = false;
                                        for (i = 0; i < formation.length; i++) {
                                            if (formation[i].x === x && formation[i].y === y) map[x][y] = true;
                                        }
                                    }
                                }
                                for (x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                    for (y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                        if (map[x][y] === false) {
                                            return {
                                                'x': x,
                                                'y': y
                                            };
                                        }
                                    }
                                }
                                return null;
                            }
                            if (link !== null && link.indexOf("|") != -1) {
                                var parts = link.split("|");
                                if (parts === null | parts.length < 5) {
                                    console.log("Corrupt link");
                                    return formation;
                                }
                                var keymapRev = initMapRev(),
                                    faction1 = getFaction(parts[1]),
                                    faction2 = getFaction(parts[2]),
                                    re = /[chjklnt.]|[\d]+[^.]/g,
                                    count = -1,
                                    step, type, id, level, section, i, j, x, y, result, units = [],
                                    freePos;
                                while ((result = re.exec(parts[4]))) {
                                    result = result ? result[0] : null;
                                    step = ++count % 72;
                                    x = step % 9;
                                    y = Math.floor(step / 9);
                                    if (result.length !== 1) {
                                        type = result.substr(-1);
                                        level = parseInt(result.slice(0, -1), 10);
                                        section = Math.floor(count / 72);
                                        if (typeof keymapRev[section == 2 ? faction2 : faction1][section][type] === "undefined") {
                                            console.log("Unknown key: " + result + " at pos: " + count);
                                            continue;
                                        }
                                        id = keymapRev[section == 2 ? faction2 : faction1][section][type];
                                        switch (id) {
                                            case 175:
                                                id = 115;
                                                break;
                                            case 176:
                                                id = 155;
                                                break;
                                        }
                                        if (GAMEDATA.units[id].pt == ClientLib.Base.EPlacementType.Offense) {
                                            units.push({
                                                i: id,
                                                l: level,
                                                x: x,
                                                y: y
                                            });
                                        }
                                    }
                                }
                                formation = TABS.UTIL.Formation.set_Enabled(formation, false);
                                for (i = 0; i < formation.length; i++) {
                                    for (j = 0; j < units.length; j++) {
                                        if (units[j] !== null && formation[i].i == units[j].i && formation[i].l == units[j].l) {
                                            formation[i].x = units[j].x;
                                            formation[i].y = units[j].y;
                                            formation[i].enabled = true;
                                            units.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                                for (i = 0; i < formation.length; i++) {
                                    if (formation[i].enabled === false) {
                                        freePos = findFreePos(formation);
                                        if (freePos !== null) {
                                            formation[i].x = freePos.x;
                                            formation[i].y = freePos.y;
                                        }
                                    }
                                }
                            }
                            return formation;
                        }
                    }
                });
                qx.Class.define("TABS.MENU", { // [singleton]	Menu
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        this.base(arguments);
                        var ScriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
                        this.Menu = new qx.ui.menu.Menu();
                        ScriptsButton.Add("Battle Simulator V2", TABS.RES.IMG.Menu, this.Menu);
                        //SETTINGS
                        var settingsMenu = new qx.ui.menu.Menu(),
                            settingsLoad = new qx.ui.menu.Button(this.tr("load"), null, null),
                            settingsSave = new qx.ui.menu.Button(this.tr("save"), null, null),
                            settingsReset = new qx.ui.menu.Button(this.tr("reset"), null, null);
                        settingsLoad.addListener("execute", function () {
                            TABS.SETTINGS.load();
                        }, this);
                        settingsSave.addListener("execute", function () {
                            TABS.SETTINGS.save();
                        }, this);
                        settingsReset.addListener("execute", function () {
                            TABS.SETTINGS.reset();
                            alert(this.tr("Game will reload now."));
                            window.location.reload();
                        }, this);
                        settingsMenu.add(settingsLoad);
                        settingsMenu.add(settingsSave);
                        settingsMenu.add(settingsReset);
                        this.Menu.add(new qx.ui.menu.Button("Settings", null, null, settingsMenu));
                        // Info-Menü Homepage/Facebook entfernt

                    },
                    members: {
                        Menu: null
                    },
                    defer: function () {
                        TABS.addInit("TABS.MENU");
                    }
                });
                qx.Class.define("TABS.STATS", { //				Stats Object
                    extend: qx.core.Object,
                    statics: {
                        Prio: {
                            Click: 0,
                            Enemy: 1,
                            Structure: 2,
                            Construction_Yard: 3,
                            Command_Center: 4,
                            Barracks: 5,
                            Factory: 6,
                            Airport: 7,
                            Defense_Facility: 8,
                            Defense_HQ: 9,
                            Support: 10,
                            Defense: 11,
                            DefenseArmored: 12,
                            DefenseNonArmored: 13,
                            Offense: 14,
                            Infantry: 15,
                            Vehicle: 16,
                            Aircraft: 17,
                            BattleDuration: 18,
                            AutoRepair: 19
                        },
                        Type: {
                            Click: 0,
                            HealthPointPercent: 1,
                            RepairChargeBase: 2,
                            RepairChargeOffense: 3,
                            RepairCosts: 4,
                            Loot: 5,
                            HealthPointAutoRepairPercent: 6
                        },
                        getPreset: function (num) {
                            switch (num) {
                                case 1:
                                    // Construction_Yard
                                    return {
                                        Name: "CY",
                                            Description: "Most priority to construction yard including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Construction_Yard, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 2:
                                    // Defense_Facility
                                    return {
                                        Name: "DF",
                                            Description: "Most priority to defense facility including all in front of it.<br>After this the best armored defense health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Defense_Facility, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.DefenseArmored, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 3:
                                    // Defense
                                    return {
                                        Name: "Deff",
                                            Description: "Most priority to defense health including the auto repair after the battle.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.AutoRepair, TABS.STATS.Type.HealthPointAutoRepairPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 4:
                                    // Command_Center
                                    return {
                                        Name: "CC",
                                            Description: "Most priority to command center including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Command_Center, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 5:
                                    // Construction_Yard nokill 10%
                                    return {
                                        Name: "CY*",
                                            Description: "NoKill (farming) priorety.<br>Not working correctly yet.",
                                            Prio: [
                                                [TABS.STATS.Prio.DefenseArmored, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Defense_Facility, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Construction_Yard, TABS.STATS.Type.HealthPointPercent, false, 0.1, true],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, true, 0.8, true],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                default:
                                    return {
                                        Name: "live",
                                            Description: "Shows the current army formation.",
                                            Prio: []
                                    };
                            }
                        },
                        selectPrio: function (stats, prio /*[this.Prio, this.Type, Negate/Boolean, Limit/0.0-1.0/%, NoKill/Boolean]*/ ) {
                            switch (prio[0]) {
                                case this.Prio.Enemy:
                                    return this._selectType(stats.Enemy.Overall, prio);
                                case this.Prio.Structure:
                                    return this._selectType(stats.Enemy.Structure, prio);
                                case this.Prio.Construction_Yard:
                                    return this._selectType(stats.Enemy.Construction_Yard, prio);
                                case this.Prio.Command_Center:
                                    return this._selectType(stats.Enemy.Command_Center, prio);
                                case this.Prio.Barracks:
                                    return this._selectType(stats.Enemy.Barracks, prio);
                                case this.Prio.Factory:
                                    return this._selectType(stats.Enemy.Factory, prio);
                                case this.Prio.Airport:
                                    return this._selectType(stats.Enemy.Airport, prio);
                                case this.Prio.Defense_Facility:
                                    return this._selectType(stats.Enemy.Defense_Facility, prio);
                                case this.Prio.Defense_HQ:
                                    return this._selectType(stats.Enemy.Defense_HQ, prio);
                                case this.Prio.Support:
                                    return this._selectType(stats.Enemy.Support, prio);
                                case this.Prio.Defense:
                                    return this._selectType(stats.Enemy.Defense, prio);
                                case this.Prio.DefenseArmored:
                                    return this._selectType(stats.Enemy.DefenseArmored, prio);
                                case this.Prio.DefenseNonArmored:
                                    return this._selectType(stats.Enemy.DefenseNonArmored, prio);
                                case this.Prio.Offense:
                                    return this._selectType(stats.Offense.Overall, prio);
                                case this.Prio.Infantry:
                                    return this._selectType(stats.Offense.Infantry, prio);
                                case this.Prio.Vehicle:
                                    return this._selectType(stats.Offense.Vehicle, prio);
                                case this.Prio.Aircraft:
                                    return this._selectType(stats.Offense.Aircraft, prio);
                                case this.Prio.BattleDuration:
                                    return this._calcBattleDuration(stats.BattleDuration, prio);
                                case this.Prio.AutoRepair:
                                    return this._selectType(stats.Enemy.DefenseArmored, prio);
                                default:
                                    return Number.MAX_VALUE;
                            }
                        },
                        _selectType: function (entity, prio) {
                            switch (prio[1]) {
                                case this.Type.HealthPointPercent:
                                    return this._calcHealthPoints(entity.HealthPoints, prio);
                                case this.Type.RepairChargeBase:
                                    return entity.Resource[ClientLib.Base.EResourceType.RepairChargeBase] * (prio[2] ? -1 : 1); // Negate
                                case this.Type.RepairChargeOffense:
                                    return Math.max(
                                        entity.Resource[ClientLib.Base.EResourceType.RepairChargeAir], entity.Resource[ClientLib.Base.EResourceType.RepairChargeInf], entity.Resource[ClientLib.Base.EResourceType.RepairChargeVeh]) * (prio[2] ? -1 : 1); // Negate
                                case this.Type.RepairCosts:
                                case this.Type.Loot:
                                    return this._calcCosts(entity.Resource, prio);
                                case this.Type.HealthPointAutoRepairPercent:
                                    return this._calcHealthPointsAutoRepair(entity.HealthPoints, prio);
                                default:
                                    return Number.MAX_VALUE;
                            }
                        },
                        _calcCosts: function (Resource /*{ ClientLib.Base.EResourceType.Tiberium: 0, ClientLib.Base.EResourceType.Crystal: 0, ClientLib.Base.EResourceType.Credits: 0, ClientLib.Base.EResourceType.ResearchPoints: 0 }*/ , prio) {
                            var costs = Resource[ClientLib.Base.EResourceType.Tiberium] + Resource[ClientLib.Base.EResourceType.Crystal] + Resource[ClientLib.Base.EResourceType.Credits] + Resource[ClientLib.Base.EResourceType.ResearchPoints];
                            return costs * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcHealthPoints: function (HealthPoints /*{ max: 0, end: 0 }*/ , prio) { //Todo: better front value selection
                            var result = HealthPoints.end + HealthPoints.endFront;
                            if (HealthPoints.end < (prio[3] * HealthPoints.max)) // Limit
                                result = (prio[3] * (HealthPoints.max + HealthPoints.maxFront));
                            if (prio[4] === true && !HealthPoints.end) // NoKill
                                result = HealthPoints.max + HealthPoints.maxFront;
                            if (result > (HealthPoints.max + HealthPoints.maxFront)) // max 1
                                result = (HealthPoints.max + HealthPoints.maxFront);
                            if (result < 0) // min 0
                                result = 0;
                            switch (prio[0]) { // Negate Offense
                                case this.Prio.Offense:
                                case this.Prio.Infantry:
                                case this.Prio.Vehicle:
                                case this.Prio.Aircraft:
                                    result = -1 * result;
                                    break;
                            }
                            return result * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcHealthPointsAutoRepair: function (HealthPoints /*{ max: 0, end: 0 }*/ , prio) { //Todo: better front value selection
                            var result = HealthPoints.end + HealthPoints.rep + HealthPoints.endFront;
                            if ((HealthPoints.end + HealthPoints.rep) < (prio[3] * HealthPoints.max)) // Limit
                                result = (prio[3] * (HealthPoints.max + HealthPoints.maxFront));
                            if (prio[4] === true && (HealthPoints.end + HealthPoints.rep) !== 0) // NoKill
                                result = HealthPoints.max + HealthPoints.maxFront;
                            if (result > (HealthPoints.max + HealthPoints.maxFront)) // max 1
                                result = (HealthPoints.max + HealthPoints.maxFront);
                            if (result < 0) // min 0
                                result = 0;
                            switch (prio[0]) { // Negate Offense
                                case this.Prio.Offense:
                                case this.Prio.Infantry:
                                case this.Prio.Vehicle:
                                case this.Prio.Aircraft:
                                    result = -1 * result;
                                    break;
                            }
                            return result * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcBattleDuration: function (BattleDuration /*int*/ , prio) {
                            var result = BattleDuration,
                                max = 120000;
                            if (result < (prio[3] * max)) // Limit
                                result = (prio[3] * max);
                            if (result > max) // max 1
                                result = max;
                            if (result < 0) // min 0
                                result = 0;
                            return result * (prio[2] ? -1 : 1); // Negate
                        }
                    },
                    properties: {
                        BattleDuration: {
                            check: "Number",
                            init: 0,
                            event: "changeBattleDuration"
                        }
                    },
                    members: {
                        Enemy: null,
                        Offense: null,
                        setAny: function (data) {
                            if (data.BattleDuration !== undefined && data.BattleDuration !== this.getBattleDuration()) this.setBattleDuration(data.BattleDuration);
                            //Entity.HealthPoints
                            if (data.Enemy.Overall.HealthPoints !== undefined) this.Enemy.Overall.HealthPoints.setAny(data.Enemy.Overall.HealthPoints);
                            if (data.Enemy.Structure.HealthPoints !== undefined) this.Enemy.Structure.HealthPoints.setAny(data.Enemy.Structure.HealthPoints);
                            if (data.Enemy.Construction_Yard.HealthPoints !== undefined) this.Enemy.Construction_Yard.HealthPoints.setAny(data.Enemy.Construction_Yard.HealthPoints);
                            if (data.Enemy.Command_Center.HealthPoints !== undefined) this.Enemy.Command_Center.HealthPoints.setAny(data.Enemy.Command_Center.HealthPoints);
                            if (data.Enemy.Barracks.HealthPoints !== undefined) this.Enemy.Barracks.HealthPoints.setAny(data.Enemy.Barracks.HealthPoints);
                            if (data.Enemy.Factory.HealthPoints !== undefined) this.Enemy.Factory.HealthPoints.setAny(data.Enemy.Factory.HealthPoints);
                            if (data.Enemy.Airport.HealthPoints !== undefined) this.Enemy.Airport.HealthPoints.setAny(data.Enemy.Airport.HealthPoints);
                            if (data.Enemy.Defense_Facility.HealthPoints !== undefined) this.Enemy.Defense_Facility.HealthPoints.setAny(data.Enemy.Defense_Facility.HealthPoints);
                            if (data.Enemy.Defense_HQ.HealthPoints !== undefined) this.Enemy.Defense_HQ.HealthPoints.setAny(data.Enemy.Defense_HQ.HealthPoints);
                            if (data.Enemy.Support.HealthPoints !== undefined) this.Enemy.Support.HealthPoints.setAny(data.Enemy.Support.HealthPoints);
                            if (data.Enemy.Defense.HealthPoints !== undefined) this.Enemy.Defense.HealthPoints.setAny(data.Enemy.Defense.HealthPoints);
                            if (data.Enemy.DefenseArmored.HealthPoints !== undefined) this.Enemy.DefenseArmored.HealthPoints.setAny(data.Enemy.DefenseArmored.HealthPoints);
                            if (data.Enemy.DefenseNonArmored.HealthPoints !== undefined) this.Enemy.DefenseNonArmored.HealthPoints.setAny(data.Enemy.DefenseNonArmored.HealthPoints);
                            if (data.Offense.Overall.HealthPoints !== undefined) this.Offense.Overall.HealthPoints.setAny(data.Offense.Overall.HealthPoints);
                            if (data.Offense.Infantry.HealthPoints !== undefined) this.Offense.Infantry.HealthPoints.setAny(data.Offense.Infantry.HealthPoints);
                            if (data.Offense.Vehicle.HealthPoints !== undefined) this.Offense.Vehicle.HealthPoints.setAny(data.Offense.Vehicle.HealthPoints);
                            if (data.Offense.Aircraft.HealthPoints !== undefined) this.Offense.Aircraft.HealthPoints.setAny(data.Offense.Aircraft.HealthPoints);
                            if (data.Offense.Crystal.HealthPoints !== undefined) this.Offense.Crystal.HealthPoints.setAny(data.Offense.Overall.HealthPoints);
                            //Entity.Resource
                            if (data.Enemy.Overall.Resource !== undefined) this.Enemy.Overall.Resource.setAny(data.Enemy.Overall.Resource);
                            if (data.Enemy.Structure.Resource !== undefined) this.Enemy.Structure.Resource.setAny(data.Enemy.Structure.Resource);
                            if (data.Enemy.Construction_Yard.Resource !== undefined) this.Enemy.Construction_Yard.Resource.setAny(data.Enemy.Construction_Yard.Resource);
                            if (data.Enemy.Command_Center.Resource !== undefined) this.Enemy.Command_Center.Resource.setAny(data.Enemy.Command_Center.Resource);
                            if (data.Enemy.Barracks.Resource !== undefined) this.Enemy.Barracks.Resource.setAny(data.Enemy.Barracks.Resource);
                            if (data.Enemy.Factory.Resource !== undefined) this.Enemy.Factory.Resource.setAny(data.Enemy.Factory.Resource);
                            if (data.Enemy.Airport.Resource !== undefined) this.Enemy.Airport.Resource.setAny(data.Enemy.Airport.Resource);
                            if (data.Enemy.Defense_Facility.Resource !== undefined) this.Enemy.Defense_Facility.Resource.setAny(data.Enemy.Defense_Facility.Resource);
                            if (data.Enemy.Defense_HQ.Resource !== undefined) this.Enemy.Defense_HQ.Resource.setAny(data.Enemy.Defense_HQ.Resource);
                            if (data.Enemy.Support.Resource !== undefined) this.Enemy.Support.Resource.setAny(data.Enemy.Support.Resource);
                            if (data.Enemy.Defense.Resource !== undefined) this.Enemy.Defense.Resource.setAny(data.Enemy.Defense.Resource);
                            if (data.Enemy.DefenseArmored.Resource !== undefined) this.Enemy.DefenseArmored.Resource.setAny(data.Enemy.DefenseArmored.Resource);
                            if (data.Enemy.DefenseNonArmored.Resource !== undefined) this.Enemy.DefenseNonArmored.Resource.setAny(data.Enemy.DefenseNonArmored.Resource);
                            if (data.Offense.Overall.Resource !== undefined) this.Offense.Overall.Resource.setAny(data.Offense.Overall.Resource);
                            if (data.Offense.Infantry.Resource !== undefined) this.Offense.Infantry.Resource.setAny(data.Offense.Infantry.Resource);
                            if (data.Offense.Vehicle.Resource !== undefined) this.Offense.Vehicle.Resource.setAny(data.Offense.Vehicle.Resource);
                            if (data.Offense.Aircraft.Resource !== undefined) this.Offense.Aircraft.Resource.setAny(data.Offense.Aircraft.Resource);
                            if (data.Offense.Crystal.Resource !== undefined) this.Offense.Crystal.Resource.setAny(data.Offense.Overall.Resource);
                        },
                        getAny: function () {
                            return {
                                BattleDuration: this.getBattleDuration(),
                                Enemy: {
                                    Overall: {
                                        HealthPoints: this.Enemy.Overall.HealthPoints.getAny(),
                                        Resource: this.Enemy.Overall.Resource.getAny()
                                    },
                                    Structure: {
                                        HealthPoints: this.Enemy.Structure.HealthPoints.getAny(),
                                        Resource: this.Enemy.Structure.Resource.getAny()
                                    },
                                    Construction_Yard: {
                                        HealthPoints: this.Enemy.Construction_Yard.HealthPoints.getAny(),
                                        Resource: this.Enemy.Construction_Yard.Resource.getAny()
                                    },
                                    Command_Center: {
                                        HealthPoints: this.Enemy.Command_Center.HealthPoints.getAny(),
                                        Resource: this.Enemy.Command_Center.Resource.getAny()
                                    },
                                    Barracks: {
                                        HealthPoints: this.Enemy.Barracks.HealthPoints.getAny(),
                                        Resource: this.Enemy.Barracks.Resource.getAny()
                                    },
                                    Factory: {
                                        HealthPoints: this.Enemy.Factory.HealthPoints.getAny(),
                                        Resource: this.Enemy.Factory.Resource.getAny()
                                    },
                                    Airport: {
                                        HealthPoints: this.Enemy.Airport.HealthPoints.getAny(),
                                        Resource: this.Enemy.Airport.Resource.getAny()
                                    },
                                    Defense_Facility: {
                                        HealthPoints: this.Enemy.Defense_Facility.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense_Facility.Resource.getAny()
                                    },
                                    Defense_HQ: {
                                        HealthPoints: this.Enemy.Defense_HQ.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense_HQ.Resource.getAny()
                                    },
                                    Support: {
                                        HealthPoints: this.Enemy.Support.HealthPoints.getAny(),
                                        Resource: this.Enemy.Support.Resource.getAny()
                                    },
                                    Defense: {
                                        HealthPoints: this.Enemy.Defense.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense.Resource.getAny()
                                    },
                                    DefenseArmored: {
                                        HealthPoints: this.Enemy.DefenseArmored.HealthPoints.getAny(),
                                        Resource: this.Enemy.DefenseArmored.Resource.getAny()
                                    },
                                    DefenseNonArmored: {
                                        HealthPoints: this.Enemy.DefenseNonArmored.HealthPoints.getAny(),
                                        Resource: this.Enemy.DefenseNonArmored.Resource.getAny()
                                    }
                                },
                                Offense: {
                                    Overall: {
                                        HealthPoints: this.Offense.Overall.HealthPoints.getAny(),
                                        Resource: this.Offense.Overall.Resource.getAny()
                                    },
                                    Infantry: {
                                        HealthPoints: this.Offense.Infantry.HealthPoints.getAny(),
                                        Resource: this.Offense.Infantry.Resource.getAny()
                                    },
                                    Vehicle: {
                                        HealthPoints: this.Offense.Vehicle.HealthPoints.getAny(),
                                        Resource: this.Offense.Vehicle.Resource.getAny()
                                    },
                                    Aircraft: {
                                        HealthPoints: this.Offense.Aircraft.HealthPoints.getAny(),
                                        Resource: this.Offense.Aircraft.Resource.getAny()
                                    },
                                    Crystal: {
                                        HealthPoints: this.Offense.Overall.HealthPoints.getAny(),
                                        Resource: this.Offense.Overall.Resource.getAny()
                                    }
                                }
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            this.Enemy = {
                                Overall: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Structure: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Construction_Yard: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Command_Center: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Barracks: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Factory: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Airport: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense_Facility: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense_HQ: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Support: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                DefenseArmored: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                DefenseNonArmored: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                }
                            };
                            this.Offense = {
                                Overall: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Infantry: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Vehicle: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Aircraft: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Crystal: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                            };
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeBattleDuration": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.STATS.Entity.HealthPoints", { //				Entity HealthPoints Objekt
                    extend: qx.core.Object,
                    properties: {
                        max: {
                            check: "Number",
                            init: 0,
                            event: "changeMax"
                        },
                        start: {
                            check: "Number",
                            init: 0,
                            event: "changeStart"
                        },
                        end: {
                            check: "Number",
                            init: 0,
                            event: "changeEnd"
                        },
                        rep: {
                            check: "Number",
                            init: 0,
                            event: "changeRep"
                        },
                        maxFront: {
                            check: "Number",
                            init: 0,
                            event: "changeMaxFront"
                        },
                        startFront: {
                            check: "Number",
                            init: 0,
                            event: "changeStartFront"
                        },
                        endFront: {
                            check: "Number",
                            init: 0,
                            event: "changeEndFront"
                        }
                    },
                    members: {
                        setAny: function (data) {
                            if (data.max !== undefined && data.max !== this.getMax()) this.setMax(data.max);
                            if (data.start !== undefined && data.start !== this.getStart()) this.setStart(data.start);
                            if (data.end !== undefined && data.end !== this.getEnd()) this.setEnd(data.end);
                            if (data.rep !== undefined && data.rep !== this.getRep()) this.setRep(data.rep);
                            if (data.maxFront !== undefined && data.maxFront !== this.getMaxFront()) this.setMaxFront(data.maxFront);
                            if (data.startFront !== undefined && data.startFront !== this.getStartFront()) this.setStartFront(data.startFront);
                            if (data.endFront !== undefined && data.endFront !== this.getEndFront()) this.setEndFront(data.endFront);
                        },
                        getAny: function () {
                            return {
                                max: this.getMax(),
                                start: this.getStart(),
                                end: this.getEnd(),
                                rep: this.getRep(),
                                maxFront: this.getMaxFront(),
                                startFront: this.getStartFront(),
                                endFront: this.getEndFront()
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS.Entity.HealthPoints constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeMax": "qx.event.type.Data",
                        "changeStart": "qx.event.type.Data",
                        "changeEnd": "qx.event.type.Data",
                        "changeMaxFront": "qx.event.type.Data",
                        "changeStartFront": "qx.event.type.Data",
                        "changeEndFront": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.STATS.Entity.Resource", { //				Entity Ressouce Object
                    extend: qx.core.Object,
                    properties: { //ClientLib.Base.EResourceType
                        Tiberium: {
                            check: "Number",
                            init: 0,
                            event: "changeTiberium"
                        },
                        Crystal: {
                            check: "Number",
                            init: 0,
                            event: "changeCrystal"
                        },
                        Credits: {
                            check: "Number",
                            init: 0,
                            event: "changeCredits"
                        },
                        ResearchPoints: {
                            check: "Number",
                            init: 0,
                            event: "changeResearchPoints"
                        },
                        RepairChargeBase: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeBase"
                        },
                        RepairChargeAir: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeAir"
                        },
                        RepairChargeInf: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeInf"
                        },
                        RepairChargeVeh: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeVeh"
                        }
                    },
                    members: {
                        setAny: function (data) {
                            if (data[1] !== undefined && data[1] !== this.getTiberium()) this.setTiberium(data[1]);
                            if (data[2] !== undefined && data[2] !== this.getCrystal()) this.setCrystal(data[2]);
                            if (data[3] !== undefined && data[3] !== this.getCredits()) this.setCredits(data[3]);
                            if (data[6] !== undefined && data[6] !== this.getResearchPoints()) this.setResearchPoints(data[6]);
                            if (data[7] !== undefined && data[7] !== this.getRepairChargeBase()) this.setRepairChargeBase(data[7]);
                            if (data[8] !== undefined && data[8] !== this.getRepairChargeAir()) this.setRepairChargeAir(data[8]);
                            if (data[9] !== undefined && data[9] !== this.getRepairChargeInf()) this.setRepairChargeInf(data[9]);
                            if (data[10] !== undefined && data[10] !== this.getRepairChargeVeh()) this.setRepairChargeVeh(data[10]);
                        },
                        getAny: function () {
                            return {
                                1: this.getTiberium(),
                                2: this.getCrystal(),
                                3: this.getCredits(),
                                6: this.getResearchPoints(),
                                7: this.getRepairChargeBase(),
                                8: this.getRepairChargeAir(),
                                9: this.getRepairChargeInf(),
                                10: this.getRepairChargeVeh()
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS.Entity.Resource constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeTiberium": "qx.event.type.Data",
                        "changeCrystal": "qx.event.type.Data",
                        "changeCredits": "qx.event.type.Data",
                        "changeResearchPoints": "qx.event.type.Data",
                        "changeRepairCrystal": "qx.event.type.Data",
                        "changeRepairChargeBase": "qx.event.type.Data",
                        "changeRepairChargeAir": "qx.event.type.Data",
                        "changeRepairChargeInf": "qx.event.type.Data",
                        "changeRepairChargeVeh": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.CACHE", { // [singleton]	Cache for simulations
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.cities = {};
                            this.__Table = new Uint32Array(256);
                            var tmp;
                            for (var i = 256; i--;) {
                                tmp = i;
                                for (var k = 8; k--;) {
                                    tmp = tmp & 1 ? 0xEDB88320 ^ (tmp >>> 1) : tmp >>> 1;
                                }
                                this.__Table[i] = tmp;
                            }
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up CACHE constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        __Table: null,
                        cities: null,
                        lastcity: null,
                        sortByPosition: function (a, b) {
                            return a.x - b.x || a.y - b.y || a.i - b.i; // using id as third because of garrison (both units at same position)
                        },
                        _Crc32: function (data) { // data = array of bytes 0-255
                            var crc = 0xFFFFFFFF;
                            for (var i = 0, l = data.length; i < l; i++) {
                                crc = (crc >>> 8) ^ this.__Table[(crc ^ data[i]) & 0xFF];
                            }
                            return crc ^ -1;
                        },
                        calcUnitsHash: function (units, ownid) { // units = TABS.UTIL.Formation.Get()
                            if (units !== null) {
                                units.sort(this.sortByPosition);
                                var OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                    i, data = [];
                                for (i = 0; i < units.length; i++)
                                    if (units[i].enabled && units[i].h > 0) data.push(units[i].x, units[i].y, units[i].i, units[i].l);
                                return OwnCityId.toString() + this._Crc32(data);
                            }
                            return null;
                        },
                        check: function (units, cityid, ownid) { // returns { key : "", result : { ownid : 0, cityid: 0, stats : {}, formation : [], combat : {}, valid: true } }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                Hash = this.calcUnitsHash(units, OwnCityId);
                            if (CityId !== null && OwnCityId !== null && Hash !== null) {
                                this.__validate(CityId, OwnCityId, Hash);
                                return {
                                    key: Hash,
                                    result: this.get(Hash, CityId)
                                };
                            }
                            return {
                                key: null,
                                result: null
                            };
                        },
                        getAll: function (cityid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId());
                            if (typeof this.cities[CityId] === "undefined") this.cities[CityId] = {
                                data: {},
                                caches: {}
                            };
                            return this.cities[CityId];
                        },
                        get: function (key, cityid) { // returns { ownid : 0, cityid: 0, stats : {}, formation : [], combat : {}, valid: true }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                caches = this.getAll(CityId).caches;
                            if (typeof caches[key] !== "undefined" && caches[key].valid) return caches[key];
                            return null;
                        },
                        getPrio: function (prios, cityid, ownid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                caches = this.getAll(CityId).caches,
                                results = [];
                            for (var key in caches) {
                                if (ownid === null || ownid === undefined || (ownid !== null && ownid !== undefined && caches[key].ownid == ownid)) results.push({
                                    "key": key,
                                    result: caches[key]
                                });
                            }
                            results.sort(function (a, b) {
                                var result = 0;
                                for (var i = 0; i < prios.length; i++) {
                                    a.diff = result;
                                    b.diff = result;
                                    if (result) return result;
                                    else result = TABS.STATS.selectPrio(a.result.stats, prios[i]) - TABS.STATS.selectPrio(b.result.stats, prios[i]);
                                }
                                return result;
                            });
                            return results;
                        },
                        getPrio1: function (prios, cityid, ownid) {
                            var result = this.getPrio(prios, cityid, ownid);
                            if (result.length === 0) result = {
                                key: null,
                                result: null
                            };
                            else {
                                for (i = 0; i < result.length; i++) {
                                    if (result[i].result.valid === true) {
                                        result = result[i];
                                        break;
                                    }
                                }
                                if (Object.prototype.toString.call(result) === "[object Array]") result = result[0];
                            }
                            return result;
                        },
                        add: function (data, cityid, ownid) { // { key : "", result : { stats : {}, formation : [], combat : {} } }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                OwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(OwnCityId),
                                caches = this.getAll(CityId).caches;
                            caches[data.key] = data.result;
                            caches[data.key].cityid = CityId;
                            this.lastcity = CityId;
                            caches[data.key].ownid = OwnCityId;
                            if (OwnCity !== null) caches[data.key].recovery = OwnCity.get_hasRecovery();
                            caches[data.key].valid = true;
                            this.onAdd();
                        },
                        clearAll: function () {
                            this.cities = {};
                        },
                        clear: function (cityid) {
                            if (typeof this.cities[cityid] !== "undefined") return delete this.cities[cityid];
                            return false;
                        },
                        merge: function (cityid, ownid, data, caches) {
                            try {
                                var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                    OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                    key, sim = {
                                        data: data,
                                        caches: caches
                                    };
                                for (key in sim.caches) {
                                    sim.caches[key].cityid = CityId;
                                    sim.caches[key].ownid = OwnCityId;
                                    sim.caches[key].recovery = sim.data.recovery;
                                    sim.caches[key].valid = true;
                                }
                                this.__validate(CityId, OwnCityId, sim);
                                qx.lang.Object.mergeWith(this.getAll(CityId).caches, sim.caches); // overwrite = false?
                                this.onAdd();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in TABS.CACHE.merge", e);
                                console.groupEnd();
                            }
                        },
                        getCitySimAmount: function (cityid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId());
                            if (typeof this.cities[CityId] !== "undefined" && typeof this.cities[CityId]["caches"] !== "undefined") return Object.keys(this.cities[CityId].caches).length;
                            return 0;
                        },
                        __validate: function (cityid, ownid, hash) {
                            var targetCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityid),
                                ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ownid),
                                city = (typeof hash != "object" ? this.getAll(cityid) : hash),
                                key;
                            if (targetCity !== null && targetCity.get_Version() !== -1) {
                                var version = targetCity.get_Version();
                                if (city.data.version != version) {
                                    city.data.version = version;
                                    //invalidate
                                    for (key in city.caches)
                                        city.caches[key].valid = false;
                                }
                            }
                            if (ownCity !== null && ownCity.get_Version() !== -1) {
                                var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance(),
                                    recovery = ownCity.get_hasRecovery();
                                if (typeof hash != "object" && typeof city.caches[hash] !== "undefined" && city.caches[hash].recovery != recovery) city.caches[hash].valid = false;
                                if (typeof hash == "object" && city.data.recovery != recovery)
                                    for (key in city.caches)
                                        city.caches[key].valid = false;
                                if (alliance !== null) {
                                    if ((city.data.air != alliance.get_POIAirBonus() || city.data.inf != alliance.get_POIInfantryBonus() || city.data.veh != alliance.get_POIVehicleBonus()) && recovery === false) {
                                        city.data.air = alliance.get_POIAirBonus();
                                        city.data.inf = alliance.get_POIInfantryBonus();
                                        city.data.veh = alliance.get_POIVehicleBonus();
                                        if (targetCity !== null) city.data.version = targetCity.get_Version();
                                        //invalidate
                                        for (key in city.caches)
                                            city.caches[key].valid = false;
                                    }
                                }
                            }
                        },
                        onAdd: function () {
                            webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onUiTick, this);
                            webfrontend.phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onUiTick, this);
                        },
                        onUiTick: function () {
                            webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onUiTick, this);
                            this.fireEvent("addSimulation");
                        }
                    },
                    events: {
                        "addSimulation": "qx.event.type.Event"
                    }
                });
                qx.Class.define("TABS.APISimulation", { // [singleton]	API Simulation
                    type: "singleton",
                    extend: qx.core.Object,
                    properties: {
                        data: {
                            check: "Array",
                            init: [],
                            event: "OnData"
                        },
                        formation: {
                            check: "Array",
                            init: []
                        },
                        formationHash: {
                            check: "Array",
                            init: []
                        },
                        lock: {
                            check: "Boolean",
                            init: false,
                            event: "OnLock"
                        },
                        request: {
                            check: "Boolean",
                            init: false
                        },
                        time: {
                            check: "Number",
                            init: 0,
                            event: "OnTime"
                        }
                    },
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.addListener("OnSimulateBattleFinished", this._OnSimulateBattleFinished, this);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up APISimulation constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        __Timeout: null,
                        __TimerStart: null,
                        SimulateBattle: function () {
                            if (!this.getLock()) {
                                var CurrentOwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity(),
                                    CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                                if (CurrentOwnCity !== null && CurrentCity !== null && CurrentCity.CheckInvokeBattle(CurrentOwnCity, true) == ClientLib.Data.EAttackBaseResult.OK) {
                                    clearTimeout(this.__Timeout);
                                    if (PerforceChangelist >= 448942) { // patch 16.2
                                        this.__Timeout = setTimeout(this._reset.bind(this), 3000);
                                    } else {
                                        this.__Timeout = setTimeout(this._reset.bind(this), 10000);
                                    }
                                    this.resetData();
                                    this.setLock(true);
                                    var formation = TABS.UTIL.Formation.Get(),
                                        armyUnits = [];
                                    for (var i in formation)
                                        if (formation[i].enabled && formation[i].h > 0) armyUnits.push({
                                            i: formation[i].id,
                                            x: formation[i].x,
                                            y: formation[i].y
                                        });
                                    this.setFormation(formation);
                                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("SimulateBattle", {
                                        battleSetup: {
                                            d: CurrentCity.get_Id(),
                                            a: CurrentOwnCity.get_Id(),
                                            u: armyUnits,
                                            s: 0
                                        }
                                    }, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, function (a, b) {
                                        this.__TimerStart = Date.now();
                                        this._updateTime();
                                        this.fireDataEvent("OnSimulateBattleFinished", b);
                                    }), null);
                                }
                            } else this.setRequest(true);
                        },
                        _OnSimulateBattleFinished: function (e) {
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() === null) return;
                            var data = e.getData();
                            if (data === null) return;
                            var mergedformation = TABS.UTIL.Formation.Merge(this.getFormation(), data.d.a),
                                cache = TABS.CACHE.getInstance().check(mergedformation, data.d.di, data.d.ai);
                            this.setData(data.e);
                            cache.result = {
                                stats: TABS.UTIL.Stats.get_Stats(data).getAny(),
                                formation: mergedformation,
                                combat: data.d
                            };
                            TABS.CACHE.getInstance().add(cache, data.d.di, data.d.ai);
                        },
                        _updateTime: function () {
                            clearTimeout(this.__Timeout);
                            var time = 0;
                            if (PerforceChangelist >= 448942) { // patch 16.2
                                time = this.__TimerStart + 3000 - Date.now();
                            } else {
                                time = this.__TimerStart + 10000 - Date.now();
                            }
                            if (time > 0) {
                                if (time > 100) this.__Timeout = setTimeout(this._updateTime.bind(this), 100);
                                else this.__Timeout = setTimeout(this._updateTime.bind(this), time);
                            } else this.__TimerStart = time = 0;
                            this.setTime(time);
                            if (this.getTime() === 0) this._reset();
                        },
                        _reset: function () {
                            this.resetLock();
                            this.resetData();
                            this.resetTime();
                            if (this.getRequest()) {
                                this.resetRequest();
                                this.SimulateBattle();
                            }
                        }
                    },
                    events: {
                        "OnData": "qx.event.type.Data",
                        "OnLock": "qx.event.type.Data",
                        "OnSimulateBattleFinished": "qx.event.type.Data",
                        "OnTime": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.PreArmyUnits", { // [singleton]	Event: OnCityPreArmyUnitsChanged
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentOwnCityChange);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this.__ViewModeChange);
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity() !== null) this.__CurrentOwnCityChange(0, ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().get_Id());
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null) this.__CurrentCityChange(0, ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id());
                            this.patchSetEnabled();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up PreArmyUnits constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "OnCityPreArmyUnitsChanged": "qx.event.type.Event"
                    },
                    members: {
                        CurrentCity: null,
                        CurrentOwnCity: null,
                        CityPreArmyUnits: null,
                        __Timeout: null,
                        __CurrentOwnCityChange: function (oldId, newId) {
                            if (this.CurrentOwnCity !== null && this.CurrentCity !== null && this.CityPreArmyUnits !== null) webfrontend.phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                            var CurrentOwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId);
                            if (CurrentOwnCity !== null && CurrentOwnCity.IsOwnBase()) {
                                this.CurrentOwnCity = CurrentOwnCity;
                                if (this.CurrentCity !== null && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.CombatSetup) {
                                    this.CityPreArmyUnits = CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(this.CurrentCity.get_Id());
                                    webfrontend.phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                    this.__CityPreArmyUnitsChanged();
                                }
                            }
                        },
                        __CurrentCityChange: function (oldId, newId) {
                            if (this.CurrentOwnCity !== null && this.CurrentCity !== null && this.CityPreArmyUnits !== null) webfrontend.phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                            var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId);
                            if (CurrentCity !== null && !CurrentCity.IsOwnBase()) {
                                this.CurrentCity = CurrentCity;
                                if (this.CurrentOwnCity !== null && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.CombatSetup) {
                                    this.CityPreArmyUnits = this.CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(CurrentCity.get_Id());
                                    webfrontend.phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                    this.__CityPreArmyUnitsChanged();
                                }
                            }
                        },
                        __ViewModeChange: function (oldMode, newMode) {
                            if (newMode == ClientLib.Vis.Mode.CombatSetup && this.CurrentCity !== null && this.CurrentOwnCity !== null) {
                                this.CityPreArmyUnits = this.CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(this.CurrentCity.get_Id());
                                webfrontend.phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                this.__CityPreArmyUnitsChanged();
                            } else if (oldMode == ClientLib.Vis.Mode.CombatSetup && this.CityPreArmyUnits !== null) {
                                webfrontend.phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                this.CityPreArmyUnits = null;
                            }
                        },
                        __CityPreArmyUnitsChanged: function () {
                            clearTimeout(this.__Timeout);
                            if (this.CurrentCity.get_Version() >= 0 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete()) {
                                this.__Timeout = setTimeout(this._onCityPreArmyUnitsChanged.bind(this), 100);
                            } else if (this.CurrentCity.get_Version() == -1 || (this.CurrentCity.get_Version() >= 0 && !ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete())) {
                                this.__Timeout = setTimeout(this.__CityPreArmyUnitsChanged.bind(this), 100);
                            }
                        },
                        _onCityPreArmyUnitsChanged: function () {
                            this.fireEvent("OnCityPreArmyUnitsChanged");
                        },
                        patchSetEnabled: function () {
                            try {
                                /*  var set_Enabled = ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled.toString(),
                                     args = set_Enabled.substring(set_Enabled.indexOf("(") + 1, set_Enabled.indexOf(")")),
                                     body = set_Enabled.substring(set_Enabled.indexOf("{") + 1, set_Enabled.lastIndexOf("}"));
                                 body = body + "TABS.PreArmyUnits.getInstance().__CityPreArmyUnitsChanged();"; 
                                 ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled = Evil(args, body);  */
                                //MOD NO EVIL 2
                                ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled_Original = ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled;
                                ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled = function (a) {
                                    this.set_Enabled_Original(a);
                                    TABS.PreArmyUnits.getInstance().__CityPreArmyUnitsChanged();
                                };
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error setting up ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled", e);
                                console.groupEnd();
                            }
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.PreArmyUnits");
                    }
                });
                qx.Class.define("TABS.PreArmyUnits.AutoSimulate", { // [singleton]	Auto simulate battle
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            if (this.getEnabled()) TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up PreArmyUnits.AutoSimulate constructor", e);
                            console.groupEnd();
                        }
                    },
                    properties: {
                        enabled: {
                            check: "Boolean",
                            init: TABS.SETTINGS.get("PreArmyUnits.AutoSimulate", true),
                            apply: "_applyEnabled",
                            event: "changeEnabled"
                        }
                    },
                    members: {
                        _applyEnabled: function (newValue) {
                            TABS.SETTINGS.set("PreArmyUnits.AutoSimulate", newValue);
                            if (newValue === true) TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                            else TABS.PreArmyUnits.getInstance().removeListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                        },
                        SimulateBattle: function () {
                            var formation = TABS.UTIL.Formation.Get();
                            if (formation !== null && formation.length > 0) {
                                var cache = TABS.CACHE.getInstance().check(formation);
                                if (cache.result === null) TABS.APISimulation.getInstance().SimulateBattle();
                            }
                        }
                    },
                    events: {
                        "changeEnabled": "qx.event.type.Data"
                    },
                    defer: function () {
                        TABS.addInit("TABS.PreArmyUnits.AutoSimulate");
                    }
                });
                qx.Class.define("TABS.GUI.ArmySetupAttackBar", { // [singleton]	Shift and Mirror Buttons
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this._Application = qx.core.Init.getApplication();
                            this.ArmySetupAttackBar = this._Application.getArmySetupAttackBar();
                            this._armyBar = this._Application.getUIItem(ClientLib.Data.Missions.PATH.BAR_ATTACKSETUP);
                            this._playArea = this._Application.getPlayArea();
                            // just some shortcuts by Netquik 
                            this.MainOverlay = this._Application.getMainOverlay();
                            this.ArmySetupAttackBarMainChildren = this._armyBar.getChildren();
                            this.ArmySetupAttackBarChildren = this.ArmySetupAttackBar.getChildren();
                            this._playAreaChildren = this._playArea.getChildren();


                            if (PerforceChangelist >= 443425) { // 16.1 patch
                                for (var i in this.ArmySetupAttackBar) {
                                    if (typeof this.ArmySetupAttackBar[i] == "object" && this.ArmySetupAttackBar[i] != null) {
                                        if (this.ArmySetupAttackBar[i].objid == "btn_disable") {
                                            //console.log(this.ArmySetupAttackBar[i].objid);
                                            var nativeSimBarDisableButton = this.ArmySetupAttackBar[i];
                                        }
                                        if (this.ArmySetupAttackBar[i].objid == "cnt_controls" || this.ArmySetupAttackBar[i].objid == "btn_toggle") {
                                            this.ArmySetupAttackBar[i].setVisibility("excluded");
                                        }
                                        //MOD enable native save formation function
                                        if (this.ArmySetupAttackBar[i].objid == "btn_saveload") {
                                            console.log("SAVELOAD BTN = "+i);
                                            //var regex = new RegExp( i + '\\.addListener\\(.,this\\.([A-Za-z_]+)');
                                            //this.SaveLoadF = webfrontend.gui.bars.ArmySetupAttackBar.$$original.toString().match(regex)[1];
                                            this.SaveLoad = this.ArmySetupAttackBar[i];
                                            this.SaveLoad.set({
                                                toolTipText: "Save/Load Formation [NUM ,]",
                                                width: 44,
                                                height: 44,
                                                allowGrowX: false,
                                                allowGrowY: false,
                                                padding: [0, -2],
                                                marginRight: 6
                                            });
                                        }
                                    }
                                }
                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "pane-armysetup-right") {
                                        console.log(this.ArmySetupAttackBarMainChildren[i].$$user_decorator)
                                        this.armySetupRight = this.ArmySetupAttackBarMainChildren[i];
                                        this.armySetupRight.removeAt(1);
                                        this.armySetupRight.addAt(nativeSimBarDisableButton, 1);
                                        break;
                                    }
                                }
                            }



                            this.ArmySetupAttackBarMainChildren[0].setMarginTop(40); // NOTE Resizing ArmySetup after topbuttons remove
                            this.ArmySetupAttackBarChildren[1].setOpacity(0.4); // NOTE  setting opacity to next setup
                            this.ArmySetupAttackBarChildren[1].setVisibility("hidden"); // NOTE  setting hidden to next setup 
                            var playerFaction = ClientLib.Data.MainData.GetInstance().get_Player().get_Faction(); // NOTE  new Left/Right Bars 
                            switch (playerFaction) {
                                case ClientLib.Base.EFactionType.GDIFaction:
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABklBMVEUAAAD///8bfqbc3Nyhop/T09PZ2dnY2Njx8fHy8vLz8/Oen5t2d3XW1tZyc3C5ubnJycnLy8ugoZ6hoZ7X19bX19eKioiXmJTa2tqXmJXg4ODh4eHi4uLr6+ucnZmcnZqdnpr09PTR0dHS0tLV1dV0dXPj4+Pq6uqen52LjIrK09eMjIvOzs3Q0NC3t7e4uLiRko9qa2iWl5NtbmsbfqZ0dHK9vr3b29t2dnTf39/IyMifoJygoZ3CwsLo6Ojp6enDw8Pu7u7w8PCGh4OIiYewsLC0tLR1dnRnoblsbWqpqairq6irrKmsrKutrq2ur6xub22zs7OHiISHiIW4uLZub26Jioi5uri6urq7vLtvb22Ki4dvb27FxcVra2nIz9KNjoqOjouQkY5zc3HOzs7O1djPz8+Sk4+TlJCVlpNpamd0dXJubmyYmJaZmpeam5ibm5l1dnNqpbxubm2enptub2x4eXd6enh8fXuCgoGEhYKEhYOioqHt7e2io6Hv7++jo6OkpaKlpaOlpqOmp6Wnp6Um7BAdAAAAA3RSTlMAAH5Ny5jlAAACu0lEQVR4Xu3b1Y/bQBDA4Wtm1+wgM8MhMzOUmZmZmfH/rtc5K6kq9SGbac/qjnSv38NPymmccbr2oM3vtKC7nPGMdXRaaM/THuAZSZLYX9kBmrRnqwekDkyZQpyacUmyaEe+5MjcNFj0xEdGN2rcAO5p0ABxaz6/ZLQj80+DZjYcfsdoVoPJS+sDg+2Pz+cHp7VJ4X6O0awzkzf8k8npdieZTEERbDoepxRO6Ixu1Fg6EqiuaGq7o2kFJV0CgDLLYR7wzlr0jrwRSH9SeEbVlORNRgPI3a+Ozln0mP1JWfdXmcxlFzIli6YgR18cexRiNLAZmFxReEfLSIw2T05dHso36cGkxk/XGA2bUwkSDJEmPa1y0+qiTY8HCQkRDJoO6yR2W/9LtMI/Ng0VwsY9NGKQ/6a1aC1ai9Z3rSC3cFpfzJPYUB4lSOQQWmuQfxAdJwhA//MYFk37TtVxgrBZw6O9WEEoJl1BC/JHWrQWrfv2YtH9b58gfdDlXiNRR6EjUSOB9P96+14Caw8ZDZJYzG3LAnh1QnS3LWZ0lLirNT8t9mvRWrQWrQ281uH9aK1B/obVmj3dfSFINIQn6nhL8Coe7XXlfl35N0FEa9E6fBCrtdz7eg0niBw9ey6LQoejxhWkPcQwEijLgnMDQ6HFHiJ2PtFatBatRettJBr/BkaIG29gx7O75QYm9mvxLCNau/EGdm3VdTewbvac5LYb2HB+F+0hYucTrUVrzHeC3UNjBnF/a4x33cfJr1/G+TpAqws2vWm5wVALnSpwF1lO2UHMfaGR1pf/Z0DROO0P6YhNg/x15GquSUOxqhQ0jt9wqMtpU4KdG9h3Mhts0lBKZTK1xXantpCKSODQcCY710LDdSrxjMxkOwgUKbzRbbqT4+zXz3IItA0Ezj/GomcePMQKcuH9HSx6fv70T0KzcLgY6GqkAAAAAElFTkSuQmCC";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABsFBMVEX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb3Nzb29va2trZ2dnY2NjY2dnY2NfX19fW1tbX19bV1dXU1dXT09PN1djS0tLJ09fR0dHJ0tfQ0NDPz8/Ozs7Pzs7Ozs3Hz9LMzMzLy8vJycnIyMjFxcXDw8PCwsK9vr27vLu6urq5uri5ubm4uLiQwNS3t7e4uLaPwNO0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmmp6Wnp6WlpqOlpaOkpaKkpKSio6Ghop+ioqGgoZ6goZ2hoZ6foJyen52en5udnpqenpucnZmcnZqam5ibm5mZmpdqpLyXmJWYmJaXmJSWl5OVlpNnoLmTlJCSk4+Rko+QkY6OjouNjoqMjYuNjYyLi4mKi4eKi4mIiYeHiISHiIWGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN2dnR1dnR0dXJ0dXN0dHJyc3Bzc3FvcG5ub25ub2xvb21vb25ubmxubm1tbmscf6ZsbWobfqZqa2hra2lpamf///8wScmyAAAAkHRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wADZeeHAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAt5JREFUaIHtm/1P00AYxytLEBnr2MFukzIrDN8ZAupAQXzF1zomnZviUnyZClMUXzOnMN8V8eVf9u7ajRoTf+D6lBy5b9Jk2ZJPms/68r08rfIbLIpE/4Ne9TIrY250h5Md8Xi8g2486bs56kJjjDU9GtV17EFQ7+3RNfTl4aimI+QNGqP9dTZBv7oUZUnYP3Fnp+OEoJ+9t79KeENusAm68AXpWt01SqXTIxyZGKRs5oSgzQ8Rvf43oiRSVbV93elMjVM2803QV2unNCaEbD2hgKIoTetPW//xQccJQU89fjmHbfTucIA3of5xmz1G0NnrTz6WMTn4yE63KAovuy01QR30rVB0rvSg+qiLonHLFu7dDnQeZcfJKkEbJMVqlQrB2zxAh0f+QhvGMkO3NvGj211o845lmD+YEIHQLEu2EH6yX2i3EHHQ0rV/aOnaP7Sgru8SIb9AhORKlpH7Ceb6RBeMENM4F0MwaOvaLoRAhEwf2acDoRfs7gohpAaJ1qGELEGipevN4DoChz67F+xEf/00CXV5KlbmMdBF1SxWyjGoHmK9/QZzA7MswwBCA5YF0zDMmmidT0zXsl8HpOuNQkvX/qGhXVfAXJ/uhnJ9PgbTQ4yLdG0HImR6uBuq8y3ClWDQ6g5WgkGXSdL1ZnAdgXN9EuxEX3gxj4HQ+YefnBkYwPX6fqW8HereWKzA3MDcMzCP0bKH+IeWrv1DS9f+oaVr/9DQrr+LNgMjEXAGlj8m4gxM0H4t1zLS9f/RQs7AFt+JOAOjq6Q54WZg9N6Ykz1Edr6NQEvX/qHFfyZYHLTArpfhnnV/w9BBD/Y6nG6gs7nSbPaMxoSozdxkRXWhC/dmLzgzMBzays1GAw10JpOZdGZgCGuhZo43ONhbHEnUQE/lD6E6muy3Ggy2ckTtQWto83mjBDM2V/Q9yIUufHWjPQtF3/h8gH1OeI+emRmAQt+6chBKyOGhIRD0H2r7n40x6THiAAAAAElFTkSuQmCC";
                                    break;
                                case ClientLib.Base.EFactionType.NODFaction:
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABj1BMVEX///+hop/p6el0dXOXmJSTlJBqa2jY2NihoZ6XmJV2d3XX19egoZ6dnprOzs3X19aIiYeKiojQ0NDr6+vq6uqen51sbWqnp6WRko+cnZl0dHKMjIuur6yLjIro6Oh2dnTIyMh1dnRtbmupqajCwsLu7u6enpuWl5OGh4OgoZ2EhYJ0dXKHiIWHiIR6eniSk49ub2yam5hpameJioiNjoqlpqOkpaK9vr25uritrq18fXtvb22Ki4d1dnOOjou4uLZzc3Fra2mrq6irrKnPz8/t7e2lpaOQkY6mp6W7vLvOzs6CgoFubm1vb26bm5mYmJaZmpfFxcWVlpO6urrc3NzZ2dnT09PV1dXa2trg4ODz8/PW1tbJycnLy8u0tLTi4uLSvbq5ubnDw8OwsLC3t7fb29vw8PDR0dHv7+/f39+uRDqvRTzj4+Px8fGcnZrh4eGsrKv09PSioqHTwL2mGxvW19by8vJyc3Czs7Ojo6KfoJxubmyEhYPOuri4uLjS0tK9vb2en5tub254eXdub21rpm98AAAAAXRSTlMAQObYZgAAAr9JREFUeF7s0MUOwzAURNF+5DxTEIrMzPDhjRtZztqx1E2vNNuzmNZv+rf2Wl0epWgSEelxA9TkYQryEGcQLBBENfkC8kSjpO9L+8YKjatoQJQdXj5loKK1jffZvKHlvGhf3cuyEObrgOE0NT9rOQ47cuCalDP08KWFYAzPh30j30fjrtq6ptRiktwAcH3HZr47WjmOkv6nffPsbRoKozBva+oRO6NJS5OSpIWWTubee+/xxqgOqCBGQaobpUKOxIdW/udwrUgOX/jA7UGxeM8PeBQ90rWOc65DnURBuHZHoZnN+rGjS+oMJifl49tNRdZid8u7v9A+m6UTqycthWaVT5+/hLoJyi2Fbp9unpnyUvTOWqCPrig0zzZtci1K0d8ibXQ0kqBrLpFFCLQ/FpOxP/5H6FA/CZpHSSU7aKCQ/8a1uBbX4vpUTMZxjOubHhlTHkRI7iDMNZsHKMYIYR4/YqDQfv7CBEaIShGH7qGE+Ej0KEzIH9HiWlznD6PQ48tXQQfdnHZszOMpV3Js0PN6csVG9ZBDLhlG1soC92KiGFbMYK4J63r40NKvxbW4FtcOznXhNsw1m2dRrtXb3TkCoblwfgJXghfh1R3fr/FovBBxLa4LF1GuzelLRYwQs3T5ShWCLpSca6Ae4jg2oCykGxgELT1EOp+4FtfiWlxPgtD4DYwoixvY9eqwbGDSr+VdRlxncQO7sZi5Dazu2ERZ28DGvCHqIdL5xLW4Rt4Jzg4aKST7rhF33Wv0+4X0D3uAjhoJetYicq0BdKerbWS+kwhp37IWBi//z3AYaLLvruf6G9i9hftbKZo3NsNuoPENRzS/3m5xfwN7QD/cFM27nXK5MvK3qTQ66jf30fywujSA5kd+SyemIidCeMPnx3GC3tP0+/WTLQCaVd49fYZCzzx/gRLycvsVCj039/onvUF9K+HA7eQAAAAASUVORK5CYII%3D";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABqlBMVEX////09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb29vc29va2trZ2dnZ2NjY2NjX19fY2NfW19bW1tbX19bV1dXV1NTT09PS0tLR0dHQ0NDPz8/Ozs7Pzs7Ozs3MzMzLy8vJycnIyMjFxcXDw8PTv7zCwsLSvLm9vr29vb3Oube7vLu6urq5ubm5uri4uLi4uLa3t7e0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmnp6Wmp6WlpqOkpaKlpaOkpKOhop+ioqGgoZ2hoZ6goZ6foJyen5uen52enpudnpqcnZmcnZqam5ibm5mZmpeXmJWXmJSYmJaWl5OVlpOTlJCSk4+Rko+QkY6NjoqOjouNjYyMjYuKi4mLi4mKi4eIiYeHiIWHiISGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN1dnR2dnR0dXN0dXJ0dHJyc3Bzc3FvcG5vb21vb25ub25ub2xtbmtubmxubm1sbWpra2lqa2hpamewRT2vRDumHBymGxsjsLVTAAAAjnRSTlMA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0TDHVgAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAALNSURBVGiB7ZvpU9NAGIeJdAaR0pQudFu01FBPiki9Kop4gddCazCt0gxqVbCieE61SL3vg//Z7KZpwxc/sHnDLLO/mcx02plnMk9z/HbepK1NxseseZm/69B9jeyOxWJ9dONJ5rcbjTFOaNGopmEPgjJ/XOjpo9GEhpA3aIyOudivrkVZkvZP3DnccvLsvf1V0huym138irSE4xqls9kxjkyMULbjRP8U0Zy/EaWQqqo9G05vepyyHd/X6+d3MSHWNhgKKIrSvvF0D50ZaTmZefJyEdvoveEAb0JD4y127ubjzxVsHXzWTncqCi+7Oz1BHWToeZkzyvdrD/spGndu497tQO9pdpysWWhipVSrUSF4hwfo8Ng6NCGrDN3Vzo/ucaH1OybRfzIhAqFZVmwh/GS/0G4h4qCla//Q0rV/aEFd37WE/AIRYpRNYvwAc322H0aITqbiCAZt3tiDEIiQ2ZMHNCD0kt1dIYTUIdEalJAVSLR0vRVcR+DQk/vBTvTXT1NQl6dSdQEDXVT1UrUSh+oh5tsvMDcw0yQECA1YFnRC9LponU9M17JfB6TrzUJL1/6hoV1XwVxfGIByfTkO00PIFbq2AxEye2QAqvMtw5Vg0OoOVoJBl0nS9VZwHYFzfQ7sRF96sYCB0IVHHxozMIDr9YNqZSfUvbFUhbmBuWdgHqNlD/EPLV37h5au/UNL1/6hoV1/F20GZkXAGVjhlIgzMEH7tVzLSNf/Rws5A1t+J+IMjK6SFoWbgdF7oyF7iOx8m4GWrv1Di/9MsDhogV2vwj3r/oahgx7sdTjbROeM8nzuYoIJUTu4yYrqQhfvzV9tzMBwaDs3Gw030fl8/lJjBoZwItTB8QYHe4sjhZromcJx5KCt/VaDwS6OqIOohdafN0swY3NF24dc6OI3N9qzUPStjwfZ56T36Lm5YSj07elDUEJOjI6CoP8Bxks+VXu6zlMAAAAASUVORK5CYII=";
                                    break;
                            }
                            // MOD NEW PATCH for moving Map (adjusted for 20.1 Patch)
                            var source = ClientLib.Vis.VisMain.GetInstance().get_CombatSetup().get_MinYPosition.toString();
                            // MOD Fix1 for 22.2 Patch
                            // MOD 22.3-3
                            var CombatMinY = source.match(/return {0,1}\(?\$I\.([A-Z]{6})\.([A-Z]{6})-/);
                            if (typeof $I[CombatMinY[1]] === "function") $I[CombatMinY[1]][CombatMinY[2]] = -178;


                            if (PerforceChangelist >= 472233) { // NOTE  20.1 patch
                                this.COMBATEXTENDEDSETUP = webfrontend.phe.cnc.Util.getConfigBoolean(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP);
                                if (this.COMBATEXTENDEDSETUP === false) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, true);
                                    this.ArmySetupAttackBar.showSetup(true);
                                }
                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "bg-armysetup-top") {
                                        console.log('armysetup-top detected! : at  ArmySetupAttackBarChildren' + i);
                                        this._armyBar.addAt(this.ArmySetupAttackBarMainChildren[i], 3);
                                        break;
                                    }
                                }

                            }

                            // NOTE Adjusting left/right Bars
                            this.armySetupRight.resetDecorator();
                            this.armySetupRight.set({
                                decorator: new qx.ui.decoration.Decorator().set({
                                    backgroundImage: rightBG,
                                    backgroundRepeat: 'no-repeat'
                                })
                            });
                            this.armySetupRight.set({
                                paddingTop: 8,
                                marginTop: 40,
                                paddingLeft: 20,
                                paddingRight: 20,
                            });
                            this.ArmySetupAttackBarMainChildren[2].setSource(leftBG);
                            this.ArmySetupAttackBarMainChildren[2].setLayoutProperties({
                                top: 40,
                                left: 0
                            });

                            // Mirror and Shift Buttons left Side (Rows/Wave)
                            // MOD cntWaves manage
                            /* var TRwave = qx.locale.Manager.tr("tnf:army wave 1");
                            TRwave = TRwave.substring(0, TRwave.indexOf(' ')); */
                            for (i = 0; i < this.ArmySetupAttackBarMainChildren.length - 1; i++) {
                                var wavechild = this.ArmySetupAttackBarMainChildren[i]
                                findwave = wavechild._hasChildren() && wavechild.basename === "Composite" ? wavechild.getChildren()[0].$$user_value : false;
                                this.cntWaveI = (typeof (findwave) === 'string' && findwave.match(/.+\s{1}1/)) ? true : false;
                                if (this.cntWaveI) {
                                    this.cntWaveI = i;
                                    break;
                                }

                            }
                            var i, cntWave;
                            for (i = 0; i < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); i++) {
                                cntWave = this.ArmySetupAttackBar.getMainContainer().getChildren()[i + this.cntWaveI];
                                cntWave._removeAll();
                                cntWave._setLayout(new qx.ui.layout.HBox());
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Flip.H, this.tr("Mirrors units horizontally."), this.onClick_btnMirror, "h", i));
                                cntWave._add(new qx.ui.core.Spacer(), {
                                    flex: 1
                                });
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Arrows.Left, this.tr("Shifts units one space left."), this.onClick_btnShift, "l", i));
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Arrows.Right, this.tr("Shifts units one space right."), this.onClick_btnShift, "r", i));
                            }

                            // Mirror and Shift Buttons top
                            // REVIEW NewTopButtons rewrite code 
                            this.newtopbuttons = this.ArmySetupAttackBarMainChildren[3];
                            this.newtopbuttons.resetDecorator();
                            this.newtopbuttons.setPaddingTop(10);

                            this.shiftbuttonopacity = function (e) {
                                if (e.getTarget() && (e.getTarget().basename === "SoundButton" || e.getTarget().basename === "ModelButton")) {
                                    shiftbutton = (e.getTarget().getLayoutParent().getLayoutParent().getLayoutParent()) ? (e.getTarget().getLayoutParent().getLayoutParent().getLayoutParent()) : null;
                                    if (shiftbutton.getOpacity() === 0.3 && e._type === "mouseover") {
                                        shiftbutton.setOpacity(1);

                                    } else if (e._type === "mouseout") {
                                        shiftbutton.setOpacity(0.3);
                                    }
                                }
                            }
                            for (let i = 0; i < this.newtopbuttons.getChildren().length; i++) {
                                shiftbox = this.newtopbuttons.getChildren()[i];
                                shiftbox.setOpacity(0.3);
                                shiftbox.addListener("mouseover", this.shiftbuttonopacity.bind((null, event)));
                                shiftbox.addListener("mouseout", this.shiftbuttonopacity.bind((null, event)));

                                shiftbox_inside = shiftbox.getChildren()[0].getChildren()[1];
                                shiftbox_inside._removeAll();
                                shiftbox_inside.add(new qx.ui.core.Spacer());
                                //3 buttons (1 long + 2 updown)
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Flip2.V, this.tr("Mirrors units vertically."), this.onClick_btnMirror, "v", i, 35, null));
                                shiftbox_inside.add(new qx.ui.core.Spacer());
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Arrows2.Up, this.tr("Shifts units one space up."), this.onClick_btnShift, "u", i, 20, 20));
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Arrows2.Down, this.tr("Shifts units one space down."), this.onClick_btnShift, "d", i, 20, 20));
                                shiftbox_inside.add(new qx.ui.core.Spacer());


                            }
                            if (PerforceChangelist >= 472233) { // MOD: 20.2 patch 2 RETRO
                                //var patch211body = patch211.substring(patch211.indexOf('{') + 1, patch211.lastIndexOf('}'));
                                var source = this.ArmySetupAttackBar.showSetup.toString();
                                //MOD 22.3-4
                                var extendsetupF = source.match(/[,;]this\.([A-Za-z_]+)\(\).this\.show/)[1];
                                // MOD NOEVIL 3 by NetquiK
                                this.ArmySetupAttackBar[extendsetupF] = function () {
                                    return;
                                }
                                ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, this.COMBATEXTENDEDSETUP);
                                this.ArmySetupAttackBar.showSetup(false);
                            }

                            this._armyBar.setMarginTop(this._armyBar.getMarginTop() + 20);
                            // 19.5 MOD VIEW by Netquik
                            if (PerforceChangelist >= 472117) { // 19.5 patch                  
                                this._armyBar.setMarginTop(this._armyBar.getMarginTop() - 40);
                            }

                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.ArmySetupAttackBar constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        ArmySetupAttackBar: null,
                        newSideButton: function (icon, text, onClick, pos, sel) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: 20,
                                maxHeight: 25,
                                alignY: "middle",
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints",
                                model: [pos, sel]
                            });
                            btn.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            btn.addListener("click", onClick, this);
                            return btn;
                        },

                        //NOTE NEWTOPBUTTON Function rewrite by Netquik for 19.5
                        newTopButton: function (icon, text, onClick, pos, sel, w, mw) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: w,
                                maxHeight: 20,
                                maxWidth: mw,
                                appearance: "button-friendlist-scroll",
                                padding: 0,
                                model: [pos, sel]
                            });

                            btn.addListener("click", onClick, this);

                            return btn;
                        },
                        onClick_btnMirror: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Mirror(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnShift: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Shift(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.ArmySetupAttackBar");
                    }
                });
                qx.Class.define("TABS.GUI.MovableBox", {
                    extend: qx.ui.container.Composite,
                    include: qx.ui.core.MMovable,
                    construct: function (layout) {
                        this.base(arguments);
                        try {
                            this.setLayout(layout);
                            this._activateMoveHandle(this);
                            //resizer.setLayout(new qx.ui.layout.HBox());
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.MovableBox constructor", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.GUI.PlayArea", { // [singleton]	View Simulation, Open Stats Window
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.PlayArea = qx.core.Init.getApplication().getPlayArea();
                            this._playAreaChildren = this.PlayArea.getChildren();
                            this.ArmySetupAttackBar = qx.core.Init.getApplication().getArmySetupAttackBar();
                            this.HUD = this.PlayArea.getHUD();
                            var WDG_COMBATSWAPVIEW = this.HUD.getUIItem(ClientLib.Data.Missions.PATH.WDG_COMBATSWAPVIEW);
                            //View Simulation
                            this.btnSimulation = new webfrontend.ui.SoundButton(null, TABS.RES.IMG.Simulate).set({
                                toolTipText: this.tr("View Simulation") + " [NUM 0]",
                                width: 44,
                                height: 44,
                                allowGrowX: false,
                                allowGrowY: false,
                                appearance: "button-baseviews",
                                marginRight: 6
                            });
                            this.btnSimulation.addListener("click", function () {
                                this.onClick_btnSimulation();
                            }, this);
                            TABS.APISimulation.getInstance().bind("time", this.btnSimulation, "label", {
                                converter: function (data) {
                                    return (data / 1000).toFixed(1);
                                }
                            });
                            TABS.APISimulation.getInstance().addListener("OnSimulateBattleFinished", function () {
                                this._updateBtnSimulation();
                            }, this);
                            TABS.APISimulation.getInstance().addListener("OnTimeChange", function () {
                                this._updateBtnSimulation();
                            }, this);
                            TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", function () {
                                this._updateBtnSimulation();
                            }, this);
                            WDG_COMBATSWAPVIEW.getLayoutParent().addAfter(this.btnSimulation, WDG_COMBATSWAPVIEW);
                            //MOD adding native formation saver button
                            WDG_COMBATSWAPVIEW.getLayoutParent().addAfter(TABS.GUI.ArmySetupAttackBar.getInstance().SaveLoad, this.btnSimulation);
                            //Move Box
                            this.boxMove = new TABS.GUI.MovableBox(new qx.ui.layout.Grid()).set({
                                decorator: "pane-light-plain",
                                opacity: 0.7,
                                paddingTop: 0,
                                paddingLeft: 2,
                                paddingRight: 1,
                                paddingBottom: 3,
                                allowGrowX: false,
                                allowGrowY: false,
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Stats, this.tr("Statistic") + " [NUM 7]", this.onClick_btnStats, null, null), {
                                row: 0,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Up, this.tr("Shifts units one space up.") + " [NUM 8]", this.onClick_btnShift, "u", null), {
                                row: 0,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.CNCTAOpt, this.tr("Show current formation with CNCTAOpt") + " [NUM 9]<br>" + this.tr("Right click: Set formation from CNCTAOpt Long Link") + "<br>" + this.tr("Remember transported units are not supported."), this.onClick_CNCTAOpt, null, null), {
                                row: 0,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Left, this.tr("Shifts units one space left.") + " [NUM 4]", this.onClick_btnShift, "l", null), {
                                row: 1,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.DisableUnit, this.tr("Enables/Disables all units.") + " [NUM 5]", this.onClick_btnDisable, null, null), {
                                row: 1,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Right, this.tr("Shifts units one space right.") + " [NUM 6]", this.onClick_btnShift, "r", null), {
                                row: 1,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Flip.H, this.tr("Mirrors units horizontally.") + " [NUM 1]", this.onClick_btnMirror, "h", null), {
                                row: 2,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Down, this.tr("Shifts units one space down.") + " [NUM 2]", this.onClick_btnShift, "d", null), {
                                row: 2,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Flip.V, this.tr("Mirrors units vertically.") + " [NUM 3]", this.onClick_btnMirror, "v", null), {
                                row: 2,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Infantry, this.tr("Enables/Disables all infantry units.") + " [NUM *]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Infantry, null), {
                                row: 3,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Vehicle, this.tr("Enables/Disables all vehicles.") + " [NUM -]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Vehicle, null), {
                                row: 3,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Aircraft, this.tr("Enables/Disables all aircrafts.") + " [NUM +]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Aircraft, null), {
                                row: 3,
                                column: 2
                            });
                            //DS-MOd
                            this.boxMove.add(this.newButton(TABS.RES.IMG.VictoryPop, this.tr("Skip Victory-Popup After Battle"), this.onClick_btnVictory, null, null), {
                                row: 4,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.ResetFormation, this.tr("Reset Formation"), this.onClick_btnReset, null, null), {
                                row: 4,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.SaveLoad, this.tr("Save/Load Formation [NUM ,]"), this.onClick_SaveLoad, null, null), {
                                row: 4,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.one, this.tr("Swaps lines 1 & 2."), this.onClick_btnSwap_1_2, "k", null), {
                                row: 5,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.two, this.tr("Swaps lines 2 & 3."), this.onClick_btnSwap_2_3, "z", null), {
                                row: 5,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.three, this.tr("Swaps lines 3 & 4."), this.onClick_btnSwap_3_4, "c", null), {
                                row: 5,
                                column: 2
                            });
                            // Move Box init by Netquik
                            this.boxMove.xy = TABS.SETTINGS.get("GUI.Window.MoveBox.position", [390, 470]);
                            this.PlayArea.getLayoutParent().getLayoutParent().add(this.boxMove, {
                                left: this.boxMove.xy[0],
                                top: this.boxMove.xy[1]
                            });
                            // Move Box save position by Netquik
                            this.boxMove.addListener("move", function () {
                                TABS.SETTINGS.set("GUI.Window.MoveBox.position", [this.boxMove.getBounds().left, this.boxMove.getBounds().top]);
                            }, this);

                            // NOTE Added listener to show movebox on prearmysetup
                            this.ArmySetupAttackBar.addListener("changeVisibility", function () {
                                if (this.ArmySetupAttackBar.isVisible()) this.boxMove.show();
                                else this.boxMove.hide();
                            }, this);
                            // SkipVictory Button init by Netquik
                            this.boxMove.getChildren()[12].setIcon(TABS.SETTINGS.get("skipVictoryPopup", false) ? TABS.RES.IMG.VictoryPop2 : TABS.RES.IMG.VictoryPop);
                            this.skip_VictoryPopup();
                            //DS-MOD-END
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this._onViewChanged);
                            this._onViewChanged(ClientLib.Vis.Mode.CombatSetup, null);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.PlayArea constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        PlayArea: null,
                        HUD: null,
                        btnSimulation: null,
                        btnStats: null,
                        boxMove: null,
                        onHotKeyPress: function (key) {
                            if (!webfrontend.phe.cnc.Util.isEventTargetInputField(key)) {
                                var formation = TABS.UTIL.Formation.Get();
                                switch (key.getNativeEvent().keyCode) {
                                    case 96:
                                        // NUM 0
                                        this.onClick_btnSimulation();
                                        break;
                                    case 97:
                                        // NUM 1
                                        formation = TABS.UTIL.Formation.Mirror(formation, "h", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 98:
                                        // NUM 2
                                        formation = TABS.UTIL.Formation.Shift(formation, "d", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 99:
                                        // NUM 3
                                        formation = TABS.UTIL.Formation.Mirror(formation, "v", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 100:
                                        // NUM 4
                                        formation = TABS.UTIL.Formation.Shift(formation, "l", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 101:
                                        // NUM 5
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 102:
                                        // NUM 6
                                        formation = TABS.UTIL.Formation.Shift(formation, "r", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 103:
                                        // NUM 7
                                        this.onClick_btnStats();
                                        break;
                                    case 104:
                                        // NUM 8
                                        formation = TABS.UTIL.Formation.Shift(formation, "u", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 105:
                                        // NUM 9
                                        this.onClick_CNCTAOpt();
                                        break;
                                    case 106:
                                        // NUM *
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Infantry);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 107:
                                        // NUM +
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Aircraft);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 109:
                                        // NUM -
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Vehicle);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 110:
                                        // NUM ,
                                        this.onClick_SaveLoad();
                                        break;
                                        break;
                                    case 111:
                                        // NUM /
                                        break;
                                }
                            }
                        },
                        _onViewChanged: function (oldMode, newMode) {
                            if (newMode == ClientLib.Vis.Mode.CombatSetup) {
                                this.btnSimulation.show();
                                this.boxMove.show();
                                qx.bom.Element.addListener(document, "keydown", this.onHotKeyPress, this);
                            }
                            if (oldMode == ClientLib.Vis.Mode.CombatSetup) {
                                this.btnSimulation.hide();
                                if (newMode != ClientLib.Vis.Mode.Battleground) this.boxMove.hide(); // MOD leave boxMove in Battleground for pre army setup
                                qx.bom.Element.removeListener(document, "keydown", this.onHotKeyPress, this);
                                TABS.APISimulation.getInstance().removeListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                            }
                            // MOD not open stats for replays
                            var replay = this.PlayArea.getViewMode() == ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay;
                            if ((newMode == ClientLib.Vis.Mode.CombatSetup || newMode == ClientLib.Vis.Mode.Battleground) && TABS.SETTINGS.get("GUI.Window.Stats.open", true) && !replay && !TABS.GUI.Window.Stats.getInstance().isVisible()) TABS.GUI.Window.Stats.getInstance().open();
                            var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            var btnBack = TABS.GUI.ReportReplayOverlay.getInstance().btnBack;
                            if (city === null && replay) {
                                btnBack.hide();
                            } else btnBack.show();
                        },
                        _updateBtnSimulation: function () {
                            var formation = TABS.UTIL.Formation.Get();
                            if (formation !== null) {
                                if (TABS.UTIL.Formation.IsFormationInCache()) {
                                    this.btnSimulation.setEnabled(true);
                                    this.btnSimulation.setShow("icon");
                                } else {
                                    this.btnSimulation.setEnabled(!TABS.APISimulation.getInstance().getLock() && TABS.UTIL.Formation.Get().length > 0);
                                    if (TABS.APISimulation.getInstance().getData().length === 0 || TABS.UTIL.Formation.Get().length === 0) this.btnSimulation.setShow("icon");
                                    else if (this.btnSimulation.getShow() !== "label") {
                                        this.btnSimulation.setShow("label");
                                    }
                                }
                            } else {
                                this.btnSimulation.setEnabled(false);
                                this.btnSimulation.setShow("icon");
                            }
                        },
                        onClick_btnSimulation: function () {
                            var cache = TABS.CACHE.getInstance().check(TABS.UTIL.Formation.Get());
                            if (cache.result === null || cache.result.combat === undefined) {
                                TABS.APISimulation.getInstance().addListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                                TABS.APISimulation.getInstance().SimulateBattle();
                            } else {
                                var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id();
                                TABS.UTIL.Battleground.StartReplay(CurrentCityId, cache.result.combat);
                            }
                        },
                        OnSimulateBattleFinished: function (data) {
                            TABS.APISimulation.getInstance().removeListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                            var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id();
                            TABS.UTIL.Battleground.StartReplay(CurrentCityId, data.getData().d);
                        },
                        onClick_btnStats: function () {
                            if (TABS.GUI.Window.Stats.getInstance().isVisible()) {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", false);
                                TABS.GUI.Window.Stats.getInstance().close();
                            } else {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", true);
                                TABS.GUI.Window.Stats.getInstance().open();
                            }
                        },
                        newButton: function (icon, text, onClick, pos, sel) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: 22,
                                height: 22,
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints",
                                model: [pos, sel]
                            });
                            btn.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            btn.addListener("click", onClick, this);
                            return btn;
                        },
                        onClick_btnMirror: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Mirror(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnShift: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Shift(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_1_2: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 1, 2);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_2_3: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 2, 3);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_3_4: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 3, 4);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnDisable: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.toggle_Enabled(formation, e.getTarget().getModel()[0]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        //DS-MOd
                        loadFormationn: function (formation) {
                            try {
                                this.layouts.restore = true;
                                //console.log("this.view = ");
                                //console.log(this.view);
                                for (var i = 0; i < formation.length; i++) {
                                    var unit = formation[i];
                                    if (i == formation.length - 1) this.layouts.restore = false;
                                    for (var j = 0; j < this.view.lastUnitList.length; j++) {
                                        if (this.view.lastUnitList[j].get_Id() === unit.id) {
                                            this.view.lastUnitList[j].MoveBattleUnit(unit.x, unit.y);
                                            if (unit.e === undefined) this.view.lastUnitList[j].set_Enabled(true);
                                            else this.view.lastUnitList[j].set_Enabled(unit.e);
                                        }
                                    }
                                }
                                //this.view.lastUnits.RefreshData(); // RefreshData() has been obfuscated ?
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        view: {
                            playerCity: null,
                            playerCityDefenseBonus: null,
                            ownCity: null,
                            ownCityId: null,
                            targetCityId: null,
                            lastUnits: null,
                            lastUnitList: null
                        },
                        layouts: {
                            label: null,
                            list: null,
                            all: null,
                            current: null,
                            restore: null
                        },
                        onClick_btnReset: function (e) {
                            var Army = [];
                            try {
                                MainDatas = ClientLib.Data.MainData.GetInstance();
                                var base_city = MainDatas.get_Cities().get_CurrentOwnCity();
                                var target_city = MainDatas.get_Cities().get_CurrentCity();
                                if (target_city != null) {
                                    var target_city_id = target_city.get_Id();
                                    var units = base_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(target_city_id);
                                    this.view.lastUnitList = units.get_ArmyUnits().l;
                                    for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                        var unit = this.view.lastUnitList[i];
                                        var armyUnit = {};
                                        armyUnit.x = unit.GetCityUnit().get_CoordX();
                                        armyUnit.y = unit.GetCityUnit().get_CoordY();
                                        armyUnit.id = unit.get_Id();
                                        Army.push(armyUnit);
                                    }
                                    this.loadFormationn(Army);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        onClick_SaveLoad: function (e) {
                            try {
                                TABS.GUI.ArmySetupAttackBar.getInstance().SaveLoad.execute();
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        onClick_btnBlank: function (e) {
                            try {} catch (e) {
                                console.log(e);
                            }
                        },

                        //  REVIEW skipVictoryPopup button function by Netquik
                        onClick_btnVictory: function (e) {

                            var skipVictoryPopup = TABS.SETTINGS.get("skipVictoryPopup", false);
                            TABS.SETTINGS.set("skipVictoryPopup", skipVictoryPopup ? false : true);

                            e._target.setIcon(TABS.SETTINGS.get("skipVictoryPopup", false) ? TABS.RES.IMG.VictoryPop2 : TABS.RES.IMG.VictoryPop);

                            this.skip_VictoryPopup();


                        },
                        // SkipVictory function by Netquik
                        skip_VictoryPopup: function () {
                            webfrontend.gui.reports.CombatVictoryPopup.getInstance().addListener("appear", function () {
                                if (TABS.SETTINGS.get("skipVictoryPopup") === true) {
                                    webfrontend.gui.reports.CombatVictoryPopup.getInstance()._onBtnClose();
                                }
                            }, this);

                        },

                        //DS-MOD-END
                        onClick_CNCTAOpt: function (e) {
                            if (e.isRightPressed()) TABS.UTIL.Formation.Set(TABS.UTIL.CNCTAOpt.parseLink(prompt(this.tr("Enter CNCTAOpt Long Link:"))));
                            else qx.core.Init.getApplication().showExternal(TABS.UTIL.CNCTAOpt.createLink());
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.PlayArea");
                    }
                });
                qx.Class.define("TABS.GUI.ReportReplayOverlay", { // [singleton]	Back Button
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.qxApp = qx.core.Init.getApplication();
                            this.ReportReplayOverlay = qx.core.Init.getApplication().getReportReplayOverlay();
                            //MOD New Play Button Icon Selector
                            this._PlayAreaHUD = this.qxApp.getPlayArea().getHUD();
                            this._playAreaChildren = this.qxApp.getPlayArea().getChildren();
                            var PBIS_S = webfrontend.gui.reports.ReportReplayOverlay.$$original.toString(); //GameVersion
                            var PBIS_M = PBIS_S.match(/this\.[_a-zA-Z]+,this\);this.+this\.([_a-zA-Z]+)\.addListener\([a-z],this\.([_a-zA-Z]+),this\);this.+this\.[_a-zA-Z]+,this\);this\.([_a-zA-Z]+)\.addListener\([a-z]/);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[1]] && "btn_play" == this.ReportReplayOverlay[PBIS_M[1]].objid && (this.PBIS = PBIS_M[1]);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[3]] && "btn_skip" == this.ReportReplayOverlay[PBIS_M[3]].objid && (this.PBIS_SK = PBIS_M[3]);
                            // MOD 22.3-5
                            PBIS_M = webfrontend.gui.reports.ReportReplayOverlay.prototype[PBIS_M[2]].toString().match(/(?:if\(|,)this\.([_a-zA-Z]+)\){this\.[_a-zA-Z]+\((?:false|!1)\).+this\.([_a-zA-Z]+)\.setValue/);
                            "boolean" == typeof this.ReportReplayOverlay[PBIS_M[1]] && (this.PBIS_S = PBIS_M[1]);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[2]] && "lbl_speed" == this.ReportReplayOverlay[PBIS_M[2]].objid && (this.PBIS_L = PBIS_M[2]);
                            //MOD New Autoscroll Button Selector
                            var ABS_S = webfrontend.gui.PlayArea.PlayAreaHUD.$$original.toString(); //GameVersion
                            var ABS_M = ABS_S.match(/COMBATAUTOSCROLL\),10\)==1;this\.([_a-zA-Z]+)=/);
                            "object" == typeof this._PlayAreaHUD[ABS_M[1]] && (this.ABS_B = ABS_M[1]);
                            //MOD Original Style Buttons
                            this.btnBack = new qx.ui.form.Button().set({
                                width: 48,
                                height: 48,
                                appearance: "button-addpoints",
                                toolTipText: this.qxApp.tr("tnf:tt replay back button"),
                                icon: "FactionUI/icons/icon_return.png",
                                appearance: "button-friendlist-scroll"
                            });
                            this.btnBack.addListener("click", this.onClick_btnBack, this);
                            this.ReportReplayOverlay.addListener("appear", this.onAppear_ReportReplayOverlay, this);
                            this.ReportReplayOverlay.add(this.btnBack, {
                                top: 11,
                                left: 346
                            });
                            this.btnSkip = new qx.ui.form.Button().set({
                                width: 35,
                                height: 24,
                                appearance: "button-addpoints",
                                icon: "FactionUI/icons/icon_replay_skip.png",
                                toolTipText: this.qxApp.tr("tnf:tt replay skip"),
                                appearance: "button-friendlist-scroll"
                            });
                            this.btnSkip.addListener("click", this.onClick_btnSkip, this);
                            this.ReportReplayOverlay.add(this.btnSkip, {
                                top: 21,
                                left: 665
                            });
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.ReportReplayOverlay constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        ReportReplayOverlay: null,
                        btnBack: null,
                        btnSkip: null,
                        LastSIM_R: null,
                        onClick_btnBack: function () {
                            // MOD Back Button fix
                            try {
                                qx.core.Init.getApplication().getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, TABS.CACHE.getInstance().lastcity, 0, 0);
                                ClientLib.Vis.VisMain.GetInstance().get_CombatSetup().SetPosition(0, qx.core.Init.getApplication().getPlayArea().getHUD().getCombatSetupOffset(ClientLib.Vis.CombatSetup.CombatSetupViewMode.Defense));
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error onClick_btnBack", e);
                                console.groupEnd();
                            }
                        },
                        // MOD Back Button fix for replays and stats close
                        onAppear_ReportReplayOverlay: function () {
                            try {
                                if (TABS.SETTINGS.get("GUI.Window.Stats.open", true) && TABS.GUI.Window.Stats.getInstance().isVisible()) TABS.GUI.Window.Stats.getInstance().close();
                                //MOD REMOVE ORIGINAL SKIP BUTTON
                                null != this.ReportReplayOverlay[this.PBIS_SK] && this.ReportReplayOverlay[this.PBIS_SK].exclude();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error onAppear_btnBack", e);
                                console.groupEnd();
                            }




                        },
                        onClick_btnSkip: function () {
                            //MOD New SKIP SIMULATION 1 by NetquiK
                            try {
                                var bA = ClientLib.Vis.VisMain.GetInstance();
                                var bG = bA.get_Battleground();
                                var pA = this.qxApp.getPlayArea();
                                if (bG.get_Simulation !== undefined && bG.get_Simulation().DoStep !== undefined) {
                                    if (!this.SkippingSim) {
                                        this.SkippingSim = true;
                                        if (bG.get_CombatComplete() == true) bG.RestartReplay();
                                        //this.TopAttackerPos = bA.get_PositionY() - 500;
                                        /* var pos1 = (this.LastSIM_R.Defense / 100) * ClientLib.Vis.VisMain.GetInstance().get_Battleground().get_ViewHeight() */
                                        if(!this._playAreaChildren[11].isVisible()){
                                        var overall = (this.LastSIM_R / 100) * bG.get_ViewHeight();
                                        this.TopAttackerPos = this.LastSIM_R < 25 ? bG.get_MinYPosition() : bG.get_MinYPosition() + overall;
                                        } else {
                                            this.TopAttackerPos = null;
                                        }
                                        webfrontend.phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onTick_btnSkip, this);
                                        this.ResetAutoscroll = pA.getPlayerAutoScrollPreference();
                                        this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().hide();
                                        this.ReportReplayOverlay.setEnabled(false);
                                        this.btnBack.setEnabled(true);
                                        ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 0);
                                        ClientLib.Config.Main.GetInstance().SaveToDB();
                                        while (bG.get_Simulation().DoStep(false)) {} //LIKE 
                                        pA.autoScroll = 0
                                        bG.set_ReplaySpeed(10);
                                        //ClientLib.Vis.VisMain.GetInstance().get_Battleground().set_ReplaySpeed(10000); // AUTOCAMFAIL
                                    }
                                } else {

                                    bG.SkipToEnd();

                                }
                            } catch (e) {
                                console.log(e);
                            }



                        },
                        onTick_btnSkip: function () {
                            //MOD New SKIP SIMULATION 2 by NetquiK
                            var bA = ClientLib.Vis.VisMain.GetInstance();
                            var bG = bA.get_Battleground();
                            var pA = this.qxApp.getPlayArea();
                            if (pA.getViewMode() != ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay || bG.get_LastFrameTime() == 0) {
                                webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                                this.ReportReplayOverlay.setEnabled(true);
                                this.SkippingSim = null;
                                if (this.ResetAutoscroll) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                    ClientLib.Config.Main.GetInstance().SaveToDB();
                                    this.ResetAutoscroll = 0;
                                }
                                return
                            }
                            /* console.log(this.TopAttackerPos);
                            console.log(bG.get_PosY());
                            console.log(bG.get_TopAttackerPos());
                            if (this.TopAttackerPos > bG.get_TopAttackerPos() - 500) {
                                this.TopAttackerPos = bG.get_TopAttackerPos() - 500;
                            } */

                            if (bG.get_CombatComplete() == true && pA.getViewMode() == ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay) {
                                bG.SkipToEnd();
                                if (this.ResetAutoscroll) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                    ClientLib.Config.Main.GetInstance().SaveToDB();
                                    this.ResetAutoscroll = 0;
                                }
                                if (this.TopAttackerPos) bA.SetPosition(0, this.TopAttackerPos);
                                window.setTimeout(function () {
                                    qx.core.Init.getApplication().getPlayArea().autoScroll = 1
                                }, 1000);
                                this.ReportReplayOverlay.setEnabled(true)
                                this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().show();
                                webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                                this.SkippingSim = null;
                            }
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.ReportReplayOverlay");
                    }

                });
                qx.Class.define("TABS.GUI.Window.Stats", { // [singleton]	Stats Window
                    type: "singleton",
                    extend: qx.ui.window.Window,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.set({
                                layout: new qx.ui.layout.VBox(),
                                caption: "TABS: " + this.tr("Statistic"),
                                icon: TABS.RES.IMG.Stats,
                                minWidth: 175,
                                contentPadding: 4,
                                contentPaddingTop: 0,
                                contentPaddingBottom: 3,
                                allowMaximize: false,
                                showMaximize: false,
                                allowMinimize: false,
                                showMinimize: false,
                                resizable: true,
                                resizableTop: false,
                                resizableBottom: false,
                                useResizeFrame: false
                            });
                            this.moveTo(
                                TABS.SETTINGS.get("GUI.Window.Stats.position", [124, 31])[0], TABS.SETTINGS.get("GUI.Window.Stats.position", [124, 31])[1]);
                            this.addListener("move", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.position", [this.getBounds().left, this.getBounds().top]);
                            }, this);
                            this.addListener("resize", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.width", this.getWidth());
                                this.makeSimView();
                            }, this);
                            this.addListener("changeHeight", function () {
                                if (this.getHeight() !== null) this.resetHeight();
                            });
                            this.addListener("appear", this.onAppear, this);
                            this.addListener("close", this.onClose, this);
                            this.setWidth(TABS.SETTINGS.get("GUI.Window.Stats.width", 214));
                            this.getChildControl("close-button").addListener("execute", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", false);
                            }, this);
                            this.getChildControl("icon").set({
                                width: 20,
                                height: 20,
                                scale: true,
                                alignY: "middle"
                            });
                            this.setStatus("0 " + this.tr("simulations in cache"));
                            //Enemy Health Section//
                            this.EnemyHeader = this.makeHeader(this.tr("tnf:combat target"));
                            this.EnemyHeader.addListener("click", function () {
                                if (this.GUI.Enemy.isVisible()) {
                                    this.GUI.Enemy.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", false);
                                } else {
                                    this.GUI.Enemy.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", true);
                                }
                            }, this);
                            //Repair Section//
                            this.RepairHeader = this.makeHeader(this.tr("tnf:own repair cost").replace(":", ""));
                            this.RepairHeader.addListener("click", function () {
                                if (this.GUI.Repair.isVisible()) {
                                    this.GUI.Repair.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", false);
                                } else {
                                    this.GUI.Repair.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", true);
                                }
                            }, this);
                            //Loot Section//
                            this.LootHeader = this.makeHeader(this.tr("tnf:lootable resources:").replace(":", ""));
                            this.LootHeader.addListener("click", function () {
                                if (this.GUI.Loot.isVisible()) {
                                    this.GUI.Loot.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", false);
                                } else {
                                    this.GUI.Loot.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", true);
                                }
                            }, this);
                            this.GUI = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                })
                            };
                            this.LabelsVBox = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                })
                            };
                            this.Label = {
                                Battle: {
                                    Preset: new TABS.GUI.Window.Stats.Atom("P", null, this.tr("Preset")),
                                    Outcome: new TABS.GUI.Window.Stats.Atom("O", null, this.tr("tnf:combat report")),
                                    Duration: new TABS.GUI.Window.Stats.Atom("D", null, this.tr("tnf:combat timer npc: %1", "")),
                                    OwnCity: new TABS.GUI.Window.Stats.Atom("B", null, this.tr("tnf:base")),
                                    Morale: new TABS.GUI.Window.Stats.Atom("M", null, this.tr("Morale"))
                                },
                                Enemy: {
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:total"), TABS.RES.IMG.Enemy.All),
                                    Defense: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:defense"), TABS.RES.IMG.Enemy.Defense),
                                    Structure: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:base"), TABS.RES.IMG.Enemy.Base),
                                    Construction_Yard: new TABS.GUI.Window.Stats.Atom("CY", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Construction_Yard, ClientLib.Base.EFactionType.GDIFaction)),
                                    Defense_Facility: new TABS.GUI.Window.Stats.Atom("DF", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Defense_Facility, ClientLib.Base.EFactionType.GDIFaction)),
                                    Command_Center: new TABS.GUI.Window.Stats.Atom("CC", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Command_Center, ClientLib.Base.EFactionType.GDIFaction)),
                                    Barracks: new TABS.GUI.Window.Stats.Atom("B", TABS.RES.IMG.Offense.Infantry, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Barracks, ClientLib.Base.EFactionType.GDIFaction)),
                                    Factory: new TABS.GUI.Window.Stats.Atom("F", TABS.RES.IMG.Offense.Vehicle, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Factory, ClientLib.Base.EFactionType.GDIFaction)),
                                    Airport: new TABS.GUI.Window.Stats.Atom("A", TABS.RES.IMG.Offense.Aircraft, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Airport, ClientLib.Base.EFactionType.GDIFaction)),
                                    Support: new TABS.GUI.Window.Stats.Atom("S", null, this.tr("tnf:support"))
                                },
                                Repair: {
                                    Storage: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:offense repair time"), TABS.RES.IMG.RepairCharge.Base),
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:repair points"), TABS.RES.IMG.RepairCharge.Offense),
                                    Crystal: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:crystals"), TABS.RES.IMG.Resource.Crystal),
                                    Infantry: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:infantry repair title"), TABS.RES.IMG.RepairCharge.Infantry),
                                    Vehicle: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:vehicle repair title"), TABS.RES.IMG.RepairCharge.Vehicle),
                                    Aircraft: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:aircraft repair title"), TABS.RES.IMG.RepairCharge.Aircraft)
                                },
                                Loot: {
                                    Tiberium: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:tiberium"), TABS.RES.IMG.Resource.Tiberium),
                                    Crystal: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:crystals"), TABS.RES.IMG.Resource.Crystal),
                                    Credits: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:credits"), TABS.RES.IMG.Resource.Credits),
                                    ResearchPoints: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:research points"), TABS.RES.IMG.Resource.ResearchPoints),
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:total") + " " + this.tr("tnf:loot"), TABS.RES.IMG.Resource.Transfer)
                                },
                                Buttons: {
                                    View: new TABS.GUI.Window.Stats.Atom(this.tr("View Simulation"), TABS.RES.IMG.Simulate).set({
                                        marginTop: 1,
                                        marginBottom: 5
                                    })
                                }
                            };
                            for (var i in this.GUI) {
                                for (var j in this.Label[i])
                                    this.LabelsVBox[i].add(this.Label[i][j]);
                                this.GUI[i].add(this.LabelsVBox[i], {
                                    flex: 0
                                });
                            }
                            //Enemy Health Section//
                            this.EnemyHeader = this.makeHeader(this.tr("tnf:combat target"));
                            this.EnemyHeader.addListener("click", function () {
                                if (this.GUI.Enemy.isVisible()) {
                                    this.GUI.Enemy.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", false);
                                } else {
                                    this.GUI.Enemy.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", true);
                                }
                            }, this);
                            //Repair Section//
                            this.RepairHeader = this.makeHeader(this.tr("tnf:own repair cost").replace(":", ""));
                            this.RepairHeader.addListener("click", function () {
                                if (this.GUI.Repair.isVisible()) {
                                    this.GUI.Repair.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", false);
                                } else {
                                    this.GUI.Repair.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", true);
                                }
                            }, this);
                            //Loot Section//
                            this.LootHeader = this.makeHeader(this.tr("tnf:lootable resources:").replace(":", ""));
                            this.LootHeader.addListener("click", function () {
                                if (this.GUI.Loot.isVisible()) {
                                    this.GUI.Loot.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", false);
                                } else {
                                    this.GUI.Loot.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", true);
                                }
                            }, this);
                            this.add(this.GUI.Battle);
                            this.add(this.EnemyHeader);
                            this.add(this.GUI.Enemy);
                            this.add(this.RepairHeader);
                            this.add(this.GUI.Repair);
                            this.add(this.LootHeader);
                            this.add(this.GUI.Loot);
                            this.add(this.GUI.Buttons);
                            this.add(this.getChildControl("statusbar").set({
                                paddingBottom: 6,
                                paddingTop: 4
                            }));
                            this.getChildControl("statusbar-text").set({
                                textColor: "#BBBBBB"
                            });
                            this.getChildControl("statusbar").add(new qx.ui.core.Spacer(), {
                                flex: 1
                            });
                            var fontsize = qx.theme.manager.Font.getInstance().resolve(this.getChildControl("statusbar-text").getFont()).getSize(),
                                lblReset = new qx.ui.basic.Label(this.tr("Reset")).set({
                                    textColor: "#115274",
                                    font: new qx.bom.Font("statusbar-text").set({
                                        size: fontsize,
                                        decoration: "underline"
                                    })
                                });
                            lblReset.addListener("click", function () {
                                var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                if (CurrentCityId) TABS.CACHE.getInstance().clear(CurrentCityId);
                            }, this);
                            this.getChildControl("statusbar").add(lblReset);
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Enemy.visible", true) === false) this.GUI.Enemy.exclude();
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Repair.visible", true) === false) this.GUI.Repair.exclude();
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Loot.visible", true) === false) this.GUI.Loot.exclude();
                            this.simViews = [];
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this._onViewChanged);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        GUI: null,
                        LabelsVBox: null,
                        Label: null,
                        EnemyHeader: null,
                        RepairHeader: null,
                        LootHeader: null,
                        simViews: null,
                        StatsChanged: false,
                        onAppear: function () {
                            webfrontend.phe.cnc.base.Timer.getInstance().addListener("uiTick", this.__onTick, this);
                            TABS.CACHE.getInstance().addListener("addSimulation", this.__updateStats, this);
                            TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.__updateStats, this);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentCityChange);
                            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            this.__updateStats();
                        },
                        onClose: function () {
                            webfrontend.phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.__onTick, this);
                            TABS.CACHE.getInstance().removeListener("addSimulation", this.__updateStats, this);
                            TABS.PreArmyUnits.getInstance().removeListener("OnCityPreArmyUnitsChanged", this.__updateStats, this);
                            webfrontend.phe.cnc.Util.detachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentCityChange);
                            webfrontend.phe.cnc.Util.detachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            for (var i in this.simViews) {
                                this.simViews[i].resetStats();
                                this.simViews[i].__onTick();
                            }
                        },
                        __onTick: function () {
                            var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            if (!ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete() || CurrentCity === null || CurrentCity.get_Version() < 0) return;
                            if (this.StatsChanged) {
                                this.StatsChanged = false;
                                for (var i in this.simViews) {
                                    this.simViews[i].updateStats();
                                    this.simViews[i].__onTick();
                                }
                            } else {
                                for (var i in this.simViews) {
                                    this.simViews[i].__onTick();
                                }
                            }
                            this.setStatus(TABS.CACHE.getInstance().getCitySimAmount().toString() + " " + this.tr("simulations in cache"));
                        },
                        __updateStats: function () {
                            this.StatsChanged = true;
                        },
                        __CurrentCityChange: function (oldId, newId) {
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId) === null) {
                                for (var i in this.simViews) {
                                    this.simViews[i].resetStats();
                                }
                            }
                        },
                        _onViewChanged: function (oldMode, newMode) {
                            if (newMode != ClientLib.Vis.Mode.CombatSetup && newMode != ClientLib.Vis.Mode.Battleground && newMode != ClientLib.Vis.Mode.City) this.close();
                        },
                        makeHeader: function (text) {
                            var Header = new qx.ui.container.Composite(new qx.ui.layout.Grow()).set({
                                alignX: "center",
                                alignY: "middle",
                                zIndex: 11
                            });
                            Header.add(new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
                                decorator: "pane-light-opaque",
                                allowGrowX: true,
                                allowGrowY: true,
                            }));
                            Header.add(new qx.ui.basic.Label(text).set({
                                paddingLeft: 9,
                                allowGrowX: true,
                                allowGrowY: true,
                                paddingBottom: 2,
                                font: "font_size_13_bold_shadow"
                            }));
                            return Header;
                        },
                        makeSimView: function () {
                            var i, num = Math.round((this.getWidth() - 30) / 75);
                            if (num > 6) num = 6;
                            if (this.simViews.length != num) {
                                for (i = 0; i < num; i++) {
                                    if (this.simViews[i] === undefined) {
                                        this.simViews[i] = new TABS.GUI.Window.Stats.SimView(i, this);
                                        this.GUI.Battle.add(this.simViews[i].GUI.Battle, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Enemy.add(this.simViews[i].GUI.Enemy, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Repair.add(this.simViews[i].GUI.Repair, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Loot.add(this.simViews[i].GUI.Loot, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Buttons.add(this.simViews[i].GUI.Buttons, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                    }
                                }
                                for (i = 0; i < this.simViews.length; i++) {
                                    if (i >= num) {
                                        this.GUI.Battle.remove(this.simViews[i].GUI.Battle);
                                        this.GUI.Enemy.remove(this.simViews[i].GUI.Enemy);
                                        this.GUI.Repair.remove(this.simViews[i].GUI.Repair);
                                        this.GUI.Loot.remove(this.simViews[i].GUI.Loot);
                                        this.GUI.Buttons.remove(this.simViews[i].GUI.Buttons);
                                    }
                                }
                                while (this.simViews.length > num)
                                    this.simViews.splice(num, 1);
                                this.__updateLabels();
                                this.__updateStats();
                            }
                        },
                        __updateLabels: function () {
                            if (this.simViews.length > 0) {
                                var i, visibility;
                                //Label.Battle.Morale
                                visibility = "excluded";
                                for (i in this.simViews) {
                                    if (this.simViews[i].Label.Battle.Morale.getValue() != "100%") {
                                        visibility = "visible";
                                        break;
                                    }
                                }
                                for (i in this.simViews)
                                    this.simViews[i].Label.Battle.Morale.setVisibility(visibility);
                                this.Label.Battle.Morale.setVisibility(visibility);
                                //Label.Enemy.Defense
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Defense.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Defense.setVisibility(visibility);
                                this.Label.Enemy.Defense.setVisibility(visibility);
                                //Label.Enemy.Defense_Facility
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Defense_Facility.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Defense_Facility.setVisibility(visibility);
                                this.Label.Enemy.Defense_Facility.setVisibility(visibility);
                                //Label.Enemy.Command_Center
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Command_Center.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Command_Center.setVisibility(visibility);
                                this.Label.Enemy.Command_Center.setVisibility(visibility);
                                //Label.Enemy.Barracks
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Barracks.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Barracks.setVisibility(visibility);
                                this.Label.Enemy.Barracks.setVisibility(visibility);
                                //Label.Enemy.Factory
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Factory.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Factory.setVisibility(visibility);
                                this.Label.Enemy.Factory.setVisibility(visibility);
                                //Label.Enemy.Airport
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Airport.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Airport.setVisibility(visibility);
                                this.Label.Enemy.Airport.setVisibility(visibility);
                                //Label.Enemy.Support
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Support.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Support.setVisibility(visibility);
                                this.Label.Enemy.Support.setVisibility(visibility);
                            }
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.Atom", { //				Stats Window Atom
                    extend: qx.ui.basic.Atom,
                    include: [qx.locale.MTranslation],
                    construct: function (label, icon, toolTipText, toolTipIcon) {
                        try {
                            this.base(arguments, label, icon);
                            if (label === undefined) label = null;
                            if (icon === undefined) icon = null;
                            if (toolTipText === undefined) toolTipText = null;
                            if (toolTipIcon === undefined) toolTipIcon = null;
                            var _toolTipText = (toolTipText !== null ? toolTipText : (label !== null ? label : "")),
                                _toolTipIcon = (toolTipIcon !== null ? toolTipIcon : (icon !== null ? icon : "")),
                                _show = (toolTipIcon !== null || icon !== null ? "icon" : (toolTipText !== null || label !== null ? "label" : "both"));
                            this.initAlignX("center");
                            this.initAlignY("middle");
                            this.initGap(0);
                            this.initIconPosition("top");
                            this.initMinHeight(18);
                            this.initToolTipText(_toolTipText);
                            this.initToolTipIcon(_toolTipIcon);
                            this.initShow(_show);
                            this.setAlignX("center");
                            this.setAlignY("middle");
                            this.setGap(0);
                            this.setIconPosition("top");
                            this.setMinHeight(18);
                            this.setToolTipText(_toolTipText);
                            this.setToolTipIcon(_toolTipIcon);
                            this.setShow(_show);
                            this.getChildControl("icon").set({
                                width: 18,
                                height: 18,
                                scale: true,
                                alignY: "middle"
                            });
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats.Atom constructor", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.SimView", { //				Simulation View Objekt
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function (num, window) {
                        try {
                            this.base(arguments);
                            var i, j, defaultPreset = TABS.SETTINGS.get("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num));
                            if (defaultPreset.Name === undefined || defaultPreset.Name !== TABS.STATS.getPreset(num).Name) defaultPreset = TABS.SETTINGS.set("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num)); // Reset Settings (if no Name)
                            if (defaultPreset.Description === undefined) defaultPreset = TABS.SETTINGS.set("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num)); // Reset Settings (if no Description)
                            this.Num = num;
                            this.Window = window;
                            this.Cache = {};
                            this.Stats = new TABS.STATS();
                            this.Name = defaultPreset.Name;
                            this.Description = defaultPreset.Description;
                            this.Prio = defaultPreset.Prio;
                            this.GUI = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                })
                            };
                            this.Label = {
                                Battle: {
                                    Preset: new qx.ui.basic.Label(this.tr(this.Name)).set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18,
                                        toolTipText: this.tr(this.Description)
                                    }),
                                    Outcome: new qx.ui.basic.Atom("-", null).set({
                                        alignX: "center",
                                        alignY: "middle",
                                        gap: 0,
                                        iconPosition: "top",
                                        minHeight: 18,
                                        show: "label"
                                    }),
                                    Duration: new qx.ui.basic.Label("-:--").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    }),
                                    OwnCity: new qx.ui.basic.Label("-").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    }),
                                    Morale: new qx.ui.basic.Label("-").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    })
                                },
                                Enemy: {
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Defense: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Structure: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Construction_Yard: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Defense_Facility: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Command_Center: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Barracks: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Factory: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Airport: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Support: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    })
                                },
                                Repair: {
                                    Storage: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairStorage"
                                    }),
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairCharge"
                                    }),
                                    Crystal: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "Resource"
                                    }),
                                    Infantry: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeInf"
                                    }),
                                    Vehicle: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeVeh"
                                    }),
                                    Aircraft: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeAir"
                                    })
                                },
                                Loot: {
                                    Tiberium: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Tiberium"
                                    }),
                                    Crystal: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Crystal"
                                    }),
                                    Credits: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Credits"
                                    }),
                                    ResearchPoints: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "ResearchPoints"
                                    }),
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Resource"
                                    })
                                },
                                Buttons: {
                                    View: new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                                        allowGrowX: true,
                                        marginLeft: 0,
                                        marginRight: 0
                                    })
                                }
                            };
                            this.Label.Battle.Outcome.getChildControl("icon").set({
                                width: 18,
                                height: 18,
                                scale: true,
                                alignY: "middle"
                            });
                            this.Label.Repair.Overall.getContentElement().setStyle("text-shadow", "0 0 3pt");
                            for (i in this.GUI) {
                                for (j in this.Label[i]) {
                                    this.GUI[i].add(this.Label[i][j], {
                                        flex: 1,
                                        right: 0
                                    });
                                }
                                this.GUI[i].addListener("dblclick", this.loadFormation, this);
                            }
                            this.Stats.addListener("changeBattleDuration", this.__updateBattleDuration.bind(this, this.Label.Battle.Duration));
                            for (i in this.Stats.Enemy) {
                                if (this.Label.Enemy.hasOwnProperty(i)) {
                                    if (this.Stats.Enemy[i].hasOwnProperty("HealthPoints")) {
                                        this.Stats.Enemy[i].HealthPoints.bind("max", this.Label.Enemy[i].HealthPoints, "max");
                                        this.Stats.Enemy[i].HealthPoints.bind("start", this.Label.Enemy[i].HealthPoints, "start");
                                        this.Stats.Enemy[i].HealthPoints.bind("end", this.Label.Enemy[i].HealthPoints, "end");
                                        if (i == "Overall") {
                                            for (j in this.Label.Loot) {
                                                this.Stats.Enemy[i].HealthPoints.bind("max", this.Label.Loot[j].HealthPoints, "max");
                                                this.Stats.Enemy[i].HealthPoints.bind("start", this.Label.Loot[j].HealthPoints, "start");
                                                this.Stats.Enemy[i].HealthPoints.bind("end", this.Label.Loot[j].HealthPoints, "end");
                                            }
                                        }
                                    }
                                    if (this.Stats.Enemy[i].hasOwnProperty("Resource")) {
                                        this.Stats.Enemy[i].Resource.bind("Tiberium", this.Label.Enemy[i].Resource, "Tiberium");
                                        this.Stats.Enemy[i].Resource.bind("Crystal", this.Label.Enemy[i].Resource, "Crystal");
                                        this.Stats.Enemy[i].Resource.bind("Credits", this.Label.Enemy[i].Resource, "Credits");
                                        this.Stats.Enemy[i].Resource.bind("ResearchPoints", this.Label.Enemy[i].Resource, "ResearchPoints");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeBase", this.Label.Enemy[i].Resource, "RepairChargeBase");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeAir", this.Label.Enemy[i].Resource, "RepairChargeAir");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeInf", this.Label.Enemy[i].Resource, "RepairChargeInf");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeVeh", this.Label.Enemy[i].Resource, "RepairChargeVeh");
                                        if (i == "Overall") {
                                            for (j in this.Label.Loot) {
                                                this.Stats.Enemy[i].Resource.bind("Tiberium", this.Label.Loot[j].Resource, "Tiberium");
                                                this.Stats.Enemy[i].Resource.bind("Crystal", this.Label.Loot[j].Resource, "Crystal");
                                                this.Stats.Enemy[i].Resource.bind("Credits", this.Label.Loot[j].Resource, "Credits");
                                                this.Stats.Enemy[i].Resource.bind("ResearchPoints", this.Label.Loot[j].Resource, "ResearchPoints");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeBase", this.Label.Loot[j].Resource, "RepairChargeBase");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeAir", this.Label.Loot[j].Resource, "RepairChargeAir");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeInf", this.Label.Loot[j].Resource, "RepairChargeInf");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeVeh", this.Label.Loot[j].Resource, "RepairChargeVeh");
                                            }
                                        }
                                    }
                                }
                            }
                            for (i in this.Stats.Offense) {
                                if (this.Label.Repair.hasOwnProperty(i)) {
                                    if (this.Stats.Offense[i].hasOwnProperty("HealthPoints")) {
                                        this.Stats.Offense[i].HealthPoints.bind("max", this.Label.Repair[i].HealthPoints, "max");
                                        this.Stats.Offense[i].HealthPoints.bind("start", this.Label.Repair[i].HealthPoints, "start");
                                        this.Stats.Offense[i].HealthPoints.bind("end", this.Label.Repair[i].HealthPoints, "end");
                                    }
                                    if (this.Stats.Offense[i].hasOwnProperty("Resource")) {
                                        this.Stats.Offense[i].Resource.bind("Tiberium", this.Label.Repair[i].Resource, "Tiberium");
                                        this.Stats.Offense[i].Resource.bind("Crystal", this.Label.Repair[i].Resource, "Crystal");
                                        this.Stats.Offense[i].Resource.bind("Credits", this.Label.Repair[i].Resource, "Credits");
                                        this.Stats.Offense[i].Resource.bind("ResearchPoints", this.Label.Repair[i].Resource, "ResearchPoints");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeBase", this.Label.Repair[i].Resource, "RepairChargeBase");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeAir", this.Label.Repair[i].Resource, "RepairChargeAir");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeInf", this.Label.Repair[i].Resource, "RepairChargeInf");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeVeh", this.Label.Repair[i].Resource, "RepairChargeVeh");
                                        if (i == "Crystal") {
                                            for (j in this.Label.Repair) {
                                                this.Stats.Offense[i].Resource.bind("Tiberium", this.Label.Repair[j].Resource, "Tiberium");
                                                this.Stats.Offense[i].Resource.bind("Crystal", this.Label.Repair[j].Resource, "Crystal");
                                                this.Stats.Offense[i].Resource.bind("Credits", this.Label.Repair[j].Resource, "Credits");
                                                this.Stats.Offense[i].Resource.bind("ResearchPoints", this.Label.Repair[j].Resource, "ResearchPoints");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeBase", this.Label.Repair[j].Resource, "RepairChargeBase");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeAir", this.Label.Repair[j].Resource, "RepairChargeAir");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeInf", this.Label.Repair[j].Resource, "RepairChargeInf");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeVeh", this.Label.Repair[j].Resource, "RepairChargeVeh");
                                            }
                                        }
                                    }
                                }
                            }
                            var ButtonAPISim = new qx.ui.form.ModelButton(null, TABS.RES.IMG.Simulate).set({
                                maxHeight: 22,
                                minWidth: 22,
                                toolTipText: this.tr("tnf:refresh"),
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints"
                            });
                            ButtonAPISim.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            ButtonAPISim.addListener("click", function () {
                                this.loadFormation();
                                TABS.APISimulation.getInstance().SimulateBattle();
                            }, this);
                            this.Label.Buttons.View.add(ButtonAPISim);
                            var ButtonPlay = new qx.ui.form.ModelButton(null, TABS.RES.IMG.Arrows.Right).set({
                                maxHeight: 22,
                                minWidth: 22,
                                toolTipText: this.tr("View Simulation"),
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints"
                            });
                            ButtonPlay.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            ButtonPlay.addListener("click", this.playReplay, this);
                            this.Label.Buttons.View.add(ButtonPlay);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.Window.Stats.SimView constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        Num: null,
                        Window: null,
                        GUI: null,
                        Label: null,
                        Cache: null,
                        Stats: null,
                        StatsChanged: false,
                        Prio: null,
                        Name: null,
                        Description: null,
                        updateStats: function () {
                            var i, cache = null,
                                CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            if (CurrentCity !== null && CurrentCity.get_Version() !== -1 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete()) {
                                if (this.Prio.length === 0) cache = TABS.CACHE.getInstance().check(TABS.UTIL.Formation.Get());
                                else cache = TABS.CACHE.getInstance().getPrio1(this.Prio);
                            }
                            if (cache !== null && cache.result !== null) {
                                this.Cache = cache;
                                this.Stats.setAny(cache.result.stats);
                                this.StatsChanged = true;
                                this.__updateBattleOutcome();
                                this.__updateBattleOwnCity();
                                this.__updateBattleMoral();
                                this.Window.__updateLabels();
                            }
                            if (typeof this.Cache["key"] !== "undefined" && typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                if (CurrentCity !== null && CurrentCity.get_Version() !== -1 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete() && this.Cache.key === TABS.CACHE.getInstance().calcUnitsHash(TABS.UTIL.Formation.Get(), this.Cache.result.ownid)) {
                                    for (i in this.GUI) {
                                        this.GUI[i].setDecorator("pane-light-opaque");
                                        this.GUI[i].setOpacity(1);
                                    }
                                } else {
                                    for (i in this.GUI) {
                                        this.GUI[i].setDecorator("pane-light-plain");
                                        this.GUI[i].setOpacity(0.7);
                                    }
                                }
                            }
                        },
                        resetStats: function () {
                            this.Cache = {};
                            this.Stats.setAny((new TABS.STATS()).getAny());
                            this.StatsChanged = true;
                            this.__updateBattleOutcome();
                            this.__updateBattleOwnCity();
                            this.__updateBattleMoral();
                            this.Window.__updateLabels();
                            for (var i in this.GUI) {
                                this.GUI[i].setDecorator("pane-light-opaque");
                                this.GUI[i].setOpacity(1);
                            }
                        },
                        loadFormation: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["formation"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId(this.Cache.result.ownid);
                                TABS.UTIL.Formation.Set(this.Cache.result.formation);
                            }
                        },
                        playReplay: function () {
                            TABS.UTIL.Battleground.StartReplay(this.Cache.result.cityid, this.Cache.result.combat);
                        },
                        __updateBattleOutcome: function () {
                            if (Object.getOwnPropertyNames(this.Cache).length === 0) {
                                this.Label.Battle.Outcome.setShow("label");
                                this.Label.Battle.Outcome.resetIcon();
                                this.Label.Battle.Outcome.resetToolTipIcon();
                                this.Label.Battle.Outcome.resetToolTipText();
                            } else if (this.Label.Repair.Overall.HealthPoints.getEnd() <= 0) {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.total_defeat);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.total_defeat);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:total defeat"));
                                this.Label.Battle.Outcome.setShow("icon");
                            } else if (this.Label.Enemy.Overall.HealthPoints.getEnd() <= 0) {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.total_victory);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.total_victory);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:total victory"));
                                this.Label.Battle.Outcome.setShow("icon");
                            } else {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.victory);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.victory);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:victory"));
                                this.Label.Battle.Outcome.setShow("icon");
                            }
                        },
                        __updateBattleDuration: function (label, e) {
                            label.setValue(e.getData() > 0 ? webfrontend.phe.cnc.Util.getTimespanString(e.getData() / 1000) : "-:--");
                        },
                        __updateBattleOwnCity: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (ownCity !== null) this.Label.Battle.OwnCity.setValue(ownCity.get_Name());
                                else this.Label.Battle.OwnCity.resetValue();
                            } else this.Label.Battle.OwnCity.resetValue();
                        },
                        __updateBattleMoral: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["cityid"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.cityid),
                                    OwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (CurrentCity !== null && OwnCity !== null) {
                                    var MoralSignType = ClientLib.Base.Util.GetMoralSignType(OwnCity.get_LvlOffense(), CurrentCity.get_LvlBase()),
                                        moral = 100;
                                    if (ClientLib.Data.MainData.GetInstance().get_Server().get_CombatUseMoral() && CurrentCity.IsNPC() && CurrentCity.get_Id() != ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_CombatId() && (MoralSignType.k == 1 || MoralSignType.k == 2)) {
                                        moral = "~" + (moral - MoralSignType.v) + "%";
                                        if (MoralSignType.k == 1) {
                                            this.Label.Battle.Morale.setTextColor(webfrontend.theme.Color.colors["res-orange"]);
                                            this.Label.Battle.Morale.setToolTipText(this.tr("tnf:region moral warning %1", MoralSignType.v));
                                            this.Label.Battle.Morale.setToolTipIcon("resource/webfrontend/ui/common/icon_moral_alert_orange.png");
                                        } else if (MoralSignType.k == 2) {
                                            this.Label.Battle.Morale.setTextColor(webfrontend.theme.Color.colors["res-red"]);
                                            this.Label.Battle.Morale.setToolTipText(this.tr("tnf:region moral error %1", MoralSignType.v));
                                            this.Label.Battle.Morale.setToolTipIcon("resource/webfrontend/ui/common/icon_moral_alert_red.png");
                                        }
                                    } else {
                                        moral = moral + "%";
                                        this.Label.Battle.Morale.resetTextColor();
                                        this.Label.Battle.Morale.resetToolTipText();
                                        this.Label.Battle.Morale.resetToolTipIcon();
                                    }
                                    this.Label.Battle.Morale.setValue(moral);
                                } else {
                                    this.Label.Battle.Morale.setValue("-");
                                    this.Label.Battle.Morale.resetTextColor();
                                    this.Label.Battle.Morale.resetToolTipText();
                                    this.Label.Battle.Morale.resetToolTipIcon();
                                }
                            }
                        },
                        __onTick: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (ownCity !== null) {
                                    var RepairCharge = Math.min(
                                        ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf), ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh), ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir));
                                    this.Label.Repair.Storage.setValue(webfrontend.phe.cnc.Util.getTimespanString(ClientLib.Data.MainData.GetInstance().get_Time().GetTimeSpan(RepairCharge)));
                                } else this.Label.Repair.Storage.resetValue();
                            } else this.Label.Repair.Storage.resetValue();
                            if (this.StatsChanged) {
                                this.StatsChanged = false;
                                for (var i in this.Label.Enemy) {
                                    this.Label.Enemy[i].__update();
                                    //MOD Save Last Result for Simulation
                                    if (i == "Overall" && (v = this.Label.Enemy[i].getValue())) {
                                        TABS.GUI.ReportReplayOverlay.getInstance().LastSIM_R = parseFloat(v);
                                    }
                                }
                                for (i in this.Label.Repair) {
                                    this.Label.Repair[i].__update();
                                }
                                for (i in this.Label.Loot) {
                                    this.Label.Loot[i].__update();
                                }
                            }
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.SimView.Label", { //				Simulation View Label
                    extend: qx.ui.basic.Label,
                    include: [qx.locale.MTranslation],
                    construct: function (label) {
                        try {
                            this.base(arguments, label);
                            this.initAlignX("right");
                            this.initAlignY("middle");
                            this.initMinHeight(18);
                            this.setAlignX("right");
                            this.setAlignY("middle");
                            this.setMinHeight(18);
                            this.HealthPoints = new TABS.STATS.Entity.HealthPoints();
                            this.Resource = new TABS.STATS.Entity.Resource();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats.SimView.Label constructor", e);
                            console.groupEnd();
                        }
                    },
                    properties: {
                        type: {
                            init: "Enemy",
                            check: ["Enemy", "Repair", "Loot"]
                        },
                        subType: {
                            init: "HealthPointsAbs",
                            check: ["HealthPointsAbs", "HealthPointsRel", "RepairCharge", "RepairStorage", "Resource", "Tiberium", "Crystal", "Credits", "ResearchPoints"]
                        }
                    },
                    members: {
                        HealthPoints: null,
                        Resource: null,
                        __update: function () {
                            var value = null;
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null) {
                                switch (this.getType()) {
                                    case "Enemy":
                                        switch (this.getSubType()) {
                                            case "HealthPointsAbs":
                                                value = this.HealthPointsAbs();
                                                break;
                                            case "HealthPointsRel":
                                                value = this.HealthPointsRel();
                                                break;
                                            case "RepairCharge":
                                                value = this.RepairCharge();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    case "Repair":
                                        switch (this.getSubType()) {
                                            case "HealthPointsAbs":
                                                value = this.HealthPointsAbs();
                                                break;
                                            case "HealthPointsRel":
                                                value = this.HealthPointsRel();
                                                break;
                                            case "RepairCharge":
                                            case "RepairChargeInf":
                                            case "RepairChargeVeh":
                                            case "RepairChargeAir":
                                                value = this.RepairCharge();
                                                break;
                                            case "RepairStorage":
                                                return;
                                            case "Resource":
                                                value = this.RepairCharge();
                                                break;
                                            case "RepairStorage":
                                                return;
                                            case "Crystal":
                                                value = this.Loot();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    case "Loot":
                                        switch (this.getSubType()) {
                                            case "Resource":
                                            case "Tiberium":
                                            case "Crystal":
                                            case "Credits":
                                            case "ResearchPoints":
                                                value = this.Loot();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (this.HealthPoints.getMax() > 0 && value !== null) {
                                this.setValue(value.text);
                                this.setTextColor(value.color);
                            } else {
                                this.resetValue();
                                this.resetTextColor();
                            }
                        },
                        HealthPointsAbs: function () {
                            if (this.HealthPoints.getMax() > 0) {
                                var percent = (this.HealthPoints.getEnd() / this.HealthPoints.getMax()) * 100,
                                    digits = (percent <= 0 || percent >= 100 ? 0 : (percent >= 10 ? 1 : 2));
                                percent = Math.round(percent * Math.pow(10, digits)) / Math.pow(10, digits);
                                return {
                                    text: percent.toFixed(digits) + " %",
                                    color: this.getColorFromPercent(this.HealthPoints.getEnd() / this.HealthPoints.getMax())
                                };
                            }
                            return null;
                        },
                        HealthPointsRel: function () {
                            if (this.HealthPoints.getMax() > 0) {
                                var percent = ((this.HealthPoints.getStart() - this.HealthPoints.getEnd()) / this.HealthPoints.getMax()) * 100,
                                    digits = (percent <= 0 || percent >= 100 ? 0 : (percent >= 10 ? 1 : 2));
                                percent = Math.round(percent * Math.pow(10, digits)) / Math.pow(10, digits);
                                return {
                                    text: percent.toFixed(digits) + " %",
                                    color: this.getColorFromPercent(this.HealthPoints.getEnd() / this.HealthPoints.getMax())
                                };
                            }
                            return null;
                        },
                        RepairCharge: function () {
                            if (this.getSubType() == "Resource") {
                                res = 0;
                                res = this.Resource.getCrystal();
                                return {
                                    text: webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(res),
                                    color: this.getColorFromPercent(1)
                                };
                            } else {
                                res = 0;
                                if (this.HealthPoints.getMax() > 0) {
                                    switch (this.getSubType()) {
                                        case "RepairChargeInf":
                                            res = this.Resource.getRepairChargeInf();
                                            break;
                                        case "RepairChargeVeh":
                                            res = this.Resource.getRepairChargeVeh();
                                            break;
                                        case "RepairChargeAir":
                                            res = this.Resource.getRepairChargeAir();
                                            break;
                                        case "RepairCharge":
                                            res = Math.max(this.Resource.getRepairChargeBase(), this.Resource.getRepairChargeAir(), this.Resource.getRepairChargeInf(), this.Resource.getRepairChargeVeh());
                                            break;
                                    }
                                    return {
                                        text: webfrontend.phe.cnc.Util.getTimespanString(res),
                                        color: this.getColorFromPercent(1 - (this.HealthPoints.getEnd() / this.HealthPoints.getMax()))
                                    };
                                }
                            }
                            return null;
                        },
                        Loot: function () {
                            var res = 0,
                                lootFromCurrentCity = TABS.UTIL.Stats.get_LootFromCurrentCity(),
                                loot;
                            if (this.HealthPoints.getMax() > 0 && lootFromCurrentCity !== null) {
                                switch (this.getSubType()) {
                                    case "Resource":
                                        res = this.Resource.getTiberium() + this.Resource.getCrystal() + this.Resource.getCredits() + this.Resource.getResearchPoints();
                                        loot = lootFromCurrentCity.getTiberium() + lootFromCurrentCity.getCrystal() + lootFromCurrentCity.getCredits() + lootFromCurrentCity.getResearchPoints();
                                        break;
                                    case "Tiberium":
                                        res = this.Resource.getTiberium();
                                        loot = lootFromCurrentCity.getTiberium();
                                        break;
                                    case "Crystal":
                                        res = this.Resource.getCrystal();
                                        loot = lootFromCurrentCity.getCrystal();
                                        break;
                                    case "Credits":
                                        res = this.Resource.getCredits();
                                        loot = lootFromCurrentCity.getCredits();
                                        break;
                                    case "ResearchPoints":
                                        res = this.Resource.getResearchPoints();
                                        loot = lootFromCurrentCity.getResearchPoints();
                                        break;
                                }
                                return {
                                    text: webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(res),
                                    color: this.getColorFromPercent(1 - (res / loot))
                                };
                            }
                            return null;
                        },
                        getColorFromPercent: function (value) { // 1 = red, 0.5 = yellow, 0 = green
                            return "hsl(" + ((120 - ((100 - ((1 - value) * 100)) * 1.2)) - 0) + ", 100%, " + (25 + Math.round(((Math.abs(Math.max(value - 0.4, 0)) * 2) + (Math.abs(Math.max((1 - value) - 0.6, 0)))) * 25)) + "%)";
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Prios", { // [singleton]	Prios Window
                    extend: qx.ui.window.Window,
                    construct: function (prios) {
                        try {
                            this.base(arguments);
                            this.set({
                                layout: new qx.ui.layout.Grid(),
                                caption: this.tr("Priority Setup"),
                                allowMaximize: false,
                                showMaximize: false,
                                allowMinimize: false,
                                showMinimize: false,
                                resizable: false
                            });
                            this.center();
                            this.Prios = prios;
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Prios constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        Prios: null
                    }
                });
            }

            function translation() {
                var localeManager = qx.locale.Manager.getInstance();
                // Default language is english (en)
                // Available Languages are: ar,ce,cs,da,de,en,es,fi,fr,hu,id,it,nb,nl,pl,pt,ro,ru,sk,sv,ta,tr,uk
                // You can send me translations so I can include them in the Script.
                // German
                localeManager.addTranslation("de", {
                    "Shifts units one space up.": "Verschiebt Einheiten einen Platz nach oben.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space down.": "Verschiebt die Einheiten einen Platz nach unten.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space left.": "Verschiebt die Einheiten einen Platz nach links.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space right.": "Verschiebt die Einheiten einen Platz nach rechts.",
                    //GUI.ArmySetupAttackBar
                    "Mirrors units horizontally.": "Spiegelt die Einheiten horizontal.",
                    //GUI.ArmySetupAttackBar
                    "Mirrors units vertically.": "Spiegelt die Einheiten vertikal.",
                    //GUI.ArmySetupAttackBar
                    "View Simulation": "Simulation anzeigen",
                    //GUI.PlayArea + GUI.Window.Stats.SimView
                    "Statistic": "Statistik",
                    //GUI.PlayArea + GUI.Window.Stats
                    "Show current formation with CNCTAOpt": "Zeigt die aktuelle Formation mit CNCTAOpt an",
                    //GUI.PlayArea
                    "Right click: Set formation from CNCTAOpt Long Link": "Rechtsklick: Formation von CNCTAOpt Long Link laden",
                    //GUI.PlayArea
                    "Remember transported units are not supported.": "Denk daran das transportierte Einheiten nicht unterstützt werden.",
                    //GUI.PlayArea
                    "Enter CNCTAOpt Long Link:": "CNCTAOpt Long Link eingeben:",
                    //GUI.PlayArea
                    "simulations in cache": "Simulationen im Cache",
                    //GUI.Window.Stats
                    "Most priority to construction yard including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf dem Bauhof mit allem was vor ihm liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden am Gegner verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to defense facility including all in front of it.<br>After this the best armored defense health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf der Verteidigungseinrichtung mit allem was vor ihr liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden an bewaffneten Defensiveinheiten verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to defense health including the auto repair after the battle.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf dem verursachtem Schaden an Defensiveinheiten<br>unter Berücksichtigung der automatischen Reperatur nach dem Kampf.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to command center including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf der Komandozentrale mit allem was vor ihr liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden am Gegner verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "NoKill (farming) priorety.<br>Not working correctly yet.": "Vorschießen (farmen) Priorität.<br>Funktioniert noch nicht sehr gut.",
                    //STATS
                    "Shows the current army formation.": "Zeigt die aktuelle Armeeformation an." //STATS
                });
            }

            function waitForGame() {
                try {
                    if (typeof qx != 'undefined' && typeof qx.core != 'undfined' && typeof qx.core.Init != 'undefined') {
                        var app = qx.core.Init.getApplication();
                        if (app !== null && app.initDone === true && ClientLib.Data.MainData.GetInstance().get_Player().get_Id() !== 0 && ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() !== 0) {
                            try {
                                console.time("loaded in");
                                // replacing LoadCombatDirect
                                if (ClientLib.Vis.Battleground.Battleground.prototype.LoadCombatDirect === undefined) {
                                    var sBString = ClientLib.API.Battleground.prototype.SimulateBattle.toString();
                                    //MOD 22.3-1
                                    var targetMethod = sBString.match(/\{battleSetup:[a-z]+\},\s?\(new \$I\.[A-Z]{6}\)\.[A-Z]{6}\(this,this\.([A-Z]{6})\),\s?this\)/)[1];
                                    var lCString = ClientLib.API.Battleground.prototype[targetMethod].toString();
                                    //MOD 22.3-2
                                    var methodLoadDirect = lCString.match(/\$I\.[A-Z]{6}\.[A-Z]{6}\(\)\.[A-Z]{6}\(\)\.([A-Z]{6})\([a-z]\.d\)/)[1];
                                    console.log(methodLoadDirect);
                                    ClientLib.Vis.Battleground.Battleground.prototype.LoadCombatDirect = ClientLib.Vis.Battleground.Battleground.prototype[methodLoadDirect];
                                }
                                translation();
                                createClasses();
                                TABS.getInstance();
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.timeEnd("loaded in");
                                console.groupEnd();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in waitForGame", e);
                                console.groupEnd();
                            }
                        } else {
                            window.setTimeout(waitForGame, 1000);
                        }
                    } else {
                        window.setTimeout(waitForGame, 1000);
                    }
                } catch (e) {
                    console.group("Tiberium Alliances Battle Simulator V2");
                    console.error("Error in waitForGame", e);
                    console.groupEnd();
                }
            }
            window.setTimeout(waitForGame, 1000);
        }.toString() + ")();";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
})();`

    function startTACS() { injectOriginalSimulator(TACS_ORIGINAL_SOURCE, "TACS"); }
    function startTABS() { injectOriginalSimulator(TABS_ORIGINAL_SOURCE, "TABS V2"); }

    function startSelectedSimulator() {
        var activeSimulator = GM_getValue("HCTAT_ActiveSimulator_080", "TACS");
        console.log("Kampfsimulator HE 0.8.0: Aktiver Simulator =", activeSimulator);
        if (activeSimulator === "TABS") startTABS();
        else startTACS();
    }

    function openSimulatorWindow() {

        try {

            var activeSimulator = GM_getValue(
                "HCTAT_ActiveSimulator_080",
                "TACS"
            );

            var activeSimulatorName =
                activeSimulator === "TABS" ? "TABS V2" : "TACS";

            if (SimulatorAuswahlWindow) {

                SimulatorAuswahlWindow.setCaption(
                    "KAMPFSIMULATOR - " + activeSimulatorName + " Aktiv"
                );

                SimulatorAuswahlWindow.open();
                SimulatorAuswahlWindow.activate();

                return;
            }

            var win = new qx.ui.window.Window(
                "KAMPFSIMULATOR - " + activeSimulatorName + " Aktiv"
            );

            SimulatorAuswahlWindow = win;

            win.setWidth(380);
            win.setHeight(220);

            win.setShowMinimize(false);
            win.setShowMaximize(false);
            win.setShowClose(true);
            win.setAllowClose(true);

            win.setLayout(
                new qx.ui.layout.VBox()
            );


            var main = new qx.ui.container.Composite(
                new qx.ui.layout.Canvas()
            );

            main.setBackgroundColor(
                "#050A08"
            );


            if (
                BACKGROUND_IMAGE_URL &&
                BACKGROUND_IMAGE_URL.indexOf(
                    "HIER_DIE"
                ) !== 0
            ) {

                var background =
                    new qx.ui.basic.Image(
                        BACKGROUND_IMAGE_URL
                    );

                background.setScale(true);
                background.setWidth(580);
                background.setHeight(420);

                main.add(
                    background,
                    {
                        left: 0,
                        top: 0
                    }
                );
            }


            var activeLabel =
                new qx.ui.basic.Label(
                    activeSimulatorName + " Aktiv"
                );

            activeLabel.setTextColor(
                "#00FF00"
            );

            main.add(
                activeLabel,
                {
                    left: 15,
                    top: 10
                }
            );


            var overlay =
                new qx.ui.container.Composite(
                    new qx.ui.layout.Canvas()
                );

            overlay.setBackgroundColor(
                "transparent"
            );


            // TACS

            var tacsArea =
                new qx.ui.form.Button();

            tacsArea.setWidth(165);
            tacsArea.setHeight(190);
            tacsArea.setOpacity(0);

            tacsArea.addListener(
                "execute",
                function () {

                    console.log(
                        "Kampfsimulator HE: TACS ausgewählt."
                    );

                    GM_setValue(
                        "HCTAT_ActiveSimulator_080",
                        "TACS"
                    );

                    SimulatorAuswahlWindow.close();

                    location.reload();
                }
            );

            overlay.add(
                tacsArea,
                {
                    left: 135,
                    top: 185
                }
            );


            // TABS V2

            var tabsArea =
                new qx.ui.form.Button();

            tabsArea.setWidth(145);
            tabsArea.setHeight(175);
            tabsArea.setOpacity(0);

            tabsArea.addListener(
                "execute",
                function () {

                    console.log(
                        "Kampfsimulator HE: TABS V2 ausgewählt."
                    );

                    GM_setValue(
                        "HCTAT_ActiveSimulator_080",
                        "TABS"
                    );

                    SimulatorAuswahlWindow.close();

                    location.reload();
                }
            );

            overlay.add(
                tabsArea,
                {
                    left: 310,
                    top: 185
                }
            );


            main.add(
                overlay,
                {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0
                }
            );


            win.add(main);


            var desktop =
                qx.core.Init.getApplication().getDesktop();

            desktop.add(win);

            win.center();
            win.open();
            win.activate();

            console.log(
                "Kampfsimulator HE 0.6.3: Auswahlfenster geöffnet."
            );

        } catch (e) {

            console.error(
                "Kampfsimulator HE 0.6.3: Fehler beim Öffnen des Fensters:",
                e
            );
        }
    }


    function addMenuEntry() {

        try {

            var app =
                qx.core.Init.getApplication();

            var scriptsButton =
                app &&
                app.getMenuBar &&
                app.getMenuBar().getScriptsButton();

            if (!scriptsButton) {

                setTimeout(
                    addMenuEntry,
                    1000
                );

                return;
            }

            var menu =
                scriptsButton.getMenu();

            if (!menu) {
                setTimeout(
                    addMenuEntry,
                    1000
                );
                return;
            }

            var activeSimulator = GM_getValue(
                "HCTAT_ActiveSimulator_080",
                "TACS"
            );

            var activeSimulatorName =
                activeSimulator === "TABS" ? "TABS V2" : "TACS";

            var menuLabel =
                "Kampfsimulator (" + activeSimulatorName + ")";

            var children =
                menu.getChildren();

            for (var i = 0; i < children.length; i++) {

                try {

                    if (
                        children[i].getLabel &&
                        children[i].getLabel() ===
                        menuLabel
                    ) {
                        return;
                    }

                } catch (e) {}
            }

            // Den nativen C&C-TA-ScriptsButton verwenden.
            // Dadurch wird der Scripts-Menüpunkt bei Bedarf vom Spiel
            // selbst korrekt initialisiert.
            scriptsButton.Add(
                menuLabel
            );

            var menuItem =
                scriptsButton
                    .getMenu()
                    .getChildren()
                    .find(
                        function (item) {
                            return item.getLabel &&
                                   item.getLabel() === menuLabel;
                        }
                    );

            if (!menuItem) {
                console.error(
                    "Kampfsimulator HE: Nativer Menüeintrag konnte nicht ermittelt werden."
                );
                return;
            }

            menuItem.addListener(
                "execute",
                openSimulatorWindow
            );

            console.log(
                "Kampfsimulator HE: Menüeintrag hinzugefügt."
            );

        } catch (e) {

            console.error(
                "Kampfsimulator HE: Fehler beim Hinzufügen des Menüeintrags:",
                e
            );
        }
    }


    function waitForGame() {

        try {

            if (
                typeof qx !== "undefined" &&
                qx.core &&
                qx.core.Init &&
                qx.core.Init.getApplication()
            ) {

                console.log(
                    "Kampfsimulator HE 0.8.0: Spiel bereit."
                );

                addMenuEntry();
                startSelectedSimulator();
                return;
            }

        } catch (e) {}

        setTimeout(
            waitForGame,
            1000
        );
    }


    console.log(
        "Kampfsimulator HE 0.8.0 - 3. Integrationstest STARTDIAGNOSE"
    );

    // Maximal 5 Sekunden bis zur ersten Bereitschaftsprüfung.
    setTimeout(
        waitForGame,
        5000
    );

})();
