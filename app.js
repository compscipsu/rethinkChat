'use strict';
const Glue = require('glue');
var path = require('path');
var fs = require('fs');
var dust = require('dustjs-linkedin');


var nconf = require('nconf');

require(path.join(__dirname, 'server/config/nconf')).init(nconf, path.join(__dirname, 'properties.json'));


// allow more event listeners, set to 0 to leave unrestriced
process.setMaxListeners(nconf.get('max-listeners') || 0);
process.maxTickDepth = nconf.get('max-tick-depth') || 400;

process.on('uncaughtException', function (err) {
  console.log('Uncaught exception: ', JSON.stringify(err.stack));
  throw err;
});


process.on('SIGTERM', function(){
  server.close();
});

process.on('exit', function(){
  server.close();
});


console.log('booting application on ' + process.pid.toString());

const options = {
  relativeTo: __dirname
};

//configure dust globals
var dustGlobals = {};

Glue.compose(require('./manifest.js'), options, function(err, server){
  //configure static files
  if(err) {
    throw err;
  }

  //init dust
  require('./server/config/dust').init(server, dustGlobals);

  require('./server/config/routes').init(server);

  server.start(function() {
    console.log('Server running at:', server.info.uri);

  });

});






