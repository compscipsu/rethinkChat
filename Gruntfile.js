module.exports = function(grunt) {
  
  var vendorJSFiles = [
    'client/vendor/angular.js',
    'client/vendor/angular-sanitize.js',
    'client/vendor/angular-idle.js',
    'client/vendor/angular-ui-router.js',
    'client/vendor/moment.js',
    'client/vendor/lodash.js',
    'client/vendor/showdown.js'
  ];
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: '\n;'
      },
      dev: {
        src: grunt.util._.union(vendorJSFiles, ['client/src/**/*.js']),
        dest: 'public/js/chat.js'
      }
    },
    uglify: {
      dist: {
        files: {
          'public/js/chat.min.js': ['public/js/chat.js']
        }
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/css/style.css': 'client/scss/style.scss'
        }
      }
    },
    //jshint: {
    //  all: ['client/src/**/*.js']
    //},
    watch: {
      scripts: {
        files: ['vendor/**/*', 'client/src/**/*.js'],
        tasks: ['concat', 'uglify']
      },
      css: {
        files: ['client/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['concat','sass', 'uglify', 'watch']);

};
