/*global module:false*/
module.exports = function(grunt) {

  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    meta : {
      banner : '/*!\n' +
      ' * GMaps.js v<%= pkg.version %>\n' +
      ' * <%= pkg.homepage %>\n' +
      ' *\n' +
      ' * Copyright <%= grunt.template.today("yyyy") %>, <%= pkg.author %>\n' +
      ' * Released under the <%= pkg.license %> License.\n' +
      ' */\n\n'
    },

    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: [
          'lib/gmaps.core.js',
          'lib/gmaps.controls.js',
          'lib/gmaps.circles.js',
          'lib/gmaps.polygons.js',
          'lib/gmaps.rectangles.js',
          'lib/gmaps.polylines.js',
          'lib/gmaps.info_windows.js',
          'lib/gmaps.markers.js',
          'lib/gmaps.overlays.js',
          'lib/gmaps.texts.js',
          'lib/gmaps.layers.js',
          'lib/gmaps.routes.js',
          'lib/gmaps.geofences.js',
          'lib/gmaps.static.js',
          'lib/gmaps.map_types.js',
          'lib/gmaps.styles.js',
          'lib/gmaps.streetview.js',
          'lib/gmaps.events.js',
          'lib/gmaps.utils.js',
          'lib/gmaps.instance_helpers.js',
          'lib/gmaps.native_extensions.js'
        ],
        dest: 'gmaps.js'
      }
    },

    karma: {
      base: {
        configFile: 'karma.conf.js',
        browsers: ['Firefox'],
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/CircleSpec.js',
            'test/spec/ControlSpec.js',
            'test/spec/EventSpec.js',
            'test/spec/InfoWindowSpec.js',
            'test/spec/InstanceHelpersSpec.js',
            'test/spec/LayerSpec.js',
            'test/spec/MapSpec.js',
            'test/spec/MarkerSpec.js',
            'test/spec/PolygonSpec.js',
            'test/spec/PolylineSpec.js',
            'test/spec/RectangleSpec.js',
            'test/spec/RouteSpec.js',
            'test/spec/StreetViewSpec.js',
            'test/spec/StyleSpec.js',
            'test/spec/TextSpec.js'
          ]
        }
      },
      overlays: {
        configFile: 'karma.conf.js',
        browsers: ['Firefox'],
        port: 9877,
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/OverlaySpec.js'
          ]
        }
      },
      utils: {
        configFile: 'karma.conf.js',
        browsers: ['Firefox'],
        port: 9878,
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/UtilsSpec.js'
          ]
        }
      },
      baseRelease: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Opera', 'Safari'],
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/CircleSpec.js',
            'test/spec/ControlSpec.js',
            'test/spec/EventSpec.js',
            'test/spec/InfoWindowSpec.js',
            'test/spec/InstanceHelpersSpec.js',
            'test/spec/LayerSpec.js',
            'test/spec/MapSpec.js',
            'test/spec/MarkerSpec.js',
            'test/spec/PolygonSpec.js',
            'test/spec/PolylineSpec.js',
            'test/spec/RectangleSpec.js',
            'test/spec/RouteSpec.js',
            'test/spec/StyleSpec.js',
            'test/spec/TextSpec.js'
          ]
        }
      },
      streetViewRelease: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Opera', 'Safari'],
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/StreetViewSpec.js'
          ]
        }
      },
      overlaysRelease: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Opera', 'Safari'],
        port: 9877,
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/OverlaySpec.js'
          ]
        }
      },
      utilsRelease: {
        configFile: 'karma.conf.js',
        browsers: ['Chrome', 'Firefox', 'Opera', 'Safari'],
        port: 9878,
        options: {
          files: [
            'http://maps.google.com/maps/api/js?sensor=true',
            './gmaps.js',
            'test/spec/UtilsSpec.js'
          ]
        }
      }
    },

    watch : {
      dev: {
        files : ['Gruntfile.js', '<%= concat.dist.src %>', 'test/spec/**/*.js'],
        tasks : ['jshint:main', 'concat', 'umd', 'test-dev']
      }
    },

    jshint : {
      main : {
        options: {
          jshintrc: './.jshintrc',
          force: true
        },
        src: ['Gruntfile.js', '<%= concat.dist.src %>']
      },
      test: {
        options: {
          jshintrc: './test/.jshintrc',
          force: true
        },
        src: ['test/spec/**/*.js']
      }
    },

    uglify : {
      options : {
        sourceMap : true
      },
      all : {
        files: {
           'gmaps.min.js': [ 'gmaps.js' ]
        }
      }
    },

    umd : {
      all : {
        src : 'gmaps.js',
        objectToExport : 'GMaps',
        globalAlias : 'GMaps',
        template : 'umd.hbs',
        deps: {
          amd: ['jquery', 'googlemaps!']
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-umd');

  grunt.registerTask('test-dev', ['jshint:test', 'karma:base']);
  grunt.registerTask('test-all', ['jshint:test', 'karma:base', 'karma:overlays', 'karma:utils']);
  grunt.registerTask('test-release', [
    'jshint:test', 'build', 'jshint:test', 
    'karma:baseRelease', 'karma:streetViewRelease', 'karma:overlaysRelease', 'karma:utilsRelease'
  ]);
  grunt.registerTask('travis', ['karma:base', 'karma:overlays', 'karma:utils']);
  grunt.registerTask('dev', ['jshint:main', 'concat', 'umd', 'test-dev', 'watch:dev']);
  grunt.registerTask('build', ['concat', 'umd', 'uglify']);
  grunt.registerTask('default', ['jshint:main', 'concat', 'umd', 'uglify', 'test-all']);
};
