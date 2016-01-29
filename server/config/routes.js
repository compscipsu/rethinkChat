'use strict';
var staticController = require('./../controllers/static_controller');
var sessionController = require('./../controllers/session_controller');
var resourceController = require('./../controllers/resource_controller');
var errorController = require('./../controllers/error_controller');


var sessionRoutes = function(server){
  server.route({
    method: 'GET',
    path: '/logout',
    handler: sessionController.logout
  });
};

var staticRoutes = function(server) {
  server.route({
    method: 'GET',
    path: '/',
    handler: staticController.renderLayout
  });
  server.route({
    method: 'GET',
    path: '/templates/{path*}',
    handler: staticController.getTemplate
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

var resourceRoutes = function(server) {
  server.route({
    method: 'GET',
    path: '/resource/nconf',
    handler: resourceController.nconf
  });
  server.route({
    method: 'GET',
    path: '/resource/config',
    handler: resourceController.config
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

