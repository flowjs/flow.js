module.exports = function(config) {
  var docker_images = {},

      ChromeHeadlessDocker = {
	base: 'Docker',
	modemOptions: {
	  socketPath: '/run/docker.sock'
	},
	createOptions: {
	  // Image: 'registry.gitlab.com/drzraf/docker-alpine-browsers/chromium:81',
	  Cmd: ['chromium-browser', '--disable-gpu', '--headless', '--no-sandbox', '--remote-debugging-address=0.0.0.0', '--remote-debugging-port=9222', '--user-data-dir=/data', '--disable-dev-shm-usage', '$KARMA_URL'],
	  HostConfig: {
            NetworkMode: 'host'
	  }
	}
      },

      FirefoxHeadlessDocker = {
	base: 'Docker',
	modemOptions: {
	  socketPath: '/run/docker.sock'
	},
	createOptions: {
	  // Image: 'registry.gitlab.com/drzraf/docker-alpine-browsers/firefox:60',
	  Cmd: ['firefox', /*'--profile', '/tmp/headless', */ '-headless', '-no-remote', '-url', '$KARMA_URL'],
	  HostConfig: {
            NetworkMode: 'host'
	  }
	}
      };

  for(let i of [57, 61, 68, 72, 77, 81, 83]) {
    docker_images['chromium' + i] = JSON.parse(JSON.stringify(ChromeHeadlessDocker));
    docker_images['chromium' + i]['createOptions']['Image'] = 'registry.gitlab.com/drzraf/docker-alpine-browsers/chromium:' + i;
  }

  // first headless version = 55. ESR = [60, 68, 78]
  for(let i of [60, 78, 81]) {
    docker_images['firefox' + i] = JSON.parse(JSON.stringify(FirefoxHeadlessDocker));
    docker_images['firefox' + i]['createOptions']['Image'] = 'registry.gitlab.com/drzraf/docker-alpine-browsers/firefox:' + i;
  }

  var testingbot_common_settings = {
    // extra: 'foobar',
    maxduration: 200,
    groups: "flowjs",
    build: "flowjs",
    recordLogs: "true",
    // 'testingbot.geoCountryCode': 'DE',
    // deviceOrientation: 'portrait' || 'landscape'
  };


  var customLaunchers = {
    ff: {
      base: 'Firefox',
      // flags: ['-headless'],
    },

    // https://github.com/karma-runner/karma-chrome-launcher/issues/158
    ChromiumHeadlessNS: {
      base: 'ChromiumHeadless',
      flags: ['--no-sandbox']
    },

    ...docker_images
  };

  var tbLaunchers = {
    tb_ff: {
      // use TB_KEY & TB_SECRET
      base: 'TestingBot',
      platform: 'WIN10',
      browserName: 'firefox',
      version: '82',
      ...testingbot_common_settings
    },

    tb_android_chrome: {
      // use TB_KEY & TB_SECRET
      base: 'TestingBot',
      platform: "ANDROID",
      platformName: "Android",
      version: "7.1",
      browserName: "Chrome",
      deviceName: "Pixel 2",
      ...testingbot_common_settings
    },

    // Not working
    tb_android_ff: {
      // use TB_KEY & TB_SECRET
      base: 'TestingBot',
      platform: "ANDROID",
      platformName: "Android",
      version: "7.1",
      browserName: "Firefox",
      deviceName: "Pixel 2",
      ...testingbot_common_settings
    },

    // Not working
    tb_iphone: {
      // use TB_KEY & TB_SECRET
      base: 'TestingBot',
      platform: 'iOS',
      browserName: 'safari',
      version: '13.4',
      deviceName: 'iPhone 8',
      platformName: 'iOS',
      ...testingbot_common_settings
    }
  };

  if (process.env.TB_KEY && process.env.TB_SECRET) {
    customLaunchers = {...customLaunchers, ...tbLaunchers};
  }

  config.set({
    captureTimeout: 3e5,
    browserDisconnectTolerance: 0,
    browserDisconnectTimeout: 6e5,
    browserSocketTimeout: 8e4,
    browserNoActivityTimeout: 1e5,

    // base path, that will be used to resolve files and exclude
    basePath: '',

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'node_modules/sinon/pkg/sinon.js',
      'dist/flow.js',
      'test/*Spec.js'
    ],

    preprocessors: {
      'dist/flow.js': 'coverage',
      'src/*.js': 'coverage'
    },

    // list of files to exclude
    exclude: [

    ],

    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
    reporters: ['progress', 'testingbot', 'coverage'],
    coverageReporter: [
      {type: "lcov", dir: "coverage", subdir: "."}
    ],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,

    customLaunchers: customLaunchers,

    browsers: Object.keys(customLaunchers)
  });
};
