(function () {
  'use strict';

  angular.module('rethink.chat.chatterbox', [
    ])
    .controller('ChatterBoxCtrl', ['$state', '$rootScope', '$scope', 'socketio', ChatterBoxCtrl]);

  function ChatterBoxCtrl($state, $rootScope, $scope, socketio) {
    $scope.chat.author = 'anonymous';
    $scope.postMessage = function() {
      if(!$scope.message) {
        return;
      }
      socketio.emit("create_message", {message: $scope.message, room: $scope.chat.currentRoom.name, author: $scope.chat.author});
      $scope.chat.message = '';
    }
  }
})();