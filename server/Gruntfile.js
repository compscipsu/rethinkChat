module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      build: {
        src: 'client/assets/js/**/*.js',
        dest: 'client/assets/app.min.js'
      }
    },
    sass: {
      dist: {
        options: {
          style: 'compressed'
        },
        files: {
          'client/assets/css/style.css': 'client/assets/scss/bootstrap.scss'
        }
      }
    },
    jshint: {
      all: ['client/assets/js/**/*.js']
    },
    watch: {
      scripts: {
        files: ['client/assets/js/**/*.js'],
        tasks: ['jshint', 'uglify'],
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
