'use strict';

const _ = require('lodash');

var rethink = require('./rethinkdb.js');

exports.createUser = function () {
  return {
    handler: (request, reply) => {

      var data = {
        login: request.payload.login
      };

      var errors;

      rethink.getData('user', data, null, (err, cursor) => {
        if (err)
          errors = {errors: ['an error occured while trying to find existing user']};
        else
          cursor.each((err, row) => {
            if (err)
              errors = {errors: ['an error occured while trying to find existing user']};
            if (row.login === data.login) {
              errors = {errors: ['user name already exists']};
            }
          }, () => {
            if (errors) return reply(errors);

            data.password = request.payload.password;
            rethink.writeToTable('user', data, function (err) {
              if (err) {
                return reply({errors: ['failed to create user']});
              }
            });
            reply('Success');
          });
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

      rethink.getData('user', data, null, function (err, cursor) {
        if (err) {
          return reply({errors: ['an error occurred while trying to find user']});
        }
        else if (!cursor) {
          return reply({errors: ['User not found']});
        }

        var user;
        cursor.each(function (err, row) {
          if (err)
            console.log(err);
          user = {
            login: row.login
          };
        }, () => {
          return reply(user);
        });

      });
    }
  };
};