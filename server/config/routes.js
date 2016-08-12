'use strict';
var sessionController = require('./../controllers/session_controller');
var errorController = require('./../controllers/error_controller');


/**
 * Configure Routes
 * @param server - A hapi server
 * @param callback - a function callback
 */
exports.init = function (server, callback) {
  server.route({
    method: 'GET',
    path: '/logout',
    handler: sessionController.logout
  });

  server.route({
    method: 'POST',
    path: '/errors',
    handler: errorController.logError
  });

  if (typeof callback === 'function') {
    callback();
  }
};

