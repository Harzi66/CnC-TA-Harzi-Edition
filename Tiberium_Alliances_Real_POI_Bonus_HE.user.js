// ==UserScript==
// @name           Tiberium Alliances Real POI Bonus HE
// @version        1.5.0
// @namespace      https://openuserjs.org/users/petui
// @license        GPL-3.0-or-later
// @author         petui (Original) / Harzi (Weiterentwicklung)
// @sandbox        raw
// @grant          none
// @downloadURL    https://raw.githubusercontent.com/Harzi66/Tiberium_Alliances_Real_POI_Bonus_HE/main/Tiberium_Alliances_Real_POI_Bonus_HE.user.js
// @updateURL      https://raw.githubusercontent.com/Harzi66/Tiberium_Alliances_Real_POI_Bonus_HE/main/Tiberium_Alliances_Real_POI_Bonus_HE.user.js
// @description    Umfangreiche HE-Weiterentwicklung des ursprünglichen POI-Bonus-Scripts mit POI-Archiv, Synchronisation, Rangprognosen, Koordinatensuche und Mehrsprachigkeit.
// @include        https://*.alliances.commandandconquer.com/*/index.aspx*
// ==/UserScript==
'use strict';

(function() {
var main = function() {
'use strict';

function createRealPOIBonus() {
			console.log('[RealPOIBonus HE] v1.5.1 TEST loaded; page context active');

			qx.Class.define('RealPOIBonus', {
				type: 'singleton',
				extend: qx.core.Object,
				statics: {
PoiTypeToPoiRankingTypeMap: {},
PoiRankingTypeToSortColumnMap: {}
},
				defer: function(statics) {
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.TiberiumBonus] = ClientLib.Data.Ranking.ERankingType.BonusTiberium;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.CrystalBonus] = ClientLib.Data.Ranking.ERankingType.BonusCrystal;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.PowerBonus] = ClientLib.Data.Ranking.ERankingType.BonusPower;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.InfanteryBonus] = ClientLib.Data.Ranking.ERankingType.BonusInfantry;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.VehicleBonus] = ClientLib.Data.Ranking.ERankingType.BonusVehicles;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.AirBonus] = ClientLib.Data.Ranking.ERankingType.BonusAircraft;
					statics.PoiTypeToPoiRankingTypeMap[ClientLib.Base.EPOIType.DefenseBonus] = ClientLib.Data.Ranking.ERankingType.BonusDefense;

					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusTiberium] = ClientLib.Data.Ranking.ESortColumn.TiberiumScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusCrystal] = ClientLib.Data.Ranking.ESortColumn.CrystalScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusPower] = ClientLib.Data.Ranking.ESortColumn.PowerScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusInfantry] = ClientLib.Data.Ranking.ESortColumn.InfantryScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusVehicles] = ClientLib.Data.Ranking.ESortColumn.VehicleScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusAircraft] = ClientLib.Data.Ranking.ESortColumn.AircraftScore;
					statics.PoiRankingTypeToSortColumnMap[ClientLib.Data.Ranking.ERankingType.BonusDefense] = ClientLib.Data.Ranking.ESortColumn.DefenseScore;
},
				members: {
					rankingBonusDataCache: {},
					container: null,
					titleLabel: null,
					amountLabel: null,
                    rankLabel: null,
                    upLabel: null,
                    upRealisticLabel: null,
                    upOptimisticLabel: null,
                    downLabel: null,
                    downRealisticLabel: null,
                    downOptimisticLabel: null,
                    statusLabel: null,
                    ownedPoiListContainer: null,
                    ownedPoiListRows: [],
                    poiProximityLabel: null,
                    archiveBaseRadiusKey: null,
                    archiveRuinRadiusKey: null,
                    archiveBaseRadiusField: null,
                    archiveRuinRadiusField: null,
                    poiStatusInfo: null,
                    allianceBaseCoordinates: [],
                    allianceBaseAllianceId: null,
                    allianceBaseMemberSignature: null,
                    allianceBaseCoordinatesLoaded: false,
                    allianceBaseCoordinatesLoading: false,
                    allianceBaseLoadCallbacks: [],
					ownedPoiCount: 0,
                    poiArchiveEntries: [],
                    poiArchiveStorageKey: null,
                    poiArchiveRefreshTimer: null,
                    poiArchiveSyncKey: null,
                    poiArchiveBackfillRunning: false,
                    poiArchiveBackfillCompleted: false,
                    poiArchiveBackfillSkip: 0,
                    poiArchiveBackfillPageSize: 50,
                    poiArchiveBackfillCutoff: 0,
                    poiArchiveBackfillMaxTimestamp: 0,
                    archiveListContainer: null,
                    archiveSummaryLabel: null,
                    archiveTypeViews: {},
                    archiveRetentionSelect: null,
                    archiveRetentionKey: null,
                    archiveMaxPoiLevelKey: null,
                    archiveMaxPoiLevelField: null,
                    archiveLanguageKey: null,
                    archiveLanguageSelect: null,
                    archiveEventFilterSelect: null,
                    archiveEventFilter: 'both',
                    archiveCoordinateSearchField: null,

					initialize: function() {
this.initializeHacks();
this.initializePoiArchive();

this.container = new qx.ui.container.Composite(new qx.ui.layout.VBox(2)).set({
                            textColor: 'text-region-tooltip',
                            marginRight: 10
                        });
                        this.titleLabel = new qx.ui.basic.Label().set({ rich: false });
                        this.amountLabel = new qx.ui.basic.Label();
                        this.rankLabel = new qx.ui.basic.Label();
                        this.upLabel = new qx.ui.basic.Label();
                        this.upRealisticLabel = new qx.ui.basic.Label();
                        this.upOptimisticLabel = new qx.ui.basic.Label();
                        this.downLabel = new qx.ui.basic.Label();
                        this.downRealisticLabel = new qx.ui.basic.Label();
                        this.downOptimisticLabel = new qx.ui.basic.Label();
                        this.statusLabel = new qx.ui.basic.Label();
                        this.ownedPoiListContainer = new qx.ui.container.Composite(new qx.ui.layout.VBox(1));
                        this.container.add(this.titleLabel);
                        this.container.add(this.amountLabel);
                        this.container.add(this.rankLabel);
                        this.container.add(this.upLabel);
                        this.container.add(this.upRealisticLabel);
                        this.container.add(this.upOptimisticLabel);
                        this.container.add(this.downLabel);
                        this.container.add(this.downRealisticLabel);
                        this.container.add(this.downOptimisticLabel);
                        this.container.add(this.statusLabel);
                        // Eigener vertikaler Bereich: jede Ruine erhält eine eigene Zeile.
                        this.poiProximityLabel = new qx.ui.container.Composite(new qx.ui.layout.VBox(0));
                        this.container.add(this.poiProximityLabel);
                        this.container.add(this.ownedPoiListContainer);

                        // Separate archive entry point; archive functionality is added independently.
                        this.archiveButton = new qx.ui.form.Button(this.archiveText('archive'));
                        this.archiveButton.set({ width: 165 });
                        this.archiveButton.addListener('execute', this.openArchiveWindow, this);
                        this.container.add(this.archiveButton);

                        var poiStatusInfo = webfrontend.gui.region.RegionPointOfInterestStatusInfo.getInstance();
                        this.poiStatusInfo = poiStatusInfo;
                        poiStatusInfo.getChildren()[0].addAt(this.container, 4);
                        poiStatusInfo.addListener('appear', this.onStatusInfoAppear, this);

						phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Alliance(), 'Change', ClientLib.Data.AllianceChange, this, this.onAllianceChange);
this.onAllianceChange();
},

					initializeHacks: function() {
var prototype = webfrontend.gui.region.RegionPointOfInterestStatusInfo.prototype;
if (typeof prototype.getObject !== 'function') {
    if (typeof prototype.setObject !== 'function') {
        throw new Error('RegionPointOfInterestStatusInfo.setObject ist nicht verfügbar.');
    }

    // Do not inspect/minify-parse the game's internal property name. The old
    // regex failed on the current client because setObject's source formatting
    // changed. Wrap the setter and retain its argument explicitly instead.
    if (!prototype.__realPoiBonusWrapped) {
        var originalSetObject = prototype.setObject;
        prototype.setObject = function(object) {
            this.__realPoiBonusObject = object;
            return originalSetObject.apply(this, arguments);
        };
        prototype.__realPoiBonusWrapped = true;
    }

    prototype.getObject = function() {
        return this.__realPoiBonusObject;
    };
}
},

                    // Lädt die Koordinaten aller Basen der eigenen Allianz einmalig
                    // über GetPublicPlayerInfo. Dadurch ist die Erkennung unabhängig
                    // davon, welche Weltkartensektoren gerade geladen sind.
                    ensureAllianceBaseCoordinates: function(callback) {
                        var mainData = ClientLib.Data.MainData.GetInstance();
                        var alliance = mainData && mainData.get_Alliance ? mainData.get_Alliance() : null;
                        var allianceId = alliance && alliance.get_Id ? alliance.get_Id() : 0;

                        if (!alliance || !allianceId || !alliance.getMemberIds) {
                            if (callback) callback();
                            return;
                        }

                        var memberIdsObject = alliance.getMemberIds();
                        var memberIds = memberIdsObject && memberIdsObject.l ? memberIdsObject.l : [];
                        var memberSignature = memberIds.join(',');

                        if (this.allianceBaseAllianceId !== allianceId ||
                            this.allianceBaseMemberSignature !== memberSignature) {
                            this.allianceBaseAllianceId = allianceId;
                            this.allianceBaseMemberSignature = memberSignature;
                            this.allianceBaseCoordinates = [];
                            this.allianceBaseCoordinatesLoaded = false;
                            this.allianceBaseCoordinatesLoading = false;
                            this.allianceBaseLoadCallbacks = [];
                        }

                        if (callback) {
                            if (this.allianceBaseCoordinatesLoaded) callback();
                            else this.allianceBaseLoadCallbacks.push(callback);
                        }

                        if (this.allianceBaseCoordinatesLoaded || this.allianceBaseCoordinatesLoading) return;

                        if (!memberIds.length) {
                            this.allianceBaseCoordinatesLoaded = true;
                            this.finishAllianceBaseCoordinateLoad();
                            return;
                        }

                        this.allianceBaseCoordinatesLoading = true;
                        this.allianceBaseLoadFailures = 0;
                        this.allianceBaseLoadIndex = 0;
                        this.allianceBaseLoadMemberIds = memberIds.slice(0);
                        console.log('[RealPOIBonus HE] Lade Basenkoordinaten für ' +
                            memberIds.length + ' Allianzmitglieder …');

                        this.loadNextAllianceMemberBases();
                    },

                    loadNextAllianceMemberBases: function() {
                        var self = this;
                        var memberIds = this.allianceBaseLoadMemberIds || [];
                        var index = this.allianceBaseLoadIndex || 0;

                        if (index >= memberIds.length) {
                            this.allianceBaseCoordinatesLoading = false;
                            this.allianceBaseCoordinatesLoaded = true;
                            this.finishAllianceBaseCoordinateLoad();
                            return;
                        }

                        var playerId = memberIds[index];
                        this.allianceBaseLoadIndex = index + 1;
                        var completed = false;
                        var timeoutId = window.setTimeout(function() {
                            if (completed) return;
                            completed = true;
                            self.allianceBaseLoadFailures++;
                            console.warn('[RealPOIBonus HE] Zeitüberschreitung bei Spieler-ID ' + playerId);
                            window.setTimeout(function() { self.loadNextAllianceMemberBases(); }, 50);
                        }, 15000);

                        var handleResult = function(data) {
                            if (completed) return;
                            completed = true;
                            window.clearTimeout(timeoutId);

                            if (data && data.c && data.c.length) {
                                for (var i = 0; i < data.c.length; i++) {
                                    var base = data.c[i];
                                    var x = Number(base && base.x);
                                    var y = Number(base && base.y);
                                    if (isFinite(x) && isFinite(y)) {
                                        self.allianceBaseCoordinates.push({ x: x, y: y });
                                    }
                                }
                            } else if (!data) {
                                self.allianceBaseLoadFailures++;
                            }

                            window.setTimeout(function() { self.loadNextAllianceMemberBases(); }, 50);
                        };

                        try {
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand(
                                'GetPublicPlayerInfo',
                                { id: playerId },
                                webfrontend.phe.cnc.Util.createEventDelegate(
                                    ClientLib.Net.CommandResult,
                                    null,
                                    function(context, data) { handleResult(data); }
                                ),
                                null,
                                function(error) {
                                    if (completed) return;
                                    completed = true;
                                    window.clearTimeout(timeoutId);
                                    self.allianceBaseLoadFailures++;
                                    console.warn('[RealPOIBonus HE] Spielerinformationen konnten nicht geladen werden:',
                                        playerId, error);
                                    window.setTimeout(function() { self.loadNextAllianceMemberBases(); }, 50);
                                }
                            );
                        } catch (e) {
                            if (!completed) {
                                completed = true;
                                window.clearTimeout(timeoutId);
                                this.allianceBaseLoadFailures++;
                                console.warn('[RealPOIBonus HE] Abruf der Spielerinformationen fehlgeschlagen:',
                                    playerId, e);
                                window.setTimeout(function() { self.loadNextAllianceMemberBases(); }, 50);
                            }
                        }
                    },

                    finishAllianceBaseCoordinateLoad: function() {
                        console.log('[RealPOIBonus HE] Basenabfrage abgeschlossen: ' +
                            this.allianceBaseCoordinates.length + ' Basen aus ' +
                            (this.allianceBaseLoadMemberIds || []).length + ' Mitgliedern; Fehler: ' +
                            (this.allianceBaseLoadFailures || 0) + '.');

                        var callbacks = this.allianceBaseLoadCallbacks || [];
                        this.allianceBaseLoadCallbacks = [];
                        for (var i = 0; i < callbacks.length; i++) {
                            try { callbacks[i](); }
                            catch (e) { console.warn('[RealPOIBonus HE] Aktualisierung nach Basenabfrage fehlgeschlagen:', e); }
                        }

                        // Bereits geöffnetes POI-Fenster und die eigene POI-Liste aktualisieren.
                        if (this.poiStatusInfo && typeof this.poiStatusInfo.getObject === 'function') {
                            var selectedPoi = this.poiStatusInfo.getObject();
                            if (selectedPoi && selectedPoi.get_OwnerAllianceId &&
                                selectedPoi.get_OwnerAllianceId() === this.allianceBaseAllianceId) {
                                this.updatePoiProximityInfo(selectedPoi);
                            }
                        }
                        if (this.currentOwnedPoiType !== undefined && this.currentOwnedPoiType !== null) {
                            this.updateOwnedPoiList(this.currentOwnedPoiType);
                        }
                    },

                    countAllianceBasesNear: function(centerX, centerY, radius) {
                        var bases = this.allianceBaseCoordinates || [];
                        var count = 0;
                        for (var i = 0; i < bases.length; i++) {
                            if (Math.abs(bases[i].x - centerX) <= radius &&
                                Math.abs(bases[i].y - centerY) <= radius) {
                                count++;
                            }
                        }
                        return count;
                    },

                    getPoiProtectionCounts: function(centerX, centerY) {
                        var mainData = ClientLib.Data.MainData.GetInstance();
                        var world = mainData.get_World();
                        var baseRadius = this.getPoiProximityRadius(this.archiveBaseRadiusKey, 2);
                        var ruinRadius = this.getPoiProximityRadius(this.archiveRuinRadiusKey, 5);
                        var bases = this.countAllianceBasesNear(centerX, centerY, baseRadius);
                        var ruins = 0;

                        // Die Ruinenerkennung bleibt vorerst unverändert.
                        for (var rx = centerX - ruinRadius; rx <= centerX + ruinRadius; rx++) {
                            for (var ry = centerY - ruinRadius; ry <= centerY + ruinRadius; ry++) {
                                var ruinObject = world.GetObjectFromPosition(rx, ry);
                                if (ruinObject && ruinObject.Type === 7) {
                                    var alliance = mainData.get_Alliance();
                                    var ownOwnerId = 536870912 + alliance.get_Id();
                                    if (world.GetOwner(rx, ry) === ownOwnerId) ruins++;
                                }
                            }
                        }

                        return { bases: bases, ruins: ruins };
                    },

                    updateOwnedPoiList: function(poiType) {
                        this.currentOwnedPoiType = poiType;
                        this.ensureAllianceBaseCoordinates();
                        var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                        var ownedPois = alliance && alliance.get_Exists() ? alliance.get_OwnedPOIs() : [];
                        var matchingPois = [];

                        for (var i = 0; i < ownedPois.length; i++) {
                            var poi = ownedPois[i];
                            if (!poi || poi.t === undefined) continue;

                            // OwnedPOIs.t already contains the ranked POI type used by
                            // poiType. Do not convert it again from a world-object type:
                            // that conversion mixes categories (e.g. Reactor/Tungsten).
                            if (poi.t === poiType) {
                                matchingPois.push({ x: poi.x, y: poi.y, level: poi.l });
                            }
                        }

                        matchingPois.sort(function(a, b) {
                            if (b.level !== a.level) return b.level - a.level;
                            if (a.x !== b.x) return a.x - b.x;
                            return a.y - b.y;
                        });

                        // Rebuild the list as individual rows so every coordinate
                        // can be clicked independently.
                        this.ownedPoiListContainer.removeAll();
                        this.ownedPoiListRows = [];

                        var heading = new qx.ui.basic.Label('Eigene POIs dieses Typs (' + matchingPois.length + '):');
                        this.ownedPoiListContainer.add(heading);

                        for (var j = 0; j < matchingPois.length; j++) {
                            var entry = matchingPois[j];
                            var poiEntryContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox(4));
                            var row = new qx.ui.basic.Label(
                                (j + 1) + '. ' + entry.x + ':' + entry.y + '  ·  Stufe ' + entry.level
                            );
                            row.setTextColor('#8ecbff');
                            row.setCursor('pointer');

                            (function(x, y) {
                                row.addListener('click', function() {
                                    if (webfrontend.gui.UtilView &&
                                        typeof webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow === 'function') {
                                        webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(x, y);
                                    }
                                });
                            })(entry.x, entry.y);

                            var protection = this.getPoiProtectionCounts(entry.x, entry.y);
                            var baseWord = protection.bases === 1 ? 'Basis' : 'Basen';
                            var ruinWord = protection.ruins === 1 ? 'Ruine' : 'Ruinen';
                            var protectionLabel = new qx.ui.basic.Label(
                                'Abgesichert durch ' + protection.bases + ' ' + baseWord +
                                ' + ' + protection.ruins + ' ' + ruinWord
                            );
                            protectionLabel.setTextColor('#ffff00');

                            // Protection text belongs directly after the POI details
                            // in the same horizontal line, not on a second line.
                            poiEntryContainer.add(row);
                            poiEntryContainer.add(protectionLabel);
                            this.ownedPoiListContainer.add(poiEntryContainer);
                            this.ownedPoiListRows.push(poiEntryContainer);
                        }
                    },

                    getPoiProximityRadius: function(key, defaultValue) {
                        var value = defaultValue;
                        try { value = Number(localStorage.getItem(key) || defaultValue); } catch (e) {}
                        if (!isFinite(value)) value = defaultValue;
                        return Math.max(1, Math.min(10, Math.floor(value)));
                    },

                    updatePoiProximityInfo: function(visObject) {
                        if (!this.poiProximityLabel) return;

                        try {
                            if (!visObject || !visObject.LANSRZ ||
                                !isFinite(Number(visObject.DFQBMN)) ||
                                !isFinite(Number(visObject.IIESIH))) {
                                this.poiProximityLabel.removeAll();
                                return;
                            }

                            var centerX = Number(visObject.DFQBMN);
                            var centerY = Number(visObject.IIESIH);
                            var mainData = ClientLib.Data.MainData.GetInstance();
                            var world = mainData.get_World();
                            var view = ClientLib.Vis.VisMain.GetInstance().get_Region();
                            var alliance = mainData.get_Alliance();
                            var allianceId = alliance && alliance.get_Id ? alliance.get_Id() : 0;
                            var ownOwnerId = 536870912 + allianceId;
                            var baseRadius = this.getPoiProximityRadius(this.archiveBaseRadiusKey, 2);
                            var ruinRadius = this.getPoiProximityRadius(this.archiveRuinRadiusKey, 5);
                            var ruins = [];

                            // Spielerbasen kommen aus GetPublicPlayerInfo aller Allianzmitglieder,
                            // nicht mehr aus den aktuell geladenen Weltkartensektoren.
                            this.ensureAllianceBaseCoordinates();
                            var baseCount = this.countAllianceBasesNear(centerX, centerY, baseRadius);

                            // Ruinen werden über die aktuell geladene Kartenansicht geprüft.
                            for (var rx = centerX - ruinRadius; rx <= centerX + ruinRadius; rx++) {
                                for (var ry = centerY - ruinRadius; ry <= centerY + ruinRadius; ry++) {
                                    var ruin = view.GetObjectFromPosition(rx * 128 + 64, ry * 96 + 48);
                                    if (!ruin || typeof ruin.FYKHTE !== 'function' ||
                                        ruin.FYKHTE() !== 7 ||
                                        world.GetOwner(rx, ry) !== ownOwnerId) {
                                        continue;
                                    }

                                    var expiryText = '';
                                    try {
                                        var expiry = mainData.get_Time().GetJSStepTime(ruin.get_CreateStep());
                                        expiry.setHours(expiry.getHours() + 24);
                                        expiryText = webfrontend.phe.cnc.Util.getDateTimeString(expiry);
                                    } catch (dateError) {
                                        expiryText = '—';
                                    }

                                    ruins.push({
                                        x: rx,
                                        y: ry,
                                        owner: typeof ruin.get_OwnerBaseName === 'function'
                                            ? ruin.get_OwnerBaseName()
                                            : '',
                                        expiry: expiryText
                                    });
                                }
                            }

                            this.poiProximityLabel.removeAll();
                            var baseWord = baseCount === 1 ? 'Basis' : 'Basen';
                            var ruinWord = ruins.length === 1 ? 'Ruine' : 'Ruinen';
                            var summaryLabel = new qx.ui.basic.Label(
                                'Abgesichert durch ' + baseCount + ' ' + baseWord +
                                ' + ' + ruins.length + ' ' + ruinWord
                            );
                            summaryLabel.setTextColor('#ffff00');
                            this.poiProximityLabel.add(summaryLabel);
                            for (var i = 0; i < ruins.length; i++) {
                                var ruinInfo = ruins[i];
                                var ruinLabel = new qx.ui.basic.Label(
                                    'Ruine ' + ruinInfo.x + ':' + ruinInfo.y +
                                    (ruinInfo.owner ? ' – ' + ruinInfo.owner : '') +
                                    ' – Ablauf: ' + ruinInfo.expiry
                                );
                                ruinLabel.setTextColor('#ffff00');
                                this.poiProximityLabel.add(ruinLabel);
                            }
                        } catch (e) {
                            console.warn('[RealPOIBonus HE] Umkreissuche fehlgeschlagen:', e);
                            this.poiProximityLabel.removeAll();
                            var errorLabel = new qx.ui.basic.Label('Umkreissuche derzeit nicht verfügbar.');
                            this.poiProximityLabel.add(errorLabel);
                        }
                    },

                    getArchiveLanguage: function() {
                        try {
                            var language = localStorage.getItem(this.archiveLanguageKey) || 'de';
                            return ['de', 'en', 'fr', 'es'].indexOf(language) >= 0 ? language : 'de';
                        } catch (e) { return 'de'; }
                    },

                    archiveText: function(key) {
                        var language = this.getArchiveLanguage();
                        var texts = {
                            de: {
                                archive: 'POI-Archiv & Optionen', poiTiberium: 'Tiberium', poiCrystal: 'Kristall', poiEnergy: 'Energie', poiInfantry: 'Infanterie', poiVehicles: 'Fahrzeuge', poiAir: 'Luftwaffe', poiResonance: 'Resonanz', options: 'Optionen', retention: 'Aufbewahrungsdauer für gespeicherte POI-Ereignisse:',
                                months3: '3 Monate', months6: '6 Monate', year1: '1 Jahr', years2: '2 Jahre', unlimited: 'Unbegrenzt',
                                maxLevel: 'Maximale POI-Stufe für Prognose (Standard: 46):',
                                maxLevelTip: 'Zulässiger Bereich: 1 bis 100. Die optimistische Prognose berücksichtigt höchstens zwei POI-Stufen über der realistischen Stufe.',
                                baseRadius: 'Umkreis für eigene Basen (Felder, Standard: 2):', ruinRadius: 'Umkreis für eigene Ruinen (Felder, Standard: 5):',
                                language: 'Sprache:', deleteArchive: 'Gesamtes Archiv löschen', cancel: 'Abbrechen',
                                confirmDelete: 'JA – ALLES LÖSCHEN', deleteTitle: 'ACHTUNG – ALLE ARCHIVDATEN WERDEN GELÖSCHT!',
                                deleteText: 'Möchtest du wirklich das gesamte POI-Archiv löschen?\nAlle gespeicherten Gewinne und Verluste aller sieben POI-Arten werden unwiderruflich entfernt.\nDiese Daten können anschließend NICHT wiederhergestellt.',
                                retentionInfo: 'Die Aufbewahrungsregel gilt ausschließlich für das lokale POI-Archiv. Spielbenachrichtigungen werden dadurch nicht verändert.',
                                gainedLost: 'Gewonnene und verlorene POI', gained: 'Nur gewonnene POI', lost: 'Nur verlorene POI',
                                coordinates: 'Koordinaten:', coordinateHint: 'z. B. 123:456', clearSearch: 'Koordinatensuche leeren',
                                loading: 'Archiv wird geladen …', noEvents: 'Für {type} gibt es keine Ereignisse entsprechend dem gewählten Filter.',
                                events: 'Ereignisse:', wins: 'Gewinne:', losses: 'Verluste:',
                                rankUp: 'Bis Rangaufstieg:', rankDown: 'Bis Rangabstieg:', realistic: 'Realistisch:', optimistic: 'Optimistisch:',
                                points: 'Punkte', poi: 'POIs', level: 'Stufe', ownPois: 'Eigene POIs dieses Typs',
                                gain: 'GEWONNEN', loss: 'VERLOREN', allianceBonus: 'Allianzbonus:', allianceRank: 'Allianzrang:',
                                gainPossible: 'Rangaufstieg durch Eroberung möglich', lossPossible: 'Rangabstieg durch diesen Verlust möglich',
                                unchanged: 'Rang bleibt voraussichtlich unverändert', clickMap: 'Anklicken, um die Weltkarte auf {coords} zu zentrieren'
                            },
                            en: {
                                archive: 'POI Archive & Options', poiTiberium: 'Tiberium', poiCrystal: 'Crystal', poiEnergy: 'Energy', poiInfantry: 'Infantry', poiVehicles: 'Vehicles', poiAir: 'Air Force', poiResonance: 'Resonance', options: 'Options', retention: 'Retention period for saved POI events:',
                                months3: '3 months', months6: '6 months', year1: '1 year', years2: '2 years', unlimited: 'Unlimited',
                                maxLevel: 'Maximum POI level for forecast (default: 46):',
                                maxLevelTip: 'Allowed range: 1 to 100. The optimistic forecast considers at most two POI levels above the realistic level.',
                                baseRadius: 'Radius for own bases (fields, default: 2):', ruinRadius: 'Radius for own ruins (fields, default: 5):',
                                language: 'Language:', deleteArchive: 'Delete entire archive', cancel: 'Cancel',
                                confirmDelete: 'YES – DELETE ALL', deleteTitle: 'WARNING – ALL ARCHIVE DATA WILL BE DELETED!',
                                deleteText: 'Do you really want to delete the entire POI archive?\nAll saved gains and losses for all seven POI types will be permanently removed.\nThis data CANNOT be restored.',
                                retentionInfo: 'The retention rule applies only to the local POI archive. Game notifications are not changed.',
                                gainedLost: 'Gained and lost POIs', gained: 'Gained POIs only', lost: 'Lost POIs only',
                                coordinates: 'Coordinates:', coordinateHint: 'e.g. 123:456', clearSearch: 'Clear coordinate search',
                                loading: 'Loading archive …', noEvents: 'There are no {type} events matching the selected filter.',
                                events: 'Events:', wins: 'Gains:', losses: 'Losses:',
                                rankUp: 'Until rank up:', rankDown: 'Until rank down:', realistic: 'Realistic:', optimistic: 'Optimistic:',
                                points: 'Points', poi: 'POIs', level: 'Level', ownPois: 'Own POIs of this type',
                                gain: 'GAINED', loss: 'LOST', allianceBonus: 'Alliance bonus:', allianceRank: 'Alliance rank:',
                                gainPossible: 'Rank increase possible by capturing', lossPossible: 'Rank decrease possible from this loss',
                                unchanged: 'Rank is expected to remain unchanged', clickMap: 'Click to center the world map on {coords}'
                            },
                            fr: {
                                archive: 'Archive POI & options', poiTiberium: 'Tibérium', poiCrystal: 'Cristal', poiEnergy: 'Énergie', poiInfantry: 'Infanterie', poiVehicles: 'Véhicules', poiAir: 'Force aérienne', poiResonance: 'Résonance', options: 'Options', retention: 'Durée de conservation des événements POI :',
                                months3: '3 mois', months6: '6 mois', year1: '1 an', years2: '2 ans', unlimited: 'Illimitée',
                                maxLevel: 'Niveau POI maximum pour la prévision (par défaut : 46) :',
                                maxLevelTip: 'Plage autorisée : 1 à 100. La prévision optimiste prend en compte au maximum deux niveaux au-dessus du niveau réaliste.',
                                baseRadius: 'Rayon des bases alliées (cases, défaut : 2) :', ruinRadius: 'Rayon des ruines alliées (cases, défaut : 5) :',
                                language: 'Langue :', deleteArchive: 'Supprimer toute l’archive', cancel: 'Annuler',
                                confirmDelete: 'OUI – TOUT SUPPRIMER', deleteTitle: 'ATTENTION – TOUTES LES DONNÉES SERONT SUPPRIMÉES !',
                                deleteText: 'Voulez-vous vraiment supprimer toute l’archive POI ?\nTous les gains et pertes enregistrés pour les sept types de POI seront définitivement supprimés.\nCes données NE POURRONT PAS être restaurées.',
                                retentionInfo: 'La conservation concerne uniquement l’archive POI locale. Les notifications du jeu ne sont pas modifiées.',
                                gainedLost: 'POI gagnés et perdus', gained: 'POI gagnés uniquement', lost: 'POI perdus uniquement',
                                coordinates: 'Coordonnées :', coordinateHint: 'ex. 123:456', clearSearch: 'Effacer la recherche de coordonnées',
                                loading: 'Chargement de l’archive …', noEvents: 'Aucun événement {type} ne correspond au filtre sélectionné.',
                                events: 'Événements :', wins: 'Gains :', losses: 'Pertes :',
                                rankUp: 'Avant promotion :', rankDown: 'Avant rétrogradation :', realistic: 'Réaliste :', optimistic: 'Optimiste :',
                                points: 'Points', poi: 'POI', level: 'Niveau', ownPois: 'POI possédés de ce type',
                                gain: 'GAGNÉ', loss: 'PERDU', allianceBonus: 'Bonus d’alliance :', allianceRank: 'Rang de l’alliance :',
                                gainPossible: 'Promotion possible par conquête', lossPossible: 'Rétrogradation possible après cette perte',
                                unchanged: 'Le rang devrait rester inchangé', clickMap: 'Cliquer pour centrer la carte sur {coords}'
                            },
                            es: {
                                archive: 'Archivo POI y opciones', poiTiberium: 'Tiberio', poiCrystal: 'Cristal', poiEnergy: 'Energía', poiInfantry: 'Infantería', poiVehicles: 'Vehículos', poiAir: 'Fuerza aérea', poiResonance: 'Resonancia', options: 'Opciones', retention: 'Periodo de conservación de eventos POI:',
                                months3: '3 meses', months6: '6 meses', year1: '1 año', years2: '2 años', unlimited: 'Ilimitado',
                                maxLevel: 'Nivel máximo de POI para la previsión (predeterminado: 46):',
                                maxLevelTip: 'Rango permitido: 1 a 100. La previsión optimista considera como máximo dos niveles por encima del nivel realista.',
                                baseRadius: 'Radio de bases propias (casillas, predeterminado: 2):', ruinRadius: 'Radio de ruinas propias (casillas, predeterminado: 5):',
                                language: 'Idioma:', deleteArchive: 'Eliminar todo el archivo', cancel: 'Cancelar',
                                confirmDelete: 'SÍ – ELIMINAR TODO', deleteTitle: 'ATENCIÓN – ¡SE ELIMINARÁN TODOS LOS DATOS DEL ARCHIVO!',
                                deleteText: '¿Realmente quieres eliminar todo el archivo de POI?\nTodos los beneficios y pérdidas guardados de los siete tipos de POI se eliminarán permanentemente.\nEstos datos NO se podrán restaurar.',
                                retentionInfo: 'La regla de conservación solo afecta al archivo local de POI. Las notificaciones del juego no cambian.',
                                gainedLost: 'POI ganados y perdidos', gained: 'Solo POI ganados', lost: 'Solo POI perdidos',
                                coordinates: 'Coordenadas:', coordinateHint: 'p. ej. 123:456', clearSearch: 'Borrar búsqueda de coordenadas',
                                loading: 'Cargando archivo …', noEvents: 'No hay eventos de {type} que coincidan con el filtro seleccionado.',
                                events: 'Eventos:', wins: 'Ganancias:', losses: 'Pérdidas:',
                                rankUp: 'Para subir de rango:', rankDown: 'Para bajar de rango:', realistic: 'Realista:', optimistic: 'Optimista:',
                                points: 'Puntos', poi: 'POI', level: 'Nivel', ownPois: 'POI propios de este tipo',
                                gain: 'GANADO', loss: 'PERDIDO', allianceBonus: 'Bonificación de alianza:', allianceRank: 'Rango de alianza:',
                                gainPossible: 'Es posible subir de rango conquistando', lossPossible: 'Es posible bajar de rango por esta pérdida',
                                unchanged: 'Se prevé que el rango no cambie', clickMap: 'Haz clic para centrar el mapa en {coords}'
                            }
                        };
                        var selected = texts[language] || texts.de;
                        return selected[key] || texts.de[key] || key;
                    },

                    initializePoiArchive: function() {
                        var worldKey = (location.host + location.pathname).replace(/[^a-z0-9]/gi, '_');
                        this.poiArchiveStorageKey = 'RealPOIBonusHE_POIArchive_' + worldKey;
                        this.archiveRetentionKey = this.poiArchiveStorageKey + '_retention';
                        this.archiveMaxPoiLevelKey = this.poiArchiveStorageKey + '_maxPoiLevel';
                        this.archiveBaseRadiusKey = this.poiArchiveStorageKey + '_baseRadius';
                        this.archiveRuinRadiusKey = this.poiArchiveStorageKey + '_ruinRadius';
                        this.archiveLanguageKey = this.poiArchiveStorageKey + '_language';
                        this.poiArchiveSyncKey = this.poiArchiveStorageKey + '_lastNotificationSync';
                        this.poiArchiveEntries = this.loadPoiArchive();
                        // Frühere Versionen haben bei Verlusten den aktuellen Kartenbesitzer
                        // als historischen Allianzpartner gespeichert. Das ist nicht belastbar;
                        // solche Altwerte werden entfernt, bis eine echte Ereignisquelle vorliegt.
                        var clearedAllianceHints = false;
                        for (var archiveIndex = 0; archiveIndex < this.poiArchiveEntries.length; archiveIndex++) {
                            if (this.poiArchiveEntries[archiveIndex].newOwnerAlliance) {
                                this.poiArchiveEntries[archiveIndex].newOwnerAlliance = null;
                                clearedAllianceHints = true;
                            }
                        }
                        var expiredAtStartup = this.applyPoiArchiveRetention(false);
                        if (expiredAtStartup || clearedAllianceHints) this.savePoiArchive();

                        // Die Erfassung startet unabhängig davon, ob das Archivfenster geöffnet wird.
                        // Falls der Notification-Manager noch nicht fertig geladen ist, wird der Start
                        // beim nächsten Hintergrunddurchlauf erneut versucht.
                        var self = this;
                        this.startPoiArchiveBackfill();
                        this.poiArchiveRefreshTimer = window.setInterval(function() {
                            try {
                                self.startPoiArchiveBackfill();
                                self.scanPoiNotifications();
                            }
                            catch (e) { console.warn('[RealPOIBonus HE] POI-Archiv-Hintergrundlauf fehlgeschlagen:', e); }
                        }, 5000);
                    },

                    startPoiArchiveBackfill: function() {
                        if (this.poiArchiveBackfillRunning || this.poiArchiveBackfillCompleted) return;

                        var mainData = ClientLib.Data.MainData.GetInstance();
                        var manager = mainData && mainData.get_Notifications ? mainData.get_Notifications() : null;
                        if (!manager || !manager.get_FirstLoadCompleted || !manager.get_FirstLoadCompleted()) return;

                        var now = Date.now();
                        var thirtyDaysAgo = now - 30 * 86400000;
                        var lastSync = 0;
                        try {
                            lastSync = Number(localStorage.getItem(this.poiArchiveSyncKey) || 0);
                        } catch (e) {}

                        // Bei der Erstinstallation werden 30 Tage geladen.
                        // Danach wird mit fünf Minuten Überlappung nur bis zum letzten
                        // erfolgreich erfassten Meldungszeitpunkt zurückgeblättert.
                        this.poiArchiveBackfillCutoff = lastSync > 0
                            ? Math.max(thirtyDaysAgo, lastSync - 5 * 60000)
                            : thirtyDaysAgo;
                        this.poiArchiveBackfillSkip = 0;
                        this.poiArchiveBackfillMaxTimestamp = 0;
                        this.poiArchiveBackfillRunning = true;

                        console.log('[RealPOIBonus HE] POI-Archiv: Hintergrundabgleich gestartet' +
                            (lastSync > 0 ? ' (seit letztem Abgleich).' : ' (Erstbefüllung: letzte 30 Tage).'));

                        this.requestPoiArchiveBackfillPage(manager);
                    },

                    requestPoiArchiveBackfillPage: function(manager) {
                        if (!this.poiArchiveBackfillRunning || !manager) return;

                        var self = this;
                        var skip = this.poiArchiveBackfillSkip;
                        var pageSize = this.poiArchiveBackfillPageSize;

                        try {
                            var callback = (new $I.PFDFNI).MRQVRG(manager, function(context, result) {
                                var page = [];
                                try {
                                    page = result != null ? (manager.MOXLUR(result) || []) : [];
                                    manager.VRFGRN(context, result);
                                } catch (e) {
                                    console.error('[RealPOIBonus HE] POI-Archiv: Serverantwort konnte nicht verarbeitet werden:', e);
                                    self.poiArchiveBackfillRunning = false;
                                    return;
                                }

                                // Nach dem Merge enthält GetAll() die tatsächlich nutzbaren
                                // Notification-Objekte. MOXLUR() allein liefert je nach Client
                                // nicht immer Objekte mit get_Time().
                                self.scanPoiNotifications(Date.now() - 30 * 86400000);
                                var allNotifications = manager.GetAll ? manager.GetAll() : [];
                                var oldestTimestamp = 0;
                                var newestTimestamp = 0;
                                for (var i = 0; i < allNotifications.length; i++) {
                                    var timestamp = allNotifications[i] && allNotifications[i].get_Time
                                        ? Number(allNotifications[i].get_Time()) : 0;
                                    if (!timestamp) continue;
                                    if (!oldestTimestamp || timestamp < oldestTimestamp) oldestTimestamp = timestamp;
                                    if (timestamp > newestTimestamp) newestTimestamp = timestamp;
                                    if (timestamp > self.poiArchiveBackfillMaxTimestamp) {
                                        self.poiArchiveBackfillMaxTimestamp = timestamp;
                                    }
                                }

                                console.log('[RealPOIBonus HE] POI-Archiv: Seite ' + skip +
                                    ' verarbeitet; Servereinträge: ' + page.length +
                                    ', insgesamt im Manager: ' + allNotifications.length +
                                    ', älteste Meldung: ' + (oldestTimestamp ? new Date(oldestTimestamp).toLocaleString() : 'unbekannt') + '.');

                                // Der Server liefert neueste Meldungen zuerst. Sobald die
                                // älteste bisher geladene Meldung den gespeicherten Zeitstempel
                                // (mit fünf Minuten Überlappung) erreicht oder unterschreitet,
                                // sind alle seit dem letzten Abgleich relevanten Meldungen erfasst.
                                // Eine leere Seite bleibt zusätzlich die Sicherheits-Abbruchbedingung.
                                var reachedCutoff = oldestTimestamp > 0 &&
                                    oldestTimestamp <= self.poiArchiveBackfillCutoff;
                                var reachedEnd = page.length === 0;

                                if (reachedCutoff || reachedEnd) {
                                    console.log('[RealPOIBonus HE] POI-Archiv: Abbruchgrund: ' +
                                        (reachedCutoff ? 'Synchronisationszeitpunkt erreicht.' : 'keine weiteren Servermeldungen.') +
                                        ' Stichtag: ' + new Date(self.poiArchiveBackfillCutoff).toLocaleString() + '.');
                                    self.finishPoiArchiveBackfill(manager);
                                    return;
                                }

                                self.poiArchiveBackfillSkip += pageSize;
                                window.setTimeout(function() {
                                    self.requestPoiArchiveBackfillPage(manager);
                                }, 500);
                            });

                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand(
                                'NotificationGetRange',
                                {
                                    category: 0,
                                    skip: skip,
                                    take: pageSize,
                                    sortOrder: 1,
                                    ascending: false
                                },
                                callback,
                                null
                            );
                        } catch (e) {
                            this.poiArchiveBackfillRunning = false;
                            console.error('[RealPOIBonus HE] POI-Archiv: Abrufseite ' + skip + ' fehlgeschlagen:', e);
                        }
                    },

                    finishPoiArchiveBackfill: function(manager) {
                        var notifications = manager && manager.GetAll ? manager.GetAll() : [];
                        var latestTimestamp = this.poiArchiveBackfillMaxTimestamp;

                        for (var i = 0; i < notifications.length; i++) {
                            var timestamp = notifications[i] && notifications[i].get_Time
                                ? Number(notifications[i].get_Time()) : 0;
                            if (timestamp > latestTimestamp) latestTimestamp = timestamp;
                        }

                        if (latestTimestamp > 0) {
                            try {
                                localStorage.setItem(this.poiArchiveSyncKey, String(latestTimestamp));
                            } catch (e) {
                                console.warn('[RealPOIBonus HE] POI-Archiv: Synchronisationsstand konnte nicht gespeichert werden:', e);
                            }
                        }

                        this.scanPoiNotifications(Date.now() - 30 * 86400000);
                        this.poiArchiveBackfillRunning = false;
                        this.poiArchiveBackfillCompleted = true;
                        console.log('[RealPOIBonus HE] POI-Archiv: Hintergrundabgleich abgeschlossen. Meldungen geprüft: ' +
                            notifications.length + '.');
                    },

                    loadPoiArchive: function() {
                        try {
                            var raw = localStorage.getItem(this.poiArchiveStorageKey);
                            var parsed = raw ? JSON.parse(raw) : [];
                            return Array.isArray(parsed) ? parsed : [];
                        } catch (e) {
                            console.warn('[RealPOIBonus HE] Archivdaten konnten nicht gelesen werden:', e);
                            return [];
                        }
                    },

                    savePoiArchive: function() {
                        try {
                            localStorage.setItem(this.poiArchiveStorageKey, JSON.stringify(this.poiArchiveEntries));
                            return true;
                        } catch (e) {
                            console.error('[RealPOIBonus HE] Archivdaten konnten nicht gespeichert werden:', e);
                            return false;
                        }
                    },

                    scanPoiNotifications: function(minTimestamp) {
                        var mainData = ClientLib.Data.MainData.GetInstance();
                        var manager = mainData && mainData.get_Notifications ? mainData.get_Notifications() : null;
                        if (!manager || (manager.get_FirstLoadCompleted && !manager.get_FirstLoadCompleted())) return;

                        var notifications = manager.GetAll ? manager.GetAll() : [];
                        if (!notifications || !notifications.length) return;

                        var known = {};
                        for (var i = 0; i < this.poiArchiveEntries.length; i++) {
                            known[String(this.poiArchiveEntries[i].notificationId)] = true;
                        }

                        var added = 0;

                        for (var n = 0; n < notifications.length; n++) {
                            var notification = notifications[n];
                            if (!notification || !notification.get_Id || !notification.get_CategoryId || notification.get_CategoryId() !== 7) continue;

                            var notificationId = notification.get_Id();

                            var notificationTimestamp = notification.get_Time
                                ? Number(notification.get_Time()) : Date.now();
                            var minimumTimestamp = typeof minTimestamp === 'number'
                                ? minTimestamp : Date.now() - 30 * 86400000;
                            if (notificationTimestamp < minimumTimestamp) continue;

                            var template = notification.HFPZAO || {};
                            var eventType = template.n === 'POI Gained' ? 'gain' : (template.n === 'POI Lost' ? 'loss' : null);
                            if (!eventType) continue;

                            var params = notification.get_Parameters ? notification.get_Parameters() : [];
                            var values = {};
                            for (var p = 0; p < params.length; p++) {
                                if (params[p]) {
                                    var parameterKey = params[p].key !== undefined ? params[p].key : params[p].k;
                                    var parameterValue = params[p].value !== undefined ? params[p].value : params[p].v;
                                    if (parameterKey !== undefined) values[String(parameterKey)] = parameterValue;
                                }
                            }
                            if (known[String(notificationId)]) continue;

                            var worldId = Number(values['6']);
                            var poiType = Number(values['4']);
                            var level = Number(values['2']);
                            var points = Number(values['3']);
                            if (!isFinite(worldId) || !isFinite(poiType) || !isFinite(level) || !isFinite(points)) continue;

                            // The world ID encodes the map coordinates in its high/low 16 bits.
                            var x = worldId >>> 16;
                            var y = worldId & 65535;
                            var typeNames = {
                                2: 'Tiberium', 3: 'Kristall', 4: 'Energie', 5: 'Infanterie',
                                6: 'Fahrzeuge', 7: 'Luftwaffe', 8: 'Resonanz'
                            };

                            var entry = {
                                notificationId: notificationId,
                                eventType: eventType,
                                timestamp: notificationTimestamp,
                                poiType: poiType,
                                poiTypeName: typeNames[poiType] || ('Unbekannt (' + poiType + ')'),
                                level: level,
                                points: points,
                                worldId: worldId,
                                x: x,
                                y: y,
                                newOwnerAlliance: null // Allianz-IDs sind nicht Teil der fünf übermittelten Meldungsparameter.
                            };

                            this.poiArchiveEntries.push(entry);
                            known[String(notificationId)] = true;
                            added++;
                        }

                        var removedByRetention = this.applyPoiArchiveRetention(false);
                        if (added || removedByRetention) {
                            this.poiArchiveEntries.sort(function(a, b) { return b.timestamp - a.timestamp; });
                            this.savePoiArchive();
                            this.refreshArchiveDisplay();
                            if (added) console.log('[RealPOIBonus HE] POI-Archiv: ' + added + ' neue Ereignisse gespeichert.');
                            if (removedByRetention) console.log('[RealPOIBonus HE] POI-Archiv: ' + removedByRetention + ' abgelaufene Ereignisse entfernt.');
                        }
                    },

                    getPoiArchiveRetentionDays: function() {
                        try {
                            var value = localStorage.getItem(this.archiveRetentionKey) || 'unlimited';
                            return value === 'unlimited' ? 0 : Number(value);
                        } catch (e) { return 0; }
                    },

                    applyPoiArchiveRetention: function(manual) {
                        var days = this.getPoiArchiveRetentionDays();
                        if (!days) return 0;
                        var cutoff = Date.now() - days * 86400000;
                        var before = this.poiArchiveEntries.length;
                        this.poiArchiveEntries = this.poiArchiveEntries.filter(function(entry) {
                            return Number(entry.timestamp) >= cutoff;
                        });
                        var removed = before - this.poiArchiveEntries.length;
                        if (removed && manual) this.savePoiArchive();
                        return removed;
                    },

                    openArchiveWindow: function() {
                        if (!this.archiveWindow) {
                            var window = new qx.ui.window.Window(this.archiveText('archive'));
                            window.set({ width: 760, height: 520, showMinimize: false, showMaximize: true, allowMaximize: true });
                            window.setLayout(new qx.ui.layout.VBox(8));

                            // Globaler Ereignisfilter für alle POI-Arten.
                            var filterBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
                            filterBar.setPadding(6);
                            var filterLabel = new qx.ui.basic.Label('Anzeige:');
                            filterLabel.setTextColor('#f0f0f0');
                            filterBar.add(filterLabel);
                            this.archiveEventFilterSelect = new qx.ui.form.SelectBox();
                            var eventFilterOptions = [
                                { label: this.archiveText('gainedLost'), value: 'both' },
                                { label: this.archiveText('gained'), value: 'gain' },
                                { label: this.archiveText('lost'), value: 'loss' }
                            ];
                            for (var ef = 0; ef < eventFilterOptions.length; ef++) {
                                this.archiveEventFilterSelect.add(new qx.ui.form.ListItem(eventFilterOptions[ef].label, null, eventFilterOptions[ef].value));
                            }
                            var eventFilterChildren = this.archiveEventFilterSelect.getChildren();
                            for (var ec = 0; ec < eventFilterChildren.length; ec++) {
                                if (eventFilterChildren[ec].getModel() === this.archiveEventFilter) {
                                    this.archiveEventFilterSelect.setSelection([eventFilterChildren[ec]]);
                                    break;
                                }
                            }
                            this.archiveEventFilterSelect.addListener('changeSelection', function(e) {
                                var selection = e.getData() || [];
                                if (!selection.length) return;
                                this.archiveEventFilter = selection[0].getModel();
                                try { localStorage.setItem(this.archiveEventFilterKey, this.archiveEventFilter); } catch (err) {}
                                this.refreshArchiveDisplay();
                            }, this);
                            filterBar.add(this.archiveEventFilterSelect);

                            var coordinateSearchLabel = new qx.ui.basic.Label(this.archiveText('coordinates'));
                            coordinateSearchLabel.setTextColor('#f0f0f0');
                            filterBar.add(coordinateSearchLabel);
                            this.archiveCoordinateSearchField = new qx.ui.form.TextField();
                            this.archiveCoordinateSearchField.set({ width: 190 });
                            if (typeof this.archiveCoordinateSearchField.setPlaceholder === 'function') {
                                this.archiveCoordinateSearchField.setPlaceholder(this.archiveText('coordinateHint'));
                            }
                            this.archiveCoordinateSearchField.addListener('input', this.refreshArchiveDisplay, this);
                            filterBar.add(this.archiveCoordinateSearchField);
                            var clearCoordinateSearchButton = new qx.ui.form.Button('×');
                            clearCoordinateSearchButton.set({ width: 28, toolTipText: this.archiveText('clearSearch') });
                            clearCoordinateSearchButton.addListener('execute', function() {
                                this.archiveCoordinateSearchField.setValue('');
                                this.refreshArchiveDisplay();
                            }, this);
                            filterBar.add(clearCoordinateSearchButton);

                            var tabs = new qx.ui.tabview.TabView();
                            var typeTabs = [
                                { id: 2, name: 'Tiberium', key: 'poiTiberium' },
                                { id: 3, name: 'Kristall', key: 'poiCrystal' },
                                { id: 4, name: 'Energie', key: 'poiEnergy' },
                                { id: 5, name: 'Infanterie', key: 'poiInfantry' },
                                { id: 6, name: 'Fahrzeuge', key: 'poiVehicles' },
                                { id: 7, name: 'Luftwaffe', key: 'poiAir' },
                                { id: 8, name: 'Resonanz', key: 'poiResonance' }
                            ];
                            this.archiveTypeViews = {};

                            for (var ti = 0; ti < typeTabs.length; ti++) {
                                var typeInfo = typeTabs[ti];
                                var localizedTypeName = this.archiveText(typeInfo.key);
                                var typePage = new qx.ui.tabview.Page(localizedTypeName);
                                typePage.setLayout(new qx.ui.layout.VBox(8));
                                var summary = new qx.ui.basic.Label(this.archiveText('loading'));
                                var scroll = new qx.ui.container.Scroll();
                                var list = new qx.ui.container.Composite(new qx.ui.layout.VBox(4));
                                // Archivfläche optisch an das dunkle POI-Ereignisfenster anpassen.
                                list.setPadding(8);
                                list.setBackgroundColor('#202629');
                                scroll.setBackgroundColor('#202629');
                                typePage.setBackgroundColor('#202629');
                                summary.setTextColor('#f0f0f0');
                                scroll.add(list);
                                typePage.add(summary);
                                typePage.add(scroll, { flex: 1 });
                                tabs.add(typePage);
                                this.archiveTypeViews[typeInfo.id] = {
                                    name: localizedTypeName,
                                    summary: summary,
                                    list: list
                                };
                            }

                            var optionsPage = new qx.ui.tabview.Page(this.archiveText('options'));
                            optionsPage.setLayout(new qx.ui.layout.VBox(8));

                            // Einheitliche Abschnittsüberschriften mit dezenter Trennlinie.
                            var addOptionsSection = function(caption) {
                                var separator = new qx.ui.core.Widget();
                                separator.set({
                                    height: 1,
                                    minHeight: 1,
                                    backgroundColor: '#9aa8b2',
                                    marginTop: 5,
                                    marginBottom: 2
                                });
                                optionsPage.add(separator);

                                var heading = new qx.ui.basic.Label(caption);
                                heading.setTextColor('#8b1a00');
                                heading.set({ marginTop: 1, marginBottom: 1 });
                                optionsPage.add(heading);
                            };

                            addOptionsSection('ALLGEMEINE ARCHIV-EINSTELLUNGEN');
                            var retentionLabel = new qx.ui.basic.Label(this.archiveText('retention'));
                            retentionLabel.setTextColor('#000000');
                            optionsPage.add(retentionLabel);
                            this.archiveRetentionSelect = new qx.ui.form.SelectBox();
                            var retentionOptions = [
                                { label: this.archiveText('months3'), value: '90' },
                                { label: this.archiveText('months6'), value: '180' },
                                { label: this.archiveText('year1'), value: '365' },
                                { label: this.archiveText('years2'), value: '730' },
                                { label: this.archiveText('unlimited'), value: 'unlimited' }
                            ];
                            for (var r = 0; r < retentionOptions.length; r++) {
                                this.archiveRetentionSelect.add(new qx.ui.form.ListItem(retentionOptions[r].label, null, retentionOptions[r].value));
                            }
                            var storedRetention = localStorage.getItem(this.archiveRetentionKey) || 'unlimited';
                            var retentionChildren = this.archiveRetentionSelect.getChildren();
                            for (var rc = 0; rc < retentionChildren.length; rc++) {
                                if (retentionChildren[rc].getModel() === storedRetention) {
                                    this.archiveRetentionSelect.setSelection([retentionChildren[rc]]);
                                    break;
                                }
                            }
                            this.archiveRetentionSelect.addListener('changeSelection', function(e) {
                                var selection = e.getData() || [];
                                if (!selection.length) return;
                                localStorage.setItem(this.archiveRetentionKey, selection[0].getModel());
                                var removed = this.applyPoiArchiveRetention(true);
                                this.savePoiArchive();
                                this.refreshArchiveDisplay();
                                if (removed) console.log('[RealPOIBonus HE] POI-Archiv: ' + removed + ' ältere Ereignisse entfernt.');
                            }, this);
                            optionsPage.add(this.archiveRetentionSelect);
                            var languageRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
                            var languageLabel = new qx.ui.basic.Label(this.archiveText('language'));
                            languageLabel.setTextColor('#000000');
                            languageRow.add(languageLabel);
                            this.archiveLanguageSelect = new qx.ui.form.SelectBox();
                            var languageOptions = [
                                { label: 'Deutsch', value: 'de' },
                                { label: 'English', value: 'en' },
                                { label: 'Français', value: 'fr' },
                                { label: 'Español', value: 'es' }
                            ];
                            for (var li = 0; li < languageOptions.length; li++) {
                                this.archiveLanguageSelect.add(new qx.ui.form.ListItem(languageOptions[li].label, null, languageOptions[li].value));
                            }
                            var currentLanguage = this.getArchiveLanguage();
                            var languageChildren = this.archiveLanguageSelect.getChildren();
                            for (var lc = 0; lc < languageChildren.length; lc++) {
                                if (languageChildren[lc].getModel() === currentLanguage) {
                                    this.archiveLanguageSelect.setSelection([languageChildren[lc]]);
                                    break;
                                }
                            }
                            this.archiveLanguageSelect.addListener('changeSelection', function(e) {
                                var selection = e.getData() || [];
                                if (!selection.length) return;
                                try { localStorage.setItem(this.archiveLanguageKey, selection[0].getModel()); } catch (err) {}
                                // Rebuild the archive window so every visible label uses the selected language.
                                if (this.archiveWindow) {
                                    this.archiveWindow.destroy();
                                    this.archiveWindow = null;
                                    this.archiveTypeViews = {};
                                    this.archiveRetentionSelect = null;
                                    this.archiveMaxPoiLevelField = null;
                                    this.archiveBaseRadiusField = null;
                                    this.archiveRuinRadiusField = null;
                                    this.archiveLanguageSelect = null;
                                    this.archiveCoordinateSearchField = null;
                                    this.archiveEventFilterSelect = null;
                                    this.openArchiveWindow();
                                }
                            }, this);
                            languageRow.add(this.archiveLanguageSelect);
                            optionsPage.add(languageRow);


                            addOptionsSection('POI-PROGNOSE');

                            // Maximale POI-Stufe für die optimistische Prognose.
                            var maxLevelRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
                            var maxLevelLabel = new qx.ui.basic.Label(this.archiveText('maxLevel'));
                            maxLevelLabel.setTextColor('#000000');
                            maxLevelLabel.setValue(this.archiveText('maxLevel'));
                            maxLevelRow.add(maxLevelLabel);
                            this.archiveMaxPoiLevelField = new qx.ui.form.TextField();
                            this.archiveMaxPoiLevelField.set({ width: 55 });
                            var storedMaxPoiLevel = Number(localStorage.getItem(this.archiveMaxPoiLevelKey) || 46);
                            if (!isFinite(storedMaxPoiLevel) || storedMaxPoiLevel < 1) storedMaxPoiLevel = 46;
                            this.archiveMaxPoiLevelField.setValue(String(Math.min(100, Math.floor(storedMaxPoiLevel))));
                            this.archiveMaxPoiLevelField.setToolTipText(this.archiveText('maxLevelTip'));
                            this.archiveMaxPoiLevelField.addListener('changeValue', function(e) {
                                var value = Number(e.getData());
                                if (!isFinite(value)) return;
                                value = Math.max(1, Math.min(100, Math.floor(value)));
                                try { localStorage.setItem(this.archiveMaxPoiLevelKey, String(value)); } catch (err) {}
                                this.archiveMaxPoiLevelField.setValue(String(value));
                            }, this);
                            maxLevelRow.add(this.archiveMaxPoiLevelField);
                            optionsPage.add(maxLevelRow);

                            addOptionsSection('UMKREISSUCHE');

                            // Suchradien für die Umkreisauswertung; getrennt und dauerhaft gespeichert.
                            var radiusFields = [
                                { key: this.archiveBaseRadiusKey, label: this.archiveText('baseRadius'), fallback: 2, member: 'archiveBaseRadiusField' },
                                { key: this.archiveRuinRadiusKey, label: this.archiveText('ruinRadius'), fallback: 5, member: 'archiveRuinRadiusField' }
                            ];
                            for (var rf = 0; rf < radiusFields.length; rf++) {
                                (function(config, owner) {
                                    var radiusRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(8));
                                    var radiusLabel = new qx.ui.basic.Label(config.label);
                                    radiusLabel.setTextColor('#000000');
                                    radiusRow.add(radiusLabel);

                                    // Auswahlfeld statt Texteingabe: verhindert, dass Qooxdoo
                                    // Zwischenstände beim Tippen oder Fokuswechsel zurücksetzt.
                                    var radiusField = new qx.ui.form.SelectBox();
                                    radiusField.set({ width: 70 });

                                    for (var radiusOption = 1; radiusOption <= 10; radiusOption++) {
                                        radiusField.add(new qx.ui.form.ListItem(
                                            String(radiusOption), null, radiusOption
                                        ));
                                    }

                                    var storedRadius = owner.getPoiProximityRadius(config.key, config.fallback);
                                    var radiusItems = radiusField.getChildren();
                                    for (var radiusIndex = 0; radiusIndex < radiusItems.length; radiusIndex++) {
                                        if (Number(radiusItems[radiusIndex].getModel()) === storedRadius) {
                                            radiusField.setSelection([radiusItems[radiusIndex]]);
                                            break;
                                        }
                                    }

                                    radiusField.addListener('changeSelection', function(e) {
                                        var selection = e.getData() || [];
                                        if (!selection.length) return;

                                        var value = Number(selection[0].getModel());
                                        if (!isFinite(value) || value < 1 || value > 10) return;

                                        try { localStorage.setItem(config.key, String(value)); } catch (err) {}

                                        var selectedPoi = owner.poiStatusInfo &&
                                            typeof owner.poiStatusInfo.getObject === 'function'
                                            ? owner.poiStatusInfo.getObject()
                                            : null;
                                        if (selectedPoi) owner.updatePoiProximityInfo(selectedPoi);
                                    });

                                    radiusRow.add(radiusField);
                                    optionsPage.add(radiusRow);
                                    owner[config.member] = radiusField;
                                })(radiusFields[rf], this);
                            }

                            addOptionsSection('DATENVERWALTUNG');

                            var cleanupButton = new qx.ui.form.Button(this.archiveText('deleteArchive'));
                            var deleteWarning = new qx.ui.container.Composite(new qx.ui.layout.VBox(8));
                            deleteWarning.setPadding(12);
                            deleteWarning.setBackgroundColor('#3b1717');
                            deleteWarning.setMinHeight(132);

                            // Qooxdoo-Labels zeigen HTML standardmäßig als Text an.
                            // Deshalb Klartext verwenden und Zeilenumbruch aktivieren.
                            var deleteWarningTitle = new qx.ui.basic.Label(
                                'ACHTUNG – ALLE ARCHIVDATEN WERDEN GELÖSCHT!'
                            );
                            deleteWarningTitle.setTextColor('#ffcc66');
                            deleteWarningTitle.setWrap(true);
                            deleteWarning.add(deleteWarningTitle);

                            var deleteWarningText = new qx.ui.basic.Label(
                                'Möchtest du wirklich das gesamte POI-Archiv löschen?\n' +
                                'Alle gespeicherten Gewinne und Verluste aller sieben POI-Arten werden unwiderruflich entfernt.\n' +
                                'Diese Daten können anschließend NICHT wiederhergestellt werden.'
                            );
                            deleteWarningText.setTextColor('#ffffff');
                            deleteWarningText.setWrap(true);
                            deleteWarning.add(deleteWarningText);

                            var deleteWarningButtons = new qx.ui.container.Composite(new qx.ui.layout.HBox(10));
                            var cancelDeleteButton = new qx.ui.form.Button(this.archiveText('cancel'));
                            var confirmDeleteButton = new qx.ui.form.Button(this.archiveText('confirmDelete'));
                            deleteWarningButtons.add(cancelDeleteButton);
                            deleteWarningButtons.add(confirmDeleteButton);
                            deleteWarning.add(deleteWarningButtons);
                            deleteWarning.setVisibility('excluded');
                            optionsPage.add(cleanupButton);
                            optionsPage.add(deleteWarning);

                            cleanupButton.addListener('execute', function() {
                                // Die Warnung erscheint innerhalb der Optionen-Seite, nicht als separates Fenster.
                                deleteWarning.setVisibility('visible');
                                cleanupButton.setEnabled(false);
                            });

                            cancelDeleteButton.addListener('execute', function() {
                                deleteWarning.setVisibility('excluded');
                                cleanupButton.setEnabled(true);
                            });

                            confirmDeleteButton.addListener('execute', function() {
                                // Ausschließlich dieser ausdrückliche zweite Klick löscht Daten.
                                confirmDeleteButton.setEnabled(false);
                                var removed = this.poiArchiveEntries.length;
                                try {
                                    localStorage.removeItem(this.poiArchiveStorageKey);
                                    // Beim nächsten Spielstart soll nach einer manuellen Löschung
                                    // wieder die vollständige 30-Tage-Erstbefüllung laufen.
                                    localStorage.removeItem(this.poiArchiveSyncKey);
                                    this.poiArchiveEntries = [];
                                    this.refreshArchiveDisplay();
                                    console.log('[RealPOIBonus HE] POI-Archiv vollständig gelöscht. Entfernte Ereignisse: ' + removed);
                                    deleteWarning.setVisibility('excluded');
                                    cleanupButton.setEnabled(true);
                                } catch (e) {
                                    console.error('[RealPOIBonus HE] POI-Archiv konnte nicht vollständig gelöscht werden:', e);
                                    confirmDeleteButton.setEnabled(true);
                                    cleanupButton.setEnabled(true);
                                }
                            }, this);
                            var retentionInfoLabel = new qx.ui.basic.Label(this.archiveText('retentionInfo'));
                            retentionInfoLabel.setTextColor('#000000');
                            optionsPage.add(retentionInfoLabel);
                            tabs.add(optionsPage);

                            window.add(filterBar);
                            window.add(tabs, { flex: 1 });
                            window.addListener('appear', this.refreshArchiveDisplay, this);
                            this.archiveWindow = window;
                        }

                        var desktop = qx.core.Init.getApplication().getDesktop();
                        if (!this.archiveWindow.getLayoutParent()) desktop.add(this.archiveWindow);
                        this.archiveWindow.open();
                        this.archiveWindow.center();
                        this.refreshArchiveDisplay();
                    },

                    refreshArchiveDisplay: function() {
                        if (!this.archiveTypeViews) return;
                        var typeIds = [2, 3, 4, 5, 6, 7, 8];
                        for (var t = 0; t < typeIds.length; t++) {
                            var typeId = typeIds[t];
                            var view = this.archiveTypeViews[typeId];
                            if (!view) continue;
                            view.list.removeAll();
                            var filterMode = this.archiveEventFilter || 'both';
                            var coordinateQuery = this.archiveCoordinateSearchField
                                ? String(this.archiveCoordinateSearchField.getValue() || '').replace(/\s+/g, '').replace(/[;,]/g, ':').toLowerCase()
                                : '';
                            var group = this.poiArchiveEntries.filter(function(entry) {
                                if (Number(entry.poiType) !== typeId) return false;
                                if (filterMode === 'gain' && entry.eventType !== 'gain') return false;
                                if (filterMode === 'loss' && entry.eventType !== 'loss') return false;
                                if (filterMode !== 'gain' && filterMode !== 'loss' && entry.eventType !== 'gain' && entry.eventType !== 'loss') return false;
                                if (coordinateQuery) {
                                    var xText = String(entry.x);
                                    var yText = String(entry.y);
                                    var coordinateText = xText + ':' + yText;
                                    if (coordinateQuery.indexOf(':') >= 0) {
                                        var coordinateParts = coordinateQuery.split(':');
                                        var xQuery = coordinateParts[0] || '';
                                        var yQuery = coordinateParts[1] || '';
                                        if (xText.indexOf(xQuery) !== 0 || yText.indexOf(yQuery) !== 0) return false;
                                    } else if (xText.indexOf(coordinateQuery) < 0 && yText.indexOf(coordinateQuery) < 0 && coordinateText.indexOf(coordinateQuery) < 0) {
                                        return false;
                                    }
                                }
                                return true;
                            });
                            var gains = 0;
                            var losses = 0;
                            for (var g = 0; g < group.length; g++) {
                                if (group[g].eventType === 'gain') gains++;
                                else if (group[g].eventType === 'loss') losses++;
                            }
                            view.summary.setValue('Ereignisse: ' + group.length + '   |   Gewinne: ' + gains + '   |   Verluste: ' + losses);
                            if (!group.length) {
                                var emptyLabel = new qx.ui.basic.Label('Für ' + view.name + ' gibt es keine Ereignisse entsprechend dem gewählten Filter.');
                                emptyLabel.setTextColor('#e6e6e6');
                                view.list.add(emptyLabel);
                                continue;
                            }
                            for (var i = 0; i < group.length; i++) {
                                var entry = group[i];
                                var date = new Date(entry.timestamp).toLocaleString();
                                var status = entry.eventType === 'gain' ? 'GEWONNEN' : 'VERLOREN';
                                var sign = entry.eventType === 'gain' ? '+' : '−';
                                var line = date + '  |  ' + status + '  |  Stufe ' + entry.level + '  |  Punkte ' + sign + Number(entry.points).toLocaleString('de-DE') + '  |  ' + entry.x + ':' + entry.y;
                                if (entry.newOwnerAlliance) line += '  |  Allianz: ' + entry.newOwnerAlliance;
                                var row = new qx.ui.basic.Label(line);
                                row.setRich(false);
                                row.setWrap(true);
                                row.setTextColor(entry.eventType === 'gain' ? '#62d889' : '#ff7777');
                                row.setCursor('pointer');
                                row.setToolTipText('Anklicken, um die Weltkarte auf ' + entry.x + ':' + entry.y + ' zu zentrieren');
                                (function(x, y) {
                                    row.addListener('click', function() {
                                        // Archiv zuerst schließen, danach die Weltkarte auf den POI zentrieren.
                                        if (this.archiveWindow) this.archiveWindow.close();
                                        if (webfrontend.gui.UtilView &&
                                            typeof webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow === 'function') {
                                            window.setTimeout(function() {
                                                webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(x, y);
                                            }, 100);
                                        } else {
                                            console.warn('[RealPOIBonus HE] Weltkarten-Zentrierung ist nicht verfügbar.');
                                        }
                                    }, this);
                                }).call(this, entry.x, entry.y);
                                view.list.add(row);
                            }
                        }
                    },

					onAllianceChange: function() {
var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
var poiCount = alliance.get_Exists() ? alliance.get_OwnedPOIs().length : 0;

if (poiCount !== this.ownedPoiCount) {
this.ownedPoiCount = poiCount;
this.rankingBonusDataCache = {};
}

// Allianzbasen unabhängig von der Kartenansicht laden.
this.ensureAllianceBaseCoordinates();
},

