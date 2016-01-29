'use strict';
var dust = require('dustjs-linkedin');
var fs = require('fs');
var path = require('path');
var nconf = require('nconf');
var watch = require('node-watch');
var _ = require('lodash');

require('dustjs-helpers');
var dustEngine = {
  module: {

    compile: function(template, options, callback) {

      var compiled = dust.compileFn(template, options && options.name);

      callback(null, function(context, options, callback) {
        compiled(context, callback)
      })
    },

    registerPartial: function(name, data) {
      dust.compileFn(data, name)
    },

    registerHelper: function(name, helper) {
      if (helper.length > 1)
        dust.helpers[name] = helper;
      else
        dust.filters[name] = helper
    }

  },
  compileMode: 'async'
};

var partialsPath = 'views/partials';

var registerParital = function(partial, file){
  fs.exists(file, function(exists){
    if(exists){
      fs.readFile(file, 'utf8', function(err, data){
        if(err){
          return console.log('unable to read file %s', file);
        }
        
        dustEngine.module.registerPartial(partial, data);
      });
    }
  });
};

var watchPartials = function() {
  if(typeof partialsPath === 'string'){
    partialsPath = [partialsPath];
  }
  
  var pathToWatch = _.map(partialsPath, function(curPath){
    return path.join(__dirname, '../', curPath);
  });

  watch(pathToWatch, function(file) {
    var partial;
    if(file){
      logger.debug('File changed: %j', file);
      //make sure it's a dust file
      if(typeof file === 'string' && file.match(/\.dust$/)){

        //support array of parials paths
        _.find(partialsPath, function(curPath){
          if(file.indexOf(curPath)!== -1) {
            if(curPath.slice(-1) !== '/'){
              curPath = curPath + '/';
            }
            partial = file.split(curPath)[1].replace('.dust', '');
            registerParital(partial, file);
            return true;
          }
        })
      }
    }
  });
};

exports.init = function(server, defaultContext) {
  var isCached = !nconf.get('dev-mode');
  
  if(!isCached){
    watchPartials();
  }

  //set up dust template

  server.views({
    defaultExtension: 'dust',
    engines: {
      dust: dustEngine
    },
    isCached: isCached,
    relativeTo: path.join(__dirname, '../'),
    path: 'views',
    partialsPath: partialsPath,
    helpersPath: 'views/helpers',
    context: defaultContext || {}
  });
};
