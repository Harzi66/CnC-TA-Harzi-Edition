// ==UserScript==
// @name           CnC-TA Lister UI - HE
// @namespace      https://github.com/Harzi66/CnC-TA-Lister-UI-Harzi-Edition
// @version        1.32.0-dev4
// @description    Erweiterte Version des CnC-TA Lister UI
// @description    Original by ffi82, further developed by Harzi66.
// @author         ffi82
// @contributor    leo7044 (https://github.com/leo7044), 4o (ChatGPT)
// @Harzi-Edition: Weiterentwicklung ab Version 1.1.0
// @contributor    Harzi66
// @contributor    Spezial Thanks for testing @zillen4K & @nExt_mAnDo
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL      https://raw.githubusercontent.com/Harzi66/CnC-TA-Lister-UI-Harzi-Edition/main/CnC-TA%20Lister%20UI%20-%20Harzi%20Edition.user.js
// @downloadURL    https://raw.githubusercontent.com/Harzi66/CnC-TA-Lister-UI-Harzi-Edition/main/CnC-TA%20Lister%20UI%20-%20Harzi%20Edition.user.js
// @icon           https://raw.githubusercontent.com/Harzi66/CnC-TA-Lister-UI-Harzi-Edition/main/Lister-Icon.png
// @grant          none
// ==/UserScript==

// Changelog Harzi Edition
//
//  1.32.0
// - Neu
// - Settings-System überarbeitet: Zentrale Speicherung der Spaltenauswahl,
//   zuverlässige Wiederherstellung nach Neustarts, automatische Rückkehr zur
//   Standardansicht und Bereinigung des alten Settings-Systems.//  1.32.0
//  1.32.0-dev2
// - Neu
//   Verschieben von Spalten im Hauptfenster wird dauerhaft gespeichert
//  1.32.0-dev2
// - Neu
//   Neu hinzugenommene Spalten werden im Hauptfenster auch nach sofortiger
//   Verschiebung dauerhaft gespeichert
//  1.32.0-dev3
// - Neu
//   Kleinere Fehler bereinigt
//   Optische Anpassungen im Reiter "Aliance Cities"
//  1.32.0-dev4
// - Neu
//   Umstellung der Anzeige der Reiehnfolge auf 3 Spalten