/**
					 * @param {qx.event.type.Event} event
					 */
					onStatusInfoAppear: function(event) {
var visObject = event.getTarget().getObject();
this.hideIntelligenceReport(event.getTarget());
var allianceId = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id();

if (allianceId > 0 && visObject.get_Type() !== ClientLib.Data.WorldSector.WorldObjectPointOfInterest.EPOIType.TunnelExit) {
    // Die Umkreissuche gehört ausschließlich zum normalen POI-Informationsfenster.
    // Sie wird nur für POIs der eigenen Allianz ausgeführt; das Archiv bleibt davon unberührt.
    if (visObject.get_OwnerAllianceId() === allianceId) {
        this.updatePoiProximityInfo(visObject);
    } else if (this.poiProximityLabel) {
        this.poiProximityLabel.removeAll();
    }
var selectedPoiScore = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(visObject.get_Level());
var poiType = ClientLib.Base.PointOfInterestTypes.GetPOITypeFromWorldPOIType(visObject.get_Type());
this.updateOwnedPoiList(poiType);
var poiRankScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIRankScore()[poiType - ClientLib.Base.EPOIType.RankedTypeBegin];
var allianceRank = poiRankScore.r;
var allianceScore = poiRankScore.s;
var nextAllianceScore = poiRankScore.ns;
var previousAllianceScore = poiRankScore.ps;
var currentTotalBonus = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank, allianceScore, 1);
var gainOrLoss = null;

if (visObject.get_OwnerAllianceId() === allianceId) {
this.currentActionLabel = 'Real loss';

if (previousAllianceScore <= 0) {
// No rank multiplier; no loss by rank
									gainOrLoss = currentTotalBonus - ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank, allianceScore - selectedPoiScore, 1);
}
else if (allianceScore - selectedPoiScore < previousAllianceScore) {
// Falling behind previous alliance; need to use rankings
}
else {
// No loss by rank; if we end up with same score as previous alliance, our rank stays the same and they get same rank
									gainOrLoss = currentTotalBonus - ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank, allianceScore - selectedPoiScore, 1);
}
}
else {
this.currentActionLabel = 'Real gain';

if (!allianceScore) {
// Zero bonus; need to use rankings
}
else if (nextAllianceScore <= 0 || allianceRank <= 1) {
// Already rank 1; no gain by rank
									gainOrLoss = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank, allianceScore + selectedPoiScore, 1) - currentTotalBonus;
}
else if (visObject.get_OwnerAllianceId() !== webfrontend.gui.widgets.AllianceLabel.ESpecialNoAllianceName) {
// Current owner of POI will lose score while we gain; need to use rankings
}
else if (allianceScore + selectedPoiScore > nextAllianceScore) {
// Overtaking next alliance; need to use rankings
}
else if (allianceScore + selectedPoiScore < nextAllianceScore) {
// No gain by rank
									gainOrLoss = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank, allianceScore + selectedPoiScore, 1) - currentTotalBonus;
}
else {
// Same score as next alliance; same rank and same bonus as them
									gainOrLoss = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(poiType, allianceRank - 1, allianceScore + selectedPoiScore, 1) - currentTotalBonus;
}
}

