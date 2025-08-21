var assert = require('assert');

//// global variables
// login user
global.testUser = {
    loginEmail: 'gavop6795@nasskar.com',
    loginPw: 'Baker#1234',
    isLoggedIn: false,
    isMinor: false,

    // Member (Adult)
    member: {
        firstName: 'Test6795',
        lastName: 'Btest',
        middleName: '',
        department: 'Moonachie',
        video: ['test', 'test2'],
        reservation: {date: '', time: '', doctor: ''}
    },
    // Member (Minor)
    memberMinor: {
        firstName: 'Test6795kid',
        lastName: 'Btest',
        middleName: '',
        department: 'Edgewater Pediatrics',
        video: ['test', 'test2'],
        reservation: { date: '', time: '', doctor: '' }
    }
};
// test module
global.testModule = '';

//// constant variables
// appointment type (Home)
const RESERVATION_TYPE = [
    'With a Doctor',
    'Vitamin Infusions',
    'Vitamin Injections',
    'Weight Loss Consultation',
    'NAD+ Injections',
    'Woman\'s Hormone Replacement Therapy',
    'IV Glutathione'
];
// appointment type (Reservation)
const RESERVATION_TYPE_RESERVE = [
    'Make a Medical Reservation',
    'Schedule a Vitamin Infusion',
    'Schedule a Vitamin Injection',
    'Schedule Weight Loss Consultation',
    'Schedule a NAD+ Injection',
    'Schedule Woman\'s Hormone Replacement Therapy',
    'Schedule IV Glutathione'
];
// department & providers
const DEPARTMENT_PROVIDER = {
    Clifton: [
        'Joseph Herman, DNP',
        'Tayyab Malik, MD',
        'AMIRA MOUSSA, DO'
    ],
    Moonachie: {
        name: 'Moonachie',
        state: 'NJ',
        address: '250 MOONACHIE RD, MOONACHIE, NJ, 07074',
        providor: [
            'Iyad Baker, MD',
            'Joseph Herman, DNP',
            'MOHAMMAD JURRI, MD'
        ]
    },
    EdgewaterAdult: [
        'ALEXANDRIA LEE ANG, MD',
        'SARA BAKER, DNP',
        'MOHAMMAD JURRI, MD',
        'Michael Tsadyk, MD',
    ],
    ParamusAdult: [
        'Jocelyn Mariani, DNP, FNP-BC',
        'MAGNA PASTRANO LLUBERES, M.D.',
    ],
    WestEndAdult: [
        'Auda Auda, MD',
        'ASHRAF MAHMOOD, MD',
    ],
    BrightonBeach: [
        'ASHRAF MAHMOOD, MD',
        'Diana Palanker, MD',
        'Michael Tsadyk, MD'
    ],
    EdgewaterPediatrics: [
        'Zeyad Baker, MD',
        'SARA BAKER, DNP',
        'DIGNA ROSARIO, MD',
        'Cindy Tung, MD'
    ],
    ParamusPediatrics: [
        'ZOBIDA ALIGOUR, MD',
        'Zeyad Baker, MD',
        'SARA BAKER, DNP'
    ],
    WestEndPediatrics: [
        'Zeyad Baker, MD',
        'TOYA GEORGE, MD',
        'ALINA LESHCHINER, MD'
    ]
};
// days of week
const DAYS_OF_WEEK = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];
// calendar max. selection retry
const CALENDAR_MAX_TRY = 3;
// calendar selection day (today + defined days)
const CALENDAR_RESERVE_DAY = 7;

//// global functions
// sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// compare list of TextView and provided list
async function compareTextView(textView, compareList) {
    let cnt = 0;
    for (let i = 0; i < textView.length; i++) {
        const text = await textView[i].getText();
        console.log(`TextView #${i}: text='${text}'`);
        for (let jj = 0; jj < compareList.length; jj++) {
            if (text == compareList[jj]) {
                cnt++;
                break;
            }
        }
    }
    if (cnt == compareList.length) {
        return true;
    } else {
        return false;
    }
};

