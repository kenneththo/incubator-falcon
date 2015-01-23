/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function () {
  'use strict';

  var app = angular.module('mirroring-app', [
    'ui.bootstrap', 'ui.router', 'ngCookies', 'ngAnimate', 'ngMessages', 'checklist-model',
    'form-module', 'dashboard-module', 'login-module'
  ]);

  app.config(["$stateProvider", "$urlRouterProvider", "$httpProvider",
            function ($stateProvider, $urlRouterProvider, $httpProvider) {

    $httpProvider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');

    $httpProvider.defaults.headers.common["X-Requested-By"] = 'X-Requested-By';

    $urlRouterProvider.otherwise("/");

    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'html/dashboard.html',
        controller: 'DashboardCtrl'
      })
      .state('login', {
        controller: 'LoginFormCtrl',
        templateUrl: 'html/login.html'
      })
      .state('form', {
        templateUrl: 'html/form.html',
        controller: 'FormRootCtrl'
      })
      .state('form.general', {
        controller: 'FormGeneralCtrl',
        templateUrl: 'html/form-general.html'
      })
      .state('form.timing', {
        controller: 'FormTimingCtrl',
        templateUrl: 'html/form-timing.html'
      })
      .state('forms.summary', {
        controller: 'FormSummaryCtrl',
        templateUrl: 'html/form-summary.html'
      });
  }]);

  app.run(['$rootScope', '$state', '$location', '$http', '$stateParams', '$cookieStore',
    function ($rootScope, $state, $location, $http, $stateParams, $cookieStore) {

      var location = $location.absUrl();
      var index = location.indexOf("views/");
      if(index !== -1){
        index = index + 6;
        var path = location.substring(index);
        var servicePaths = path.split("/");
        $rootScope.serviceURI = '/api/v1/views/'+servicePaths[0]+'/versions/'+servicePaths[1]+'/instances/'+servicePaths[2]+'/resources/proxy';

      }

      $rootScope.ambariView = function () {
        var location_call = $location.absUrl();
        var index_call = location_call.indexOf("views/");
        if(index_call !== -1){
          return true;
        }else{
          return false;
        }
      };

      $rootScope.userLogged = function () {
        if($rootScope.ambariView()){
          return true;
        }else{
          if(angular.isDefined($cookieStore.get('userToken')) && $cookieStore.get('userToken') !== null){
            return true;
          }else{
            return false;
          }
        }
      };
      $rootScope.previousState;
      $rootScope.currentState;
      $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {

        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
      });
      $rootScope.$on('$stateChangeError',
        function(event, toState, toParams, fromState, fromParams, error){
          console.log('Manual log of stateChangeError: ' + error);
        });

      $rootScope.$on('$stateChangeStart',
        function(event, toState){
          if(toState.name !== 'login'){
            if($rootScope.ambariView()){

              if (angular.isDefined($cookieStore.get('userToken')) && $cookieStore.get('userToken') !== null) {

              } else {
                event.preventDefault();
                $http.get($rootScope.serviceURI).success(function (data) {
                  var userToken = {};
                  userToken.user = data;
                  $cookieStore.put('userToken', userToken);
                  $state.transitionTo('main');
                });
              }

            } else if ($rootScope.userLogged()) {

              var userToken = $cookieStore.get('userToken');
              var timeOut = new Date().getTime();

              timeOut = timeOut - userToken.timeOut;

              if (timeOut > userToken.timeOutLimit) {
                console.log("session expired");
                $cookieStore.put('userToken', null);
                event.preventDefault();
                $state.transitionTo('login');
              } else {
                userToken.timeOut = new Date().getTime();
                $cookieStore.put('userToken', userToken);
              }

            } else {
              console.log("Not logged, redirect to login");
              event.preventDefault();
              $state.transitionTo('login');
            }
          }
        });

    }]);

}());