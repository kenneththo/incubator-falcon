(function () {
	"use strict";

	var modelModule = angular.module('dataset-model-module', []);

  modelModule.factory('datasetModel', [function() {

    var dataset = {

      name: "",
      tags: [],
      type: "HDFS",
      clusters: {
        source_cluster: {
          name: "",
          location: {
            type: "HDFS",
            src: ""
          }
        },
        target_cluster: {
          name: "",
          location: {
            type: "HDFS",
            src: ""
          }
        }
      },
      start: "",// date string with time and tz
      frequency: {
        every: "",
        unit: "hours"
      },
      repeats: {
        every: "",
        unit: "days"
      },
      allocation: {
        max_snapshots: "",
        max_number_slots: "",
        max_bandwidth: "",
        measure: "Kb"
      },
      run_as: "default",
      permission: "*",
      on_error: {
        action: "abort",
        options: "back-off"
      },
      alerts: []

    };

    return dataset;

  }]);

}());
