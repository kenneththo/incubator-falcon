(function () {
	"use strict";

	var dashboardModule = angular.module('dashboard-module', []);

	dashboardModule.controller('DashboardCtrl', [ "$scope", "$state", function($scope, $state) {
    $scope.foo = {bar:null, baz:null};
    $scope.newDataset = function () {
      $state.go('form.general');
    };
  }]);

})();
