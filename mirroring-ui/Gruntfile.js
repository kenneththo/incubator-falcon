(function () {
  "use strict";

  module.exports = function (grunt) {

    grunt.initConfig({

      clean: ["bin"],

      concat: {
        options: {
          separator: '\n\n',
          banner: '/**************************************************************/\n' +
          '/*********Concatenated Vendor minified dependencies ***********/\n' +
          '/**************************************************************/\n'
        },
        vendor: {
          src: [
            'src/common/lib/jquery-1.11.1.min.js',
            'src/common/lib/angular.min.js',
            'src/common/lib/angular-cookies.min.js',
            'src/common/lib/uirouter.min.js',
            'src/common/lib/ui-bootstrap-tpls-0.11.0.min.js',
            'src/common/lib/d3.min.js',
            'src/common/lib/angular-mocks.js',
            'src/common/lib/checklist-model.js',
            'src/common/lib/angular-animate.min.js',
            'src/common/lib/angular-messages.min.js'
          ],
          dest: 'bin/js/vendor.min.js'
        }
      },

      copy: {
        index: {
          cwd: 'src',
          src: ['index.html'],
          dest: 'bin/',
          expand: true
        },
        html: {
          cwd: 'src',
          src: ['!index.html', '**/*.html'],
          dest: 'bin/html',
          expand: true,
          flatten: true
        },
        fonts: {
          cwd: 'src/common',
          src: ['fonts/*.*'],
          dest: 'bin/css/fonts',
          expand: true,
          flatten: true
        },
        img: {
          cwd: 'src/common',
          src: ['assets/*.*'],
          dest: 'bin/css/img',
          expand: true,
          flatten: true
        }
      },

      uglify: {
        options: {
          beautify: true,
          mangle: true,
          compress: true,
          preserveComments: false,
          drop_console: false,
          sourceMap: true,
          banner: '/**** Apache Falcon UI ***/'
        },
        main: {
          files: {
            'bin/js/main.min.js': [
              'src/app/dashboard/dashboard.js',
              'src/app/form/form.js',
              'src/app/form/date-filter/simple-date.js',
              'src/app/form/progress-bar/progress-bar.js',
              'src/app/form/form-general/form-general.js',
              'src/app/form/form-timing/form-timing.js',
              'src/app/form/form-summary/form-summary.js',
              'src/app/form/time-zone/time-zone.js',
              'src/app/validation/validation.js',
              'src/app/rest-api/rest-api.js',
              'src/app/model/model.js',
              'src/app/login/login.js',
              'src/app/app.js'
            ]
          }
        }
      },

      jshint: {
        options: {
          eqeqeq: true,
          curly: true,
          undef: false,
          unused: true,
          force: true
        },
        target: {
          src: [
            '**.js',
            '!src/common/lib/*.js'
          ]
        }
      },

      csslint: {
        strict: {
          src: ['bin/css/main.min.css']
        }
      },

      less: {
        development: {
          options: {
            compress: true,
            yuicompress: false,
            optimization: 2,
            cleancss: false,
            syncImport: false,
            strictUnits: false,
            strictMath: true,
            strictImports: true,
            ieCompat: false
          },
          files: {
            'bin/css/main.css': 'src/less/main.less'
          }
        }
      },

      express: {
        server: {
          options: {
            script: 'server.js'
          }
        }
      },

      karma: {
        unit: {
          configFile: 'karma.conf.js',
          singleRun: true,
          autoWatch: false
        },
        continuous: {
          configFile: 'karma.conf.js',
          singleRun: false,
          autoWatch: false,
          background: true,
          browsers: ['PhantomJS']
        }
      },

      protractor:{
        options: {
          configFile: "end2end/protractor.js",
          keepAlive: true,
          noColor: false
        },
        firefoxAll: {
          options: {
            args: {
              browser: "firefox",
              specs: [
                "end2end/LoginE2E.js",
                "end2end/DashboardE2E.js",
                "end2end/FormE2E.js"
              ]
            }
          }
        },
        chromeAll: {
          options: {
            args: {
              browser: "chrome",
              specs: [
                "end2end/LoginE2E.js",
                "end2end/DashboardE2E.js",
                "end2end/FormE2E.js"
              ]
            }
          }
        },
        firefoxDashboard: {
          options: {
            args: {
              browser: "firefox",
              specs: [
                "end2end/LoginE2E.js",
                "end2end/DashboardE2E.js"
              ]
            }
          }
        },
        chromeDashboard: {
          options: {
            args: {
              specs: [
                "end2end/LoginE2E.js",
                "end2end/DashboardE2E.js"
              ],
              browser: "chrome"
            }
          }
        },
        firefoxForm: {
          options: {
            args: {
              browser: "firefox",
              specs: [
                "end2end/LoginE2E.js",
                "end2end/FormE2E.js"
              ]
            }
          }
        },
        chromeForm: {
          options: {
            args: {
              specs: [
                "end2end/LoginE2E.js",
                "end2end/FormE2E.js"
              ],
              browser: "chrome"
            }
          }
        }
      },

      concurrent: {
        all: ['protractor:firefoxAll', 'protractor:chromeAll'],
        dashboard: ['protractor:firefoxDashboard', 'protractor:chromeDashboard'],
        form: ['protractor:firefoxForm', 'protractor:chromeForm']
      },

      watch: {
        options: {
          livereload: true
        },
        less: {
          files: ['**/*.less', '!src/less/bootstrap/**/*.less'],
          tasks: ['less'],
          options: {
            nospawn: true,
            livereload: true
          }
        },
        index: {
          files: ['src/index.html'],
          tasks: ['copy:index']
        },
        html: {
          files: ['!src/index.html', 'src/**/*.html'],
          tasks: ['copy:html']
        },
        js: {
          files: ['src/**/*.js', '!**/*Spec.js'],
          tasks: ['jshint', 'karma:unit:run', 'uglify']
        },
        specs: {
          files: ['**/*Spec.js'],
          tasks: ['jshint', 'karma:unit:run' ]
        },
        server: {
          files: ['server.js'],
          tasks: ['jshint', 'express']
        }
      }

    });

    grunt.registerTask('build', [
      'clean', 'concat:vendor', 'uglify', 'less', 'copy:fonts',
      'copy:index', 'copy:html', 'copy:img', 'karma:unit:start'
    ]);

    grunt.registerTask('dev', [
      'express', 'build', 'karma:continuous', 'watch'
    ]);

    grunt.registerTask('test', [ 'express', 'karma:unit:start', 'karma:continuous' ]);
    grunt.registerTask('testE2E', ['express', 'concurrent:all']);
    grunt.registerTask('testDashboardE2E', ['express', 'concurrent:dashboard']);
    grunt.registerTask('testFormE2E', ['express', 'concurrent:form']);


    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-concurrent');

  };

}());