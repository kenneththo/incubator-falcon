(function () {
	"use strict";

	var dashboardModule = angular.module('dashboard-module', ['dataset-model-module']);

	dashboardModule.controller('DashboardCtrl', [ "$scope", "$state", "datasetModel", function($scope, $state, datasetModel) {

    $scope.newDataset = function () {

      datasetModel.name = "";
      datasetModel.tags = [];
      datasetModel.type = "HDFS";
      datasetModel.clusters = {
        source_cluster: { name: "", location: { type: "HDFS", src: "" } },
        target_cluster: { name: "", location: { type: "HDFS", src: "" } }
      };
      datasetModel.start = "";// date string with time and tz
      datasetModel.frequency = { every: "", unit: "hours" };
      datasetModel.repeats = { every: "", unit: "days" };
      datasetModel.allocation = { max_number_slots: "", max_bandwidth: "", measure: "Kb" };
      datasetModel.run_as = "default";
      datasetModel.permission= "*";
      datasetModel.on_error = { action: "abort", options: "back-off" };
      datasetModel.alerts = [];

      $state.go('form.general');

    };
  }]);

}());
