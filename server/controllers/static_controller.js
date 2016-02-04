'use strict';
var nconf = require('nconf');

exports.renderLayout = function (request, reply) {
  //reply.view('angular2');
  reply.view('layout', {
    host: nconf.get('host'),
    port: nconf.get('port'),
    minifyJS: nconf.get('js-minify')
  });
};

exports.getTemplate = function (request, reply) {
  reply.view(request.params.path, {});
};
