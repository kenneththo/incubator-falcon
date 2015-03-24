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

	var entitiesListModule = angular.module('app.directives.dependencies-graph', ['app.services' ]);

  entitiesListModule.controller('DependenciesGraphCtrl', ['$scope', 'Falcon', 'X2jsService', '$window', 'EncodeService',
                                      function($scope, Falcon, X2jsService, $window, encodeService) {



  }]);

  entitiesListModule.directive('dependenciesGraph', ["$timeout", 'Falcon', '$filter', function($timeout, Falcon, $filter) {
    return {
      scope: {
        input: "=",
        schedule: "=",
        resume:"=",
        rerun:"=",
        suspend: "=",
        stop: "=",
        type: "=",
        name: "=",
        instanceDetails:"=",
        refresh: "=",
        pages: "=",
        nextPages: "=",
        prevPages: "=",
        goPage: "=",
        changePagesSet: "="
      },
      controller: 'DependenciesGraphCtrl',
      restrict: "EA",
      templateUrl: 'html/directives/dependenciesGraphDv.html',
      link: function (scope) {

      }
    };
  }]);

})();