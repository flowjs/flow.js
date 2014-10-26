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
        src: 'build/flow.js',
        dest: 'build/flow.min.js'
      }
    },
    concat: {
      build: {
        files: {
          'build/flow.js': [
            'src/flow.prefix',
            'src/flow.js',
            'src/events.js',
            'src/helpers.js',
            'src/api.js',
            'src/export.js',
            'src/flow.suffix'
          ]
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
      singleRun: {
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
    }
  });

  // Loading dependencies
  for (var key in grunt.file.readJSON("package.json").devDependencies) {
    if (key !== "grunt" && key.indexOf("grunt") === 0) grunt.loadNpmTasks(key);
  }

  grunt.registerTask('default', ['test']);
  // Testing
  grunt.registerTask('test', ['karma:continuous']);
  grunt.registerTask('watch', ['karma:watch']);
  // Release
  grunt.registerTask('build', ['concat', 'uglify']);
  // Development
  grunt.registerTask('travis', ["karma:travis"]);
};
