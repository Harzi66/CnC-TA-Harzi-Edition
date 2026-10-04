// ==UserScript==
// @name           CnC-TA-Building_&_Off-Saver - HE
// @namespace      https://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @version        1.2.5
// @description    Speichert und lädt Gebäudeaufstellungen und Off-Formationen
// @author         Harzi
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Building_%26_Off-Saver%20-%20HE.user.js
// @updateURL      https://raw.githubusercontent.com/Harzi66/CnC-TA-Building_-_Off-Saver-HE/main/CnC-TA-Building_%26_Off-Saver%20-%20HE.user.js
// ==/UserScript==

(function () {

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

        var city =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        if (!city) {
            return;
        }

        var ownCityId = city.get_Id();

        var layouts = localStorage.harziBuildingLayouts;

        layouts = layouts ? JSON.parse(layouts) : {};

        if (
            !layouts[ownCityId] ||
            !layouts[ownCityId][layoutName]
        ) {

            console.log(
                "%cLAYOUT: Layout nicht gefunden.",
                "color: red; font-weight: bold;"
            );

            return;
        }

        var savedBuildings =
            layouts[ownCityId][layoutName].buildings;

        if (!savedBuildings || !savedBuildings.length) {
            return;
        }


        // --------------------------------------------------------
        // Gebäude anhand der eindeutigen ID suchen
        // --------------------------------------------------------

        function findBuilding(buildingId) {

            var buildings = city.get_Buildings();

            for (var id in buildings.d) {

                var building = buildings.d[id];

                if (building.get_Id() === buildingId) {
                    return building;
                }
            }

            return null;
        }


        // --------------------------------------------------------
        // Lade-Durchlauf
        // --------------------------------------------------------

        function loadPass(pass) {

            var differences = 0;

            for (
                var i = 0;
                i < savedBuildings.length;
                i++
            ) {

                var saved = savedBuildings[i];

                var building =
                    findBuilding(saved.id);

                if (!building) {
                    continue;
                }

                var currentX =
                    building.get_CoordX();

                var currentY =
                    building.get_CoordY();


                if (
                    currentX !== saved.x ||
                    currentY !== saved.y
                ) {

                    differences++;

                    ClientLib.Net.CommunicationManager
                        .GetInstance()
                        .SendCommand(
                        "MoveBuilding",
                        {
                            cityid: city.get_Id(),
                            posX: currentX,
                            posY: currentY,
                            targetPosX: saved.x,
                            targetPosY: saved.y
                        },
                        null,
                        null,
                        true
                    );

                }
            }


            // ----------------------------------------------------
            // Alles korrekt
            // ----------------------------------------------------

            if (differences === 0) {

                console.log(
                    "%cLAYOUT: Aufstellung vollständig geladen.",
                    "color: lime; font-weight: bold;"
                );

                return;
            }


            // ----------------------------------------------------
            // Maximale Anzahl Durchläufe erreicht
            // ----------------------------------------------------

            if (pass >= 5) {

                console.log(
                    "%cLAYOUT: Nach 5 Durchläufen noch " +
                    differences +
                    " Gebäude abweichend.",
                    "color: orange; font-weight: bold;"
                );

                return;
            }


            window.setTimeout(function () {

                loadPass(pass + 1);

            }, 1000);
        }


        // Erster Durchlauf
        loadPass(1);
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
                top: 120
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
                top: 75
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
        var lastTestCityId = null;
        //================================================================================================


        buildingModeTimer =
            window.setInterval(function () {

            try {

                var currentMode =
                    ClientLib.Vis.VisMain
                .GetInstance()
                .get_Mode();


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
