(function () {
	"use strict";

	var dateFilterModule = angular.module('date-filter-module', []);

  dateFilterModule.directive('simpleDate', ['$filter', function($filter) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModelController) {
        ngModelController.$parsers.push(function (data) {
          //convert data from view format to model format
          return data;
        });
        ngModelController.$formatters.push(function (date) {
          //convert data from model format to view format
          if (date !== "") {
            date = $filter('date')(date, 'MM/dd/yyyy');
          }
          return date;
        });
      }
    };
  }]);

}());
