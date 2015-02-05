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
      restApi.postDataset(angular.toJson($scope.model))
        .success(function (data) {
          console.log('success + ');
          console.log(data);
        }).error(function (err) {
          console.log(err);
        });
    };


    $scope.isActive = function(route) {
      return $state.current.name === route;
    };

    $scope.goNext = function (formInvalid, stateName) {

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
        angular.element('body, html').animate({scrollTop: 0}, 500);
      } else {
        $scope.validation.show = false;
        $state.go(stateName);
        angular.element('body, html').animate({scrollTop: 0}, 500);
      }





    };
    $scope.goBack = function (stateName) {
/*      SpinnersFlag.backShow = true;
      validationService.displayValidations.show = false;
      validationService.displayValidations.nameShow = false;*/
      $scope.validation.show = false;
      $state.go(stateName);
      angular.element('body, html').animate({scrollTop: 0}, 500);
    };

    $scope.$on('$destroy', function () {
      $timeout(function () { angular.element('body').addClass('preload'); }, 300);
    });

  }]);

})();
