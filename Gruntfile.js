module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= pkg.version %> */\n'
      },
      build: {
        src: 'dist/flow.js',
        dest: 'dist/flow.min.js'
      }
    },
    concat: {
      build: {
        files: {
          'dist/flow.js': [
            'src/flow.js'
          ]
        }
      }
    },
    jst: {
      compile: {
        options: {

        },
        files: {
          "dist/flow.js": ["dist/flow.js"]
        }
      }
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
    'template': {
      'release': {
        'options': {
          'data': {
            'version': '<%= pkg.version %>'
          }
        },
        'files': {
          'dist/flow.js': ['dist/flow.js']
        }
      }
    }
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  // Default task.
  grunt.registerTask('default', ['test']);
  // Release tasks
  grunt.registerTask('build', ['concat', 'template', 'uglify']);
  grunt.registerTask('release', function(type) {
    type = type ? type : 'patch';
    grunt.task.run('bump-only:' + type);
    grunt.task.run('clean', 'build');
    grunt.task.run('bump-commit');
  });
  // Development
  grunt.registerTask('test', ["karma:coverage"]);
};
