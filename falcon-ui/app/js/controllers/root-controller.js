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
    "$state", "X2jsService", "ValidationService", "SpinnersFlag", "EntityFalcon",
    function ($scope, $timeout, Falcon, FileApi,
              EntityModel, $state, X2jsService, validationService, SpinnersFlag, EntityFalcon) {

      var resultsPerPage = 10;

      $scope.server = Falcon;
      $scope.validations = validationService;
      $scope.buttonSpinners = SpinnersFlag;
      $scope.models = {};

      $scope.pageOne = {};
      $scope.pageTwo = {};
      $scope.pageTree = {};
      $scope.pageOne.enabled = false;
      $scope.pageTwo.enabled = false;
      $scope.pageTree.enabled = false;

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

        getPages(type, name, tagsSt, 0);

      };

      var getPages = function (type, name, tags, offset) {

        $scope.searchList = [];
        $scope.loading = true;

        //Page One
        EntityFalcon.searchEntities(type, name, tags, offset).then(function() {
          if (EntityFalcon.data !== null) {
            $scope.pageOne.data = EntityFalcon.data.entity;
            $scope.pageOne.enabled = true;
            $scope.pageOne.label = "" + ((offset/resultsPerPage)+1);
            if($scope.pageOne.data.length > resultsPerPage){
              offset = offset + resultsPerPage;
              //Page Two
              EntityFalcon.searchEntities(type, name, tags, offset).then(function() {
                if (EntityFalcon.data !== null) {
                  $scope.pageTwo.data = EntityFalcon.data.entity;
                  $scope.pageTwo.enabled = true;
                  $scope.pageTwo.label = "" + ((offset/resultsPerPage)+1);
                  if($scope.pageTwo.data.length > resultsPerPage){
                    offset = offset + resultsPerPage;
                    //Page Tree
                    EntityFalcon.searchEntities(type, name, tags, offset).then(function() {
                      if (EntityFalcon.data !== null) {
                        $scope.pageTree.data = EntityFalcon.data.entity;
                        $scope.pageTree.enabled = true;
                        $scope.pageTree.label = "" + ((offset/resultsPerPage)+1);
                        if($scope.pageTree.data.length > resultsPerPage){
                          offset = offset + resultsPerPage;
                          //TODO: Show next page

                        }else{
                          //TODO: Hide next page

                        }
                        //Actual Page One
                        $scope.searchList = $scope.pageOne.data;
                        Falcon.responses.listLoaded = true;
                        $scope.loading = false;
                        $timeout(function() {
                          angular.element('#tagsInput').focus();
                        }, 0, false);
                      }
                    });
                  }
                }
              });
            }
          }
        });
      };

      $scope.goPageTwo = function (page) {
        $scope.loading = true;
        if(page === 2){
          $scope.searchList = $scope.pageTwo.data;
        }else if (page === 1){
          $scope.searchList = $scope.pageTree.data;
        }else{
          $scope.searchList = $scope.pageOne.data;
        }
        $scope.loading = false;
        $timeout(function() {
          angular.element('#tagsInput').focus();
        }, 0, false);
      }

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