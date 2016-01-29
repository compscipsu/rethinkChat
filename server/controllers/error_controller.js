'use strict';

var nconf = require('nconf');
var _ = require('lodash');
var xss = require('xss');
var Joi = require('joi');

exports.logError = function (request, reply) {
  if (nconf.get('enable-clientside-logging')) {
    console.log('Client Error: %j', request.payload.error);
  }

  reply('SUCCESS');
};

