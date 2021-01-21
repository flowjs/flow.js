module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-exec');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    exec: {
      build: 'node_modules/.bin/rollup -c'
    },
    karma: {
      options: {
        configFile: 'karma.conf.js'
      },
      watch: {
        autoWatch: true,
        background: false
      },
      continuous: {
        singleRun: true
      },
      coverage: {
        singleRun: true,
        browsers: ['Firefox'],
        reporters: ['progress', 'coverage'],
      },
      saucelabs: {
        singleRun: true,
        reporters: ['progress', 'saucelabs'],
        // global config for SauceLabs
        // SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variable are considered by default
        sauceLabs: {
          testName: 'flow.js',
          public: true,
          // recordVideo: false,
          tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
          startConnect: true,
          retryLimit: 1,
        }
      }
    },
    clean: {
      release: ["dist/"]
    },
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['-a'], // '-a' for all files
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
      }
    },
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  // Default task.
  grunt.registerTask('default', ['test']);
  // Release tasks
  grunt.registerTask('build', ['exec:build']);
  grunt.registerTask('release', function(type) {
    type = type ? type : 'patch';
    grunt.task.run('bump-only:' + type);
    grunt.task.run('clean', 'build');
    grunt.task.run('bump-commit');
  });
  // Development
  grunt.registerTask('test', ["karma:coverage"]);
};
