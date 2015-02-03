(function () {
	"use strict";

	var formTimingModule = angular.module('form-timing-module', []);

  formTimingModule.controller('FormTimingCtrl', [ "$scope", function($scope) {

    $scope.dateFormat = 'MM/dd/yyyy';
    $scope.date = {
      start: undefined,
      time: new Date(2015, 1, 1, 0, 0, 0, 0),
      tz: "+00:00"
    };
    $scope.constructDate = function () {
      if ($scope.date.start && $scope.date.time && $scope.date.tz) {

        $scope.$parent.model.start = new Date(Date.UTC(
          $scope.date.start.getUTCFullYear(),
          $scope.date.start.getUTCMonth(),
          $scope.date.start.getUTCDate(),
          $scope.date.time.getHours(),
          $scope.date.time.getMinutes(),
          0, 0)).toUTCString() + $scope.date.tz;

      }
    };

    $scope.openDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

  }]);

})();
