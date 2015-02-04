(function () {
	"use strict";

	var modelModule = angular.module('dataset-model-module', []);

  modelModule.factory('datasetModel', ["$http", function($http) {

    var dataset = {
      name: "Test",
      tags: [{"key":'ddd', "value": "ssd"}],
      type: "HDFS",
      clusters: {
        source_cluster: {
          name: "cluster1",
          location: {
            type: "HDFS",
            src: "TEST"
          }
        },
        target_cluster: {
          name: "cluster1",
          location: {
            type: "HDFS",
            src: "TEST"
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
      alerts: [
        {
          email: "s@h.com",
          start: false,
          finish: false,
          fail: false,
          abort: false
        }
      ]

    };

    return dataset;

  }]);

}());
