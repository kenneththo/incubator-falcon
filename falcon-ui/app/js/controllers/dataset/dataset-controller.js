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

      $scope.clustersList = clustersList;

      $scope.skipUndo = false;
      $scope.$on('$destroy', function () {
        if (!$scope.skipUndo) {
          $scope.$parent.cancel('dataset', $rootScope.previousState);
        }
      });

      $scope.model = EntityModel.datasetModel;

      $scope.isActive = function(route) {
        return $state.current.name === route;
      };


      //-------------------------------------//
      $scope.newTag = {value:"", key:""};
      $scope.addTag = function () {
        $scope.model.tags.push($scope.newTag);
        $scope.newTag = {value:"", key:""};
      };
      $scope.removeTag = function (index) {
        $scope.model.tags.splice(index, 1);
      };


      //----------------- DATE INPUT -------------------//
      $timeout(function () { //imports date if exists
        if ($scope.model.start) {
          $scope.importDate();
        }
      }, 30);

      $scope.dateFormat = 'MM/dd/yyyy';

      $scope.date = {
        start: undefined,
        time: new Date(2015, 1, 1, 0, 0, 0, 0),
        tz: "GMT+00:00"
      };

      $scope.importDate = function () {

        var rawDateString = $scope.model.start,
          timezone = rawDateString.slice(-6),
          dateString = rawDateString.slice(0, -6),
          dateUTC = Date.parse(dateString),
          rawDate = new Date(dateUTC);

        $scope.date = {
          start: new Date(
            rawDate.getUTCFullYear(),
            rawDate.getUTCMonth(),
            rawDate.getUTCDate(), 0, 0, 0, 0
          ),
          time: new Date(
            2015, 1, 1,
            rawDate.getUTCHours(),
            rawDate.getUTCMinutes(),
            0, 0
          ),
          tz: timezone
        };

      };
      console.log($scope.date.tz.slice(0))

      $scope.constructDate = function () {
        if ($scope.date.start && $scope.date.time && $scope.date.tz) {

          $scope.model.start = new Date(Date.UTC(
            $scope.date.start.getUTCFullYear(),
            $scope.date.start.getUTCMonth(),
            $scope.date.start.getUTCDate(),
            $scope.date.time.getHours(),
            $scope.date.time.getMinutes(),
            0, 0)).toUTCString() +  $scope.date.tz.slice(3);

        }
      };

      $scope.openDatePicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };

      //----------- ON ERROR COMPOUND INPUT -----------//
      $timeout(function () { //imports ERROR COMPOUND fields if exists
        $scope.onErrorImport();
      }, 30);

      $scope.abortOptions = {
        policy: 'back-off'
      };
      $scope.retryOptions = {
        retry_every: {
          number: '',
          unit: 'seconds'
        },
        stop_on: {
          value: 'attempts',

          attempts: {
            number: ''
          },
          without_response: {
            unit: 'seconds',
            number: ''
          }
        }
      };

      $scope.onErrorTransform = function () {
        delete $scope.model.on_error.options;
        $scope.model.on_error.options = {};

        if ($scope.model.on_error.action === 'abort') {
          $scope.model.on_error.options = $scope.abortOptions.policy;

        } else if ($scope.model.on_error.action === 'retry') {
          $scope.model.on_error.options.retry_every = $scope.retryOptions.retry_every;

          if ($scope.retryOptions.stop_on.value === 'attempts') {
            $scope.model.on_error.options.stop_on = { attempts: $scope.retryOptions.stop_on.attempts.number };
          } else if ($scope.retryOptions.stop_on.value === 'without_response') {
            $scope.model.on_error.options.stop_on = {
              without_response: {
                number: $scope.retryOptions.stop_on.without_response.number,
                unit: $scope.retryOptions.stop_on.without_response.unit
              }
            };
          } else if ($scope.retryOptions.stop_on.value === 'never') {
            $scope.model.on_error.options.stop_on = 'never';
          } else {
            console.log('error');
          }
        } else {
          console.log('neither abort or retry');
        }
      };

      $scope.onErrorImport = function () {
        if ($scope.model.on_error.action === 'abort') {
          $scope.abortOptions.policy = $scope.model.on_error.options;

        } else if ($scope.model.on_error.action === 'retry') {

          $scope.retryOptions.retry_every = $scope.model.on_error.options.retry_every;

          if ($scope.model.on_error.options.stop_on.without_response) {
            $scope.retryOptions.stop_on.without_response = $scope.model.on_error.options.stop_on.without_response;
            $scope.retryOptions.stop_on.value = 'without_response';

          }
          if ($scope.model.on_error.options.stop_on.attempts) {
            $scope.retryOptions.stop_on.value = 'attempts';
            $scope.retryOptions.stop_on.attempts.number = $scope.model.on_error.options.stop_on.attempts;
          }
          if ($scope.model.on_error.options.stop_on === 'never') {
            $scope.retryOptions.stop_on.value = 'never';
          }

        } else {
          console.log('neither abort or retry');
        }
      }

      //----------- Alerts -----------//
      $scope.emailAlert = {
        email: "",
        start: false,
        finish: false,
        fail: false,
        abort: false
      };
      $scope.addAlert = function () {
        $scope.model.alerts.push($scope.emailAlert);
        $scope.emailAlert = {
          email: "",
          start: false,
          finish: false,
          fail: false,
          abort: false
        };
      };
      $scope.removeAlert = function (index) {
        $scope.model.alerts.splice(index, 1);
      };

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
        $scope.constructDate();
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
        var fileStr = createDatasetRecipe();

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


      function createDatasetRecipe () {
        return "#" +
        " # Licensed to the Apache Software Foundation (ASF) under one\n" +
        " # or more contributor license agreements.  See the NOTICE file\n" +
        " # distributed with this work for additional information\n" +
        " # regarding copyright ownership.  The ASF licenses this file\n" +
        " # to you under the Apache License, Version 2.0 (the\n" +
        " # \"License\"); you may not use this file except in compliance\n" +
        " # with the License.  You may obtain a copy of the License at\n" +
        " #" +
        " #     http://www.apache.org/licenses/LICENSE-2.0\n" +
        " #" +
        " # Unless required by applicable law or agreed to in writing, software\n" +
        " # distributed under the License is distributed on an \"AS IS\" BASIS,\n" +
        " # WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n" +
        " # See the License for the specific language governing permissions and\n" +
        " # limitations under the License.\n\n" +
        " #" +
        " ##### NOTE: This is a TEMPLATE file which can be copied and edited\n" +
        " ##### Recipe properties\n" +
        " ##### Unique recipe job name\n" +
        " falcon.recipe.job.name=" + $scope.model.name + "\n\n" +

        " ##### Workflow properties\n\n" +

        " falcon.recipe.workflow.name="+ $scope.model.name +"-wf\n" +
        " # Provide Wf absolute path. This can be HDFS or local FS path. If WF is on local FS it will be copied to HDFS\n" +
        " falcon.recipe.workflow.path=/recipes/hdfs-replication/hdfs-replication-workflow.xml\n" +
        " # Provide Wf lib absolute path. This can be HDFS or local FS path. If libs are on local FS it will be copied to HDFS\n" +
        " #falcon.recipe.workflow.lib.path=/recipes/hdfs-replication/lib\n\n" +

        " ##### Cluster properties\n\n" +

        " # Change the cluster name where replication job should run here\n" +
        " falcon.recipe.cluster.name=backupCluster\n" +
        " # Change the cluster hdfs write end point here. This is mandatory.\n" +
        " falcon.recipe.cluster.hdfs.writeEndPoint=hdfs://localhost:8020\n" +
        " # Change the cluster validity start time here\n" +
        " falcon.recipe.cluster.validity.start=2014-10-01T00:00Z\n" +
        " # Change the src cluster validity end time here\n" +
        " falcon.recipe.cluster.validity.end=2016-12-30T00:00Z\n\n" +


        " ##### Scheduling properties\n\n" +

        " # Change the recipe frequency here. Valid frequency type are minutes, hours, days, months\n" +
        " falcon.recipe.frequency=minutes(60)\n" +

        " ##### Tag properties - An optional list of comma separated tags, Key Value Pairs, separated by comma\n" +
        " ##### Uncomment to add tags\n" +
        " falcon.recipe.tags=owner=landing,pipeline=adtech\n" +
        " ##### Retry policy properties\n" +

        " falcon.recipe.retry.policy=periodic\n" +
        " falcon.recipe.retry.delay=minutes(30)\n" +
        " falcon.recipe.retry.attempts=3\n" +

        " ##### ACL properties - Uncomment and change ACL if authorization is enabled\n\n" +

        " #falcon.recipe.acl.owner=testuser\n" +
        " #falcon.recipe.acl.group=group\n" +
        " #falcon.recipe.acl.permission=0x755\n" +


        " ##### Custom Job properties\n\n" +

        " drSourceDir=/falcon/test/srcCluster/input\n" +
        " drTargetClusterFS=hdfs://localhost:8020\n" +
        " drTargetDir=/falcon/test/targetCluster/input\n" +
        " drTargetCluster=backupCluster\n" +
        " maxMaps=5\n" +
        " mapBandwidth=100\n";
      }


    }
  ]);
}());




