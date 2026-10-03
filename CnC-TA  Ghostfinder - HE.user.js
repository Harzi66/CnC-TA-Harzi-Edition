// ==UserScript==
// @name         Ghostfinder - HE
// @namespace    https://github.com/Harzi66/CnC-TA-Harzi-Edition
// @version      2.0.5
// @description  Weiterentwicklung des CnCTA Base Finder mit eigenem Geisterbasen-Renderer.
// @author       Harzi
// @contributor  bloofi
// @contributor  ffi82
// @match        https://*.alliances.commandandconquer.com/*/*
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Ghostfinder-HE/main/CnC-TA-Ghostfinder-HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Ghostfinder-HE/main/CnC-TA-Ghostfinder-HE.user.js
// @grant        none
// ==/UserScript==


// Änderungen in 2.0.5
// - Umstellung auf HTML-DOM-Methode

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
 * - HTML-DOM-Methode
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
                language: 'Sprache',
                mainBaseTitle: 'Main-Suche',
                mainBaseSelection: 'Main-Auswahl :',
                mainBaseOnly: 'Main Basen',
                mainBaseTop2: 'Main & Zweit Main',
                mainBaseTop3: 'Main bis 3-Main',
                showMain: 'Main anzeigen',
                mainColor: 'Main-Farbe:',
                ghostColor: 'Ghost-Farbe:',
                colorBlue: 'Blau',
                colorRed: 'Rot',
                colorGreen: 'Grün',
                colorYellow: 'Gelb',
                colorOrange: 'Orange',
                colorPurple: 'Violett',
                colorCyan: 'Cyan',
                colorWhite: 'Weiß',
                addAlliance: 'Hinzufügen',
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
                language: 'Language',
                mainBaseTitle: 'Main base search',
                mainBaseSelection: 'Main selection :',
                mainBaseOnly: 'Main bases',
                mainBaseTop2: 'Main & second Main',
                mainBaseTop3: 'Main up to 3-Main',
                showMain: 'Show Main',
                mainColor: 'Main color:',
                ghostColor: 'Ghost color:',
                colorBlue: 'Blue',
                colorRed: 'Red',
                colorGreen: 'Green',
                colorYellow: 'Yellow',
                colorOrange: 'Orange',
                colorPurple: 'Purple',
                colorCyan: 'Cyan',
                colorWhite: 'White',
                addAlliance: 'Add',
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
                language: 'Langue',
                mainBaseTitle: 'Recherche de bases Main',
                mainBaseSelection: 'Sélection Main :',
                mainBaseOnly: 'Bases Main',
                mainBaseTop2: 'Main & deuxième Main',
                mainBaseTop3: 'Main jusqu’à 3 bases',
                showMain: 'Afficher les Main',
                mainColor: 'Couleur Main :',
                ghostColor: 'Couleur Ghost :',
                colorBlue: 'Bleu',
                colorRed: 'Rouge',
                colorGreen: 'Vert',
                colorYellow: 'Jaune',
                colorOrange: 'Orange',
                colorPurple: 'Violet',
                colorCyan: 'Cyan',
                colorWhite: 'Blanc',
                addAlliance: 'Ajouter',
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
                language: 'Idioma',
                mainBaseTitle: 'Búsqueda de bases Main',
                mainBaseSelection: 'Selección de Main :',
                mainBaseOnly: 'Bases Main',
                mainBaseTop2: 'Main y segundo Main',
                mainBaseTop3: 'Main hasta 3 bases',
                showMain: 'Mostrar Main',
                mainColor: 'Color Main:',
                ghostColor: 'Color Ghost:',
                colorBlue: 'Azul',
                colorRed: 'Rojo',
                colorGreen: 'Verde',
                colorYellow: 'Amarillo',
                colorOrange: 'Naranja',
                colorPurple: 'Violeta',
                colorCyan: 'Cian',
                colorWhite: 'Blanco',
                addAlliance: 'Añadir',
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
                    selectedAlliances: [],
                    autoShowMainAfterReload: false,

                    players: {},
                    bases: {},
                    allianceData: {},


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
                    buttonAddAlliance: null,
                    selectedAllianceList: null,

                    favoriteCheckbox: null,

                    buttonRefresh: null,
                    buttonShowGhosts: null,
                    buttonClear: null,

                    ghostFilterSelect: null,
                    languageSelect: null,
                    languageRow: null,
                    mainColorSelect: null,
                    ghostColorSelect: null,

                    //////////////////////////////////////////////////////////////////
                    // GHOST RENDERER
                    //////////////////////////////////////////////////////////////////

                    ghostRendererReady: false,
                    ghostRendererRoot: null,
                    ghostRendererWorld: null,

                    ghostMarkers: [],
                    mainMarkers: [],

                    //////////////////////////////////////////////////////////////////
                    // INIT
                    //////////////////////////////////////////////////////////////////

                    initialize: function () {

                        ghostfinderMainInstance = this;

                        this.installGhostRendererHook();
                        const scriptsButton =
                              qx.core.Init
                        .getApplication()
                        .getMenuBar()
                        .getScriptsButton();

                        scriptsButton.Add(
                            'Ghostfinder - HE'
                        );

                        const button =
                              scriptsButton
                        .getMenu()
                        .getChildren()
                        .find(
                            item =>
                            item.getLabel() ===
                            'Ghostfinder - HE'
                        );

                        if (!button) {
                            console.error(
                                'Ghostfinder - HE: Nativer Menüeintrag konnte nicht ermittelt werden'
                            );
                            return;
                        }

                        button.addListener(
                            'execute',
                            this.onOpenMainWindow,
                            this
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOST RENDERER HOOK
                    //////////////////////////////////////////////////////////////////

                    installGhostRendererHook: function () {
                        const self = this;

                        function hook() {
                            if (typeof $I === 'undefined' || !$I.BCBWRF) {
                                setTimeout(hook, 1000);
                                return;
                            }

                            const manager = $I.BCBWRF.GetInstance();
                            const world = manager && manager.get_World();

                            if (!world) {
                                setTimeout(hook, 1000);
                                return;
                            }

                            self.ghostRendererWorld = world;
                            self.ghostRendererRoot = world.CZSFRF;
                            self.ghostRendererReady = true;

                            console.log(
                                '%c[Ghostfinder] Neuer Weltkarten-Renderer bereit',
                                'color:lime;font-weight:bold'
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

                        // ---------------------------------------------------------------
                        // Trennlinie unter Sprache
                        // ---------------------------------------------------------------

                        const languageSeparator =
                              new qx.ui.core.Widget().set({
                                  height: 3,

                                  decorator:
                                  new qx.ui.decoration.Decorator().set({
                                      color: 'white',
                                      style: 'solid',
                                      widthTop: 2
                                  })
                              });


                        // ---------------------------------------------------------------
                        // FARBWAHL
                        // ---------------------------------------------------------------

                        const colorRow =
                              new qx.ui.container.Composite(
                                  new qx.ui.layout.HBox(10)
                              );

                        const mainColorLabel =
                              new qx.ui.basic.Label(
                                  t('mainColor')
                              ).set({
                                  width: 90,
                                  textColor: 'white'
                              });

                        this.mainColorLabel = mainColorLabel;

                        this.mainColorSelect =
                            new qx.ui.form.SelectBox().set({
                            width: 130
                        });

                        const mainColorItems = [
                            [t('colorBlue'), '#0088ff'],
                            [t('colorRed'), '#ff0000'],
                            [t('colorGreen'), '#00cc00'],
                            [t('colorYellow'), '#ffff00'],
                            [t('colorOrange'), '#ff8800'],
                            [t('colorPurple'), '#aa00ff'],
                            [t('colorCyan'), '#00ffff'],
                            [t('colorWhite'), '#ffffff']
                        ];

                        mainColorItems.forEach(
                            itemData => {
                                const item =
                                      new qx.ui.form.ListItem(
                                          itemData[0]
                                      );

                                item.setUserData(
                                    'color',
                                    itemData[1]
                                );

                                this.mainColorSelect.add(item);
                            }
                        );

                        const savedMainColor =
                              this.mainColorSelect
                        .getChildren()
                        .find(
                            item =>
                            item.getUserData('color') ===
                            this.mainColor
                        );

                        this.mainColorSelect.setSelection([
                            savedMainColor ||
                            this.mainColorSelect.getChildren()[0]

                        ]);

                        this.mainColorSelect.setSelection([
                            savedMainColor ||
                            this.mainColorSelect.getChildren()[0]

                        ]);

                        this.mainColorSelect.addListener(
                            'changeSelection',
                            function () {
                                const selection =
                                      this.mainColorSelect
                                .getSelection();

                                if (
                                    selection &&
                                    selection.length > 0
                                ) {
                                    this.mainColor =
                                        selection[0]
                                        .getUserData('color');

                                    this.saveStorage();
                                }
                            },
                            this
                        );

                        colorRow.add(
                            mainColorLabel
                        );

                        colorRow.add(
                            this.mainColorSelect
                        );

                        this.mainWindow.add(
                            colorRow
                        );


                        const ghostColorRow =
                              new qx.ui.container.Composite(
                                  new qx.ui.layout.HBox(10)
                              );

                        const ghostColorLabel =
                              new qx.ui.basic.Label(
                                  t('ghostColor')
                              ).set({
                                  width: 90,
                                  textColor: 'white'
                              });

                        this.ghostColorLabel = ghostColorLabel;

                        this.ghostColorSelect =
                            new qx.ui.form.SelectBox().set({
                            width: 130
                        });

                        const ghostColorItems = [
                            ['Rot', '#ff0000'],
                            ['Blau', '#0088ff'],
                            ['Grün', '#00cc00'],
                            ['Gelb', '#ffff00'],
                            ['Orange', '#ff8800'],
                            ['Violett', '#aa00ff'],
                            ['Cyan', '#00ffff'],
                            ['Weiß', '#ffffff']
                        ];

                        ghostColorItems.forEach(
                            itemData => {
                                const item =
                                      new qx.ui.form.ListItem(
                                          itemData[0]
                                      );

                                item.setUserData(
                                    'color',
                                    itemData[1]
                                );

                                this.ghostColorSelect.add(item);
                            }
                        );

                        const savedGhostColor =
                              this.ghostColorSelect
                        .getChildren()
                        .find(
                            item =>
                            item.getUserData('color') ===
                            this.ghostColor
                        );

                        this.ghostColorSelect.setSelection([
                            savedGhostColor ||
                            this.ghostColorSelect.getChildren()[0]
                        ]);

                        this.ghostColorSelect.addListener(
                            'changeSelection',
                            function () {
                                const selection =
                                      this.ghostColorSelect
                                .getSelection();

                                if (
                                    selection &&
                                    selection.length > 0
                                ) {
                                    this.ghostColor =
                                        selection[0]
                                        .getUserData('color');

                                    this.saveStorage();
                                }
                            },
                            this
                        );

                        ghostColorRow.add(
                            ghostColorLabel
                        );

                        ghostColorRow.add(
                            this.ghostColorSelect
                        );

                        this.mainWindow.add(
                            ghostColorRow
                        );

                        this.mainWindow.add(

                            languageSeparator

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

                        const allianceSelectRow =
                              new qx.ui.container.Composite(
                                  new qx.ui.layout.HBox(5)
                              );

                        this.allianceSelect =
                            new qx.ui.form.SelectBox().set({
                            width: 205
                        });

                        this.allianceSelect.addListener(
                            'changeSelection',
                            this.onSelectAlliance,
                            this
                        );

                        allianceSelectRow.add(
                            this.allianceSelect,
                            {
                                flex: 1
                            }
                        );

                        this.buttonAddAlliance =
                            new qx.ui.form.Button(
                            t('addAlliance')
                        );

                        this.buttonAddAlliance.addListener(
                            'execute',
                            this.onButtonAddAlliance,
                            this
                        );

                        allianceSelectRow.add(
                            this.buttonAddAlliance
                        );

                        this.mainWindow.add(
                            allianceSelectRow
                        );

                        this.selectedAllianceList =
                            new qx.ui.container.Composite(
                            new qx.ui.layout.VBox(2)
                        ).set({
                            width: 300,
                            minHeight: 0
                        });

                        this.mainWindow.add(
                            this.selectedAllianceList
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


                        // ---------------------------------------------------------------
                        // GHOSTFINDER ÜBERSCHRIFT
                        // ---------------------------------------------------------------

                        this.ghostfinderTitle =
                            new qx.ui.basic.Label().set({

                            textAlign: 'center',
                            width: 300,

                            rich: true,

                            textColor: '#ff0000',

                            value: '●&nbsp;&nbsp;Ghostfinder&nbsp;&nbsp;●',

                            backgroundColor: 'rgba(0, 0, 0, 0.75)'
                        });

                        this.mainWindow.add(
                            this.ghostfinderTitle
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

                        // ---------------------------------------------------------------
                        // Trennlinie unter den Ghost-Buttons
                        // ---------------------------------------------------------------

                        const ghostButtonSeparator =
                              new qx.ui.container.Composite(
                                  new qx.ui.layout.HBox(10)
                              ).set({

                                  height: 6,

                                  decorator:
                                  new qx.ui.decoration.Decorator().set({

                                      color: 'white',
                                      style: 'solid',

                                      width: 0,
                                      widthTop: 3,
                                      widthBottom: 0
                                  })
                              });

                        this.mainWindow.add(
                            ghostButtonSeparator
                        );

                        // ---------------------------------------------------------------
                        // MAIN-BASIS-SUCHE ÜBERSCHRIFT
                        // ---------------------------------------------------------------

                        this.mainBaseTitle =
                            new qx.ui.basic.Label().set({

                            textAlign: 'center',
                            width: 300,
                            rich: true,

                            textColor: '#00aaff',

                            backgroundColor: 'rgba(0, 0, 0, 0.75)',

                            value:
                            '●&nbsp;&nbsp;' + t('mainBaseTitle') + '&nbsp;&nbsp;●'
                        });

                        this.mainWindow.add(
                            this.mainBaseTitle
                        );

                        this.mainBaseStatusLabel =
                            new qx.ui.basic.Label().set({
                            textAlign: 'left',
                            width: 300,
                            rich: true,
                            textColor: 'green',
                            value: ''
                        });

                        this.mainWindow.add(
                            this.mainBaseStatusLabel
                        );

                        // ---------------------------------------------------------------
                        // MAIN-BASIS AUSWAHL
                        // ---------------------------------------------------------------

                        this.mainBaseSelectionLabel =
                            new qx.ui.basic.Label().set({

                            textAlign: 'left',
                            width: 300,
                            rich: true,
                            textColor: 'white',

                            value: t('mainBaseSelection')
                        });

                        this.mainWindow.add(
                            this.mainBaseSelectionLabel
                        );


                        // ---------------------------------------------------------------
                        // MAIN-BASIS AUSWAHLFELD
                        // ---------------------------------------------------------------

                        this.mainBaseSelect =
                            new qx.ui.form.SelectBox();

                        const mainBaseOnly =
                              new qx.ui.form.ListItem(
                                  t('mainBaseOnly')
                              );

                        mainBaseOnly.setUserData(
                            'mainBaseFilter',
                            'main'
                        );

                        const mainBaseTop2 =
                              new qx.ui.form.ListItem(
                                  t('mainBaseTop2')
                              );

                        mainBaseTop2.setUserData(
                            'mainBaseFilter',
                            'mainTop2'
                        );

                        const mainBaseTop3 =
                              new qx.ui.form.ListItem(
                                  t('mainBaseTop3')
                              );

                        mainBaseTop3.setUserData(
                            'mainBaseFilter',
                            'mainTop3'
                        );

                        this.mainBaseSelect.add(
                            mainBaseOnly
                        );

                        this.mainBaseSelect.add(
                            mainBaseTop2
                        );

                        this.mainBaseSelect.add(
                            mainBaseTop3
                        );

                        this.mainBaseSelect.setSelection([
                            mainBaseOnly
                        ]);

                        this.mainWindow.add(
                            this.mainBaseSelect
                        );


                        // ---------------------------------------------------------------
                        // MAIN-BASIS BUTTONS
                        // ---------------------------------------------------------------

                        const mainButtonRow =
                              new qx.ui.container.Composite(
                                  new qx.ui.layout.HBox(5)
                              );

                        this.buttonShowMain =
                            new qx.ui.form.Button(
                            t('showMain')
                        );

                        this.buttonClearMain =
                            new qx.ui.form.Button(
                            t('clearMarkers')
                        );

                        this.buttonShowMain.setEnabled(
                            false
                        );

                        this.buttonClearMain.setEnabled(
                            false
                        );

                        mainButtonRow.add(
                            this.buttonShowMain,
                            {
                                flex: 1
                            }
                        );

                        this.buttonShowMain.addListener(
                            'execute',
                            this.onButtonShowMain,
                            this
                        );

                        mainButtonRow.add(
                            this.buttonClearMain,
                            {
                                flex: 1
                            }
                        );

                        this.buttonClearMain.addListener(
                            'execute',
                            this.removeMainMarkers,
                            this
                        );

                        this.mainWindow.add(
                            mainButtonRow
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

                        if (this.mainBaseTitle) {
                            this.mainBaseTitle.setValue(
                                '●&nbsp;&nbsp;' +
                                t('mainBaseTitle') +
                                '&nbsp;&nbsp;●'
                            );
                        }

                        if (this.mainBaseSelectionLabel) {
                            this.mainBaseSelectionLabel.setValue(
                                t('mainBaseSelection')
                            );
                        }

                        if (this.mainColorLabel) {
                            this.mainColorLabel.setValue(
                                t('mainColor')
                            );
                        }

                        if (this.ghostColorLabel) {
                            this.ghostColorLabel.setValue(
                                t('ghostColor')
                            );
                        }

                        if (this.buttonShowMain) {
                            this.buttonShowMain.setLabel(
                                t('showMain')
                            );
                        }

                        if (this.buttonAddAlliance) {
                            this.buttonAddAlliance.setLabel(
                                t('addAlliance')
                            );
                        }

                        if (this.buttonClearMain) {
                            this.buttonClearMain.setLabel(
                                t('clearMarkers')
                            );
                        }

                        if (this.mainBaseSelect) {

                            const selection =
                                  this.mainBaseSelect
                            .getSelection()[0];

                            const mode =
                                  selection
                            ? selection.getUserData('mainBaseFilter')
                            : 'main';

                            this.mainBaseSelect.removeAll();

                            const items = [
                                [
                                    t('mainBaseOnly'),
                                    'main'
                                ],
                                [
                                    t('mainBaseTop2'),
                                    'mainTop2'
                                ],
                                [
                                    t('mainBaseTop3'),
                                    'mainTop3'
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
                                        'mainBaseFilter',
                                        itemData[1]
                                    );

                                    this.mainBaseSelect.add(item);

                                    if (
                                        itemData[1] === mode
                                    ) {
                                        selectedItem = item;
                                    }
                                }
                            );

                            if (selectedItem) {
                                this.mainBaseSelect.setSelection([
                                    selectedItem
                                ]);
                            }
                        }

                        if (this.mainColorSelect) {

                            const selectedColor =
                                  this.mainColorSelect
                            .getSelection()[0]
                            ?.getUserData('color');

                            this.mainColorSelect.removeAll();

                            const items = [
                                [t('colorBlue'), '#0088ff'],
                                [t('colorRed'), '#ff0000'],
                                [t('colorGreen'), '#00cc00'],
                                [t('colorYellow'), '#ffff00'],
                                [t('colorOrange'), '#ff8800'],
                                [t('colorPurple'), '#aa00ff'],
                                [t('colorCyan'), '#00ffff'],
                                [t('colorWhite'), '#ffffff']
                            ];

                            let selectedItem = null;

                            items.forEach(itemData => {

                                const item =
                                      new qx.ui.form.ListItem(
                                          itemData[0]
                                      );

                                item.setUserData(
                                    'color',
                                    itemData[1]
                                );

                                this.mainColorSelect.add(item);

                                if (itemData[1] === selectedColor) {
                                    selectedItem = item;
                                }
                            });

                            if (selectedItem) {
                                this.mainColorSelect.setSelection([
                                    selectedItem
                                ]);
                            }
                        }


                        if (this.ghostColorSelect) {

                            const selectedColor =
                                  this.ghostColorSelect
                            .getSelection()[0]
                            ?.getUserData('color');

                            this.ghostColorSelect.removeAll();

                            const items = [
                                [t('colorRed'), '#ff0000'],
                                [t('colorBlue'), '#0088ff'],
                                [t('colorGreen'), '#00cc00'],
                                [t('colorYellow'), '#ffff00'],
                                [t('colorOrange'), '#ff8800'],
                                [t('colorPurple'), '#aa00ff'],
                                [t('colorCyan'), '#00ffff'],
                                [t('colorWhite'), '#ffffff']
                            ];

                            let selectedItem = null;

                            items.forEach(itemData => {

                                const item =
                                      new qx.ui.form.ListItem(
                                          itemData[0]
                                      );

                                item.setUserData(
                                    'color',
                                    itemData[1]
                                );

                                this.ghostColorSelect.add(item);

                                if (itemData[1] === selectedColor) {
                                    selectedItem = item;
                                }
                            });

                            if (selectedItem) {
                                this.ghostColorSelect.setSelection([
                                    selectedItem
                                ]);
                            }
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

                        if (this.mainBaseStatusLabel) {

                            if (totalBases > 0) {

                                this.mainBaseStatusLabel.set({

                                    value:
                                    [
                                        `<b>${t('players')}</b> : ${totalPlayersFetched} / ${totalPlayers}`,
                                        `<b>${t('bases')}</b> : ${totalBasesFetched} / ${totalBases}`
                ].join('<br>'),

                                    textColor:
                                    'green'
                                });

                            } else {

                                this.mainBaseStatusLabel.set({

                                    value:
                                    t('pleaseSelect'),

                                    textColor:
                                    'silver'
                                });
                            }
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

                    onButtonAddAlliance: function () {

                        const selectA =
                              this.allianceSelect
                        .getModelSelection()
                        .getItem(0);

                        if (
                            !selectA ||
                            !selectA.id ||
                            selectA.id <= 0
                        ) {
                            return;
                        }

                        if (
                            this.selectedAlliances.some(
                                a => a.id === selectA.id
                            )
                        ) {
                            return;
                        }

                        this.selectedAlliances.push({
                            id: selectA.id,
                            name: selectA.name
                        });

                        ClientLib.Net.CommunicationManager
                            .GetInstance()
                            .SendSimpleCommand(
                            'GetPublicAllianceInfo',
                            {
                                id: selectA.id
                            },
                            webfrontend.phe.cnc.Util.createEventDelegate(
                                ClientLib.Net.CommandResult,
                                this,
                                this.onGetPublicAllianceInfo
                            ),
                            null
                        );

                        this.selectedAllianceList.removeAll();

                        this.selectedAlliances.forEach(
                            alliance => {

                                const row =
                                      new qx.ui.container.Composite(
                                          new qx.ui.layout.HBox(5)
                                      );

                                const label =
                                      new qx.ui.basic.Label(
                                          '• ' + alliance.name
                                      ).set({
                                          textColor: 'white',
                                          width: 220
                                      });

                                const buttonRemove =
                                      new qx.ui.form.Button(
                                          'Löschen'
                                      );

                                buttonRemove.addListener(
                                    'execute',
                                    function () {

                                        this.selectedAlliances =
                                            this.selectedAlliances.filter(
                                            a => a.id !== alliance.id
                                        );

                                        this.selectedAllianceList.remove(
                                            row
                                        );

                                        this.removeGhostMarkers();
                                        this.removeMainMarkers();

                                        this.players = {};
                                        this.bases = {};
                                        this.autoShowMainAfterReload = true;

                                        this.selectedAlliance = null;

                                        this.selectedAlliances.forEach(
                                            a => {

                                                ClientLib.Net.CommunicationManager
                                                    .GetInstance()
                                                    .SendSimpleCommand(
                                                    'GetPublicAllianceInfo',
                                                    {
                                                        id: a.id
                                                    },
                                                    webfrontend.phe.cnc.Util.createEventDelegate(
                                                        ClientLib.Net.CommandResult,
                                                        this,
                                                        this.onGetPublicAllianceInfo
                                                    ),
                                                    null
                                                );
                                            }
                                        );

                                        this.refreshWindow();

                                        console.log(
                                            '%c[Ghostfinder MULTI]',
                                            'color:#ff8800;font-weight:bold',
                                            'Allianz entfernt:',
                                            alliance.name,
                                            '| Verbleibend:',
                                            this.selectedAlliances.length
                                        );

                                    },
                                    this
                                );

                                row.add(
                                    label,
                                    {
                                        flex: 1
                                    }
                                );

                                row.add(
                                    buttonRemove
                                );

                                this.selectedAllianceList.add(
                                    row
                                );
                            }
                        );

                        console.log(
                            '%c[Ghostfinder MULTI]',
                            'color:#00aaff;font-weight:bold',
                            'Allianz hinzugefügt:',
                            selectA.name,
                            '| ID:',
                            selectA.id,
                            '| Gesamt:',
                            this.selectedAlliances.length
                        );
                    },
                    onSelectAlliance: function () {

                        const selectA =
                              this.allianceSelect
                        .getModelSelection()
                        .getItem(0);



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

                        /* ==================================================
                        * DIAGNOSE: RUINEN / GHOST-STATUS
                        * ================================================== */

                        Object.values(this.bases).forEach(b => {

                            if (
                                b &&
                                (
                                    b.n === 'odin' ||
                                    b.n === 'Odin' ||
                                    b.n === 'HQ2' ||
                                    b.n === 'CB7'
                                )
                            ) {

                                console.log(
                                    '%c[Ghostfinder RUIN-DIAG]',
                                    'color:#ff00ff;font-weight:bold',
                                    {
                                        id: b.i,
                                        name: b.n,
                                        x: b.x,
                                        y: b.y,
                                        g: b.g,
                                        isFetched: b.isFetched,
                                        isMain: b.isMain,
                                        player: b.pn,
                                        fullData: b
                                    }
                                );
                            }
                        });

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
                    // MAIN-BASEN AUSWAHL
                    //////////////////////////////////////////////////////////////////

                    getSelectedMainBases: function () {

                        const selection =
                              this.mainBaseSelect
                        ? this.mainBaseSelect.getSelection()[0]
                        : null;

                        const mode =
                              selection
                        ? selection.getUserData('mainBaseFilter')
                        : 'main';

                        const count =
                              mode === 'mainTop2'
                        ? 2
                        : mode === 'mainTop3'
                        ? 3
                        : 1;

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

                                // Basen nach Punkten absteigend sortieren.
                                // Genau derselbe bewährte Weg wie bei der Ghost-Auswahl.
                                const ranked =
                                      player.c
                                .slice()
                                .sort(
                                    (a, b) =>
                                    Number(b.p || 0) -
                                    Number(a.p || 0)
                                );

                                ranked
                                    .slice(0, count)
                                    .forEach(
                                    baseInfo => {

                                        const base =
                                              this.bases[
                                                  `b-${baseInfo.i}`
                            ];

                                        if (
                                            base &&
                                            base.isFetched &&
                                            typeof base.x === 'number' &&
                                            typeof base.y === 'number' &&
                                            !seen.has(base.i)
                                        ) {

                                            seen.add(base.i);

                                            result.push(base);

                                            console.log(
                                                '%c[Ghostfinder MAIN]',
                                                'color:#00aaff;font-weight:bold',
                                                player.n ||
                                                base.pn ||
                                                '',
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

                            /* ==================================================
         * GHOST-MARKER ALS HTML-DIV
         * Gleiche Technik wie beim Folgeposten-Tracker
         * ================================================== */

                            const ghostColor =
                                  this.ghostColorSelect
                            ? this.ghostColorSelect
                            .getSelection()[0]
                            .getUserData('color')
                            : '#ff0000';

                            const visMain =
                                  ClientLib.Vis.VisMain.GetInstance();

                            const region =
                                  visMain.get_Region();

                            if (!visMain || !region) {

                                console.error(
                                    '%c[Ghostfinder] Weltkarten-Region nicht verfügbar.',
                                    'color:red;font-weight:bold'
                                );

                                return;
                            }

                            const canvas =
                                  document.querySelector('canvas');

                            if (!canvas || !canvas.parentElement) {

                                console.error(
                                    '%c[Ghostfinder] Karten-Canvas nicht gefunden.',
                                    'color:red;font-weight:bold'
                                );

                                return;
                            }

                            /* ==================================================
                             * AKTUELLE WELTKARTEN-KOORDINATEN ERMITTELN
                             * ================================================== */

                            let zielX = Number(base.x);
                            let zielY = Number(base.y);

                            try {

                                const world =
                                      this.ghostRendererWorld;


                                let worldObject = null;

                                /*
                                 * Zuerst versuchen wir die Basis direkt über
                                 * die Weltkarten-City-Sammlung zu finden.
                                 */

                                if (
                                    world &&
                                    typeof world.GetCities === 'function'
                                ) {

                                    const cities =
                                          world.GetCities();

                                    console.log(
                                        '%c[Ghostfinder COORD]',
                                        'color:#00ffff;font-weight:bold',
                                        'GetCities():',
                                        cities
                                    );

                                    if (
                                        cities &&
                                        typeof cities.GetCity === 'function'
                                    ) {

                                        worldObject =
                                            cities.GetCity(
                                            Number(base.i)
                                        );
                                    }
                                }

                                /*
                                 * Wenn ein echtes Weltkartenobjekt gefunden wurde,
                                 * verwenden wir dessen RawX / RawY.
                                 */

                                if (
                                    worldObject &&
                                    typeof worldObject.get_RawX === 'function' &&
                                    typeof worldObject.get_RawY === 'function'
                                ) {

                                    const rawX =
                                          Number(
                                              worldObject.get_RawX()
                                          );

                                    const rawY =
                                          Number(
                                              worldObject.get_RawY()
                                          );

                                    if (
                                        Number.isFinite(rawX) &&
                                        Number.isFinite(rawY)
                                    ) {

                                        zielX = rawX;
                                        zielY = rawY;

                                        console.log(
                                            '%c[Ghostfinder COORD] AKTIVE WELTKARTEN-KOORDINATEN',
                                            'color:#00ff00;font-weight:bold',
                                            base.n || '',
                                            '| ID:',
                                            base.i,
                                            '| API:',
                                            base.x + ':' + base.y,
                                            '| RAW:',
                                            zielX + ':' + zielY
                                        );
                                    }
                                }

                            } catch (e) {

                                console.error(
                                    '%c[Ghostfinder COORD] Fehler bei Weltkarten-Koordinaten:',
                                    'color:red;font-weight:bold',
                                    e
                                );
                            }

                            if (
                                !Number.isFinite(zielX) ||
                                !Number.isFinite(zielY)
                            ) {

                                console.error(
                                    '%c[Ghostfinder] Ungültige Ghost-Koordinaten:',
                                    'color:red;font-weight:bold',
                                    base
                                );

                                return;
                            }

                            /* ==================================================
                             * MARKER
                             * ================================================== */

                            const element =
                                  document.createElement('div');

                            element.className =
                                'harzi-ghostfinder-marker';

                            element.style.position =
                                'absolute';

                            element.style.transform =
                                'scale(1)';

                            element.style.pointerEvents =
                                'none';

                            element.style.zIndex =
                                '9999';

                            element.style.width =
                                '105px';

                            element.style.height =
                                '105px';

                            element.style.flexShrink =
                                '0';

                            element.style.borderRadius =
                                '50%';

                            element.style.boxSizing =
                                'border-box';

                            element.style.backgroundColor =
                                ghostColor;

                            element.style.opacity =
                                '0.75';

                            element.style.border =
                                '4px solid #ffffff';

                            element.style.color =
                                '#ffffff';

                            element.style.fontFamily =
                                'Arial, sans-serif';

                            element.style.fontWeight =
                                'bold';

                            element.style.textAlign =
                                'center';

                            element.style.display =
                                'flex';

                            element.style.flexDirection =
                                'column';

                            element.style.justifyContent =
                                'center';

                            element.style.alignItems =
                                'center';

                            element.style.textShadow =
                                '2px 2px 3px #000000';

                            element.style.boxShadow =
                                '0 0 6px rgba(0,0,0,0.9)';

                            /* ==================================================
                             * BESCHRIFTUNG
                             * ================================================== */

                            const basisName =
                                  String(
                                      base.n || 'Ghost'
                                  );

                            const ownerName =
                                  String(
                                      base.pn || 'Unbekannt'
                                  );

                            const nameElement =
                                  document.createElement('div');

                            nameElement.textContent =
                                basisName;

                            nameElement.style.fontSize =
                                '17px';

                            nameElement.style.lineHeight =
                                '20px';

                            nameElement.style.maxWidth =
                                '118px';

                            nameElement.style.overflow =
                                'hidden';

                            nameElement.style.textOverflow =
                                'ellipsis';

                            nameElement.style.whiteSpace =
                                'nowrap';

                            const ownerElement =
                                  document.createElement('div');

                            ownerElement.textContent =
                                ownerName;

                            ownerElement.style.fontSize =
                                '13px';

                            ownerElement.style.lineHeight =
                                '17px';

                            ownerElement.style.maxWidth =
                                '118px';

                            ownerElement.style.overflow =
                                'hidden';

                            ownerElement.style.textOverflow =
                                'ellipsis';

                            ownerElement.style.whiteSpace =
                                'nowrap';

                            element.appendChild(
                                nameElement
                            );

                            element.appendChild(
                                ownerElement
                            );

                            /* ==================================================
                             * POSITIONIERUNG
                             * Genau wie im Folgeposten-Tracker
                             * ================================================== */

                            const positionMarker =
                                  () => {

                                      const currentRegion =
                                            visMain.get_Region();

                                      if (!currentRegion) {
                                          return;
                                      }

                                      const gridWidth =
                                            currentRegion.get_GridWidth();

                                      const gridHeight =
                                            currentRegion.get_GridHeight();

                                      const top =
                                            visMain.ScreenPosFromWorldPosY(
                                                (zielY + 0.1) * gridHeight
                                            );

                                      const left =
                                            visMain.ScreenPosFromWorldPosX(
                                                (zielX + 0.1) * gridWidth
                                            );

                                      const bottom =
                                            currentRegion.get_ViewHeight();

                                      const right =
                                            currentRegion.get_ViewWidth();

                                      /* Außerhalb der Karte */

                                      if (
                                          top < -150 ||
                                          left < -150 ||
                                          top > bottom + 150 ||
                                          left > right + 150
                                      ) {

                                          element.style.display =
                                              'none';

                                          return;
                                      }

                                      element.style.display =
                                          'flex';

                                      /* ==================================================
                                       * ZOOMABHÄNGIGE POSITIONSKORREKTUR
                                       * Bei Zoom 1.0 = keine Korrektur
                                       * ================================================== */

                                      const zoomFactor =
                                            visMain.get_ZoomFactor
                                      ? visMain.get_ZoomFactor()
                                      : 1;

                                      /* Je weiter herausgezoomt wird,
                                       * desto stärker wird korrigiert.
                                       */
                                      const correction =
                                            (1 - zoomFactor) * 55;

                                      element.style.top =
                                          (top - correction) + 'px';

                                      element.style.left =
                                          (left - correction) + 'px';

                                      /* ==================================================
                                       * ZOOMABHÄNGIGE MARKERGRÖSSE
                                       * ================================================== */

                                      const zoomScale =
                                            Math.max(
                                                0.25,
                                                Math.min(
                                                    1,
                                                    visMain.get_ZoomFactor
                                                    ? visMain.get_ZoomFactor()
                                                    : 1
                                                )
                                            );

                                      element.style.transform =
                                          'scale(' + zoomScale + ')';

                                  };

                            /* Erste Position */

                            positionMarker();

                            /* ==================================================
                             * IN DIE KARTEN-EBENE EINHÄNGEN
                             * ================================================== */

                            canvas.parentElement.appendChild(
                                element
                            );

                            /* ==================================================
                             * MARKER SPEICHERN
                             * ================================================== */

                            this.ghostMarkers.push({

                                base:
                                base,

                                element:
                                element,

                                position:
                                positionMarker
                            });

                            /* ==================================================
                             * EIN gemeinsamer Positions-Timer
                             * Bei Bewegung / Zoom der Weltkarte
                             * ================================================== */

                            if (
                                !this.ghostDomPositionTimer
                            ) {

                                this.ghostDomPositionTimer =
                                    setInterval(
                                    () => {

                                        if (
                                            !this.ghostMarkers ||
                                            this.ghostMarkers.length === 0
                                        ) {
                                            return;
                                        }

                                        this.ghostMarkers.forEach(
                                            marker => {

                                                if (
                                                    marker &&
                                                    typeof marker.position ===
                                                    'function'
                                                ) {

                                                    marker.position();
                                                }
                                            }
                                        );

                                    },
                                    250
                                );
                            }

                            console.log(
                                '%c[Ghostfinder] HTML-Ghost-Marker gesetzt:',
                                'color:lime;font-weight:bold',
                                basisName,
                                '|',
                                ownerName,
                                '|',
                                zielX + ':' + zielY
                            );

                        } catch (e) {

                            console.error(
                                '%c[Ghostfinder] HTML-Ghost-Fehler:',
                                'color:red;font-weight:bold',
                                base,
                                e
                            );
                        }
                    },
                    //////////////////////////////////////////////////////////////////
                    // EINEN MAIN-MARKER SETZEN
                    //////////////////////////////////////////////////////////////////

                    addMainMarker: function (base) {

                        try {

                            /* ==================================================
                             * MAIN-MARKER ALS HTML-DIV
                             * Gleiche Technik wie beim funktionierenden Ghost
                             * ================================================== */

                            const mainColor =
                                  this.mainColorSelect
                            ? this.mainColorSelect
                            .getSelection()[0]
                            .getUserData('color')
                            : '#0088ff';

                            const visMain =
                                  ClientLib.Vis.VisMain.GetInstance();

                            if (!visMain) {

                                console.error(
                                    '%c[Ghostfinder MAIN] VisMain nicht verfügbar.',
                                    'color:red;font-weight:bold'
                                );

                                return;
                            }

                            const region =
                                  visMain.get_Region();

                            if (!region) {

                                console.error(
                                    '%c[Ghostfinder MAIN] Weltkarten-Region nicht verfügbar.',
                                    'color:red;font-weight:bold'
                                );

                                return;
                            }

                            const canvas =
                                  document.querySelector('canvas');

                            if (
                                !canvas ||
                                !canvas.parentElement
                            ) {

                                console.error(
                                    '%c[Ghostfinder MAIN] Karten-Canvas nicht gefunden.',
                                    'color:red;font-weight:bold'
                                );

                                return;
                            }

                            /* ==================================================
                             * KOORDINATEN
                             * ================================================== */

                            let zielX =
                                Number(base.x);

                            let zielY =
                                Number(base.y);

                            /* ==================================================
                             * AKTUELLE WELTKARTEN-KOORDINATEN
                             * Genau wie beim Ghost
                             * ================================================== */

                            try {

                                const world =
                                      this.ghostRendererWorld;

                                let worldObject =
                                    null;

                                if (
                                    world &&
                                    typeof world.GetCities ===
                                    'function'
                                ) {

                                    const cities =
                                          world.GetCities();

                                    if (
                                        cities &&
                                        typeof cities.GetCity ===
                                        'function'
                                    ) {

                                        worldObject =
                                            cities.GetCity(
                                            Number(base.i)
                                        );
                                    }
                                }

                                if (
                                    worldObject &&
                                    typeof worldObject.get_RawX ===
                                    'function' &&
                                    typeof worldObject.get_RawY ===
                                    'function'
                                ) {

                                    const rawX =
                                          Number(
                                              worldObject.get_RawX()
                                          );

                                    const rawY =
                                          Number(
                                              worldObject.get_RawY()
                                          );

                                    if (
                                        Number.isFinite(rawX) &&
                                        Number.isFinite(rawY)
                                    ) {

                                        zielX = rawX;
                                        zielY = rawY;
                                    }
                                }

                            } catch (e) {

                                console.warn(
                                    '%c[Ghostfinder MAIN COORD]',
                                    'color:orange;font-weight:bold',
                                    'Raw-Koordinaten konnten nicht gelesen werden.',
                                    e
                                );
                            }

                            /* ==================================================
                             * MARKER
                             * ================================================== */

                            const element =
                                  document.createElement('div');

                            element.className =
                                'harzi-ghostfinder-main-marker';

                            element.style.position =
                                'absolute';

                            element.style.transform =
                                'scale(1)';

                            element.style.pointerEvents =
                                'none';

                            element.style.zIndex =
                                '9998';

                            element.style.width =
                                '105px';

                            element.style.height =
                                '105px';

                            element.style.flexShrink =
                                '0';

                            element.style.borderRadius =
                                '50%';

                            element.style.boxSizing =
                                'border-box';

                            element.style.backgroundColor =
                                mainColor;

                            element.style.opacity =
                                '0.75';

                            element.style.border =
                                '4px solid #ffffff';

                            element.style.color =
                                '#ffffff';

                            element.style.fontFamily =
                                'Arial, sans-serif';

                            element.style.fontWeight =
                                'bold';

                            element.style.textAlign =
                                'center';

                            element.style.display =
                                'flex';

                            element.style.flexDirection =
                                'column';

                            element.style.justifyContent =
                                'center';

                            element.style.alignItems =
                                'center';

                            element.style.textShadow =
                                '2px 2px 3px #000000';

                            element.style.boxShadow =
                                '0 0 6px rgba(0,0,0,0.9)';

                            /* ==================================================
                             * BESCHRIFTUNG
                             * ================================================== */

                            const basisName =
                                  String(
                                      base.n || 'Main'
                                  );

                            const ownerName =
                                  String(
                                      base.pn || 'Unbekannt'
                                  );

                            const nameElement =
                                  document.createElement('div');

                            nameElement.textContent =
                                basisName;

                            nameElement.style.fontSize =
                                '17px';

                            nameElement.style.lineHeight =
                                '20px';

                            nameElement.style.maxWidth =
                                '118px';

                            nameElement.style.overflow =
                                'hidden';

                            nameElement.style.textOverflow =
                                'ellipsis';

                            nameElement.style.whiteSpace =
                                'nowrap';

                            const ownerElement =
                                  document.createElement('div');

                            ownerElement.textContent =
                                ownerName;

                            ownerElement.style.fontSize =
                                '13px';

                            ownerElement.style.lineHeight =
                                '17px';

                            ownerElement.style.maxWidth =
                                '118px';

                            ownerElement.style.overflow =
                                'hidden';

                            ownerElement.style.textOverflow =
                                'ellipsis';

                            ownerElement.style.whiteSpace =
                                'nowrap';

                            element.appendChild(
                                nameElement
                            );

                            element.appendChild(
                                ownerElement
                            );

                            /* ==================================================
                             * POSITIONIERUNG
                             * ================================================== */

                            const positionMarker =
                                  () => {

                                      const currentRegion =
                                            visMain.get_Region();

                                      if (!currentRegion) {
                                          return;
                                      }

                                      const gridWidth =
                                            currentRegion.get_GridWidth();

                                      const gridHeight =
                                            currentRegion.get_GridHeight();

                                      const top =
                                            visMain.ScreenPosFromWorldPosY(
                                                (zielY + 0.1) *
                                                gridHeight
                                            );

                                      const left =
                                            visMain.ScreenPosFromWorldPosX(
                                                (zielX + 0.1) *
                                                gridWidth
                                            );

                                      const bottom =
                                            currentRegion.get_ViewHeight();

                                      const right =
                                            currentRegion.get_ViewWidth();

                                      if (
                                          top < -150 ||
                                          left < -150 ||
                                          top > bottom + 150 ||
                                          left > right + 150
                                      ) {

                                          element.style.display =
                                              'none';

                                          return;
                                      }

                                      element.style.display =
                                          'flex';

                                      /* ==================================================
                                       * ZOOMABHÄNGIGE POSITIONSKORREKTUR
                                       * Gleicher Wert wie bei Ghosts
                                       * ================================================== */

                                      const zoomFactor =
                                            visMain.get_ZoomFactor
                                      ? visMain.get_ZoomFactor()
                                      : 1;

                                      const correction =
                                            (1 - zoomFactor) * 55;

                                      element.style.top =
                                          (top - correction) +
                                          'px';

                                      element.style.left =
                                          (left - correction) +
                                          'px';

                                      /* ==================================================
                                       * ZOOMABHÄNGIGE MARKERGRÖSSE
                                       * Gleicher Wert wie bei Ghosts
                                       * ================================================== */

                                      const zoomScale =
                                            Math.max(
                                                0.25,
                                                Math.min(
                                                    1,
                                                    zoomFactor
                                                )
                                            );

                                      element.style.transform =
                                          'scale(' +
                                          zoomScale +
                                          ')';
                                  };

                            /* Erste Position */

                            positionMarker();

                            /* ==================================================
                             * IN DIE KARTEN-EBENE EINHÄNGEN
                             * ================================================== */

                            canvas.parentElement.appendChild(
                                element
                            );

                            /* ==================================================
                             * MAIN-MARKER SPEICHERN
                             * ================================================== */

                            this.mainMarkers.push({

                                base:
                                base,

                                element:
                                element,

                                position:
                                positionMarker
                            });

                            /* ==================================================
                             * GEMEINSAMER MAIN-POSITIONS-TIMER
                             * ================================================== */

                            if (
                                !this.mainDomPositionTimer
                            ) {

                                this.mainDomPositionTimer =
                                    setInterval(
                                    () => {

                                        if (
                                            !this.mainMarkers ||
                                            this.mainMarkers.length === 0
                                        ) {
                                            return;
                                        }

                                        this.mainMarkers.forEach(
                                            marker => {

                                                if (
                                                    marker &&
                                                    typeof marker.position ===
                                                    'function'
                                                ) {

                                                    marker.position();
                                                }
                                            }
                                        );

                                    },
                                    250
                                );
                            }

                            console.log(
                                '%c[Ghostfinder MAIN] HTML-Marker gesetzt:',
                                'color:#00aaff;font-weight:bold',
                                basisName,
                                '|',
                                ownerName,
                                '|',
                                zielX + ':' + zielY
                            );

                        } catch (e) {

                            console.error(
                                '%c[Ghostfinder] Main-Marker-Fehler:',
                                'color:red;font-weight:bold',
                                base,
                                e
                            );
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // MAIN-BASEN ANZEIGEN
                    //////////////////////////////////////////////////////////////////

                    onButtonShowMain: function () {

                        const bases =
                              this.getSelectedMainBases();

                        console.log(
                            '%c[Ghostfinder MAIN] Auswahl:',
                            'color:#0088ff;font-weight:bold',
                            '| Anzahl:',
                            bases.length
                        );

                        bases.forEach(
                            base =>
                            this.addMainMarker(
                                base
                            )
                        );

                        this.buttonClearMain.setEnabled(
                            this.mainMarkers.length > 0
                        );

                        console.log(
                            '%c[Ghostfinder MAIN] Main-Marker gesetzt:',
                            'color:#0088ff;font-weight:bold',
                            this.mainMarkers.length
                        );

                        console.log(
                            '%c[Ghostfinder MAIN] mainMarkers Inhalt:',
                            'color:#00ffff;font-weight:bold',
                            this.mainMarkers
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // MAIN-BASEN MARKER ENTFERNEN
                    //////////////////////////////////////////////////////////////////

                    removeMainMarkers: function () {

                        console.log(
                            '%c[Ghostfinder MAIN CLEAR] ===== START =====',
                            'color:#00aaff;font-weight:bold'
                        );

                        const markers =
                              Array.isArray(this.mainMarkers)
                        ? this.mainMarkers.slice()
                        : [];

                        let removed = 0;
                        let notFound = 0;

                        console.log(
                            '%c[Ghostfinder MAIN CLEAR] Marker:',
                            'color:#00aaff;font-weight:bold',
                            markers.length
                        );

                        /* ==================================================
                         * HTML-MARKER ENTFERNEN
                         * ================================================== */

                        markers.forEach(
                            (marker, markerIndex) => {

                                if (
                                    !marker ||
                                    !marker.element
                                ) {

                                    notFound++;

                                    console.warn(
                                        '%c[Ghostfinder MAIN CLEAR] Element nicht gefunden:',
                                        'color:orange;font-weight:bold',
                                        markerIndex,
                                        marker && marker.base
                                        ? marker.base.n
                                        : ''
                                    );

                                    return;
                                }

                                try {

                                    if (
                                        marker.element.parentElement
                                    ) {

                                        marker.element.parentElement
                                            .removeChild(
                                            marker.element
                                        );

                                        removed++;

                                        console.log(
                                            '%c[Ghostfinder MAIN CLEAR] gelöscht:',
                                            'color:lime;font-weight:bold',
                                            markerIndex,
                                            marker.base
                                            ? marker.base.n
                                            : ''
                                        );

                                    } else {

                                        notFound++;

                                        console.warn(
                                            '%c[Ghostfinder MAIN CLEAR] Element bereits entfernt:',
                                            'color:orange;font-weight:bold',
                                            markerIndex,
                                            marker.base
                                            ? marker.base.n
                                            : ''
                                        );
                                    }

                                } catch (e) {

                                    notFound++;

                                    console.error(
                                        '%c[Ghostfinder MAIN CLEAR] Fehler beim Löschen:',
                                        'color:red;font-weight:bold',
                                        markerIndex,
                                        e
                                    );
                                }
                            }
                        );

                        /* ==================================================
                         * POSITIONIERUNGS-TIMER STOPPEN
                         * ================================================== */

                        if (
                            this.mainDomPositionTimer
                        ) {

                            clearInterval(
                                this.mainDomPositionTimer
                            );

                            this.mainDomPositionTimer =
                                null;
                        }

                        /* ==================================================
                         * MARKER-LISTE LEEREN
                         * ================================================== */

                        this.mainMarkers = [];

                        this.buttonClearMain.setEnabled(
                            false
                        );

                        console.log(
                            '%c[Ghostfinder MAIN CLEAR] Ergebnis:',
                            'color:#00aaff;font-weight:bold',
                            'gelöscht =',
                            removed,
                            '| nicht gefunden =',
                            notFound
                        );

                        console.log(
                            '%c[Ghostfinder MAIN CLEAR] ===== ENDE =====',
                            'color:#00aaff;font-weight:bold'
                        );
                    },

                    //////////////////////////////////////////////////////////////////
                    // GHOSTS ENTFERNEN
                    //////////////////////////////////////////////////////////////////

                    removeGhostMarkers: function () {

                        console.log(
                            '%c[Ghostfinder CLEAR] ===== START =====',
                            'color:yellow;font-weight:bold'
                        );

                        const markers =
                              Array.isArray(this.ghostMarkers)
                        ? this.ghostMarkers.slice()
                        : [];

                        let removed = 0;
                        let errors = 0;

                        console.log(
                            '%c[Ghostfinder CLEAR] Marker:',
                            'color:#00ffff;font-weight:bold',
                            markers.length
                        );

                        /* ==================================================
                         * ALLE VON UNS ERZEUGTEN HTML-MARKER ENTFERNEN
                         * ================================================== */

                        markers.forEach(
                            (marker, index) => {

                                if (
                                    !marker ||
                                    !marker.element
                                ) {

                                    console.warn(
                                        '%c[Ghostfinder CLEAR] Ungültiger Marker:',
                                        'color:orange;font-weight:bold',
                                        index
                                    );

                                    return;
                                }

                                try {

                                    marker.element.remove();

                                    removed++;

                                    console.log(
                                        '%c[Ghostfinder CLEAR] gelöscht:',
                                        'color:lime;font-weight:bold',
                                        index,
                                        marker.base
                                        ? marker.base.n
                                        : ''
                                    );

                                } catch (e) {

                                    errors++;

                                    console.error(
                                        '%c[Ghostfinder CLEAR] Fehler beim Löschen:',
                                        'color:red;font-weight:bold',
                                        index,
                                        e
                                    );
                                }
                            }
                        );

                        /* ==================================================
                         * SICHERHEIT:
                         * eventuell noch vorhandene Ghost-DIVs entfernen
                         * ================================================== */

                        try {

                            document
                                .querySelectorAll(
                                '.harzi-ghostfinder-marker'
                            )
                                .forEach(
                                element => element.remove()
                            );

                        } catch (e) {

                            console.warn(
                                '[Ghostfinder CLEAR] DOM-Bereinigung fehlgeschlagen:',
                                e
                            );
                        }

                        /* ==================================================
                         * MARKER-LISTE LEEREN
                         * ================================================== */

                        this.ghostMarkers = [];

                        console.log(
                            '%c[Ghostfinder CLEAR] Ergebnis:',
                            'color:yellow;font-weight:bold',
                            'gelöscht =',
                            removed,
                            '| Fehler =',
                            errors
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
                            !this.players[`pid-${data.i}`]
                        ) {
                            return;
                        }

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

                            const totalPlayers =
                                  Object.keys(this.players).length;

                            const totalPlayersFetched =
                                  Object.values(this.players)
                            .filter(m => m.isFetched)
                            .length;

                            const totalBases =
                                  Object.keys(this.bases).length;

                            const totalBasesFetched =
                                  Object.values(this.bases)
                            .filter(b => b.isFetched)
                            .length;

                            if (
                                this.autoShowMainAfterReload &&
                                totalPlayers > 0 &&
                                totalPlayersFetched === totalPlayers &&
                                totalBases > 0 &&
                                totalBasesFetched === totalBases
                            ) {
                                this.autoShowMainAfterReload = false;

                                console.log(
                                    '%c[Ghostfinder MAIN AUTO]',
                                    'color:#00aaff;font-weight:bold',
                                    'Neuaufbau vollständig – Main wird angezeigt.'
                                );

                                this.onButtonShowMain();
                            }
                        }
                    },

                    //////////////////////////////////////////////////////////////////
                    // ALLIANZ INFORMATION
                    //////////////////////////////////////////////////////////////////

                    resetAlliance:
                    function () {

                        this.removeGhostMarkers();
                        this.removeMainMarkers();

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

                        this.buttonShowMain
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

                        this.mainColor =
                            storage.mainColor ||
                            '#0088ff';

                        this.ghostColor =
                            storage.ghostColor ||
                            '#ff0000';
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

                        storage.mainColor =
                            this.mainColor ||
                            '#0088ff';

                        storage.ghostColor =
                            this.ghostColor ||
                            '#ff0000';

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