if (gainOrLoss === null) {
this.titleLabel.setValue(this.currentActionLabel + ':');
this.amountLabel.setValue('Berechnung wird geladen …');
this.rankLabel.setValue(''); this.upLabel.setValue(''); this.downLabel.setValue(''); this.statusLabel.setValue('');
this.fetchAndCalculateBonusWithRankingData(poiType, allianceRank, allianceScore, selectedPoiScore, allianceId, visObject.get_OwnerAllianceId(), nextAllianceScore, previousAllianceScore, currentTotalBonus, visObject.get_Level());
}
else {
var isGain = visObject.get_OwnerAllianceId() !== allianceId;
var projectedScore = allianceScore + (isGain ? selectedPoiScore : -selectedPoiScore);
var projectedRank = allianceRank;
if (isGain && nextAllianceScore > 0 && projectedScore >= nextAllianceScore && allianceRank > 1) {
    projectedRank = allianceRank - 1;
}
this.updateDisplay(gainOrLoss, poiType, currentTotalBonus, currentTotalBonus + (isGain ? gainOrLoss : -gainOrLoss), allianceRank, projectedRank, allianceScore, projectedScore, nextAllianceScore, previousAllianceScore, selectedPoiScore, visObject.get_Level());
}

this.container.setVisibility('visible');
}
else {
this.container.setVisibility('excluded');
if (this.poiProximityLabel) this.poiProximityLabel.removeAll();
if (this.ownedPoiListContainer) this.ownedPoiListContainer.removeAll();
}
},

