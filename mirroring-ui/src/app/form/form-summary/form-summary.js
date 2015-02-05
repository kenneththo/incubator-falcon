(function () {
	"use strict";

	var formSummaryModule = angular.module('form-summary-module', []);

  formSummaryModule.controller('FormSummaryCtrl', [ "$scope", "$timeout", function($scope, $timeout) {
    $scope.jsonPreview = false;
    $timeout(function () {
      $scope.prettyJson = angular.toJson($scope.model, true);
    },100);

  }]);


})();
