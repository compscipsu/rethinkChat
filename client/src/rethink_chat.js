(function () {
  'use strict';

  var ueAdmin = angular.module('rethink.chat', [
    'rethink.chat.messagebox',
    'rethink.chat.rooms',
    'rethink.chat.chatterbox'
  ]);
  ueAdmin.controller('RethinkChatCtrl', ['$rootScope', '$scope', RethinkChatCtrl]);

  function RethinkChatCtrl($rootScope, $scope) {

    $scope.chat = {
    };




    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {


    });

    $rootScope.$on('$viewContentLoaded', function () {


    });

    $scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    });
  }

})();