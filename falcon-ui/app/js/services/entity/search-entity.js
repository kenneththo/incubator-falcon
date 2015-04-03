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

  var app = angular.module('app.services.entity', ['app.services']);

  app.factory('EntityFalcon', [
    "Falcon", "$q",
    function (Falcon, $q) {

      var EntityFalcon = {};

      EntityFalcon.searchEntities = function(name, tags, entityType, offset){
        var deffered = $q.defer();
        Falcon.logRequest();
        Falcon.searchEntities(name, tags, entityType, offset).success(function (data) {
          Falcon.logResponse('success', data, false, true);
          data.totalResults = parseInt(data.totalResults);
          if(data.entity === undefined){
            data.entity = [];
          }
          EntityFalcon.data = data;
          deffered.resolve();
        }).error(function (err) {
          Falcon.logResponse('error', err);
          deffered.resolve();
        });
        return deffered.promise;
      };

      return EntityFalcon;

    }]);

}());