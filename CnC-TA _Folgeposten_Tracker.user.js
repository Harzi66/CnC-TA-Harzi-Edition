// ==UserScript==
// @name               CnC-TA Folgeposten Tracker
// @namespace          Harzi
// @version            0.1.2
// @description        Markiert die 10 neuesten Folgeposten/Camps auf der Weltkarte.
// @author             Harzi
// @original-author    leo7044
// @original-source    https://github.com/leo7044/CnC_TA
// @contributor        Harzi – Anpassung und Weiterentwicklung
// @match              https://*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL        https://raw.githubusercontent.com/Harzi66/CnC-TA-Folgeposten-Tracker/main/CnC-TA_Folgeposten_Tracker.user.js
// @updateURL          https://raw.githubusercontent.com/Harzi66/CnC-TA-Folgeposten-Tracker/main/CnC-TA_Folgeposten_Tracker.user.js
// @grant              none
// ==/UserScript==

(function () {
    'use strict';

    // ------------------------------------------------------------
    // Patch für WorldObjectNPCCamp
    // Ermittelt die obfuskierten Felder für CampType, ID und Level
    // ------------------------------------------------------------

    function patchNPCCamp() {

        const NPCCamp =
              ClientLib.Data.WorldSector.WorldObjectNPCCamp;

        if (!NPCCamp || !NPCCamp.prototype) {
            console.error(
                '[Folgeposten Tracker] WorldObjectNPCCamp nicht gefunden'
            );
            return false;
        }

        const ctor =
              NPCCamp.prototype.$ctor;

        if (typeof ctor !== 'function') {
            console.error(
                '[Folgeposten Tracker] $ctor von WorldObjectNPCCamp nicht gefunden'
            );
            return false;
        }

        const source =
              ctor.toString();

        const campTypeMatch =
              source.match(
                  /this\.([A-Z]{6})=\(*[a-z]\>\>(22|0x16)\)?/
              );

        const idMatch =
              source.match(
                  /\&.*=-1[,;]\}?this\.([A-Z]{6})=\(/
              );

        const levelMatch =
              source.match(
                  /\.*this\.([A-Z]{6})=\(\(?\(?[a-z]>>4/
              );

        if (
            !campTypeMatch ||
            !idMatch ||
            !levelMatch
        ) {
            console.error(
                '[Folgeposten Tracker] NPCCamp-Felder konnten nicht ermittelt werden',
                {
                    campTypeMatch,
                    idMatch,
                    levelMatch
                }
            );

            return false;
        }

        const campTypeField =
              campTypeMatch[1];

        const idField =
              idMatch[1];

        const levelField =
              levelMatch[1];

        Object.defineProperty(
            NPCCamp.prototype,
            '$CampType',
            {
                configurable: true,

                get: function () {
                    return this[campTypeField];
                }
            }
        );

        Object.defineProperty(
            NPCCamp.prototype,
            '$Id',
            {
                configurable: true,

                get: function () {
                    return this[idField];
                }
            }
        );

        Object.defineProperty(
            NPCCamp.prototype,
            '$Level',
            {
                configurable: true,

                get: function () {
                    return this[levelField];
                }
            }
        );

        return true;
    }

    console.log('[Folgeposten Tracker] Script geladen');

    // ------------------------------------------------------------
    // Einstellungen
    // ------------------------------------------------------------

    const SETTINGS = {
        count: 10,
        size: 24,
        fontSize: 20,
        font: 'Iosevka Term',

        // Wie im Original:
        // Camps maximal eine Stufe unter der Hauptbasis zulassen.
        offenseDifference: -1
    };

    // ------------------------------------------------------------
    // Hilfsfunktionen
    // ------------------------------------------------------------

    function waitForGameReady(callback) {
        const check = () => {
            try {
                if (
                    typeof ClientLib === 'undefined' ||
                    !ClientLib.Data ||
                    !ClientLib.Vis ||
                    !ClientLib.Vis.VisMain
                ) {
                    setTimeout(check, 500);
                    return;
                }

                const md = ClientLib.Data.MainData.GetInstance();
                const visMain = ClientLib.Vis.VisMain.GetInstance();

                if (
                    !md ||
                    !visMain ||
                    !visMain.get_Region()
                ) {
                    setTimeout(check, 500);
                    return;
                }

                callback();

            } catch (e) {
                setTimeout(check, 500);
            }
        };

        check();
    }

    function packLocation(x, y) {
        // Gleiche 16/16-Bit-Darstellung wie BaseLocationPacker
        return (x | (y << 16)) >>> 0;
    }


    function unpackLocation(value) {
        return {
            x: value & 0xffff,
            y: (value >>> 16) & 0xffff
        };
    }


    function distance(x1, y1, x2, y2) {
        const dx = x1 - x2;
        const dy = y1 - y2;

        return Math.sqrt(dx * dx + dy * dy);
    }


    // ------------------------------------------------------------
    // Folgeposten Tracker
    // ------------------------------------------------------------

    class FollowPostTracker {

        constructor() {
            this.markers = new Map();
            this.lastUpdatedStep = null;
            this.updatePending = false;
            this.lastSelectedCityId = null;

            this.firstUpdate = true;
        }


        start() {


            const md = ClientLib.Data.MainData.GetInstance();
            const visMain = ClientLib.Vis.VisMain.GetInstance();
            const region = visMain.get_Region();

            // Weltkarte bewegt / Zoom verändert
            // Erste Prüfung sofort
            this.update();

            // Danach regelmäßig nach neuen Folgeposten suchen
            this.updateTimer = setInterval(() => {
                this.update();
            }, 2500);

            // Position der vorhandenen Marker regelmäßig aktualisieren (Zeitinterval)
            this.positionTimer = setInterval(() => {
                this.updatePosition();
            }, 250);



        }


        // --------------------------------------------------------
        // Bezugsbasis bestimmen
        // --------------------------------------------------------

        getSelectedCity() {

            const cities =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_Cities();

            if (!cities ||
                typeof cities.get_CurrentOwnCity !== 'function') {
                return null;
            }

            const selectedCity =
                  cities.get_CurrentOwnCity();

            if (selectedCity == null) {
                return null;
            }

            // Nur eigene Basen mit einer gültigen Offensivstufe verwenden
            if (typeof selectedCity.get_LvlOffense !== 'function') {
                return null;
            }

            return selectedCity;
        }


        // --------------------------------------------------------
        // Folgeposten suchen
        // --------------------------------------------------------

        getNearbyCamps(selectedCity) {

            const result = [];

            const cityX = selectedCity.get_PosX();
            const cityY = selectedCity.get_PosY();

            const maxDistance =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_Server()
            .get_MaxAttackDistance();

            const world =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_World();

            const minimumLevel =
                  selectedCity.get_LvlOffense() +
                  SETTINGS.offenseDifference;

            const minX = Math.floor(cityX - maxDistance);
            const maxX = Math.ceil(cityX + maxDistance);

            const minY = Math.floor(cityY - maxDistance);
            const maxY = Math.ceil(cityY + maxDistance);


            for (let y = minY; y < maxY; y++) {

                for (let x = minX; x < maxX; x++) {

                    const dist = distance(
                        cityX,
                        cityY,
                        x,
                        y
                    );

                    if (dist >= maxDistance) {
                        continue;
                    }


                    const object =
                          world.GetObjectFromPosition(x, y);

                    if (object == null) {
                        continue;
                    }


                    // Folgeposten/Vorposten über die vom Spiel gesetzten
                    // Camp-Eigenschaften erkennen
                    if (typeof object.$CampType === 'undefined') {
                        continue;
                    }

                    // 0 = zerstört / kein aktiver Folgeposten
                    if (object.$CampType === 0) {
                        continue;
                    }


                    // 0 = zerstört
                    if (object.get_CampType &&
                        object.get_CampType() === 0) {
                        continue;
                    }


                    let level = null;

                    if (typeof object.get_Level === 'function') {
                        level = object.get_Level();
                    }


                    // Falls die normale ClientLib keinen Getter
                    // besitzt, versuchen wir die Eigenschaft.
                    if (
                        level === null &&
                        typeof object.$Level !== 'undefined'
                    ) {
                        level = object.$Level;
                    }


                    if (
                        level !== null &&
                        level < minimumLevel
                    ) {
                        continue;
                    }


                    let id = null;

                    if (typeof object.get_Id === 'function') {
                        id = object.get_Id();
                    }

                    if (
                        id === null &&
                        typeof object.$Id !== 'undefined'
                    ) {
                        id = object.$Id;
                    }


                    if (id === null) {
                        continue;
                    }


                    result.push({
                        id: id,
                        object: object,
                        x: x,
                        y: y,
                        level: level,
                        distance: dist
                    });
                }
            }

            return result;
        }


        // --------------------------------------------------------
        // Aktualisierung
        // --------------------------------------------------------

        update() {

            if (this.updatePending) {
                return;
            }

            const time =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_Time();

            const serverStep =
                  time.GetServerStep();

            const selectedCity =
                  this.getSelectedCity();

            if (selectedCity == null) {
                return;
            }

            const selectedCityId =
                  typeof selectedCity.get_Id === 'function'
            ? selectedCity.get_Id()
            : null;

            const cityChanged =
                  selectedCityId !== this.lastSelectedCityId;

            if (
                serverStep === this.lastUpdatedStep &&
                !cityChanged
            ) {
                return;
            }

            this.lastUpdatedStep = serverStep;
            this.lastSelectedCityId = selectedCityId;

            // Bei einem Wechsel der eigenen Off
            // die Chatmeldung für die neue Umgebung neu beginnen.
            if (cityChanged) {
                this.firstUpdate = true;
            }

            this.updatePending = true;


            requestAnimationFrame(() => {

                this.updatePending = false;

                this.doUpdate();

            });
        }


        doUpdate() {

            const selectedCity = this.getSelectedCity();

            if (selectedCity == null) {
                return;
            }


            let camps =
                this.getNearbyCamps(selectedCity);


            // Genau wie im Original:
            // höchste ID = neuester Folgeposten
            camps.sort((a, b) => b.id - a.id);


            camps =
                camps.slice(0, SETTINGS.count);


            const existing =
                  new Set(this.markers.keys());

            // --------------------------------------------------------
            // Chatmeldung
            // Beim ersten Start nur die aktuelle Nr. 1 melden.
            // Danach nur einen tatsächlich neuen Folgeposten melden.
            // --------------------------------------------------------

            if (camps.length > 0) {

                let chatCamp = null;

                // Beim ersten Laden nur die aktuelle Nr. 1
                if (this.firstUpdate) {

                    chatCamp = camps[0];

                } else {

                    // Danach nur neue Objekte prüfen
                    const newestCamp = camps[0];

                    if (!this.markers.has(newestCamp.id)) {
                        chatCamp = newestCamp;
                    }
                }

                if (chatCamp) {

                    const campType =
                          chatCamp.object.$CampType;

                    const campName =
                          campType === 2
                    ? 'Lager'
                    : 'Vorposten';

                    const level =
                          chatCamp.level != null
                    ? chatCamp.level
                    : '?';

                    const levelColor = campName === 'Lager'
                    ? '#FFD700'
                    : '#00FF00';

                    const highlightedLevel =
                          `<a style="color:${levelColor}; font-weight:bold; cursor:pointer;" ` +
                          `onClick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(${chatCamp.x}, ${chatCamp.y});">` +
                          `${level}</a>`;

                    const message =
                          campName === 'Lager'
                    ? `Neues Lager Level ${highlightedLevel}`
        : `Neuer Vorposten Level ${highlightedLevel}`;

                    qx.core.Init
                        .getApplication()
                        .getChat()
                        .getChatWidget()
                        .showMessage(
                        message,
                        webfrontend.gui.chat.ChatWidget.sender.system,
                        31
                    );
                }
            }

            camps.forEach((camp, index) => {

                const oldMarker =
                      this.markers.get(camp.id);


                if (oldMarker != null) {

                    oldMarker.index = index;

                    existing.delete(camp.id);

                    return;
                }


                // Neuer Marker
                this.addMarker(
                    camp.id,
                    {
                        x: camp.x,
                        y: camp.y
                    },
                    index
                );


            });


            // Marker entfernen, die nicht mehr zu
            // den aktuellen 10 gehören.
            for (const id of existing) {
                this.destroy(id);
            }


            this.updatePosition();


            this.firstUpdate = false;


        }


        // --------------------------------------------------------
        // Marker erstellen
        // --------------------------------------------------------

        addMarker(id, location, index) {

            const element =
                  document.createElement('div');


            element.className =
                'harzi-followpost-marker';


            this.updateStyle(element);


            this.markers.set(id, {
                el: element,
                location: location,
                index: index
            });


            this.updateElement(
                element,
                location,
                index
            );


            this.addMarkerToDom(element);
        }


        // --------------------------------------------------------
        // Marker positionieren
        // --------------------------------------------------------

        updateElement(element, location, index) {

            const visMain =
                  ClientLib.Vis.VisMain.GetInstance();

            const region =
                  visMain.get_Region();


            const gridWidth =
                  region.get_GridWidth();

            const gridHeight =
                  region.get_GridHeight();


            const top =
                  visMain.ScreenPosFromWorldPosY(
                      (location.y + 0.1) * gridHeight
                  );


            const left =
                  visMain.ScreenPosFromWorldPosX(
                      (location.x + 0.1) * gridWidth
                  );


            const bottom =
                  region.get_ViewHeight();

            const right =
                  region.get_ViewWidth();


            // Außerhalb der sichtbaren Karte
            if (
                top < 0 ||
                left < 0 ||
                top > bottom ||
                left > right
            ) {
                element.remove();
                return;
            }


            element.style.top =
                top + 'px';

            element.style.left =
                left + 'px';


            if (
                element.getAttribute('data-index') !==
                String(index)
            ) {

                element.innerHTML =
                    '#' + (index + 1);


                // Original:
                // #1 - #3 grün
                // #4 - #10 gelb/grün
                if (index < 3) {

                    element.style.backgroundColor =
                        'rgba(0,240,0,0.9)';

                } else {

                    element.style.backgroundColor =
                        'rgba(200,240,0,0.9)';
                }


                element.setAttribute(
                    'data-index',
                    String(index)
                );
            }


            if (element.parentElement == null) {
                this.addMarkerToDom(element);
            }
        }


        // --------------------------------------------------------
        // Marker-Stil
        // --------------------------------------------------------

        updateStyle(element) {

            element.style.position =
                'absolute';

            element.style.pointerEvents =
                'none';

            element.style.fontFamily =
                SETTINGS.font;

            element.style.fontWeight =
                'bold';

            element.style.fontSize =
                SETTINGS.fontSize + 'px';

            element.style.zIndex =
                '10';

            element.style.borderRadius =
                '50%';


            element.style.width =
                SETTINGS.size + 'px';

            element.style.height =
                SETTINGS.size + 'px';

            element.style.padding =
                '2px';

            element.style.display =
                'flex';

            element.style.justifyContent =
                'center';

            element.style.alignItems =
                'center';

            element.style.border =
                '2px solid rgba(0,0,0,0.87)';
        }


        // --------------------------------------------------------
        // Marker ins Karten-DOM
        // --------------------------------------------------------

        addMarkerToDom(element) {

            const canvas =
                  document.querySelector('canvas');

            if (
                canvas &&
                canvas.parentElement
            ) {
                canvas.parentElement.appendChild(
                    element
                );
            }
        }


        // --------------------------------------------------------
        // Marker löschen
        // --------------------------------------------------------

        destroy(id) {

            const marker =
                  this.markers.get(id);

            if (marker == null) {
                return;
            }


            marker.el.remove();

            this.markers.delete(id);
        }


        // --------------------------------------------------------
        // Alle Marker neu positionieren
        // --------------------------------------------------------

        updatePosition() {

            this.markers.forEach(
                ({ el, location, index }) => {

                    this.updateElement(
                        el,
                        location,
                        index
                    );
                }
            );
        }
    }


    // ------------------------------------------------------------
    // Start
    // ------------------------------------------------------------

    waitForGameReady(() => {

        try {

            if (!patchNPCCamp()) {
                console.error(
                    '[Folgeposten Tracker] Start abgebrochen – NPCCamp Patch fehlgeschlagen'
                );
                return;
            }

            const tracker =
                  new FollowPostTracker();

            tracker.start();

            window.harziFollowPostTracker =
                tracker;

        } catch (error) {

            console.error(
                '[Folgeposten Tracker] Fehler:',
                error
            );
        }

    });

})();
