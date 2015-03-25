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

  datasetModule.controller('DatasetCtrl', [
    "$scope", "$interval", "Falcon", "EntityModel", "$state", "X2jsService",
    "ValidationService", "SpinnersFlag", "$timeout", "$rootScope", "clustersList",
    function ($scope, $interval, Falcon, EntityModel, $state, X2jsService,
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
        $scope.completeModel = EntityModel.datasetModel[type];
      };

      $scope.model = EntityModel.datasetModel.HDFS.process;
      $scope.UIModel = EntityModel.datasetModel.UIModel;
      $scope.completeModel = EntityModel.datasetModel.HDFS;
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
        $scope.UIModel.alerts.alertsArray.push($scope.UIModel.alerts.alert.email);
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

        if ($scope.UIModel.validity.start && $scope.UIModel.validity.end) {
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
        }

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
        getClustersDefinitions();
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

      $scope.sourceClusterModel = {};
      $scope.targetClusterModel = {};
      function getClustersDefinitions () {
        var promisesDone = 0;
        if ($scope.UIModel.source.location !== "HDFS") { promisesDone = 1; }
        if ($scope.UIModel.target.location !== "HDFS") { promisesDone = 1; }

        if ($scope.UIModel.source.location === "HDFS") {
          Falcon.getEntityDefinition("cluster", $scope.UIModel.source.cluster)
            .success(function (data) {
              var clusterModel = X2jsService.xml_str2json(data);
              $scope.sourceClusterModel = clusterModel;
              promisesDone = promisesDone + 1;
              if (promisesDone === 2) { createXML(); }

            })
            .error(function (err) {
              Falcon.logResponse('error', err, false, true);
            });
        }
        if ($scope.UIModel.target.location === "HDFS") {
          Falcon.getEntityDefinition("cluster", $scope.UIModel.target.cluster)
            .success(function (data) {
              var clusterModel = X2jsService.xml_str2json(data);
              $scope.targetClusterModel = clusterModel;
              promisesDone = promisesDone + 1;
              if (promisesDone === 2) { createXML(); }
            })
            .error(function (err) {
              Falcon.logResponse('error', err, false, true);
            });
        }

      }

      function findInterface (array, interfaceString) {
        var inter = "";
        array.forEach(function (item) {
          if (item._type === interfaceString) {
            inter = item._endpoint;
          }
        });
        return inter;
      }
      function replacePortInInterface (string) {
        if (string) {
          var splitted = string.split(':');
          return splitted[0] + ':' + splitted[1] + ':10000';
        }
      }


      function createXML () {
        //-----------NAME ---------------//
        $scope.model._name = $scope.UIModel.name;
        //------------RETRY------------------//
        $scope.model.retry._policy = $scope.UIModel.retry.policy;
        $scope.model.retry._delay = $scope.UIModel.retry.delay.unit + '(' + $scope.UIModel.retry.delay.number + ')';
        $scope.model.retry._attempts = $scope.UIModel.retry.attempts;
        //------------ACL---------------------//
        $scope.model.ACL._owner = $scope.UIModel.acl.owner;
        $scope.model.ACL._group = $scope.UIModel.acl.group;
        $scope.model.ACL._permission = $scope.UIModel.acl.permissions;
        //-----------Frequency ---------------//
        $scope.model.frequency = $scope.UIModel.frequency.unit + '(' + $scope.UIModel.frequency.number + ')';
        //-----------Cluster validity ---------------//
        $scope.model.clusters.cluster[0].validity._start = $scope.UIModel.validity.startISO;
        $scope.model.clusters.cluster[0].validity._end = $scope.UIModel.validity.endISO;
        //----------HDFS-----------------------------------------------------------------------------//
        if ($scope.UIModel.formType === 'HDFS') {
          //-----------TAGS ---------------//
          $scope.model.tags = '_falcon_mirroring_type=HDFS,' + $scope.UIModel.tags.tagsString;
          //-----------Cluster name ---------------//
          if ($scope.UIModel.runOn === "source") {
            $scope.model.clusters.cluster[0]._name = $scope.UIModel.source.cluster;
          } else {
            $scope.model.clusters.cluster[0]._name = $scope.UIModel.target.cluster;
          }
          //-----------HDFS Properties ---------------//
          $scope.model.properties.property.forEach(function (item, index) {
            if (item._name === 'distcpMaxMaps') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hdfs.maxMaps;
            }
            if (item._name === 'distcpMapBandwidth') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hdfs.maxBandwidth;
            }
            if (item._name === 'drSourceDir') {
              $scope.model.properties.property[index]._value = $scope.UIModel.source.path;
            }
            if (item._name === 'drTargetDir') {
              $scope.model.properties.property[index]._value = $scope.UIModel.target.path;
            }

            if (item._name === 'drSourceClusterFS') {
              //console.log($scope.UIModel.source.location === 'HDFS');
              if($scope.UIModel.source.location === 'HDFS') {
                $scope.model.properties.property[index]._value = findInterface($scope.sourceClusterModel.cluster.interfaces.interface, 'write');
              } else {
                $scope.model.properties.property[index]._value = $scope.UIModel.source.url;
              }

            }
            if (item._name === 'drTargetClusterFS') {
              if($scope.UIModel.target.location === 'HDFS') {
                $scope.model.properties.property[index]._value = findInterface($scope.targetClusterModel.cluster.interfaces.interface, 'write');
              } else {
                $scope.model.properties.property[index]._value = $scope.UIModel.target.url;
              }
            }
            if (item._name === 'drNotifyEmail') {
              $scope.model.properties.property[index]._value = $scope.UIModel.alerts.alertsArray.join();
            }
          });
          //------------WORKFLOW---------------//
          $scope.model.workflow._name = $scope.UIModel.name + '-WF';

        //----------HIVE-----------------------------------------------------------------------------//
        } else if ($scope.UIModel.formType === 'HIVE') {
          //-----------TAGS ---------------//
          $scope.model.tags = '_falcon_mirroring_type=HIVE,' + $scope.UIModel.tags.tagsString;
          //-----------Cluster name --------------------------------//
          $scope.model.clusters.cluster[0]._name = $scope.UIModel.source.cluster;

          //-----------HIVE Properties ---------------//
          $scope.model.properties.property.forEach(function (item, index) {
            console.log(item._name + '------index-' + index);
            if (item._name === 'distcpMaxMaps') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hive.maxMapsDistcp;
            }
            if (item._name === 'distcpMapBandwidth') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hive.maxBandwidth;
            }
            if (item._name === 'sourceCluster') {
              $scope.model.properties.property[index]._value = $scope.UIModel.source.cluster;
            }
            if (item._name === 'targetCluster') {
              $scope.model.properties.property[index]._value = $scope.UIModel.target.cluster;
            }
            if (item._name === 'sourceHiveServer2Uri') {
              $scope.model.properties.property[index]._value = replacePortInInterface(findInterface($scope.sourceClusterModel.cluster.interfaces.interface, 'registry'));
            }
            if (item._name === 'targetHiveServer2Uri') {
              $scope.model.properties.property[index]._value = replacePortInInterface(findInterface($scope.targetClusterModel.cluster.interfaces.interface, 'registry'));
            }
            if (item._name === 'sourceStagingPath') {
              $scope.model.properties.property[index]._value = $scope.UIModel.hiveOptions.source.stagingPath;
            }
            if (item._name === 'targetStagingPath') {
              if ($scope.UIModel.source.hiveDatabaseType === "databases") {
                $scope.model.properties.property[index]._value = "*";
              } else {
                $scope.model.properties.property[index]._value = $scope.UIModel.hiveOptions.target.stagingPath;
              }
            }
            if (item._name === 'sourceNN') {
              $scope.model.properties.property[index]._value = findInterface($scope.sourceClusterModel.cluster.interfaces.interface, 'write');
            }
            if (item._name === 'targetNN') {
              $scope.model.properties.property[index]._value = findInterface($scope.targetClusterModel.cluster.interfaces.interface, 'write');
            }
            if (item._name === 'sourceMetastoreUri') {
              $scope.model.properties.property[index]._value = findInterface($scope.sourceClusterModel.cluster.interfaces.interface, 'registry');
            }
            if (item._name === 'targetMetastoreUri') {
              $scope.model.properties.property[index]._value = findInterface($scope.targetClusterModel.cluster.interfaces.interface, 'registry');
            }
            if (item._name === 'sourceTable') {
              if ($scope.UIModel.source.hiveDatabaseType === "databases") { $scope.model.properties.property[index]._value = "*"; }
              else { $scope.model.properties.property[index]._value = $scope.UIModel.source.hiveTables; }
            }
            if (item._name === 'sourceDatabase') {
              if ($scope.UIModel.source.hiveDatabaseType === "databases") {
                $scope.model.properties.property[index]._value = $scope.UIModel.source.hiveDatabases; }
              else { $scope.model.properties.property[index]._value = $scope.UIModel.source.hiveDatabase; }
            }
            if (item._name === 'maxEvents') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hive.maxMapsEvents;
            }
            if (item._name === 'replicationMaxMaps') {
              $scope.model.properties.property[index]._value = $scope.UIModel.allocation.hive.maxMapsMirror;
            }
            if (item._name === 'clusterForJobRun') {
              if ($scope.UIModel.runOn === "source") {
                $scope.model.properties.property[index]._value = $scope.UIModel.source.cluster;
              } else {
                $scope.model.properties.property[index]._value = $scope.UIModel.target.cluster;
              }
            }
            if (item._name === 'clusterForJobRunWriteEP') {
              if ($scope.UIModel.runOn === "source") {
                $scope.model.properties.property[index]._value = findInterface($scope.sourceClusterModel.cluster.interfaces.interface, 'write');
              } else {
                $scope.model.properties.property[index]._value = findInterface($scope.targetClusterModel.cluster.interfaces.interface, 'write');
              }
            }
            if (item._name === 'drJobName') {
              $scope.model.properties.property[index]._value = $scope.UIModel.name;
            }
            if (item._name === 'drNotifyEmail') {
              $scope.model.properties.property[index]._value = $scope.UIModel.alerts.alertsArray.join();
            }

          });

        } else {
          console.log('error in form type');
        }

        $scope.xmlString = X2jsService.json2xml_str($scope.completeModel);

      }

      $scope.save = function () {
        SpinnersFlag.show = true;

        /*Falcon.postSubmitRecipe($scope.xmlString)
          .success(function (data) {
            Falcon.logResponse('success', data, false);
          })
          .error(function (error) {
            console.log(error);
          });*/

        Falcon.postSubmitEntity($scope.xmlString, 'process')
          .success(function (response) {
            $scope.skipUndo = true;
            Falcon.logResponse('success', response, false);
            $state.go('main');
          })
          .error(function (err) {
            Falcon.logResponse('error', err, false);
            SpinnersFlag.show = false;
            angular.element('body, html').animate({scrollTop: 0}, 300);
          });


      };




    }
  ]);
}());




