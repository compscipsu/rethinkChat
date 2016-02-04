(function () {
  'use strict';

  var ueAdmin = angular.module('rethink.chat', [
    'rethink.chat.messagebox',
    'rethink.chat.rooms',
    'rethink.chat.chatterbox',
    'rethink.chat.user'
  ]);
  ueAdmin.controller('RethinkChatCtrl', ['$rootScope', '$scope','RethinkAuth', RethinkChatCtrl]);

  function RethinkChatCtrl($rootScope, $scope, RethinkAuth) {

    $scope.chat = {
    };
  }

})();