/**
					 * @param {ClientLib.Base.EPOIType} poiType
					 * @param {Number} currentRank
					 * @param {Number} currentScore
					 * @param {Number} poiScore
					 * @param {Number} allianceId
					 * @param {Number} poiOwnerId
					 */
					fetchAndCalculateBonusWithRankingData: function(poiType, currentRank, currentScore, poiScore, allianceId, poiOwnerId, nextAllianceScore, previousAllianceScore, currentTotalBonus, poiLevel) {
var context = {
							poiType: poiType,
							currentRank: currentRank,
							currentScore: currentScore,
							poiScore: poiScore,
							allianceId: allianceId,
							poiOwnerId: poiOwnerId,
                            nextAllianceScore: nextAllianceScore,
                            previousAllianceScore: previousAllianceScore,
                            currentTotalBonus: currentTotalBonus
};

if (poiType in this.rankingBonusDataCache && this.rankingBonusDataCache[poiType].expire >= Date.now()) {
this.calculateBonus(context, this.rankingBonusDataCache[poiType].results);
}
else {
var lastMultiplierRank = Object.keys(ClientLib.Res.ResMain.GetInstance().GetGamedata().poibmbr).length;
var rankingPoiType = RealPOIBonus.PoiTypeToPoiRankingTypeMap[poiType];
var sortColumn = RealPOIBonus.PoiRankingTypeToSortColumnMap[rankingPoiType];

ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand('RankingGetData', {
								firstIndex: 0,
								lastIndex: lastMultiplierRank,
								view: ClientLib.Data.Ranking.EViewType.Alliance,
								rankingType: rankingPoiType,
								sortColumn: sortColumn,
								ascending: true
}, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.onRankingGetData), context);
}
},

