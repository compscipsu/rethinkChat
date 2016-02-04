'use strict';

var rethink = require('./rethinkdb.js');

exports.createUser = function () {
  return {
    plugins: {
      'hapi-io': {
        event: 'create_user',
        post: function(ctx, next) {
          var data = {
            login: ctx.data['login'],
            password: ctx.data['password']
          };

          rethink.writeToTable('user', data, function (err) {
            if (err)
              console.log(err);
          });

          next();
        }
      }
    },
    handler: (request, reply) => {
      console.log("Create User");
      reply();
    }
  };
};


exports.loginUser = function () {
  return {
    handler: (request, reply) => {
      var data = {
        login: request.payload.login,
        password: request.payload.password
      };

      rethink.getData('user', data, rethink.sortAsc('login'), new function(err, cursor) {
        if (err) return reply({errors: ['an error occured while trying to find user']});
        else if(!cursor) return reply({errors:['User not found']});

        var user = {};
        cursor.each(function (err, row) {
          if (err)
            console.log(err);


          //TODO
        });

        return reply(user);
      });
    }
  };
};