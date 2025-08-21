const fs = require('fs');
require('../tests/specs/app.common.spec.ts');

export const config: WebdriverIO.Config = {
    runner: 'local',
    specs: [],
    capabilities: [],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://the-internet.herokuapp.com',
    waitforTimeout: 5000, // adjust time for retry
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 3 * 60 * 1000, // 3min
    },
    services: [[
        'appium',
        {
            command: 'appium',
            args: {
                relaxedSecurity: true,
                address: 'localhost',
                usePlugins: 'appium-reporter-plugin',
                log: './appium.log',
            },
        },
    ]],
    port: 4723,
    afterTest: async function (
        test, context, { error, result, duration, passed, retries }
    ) {
        const sessionId = driver.sessionId;
        const testName = `${test.title} in ${duration / 1000} s`;
        const boolTestStatus = passed;
        console.log('setTestInfo: %s', testName);
        let testStatus = 'FAILED';
        if (boolTestStatus) {
            testStatus = 'PASSED';
        }

      await global.setTestInfoGlobal(sessionId, testName, testStatus, error);
    },

    after: async function (result, capabilities, specs)  {
        await global.getReportGlobal('andoird');
    },

    before: async function (capabilities, specs) {
        global.getReportGlobal = async function (currentOS) {
            const url = 'http://localhost:4723/getReport';
            const response = await fetch(url).catch(rejected => {
                console.log('*********** Failed to make fetch call in after');
                console.log(rejected);
            });
            const data = await response.text();

            // Create Report File
            const now = new Date();

            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0"); // months are 0-based
            const day = String(now.getDate()).padStart(2, "0");

            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");

            const formatted = `${year}${month}${day}_${hours}${minutes}${seconds}`;
            console.log(formatted);
            const date = global.testModule + `_${formatted}`;

            //const fileName = `Report_${currentOS}_${Math.floor(Date.now() / 1000) }`;
            const fileName = `Report_${currentOS}_${date}`;
            fs.writeFile(`./reports/${fileName}.html`, data, 'utf-8', (err: any) => {
                if (err) throw err;
            });

            // delete report data from plugin
            const urlD = 'http://127.0.0.1:4723/deleteReportData';
            await fetch(urlD, { method: 'DELETE' }).catch(rejected => {
                console.log('*********** Failed to delete report data');
                console.log(rejected);
            });
        };

        // api call to setTestinfo binding is made with params
        global.setTestInfoGlobal = async function (sessionId, testName, testStatus, error) {
            const url = 'http://localhost:4723/setTestInfo';
            const reqBody = {};
            reqBody.sessionId = sessionId;
            reqBody.error = `${error}`;
            reqBody.testName = testName;
            reqBody.testStatus = testStatus;

            await fetch(url, {
                method: 'post',
                body: JSON.stringify(reqBody),
                headers: { 'Content-Type': 'application/json' }
            }).catch(rejected => {
                console.log('*********** Failed to make fetch call');
                console.log(rejected);
            });
        };
    },

};
