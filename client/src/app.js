(function () {
  'use strict';

  var ueAdmin = angular.module('rethink', [
    'ui.router',
    'rethink.chat'
    /* Shared modules */
  ]);

  ueAdmin.config(['$provide', '$httpProvider', '$stateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', configure]);

  function configure($provide, $httpProvider, $stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
    //
    //$httpProvider.defaults.withCredentials = true;

    $urlRouterProvider.otherwise('/chat');

    //supports optional trailing slash
    $urlMatcherFactoryProvider.strictMode(false);

    if (!window.crumb) {
      console.log('crumb was not initialized');
    }
    $provide.constant('crumb', window.crumb);
    $provide.constant('socketio', io.connect(window.host + ":" + window.port));

    //static
    $stateProvider
      .state('app', {
        url: '/',
        views: {
          main: {
            templateUrl: 'templates/app',
            controller: 'RethinkChatCtrl'
          }
        }
      })
      .state('app.login', {
        url: 'login',
        views: {
          login: {
            templateUrl: 'templates/components/login',
            controller: 'UserCtrl'
          }
        }
      })
      .state('app.home', {
        url: 'chat',
        views: {
          chatterBox: {
            templateUrl: 'templates/components/chatter_box',
            controller: 'ChatterBoxCtrl'
          },
          messageList: {
            templateUrl: 'templates/components/message_list',
            controller: 'MessageListCtrl'
          },
          rooms: {
            templateUrl: 'templates/components/rooms',
            controller: 'RoomsCtrl'
          },
          user: {
            templateUrl: 'templates/components/logout',
            controller: 'UserCtrl'
          }
        },
        resolve: {
          auth: ["$q", "RethinkAuth", function($q, RethinkAuth) {
            var userInfo = RethinkAuth.getUser();

            if (userInfo) {
              return $q.when(userInfo);
            } else {
              return $q.reject({ authenticated: false });
            }
          }]
        }
      });
  }

  ueAdmin.controller('MainCtrl', ['$rootScope', '$state', function($rootScope, $state){
    $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
      if (error.authenticated === false) {
        event.preventDefault();
        $state.go('app.login');
      }
    });

    $rootScope.$on('$viewContentLoaded', function () {


    });

    $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
    });
  }]);
  ueAdmin.factory('RethinkAuth', ['$rootScope','$http', '$q', '$window', 'crumb', function ($rootScope, $http, $q, $window, crumb) {
    var _user;

    var updateUser = function (userDetails) {

    };

    function init() {
      if($window.sessionStorage["RethinkUser"]){
        try {
          _user = JSON.parse($window.sessionStorage["RethinkUser"]);
        } catch (e) {
          console.log('Unable to parse RethinkUser');
        }
      }
    }

    init();

    return {
      getUser: function () {
        return _user;
      },
      login: function (userName, password, callback) {

        $http.post("/chat/user/login", {
          login: userName,
          password: password,
          crumb: crumb
        }).then(function (result) {
          result.data = result.data ||{};
          if(result.data.errors) return callback(result.data.errors);

          _user = {
            login: result.data.login,
            userName: result.data.login.split('@')[0]
          };
          $window.sessionStorage["RethinkUser"] = JSON.stringify(_user);
          $rootScope.$broadcast('UserLoginChanged');
          callback(null, _user);
        }, function (error) {
          callback(error);
        });
      }
      ,
      logout: function () {
        _user = null;
        localStorage.removeItem('RethinkUser');
        $rootScope.$broadcast('UserLoginChanged');
      }
    }
  }
  ]);


})();