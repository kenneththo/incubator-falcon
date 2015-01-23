(function () {
	"use strict";

	var formTimingModule = angular.module('form-timing-module', []);

  formTimingModule.controller('FormTimingCtrl', [ "$scope", function($scope) {
    $scope.foo = {bar:null, baz:null};
    $scope.test = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };
    $scope.test();
  }]);

})();
