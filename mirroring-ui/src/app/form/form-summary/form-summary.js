(function () {
	"use strict";

	var formSummaryModule = angular.module('form-summary-module', []);

  formSummaryModule.controller('FormSummaryCtrl', [ "$scope", function($scope) {
    $scope.foo = {bar:null, baz:null};
    $scope.test = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };
    $scope.test();
  }]);


})();
