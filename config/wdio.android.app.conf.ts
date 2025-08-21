import { join } from 'path';
import { config } from './wdio.shared.conf';

config.specs = [
    './tests/specs/**/app.reservationHome.spec.ts',
    './tests/specs/**/app.reservationReserve.spec.ts',
];

config.capabilities = [
    {
        platformName: 'Android',
        maxInstances: 1,
        'appium:deviceName': 'emulator-5554',
        'appium:orientation': 'PORTRAIT',
        'appium:automationName': 'uiautomator2',
        'appium:app': join(process.cwd(), './apps/app-release_q3.37.3.apk'),
        'appium:appPackage': 'com.bakerhealth',
        'appium:appActivity': '.MainActivity',
        'appium:newCommandTimeout': 240,
        'appium:platformVersion': '13.0',
    }
];

exports.config = config;
