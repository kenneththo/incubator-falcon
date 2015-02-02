(function () {
	"use strict";

	var modelModule = angular.module('dataset-model-module', []);

  modelModule.factory('datasetModel', ["$http", function($http) {

    var dataset = {
      name: "",
      tags: [{"key":'ddd', "value": "ssd"}],
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
      start: "",// date with time and tz
      frequency: "",
      repeats: "",
      allocation: {
        max_snapshots: "",
        max_number_slots: "",
        max_bandwidth: ""
      },
      run_as: "",
      permission: "",
      on_error: {
        action: "abort",
        options: {}
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
