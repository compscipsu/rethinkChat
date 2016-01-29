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
    {plugin: 'hapi-io'}
  ]
};

module.exports = manifest;