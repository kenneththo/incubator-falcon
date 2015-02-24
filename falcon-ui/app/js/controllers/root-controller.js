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

  var app = angular.module('app.controllers.rootCtrl', ['app.services']);

  app.controller('RootCtrl', [
    "$scope", "$timeout", "Falcon", "FileApi", "EntityModel",
    "$state", "X2jsService", "ValidationService", "SpinnersFlag",
    function ($scope, $timeout, Falcon, FileApi,
              EntityModel, $state, X2jsService, validationService, SpinnersFlag) {

      $scope.server = Falcon;
      $scope.validations = validationService;
      $scope.buttonSpinners = SpinnersFlag;
      $scope.models = {};

      $scope.handleFile = function (evt) {
        Falcon.logRequest();
        FileApi.loadFile(evt).then(function () {
          Falcon.postSubmitEntity(FileApi.fileRaw, EntityModel.type).success(function (response) {
            Falcon.logResponse('success', response, false);
            $scope.refreshList(EntityModel.type);
          }).error(function (err) {
            Falcon.logResponse('error', err, false);
          });
        });
      };

      $scope.refreshList = function (tags) {

        $scope.loading= true;
        var type = "feed";
        Falcon.logRequest();

        var name;
        var tagsSt = "";

        for(var i=0; i<tags.length; i++){
          var tag = tags[i].text;
          if(tag.indexOf("=") > -1){
            tagsSt += tag;
            if(i < tags.length-1){
              tagsSt += ",";
            }
          }else{
            name = tag;
          }
        }

        Falcon.searchEntities(type, name, tagsSt).success(function (data) {
          Falcon.logResponse('success', data, false, true);
          Falcon.responses.listLoaded = true;
          $scope.searchList = [];
          if (data === null) {
            $scope.searchList = [];
          }else{
            var typeOfData = Object.prototype.toString.call(data.entity);
            if (typeOfData === "[object Array]") {
              $scope.searchList = data.entity;
              console.log($scope.searchList.length);
            } else if (typeOfData === "[object Object]") {
              $scope.searchList[0] = data.entity;
            } else {
              console.log("type of data not recognized");
            }
          }
          $scope.loading= false;
        }).error(function (err) {
          $scope.loading= false;
          Falcon.logResponse('error', err);
        });

      };

      $scope.refreshLists = function () {
        //$scope.refreshList('cluster');
        $scope.refreshList('feed');
        //$scope.refreshList('process');
      };
      $scope.closeAlert = function (index) {
        Falcon.removeMessage(index);
      };
      $scope.cancel = function (type, state) {
        var cancelInfo = {
          state: state || $state.current.name,
          message: type + ' edition canceled '
        };
        Falcon.logResponse('cancel', cancelInfo, type, false);
      };
      $scope.restore = function (cancelInfo, index) {
        $state.go(cancelInfo.status);
        $scope.closeAlert(index);
      };



    }]);

}());