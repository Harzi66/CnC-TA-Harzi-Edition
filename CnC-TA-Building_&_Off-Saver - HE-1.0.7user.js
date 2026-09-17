// ==UserScript==
// @name           CnC-TA-Building_&_Off-Saver - HE
// @namespace      https://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @version        1.0.7
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

        var cityID =
            currentCity.get_Id();

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

        var layouts =
            localStorage.harziOffFormations;

        layouts =
            layouts ? JSON.parse(layouts) : {};

        if (!layouts[ownCityId]) {
            layouts[ownCityId] = {};
        }

        if (layouts[ownCityId][layoutName]) {
            alert("Der Formationsname ist bereits vergeben.");
            return false;
        }

        layouts[ownCityId][layoutName] = {
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
    // Offensiveinheiten ermitteln – Diagnose
    // ============================================================

    function diagnoseOffUnits() {

        console.log(
            "%cFORMATION-DIAGNOSE: ===== EINHEITEN =====",
            "color: yellow; font-weight: bold;"
        );

        var cities =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities();

        var city =
            cities.get_CurrentOwnCity();

        if (!city) {
            console.log(
                "%cFORMATION-DIAGNOSE: Keine eigene Basis gefunden.",
                "color: red; font-weight: bold;"
            );
            return;
        }

        var buildings = city.get_Buildings();


        console.log(
            "%cFORMATION-DIAGNOSE: Basis-ID = " +
            city.get_Id(),
            "color: cyan; font-weight: bold;"
        );


        // ========================================================
        // Versuchen, die aufgestellten Einheiten zu ermitteln
        // ========================================================

        var manager =
            city.get_CityArmyFormationsManager();

        console.log(
            "%cFORMATION-DIAGNOSE: FormationManager = " +
            (manager ? "GEFUNDEN" : "NICHT GEFUNDEN"),
            "color: cyan; font-weight: bold;"
        );

        if (!manager) {
            return;
        }


        var formation =
            manager.GetFormationByTargetBaseId(
                cities.get_CurrentCity().get_Id()
            );

        console.log(
            "%cFORMATION-DIAGNOSE: Formation = " +
            (formation ? "GEFUNDEN" : "NICHT GEFUNDEN"),
            "color: cyan; font-weight: bold;"
        );

        if (!formation) {
            return;
        }


        console.log(
            "%cFORMATION-DIAGNOSE: ===== ENDE =====",
            "color: yellow; font-weight: bold;"
        );
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

                    building.ZRBFIX(
                        saved.x,
                        saved.y
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


            console.log(
                "%cLAYOUT: Durchlauf " +
                pass +
                " – " +
                differences +
                " Gebäude werden erneut gesetzt.",
                "color: cyan; font-weight: bold;"
            );


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

        var playArea =
            qx.core.Init.getApplication()
        .getPlayArea();

        playArea.add(
            container,
            {
                left: 0,
                top: 110
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

        if (layouts[ownCityId]) {

            for (
                var formationName in layouts[ownCityId]
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

                            console.log(
                                "FORMATION-TEST: Name angeklickt = " +
                                name
                            );

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

                            delete layouts[
                                ownCityId
                            ][name];

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
        }

        container.add(
            formationList,
            {
                left: 5,
                top: 116
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
                top: 58
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
                        console.log(
                            "FORMATION-TEST: Name angeklickt = " +
                            name
                        );

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

                        delete currentLayouts[ownCityId][name];

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

        if (
            !layouts[ownCityId] ||
            !layouts[ownCityId][layoutName]
        ) {
            return;
        }

        var saved =
            layouts[ownCityId][layoutName];

        var currentCity =
            cities.get_CurrentCity();

        var cityID =
            currentCity.get_Id();

        var formation =
            currentOwnCity
        .get_CityArmyFormationsManager()
        .GetFormationByTargetBaseId(cityID);

        console.log(
            "FORMATION-TEST: Formation = " +
            (formation ? "GEFUNDEN" : "NICHT GEFUNDEN")
        );

        if (!formation) {
            return;
        }

        var armyUnits =
            formation.get_ArmyUnits();

        console.log(
            "FORMATION-TEST: armyUnits = " +
            (armyUnits ? "VORHANDEN" : "NULL")
        );

        if (!armyUnits) {
            return;
        }

        armyUnits = armyUnits.l;

        for (var i in saved.units) {

            var savedUnit = saved.units[i];

            for (var j in armyUnits) {

                if (armyUnits[j].get_Id() === savedUnit.id) {

                    armyUnits[j].MoveBattleUnit(
                        savedUnit.x,
                        savedUnit.y
                    );

                    break;
                }
            }
        }
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
        buildingSaverContainer.setHeight(125);
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
                top: 2
            }
        );

        offSaverContainer =
            new qx.ui.container.Composite();

        offSaverContainer.setLayout(
            new qx.ui.layout.Canvas()
        );

        offSaverContainer.setWidth(110);
        offSaverContainer.setHeight(45);
        offSaverContainer.setZIndex(9999);

        playArea.add(
            offSaverContainer,
            {
                left: 0,
                top: 70
            }
        );

        offButton =
            new qx.ui.form.Button("Formation");

        offButton.set({
            width: 100,
            height: 40,
            appearance: "button-text-small"
        });

        offSaverContainer.add(
            offButton,
            {
                left: 5,
                top: 2
            }
        );

        offButton.exclude();


        // ========================================================
        // FORMATION Button
        // ========================================================

        offButton.addListener(
            "execute",
            function () {
                openOffFormationSaver();
            }
        );
        // ========================================================
        // Sichtbarkeit nach Spielmodus
        // ========================================================

        buildingModeTimer =
            window.setInterval(function () {

            try {

                var currentMode =
                    ClientLib.Vis.VisMain
                .GetInstance()
                .get_Mode();



                if (currentMode === 1) {

                    if (offFormationContainer) {
                        offFormationContainer.destroy();
                        offFormationContainer = null;
                    }

                    buildingButton.show();
                    offButton.exclude();

                } else {

                    closeBuildingLayout();

                    buildingButton.exclude();
                    offButton.show();
                }

            } catch (e) {}

        }, 500);


        // ========================================================
        // LAYOUT Button
        // ========================================================

        buildingButton.addListener(
            "execute",
            function () {

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

            console.log(
                "%cLAYOUT-TEST: Initialisierung wartet noch.",
                "color: cyan; font-weight: bold;"
            );
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