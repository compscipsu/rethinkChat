'use strict';

var rethink = require('./rethinkdb.js');

exports.init = (io) => {
  exports.io = io;

  rethink.subscribeToChanges('room', {includeInitial: false}, function (err, cursor) {
    if (err)
      console.log(err);
    else
      cursor.each(function (err, row) {
        if (err)
          console.log(err);

        io.sockets.emit("add_room", {name: row['new_val']['name']})
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

