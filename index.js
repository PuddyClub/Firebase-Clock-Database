// Module
const clock_module = {};

// Start Module
clock_module.new = function (data = {}, exportBase = null) {

    try {

        // Exist Data
        const objType = require('puddy-lib/get/objType');
        if (objType(data, 'object')) {

            // Prepare Functions
            const functions = require('firebase-functions');

            // Lodash Module
            const _ = require('lodash');

            // Create Settings
            const tinyCfg = _.defaultsDeep({}, data.firebase, {
                options: {
                    id: "main",
                    autoStart: {
                        database: true
                    }
                }
            });

            // Create Clock Settings
            const clockCfg = _.defaultsDeep({}, data.clock, {
                universalTimezone: 'Universal',
                id: 'clock',
                schedule: 'every 1 minutes',
                ref: '',
                timezones: []
            });

            // Custom Module Config
            if (!Array.isArray(data.modules)) {
                data.modules = [];
            }

            // Exist Ref
            let existRef = (typeof clockCfg.ref === "string" && clockCfg.ref.length > 0);

            // Start Firebase
            const firebase = require('puddy-lib/firebase');
            firebase.start(require('firebase-admin'), tinyCfg.options, tinyCfg.firebase);

            // App
            const app = firebase.get(tinyCfg.options.id);
            const moment = require('moment-timezone');
            const clone = require('clone');
            const arrayUniq = require('array-uniq');
            const super_string_filter = require('puddy-lib/get/super_string_filter');

            // For Promise
            const forPromise = require('for-promise');

            // Prepare Custom Module
            const custom_module_manager = require('puddy-lib/libs/custom_module_loader');

            // Nothing Ref
            let db = null;
            if (!existRef) {

                // DB
                db = {

                    // Module
                    module: app.db.ref('module'),

                    // Weeks In Year
                    weeksInYear: app.db.ref('weeksInYear'),

                    // Clock
                    clock: app.db.ref('clock'),

                    // Universal Cache
                    universal_cache: app.db.ref('universal_cache')

                };

            }

            // Exist
            else {

                // DB
                db = {

                    // Module
                    module: app.db.ref(clockCfg.ref).child('module'),

                    // Weeks In Year
                    weeksInYear: app.db.ref(clockCfg.ref).child('weeksInYear'),

                    // Clock
                    clock: app.db.ref(clockCfg.ref).child('clock'),

                    // Universal Cache
                    universal_cache: app.db.ref(clockCfg.ref).child('universal_cache')

                };

            }

            // Clock Generator
            const clock_generator = function (now_timezone) {

                return {

                    // Module
                    module: timezone.module,

                    // Hour
                    hour: now_timezone.hour(),

                    // Hour
                    minute: now_timezone.minute(),

                    // Day
                    day: now_timezone.date(),

                    // Month
                    month: now_timezone.month(),

                    // Month
                    year: now_timezone.year(),

                    // Week Day
                    weekDay: now_timezone.day(),

                    // Year Day
                    yearDay: now_timezone.dayOfYear(),

                    // Week Year
                    weekYear: now_timezone.week(),

                    // Locale Data
                    locale: {

                        // Week Day
                        weekDay: now_timezone.weekday(),

                        // Week Year
                        weekYear: now_timezone.weekYear(),

                    }

                };

            };

            // Function
            const tinyClock = async () => {

                // Custom Module Items
                const custom_module_options = { db: db, tz: {} };

                // Get Timezone List
                let timezone_list = [];
                const timezone_names = moment.tz.names();
                const timezone = { clock: {} };
                const now = moment();

                // Module Name
                timezone.module = 'moment-timezone';
                custom_module_options.module = timezone.module;
                db.module.set(timezone.module);

                // Weeks In Year
                timezone.weeksInYear = now.weeksInYear();
                custom_module_options.weeksInYear = timezone.weeksInYear;
                db.weeksInYear.set(timezone.weeksInYear);

                // Default Timezone List
                if (!Array.isArray(clockCfg.timezones) || clockCfg.timezones.length < 1) {
                    timezone_list = timezone_names;
                }

                // Custom Timezone List
                else {
                    timezone_list = super_string_filter(timezone_names, clockCfg.timezones);
                }

                // Insert Custom Data
                custom_module_options.now = now;
                custom_module_options.timezone_list = timezone_list;

                // Get All Times
                await forPromise(timezone_list, function (item, fn, fn_error) {

                    // Get Timezone
                    if (typeof timezone_list[item] === "string") {

                        // Prepare Database
                        const db_tz = db.clock.child(firebase.databaseEscape(timezone_list[item], true));

                        // New Now
                        const now_timezone = now.tz(timezone_list[item]);

                        // Create Zone
                        const zone = clone(moment.tz.zone(timezone_list[item]));
                        delete zone.untils;

                        // Anti Duplicate
                        zone.abbrs = arrayUniq(zone.abbrs);
                        zone.offsets = arrayUniq(zone.offsets);

                        // New Object
                        timezone.clock[timezone_list[item]] = clock_generator(now_timezone);
                        timezone.clock[timezone_list[item]].zone = clone(zone);

                        // Set Timezone Data
                        db_tz.set(timezone.clock[timezone_list[item]]).then(() => { fn(); }).catch(err => { fn_error(err); });

                        // Insert Custom Data
                        custom_module_options.tz[timezone_list[item]] = {
                            db: db_tz,
                            data: timezone.clock[timezone_list[item]],
                            now: now_timezone
                        };

                    }

                    // Nope
                    else { fn(); }

                    // Complete
                    return;

                });

                // Is String Universal Timezone
                if (typeof clockCfg.universalTimezone === "string" && clockCfg.universalTimezone.length > 0 && custom_module_options.tz[clockCfg.universalTimezone]) {

                    // Universal Timezone
                    const universal_tz = custom_module_options.tz[clockCfg.universalTimezone];

                    // Universal Result
                    const universal_result = [];

                    // Get Values
                    for (let item = 0; i < 13; i++) {

                        // TRABALHAR AQUI! EU PRECISO DE UM SISTEMA QUE DETECTA O TEMPO RESTANTE PARA A PRÓXIMA HORA
                        /* universal_result.push(clock_generator(universal_tz.now).add(-10, 'minutes')); */

                    }

                    // Set Item
                    /* await db.universal_cache.set(universal_result); */

                }

                // Send Custom Module
                await custom_module_manager.run(data.modules, custom_module_options, 'clockUpdate');;

                // Complete
                return;

            };

            // Results
            let results = {};

            // Prepare Result
            if (typeof clockCfg.id === "string" && clockCfg.id.length > 0 && typeof clockCfg.schedule === "string" && clockCfg.schedule.length > 0) {

                // Tester URL
                results[clockCfg.id + 'Test'] = functions.https.onRequest(async (req, res) => {

                    // Make the Test
                    await tinyClock();

                    // Complete Request
                    return res.send('Clock Test Complete!');

                });

                // Main
                results[clockCfg.id] = functions.pubsub.schedule(clockCfg.schedule).onRun(tinyClock);

                if (exportBase) {
                    exportBase[clockCfg.id] = results[clockCfg.id];
                    exportBase[clockCfg.id + 'Test'] = results[clockCfg.id + 'Test'];
                }

            }

            // Alternative
            else { results = tinyClock; }

            // Return
            return results;

        }

        // Nope
        else {

            // Error
            const err = new Error('Start Data Undefined!');

            console.log(err);
            console.log(err.message);
            return null;

        }

    }

    // Error
    catch (err) {
        console.log(err);
        console.log(err.message);
        return null;
    }

};

module.exports = clock_module;