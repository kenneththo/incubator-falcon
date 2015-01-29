(function () {
	"use strict";

	var formGeneralModule = angular.module('form-general-module', []);

  formGeneralModule.controller('FormGeneralCtrl', [ "$scope", function($scope) {
    $scope.newTag = {value:"", key:""};
    $scope.addTag = function () {
      $scope.model.tags.push($scope.newTag);
      $scope.newTag = {value:"", key:""};
      console.log($scope.model.tags);
      console.log($scope.$parent.model.tags);
    };
  }]);

})();
