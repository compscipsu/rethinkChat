'use strict';

var rethink = require('./rethinkdb.js');

exports.createRoom = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'create_room',
        post: function(ctx, next) {
          ctx.socket.leaveAll();
          ctx.socket.join(ctx.data['name'])

          var data = {
            name: ctx.data['room'],
            visibility: ctx.data['visibility'] ? ctx.data['visibility'] : 'public',
            owner: ctx.data['owner'] ? ctx.data['owner'] : 'jrausch@morphotrust.com',
            subscribers: [ctx.data['owner'] ? ctx.data['owner'] : 'jrausch@morphotrust.com']
          };

          rethink.writeToTable('room', data, function (err) {
            if (err)
              console.log(err);
          });

          next();
        }
      }
    },
    handler: (request, response) => {
      console.log("Create room");
    }
  };
};


exports.joinRoom = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'join_room',
        post: function(ctx, next) {
          ctx.socket.leaveAll();
          ctx.socket.join(ctx.data['name'])

          rethink.getData('message', {room: ctx.data['name']}, rethink.sortAsc('time'), function (err, cursor) {
            if (err)
              console.log(err);
            else
              cursor.each(function (err, row) {
                if (err)
                  console.log(err);

                ctx.socket.emit("add_message", {message: row['message'], author: row['author'], time: row['time']})
              });
          });

          next();
        }
      }
    },
    handler: (request, response) => {
      console.log("Join room");
    }
  };
};

exports.getPublicRooms = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'publicRooms',
        post: function(ctx, next) {

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

          next();
        }
      }
    },
    handler: (request, response) => {
      console.log("Get Public Room");
    }
  };
};

exports.getPrivateRooms = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'privateRooms',
        post: function(ctx, next) {

          rethink.getData('room', {visibility: 'private', subscribers: [ctx.data['subscriber']]}, rethink.sortAsc('name'), function (err, cursor) {
            if (err)
              console.log(err);
            else
              cursor.each(function (err, row) {
                if (err)
                  console.log(err);

                socket.emit("add_private_room", {id: row['id'], message: row['name'], owner: row['owner'], subscribers: row['subscribers']})
              });
          });

          next();
        }
      }
    },
    handler: (request, response) => {
      console.log("Get Private Room");
    }
  };
};

exports.addSubscriber = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'addSubscriber',
        post: function(ctx, next) {

          rethink.update('room', ctx.data['id'], {subscribers: ctx.data['subscribers']}, function (err, cursor) {
            if (err)
              console.log(err);
          });

          next();
        }
      }
    },
    handler: (request, response) => {
      console.log("Get Private Room");
    }
  };
};