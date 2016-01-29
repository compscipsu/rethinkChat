'use strict';
var nconf = require('nconf');
var path = require('path');

var manifest = {
  connections: [
    {
      port: nconf.get('port'),
      routes: {
        files: {
          relativeTo: path.join(__dirname, 'server')
        },
        security: {
          xframe: true
        }
      }
    }
  ],
  registrations: [
    {plugin: 'crumb'},
    {plugin: 'vision'},
    {plugin: 'inert'},
    {plugin: 'hapi-io'},
    {
      plugin: {
        register: "./plugins/chat/index.js",
        options : {
          rethink: {
            host: nconf.get('rethinkDB-host'),
            port: nconf.get('rethinkDB-port'),
            db: nconf.get('rethinkDB-name'),
          }
        }
      },
      options: {
        routes: {
          prefix: '/chat'
        }
      }
    }
  ]
};

module.exports = manifest;