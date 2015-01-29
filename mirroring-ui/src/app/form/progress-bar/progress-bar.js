(function () {
	"use strict";

	var progressBarModule = angular.module('progress-bar-module', []);

  progressBarModule.directive('progressBar', function() {
    return {
      replace: true,
      restrict: "E",
      templateUrl: 'html/progress-bar.html'
    };
  });

}());