/* global qx, ClientLib, webfrontend, Lister */
'use strict';
(() => {
    const ListerUIScript = async () => {
        const scriptName = 'CnC-TA Lister UI';
        try {if (typeof qx === 'undefined' || typeof qx.core.Init.getApplication !== 'function' || !qx?.core?.Init?.getApplication()?.initDone || typeof ClientLib === 'undefined' || !ClientLib?.Data?.MainData?.GetInstance()?.get_EndGame()?.GetCenter()) return setTimeout(ListerUIScript, 1000)}
        catch (e) {console.error(`%c${scriptName} error`, 'background: black; color: pink; font-weight:bold; padding: 3px; border: 1px solid black; border-radius: 5px;', e)}

        window.harzi = {

            version: "1.32.0-dev4",

            core: {
                settings: {},
                helpers: {}
            },

            ui: {},

            features: {}

        };
        window.harzi.core.helpers.deepMerge = function(defaults, saved) {

            const result = {};
            saved = saved || {};

            const keys = new Set([
                ...Object.keys(defaults || {}),
                ...Object.keys(saved || {})
            ]);

            for (const key of keys) {

                if (
                    key in defaults &&
                    key in saved &&
                    typeof defaults[key] === "object" &&
                    defaults[key] !== null &&
                    !Array.isArray(defaults[key]) &&
                    typeof saved[key] === "object" &&
                    saved[key] !== null &&
                    !Array.isArray(saved[key])
                ) {

                    result[key] =
                        window.harzi.core.helpers.deepMerge(
                        defaults[key],
                        saved[key]
                    );

                } else if (key in saved) {

                    result[key] = saved[key];

                } else {

                    result[key] = defaults[key];

                }

            }

            return result;

        };
        window.harzi.core.settings = {

            defaults: {

                display: {
                    allianceCities: true,
                    poi: true
                },

                tables: {
                    allianceCities: {
                        initialView: [
                            "player",
                            "Name",
                            "coordinates",
                            "player_ranking",
                            "tiberium_per_hour",
                            "crystal_per_hour",
                            "power_per_hour",
                            "credit_per_hour",
                            "base_off",
                            "base_def"
                        ]
                    }
                },

                export: {},

                profiles: {
                    startAction: "Original"
                },

                future: {}

            },
            key: "HarziEdition.Settings",
            version: "1.0.1",

            data: {

                display: {},

                tables: {
                    allianceCities: {}
                },

                export: {},

                profiles: {
                    startAction: "Original"
                },

                future: {}

            },

            load() {

                const saved = localStorage.getItem(this.key);

                if (saved) {
                    this.data = window.harzi.core.helpers.deepMerge(
                        this.defaults,
                        JSON.parse(saved)
                    );
                }

                this.save();
                return this.data;
            },

            save() {
                localStorage.setItem(
                    this.key,
                    JSON.stringify(this.data)
                );
            }

        };
        window.harzi.core.settings.load();
        window.Lister = { // Exposing Lister globally
            db: null,
            async init(dbName = "Lister") {
                if (this.db) return;
                const request = indexedDB.open(dbName, 1);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("storage")) {db.createObjectStore("storage")}
                }
                return new Promise((resolve, reject) => {
                    request.onsuccess = (event) => {
                        this.db = event.target.result;
                        resolve();
                    };
                    request.onerror = (event) => reject(`Error initializing database: ${event.target.error}`);
                });
            },
            async performTransaction(operation, key, value = null) {
                await this.init();
                return new Promise((resolve, reject) => {
                    const transaction = this.db.transaction(["storage"], operation === "get" ? "readonly" : "readwrite");
                    const store = transaction.objectStore("storage");
                    let request;
                    transaction.onerror = (event) => reject(`Transaction failed: ${event.target.error}`);
                    //transaction.oncomplete = () => console.log(`Transaction completed: ${operation} on ${key}`);
                    switch (operation) {
                        case "get":
                            request = store.get(key);
                            request.onsuccess = () => resolve(request.result || null);
                            break;
                        case "set":
                            request = store.put(value, key);
                            request.onsuccess = () => resolve(true);
                            break;
                        case "remove":
                            request = store.delete(key);
                            request.onsuccess = () => resolve(true);
                            break;
                        case "clear":
                            request = store.clear();
                            request.onsuccess = () => resolve(true);
                            break;
                        default:
                            reject(`Unsupported operation: ${operation}`);
                    }
                    request.onerror = (event) => reject(`Request failed: ${event.target.error}`);
                });
            },
            get(key) {return this.performTransaction("get", key)},
            set(key, value) {return this.performTransaction("set", key, value)},
            remove(key) {return this.performTransaction("remove", key)},
            clear() {return this.performTransaction("clear")},
        }
        const qxApp = qx.core.Init.getApplication();
        console.group("openCityProfile");
        const cfg = ClientLib.Config.Main.GetInstance();
        const communicationManager = ClientLib.Net.CommunicationManager.GetInstance();
        const region = ClientLib.Vis.VisMain.GetInstance().get_Region();
        const mainData = ClientLib.Data.MainData.GetInstance();
        const wid = mainData.get_Server().get_WorldId();
        const defaultPoint = mainData.get_EndGame().GetCenter();
        const PollFunction = getPollFunction();
        const [centerX, centerY] = [defaultPoint.get_X() + defaultPoint.get_SizeX() / 2, defaultPoint.get_Y() + defaultPoint.get_SizeY() / 2];
        const sectorNames = ['south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'east', 'southeast'];
        const clockPositions = Array(12).fill().map((_, i) => `${i || 12} o'clock`);
        const AllianceCitiesTemplate = {
            Server_Name: null,
            Alliance_Name: null,
            Alliance_Id: null,
            Player_Name: null,
            Player_Id: null,
            Player_Faction: null,
            Player_Ranking: null,
            Player_Score: null,
            Player_Bases_Count: null,
            Player_Distance_to_Center: null,
            Player_has_Code: null,
            Player_versus_Bases: null,
            Player_versus_Environment: null,
            Player_versus_Player: null,
            Player_is_Inactive: null,
            Player_Endgame_Won_Count: null,
            Player_Challange_Won_Count: null,
            Player_Other_Won_Count: null,
            Endgame_Won_Server_Name: null,
            Endgame_Won_Rank: null,
            Endgame_Won_Alliance: null,
            Endgame_Won_Timestamp: null,
            Endgame_Won_Member_Role: null,
            Base_Name: null,
            Base_Id: null,
            Base_Score: null,
            Base_Coords: null,
            Base_Sector: null,
            Base_Distance_from_Center: null,
            Base_Found_Step: null,
            Base_is_Ghost: null,
            Base_Tiberium_per_Hour: null,
            Base_Crystal_per_Hour: null,
            Base_Power_per_Hour: null,
            Base_Credit_per_Hour: null,
            Base_Base_Level: null,
            Base_Defense_Level: null,
            Base_Offense_Level: null,
            Base_Construction_Yard_Level: null,
            Base_Command_Center_Level: null,
            Base_Defense_HQ_Level: null,
            Base_Defense_Facility_Level: null,
            Base_Support_Name: null,
            Base_Support_Level: null,
            Base_IsOnControlHub: null,
            Base_MoveCooldownTimespan: null,
            processedTimestamp: null
        };
        const poiTemplate = {
            Holders: null,
            Level: null,
            Name: null,
            Coords: null,
            Alliance: null,
            Score: null,
            Type: null,
            Sector: null,
            Distance: null
        };
        const Icons = {
            Refresh: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAaBJREFUOE+l0j1ok1EUxvHf25amiUJKvzeXUmhxUOiqmw6CrgFxdfNjE1fBwUVFcVM3HbSTkyI6qDiJFCnFWgVxsKXV1BjTpE3e3FdaqSb2I4IXLhcu5zyc53+eyH+eaJv+6PLHEN4XEwuVxHKNxwc6tqzd9Hlhppq8nF81nY99LuwiH1OpEdeNTl059PbBxSe9974n+Vx2vbdJ4NRkObmxP3MMs0g7/mxSHH6V9Y4SYkKVUOH22CaBHixtYWlM7tG09nYG9iIQxVzds3mCHXiOOP38nUyKwRE6Es70tCHZDmKz1vkXicE+0im6Ohno50jqnwX6cBCVhruKN40TRMOzcSjNxxYXY2Emz5dvXN83iMWdorJhIco8DaE8VWSuylKRW8NDWGiVs98Crq0EcwmlH1QKVIvcGW/J6E/BuXyiFFNbob5CeY56jYnDW4l0o9AcpJMfEjeHM068KqsvE2p0drH6lSihVqaS5+HZHO5vWGtUb0cdbY7era+nLZ0lO8TuftLdXBoax+tGLjt5zGAN5Npbwqe1tf0NtSWkVlv4CYSGmRHjxxGoAAAAAElFTkSuQmCC',
            Download: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAWNJREFUOE+lk8Erg3EYxz+blKImGeGqdvNHUC6OFGo5KIc5zVFaIrbDUo4sl+XgJBzHCSlSUlxMLdTMLG3v3u3du3d730fiIl68ea6/5/d5nt/3+/25+Ge5frofvBDZjOZ52Wqz7bM9mLsTqRahuwK5FETGXd/22gLm0yK6+g54SkJk1CFgIfsBqMLjFUTGHAIWcyJ6Aboq8HAJ0QmHgPlHEV0BrwqZJKz4/wgIF0XCk88EVzuoadCah8Y+CPszWKpGYb/3k25fRAwrIoYBdR3eNvD0QOoEdmNptMNTqsrIz4C3XISyIoYK5QJUFNhZz1E6OMbID38ZaGtj8FpEy8N2TEHZTVBXR53lwDsrMtQP8cE1RAJ/T2J7wJTCRhzLzCCSBopAC263D9Oc+f0JU+citTLoJTDKcJTQwLKwSmWWljuZ9n2203Y1z8CNNHi9uJuboF6jenuPdraHaYZ+d8HJD38FkCelEdQP/XcAAAAASUVORK5CYII=',
            ClearCache: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAYZJREFUOE+1k0FrE0EUx38zm5g22WAa0zY0uB9ACOLFi+lVqqHgQXop1kMp8ahfQA1CIz0YNGIPFcSvUJAam+zBQ2svaQrSox6EklAQPQjBbPbJLqgsaUyg+JjDm5n3/zHvPzzFKUOdUs8/AZe/fBUtLh+s1MC6wYCj78LMWf/+wreOHCbGTqwNHGbrOzJ26aLfVafrcMbQaK356eXhEC6QcoVqyvyjC1I/fpbEZBINKBRhEVztZd4eHAHLUDRS8QEAYL7cEZSH8EL89dsphbB5N9hKX1+31kXMCJz7dJ+j80Ve7+1SX+ry5CDHVNTg5YoKaPoAiy9E4hHkYb6tStVpKltvsO+YrO7nyEQNXhWGABaei0yMQzHfxgfUatjL4dEBNyuOJKMGxestHr9LU3m7hV2I8qhxBSsWGv6CG08dSccNHlxrsbad5pn9ntptl1JzFsscwYO5ck8ypsbpwWQMjn9AdhqaLRgPwcYwE73Pu1p25K+7glIaEaF6L9Rn+v8dplEm9Rcp/HsRO0tPngAAAABJRU5ErkJggg==',
            Power: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAAzdJREFUOE+VlFtvVFUYht+19tqzp51DO6XgNM7YmQotVAoxMZomSkCbmFZAsFITDWiNgVgi4eSNN265MPbCSNCQFIoXNdFmkNYTSEKglYQCoaSN0ZY0pZhyGDul7DJ2Zp/XMvvCRO2AuH7Ak+d7v/V+BP/jqULQ2hEwhCEZMqh/BvbIUTiqSjh5UE4qJSRjFfxmPhe0wUqlRfJ6mqFduovZHUuI+UAgtU+wshiKmWRWkAirv3Z1Yt/EpSsPN2xueiuvSd27YzD+E9QnBBudRMjH7ITjl1ZphvZRx7uf+fceeS9L0+KZDPGNqUlyf1DHoJDtKMLUtRMkRDYOXxjaPnr6cmlpMioat6xvp7N2ZySuXG8hxLqnkQcpiiHyh+lUkwBfO3RucOfEwC9KtLwcJcviU3W1K3dQwS9A86e3PUHseSAhBDkKyLnfUGYwZykW0DcHevo3mjduB5ufr0d7x9dobX97kOXkA9RxBsCU9LYK6PNAXiZjaZSCO3V2kLed7jqxzm84yq7WtfhpaBzfnzyHZQ2PI1ZbaQbkwO6IFfzyjQSy/wB5Nl9MoVjXrbiIyp8c2/9VQzxYwlpeXINAwA9dNzGjZZH69gyu/z6Nl/e8uv8hlH9QEHRwBAEe1Bt/7PkhpV2bworaxXjk0UrUVFfBdl1c7DuPscy0tW7XK+clzX1f5Nnw1qoCRocuo8iJ2tV37dmDruBJKpGy4wd6fdvbNuNY93cwZYLntrzQ67OLOhXD+rnEKsq0PFZga962aBxlrmEs52HW1N9zqq2YM//MrQyUWMRYvaHhG6bTTuKwEZ+A1pokhteOeWF7VdCqEOQLneVzLLfvZEfvs0bexJPNT2Px0iVdNEsPMZeNl+jQPJO/KjYP5BUzeRORfMBtGh3+9fDZ7lNKffPq2bqnVn4u3REpWMbViBPK/h1S0MgbjS3KLzQW+D79eOuHL7Xsfe1mIlF5RLrLu4lkTN0YD2fVNcT5d9kL/qNbkwhdmZ58J5+ba6xZUXOYzjlnXUuZTk8iVwhS0EhVBa18HT6LQ+GBOUW2ueNKYSNdAUMlhN/r7BTsmpcT+kErQiCRCfBNm8AJIeJ+t+tPo7JxHFEeK5MAAAAASUVORK5CYII=',
            Credit: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA2pJREFUOE+tlG9sU1UYxp9z723v7d1Gt9La4pCOtS4hBkHd0EZxjKIyZSRD5wfMIGQYcMliyKISHWYNIUr8gExJ3NBkcUjMBqMDgkFEcGMfdOoyMsJYGWPD0bAV7rb+ub29/8wlqUE698nz9bznd573yfs+BP/TIfNxdF0ngYug3WvApOsKAGUNoBJC9Affzglq1HXKdh0mxgyeaEmrBjWXsrA2StamUnHlLmXjZ2sdSBBCtDQsA2RAFoXBKRIWUIy8hPC0L8Vq/htXR5c+/sTSEWZaa01JGIpr5vCzhYiXEaIYsAxQU0hnVVPCxvHM6nti7PXB34eW93ReKrIwNM1Ys2K+8pJQie+p44goXbJuHq/zImYoywA1j9yzqmz2sllabNhfe6Cc0kDZ83LwbaAGFbuakJRkvFztH/f7n2+iRDVY9Bg7Zqj6F8gw9/OxhIujmbVdwbP7Q79dy29trIHbmXffipSsoLN7AAc7zssNX793Vr8jNlqW8Fe2EZLMAH05hgLwybdbPjtSW+RycHtrKtj6g+1aWJiV1z7pZSv9xdj8YTO27Nk8sDjX1TATp3t2e8jMvCCP087Vb61gPz5wVBsP3yUz01FizeERTaXkD5rf7bfEmU+UeKq3zpsdmRNE0/JLwRM/BIb7hl176qvhyM0Gx7H32xsavY1D3wRRWOyZ2Phm+aeaKHU5ei23/xN09Ejnvuv9I3a3Ox+TdyIwmRgsdi3Ezu2bcOJUN85d+lMOHH5/H5lW2+y/smOZoFtYRExSZdvhYwFZkBbuqHsLfd19EGUFWRYWTz+3EsHjP+Ly4LD00Re79qYE5bv8Pu7WHHMUdZg5U8n5cz1NP3X1eta/VopVpav+2YbQ4DC+bzuJsqrVN/2vvNCoCNKZDI+M6kOTerYyGyvQrHT1hdO9b/T/MvBofDrGrSt/EWdO/qw77Lmqd4UnXLl9Q4c6JbVas7JuVDuRyFDU3q7TEyXIseiyGxx8sDGvfrW7Zd3N0TD7TOmKyKZ3Nl6m4topLYluVTRNLP8LQlnZQwNpKDKGsuUPMMgTeBm8k+EZr2pWlk1NCd5HnPaQHlUHVWCEldkIBCR2FBN5zl1Lm2Eogw/myViUJwsYniiUidZVUVD5RGEhxCpAfjBK5s2jtMIOgEp/UAVoD2eRcfc36WeHHqkkmHYAAAAASUVORK5CYII=',
            Tiberium: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA6hJREFUOE+tlFtMXFUYhdc++1zmcmCG+zAQGS5DDSXEVIwVY2xNtJqYlvQy+kBqkyYa++AjsVUjPkiMRqM11tTEmhptBR60GjHVkrSgTWk1tmmLIEUqIJcZGGDu58zZ5zdQxKImvLhf915fVva/1s/wPx22HoeI2CsAqwOW3w4A1MaY/U/dGtCKiOMm5FINkjUPSfdAEwyutG1oskkmV81Ebiw3EdrIzNthf4OIWOcAlLQHOWQbXkvVnJaZdUhgBaRQ0M6X9kpx6kGavrANY3SmWo+2MWb9BVsFtRFJ5RPwcjlbnckR7WPzQ0W1nvrLQqaK0YW+u/rmvvT6Ew3JBze0HKc4jpFTGTpQhCRjjJZgq6DDw6S5uREgr/LUheg3B3+mbuwqfBE9E8cRqqpBpwhj7GwvdtcdRKWn/ulsgn9VdAmRUIiJNaAPByM5wu3dlNZT7d8nX2py5jXAiLtw7YeLkPQF1JTV4sLNfgSmyrEv9M4JsWC/ZZnx4b6a/GQXY+KWIyJ2bDpRCO586LfMr29/HuvwsUgMizcWkOtxIuyIwRweB8UyaKx+GDt3HBpkGfqMm64TLgWTe0uQWgYd/ZEUyjMCXFeaz1/peL2j+wNodwdgh+Pg0TlksgnIleWg2TC23/cY4nIKwardZlCt30cwe2ZK9Fm29MnFY/Co3NrE8/iB/l++e/zTw8+rUqAc8P0BazEJ0S/gqfehJBDEC0+04JIYwcB1W2yv2/+qlpE/6u7DODtKpPDRjN8ulp/9aaSj9fT5kyw6bsBxRxR8GwOldCQ7BaxJE+6mIKr8BWjaeCc6Tp3Gyy1dR7SU8obbh3HWdp3UMrdZHVXn2l97s7lZ6IWQ8nX4ixVUbQ3i2vwE5t6/AtvlhVyqQoRnkV+Qi3sqd4ltW/a30qJ5cqrCNbPsyBoxKqLy5Lsfv3fo0UkpCsmvQe6dgbvcjcxWF4yvJ5CejcJ5bwCbdzyJRwr3hHXLc4QLdmo+oYy0bkCCdRLxxdFkoe10NJqu7HO9Zz9p8tfWJ4pyS42rg2cqhq5eBIUN5FT78MD9e8YDxQ3nWEb6loS4nGXqpDKN2DONLMuWRt8JOBZvpAuEW/bJTKrMGkLlKnMRY2W2zjZzCykQpuyY6OGM/W5J1rTEnfNnSmEsZWg1kEtl7QKU+BC0NMVVTZNk05ZUrkkOIqYpACymGsJKxpFyJyJhZNq2QGClHmuS/a91csupVLRSowhAIcC+Xfzf7V9vMa1z/yem2KPLWChEcAAAAABJRU5ErkJggg==',
            Crystal: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAAAXNSR0IArs4c6QAAA5FJREFUOE+tlG1oW2UUx//PfZ57b15uetsm6ctWm1JRSalTaEGZUgbTgmLdHFql2DkVJo5NxlAUJy5DRMHh1LFBqygT/DD9sA8OxE5pNwVh00ynri5N1y5ZUpJ0Se7N6829uY/El+IQVj94vh7Oj3P4//+H4H8qshqHcy5M/gDa0g5WssB7FmGd2gA7RIj9z9lrQJxzMgPQzBWIhRKY1QYBetklUZdiEdNLGTivifFqAfqOPpQIIfxv2DWgie+5KKporjmMZpHRLoHDIgJpMQR+a8rM7rbKVf0GZe0uGOasGnAkRgmp/QsUCnGhcxwe6jB70SS8ejoS2zzUHzhXLpR5olINhiM5p3Y5hbFNt806LedupcrOzn0ELRT688SVjaY5Z5ElrGGK/Uh4KXZgPtsElksj91sUm4fX4/OZPJYyCXT7F/Do+NhBQa8fKXfJ8V1ArXHiCujtOHc28dqNopc9fyKceKJN9uC7s0lw7RIiP+oIdMuAs4jc5Z/x4sHQt1Je3O+wzZ9MTck/MwBrBTQxz1XZbQ0uGOmvJvdOQSsSWFc1dAYZ0lddgJUERwX963vw2FNbdGoKU6qovmHqmN/eC52AczIBMCtZ6ZCZtGEhNffWm4+/0k5dgxBoHbJfQ0VPgEgDkDvqGN86goq3ikyMWw/c3f8CLPHYkg8p0pD8w2Uo3DKDgirsubi8/ODhnfucVkqCY9NdoIFmaJOfwdXqBhd6sP+lMWSdCo4dn+J7nht5h+WsQ2rAESOfck61BfjEVnvLyfnZ92Y++Zpp0TIcGwPwjdyPQpZj+d2jqP96DmLPMKhs4N6td+L01Cm8Hnr6sFwWD7g7ECcNtaIJdBSdpdfe/+DjbXNfxCG2BOFpzWDdQ/fhl6QDuW+Ow74SBfUGQFQVXWs13DF4e3po6J6XYdATiTZkSMOEkhfeqs/Ye34xtvPoviMA8UHtVpENfwlXcCNKixEI9SzENevw8LNPYqDPe4YVcUiw+RlTkpM7/CiREOdC5yV4JDe6bdkejqbj47LLzXv93kxc03tnw+e7DC3DZX975Zabb7ro9/imxYp90jJZjDmR9kyjPDpK6n+oNg3QxTyUWgVNxDZbJULcNoXMJOIwynDZqBNS4wZ10wxFPS1W5Wwxg+L2hn/+ytuKjxqb9V0AQxNoVYSQL4AyCZSYRdGtKKjYsJkIo+RDLQuY103/ai/lev1V/9F/hf8O1jSTcwWrPEMAAAAASUVORK5CYII=',
            Production: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAZJJREFUOE9jZKAQMFKon4E2BphnT+gS5ONNZ2ZmBjvw79+/DB8+f2s9MSW3C93FWF1gnjVhVntBVKqmrDBY/aX7Lxnqp69pOzE5r5poA5pywlLVZMXB6s/dfMTQvXAzaQZUZEekykhAXHDz0QuGKfPWEzbANLPvvZ6KHD8zCzODspwU4+Pnbxn8fe0Y7j98zjBr6ebqM9OL2vB6walo2qd5jam8jIyQoJmy+iCDoa0xw7uXbxnWrNn59OfvX89//vr97tysUneYQSiBaFcw5VN9SQIvSJKLnZVh9caDDCoWRgwfP39j0GRnYNBVkWJIrJvx+dCEHD6sBlhkT/iUUwAxAOSI4/tOMciY6DO8fvuRQenfNwYFNQWG5p4Fn09MLcBugFlW38fAlGi45PWDJxjkLU0YPr95x8DO8I9BQVGaYf7URZ9OTSvix+oC4/TuT1qWZmAXgMDHB48Y+GSkGP7+/s3AwsLCwC3Ay3B6z6HPZ2eWYneBekzjmj9//ojgyx8sLCxvbi6pD8HqAnIyFsWZCQAHS5MRrpL/9AAAAABJRU5ErkJggg==',
            Lister: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADEElEQVR42iXO3W7bVADA8f85dmwnsRPaZtmapV8ZoK4gUdapAiZWlYKGkNhTDB6Ii94gnqTbkOCCizI2QNPoRpq2S7I5SVvn247tc7jg9wQ/Aejvvn/A3Z0dms3XdC7PCYIApVIwFWmqGPenJHGCnbHwXI/SlRK/Hz7h54ePEN/c/1avvrvCT/s/EoURxfkiX+3tEgQDOr0O0zBke2uLfn/AwcPHRNOIjG2xu7fHaDhCbm5tsf/DPlpCJm+xtLRMfzBkOB5x984d7u1+iRQG7Tc+brGAlXdQaB4dHLC+cRPz7PQUlEJKk0Sn1NvHdC/OkQVF8+Urcq7F4IVCjCyGkxGmIzBVhkkwodlsIcNJSKYsWVh3qN4qYJXBH7UZpRHV3Doi8hhMJnT7PZwFgxs7y6zsVhBZUEphZnMOyaVi8YsiylAMfcFSZZFyqYy+MCjqKwjXIi1AU9e5+fUS/dGQxpPXODkbU5gCHUG/MyUiIS/eYbVaonfeRVgpC/kK82vLGE4GNzHw+/8yDQBLo9FIADLQa40JOjOcvOD9T+aYq1jU3quxvfs5+mqGx89+pZCWaB7E1A+6RK0ZWmlkqlIwYTicEU0VOdeg43cZDSaY5HhW/5Nj/wgxl3KeBszaFkF9hlYCw5TIWTz7P5ET5PImliVIohSJpNU6wRyniFnM5kc1agtLjK0umawAoRECZBIngMB2BbYEb94CQ+F6DomYcPy8QSm8SvRCcPjbIdfsKvliFgRYtomZJDGYAgxFGqb88csJSE0SgUo1cRLz8p860jKYuzWjcXzBvLWIYU8YjIaYSZyAUlS9GjMds/HpBp6Xp9vrUPA8klTh5nO0em26Y59r24ucvnpD2kwwpYFp2za5govf6FEtV+hc+IynWepnDUqlItcrZVpve7ztXqBSCInwL32svIVj2oi1G2t67YMaT/96ynA8JhUKIaBQsCldz2J7krPnAeFUoxEk0xjPddn88GPa9SYC0KtrK9z+7DZxnBCrmEQnRFFEFIagBU7WQkgJWiCVwDRMjv4+4qRxyn9WVXpUWkBUhAAAAABJRU5ErkJggg==',
            TheForgotten: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACoUExURQAAAAsNBxEWCR0dEwAAAAIFAQUIAwYJAwUFAwICAQMGARAWCAUIAgkLBQIDAhkaEQUFAwAAAAMEAT6lAEGtAAgLBQ0fA0OyACssIcbEh4GAWXR2UhocFDaJBBxGBEJEMNDOjSRbAxUyBEa7AI6OYpiXZqalc1jqABASCy51A2tvTWZmSVBWN1fmAE/QADExLDmWAFXhANvalFPcALe5hOXkq7KyeUB5HgcpoUYAAAARdFJOUwAzqycT9AqM7XtmT6HHtdXVuJdJNwAAAT9JREFUKM+1ktlywjAMRSEhJGGXwGlsZ9/IVkLD0v//s8oztGnK9JHzpPGZO5ZlTSavZ2Zq0//cwioTXM2ezucL096w+HT0Hcs27XHeZp0Hn0ciRey83Uia3U2C/06c0LsJaz6Sbl+D/0GQ7IU1Smpu30BwulwuPni9/J3UtxhGEsDxDwGAG2W4W/48wfBEFEWZCwRreBQVIawe0go5l27NufCgvfPcDa9csIfcuFlHGU/wa8EpRHHZfPekWwBJpW4rri2CU8UIaA8jqNI09R2Qd4T4kKbnZOjXdN4UAciC4V6VlTEb5EERQE3yrMqR3CtI5iRVGQ9yiYm/PwcITc6oH3JsPcxoYWDCAMIsFzSJxBn/6lyjSJ3LNsvrEtd/92EJbRYislaU2vOSbMvSsKcaMqY/S329UqdTc/nqPf4CuKojdch7y7kAAAAASUVORK5CYII=',
            GDI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADtUExURQAAABoaGC8rHCgmHgcHBg8PDR4dFgoLCwsKCAoJBggIBi0vMCQnKCooHyIhGwcICC8xMhwdHgEBAQAAAAgHBQ0NDJ+NRaKRRxwaERUUEZCAP72oU3N5e6qXSiUmI5iHQigjEZKZm1hcXnyCg0M6HdnBX7CdTbW+wtO9X3ptNk9TVKiwtK63u+nWaSkrLUpNT8vU2KKorMawVtvj52ddN1lQKuPMY5ugoYd4O822WENDQLikUHJkMFJIJWNXKjMsFGZqbLvDx3ZuToeNkLWiTjc5OEdBJjo2Kefbb+7idbzFyqeaY7/Izbm7r3hsPJb6nMEAAAATdFJOUwBBVmn5AxDw27/pf9Aeq5yaLXYxpceLAAABe0lEQVQoz7WS2XKCQBREjaICGhNz78AMA8gq4G7Afc2qZvn/3wlWxaiVsiov6ddTPdPVtzOZP6ggi/mLMEsT+SK9xq13geZyGcHfWeKdJEmVwjmrUlKRBu22hX1Xn6J8fZaGhCsEPhyybtyLAwdzp1SOdhEu26HPXuKPh9gmR3pVyBK1zakV+iE13V7QG2H1m91RFNFLbQtqTHwGtB/0GvLBaM4iC1dKONReZ3xCAUdBixxCSa/bobKg1vieG8ZswoA0Hxo3P9WZA+7zeVI3DEOtcxOcN108JMrLm9WSP9cVNVX9/hE6gV78ySvan2zDlb3UsQXpuydQclpTmD7XUikU9nB9hDedpgPgGVoqY4BgthrisQYcuanBU8aaqvAEuk1SOvZX7PY7AFjTIs/y3pntCCflXqFrEwCtNt//6D5h6bT6Cuq2CS+PKgPmPpHy+U3L2LX1DhksycjB8q8VCaShr0lETLj9vZV8qSggTeYL4cLObhkiZjP/qy9e9S7QIkU6xAAAAABJRU5ErkJggg==',
            NOD: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACNUExURQAAAOw8Q4tPUY1YWrFPU6ZxcrmDhZg5O+Rlaax1d6csL5dMT6BaXK07PqBqbNJ0d7BrbOJXXL59f9NFSshkZw0BASADBKofJKEdIbAhJRUCAkMICm0SFHkTFbsjKLYhJsEjKZQbHs4jKTkICV0OEdooLSsEBVAND8glK4UXGvAwN+YrMq8WGpIQFNIpL/ELCXgAAAAVdFJOUwD9sWPrMUX18Qv73bn3Tdyy9Zr55xQta2QAAAFFSURBVCjPtZLXbsMwDEWb7nQlbXOpZQ1bkkc8/v/zSiXpSp97AAsEjkiQlC8u/pnb+xO3f916VUXDRLta/5GbCfUBTJtzdzPqYX+g1uPNmXxNtM+hHsJ+T+n1t3trsHQopDGjefvdDaXMhvjTsqLxZ0+7GZko2XGIkaD0vPsxYkbtEce85NECnUD+Hvbd0Digb3omtOAq5v3TbSeoxWLoA9O7jiNM21M3izZNCB01jukjYLLRy7Gna4vgvFuidN773gBVCLDXxb1w4JRS3go+w8AdKe8s/EtJ7HQvGMXOu8SzGidEr01JfRpQq2KFs5WC1hj4Xo35qdR9NtpLRhnossKkpPTaPB8fZEISUopYsqirS5wwnZ7m0UKeZJSiFJGwj59rf2ipYrou2eoAtQ9fq7+aWyJqGTrSzlffm7+8O+PyP3/lD/3hLDLjPwEEAAAAAElFTkSuQmCC'
        }
        let AllianceCitiesArr = localStorage.getItem(wid + 'cacheCleared') === 'true' ? (localStorage.removeItem(wid + 'cacheCleared'), []) : (await Lister.get(wid + 'AllianceCitiesArr')) || [];
        let processedCityIds = JSON.parse(localStorage.getItem(wid + 'processedCityIds')) || [];
        let AllPOIs = (await Lister.get(wid + 'AllPOIs')) || []; // Fetch from IndexedDB
        let timestamp;
        // Allow different parts of the application to communicate with each other without tight coupling.
        class EventBus {
            // Initializes an empty listeners object that will hold arrays of callbacks for each event.
            constructor() {this.listeners = {}}
            // Checks if an event already has a list of subscribers; if not, it initializes an empty array for that event name. Adds the provided callback function to the list of listeners for that specific event.
            subscribe(eventName, callback) {
                if (!this.listeners[eventName]) {this.listeners[eventName] = []}
                this.listeners[eventName].push(callback);
            }
            // Remove specific callbacks, especially for cleanup purposes
            unsubscribe(eventName, callback) {if (this.listeners[eventName]) {this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback)}}
            // Allow listeners to automatically unsubscribe after the first event dispatch.
            once(eventName, callback) {
                const wrapper = (event) => {
                    callback(event);
                    this.unsubscribe(eventName, wrapper);
                };
                this.subscribe(eventName, wrapper);
            }
            // Checks if there are any listeners for the provided event. Calls each callback with an object that provides a getData(), eventName or a timestamp method, allowing listeners to retrieve the data associated with the event.
            dispatch(eventName, data) {if (this.listeners[eventName]) {this.listeners[eventName].forEach(callback => callback({getData: () => data, eventName, timestamp: performance.now()}))}}
        }
        const eventBus = new EventBus(); // Create an instance of the EventBus
        // Build Hub terminals coords (DEE's idea)
        const HubTerminals = (() => {
            let terminalMap = null, hubMap = null;
            const offsets = [[-2, -2], [-2, 0], [-2, 2], [0, -2], [0, 2], [2, -2], [2, 0], [2, 2]];

            return (type) => {
                if (!terminalMap || !hubMap) {
                    terminalMap = {};
                    hubMap = {};
                    for (const hub of Object.values(ClientLib.Data.MainData.GetInstance().get_EndGame().get_Hubs().d)) {
                        if (hub.get_Type() === ClientLib.Data.EndGame.EHubType.Control) {
                            const name = webfrontend.phe.cnc.gui.util.Text.getControlHubName(hub, false);
                            const cx = hub.get_X() + 3, cy = hub.get_Y() + 3;
                            const coords = offsets.map(([dx, dy]) => `${cx + dx}:${cy + dy}`);
                            hubMap[name] = coords;
                            for (const coord of coords) terminalMap[coord] = name;
                        }
                    }
                }
                if (type === 'hub') return hubMap;
                if (type === 'terminal') return terminalMap;
                console.warn(`HubTerminals(): Use 'hub' or 'terminal'`);
                return null;
            };
        })();
        const coordToHubMap = HubTerminals('terminal');
        const hubToCoordsMap = HubTerminals('hub');
        /*
         * Alliance Cities
         */
        // Start alliance cities scan (logic: get alliance member IDs --> get alliance cities IDs --> load and grab each city data)
        async function getAllianceCities() {
            timestamp = performance.now();
            for (const memberId of mainData.get_Alliance().getMemberIds().l) {await getPublicPlayerInfoByIdAC(memberId)}
            AllianceCitiesArr.sort((a, b) => b.Base_Score - a.Base_Score).sort((a, b) => a.Player_Id - b.Player_Id);
            await processCityIDs(AllianceCitiesArr.map(item => item.Base_Id));
            await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
        }
        // Get public member info (about 75% of each alliance city data)
        async function getPublicPlayerInfoByIdAC(playerId) {
            try {
                const data = await new Promise((resolve, reject) => {communicationManager.SendSimpleCommand('GetPublicPlayerInfo', {id: playerId}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, (context, data) => {resolve(data)}), reject)});
                const s = mainData.get_Server().get_Name();
                for (const city of data.c) {
                    let cityData = {...AllianceCitiesTemplate}
                    console.log("CITY:", city.n, city.i, city);
                    Object.assign(cityData, {
                        Server_Name: s,
                        Alliance_Name: data.an,
                        Alliance_Id: data.a,
                        Player_Name: data.n,
                        Player_Id: data.i,
                        Player_Faction: data.f,
                        Player_Ranking: data.r,
                        Player_Score: data.p,
                        Player_Bases_Count: data.c.length,
                        Player_Distance_to_Center: data.dccc,
                        Player_has_Code: data.hchc,
                        Player_versus_Bases: data.bd,
                        Player_versus_Environment: data.bde,
                        Player_versus_Player: data.d,
                        Player_is_Inactive: data.ii,
                        Player_Endgame_Won_Count: data.ew.length,
                        Player_Challange_Won_Count: data.cw.length,
                        Player_Other_Won_Count: data.mw.length,
                        Endgame_Won_Server_Name: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).n : '',
                        Endgame_Won_Rank: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).r : '0',
                        Endgame_Won_Alliance: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).an : '',
                        Endgame_Won_Timestamp: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).ws : '',
                        Endgame_Won_Member_Role: data.ew.find(obj => obj.n === s) ? data.ew.find(obj => obj.n === s).mr : '',
                        Base_Name: city.n,
                        Base_Id: city.i,
                        Base_Score: city.p,
                        Base_Coords: `${city.x}:${city.y}`,
                        Base_Sector: calculateMetric(city.x, city.y, 'sector'),
                        Base_Distance_from_Center: calculateMetric(city.x, city.y, 'distance'),
                        Base_IsOnControlHub: coordToHubMap[`${city.x}:${city.y}`]
                    });
                    //ghost bases values fix
                    communicationManager.SendSimpleCommand('GetPublicCityInfoById', {id: city.i}, webfrontend.phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, null, async (context, data) => {
                        if (data.g === true) {
                            Object.assign(cityData, {
                                Base_Found_Step: -1,
                                Base_is_Ghost: data.g,
                                Base_Tiberium_per_Hour: 0,
                                Base_Crystal_per_Hour: 0,
                                Base_Power_per_Hour: 0,
                                Base_Credit_per_Hour: 0,
                                Base_Base_Level: -1,
                                Base_Defense_Level: -1,
                                Base_Offense_Level: -1,
                                Base_Construction_Yard_Level: -1,
                                Base_Command_Center_Level: -1,
                                Base_Defense_HQ_Level: -1,
                                Base_Defense_Facility_Level: -1,
                                Base_Support_Name: -1,
                                Base_Support_Level: -1,
                                Base_MoveCooldownTimespan: -1,
                                processedTimestamp: new Date().toISOString()
                            });
                            processedCityIds.push(city.i);
                            await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
                            localStorage.setItem(wid + 'processedCityIds', JSON.stringify(processedCityIds));
                            eventBus.dispatch("cityDataAdded", cityData);
                            progressBar(processedCityIds.length, AllianceCitiesArr.length, "Alliance Cities");
                        }
                    }), null)
                    const cityExists = AllianceCitiesArr.some(existingCity => existingCity.Base_Id === cityData.Base_Id); // Check if cityData already exists in AllianceCitiesArr
                    if (!cityExists) {AllianceCitiesArr.push(cityData)}
                }
            } catch (error) {console.error(`Error fetching player info for ID ${playerId}:`, error)}
        }
        // Set the play area view on the selected ID and wait for it's data to be loaded
        function loadCity(id) {
            return new Promise((resolve) => {
                ClientLib.API.Util.SetPlayAreaView(ClientLib.Data.PlayerAreaViewMode.pavmNone, id, 0, 0); // Set the play area view for the current city
                //if (typeof this.communicationManager.$Poll === 'function') this.communicationManager.$Poll();
                PollFunction?.call(communicationManager);
                const checkLoading = setInterval(() => {
                    const loadedCity = mainData.get_Cities().get_CurrentCity();
                    // Check if the loaded city's ID matches the requested city ID
                    if (loadedCity && loadedCity.get_Id() === id && loadedCity.get_FoundStep()) {
                        clearInterval(checkLoading);
                        resolve(loadedCity);
                    }
                }, 10);
            });
        }
        // Get more data for each alliance city (about 25%) with ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity()
        async function processCityIDs(remainingCityIds) {
            remainingCityIds = remainingCityIds.filter(cityId => !processedCityIds.includes(cityId));
            while (remainingCityIds.length > 0) {
                const cityId = remainingCityIds.shift(); // Take the first city ID
                try {
                    const loadedCity = await loadCity(cityId);
                    const buildings = Object.values(loadedCity.get_Buildings().d);
                    const getLevel = name => buildings.find(b => b.get_TechGameData_Obj().dn === name)?.get_CurrentLevel();
                    let cityData = AllianceCitiesArr.find(city => city.Base_Id === cityId); // Find the existing city object in AllianceCitiesArr and update its properties
                    if (cityData) {
                        Object.assign(cityData, {
                            Base_Found_Step: loadedCity.get_FoundStep(),
                            Base_is_Ghost: loadedCity.get_IsGhostMode(),
                            Base_Tiberium_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true),
                            Base_Crystal_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true),
                            Base_Power_per_Hour: loadedCity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true),
                            Base_Credit_per_Hour: (loadedCity.get_CityCreditsProduction().Delta + loadedCity.get_CityCreditsProduction().ExtraBonusDelta) * 3600,
                            Base_Base_Level: loadedCity.get_LvlBase(),
                            Base_Defense_Level: loadedCity.get_LvlDefense(),
                            Base_Offense_Level: loadedCity.get_LvlOffense(),
                            Base_Construction_Yard_Level: getLevel('Construction Yard'), // loadedCity.get_ConstructionYardLevel(),
                            Base_Command_Center_Level: getLevel('Command Center'), // loadedCity.get_CommandCenterLevel(),
                            Base_Defense_HQ_Level: getLevel('Defense HQ'),
                            Base_Defense_Facility_Level: getLevel('Defense Facility'),
                            Base_Support_Name: loadedCity.get_SupportWeapon()?.dn || "No Support",
                            Base_Support_Level: loadedCity.get_SupportData()?.get_Level() || 0,
                            Base_MoveCooldownTimespan: mainData.get_Time().GetServerStep() - loadedCity.get_MoveCooldownEndStep(),
                            processedTimestamp: new Date().toISOString()
                        });
                    }
                    processedCityIds.push(cityId);
                    await Lister.set(wid + 'AllianceCitiesArr', AllianceCitiesArr);
                    localStorage.setItem(wid + 'processedCityIds', JSON.stringify(processedCityIds));
                    eventBus.dispatch("cityDataAdded", cityData);
                    progressBar(processedCityIds.length, AllianceCitiesArr.length, "Alliance Cities");
                } catch (error) {console.error(`Error loading City ID ${cityId}:`, error)}
            }
            if (remainingCityIds.length === 0) {localStorage.removeItem(wid + 'processedCityIds')} // Clear processedCityIds from localStorage on completion to allow refresh
        }
        /*
         * Points Of Interest
         */
        function getPOIs() {
            timestamp = performance.now();
            waitForMapAreaResize(region).then(() => {return processPOIs(region, timestamp)}); // Wait for the map area resize to complete and process all RegionPointOfInterest (except tunnel exit)
        }
        // Set the proper zoom on region view and wait for objects to be available... get_VisAreaComplete() must return "true"
        function waitForMapAreaResize(region) {
            cfg.SetConfig(ClientLib.Config.Main.CONFIG_VIS_REGION_MINZOOM, false); // Uncheck 'Allow max zoom out' in game video options
            cfg.SaveToDB(); //Save settings
            const getMinZoomMethod = region.get_MinZoomFactor.toString().match(/\$I\.[A-Z]{6}\.([A-Z]{6});?}/)?.[1]; // Extract the `getMinZoomFactor` method dynamically.
            const newMinZoomFactor = Math.max(window.innerWidth / region.get_MaxXPosition(), window.innerHeight / region.get_MaxYPosition()); // Calculate ZoomFactor for your window width and height. The bigger ZoomFactor is chosen to ensure the map fills the window and crops off whatever doesn't fit... get_VisAreaComplete() will return 'false' otherwise.
            ClientLib.Vis.Region.Region[getMinZoomMethod] = newMinZoomFactor; // Modify the MinZoomFactor to be able to zoom out further
            region.set_ZoomFactor(newMinZoomFactor); // Zoom out the region view to visualize the entire world... bird's eye view
            //qxApp.showMainOverlay(false); // Switch to region view
            webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(Math.floor(mainData.get_Server().get_WorldWidth() / 2), Math.floor(mainData.get_Server().get_WorldHeight() / 2)); // Switch to region view and center map
            return new Promise((resolve) => {
                const checkResizeComplete = setInterval(() => {
                    if (region.get_VisAreaComplete()) {
                        clearInterval(checkResizeComplete);
                        resolve();
                    }
                }, 100);
            });
        }

        async function processPOIs(region, timestamp) {
            const rangeX = mainData.get_Server().get_WorldWidth();
            const rangeY = mainData.get_Server().get_WorldHeight();
            const maxLevel = mainData.get_Server().get_MaxCenterLevel();
            const POIScore = Array.from({length: maxLevel + 1}, (_, i) => ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i));
            const gridWidth = region.get_GridWidth();
            const gridHeight = region.get_GridHeight();
            AllPOIs = [];
            for (let x = -rangeX; x <= rangeX; x++) {
                for (let y = -rangeY; y <= rangeY; y++) {
                    const xPos = x * gridWidth;
                    const yPos = y * gridHeight;
                    const visObject = region.GetObjectFromPosition(xPos, yPos);
                    if (!visObject || visObject.get_VisObjectType() !== ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest || visObject.get_Name() === 'Tunnel exit') {continue}
                    const poi = Object.assign({}, poiTemplate, {
                        Level: visObject.get_Level(),
                        Name: visObject.get_Name().split(' ')[0],
                        Coords: `${x}:${y}`,
                        Alliance: visObject.get_OwnerAllianceName(),
                        Score: POIScore[visObject.get_Level()],
                        Type: visObject.get_Type(),
                        Sector: calculateMetric(x, y, 'sector'),
                        Distance: calculateMetric(x, y, 'distance'),
                        Holders: findPOIHolders(x, y)
                    });
                    AllPOIs.push(poi);
                }
            }
            AllPOIs.sort((a, b) => b.Level - a.Level || a.Type - b.Type);
            console.log(`%cPoints of Interest (${AllPOIs.length}) list done in ${Math.round(performance.now() - timestamp) / 1000} seconds`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border-radius: 5px;');
            region.set_ZoomFactor(1);
            await Lister.set(wid + 'AllPOIs', AllPOIs); // Save to IndexedDB
            eventBus.dispatch('POIs_Refreshed', AllPOIs);
            return AllPOIs;
        }
        // Find POI holders within 2 fields of a POI
        function findPOIHolders(poiX, poiY) {
            const holders = [];
            const range = 2;
            const gridWidth = region.get_GridWidth();
            const gridHeight = region.get_GridHeight();
            for (let x = -range; x <= range; x++) {
                for (let y = -range; y <= range; y++) {
                    const xPos = (poiX + x) * gridWidth;
                    const yPos = (poiY + y) * gridHeight;
                    const visObject = region.GetObjectFromPosition(xPos, yPos);
                    if (!visObject || visObject.get_VisObjectType() !== ClientLib.Vis.VisObject.EObjectType.RegionCityType || calculateMetric(x, y, 'distance', 0, 0) >= range * Math.sqrt(2)) {continue}
                    holders.push({
                        Base: visObject.get_Name(),
                        Player: visObject.get_PlayerName(),
                        Alliance: visObject.get_AllianceName(),
                        Coords: `${poiX + x}:${poiY + y}`,
                        Distance: Math.round(calculateMetric(x, y, 'distance', 0, 0))
                    });
                }
            }
            return holders;
        }

        // ========================================
        // Spaltendefinitionen
        // ========================================


        window.columnDefinitions = {

            allianceCities: [

                // ========================================
                // Allgemein
                // ========================================

                {
                    id: "player",             // Name des Spielers
                    field: "Player_Name",
                    label: "Spieler Name",
                    width: 120,
                    align: "center",
                    category: "general",

                    default: true,
                    defaultOrder: 1
                },
                {
                    id: "Name",                 // Name der Basis
                    field: "Base_Name",
                    label: "Basen Name",
                    width: 120,
                    align: "center",
                    category: "general",

                    default: true,
                    defaultOrder: 2
                },
                {
                    id: "coordinates",          // Coords der Basis
                    field: "Base_Coords",
                    label: "Coords",
                    width: 55,
                    align: "center",
                    category: "general",

                    default: true,
                    defaultOrder: 3
                },
                {
                    id: "points",              // Punkte der Basis
                    field: "Base_Score",
                    label: "Basen Punkte",
                    width: 88,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_bases_count",   // Anzahl Spielerbasen
                    field: "Player_Bases_Count",
                    label: "Basen",
                    width: 50,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "server_name",       // Name des Servers
                    field: "Server_Name",
                    label: "Server",
                    width: 80,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_ranking",    // Spielerranking
                    field: "Player_Ranking",
                    label: "Rang",
                    width: 50,
                    category: "general",

                    default: true,
                    defaultOrder: 4
                },
                {
                    id: "alliance",           // Name der Allianz
                    field: "Alliance_Name",
                    label: "Allianz",
                    width: 80,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_score",      // Punkte des Spielers
                    field: "Player_Score",
                    label: "Spieler Punkte",
                    width: 90,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_faction",    // Fraktion des Spielers
                    field: "Player_Faction",
                    label: "Fraktion",
                    width: 60,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_has_code",    // Spieler hat Code
                    field: "Player_has_Code",
                    label: "Sat Code",
                    width: 65,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_inactive",   // Spieler ist inaktiv
                    field: "Player_is_Inactive",
                    label: "Inaktiv",
                    width: 55,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "player_base_battles",   // Anzahl der Basenkämpfe
                    field: "Player_versus_Bases",
                    label: "PVP/PVE",
                    width: 65,
                    category: "general",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "playerid",
                    field: "Player_Id",
                    label: "Player ID",
                    width: 70,
                    align: "center",
                    category: "general",

                    default: false,
                    defaultOrder: null
                },

                // ========================================
                // Basis
                // ========================================

                {
                    id: "base_level",           // Base Level
                    field: "Base_Base_Level",
                    label: "Base Level",
                    width: 80,
                    category: "base",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_sector",      // Sektor
                    field: "Base_Sector",
                    label: "Sektor",
                    width: 55,
                    category: "base",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_distance_center",     // Distance bis zum Zentrum
                    field: "Base_Distance_from_Center",
                    label: "Distance Mitte",
                    width: 100,
                    category: "base",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_construction_yard_level",  // Bauhof Level noch inaktiv
                    field: "Base_Construction_Yard_Level",
                    label: "Bauhof",
                    width: 80,
                    category: "base",

                    default: false,
                    defaultOrder: null,

                    available: false
                },

                // ========================================
                // Produktion
                // ========================================

                {
                    id: "tiberium_per_hour",           // Produktion Tiberium pro Stunde
                    field: "Base_Tiberium_per_Hour",
                    label: "Tiberium / h",
                    width: 80,
                    category: "production",

                    default: true,
                    defaultOrder: 5
                },
                {
                    id: "crystal_per_hour",           // Produktion Kristal pro Stunde
                    field: "Base_Crystal_per_Hour",
                    label: "Kristall / h",
                    width: 80,
                    category: "production",

                    default: true,
                    defaultOrder: 6
                },
                {
                    id: "power_per_hour",             // Produktion Strom pro Stunde
                    field: "Base_Power_per_Hour",
                    label: "Strom / h",
                    width: 80,
                    category: "production",

                    default: true,
                    defaultOrder: 7
                },
                {
                    id: "credit_per_hour",           // Produktion Cash pro Stunde
                    field: "Base_Credit_per_Hour",
                    label: "Credits / h",
                    width: 80,
                    category: "production",

                    default: true,
                    defaultOrder: 8
                },

                // ========================================
                // Support
                // ========================================


                {
                    id: "base_is_on_control_hub",   // Basis steht auf den HUB
                    field: "Base_IsOnControlHub",
                    label: "Control Hub",
                    width: 80,
                    category: "support",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_move_cooldown",       // Verlegesperre der Basis
                    field: "Base_MoveCooldownTimespan",
                    label: "Cooldown",
                    width: 80,
                    category: "support",

                    default: false,
                    defaultOrder: null
                },

                // ========================================
                // Militär
                // ========================================

                {
                    id: "base_off",                          // Off Level der Basis
                    field: "Base_Offense_Level",
                    label: "Base Off",
                    width: 70,
                    category: "military",

                    default: true,
                    defaultOrder: 9
                },
                {
                    id: "base_ghost",                     // Schwebende Basen
                    field: "Base_is_Ghost",
                    label: "Geisterbasis",
                    width: 80,
                    category: "military",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_def",                         // Def Level der Basis
                    field: "Base_Defense_Level",
                    label: "Base Def",
                    width: 70,
                    category: "military",

                    default: true,
                    defaultOrder: 10
                },
                {
                    id: "base_command_center_level",         // Level der Kommandozentrale
                    field: "Base_Command_Center_Level",
                    label: "Kommandozentrale",
                    width: 80,
                    category: "military",

                    default: false,
                    defaultOrder: null,

                    available: false
                },
                {
                    id: "base_defense_facility_level",      // Level der Verteidigungseinrichtung
                    field: "Base_Defense_Facility_Level",
                    label: "Verteidigungseinrichtung",
                    width: 80,
                    category: "military",

                    default: false,
                    defaultOrder: null,

                    available: false
                },
                {
                    id: "base_support_level",              // Support Waffen Level
                    field: "Base_Support_Level",
                    label: "Support-Level",
                    width: 80,
                    category: "military",

                    default: false,
                    defaultOrder: null
                },
                {
                    id: "base_defense_hq_level",            // Level der Verteidigungszentrale
                    field: "Base_Defense_HQ_Level",
                    label: "Verteidigungsazentrale",
                    width: 100,
                    category: "military",

                    default: false,
                    defaultOrder: null,

                    available: false
                },
                {
                    id: "base_support_name",              // Support Waffen Name
                    field: "Base_Support_Name",
                    label: "Support",
                    width: 140,
                    category: "military",

                    default: false,
                    defaultOrder: null
                },
            ]

        };

        // ====================================================
        // Ende Spaltendefinitionen - End of column definitions
        // ====================================================

        // ==============================================================================
        // Schneller Zugriff auf Spaltendefinitionen - Quick access to column definitions
        // ==============================================================================

        window.columnDefinitionMap = {};

        window.columnDefinitions.allianceCities.forEach(column => {
            window.columnDefinitionMap[column.field] = column;
        });

        // ==============================================================
        // Spalten nach Kategorien gruppieren - Group columns by category
        // ==============================================================

        function getColumnsByCategory() {

            const categories = {};

            window.columnDefinitions.allianceCities.forEach(column => {

                if (!categories[column.category]) {
                    categories[column.category] = [];
                }

                categories[column.category].push(column);

            });

            return categories;
        }

        // ========================================
        // UI-Erstellung starten - Beginn Build UI
        // ========================================



        async function mainUI() {
            const listerWindow = new qx.ui.window.Window("Lister - Harzi Edition");
            listerWindow.set({
                width: 950,
                height: 800,
                allowMaximize: true,
                allowMinimize: true,
                showMaximize: true,
                showMinimize: true
            });
            listerWindow.setLayout(new qx.ui.layout.VBox());
            const tabView = new qx.ui.tabview.TabView();
            listerWindow.add(tabView, {flex: 1});

            // Add tabs

            const allianceTab = tabAllianceCities();
            tabView.add(allianceTab);

            const settingsTab = tabSettings();
            tabView.add(settingsTab);

            const poiTab = await tabPointsOfInterest(tabView, AllPOIs);
            tabView.add(poiTab);

            tabView.remove(settingsTab);
            tabView.add(settingsTab);

            // Display the window

            qx.core.Init.getApplication().getRoot().add(listerWindow);
            listerWindow.open();
        }

        // Alliance cities scan UI

        function applyAllianceCitiesProfileSorting() {

            const model = window.allianceCitiesTable.getTableModel();

            if (window.profileStartAction === "Rangliste") {

                model.sortByColumn(
                    window.columnIndexMap["Player_Ranking"],
                    true
                );

            }
            else if (window.profileStartAction === "Name") {

                model.sortByColumn(
                    window.columnIndexMap["Player_Name"],
                    true
                );

            }
            else if (window.profileStartAction === "Tiberium/h") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Tiberium_per_Hour"],
                    false
                );

            }
            else if (window.profileStartAction === "Kristall/h") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Crystal_per_Hour"],
                    false
                );

            }
            else if (window.profileStartAction === "Strom/h") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Power_per_Hour"],
                    false
                );

            }
            else if (window.profileStartAction === "Credits/h") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Credit_per_Hour"],
                    false
                );

            }
            else if (window.profileStartAction === "Höchste Off") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Offense_Level"],
                    false
                );

            }
            else if (window.profileStartAction === "Höchste Deff") {

                model.sortByColumn(
                    window.columnIndexMap["Base_Defense_Level"],
                    false
                );

            }
            else {

                model.sortByColumn(
                    window.columnIndexMap["Player_Id"],
                    true
                );

            }

        }

        function tabAllianceCities() {

            const settings = window.harzi.core.settings.data;

            if (settings?.profiles?.startAction) {
                window.profileStartAction = settings.profiles.startAction;
            } else {
                window.profileStartAction = "Keine";
            }

            const allianceCitiesTab = new qx.ui.tabview.Page("Alliance Cities");
            allianceCitiesTab.setLayout(new qx.ui.layout.VBox());

            // ========================================
            // Tabellenaufbau - Table setup
            // ========================================

            const columnNames = Object.keys(AllianceCitiesTemplate);

            // ===================================================
            // Anzeigetexte für die Tabellenüberschriften erzeugen
            //                        -
            // Generate display text for the table headings
            // ===================================================

            const columnLabels = columnNames.map(name => {
                const definition = window.columnDefinitionMap[name];
                return definition ? definition.label : name;
            });

            // ===========================================
            // Spalten nach Standardreihenfolge sortieren
            // Standardspalten zuerst, alle übrigen danach
            // ===========================================

            const columnDefinitionsByField = {};

            window.columnDefinitions.allianceCities.forEach(column => {
                columnDefinitionsByField[column.field] = column;
            });

            const initialView =
                  window.harzi.core.settings.defaults.tables.allianceCities.initialView;

            const initialOrder = {};

            initialView.forEach((columnId, index) => {
                initialOrder[columnId] = index;
            });

            columnNames.sort((a, b) => {

                const colA = columnDefinitionsByField[a];
                const colB = columnDefinitionsByField[b];

                const orderA =
                      initialOrder[colA?.id] ?? Number.MAX_SAFE_INTEGER;

                const orderB =
                      initialOrder[colB?.id] ?? Number.MAX_SAFE_INTEGER;

                return orderA - orderB;

            });


            window.columnIndexMap = {};

            columnNames.forEach((name, index) => {
                window.columnIndexMap[name] = index;
            });
            const tableModel = new qx.ui.table.model.Simple();
            tableModel.setColumns(columnNames);
            window.allianceCitiesTable = new qx.ui.table.Table(tableModel).set({width: 1250, height: 600, decorator: "main", showCellFocusIndicator: false});
            window.allianceCitiesTable.getChildControl("statusbar").setTextColor("darkgreen");
            window.allianceCitiesTable.setAdditionalStatusBarText(` / ${Object.values(mainData.get_Alliance().get_MemberData().d).reduce((sum, member) => sum + member.Bases, 0)} cities`);
            const tableColumnModel = window.allianceCitiesTable.getTableColumnModel();

            const originalFireDataEvent =
                  tableColumnModel.fireDataEvent;

            tableColumnModel.fireDataEvent = function (
            eventName,
             data
            ) {

                if (eventName === "orderChanged") {

                    const allianceCitiesSettings =
                          window.harzi.core.settings.data.tables.allianceCities;

                    if (
                        Array.isArray(allianceCitiesSettings.order) &&
                        data &&
                        data.fromOverXPos != null &&
                        data.toOverXPos != null
                    ) {

                        const order =
                              allianceCitiesSettings.order;

                        const movedColumn =
                              order[data.fromOverXPos];

                        if (movedColumn !== undefined) {

                            order.splice(
                                data.fromOverXPos,
                                1
                            );

                            order.splice(
                                data.toOverXPos,
                                0,
                                movedColumn
                            );

                            window.harzi.core.settings.save();
                            window.updateColumnOrderList();

                        }

                    }

                }

                return originalFireDataEvent.apply(
                    this,
                    arguments
                );

            };

            window.columnDefinitions.allianceCities.forEach(definition => {


                if (definition.width == null) {
                    return;
                }

                const index = window.columnIndexMap[definition.field];

                if (index != null) {
                    tableColumnModel.setColumnWidth(index, definition.width);
                }

            });

            // ========================================
            // Setzt lesbare Überschriften anhand der
            // Spaltendefinitionen.
            // ========================================

            function createHeaderRenderer(label) {

                const renderer = new qx.ui.table.headerrenderer.Default();

                renderer.updateHeaderCell = function(cellInfo, cellWidget) {

                    qx.ui.table.headerrenderer.Default.prototype.updateHeaderCell.call(
                        this,
                        cellInfo,
                        cellWidget
                    );

                    cellWidget.setLabel(label);
                };

                return renderer;
            }

            columnNames.forEach((columnName, index) => {

                const definition = window.columnDefinitionMap[columnName];

                if (!definition?.label) {
                    return;
                }

                tableColumnModel.setHeaderCellRenderer(
                    index,
                    createHeaderRenderer(definition.label)
                );

            });

            const cityRowMap = {}; // Map to track row indices by City ID

            // ========================================
            // Erzeugt eine Tabellenzeile anhand der
            // aktuellen Spaltenreihenfolge.
            // ========================================

            function createRowData(cityData) {

                return columnNames.map(columnName => cityData[columnName]);

            }

            const allianceCitiesSettings =
                  window.harzi.core.settings.data.tables.allianceCities;

            const savedOrder =
                  allianceCitiesSettings.order;

            let visibleColumns;

            if (
                Array.isArray(savedOrder) &&
                savedOrder.length > 0
            ) {
                visibleColumns = savedOrder;
            } else {
                visibleColumns =
                    window.harzi.core.settings.defaults.tables.allianceCities.initialView;
            }

            // ========================================
            // Stellt die gespeicherte Spaltenreihenfolge
            // im TableColumnModel wieder her.
            // ========================================

            if (
                Array.isArray(savedOrder) &&
                savedOrder.length > 0
            ) {

                const savedColumnIndices =
                      savedOrder
                .map(columnId => {

                    const definition =
                          window.columnDefinitions.allianceCities.find(
                              definition => definition.id === columnId
                          );

                    if (!definition) {
                        return null;
                    }

                    return window.columnIndexMap[definition.field];

                })
                .filter(index => index != null);

                const remainingColumnIndices =
                      columnNames
                .map((columnName, index) => index)
                .filter(index =>
                        !savedColumnIndices.includes(index)
                       );

                const completeColumnOrder = [
                    ...savedColumnIndices,
                    ...remainingColumnIndices
                ];

                tableColumnModel.setColumnsOrder(
                    completeColumnOrder
                );

            }

            columnNames.forEach((columnName, index) => {

                const definition =
                      window.columnDefinitionMap[columnName];

                let visible = false;

                if (definition) {

                    visible = visibleColumns.includes(definition.id);

                }

                tableColumnModel.setColumnVisible(
                    index,
                    visible
                );

            });

            // Custom renderer

            qx.Class.define("CnCTA.AlignCellRenderer", {
                extend: qx.ui.table.cellrenderer.Default,

                members: {
                    __align: "left",

                    _getCellStyle(cellInfo) {
                        return "text-align:" + this.__align + ";";
                    }
                }
            });

            // Renderer factory

            const createRenderer = (
                formatter,
                rendererClass = qx.ui.table.cellrenderer.Default,
                align = null
            ) => {

                if (align) {
                    rendererClass = CnCTA.AlignCellRenderer;
                }

                const renderer = new rendererClass();
                renderer._getContentHtml = formatter;

                if (align) {
                    renderer.__align = align;
                }

                return renderer;
            };
            const booleanColumns = [
                "Player_has_Code",
                "Player_is_Inactive",
                "Base_is_Ghost"
            ];
            const compactNumberColumns = [
                "Player_Score",
                "Player_Bases_Count",
                "Player_Distance_to_Center",
                "Player_versus_Bases",
                "Player_versus_Environment",
                "Player_versus_Player",
                "Player_Endgame_Won_Count",
                "Player_Challange_Won_Count",
                "Player_Other_Won_Count",
                "Endgame_Won_Rank",
                "Base_Score",
                "Base_Tiberium_per_Hour",
                "Base_Crystal_per_Hour",
                "Base_Power_per_Hour",
                "Base_Credit_per_Hour",
                "Base_Base_Level"
            ];
            const allianceLinkColumns = [
                "Alliance_Name",
                "Endgame_Won_Alliance"
            ];
            booleanColumns.forEach(field =>
                                   tableColumnModel.setDataCellRenderer(
                window.columnIndexMap[field],
                new qx.ui.table.cellrenderer.Boolean()
            )
                                  );
            compactNumberColumns.forEach(field =>
                                         tableColumnModel.setDataCellRenderer(
                window.columnIndexMap[field],
                createRenderer(cellInfo =>
                               webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(cellInfo.value)
                              )
            )
                                        );
            allianceLinkColumns.forEach(field =>
                                        tableColumnModel.setDataCellRenderer(
                window.columnIndexMap[field],
                createRenderer(cellInfo =>
                               webfrontend.gui.util.BBCode.createAllianceLinkText(cellInfo.value)
                              )
            )
                                       );
            tableColumnModel.setDataCellRenderer(
                window.columnIndexMap["Base_MoveCooldownTimespan"],
                createRenderer(cellInfo =>
                               webfrontend.phe.cnc.Util.getTimespanString(cellInfo.value, true, false)
                              )
            );
            tableColumnModel.setDataCellRenderer(
                window.columnIndexMap["Player_Name"],
                createRenderer(
                    cellInfo =>
                    webfrontend.gui.util.BBCode.createPlayerLinkText(cellInfo.value),
                    undefined,
                    window.columnDefinitionMap["Player_Name"].align
                )
            );

            // Base Name Renderer

            tableColumnModel.setDataCellRenderer(
                window.columnIndexMap["Base_Name"],
                createRenderer(
                    cellInfo => {

                        const coords = cellInfo.rowData[
                            window.columnIndexMap["Base_Coords"]
                        ];

                        const [x, y] = coords.split(":");

                        return `
                <a onClick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(${x},10),parseInt(${y},10));"
                   style="cursor:pointer;color:#0d77bb">
                    ${cellInfo.value}
                </a>
            `;

                    },
                    undefined,
                    window.columnDefinitionMap["Base_Name"].align
                )
            );

            // Base Coords Renderer

            const baseCoordsDefinition = window.columnDefinitionMap["Base_Coords"];

            tableColumnModel.setDataCellRenderer(
                window.columnIndexMap["Base_Coords"],
                createRenderer(
                    cellInfo => {
                        const [x, y] = cellInfo.value.split(":");
                        return webfrontend.gui.util.BBCode.createCoordsLinkText(
                            cellInfo.value,
                            parseInt(x),
                            parseInt(y)
                        );
                    },
                    undefined,
                    window.columnDefinitionMap["Base_Coords"].align
                )
            );

            tableColumnModel.setDataCellRenderer(
                window.columnIndexMap["Player_Faction"],
                createRenderer(cellInfo => {
                    const factionImages = {"0": Icons.TheForgotten, "1": Icons.GDI, "2": Icons.NOD}
                    return factionImages[cellInfo.value]
                        ? `<img src="${factionImages[cellInfo.value]}" style="height:20px;width:20px;">`
            : cellInfo.value;
                })
            );


            allianceCitiesTab.add(window.allianceCitiesTable, {flex: 1});
            allianceCitiesTab.add(setupAllianceCitiesFooterContainer());
            //Production window
            function createPlayerResourceWindow() {
                const resourceWindow = new qx.ui.window.Window("Alliance members total resource production per hour by type").set({width: 550, height: 600, layout: new qx.ui.layout.VBox(), showStatusbar: false});
                resourceWindow.center();
                const columnData = [
                    {label: "Player", icon: "webfrontend/battleview/neutral/gui/player_icn_own_alliance.png"},
                    {label: "Power", icon: Icons.Power},
                    {label: "Credit", icon: Icons.Credit},
                    {label: "Tiberium", icon: Icons.Tiberium},
                    {label: "Crystal", icon: Icons.Crystal}
                ];
                const playerData = {};
                AllianceCitiesArr.forEach(city => {
                    const playerName = city.Player_Name;
                    if (!playerData[playerName]) {playerData[playerName] = {power: 0, credits: 0, tiberium: 0, crystal: 0}}
                    playerData[playerName].power += city.Base_Power_per_Hour;
                    playerData[playerName].credits += city.Base_Credit_per_Hour;
                    playerData[playerName].tiberium += city.Base_Tiberium_per_Hour;
                    playerData[playerName].crystal += city.Base_Crystal_per_Hour;
                });
                const tableData = Object.entries(playerData).map(([player, resources]) => [player, resources.power, resources.credits, resources.tiberium, resources.crystal]);
                const tableModel = new qx.ui.table.model.Simple().set({columns: columnData.map(col => col.label), data: tableData});
                const table = new qx.ui.table.Table(tableModel).set({showCellFocusIndicator: false});
                resourceWindow.add(table, {flex: 1});
                const tableColumnModel = table.getTableColumnModel();
                tableColumnModel.setDataCellRenderer(0, createRenderer(cellInfo => webfrontend.gui.util.BBCode.createPlayerLinkText(cellInfo.value)));
                [1, 2, 3, 4].forEach(index => tableColumnModel.setDataCellRenderer(index, createRenderer(cellInfo => webfrontend.phe.cnc.gui.util.Numbers.formatNumbersCompact(cellInfo.value))));
                columnData.forEach((col, index) => {tableColumnModel.setHeaderCellRenderer(index, new qx.ui.table.headerrenderer.Icon(col.icon, col.label))});
                qxApp.getRoot().add(resourceWindow);
                resourceWindow.open();
                return resourceWindow;
            }
            // UI Helper functions
            function setupAllianceCitiesFooterContainer() {
                const allianceCitiesFooterContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                const buttons = [{
                    label: "Clear Cache",
                    icon: Icons.ClearCache,
                    handler: async () => {
                        sessionStorage.clear();
                        tableModel.setData([]);
                        localStorage.removeItem(wid + 'processedCityIds');
                        await Lister.remove(wid + 'AllianceCitiesArr');
                        localStorage.setItem(wid + 'cacheCleared', 'true');
                        processedCityIds = [];
                        AllianceCitiesArr = [];
                        Object.keys(cityRowMap).forEach(key => delete cityRowMap[key]);
                        updateFooterWithOldestTimestamp();
                    },
                    tip: "Clear table data."
                }, {
                    label: "Refresh",
                    icon: Icons.Refresh,
                    handler: async () => {
                        await getAllianceCities();
                        updateFooterWithOldestTimestamp();
                    },
                    tip: "Populate/Update table data."
                }, {
                    label: "Download TSV",
                    icon: Icons.Download,
                    handler: () => {
                        getTSV(getSelectedAllianceCityData(), "AllianceCities");
                    },
                    tip: "Download table data in TSV (tab-separated values) format."
                }, {
                    label: "Res Production",
                    icon: Icons.Production,
                    handler: createPlayerResourceWindow,
                    tip: "Total resource producton per hour for each alliance member... A full scan is needed for proper values."
                },

                                ];
                buttons.forEach(({label, icon, handler, tip}) => {
                    const button = new qx.ui.form.Button(label, icon);
                    button.setToolTipText(tip);
                    button.addListener("execute", handler);
                    allianceCitiesFooterContainer.add(button);
                });
                const offenseLevelFilterSelectBox = new qx.ui.form.SelectBox().set({
                    width: 150,
                    toolTipText: "Filter Base Offense Level"
                });

                window.harziOffenseSelectBox = offenseLevelFilterSelectBox;

                window.harziStartHighestOff = function () {


                    window.harziOffenseSelectBox.setSelection([
                        window.harziOffenseSelectBox.getSelectables()[1]
                    ]);

                    window.setTimeout(() => {

                        window.harziOffenseSelectBox.setSelection([
                            window.harziOffenseSelectBox.getSelectables()[0]
                        ]);

                    }, 100);

                };

                offenseLevelFilterSelectBox.add(
                    new qx.ui.form.ListItem("All Offense")
                );
                for (let i = 1; i <= 10; i++) {offenseLevelFilterSelectBox.add(
                    new qx.ui.form.ListItem(
                        `Show ${i}${i === 1 ? "st" : i === 2 ? "nd" : i === 3 ? "rd" : "th"} highest OL`))}

                offenseLevelFilterSelectBox.addListener("changeSelection", (e) => {

                    const label = offenseLevelFilterSelectBox
                    .getSelection()[0]
                    .getLabel();

                    if (label === "All Offense") {


                        const allCities = [...AllianceCitiesArr];

                        allCities.sort((a, b) =>
                                       b.Base_Offense_Level - a.Base_Offense_Level
                                      );

                        tableModel.setData(
                            allCities.map(createRowData)
                        );

                        return;
                    }

                    const selectedRank = label.match(/\d+/);

                    if (selectedRank) {

                        filterCitiesByOffenseLevel(
                            parseInt(selectedRank[0], 10)
                        );

                    }
                });

                const viewSelectBox = new qx.ui.form.SelectBox().set({
                    width: 110,
                    toolTipText: "Cities View"
                });

                viewSelectBox.add(
                    new qx.ui.form.ListItem("All Cities by Rank")
                );

                viewSelectBox.add(
                    new qx.ui.form.ListItem("All Cities by Name")
                );

                viewSelectBox.add(
                    new qx.ui.form.ListItem("My Cities")
                );
                viewSelectBox.addListener("changeSelection", () => {

                    const view = viewSelectBox
                    .getSelection()[0]
                    .getLabel();

                    filterCitiesView(view);

                });

                // Reihenfolge der beiden Dropdowns

                allianceCitiesFooterContainer.add(viewSelectBox);
                allianceCitiesFooterContainer.add(offenseLevelFilterSelectBox);

                const defenseLevelFilterSelectBox = new qx.ui.form.SelectBox().set({
                    width: 150,
                    toolTipText: "Filter Base Defense Level"
                });

                window.harziDefenseSelectBox = defenseLevelFilterSelectBox;

                window.harziStartHighestDeff = function () {

                    window.harziDefenseSelectBox.setSelection([
                        window.harziDefenseSelectBox.getSelectables()[1]
                    ]);

                    window.setTimeout(() => {

                        window.harziDefenseSelectBox.setSelection([
                            window.harziDefenseSelectBox.getSelectables()[0]
                        ]);

                    }, 100);

                };
                defenseLevelFilterSelectBox.add(
                    new qx.ui.form.ListItem("All Defense")
                );

                for (let i = 1; i <= 10; i++) {

                    defenseLevelFilterSelectBox.add(

                        new qx.ui.form.ListItem(
                            `Show ${i}${i === 1 ? "st" :
                            i === 2 ? "nd" :
                            i === 3 ? "rd" : "th"} highest DL`
        )

                    );

                }

                defenseLevelFilterSelectBox.addListener("changeSelection", () => {

                    const label = defenseLevelFilterSelectBox
                    .getSelection()[0]
                    .getLabel();

                    if (label === "All Defense") {

                        const allCities = [...AllianceCitiesArr];

                        allCities.sort(
                            (a, b) =>
                            b.Base_Defense_Level - a.Base_Defense_Level
                        );

                        tableModel.setData(
                            allCities.map(createRowData)
                        );

                        return;
                    }

                    const selectedRank = label.match(/\d+/);

                    if (selectedRank) {

                        filterCitiesByDefenseLevel(
                            parseInt(selectedRank[0], 10)
                        );

                    }

                });

                allianceCitiesFooterContainer.add(defenseLevelFilterSelectBox);

                function filterCitiesView(view) {

                    if (view === "My Cities") {

                        const myId = ClientLib.Data.MainData
                        .GetInstance()
                        .get_Player()
                        .get_Id();

                        const myCities = AllianceCitiesArr.filter(
                            city => city.Player_Id === myId
                        );

                        tableModel.setData(
                            myCities.map(createRowData)
                        );

                        return;
                    }

                    if (view === "All Cities by Name") {

                        tableModel.setData(
                            AllianceCitiesArr.map(createRowData)
                        );

                        tableModel.sortByColumn(
                            window.columnIndexMap["Player_Name"],
                            true
                        );

                        return;
                    }

                    // All Cities by Rank

                    tableModel.setData(
                        AllianceCitiesArr.map(createRowData)
                    );

                    tableModel.sortByColumn(
                        window.columnIndexMap["Player_Ranking"],
                        true
                    );
                }

                function updateFooterWithOldestTimestamp() {
                    const validTimestamps = AllianceCitiesArr.map(city => new Date(city.processedTimestamp)).filter(date => date instanceof Date && !isNaN(date.getTime()) && date.getTime() > 0);
                    const oldestTimestamp = validTimestamps.length > 0 ? new Date(Math.min(...validTimestamps)) : null;
                    let footnoteAtom = allianceCitiesFooterContainer.getUserData("footnoteAtom");
                    if (!footnoteAtom) {
                        footnoteAtom = new qx.ui.basic.Atom();
                        allianceCitiesFooterContainer.add(footnoteAtom);
                        allianceCitiesFooterContainer.setUserData("footnoteAtom", footnoteAtom);
                    }
                    if (oldestTimestamp) {
                        const timeDifference = Date.now() - oldestTimestamp.getTime();
                        const formattedTime = msToTime(timeDifference);
                        footnoteAtom.setLabel(`Oldest Processed Timestamp: ${formattedTime} ago`);
                    } else {footnoteAtom.setLabel("Oldest Processed Timestamp: No data available")}
                    footnoteAtom.setTextColor("darkgreen");
                }
                updateFooterWithOldestTimestamp();
                return allianceCitiesFooterContainer;
            }


            function filterCitiesByOffenseLevel(levelRank) {
                const filteredCities = Object.values(AllianceCitiesArr.reduce((map, city) => {
                    (map[city.Player_Id] = map[city.Player_Id] || []).push(city);
                    return map;
                }, {})).map(cities => {
                    cities.sort((a, b) => b.Base_Offense_Level - a.Base_Offense_Level);
                    return cities[levelRank - 1] && cities[levelRank - 1].Base_Offense_Level > 0 ? cities[levelRank - 1] : null;
                }).filter(Boolean);

                filteredCities.sort((a, b) =>
                                    b.Base_Offense_Level - a.Base_Offense_Level
                                   );
                tableModel.setData(filteredCities.map(createRowData));
            }

            function filterCitiesByDefenseLevel(levelRank) {

                const filteredCities = Object.values(

                    AllianceCitiesArr.reduce((map, city) => {

                        (map[city.Player_Id] = map[city.Player_Id] || []).push(city);

                        return map;

                    }, {})

                ).map(cities => {

                    cities.sort(
                        (a, b) =>
                        b.Base_Defense_Level - a.Base_Defense_Level
                    );

                    return cities[levelRank - 1] &&
                        cities[levelRank - 1].Base_Defense_Level > 0
                        ? cities[levelRank - 1]
                    : null;

                }).filter(Boolean);

                filteredCities.sort((a, b) =>
                                    b.Base_Defense_Level - a.Base_Defense_Level
                                   );

                tableModel.setData(
                    filteredCities.map(createRowData)
                );

            }

            function addCityRow(cityData) {
                const cityId = cityData.Base_Id;
                if (Object.values(cityData).every(value => value !== null)) {
                    if (cityRowMap.hasOwnProperty(cityId)) {
                        tableModel.setRows([createRowData(cityData)], cityRowMap[cityId]);
                    } else {
                        cityRowMap[cityId] = tableModel.getRowCount();
                        tableModel.addRows([createRowData(cityData)]);
                    }
                }
            }

            // ======== Peristente Einbindung der Profilsortirung ==========

            AllianceCitiesArr.forEach(addCityRow);

            applyAllianceCitiesProfileSorting();

            eventBus.subscribe("cityDataAdded", (e) => addCityRow(e.getData()));
            return allianceCitiesTab;
        }

