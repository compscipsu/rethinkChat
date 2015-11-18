'use strict';
var _ = require('underscore');
var nconf = require('nconf');


exports.show = function (req, res){
 res.render('pages/client',defaultOptions(req, res, {}));
};



var defaultOptions = function(req, res, params) {
  var _d = {
    host: nconf.get('host'),
    port: nconf.get('port'),
    minifyJS: nconf.get('js-minify')
  };
  
  return _.defaults(params,_d);
};