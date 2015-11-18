module.exports = function(grunt) {
  
  var vendorJSFiles = [
    'vendor/jquery-1.9.1.js',
    'vendor/jquery.growler.js',
    'vendor/bootstrap.js',
    'vendor/lodash.js',
    'vendor/moment.js',
    'vendor/angular.js',
    'vendor/angular-ui-router.js',
    'vendor/angular-ui-utils.js',
    'vendor/angular-datepicker.js',
    'vendor/angular-growl-notifications.js'
  ];
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dev: {
        src: grunt.util._.union(vendorJSFiles, ['client/assets/js/**/*.js']),
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
          'public/css/style.css': 'client/assets/scss/bootstrap.scss'
        }
      }
    },
    jshint: {
      all: ['client/assets/js/**/*.js']
    },
    watch: {
      scripts: {
        files: ['vendor/**/*', 'client/assets/js/**/*.js'],
        tasks: ['jshint', 'concat', 'uglify']
      },
      css: {
        files: ['client/assets/scss/**/*.scss'],
        tasks: ['sass']
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'jshint', 'uglify', 'watch']);

};
