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

	var entitiesListModule = angular.module('app.directives.instances-list', ['app.services' ]);

  entitiesListModule.controller('InstancesListCtrl', ['$scope', 'Falcon', 'X2jsService', '$window', 'EncodeService',
                                      function($scope, Falcon, X2jsService, $window, encodeService) {

    $scope.downloadEntity = function(type, name) {
      Falcon.logRequest();
      Falcon.getEntityDefinition(type, name) .success(function (data) {
        Falcon.logResponse('success', data, false, true);
        $window.location.href = 'data:application/octet-stream,' + encodeService.encode(data);
      }).error(function (err) {
        Falcon.logResponse('error', err, false);
      });
    };

  }]);

  entitiesListModule.filter('tagFilter', function () {
    return function (items) {
      var filtered = [], i;
      for (i = 0; i < items.length; i++) {
        var item = items[i];
        if(!item.list || !item.list.tag) { item.list = {tag:[""]}; }
        filtered.push(item);
      }
      return filtered;
    };
  });

  entitiesListModule.directive('instancesList', ["$timeout", 'Falcon', function($timeout, Falcon) {
    return {
      scope: {
        input: "=",
        schedule: "=",
        resume:"=",
        suspend: "=",
        stop: "=",
        type: "=",
        name: "=",
        instanceDetails:"=",
        refresh: "="
      },
      controller: 'InstancesListCtrl',
      restrict: "EA",
      templateUrl: 'html/directives/instancesListDv.html',
      link: function (scope) {
        scope.server = Falcon;
        scope.$watch('input', function() {
          scope.selectedRows = [];
          scope.checkButtonsToShow();

        }, true);

        scope.selectedRows = [];
        scope.$parent.refreshInstanceList(scope.type, scope.name);

        scope.checkedRow = function (name) {
          var isInArray = false;
          scope.selectedRows.forEach(function(item) {
            if (name === item.instance) {
              isInArray = true;
            }
          });
          return isInArray;
        };

        scope.simpleFilter = {};

        scope.selectedDisabledButtons = {
          schedule:true,
          suspend:true,
          resume:true,
          stop:true
        };

        scope.checkButtonsToShow = function() {
          var statusCount = {
            "SUBMITTED":0,
            "RUNNING":0,
            "SUSPENDED":0,
            "UNKNOWN":0
          };

          $timeout(function() {

            if(scope.selectedRows.length === scope.input.length){
              scope.selectedAll = true;
            }else{
              scope.selectedAll = false;
            }

            scope.selectedRows.forEach(function(instance) {
              statusCount[instance.status] = statusCount[instance.status]+1;
            });

            if(statusCount.SUBMITTED > 0) {
              if(statusCount.RUNNING > 0 || statusCount.SUSPENDED > 0 || statusCount.UNKNOWN > 0) {
                scope.selectedDisabledButtons = { schedule:true, suspend:true, resume:true, stop:true };
              }
              else {
                scope.selectedDisabledButtons = { schedule:false, suspend:true, resume:true, stop:true };
              }
            }
            if(statusCount.RUNNING > 0) {
              if(statusCount.SUBMITTED > 0 || statusCount.SUSPENDED > 0 || statusCount.UNKNOWN > 0) {
                scope.selectedDisabledButtons = { schedule:true, suspend:true, resume:true, stop:false };
              }
              else {
                scope.selectedDisabledButtons = { schedule:true, suspend:false, resume:true, stop:true  };
              }
            }
            if (statusCount.SUSPENDED > 0) {
              if(statusCount.SUBMITTED > 0 || statusCount.RUNNING > 0 || statusCount.UNKNOWN > 0) {
                scope.selectedDisabledButtons = { schedule:true, suspend:true, resume:true, stop:false };
              }
              else {
                scope.selectedDisabledButtons = { schedule:true, suspend:true, resume:false, stop:false };
              }
            }
            if (statusCount.UNKNOWN > 0) {
              scope.selectedDisabledButtons = { schedule:true, suspend:true, resume:true, stop:true };
            }

            if(scope.selectedRows.length === 0) {
              scope.selectedDisabledButtons = {
                schedule:true,
                resume:true,
                suspend:true,
                stop:true
              };
            }
          }, 50);
        };

        var isSelected = function(item){
          var selected = false;
          scope.selectedRows.forEach(function(entity) {
            if(angular.equals(item, entity)){
              selected = true;
            }
          });
          return selected;
        }

        scope.checkAll = function () {
          if(scope.selectedRows.length >= scope.input.length){
            angular.forEach(scope.input, function (item) {
              scope.selectedRows.pop();
            });
          }else{
            angular.forEach(scope.input, function (item) {
              var checkbox = {'instance':item.instance, 'startTime':item.startTime, 'endTime':item.endTime, 'status':item.status};
              if(!isSelected(checkbox)){
                scope.selectedRows.push(checkbox);
              }
            });
          }
        };

        scope.goInstanceDetails = function(name) {
          scope.instanceDetails(name, scope.type);
        };

        scope.scopeSuspend = function () {
          var i;
          for(i = 0; i < scope.selectedRows.length; i++) {
            var multiRequestType = scope.selectedRows[i].type.toLowerCase();
            Falcon.responses.multiRequest[multiRequestType] += 1;
            scope.suspend(scope.type, scope.name, scope.selectedRows[i].startTime, scope.selectedRows[i].endTime);
          }
        };

        scope.scopeResume = function () {
          var i;
          for(i = 0; i < scope.selectedRows.length; i++) {
            var multiRequestType = scope.selectedRows[i].type.toLowerCase();
            Falcon.responses.multiRequest[multiRequestType] += 1;
            scope.resume(scope.selectedRows[i].type, scope.selectedRows[i].name);
          }
        };

        scope.download = function() {
          var i;
          for(i = 0; i < scope.selectedRows.length; i++) {
            scope.downloadEntity(scope.selectedRows[i].type, scope.selectedRows[i].name);
          }
        };

      }
    };
  }]);

})();