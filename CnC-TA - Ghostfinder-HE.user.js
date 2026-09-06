// ==UserScript==
// @name         Ghostfinder - HE
// @namespace    https://github.com/Harzi66/CnC-TA-Harzi-Edition
// @version      1.2.0
// @description  Weiterentwicklung des CnCTA Base Finder mit eigenem Geisterbasen-Renderer.
// @author       Harzi
// @contributor  bloofi
// @contributor  ffi82
// @match        https://*.alliances.commandandconquer.com/*/*
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Ghostfinder-HE/main/CnC-TA-Ghostfinder-HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Ghostfinder-HE/main/CnC-TA-Ghostfinder-HE.user.js
// @grant        none
// ==/UserScript==

/*
 * Ghostfinder - HE
 *
 * Weiterentwicklung auf Basis von:
 * CnCTA Base Finder
 *
 * Original Author:
 * bloofi
 *
 * Contributor:
 * ffi82
 *
 * Eigene Weiterentwicklung:
 * - eigener Ghost-Renderer
 * - VKVAYK / C&C-TA-Renderbaum
 * - transparente rote Ghost-Kreise
 * - mehrere Ghosts gleichzeitig
 * - Basisname und Besitzer als Beschriftung
 * - keine QX-Overlay-Marker für Ghosts
 * - Sprachauswahl DE, EN, FR, ES
 */

'use strict';

