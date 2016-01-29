'use strict';
var nconf = require('nconf');
var _ = require('lodash');
var Joi = require('joi');


/**
 * descIdMap()
 * ------------------------
 * Updates all of the programs stored in redis.
 * @param {object} collection - the collection being iterated over
 * @param {string=description} description
 * @param {string=id} id
 */
var descIdMap = function (collection, description, id) {
  if (!collection) return [];

  description = description || 'description';
  id = id || 'id';

  return _.map(collection, function (item) {
    return {
      description: item[description],
      id: item[id]
    }
  })
};

exports.config = function (request, reply) {
  reply({});
};

exports.nconf = function (request, reply) {

  reply({});
};

