// ==UserScript==
// @name         CnC-TA OFF-Finder - HE
// @namespace    https://github.com/Harzi66/CnC-TA-Off-Finder-Harzi-Edition
// @version      0.1.28
// @description  Find the strongest bases of players in selected alliances.
// @author       Harzi
// @match        https://*.alliances.commandandconquer.com/*/*
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/Harzi66/CnC-TA-Off-Finder-Harzi-Edition/main/CnC-TA-OFF-Finder%20-%20HE.user.js
// @updateURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Off-Finder-Harzi-Edition/main/CnC-TA-OFF-Finder%20-%20HE.user.js
// ==/UserScript==

/* global qx, ClientLib, webfrontend */

'use strict';

(function () {

    const scriptName = 'CnC-TA OFF-Finder - HE';
    const storageKey = 'cncta-mainbase-finder-he';
    const languageStorageKey = 'CnCTA_MainbaseFinder_HE_Language';

    const translations = {
        de: {
            menu: 'OFF-Finder - HE', title: 'CnC-TA OFF-Finder - HE', subtitle: 'Stärkste Basen der Allianzmitglieder', language: 'Sprache:',
            rankingSection: 'ALLIANZ AUS RANKING', rankingSubtitle: 'Eine Allianz aus dem gewählten Rankingbereich auswählen.', rankingRange: 'Rankingbereich:', custom: 'Benutzerdefiniert', from: 'Von:', to: 'Bis:', apply: 'Anwenden', alliance: 'Allianz:',
            directSection: 'ALLIANZ DIREKT SUCHEN', directSubtitle: 'Optional – Name oder Kürzel eingeben. Eine oder mehrere Allianzen können gesucht werden.', searchPlaceholder: 'Allianzname oder Kürzel', search: 'Suchen', noneSelected: 'Keine Allianz ausgewählt', selected: 'Ausgewählt:',
            baseSection: 'BASENAUSWAHL', baseSubtitle: 'Wie viele der stärksten Basen jedes Spielers sollen berücksichtigt werden?', top1: 'Nur stärkste Basis (Top 1)', top2: 'Stärkste + zweitstärkste (Top 2)', topN: 'Stärkste {n} Basen (Top {n})', find: 'Basen ermitteln', clear: 'Ergebnis löschen', ready: 'Bereit.',
            loadingRanking: 'Lade Allianz-Ranking ...', noRanking: 'Keine Rankingdaten erhalten.', rankingError: 'Fehler beim Laden des Rankings.', noAllianceRanking: 'Keine Allianz-Rankingdaten erhalten.', alliancesLoaded: '{n} Allianzen geladen.', rankingShown: 'Ranking {from} - {to} angezeigt.',
            enterSearch: 'Suche {n}: Bitte Name oder Kürzel eingeben.', searching: 'Suche {n}: {search} ...', found: 'Suche {n}: {name} gefunden.', notFound: 'Suche {n}: Allianz nicht gefunden.', allianceReady: 'Allianz ausgewählt. Bereit zum Ermitteln.', loadingMembers: 'Lade Allianzmitglieder ...', noMembers: 'Keine Allianzmitglieder gefunden.', loadingPlayers: 'Lade Spielerdaten ... 0 / {n}', playerData: 'Spielerdaten: {done} / {total}', basesFound: '<b>{bases}</b> Basen von <b>{players}</b> Spielern gefunden.', noBases: 'Keine Basen gefunden.', points: 'Punkte', completed: 'Auswertung abgeschlossen.', resultCleared: 'Ergebnis gelöscht.', warning: '<font color="#ff3030"><b>Achtung!</b></font> Nur stärkste Basis (Top 1) ist garantiert eine Off. Je mehr Basen gesucht werden, desto höher die Fehlerquote.'
        },
        en: {
            menu: 'OFF-Finder - HE', title: 'CnC-TA OFF-Finder - HE', subtitle: 'Strongest bases of alliance members', language: 'Language:',
            rankingSection: 'ALLIANCE FROM RANKING', rankingSubtitle: 'Select an alliance from the chosen ranking range.', rankingRange: 'Ranking range:', custom: 'Custom', from: 'From:', to: 'To:', apply: 'Apply', alliance: 'Alliance:',
            directSection: 'SEARCH ALLIANCE DIRECTLY', directSubtitle: 'Optional – enter name or abbreviation. One or more alliances can be searched.', searchPlaceholder: 'Alliance name or abbreviation', search: 'Search', noneSelected: 'No alliance selected', selected: 'Selected:',
            baseSection: 'BASE SELECTION', baseSubtitle: 'How many of each player’s strongest bases should be included?', top1: 'Strongest base only (Top 1)', top2: 'Strongest + second strongest (Top 2)', topN: 'Strongest {n} bases (Top {n})', find: 'Find bases', clear: 'Clear results', ready: 'Ready.',
            loadingRanking: 'Loading alliance ranking ...', noRanking: 'No ranking data received.', rankingError: 'Error loading ranking.', noAllianceRanking: 'No alliance ranking data received.', alliancesLoaded: '{n} alliances loaded.', rankingShown: 'Ranking {from} - {to} displayed.',
            enterSearch: 'Search {n}: Please enter name or abbreviation.', searching: 'Search {n}: {search} ...', found: 'Search {n}: {name} found.', notFound: 'Search {n}: Alliance not found.', allianceReady: 'Alliance selected. Ready to find bases.', loadingMembers: 'Loading alliance members ...', noMembers: 'No alliance members found.', loadingPlayers: 'Loading player data ... 0 / {n}', playerData: 'Player data: {done} / {total}', basesFound: '<b>{bases}</b> bases from <b>{players}</b> players found.', noBases: 'No bases found.', points: 'Points', completed: 'Evaluation completed.', resultCleared: 'Results cleared.', warning: '<font color="#ff3030"><b>Warning!</b></font> Only the strongest base (Top 1) is guaranteed to be an Off. The more bases are searched, the higher the error rate.'
        },
        fr: {
            menu: 'OFF-Finder - HE', title: 'CnC-TA OFF-Finder - HE', subtitle: 'Bases les plus fortes des membres de l’alliance', language: 'Langue :',
            rankingSection: 'ALLIANCE DU CLASSEMENT', rankingSubtitle: 'Sélectionner une alliance dans la plage de classement choisie.', rankingRange: 'Plage de classement :', custom: 'Personnalisé', from: 'De :', to: 'À :', apply: 'Appliquer', alliance: 'Alliance :',
            directSection: 'RECHERCHER UNE ALLIANCE', directSubtitle: 'Optionnel – saisir le nom ou l’abréviation. Une ou plusieurs alliances peuvent être recherchées.', searchPlaceholder: 'Nom ou abréviation de l’alliance', search: 'Rechercher', noneSelected: 'Aucune alliance sélectionnée', selected: 'Sélectionnée :',
            baseSection: 'SÉLECTION DES BASES', baseSubtitle: 'Combien des bases les plus fortes de chaque joueur doivent être prises en compte ?', top1: 'Base la plus forte uniquement (Top 1)', top2: 'Plus forte + deuxième (Top 2)', topN: '{n} bases les plus fortes (Top {n})', find: 'Trouver les bases', clear: 'Effacer le résultat', ready: 'Prêt.',
            loadingRanking: 'Chargement du classement des alliances ...', noRanking: 'Aucune donnée de classement reçue.', rankingError: 'Erreur lors du chargement du classement.', noAllianceRanking: 'Aucune donnée de classement d’alliance reçue.', alliancesLoaded: '{n} alliances chargées.', rankingShown: 'Classement {from} - {to} affiché.',
            enterSearch: 'Recherche {n} : veuillez saisir un nom ou une abréviation.', searching: 'Recherche {n} : {search} ...', found: 'Recherche {n} : {name} trouvée.', notFound: 'Recherche {n} : alliance introuvable.', allianceReady: 'Alliance sélectionnée. Prêt à rechercher.', loadingMembers: 'Chargement des membres de l’alliance ...', noMembers: 'Aucun membre trouvé.', loadingPlayers: 'Chargement des joueurs ... 0 / {n}', playerData: 'Données joueurs : {done} / {total}', basesFound: '<b>{bases}</b> bases de <b>{players}</b> joueurs trouvées.', noBases: 'Aucune base trouvée.', points: 'Points', completed: 'Évaluation terminée.', resultCleared: 'Résultat effacé.', warning: '<font color="#ff3030"><b>Attention !</b></font> Seule la base la plus forte (Top 1) est garantie comme Off. Plus de bases sont recherchées, plus le taux d’erreur est élevé.'
        },
        es: {
            menu: 'OFF-Finder - HE', title: 'CnC-TA OFF-Finder - HE', subtitle: 'Bases más fuertes de los miembros de la alianza', language: 'Idioma:',
            rankingSection: 'ALIANZA DEL RANKING', rankingSubtitle: 'Selecciona una alianza del rango de clasificación elegido.', rankingRange: 'Rango de clasificación:', custom: 'Personalizado', from: 'Desde:', to: 'Hasta:', apply: 'Aplicar', alliance: 'Alianza:',
            directSection: 'BUSCAR ALIANZA DIRECTAMENTE', directSubtitle: 'Opcional – introduce nombre o abreviatura. Se pueden buscar una o varias alianzas.', searchPlaceholder: 'Nombre o abreviatura de la alianza', search: 'Buscar', noneSelected: 'Ninguna alianza seleccionada', selected: 'Seleccionada:',
            baseSection: 'SELECCIÓN DE BASES', baseSubtitle: '¿Cuántas de las bases más fuertes de cada jugador deben incluirse?', top1: 'Solo la base más fuerte (Top 1)', top2: 'Más fuerte + segunda (Top 2)', topN: '{n} bases más fuertes (Top {n})', find: 'Buscar bases', clear: 'Borrar resultado', ready: 'Listo.',
            loadingRanking: 'Cargando ranking de alianzas ...', noRanking: 'No se recibieron datos del ranking.', rankingError: 'Error al cargar el ranking.', noAllianceRanking: 'No se recibieron datos del ranking de alianzas.', alliancesLoaded: '{n} alianzas cargadas.', rankingShown: 'Ranking {from} - {to} mostrado.',
            enterSearch: 'Búsqueda {n}: introduce nombre o abreviatura.', searching: 'Búsqueda {n}: {search} ...', found: 'Búsqueda {n}: {name} encontrada.', notFound: 'Búsqueda {n}: alianza no encontrada.', allianceReady: 'Alianza seleccionada. Lista para buscar.', loadingMembers: 'Cargando miembros de la alianza ...', noMembers: 'No se encontraron miembros.', loadingPlayers: 'Cargando datos de jugadores ... 0 / {n}', playerData: 'Datos de jugadores: {done} / {total}', basesFound: '<b>{bases}</b> bases de <b>{players}</b> jugadores encontradas.', noBases: 'No se encontraron bases.', points: 'Puntos', completed: 'Evaluación completada.', resultCleared: 'Resultado borrado.', warning: '<font color="#ff3030"><b>¡Atención!</b></font> Solo la base más fuerte (Top 1) está garantizada como Off. Cuantas más bases se busquen, mayor será el margen de error.'
        }
    };

    const getLanguage = () => {
        const lang = localStorage.getItem(languageStorageKey) || 'de';
        return translations[lang] ? lang : 'de';
    };

    const t = (key, values = {}) => {
        let text = (translations[getLanguage()] && translations[getLanguage()][key]) || translations.de[key] || key;
        Object.keys(values).forEach(name => {
            text = text.split(`{${name}}`).join(String(values[name]));
        });
        return text;
    };

    // ================================================================
    // MAP HIGHLIGHTING – nach dem funktionierenden Maelstrom/VCity-Hook
    // ================================================================

    function mapGetFunctionBody(functionObject) {
        const string = functionObject.toString();
        const singleLine = string.replace(/(\n\r|\n|\r|\t)/gm, ' ');
        const spacesShrinked = singleLine.replace(/\s+/gm, ' ');
        const headerRemoved = spacesShrinked.replace(/function.*?\{/, '');
        return headerRemoved.substring(0, headerRemoved.length - 1);
    }

    function mapFindFunction(functionObject, regEx, message, parts) {
        const functionBody = functionObject.toString();
        const shrinkedText = functionBody.replace(/\s/gim, '');
        const matches = shrinkedText.match(regEx);

        for (let i = 1; i < parts + 1; i++) {
            if (matches !== null && matches[i] && matches[i].length === 6) {
                console.log(
                    `%c[OFF-Finder] %c${message} ${i} = ${matches[i]}`,
                    'color:#00dd66;font-weight:bold',
                    'color:#ffffff'
                );
            } else {
                console.error(
                    `%c[OFF-Finder] %c${message} ${i} nicht gefunden.`,
                    'color:#ff4444;font-weight:bold',
                    'color:#ffffff'
                );
                console.warn('[OFF-Finder] Funktion:', shrinkedText);
            }
        }
        return matches;
    }

    function installMapHighlighting() {
        try {
            if (
                typeof ClientLib === 'undefined' ||
                !ClientLib.Vis ||
                !ClientLib.Vis.Region ||
                !ClientLib.Vis.Region.RegionCity
            ) {
                return false;
            }

            const regionCityPrototype =
                ClientLib.Vis.Region.RegionCity.prototype;

            if (
                !regionCityPrototype ||
                typeof regionCityPrototype.UpdateColor !== 'function'
            ) {
                return false;
            }

            // Aktueller Client:
            // function(){this.CVQTIA(this.GLWLQB,this.IBGXYF)}
            // Daher bewusst OHNE "createHelper;".
            const updateColorParts = mapFindFunction(
                regionCityPrototype.UpdateColor,
                /this\.([A-Z]{6})\(/,
                'ClientLib.Vis.Region.RegionCity UpdateColor',
                1
            );

            if (!updateColorParts || !updateColorParts[1]) {
                return false;
            }

            const setCanvasValueName = updateColorParts[1];
            const currentFunction = regionCityPrototype[setCanvasValueName];

            if (typeof currentFunction !== 'function') {
                console.error(
                    '[OFF-Finder] Interne Kartenfunktion nicht gefunden:',
                    setCanvasValueName
                );
                return false;
            }

            if (currentFunction.__CnCTA_MainbaseFinder_HE_Fixed === true) {
                return true;
            }

            // Gleicher CityTextcolor-Hook wie Maelstrom – nur mit Base-ID.
            regionCityPrototype.CityTextcolor = function (defaultColor) {
                try {
                    const finder =
                        window.CnCTA_MainbaseFinder_HE_Instance;

                    if (!finder || !finder.highlightedBaseIds) {
                        return defaultColor;
                    }

                    if (typeof this.get_Id !== 'function') {
                        return defaultColor;
                    }

                    const baseId = String(this.get_Id());

                    if (finder.highlightedBaseIds[baseId]) {
                        return '#ffff00';
                    }
                } catch (ex) {
                    console.error(
                        '[OFF-Finder] CityTextcolor Fehler:',
                        ex
                    );
                }

                return defaultColor;
            };

            const setCanvasValueFunctionBody =
                mapGetFunctionBody(currentFunction);

            console.log(
                '%c[OFF-Finder] %cCVQTIA-Funktionskörper:',
                'color:#00bfff;font-weight:bold',
                'color:#ffffff',
                setCanvasValueFunctionBody
            );

            // Exakter Einfügepunkt aus dem funktionierenden Maelstrom/VCity-Script.
            const marker = /\{g="#000000";\}/im;

            if (!marker.test(setCanvasValueFunctionBody)) {
                console.error(
                    '%c[OFF-Finder] %cEinfügepunkt {g="#000000";} nicht gefunden.',
                    'color:#ff4444;font-weight:bold',
                    'color:#ffffff'
                );
                return false;
            }

            const fixedBody = setCanvasValueFunctionBody.replace(
                marker,
                '{g="#000000";}else{g=this.CityTextcolor(g);}'
            );

            const fixedFunction =
                new Function('a', 'b', fixedBody);

            fixedFunction.__CnCTA_MainbaseFinder_HE_Fixed = true;

            // Exakt der funktionierende Mechanismus.
            regionCityPrototype[setCanvasValueName] = fixedFunction;
            regionCityPrototype.SetCanvasValue_FIXED = fixedFunction;

            console.log(
                `%c[OFF-Finder] %cKarten-Hook installiert: ${setCanvasValueName}`,
                'color:#00dd66;font-weight:bold',
                'color:#ffffff'
            );

            return true;
        } catch (ex) {
            console.error('[OFF-Finder] Karten-Hook Fehler:', ex);
            return false;
        }
    }

    // Bereits sichtbare Städte sofort neu zeichnen.
    // Wichtig beim Löschen: Die gelbe Farbe ist bereits auf die Karte
    // gezeichnet und verschwindet nicht allein durch das Leeren der Liste.
    function refreshMapCityColors() {
        try {
            if (
                typeof ClientLib === 'undefined' ||
                !ClientLib.Vis ||
                !ClientLib.Vis.Region ||
                !ClientLib.Vis.Region.RegionCity ||
                !qx ||
                !qx.core ||
                !qx.core.ObjectRegistry
            ) {
                return;
            }

            const registry = qx.core.ObjectRegistry.getRegistry();
            let refreshed = 0;

            Object.keys(registry).forEach((key) => {
                const obj = registry[key];

                if (obj instanceof ClientLib.Vis.Region.RegionCity &&
                    typeof obj.UpdateColor === 'function') {
                    obj.UpdateColor();
                    refreshed++;
                }
            });

            console.log(
                `%c[OFF-Finder] %cKartenbeschriftungen neu gezeichnet: ${refreshed}`,
                'color:#ffcc00;font-weight:bold',
                'color:#ffffff'
            );
        } catch (ex) {
            console.error(
                '[OFF-Finder] Fehler beim Neuzeichnen der Kartenbeschriftungen:',
                ex
            );
        }
    }

    function startMapHighlighting() {
        if (window.CnCTA_MainbaseFinder_HE_MapTimer) {
            return;
        }

        window.CnCTA_MainbaseFinder_HE_MapTimer = setInterval(
            installMapHighlighting,
            2000
        );

        installMapHighlighting();
    }

    const MainbaseFinder = () => {

        const Main = qx.Class.define('CnCTA_MainbaseFinder_HE', {

            type: 'singleton',
            extend: qx.core.Object,

            members: {

                // ============================================================
                // DATA
                // ============================================================

                favorites: [],
                alliances: [],
                rankingData: [],

                selectedAlliance: null,

                players: {},
                bases: {},
                resultBases: [],

                searchResults: [
                    null,
                    null,
                    null
                ],

                rankingCount: 0,

                // ============================================================
                // UI
                // ============================================================

                mainWindow: null,
                languageSelect: null,

                rankingRangeSelect: null,
                rankingRangePreference: 'top10',
                customFromPreference: '1',
                customToPreference: '50',
                allianceSelect: null,

                customRangeContainer: null,
                customFromField: null,
                customToField: null,
                customApplyButton: null,

                searchFields: [],
                searchButtons: [],

                allianceLabel: null,

                baseCountSelect: null,
                baseWarningLabel: null,
                resultsBuilt: false,
                highlightedBaseIds: {},

                statusLabel: null,
                resultLabel: null,

                resultScroll: null,
                resultContainer: null,

                buttonFind: null,
                buttonClear: null,

                initialized: false,

                // ============================================================
                // INIT
                // ============================================================

                initialize: function () {

                    if (this.initialized) {
                        return;
                    }

                    this.initialized = true;

                    window.CnCTA_MainbaseFinder_HE_Instance = this;
                    startMapHighlighting();

                    const menuButton =
                        new qx.ui.menu.Button(
                            t('menu')
                        );

                    menuButton.addListener(
                        'execute',
                        this.onOpenMainWindow,
                        this
                    );

                    qx.core.Init
                        .getApplication()
                        .getMenuBar()
                        .getScriptsButton()
                        .getMenu()
                        .add(menuButton);

                    console.log(
                        `%c${scriptName} initialized`,
                        'background:#1f2937;color:#7dd3fc;font-weight:bold;padding:4px;'
                    );
                },

                // ============================================================
                // OPEN
                // ============================================================

                onOpenMainWindow: function () {

                    console.log(
                        '[OFF-Finder] Fenster wird geöffnet'
                    );

                    if (!this.mainWindow) {

                        this.loadStorage();
                        this.createMainWindow();
                        this.loadRanking();
                    }

                    this.mainWindow.open();
                    this.mainWindow.center();
                },

                // ============================================================
                // HELPER - SECTION
                // ============================================================

                createSection: function (
                    title,
                    subtitle
                ) {

                    const section =
                        new qx.ui.container.Composite(
                            new qx.ui.layout.VBox(4)
                        ).set({

                            paddingTop: 7,
                            paddingBottom: 7,
                            paddingLeft: 8,
                            paddingRight: 8,

                            decorator:
                                new qx.ui.decoration.Decorator().set({

                                    color: '#555555',

                                    style: 'solid',

                                    width: 1,

                                    radius: 4
                                }),

                            backgroundColor:
                                'rgba(0,0,0,0.30)'
                        });

                    const titleLabel =
                        new qx.ui.basic.Label().set({

                            value:
                                `<b>${title}</b>`,

                            rich: true,

                            textColor:
                                '#ffffff'
                        });

                    section.add(
                        titleLabel
                    );

                    if (subtitle) {

                        section.add(
                            new qx.ui.basic.Label().set({

                                value:
                                    subtitle,

                                rich: true,

                                textColor:
                                    '#e6e6e6'
                            })
                        );
                    }

                    return section;
                },

                // ============================================================
                // WINDOW
                // ============================================================

                createMainWindow: function () {

                    this.mainWindow =
                        new qx.ui.window.Window(
                            t('title')
                        ).set({

                            width: 450,
                            height: 660,

                            showMaximize: false,
                            showMinimize: false,

                            allowMaximize: false,
                            allowMinimize: false,

                            allowClose: true,
                            resizable: false,

                            contentPaddingTop: 8,
                            contentPaddingBottom: 8,
                            contentPaddingLeft: 8,
                            contentPaddingRight: 8
                        });

                    this.mainWindow.setLayout(
                        new qx.ui.layout.VBox(6)
                    );

                    // ========================================================
                    // HEADER
                    // ========================================================

                    const header =
                        new qx.ui.basic.Label().set({

                            rich: true,

                            textColor:
                                '#ffffff',

                            value:
                                '<b><font size="11">OFF-FINDER - HE</font></b><br>' +
                                '<font color="#e6e6e6">' +
                                t('subtitle') +
                                '</font>',

                            marginBottom: 2
                        });

                    this.mainWindow.add(
                        header
                    );

                    const languageRow =
                        new qx.ui.container.Composite(
                            new qx.ui.layout.HBox(6)
                        );

                    languageRow.add(
                        new qx.ui.basic.Label(t('language')).set({ textColor: '#f2f2f2' })
                    );

                    this.languageSelect = new qx.ui.form.SelectBox().set({ width: 130 });

                    [
                        ['Deutsch', 'de'],
                        ['English', 'en'],
                        ['Français', 'fr'],
                        ['Español', 'es']
                    ].forEach(item => {
                        const option = new qx.ui.form.ListItem(item[0]);
                        option.setUserData('lang', item[1]);
                        this.languageSelect.add(option);
                        if (item[1] === getLanguage()) {
                            this.languageSelect.setSelection([option]);
                        }
                    });

                    this.languageSelect.addListener('changeSelection', function (e) {
                        const selection = e.getData();
                        if (!selection || !selection[0]) return;
                        const lang = selection[0].getUserData('lang');
                        if (!lang || lang === getLanguage()) return;
                        localStorage.setItem(languageStorageKey, lang);
                        if (this.mainWindow) {
                            this.mainWindow.close();
                            this.mainWindow.destroy();
                            this.mainWindow = null;
                        }
                        this.onOpenMainWindow();
                    }, this);

                    languageRow.add(this.languageSelect);
                    this.mainWindow.add(languageRow);

                    // ========================================================
                    // ALLIANCE FROM RANKING
                    // ========================================================

                    const rankingSection =
                        this.createSection(

                            t('rankingSection'),

                            t('rankingSubtitle')
                        );

                    // Ranking range label

                    rankingSection.add(
                        new qx.ui.basic.Label().set({

                            value:
                                `<font color="#f2f2f2">${t('rankingRange')}</font>`,

                            rich: true
                        })
                    );

                    this.rankingRangeSelect =
                        new qx.ui.form.SelectBox();

                    this.rankingRangeSelect.add(
                        new qx.ui.form.ListItem(
                            'Top 10',
                            null,
                            'top10'
                        )
                    );

                    this.rankingRangeSelect.add(
                        new qx.ui.form.ListItem(
                            'Top 20',
                            null,
                            'top20'
                        )
                    );

                    this.rankingRangeSelect.add(
                        new qx.ui.form.ListItem(
                            t('custom'),
                            null,
                            'custom'
                        )
                    );

                    const rangeItems =
                        this.rankingRangeSelect.getChildren();

                    const preferredRange =
                        this.rankingRangePreference || 'top10';

                    const preferredItem =
                        rangeItems.find(
                            item => item.getModel() === preferredRange
                        );

                    this.rankingRangeSelect.setSelection([
                        preferredItem || rangeItems[0]
                    ]);

                    this.rankingRangeSelect.addListener(
                        'changeSelection',
                        this.onRankingRangeChanged,
                        this
                    );

                    rankingSection.add(
                        this.rankingRangeSelect
                    );

                    // Custom range

                    this.customRangeContainer =
                        new qx.ui.container.Composite(
                            new qx.ui.layout.HBox(6)
                        );

                    this.customRangeContainer.add(
                        new qx.ui.basic.Label(
                            t('from')
                        ).set({
                            textColor:
                                '#f2f2f2'
                        })
                    );

                    this.customFromField =
                        new qx.ui.form.TextField(
                            this.customFromPreference || '1'
                        );

                    this.customFromField.set({
                        width: 50
                    });

                    this.customRangeContainer.add(
                        this.customFromField
                    );

                    this.customRangeContainer.add(
                        new qx.ui.basic.Label(
                            t('to')
                        ).set({
                            textColor:
                                '#f2f2f2'
                        })
                    );

                    this.customToField =
                        new qx.ui.form.TextField(
                            this.customToPreference || '50'
                        );

                    this.customToField.set({
                        width: 50
                    });

                    this.customRangeContainer.add(
                        this.customToField
                    );

                    this.customApplyButton =
                        new qx.ui.form.Button(
                            t('apply')
                        );

                    this.customApplyButton.addListener(
                        'execute',
                        this.onCustomRangeApply,
                        this
                    );

                    this.customRangeContainer.add(
                        this.customApplyButton
                    );

                    rankingSection.add(
                        this.customRangeContainer
                    );

                    // Hide initially

                    this.customRangeContainer.setVisibility(
                        'excluded'
                    );

                    // Alliance select

                    rankingSection.add(
                        new qx.ui.basic.Label().set({

                            value:
                                `<font color="#f2f2f2">${t('alliance')}</font>`,

                            rich: true,

                            marginTop: 2
                        })
                    );

                    this.allianceSelect =
                        new qx.ui.form.SelectBox();

                    this.allianceSelect.addListener(
                        'changeSelection',
                        this.onSelectAlliance,
                        this
                    );

                    rankingSection.add(
                        this.allianceSelect
                    );

                    this.mainWindow.add(
                        rankingSection
                    );

                    // ========================================================
                    // DIRECT SEARCH
                    // ========================================================

                    const searchSection =
                        this.createSection(

                            t('directSection'),

                            t('directSubtitle')
                        );

                    for (
                        let i = 0;
                        i < 3;
                        i++
                    ) {

                        const row =
                            new qx.ui.container.Composite(
                                new qx.ui.layout.HBox(5)
                            );

                        const numberLabel =
                            new qx.ui.basic.Label(
                                `${i + 1}.`
                            ).set({

                                width:
                                    18,

                                textColor:
                                    '#7dd3fc'
                            });

                        row.add(
                            numberLabel
                        );

                        const field =
                            new qx.ui.form.TextField();

                        field.set({

                            width:
                                285
                        });

                        field.setPlaceholder(
                            t('searchPlaceholder')
                        );

                        this.searchFields[i] =
                            field;

                        row.add(
                            field
                        );

                        const button =
                            new qx.ui.form.Button(
                                t('search')
                            );

                        button.setWidth(
                            62
                        );

                        button.addListener(
                            'execute',
                            () => {

                                this.onAllianceSearch(i);

                            },
                            this
                        );

                        this.searchButtons[i] =
                            button;

                        row.add(
                            button
                        );

                        searchSection.add(
                            row
                        );
                    }

                    this.mainWindow.add(
                        searchSection
                    );

                    // ========================================================
                    // SELECTED ALLIANCE
                    // ========================================================

                    this.allianceLabel =
                        new qx.ui.basic.Label().set({

                            value:
                                t('noneSelected'),

                            rich:
                                true,

                            textColor:
                                '#dddddd',

                            marginTop:
                                1,

                            marginBottom:
                                1
                        });

                    this.mainWindow.add(
                        this.allianceLabel
                    );

                    // ========================================================
                    // BASE SELECTION
                    // ========================================================

                    const baseSection =
                        this.createSection(

                            t('baseSection'),

                            t('baseSubtitle')
                        );

                    this.baseCountSelect =
                        new qx.ui.form.SelectBox();

                    for (
                        let i = 1;
                        i <= 5;
                        i++
                    ) {

                        let text;

                        if (i === 1) {

                            text =
                                t('top1');

                        } else if (i === 2) {

                            text =
                                t('top2');

                        } else {

                            text =
                                t('topN', { n: i });
                        }

                        this.baseCountSelect.add(
                            new qx.ui.form.ListItem(
                                text,
                                null,
                                i
                            )
                        );
                    }

                    this.baseCountSelect.setSelection([
                        this.baseCountSelect.getChildren()[0]
                    ]);

                    baseSection.add(
                        this.baseCountSelect
                    );

                    // Hinweis zur Basenauswahl
                    this.baseWarningLabel =
                        new qx.ui.basic.Label().set({
                            value: t('warning'),
                            rich: true,
                            textColor: '#ffffff',
                            font: 'bold',
                            backgroundColor: '#1a1a1a',
                            paddingTop: 4,
                            paddingBottom: 4,
                            paddingLeft: 6,
                            paddingRight: 6
                        });

                    baseSection.add(
                        this.baseWarningLabel
                    );

                    // Buttons

                    const buttonRow =
                        new qx.ui.container.Composite(
                            new qx.ui.layout.HBox(6)
                        );

                    this.buttonFind =
                        new qx.ui.form.Button(
                            t('find')
                        );

                    this.buttonFind.setEnabled(
                        false
                    );

                    this.buttonFind.addListener(
                        'execute',
                        this.onButtonFind,
                        this
                    );

                    buttonRow.add(
                        this.buttonFind
                    );

                    this.buttonClear =
                        new qx.ui.form.Button(
                            t('clear')
                        );

                    this.buttonClear.setEnabled(
                        false
                    );

                    this.buttonClear.addListener(
                        'execute',
                        this.onButtonClear,
                        this
                    );

                    buttonRow.add(
                        this.buttonClear
                    );

                    baseSection.add(
                        buttonRow
                    );

                    this.mainWindow.add(
                        baseSection
                    );

                    // ========================================================
                    // STATUS
                    // ========================================================

                    this.statusLabel =
                        new qx.ui.basic.Label().set({

                            value:
                                t('ready'),

                            rich:
                                true,

                            textColor:
                                '#e6e6e6'
                        });

                    this.mainWindow.add(
                        this.statusLabel
                    );

                    // ========================================================
                    // RESULT
                    // ========================================================

                    this.resultLabel =
                        new qx.ui.basic.Label().set({

                            value:
                                '',

                            rich:
                                true,

                            textColor:
                                '#7dd3fc'
                        });

                    this.mainWindow.add(
                        this.resultLabel
                    );

                    this.resultScroll =
                        new qx.ui.container.Scroll();

                    this.resultScroll.set({

                        width:
                            420,

                        height:
                            180,

                        scrollbarX:
                            'off',

                        scrollbarY:
                            'auto'
                    });

                    this.resultContainer =
                        new qx.ui.container.Composite(
                            new qx.ui.layout.VBox(2)
                        );

                    this.resultScroll.add(
                        this.resultContainer
                    );

                    this.mainWindow.add(
                        this.resultScroll,
                        {
                            flex:
                                1
                        }
                    );
                },

                // ============================================================
                // LOAD RANKING
                // ============================================================

                loadRanking: function () {

                    console.log(
                        '[OFF-Finder] RankingGetCount gestartet'
                    );

                    this.setStatus(
                        t('loadingRanking'),
                        '#e6e6e6'
                    );

                    try {

                        ClientLib.Net.CommunicationManager
                            .GetInstance()
                            .SendSimpleCommand(
                                'RankingGetCount',
                                {
                                    view:
                                        1
                                },

                                webfrontend.phe.cnc.Util.createEventDelegate(
                                    ClientLib.Net.CommandResult,
                                    this,

                                    (context, countof) => {

                                        console.log(
                                            '[OFF-Finder] RankingGetCount Antwort:',
                                            countof
                                        );

                                        this.rankingCount =
                                            Number(countof) || 0;

                                        if (
                                            !this.rankingCount
                                        ) {

                                            this.setStatus(
                                                t('noRanking'),
                                                '#ff6666'
                                            );

                                            return;
                                        }

                                        ClientLib.Net.CommunicationManager
                                            .GetInstance()
                                            .SendSimpleCommand(
                                                'RankingGetData',
                                                {

                                                    ascending:
                                                        true,

                                                    firstIndex:
                                                        0,

                                                    lastIndex:
                                                        this.rankingCount,

                                                    rankingType:
                                                        0,

                                                    sortColumn:
                                                        2,

                                                    view:
                                                        1
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

                    } catch (e) {

                        console.error(
                            '[OFF-Finder] Ranking-Fehler:',
                            e
                        );

                        this.setStatus(
                            t('rankingError'),
                            '#ff6666'
                        );
                    }
                },

                // ============================================================
                // RANKING DATA
                // ============================================================

                onRankingGetData: function (
                    context,
                    data
                ) {

                    console.log(
                        '[OFF-Finder] RankingGetData Antwort:',
                        data
                    );

                    if (
                        !data ||
                        !Array.isArray(data.a)
                    ) {

                        console.error(
                            '[OFF-Finder] Keine Allianz-Rankingdaten:',
                            data
                        );

                        this.setStatus(
                            t('noAllianceRanking'),
                            '#ff6666'
                        );

                        return;
                    }

                    this.rankingData =
                        data.a.slice();

                    console.log(
                        `[OFF-Finder] ${this.rankingData.length} Allianzen geladen`
                    );

                    this.refreshAllianceSelect();

                    this.setStatus(
                        t('alliancesLoaded', { n: this.rankingData.length }),
                        '#66dd88'
                    );
                },

                // ============================================================
                // REFRESH ALLIANCE SELECT
                // ============================================================

                refreshAllianceSelect: function () {

                    if (
                        !this.allianceSelect
                    ) {
                        return;
                    }

                    const range =
                        this.getRankingRange();

                    this.allianceSelect.removeAll();

                    this.allianceSelect.add(
                        new qx.ui.form.ListItem(
                            '-- Allianz auswählen --',
                            null,
                            {
                                id:
                                    0,

                                name:
                                    ''
                            }
                        )
                    );

                    // Favorites

                    this.favorites.forEach(
                        (favorite) => {

                            this.allianceSelect.add(
                                new qx.ui.form.ListItem(
                                    `[fav] ${favorite.name}`,
                                    null,
                                    {

                                        id:
                                            favorite.id,

                                        name:
                                            favorite.name,

                                        favorite:
                                            true
                                    }
                                )
                            );
                        }
                    );

                    // Ranking

                    const start =
                        Math.max(
                            0,
                            range.from - 1
                        );

                    const end =
                        Math.min(
                            this.rankingData.length,
                            range.to
                        );

                    for (
                        let index = start;
                        index < end;
                        index++
                    ) {

                        const alliance =
                            this.rankingData[index];

                        const entry = {

                            id:
                                alliance.a,

                            name:
                                alliance.an,

                            rank:
                                index + 1
                        };

                        this.allianceSelect.add(
                            new qx.ui.form.ListItem(
                                `${index + 1} - ${alliance.an}`,
                                null,
                                entry
                            )
                        );
                    }
                },

                // ============================================================
                // RANKING RANGE
                // ============================================================

                getRankingRange: function () {

                    const selection =
                        this.rankingRangeSelect
                            .getSelection()[0];

                    if (!selection) {

                        return {
                            from:
                                1,

                            to:
                                20
                        };
                    }

                    switch (
                        selection.getModel()
                    ) {

                        case 'top10':

                            return {
                                from:
                                    1,

                                to:
                                    10
                            };

                        case 'top20':

                            return {
                                from:
                                    1,

                                to:
                                    20
                            };

                        case 'custom':

                            return this.getCustomRange();

                        default:

                            return {
                                from:
                                    1,

                                to:
                                    20
                            };
                    }
                },

                // ============================================================
                // CUSTOM RANGE
                // ============================================================

                getCustomRange: function () {

                    let from =
                        parseInt(
                            this.customFromField.getValue(),
                            10
                        );

                    let to =
                        parseInt(
                            this.customToField.getValue(),
                            10
                        );

                    if (
                        !Number.isFinite(from)
                    ) {
                        from =
                            1;
                    }

                    if (
                        !Number.isFinite(to)
                    ) {
                        to =
                            20;
                    }

                    from =
                        Math.max(
                            1,
                            from
                        );

                    to =
                        Math.max(
                            from,
                            to
                        );

                    if (
                        this.rankingCount > 0
                    ) {

                        to =
                            Math.min(
                                to,
                                this.rankingCount
                            );
                    }

                    return {
                        from,
                        to
                    };
                },

                // ============================================================
                // RANGE CHANGED
                // ============================================================

                onRankingRangeChanged: function () {

                    const selection =
                        this.rankingRangeSelect
                            .getSelection()[0];

                    if (
                        selection &&
                        selection.getModel() === 'custom'
                    ) {

                        this.customRangeContainer.setVisibility(
                            'visible'
                        );

                    } else {

                        this.customRangeContainer.setVisibility(
                            'excluded'
                        );
                    }

                    if (selection && selection.getModel()) {
                        this.rankingRangePreference = selection.getModel();

                        if (selection.getModel() === 'custom') {
                            this.customFromPreference =
                                this.customFromField.getValue();
                            this.customToPreference =
                                this.customToField.getValue();
                        }

                        this.saveStorage();
                    }

                    this.refreshAllianceSelect();
                },

                // ============================================================
                // CUSTOM APPLY
                // ============================================================

                onCustomRangeApply: function () {

                    const range =
                        this.getCustomRange();

                    this.customFromField.setValue(
                        String(
                            range.from
                        )
                    );

                    this.customToField.setValue(
                        String(
                            range.to
                        )
                    );

                    this.customFromPreference =
                        String(range.from);
                    this.customToPreference =
                        String(range.to);
                    this.rankingRangePreference = 'custom';
                    this.saveStorage();

                    this.refreshAllianceSelect();

                    this.setStatus(
                        t('rankingShown', { from: range.from, to: range.to }),
                        '#7dd3fc'
                    );
                },

                // ============================================================
                // ALLIANCE SEARCH
                // ============================================================

                onAllianceSearch: function (
                    index
                ) {

                    const field =
                        this.searchFields[index];

                    if (!field) {
                        return;
                    }

                    const search =
                        field
                            .getValue()
                            .trim();

                    if (!search) {

                        this.setStatus(
                            t('enterSearch', { n: index + 1 }),
                            '#ff6666'
                        );

                        return;
                    }

                    console.log(
                        `[OFF-Finder] Allianzsuche ${index + 1}:`,
                        search
                    );

                    this.setStatus(
                        t('searching', { n: index + 1, search: search }),
                        '#e6e6e6'
                    );

                    ClientLib.Net.CommunicationManager
                        .GetInstance()
                        .SendSimpleCommand(
                            'GetPublicAllianceInfoByNameOrAbbreviation',
                            {
                                name:
                                    search
                            },

                            webfrontend.phe.cnc.Util.createEventDelegate(
                                ClientLib.Net.CommandResult,
                                this,

                                (context, data) => {

                                    console.log(
                                        `[OFF-Finder] Suchergebnis ${index + 1}:`,
                                        data
                                    );

                                    if (
                                        data &&
                                        data.i
                                    ) {

                                        const result = {

                                            id:
                                                data.i,

                                            name:
                                                data.n || search
                                        };

                                        this.searchResults[index] =
                                            result;

                                        this.addSearchResultToSelect(
                                            index,
                                            result
                                        );

                                        this.setStatus(
                                            t('found', { n: index + 1, name: result.name }),
                                            '#66dd88'
                                        );

                                    } else {

                                        this.searchResults[index] =
                                            null;

                                        this.setStatus(
                                            t('notFound', { n: index + 1 }),
                                            '#ff6666'
                                        );
                                    }
                                }
                            ),

                            null
                        );
                },

                // ============================================================
                // ADD SEARCH RESULT
                // ============================================================

                addSearchResultToSelect: function (
                    index,
                    alliance
                ) {

                    this.allianceSelect.add(
                        new qx.ui.form.ListItem(
                            `[Suche ${index + 1}] ${alliance.name}`,
                            null,
                            {

                                id:
                                    alliance.id,

                                name:
                                    alliance.name,

                                searchResult:
                                    true,

                                searchIndex:
                                    index
                            }
                        )
                    );
                },

                // ============================================================
                // SELECT ALLIANCE
                // ============================================================

                onSelectAlliance: function () {

                    const selection =
                        this.allianceSelect
                            .getModelSelection()
                            .getItem(0);

                    console.log(
                        '[OFF-Finder] Allianz-Auswahl:',
                        selection
                    );

                    this.resetData();

                    if (
                        !selection ||
                        !selection.id
                    ) {

                        this.selectedAlliance =
                            null;

                        this.allianceLabel.set({

                            value:
                                t('noneSelected'),

                            textColor:
                                '#dddddd'
                        });

                        this.buttonFind.setEnabled(
                            false
                        );

                        return;
                    }

                    this.selectedAlliance = {

                        i:
                            selection.id,

                        n:
                            selection.name
                    };

                    if (
                        selection.rank
                    ) {

                        this.selectedAlliance.rank =
                            selection.rank;
                    }

                    this.allianceLabel.set({

                        value:
                            `<b>${t('selected')}</b> ` +
                            `${this.escapeHtml(selection.name)}` +
                            (
                                selection.rank
                                    ? ` <font color="#e6e6e6">(Rang ${selection.rank})</font>`
                                    : ''
                            ),

                        textColor:
                            '#7dd3fc'
                    });

                    this.buttonFind.setEnabled(
                        true
                    );

                    this.setStatus(
                        t('allianceReady'),
                        '#7dd3fc'
                    );
                },

                // ============================================================
                // FIND BASES
                // ============================================================

                onButtonFind: function () {

                    if (
                        !this.selectedAlliance
                    ) {
                        return;
                    }

                    console.log(
                        '[OFF-Finder] Starte Basensuche:',
                        this.selectedAlliance
                    );

                    this.resetData(
                        false
                    );

                    this.buttonFind.setEnabled(
                        false
                    );

                    this.buttonClear.setEnabled(
                        false
                    );

                    this.setStatus(
                        t('loadingMembers'),
                        '#e6e6e6'
                    );

                    ClientLib.Net.CommunicationManager
                        .GetInstance()
                        .SendSimpleCommand(
                            'GetPublicAllianceInfo',
                            {

                                id:
                                    this.selectedAlliance.i
                            },

                            webfrontend.phe.cnc.Util.createEventDelegate(
                                ClientLib.Net.CommandResult,
                                this,
                                this.onGetPublicAllianceInfo
                            ),

                            null
                        );
                },

                // ============================================================
                // ALLIANCE INFO
                // ============================================================

                onGetPublicAllianceInfo: function (
                    context,
                    data
                ) {

                    console.log(
                        '[OFF-Finder] GetPublicAllianceInfo:',
                        data
                    );

                    if (
                        !data ||
                        !Array.isArray(data.m)
                    ) {

                        this.setStatus(
                            t('noMembers'),
                            '#ff6666'
                        );

                        this.buttonFind.setEnabled(
                            true
                        );

                        return;
                    }

                    const members =
                        data.m;

                    console.log(
                        `[OFF-Finder] ${members.length} Allianzmitglieder gefunden`
                    );

                    this.setStatus(
                        t('loadingPlayers', { n: members.length }),
                        '#e6e6e6'
                    );

                    members
                        .slice()
                        .sort(
                            (a, b) =>
                                String(a.n)
                                    .localeCompare(
                                        String(b.n)
                                    )
                        )
                        .forEach(
                            (member) => {

                                this.players[
                                    `pid-${member.i}`
                                ] = {

                                    id:
                                        member.i,

                                    name:
                                        member.n,

                                    isFetched:
                                        false
                                };

                                ClientLib.Net.CommunicationManager
                                    .GetInstance()
                                    .SendSimpleCommand(
                                        'GetPublicPlayerInfo',
                                        {

                                            id:
                                                member.i
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
                },

                // ============================================================
                // PLAYER INFO
                // ============================================================

                onGetPublicPlayerInfo: function (
                    context,
                    data
                ) {

                    // Based on the proven Base Finder implementation:
                    // GetPublicPlayerInfo returns the player's bases in data.c.
                    // Do not require Array.isArray() here: the game response
                    // can provide a compatible collection which still supports
                    // reduce(), map() and forEach().
                    console.log(
                        '[OFF-Finder] GetPublicPlayerInfo:',
                        data
                    );

                    if (
                        !data ||
                        !data.c
                    ) {
                        console.warn(
                            '[OFF-Finder] Spieler ohne Basendaten:',
                            data
                        );
                        return;
                    }

                    const playerKey =
                        `pid-${data.i}`;

                    const player =
                        this.players[playerKey];

                    if (!player) {
                        return;
                    }

                    // Strongest base = base with the highest points.
                    const idMain =
                        data.c.length > 0
                            ? data.c.reduce(
                                (p, c) =>
                                    Number(c.p || 0) > Number(p.p || 0)
                                        ? c
                                        : p,
                                data.c[0]
                            ).i
                            : null;

                    player.name =
                        data.n;

                    player.isFetched =
                        true;

                    player.c =
                        data.c.map(
                            (base) =>
                                Object.assign(
                                    {},
                                    base,
                                    {
                                        pn: data.n,
                                        isMain: base.i === idMain,
                                        isGhost: null
                                    }
                                )
                        );

                    data.c.forEach(
                        (base) => {

                            const baseKey =
                                `b-${base.i}`;

                            this.bases[baseKey] =
                                Object.assign(
                                    {},
                                    base,
                                    {
                                        id: base.i,
                                        playerId: data.i,
                                        playerKey: playerKey,
                                        playerName: data.n,
                                        isFetched: false,
                                        isMain: base.i === idMain,
                                        marker: null
                                    }
                                );

                            // The proven Base Finder also fetches the complete
                            // public city information for every base.
                            ClientLib.Net.CommunicationManager
                                .GetInstance()
                                .SendSimpleCommand(
                                    'GetPublicCityInfoById',
                                    {
                                        id: base.i
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

                    this.refreshProgress();
                },

                // ============================================================
                // CITY INFO
                // ============================================================

                onGetPublicCityInfoById: function (
                    context,
                    data
                ) {

                    if (
                        !data ||
                        !data.i
                    ) {
                        return;
                    }

                    const baseKey =
                        `b-${data.i}`;

                    if (!this.bases[baseKey]) {
                        return;
                    }

                    this.bases[baseKey] =
                        Object.assign(
                            {},
                            this.bases[baseKey],
                            data,
                            {
                                isFetched: true
                            }
                        );

                    this.refreshProgress();
                },

                // ============================================================
                // PROGRESS
                // ============================================================

                refreshProgress: function () {

                    const players =
                        Object.values(
                            this.players
                        );

                    const fetchedPlayers =
                        players.filter(
                            player =>
                                player.isFetched
                        );

                    const allFinished =
                        players.length > 0 &&
                        fetchedPlayers.length ===
                            players.length;

                    this.setStatus(
                        t('playerData', { done: fetchedPlayers.length, total: players.length }),
                        allFinished
                            ? '#66dd88'
                            : '#e6e6e6'
                    );

                    if (
                        allFinished &&
                        !this.resultsBuilt
                    ) {

                        this.resultsBuilt = true;

                        console.log(
                            '%c[OFF-Finder] %cAlle Spielerdaten vollständig – Ergebnisse werden EINMAL erstellt.',
                            'color:#00dd66;font-weight:bold',
                            'color:#ffffff'
                        );

                        this.buildResults();

                        this.buttonFind.setEnabled(
                            true
                        );

                        this.buttonClear.setEnabled(
                            true
                        );
                    }
                },

                // ============================================================
                // BUILD RESULTS
                // ============================================================

                buildResults: function () {

                    // ========================================================
                    // DIAGNOSE: farbliche Konsolenausgaben
                    // ========================================================
                    const logInfo = (...args) => console.log(
                        '%c[OFF-Finder] %c' + args[0],
                        'color:#00bfff;font-weight:bold',
                        'color:#ffffff',
                        ...args.slice(1)
                    );
                    const logOk = (...args) => console.log(
                        '%c[OFF-Finder] %c' + args[0],
                        'color:#00dd66;font-weight:bold',
                        'color:#ffffff',
                        ...args.slice(1)
                    );
                    const logWarn = (...args) => console.warn(
                        '%c[OFF-Finder] %c' + args[0],
                        'color:#ffcc00;font-weight:bold',
                        'color:#ffffff',
                        ...args.slice(1)
                    );
                    const logError = (...args) => console.error(
                        '%c[OFF-Finder] %c' + args[0],
                        'color:#ff4444;font-weight:bold',
                        'color:#ffffff',
                        ...args.slice(1)
                    );

                    logInfo('===== BUILD RESULTS START =====');

                    // Die Basen werden – wie im funktionierenden Base Finder –
                    // direkt aus this.bases genommen. Dort werden sie bereits
                    // in onGetPublicPlayerInfo aus data.c angelegt.
                    const allBases = Object.values(this.bases || {});
                    const allPlayers = Object.values(this.players || {});

                    logInfo('Spieler im Speicher:', allPlayers.length);
                    logInfo('Basen im Speicher:', allBases.length);

                    if (allPlayers.length > 0) {
                        logInfo('Beispiel Spieler:', allPlayers[0]);
                    }

                    if (allBases.length > 0) {
                        logOk('Beispiel Basis:', allBases[0]);
                    } else {
                        logError('this.bases ist leer – trotz erfolgreicher GetPublicPlayerInfo-Antworten!');
                    }

                    const selectedItems =
                        this.baseCountSelect.getSelection();

                    const selection =
                        selectedItems &&
                        selectedItems.length > 0
                            ? selectedItems[0]
                            : null;

                    const selectedModel =
                        selection &&
                        typeof selection.getModel === 'function'
                            ? selection.getModel()
                            : null;

                    const maxBases =
                        Number(selectedModel);

                    logInfo('Basenauswahl ListItem:', selection);
                    logInfo('Basenauswahl Model:', selectedModel);
                    logInfo('Maximale Basen je Spieler:', maxBases);

                    if (!Number.isFinite(maxBases) || maxBases < 1) {
                        logError('Ungültige Basenauswahl:', maxBases);
                        this.resultBases = [];
                        this.displayResults();
                        return;
                    }

                    this.resultBases = [];

                    // ========================================================
                    // Basen nach Spieler gruppieren.
                    // Das entspricht dem Datenmodell des Base Finders:
                    // this.bases enthält die eigentlichen Basisobjekte.
                    // ========================================================
                    let playersWithBases = 0;
                    let playersWithoutBases = 0;
                    let totalSelectedBases = 0;

                    allPlayers.forEach((player) => {

                        const playerBases = allBases
                            .filter((base) =>
                                String(base.playerId) === String(player.id)
                            )
                            .sort((a, b) =>
                                Number(b.p || 0) - Number(a.p || 0)
                            );

                        if (playerBases.length === 0) {
                            playersWithoutBases++;
                            return;
                        }

                        playersWithBases++;

                        if (playersWithBases <= 3) {
                            logOk(
                                'Spieler mit Basen gefunden:',
                                player.name,
                                'ID:',
                                player.id,
                                'Basen:',
                                playerBases.length,
                                playerBases
                            );
                        }

                        playerBases
                            .slice(0, maxBases)
                            .forEach((base, index) => {

                                this.resultBases.push({

                                    rank: index + 1,

                                    playerName:
                                        base.playerName ||
                                        base.pn ||
                                        player.name ||
                                        '',

                                    baseName:
                                        base.n || '',

                                    points:
                                        Number(base.p || 0),

                                    x:
                                        base.x,

                                    y:
                                        base.y,

                                    baseId:
                                        base.i,

                                    playerId:
                                        player.id
                                });

                                totalSelectedBases++;
                            });
                    });

                    logInfo('Spieler mit Basen:', playersWithBases);
                    logWarn('Spieler ohne Basen:', playersWithoutBases);
                    logInfo('Ausgewählte Basen insgesamt:', totalSelectedBases);

                    if (this.resultBases.length > 0) {
                        logOk('ERGEBNISSE ERZEUGT:', this.resultBases.length, this.resultBases);
                    } else {
                        logError('KEINE ERGEBNISSE ERZEUGT.');

                        // Zusätzliche Diagnose: Vergleich der IDs eines
                        // Spielers und einer Basis, falls beides vorhanden ist.
                        if (allPlayers.length > 0 && allBases.length > 0) {
                            logWarn(
                                'ID-Diagnose – erster Spieler:',
                                allPlayers[0].id,
                                'erste Basis.playerId:',
                                allBases[0].playerId,
                                'gleicher Wert:',
                                String(allPlayers[0].id) === String(allBases[0].playerId)
                            );
                        }
                    }

                    this.resultBases.sort((a, b) => {

                        if (a.rank !== b.rank) {
                            return a.rank - b.rank;
                        }

                        return b.points - a.points;
                    });

                    this.highlightedBaseIds = {};
                    this.resultBases.forEach((base) => {
                        if (base && base.baseId !== undefined && base.baseId !== null) {
                            this.highlightedBaseIds[String(base.baseId)] = true;
                        }
                    });

                    logOk(
                        'Karten-Zielliste erstellt:',
                        Object.keys(this.highlightedBaseIds).length,
                        this.highlightedBaseIds
                    );

                    startMapHighlighting();

                    logInfo('===== BUILD RESULTS END =====');

                    this.displayResults();
                },

                // ============================================================
                // DISPLAY RESULTS
                // ============================================================

                displayResults: function () {

                    this.resultContainer.removeAll();

                    const players =
                        Object.keys(
                            this.players
                        ).length;

                    const bases =
                        this.resultBases.length;

                    this.resultLabel.set({

                        value:
                            t('basesFound', { bases: bases, players: players }),

                        textColor:
                            '#7dd3fc'
                    });

                    if (
                        !this.resultBases.length
                    ) {

                        this.resultContainer.add(
                            new qx.ui.basic.Label().set({

                                value:
                                    t('noBases'),

                                textColor:
                                    '#ff6666',

                                rich:
                                    true,

                                padding:
                                    8
                            })
                        );

                        return;
                    }

                    this.resultBases.forEach(
                        (base) => {

                            const row =
                                new qx.ui.container.Composite(
                                    new qx.ui.layout.HBox(6)
                                ).set({

                                    paddingTop:
                                        4,

                                    paddingBottom:
                                        4,

                                    paddingLeft:
                                        5,

                                    paddingRight:
                                        5
                                });

                            const rank =
                                new qx.ui.basic.Label(
                                    `#${base.rank}`
                                ).set({

                                    width:
                                        25,

                                    textColor:
                                        base.rank === 1
                                            ? '#ffd700'
                                            : '#f2f2f2',

                                    rich:
                                        true
                                });

                            const info =
                                new qx.ui.basic.Label().set({

                                    rich:
                                        true,

                                    width:
                                        370,

                                    textColor:
                                        '#ffffff',

                                    value:
                                        `<b>${this.escapeHtml(base.playerName)}</b>` +
                                        ` – ${this.escapeHtml(base.baseName)}` +
                                        `<br>` +
                                        `<font color="#e6e6e6">` +
                                        `${this.formatNumber(base.points)} Punkte` +
                                        ` | X: ${base.x} Y: ${base.y}` +
                                        ` | ID: ${base.baseId}` +
                                        `</font>`
                                });

                            row.add(
                                rank
                            );

                            row.add(
                                info
                            );

                            this.resultContainer.add(
                                row
                            );
                        }
                    );

                    this.setStatus(
                        t('completed'),
                        '#66dd88'
                    );
                },

                // ============================================================
                // CLEAR
                // ============================================================

                onButtonClear: function () {

                    this.resultBases =
                        [];

                    this.resultContainer.removeAll();

                    this.resultLabel.set({
                        value:
                            ''
                    });

                    // Auch die Markierungsliste leeren.
                    this.highlightedBaseIds = {};

                    // Bereits gezeichnete gelbe Beschriftungen sofort
                    // auf die normale Farbe zurücksetzen.
                    refreshMapCityColors();

                    this.setStatus(
                        t('resultCleared'),
                        '#e6e6e6'
                    );

                    this.buttonClear.setEnabled(
                        false
                    );
                },

                // ============================================================
                // RESET
                // ============================================================

                resetData: function (
                    resetSelection = true
                ) {

                    // Neuer Suchlauf = Ergebnisse dürfen wieder aufgebaut werden.
                    // Ohne diesen Reset blieb resultsBuilt nach dem ersten
                    // Suchlauf auf true und refreshProgress() startete
                    // buildResults() beim zweiten Suchlauf nicht mehr.
                    this.resultsBuilt =
                        false;

                    this.players =
                        {};

                    this.bases =
                        {};

                    this.resultBases =
                        [];

                    if (
                        this.resultContainer &&
                        typeof this.resultContainer.removeAll ===
                            'function'
                    ) {

                        this.resultContainer.removeAll();
                    }

                    if (
                        this.resultLabel
                    ) {

                        this.resultLabel.set({
                            value:
                                ''
                        });
                    }

                    if (
                        resetSelection
                    ) {

                        this.selectedAlliance =
                            null;
                    }
                },

                // ============================================================
                // STATUS
                // ============================================================

                setStatus: function (
                    text,
                    color
                ) {

                    if (
                        !this.statusLabel
                    ) {
                        return;
                    }

                    this.statusLabel.set({

                        value:
                            text,

                        textColor:
                            color ||
                            '#e6e6e6'
                    });
                },

                // ============================================================
                // FORMAT
                // ============================================================

                formatNumber: function (
                    number
                ) {

                    return Number(
                        number || 0
                    ).toLocaleString(
                        'de-DE'
                    );
                },

                escapeHtml: function (
                    value
                ) {

                    return String(
                        value || ''
                    )
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
                },

                // ============================================================
                // STORAGE
                // ============================================================

                loadStorage: function () {

                    try {

                        const storage =
                            JSON.parse(
                                localStorage.getItem(
                                    storageKey
                                ) || '{}'
                            ) || {};

                        this.rankingRangePreference =
                            storage.rankingRange || 'top10';

                        if (
                            !['top10', 'top20', 'custom'].includes(
                                this.rankingRangePreference
                            )
                        ) {
                            this.rankingRangePreference = 'top10';
                        }

                        this.customFromPreference =
                            storage.customFrom || '1';
                        this.customToPreference =
                            storage.customTo || '50';

                        const worldId =
                            ClientLib.Data.MainData
                                .GetInstance()
                                .get_Server()
                                .get_WorldId();

                        this.favorites =
                            storage[
                                `wid-${worldId}`
                            ] || [];

                    } catch (e) {

                        this.favorites =
                            [];
                    }
                },

                saveStorage: function () {

                    try {

                        const storage =
                            JSON.parse(
                                localStorage.getItem(
                                    storageKey
                                ) || '{}'
                            ) || {};

                        storage.rankingRange =
                            this.rankingRangePreference || 'top10';
                        storage.customFrom =
                            this.customFromPreference || '1';
                        storage.customTo =
                            this.customToPreference || '50';

                        const worldId =
                            ClientLib.Data.MainData
                                .GetInstance()
                                .get_Server()
                                .get_WorldId();

                        storage[
                            `wid-${worldId}`
                        ] =
                            this.favorites;

                        localStorage.setItem(
                            storageKey,
                            JSON.stringify(
                                storage
                            )
                        );

                    } catch (e) {

                        console.error(
                            `${scriptName}: Storage error`,
                            e
                        );
                    }
                }
            }
        });

        Main.getInstance().initialize();
    };

    // ================================================================
    // WAIT FOR GAME
    // ================================================================

    function checkForInit() {

        try {

            if (
                typeof qx === 'undefined' ||
                typeof qx.core?.Init?.getApplication !==
                    'function' ||
                !qx.core.Init.getApplication()?.initDone
            ) {

                setTimeout(
                    checkForInit,
                    1000
                );

                return;
            }

            MainbaseFinder();

            console.log(
                `%c${scriptName} loaded`,
                'background:#1f2937;color:#7dd3fc;font-weight:bold;padding:4px;'
            );

        } catch (e) {

            console.error(
                `${scriptName} error`,
                e
            );

            setTimeout(
                checkForInit,
                2000
            );
        }
    }

    checkForInit();

})();