(function () {

    const GhostfinderScript = () => {

        const scriptName = 'Ghostfinder - HE';
        const storageKey = 'ghostfinder-he';


        const LANG_KEY =
            'CnCTA_Ghostfinder_HE_Language_' +
            window.location.hostname +
            window.location.pathname.split('/')[1];

        const LANGUAGES = {

            de: {
                name: 'Deutsch',
                title: 'Ghostfinder - HE',
                selectAlliance: 'Allianz auswählen :',
                orTypeAlliance: 'oder Allianzname eingeben :',
                search: 'Suchen',
                favorite: 'Favorit',
                refresh: 'Aktualisieren',
                nothing: 'Nichts anzuzeigen',
                ghostSelection: 'Ghost-Auswahl :',
                allGhosts: 'Alle schwebenden Basen',
                mainGhosts: 'Nur Main-Basen',
                top2Ghosts: 'Main + zweitbeste Ghost-Basen',
                showGhosts: 'Ghosts anzeigen',
                clearMarkers: 'Marker löschen',
                fetchingById: 'Allianz per ID wird geladen...',
                fetchingByName: 'Allianz per Name wird geladen...',
                pleaseSelect: 'Bitte eine Allianz auswählen',
                pleaseType: 'Bitte etwas zum Suchen eingeben',
                rendererNotReady: 'Ghost-Renderer noch nicht bereit - bitte warten...',
                invalidAlliance: 'Ungültiger Allianzname',
                players: 'Spieler',
                bases: 'Basen',
                ghosts: 'Ghosts',
                language: 'Sprache'
            },

            en: {
                name: 'English',
                title: 'Ghostfinder - HE',
                selectAlliance: 'Select alliance :',
                orTypeAlliance: 'or type alliance name :',
                search: 'Search',
                favorite: 'Favorite',
                refresh: 'Refresh',
                nothing: 'Nothing to show',
                ghostSelection: 'Ghost selection :',
                allGhosts: 'All floating bases',
                mainGhosts: 'Main bases only',
                top2Ghosts: 'Main + second-best ghost bases',
                showGhosts: 'Show ghosts',
                clearMarkers: 'Clear markers',
                fetchingById: 'Fetching alliance by ID...',
                fetchingByName: 'Fetching alliance by name...',
                pleaseSelect: 'Please select an alliance',
                pleaseType: 'Please type something to search',
                rendererNotReady: 'Ghost renderer not ready - please wait...',
                invalidAlliance: 'Invalid alliance name',
                players: 'Players',
                bases: 'Bases',
                ghosts: 'Ghosts',
                language: 'Language'
            },

            fr: {
                name: 'Français',
                title: 'Ghostfinder - HE',
                selectAlliance: 'Sélectionner une alliance :',
                orTypeAlliance: "ou saisir le nom de l'alliance :",
                search: 'Rechercher',
                favorite: 'Favori',
                refresh: 'Actualiser',
                nothing: 'Rien à afficher',
                ghostSelection: 'Sélection des ghosts :',
                allGhosts: 'Toutes les bases flottantes',
                mainGhosts: 'Bases principales uniquement',
                top2Ghosts: 'Base principale + deuxième meilleure base ghost',
                showGhosts: 'Afficher les ghosts',
                clearMarkers: 'Supprimer les marqueurs',
                fetchingById: "Chargement de l'alliance par ID...",
                fetchingByName: "Chargement de l'alliance par nom...",
                pleaseSelect: 'Veuillez sélectionner une alliance',
                pleaseType: 'Veuillez saisir quelque chose à rechercher',
                rendererNotReady: 'Le renderer des ghosts n’est pas encore prêt - veuillez patienter...',
                invalidAlliance: "Nom d'alliance invalide",
                players: 'Joueurs',
                bases: 'Bases',
                ghosts: 'Ghosts',
                language: 'Langue'
            },

            es: {
                name: 'Español',
                title: 'Ghostfinder - HE',
                selectAlliance: 'Seleccionar alianza :',
                orTypeAlliance: 'o introducir nombre de alianza :',
                search: 'Buscar',
                favorite: 'Favorito',
                refresh: 'Actualizar',
                nothing: 'Nada que mostrar',
                ghostSelection: 'Selección de ghosts :',
                allGhosts: 'Todas las bases flotantes',
                mainGhosts: 'Solo bases principales',
                top2Ghosts: 'Principal + segunda mejor base ghost',
                showGhosts: 'Mostrar ghosts',
                clearMarkers: 'Borrar marcadores',
                fetchingById: 'Cargando alianza por ID...',
                fetchingByName: 'Cargando alianza por nombre...',
                pleaseSelect: 'Selecciona una alianza',
                pleaseType: 'Introduce algo para buscar',
                rendererNotReady: 'El renderer de ghosts aún no está listo - espera, por favor...',
                invalidAlliance: 'Nombre de alianza no válido',
                players: 'Jugadores',
                bases: 'Bases',
                ghosts: 'Ghosts',
                language: 'Idioma'
            }
        };

        function getLanguage() {
            const saved = localStorage.getItem(LANG_KEY);
            return LANGUAGES[saved] ? saved : 'de';
        }

        function t(key, params = {}) {
            const lang = LANGUAGES[getLanguage()] || LANGUAGES.de;
            let text = lang[key] ?? LANGUAGES.de[key] ?? key;

            Object.keys(params).forEach(name => {
                text = text.replace(
                    new RegExp('\\{' + name + '\\}', 'g'),
                    String(params[name])
                );
            });

            return text;
        }

        let ghostfinderMainInstance = null;

        function setLanguage(lang) {
            if (!LANGUAGES[lang]) return;
            localStorage.setItem(LANG_KEY, lang);
            if (ghostfinderMainInstance) {
                ghostfinderMainInstance.refreshLanguageUI();
            }
        }

        const init = () => {

            const Main = qx.Class.define('GhostfinderMain', {

                type: 'singleton',
                extend: qx.core.Object,

                members: {

                    //////////////////////////////////////////////////////////////////
                    // DATEN
                    //////////////////////////////////////////////////////////////////

                    favorites: [],
                    listAlliances: [],
                    selectedAlliance: null,

                    players: {},
                    bases: {},

                    //////////////////////////////////////////////////////////////////
                    // UI
                    //////////////////////////////////////////////////////////////////

                    mainWindow: null,
                    allianceSelect: null,
                    allianceTextfield: null,
                    allianceLabel: null,
                    fetchLabel: null,
                    selectAllianceLabel: null,
                    orTypeAllianceLabel: null,
                    ghostSelectionLabel: null,
                    languageLabel: null,

                    buttonFetch: null,

                    favoriteCheckbox: null,

                    buttonRefresh: null,
                    buttonShowGhosts: null,
                    buttonClear: null,

                    ghostFilterSelect: null,
                    languageSelect: null,
                    languageRow: null,

                    //////////////////////////////////////////////////////////////////
                    // GHOST RENDERER
                    //////////////////////////////////////////////////////////////////

                    ghostRendererReady: false,
                    ghostRendererRoot: null,
                    ghostRendererWorld: null,

                    ghostMarkers: [],

                    //////////////////////////////////////////////////////////////////
                    // INIT
                    //////////////////////////////////////////////////////////////////

                    initialize: function () {

                        ghostfinderMainInstance = this;

                        this.installGhostRendererHook();

                        const button =
                            new qx.ui.menu.Button('Ghostfinder - HE');

                        button.addListener(
                            'execute',
                            this.onOpenMainWindow,
                            this
                        );

                        qx.core.Init
                            .getApplication()
                            .getMenuBar()
                            .getScriptsButton()
                            .getMenu()
                            .add(button);
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOST RENDERER HOOK
                    //////////////////////////////////////////////////////////////////

                    installGhostRendererHook: function () {

                        const self = this;

                        function hook() {

                            if (
                                typeof $I === 'undefined' ||
                                !$I.YDBEUZ ||
                                !$I.YDBEUZ.prototype ||
                                !$I.YDBEUZ.prototype.UYOMZT
                            ) {

                                setTimeout(hook, 1000);
                                return;
                            }

                            if (
                                $I.YDBEUZ.prototype
                                    .__GhostfinderHookInstalled
                            ) {
                                return;
                            }

                            $I.YDBEUZ.prototype
                                .__GhostfinderHookInstalled = true;

                            const original =
                                $I.YDBEUZ.prototype.UYOMZT;

                            $I.YDBEUZ.prototype.UYOMZT =
                                function (n, t, i, r, u) {

                                    const result =
                                        original.apply(
                                            this,
                                            arguments
                                        );

                                    try {

                                        if (
                                            t &&
                                            t.l === 2400 &&
                                            t.ec === 3 &&
                                            t.w === 120 &&
                                            t.h === 120 &&
                                            t.e &&
                                            t.e.length === 3 &&
                                            t.e[0] &&
                                            t.e[0].s ===
                                                'battleview/nod/gui/selectedbase/base_fx.png'
                                        ) {

                                            const ghost =
                                                this.JNGHTC;

                                            if (
                                                ghost &&
                                                ghost.GLCMWM &&
                                                ghost.GLCMWM.PUPNDM
                                            ) {

                                                self.ghostRendererRoot =
                                                    ghost.GLCMWM;

                                                self.ghostRendererWorld =
                                                    ghost.GLCMWM.PUPNDM;

                                                self.ghostRendererReady =
                                                    true;

                                                console.log(
                                                    '%c[Ghostfinder] Ghost-Renderer bereit',
                                                    'color:lime;font-weight:bold'
                                                );
                                            }
                                        }

                                    } catch (e) {

                                        console.error(
                                            '[Ghostfinder] Renderer-Hook Fehler:',
                                            e
                                        );
                                    }

                                    return result;
                                };

                            console.log(
                                '%c[Ghostfinder] Renderer-Hook installiert',
                                'color:cyan;font-weight:bold'
                            );
                        }

                        hook();
                    },

                    //////////////////////////////////////////////////////////////////
                    // UI ÖFFNEN
                    //////////////////////////////////////////////////////////////////

                    onOpenMainWindow: function () {

                        if (!this.mainWindow) {

                            this.loadStorage();

                            this.createMainWindow();

                            this.refreshSelect();
                        }

                        this.mainWindow.open();

                        this.refreshWindow();
                    },

                    //////////////////////////////////////////////////////////////////
                    // UI
                    //////////////////////////////////////////////////////////////////

                    createMainWindow: function () {

                        this.mainWindow =
                            new qx.ui.window.Window(
                                t('title')
                            ).set({

                                contentPaddingTop: 5,
                                contentPaddingBottom: 5,
                                contentPaddingRight: 2,
                                contentPaddingLeft: 2,

                                width: 300,
                                height: 390,

                                showMaximize: false,
                                showMinimize: false,

                                allowMaximize: false,
                                allowMinimize: false,

                                allowClose: true,

                                resizable: false
                            });

                        this.mainWindow.setLayout(
                            new qx.ui.layout.VBox(
                                5,
                                'top'
                            )
                        );

                        this.mainWindow.center();

                        this.selectAllianceLabel =
                            new qx.ui.basic.Label().set({

                                textAlign: 'left',
                                width: 300,
                                rich: true,
                                textColor: 'white',

                                value:
                                    t('selectAlliance')
                            });

                        this.mainWindow.add(
                            this.selectAllianceLabel
                        );

                        this.allianceSelect =
                            new qx.ui.form.SelectBox();

                        this.allianceSelect.addListener(
                            'changeSelection',
                            this.onSelectAlliance,
                            this
                        );

                        this.mainWindow.add(
                            this.allianceSelect
                        );

                        this.orTypeAllianceLabel =
                            new qx.ui.basic.Label().set({

                                textAlign: 'left',
                                width: 300,
                                rich: true,
                                textColor: 'white',

                                value:
                                    t('orTypeAlliance')
                            });

                        this.mainWindow.add(
                            this.orTypeAllianceLabel
                        );

                        const fetchRow =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(10)
                            );

                        this.allianceTextfield =
                            new qx.ui.form.TextField().set({

                                width: 200
                            });

                        fetchRow.add(
                            this.allianceTextfield
                        );

                        this.buttonFetch =
                            new qx.ui.form.Button(
                                t('search')
                            );

                        this.buttonFetch.addListener(
                            'execute',
                            this.onButtonFetchAlliance,
                            this
                        );

                        fetchRow.add(
                            this.buttonFetch
                        );

                        this.mainWindow.add(
                            fetchRow
                        );

                        const allianceRow =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(10)
                            ).set({

                                decorator:
                                    new qx.ui.decoration.Decorator().set({

                                        color: 'white',
                                        style: 'solid',

                                        width: 0,
                                        widthTop: 3,
                                        widthBottom: 3
                                    })
                            });

                        this.allianceLabel =
                            new qx.ui.basic.Label().set({

                                textAlign: 'left',
                                rich: true,
                                textColor: 'silver',

                                value: '',

                                marginTop: 10,
                                marginBottom: 10
                            });

                        allianceRow.add(
                            this.allianceLabel
                        );

                        this.favoriteCheckbox =
                            new qx.ui.form.CheckBox(
                                t('favorite')
                            ).set({

                                textColor: 'white'
                            });

                        this.favoriteCheckbox.addListener(
                            'changeValue',
                            this.onCheckboxFavorite,
                            this
                        );

                        this.favoriteCheckbox.setEnabled(
                            false
                        );

                        allianceRow.add(
                            this.favoriteCheckbox
                        );

                        this.buttonRefresh =
                            new qx.ui.form.Button(
                                t('refresh')
                            );

                        this.buttonRefresh.addListener(
                            'execute',
                            this.onButtonRefresh,
                            this
                        );

                        allianceRow.add(
                            this.buttonRefresh
                        );

                        this.mainWindow.add(
                            allianceRow
                        );

                        this.languageRow =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(10)
                            );

                        this.languageLabel =
                            new qx.ui.basic.Label().set({

                                textAlign: 'left',
                                width: 90,
                                rich: true,
                                textColor: 'white',

                                value: t('language')
                            });

                        this.languageSelect =
                            new qx.ui.form.SelectBox().set({
                                width: 130
                            });

                        const languageItems = {};

                        ['de', 'en', 'fr', 'es'].forEach(
                            lang => {

                                const item =
                                    new qx.ui.form.ListItem(
                                        LANGUAGES[lang].name,
                                        null,
                                        lang
                                    );

                                languageItems[lang] = item;
                                this.languageSelect.add(item);
                            }
                        );

                        const currentLanguage = getLanguage();

                        this.languageSelect.setSelection([
                            languageItems[currentLanguage]
                        ]);

                        this.languageSelect.addListener(
                            'changeSelection',
                            function () {

                                const selection =
                                    this.languageSelect
                                        .getSelection();

                                if (
                                    selection &&
                                    selection.length > 0
                                ) {

                                    setLanguage(
                                        selection[0].getModel()
                                    );
                                }
                            },
                            this
                        );

                        this.languageRow.add(
                            this.languageLabel
                        );

                        this.languageRow.add(
                            this.languageSelect
                        );

                        this.mainWindow.add(
                            this.languageRow
                        );

                        this.fetchLabel =
                            new qx.ui.basic.Label().set({

                                textAlign: 'left',
                                width: 300,
                                rich: true,
                                textColor: 'silver',

                                value:
                                    t('nothing')
                            });

                        this.mainWindow.add(
                            this.fetchLabel
                        );

                        this.ghostSelectionLabel =
                            new qx.ui.basic.Label().set({
                                textAlign: 'left',
                                width: 300,
                                rich: true,
                                textColor: 'white',
                                value: t('ghostSelection')
                            });

                        this.mainWindow.add(
                            this.ghostSelectionLabel
                        );

                        this.ghostFilterSelect =
                            new qx.ui.form.SelectBox();

                        const ghostFilterAll =
                            new qx.ui.form.ListItem(
                                t('allGhosts')
                            );
                        ghostFilterAll.setUserData(
                            'ghostFilter',
                            'all'
                        );

                        const ghostFilterMain =
                            new qx.ui.form.ListItem(
                                t('mainGhosts')
                            );
                        ghostFilterMain.setUserData(
                            'ghostFilter',
                            'main'
                        );

                        const ghostFilterTop2 =
                            new qx.ui.form.ListItem(
                                t('top2Ghosts')
                            );
                        ghostFilterTop2.setUserData(
                            'ghostFilter',
                            'top2'
                        );

                        this.ghostFilterSelect.add(
                            ghostFilterAll
                        );
                        this.ghostFilterSelect.add(
                            ghostFilterMain
                        );
                        this.ghostFilterSelect.add(
                            ghostFilterTop2
                        );

                        this.ghostFilterSelect.setSelection(
                            [ghostFilterAll]
                        );

                        this.mainWindow.add(
                            this.ghostFilterSelect
                        );

                        const grid =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.Grid(5, 5)
                            ).set({

                                width: 300,
                                allowGrowX: true
                            });

                        this.buttonShowGhosts =
                            new qx.ui.form.Button(
                                t('showGhosts')
                            );

                        this.buttonShowGhosts.setEnabled(
                            false
                        );

                        this.buttonShowGhosts.addListener(
                            'execute',
                            this.onButtonShowGhosts,
                            this
                        );

                        /*
                         * Beide Buttons gleichmäßig auf zwei Spalten verteilen.
                         * Dadurch stehen sie nebeneinander und wirken symmetrisch.
                         */
                        grid.getLayout().setColumnFlex(0, 1);
                        grid.getLayout().setColumnFlex(1, 1);

                        grid.add(
                            this.buttonShowGhosts,
                            {
                                row: 0,
                                column: 0,
                                horizontalAlign: 'center'
                            }
                        );

                        this.buttonClear =
                            new qx.ui.form.Button(
                                t('clearMarkers')
                            );

                        this.buttonClear.setEnabled(
                            false
                        );

                        this.buttonClear.addListener(
                            'execute',
                            this.onButtonClear,
                            this
                        );

                        grid.add(
                            this.buttonClear,
                            {
                                row: 0,
                                column: 1,
                                horizontalAlign: 'center'
                            }
                        );

                        this.mainWindow.add(
                            grid
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // SPRACHE AKTUALISIEREN
                    //////////////////////////////////////////////////////////////////

                    refreshLanguageUI: function () {

                        if (!this.mainWindow) {
                            return;
                        }

                        const current = getLanguage();

                        this.mainWindow.setCaption(
                            t('title')
                        );

                        if (this.selectAllianceLabel) {
                            this.selectAllianceLabel.setValue(
                                t('selectAlliance')
                            );
                        }

                        if (this.orTypeAllianceLabel) {
                            this.orTypeAllianceLabel.setValue(
                                t('orTypeAlliance')
                            );
                        }

                        if (this.ghostSelectionLabel) {
                            this.ghostSelectionLabel.setValue(
                                t('ghostSelection')
                            );
                        }

                        if (this.languageLabel) {
                            this.languageLabel.setValue(
                                t('language')
                            );
                        }

                        if (this.buttonFetch) {
                            this.buttonFetch.setLabel(
                                t('search')
                            );
                        }

                        if (this.favoriteCheckbox) {
                            this.favoriteCheckbox.setLabel(
                                t('favorite')
                            );
                        }

                        if (this.buttonRefresh) {
                            this.buttonRefresh.setLabel(
                                t('refresh')
                            );
                        }

                        if (this.buttonShowGhosts) {
                            this.buttonShowGhosts.setLabel(
                                t('showGhosts')
                            );
                        }

                        if (this.buttonClear) {
                            this.buttonClear.setLabel(
                                t('clearMarkers')
                            );
                        }

                        if (this.ghostFilterSelect) {

                            const selection =
                                this.ghostFilterSelect
                                    .getSelection()[0];

                            const mode =
                                selection
                                    ? selection.getUserData('ghostFilter')
                                    : 'all';

                            this.ghostFilterSelect.removeAll();

                            const items = [
                                [
                                    t('allGhosts'),
                                    'all'
                                ],
                                [
                                    t('mainGhosts'),
                                    'main'
                                ],
                                [
                                    t('top2Ghosts'),
                                    'top2'
                                ]
                            ];

                            let selectedItem = null;

                            items.forEach(
                                itemData => {

                                    const item =
                                        new qx.ui.form.ListItem(
                                            itemData[0]
                                        );

                                    item.setUserData(
                                        'ghostFilter',
                                        itemData[1]
                                    );

                                    this.ghostFilterSelect.add(item);

                                    if (
                                        itemData[1] === mode
                                    ) {
                                        selectedItem = item;
                                    }
                                }
                            );

                            if (selectedItem) {
                                this.ghostFilterSelect.setSelection([
                                    selectedItem
                                ]);
                            }
                        }

                        if (this.fetchLabel) {
                            this.refreshWindow();
                        }

                        if (this.languageSelect) {
                            const item =
                                this.languageSelect
                                    .getChildren()
                                    .find(
                                        child =>
                                            child.getModel &&
                                            child.getModel() === current
                                    );

                            if (item) {
                                this.languageSelect.setSelection([
                                    item
                                ]);
                            }
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // WINDOW UPDATE
                    //////////////////////////////////////////////////////////////////

                    refreshWindow: function () {

                        const totalPlayers =
                            Object.keys(
                                this.players
                            ).length;

                        const totalPlayersFetched =
                            Object.values(
                                this.players
                            ).filter(
                                m => m.isFetched
                            ).length;

                        const totalBases =
                            Object.keys(
                                this.bases
                            ).length;

                        const totalBasesFetched =
                            Object.values(
                                this.bases
                            ).filter(
                                m => m.isFetched
                            ).length;

                        const totalGhosts =
                            Object.values(
                                this.bases
                            ).filter(
                                m =>
                                    m.isFetched &&
                                    m.g
                            ).length;

                        if (totalBases > 0) {

                            this.fetchLabel.set({

                                value:
                                    [
                                        `<b>${t('players')}</b> : ${totalPlayersFetched} / ${totalPlayers}`,
                                        `<b>${t('bases')}</b> : ${totalBasesFetched} / ${totalBases}`,
                                        `<b>${t('ghosts')}</b> : ${totalGhosts}`
                                    ].join('<br>'),

                                textColor:
                                    'green'
                            });

                        } else {

                            this.fetchLabel.set({

                                value:
                                    t('nothing'),

                                textColor:
                                    'silver'
                            });
                        }

                        if (this.selectedAlliance) {

                            this.allianceLabel.set({

                                value:
                                    this.selectedAlliance.n,

                                textColor:
                                    'green'
                            });

                            this.favoriteCheckbox.setValue(
                                this.favorites.some(
                                    f =>
                                        f.id ===
                                        this.selectedAlliance.i
                                )
                            );

                        } else {

                            this.allianceLabel.set({

                                value: '',

                                textColor:
                                    'green'
                            });

                            this.favoriteCheckbox.setValue(
                                false
                            );
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // ALLIANZLISTE
                    //////////////////////////////////////////////////////////////////

                    refreshSelect: function () {

                        ClientLib.Net.CommunicationManager
                            .GetInstance()
                            .SendSimpleCommand(
                                'RankingGetCount',
                                {
                                    view: 1
                                },

                                webfrontend.phe.cnc.Util.createEventDelegate(
                                    ClientLib.Net.CommandResult,
                                    this,

                                    (context, countof) => {

                                        ClientLib.Net.CommunicationManager
                                            .GetInstance()
                                            .SendSimpleCommand(
                                                'RankingGetData',
                                                {
                                                    ascending: true,
                                                    firstIndex: 0,
                                                    lastIndex: countof,
                                                    rankingType: 0,
                                                    sortColumn: 2,
                                                    view: 1
                                                },

                                                webfrontend.phe.cnc.Util.createEventDelegate(
                                                    ClientLib.Net.CommandResult,
                                                    this,
                                                    this.onRankingGetData
                                                ),

                                                null
                                            );
                                    }
                                ),

                                null
                            );
                    },

                    //////////////////////////////////////////////////////////////////
                    // ALLIANZ AUSWÄHLEN
                    //////////////////////////////////////////////////////////////////

                    onSelectAlliance: function () {

                        const selectA =
                            this.allianceSelect
                                .getModelSelection()
                                .getItem(0);

                        this.resetAlliance();

                        this.allianceTextfield.setValue('');

                        if (
                            selectA &&
                            selectA.id > 0
                        ) {

                            this.fetchLabel.set({

                                value:
                                    t('fetchingById'),

                                textColor:
                                    'silver'
                            });

                            ClientLib.Net.CommunicationManager
                                .GetInstance()
                                .SendSimpleCommand(
                                    'GetPublicAllianceInfo',
                                    {
                                        id:
                                            selectA.id
                                    },

                                    webfrontend.phe.cnc.Util.createEventDelegate(
                                        ClientLib.Net.CommandResult,
                                        this,
                                        this.onGetPublicAllianceInfo
                                    ),

                                    null
                                );

                        } else {

                            this.allianceLabel.set({
                                value: ''
                            });

                            this.selectedAlliance =
                                null;

                            this.fetchLabel.set({

                                value:
                                    t('pleaseSelect'),

                                textColor:
                                    'white'
                            });
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // ALLIANZ SUCHEN
                    //////////////////////////////////////////////////////////////////

                    onButtonFetchAlliance: function () {

                        const customAlliance =
                            this.allianceTextfield.getValue();

                        this.resetAlliance();

                        if (
                            customAlliance &&
                            customAlliance !== ''
                        ) {

                            this.fetchLabel.set({

                                value:
                                    t('fetchingByName'),

                                textColor:
                                    'silver'
                            });

                            ClientLib.Net.CommunicationManager
                                .GetInstance()
                                .SendSimpleCommand(
                                    'GetPublicAllianceInfoByNameOrAbbreviation',
                                    {
                                        name:
                                            customAlliance
                                    },

                                    webfrontend.phe.cnc.Util.createEventDelegate(
                                        ClientLib.Net.CommandResult,
                                        this,
                                        this.onGetPublicAllianceInfoByNameOrAbbreviation
                                    ),

                                    null
                                );

                        } else {

                            this.fetchLabel.set({

                                value:
                                    t('pleaseType'),

                                textColor:
                                    'red'
                            });
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // REFRESH
                    //////////////////////////////////////////////////////////////////

                    onButtonRefresh: function () {

                        if (
                            this.selectedAlliance
                        ) {

                            const id =
                                this.selectedAlliance.i;

                            this.resetAlliance();

                            this.fetchLabel.set({

                                value:
                                    t('fetchingById'),

                                textColor:
                                    'silver'
                            });

                            ClientLib.Net.CommunicationManager
                                .GetInstance()
                                .SendSimpleCommand(
                                    'GetPublicAllianceInfo',
                                    {
                                        id: id
                                    },

                                    webfrontend.phe.cnc.Util.createEventDelegate(
                                        ClientLib.Net.CommandResult,
                                        this,
                                        this.onGetPublicAllianceInfo
                                    ),

                                    null
                                );
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOSTS ANZEIGEN
                    //////////////////////////////////////////////////////////////////

                    onButtonShowGhosts: function () {

                        if (
                            !this.ghostRendererReady
                        ) {

                            console.warn(
                                '[Ghostfinder] Ghost-Renderer noch nicht bereit.'
                            );

                            this.fetchLabel.set({

                                value:
                                    t('rendererNotReady'),

                                textColor:
                                    'orange'
                            });

                            return;
                        }

                        const ghosts =
                            this.getFilteredGhosts();

                        console.log(
                            '%c[Ghostfinder] Ghost-Auswahl:',
                            'color:cyan;font-weight:bold',
                            this.ghostFilterSelect
                                ? this.ghostFilterSelect
                                    .getSelection()[0]
                                    .getUserData('ghostFilter')
                                : 'all',
                            '| Anzahl:',
                            ghosts.length
                        );

                        this.removeGhostMarkers();

                        ghosts.forEach(
                            b =>
                                this.addGhostMarker(
                                    b
                                )
                        );

                        this.buttonClear.setEnabled(
                            this.ghostMarkers.length > 0
                        );

                        console.log(
                            '%c[Ghostfinder] Ghost-Marker gesetzt:',
                            'color:cyan;font-weight:bold',
                            this.ghostMarkers.length
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOST-AUSWAHL
                    //////////////////////////////////////////////////////////////////

                    getFilteredGhosts: function () {

                        const selection =
                            this.ghostFilterSelect
                                ? this.ghostFilterSelect
                                    .getSelection()[0]
                                : null;

                        const mode =
                            selection
                                ? selection.getUserData('ghostFilter')
                                : 'all';

                        const isGhostAndValid =
                            b =>
                                b &&
                                b.isFetched &&
                                b.g &&
                                typeof b.x === 'number' &&
                                typeof b.y === 'number';

                        // Alle schwebenden Basen: bestehendes Verhalten.
                        if (mode === 'all') {

                            return Object.values(
                                this.bases
                            ).filter(
                                isGhostAndValid
                            );
                        }

                        const result = [];
                        const seen = new Set();

                        Object.values(
                            this.players
                        ).forEach(
                            player => {

                                if (
                                    !player ||
                                    !Array.isArray(player.c)
                                ) {
                                    return;
                                }

                                const ranked =
                                    player.c
                                        .slice()
                                        .sort(
                                            (a, b) =>
                                                Number(b.p || 0) -
                                                Number(a.p || 0)
                                        );

                                const selectedBases =
                                    mode === 'main'
                                        ? ranked.slice(0, 1)
                                        : ranked.slice(0, 2);

                                selectedBases.forEach(
                                    baseInfo => {

                                        const base =
                                            this.bases[
                                                `b-${baseInfo.i}`
                                            ];

                                        if (
                                            isGhostAndValid(base) &&
                                            !seen.has(base.i)
                                        ) {

                                            seen.add(base.i);
                                            result.push(base);

                                            console.log(
                                                '%c[Ghostfinder RANK]',
                                                'color:yellow;font-weight:bold',
                                                player.n || base.pn || '',
                                                '|',
                                                base.n || '',
                                                '| Punkte:',
                                                baseInfo.p,
                                                '| Rang:',
                                                ranked.indexOf(baseInfo) + 1
                                            );
                                        }
                                    }
                                );
                            }
                        );

                        return result;
                    },

                    //////////////////////////////////////////////////////////////////
                    // EINEN GHOST SETZEN
                    //////////////////////////////////////////////////////////////////

                    addGhostMarker: function (base) {

                        try {

                            const ww =
                                this.ghostRendererWorld;

                            const uaz =
                                this.ghostRendererRoot;

                            if (
                                !ww ||
                                !uaz
                            ) {
                                return;
                            }

                            const zielX =
                                Number(base.x);

                            const zielY =
                                Number(base.y);

                            /*
                             * Funktionierender Render-Knoten:
                             * eine Kartenzeile unter dem Ziel.
                             */

                            const mapX =
                                zielX;

                            const mapY =
                                zielY + 1;

                            const nodeOffsetX =
                                65;

                            const nodeOffsetY =
                                78;

                            const basisX =
                                mapX * 128 + 3;

                            const basisY =
                                mapY * 96 - 44;

                            const nodeX =
                                basisX + nodeOffsetX;

                            const nodeY =
                                basisY + nodeOffsetY;

                            /*
                             * Sichtbare Position
                             */

                            const bildX =
                                nodeX;

                            const bildY =
                                nodeY - 96;

                            /*
                             * Kreisgröße
                             */

                            const radius =
                                65;

                            /*
                             * Basisname
                             */

                            const basisName =
                                String(
                                    base.n || 'Ghost'
                                );

                            /*
                             * Besitzer
                             */

                            const ownerName =
                                String(
                                    base.pn || 'Unbekannt'
                                );

                            /*
                             * VKVAYK erzeugen
                             */

                            const bild =
                                (new $I.VKVAYK).EZBPQM();

                            bild.VZOHDC =
                                1;

                            bild.PZGTBW =
                                true;

                            bild.SJAVSW =
                                0;

                            bild.LMKPBT =
                                0;

                            bild.EWJFML =
                                0;

                            bild.WAVWQR =
                                bildX;

                            bild.IVXFVG =
                                bildY;

                            bild.YHAABV =
                                radius * 2;

                            bild.BEJVGV =
                                radius * 2;

                            bild.IAZCLT =
                                null;

                            bild.GLCMWM =
                                uaz;

                            /*
                             * ==================================================
                             * RENDERING
                             * ==================================================
                             */

                            bild.UIYIHQ =
                                function (ctx) {

                                    try {

                                        ctx.save();

                                        /*
                                         * --------------------------------------
                                         * ROTER KREIS
                                         * --------------------------------------
                                         */

                                        ctx.globalAlpha =
                                            0.55;

                                        ctx.fillStyle =
                                            '#ff0000';

                                        ctx.beginPath();

                                        ctx.arc(
                                            this.WAVWQR,
                                            this.IVXFVG,
                                            radius,
                                            0,
                                            Math.PI * 2
                                        );

                                        ctx.fill();

                                        /*
                                         * --------------------------------------
                                         * BESCHRIFTUNG
                                         * --------------------------------------
                                         */

                                        ctx.globalAlpha =
                                            1;

                                        ctx.textAlign =
                                            'center';

                                        ctx.textBaseline =
                                            'middle';

                                        /*
                                         * Basisname
                                         */

                                        ctx.font =
                                            'bold 14px Arial';

                                        const basisWidth =
                                            ctx.measureText(
                                                basisName
                                            ).width;

                                        /*
                                         * Besitzer
                                         */

                                        ctx.font =
                                            '11px Arial';

                                        const ownerWidth =
                                            ctx.measureText(
                                                ownerName
                                            ).width;

                                        /*
                                         * Größte Textbreite bestimmen
                                         */

                                        const textWidth =
                                            Math.max(
                                                basisWidth,
                                                ownerWidth
                                            );

                                        const paddingX =
                                            6;

                                        const paddingY =
                                            4;

                                        const boxWidth =
                                            textWidth +
                                            paddingX * 2;

                                        const boxHeight =
                                            34;

                                        /*
                                         * Position des Textfeldes
                                         */

                                        const textX =
                                            this.WAVWQR;

                                        const textY =
                                            this.IVXFVG -
                                            radius +
                                            20;

                                        /*
                                         * Schwarzer transparenter
                                         * Hintergrund
                                         */

                                        ctx.fillStyle =
                                            'rgba(0,0,0,0.80)';

                                        ctx.fillRect(
                                            textX -
                                                boxWidth / 2,

                                            textY -
                                                boxHeight / 2,

                                            boxWidth,
                                            boxHeight
                                        );

                                        /*
                                         * --------------------------------------
                                         * BASISNAME
                                         * --------------------------------------
                                         */

                                        ctx.font =
                                            'bold 14px Arial';

                                        ctx.fillStyle =
                                            '#ffffff';

                                        ctx.fillText(
                                            basisName,
                                            textX,
                                            textY - 7
                                        );

                                        /*
                                         * --------------------------------------
                                         * BESITZER
                                         * --------------------------------------
                                         */

                                        ctx.font =
                                            '11px Arial';

                                        ctx.fillStyle =
                                            '#dddddd';

                                        ctx.fillText(
                                            ownerName,
                                            textX,
                                            textY + 8
                                        );

                                        ctx.restore();

                                    } catch (e) {

                                        console.error(
                                            '[Ghostfinder] Kreis-/Text-Renderfehler:',
                                            e
                                        );
                                    }
                                };

                            /*
                             * ==================================================
                             * RENDER-BOUNDS
                             * ==================================================
                             */

                            const halbX =
                                bild.YHAABV / 2;

                            const halbY =
                                bild.BEJVGV / 2;

                            const minX =
                                nodeX - halbX;

                            const maxX =
                                nodeX + halbX;

                            const minY =
                                nodeY - halbY;

                            const maxY =
                                nodeY + halbY;

                            ww.VYLEYP(
                                bild,
                                minX,
                                minY,
                                maxX,
                                maxY
                            );

                            /*
                             * Renderknoten merken
                             */

                            /*
 * Den tatsächlichen Parent-Node unseres Bildes
 * suchen.
 *
 * Nicht über Koordinaten bestimmen!
 * Wir suchen exakt das von uns erzeugte Objekt.
 */

let renderNode = null;

if (
    ww.CNTDDB &&
    ww.CNTDDB.length
) {

    for (
        let i = 0;
        i < ww.CNTDDB.length;
        i++
    ) {

        const node =
            ww.CNTDDB[i];

        if (
            !node ||
            !node.VVDSNU ||
            !node.VVDSNU.l
        ) {
            continue;
        }

        const liste =
            node.VVDSNU.l;

        for (
            let j = 0;
            j < liste.length;
            j++
        ) {

            if (
                liste[j] === bild
            ) {

                renderNode =
                    node;

                console.log(
                    '%c[Ghostfinder] Parent-Node gefunden:',
                    'color:lime;font-weight:bold',
                    'CNTDDB[' + i + ']'
                );

                break;
            }
        }

        if (renderNode) {
            break;
        }
    }
}

if (!renderNode) {

    console.warn(
        '%c[Ghostfinder] Parent-Node NICHT gefunden:',
        'color:orange;font-weight:bold',
        base.n
    );
}

                            /*
                             * Marker speichern
                             */

                            this.ghostMarkers.push({

                                base:
                                    base,

                                bild:
                                    bild,

                                node:
                                    renderNode
                            });

                            console.log(
                                '%c[Ghostfinder] Ghost gesetzt:',
                                'color:lime;font-weight:bold',
                                basisName,
                                '|',
                                ownerName,
                                '|',
                                zielX + ':' + zielY
                            );

                        } catch (e) {

                            console.error(
                                '%c[Ghostfinder] Ghost-Fehler:',
                                'color:red;font-weight:bold',
                                base,
                                e
                            );
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOSTS ENTFERNEN
                    //////////////////////////////////////////////////////////////////

                    removeGhostMarkers: function () {

    console.log(
        '%c[Ghostfinder CLEAR] ===== START =====',
        'color:yellow;font-weight:bold'
    );

    const ww =
        this.ghostRendererWorld;

    if (
        !ww ||
        !ww.CNTDDB
    ) {

        console.error(
            '[Ghostfinder CLEAR] Renderwelt nicht verfügbar.'
        );

        return;
    }

    const markers =
        this.ghostMarkers.slice();

    let removed = 0;
    let notFound = 0;

    console.log(
        '[Ghostfinder CLEAR] Marker:',
        markers.length
    );

    /*
     * Jeden unserer Marker einzeln suchen.
     */

    markers.forEach(
        (marker, markerIndex) => {

            if (!marker || !marker.bild) {

                notFound++;

                return;
            }

            let foundNode =
                null;

            /*
             * AKTUELLEN Renderbaum durchsuchen.
             */

            for (
                let i = 0;
                i < ww.CNTDDB.length;
                i++
            ) {

                const node =
                    ww.CNTDDB[i];

                if (
                    !node ||
                    !node.VVDSNU ||
                    !node.VVDSNU.l
                ) {
                    continue;
                }

                const liste =
                    node.VVDSNU.l;

                for (
                    let j = 0;
                    j < liste.length;
                    j++
                ) {

                    /*
                     * Exakte Objekt-Referenz!
                     */

                    if (
                        liste[j] ===
                        marker.bild
                    ) {

                        foundNode =
                            node;

                        break;
                    }
                }

                if (foundNode) {
                    break;
                }
            }

            /*
             * Parent gefunden -> löschen
             */

            if (foundNode) {

                try {

                    foundNode.QAOPNR(
                        marker.bild
                    );

                    removed++;

                    console.log(
                        '%c[Ghostfinder CLEAR] gelöscht:',
                        'color:lime;font-weight:bold',
                        markerIndex,
                        marker.base
                            ? marker.base.n
                            : ''
                    );

                } catch (e) {

                    console.error(
                        '[Ghostfinder CLEAR] Fehler beim Löschen:',
                        e
                    );
                }

            } else {

                notFound++;

                console.warn(
                    '%c[Ghostfinder CLEAR] Marker nicht gefunden:',
                    'color:orange;font-weight:bold',
                    markerIndex,
                    marker.base
                        ? marker.base.n
                        : ''
                );
            }
        }
    );

    /*
     * Renderliste aktualisieren.
     */

    try {

        if (
            typeof ww.HLOSPC ===
            'function'
        ) {

            ww.HLOSPC();
        }

    } catch (e) {

        console.warn(
            '[Ghostfinder CLEAR] HLOSPC Fehler:',
            e
        );
    }

    /*
     * Unsere Marker-Liste erst jetzt leeren.
     */

    this.ghostMarkers = [];

    console.log(
        '%c[Ghostfinder CLEAR] Ergebnis:',
        'color:yellow;font-weight:bold',
        'gelöscht =',
        removed,
        '| nicht gefunden =',
        notFound
    );

    console.log(
        '%c[Ghostfinder CLEAR] ===== ENDE =====',
        'color:yellow;font-weight:bold'
    );
},
                    //////////////////////////////////////////////////////////////////
                    // CLEAR
                    //////////////////////////////////////////////////////////////////

                    onButtonClear: function () {

                        this.removeGhostMarkers();

                        this.buttonClear.setEnabled(
                            false
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // FAVORIT
                    //////////////////////////////////////////////////////////////////

                    onCheckboxFavorite: function () {

                        if (
                            this.favoriteCheckbox.getValue()
                        ) {

                            if (
                                this.selectedAlliance &&
                                !this.favorites.some(
                                    f =>
                                        f.id ===
                                        this.selectedAlliance.i
                                )
                            ) {

                                this.favorites.push({

                                    id:
                                        this.selectedAlliance.i,

                                    name:
                                        this.selectedAlliance.n
                                });

                                this.saveStorage();

                                this.refreshSelect();
                            }

                        } else {

                            if (
                                this.selectedAlliance
                            ) {

                                this.favorites =
                                    this.favorites.filter(
                                        f =>
                                            f.id !==
                                            this.selectedAlliance.i
                                    );

                                this.saveStorage();

                                this.refreshSelect();
                            }
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // CALLBACKS
                    //////////////////////////////////////////////////////////////////

                    onGetPublicAllianceInfoByNameOrAbbreviation:
                        function (
                            context,
                            data
                        ) {

                            if (
                                data &&
                                data.i
                            ) {

                                this.updateAllianceInfo(
                                    data
                                );

                            } else {

                                this.fetchLabel.set({

                                    value:
                                        t('invalidAlliance'),

                                    textColor:
                                        'red'
                                });
                            }
                        },

                    onGetPublicAllianceInfo:
                        function (
                            context,
                            data
                        ) {

                            this.updateAllianceInfo(
                                data
                            );
                        },

                    onRankingGetData:
                        function (
                            context,
                            data
                        ) {

                            this.allianceSelect.removeAll();

                            this.allianceSelect.add(
                                new qx.ui.form.ListItem(
                                    '',
                                    null,
                                    {
                                        id: 0,
                                        name: ''
                                    }
                                )
                            );

                            this.favorites.forEach(
                                a => {

                                    this.allianceSelect.add(
                                        new qx.ui.form.ListItem(
                                            `[fav] ${a.name}`,
                                            null,
                                            a
                                        )
                                    );
                                }
                            );

                            data.a.forEach(
                                (a, i) => {

                                    this.allianceSelect.add(
                                        new qx.ui.form.ListItem(
                                            `${i + 1} - ${a.an}`,
                                            null,
                                            {
                                                id: a.a,
                                                name: a.an
                                            }
                                        )
                                    );
                                }
                            );
                        },

                    //////////////////////////////////////////////////////////////////
                    // SPIELERDATEN
                    //////////////////////////////////////////////////////////////////

                    onGetPublicPlayerInfo:
                        function (
                            context,
                            data
                        ) {

                            if (
                                data &&
                                data.c
                            ) {

                                const idMain =
                                    data.c.reduce(
                                        (p, c) =>
                                            c.p > p.p
                                                ? c
                                                : p,
                                        data.c[0]
                                    ).i;

                                this.players[
                                    `pid-${data.i}`
                                ] =
                                    Object.assign(
                                        Object.assign(
                                            {},
                                            this.players[
                                                `pid-${data.i}`
                                            ]
                                        ),
                                        {
                                            c:
                                                data.c.map(
                                                    cc =>
                                                        Object.assign(
                                                            Object.assign(
                                                                {},
                                                                cc
                                                            ),
                                                            {
                                                                pn:
                                                                    data.n,

                                                                isMain:
                                                                    cc.i ===
                                                                    idMain,

                                                                isGhost:
                                                                    null
                                                            }
                                                        )
                                                ),

                                            isFetched:
                                                true
                                        }
                                    );

                                data.c.forEach(
                                    b => {

                                        this.bases[
                                            `b-${b.i}`
                                        ] =
                                            Object.assign(
                                                Object.assign(
                                                    {},
                                                    b
                                                ),
                                                {

                                                    isFetched:
                                                        false,

                                                    isMain:
                                                        b.i ===
                                                        idMain,

                                                    marker:
                                                        null
                                                }
                                            );

                                        ClientLib.Net.CommunicationManager
                                            .GetInstance()
                                            .SendSimpleCommand(
                                                'GetPublicCityInfoById',
                                                {
                                                    id:
                                                        b.i
                                                },

                                                webfrontend.phe.cnc.Util.createEventDelegate(
                                                    ClientLib.Net.CommandResult,
                                                    this,
                                                    this.onGetPublicCityInfoById
                                                ),

                                                null
                                            );
                                    }
                                );

                                this.refreshWindow();
                            }
                        },

                    //////////////////////////////////////////////////////////////////
                    // BASISDATEN
                    //////////////////////////////////////////////////////////////////

                    onGetPublicCityInfoById:
                        function (
                            context,
                            data
                        ) {

                            if (
                                data &&
                                data.i
                            ) {

                                this.bases[
                                    `b-${data.i}`
                                ] =
                                    Object.assign(
                                        Object.assign(
                                            Object.assign(
                                                {},
                                                this.bases[
                                                    `b-${data.i}`
                                                ]
                                            ),
                                            data
                                        ),
                                        {
                                            isFetched:
                                                true
                                        }
                                    );

                                this.refreshWindow();
                            }
                        },

                    //////////////////////////////////////////////////////////////////
                    // ALLIANZ INFORMATION
                    //////////////////////////////////////////////////////////////////

                    resetAlliance:
                        function () {

                            this.removeGhostMarkers();

                            this.players = {};
                            this.bases = {};

                            this.selectedAlliance =
                                null;

                            this.buttonShowGhosts
                                .setEnabled(false);

                            this.buttonClear
                                .setEnabled(false);

                            this.favoriteCheckbox
                                .setEnabled(false);

                            this.buttonRefresh
                                .setEnabled(false);

                            this.refreshWindow();
                        },

                    updateAllianceInfo:
                        function (data) {

                            this.selectedAlliance =
                                data;

                            this.buttonShowGhosts
                                .setEnabled(true);

                            this.buttonClear
                                .setEnabled(true);

                            this.favoriteCheckbox
                                .setEnabled(true);

                            this.buttonRefresh
                                .setEnabled(true);

                            data.m
                                .sort(
                                    (a, b) =>
                                        a.n.localeCompare(
                                            b.n
                                        )
                                )
                                .forEach(
                                    m => {

                                        this.players[
                                            `pid-${m.i}`
                                        ] =
                                            Object.assign(
                                                Object.assign(
                                                    {},
                                                    m
                                                ),
                                                {
                                                    fetched:
                                                        false
                                                }
                                            );

                                        ClientLib.Net.CommunicationManager
                                            .GetInstance()
                                            .SendSimpleCommand(
                                                'GetPublicPlayerInfo',
                                                {
                                                    id:
                                                        m.i
                                                },

                                                webfrontend.phe.cnc.Util.createEventDelegate(
                                                    ClientLib.Net.CommandResult,
                                                    this,
                                                    this.onGetPublicPlayerInfo
                                                ),

                                                null
                                            );
                                    }
                                );

                            this.refreshWindow();
                        },

                    //////////////////////////////////////////////////////////////////
                    // STORAGE
                    //////////////////////////////////////////////////////////////////

                    loadStorage:
                        function () {

                            const storage =
                                JSON.parse(
                                    localStorage.getItem(
                                        storageKey
                                    ) || '{}'
                                ) || {};

                            this.favorites =
                                storage[
                                    `wid-${ClientLib.Data.MainData
                                        .GetInstance()
                                        .get_Server()
                                        .get_WorldId()}`
                                ] || [];
                        },

                    saveStorage:
                        function () {

                            const storage =
                                JSON.parse(
                                    localStorage.getItem(
                                        storageKey
                                    ) || '{}'
                                ) || {};

                            storage[
                                `wid-${ClientLib.Data.MainData
                                    .GetInstance()
                                    .get_Server()
                                    .get_WorldId()}`
                            ] =
                                this.favorites;

                            localStorage.setItem(
                                storageKey,
                                JSON.stringify(
                                    storage || {}
                                )
                            );
                        }
                }
            });

            Main.getInstance().initialize();
        };

        //////////////////////////////////////////////////////////////////
        // GAME LOAD CHECK
        //////////////////////////////////////////////////////////////////

        function checkForInit() {

            try {

                if (
                    typeof qx === 'undefined' ||
                    typeof qx.core?.Init?.getApplication !==
                        'function' ||
                    !qx.core.Init
                        .getApplication()
                        ?.initDone
                ) {

                    return setTimeout(
                        checkForInit,
                        1000
                    );
                }

                init();

                console.log(
                    `%c${scriptName} loaded`,
                    'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;'
                );

            } catch (e) {

                console.error(
                    `%c${scriptName} error`,
                    'background: black; color: pink; font-weight:bold; padding: 3px; border-radius: 5px;',
                    e
                );
            }
        }

        checkForInit();
    };

    GhostfinderScript();

})();
