var path = require('path');
var fs = require('fs');

exports.init = function (nconf, serverPropertiesFN) {
  'use strict';
  nconf.use('memory'); // this allows us to set undefined variables

  nconf.env();

  fs.exists(serverPropertiesFN, function(exists){
    if(exists){
      nconf.file('user', serverPropertiesFN);
    }
  });

  nconf.defaults({
    "port": "3003",
    "host": "localhost",
    "rethinkDB-host": 'localhost',
    "rethinkDB-port": 28015,
    "rethinkDB-name": 'chat',
    'js-minify': true
  });
};