function tabSettings() {
    const settingsTab = new qx.ui.tabview.Page("Konfiguration");
    settingsTab.setLayout(new qx.ui.layout.VBox());

    const layout = new qx.ui.container.Composite(
        new qx.ui.layout.HBox(10)
    );

    const navigation = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(8)
    );

    navigation.setWidth(200);
    navigation.setPaddingTop(8);


    const content = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(10)
    );

    const pageContainer = new qx.ui.container.Composite(
        new qx.ui.layout.VBox(10)
    );

    pageContainer.add(
        new qx.ui.basic.Label("Bitte links einen Bereich auswählen.")
    );

    content.add(pageContainer);


    const btnAlliance = new qx.ui.form.Button("Alliance Cities");
    btnAlliance.addListener("execute", function () {
        showAllianceCitiesPage(pageContainer);
    });

    navigation.add(btnAlliance);

    const btnPoi = new qx.ui.form.Button("Points of Interest");

    btnPoi.addListener("execute", function () {
        showPointsOfInterestPage(pageContainer);
    });

    navigation.add(btnPoi);


    const btnExport = new qx.ui.form.Button("Export");

    btnExport.addListener("execute", function () {
        showExportPage(pageContainer);
    });

    navigation.add(btnExport);

    const btnProfile = new qx.ui.form.Button("Profile");

    btnProfile.addListener("execute", function () {
        showProfilePage(pageContainer);
    });

    navigation.add(btnProfile);

    layout.add(navigation);
    layout.add(content, { flex: 1 });

    settingsTab.add(layout, { flex: 1 });

    function showColumnConfiguration(pageContainer, title, columns) {

        clearPage(pageContainer, title);

        const displaySection = new qx.ui.container.Composite(
            new qx.ui.layout.HBox(30)
        );

        const leftDisplay = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(10)
        );

        const rightDisplay = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(10)
        );

        displaySection.add(leftDisplay, { flex: 1 });
        displaySection.add(rightDisplay, { flex: 1 });


        // ====================================================
        // Standard wiederherstellen - Restore default settings
        // ====================================================

        const btnRestoreDefaults = new qx.ui.form.Button(
            "Standard wiederherstellen"
        );

        btnRestoreDefaults.set({
            width: 350,
            allowGrowX: false,
            alignX: "center",
            height: 34,
            font: new qx.bom.Font(16).set({
                bold: true
            })
        });

        // ========================================
        // Funktionsbutton "My Cities"
        // ========================================

        function filterCitiesView(view) {

            if (view === "My Cities") {

                const myId = ClientLib.Data.MainData
                .GetInstance()
                .get_Player()
                .get_Id();

                const myCities = AllianceCitiesArr.filter(
                    city => city.Player_Id === myId
                );

                tableModel.setData(
                    myCities.map(createRowData)
                );

                return;
            }

            // All Cities
            applyProfileStartAction();

        }

        // ========================================
        // Klick auf "Standard wiederherstellen"
        // Alle Checkboxen auf ihre Standardwerte setzen.
        // ========================================

        btnRestoreDefaults.addListener("execute", function () {

            columns.forEach(column => {


                if (column.checkBox) {
                    column.checkBox.setValue(column.default);
                }

            });

        });

        pageContainer.add(btnRestoreDefaults);

        pageContainer.add(displaySection);
        pageContainer.add(displaySection);

        const orderSection = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(5)
        );

        orderSection.set({
            width: 800,
            allowGrowX: false,
            alignX: "center",
            padding: 10,
            backgroundColor: "rgba(120, 120, 120, 0.25)",
            decorator: new qx.ui.decoration.Decorator()
            .set({
                width: 1,
                color: "#666666",
                radius: 6
            })
        });

        const orderTitle = new qx.ui.basic.Label(
            "Spaltenreihenfolge wird durch verschieben der Spalten geändert"
        );

        orderTitle.set({
            font: new qx.bom.Font(14).set({
                bold: true
            }),
            alignX: "center"
        });

        orderSection.add(orderTitle);

        const orderScroll = new qx.ui.container.Scroll();

        orderScroll.set({
            height: 320,
            minHeight: 320,
            maxHeight: 320
        });

        const orderColumns = new qx.ui.container.Composite(
            new qx.ui.layout.HBox(30)
        );

        const orderListLeft = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(2)
        );

        const orderListMiddle = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(2)
        );

        const orderListRight = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(2)
        );

        orderColumns.add(orderListLeft, { flex: 1 });
        orderColumns.add(orderListMiddle, { flex: 1 });
        orderColumns.add(orderListRight, { flex: 1 });

        orderScroll.add(orderColumns);
        orderSection.add(orderScroll);

        pageContainer.add(orderSection);


        const sections = {};

        columns.forEach(column => {

            if (!sections[column.category]) {

                const targetContainer =
                      (column.category === "general" ||
                       column.category === "production" ||
                       column.category === "defense")
                ? leftDisplay
                : rightDisplay;

                sections[column.category] = addSection(
                    targetContainer,
                    categories[column.category] || column.category
                );

            }

            const checkBox = new qx.ui.form.CheckBox(column.label);

            // - checkBox.setFont("bold");

            checkBox.set({
                font: new qx.bom.Font(13)
            });

            column.checkBox = checkBox;

            const allianceCitiesSettings =
                  window.harzi.core.settings.data.tables.allianceCities;

            let visibleColumns;

            if (
                Array.isArray(allianceCitiesSettings.order) &&
                allianceCitiesSettings.order.length > 0
            ) {
                visibleColumns = allianceCitiesSettings.order;
            } else {
                visibleColumns =
                    window.harzi.core.settings.defaults.tables.allianceCities.initialView;
            }

            checkBox.setValue(
                visibleColumns.includes(column.id)
            );

            checkBox.setEnabled(column.available !== false);

            checkBox.addListener("changeValue", function () {

                const allianceCitiesSettings =
                      window.harzi.core.settings.data.tables.allianceCities;

                if (
                    !Array.isArray(allianceCitiesSettings.order) ||
                    allianceCitiesSettings.order.length === 0
                ) {

                    allianceCitiesSettings.order =
                        [...allianceCitiesSettings.initialView];

                }

                const order = allianceCitiesSettings.order;

                if (checkBox.getValue()) {

                    if (!order.includes(column.id)) {
                        order.push(column.id);
                    }

                } else {

                    const index = order.indexOf(column.id);

                    if (index !== -1) {
                        order.splice(index, 1);
                    }

                }

                window.harzi.core.settings.save();

                const columnIndex =
                      window.columnIndexMap[column.field];

                if (columnIndex >= 0) {

                    window.allianceCitiesTable
                        .getTableColumnModel()
                        .setColumnVisible(
                        columnIndex,
                        checkBox.getValue()
                    );

                    const currentOrder =
                          window.harzi.core.settings.data.tables.allianceCities.order;

                    if (
                        Array.isArray(currentOrder) &&
                        currentOrder.length > 0
                    ) {

                        const tableColumnModel =
                              window.allianceCitiesTable.getTableColumnModel();

                        const orderedColumnIndices =
                              currentOrder
                        .map(columnId => {

                            const definition =
                                  window.columnDefinitions.allianceCities.find(
                                      definition => definition.id === columnId
                                  );

                            if (!definition) {
                                return null;
                            }

                            return window.columnIndexMap[definition.field];

                        })
                        .filter(index => index != null);

                        const allColumnIndices =
                              Array.from(
                                  {
                                      length:
                                      tableColumnModel.getOverallColumnCount()
                                  },
                                  (_, index) => index
                              );

                        const remainingColumnIndices =
                              allColumnIndices.filter(
                                  index => !orderedColumnIndices.includes(index)
                              );

                        const completeColumnOrder = [
                            ...orderedColumnIndices,
                            ...remainingColumnIndices
                        ];

                        tableColumnModel.setColumnsOrder(
                            completeColumnOrder
                        );

                        window.updateColumnOrderList();

                    }

                }

            });
            const section = sections[column.category];

            if (section.count % 2 === 0) {
                section.left.add(checkBox);
            } else {
                section.right.add(checkBox);
            }

            section.count++;

        });


        function updateColumnOrderList() {

            orderListLeft.removeAll();
            orderListMiddle.removeAll();
            orderListRight.removeAll();

            const allianceCitiesSettings =
                  window.harzi.core.settings.data.tables.allianceCities;

            let visibleColumns;

            if (
                Array.isArray(allianceCitiesSettings.order) &&
                allianceCitiesSettings.order.length > 0
            ) {

                visibleColumns =
                    allianceCitiesSettings.order;

            } else {

                visibleColumns =
                    window.harzi.core.settings.defaults.tables
                    .allianceCities.initialView;

            }

            const columnsPerList =
                  Math.ceil(visibleColumns.length / 3);

            visibleColumns.forEach((columnId, index) => {

                const column =
                      window.columnDefinitions.allianceCities.find(
                          column => column.id === columnId
                      );

                if (!column) {
                    return;
                }

                const row = new qx.ui.container.Composite(
                    new qx.ui.layout.HBox(8)
                );

                row.set({
                    height: 28,
                    paddingLeft: 8,
                    paddingRight: 8
                });

                const grip =
                      new qx.ui.basic.Label("☷");

                const position =
                      new qx.ui.basic.Label(
                          `${index + 1}.`
            );

                position.setWidth(30);

                const label =
                      new qx.ui.basic.Label(
                          column.label
                      );

                row.add(grip);
                row.add(position);
                row.add(label);

                if (index < columnsPerList) {

                    orderListLeft.add(row);

                } else if (index < columnsPerList * 2) {

                    orderListMiddle.add(row);

                } else {

                    orderListRight.add(row);

                }

            });

        }

        window.updateColumnOrderList = updateColumnOrderList;

        window.updateColumnOrderList();

        validateColumnDefinitions();

    }
    // =============================================
    // Hier beginnen die Konfigurationsseitenaufrufe
    // =============================================

    function showAllianceCitiesPage(pageContainer) {

        showColumnConfiguration(
            pageContainer,
            "Alliance Cities",
            columnDefinitions.allianceCities
        );

    }

    function showPointsOfInterestPage(pageContainer) {

        pageContainer.removeAll();

        clearPage(pageContainer, "Points of Interest");

        pageContainer.add(
            new qx.ui.basic.Label("Hier werden später die Einstellungen für Points of Interest angezeigt.")
        );

    }
    function showExportPage(pageContainer) {

        pageContainer.removeAll();

        clearPage(pageContainer, "Export");

        pageContainer.add(
            new qx.ui.basic.Label("Hier werden später die Exporteinstellungen angezeigt.")
        );

    }

    function createSettingRow(labelText, control) {

        const row = new qx.ui.container.Composite(
            new qx.ui.layout.HBox(10)
        );

        const label = new qx.ui.basic.Label(labelText);

        label.setWidth(180);

        row.add(label);
        row.add(control);

        return row;

    }

    // Hier beginnt die Profil Seite

    // ===== Profile Layout =====

    const PROFILE_LEFT_MARGIN = 25;
    const PROFILE_LABEL_WIDTH = 140;
    const PROFILE_CONTROL_WIDTH = 260;
    const PROFILE_ROW_SPACING = 15;



    window.profileStartAction = "Keine";

    function sortAllianceCities(field, ascending = true) {

        if (!window.allianceCitiesTable) {
            return;
        }

        const sortedCities = [...AllianceCitiesArr];

        sortedCities.sort((a, b) => {

            let av = a[field];
            let bv = b[field];

            // null behandeln
            if (av == null) av = "";
            if (bv == null) bv = "";

            // Text
            if (typeof av === "string") {

                return ascending
                    ? av.localeCompare(bv)
                : bv.localeCompare(av);

            }

            // Zahlen
            return ascending
                ? av - bv
            : bv - av;

        });

        const model = window.allianceCitiesTable.getTableModel();
        console.table(
            sortedCities.slice(0, 20).map(c => ({
                Player: c.Player_Name,
                Off: c.Base_Offense_Level
            }))
        );
        model.setData(
            sortedCities.map(createRowData)
        );

    }

    function applyProfileStartAction() {

        if (!window.allianceCitiesTable) {
            return;
        }

        const model = window.allianceCitiesTable.getTableModel();

        switch (window.profileStartAction) {

            case "Rangliste":

                model.sortByColumn(
                    window.columnIndexMap["Player_Ranking"],
                    true
                );

                break;

            case "Name":

                model.sortByColumn(
                    window.columnIndexMap["Player_Name"],
                    true
                );

                break;

            case "Original":
            default:

                model.sortByColumn(
                    window.columnIndexMap["Player_Id"],
                    true
                );

                break;

            case "Tiberium/h":

                model.sortByColumn(
                    window.columnIndexMap["Base_Tiberium_per_Hour"],
                    false
                );

                break;

            case "Kristall/h":

                model.sortByColumn(
                    window.columnIndexMap["Base_Crystal_per_Hour"],
                    false
                );

                break;

            case "Strom/h":

                model.sortByColumn(
                    window.columnIndexMap["Base_Power_per_Hour"],
                    false
                );

                break;

            case "Credits/h":

                model.sortByColumn(
                    window.columnIndexMap["Base_Credit_per_Hour"],
                    false
                );

                break;

            case "Höchste Off":

                window.harziStartHighestOff();

                break;

            case "Höchste Deff":

                window.harziStartHighestDeff();

                break;


        }

    }

    function showProfilePage(pageContainer) {

        pageContainer.removeAll();

        clearPage(pageContainer, "Profile");

        const settings =
              window.harzi.core.settings.data;

        if (settings?.profiles?.startAction) {
            window.profileStartAction =
                settings.profiles.startAction;
        } else {
            window.profileStartAction = "Keine";
        }

        const profileContainer = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(10)
        );

        const startActionSelect =
              new qx.ui.form.SelectBox();
        startActionSelect.setWidth(PROFILE_CONTROL_WIDTH);

        // - Befüllung des Dropdown Menüs unter Profile

        startActionSelect.add(
            new qx.ui.form.ListItem("Original")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Name")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Rangliste")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Off")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Deff")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Tib-Produktion je Basis")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Kristall-Produktion je Basis")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Strom-Produktion je Basis")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Höchste Credits-Produktion je Basis")
        );

        startActionSelect.add(
            new qx.ui.form.ListItem("Eigener Account")
        );

        const items = startActionSelect.getSelectables();

        const selectedItem = items.find(
            item => item.getLabel() === window.profileStartAction
        );

        if (selectedItem) {
            startActionSelect.setSelection([selectedItem]);
        } else if (items.length > 0) {
            startActionSelect.setSelection([items[0]]);
        }

        startActionSelect.addListener("changeSelection", function () {

            window.profileStartAction =
                startActionSelect.getSelection()[0].getLabel();

            window.harzi.core.settings.data.profiles.startAction =
                window.profileStartAction;

            window.harzi.core.settings.save();

            applyProfileStartAction();

        });

        const startActionRow = new qx.ui.container.Composite(
            new qx.ui.layout.HBox(PROFILE_ROW_SPACING)
        );

        startActionRow.setMarginLeft(25);

        const startActionLabel = new qx.ui.basic.Label("Startaktion");

        startActionLabel.setWidth(140);
        startActionLabel.setTextAlign("right");

        startActionRow.add(startActionLabel);
        startActionRow.add(startActionSelect);

        profileContainer.add(startActionRow);

        pageContainer.add(profileContainer);

    }

    function clearPage(pageContainer, title) {

        pageContainer.removeAll();

        const titleLabel = new qx.ui.basic.Label(title);

        titleLabel.set({
            font: new qx.bom.Font(15).set({
                bold: true
            })
        });

        pageContainer.add(titleLabel);

    }

    function addSection(pageContainer, title) {

        pageContainer.add(
            new qx.ui.basic.Label("")
        );

        const sectionLabel = new qx.ui.basic.Label(title);

        sectionLabel.set({
            font: new qx.bom.Font(16).set({
                bold: true
            })
        });

        pageContainer.add(sectionLabel);

        const row = new qx.ui.container.Composite(
            new qx.ui.layout.HBox(20)
        );

        const leftColumn = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(5)
        );

        const rightColumn = new qx.ui.container.Composite(
            new qx.ui.layout.VBox(5)
        );

        row.add(leftColumn, { flex: 1 });
        row.add(rightColumn, { flex: 1 });

        pageContainer.add(row);

        return {
            left: leftColumn,
            right: rightColumn,
            count: 0
        };

    }

    const categories = {
        general: "Allgemein",
        base: "Basis",
        production: "Produktion",
        military: "Militär",
        poi: "Points of Interest",
        support: "Support",
        other: "Sonstiges"
    };

    return settingsTab;
}
// Points Of Interest UI
async function tabPointsOfInterest(tabView, data) {
    const existingTab = tabView.getChildren().find(tab => tab.getLabel() === "Points of Interest");
    if (existingTab) {
        const tableModel = existingTab.getUserData("tableModel");
        cleanupHoldersButtons();
        updateTableData(data, tableModel);
        updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
        return;
    }
    let activeButtonIds = [];
    const poiTimestampKey = wid + 'poiTimestampLabel';
    const poiTab = new qx.ui.tabview.Page("Points of Interest");
    poiTab.setLayout(new qx.ui.layout.VBox());
    const tableModel = new qx.ui.table.model.Simple();
    console.log(tableModel);
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(tableModel)));
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(tableModel)));
    tableModel.setColumns(Object.keys(poiTemplate));
    poiTab.setUserData("tableModel", tableModel);
    const storedTimestamp = await Lister.get(poiTimestampKey);
    const poiTimestamp = new qx.ui.basic.Atom().set({label: storedTimestamp ? `Last POI scan age: ${msToTime(Date.now() - storedTimestamp)}` : "No data available... Refresh required.", textColor: "darkgreen"});
    const poiNameSelectBox = new qx.ui.form.SelectBox().set({toolTipText: "Filter POIs by name/type"});
    const poiOwnerSelectBox = new qx.ui.form.SelectBox().set({width: 170,toolTipText: "Filter POIs by owner"});
    updateTableData(data, tableModel);
    updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
    const poiTable = new qx.ui.table.Table(tableModel);
    poiTable.getChildControl("statusbar").setTextColor("darkgreen");
    // Apply cell renderers to specific columns
    [1, 3, 4, 5, 6, 8].forEach(index => poiTable.getTableColumnModel().setDataCellRenderer(index, new qx.ui.table.cellrenderer.Html()));
    // Add custom renderer for Holders column
    class HoldersButtonRenderer extends qx.ui.table.cellrenderer.Abstract {
        createDataCellHtml(cellInfo, htmlArr) {
            const holders = cellInfo.value || [];
            const buttonId = `btn-holders-${cellInfo.row}`;
            const buttonLabel = `${holders.length} Holders`;
            activeButtonIds.push(buttonId);
            htmlArr.push(`<div><button id="${buttonId}" style="cursor:pointer; padding:2px 5px; font-size:11px;">${buttonLabel}</button></div>`);
            setTimeout(() => {
                const buttonElement = document.getElementById(buttonId);
                if (buttonElement) {buttonElement.addEventListener("click", () => showHoldersPopup(holders))}
            }, 10);
        }
    }
    poiTable.getTableColumnModel().setDataCellRenderer(0, new HoldersButtonRenderer());
    // Add POI Table and Footer to Tab
    const poiFooterContainer = buildPoiFooterContainer(data, tableModel, poiNameSelectBox, poiOwnerSelectBox);
    poiTab.add(poiTable, {flex: 1});
    poiTab.add(poiFooterContainer);
    return poiTab;
    // Event subscription for data refresh
    eventBus.subscribe("POIs_Refreshed", async (e) => {
        const refreshedData = e.getData();
        tabView.setUserData("poiData", refreshedData);
        updateTableData(refreshedData, tableModel);
        updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, refreshedData);
        await Lister.set(poiTimestampKey, Date.now());
        poiTimestamp.setLabel(`Last POI scan age: ${msToTime(Date.now() - (await Lister.get(poiTimestampKey)))}`);
    });
    // Helper Functions
    function updateTableData(filteredData, tableModel) {
        const tableData = filteredData.map(poi => Object.keys(poiTemplate).map(key => poi[key]));
        tableModel.setData(tableData);
        filteredData.forEach((poi, index) => {
            const formattedScore = webfrontend.phe.cnc.gui.util.Numbers.formatNumbers(poi.Score ?? 0);
            const formattedDistance = Math.round(poi.Distance);
            const [x, y] = poi.Coords.split(":");
            const coordsLink = webfrontend.gui.util.BBCode.createCoordsLinkText(poi.Coords, parseInt(x), parseInt(y));
            const allianceLink = poi.Alliance && poi.Alliance.trim() ? webfrontend.gui.util.BBCode.createAllianceLinkText(poi.Alliance) : "No Alliance";
            const formattedValues = {
                Coords: coordsLink,
                Alliance: allianceLink,
                Score: formattedScore,
                Distance: formattedDistance,
                Holders: poi.Holders || [] // Ensure Holders data is an array
            };
            Object.keys(formattedValues).forEach(key => {
                const col = Object.keys(poiTemplate).indexOf(key);
                if (col !== -1) {tableModel.setValue(col, index, formattedValues[key])}
            });
        });
    }

    function showHoldersPopup(holders) {
        if (!holders || holders.length === 0) {
            alert("No Holders data available.");
            return;
        }
        const holderDetails = holders.map((holder, idx) => `
					<p>
					<strong>Holder ${idx + 1}</strong><br>
					<strong>Base:</strong> ${holder.Base || "N/A"}<br>
					<strong>Player:</strong> ${webfrontend.gui.util.BBCode.createPlayerLinkText(holder.Player) || "N/A"}<br>
					<strong>Alliance:</strong> ${webfrontend.gui.util.BBCode.createAllianceLinkText(holder.Alliance) || "N/A"}<br>
					<strong>Coords:</strong> ${webfrontend.gui.util.BBCode.createCoordsLinkText(holder.Coords, parseInt(holder.Coords.split(":")[0]), parseInt(holder.Coords.split(":")[1])) || "N/A"}<br>
                    <strong>Distance:</strong> ${holder.Distance || "N/A"}
					</p>
				`).join("");
                const dialog = new qx.ui.window.Window().set({caption: "Holders Details", layout: new qx.ui.layout.VBox(), width: 230, height: 360, backgroundColor: "lightgrey"});
                const content = new qx.ui.basic.Label(holderDetails).set({rich: true, backgroundColor: "lightgrey", padding: 5, opacity: 0.7});
                const scroll = new qx.ui.container.Scroll();
                scroll.add(content);
                dialog.add(scroll, {flex: 1});
                dialog.center();
                dialog.open();
            }

            function cleanupHoldersButtons() {
                activeButtonIds.forEach(buttonId => {
                    const buttonElement = document.getElementById(buttonId);
                    if (buttonElement) {buttonElement.replaceWith(buttonElement.cloneNode(true))} // Clone to remove all listeners
                });
                activeButtonIds = []; // Reset the tracking list
            }

            function buildPoiFooterContainer(data, tableModel, poiNameSelectBox, poiOwnerSelectBox) {
                const refreshButton = new qx.ui.form.Button("Refresh", Icons.Refresh).set({toolTipText: "Refresh POIs"});
                const downloadButton = new qx.ui.form.Button("Download TSV", Icons.Download).set({toolTipText: "Download table data in TSV (tab-separated values) format."});
                refreshButton.addListener("execute", getPOIs);
                downloadButton.addListener("execute", () => {getTSV(AllPOIs, "POIs")});
                poiNameSelectBox.addListener("changeSelection", applyFilters);
                poiOwnerSelectBox.addListener("changeSelection", applyFilters);
                updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data);
                const container = new qx.ui.container.Composite(new qx.ui.layout.HBox());
                container.add(refreshButton);
                container.add(downloadButton);
                container.add(poiNameSelectBox);
                container.add(poiOwnerSelectBox);
                container.add(poiTimestamp);
                return container;
            }

            function updateSelectBoxes(poiNameSelectBox, poiOwnerSelectBox, data) {
                const uniqueNames = Array.from(new Set(data.map(poi => poi.Name)));
                const uniqueAlliances = Array.from(new Set(data.map(poi => poi.Alliance || "No Alliance")));
                poiNameSelectBox.removeAll();
                poiNameSelectBox.add(new qx.ui.form.ListItem("All Names"));
                uniqueNames.forEach(name => poiNameSelectBox.add(new qx.ui.form.ListItem(name)));
                poiOwnerSelectBox.removeAll();
                poiOwnerSelectBox.add(new qx.ui.form.ListItem("All Alliances"));
                uniqueAlliances.forEach(alliance => {
                    const listItem = new qx.ui.form.ListItem(alliance);
                    if (alliance === "No Alliance") {
                        listItem.setIcon("webfrontend/battleview/neutral/gui/icn_mutants.png");
                        listItem.setTextColor("yellow");
                    }
                    poiOwnerSelectBox.add(listItem);
                });
            }

            function applyFilters() {
                const nameSelection = poiNameSelectBox.getSelection()[0];
                const allianceSelection = poiOwnerSelectBox.getSelection()[0];
                const selectedName = nameSelection ? nameSelection.getLabel() : "All Names";
                const selectedAlliance = allianceSelection ? allianceSelection.getLabel() : "All Alliances";
                let filteredData = tabView.getUserData("poiData") || data;
                if (selectedName !== "All Names") {filteredData = filteredData.filter(poi => poi.Name === selectedName)}
                if (selectedAlliance === "No Alliance") {filteredData = filteredData.filter(poi => !poi.Alliance || poi.Alliance.trim() === "")}
                else if (selectedAlliance !== "All Alliances") {filteredData = filteredData.filter(poi => poi.Alliance === selectedAlliance)}
                updateTableData(filteredData, tableModel);
            }
        }
