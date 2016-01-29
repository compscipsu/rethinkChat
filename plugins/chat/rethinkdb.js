'use strict';

var RethinkDB = require('rethinkdb');

var internals;

const connectToDB = function (callback) {
  RethinkDB.connect(internals, callback);
};

exports.init = function(options) {
  internals = options;
  console.log('RethinkDB properties', JSON.stringify(internals));
};

exports.subscribeToChanges = (table, options, callback) => {
  connectToDB(function (err, conn) {
    RethinkDB.table(table).changes(options).run(conn, callback);
  });
};

exports.writeToTable = (table, data, callback) => {
  connectToDB(function (err, conn) {
    if (err)
      callback(err);
    else
      RethinkDB.table(table).insert(data).run(conn, callback);
  });
};

exports.getData = (table, filter, sort, callback) => {
  connectToDB(function (err, conn) {
    if (filter) {
      RethinkDB.table(table).filter(filter).orderBy(sort).run(conn, callback);
    } else {
      RethinkDB.table(table).orderBy(sort).run(conn, callback);
    }
  });
};

exports.update = (table, id, data, callback) => {
  connectToDB(function (err, conn) {
      RethinkDB.table(table).get(id).update(data).run(conn, callback);
  });
};

exports.count = (table, data, callback) => {
  connectToDB(function (err, conn) {
    RethinkDB.table(table).filter(data).count().run(conn, callback);
  });
};

exports.sortAsc = (value) => {
  return RethinkDB.asc(value);
};

exports.now = () => {
  return RethinkDB.now();
};