// calendar selection
async function selectFromCalendar() {
    // selected
    let isSelected = false;
    
    // today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // Add 1 because getMonth() is zero-based
    const day = today.getDate();
    console.log('today: ', today);
    console.log('today(Year): ', year);
    console.log('today(Month): ', month);
    console.log('today(Day): ', day);

    // set reservation date
    let reservDate = new Date();
    reservDate.setDate(reservDate.getDate() + CALENDAR_RESERVE_DAY);
    let reservYear = reservDate.getFullYear();
    let reservMonth = reservDate.getMonth() + 1; // Add 1 because getMonth() is zero-based
    let reservDay = reservDate.getDate();
    console.log('reserve: ', reservDate);
    console.log('reserve(Year): ', reservYear);
    console.log('reserve(Month): ', reservMonth);
    console.log('reserve(Day): ', reservDay);
    let reservMonthName = reservDate.toLocaleString('en-US', { month: 'long' });
    console.log('reserve(Month English): ', reservMonthName);

    let availability = false;
    let availabilityTime = false;
    let selectionTryCnt = 0;
    let oldReservMonth = month;

    // repeat until available date appears (max. 3 times)
    while (!availability && !availabilityTime) {
        selectionTryCnt++;
        if (selectionTryCnt >= CALENDAR_MAX_TRY) {
            console.log('exceeded to the max. try limit!!');
            break;
        }

        // go to next month
        if (oldReservMonth !== reservMonth) {
            // go to next month
            const next = await driver.$('//android.view.ViewGroup[@resource-id="undefined.header.rightArrow"]/android.widget.ImageView');
            await next.click();
            await sleep(500);
            oldReservMonth = reservMonth;
        }

        // click date
        let button;
        let datePath = DAYS_OF_WEEK[reservDate.getDay()] + ' ' + reservDay + ' ' + reservMonthName + ' ' + reservYear;
        console.log(datePath); // Wednesday 27 August 2025

        let buttonPath = '//android.widget.Button[@content-desc=" ' + datePath + ' You have entries for this day "]';
        console.log(buttonPath);

        // Selected date is available
        try {
            button = await driver.$(buttonPath);
            await button.click();

            // Selected date isn't available
        } catch {
            let buttonPath = '//android.widget.Button[@content-desc=" ' + datePath + ' "]';
            button = await driver.$(buttonPath);
            await button.click();
        }
        await sleep(500);

        const textView = await $$('android=new UiSelector().className("android.widget.TextView")');
        console.log(`Found ${textView.length} TextView elements.`);

        for (let i = 0; i < textView.length; i++) {
            const text = await textView[i].getText();
            console.log(`TextView #${i}: text='${text}'`);

            // No doctor is unavailable
            if (text == 'Dr.   is not available on this date') {

                console.log('Dr.   is not available on this date!!');
                availability = false;

                reservDate.setDate(reservDate.getDate() + 1);
                reservYear = reservDate.getFullYear();
                reservMonth = reservDate.getMonth() + 1; // Add 1 because getMonth() is zero-based
                reservDay = reservDate.getDate();
                console.log('(new) reserve: ', reservDate);
                console.log('(new) reserve(Year): ', reservYear);
                console.log('(new) reserve(Month): ', reservMonth);
                console.log('(new) reserve(Day): ', reservDay);
                reservMonthName = reservDate.toLocaleString('en-US', { month: 'long' });
                console.log('(new) reserve(Month English): ', reservMonthName);
                break;
            }

            // doctor is available
            if (text == 'Morning' || text == 'Afternoon' || text == 'Evening') {
                availability = true;

                if (!global.testUser.isMinor) { 
                    global.testUser.member.reservation.date = DAYS_OF_WEEK[reservDate.getDay()] + ', ' // Friday,
                        + reservDate.toLocaleString('en-US', { month: 'short' }) + ' '// Aug
                        + reservDay + ', ' // 22
                        + reservYear;
                    console.log(global.testUser.member.reservation.date);

                } else {
                    global.testUser.memberMinor.reservation.date = DAYS_OF_WEEK[reservDate.getDay()] + ', ' // Friday,
                        + reservDate.toLocaleString('en-US', { month: 'short' }) + ' '// Aug
                        + reservDay + ', ' // 22
                        + reservYear;
                    console.log(global.testUser.memberMinor.reservation.date);
                }
            }

            if (availability && text.length >= 2) {
                if (text.slice(-2) == 'AM' || text.slice(-2) == 'PM') {
                    availabilityTime = true;
                    buttonPath = '//android.view.ViewGroup[@content-desc="' + text + '"]';
                    const time = await driver.$(buttonPath);
                    await time.click();
                    await sleep(500);
                    const next = await driver.$('//android.view.ViewGroup[@content-desc="Continue, "]');
                    await next.click();
                    console.log('Reservation Date selected!!');
                    availabilityTime = true;

                    if (!global.testUser.isMinor) {
                        global.testUser.member.reservation.time = text;
                        console.log(global.testUser.member.reservation.time);
                    } else { 
                        global.testUser.memberMinor.reservation.time = text;
                        console.log(global.testUser.memberMinor.reservation.time);
                    }
                    isSelected = true;
                    break;
                }
            }
        }
    }
    return isSelected;
};

module.exports = {
    DEPARTMENT_PROVIDER,
    RESERVATION_TYPE,
    RESERVATION_TYPE_RESERVE,
    DAYS_OF_WEEK,
    CALENDAR_MAX_TRY,
    CALENDAR_RESERVE_DAY,
    sleep,
    compareTextView,
    selectFromCalendar
};


