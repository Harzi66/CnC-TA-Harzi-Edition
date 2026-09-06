// ==UserScript==
// @name         CnC-TA Allianz PvP-PvE - HE
// @namespace    https://github.com/Harzi66/CnC-TA-Harzi-Edition
// @version      0.6.0
// @description  Zeigt PvP- und PvE-Ergebnisse der Mitglieder der eigenen Allianz im Allianzfenster.
// @author       Harzi
// @match        https://*.alliances.commandandconquer.com/*/index.aspx*
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Allianz-PvP-PvE-HE/main/CnC-TA%20Allianz%20PvP-PvE%20-%20HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Allianz-PvP-PvE-HE/main/CnC-TA%20Allianz%20PvP-PvE%20-%20HE.user.js
// @grant        none
// ==/UserScript==

(function () {

    'use strict';

    const SCRIPT = '[Alliance PvP/PvE HE]';
    const USERDATA_KEY = 'Harzi_AlliancePvPPvE';

    let ownAllianceId = null;
    let ownAllianceName = null;
    let ownAllianceAbbreviation = null;

    let activeAllianceId = null;
    let activeAllianceName = null;

    let openToken = 0;
    let dataToken = 0;

    let hooksInstalled = false;
    let firstScanDone = false;

    const processedTabViews = new Set();

    console.log(
        '%c' + SCRIPT + ' geladen',
        'color:lime;font-weight:bold'
    );


    // ============================================================
    // EIGENE ALLIANZ
    // ============================================================

    function updateOwnAllianceInfo() {

        try {

            const alliance =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_Alliance();

            if (!alliance) {
                return false;
            }

            if (typeof alliance.get_Id === 'function') {
                ownAllianceId =
                    Number(alliance.get_Id());
            }

            if (typeof alliance.get_Name === 'function') {
                ownAllianceName =
                    String(alliance.get_Name() || '');
            }

            if (typeof alliance.get_Abbreviation === 'function') {
                ownAllianceAbbreviation =
                    String(alliance.get_Abbreviation() || '');
            }

            return (
                ownAllianceId !== null &&
                !isNaN(ownAllianceId)
            );

        } catch (e) {

            console.error(
                SCRIPT,
                'Eigene Allianz ermitteln:',
                e
            );

            return false;
        }
    }


    // ============================================================
    // AKTUELLE ALLIANZ
    // ============================================================

    function setActiveAlliance(id, name) {

        const oldId =
              activeAllianceId;

        activeAllianceId =
            id === null || id === undefined
            ? null
        : Number(id);

        activeAllianceName =
            name
            ? String(name)
        : null;

        if (
            oldId !== activeAllianceId
        ) {

            console.log(
                '%c' + SCRIPT +
                ' Allianzwechsel: ' +
                oldId +
                ' → ' +
                activeAllianceId,
                'color:cyan;font-weight:bold'
            );

            clearAllOurTabs();

            processedTabViews.clear();

            dataToken++;
            openToken++;
        }
    }


    function setActiveAllianceForeign() {

        console.log(
            '%c' + SCRIPT +
            ' Fremde Allianz erkannt',
            'color:orange;font-weight:bold'
        );

        activeAllianceId = -1;
        activeAllianceName = null;

        clearAllOurTabs();

        processedTabViews.clear();

        dataToken++;
        openToken++;
    }


    function isOwnAlliance() {

        return (
            ownAllianceId !== null &&
            activeAllianceId !== null &&
            Number(activeAllianceId) ===
            Number(ownAllianceId)
        );
    }


    // ============================================================
    // ALLIANZNAME PRÜFEN
    // ============================================================

    function isOwnAllianceName(value) {

        if (!value) {
            return false;
        }

        const text =
              String(value)
        .trim()
        .toLowerCase();

        if (
            ownAllianceName &&
            text ===
            ownAllianceName
            .trim()
            .toLowerCase()
        ) {
            return true;
        }

        if (
            ownAllianceAbbreviation &&
            text ===
            ownAllianceAbbreviation
            .trim()
            .toLowerCase()
        ) {
            return true;
        }

        return false;
    }


    // ============================================================
    // ALLIANZ-INFOS AUS ARGUMENTEN ERMITTELN
    // ============================================================

    function extractAllianceInfo(
    value,
     depth,
     result
    ) {

        if (
            value === null ||
            value === undefined ||
            depth > 4
        ) {
            return;
        }

        const type =
              typeof value;


        if (
            type === 'string'
        ) {

            if (!result.name) {
                result.name = value;
            }

            return;
        }


        if (
            type === 'number'
        ) {

            if (
                result.id === null &&
                value > 0
            ) {

                result.id =
                    value;
            }

            return;
        }


        if (
            type !== 'object'
        ) {
            return;
        }


        const idKeys = [
            'allianceId',
            'AllianceId',
            'allianceID',
            'AllianceID',
            'alliance_id',
            'Alliance_Id'
        ];


        const nameKeys = [
            'allianceName',
            'AllianceName',
            'Alliance',
            'alliance',
            'Alliance_Name',
            'name',
            'Name'
        ];


        for (
            let i = 0;
            i < idKeys.length;
            i++
        ) {

            const key =
                  idKeys[i];

            try {

                if (
                    value[key] !== undefined &&
                    value[key] !== null
                ) {

                    const id =
                          Number(
                              value[key]
                          );

                    if (
                        id > 0
                    ) {

                        result.id =
                            id;
                    }
                }

            } catch (e) {}
        }


        for (
            let i = 0;
            i < nameKeys.length;
            i++
        ) {

            const key =
                  nameKeys[i];

            try {

                if (
                    value[key] !== undefined &&
                    value[key] !== null &&
                    typeof value[key] !== 'object'
                ) {

                    const name =
                          String(
                              value[key]
                          );

                    if (
                        name
                    ) {

                        result.name =
                            name;
                    }
                }

            } catch (e) {}
        }


        /*
         * Typische C&C-TA-Objekte
         */
        try {

            if (
                typeof value.get_AllianceId ===
                'function'
            ) {

                const id =
                      Number(
                          value.get_AllianceId()
                      );

                if (
                    id > 0
                ) {

                    result.id =
                        id;
                }
            }

        } catch (e) {}


        try {

            if (
                typeof value.get_AllianceName ===
                'function'
            ) {

                const name =
                      String(
                          value.get_AllianceName() ||
                          ''
                      );

                if (
                    name
                ) {

                    result.name =
                        name;
                }
            }

        } catch (e) {}


        const nestedKeys = [
            'alliance',
            'Alliance',
            'detail',
            'Detail',
            'data',
            'Data',
            'result',
            'Result'
        ];


        for (
            let i = 0;
            i < nestedKeys.length;
            i++
        ) {

            const key =
                  nestedKeys[i];

            try {

                if (
                    value[key] &&
                    typeof value[key] ===
                    'object'
                ) {

                    extractAllianceInfo(
                        value[key],
                        depth + 1,
                        result
                    );
                }

            } catch (e) {}
        }
    }


    function resolveAllianceFromArguments(
    args
    ) {

        const result = {
            id: null,
            name: null
        };


        for (
            let i = 0;
            i < args.length;
            i++
        ) {

            extractAllianceInfo(
                args[i],
                0,
                result
            );
        }


        return result;
    }


    // ============================================================
    // KLEINES ALLIANZFENSTER
    // ============================================================

    function installAllianceInfoHook() {

        try {

            if (
                typeof webfrontend === 'undefined' ||
                !webfrontend.gui ||
                !webfrontend.gui.info ||
                !webfrontend.gui.info.AllianceInfoWindow
            ) {

                return false;
            }


            const proto =
                  webfrontend.gui.info
            .AllianceInfoWindow
            .prototype;


            if (!proto) {
                return false;
            }


            // ----------------------------------------------------
            // openWithAllianceId
            // ----------------------------------------------------

            if (
                typeof proto.openWithAllianceId ===
                'function' &&
                !proto.__harziPvPPvEIdHook
            ) {

                const originalId =
                      proto.openWithAllianceId;


                proto.openWithAllianceId =
                    function () {

                    const args =
                          Array.prototype.slice.call(
                              arguments
                          );


                    const info =
                          resolveAllianceFromArguments(
                              args
                          );


                    let id =
                        info.id;


                    if (
                        id === null &&
                        args.length > 0
                    ) {

                        id =
                            Number(
                            args[0]
                        );
                    }


                    console.log(
                        SCRIPT,
                        'openWithAllianceId:',
                        id
                    );


                    setActiveAlliance(
                        id,
                        info.name
                    );


                    const result =
                          originalId.apply(
                              this,
                              arguments
                          );


                    scheduleProcess();


                    return result;
                };


                proto.__harziPvPPvEIdHook =
                    true;
            }


            // ----------------------------------------------------
            // openWithAllianceNameOrAbbreviation
            // ----------------------------------------------------

            if (
                typeof proto
                .openWithAllianceNameOrAbbreviation ===
                'function' &&
                !proto.__harziPvPPvENameHook
            ) {

                const originalName =
                      proto
                .openWithAllianceNameOrAbbreviation;


                proto
                    .openWithAllianceNameOrAbbreviation =
                    function () {

                    const args =
                          Array.prototype.slice.call(
                              arguments
                          );


                    const info =
                          resolveAllianceFromArguments(
                              args
                          );


                    let own =
                        false;


                    if (
                        info.name &&
                        isOwnAllianceName(
                            info.name
                        )
                    ) {

                        own = true;
                    }


                    if (
                        !own
                    ) {

                        for (
                            let i = 0;
                            i < args.length;
                            i++
                        ) {

                            if (
                                isOwnAllianceName(
                                    args[i]
                                )
                            ) {

                                own = true;
                                break;
                            }
                        }
                    }


                    console.log(
                        SCRIPT,
                        'openWithAllianceNameOrAbbreviation:',
                        args
                    );


                    if (
                        own
                    ) {

                        setActiveAlliance(
                            ownAllianceId,
                            ownAllianceName
                        );

                    } else {

                        setActiveAllianceForeign();
                    }


                    const result =
                          originalName.apply(
                              this,
                              arguments
                          );


                    scheduleProcess();


                    return result;
                };


                proto.__harziPvPPvENameHook =
                    true;
            }


            return true;

        } catch (e) {

            console.error(
                SCRIPT,
                'AllianceInfoWindow Hook:',
                e
            );

            return false;
        }
    }


    // ============================================================
    // GROSSES ALLIANZFENSTER
    // ============================================================

    function installAllianceOverlayHook() {

        try {

            if (
                typeof webfrontend === 'undefined' ||
                !webfrontend.gui ||
                !webfrontend.gui.alliance ||
                !webfrontend.gui.alliance.AllianceOverlay
            ) {
                return false;
            }


            const proto =
                  webfrontend.gui.alliance
            .AllianceOverlay
            .prototype;


            if (!proto) {
                return false;
            }


            if (
                typeof proto._onAllianceDetailChanged !==
                'function'
            ) {
                return false;
            }


            if (
                proto.__harziPvPPvEOverlayHook
            ) {
                return true;
            }


            const original =
                  proto._onAllianceDetailChanged;


            proto._onAllianceDetailChanged =
                function () {

                const args =
                      Array.prototype.slice.call(
                          arguments
                      );


                console.log(
                    '%c' + SCRIPT +
                    ' Großes Allianzfenster geändert',
                    'color:#00ffff;font-weight:bold'
                );


                /*
                 * Das große Allianzfenster ist
                 * grundsätzlich das Fenster der
                 * eigenen Allianz.
                 */
                if (
                    ownAllianceId !== null
                ) {

                    activeAllianceId =
                        ownAllianceId;

                    activeAllianceName =
                        ownAllianceName;
                }


                /*
                 * ZUERST das originale Spiel ausführen.
                 *
                 * Dadurch wird das Fenster vollständig
                 * aufgebaut.
                 */
                const result =
                      original.apply(
                          this,
                          arguments
                      );


                /*
                 * Danach mehrfach prüfen.
                 *
                 * Der erste Versuch kann noch zu früh sein,
                 * deshalb 300 / 800 / 1500 ms.
                 */
                setTimeout(
                    function () {

                        processLargeAllianceWindow();

                    },
                    300
                );


                setTimeout(
                    function () {

                        processLargeAllianceWindow();

                    },
                    800
                );


                setTimeout(
                    function () {

                        processLargeAllianceWindow();

                    },
                    1500
                );


                return result;
            };


            proto.__harziPvPPvEOverlayHook =
                true;


            console.log(
                '%c' + SCRIPT +
                ' AllianceOverlay Hook installiert',
                'color:lime;font-weight:bold'
            );


            return true;


        } catch (e) {

            console.error(
                SCRIPT,
                'AllianceOverlay Hook:',
                e
            );

            return false;
        }
    }

    function processLargeAllianceWindow() {

        try {

            if (
                ownAllianceId === null
            ) {
                updateOwnAllianceInfo();
            }


            const tabViews =
                  findAllAllianceTabViews();


            console.log(
                SCRIPT,
                'Großes Allianzfenster – TabViews gefunden:',
                tabViews.length
            );


            let largeWindowFound =
                false;


            tabViews.forEach(
                function (tabView) {

                    if (
                        !isLargeAllianceTabView(
                            tabView
                        )
                    ) {

                        return;
                    }


                    largeWindowFound =
                        true;


                    console.log(
                        '%c' + SCRIPT +
                        ' Großes Allianz-TabView gefunden',
                        'color:lime;font-weight:bold'
                    );


                    const labels =
                          getTabLabels(
                              tabView
                          );


                    console.log(
                        SCRIPT,
                        'Vorherige Reiter:',
                        labels
                    );


                    /*
                 * Vorhandene eigene Reiter entfernen.
                 * Dadurch entstehen auch bei mehreren
                 * Versuchen niemals doppelte Reiter.
                 */
                    removeOurPagesFromTabView(
                        tabView
                    );


                    try {

                        tabView.setUserData(
                            USERDATA_KEY,
                            false
                        );

                    } catch (e) {}


                    /*
                 * Jetzt neu erzeugen.
                 */
                    createTabsForTabView(
                        tabView
                    );


                    console.log(
                        '%c' + SCRIPT +
                        ' PvE/PvP im großen Allianzfenster erstellt',
                        'color:lime;font-weight:bold'
                    );
                }
            );


            if (
                !largeWindowFound
            ) {

                console.log(
                    SCRIPT,
                    'Großes Allianz-TabView noch nicht gefunden.'
                );

                return;
            }


            /*
         * Für dieses Fenster ausdrücklich
         * die eigene Allianz setzen.
         */
            activeAllianceId =
                ownAllianceId;

            activeAllianceName =
                ownAllianceName;


            /*
         * Frische Daten laden.
         */
            dataToken++;


            const token =
                  dataToken;


            loadFreshAllianceData(
                token
            ).then(
                function (results) {

                    if (
                        !results
                    ) {
                        return;
                    }


                    if (
                        token !== dataToken
                    ) {
                        return;
                    }


                    applyResults(
                        results,
                        token
                    );
                }
            );


        } catch (e) {

            console.error(
                SCRIPT,
                'processLargeAllianceWindow:',
                e
            );
        }
    }

    // ============================================================
    // HOOKS
    // ============================================================

    function installHooks() {

        try {

            if (
                typeof qx === 'undefined' ||
                typeof ClientLib === 'undefined'
            ) {
                return;
            }


            updateOwnAllianceInfo();


            const small =
                  installAllianceInfoHook();


            const large =
                  installAllianceOverlayHook();


            if (
                small ||
                large
            ) {

                if (
                    !hooksInstalled
                ) {

                    console.log(
                        '%c' + SCRIPT +
                        ' Allianz-Hooks installiert',
                        'color:lime;font-weight:bold'
                    );
                }


                hooksInstalled =
                    true;
            }

        } catch (e) {

            console.error(
                SCRIPT,
                'Hooks:',
                e
            );
        }
    }


    // ============================================================
    // TABVIEWS FINDEN
    // ============================================================

    function getTabLabels(tabView) {

        const labels = [];


        try {

            tabView
                .getChildren()
                .forEach(
                function (page) {

                    try {

                        if (
                            page &&
                            typeof page.getLabel ===
                            'function'
                        ) {

                            labels.push(
                                String(
                                    page.getLabel()
                                )
                            );
                        }

                    } catch (e) {}
                }
            );

        } catch (e) {}


        return labels;
    }


    function isAllianceTabView(
    tabView
    ) {

        const labels =
              getTabLabels(
                  tabView
              );


        const hasBonus =
              labels.indexOf(
                  'Allianzboni'
              ) !== -1;


        const small =
              labels.indexOf(
                  'Allgemein'
              ) !== -1 &&
              labels.indexOf(
                  'Mitglieder'
              ) !== -1;


        const large =
              labels.indexOf(
                  'Übersicht'
              ) !== -1 &&
              labels.indexOf(
                  'Kader'
              ) !== -1;


        return (
            hasBonus &&
            (
                small ||
                large
            )
        );
    }

    function isLargeAllianceTabView(tabView) {

        const labels = getTabLabels(tabView);

        return (
            labels.indexOf('Allianzboni') !== -1 &&
            labels.indexOf('Übersicht') !== -1 &&
            labels.indexOf('Kader') !== -1
        );
    }


    function findAllAllianceTabViews() {

        const result = [];


        try {

            const root =
                  qx.core.Init
            .getApplication()
            .getRoot();


            function scan(widget) {

                if (!widget) {
                    return;
                }


                try {

                    const classname =
                          widget.constructor &&
                          widget.constructor.classname
                    ? widget.constructor.classname
                    : '';


                    if (
                        classname ===
                        'qx.ui.tabview.TabView'
                    ) {

                        if (
                            isAllianceTabView(
                                widget
                            )
                        ) {

                            if (
                                result.indexOf(
                                    widget
                                ) === -1
                            ) {

                                result.push(
                                    widget
                                );
                            }
                        }
                    }

                } catch (e) {}


                try {

                    if (
                        typeof widget.getChildren ===
                        'function'
                    ) {

                        widget
                            .getChildren()
                            .forEach(
                            function (child) {

                                scan(
                                    child
                                );
                            }
                        );
                    }

                } catch (e) {}
            }


            scan(root);

        } catch (e) {

            console.error(
                SCRIPT,
                'TabView-Suche:',
                e
            );
        }


        return result;
    }


    // ============================================================
    // UNSERE REITER ERKENNEN
    // ============================================================

    function isOurPage(page) {

        try {

            return (
                page &&
                typeof page.getUserData ===
                'function' &&
                page.getUserData(
                    USERDATA_KEY
                ) === true
            );

        } catch (e) {

            return false;
        }
    }


    // ============================================================
    // UNSERE REITER ENTFERNEN
    // ============================================================

    function removeOurPagesFromTabView(
    tabView
    ) {

        try {

            /*
             * WICHTIG:
             * Kopie der Liste verwenden.
             * Sonst überspringt remove() bei Qooxdoo
             * unter Umständen jede zweite Page.
             */
            const pages =
                  tabView
            .getChildren()
            .slice();


            let removed =
                0;


            pages.forEach(
                function (page) {

                    let remove =
                        false;


                    try {

                        const label =
                              typeof page.getLabel ===
                              'function'
                        ? String(
                            page.getLabel()
                        )
                        : '';


                        /*
                         * Unsere Markierung ODER
                         * PvE/PvP mit genau diesem Namen.
                         */
                        if (
                            isOurPage(page) ||
                            label === 'PvE' ||
                            label === 'PvP'
                        ) {

                            remove =
                                true;
                        }

                    } catch (e) {}


                    if (
                        remove
                    ) {

                        try {

                            tabView.remove(
                                page
                            );

                            removed++;

                        } catch (e) {

                            console.warn(
                                SCRIPT,
                                'Reiter entfernen:',
                                e
                            );
                        }
                    }
                }
            );


            if (
                removed > 0
            ) {

                console.log(
                    SCRIPT,
                    'Alte PvE/PvP-Reiter entfernt:',
                    removed
                );
            }


            return removed;

        } catch (e) {

            console.error(
                SCRIPT,
                'removeOurPagesFromTabView:',
                e
            );

            return 0;
        }
    }


    function clearAllOurTabs() {

        try {

            const tabViews =
                  findAllAllianceTabViews();

            tabViews.forEach(
                function (tabView) {

                    /*
                 * Das große Allianzfenster gehört IMMER
                 * zur eigenen Allianz.
                 *
                 * Deshalb dort niemals die Reiter löschen.
                 */
                    if (
                        isLargeAllianceTabView(
                            tabView
                        )
                    ) {
                        return;
                    }

                    removeOurPagesFromTabView(
                        tabView
                    );

                    try {

                        tabView.setUserData(
                            USERDATA_KEY,
                            false
                        );

                    } catch (e) {}
                }
            );

            console.log(
                SCRIPT,
                'PvE/PvP-Reiter fremder kleiner Allianzfenster entfernt.'
            );

        } catch (e) {

            console.error(
                SCRIPT,
                'clearAllOurTabs:',
                e
            );
        }
    }


    // ============================================================
    // SPIELERDATEN
    // ============================================================

    function getAllianceMemberIds() {

        try {

            const alliance =
                  ClientLib.Data.MainData
            .GetInstance()
            .get_Alliance();


            if (!alliance) {
                return [];
            }


            const memberIds =
                  alliance.getMemberIds();


            if (
                !memberIds ||
                !Array.isArray(memberIds.l)
            ) {

                return [];
            }


            return memberIds.l.slice();

        } catch (e) {

            console.error(
                SCRIPT,
                'Mitglieder:',
                e
            );

            return [];
        }
    }


    function getPlayerInfo(
    playerId
    ) {

        return new Promise(
            function (resolve) {

                try {

                    ClientLib.Net.CommunicationManager
                        .GetInstance()
                        .SendSimpleCommand(
                        'GetPublicPlayerInfo',
                        {
                            id: playerId
                        },

                        /*
                             * DAS BLEIBT EXAKT SO,
                             * weil es funktioniert.
                             */
                        phe.cnc.Util.createEventDelegate(
                            ClientLib.Net.CommandResult,
                            null,
                            function (
                            context,
                             data
                            ) {

                                resolve(
                                    data
                                );
                            }
                        ),

                        function () {

                            resolve(
                                null
                            );
                        }
                    );

                } catch (e) {

                    console.error(
                        SCRIPT,
                        'GetPublicPlayerInfo:',
                        playerId,
                        e
                    );

                    resolve(
                        null
                    );
                }
            }
        );
    }


    // ============================================================
    // TABELLEN
    // ============================================================

    function escapeHtml(value) {

        return String(value)
            .replace(
            /&/g,
            '&amp;'
        )
            .replace(
            /</g,
            '&lt;'
        )
            .replace(
            />/g,
            '&gt;'
        )
            .replace(
            /"/g,
            '&quot;'
        )
            .replace(
            /'/g,
            '&#039;'
        );
    }


    function formatData(
    data
    ) {

        return data.map(
            function (
            entry
            ) {

                return [
                    entry.rank,

                    '<span style="' +
                    'color:#0645AD;' +
                    'text-decoration:underline;' +
                    'cursor:pointer;' +
                    '">' +
                    escapeHtml(
                        entry.name
                    ) +
                    '</span>',

                    entry.value
                ];
            }
        );
    }


    function createTable(
    model
    ) {

        const table =
              new qx.ui.table.Table(
                  model
              ).set({
                  showCellFocusIndicator:
                  false,
                  statusBarVisible:
                  false
              });


        const columnModel =
              table
        .getTableColumnModel();


        columnModel.setColumnWidth(
            0,
            55
        );

        columnModel.setColumnWidth(
            1,
            220
        );

        columnModel.setColumnWidth(
            2,
            100
        );


        try {

            columnModel.setDataCellRenderer(
                1,
                new qx.ui.table
                .cellrenderer.Html()
            );

        } catch (e) {

            console.warn(
                SCRIPT,
                'HTML-Renderer:',
                e
            );
        }


        table.addListener(
            'cellTap',
            function (
            event
            ) {

                try {

                    if (
                        event.getColumn() !==
                        1
                    ) {

                        return;
                    }


                    const row =
                          event.getRow();


                    const rawName =
                          model.getValue(
                              1,
                              row
                          );


                    if (
                        !rawName
                    ) {

                        return;
                    }


                    const playerName =
                          String(
                              rawName
                          )
                    .replace(
                        /<[^>]*>/g,
                        ''
                    );


                    if (
                        webfrontend &&
                        webfrontend.gui &&
                        webfrontend.gui.util &&
                        webfrontend.gui.util.BBCode &&
                        typeof
                        webfrontend.gui.util.BBCode
                        .openPlayerProfile ===
                        'function'
                    ) {

                        webfrontend.gui.util.BBCode
                            .openPlayerProfile(
                            playerName
                        );
                    }

                } catch (e) {

                    console.error(
                        SCRIPT,
                        'Spielerprofil:',
                        e
                    );
                }
            }
        );


        return table;
    }


    // ============================================================
    // REITER ERSTELLEN
    // ============================================================

    function createTabsForTabView(
    tabView
    ) {

        /*
         * ZUERST alles Alte weg.
         * Damit können niemals doppelte PvE/PvP-Reiter
         * entstehen.
         */
        removeOurPagesFromTabView(
            tabView
        );


        const pveTab =
              new qx.ui.tabview.Page(
                  'PvE'
              );


        const pvpTab =
              new qx.ui.tabview.Page(
                  'PvP'
              );


        /*
         * Eindeutige Markierung unserer Reiter.
         */
        pveTab.setUserData(
            USERDATA_KEY,
            true
        );

        pvpTab.setUserData(
            USERDATA_KEY,
            true
        );


        pveTab.setLayout(
            new qx.ui.layout.Canvas()
        );

        pvpTab.setLayout(
            new qx.ui.layout.Canvas()
        );


        const pveModel =
              new qx.ui.table.model.Simple();


        pveModel.setColumns([
            'Rang',
            'Spieler',
            'PvE'
        ]);


        const pvpModel =
              new qx.ui.table.model.Simple();


        pvpModel.setColumns([
            'Rang',
            'Spieler',
            'PvP'
        ]);


        const pveTable =
              createTable(
                  pveModel
              );


        const pvpTable =
              createTable(
                  pvpModel
              );


        pveTab.add(
            pveTable,
            {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        );


        pvpTab.add(
            pvpTable,
            {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            }
        );


        tabView.add(
            pveTab
        );

        tabView.add(
            pvpTab
        );


        processedTabViews.add(
            tabView
        );


        try {

            tabView.setUserData(
                USERDATA_KEY,
                true
            );

        } catch (e) {}


        console.log(
            '%c' + SCRIPT +
            ' PvE/PvP-Reiter erstellt',
            'color:lime;font-weight:bold'
        );
    }


    // ============================================================
    // DATEN LADEN
    // ============================================================

    async function loadFreshAllianceData(
    token
    ) {

        const memberIds =
              getAllianceMemberIds();


        console.log(
            '%c' + SCRIPT +
            ' ===== NEUE DATENABFRAGE =====',
            'color:cyan;font-weight:bold'
        );


        console.log(
            SCRIPT,
            'Mitglieder:',
            memberIds.length
        );


        const pve = [];
        const pvp = [];


        for (
            let i = 0;
            i < memberIds.length;
            i++
        ) {

            /*
             * Wurde inzwischen eine fremde Allianz
             * geöffnet, wird die Abfrage abgebrochen.
             */
            if (
                token !== dataToken ||
                !isOwnAlliance()
            ) {

                console.log(
                    SCRIPT,
                    'Datenabfrage abgebrochen.'
                );

                return null;
            }


            const playerId =
                  memberIds[i];


            console.log(
                SCRIPT,
                'Abfrage',
                i + 1,
                '/',
                memberIds.length,
                'PlayerID:',
                playerId
            );


            const data =
                  await getPlayerInfo(
                      playerId
                  );


            if (
                token !== dataToken ||
                !isOwnAlliance()
            ) {

                console.log(
                    SCRIPT,
                    'Antwort verworfen – Allianzwechsel.'
                );

                return null;
            }


            if (
                !data
            ) {

                continue;
            }


            /*
             * Sicherheitsprüfung:
             * Nur Spieler der eigenen Allianz.
             */
            if (
                data.a !== undefined &&
                Number(data.a) !==
                Number(ownAllianceId)
            ) {

                console.warn(
                    SCRIPT,
                    'Fremder Spieler verworfen:',
                    data.n,
                    data.a
                );

                continue;
            }


            pve.push({
                name:
                String(
                    data.n ||
                    'Unbekannt'
                ),
                value:
                Number(
                    data.bde ||
                    0
                )
            });


            pvp.push({
                name:
                String(
                    data.n ||
                    'Unbekannt'
                ),
                value:
                Number(
                    data.d ||
                    0
                )
            });
        }


        pve.sort(
            function (
            a,
             b
            ) {

                return (
                    b.value -
                    a.value
                );
            }
        );


        pvp.sort(
            function (
            a,
             b
            ) {

                return (
                    b.value -
                    a.value
                );
            }
        );


        pve.forEach(
            function (
            entry,
             index
            ) {

                entry.rank =
                    index + 1;
            }
        );


        pvp.forEach(
            function (
            entry,
             index
            ) {

                entry.rank =
                    index + 1;
            }
        );


        return {
            pve: pve,
            pvp: pvp
        };
    }


    // ============================================================
    // DATEN IN TABELLEN EINTRAGEN
    // ============================================================

    function applyResults(
    results,
     token
    ) {

        if (
            !results ||
            token !== dataToken ||
            !isOwnAlliance()
        ) {

            return;
        }


        const tabViews =
              findAllAllianceTabViews();


        tabViews.forEach(
            function (
            tabView
            ) {

                if (
                    !processedTabViews.has(
                        tabView
                    )
                ) {

                    return;
                }


                try {

                    const pages =
                          tabView
                    .getChildren()
                    .slice();


                    pages.forEach(
                        function (
                        page
                        ) {

                            if (
                                !isOurPage(
                                    page
                                )
                            ) {

                                return;
                            }


                            const label =
                                  String(
                                      page.getLabel()
                                  );


                            const children =
                                  page.getChildren();


                            children.forEach(
                                function (
                                child
                                ) {

                                    if (
                                        !child ||
                                        typeof child
                                        .getTableModel !==
                                        'function'
                                    ) {

                                        return;
                                    }


                                    const model =
                                          child
                                    .getTableModel();


                                    if (
                                        label ===
                                        'PvE'
                                    ) {

                                        model.setData(
                                            formatData(
                                                results.pve
                                            )
                                        );

                                    }


                                    if (
                                        label ===
                                        'PvP'
                                    ) {

                                        model.setData(
                                            formatData(
                                                results.pvp
                                            )
                                        );
                                    }
                                }
                            );
                        }
                    );

                } catch (e) {

                    console.error(
                        SCRIPT,
                        'Ergebnisübernahme:',
                        e
                    );
                }
            }
        );


        console.log(
            '%c' + SCRIPT +
            ' ===== DATEN FERTIG =====',
            'color:lime;font-weight:bold'
        );
    }


    // ============================================================
    // AKTUELLEN AUFRUF VERARBEITEN
    // ============================================================

    async function processCurrentAlliance() {

        const tabViews =
              findAllAllianceTabViews();

        if (
            tabViews.length === 0
        ) {
            return;
        }


        /*
     * Wir teilen die gefundenen Fenster in:
     *
     * 1. großes Allianzfenster
     *    = IMMER eigene Allianz
     *
     * 2. normales Allianzfenster
     *    = nur bearbeiten, wenn eigene Allianz
     */

        const ownTabViews = [];


        tabViews.forEach(
            function (tabView) {

                if (
                    isLargeAllianceTabView(
                        tabView
                    )
                ) {

                    /*
                 * Das Fenster aus dem oberen
                 * Allianz-Menü gehört immer uns.
                 */
                    ownTabViews.push(
                        tabView
                    );

                    return;
                }


                /*
             * Normales Allianzfenster:
             * nur bei unserer Allianz bearbeiten.
             */
                if (
                    isOwnAlliance()
                ) {

                    ownTabViews.push(
                        tabView
                    );

                } else {

                    /*
                 * Fremde Allianz:
                 * unsere Reiter entfernen.
                 */
                    removeOurPagesFromTabView(
                        tabView
                    );

                    try {

                        tabView.setUserData(
                            USERDATA_KEY,
                            false
                        );

                    } catch (e) {}
                }
            }
        );


        /*
     * Keine eigene Allianz und kein großes
     * Allianzfenster gefunden.
     */
        if (
            ownTabViews.length === 0
        ) {

            return;
        }


        /*
     * Das große Allianzfenster setzt den
     * Allianzstatus nicht zuverlässig.
     *
     * Deshalb setzen wir hier für die
     * Datenabfrage ausdrücklich unsere
     * eigene Allianz.
     */
        let largeWindowFound = false;


        ownTabViews.forEach(
            function (tabView) {

                if (
                    isLargeAllianceTabView(
                        tabView
                    )
                ) {

                    largeWindowFound =
                        true;
                }
            }
        );


        if (
            largeWindowFound
        ) {

            if (
                ownAllianceId !== null
            ) {

                activeAllianceId =
                    ownAllianceId;

                activeAllianceName =
                    ownAllianceName;
            }
        }


        /*
     * Jetzt genau ein PvE/PvP-Paar
     * pro eigenem Allianzfenster.
     */
        ownTabViews.forEach(
            function (tabView) {

                let marked =
                    false;


                try {

                    marked =
                        tabView.getUserData(
                        USERDATA_KEY
                    ) === true;

                } catch (e) {}


                if (
                    !marked
                ) {

                    createTabsForTabView(
                        tabView
                    );
                }
            }
        );


        /*
     * Daten jedes neuen eigenen Aufrufs
     * frisch laden.
     */
        const token =
              dataToken;


        const results =
              await loadFreshAllianceData(
                  token
              );


        if (
            results &&
            token === dataToken
        ) {

            /*
         * Vor der Übernahme nochmals prüfen:
         *
         * - großes Fenster = immer eigene Allianz
         * - kleines Fenster = nur eigene Allianz
         */

            if (
                largeWindowFound ||
                isOwnAlliance()
            ) {

                applyResults(
                    results,
                    token
                );
            }
        }
    }


    // ============================================================
    // VERZÖGERUNG
    // ============================================================

    function scheduleProcess() {

        const token =
              ++openToken;


        setTimeout(
            function () {

                if (
                    token !== openToken
                ) {

                    return;
                }


                processCurrentAlliance();

            },
            250
        );
    }


    // ============================================================
    // INITIALER AUFRUF
    // ============================================================

    function initialScan() {

        updateOwnAllianceInfo();


        const tabViews =
              findAllAllianceTabViews();


        if (
            tabViews.length === 0
        ) {

            return;
        }


        /*
         * Falls beim Scriptstart bereits das eigene
         * Allianzfenster offen ist.
         */
        if (
            activeAllianceId === null &&
            ownAllianceId !== null
        ) {

            activeAllianceId =
                ownAllianceId;

            activeAllianceName =
                ownAllianceName;


            console.log(
                SCRIPT,
                'Initiales Allianzfenster → eigene Allianz'
            );
        }


        if (
            !firstScanDone
        ) {

            firstScanDone =
                true;

            scheduleProcess();
        }
    }


    // ============================================================
    // HAUPTSCHLEIFE
    // ============================================================

    function check() {

        try {

            if (
                typeof qx !== 'undefined' &&
                typeof ClientLib !== 'undefined'
            ) {

                updateOwnAllianceInfo();

                installHooks();

                initialScan();
            }

        } catch (e) {

            console.error(
                SCRIPT,
                'Hauptschleife:',
                e
            );
        }


        setTimeout(
            check,
            1000
        );
    }


    // ============================================================
    // START
    // ============================================================

    setTimeout(
        check,
        1000
    );

})();