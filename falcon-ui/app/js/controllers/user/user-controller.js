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

  /***
   * @ngdoc controller
   * @name app.controllers.user
   * @requires EntityModel the entity model to copy the feed entity from
   * @requires Falcon the falcon service to talk with the Falcon REST API
   */
  var module = angular.module('app.controllers.user', [ 'app.services' ]);

  module.controller('UserFormCtrl', [ "$scope", "$interval", "Falcon", "$state",
      "ValidationService", "SpinnersFlag",
      "$timeout", "$rootScope", "$cookieStore", "UserFalcon",

    function ($scope, $interval, Falcon, $state,
        validationService, SpinnersFlag, $timeout, $rootScope, $cookieStore, UserFalcon) {

      var resultsPerPage = 10;

      $scope.server = Falcon;
      $scope.validations = validationService;
      $scope.buttonSpinners = SpinnersFlag;
      $scope.models = {};

      $scope.pages = [];
      $scope.nextPages = false;

      $scope.goPage = function(page){
        $scope.loading = true;
        var offset = (page-1) * resultsPerPage;
        UserFalcon.getUsers(offset).then(function() {
          if (UserFalcon.users !== null) {
            $scope.actualPage = page;
            $scope.searchList = UserFalcon.users;
            var totalPages = Math.ceil(UserFalcon.users.length/resultsPerPage);
            $scope.pages = []
            for(var i=0; i<totalPages; i++){
              $scope.pages[i] = {};
              $scope.pages[i].index = (i+1);
              $scope.pages[i].label = ""+(i+1);
              if(page === (i+1)){
                $scope.pages[i].enabled = false;
              }else{
                $scope.pages[i].enabled = true;
              }
            }
            //$timeout(function() {
            //  angular.element('#newUserBT').focus();
            //}, 0, false);
            Falcon.responses.listLoaded = true;
            $scope.loading = false;
          }
        });
      };

      $scope.refreshList = function () {
        $scope.goPage(1);
      };

      $scope.newUser = function () {
        $state.go("forms.user.new");
        $scope.update = false;
        $scope.user = {};
      };

      $scope.updateUser = function (user) {
        $state.go("forms.user.new");
        $scope.update = true;
        $scope.user = user;
      };

      $scope.deleteUser = function (user) {
        UserFalcon.deleteUser(user).then(function() {
          $scope.refreshList();
        });
      };

      $scope.save = function (user) {
        if(user.isAdmin === undefined){
          user.isAdmin = false;
        }
        UserFalcon.saveUser(user).then(function() {
          $state.go("forms.user.list");
          $scope.refreshList();
        });
      };

      $scope.refreshList();

    }
  ]);
})();




