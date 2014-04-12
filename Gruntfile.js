module.exports = function(grunt) {
  var browsers = grunt.option('browsers') && grunt.option('browsers').split(',');
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
    coveralls: {
      options: {
        coverage_dir: 'coverage/'
      }
    },
    karma: {
      options: {
        configFile: 'karma.conf.js',
        browsers: browsers || ['Chrome']
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
        reporters: ['progress', 'coverage'],
        preprocessors: {
          'src/*.js': 'coverage'
        },
        coverageReporter: {
          type: "lcov",
          dir: "coverage/"
        }
      },
      travis: {
        singleRun: true,
        reporters: ['progress', 'coverage'],
        preprocessors: {
          'src/*.js': 'coverage'
        },
        coverageReporter: {
          type: "lcov",
          dir: "coverage/"
        },
        // Buggiest browser
        browsers: browsers || ['sl_chorme'],
        // global config for SauceLabs
        sauceLabs: {
          username: grunt.option('sauce-username') || process.env.SAUCE_USERNAME,
          accessKey: grunt.option('sauce-access-key') || process.env.SAUCE_ACCESS_KEY,
          startConnect: grunt.option('sauce-local') ? false : true ,
          testName: 'flow.js'
        }
      }
    },
    clean: {
      release: ["dist/"]
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
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
  grunt.registerTask('test', ["karma:travis"]);
};