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
      var visiblePages = 3;

      $scope.server = Falcon;
      $scope.validations = validationService;
      $scope.buttonSpinners = SpinnersFlag;
      $scope.models = {};

      $scope.entityName;
      $scope.entityType;
      $scope.entityTags;

      $scope.pages = [];
      $scope.nextPages = false;

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

        $scope.entityName = name;
        $scope.entityType = type;
        $scope.entityTags = tagsSt;

        $scope.searchList = [];
        changePagesSet(0, 0, 0);

      };

      var consultPage = function(offset, page, defaultPage){
        $scope.loading = true;
        EntityFalcon.searchEntities($scope.entityType, $scope.entityName, $scope.entityTags, offset).then(function() {
          if (EntityFalcon.data !== null) {
            $scope.pages[page] = {};
            $scope.pages[page].index = page;
            $scope.pages[page].data = EntityFalcon.data.entity;
            $scope.pages[page].show = true;
            $scope.pages[page].enabled = true;
            $scope.pages[page].label = "" + ((offset/resultsPerPage)+1);
            if($scope.pages[page].data.length > resultsPerPage){
              offset = offset + resultsPerPage;
              $scope.nextPages = true;
              if(page < visiblePages-1){
                consultPage(offset, page+1, defaultPage);
              }else{
                $scope.goPage(defaultPage);
              }
            }else{
              $scope.nextPages = false;
              $scope.goPage(defaultPage);
            }
          }
        });
      };

      var changePagesSet = function(offset, page, defaultPage){
        $scope.pages = [];
        consultPage(offset, page, defaultPage);
      }

      $scope.goPage = function (page) {
        $scope.loading = true;
        $scope.pages.forEach(function(pag) {
          pag.enabled = true;
        });
        $scope.pages[page].enabled = false;
        $scope.searchList = $scope.pages[page].data;
        if($scope.searchList.length > resultsPerPage){
          $scope.searchList.pop();
        }
        $scope.prevPages = parseInt($scope.pages[page].label) >  visiblePages ? true : false;
        Falcon.responses.listLoaded = true;
        $scope.loading = false;
        $timeout(function() {
          angular.element('#tagsInput').focus();
        }, 0, false);
      };

      $scope.changePagesSet = function(offset, page, defaultPage){
        changePagesSet(offset, page, defaultPage);
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