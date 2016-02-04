(function () {
  'use strict';

  angular.module('rethink.chat.rooms', [
    ])
    .controller('RoomsCtrl', ['$state', '$rootScope', '$scope', 'socketio', RoomsCtrl]);

  function RoomsCtrl($state, $rootScope, $scope, socketio) {
    $scope.chat.rooms = [];
    $scope.addRoom = function() {
      if(!$scope.newRoom){
        return;
      }

      socketio.emit("create_room", {name: $scope.newRoom});
      $scope.newRoom = null;
    };

    $scope.enterRoom = function (room) {
      $scope.chat.currentRoom = room;
      socketio.emit("join_room", {name: room.name});
    };

    socketio.emit('public_rooms', {});

    socketio.on("add_room", function (data) {

      $scope.chat.rooms.push(data);
      $scope.$apply();
    });

  }
})();