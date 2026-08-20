// ==UserScript==
// @name        C&C TA Raidhelper - HE
// @namespace   https://github.com/Harzi66
// @version     0.3.0
// @description Raidhelper mit frei einstellbarer Lower Range und Anzeige der Zielhöhe.
// @author      Mooff
// @contributor alexos75 (Original)
// @contributor leo7044 (Original / Weiterentwicklung)
// @contributor Harzi (Original / Weiterentwicklung)
// @include     http*://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @include     http*://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL https://raw.githubusercontent.com/Harzi66/CnC-TA-Raidhelper-HE/main/C%26C%20TA%20Raidhelper%20-%20HE-0.3.0.user.js
// @updateURL   https://raw.githubusercontent.com/Harzi66/CnC-TA-Raidhelper-HE/main/C%26C%20TA%20Raidhelper%20-%20HE-0.3.0.user.js
// @grant       none
// ==/UserScript==
/* Based on the script of Mooff */
function initRaidhelperButton(){

    // section for settings ->
    var lowerRange = 2;
    var upperRange = 99;
    var hideColleaquesInfos = true;
    var hidePoiInfos = true;
    // <- section for settings

    var activeText = "Clear View";
    var inactiveText = "Show All";
    var minimumlevel = 0;
    var maximumlevel = 0;
    var HCBtn = new qx.ui.form.Button(activeText);
    var active = false;
    var settingsWindow = null;
    var applySettingsFunction = null;;

    HCBtn.set({
        width: 80,
        appearance: "button-text-small",
        toolTipText: "Makes interesting targets more visible"
    });

    function openRaidhelperSettings()
    {
        // Fenster bereits geöffnet?
        if (settingsWindow)
        {
            settingsWindow.open();
            settingsWindow.activate();

            HCBtn.set({
                label: "Anwenden"
            });

            return;
        }

        var currCity =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        var offense = currCity.get_LvlOffense();
        var defense = currCity.get_LvlDefense();
        var baseLevel = Math.max(offense, defense);

        settingsWindow =
            new qx.ui.window.Window("Raidhelper - HE");

        settingsWindow.set({
            width: 280,
            height: 210,
            allowMaximize: false,
            allowMinimize: false,
            showMaximize: false,
            showMinimize: false,
            resizable: false,
            modal: true
        });

        settingsWindow.setLayout(
            new qx.ui.layout.VBox(10)
        );

        var infoLabel =
            new qx.ui.basic.Label(
                "Aktuelle Basiswerte:"
            );

        var hintLabel =
            new qx.ui.basic.Label(
                "Lower Range unten einstellen oder ändern."
            );

        hintLabel.set({
            textColor: "#FFFF00"
        });

        var offenseLabel =
            new qx.ui.basic.Label(
                "Offensivstufe: " +
                offense.toFixed(2)
            );

        var defenseLabel =
            new qx.ui.basic.Label(
                "Deffhöhe: " +
                defense.toFixed(2)
            );

        infoLabel.set({
            textColor: "#FFFF00"
        });

        offenseLabel.set({
            textColor: "#FFFF00"
        });

        defenseLabel.set({
            textColor: "#FFFF00"
        });

        var lowerLabel =
            new qx.ui.basic.Label(
                "Lower Range:"
            );

        lowerLabel.set({
            textColor: "#FFFF00"
        });

        var lowerField =
            new qx.ui.form.TextField(
                lowerRange.toFixed(2)
            );

        var targetLabel =
            new qx.ui.basic.Label(
                "Erwartete Zielhöhe Lager/ Vopo: " +
                (baseLevel - lowerRange).toFixed(2)
            );

        targetLabel.set({
            textColor: "#FFFF00"
        });

        lowerField.addListener(
            "input",
            function()
            {
                var value =
                    parseFloat(
                        lowerField.getValue().replace(",", ".")
                    );

                if (!isNaN(value) && value >= 0)
                {
                    targetLabel.set({
                        value:
                        "Erwartete Zielhöhe " +
                        (baseLevel - value).toFixed(2)
                    });
                }
                else
                {
                    targetLabel.set({
                        value: "Erwartete Zielhöhe: -"
                    });
                }
            }
        );

        var buttonContainer =
            new qx.ui.container.Composite(
                new qx.ui.layout.HBox(10)
            );

        var applyButton =
            new qx.ui.form.Button("Anwenden");

        var cancelButton =
            new qx.ui.form.Button("Abbrechen");

        buttonContainer.add(applyButton);
        buttonContainer.add(cancelButton);

        settingsWindow.add(infoLabel);
        settingsWindow.add(offenseLabel);

        settingsWindow.add(defenseLabel);

        settingsWindow.add(hintLabel);

        settingsWindow.add(lowerLabel);
        settingsWindow.add(lowerField);
        settingsWindow.add(targetLabel);

        settingsWindow.add(buttonContainer);


        // Gemeinsame Funktion für beide "Anwenden"-Buttons
        applySettingsFunction = function()
        {
            var value =
                parseFloat(
                    lowerField.getValue().replace(",", ".")
                );

            if (isNaN(value) || value < 0)
            {
                qx.ui.dialog.Manager.getInstance()
                    .alert(
                    "Bitte einen gültigen Wert eingeben."
                );

                return;
            }

            lowerRange = value;

            // Filter anwenden
            applyRaidhelperFilter();

            active = true;

            // Nach jedem Anwenden:
            // Hauptbutton wird zu Show All
            HCBtn.set({
                label: inactiveText
            });

            settingsWindow.close();
        };


        // Anwenden im Einstellungsfenster
        applyButton.addListener(
            "execute",
            function()
            {
                applySettingsFunction();
            }
        );


        // Abbrechen
        cancelButton.addListener(
            "execute",
            function()
            {
                applySettingsFunction = null;

                settingsWindow.close();

                HCBtn.set({
                    label: active ? "Show All" : activeText
                });
            }
        );


        settingsWindow.addListener(
            "close",
            function()
            {
                settingsWindow.destroy();
                settingsWindow = null;
            }
        );


        qx.core.Init.getApplication()
            .getDesktop()
            .add(settingsWindow);

        settingsWindow.open();
        settingsWindow.center();
        settingsWindow.activate();

        // Clear View wird sofort zu Anwenden
        HCBtn.set({
            label: "Anwenden"
        });
    }


    function restoreAllInfos()
    {
        var currCity =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        var x = currCity.get_X();
        var y = currCity.get_Y();

        var region =
            ClientLib.Vis.VisMain.GetInstance()
        .get_Region();

        var attackDistance =
            ClientLib.Data.MainData.GetInstance()
        .get_Server()
        .get_MaxAttackDistance();

        for (
            var i = x - attackDistance;
            i < x + attackDistance;
            i++
        )
        {
            for (
                var j = y - attackDistance;
                j < y + attackDistance;
                j++
            )
            {
                var visObject =
                    region.GetObjectFromPosition(
                        i * region.get_GridWidth(),
                        j * region.get_GridHeight()
                    );

                if (visObject != null)
                {
                    if (
                        visObject.get_VisObjectType() ==
                        ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp
                    )
                    {
                        visObject.ShowInfos();
                    }
                    else if (
                        (
                            visObject.get_VisObjectType() ==
                            ClientLib.Vis.VisObject.EObjectType.RegionCityType &&
                            hideColleaquesInfos
                        ) ||
                        (
                            visObject.get_VisObjectType() ==
                            ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest &&
                            hidePoiInfos
                        )
                    )
                    {
                        visObject.ShowInfos();
                    }
                }
            }
        }
    }


    function applyRaidhelperFilter()
    {
        var currentCity =
            ClientLib.Data.MainData.GetInstance()
        .get_Cities()
        .get_CurrentOwnCity();

        var offense = currentCity.get_LvlOffense();
        var defense = currentCity.get_LvlDefense();

        // Der höhere Wert ist die Grundlage
        var baseLevel = Math.max(offense, defense);

        // Grenzen berechnen
        minimumlevel = baseLevel - lowerRange;
        maximumlevel = baseLevel + upperRange;

        var x = currentCity.get_X();
        var y = currentCity.get_Y();

        var region =
            ClientLib.Vis.VisMain.GetInstance()
        .get_Region();

        var attackDistance =
            ClientLib.Data.MainData.GetInstance()
        .get_Server()
        .get_MaxAttackDistance();

        for (
            var i = x - attackDistance;
            i < x + attackDistance;
            i++
        )
        {
            for (
                var j = y - attackDistance;
                j < y + attackDistance;
                j++
            )
            {
                var visObject =
                    region.GetObjectFromPosition(
                        i * region.get_GridWidth(),
                        j * region.get_GridHeight()
                    );

                if (visObject != null)
                {
                    if (
                        visObject.get_VisObjectType() ==
                        ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp
                    )
                    {
                        // Angezeigte Lagerstufe
                        var lvl =
                            Math.round(
                                visObject.get_BaseLevelFloat()
                            );

                        if (
                            lvl < minimumlevel ||
                            lvl > maximumlevel
                        )
                        {
                            visObject.HideInfos();
                        }
                        else
                        {
                            visObject.ShowInfos();
                        }
                    }
                    else if (
                        (
                            visObject.get_VisObjectType() ==
                            ClientLib.Vis.VisObject.EObjectType.RegionCityType &&
                            hideColleaquesInfos
                        ) ||
                        (
                            visObject.get_VisObjectType() ==
                            ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest &&
                            hidePoiInfos
                        )
                    )
                    {
                        visObject.HideInfos();
                    }
                }
            }
        }
    }


    // Hauptbutton
    HCBtn.addListener(
        "execute",
        function()
        {
            // Einstellungsfenster geöffnet:
            // Hauptbutton "Anwenden" macht dasselbe
            // wie der Anwenden-Button im Fenster.
            if (settingsWindow && applySettingsFunction)
            {
                applySettingsFunction();
                return;
            }

            // Filter aktiv:
            // ursprüngliche Anzeige wiederherstellen.
            if (active)
            {
                restoreAllInfos();

                active = false;

                HCBtn.set({
                    label: activeText
                });

                return;
            }

            // Filter nicht aktiv:
            // immer das Einstellungsfenster öffnen.
            openRaidhelperSettings();
        }
    );
    var app = qx.core.Init.getApplication();

    app.getDesktop().add(HCBtn, {
        right: 125,
        bottom: 55
    });
}
/*Main*/
function waitForClientLib(){

    if ((typeof ClientLib == 'undefined') || (typeof qx == 'undefined') || (qx.core.Init.getApplication().initDone == false))
    {
        setTimeout(waitForClientLib, 1000);
        return;
    }
    else{    
       initRaidhelperButton();
    }

}
function startup(){

    setTimeout(waitForClientLib, 1000);

};
startup();
