'use strict';
var ChatController = require('../controllers/chat_controller');

var routes = function(app) {
  app.get(  '/',                              ChatController.show);
};


exports.init = function (app, callback) {
  routes(app);
  if (typeof callback === 'function') {
    callback();
  }
};