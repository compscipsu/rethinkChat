'use strict';
var http = require('http');
var express = require('express');
var app =  express();
var server = require('http').createServer(app);
var RethinkDB = require('rethinkdb');
var nconf = require('nconf');

//var expressValidator = require('./middleware/express_validator');
var bodyParser = require('body-parser');
var dust = require('adaro').dust;
var staticAsset = require('static-asset');

var fs = require('fs');
var path = require('path');


require(path.join(__dirname, 'config/nconf')).init(nconf, path.join(__dirname, 'properties.json'));



// use adaro for all dust templates
app.engine('dust', dust({cache: false, helpers: ['./helpers/dust_helpers.js']}));
app.set('view engine', 'dust');


app.disable('x-powered-by');
app.set('views', path.join(__dirname, 'views'));
app.set('json spaces', 2);


// allow more event listeners, set to 0 to leave unrestricted
process.setMaxListeners(0);
process.maxTickDepth = 400;

app.use(express.static(path.join(__dirname, 'public')));
app.use(staticAsset(path.join(__dirname, 'public')));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
//app.use(expressValidator);

app.use(function (err, req, res, next) {
  console.log('Bubble Error: %s', err);
  next(err);
});


process.on('SIGTERM', function(){
  server.close();
});

process.on('exit', function(){
  server.close();
});

process.on('uncaughtException', function(err){
  console.log(err)
  server.close();
});

console.log('booting application on ' + process.pid.toString());


var connectToDB = function (callback) {
  RethinkDB.connect({
    host: nconf.get('rethinkDB-host'),
    port: nconf.get('rethinkDB-port'),
    db: nconf.get('rethinkDB-name')
  }, callback);
  
};

var socketIOInit = function() {
  var io = require('socket.io').listen(server);

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


require(path.join(__dirname, 'config/routes')).init(app, function(){
  server.listen(nconf.get('port'),'0.0.0.0', function(){
    console.log("Express server listening on port " + nconf.get('port'));
    
    socketIOInit();
    console.log('Server Started.');
  });
});

