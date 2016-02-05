(function () {
  'use strict';

  angular.module('rethink.chat.user', [])
    .controller('UserCtrl', ['$state', '$rootScope', '$scope', '$http', 'socketio', 'RethinkAuth', UserCtrl]);

  function UserCtrl($state, $rootScope, $scope, $http, socketio, RethinkAuth) {
    $scope.chat.currentUser = RethinkAuth.getUser();
    $scope.logout = function () {
      RethinkAuth.logout();
    };

    var loginCallback = function (err, user) {
      if (err) {
        alert(err);
      }
      $state.go('app.home');
    };

    $scope.login = function () {
      var user = $scope.user;

      if (!user || !user.email || !user.password) {
        return;
      }

      RethinkAuth.login(user.email, user.password, loginCallback);


    };
    $scope.register = function () {
      var user = $scope.user;
      if (!user || !user.email || !user.password || (user.password !== user.verifyPassword)) {
        return;
      }

      var data = {
        login: user.email,
        password: user.password,
        crumb: crumb
      };

      $http.post("/chat/user/create", data).then(function (result) {
        result.data = result.data || {};
        if (result.data.errors) return alert(JSON.stringify(result.data.errors));
        RethinkAuth.login(user.email, user.password, loginCallback);
      }, function (error) {
        callback(error);
      });

    };

    $rootScope.$on('UserLoginChanged', function () {
      $scope.chat.currentUser = RethinkAuth.getUser();
    });

  }
})();