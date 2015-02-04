(function () {
	"use strict";

	var formTimingModule = angular.module('form-timing-module', []);

  formTimingModule.controller('FormTimingCtrl', [ "$scope", "$filter", function($scope, $filter) {

    //----------------- DATE INPUT -------------------//
    $scope.dateFormat = 'MM/dd/yyyy';
    $scope.date = {
      start: undefined/*new Date("02/02/2015")*/,
      time: new Date(2015, 1, 1, 0, 0, 0, 0),
      tz: "+00:00"
    };



    $scope.digestDate = function () {

      console.log($scope.date.start);


      //var filtered = $filter('date')(digestedDate, $scope.dateFormat);

      console.log($scope.date);

      var rawDateString = $scope.model.start,
          timezone = rawDateString.slice(-6),
          dateString = rawDateString.slice(0, -6),
          dateUTC = Date.parse(dateString),
          rawDate = new Date(dateUTC);



      console.log(dateString);
      console.log(rawDate);
      console.log(timezone);

      $scope.date = {
        start: new Date(
          rawDate.getUTCFullYear(),
          rawDate.getUTCMonth(),
          rawDate.getUTCDate(), 0, 0, 0, 0
        ),
        time: new Date(2015, 1, 1, rawDate.getUTCHours(), rawDate.getUTCMinutes(), 0, 0),
        tz: timezone
      };
      console.log($scope.date);
    };
    $scope.constructDate = function () {
      if ($scope.date.start && $scope.date.time && $scope.date.tz) {

        $scope.model.start = new Date(Date.UTC(
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

    //----------- ON ERROR COMPOUND INPUT -----------//
    $scope.abortOptions = {
      policy: 'back-off'
    };
    $scope.retryOptions = {
      retry_every: {
        number: '',
        unit: 'seconds'
      },
      stop_on: {
        value: 'attempts',

        attempts: {
          number: ''
        },
        without_response: {
          unit: 'seconds',
          number: ''
        }
      }
    };

    $scope.onErrorTransform = function () {
      delete $scope.model.on_error.options;
      $scope.model.on_error.options = {};

      if ($scope.model.on_error.action === 'abort') {
        $scope.model.on_error.options = $scope.abortOptions.policy;

      } else if ($scope.model.on_error.action === 'retry') {
        $scope.model.on_error.options.retry_every = $scope.retryOptions.retry_every;

        if ($scope.retryOptions.stop_on.value === 'attempts') {
          $scope.model.on_error.options.stop_on = { attempts: $scope.retryOptions.stop_on.attempts.number };
        } else if ($scope.retryOptions.stop_on.value === 'without_response') {
          $scope.model.on_error.options.stop_on = {
            without_response: {
              number: $scope.retryOptions.stop_on.without_response.number,
              unit: $scope.retryOptions.stop_on.without_response.unit
            }
          };
        } else if ($scope.retryOptions.stop_on.value === 'never') {
          $scope.model.on_error.options.stop_on = 'never';
        } else {
          console.log('error');
        }
      } else {
        console.log('neither abort or retry');
      }
    };

    //----------- Alerts -----------//
    $scope.emailAlert = {
      email: "",
      start: false,
      finish: false,
      fail: false,
      abort: false
    };
    $scope.addAlert = function () {
      $scope.model.alerts.push($scope.emailAlert);
      $scope.emailAlert = {
        email: "",
        start: false,
        finish: false,
        fail: false,
        abort: false
      };
    };
    $scope.removeAlert = function (index) {
      $scope.model.alerts.splice(index, 1);
    };

  }]);

})();