/*
         * Helper functions
         */

// ========================================
// Settings
// ========================================

const SETTINGS_STORAGE_KEY = "HarziEdition.Settings";


function validateColumnDefinitions() {

    const templateFields = new Set(Object.keys(AllianceCitiesTemplate));
    const usedFields = new Set();

    window.columnDefinitions.allianceCities.forEach(column => {

        if (!column.field) {
            console.warn("[Harzi] FEHLT field:", column.id);
            return;
        }

        if (!templateFields.has(column.field)) {

            console.group("[Harzi] Feld existiert nicht im Template: " + column.field);

            console.log("Vorhandene Felder:");
            console.table([...templateFields].sort());

            console.groupEnd();

        }

        if (usedFields.has(column.field)) {
            console.warn("[Harzi] Doppeltes field:", column.field);
        }

        usedFields.add(column.field);

    });



}

function getSelectedAllianceCityData() {


    const selectedFields = window.columnDefinitions.allianceCities
    .filter(col => col.checkBox && col.checkBox.getValue() && col.field)
    .map(col => col.field);


    return AllianceCitiesArr.map(city => {
        const result = {};

        selectedFields.forEach(field => {
            result[field] = city[field];
        });

        return result;
    });
}
// Array formatter to TSV file download
function getTSV(data, name) {
    if (!data || data.length === 0) {
        console.warn("No data available for TSV export.");
        return;
    }
    const flattenValue = (value) => {// Recursively process objects/arrays to a flat TSV-safe string
        if (Array.isArray(value)) {// Process sub-arrays recursively
            return value.map(flattenValue).join("‖"); // Unicode separator for sub-arrays
        } else if (value && typeof value === "object") {// Process objects as key-value pairs
            return Object.entries(value).map(([key, val]) => `${key}:${flattenValue(val)}`).join("¦"); // Unicode separator for object key-values
        } else {// Replace tabs in raw values to avoid breaking TSV
            return String(value || "").replace(/\t/g, " ");
        }
    }
    const headers = Object.keys(data[0]).join("\t");
    const rows = data.map(item => Object.values(item).map(flattenValue).join("\t")).join("\n");
    const tsvContent = `data:text/tab-separated-values;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(tsvContent);
    const downloadLink = document.createElement("a");
    downloadLink.href = encodedUri;
    downloadLink.download = `${new Date().toISOString().slice(0, 10)}_${wid}_${name}.tsv`;
    downloadLink.dispatchEvent(new MouseEvent("click"));
}

// Progress bar
function progressBar(pbIndex, pbLength, pbName, targetContainer = null) {
    const optionsBar = qxApp.getOptionsBar().getLayoutParent().getChildren()[0].getChildren()[2];
    const container = targetContainer ? targetContainer : optionsBar;
    let pbContainer = container.getChildren().find(child => child.getUserData("pbContainer"));
    if (!pbContainer) {
        pbContainer = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({padding: 0, width: 115, decorator: new qx.ui.decoration.Decorator().set({width: 1, style: "solid", color: "black", backgroundColor: "transparent"})});
        pbContainer.setUserData("pbContainer", true);
        targetContainer ? container.add(pbContainer) : optionsBar.addAt(pbContainer, 1);
    }
    let pb = pbContainer.getChildren()[0];
    if (!pb) {
        pb = new qx.ui.basic.Label();
        pb.set({value: `${pbIndex} / ${pbLength} ${pbName}`, width: 0, height: 11, maxWidth: 113, textColor: "black", font: qx.bom.Font.fromString("9px tahoma"), backgroundColor: "white", decorator: "main"});
        pbContainer.add(pb);
    }
    pb.set({value: `${pbIndex} / ${pbLength} ${pbName}`, width: pbIndex / pbLength * pb.getMaxWidth()});
    pbIndex === pbLength ? pbContainer.getLayoutParent().remove(pbContainer) : null;
}
// Convert milliseconds to time format "hh:mm:ss:mmm"
function msToTime(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    const millisecondsLeft = Math.floor(milliseconds % 1000);
    return `${hours.toString().padStart(2, '0')}h:${minutes.toString().padStart(2, '0')}m:${seconds.toString().padStart(2, '0')}s:${millisecondsLeft.toString().padStart(3, '0')}ms`;
}
// Returns angle, distance, clock position (the relative direction of your object coords (1st and 2nd arguments) described using the analogy of a 12-hour clock to describe angles and directions) or sector between 2 points... The 2nd point (4th and 5th arguments) is the center by default... can be replaced with any other object coords. Example usage: calculateMetric(407, 390, 'clock', 400, 400); or calculateMetric(407, 390, 'sector');
function calculateMetric(xB, yB, metricType, xA = centerX, yA = centerY) {
    const deltaX = xB - xA;
    const deltaY = yB - yA;
    const calculations = {
        angle: () => (360 + Math.atan2(deltaY, deltaX) * (180 / Math.PI)) % 360,
        distance: () => Math.hypot(deltaX, deltaY),
        sector: () => {
            if (xA !== centerX || yA !== centerY) {throw new Error("The 'sector' metric can only be calculated from the default center coordinates.")}
            const angle = (Math.atan2(centerX - xB, yB - centerY) * sectorNames.length) / (2 * Math.PI) + sectorNames.length + 0.5;
            return qxApp.tr(`tnf:${sectorNames[Math.floor(angle) % sectorNames.length]} abbr`);
        },
        clock: () => {
            const angle = Math.atan2(yA - yB, xA - xB);
            const normalizedAngle = (angle * 180 / Math.PI + 90 + 360) % 360; // Shift by 90 degrees for clock alignment
            const clockIndex = Math.round((normalizedAngle / 360) * 12) % 12;
            return clockPositions[clockIndex];
        }
    };
    if (!calculations[metricType]) {throw new Error("Invalid metricType. Use 'angle', 'distance', 'sector', or 'clock'.")}
    return calculations[metricType]();
}
function getPollFunction() {
    const proto = ClientLib.Net.CommunicationManager.prototype;
    for (const key of Object.keys(proto)) {
        const fn = proto[key];
        if (typeof fn === 'function' && fn.toString().includes('"Poll"')) {
            // Attach to prototype for easy use
            if (typeof communicationManager.$Poll !== 'function') {
                Object.defineProperty(ClientLib.Net.CommunicationManager.prototype, '$Poll', {
                    configurable: true,
                    get: () => {return this[key]} // This is the obfuscated name for "Poll"
                });
                console.info(`%cPoll function name: ${key}`, "overflow: hidden; color: #fff; background-color: #000; background-image: linear-gradient(black, grey); padding: 3px; border: 1px solid black; border-radius: 5px;");
            }
            return fn; // This is the "Poll" function reference
        }
    }
    return null;
}
/*
         * Initialization logic
         */
// Add Scripts menu entries
function init() {
    const scriptsButton = qxApp.getMenuBar().getScriptsButton();
    const listerMenuItem = scriptsButton.Add("Lister UI - Harzi Edition", Icons.Lister);
    const listerItem = scriptsButton.getMenu().getChildren().find(item => item.getLabel() === "Lister UI - Harzi Edition");
    listerItem.set({
        toolTip: (new qx.ui.tooltip.ToolTip(
            `CnC-TA Lister UI - Harzi Edition<br>` +
            `Original by <a target="_blank" href="https://github.com/ffi82/CnC-TA" style="color:white">ffi82</a><br>` +
            `Further developed by <b>Harzi66</b>`
    )).set({ rich: true }),
                blockToolTip: false
            });
            listerItem.addListener('execute', mainUI);
            console.log(`%c${scriptName} loaded`, 'background: #c4e2a0; color: darkred; font-weight:bold; padding: 3px; border: 1px solid black; border-radius: 5px;');
        }
init();
}
ListerUIScript();
})();
