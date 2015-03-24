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

  var datasetModule = angular.module('app.controllers.dataset', [ 'app.services' ]);

  datasetModule.controller('DatasetCtrl', [ "$scope", "$interval", "Falcon", "EntityModel", "$state",
    "ValidationService", "SpinnersFlag", "$timeout", "$rootScope", "clustersList",
    function ($scope, $interval, Falcon, EntityModel, $state,
              validationService, SpinnersFlag, $timeout, $rootScope, clustersList) {

      $scope.skipUndo = false;
      $scope.$on('$destroy', function () {
        if (!$scope.skipUndo) {
          $scope.$parent.cancel('dataset', $rootScope.previousState);
        }
      });

      $scope.isActive = function(route) {
        return $state.current.name === route;
      };

      $scope.clustersList = clustersList;

      $scope.switchModel = function (type) {
        $scope.model = EntityModel.datasetModel[type].process;
        $scope.UIModel.formType = type;
        /*$scope.convertTags();
        $scope.locateProperties();*/
      };
      //--------------init-------------//
      //$scope.switchModel('HDFS');

      $scope.model = EntityModel.datasetModel.HDFS.process;
      $scope.UIModel = {
        name: "",
        tags: {
          newTag: { value:"", key:"" },
          tagsArray: [],
          tagsString: ""
        },
        formType: "HDFS",
        runOn: "source",
        source: {
          location: "HDFS",
          cluster: "",
          url: "",
          path: "",
          hiveDatabaseType: "databases",
          hiveDatabases: "",
          hiveDatabase: "",
          hiveTables: ""
        },
        target: {
          location: "HDFS",
          cluster: "",
          url: "",
          path: ""
        },
        alerts: {
          alert: { email: "" },
          alertsArray: []
        },
        validity: {
          start: new Date(),
          startTime: new Date(),
          end: new Date(),
          endTime: new Date(),
          tz: "GMT+00:00",
          startISO: "",
          endISO: ""
        },
        frequency: {
          number: 5,
          unit: 'minutes'
        },
        allocation: {
          hdfs:{
            maxMaps: 5,
            maxBandwidth: 100
          },
          hive:{
            maxMapsDistcp: 1,
            maxMapsMirror: 5,
            maxMapsEvents: -1,
            maxBandwidth: 100
          }
        },
        hiveOptions: {
          source:{
            stagingPath: "",
            hiveServerToEndpoint: ""
          },
          target:{
            stagingPath: "",
            hiveServerToEndpoint: ""
          }
        },
        retry: {
          policy:"PERIODIC",
          delay: {
            unit: "minutes",
            number: 30
          },
          attempts: 3
        },
        acl: {
          owner: "",
          group: "",
          permissions: ""
        }
      };
      //-------------------------//
      $scope.checkFromSource = function () {
        if ($scope.UIModel.source.location !== "HDFS") {
          $scope.UIModel.target.location = "HDFS";
          $scope.UIModel.runOn = 'target';
        }
      };
      $scope.checkFromTarget = function () {
        if ($scope.UIModel.target.location !== "HDFS") {
          $scope.UIModel.source.location = "HDFS";
          $scope.UIModel.runOn = 'source';
        }
      };


      /*$scope.locateProperties = function () {

        $scope.model.properties.property.forEach(function (item) {
          console.log(item._name);
        });
      };*/

      //----------------TAGS---------------------//
      $scope.addTag = function () {
        $scope.UIModel.tags.tagsArray.push($scope.UIModel.tags.newTag);
        $scope.UIModel.tags.newTag = {value:"", key:""};
        $scope.convertTags();
      };
      $scope.removeTag = function (index) {
        $scope.UIModel.tags.tagsArray.splice(index, 1);
        $scope.convertTags();
      };
      $scope.convertTags = function () {
        var result = [];
        $scope.UIModel.tags.tagsArray.forEach(function(element) {
          if(element.key && element.value) {
            result.push(element.key + "=" + element.value);
          }
        });
        result = result.join(",");
        $scope.UIModel.tags.tagsString = result;
      };
      $scope.splitTags = function () {
        $scope.UIModel.tags.tagsArray = [];
        $scope.UIModel.tags.tagsString.split(",").forEach(function (fieldToSplit) {
          var splittedString = fieldToSplit.split("=");
          $scope.UIModel.tags.tagsArray.push({key: splittedString[0], value: splittedString[1]});
        });
      };
      //----------- Alerts -----------//
      $scope.addAlert = function () {
        $scope.UIModel.alerts.alertsArray.push($scope.UIModel.alerts.alert);
        $scope.UIModel.alerts.alert = { email: "" };
      };
      $scope.removeAlert = function (index) {
        $scope.UIModel.alerts.alertsArray.splice(index, 1);
      };

      //----------------- DATE INPUTS -------------------//

      $scope.dateFormat = 'MM/dd/yyyy';

      $scope.openStartDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.startOpened = true;
      };
      $scope.openEndDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.endOpened = true;
      };

      $scope.constructDate = function () {

        var startUTC = new Date(Date.UTC(
              $scope.UIModel.validity.start.getUTCFullYear(),
              $scope.UIModel.validity.start.getUTCMonth(),
              $scope.UIModel.validity.start.getUTCDate(),
              $scope.UIModel.validity.startTime.getHours(),
              $scope.UIModel.validity.startTime.getMinutes(),
              0, 0)
            ).toUTCString() + $scope.UIModel.validity.tz.slice(3),

            endUTC = new Date(Date.UTC(
              $scope.UIModel.validity.end.getUTCFullYear(),
              $scope.UIModel.validity.end.getUTCMonth(),
              $scope.UIModel.validity.end.getUTCDate(),
              $scope.UIModel.validity.endTime.getHours(),
              $scope.UIModel.validity.endTime.getMinutes(),
              0, 0)).toUTCString() + $scope.UIModel.validity.tz.slice(3),
            startDateUTCRaw = Date.parse(startUTC),
            endDateUTCRaw = Date.parse(endUTC);

        $scope.UIModel.validity.startISO = new Date(startDateUTCRaw).toISOString();
        $scope.UIModel.validity.endISO = new Date(endDateUTCRaw).toISOString();

      };
      //-----------Timezone---------//
      $scope.$watch(function () { return $scope.UIModel.validity.tz; }, function () { return $scope.constructDate(); });





      //-------------------------------------//






      $scope.goNext = function (formInvalid, stateName) {
        SpinnersFlag.show = true;
        if (!validationService.nameAvailable || formInvalid) {
          validationService.displayValidations.show = true;
          validationService.displayValidations.nameShow = true;
          SpinnersFlag.show = false;
          angular.element('body, html').animate({scrollTop: 0}, 500);
          return;
        }
        validationService.displayValidations.show = false;
        validationService.displayValidations.nameShow = false;
        createXML();
        $state.go(stateName);
        angular.element('body, html').animate({scrollTop: 0}, 500);
      };

      $scope.goBack = function (stateName) {
        SpinnersFlag.backShow = true;
        validationService.displayValidations.show = false;
        validationService.displayValidations.nameShow = false;
        $state.go(stateName);
        angular.element('body, html').animate({scrollTop: 0}, 500);
      };

      $scope.save = function () {
        var fileStr = createXML();

        Falcon.postSubmitRecipe(fileStr)
          .success(function (data) {
            console.log(data);
            Falcon.logResponse('success', data, false);
          })
          .error(function (error) {
            console.log(error);
          });
        //console.log(fileStr);


      };


      function createXML () {
        $scope.model._name = $scope.UIModel.name;
        $scope.model.tags = $scope.UIModel.tags.tagsString;

        if ($scope.UIModel.formType === 'HDFS') {

        } else if ($scope.UIModel.formType === 'HIVE') {

        } else {

        }



        console.log($scope.model);

      }




    }
  ]);
}());




