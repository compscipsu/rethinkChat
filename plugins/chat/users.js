'use strict';

const _ = require('lodash');

var rethink = require('./rethinkdb.js');

exports.createUser = function () {
  return {
    handler: (request, reply) => {

      var data = {
        login: request.payload.data.login
      };

      rethink.getData('user', data, null, function (err, cursor) {
        if (err)
          return reply({errors: ['an error occured while trying to find existing user']});
        else
          cursor.each(function (err, row) {
            if (err)
              return reply({errors: ['an error occured while trying to find existing user']});

            if (row.login === data.login) {
              return reply({errors: ['user name already exists']});
            }
          });
      });

      data.password = request.payload.password;
      rethink.writeToTable('user', data, function (err) {
        if (err) {
          return reply({errors: ['failed to create user']});
        }
      });
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

      rethink.getData('user', data, null, function(err, cursor) {
        if (err) {
          return reply({errors: ['an error occured while trying to find user']});
        }
        else if(!cursor) {
          return reply({errors: ['User not found']});
        }

        var user = {};
        cursor.each(function (err, row) {
          if (err)
            console.log(err);

          user.login = row.login;
        }, () => {
          return reply(user);
        });

      });
    }
  };
};