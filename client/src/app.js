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

    $urlRouterProvider.otherwise('/');

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
        views: {
          main: {
            templateUrl: 'templates/app',
            controller: 'RethinkChatCtrl'
          }
        }
      });

    $stateProvider
      .state('app.home', {
        url: '/',
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
          }
        }
      });
  }

})();