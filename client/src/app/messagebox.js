(function () {
  'use strict';

  angular.module('rethink.chat.messagebox', [])
    .controller('MessageListCtrl', ['$state', '$rootScope', '$scope', 'socketio', MessageListCtrl]);

  function MessageListCtrl($state, $rootScope, $scope, socketio) {
    $scope.chat.messages = [];
    socketio.on("add_message", function (data) {
      data.time = moment(data.time).format("MM/DD/YYYY HH:mm");
      $scope.chat.messages.push(data);
      $scope.$apply();


      //$('#chatlog').append();
      //$(".messages").animate({scrollTop: $('.messages')[0].scrollHeight}, 10);
    });

  }
})();