'use strict';

var rethink = require('./rethinkdb.js');

exports.init = (io) => {
  exports.io = io;

  io.sockets.on('connection', function (socket) {

    //TODO Remove when web calling get public rooms
    rethink.getData('room', {visibility: 'public'}, rethink.sortAsc('name'), function (err, cursor) {
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

  rethink.subscribeToChanges('room', {includeInitial: false}, function (err, cursor) {
    if (err)
      console.log(err);
    else
      cursor.each(function (err, row) {
        if (err)
          console.log(err);

        io.sockets.emit("add_room", {message: row['new_val']['name']})
      });
  });

  rethink.subscribeToChanges('message', {includeInitial: false}, function (err, cursor) {
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
};

