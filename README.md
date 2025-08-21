

#### Install the android driver and appium-reporter-plugin
```
appium driver install uiautomator2
appium plugin install --source=npm appium-reporter-plugin
```


### start appium with plugin
```
appium --use-plugins=appium-reporter-plugin
```

#### Run Tests
```
npm run test:android
```


#### View reports 
HTML file starting with `Report_android` would be created in `reports` of this npm project.

#### Place test apk file
place test apk file in `apps` of this npm project, and set the name of the apk in `config/wdio.android.app.conf`.

** https://github.com/webdriverio/appium-boilerplate is used as test code.

** Reference: https://github.com/AppiumTestDistribution/appium-reporter-plugin/tree/main/examples/js/AppiumReportPluginDemo