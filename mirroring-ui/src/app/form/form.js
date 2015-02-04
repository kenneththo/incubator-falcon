(function () {
	"use strict";

	var formModule = angular.module('form-module', [
    'form-general-module', 'form-timing-module',
    'form-summary-module', 'progress-bar-module',
    'dataset-model-module', 'validation-module',
    'rest-api-module', 'time-zone-module', 'date-filter-module'
  ]);

	formModule.controller('FormCtrl', [
    "$scope", "$state", "$timeout", "datasetModel", "ValidationSvc", "restApi",
    function($scope, $state, $timeout, datasetModel, ValidationSvc, restApi) {

    $timeout(function () { angular.element('body').removeClass('preload'); }, 1000);

    $scope.validation = ValidationSvc;
    $scope.model = datasetModel;
    $scope.clusterList = [];
    $scope.usersList = [];


    restApi.getClusters()
      .success(function (data) {
        $scope.clusterList = data;
      }).error(function (err) {
        console.log(err);
      });
    restApi.getUsers()
      .success(function (data) {
        $scope.usersList = data;
      }).error(function (err) {
        console.log(err);
      });

    $scope.save = function () {
      console.log("bar = " + $scope.foo.bar);
      console.log("baz = " + $scope.foo.baz);
    };


    $scope.isActive = function(route) {
      return $state.current.name === route;
    };

    $scope.goNext = function (formInvalid, stateName) {

      console.log();

/*
      SpinnersFlag.show = true;

      if (!validationService.nameAvailable || formInvalid) {
        validationService.displayValidations.show = true;
        validationService.displayValidations.nameShow = true;
        SpinnersFlag.show = false;
        return;
      }
      validationService.displayValidations.show = false;
      validationService.displayValidations.nameShow = false;
*/
      if (formInvalid) {
        $scope.validation.show = true;
      } else {
        $state.go(stateName);
      }




    };
    $scope.goBack = function (stateName) {
/*      SpinnersFlag.backShow = true;
      validationService.displayValidations.show = false;
      validationService.displayValidations.nameShow = false;*/
      $state.go(stateName);
    };

    $scope.$on('$destroy', function () {
      $timeout(function () { angular.element('body').addClass('preload'); }, 300);
    });

  }]);

})();
