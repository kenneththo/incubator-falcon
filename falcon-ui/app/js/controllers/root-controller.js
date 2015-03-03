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
            $scope.refreshList(EntityModel.type, $scope.tags);
          }).error(function (err) {
            Falcon.logResponse('error', err, false);
          });
        });
      };

      $scope.refreshList = function (type, tags) {
        var name;
        var tagsSt = "";
        var namedTags = [];

        if(tags === undefined || tags.length === 0){
          $scope.searchList = [];
          $scope.searchEntityType = "feed";
          return;
        }

        for(var i=0; i<tags.length; i++){
          var tag = tags[i].text;
          if(tag.indexOf("=") > -1){
            tagsSt += tag;
            if(i < tags.length-1){
              tagsSt += ",";
            }
          }else{
            namedTags.push(i);
            name = tag;
          }
        }

        for(i=0; i<namedTags.length; i++){
          if(i < namedTags.length-1){
            tags[namedTags[i]].striked = "tag-striked";
          }else{
            tags[namedTags[i]].striked = "";
          }
        }

        searchEntities(type, name, tagsSt);

      };

      var searchEntities = function (type, name, tags) {
        $scope.searchList = [];
        $scope.loading = true;
        Falcon.logRequest();
        Falcon.searchEntities(type, name, tags, 0).success(function (data) {
          Falcon.logResponse('success', data, false, true);
          if (data !== null) {
            console.log(data);
            $scope.searchList = data.entity;
          }
          Falcon.responses.listLoaded = true;
          $scope.loading = false;
        }).error(function (err) {
          $scope.loading= false;
          Falcon.logResponse('error', err);
        });
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