// ==UserScript==
// @name        AllianceMemberOnline - HE
// @namespace   AllianceMemberOnline - HE
// @description Gives an overview of all online alliance members sorted by their member state.
// @version     0.1.10
// @author      f@nTisi & Harzi
// @description Original by ffi82, further developed by Harzi66
// @include     http*://*.alliances.commandandconquer.com/*
// @grant       GM_log
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @grant       GM_updatingEnabled
// @grant       unsafeWindow
// @grant       metadata
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Harzi-Edition/main/CnC-TA%20AllianceMemberOnline%20-%20Harzi%20Edition.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Harzi-Edition/main/CnC-TA%20AllianceMemberOnline%20-%20Harzi%20Edition.user.js
// ==/UserScript==

// Changelog Harzi Edition
//
//  0.1.10
// - Neu
// - Aufruf über die Scriptschnitstelle im Kopf des Browsergames
// - Farbliche Anpassung Hintergund und Anwesenheitsdarstellung
// - Automatische Anpassung der Fenstergröße nach Anzahl der Spieler bis max. 20
// - Im Tooltip werden jetzt die Basen des Spielers aufgelistet und die Weltkarte zentriert sich beim anklicken

(function() {
    'use strict';

    var AllianceMemberOnline0 = function() {

        var PlayerBases = {};

        window.AllianceMemberOnlineJumpToBase = function (baseId, x, y) {

            ClientLib.API.Util.SetPlayAreaView(
                ClientLib.Data.PlayerAreaViewMode.pavmNone,
                baseId,
                0,
                0
            );

            webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(
                x,
                y
            );

        };
        // ============================================================
        // Suche die vorhandene "Skripte"-Schaltfläche
        // ============================================================

        function findScriptsButton(widget) {

            if (!widget) {
                return null;
            }

            try {

                if (typeof widget.getLabel === "function") {

                    var label = widget.getLabel();

                    if (
                        label &&
                        (
                            label.toLowerCase() === "skripte" ||
                            label.toLowerCase() === "scripts"
                        )
                    ) {
                        return widget;
                    }
                }

                if (typeof widget.getValue === "function") {

                    var value = widget.getValue();

                    if (
                        value &&
                        (
                            value.toLowerCase() === "skripte" ||
                            value.toLowerCase() === "scripts"
                        )
                    ) {
                        return widget;
                    }
                }

                if (typeof widget.getChildren === "function") {

                    var children = widget.getChildren();

                    for (var i = 0; i < children.length; i++) {

                        var result = findScriptsButton(children[i]);

                        if (result) {
                            return result;
                        }
                    }
                }

            } catch (e) {

                console.log(
                    "AllianceMemberOnline: Fehler bei Suche nach Skripte-Button:",
                    e
                );
            }

            return null;
        }


        // ============================================================
        // AllianceMemberOnline Menüeintrag hinzufügen
        // ============================================================

        function addToScriptsMenu() {

            try {

                var app = qx.core.Init.getApplication();

                if (!app) {
                    return false;
                }

                var desktop = app.getDesktop();

                if (!desktop) {
                    return false;
                }

                var scriptsButton = findScriptsButton(desktop);

                if (!scriptsButton) {

                    console.log(
                        "AllianceMemberOnline: Skripte-Button noch nicht gefunden."
                    );

                    return false;
                }

                if (typeof scriptsButton.getMenu !== "function") {

                    console.log(
                        "AllianceMemberOnline: Der Skripte-Button besitzt kein getMenu()."
                    );

                    return false;
                }

                var menu = scriptsButton.getMenu();

                if (!menu) {

                    console.log(
                        "AllianceMemberOnline: Skripte-Button besitzt momentan kein Menü."
                    );

                    return false;
                }


                // ----------------------------------------------------
                // Verhindern, dass der Eintrag doppelt angelegt wird
                // ----------------------------------------------------

                var menuChildren = menu.getChildren();

                for (var i = 0; i < menuChildren.length; i++) {

                    var child = menuChildren[i];

                    if (
                        typeof child.getLabel === "function" &&
                        child.getLabel() === "AllianceMemberOnline"
                    ) {

                        return true;
                    }
                }


                // ----------------------------------------------------
                // Menüeintrag erzeugen
                // ----------------------------------------------------

                var menuItem =
                    new qx.ui.menu.Button("AllianceMemberOnline");

                menuItem.set({
                    toolTipText:
                    "Online-Mitglieder der Allianz anzeigen"
                });


                // ----------------------------------------------------
                // Klick auf Menüeintrag
                // ----------------------------------------------------

                menuItem.addListener(
                    "execute",
                    function() {

                        try {

                            var window =
                                AllianceMemberOnline.Window.getInstance();

                            if (window.isVisible()) {

                                console.log(
                                    "AllianceMemberOnline: Fenster schließen"
                                );

                                window.close();

                            } else {

                                console.log(
                                    "AllianceMemberOnline: Fenster öffnen"
                                );

                                window.open();
                            }

                        } catch (e) {

                            console.log(
                                "AllianceMemberOnline: Fehler beim Öffnen:",
                                e
                            );
                        }

                    }
                );


                menu.add(menuItem);

                console.log(
                    "AllianceMemberOnline: Menüeintrag erfolgreich hinzugefügt."
                );

                return true;

            } catch (e) {

                console.log(
                    "AllianceMemberOnline: Fehler beim Hinzufügen zum Skripte-Menü:",
                    e
                );

                return false;
            }
        }


        // ============================================================
        // Klassen erzeugen
        // ============================================================

        function createClass() {

            console.log(
                "AllianceMemberOnline: Starting creation of classes"
            );


            // ========================================================
            // Hauptklasse
            // ========================================================

            qx.Class.define("AllianceMemberOnline.Main", {

                type: "singleton",

                extend: qx.core.Object,


                construct: function() {

                    try {

                        console.log(
                            "AllianceMemberOnline: Initializing"
                        );

                        // Kein eigener Button mehr.
                        // Start erfolgt über die Skripte-Leiste.

                    } catch (e) {

                        console.log(
                            "AllianceMemberOnline: Failed to initialize:",
                            e
                        );
                    }

                    console.log(
                        "AllianceMemberOnline: loaded"
                    );
                },


                destruct: function() {},

                PlayerBases: {},


                members: {

                    __openAllianceMemberOnlineWindow:
                    function() {

                        var AllianceMemberOnlineWindow =
                            AllianceMemberOnline.Window.getInstance();

                        if (
                            AllianceMemberOnlineWindow.isVisible()
                        ) {

                            console.log(
                                "AllianceMemberOnline: closing window"
                            );

                            AllianceMemberOnlineWindow.close();

                        } else {

                            console.log(
                                "AllianceMemberOnline: opening window"
                            );

                            AllianceMemberOnlineWindow.open();
                        }
                    }
                }
            });


            // ========================================================
            // Farbiger Renderer
            // Grün = Online
            // Gelb = Away
            // ========================================================

            qx.Class.define(
                "AllianceMemberOnline.NameCellRenderer",
                {

                    extend:
                    qx.ui.table.cellrenderer.Default,

                    members: {

                        _getContentHtml:
                        function(cellInfo) {

                            var value =
                                cellInfo.value || "";

                            var color =
                                "#00FF00";


                            // Away = Gelb
                            if (
                                value.indexOf(">>") === 0
                            ) {

                                color =
                                    "#FFFF00";
                            }


                            // HTML absichern
                            value =
                                value
                                .replace(
                                /&/g,
                                "&amp;"
                            )
                                .replace(
                                /</g,
                                "&lt;"
                            )
                                .replace(
                                />/g,
                                "&gt;"
                            )
                                .replace(
                                /"/g,
                                "&quot;"
                            );


                            return (
                                '<div style="' +
                                'color:' + color + ';' +
                                'background-color:#202020;' +
                                'width:100%;' +
                                'height:100%;' +
                                '">' +
                                value +
                                '</div>'
                            );
                        }
                    }
                }
            );


            // ========================================================
            // Fensterklasse
            // ========================================================

            qx.Class.define(
                "AllianceMemberOnline.Window",
                {

                    type: "singleton",

                    extend:
                    qx.ui.window.Window,


                    // ==================================================
                    // Konstruktor
                    // ==================================================

                    construct: function() {

                        try {

                            console.log(
                                "Creating AllianceMemberOnline.Window"
                            );


                            this.base(arguments);


                            this.setLayout(
                                new qx.ui.layout.Canvas()
                            );


                            this.set({

                                width: 150,

                                caption:
                                "Online Members",

                                allowMaximize:
                                false,

                                showMaximize:
                                false,

                                allowMinimize:
                                false,

                                showMinimize:
                                false,

                                resizable:
                                false
                            });


                            // ==================================================
                            // Tabellenmodell
                            // ==================================================

                            this.model =
                                new qx.ui.table.model.Simple();


                            this.model.setColumns([
                                "Role",
                                "Name",
                                "OnlineState",
                                "RoleText"
                            ]);


                            this.model.sortByColumn(
                                1,
                                true
                            );


                            // ==================================================
                            // Tabelle
                            // ==================================================

                            this.list =
                                new qx.ui.table.Table(
                                this.model
                            );


                            // Dunkler Hintergrund
                            this.list.setBackgroundColor(
                                "#202020"
                            );


                            // Farbiger Namensrenderer
                            var nameColumnRenderer =
                                new AllianceMemberOnline
                            .NameCellRenderer();


                            this.list
                                .getTableColumnModel()
                                .setDataCellRenderer(
                                1,
                                nameColumnRenderer
                            );


                            this.list
                                .setColumnVisibilityButtonVisible(
                                false
                            );


                            this.list.setColumnWidth(
                                0,
                                0
                            );

                            this.list.setColumnWidth(
                                1,
                                130
                            );

                            this.list.setColumnWidth(
                                2,
                                0
                            );

                            this.list.setColumnWidth(
                                3,
                                0
                            );


                            // ==================================================
                            // WICHTIG:
                            // Keine feste Mindesthöhe mehr!
                            //
                            // Startgröße wird durch updateWindowSize()
                            // auf 3 Zeilen gesetzt.
                            // ==================================================

                            this.list.set({
                                width: 130,
                                height: 76,
                                minHeight: 76
                            });


                            var tModel =
                                this.list.getTableColumnModel();


                            tModel.setColumnVisible(
                                0,
                                false
                            );

                            tModel.setColumnVisible(
                                2,
                                false
                            );

                            tModel.setColumnVisible(
                                3,
                                false
                            );


                            this.list.setStatusBarVisible(
                                false
                            );


                            // ==================================================
                            // Tabelle ins Fenster
                            // ==================================================

                            this.add(
                                this.list,
                                {
                                    bottom: 0,
                                    left: 0
                                }
                            );


                            // ==================================================
                            // Dunkler freier Bereich
                            // ==================================================

                            this.list.addListenerOnce(
                                "appear",
                                function() {

                                    try {

                                        var scrollers =
                                            this.list
                                        .getPaneScrollerArr();


                                        scrollers.forEach(
                                            function(scroller) {

                                                var pane =
                                                    scroller
                                                .getChildControl(
                                                    "pane"
                                                );


                                                if (
                                                    pane &&
                                                    pane.getContentElement
                                                ) {

                                                    pane
                                                        .getContentElement()
                                                        .setStyle(
                                                        "backgroundColor",
                                                        "#202020"
                                                    );
                                                }

                                            }
                                        );

                                    } catch (e) {

                                        console.log(
                                            "Pane color error:",
                                            e
                                        );
                                    }

                                },
                                this
                            );


                            // ==================================================
                            // Tooltip
                            // ==================================================

                            this.list.addListener(
                                "mousemove",
                                function(e) {

                                    var cell =
                                        this.getCellUnderMouse(
                                            this.list,
                                            e
                                        );


                                    var row =
                                        cell.row;

                                    var col =
                                        cell.col;


                                    if (
                                        (row >= 0) &&
                                        (col >= 0)
                                    ) {

                                        if (
                                            (this._curTtRow != row) ||
                                            (this._curTtCol != col)
                                        ) {

                                            this.list.setToolTipText(
                                                ""
                                            );


                                            var ttManager =
                                                qx.ui.tooltip.Manager
                                            .getInstance();


                                            ttManager.resetCurrent();


                                            var ttText =
                                                this._onGetToolTipText(
                                                    this.list,
                                                    row,
                                                    col
                                                );


                                            if (
                                                ttText &&
                                                (ttText !== "")
                                            ) {

                                                this.list.setToolTipText(
                                                    ttText
                                                );


                                                ttManager.showToolTip(
                                                    this.list
                                                );
                                            }
                                        }

                                    } else {

                                        if (
                                            (this._curTtRow >= 0) &&
                                            (this._curTtCol >= 0)
                                        ) {

                                            this.list.setToolTipText(
                                                ""
                                            );


                                            var ttManager =
                                                qx.ui.tooltip.Manager
                                            .getInstance();


                                            ttManager.resetCurrent();
                                        }
                                    }


                                    this._curTtRow =
                                        row;

                                    this._curTtCol =
                                        col;

                                },
                                this
                            );


                            // ==================================================
                            // Timer
                            // ==================================================

                            var timer =
                                qx.util.TimerManager
                            .getInstance();


                            timer.start(

                                function() {

                                    console.log(
                                        "AllianceMemberOnline: Timer function running"
                                    );


                                    var alliance =
                                        ClientLib.Data.MainData
                                    .GetInstance()
                                    .get_Alliance();


                                    alliance.RefreshMemberData();


                                    var members =
                                        alliance
                                    .get_MemberDataAsArray();


                                    var rowArr = [];


                                    // ==================================================
                                    // Mitglieder durchlaufen
                                    // ==================================================

                                    for (
                                        var i = 0;
                                        i < alliance.get_NumMembers();
                                        i++
                                    ) {

                                        var member =
                                            members[i];


                                        if (!member) {
                                            continue;
                                        }


                                        var name =
                                            member.Name;

                                        (function (memberId, memberName) {

                                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand(
                                                'GetPublicPlayerInfo',
                                                { id: memberId },
                                                webfrontend.phe.cnc.Util.createEventDelegate(
                                                    ClientLib.Net.CommandResult,
                                                    null,
                                                    function (context, data) {

                                                        var baseNames = data.c.map(function (city) {
                                                            return {
                                                                id: city.i,
                                                                name: city.n,
                                                                x: city.x,
                                                                y: city.y
                                                            };
                                                        });

                                                        PlayerBases[memberId] = baseNames;

                                                        console.log(
                                                            "%cAllianceMemberOnline: Basen von %c" + memberName,
                                                            "color: #00FF00; font-weight: bold;",
                                                            "color: #FFFF00; font-weight: bold;",
                                                            baseNames
                                                        );

                                                    }
                                                ),
                                                function (error) {

                                                    console.error(
                                                        "AllianceMemberOnline: GetPublicPlayerInfo FEHLER für " +
                                                        memberName,
                                                        error
                                                    );

                                                }
                                            );

                                        })(member.Id, member.Name);

                                        // Away = >>
                                        if (
                                            member.OnlineState ==
                                            ClientLib.Data.EMemberOnlineState.Away
                                        ) {

                                            name =
                                                ">>" + name;
                                        }


                                        // Online oder Away
                                        if (
                                            member.OnlineState ==
                                            ClientLib.Data.EMemberOnlineState.Online ||

                                            member.OnlineState ==
                                            ClientLib.Data.EMemberOnlineState.Away
                                        ) {

                                            rowArr.push([
                                                member.Role,
                                                name,
                                                member.OnlineState,
                                                member.RoleName
                                            ]);


                                            console.log(
                                                member.Role +
                                                " - " +
                                                member.Name
                                            );


                                            console.log(
                                                "AllianceMemberOnlineView: " +
                                                member.Name +
                                                " - " +
                                                member.OnlineState
                                            );
                                        }
                                    }


                                    // ==================================================
                                    // Tabelle aktualisieren
                                    // ==================================================

                                    this.model.removeRows(
                                        0,
                                        this.model.getRowCount(),
                                        true
                                    );


                                    this.model.setData(
                                        rowArr
                                    );


                                    this.model.sortByColumn(
                                        0,
                                        true
                                    );


                                    // ==================================================
                                    // Fenstergröße aktualisieren
                                    // ==================================================

                                    this.updateWindowSize();

                                },

                                5000,

                                this,

                                null,

                                1000
                            );


                        } catch (e) {

                            console.log(
                                "Failed to initialize AllianceMemberOnline.Window"
                            );

                            console.log(e);
                        }


                        console.log(
                            "AllianceMemberOnline: Window loaded"
                        );
                    },


                    destruct:
                    function() {},


                    // ========================================================
                    // Mitglieder / Tabelle
                    // ========================================================

                    members: {

                        model:
                        null,

                        list:
                        null,


                        // ====================================================
                        // Fenstergröße dynamisch anpassen
                        // ====================================================

                        // ============================================================
                        // Fenstergröße automatisch an Anzahl der Spieler anpassen
                        // ============================================================

                        updateWindowSize: function() {

                            var rowCount = this.model.getRowCount();

                            // ------------------------------------------------------------
                            // Mindestanzahl sichtbarer Member
                            // ------------------------------------------------------------

                            var minRows = 3;

                            // ------------------------------------------------------------
                            // Maximale Anzahl sichtbarer Member
                            // Ab dem 21. Member wird gescrollt.
                            // ------------------------------------------------------------

                            var maxRows = 20;

                            // ------------------------------------------------------------
                            // Anzahl der tatsächlich sichtbaren Zeilen
                            // ------------------------------------------------------------

                            var visibleRows = Math.max(
                                minRows,
                                Math.min(rowCount, maxRows)
                            );

                            // ------------------------------------------------------------
                            // Tabellenzeilenhöhe
                            //
                            // C&C TA verwendet hier ungefähr 20 Pixel.
                            // ------------------------------------------------------------

                            var rowHeight = 20;

                            // ------------------------------------------------------------
                            // Tabellenkopf
                            // ------------------------------------------------------------

                            var headerHeight = 22;

                            // ------------------------------------------------------------
                            // Zusätzlicher Platz für die Fensterrahmen/Titelleiste
                            // ------------------------------------------------------------

                            var windowExtraHeight = 56;

                            // ------------------------------------------------------------
                            // Höhe der Tabelle berechnen
                            // ------------------------------------------------------------

                            var tableHeight =
                                headerHeight +
                                (visibleRows * rowHeight) +
                                18;

                            // ------------------------------------------------------------
                            // Höhe des Fensters berechnen
                            // ------------------------------------------------------------

                            var windowHeight =
                                tableHeight +
                                windowExtraHeight;

                            // ------------------------------------------------------------
                            // Tabelle anpassen
                            // ------------------------------------------------------------

                            this.list.setHeight(
                                tableHeight
                            );

                            // ------------------------------------------------------------
                            // Fenster anpassen
                            // ------------------------------------------------------------

                            this.setHeight(
                                windowHeight
                            );

                            console.log(
                                "AllianceMemberOnline: " +
                                rowCount +
                                " Member | " +
                                visibleRows +
                                " sichtbar | " +
                                "Fensterhöhe: " +
                                windowHeight
                            );
                        },


                        // ====================================================
                        // Tabellenzelle unter Maus ermitteln
                        // ====================================================

                        getCellUnderMouse:
                        function(
                        table,
                         mouseEvent
                        ) {

                            var row =
                                -1;

                            var col =
                                -1;


                            if (
                                table &&
                                mouseEvent
                            ) {

                                var pageX =
                                    mouseEvent
                                .getDocumentLeft();


                                var pageY =
                                    mouseEvent
                                .getDocumentTop();


                                var sc =
                                    table
                                .getTablePaneScrollerAtPageX(
                                    pageX
                                );


                                if (sc) {

                                    row =
                                        sc._getRowForPagePos(
                                        pageX,
                                        pageY
                                    );


                                    col =
                                        sc._getColumnForPageX(
                                        pageX
                                    );


                                    if (
                                        row === null ||
                                        row === undefined
                                    ) {

                                        row =
                                            -1;
                                    }


                                    if (
                                        col === null ||
                                        col === undefined
                                    ) {

                                        col =
                                            -1;
                                    }
                                }
                            }


                            return {
                                row: row,
                                col: col
                            };
                        },


                        // ====================================================
                        // Tooltiptext
                        // ====================================================

                        _onGetToolTipText: function(
                        table,
                         row,
                         col
                        ) {

                            var playerName =
                                this.model.getValue(1, row);

                            if (playerName.indexOf(">>") === 0) {
                                playerName = playerName.substring(2);
                            }

                            var memberId = null;

                            var members =
                                ClientLib.Data.MainData.GetInstance()
                            .get_Alliance()
                            .get_MemberDataAsArray();

                            for (var i = 0; i < members.length; i++) {

                                if (
                                    members[i] &&
                                    members[i].Name === playerName
                                ) {
                                    memberId = members[i].Id;
                                    break;
                                }
                            }

                            if (memberId !== null) {

                                var bases =
                                    PlayerBases[memberId];

                                console.log(
                                    "AllianceMemberOnline TOOLTIP:",
                                    playerName,
                                    "ID:",
                                    memberId,
                                    "Basen:",
                                    bases
                                );

                                if (bases && bases.length) {

                                    var html = "";

                                    for (var j = 0; j < bases.length; j++) {

                                        html +=
                                            "<div " +
                                            "style='cursor:pointer; color:#FFFF00; margin-bottom:3px;' " +
                                            "onclick=\"window.AllianceMemberOnlineJumpToBase(" +
                                            bases[j].id +
                                            "," +
                                            bases[j].x +
                                            "," +
                                            bases[j].y +
                                            ")\">" +
                                            bases[j].name +
                                            "</div>";

                                    }
                                    return html;
                                }
                                return "Keine Basen geladen";
                            }

                            return "";
                        }
                    }
                }
            );
        }
        // ============================================================
        // Warten bis das Spiel geladen ist
        // ============================================================

        function AllianceMemberOnline_checkIfLoaded() {

            try {

                if (
                    typeof qx != 'undefined' &&

                    qx.core.Init.getApplication() &&

                    qx.core.Init
                    .getApplication()
                    .getUIItem(
                        ClientLib.Data.Missions.PATH.BAR_NAVIGATION
                    ) &&

                    qx.core.Init
                    .getApplication()
                    .getUIItem(
                        ClientLib.Data.Missions.PATH.BAR_NAVIGATION
                    )
                    .isVisible()
                ) {

                    createClass();


                    window.AllianceMemberOnline.Main
                        .getInstance();


                    // ====================================================
                    // Auf Skripte-Leiste warten
                    // ====================================================

                    var menuAdded =
                        false;


                    var menuTimer =
                        window.setInterval(

                            function() {

                                if (!menuAdded) {

                                    menuAdded =
                                        addToScriptsMenu();
                                }


                                if (menuAdded) {

                                    window.clearInterval(
                                        menuTimer
                                    );
                                }

                            },

                            1000
                        );


                } else {

                    window.setTimeout(
                        AllianceMemberOnline_checkIfLoaded,
                        1000
                    );
                }


            } catch (e) {

                console.log(
                    "AllianceMemberOnline_checkIfLoaded:",
                    e
                );


                window.setTimeout(
                    AllianceMemberOnline_checkIfLoaded,
                    1000
                );
            }
        }


        // ============================================================
        // Start
        // ============================================================

        if (
            /commandandconquer\.com/i.test(
                document.domain
            )
        ) {

            window.setTimeout(
                AllianceMemberOnline_checkIfLoaded,
                1000
            );
        }
    };


    // ================================================================
    // Script in die Spielumgebung injizieren
    // ================================================================

    try {

        var script =
            document.createElement("script");


        script.innerHTML =
            "(" +
            AllianceMemberOnline0.toString() +
            ")();";


        script.type =
            "text/javascript";


        if (
            /commandandconquer\.com/i.test(
                document.domain
            )
        ) {

            document
                .getElementsByTagName("head")[0]
                .appendChild(script);
        }

    } catch (e) {

        console.log(
            "AllianceMemberOnline init error:",
            e
        );
    }

})();
