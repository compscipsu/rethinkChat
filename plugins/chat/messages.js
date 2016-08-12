'use strict';

var rethink = require('./rethinkdb.js');

exports.createMessage = function(ctx, next) {

  var data = {
    author: ctx.data.author,
    message: ctx.data.message,
    room: ctx.data.room,
    time: rethink.now()
  };

  rethink.writeToTable('message', data, function (err) {
    if (err)
      console.log(err);
  });

  next();
};