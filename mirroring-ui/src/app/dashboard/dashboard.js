(function () {
	"use strict";

	var dashboardModule = angular.module('dashboard-module', []);

	dashboardModule.controller('DashboardCtrl', [ "$scope", function($scope) {
    $scope.foo = {bar:null, baz:null};
    $scope.test = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };
    $scope.test();
  }]);

})();
