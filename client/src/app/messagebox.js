(function () {
  'use strict';

  angular.module('rethink.chat.messagebox', [])
    .controller('MessageListCtrl', ['$state', '$rootScope', '$scope', '$location', 'socketio', MessageListCtrl]);

  function MessageListCtrl($state, $rootScope, $scope, $location, socketio) {
    $scope.chat.messages = [];
    socketio.on("add_message", function (data) {
      data.time = moment(data.time).format("MM/DD/YYYY HH:mm");
      $scope.chat.messages.push(data);

      $scope.chat.loading = false;
      $scope.$apply();


      setTimeout(function () {
        $(".message-list").animate({ scrollTop: $('.message-list')[0].scrollHeight}, 100);
      }, 50);


      //$('#chatlog').append();
      //$(".messages").animate({scrollTop: $('.messages')[0].scrollHeight}, 10);
    });

  }
})();