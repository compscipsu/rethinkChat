'use strict';
const Glue = require('glue');
var path = require('path');
var fs = require('fs');
var dust = require('dustjs-linkedin');

var RethinkDB = require('rethinkdb');
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

var RethinkDBConfig = {
  host: nconf.get('rethinkDB-host'),
  port: nconf.get('rethinkDB-port'),
  db: nconf.get('rethinkDB-name')
};

console.log('RethinkDB properties', JSON.stringify(RethinkDBConfig));
var connectToDB = function (callback) {
  RethinkDB.connect(RethinkDBConfig, callback);
};

var socketIOInit = function(io) {

  io.sockets.on('connection', function (socket) {
    socket.on('create_message', function (data) {
      connectToDB(function (err, conn) {
        if (err)
          console.log(err);
        else
          data['time'] = RethinkDB.now();
        RethinkDB.table('message').insert(data).run(conn, function (err) {
          if (err)
            console.log(err);
        });
      });
    });

    socket.on('create_room', function (data) {
      socket.leaveAll();
      socket.join(data['name']);

      connectToDB(function (err, conn) {
        if (err)
          console.log(err);
        else
          RethinkDB.table('room').insert(data).run(conn, function (err) {
            if (err)
              console.log(err);
          });
      });
    });

    socket.on('join_room', function (data) {
      socket.leaveAll();
      socket.join(data['name']);

      connectToDB(function (err, conn) {
        RethinkDB.table('message').filter({room: data['name']}).orderBy(RethinkDB.asc('time')).run(conn, function (err, cursor) {
          if (err)
            console.log(err);
          else
            cursor.each(function (err, row) {
              if (err)
                console.log(err);

              socket.emit("add_message", {message: row['message'], author: row['author'], time: row['time']})
            });
        });
      });

    });

    connectToDB(function (err, conn) {
      if (err)
        console.log(err);
      else
        RethinkDB.table('room').run(conn, function (err, cursor) {
          if (err)
            console.log(err);
          else
            cursor.each(function (err, row) {
              if (err)
                console.log(err);

              socket.emit("add_room", {message: row['name']})
            });
        });
    });
  });

  connectToDB(function (err, conn) {
    RethinkDB.table('message').changes({includeInitial: false}).run(conn, function (err, cursor) {
      if (err)
        console.log(err);
      else
        cursor.each(function (err, row) {
          if (err)
            console.log(err);

          io.sockets.to(row['new_val']['room']).emit("add_message", {
            message: row['new_val']['message'],
            author: row['new_val']['author'],
            time: row['new_val']['time']
          })
        });
    });
  });

  connectToDB(function (err, conn) {
    RethinkDB.table('room').changes({includeInitial: false}).run(conn, function (err, cursor) {
      if (err)
        console.log(err);
      else
        cursor.each(function (err, row) {
          if (err)
            console.log(err);

          io.sockets.emit("add_room", {message: row['new_val']['name']})
        });
    });
  });

};


Glue.compose(require('./manifest.js'), options, function(err, server){
  //configure static files
  if(err) {
    throw err;
  }

  //init dust
  require('./server/config/dust').init(server, dustGlobals);

  require('./server/config/routes').init(server);

  socketIOInit(server.plugins['hapi-io'].io);

  server.start(function() {
    console.log('Server running at:', server.info.uri);

  });

});