/**
					 * @param {Object} context
					 * @param {Object} results
					 */
					onRankingGetData: function(context, results) {
if (results === null) {
return;
}

var allianceBonuses = results.a;

// Remove own alliance from list and add missing scores
for (var i = 0; i < allianceBonuses.length; i++) {
if (allianceBonuses[i].a === context.allianceId) {
								allianceBonuses.splice(i--, 1);
}
else if (allianceBonuses[i].pois === undefined) {
								allianceBonuses[i].pois = 0;
}
}

this.rankingBonusDataCache[context.poiType] = {
							expire: Date.now() + 600000,
							results: allianceBonuses
};

this.calculateBonus(context, allianceBonuses);
},

/**
					 * @param {Object} context
					 * @param {Array} allianceBonuses
					 */
					calculateBonus: function(context, allianceBonuses) {
var isGain = context.poiOwnerId !== context.allianceId;
var i;

if (isGain && context.poiOwnerId !== webfrontend.gui.widgets.AllianceLabel.ESpecialNoAllianceName) {
// Subtract POI score from current owner
for (i = 0; i < allianceBonuses.length; i++) {
if (allianceBonuses[i].a === context.poiOwnerId) {
// Array can be safely modified after cloning
									allianceBonuses = allianceBonuses.map(this.shallowClone);
									allianceBonuses[i].pois -= context.poiScore;

									allianceBonuses.sort(function(a, b) {
return b.pois - a.pois;
});
break;
}
}
}

var newAllianceScore = context.currentScore + (isGain ? context.poiScore : -context.poiScore);

for (i = 0; i < allianceBonuses.length; i++) {
if (allianceBonuses[i].pois <= newAllianceScore) {
break;
}
}

var currentTotalBonus = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(context.poiType, context.currentRank, context.currentScore, 1);
var newTotalBonus = ClientLib.Base.PointOfInterestTypes.GetTotalBonusByType(context.poiType, i + 1, newAllianceScore, 1);
var gainOrLoss = isGain
? newTotalBonus - currentTotalBonus
: currentTotalBonus - newTotalBonus;

this.updateDisplay(gainOrLoss, context.poiType, currentTotalBonus, newTotalBonus, context.currentRank, i + 1, context.currentScore, newAllianceScore, context.nextAllianceScore, context.previousAllianceScore, context.poiScore, context.poiLevel);
},

