var path = require('path');

exports.init = function (nconf, serverPropertiesFN) {
  'use strict';
  nconf.use('memory'); // this allows us to set undefined variables

  nconf.env();

  nconf.file('user', serverPropertiesFN);

  // configure global properties

  nconf.defaults({
    "port": "3003",
    "host": "localhost",
    "rethinkDB-host": 'localhost',
    "rethinkDB-port": 28015,
    "rethinkDB-name": 'chat',
    'js-minify': true
  });
};