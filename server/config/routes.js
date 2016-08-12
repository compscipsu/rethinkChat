'use strict';
var sessionController = require('./../controllers/session_controller');
var errorController = require('./../controllers/error_controller');


var sessionRoutes = function(server){
  server.route({
    method: 'GET',
    path: '/logout',
    handler: sessionController.logout
  });
};

var assetRoutes = function(server) {
  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '../public'
      }
    }
  });
};


/**
 * Configure Routes
 * @param server - A hapi server
 * @param callback - a function callback
 */
exports.init = function (server, callback) {
  sessionRoutes(server);
  staticRoutes(server);
  assetRoutes(server);
  resourceRoutes(server);

  server.route({
    method: 'POST',
    path: '/errors',
    handler: errorController.logError
  });

  if (typeof callback === 'function') {
    callback();
  }
};

