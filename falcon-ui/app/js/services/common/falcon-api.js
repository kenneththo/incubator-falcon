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

  var falconModule = angular.module('app.services.falcon', ['app.services.x2js', 'ngCookies']);

  falconModule.factory('Falcon', ["$http", "X2jsService", "$location", '$rootScope', '$cookieStore', function ($http, X2jsService, $location, $rootScope, $cookieStore) {

    var Falcon = {},
        NUMBER_OF_ENTITIES = 10,
        NUMBER_OF_INSTANCES = 11; // 10 + 1 for next page

    function buildURI(uri){
      if($rootScope.ambariView()){
        uri = uri.substring(2);
    	uri = $rootScope.serviceURI + uri;
      }else{
        uri = add_user(uri);
      }
      return uri;
    }

    function add_user(uri) {
      var userToken = $cookieStore.get('userToken');
      var paramSeparator = (uri.indexOf('?') !== -1) ? '&' : '?';
      uri = uri + paramSeparator + 'user.name=' + userToken.user;
      return uri;
    }

    //-------------Server RESPONSE----------------------//
    Falcon.responses = {
      display:true,
      queue:[],
      count: {pending: 0, success:0, error:0},
      multiRequest: {cluster:0, feed:0, process:0},
      listLoaded: {cluster:false, feed:false, process:false}
    };

    Falcon.logRequest = function () {
      Falcon.responses.count.pending = Falcon.responses.count.pending + 1;

    };
    Falcon.logResponse = function (type, messageObject, entityType, hide) {
      if(type === 'success') {
        if(!hide) {
          var message = { success: true, status: messageObject.status, message: messageObject.message, requestId: messageObject.requestId};
          Falcon.responses.queue.push(message);
          Falcon.responses.count.success = Falcon.responses.count.success +1;
        }
        Falcon.responses.count.pending = Falcon.responses.count.pending -1;
      }
      if(type === 'cancel') {
        if(!hide) {
          var message = {
            success: 'cancel',
            status: messageObject.state,
            message: messageObject.message,
            model: messageObject.model
          };
          Falcon.responses.queue.push(message);
          return;
          //Falcon.responses.count.success = Falcon.responses.count.success +1;
        }
        //Falcon.responses.count.pending = Falcon.responses.count.pending -1;
      }
      if(type === 'error') {

        if(messageObject.status !== undefined){
          var message = { success: false, status: messageObject.status, message: messageObject.message, requestId: messageObject.requestId};
        }else{
          if(messageObject.slice(0,6) !== "Cannot") {
          var errorMessage = X2jsService.xml_str2json(messageObject);
          var message = { success: false, status: errorMessage.result.status, message: errorMessage.result.message, requestId: errorMessage.result.requestId};
          }
          else {
            var message = { success: false, status: "No connection", message: messageObject, requestId: "no ID"};
          }
        }

        Falcon.responses.queue.push(message);
        Falcon.responses.count.error = Falcon.responses.count.error +1;
        Falcon.responses.count.pending = Falcon.responses.count.pending -1;
      }
      if(type === 'warning') {
        if(!hide) {
          var message = {
            success: type,
            status: messageObject.status,
            message: messageObject.message,
            model: ''
          };
          Falcon.responses.queue.push(message);
          return;;
        }
      }
      if(entityType !== false) {
        entityType = entityType.toLowerCase();
        Falcon.responses.multiRequest[entityType] = Falcon.responses.multiRequest[entityType] - 1;
      }

    };
    Falcon.removeMessage = function (index) {
      if(Falcon.responses.queue[index].success) { Falcon.responses.count.success = Falcon.responses.count.success -1; }
      else { Falcon.responses.count.error = Falcon.responses.count.error -1; }
      Falcon.responses.queue.splice(index, 1);
    };
    Falcon.errorMessage = function (message) {
      var err = {};
      err.status = "ERROR";
      err.message = message;
      err.requestId = "";
      Falcon.logResponse('error', err, false, true);
    };
    Falcon.warningMessage = function (message) {
      var err = {};
      err.status = "WARNING";
      err.message = message;
      Falcon.logResponse('warning', err, false, false);
    };

    //-------------METHODS-----------------------------//
    Falcon.getServerVersion = function () {
      return $http.get(buildURI('../api/admin/version'));
    };
    Falcon.getServerStack = function () {
      return $http.get(buildURI('../api/admin/stack'));
    };
    Falcon.postValidateEntity = function (xml, type) {
      return $http.post(buildURI('../api/entities/validate/' + type), xml, { headers: {'Content-Type': 'text/plain'} });
    };
    Falcon.postSubmitEntity = function (xml, type) {
      return $http.post(buildURI('../api/entities/submit/' + type), xml, { headers: {'Content-Type': 'text/plain'} });
    };
    Falcon.postUpdateEntity = function (xml, type, name) {
      return $http.post(buildURI('../api/entities/update/' + type + '/' + name), xml, { headers: {'Content-Type': 'text/plain'} });
    };

    Falcon.postScheduleEntity = function (type, name) {
      return $http.post(buildURI('../api/entities/schedule/' + type + '/' + name));
    };
    Falcon.postSuspendEntity = function (type, name) {
      return $http.post(buildURI('../api/entities/suspend/' + type + '/' + name));
    };
    Falcon.postResumeEntity = function (type, name) {
      return $http.post(buildURI('../api/entities/resume/' + type + '/' + name));
    };

    Falcon.deleteEntity = function (type, name) {
      return $http.delete(buildURI('../api/entities/delete/' + type + '/' + name));
    };

    Falcon.getEntities = function (type) {
    return $http.get(buildURI('../api/entities/list/' + type + '?fields=status,tags&numResults=' + NUMBER_OF_ENTITIES));
    };

    Falcon.getEntityDefinition = function (type, name) {
      return $http.get(buildURI('../api/entities/definition/' + type + '/' + name), { headers: {'Accept': 'text/plain'} });
    };

    Falcon.searchEntities = function (name, tags, entityType, offset) {
      var searchUrl = "../api/entities/search/";
      var paramSeparator;
      if(name !== undefined && name !== ""){
        paramSeparator = "?";
        if(name === "*"){
          searchUrl += paramSeparator+"name=*";
        }else{
          searchUrl += paramSeparator+"name=*"+name+"*";
        }
      }
      if(tags !== undefined && tags !== ""){
        paramSeparator = (searchUrl.indexOf('?') !== -1) ? '&' : '?';
        searchUrl += paramSeparator+"tags="+tags;
      }
      if(entityType !== undefined && entityType !== ""){
        paramSeparator = (searchUrl.indexOf('?') !== -1) ? '&' : '?';
        searchUrl += paramSeparator+"filterBy=type:"+entityType;
      }
      searchUrl += '&offset=' + offset + '&numResults=' + NUMBER_OF_ENTITIES;
      return $http.get(buildURI(searchUrl));
    };

    Falcon.getInstances = function (type, name, offset) {
      return $http.get(buildURI('../api/instance/list/' + type + '/' + name + '?colo=*&orderBy=startTime&offset=' + offset + '&numResults=' + NUMBER_OF_INSTANCES));
    };

    Falcon.postResumeInstance = function (entityType, entityName, start, end) {
      return $http.post(buildURI('../api/instance/resume/' + entityType + '/' + entityName + '?colo=*&start=' + start + '&end=' + end));
    };

    Falcon.postSuspendInstance = function (entityType, entityName, start, end) {
      return $http.post(buildURI('../api/instance/suspend/' + entityType + '/' + entityName + '?colo=*&start=' + start + '&end=' + end));
    };

    Falcon.postKillInstance = function (entityType, entityName, start, end) {
      return $http.post(buildURI('../api/instance/kill/' + entityType + '/' + entityName + '?colo=*&start=' + start + '&end=' + end));
    };

    Falcon.postReRunInstance = function (entityType, entityName, start, end) {
      return $http.post(buildURI('../api/instance/rerun/' + entityType + '/' + entityName + '?colo=*&start=' + start + '&end=' + end));
    };

    //----------------------------------------------//
    Falcon.getInstancesSummary = function (type, mode, from, to) {
      return $http.get(buildURI('../api/instance/summary/' + type + '/'+ mode + '?start=' + from + '&end=' + to));
    };
    Falcon.getTopEntities = function (entityType, from, to) {
      return $http.get(buildURI('../api/entities/top/' + entityType + '?start=' + from + '&end=' + to));
    };
    //----------------------------------------------//
    Falcon.postSubmitRecipe = function (recipe) {
      return $http.post(buildURI('../api/entities/prepareAndSubmitRecipe'), recipe, { headers: {'Content-Type': 'text/plain'} });
    };

    return Falcon;

  }]);

})();
