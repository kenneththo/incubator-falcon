(function () {
	"use strict";

	var formModule = angular.module('form-module', ['form-general-module', 'form-timing-module', 'form-summary-module']);

	formModule.controller('FormCtrl', [ "$scope", function($scope) {
    $scope.foo = {bar:null, baz:null};
    $scope.test = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };
    $scope.test();
  }]);

})();
