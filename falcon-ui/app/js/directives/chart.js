(function () {
  "use strict";

  var d3Module = angular.module('chart-module', ['app.services.falcon']);

  //  <d3-bar-chart class="chart" input="my.data" w="700" h="400" t="30" dx="[0,50]" dy="[24,0]" details="details"></d3-bar-chart>
  d3Module.directive('chart', function() {
    return {
      scope: {
        input: "=",
        w: "@",
        h: "@",
        t: "@",
        mode: "=",
        details:"="
      },
      restrict: "EA",
      link: function (scope, element) {

        scope.$watch(function () {
          return scope.input;
        }, function () {
          prepareData();
        });

        scope.yDomain = 0;

        function prepareData () {

          if (scope.mode === 'daily') { scope.xDomain = 14; } else { scope.xDomain = 24; }

          scope.input.forEach(function (item) {

            if (item.numFailedInstances > scope.yDomain) {
              scope.yDomain = item.numFailedInstances;
            }
            if (item.numSuccessfullInstances > scope.yDomain) {
              scope.yDomain = item.numSuccessfullInstances;
            }

          });

          d3.selectAll('svg').remove();

          drawChart();

        }


        function drawChart() {

          var x = d3.scale.linear().domain([0,scope.xDomain]).range( [0, (scope.w - (scope.t * 2) ) ]),
              y = d3.scale.linear().domain([0, scope.yDomain]).range( [0, (scope.h - (scope.t * 2) ) ]),

              xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(scope.xDomain),

              yAxis = d3.svg.axis()
                .scale(y),

              canvas = d3.select(element[0])
                .append("svg")
                .attr("width", scope.w)
                .attr("height", scope.h)
                .style("border", "1px solid black");

          canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + scope.t + "," + (( scope.h - scope.t ) + 0.5) + ")")
            .call(xAxis);

          canvas.selectAll("circle.success")
              .data(scope.input).enter()
            .append("circle")
            .call(yAxis)
            /*.attr("cx", 25)
            .attr("cy", 25)*/
            .attr("r", 5)
            .attr("fill", "green")
            .attr("cx", function(d, i) { return x(i); })
            .attr("cy", function(d) { return (y(scope.yDomain - d.numSuccessfullInstances)); })
            .attr("transform", "translate(" + scope.t + "," + scope.t + ")");

          canvas.selectAll("circle.error")
            .data(scope.input).enter()
            .append("circle")
            .call(yAxis)
            .attr("cx", 25)
            .attr("cy", 25)
            .attr("r", 5)
            .attr("fill", "red")
            .attr("cx", function(d, i) { return x(i); })
            .attr("cy", function(d) { return (y(scope.yDomain - d.numFailedInstances)); })
            .attr("transform", "translate(" + scope.t + "," + scope.t + ")");

            /*.attr("x", function(d, i) { return x(i); })
            .attr("y", function(d) { return (y(parseInt(d.numSuccessfullInstances, 10)) - y(scope.dy[0]) ); })
            .attr("height", function(d) { return (scope.h - (scope.t * 2)) - y(parseInt(d.hours, 10)); })
            .attr("width", function() { return x(0.9); })
            .attr("fill", "#307D7E")
            .attr("transform", "translate(" + scope.t + "," + scope.t + ")")
            .style("cursor", "pointer")
            .on("mouseover", function(){d3.select(this).style("fill", "#7C7D2F");})
            .on("mouseout", function(){ d3.select(this).style("fill", "#307D7E"); })
            .on("click", function(d){ scope.details(d); });*/


          /*//el mode lo cambie a string por eso no funca
          console.log(scope.xDomain);
          var config = {
              axis: { y:{ ticks: 24}, x:{ ticks: scope.xDomain } }
            },
            x = d3.scale.linear().domain([0,scope.xDomain]).range( [0, (scope.w - (scope.t * 2) ) ]),
            y = d3.scale.linear().domain(scope.dy).range( [0, (scope.h - (scope.t * 2) ) ]),

            xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .ticks(config.axis.y.ticks),

            yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(config.axis.y.ticks),

            canvas = d3.select(element[0])
              .append("svg")
              .attr("width", scope.w)
              .attr("height", scope.h)
              .style("border", "1px solid black");


          canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + scope.t + "," + (( scope.h - scope.t ) + 0.5) + ")")
            .call(xAxis);

          canvas.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (scope.t - 0.5) + "," + scope.t + ")")
            .call(yAxis);

          canvas.selectAll("rect").data(scope.input).enter()
            .append("rect").call(yAxis)
            .attr("x", function(d, i) { return x(i); })
            .attr("y", function(d) { return (y(parseInt(d.hours, 10)) - y(scope.dy[0]) ); })
            .attr("height", function(d) { return (scope.h - (scope.t * 2)) - y(parseInt(d.hours, 10)); })
            .attr("width", function() { return x(0.9); })
            .attr("fill", "#307D7E")
            .attr("transform", "translate(" + scope.t + "," + scope.t + ")")
            .style("cursor", "pointer")
            .on("mouseover", function(){d3.select(this).style("fill", "#7C7D2F");})
            .on("mouseout", function(){ d3.select(this).style("fill", "#307D7E"); })
            .on("click", function(d){ scope.details(d); });*/
        }

        prepareData();

      }
    };
  });


  d3Module.controller('chartCtrl', [ "$scope", "Falcon", function($scope, Falcon) {

    $scope.graphData = [];

    $scope.chartOptions = {
      entity: "feed",
      mode: "hourly",
      day: ""
    };

    $scope.requestNewData = function () {

      var type = $scope.chartOptions.entity,
          mode = $scope.chartOptions.mode,
          fromDate = new Date($scope.chartOptions.day),
          fromMonth = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
          from = fromDate.getFullYear() + '-' +
            (fromMonth[fromDate.getMonth()]) + '-' +
            (function () {
              var date = fromDate.getDate();
              if (date<10) {
                return '0' + date;
              } else {
                return date;
              }
            }()),
          to = from; //no from supported yet

      if (type && mode && $scope.chartOptions.day !== '' && $scope.chartOptions.day !== undefined) {
        Falcon.getInstancesSummary(type, mode, from, to)
          .success(function (data) {
            $scope.graphData = data.summary;
            console.log($scope.graphData);
          }).error(function (error) {
            Falcon.logResponse('error', error, false);
          });
      }

    };

    $scope.dateFormat ='MM/dd/yyyy';
    $scope.openDatePicker = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };


    $scope.my = {
      data : [

        { "hours":"8", "checkIn":"07:00","checkOut":"19:30", "date":"01/07/2014" },
        { "hours":"12", "checkIn":"07:00","checkOut":"19:30", "date":"02/07/2014" },
        { "hours":"10", "checkIn":"07:00","checkOut":"19:30", "date":"03/07/2014" },
        { "hours":"8", "checkIn":"07:00","checkOut":"19:30", "date":"04/07/2014" },
        { "hours":"7", "checkIn":"07:00","checkOut":"19:30", "date":"05/07/2014" },
        { "hours":"8", "checkIn":"07:00","checkOut":"19:30", "date":"06/07/2014" },
        { "hours":"6", "checkIn":"07:00","checkOut":"19:30", "date":"07/07/2014" },
        { "hours":"8", "checkIn":"07:00","checkOut":"19:30", "date":"08/07/2014" },
        { "hours":"16", "checkIn":"07:00","checkOut":"19:30", "date":"07/07/2014" },
        { "hours":"24", "checkIn":"07:00","checkOut":"19:30", "date":"08/07/2014" }
      ]

    };
    $scope.details = function (obj) {
      console.log("details " + obj.hours);
    };

  }]);


}());


