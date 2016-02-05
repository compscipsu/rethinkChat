(function () {
  'use strict';

  angular.module('rethink.chat.rooms', [])
    .controller('RoomsCtrl', ['$state', '$rootScope', '$scope', 'socketio', RoomsCtrl]);

  function RoomsCtrl($state, $rootScope, $scope, socketio) {
    $scope.chat.rooms = [];
    $scope.addRoom = function () {
      if (!$scope.newRoom) {
        return;
      }

      socketio.emit("create_room", {name: $scope.newRoom});
      $scope.newRoom = null;
    };

    $scope.enterRoom = function (room) {
      var currentRoom = _.findWhere($scope.chat.rooms, {active: true}) || {};

      if (currentRoom.name === room.name) return;

      $scope.chat.loading = true;

      setTimeout(function () {
        $scope.chat.loading = false;
        $scope.$apply()
      }, 1500);

      currentRoom.active = false;

      $scope.chat.messages = [];

      room.active = true;
      $scope.chat.currentRoom = room;
      socketio.emit("join_room", {name: room.name});
    };

    socketio.emit('public_rooms', {});

    socketio.on("add_room", function (data) {
      if (_.findWhere($scope.chat.rooms, {id: data.id})) return;

      $scope.$apply(function () {
        $scope.chat.rooms.push(data);
      });
    });
  }
})();