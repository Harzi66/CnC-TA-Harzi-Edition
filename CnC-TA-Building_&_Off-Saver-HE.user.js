// ==UserScript==
// @name           CnC-TA-Building_&_Off-Saver - HE
// @namespace      https://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @version        1.2.8
// @description    Speichert und lädt Gebäudeaufstellungen und Off-Formationen
// @author         Harzi
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Building_%26_Off-Saver%20-%20HE.user.js
// @updateURL      https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Building_%26_Off-Saver%20-%20HE.user.js
// ==/UserScript==

(function () {

    // ============================================================
    // TEST6 – Gebäudetyp-Klassifizierung + Sondergebäude-Parklogik
    // ============================================================
    window.HARZI_BUILDING_OFF_SAVER_TEST6 = true;
    console.log(
        "%cBUILDING-OFF-SAVER HE TEST6 – SCRIPT GELADEN",
        "color: lime; font-weight: bold; font-size: 14px;"
    );

    var buildingSaverContainer = null;
    var buildingButton = null;
    var buildingModeTimer = null;
    var offSaverContainer = null;
    var offButton = null;
    var offFormationContainer = null;
    var offFormationCityId = null;
    var buildingLayoutInput = null;
    var buildingLayoutList = null;
    var buildingLayoutSaveButton = null;
    var buildingLayoutCloseButton = null;


    // ============================================================
    // Gebäudetyp bestimmen
    // ============================================================

    /*
     * NORMAL = Kraftwerk, Silo, Akkumulator, Raffinerie, Sammler
     * SPECIAL = alles andere
     */
    function getBuildingType(building) {
        var name = "";

        try {
            name = building.get_UnitGameData_Obj().dn || "";
        } catch (e) {}

        if (
            name === "Kraftwerk" ||
            name === "Silo" ||
            name === "Akkumulator" ||
            name === "Raffinerie" ||
            name === "Sammler"
        ) {
            return "NORMAL";
        }

        return "SPECIAL";
    }

    // Für alte gespeicherte Layouts ohne type-Feld wird der Typ immer
    // aus dem aktuell vorhandenen Runtime-Gebäude abgeleitet.
    function getSavedBuildingType(saved, runtimeBuilding) {
        if (saved && (saved.type === "NORMAL" || saved.type === "SPECIAL")) {
            return saved.type;
        }

        return runtimeBuilding ? getBuildingType(runtimeBuilding) : "SPECIAL";
    }

    // C&C-TA behandelt direkt angrenzende Sondergebäude als ungültige
    // Belegung. Wir prüfen alle 8 Nachbarfelder.
    function isDirectlyAdjacent(x1, y1, x2, y2) {
        return (
            Math.abs(x1 - x2) <= 1 &&
            Math.abs(y1 - y2) <= 1 &&
            (x1 !== x2 || y1 !== y2)
        );
    }


    // ============================================================
    // Aktuelle Gebäude auslesen
    // ============================================================

    function getCurrentBuildings() {

        var city =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        if (!city) {
            return [];
        }

        var buildings = city.get_Buildings();
        var result = [];

        for (var id in buildings.d) {

            var building = buildings.d[id];

            result.push({
                id: building.get_Id(),
                name: building.get_UnitGameData_Obj().dn,
                type: getBuildingType(building),
                x: building.get_CoordX(),
                y: building.get_CoordY()
            });
        }

        return result;
    }


    // ============================================================
    // Gebäude speichern
    // ============================================================

    function saveBuildingLayout(layoutName) {

        var city =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        if (!city) {
            return false;
        }

        var ownCityId = city.get_Id();

        var buildings = getCurrentBuildings();

        var layouts = localStorage.harziBuildingLayouts;

        layouts = layouts ? JSON.parse(layouts) : {};

        if (!layouts[ownCityId]) {
            layouts[ownCityId] = {};
        }

        if (layouts[ownCityId][layoutName]) {

            alert("Der Layoutname ist bereits vergeben.");

            return false;
        }

        layouts[ownCityId][layoutName] = {
            t: new Date().getTime(),
            buildings: buildings
        };

        localStorage.harziBuildingLayouts =
            JSON.stringify(layouts);

        return true;
    }


    // ============================================================
    // Off Formation speichern
    // ============================================================

    function saveOffFormation(layoutName) {

        var cities =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities();

        var currentOwnCity =
            cities.get_CurrentOwnCity();

        var ownCityId =
            currentOwnCity.get_Id();

        var currentCity =
            cities.get_CurrentCity();

        if (!currentCity) {
            console.log(
                "%cFORMATION: Kein aktuelles Ziel gefunden.",
                "color: orange; font-weight: bold;"
            );
            return;
        }

        var cityID =
            currentCity.get_Id();

        // Formationen werden AUSSCHLIESSLICH in der eigenen Basis
        // gespeichert. Andere Ziele dürfen hier nicht als Quelle
        // für eine neue Formation verwendet werden.
        if (cityID !== ownCityId) {
            console.log(
                "%cFORMATION: Speichern abgebrochen – keine eigene Basis.",
                "color: orange; font-weight: bold;"
            );
            return false;
        }

        // ========================================================
        // Zieltyp ausschließlich über den Namen erkennen
        // ========================================================
        var targetName = "";

        try {
            if (typeof currentCity.Name !== "undefined") {
                targetName = currentCity.Name || "";
            }
        } catch (e) {}

        if (!targetName) {
            try {
                if (typeof currentCity.get_Name === "function") {
                    targetName = currentCity.get_Name() || "";
                }
            } catch (e) {}
        }

        var targetType = "Basis/Feind";
        var targetRecognized = false;

        if (targetName === "Lager") {
            targetType = "Lager";
            targetRecognized = true;
        } else if (targetName === "Vorposten") {
            targetType = "Vorposten";
            targetRecognized = true;
        }

        var formation =
            currentOwnCity
        .get_CityArmyFormationsManager()
        .GetFormationByTargetBaseId(cityID);

        var armyUnits =
            formation.get_ArmyUnits();

        if (armyUnits !== null) {
            armyUnits = armyUnits.l;
        } else {
            armyUnits =
                currentOwnCity
                .get_CityUnitsData()
                .get_OffenseUnits()
                .d;
        }

        var units = [];

        for (var i in armyUnits) {

            var unit = armyUnits[i];

            units.push({
                id: unit.get_Id(),
                x: unit.get_CoordX(),
                y: unit.get_CoordY(),
                e: true
            });
        }

        // ========================================================
        // Formationen sind global gespeichert.
        // Sie gehören NICHT zu einem bestimmten Ziel oder einer
        // bestimmten eigenen Basis.
        // ========================================================
        var layouts =
            localStorage.harziOffFormations;

        layouts =
            layouts ? JSON.parse(layouts) : {};

        if (layouts[layoutName]) {
            alert("Der Formationsname ist bereits vergeben.");
            return false;
        }

        layouts[layoutName] = {
            t: new Date().getTime(),
            units: units
        };

        localStorage.harziOffFormations =
            JSON.stringify(layouts);

        console.log(
            "%cFORMATION: Gespeichert – " +
            layoutName +
            " (" + units.length + " Einheiten)",
            "color: lime; font-weight: bold;"
        );

        return true;
    }


    // ============================================================
    // Gebäude laden
    // ============================================================

    function loadBuildingLayout(layoutName) {

        /*
         * TEST4:
         * Jeder Ladevorgang erhält eine eigene Generation. Sobald ein
         * neuer Ladevorgang gestartet oder der aktuelle beendet wird,
         * werden alle noch offenen setTimeout-Ketten der alten Generation
         * ungültig. Dadurch können keine alten Loader mehr "nachlaufen".
         */
        if (window.HARZI_BUILDING_LAYOUT_LOADING) {
            console.log(
                "%cLAYOUT: Ladevorgang bereits aktiv – kein zweiter Loader gestartet.",
                "color: orange; font-weight: bold;"
            );
            return;
        }

        window.HARZI_BUILDING_LAYOUT_LOADING = true;
        window.HARZI_BUILDING_LAYOUT_TOKEN =
            (window.HARZI_BUILDING_LAYOUT_TOKEN || 0) + 1;

        var loadToken = window.HARZI_BUILDING_LAYOUT_TOKEN;

        function finishLoad(message, style) {
            if (loadToken !== window.HARZI_BUILDING_LAYOUT_TOKEN) {
                return;
            }

            window.HARZI_BUILDING_LAYOUT_LOADING = false;
            window.HARZI_BUILDING_LAYOUT_TOKEN++;

            if (message) {
                console.log(message, style || "color: lime; font-weight: bold;");
            }
        }

        function isLoaderActive() {
            return (
                window.HARZI_BUILDING_LAYOUT_LOADING === true &&
                loadToken === window.HARZI_BUILDING_LAYOUT_TOKEN
            );
        }

        function getLiveCity() {
            try {
                return ClientLib.Data.MainData.GetInstance()
                    .get_Cities()
                    .get_CurrentOwnCity();
            } catch (e) {
                return null;
            }
        }

        var city = getLiveCity();

        if (!city) {
            finishLoad(
                "%cLAYOUT: Keine eigene Basis gefunden – Ladevorgang abgebrochen.",
                "color: orange; font-weight: bold;"
            );
            return;
        }

        var ownCityId = city.get_Id();

        var layouts = localStorage.harziBuildingLayouts;

        layouts = layouts ? JSON.parse(layouts) : {};

        if (
            !layouts[ownCityId] ||
            !layouts[ownCityId][layoutName]
        ) {
            finishLoad(
                "%cLAYOUT: Layout nicht gefunden.",
                "color: red; font-weight: bold;"
            );
            return;
        }

        var savedBuildings =
            layouts[ownCityId][layoutName].buildings;

        if (!savedBuildings || !savedBuildings.length) {
            finishLoad(
                "%cLAYOUT: Layout enthält keine Gebäude.",
                "color: orange; font-weight: bold;"
            );
            return;
        }

        // --------------------------------------------------------
        // Gebäudeklassen diagnostisch ausgeben
        // --------------------------------------------------------
        // Auch ältere Layouts ohne gespeichertes type-Feld bleiben
        // kompatibel: Der Typ wird aus dem aktuell vorhandenen Gebäude
        // ermittelt. Die Klassifizierung ändert in diesem Test noch keine
        // Bewegungsentscheidung.
        console.groupCollapsed(
            "%cLAYOUT: Gebäudeklassifizierung – " + layoutName,
            "color: #00ffff; font-weight: bold;"
        );

        for (var typeIndex = 0; typeIndex < savedBuildings.length; typeIndex++) {
            var typeSaved = savedBuildings[typeIndex];
            var typeBuilding = null;

            try {
                var typeBuildings = city.get_Buildings();
                for (var typeId in typeBuildings.d) {
                    var candidate = typeBuildings.d[typeId];
                    if (candidate && candidate.get_Id() === typeSaved.id) {
                        typeBuilding = candidate;
                        break;
                    }
                }
            } catch (e) {}

            if (typeBuilding) {
                console.log(
                    "LAYOUT: " +
                    (typeSaved.name || "Gebäude") +
                    " ID=" + typeSaved.id +
                    " → " + getBuildingType(typeBuilding)
                );
            } else {
                console.warn(
                    "LAYOUT: Gebäude ID=" + typeSaved.id +
                    " nicht gefunden – Typ konnte nicht ermittelt werden."
                );
            }
        }

        console.groupEnd();

        /*
         * TEST5-Diagnose:
         * Eine Gebäude-ID darf im gespeicherten Layout nur genau ein Ziel
         * besitzen. Genau das prüfen wir vor dem ersten Move.
         * Gleiche ID + unterschiedliche Ziele wäre die direkte Ursache für
         * ein Hin-und-Her wie z.B. ID=480155 (1:6) <-> (3:6).
         */
        var targetsById = {};
        var cleanedBuildings = [];
        var duplicateError = false;

        for (var s = 0; s < savedBuildings.length; s++) {
            var savedEntry = savedBuildings[s];
            var idKey = String(savedEntry.id);
            var targetKey = String(savedEntry.x) + ":" + String(savedEntry.y);

            if (targetsById[idKey]) {
                if (targetsById[idKey].target !== targetKey) {
                    console.error(
                        "%cLAYOUT: FEHLER – Gebäude ID=" +
                        savedEntry.id +
                        " ist mehrfach mit unterschiedlichen Zielpositionen gespeichert: " +
                        "(" + targetsById[idKey].x + ":" + targetsById[idKey].y +
                        ") und (" + savedEntry.x + ":" + savedEntry.y + "). " +
                        "Ladevorgang wird VOR dem ersten Move abgebrochen.",
                        "color: red; font-weight: bold;"
                    );
                    duplicateError = true;
                    continue;
                }

                console.warn(
                    "%cLAYOUT: Doppelte identische Speicherung erkannt – ID=" +
                    savedEntry.id +
                    " Ziel=(" + savedEntry.x + ":" + savedEntry.y +"). Eintrag wird ignoriert.",
                    "color: orange; font-weight: bold;"
                );
                continue;
            }

            targetsById[idKey] = {
                target: targetKey,
                x: savedEntry.x,
                y: savedEntry.y
            };
            cleanedBuildings.push(savedEntry);
        }

        if (duplicateError) {
            finishLoad(
                "%cLAYOUT: Inkonsistentes Layout erkannt – bitte Layout neu speichern.",
                "color: red; font-weight: bold;"
            );
            return;
        }

        savedBuildings = cleanedBuildings;

        function coordKey(x, y) {
            return String(x) + ":" + String(y);
        }

        function findBuilding(buildingId) {
            var liveCity = getLiveCity();

            if (!liveCity || liveCity.get_Id() !== ownCityId) {
                return null;
            }

            var buildings = liveCity.get_Buildings();

            if (!buildings || !buildings.d) {
                return null;
            }

            for (var id in buildings.d) {
                var building = buildings.d[id];

                if (!building) {
                    continue;
                }

                try {
                    if (building.get_Id() === buildingId) {
                        return building;
                    }
                } catch (e) {}
            }

            return null;
        }

        function getMoveState() {
            var occupied = {};
            var liveCity = getLiveCity();

            if (
                !liveCity ||
                liveCity.get_Id() !== ownCityId
            ) {
                return occupied;
            }

            var buildings = liveCity.get_Buildings();

            if (!buildings || !buildings.d) {
                return occupied;
            }

            for (var id in buildings.d) {
                var building = buildings.d[id];

                if (!building) {
                    continue;
                }

                try {
                    occupied[coordKey(
                        building.get_CoordX(),
                        building.get_CoordY()
                    )] = {
                        id: building.get_Id(),
                        name: building.get_UnitGameData_Obj().dn,
                        type: getBuildingType(building),
                        x: building.get_CoordX(),
                        y: building.get_CoordY()
                    };
                } catch (e) {}
            }

            return occupied;
        }

        var reservedTargets = {};

        for (var r = 0; r < savedBuildings.length; r++) {
            reservedTargets[coordKey(
                savedBuildings[r].x,
                savedBuildings[r].y
            )] = true;
        }

        function isVisuallyOccupied(x, y) {
            try {
                var visCity = ClientLib.Vis.VisMain
                    .GetInstance()
                    .get_City();

                if (!visCity) {
                    return false;
                }

                var gridW = visCity.get_GridWidth();
                var gridH = visCity.get_GridHeight();

                if (!gridW || !gridH) {
                    return false;
                }

                var cityObject = visCity.GetCityObjectFromPosition(
                    x * gridW,
                    y * gridH
                );

                return cityObject !== null && cityObject !== undefined;
            } catch (e) {
                return false;
            }
        }

        function canPlaceAtCoordinate(x, y, buildingType, occupied, ignoreId) {
            // NORMAL-Gebäude dürfen auf jedem freien Feld stehen.
            if (buildingType !== "SPECIAL") {
                return true;
            }

            // Ein SPECIAL darf niemals direkt neben einem anderen SPECIAL
            // stehen. Das gilt auch für einen Zwischenparkplatz.
            for (var key in occupied) {
                var other = occupied[key];

                if (!other || other.id === ignoreId) {
                    continue;
                }

                if (other.type !== "SPECIAL") {
                    continue;
                }

                if (isDirectlyAdjacent(x, y, other.x, other.y)) {
                    return false;
                }
            }

            return true;
        }

        function findTemporaryCoordinate(occupied, tried, buildingType, buildingId) {
            tried = tried || {};

            for (var y = 0; y <= 7; y++) {
                for (var x = 0; x <= 8; x++) {
                    var key = coordKey(x, y);

                    if (
                        reservedTargets[key] ||
                        occupied[key] ||
                        tried[key]
                    ) {
                        continue;
                    }

                    if (isVisuallyOccupied(x, y)) {
                        tried[key] = true;
                        continue;
                    }

                    if (!canPlaceAtCoordinate(
                        x,
                        y,
                        buildingType,
                        occupied,
                        buildingId
                    )) {
                        tried[key] = true;
                        continue;
                    }

                    return { x: x, y: y };
                }
            }

            return null;
        }

        function sendMoveBuilding(building, targetX, targetY, reason) {
            if (!building || !isLoaderActive()) {
                return false;
            }

            var currentX = building.get_CoordX();
            var currentY = building.get_CoordY();

            if (currentX === targetX && currentY === targetY) {
                return false;
            }

            console.log(
                "%cLAYOUT: " +
                (reason ? reason + " – " : "") +
                building.get_UnitGameData_Obj().dn +
                " ID=" + building.get_Id() +
                " (" + currentX + ":" + currentY + ") -> (" +
                targetX + ":" + targetY + ")",
                reason === "TEMP"
                    ? "color: orange; font-weight: bold;"
                    : "color: cyan; font-weight: bold;"
            );

            var liveCity = getLiveCity();

            if (!liveCity || liveCity.get_Id() !== ownCityId) {
                return false;
            }

            ClientLib.Net.CommunicationManager
                .GetInstance()
                .SendCommand(
                "MoveBuilding",
                {
                    cityid: liveCity.get_Id(),
                    posX: currentX,
                    posY: currentY,
                    targetPosX: targetX,
                    targetPosY: targetY
                },
                null,
                null,
                true
            );

            return true;
        }

        /*
         * Zustandsverlauf:
         * Nach einem erfolgreich ausgeführten Move darf derselbe Zustand
         * nicht erneut auftauchen. Damit wird ein echter Zyklus wie
         * 1:6 -> 3:6 -> 1:6 erkannt.
         * Nach einem fehlgeschlagenen TEMP-Move bleibt ein Zustand dagegen
         * zunächst zulässig, damit ein anderer Parkplatz versucht werden kann.
         */
        var seenStates = {};
        var lastMoveSucceeded = false;
        var failedMoves = 0;
        var triedTemporaryCoordinates = {};
        var maxSteps = savedBuildings.length * 4 + 10;

        function getLayoutStateSignature() {
            var parts = [];

            for (var i = 0; i < savedBuildings.length; i++) {
                var saved = savedBuildings[i];
                var building = findBuilding(saved.id);

                if (!building) {
                    parts.push(String(saved.id) + "=MISSING");
                    continue;
                }

                parts.push(
                    String(saved.id) + "=" +
                    building.get_CoordX() + ":" +
                    building.get_CoordY()
                );
            }

            parts.sort();
            return parts.join("|");
        }

        function loadStep(step) {
            if (!isLoaderActive()) {
                return;
            }

            var liveCity = getLiveCity();

            if (!liveCity || liveCity.get_Id() !== ownCityId) {
                finishLoad(
                    "%cLAYOUT: Eigene Basis nicht mehr aktiv – Ladevorgang abgebrochen.",
                    "color: orange; font-weight: bold;"
                );
                return;
            }

            if (step > maxSteps) {
                finishLoad(
                    "%cLAYOUT: Nach " + maxSteps +
                    " Bewegungsschritten konnte die Aufstellung nicht vollständig geladen werden.",
                    "color: orange; font-weight: bold;"
                );
                return;
            }

            var stateSignature = getLayoutStateSignature();

            if (lastMoveSucceeded && seenStates[stateSignature]) {
                console.error(
                    "%cLAYOUT: Bewegungszyklus erkannt – derselbe Layoutzustand wurde erneut erreicht. Ladevorgang wird gestoppt.",
                    "color: red; font-weight: bold;"
                );
                finishLoad();
                return;
            }

            seenStates[stateSignature] = true;

            var occupied = getMoveState();
            var remaining = [];

            for (var i = 0; i < savedBuildings.length; i++) {
                var saved = savedBuildings[i];
                var building = findBuilding(saved.id);

                if (!building) {
                    console.log(
                        "%cLAYOUT: Gespeichertes Gebäude ID=" +
                        saved.id + " nicht mehr gefunden.",
                        "color: orange; font-weight: bold;"
                    );
                    continue;
                }

                var currentX = building.get_CoordX();
                var currentY = building.get_CoordY();

                if (
                    currentX !== saved.x ||
                    currentY !== saved.y
                ) {
                    remaining.push({
                        saved: saved,
                        building: building
                    });
                }
            }

            if (remaining.length === 0) {
                finishLoad(
                    "%cLAYOUT: Aufstellung vollständig geladen.",
                    "color: lime; font-weight: bold;"
                );
                return;
            }

            var directMove = null;

            for (var d = 0; d < remaining.length; d++) {
                var direct = remaining[d];
                var targetKey = coordKey(
                    direct.saved.x,
                    direct.saved.y
                );

                var occupant = occupied[targetKey];

                if (!occupant || occupant.id === direct.saved.id) {
                    var directType = getSavedBuildingType(
                        direct.saved,
                        direct.building
                    );

                    if (canPlaceAtCoordinate(
                        direct.saved.x,
                        direct.saved.y,
                        directType,
                        occupied,
                        direct.saved.id
                    )) {
                        directMove = direct;
                        break;
                    }
                }
            }

            if (directMove) {
                var sentDirect = sendMoveBuilding(
                    directMove.building,
                    directMove.saved.x,
                    directMove.saved.y,
                    "ZIEL"
                );

                if (!sentDirect) {
                    failedMoves++;
                }

                window.setTimeout(function () {
                    if (!isLoaderActive()) {
                        return;
                    }

                    var movedBuilding = findBuilding(directMove.saved.id);
                    var success = false;

                    if (movedBuilding) {
                        success = (
                            movedBuilding.get_CoordX() === directMove.saved.x &&
                            movedBuilding.get_CoordY() === directMove.saved.y
                        );
                    }

                    if (success) {
                        lastMoveSucceeded = true;
                        failedMoves = 0;
                    } else {
                        lastMoveSucceeded = false;
                        failedMoves++;
                        console.log(
                            "%cLAYOUT: Zielposition (" +
                            directMove.saved.x + ":" + directMove.saved.y +
                            ") wurde nicht übernommen.",
                            "color: orange; font-weight: bold;"
                        );
                    }

                    if (failedMoves >= 3) {
                        finishLoad(
                            "%cLAYOUT: Drei aufeinanderfolgende Bewegungen wurden nicht übernommen – Ladevorgang gestoppt.",
                            "color: red; font-weight: bold;"
                        );
                        return;
                    }

                    loadStep(step + 1);
                }, 1000);

                return;
            }

            var blockedCandidates = [];

            for (var b = 0; b < remaining.length; b++) {
                var candidate = remaining[b];
                var blockedKey = coordKey(
                    candidate.saved.x,
                    candidate.saved.y
                );
                var blockedOccupant = occupied[blockedKey];

                if (
                    blockedOccupant &&
                    blockedOccupant.id !== candidate.saved.id
                ) {
                    blockedCandidates.push({
                        move: candidate,
                        occupant: blockedOccupant
                    });
                }
            }

            var blocked = null;

            if (blockedCandidates.length) {
                for (var c = 0; c < blockedCandidates.length; c++) {
                    var blockedCandidate = blockedCandidates[c];
                    var occupant = blockedCandidate.occupant;

                    for (var n = 0; n < remaining.length; n++) {
                        if (remaining[n].saved.id === occupant.id) {
                            continue;
                        }

                        if (
                            remaining[n].saved.x === occupant.x &&
                            remaining[n].saved.y === occupant.y
                        ) {
                            blocked = blockedCandidate;
                            break;
                        }
                    }

                    if (blocked) {
                        break;
                    }
                }

                if (!blocked) {
                    blocked = blockedCandidates[0];
                }
            }

            if (!blocked) {
                finishLoad(
                    "%cLAYOUT: Kein gültiger nächster Bewegungsschritt gefunden.",
                    "color: orange; font-weight: bold;"
                );
                return;
            }

            var occupantType = blocked.occupant.type || "SPECIAL";

            var temp = findTemporaryCoordinate(
                occupied,
                triedTemporaryCoordinates,
                occupantType,
                occupantId
            );

            if (!temp) {
                finishLoad(
                    "%cLAYOUT: Keine freie Zwischenposition zum Parken gefunden.",
                    "color: orange; font-weight: bold;"
                );
                return;
            }

            var occupantId = blocked.occupant.id;
            var occupantBuilding = findBuilding(occupantId);

            if (!occupantBuilding) {
                finishLoad(
                    "%cLAYOUT: Das zu parkende Gebäude ID=" +
                    occupantId + " wurde nicht gefunden.",
                    "color: orange; font-weight: bold;"
                );
                return;
            }

            var tempKey = coordKey(temp.x, temp.y);

            var sentTemp = sendMoveBuilding(
                occupantBuilding,
                temp.x,
                temp.y,
                "TEMP"
            );

            if (!sentTemp) {
                triedTemporaryCoordinates[tempKey] = true;
            }

            window.setTimeout(function () {
                if (!isLoaderActive()) {
                    return;
                }

                var movedBuilding = findBuilding(occupantId);
                var tempSuccess = false;

                if (movedBuilding) {
                    var actualX = movedBuilding.get_CoordX();
                    var actualY = movedBuilding.get_CoordY();

                    tempSuccess = (
                        actualX === temp.x &&
                        actualY === temp.y
                    );

                    if (!tempSuccess) {
                        triedTemporaryCoordinates[tempKey] = true;

                        console.log(
                            "%cLAYOUT: Zwischenposition (" +
                            temp.x + ":" + temp.y +
                            ") wurde nicht übernommen. Neuer Versuch.",
                            "color: orange; font-weight: bold;"
                        );
                    }
                }

                lastMoveSucceeded = tempSuccess;

                if (tempSuccess) {
                    failedMoves = 0;
                } else {
                    failedMoves++;
                }

                if (failedMoves >= 8) {
                    finishLoad(
                        "%cLAYOUT: Zu viele erfolglose Bewegungsversuche – Ladevorgang gestoppt.",
                        "color: red; font-weight: bold;"
                    );
                    return;
                }

                loadStep(step + 1);

            }, 1000);
        }

        console.log(
            "%cLAYOUT: Start – " + layoutName +
            " | Basis-ID=" + ownCityId +
            " | Gebäude=" + savedBuildings.length,
            "color: cyan; font-weight: bold;"
        );

        loadStep(1);
    }

    // ============================================================
    // Gebäude-Saver UI erstellen
    // ============================================================

    function openOffFormationSaver() {

        // Bereits geöffnetes Formation-Fenster zuerst schließen
        if (offFormationContainer) {
            offFormationContainer.destroy();
            offFormationContainer = null;
        }

        var container =
            new qx.ui.container.Composite();

        offFormationContainer = container;

        container.setLayout(
            new qx.ui.layout.Canvas()
        );

        container.set({
            width: 120,
            height: 250,
            zIndex: 10000
        });

        buildingSaverContainer.getLayoutParent().add(
            container,
            {
                right: 0,
                top: 150
            }
        );

        var label =
            new qx.ui.basic.Label("Formation");

        label.set({
            width: 110,
            height: 20,
            textColor: "#FFFFFF"
        });

        container.add(
            label,
            {
                left: 5,
                top: 5
            }
        );

        var input =
            new qx.ui.form.TextField();

        input.set({
            width: 100,
            height: 22
        });

        container.add(
            input,
            {
                left: 5,
                top: 30
            }
        );

        var formationList =
            new qx.ui.container.Composite();

        formationList.setLayout(
            new qx.ui.layout.VBox(2)
        );

        var city =
            ClientLib.Data.MainData
        .GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        if (!city) {
            return;
        }

        var ownCityId =
            city.get_Id();

        offFormationCityId = ownCityId;

        var layouts =
            localStorage.harziOffFormations;

        layouts =
            layouts ? JSON.parse(layouts) : {};

        // Formationsspeicher ist global und nicht zielgebunden.
        for (
            var formationName in layouts
        ) {

            var row =
                new qx.ui.container.Composite(
                    new qx.ui.layout.HBox(6)
                );

            row.set({
                width: 105,
                height: 22
            });

            var formationLabel =
                new qx.ui.basic.Label(
                    formationName
                );

            (function (name) {

                formationLabel.addListener(
                    "click",
                    function () {

                        loadOffFormation(name);
                    }
                );

            })(formationName);

            formationLabel.set({
                width: 75,
                height: 20,
                rich: true,
                textColor: "#FFFFFF",
                cursor: "pointer"
            });

            var deleteButton =
                new qx.ui.form.Button("X");

            deleteButton.set({
                width: 22,
                height: 20,
                appearance: "button-text-small"
            });

            (function (
             name,
              currentRow
             ) {

                deleteButton.addListener(
                    "execute",
                    function () {

                        delete layouts[name];

                        localStorage
                            .harziOffFormations =
                            JSON.stringify(
                            layouts
                        );

                        formationList.remove(
                            currentRow
                        );
                    }
                );

            })(
                formationName,
                row
            );

            row.add(
                formationLabel
            );

            row.add(
                deleteButton
            );

            formationList.add(
                row
            );
        }

        container.add(
            formationList,
            {
                left: 5,
                top: 115
            }
        );

        var saveButton =
            new qx.ui.form.Button("Speichern");

        saveButton.set({
            width: 100,
            height: 24,
            appearance: "button-text-small"
        });

        container.add(
            saveButton,
            {
                left: 5,
                top: 55
            }
        );

        saveButton.addListener(
            "execute",
            function () {

                var name =
                    input.getValue();

                if (
                    !name ||
                    !name.trim()
                ) {
                    return;
                }

                name =
                    name.trim();

                var saved =
                    saveOffFormation(name);

                if (!saved) {
                    return;
                }

                var row =
                    new qx.ui.container.Composite(
                        new qx.ui.layout.HBox(6)
                    );

                row.set({
                    width: 105,
                    height: 22
                });

                var formationLabel =
                    new qx.ui.basic.Label(name);

                formationLabel.set({
                    width: 75,
                    height: 20,
                    rich: true,
                    textColor: "#FFFFFF",
                    cursor: "pointer"
                });

                formationLabel.addListener(
                    "click",
                    function () {

                        loadOffFormation(name);
                    }
                );

                var deleteButton =
                    new qx.ui.form.Button("X");

                deleteButton.set({
                    width: 22,
                    height: 20,
                    appearance: "button-text-small"
                });

                deleteButton.addListener(
                    "execute",
                    function () {

                        var currentLayouts =
                            localStorage.harziOffFormations;

                        currentLayouts =
                            currentLayouts
                            ? JSON.parse(currentLayouts)
                        : {};

                        delete currentLayouts[name];

                        localStorage.harziOffFormations =
                            JSON.stringify(currentLayouts);

                        formationList.remove(row);
                    }
                );

                row.add(formationLabel);
                row.add(deleteButton);

                formationList.add(row);

                input.setValue("");
            }
        );

        var closeButton =
            new qx.ui.form.Button("Schließen");

        closeButton.set({
            width: 100,
            height: 24,
            appearance: "button-text-small"
        });

        container.add(
            closeButton,
            {
                left: 5,
                top: 88
            }
        );

        closeButton.addListener(
            "execute",
            function () {
                container.destroy();
            }
        );
    }

    // ============================================================
    // Off Formation laden
    // ============================================================

    function loadOffFormation(layoutName) {

        var layouts =
            localStorage.harziOffFormations;

        layouts =
            layouts ? JSON.parse(layouts) : {};

        var cities =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities();

        var currentOwnCity =
            cities.get_CurrentOwnCity();

        if (!currentOwnCity) {
            return;
        }

        var ownCityId =
            currentOwnCity.get_Id();

        // Formationen sind global gespeichert und unabhängig vom Ziel.
        if (!layouts[layoutName]) {
            console.log(
                "%cFORMATION: Globale Formation nicht gefunden: " + layoutName,
                "color: red; font-weight: bold;"
            );
            return;
        }

        var saved =
            layouts[layoutName];

        var currentCity =
            cities.get_CurrentCity();

        var cityID =
            currentCity.get_Id();

        // ========================================================
        // Ziel anhand des sichtbaren Namens erkennen
        // ========================================================
        // Bei Lager/Vorposten liefert die aktuelle City-Information
        // zuverlässig den Namen, während CampType dort teilweise
        // nicht vorhanden ist.
        var targetName = "";

        try {
            if (typeof currentCity.Name !== "undefined") {
                targetName = currentCity.Name || "";
            }
        } catch (e) {}

        if (!targetName) {
            try {
                if (typeof currentCity.get_Name === "function") {
                    targetName = currentCity.get_Name() || "";
                }
            } catch (e) {}
        }

        var targetType = "Basis/Feind";
        var targetRecognized = false;

        if (targetName === "Lager") {
            targetType = "Lager";
            targetRecognized = true;
        } else if (targetName === "Vorposten") {
            targetType = "Vorposten";
            targetRecognized = true;
        }


        // Eine Formation wird nicht auf der eigenen Basis angewendet.
        // Dort wird sie ausschließlich gespeichert.
        if (cityID === ownCityId) {
            console.log(
                "%cFORMATION: Eigene Basis – keine Umstellung.",
                "color: orange; font-weight: bold;"
            );
            return;
        }

        // Auf allen anderen Zielen darf die globale Formation angewendet
        // werden: Feindbasis, vergessene Basis, Lager oder Vorposten.
        console.log(
            "%cFORMATION: Anwenden auf Zieltyp = " + targetType,
            "color: lime; font-weight: bold;"
        );

        var formation =
            currentOwnCity
        .get_CityArmyFormationsManager()
        .GetFormationByTargetBaseId(cityID);

        if (!formation) {
            return;
        }

        var armyUnits =
            formation.get_ArmyUnits();

        if (!armyUnits) {
            return;
        }

        armyUnits = armyUnits.l;

        var movedCount = 0;

        for (var i in saved.units) {

            var savedUnit = saved.units[i];
            var foundUnit = false;

            for (var j in armyUnits) {

                if (armyUnits[j].get_Id() === savedUnit.id) {

                    foundUnit = true;
                    movedCount++;

                    // Die funktionierende Formation-Saver-Methode verwenden.
                    // Die gespeicherten Koordinaten werden direkt auf die
                    // vorhandene Einheit im aktuellen Ziel angewendet.
                    armyUnits[j].MoveBattleUnit(
                        savedUnit.x,
                        savedUnit.y
                    );

                    // Gespeicherten Aktivierungszustand ebenfalls übernehmen.
                    if (savedUnit.e !== undefined && savedUnit.e !== null) {
                        if (armyUnits[j].set_Enabled_Original) {
                            armyUnits[j].set_Enabled_Original(savedUnit.e);
                        } else if (typeof armyUnits[j].set_Enabled === "function") {
                            armyUnits[j].set_Enabled(savedUnit.e);
                        }
                    }

                    break;
                }
            }

            if (!foundUnit) {
                console.log(
                    "%cFORMATION: Gespeicherte Unit nicht im aktuellen Ziel gefunden: " +
                    savedUnit.id,
                    "color: orange; font-weight: bold;"
                );
            }
        }

        console.log(
            "%cFORMATION: " +
            movedCount +
            " von " +
            saved.units.length +
            " gespeicherten Einheiten gefunden.",
            "color: yellow; font-weight: bold;"
        );
        console.log(
            "%cFORMATION: Geladen – " +
            layoutName +
            " (" +
            saved.units.length +
            " Einheiten)",
            "color: lime; font-weight: bold;"
        );
    }

    function closeBuildingLayout() {

        if (buildingLayoutInput) {
            buildingSaverContainer.remove(
                buildingLayoutInput
            );
            buildingLayoutInput = null;
        }

        if (buildingLayoutList) {
            buildingSaverContainer.remove(
                buildingLayoutList
            );
            buildingLayoutList = null;
        }

        if (buildingLayoutSaveButton) {
            buildingSaverContainer.remove(
                buildingLayoutSaveButton
            );
            buildingLayoutSaveButton = null;
        }

        if (buildingLayoutCloseButton) {
            buildingSaverContainer.remove(
                buildingLayoutCloseButton
            );
            buildingLayoutCloseButton = null;
        }
    }

    function createBuildingSaver() {

        if (buildingSaverContainer) {
            return;
        }

        var playArea =
            qx.core.Init.getApplication()
        .getPlayArea();


        buildingSaverContainer =
            new qx.ui.container.Composite();

        buildingSaverContainer.setLayout(
            new qx.ui.layout.Canvas()
        );

        buildingSaverContainer.setWidth(110);
        buildingSaverContainer.setHeight(250);
        buildingSaverContainer.setZIndex(9999);


        // ========================================================
        // LAYOUT rechts neben "Alles reparieren"
        // ========================================================

        var repairButton = null;

        function findRepairButton(widget) {
            if (!widget || !widget.getChildren) {
                return;
            }

            var children = widget.getChildren();

            for (var i = 0; i < children.length; i++) {
                var child = children[i];

                try {
                    if (
                        child.getLabel &&
                        child.getLabel() === "Alles reparieren"
                    ) {
                        repairButton = child;
                        return;
                    }
                } catch (e) {}

                findRepairButton(child);

                if (repairButton) {
                    return;
                }
            }
        }

        findRepairButton(playArea);

        if (!repairButton) {
            return;
        }

        var parent = repairButton.getLayoutParent();
        parent = parent.getLayoutParent();

        parent.add(
            buildingSaverContainer,
            {
                right: 0,
                top: 105
            }
        );


        buildingButton =
            new qx.ui.form.Button("LAYOUT");

        buildingButton.set({
            width: 100,
            height: 40,
            appearance: "button-text-small"
        });


        buildingSaverContainer.add(
            buildingButton,
            {
                left: 5,
                top: 0
            }
        );

        // ========================================================
        // FORMATION Button
        // ========================================================

        // ========================================================
        // Sichtbarkeit nach Spielmodus
        // ========================================================

        //=================================================================================================
        var lastSaverStateKey = null;

        function getSaverStateKey(currentMode) {

            var currentCityId = -1;

            try {
                var currentCity =
                    ClientLib.Data.MainData
                        .GetInstance()
                        .get_Cities()
                        .get_CurrentCity();

                if (currentCity && typeof currentCity.get_Id === "function") {
                    currentCityId = currentCity.get_Id();
                }
            } catch (e) {
                currentCityId = -1;
            }

            return String(currentMode) + "|" + String(currentCityId);
        }

        function closeExpandedSaverPanels() {

            // Layout-Ausklappung schließen
            closeBuildingLayout();

            // Formation-Ausklappung schließen
            if (offFormationContainer) {
                try {
                    offFormationContainer.destroy();
                } catch (e) {}

                offFormationContainer = null;
            }
        }

        buildingModeTimer =
            window.setInterval(function () {

            try {

                var currentMode =
                    ClientLib.Vis.VisMain
                .GetInstance()
                .get_Mode();

                // Bei jedem Wechsel des Spielzustands bzw. der aktuellen
                // Basis wird eine eventuell geöffnete Layout-/Formation-
                // Anzeige automatisch geschlossen.
                var currentSaverStateKey =
                    getSaverStateKey(currentMode);

                if (
                    lastSaverStateKey !== null &&
                    currentSaverStateKey !== lastSaverStateKey
                ) {
                    closeExpandedSaverPanels();
                }

                lastSaverStateKey = currentSaverStateKey;


                if (currentMode === 1) {

                    // Eigene Basis – Gebäude
                    buildingButton.setLabel("LAYOUT");
                    buildingButton.show();
                    offButton.exclude();

                } else if (currentMode === 4) {

                    // Eigene Basis – Armee
                    buildingButton.setLabel("FORMATION");
                    buildingButton.show();
                    offButton.exclude();

                } else if (
                    currentMode === 2 ||
                    currentMode === 5
                ) {

                    // Mode 2 = Weltkarte
                    // Mode 5 = DEFF-Ansicht (zukünftige Funktion)

                    buildingButton.exclude();
                    offButton.exclude();

                                                } else {

                    // Zielbasis / Lager / Vorposten / vergessene Basis

                    var selectedObject = null;
                    var ownAllianceId = -1;
                    var selectedAllianceId = -1;
                    var isOwnBase = false;

                    try {
                        selectedObject =
                            ClientLib.Vis.VisMain
                                .GetInstance()
                                .get_SelectedObject();
                    } catch (e) {
                        selectedObject = null;
                    }

                    // Eigene Allianz-ID dynamisch aus dem aktuellen Spieler
                    try {
                        var ownPlayer =
                            ClientLib.Data.MainData
                                .GetInstance()
                                .get_Player();

                        if (
                            ownPlayer &&
                            typeof ownPlayer.get_AllianceId === "function"
                        ) {
                            ownAllianceId =
                                Number(ownPlayer.get_AllianceId());
                        }
                    } catch (e) {
                        ownAllianceId = -1;
                    }

                    // Allianz-ID des aktuell ausgewählten Objekts
                    try {
                        if (
                            selectedObject &&
                            typeof selectedObject.get_AllianceId === "function"
                        ) {
                            selectedAllianceId =
                                Number(selectedObject.get_AllianceId());
                        }
                    } catch (e) {
                        selectedAllianceId = -1;
                    }

                    // Prüfen, ob es die eigene Basis ist
                    try {
                        var currentCity =
                            ClientLib.Data.MainData
                                .GetInstance()
                                .get_Cities()
                                .get_CurrentCity();

                        if (
                            currentCity &&
                            typeof currentCity.get_IsOwnBase === "function"
                        ) {
                            isOwnBase =
                                currentCity.get_IsOwnBase() === true;
                        }
                    } catch (e) {
                        isOwnBase = false;
                    }

                    if (isOwnBase) {

                        // Eigene Basis
                        buildingButton.setLabel("FORMATION");
                        buildingButton.show();
                        offButton.exclude();

                    } else if (
                        selectedAllianceId > 0 &&
                        selectedAllianceId === ownAllianceId
                    ) {

                        // Allianzmitglied
                        // Kein Building-/Off-Button
                        buildingButton.exclude();
                        offButton.exclude();

                    } else {

                        // Fremder Spieler
                        // Lager / Vorposten / vergessene Basis
                        buildingButton.setLabel("FORMATION");
                        buildingButton.show();
                        offButton.exclude();
                    }

                }

            } catch (e) {}

        }, 500);


        // ========================================================
        // LAYOUT Button
        // ========================================================

        buildingButton.addListener(
            "execute",
            function () {

                var currentMode =
                    ClientLib.Vis.VisMain
                .GetInstance()
                .get_Mode();

                if (currentMode !== 1) {
                    buildingButton.setLabel("FORMATION");
                    openOffFormationSaver();
                    return;
                }

                buildingButton.setLabel("LAYOUT");

                var input =
                    new qx.ui.form.TextField();

                buildingLayoutInput = input;

                input.set({
                    width: 100,
                    height: 24,
                    placeholder: "Layoutname"
                });


                var layoutList =
                    new qx.ui.container.Composite();

                buildingLayoutList = layoutList;

                layoutList.setLayout(
                    new qx.ui.layout.VBox(2)
                );


                var city =
                    ClientLib.Data.MainData
                .GetInstance()
                .get_Cities()
                .get_CurrentOwnCity();

                if (!city) {
                    return;
                }

                var ownCityId =
                    city.get_Id();


                var layouts =
                    localStorage.harziBuildingLayouts;

                layouts =
                    layouts ? JSON.parse(layouts) : {};


                // ====================================================
                // Bereits gespeicherte Layouts anzeigen
                // ====================================================

                if (layouts[ownCityId]) {

                    for (
                        var layoutName in layouts[ownCityId]
                    ) {

                        var row =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(6)
                            );


                        row.set({
                            width: 105,
                            height: 22
                        });


                        var layoutLabel =
                            new qx.ui.basic.Label(
                                layoutName
                            );

                        layoutLabel.set({
                            width: 75,
                            height: 20,
                            rich: true,
                            textColor: "#FFFFFF",
                            cursor: "pointer"
                        });


                        var deleteButton =
                            new qx.ui.form.Button("X");

                        deleteButton.set({
                            width: 22,
                            height: 20,
                            appearance: "button-text-small"
                        });


                        (function (
                         name,
                          currentRow,
                          currentLabel
                         ) {


                            currentLabel.addListener(
                                "click",
                                function () {

                                    loadBuildingLayout(
                                        name
                                    );
                                }
                            );


                            deleteButton.addListener(
                                "execute",
                                function () {

                                    delete layouts[
                                        ownCityId
                                    ][name];

                                    localStorage
                                        .harziBuildingLayouts =
                                        JSON.stringify(
                                        layouts
                                    );

                                    layoutList.remove(
                                        currentRow
                                    );
                                }
                            );


                        })(
                            layoutName,
                            row,
                            layoutLabel
                        );


                        row.add(layoutLabel);
                        row.add(deleteButton);

                        layoutList.add(row);
                    }
                }


                buildingSaverContainer.add(
                    input,
                    {
                        left: 5,
                        top: 44
                    }
                );


                buildingSaverContainer.add(
                    layoutList,
                    {
                        left: 5,
                        top: 125
                    }
                );


                // ====================================================
                // Speichern
                // ====================================================

                var saveButton =
                    new qx.ui.form.Button(
                        "Speichern"
                    );

                saveButton.set({
                    width: 100,
                    height: 24,
                    appearance: "button-text-small"
                });

                buildingLayoutSaveButton = saveButton;

                buildingSaverContainer.add(
                    saveButton,
                    {
                        left: 5,
                        top: 70
                    }
                );


                saveButton.addListener(
                    "execute",
                    function () {

                        var name =
                            input.getValue();


                        if (
                            !name ||
                            !name.trim()
                        ) {
                            return;
                        }


                        name =
                            name.trim();


                        var saved =
                            saveBuildingLayout(
                                name
                            );


                        if (!saved) {
                            return;
                        }


                        var row =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(6)
                            );


                        row.set({
                            width: 105,
                            height: 22
                        });


                        var layoutLabel =
                            new qx.ui.basic.Label(
                                name
                            );

                        layoutLabel.set({
                            width: 75,
                            height: 20,
                            rich: true,
                            textColor: "#FFFFFF",
                            cursor: "pointer"
                        });


                        var deleteButton =
                            new qx.ui.form.Button("X");

                        deleteButton.set({
                            width: 22,
                            height: 20,
                            appearance: "button-text-small"
                        });


                        layoutLabel.addListener(
                            "click",
                            function () {

                                loadBuildingLayout(
                                    name
                                );
                            }
                        );


                        deleteButton.addListener(
                            "execute",
                            function () {

                                var currentLayouts =
                                    localStorage
                                .harziBuildingLayouts;

                                currentLayouts =
                                    currentLayouts
                                    ? JSON.parse(
                                    currentLayouts
                                )
                                : {};

                                delete currentLayouts[
                                    ownCityId
                                ][name];

                                localStorage
                                    .harziBuildingLayouts =
                                    JSON.stringify(
                                    currentLayouts
                                );

                                layoutList.remove(row);
                            }
                        );


                        row.add(layoutLabel);
                        row.add(deleteButton);

                        layoutList.add(row);

                        input.setValue("");
                    }
                );


                // ====================================================
                // Schließen
                // ====================================================

                var closeButton =
                    new qx.ui.form.Button(
                        "Schließen"
                    );

                closeButton.set({
                    width: 100,
                    height: 24,
                    appearance: "button-text-small"
                });

                buildingLayoutCloseButton = closeButton;

                buildingSaverContainer.add(
                    closeButton,
                    {
                        left: 5,
                        top: 100
                    }
                );


                closeButton.addListener(
                    "execute",
                    function () {

                        buildingSaverContainer
                            .remove(input);

                        buildingSaverContainer
                            .remove(layoutList);

                        buildingSaverContainer
                            .remove(saveButton);

                        buildingSaverContainer
                            .remove(closeButton);
                    }
                );

            }
        );
    }


    // ============================================================
    // Initialisierung
    // ============================================================

    function initBuildingSaver() {

        try {

            if (
                typeof qx === "undefined"
            ) {
                return;
            }


            var application =
                qx.core.Init
            .getApplication();


            if (!application) {
                return;
            }


            var playArea =
                application.getPlayArea();


            if (!playArea) {
                return;
            }


            createBuildingSaver();

        } catch (e) {


        }
    }


    // ============================================================
    // Warten bis das Spiel vollständig geladen ist
    // ============================================================

    function checkGameLoaded() {

        try {

            if (
                typeof qx !== "undefined"
            ) {

                var application =
                    qx.core.Init
                .getApplication();


                if (
                    application &&
                    application.getMenuBar()
                ) {

                    initBuildingSaver();

                    return;
                }
            }

        } catch (e) {}


        window.setTimeout(
            checkGameLoaded,
            1000
        );
    }


    // ============================================================
    // Start
    // ============================================================

    if (
        /commandandconquer\.com/i
        .test(document.domain)
    ) {

        window.setTimeout(
            checkGameLoaded,
            1000
        );
    }


})();
