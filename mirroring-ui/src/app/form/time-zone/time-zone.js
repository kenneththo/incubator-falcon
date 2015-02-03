(function () {
	"use strict";

	var timeZoneModule = angular.module('time-zone-module', []);

  timeZoneModule.directive('timeZoneSelect', function () {
    return {
      restrict: 'E',
      replace: false,
      scope: {
        ngModel: '=',
        ngChange: '='
      },
      templateUrl: 'html/time-zone.html'
    };
  });

})();
