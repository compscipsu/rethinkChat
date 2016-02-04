(function () {
  'use strict';

  angular.module('rethink.chat.user', [
    ])
    .controller('UserCtrl', ['$state', '$rootScope', '$scope', '$http', 'socketio', 'RethinkAuth', UserCtrl]);

  function UserCtrl($state, $rootScope, $scope, $http, socketio, RethinkAuth) {
    $scope.chat.currentUser = RethinkAuth.getUser();
    $scope.logout = function() {
      RethinkAuth.logout();
    };

    var loginCallback = function (err, user){
      if(err){
        alert(err);
      }
      $state.go('app.home');
    };

    $scope.login = function(){
      var user = $scope.user;

      if(!user || !user.email || !user.password){
        return;
      }

      RethinkAuth.login(user.email, user.password, loginCallback);


    };
    $scope.register = function(){
      var user = $scope.user;
      if(!user || !user.email || !user.password || (user.password !== user.verifyPassword)){
        return;
      }

      socketio.emit("create_user", {login: user.email, password: user.password});
      setTimeout(function() {
        RethinkAuth.login(user.email, user.password, loginCallback);
      }, 500);
    };

    $rootScope.$on('UserLoginChanged', function(){
      $scope.chat.currentUser = RethinkAuth.getUser();
    });

  }
})();