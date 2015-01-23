(function () {
	"use strict";

	var formGeneralModule = angular.module('form-general-module', []);

  formGeneralModule.controller('FormGeneralCtrl', [ "$scope", function($scope) {
    $scope.foo = {bar:null, baz:null};
    $scope.test = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };
    $scope.test();
  }]);

})();
