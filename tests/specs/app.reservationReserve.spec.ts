var assert = require('assert');
const { RESERVATION_TYPE_RESERVE, DEPARTMENT_PROVIDER } = require('./app.common.spec.ts');
const { sleep, compareTextView, selectFromCalendar } = require('./app.common.spec.ts');

//search textbox
let searchBox;

describe('RESERVE', () => {
    before(async () => {
        global.testUser.isMinor = true;
        global.testModule = 'RSRV';
    });

    describe('Login', () => {
        it('TC1-1: open app', async () => {
            // system notification
            const notification = await driver.$('//android.widget.Button[@resource-id="com.android.permissioncontroller:id/permission_allow_button"]');
            await notification.click();
            await sleep(500);

            // skip
            const skip = await driver.$('//android.widget.TextView[@text="Skip"]');
            await skip.click();
            await sleep(500);

            //TODO: if OTA appears, proceed it
            //OTA
            const ota = await driver.$('//android.view.ViewGroup[@content-desc="Update Now"]');
            console.log('OTA(obj): ', ota);
            console.log('OTA(flg): ', ota.isReactElement);
            if (ota !== null && ota.isReactElement == true) {
                await ota.click();
                await sleep(500);

                //OTA Restart
                const restrat = await driver.$('//android.widget.TextView[@text="Restart"]');
                console.log('Restart: ', restrat);
                if (restrat !== null && restrat.isReactElement == true) {
                    await restrat.click();
                    await sleep(500);
                }
            }
            //Login
            const login = await driver.$('//android.view.ViewGroup[@content-desc="Login"]');
            await login.click();
        });

        it('TC1-2: login', async () => {
            //Login input
            const id = await driver.$('//android.widget.EditText[@text="Email"]');
            await id.setValue(global.testUser.loginEmail);
            const pw = await driver.$('//android.widget.EditText[@text="Password"]');
            await pw.setValue(global.testUser.loginPw);
            const login = await driver.$('(//android.widget.TextView[@text="Login"])[2]');
            await login.click();
            await sleep(1000);

            //TODO: if membership video or newsletter appears
            // get footer (Home)
            const footer = await driver.$('//android.widget.TextView[@text="Home"]');
            assert.equal(await footer.getAttribute('text'), 'Home');
            global.testUser.isLogin = true;
        });
    });

    describe('Make a Researvation (minor)', () => {
        beforeEach(function () {
            if (!global.testUser.isLogin) {
                console.log('User Not LoggedIn!!');
                this.skip();
            }
        });

        it('TC3-1: switch member', async () => {
            // switch member
            let path = '//android.widget.TextView[@text="' + global.testUser.member.firstName + ' ' + global.testUser.member.lastName + '"]';
            const nameAdult = await driver.$(path);
            await nameAdult.click();
            await sleep(500);

            path = '//android.view.ViewGroup[@content-desc="' + global.testUser.memberMinor.firstName + ' ' + global.testUser.memberMinor.lastName + '"]';
            const nameMinor = await driver.$(path);
            await nameMinor.click();
            await sleep(500);
        });
        
        it('TC3-2: click footer Researvation', async () => {

            // click footer Researvation
            const footer = await driver.$('//android.view.View[@content-desc=", Reservations"]');
            await footer.click();
            await sleep(500);

            let title;
            try {
                // check if No Existing Reservations Scheduled
                title = await driver.$('//android.widget.TextView[@text="No Existing Reservations Scheduled"]');
                await title.getAttribute('text');

            // there is a reservation already, so cancel the reservation
            } catch (err) { 
                // click Cancel
                console.log('There is a reservation already!');
                const cancel = await driver.$('(//android.view.ViewGroup[@content-desc="Cancel"])[2]');
                await cancel.click();
                await sleep(500);

                // click Cancel Reservation
                const confirm = await driver.$('//android.view.ViewGroup[@content-desc="Cancel Reservation"]');
                await confirm.click();
                await sleep(1000);

                // "No Existing Reservations Scheduled"
                title = await driver.$('//android.widget.TextView[@text="No Existing Reservations Scheduled"]');
                assert.equal(await title.getAttribute('text'), 'No Existing Reservations Scheduled');
            }
        });

        it('TC3-3: check appointment type', async () => {
            // appointment for adult
            if (!global.testUser.isMinor) {
                let cnt = 0;
                const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
                console.log(`Found ${textView.length} TextView elements.`);

                let result = await compareTextView(textView, RESERVATION_TYPE_RESERVE);
                assert.equal(result, true);
            }

            // click Make a Medical Reservation
            const button = await driver.$('//android.view.ViewGroup[@content-desc="Make a Medical Reservation"]');
            await button.click();
            await sleep(500);

            // check the title on the next page
            const title = await driver.$('//android.widget.TextView[@text="Choose a Doctor"]');
            assert.equal(await title.getAttribute('text'), 'Choose a Doctor');

            // location input field
            searchBox = await driver.$('//android.widget.EditText[@text="Search location or doctor"]');
        });

        it.skip('TC3-4: check location and doctors (NJ - Clifton)', async () => {
            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Clifton');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.Clifton);

            assert.equal(result, true);
        });

        it.skip('TC3-5: check location and doctors (NJ - Moonachie)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Moonachie');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.Moonachie.providor);
            assert.equal(result, true);
        });

        it.skip('TC3-6: check location and doctors (NJ - Edgewater Adult)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Edgewater Adult');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.EdgewaterAdult);
            assert.equal(result, true);
        });

        it.skip('TC3-7: check location and doctors (NJ - Paramus Adult)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Paramus Adult');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.ParamusAdult);
            assert.equal(result, true);
        });

        it.skip('TC3-8: check location and doctors (NY - West End Adult)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('West End Adult');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.WestEndAdult);
            assert.equal(result, true);
        });

        it.skip('TC3-9: check location and doctors (NY - Brighton Beach)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Brighton Beach');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.BrightonBeach);
            assert.equal(result, true);
        });

        it.skip('TC3-10: check location and doctors (NJ - Edgewater Pediatrics)', async () => {            
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Edgewater Pediatrics');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.EdgewaterPediatrics);
            assert.equal(result, true);
        });

        it.skip('TC3-11: check location and doctors (NJ - Paramus Pediatrics)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('Paramus Pediatrics');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.ParamusPediatrics);
            assert.equal(result, true);
        });

        it.skip('TC3-12: check location and doctors (NY - West End Pediatrics)', async () => {
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            await searchBox.setValue('West End Pediatrics');
            await sleep(500);

            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            let result = await compareTextView(textView, DEPARTMENT_PROVIDER.WestEndPediatrics);
            assert.equal(result, true);
        });

        it('TC3-13: make a reservation with any doctor in the member\'s department', async () => {
            // scroll up
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Choose a Doctor")`);
            await sleep(500);

            // select All
            const button = await driver.$('//android.view.ViewGroup[@content-desc="All"]/android.view.ViewGroup');
            await button.click();

            //location input
            await searchBox.clearValue();
            if (global.testUser.isMinor) {
                await searchBox.setValue(global.testUser.memberMinor.department);
            } else { 
                await searchBox.setValue(global.testUser.member.department);
            }
            await sleep(500);

            // scroll down
            await driver.$(`android=new UiScrollable(new UiSelector().scrollable(true)).scrollTextIntoView("Any Doctor")`);
            await sleep(500);

            const button2 = await driver.$('//android.view.ViewGroup[@content-desc="Any Doctor"]/android.view.ViewGroup[1]');
            await button2.click();
            await sleep(500);

            // click continue button
            const next = await driver.$('//android.view.ViewGroup[@content-desc="Continue, "]');
            await next.click();
            await sleep(500);

            // check title on the next page
            const title = await driver.$('//android.widget.TextView[@text="Any Doctor"]');
            assert.equal(await title.getAttribute('text'), 'Any Doctor');
        });

        it('TC3-14: select date from calendar', async () => {
            // slect date from calendar
            await selectFromCalendar();

            // check title on the next page
            const title = await driver.$('//android.widget.TextView[@text="Medical Reservation Type"]');
            assert.equal(await title.getAttribute('text'), 'Medical Reservation Type');
        });

        it('TC3-15: select reservation type Any20/Any10', async () => {
            let button;
            try {
                // select Any20
                button = await driver.$('//android.view.ViewGroup[@content-desc="Any 20"]/android.view.ViewGroup');
                await button.click();
            } catch (err) {
                // select Any10
                button = await driver.$('//android.view.ViewGroup[@content-desc="Any 10"]/android.view.ViewGroup');
                await button.click();
            }

            // click continue button
            const next = await driver.$('//android.view.ViewGroup[@content-desc="Continue, "]');
            await next.click();
            await sleep(500);

            // check title on the next page
            const title = await driver.$('//android.widget.TextView[@text="Confirm Reservation"]');
            assert.equal(await title.getAttribute('text'), 'Confirm Reservation');
        });

        it('TC3-16: confirm reservation', async () => {
            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);
            
            for (let i = 0; i < textView.length; i++) {
                const text = await textView[i].getText();
                console.log(`TextView #${i}: text='${text}'`);
                
                // Name
                if (i == 2) {
                    assert.equal(text, global.testUser.memberMinor.firstName + ' ' + global.testUser.memberMinor.lastName);
                }

                // Department
                if (i == 3) {
                    assert.equal(text, global.testUser.memberMinor.department);
                }

                // TODO Address
                if (i == 4) {
                    ;
                }
                
                // Doctor
                if (i == 5) {
                    global.testUser.memberMinor.reservation.doctor = text;
                }

                // Reservation Type
                if (i == 8) {
                    assert.equal(text, 'Any 20');
                }

                // Reservation Date
                if (i == 10) {
                    assert.equal(text, global.testUser.memberMinor.reservation.date);
                }

                // TODO Reservation Time
                if (i == 12) {
                    console.log(text.startsWith(global.testUser.memberMinor.reservation.time));
                    break;
                }
            }

            // click Make a Reservation
            const button = await driver.$('//android.view.ViewGroup[@content-desc="Make a Reservation"]');
            await button.click();
            await sleep(500);

            // check title
            const title = await driver.$('//android.widget.TextView[@text="Next Reservation"]');
            assert.equal(await title.getAttribute('text'), 'Next Reservation');
        });

        it('TC3-17: check the reservation information on Reservation', async () => {
            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);

            for (let i = 0; i < textView.length; i++) {
                const text = await textView[i].getText();
                console.log(`TextView #${i}: text='${text}'`);

                // Reservation Date and Time
                if (i == 5) {
                    assert.equal(text, global.testUser.memberMinor.reservation.date + ' at ' + global.testUser.memberMinor.reservation.time);
                }

                // Doctor
                if (i == 6) {
                    assert.equal(text, global.testUser.memberMinor.reservation.doctor);
                }

                // Department
                if (i == 7) {
                    assert.equal(text, global.testUser.memberMinor.department);
                    break;
                }
            }
            
            // get footer (Home)
            const footer = await driver.$('//android.view.View[@content-desc=", Home"]');
            await footer.click();
            await sleep(1000);
        });

        it('TC3-18: check the reservation information on Home', async () => {
            const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
            console.log(`Found ${textView.length} TextView elements.`);

            for (let i = 0; i < textView.length; i++) {
                const text = await textView[i].getText();
                console.log(`TextView #${i}: text='${text}'`);

                // Reservation Date and Time
                if (i == 5) {
                    assert.equal(text, global.testUser.memberMinor.reservation.date + ' at ' + global.testUser.memberMinor.reservation.time);
                }

                // Doctor
                if (i == 6) {
                    assert.equal(text, global.testUser.memberMinor.reservation.doctor);
                }

                // Department
                if (i == 7) {
                    assert.equal(text, global.testUser.memberMinor.department);
                    break;
                }
            }
        });

        it('TC3-19: cancel Reservation on Reservation', async () => {
            // click footer Researvation
            const footer = await driver.$('//android.view.View[@content-desc=", Reservations"]');
            await footer.click();
            await sleep(500);

            // click Cancel
            // xpath for the cancel button changes after login and making reservation
            const cancel = await driver.$('(//android.view.ViewGroup[@content-desc="Cancel"])[1]');
            await cancel.click();
            await sleep(500);

            // click Cancel Reservation on modal
            const confirm = await driver.$('//android.view.ViewGroup[@content-desc="Cancel Reservation"]');
            await confirm.click();
            await sleep(1000);
        });
    });
        
    describe('Logout', () => {
        beforeEach(function () {
            if (!global.testUser.isLogin) {
                console.log('User Not LoggedIn!!');
                this.skip();
            }
        });

        it('TC1-3: logout', async () => {
            //Profile
            const profile = await driver.$('//android.view.View[@content-desc="Profile"]');
            await profile.click();
            await sleep(500);

            //Logout
            const logout = await driver.$('//android.view.ViewGroup[@content-desc="Log Out"]');
            await logout.click();
            await sleep(500);
            global.isLoggedIn = false;
        });
    });
});