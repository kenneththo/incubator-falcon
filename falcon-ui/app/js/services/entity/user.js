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

  var app = angular.module('app.services.user', ['app.services']);

  app.factory('UserFalcon', [
    "Falcon", "$q",
    function (Falcon, $q) {

      var UserFalcon = {};

      UserFalcon.getUsers = function(offset){
        var deffered = $q.defer();
        Falcon.logRequest();
        Falcon.getUsers(offset).success(function (data) {
          Falcon.logResponse('success', data, false, true);
          if(data.users === undefined){
            data.users = [];
          }
          UserFalcon.users = data.users;
          deffered.resolve();
        }).error(function (err) {
          Falcon.logResponse('error', err);
          deffered.resolve();
        });
        return deffered.promise;
      };

      UserFalcon.searchUser = function(username){
        var deffered = $q.defer();
        Falcon.logRequest();
        Falcon.searchUser(username).success(function (data) {
          Falcon.logResponse('success', data, false, true);
          if(data.users === undefined){
            data.users = [];
          }
          UserFalcon.users = data.users;
          deffered.resolve();
        }).error(function (err) {
          Falcon.logResponse('error', err);
          deffered.resolve();
        });
        return deffered.promise;
      };

      UserFalcon.saveUser = function(user){
        var deffered = $q.defer();
        Falcon.logRequest();

        Falcon.saveUser(user)
            .success(function (message) {
              Falcon.logResponse('success', message, "user");
              deffered.resolve();
            })
            .error(function (err) {
              Falcon.logResponse('error', err, "user");
              deffered.resolve();

            });
        return deffered.promise;
      };

      UserFalcon.deleteUser = function(user){
        var deffered = $q.defer();
        Falcon.logRequest();

        Falcon.deleteUser(user)
            .success(function (message) {
              Falcon.logResponse('success', message, "user");
              deffered.resolve();
            })
            .error(function (err) {
              Falcon.logResponse('error', err, "user");
              deffered.resolve();

            });
        return deffered.promise;
      };

      return UserFalcon;

    }]);

}());