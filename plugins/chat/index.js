'use strict';

var _ = require('lodash');
var rethink = require('./rethinkdb.js');
//var rooms = require('./rooms.js');
var socketio = require('./socket.js');
var messages = require('./messages.js');
var users = require('./users.js');

module.exports.register = (plugin, options, next) => {
  options = options || {};

  rethink.init(options.rethink);
  socketio.init(plugin.plugins['hapi-io'].io);



  //Dialogue
  plugin.route({
    method: 'POST',
    path: '/message/create',
    config: {
        plugins: {
          'hapi-io': {
            event: 'create_message',
            post: messages.createMessage
          }
        },
        handler: (request, reply) => {
          //console.log("Create Message");
          reply();
        }
      }
  });



  //Users

  //not using socket.io. actually using http POST
  plugin.route({
    method: 'POST',
    path: '/user/login',
    config: {
      handler: users.loginUser
    }
  });



  next();
};

module.exports.register.attributes = {
  pkg: require('./package.json')
};

