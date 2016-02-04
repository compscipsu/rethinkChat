'use strict';

var _ = require('lodash');
var rethink = require('./rethinkdb.js');
var rooms = require('./rooms.js');
var socketio = require('./socket.js');
var messages = require('./messages.js');
var users = require('./users.js');

module.exports.register = (plugin, options, next) => {
  options = options || {};

  rethink.init(options.rethink);
  socketio.init(plugin.plugins['hapi-io'].io);

  plugin.route({
    method: 'POST',
    path: '/room/create',
    config: rooms.createRoom()
  });

  plugin.route({
    method: 'POST',
    path: '/room/join',
    config: rooms.joinRoom()
  });

  plugin.route({
    method: 'POST',
    path: '/message/create',
    config: messages.createMessage()
  });

  plugin.route({
    method: 'GET',
    path: '/room/public',
    config: rooms.getPublicRooms()
  });

  plugin.route({
    method: 'GET',
    path: '/room/private',
    config: rooms.getPrivateRooms()
  });

  plugin.route({
    method: 'POST',
    path: '/user/login',
    config: users.loginUser()
  });

  plugin.route({
    method: 'POST',
    path: '/user/create',
    config: users.createUser()
  });

  next();
};

module.exports.register.attributes = {
  pkg: require('./package.json')
};

