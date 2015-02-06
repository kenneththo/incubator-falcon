(function () {
	"use strict";

	var serverMessagesModule = angular.module('server-messages-module', ['rest-api-module', 'dataset-model-module']);

  serverMessagesModule.directive('serverMessages', function() {
    return {
      replace: true,
      restrict: "EA",
      templateUrl: 'html/server-messages.html',
      controller: 'ServerMessagesCtrl'
    };
  });
  serverMessagesModule.controller('ServerMessagesCtrl', [
    "$scope", "serverMessagesAPI", "$state", "datasetModel",
    function ($scope, serverMessagesAPI, $state, datasetModel) {

      $scope.serverMessages = serverMessagesAPI;

      $scope.restore = function (message, index) {
        datasetModel.model = message.model;
        serverMessagesAPI.removeResponse(index);
        $state.go(message.state);
      };

    }
  ]);

  serverMessagesModule.factory('serverMessagesAPI', [function() {

    var serverMessages = {};

    serverMessages.messages = {
      pending: 0,
      queue: []
    };
    serverMessages.logRequest = function () {
      serverMessages.messages.pending = serverMessages.messages.pending + 1;
    };
    serverMessages.logResponse = function (response) {
      serverMessages.messages.pending = serverMessages.messages.pending - 1;
      serverMessages.messages.queue.push(response);
    };
    serverMessages.removeResponse = function (index) {
      serverMessages.messages.queue.splice(index, 1);
    };

    return serverMessages;

  }]);


}());
