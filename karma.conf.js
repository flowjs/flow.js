module.exports = function(config) {
  if (config.sauceLabs && (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY)) {
    console.error('SAUCE_USERNAME SAUCE_ACCESS_KEY environment variable must be defined to use saucelabs.');
    process.exit(1)
  }

  // define SL browsers
  var slug,
      customLaunchers = {},

      // https://wiki.saucelabs.com/display/DOCS/Test+Configuration+Options
      commonSauceOptions = {
        // recordVideo: false,
        recordLogs: true,
        extendedDebugging: true,
      },

      // https://saucelabs.com/platform/supported-browsers-devices
      // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
      browsers = [
        // ['w3c', 'internet explorer', 'Windows 7', '10'],
        // ['w3c', 'internet explorer', 'Windows 10', '11'],
        ['w3c', 'microsoftedge', 'Windows 10', '18'],
        // ['w3c', 'safari', 'OS X 10.10', '8.0'],
        ['w3c', 'chrome', 'Windows 10', '76'],
        ['w3c', 'firefox', 'Windows 10', '80'],
        // ['apium', 'Safari', 'iOS', null, { deviceName: 'iPad Simulator', deviceOrientation: 'portrait', platformVersion: '12.4', appiumVersion: '1.13.0' }],
        // ['apium', 'Browser', 'Android', null, { deviceName: 'Android Emulator', deviceOrientation: 'portrait', platformVersion: '5.1', appiumVersion: '1.18.1' }],

        // JWC (see https://wiki.saucelabs.com/display/DOCS/W3C+Capabilities+Support)
        // ['jwc', 'chrome',  'Linux', '48'],
        // ['jwc', 'firefox', 'Linux', '13'],
        // ['jwc', 'firefox', 'Linux', '25'],
        // ['jwc', 'firefox', 'Linux', '45'],
      ];

  for (let [v, browserName, platformName, browserVersion, opts = {}] of browsers) {
    slug = browserName.charAt(0) + '_' + browserVersion;
    var o;

    if (v === 'w3c') {
      o = {
        base: 'SauceLabs',
        browserName,
        platformName,
        browserVersion,
        'sauce:options': {
          tags: ['w3c'],
          ...commonSauceOptions,
          ...opts,
        }
      };
    } else if (v === 'apium') {
      o = {
        base: 'SauceLabs',
        browserName,
        platformName,
        platform: platformName,
        version: browserVersion,
        ...commonSauceOptions,
        ...opts,
      };
    } else if (v === 'jwc') {
      o = {
        base: 'SauceLabs',
        browserName,
        platform: platformName,
        version: browserVersion,
        ...commonSauceOptions,
        ...opts,
      };
    }

    customLaunchers[slug] = o;
  }

  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'dist/flow.cov.js',
      'test/*Spec.js'
    ],

    preprocessors: {
      'src/*.js': 'coverage'
    },

    // list of files to exclude
    exclude: [

    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'coverage'],
    coverageReporter: [
      {type: "lcov", dir: "coverage", subdir: "."}
    ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_DEBUG,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    browserDisconnectTolerance: 1,
    browserNoActivityTimeout: 100e3,
    captureTimeout: 100e3,
    pingTimeout: 30e3,
    browserDisconnectTimeout: 30e3,
    browserSocketTimeout: 12e3,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    customLaunchers: customLaunchers,

    browsers: Object.keys(customLaunchers),
  });
};