/**
					 * @param {Number} gainOrLoss
					 * @param {ClientLib.Base.EPOIType} poiType
					 * @returns {String}
					 */
					/**
                     * Compact, data-based detail string for the selected POI.
                     * Rank distances use the score thresholds supplied by the game.
                     */
                    getOptimisticPoiLevel: function(realisticLevel) {
                        var configuredMax = 46;
                        try {
                            configuredMax = Number(localStorage.getItem(this.archiveMaxPoiLevelKey) || 46);
                        } catch (e) {}
                        if (!isFinite(configuredMax) || configuredMax < 1) configuredMax = 46;
                        configuredMax = Math.max(1, Math.min(100, Math.floor(configuredMax)));
                        var baseLevel = Number(realisticLevel) || 1;
                        return Math.max(baseLevel, Math.min(baseLevel + 2, configuredMax));
                    },

                    updateDisplay: function(gainOrLoss, poiType, currentBonus, projectedBonus, currentRank, projectedRank, currentScore, projectedScore, nextScore, previousScore, poiScore, poiLevel) {
                        var number = function(value) {
                            return phe.cnc.gui.util.Numbers.formatNumbers(Math.round(value));
                        };
                        var unit = (poiType === ClientLib.Base.EPOIType.TiberiumBonus || poiType === ClientLib.Base.EPOIType.CrystalBonus || poiType === ClientLib.Base.EPOIType.PowerBonus) ? '/h' : '%';
                        var sign = this.currentActionLabel === 'Real loss' ? '−' : (gainOrLoss > 0 ? '+' : '');
                        this.titleLabel.setValue(this.currentActionLabel + ': ' + sign + number(gainOrLoss) + unit);
                        this.amountLabel.setValue(this.archiveText('allianceBonus') + ' ' + number(currentBonus) + unit + '  →  ' + number(projectedBonus) + unit);
                        this.rankLabel.setValue(this.archiveText('allianceRank') + ' ' + currentRank + '  →  ' + projectedRank);

                        if (nextScore > 0 && currentScore < nextScore) {
                            var gapUp = nextScore - currentScore;
                            var optimisticLevel = this.getOptimisticPoiLevel(poiLevel);
                            var optimisticPoiScore = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(optimisticLevel);
                            var realisticCount = poiScore > 0 ? Math.ceil(gapUp / poiScore) : 0;
                            var optimisticCount = optimisticPoiScore > 0 ? Math.ceil(gapUp / optimisticPoiScore) : 0;
                            this.upLabel.setTextColor('#00c853');
                            this.upLabel.setValue(this.archiveText('rankUp') + ' ' + number(gapUp) + ' ' + this.archiveText('points'));
                            this.upRealisticLabel.setTextColor('#00c853');
                            this.upRealisticLabel.setValue('  ' + this.archiveText('realistic') + ' ca. ' + realisticCount + ' ' + this.archiveText('poi') + ' (' + this.archiveText('level') + ' ' + poiLevel + ')');
                            this.upOptimisticLabel.setTextColor('#00c853');
                            this.upOptimisticLabel.setValue('  ' + this.archiveText('optimistic') + ' ca. ' + optimisticCount + ' ' + this.archiveText('poi') + ' (' + this.archiveText('level') + ' ' + optimisticLevel + ')');
                        } else {
                            this.upLabel.setTextColor('#00c853');
                            this.upLabel.setValue(this.archiveText('rankUp') + ' —');
                            this.upRealisticLabel.setValue('');
                            this.upOptimisticLabel.setValue('');
                        }
                        if (previousScore > 0 && currentScore > previousScore) {
                            var gapDown = currentScore - previousScore;
                            var optimisticLevelDown = this.getOptimisticPoiLevel(poiLevel);
                            var optimisticPoiScoreDown = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(optimisticLevelDown);
                            var realisticLossCount = poiScore > 0 ? Math.ceil(gapDown / poiScore) : 0;
                            var optimisticLossCount = optimisticPoiScoreDown > 0 ? Math.ceil(gapDown / optimisticPoiScoreDown) : 0;
                            this.downLabel.setTextColor('#f44336');
                            this.downLabel.setValue(this.archiveText('rankDown') + ' ' + number(gapDown) + ' ' + this.archiveText('points'));
                            this.downRealisticLabel.setTextColor('#f44336');
                            this.downRealisticLabel.setValue('  ' + this.archiveText('realistic') + ' ca. ' + realisticLossCount + ' ' + this.archiveText('poi') + ' (' + this.archiveText('level') + ' ' + poiLevel + ')');
                            this.downOptimisticLabel.setTextColor('#f44336');
                            this.downOptimisticLabel.setValue('  ' + this.archiveText('optimistic') + ' ca. ' + optimisticLossCount + ' ' + this.archiveText('poi') + ' (' + this.archiveText('level') + ' ' + optimisticLevelDown + ')');
                        } else {
                            this.downLabel.setTextColor('#f44336');
                            this.downLabel.setValue(this.archiveText('rankDown') + ' —');
                            this.downRealisticLabel.setValue('');
                            this.downOptimisticLabel.setValue('');
                        }
                        if (projectedRank < currentRank) {
                            this.statusLabel.setTextColor('#00c853');
                            this.statusLabel.setValue(this.archiveText('gainPossible'));
                        } else if (projectedRank > currentRank) {
                            this.statusLabel.setTextColor('#f44336');
                            this.statusLabel.setValue(this.archiveText('lossPossible'));
                        } else {
                            this.statusLabel.setTextColor('text-region-tooltip');
                            this.statusLabel.setValue(this.archiveText('unchanged'));
                        }
                    },

                    hideIntelligenceReport: function(root) {
                        // Exclude the report heading and body from the Qooxdoo
                        // layout so they no longer reserve vertical space.
                        var normalize = function(value) {
                            return (value || '').replace(/<[^>]*>/g, ' ')
                                .replace(/&nbsp;/g, ' ')
                                .replace(/\s+/g, ' ').trim();
                        };

                        try {
                            var widgets = root && typeof root.getChildren === 'function'
                                ? root.getChildren()
                                : [];
                            var headingWidget = null;
                            var bodyWidget = null;

                            for (var i = 0; i < widgets.length; i++) {
                                var widget = widgets[i];
                                if (!widget || typeof widget.getValue !== 'function') continue;

                                var value = normalize(widget.getValue());
                                if (value === 'Aufklärungsbericht') {
                                    headingWidget = widget;
                                } else if (value.indexOf('Herkunft:') === 0) {
                                    bodyWidget = widget;
                                }
                            }

                            if (headingWidget && typeof headingWidget.setVisibility === 'function') {
                                headingWidget.setVisibility('excluded');
                            }
                            if (bodyWidget && typeof bodyWidget.setVisibility === 'function') {
                                bodyWidget.setVisibility('excluded');
                            }

                            // Keep the DOM fallback for client variants where the
                            // report is rendered outside the Qooxdoo widget tree.
                            var regions = document.querySelectorAll('div.qx-pane-tooltip-region');
                            var hidden = !!(headingWidget && bodyWidget);

                            for (var r = 0; r < regions.length; r++) {
                                var children = regions[r].children;
                                for (var j = 0; j < children.length; j++) {
                                    var heading = children[j];
                                    if (normalize(heading.innerText || heading.textContent) !== 'Aufklärungsbericht') {
                                        continue;
                                    }

                                    var body = heading.nextElementSibling;
                                    if (body && normalize(body.innerText || body.textContent).indexOf('Herkunft:') === 0) {
                                        heading.style.setProperty('display', 'none', 'important');
                                        body.style.setProperty('display', 'none', 'important');
                                        hidden = true;
                                    }
                                    break;
                                }
                            }

                            console.log('[RealPOIBonus HE] POI-Beschreibung ' +
                                (hidden ? 'aus dem Layout entfernt.' : 'nicht gefunden.'));
                        } catch (e) {
                            console.warn('[RealPOIBonus HE] POI-Beschreibung konnte nicht entfernt werden:', e);
                        }
                    },

					formatGainOrLoss: function(gainOrLoss, poiType) {
switch (poiType) {
case ClientLib.Base.EPOIType.TiberiumBonus:
case ClientLib.Base.EPOIType.CrystalBonus:
case ClientLib.Base.EPOIType.PowerBonus:
return phe.cnc.gui.util.Numbers.formatNumbers(gainOrLoss) + '/h';
case ClientLib.Base.EPOIType.InfanteryBonus:
case ClientLib.Base.EPOIType.VehicleBonus:
case ClientLib.Base.EPOIType.AirBonus:
case ClientLib.Base.EPOIType.DefenseBonus:
return phe.cnc.gui.util.Numbers.formatNumbers(gainOrLoss) + '%';
};
},

/**
					 * @param {Object} object
					 * @returns {Object}
					 */
					shallowClone: function(object) {
var clone = new object.constructor;

for (var key in object) {
if (object.hasOwnProperty(key)) {
								clone[key] = object[key];
}
}

return clone;
}
}
});
}

function waitForGame() {
try {
if (typeof qx !== 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone) {
					createRealPOIBonus();
RealPOIBonus.getInstance().initialize();
}
else {
					setTimeout(waitForGame, 1000);
}
}
catch (e) {
				console.error('[RealPOIBonus HE] Initialisierung fehlgeschlagen:', e && e.stack ? e.stack : e);
}
}

		setTimeout(waitForGame, 1000);
};

// Run directly in the page context (Tampermonkey @sandbox raw).
	// This avoids injecting an inline <script> element, which may be blocked by CSP.
	main();
})();
