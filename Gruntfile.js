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
        preprocessors: {
          'src/*.js': 'coverage'
        },
        coverageReporter: {
          type: "lcov",
          dir: "coverage"
        }
      },
      saucelabs: {
        singleRun: true,
        reporters: ['progress', 'saucelabs'],
        preprocessors: {
          'src/*.js': 'coverage'
        },
        coverageReporter: {
          type: "lcov",
          dir: "coverage"
        },
        // global config for SauceLabs
        sauceLabs: {
          testName: 'flow.js',
          username: grunt.option('sauce-username') || process.env.SAUCE_USERNAME,
          accessKey: grunt.option('sauce-access-key') || process.env.SAUCE_ACCESS_KEY,
          tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER,
          startConnect: false
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
