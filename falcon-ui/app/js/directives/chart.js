(function () {
  "use strict";

  var d3Module = angular.module('chart-module', ['app.services.falcon']);

  //  <d3-bar-chart class="chart" input="my.data" w="700" h="400" t="30" dx="[0,50]" dy="[24,0]" details="details"></d3-bar-chart>
  d3Module.directive('chart', function() {
    return {
      scope: {
        input: "=",
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

        angular.element(window).on('resize', prepareData);

        function prepareData () {

          if (scope.input.length === 0) {
            return;
          }

          scope.w = angular.element('.chartCol').width();
          scope.h = 400;


          if (scope.mode === 'daily') { scope.xDomain = 14; } else { scope.xDomain = 24; }

          scope.yDomain = d3.max(scope.input, function (d) {
            if (d.numFailedInstances >= d.numSuccessfullInstances) {
              return d.numFailedInstances;
            }else {
              return d.numSuccessfullInstances;
            }
          });
          scope.yMaxDataSizeDomain = d3.max(scope.input, function (d) {
              return d.dataSizeCopied;
          }) + 100;
          scope.yMaxDataSizeDomain = scope.yMaxDataSizeDomain * 1.2;
          scope.yDomain = scope.yDomain * 1.2

          d3.selectAll('svg').remove();

          drawChart();

        }

        function drawChart() {

          var x = d3.scale.linear().domain([0,scope.xDomain]).range( [0, (scope.w - (scope.t * 2) ) ]),
              y = d3.scale.linear().domain([0, scope.yDomain]).range( [0, (scope.h - (scope.t * 2) ) ]),
              yDataSizeScale = d3.scale.linear().domain([0, scope.yMaxDataSizeDomain]).range( [0, (scope.h - (scope.t * 2) ) ]),

              xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(scope.xDomain),

              yAxis = d3.svg.axis()
                .scale(y),

              canvas = d3.select(element[0])
                .append("svg")
                .attr("width", scope.w)
                .attr("height", scope.h),

              col,
              tip,

              linePrepareTransition = d3.svg.line()
                .x(function(d, i) {
                  return x(i);
                })
                .y(function(d) {
                  return (y(scope.yDomain));
                })
                .interpolate('cardinal'),

              successLineFunc = d3.svg.line()
                .x(function(d, i) {
                  return x(i);
                })
                .y(function(d) {
                  return (y(scope.yDomain - d.numSuccessfullInstances));
                })
                .interpolate('cardinal'),

              failedLineFunc = d3.svg.line()
                .x(function(d, i) {
                  return x(i);
                })
                .y(function(d) {
                  return (y(scope.yDomain - d.numFailedInstances));
                })
                .interpolate('cardinal'),

              successAreaFunc = d3.svg.area()
                .x(function(d, i) {
                  return x(i);
                })
                .y0(y(scope.yDomain))
                .y1(function(d) {
                  return (y(scope.yDomain - d.numSuccessfullInstances));
                })
                .interpolate('cardinal'),

              failedAreaFunc = d3.svg.area()
                .x(function(d, i) {
                  return x(i);
                })
                .y0(y(scope.yDomain))
                .y1(function(d) {
                  return (y(scope.yDomain - d.numFailedInstances));
                })
                .interpolate('cardinal');

          //---------------X AXIS ----------------------//
          canvas.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(" + scope.t + "," + (( scope.h - scope.t ) + 0.5) + ")")
            .call(xAxis);

          //---------------GRID-------------------------//
          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: 0,
              y2: 0,
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y(scope.yDomain/11),
              y2: y(scope.yDomain/11),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 2),
              y2: y((scope.yDomain/11) * 2),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 3),
              y2: y((scope.yDomain/11) * 3),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 4),
              y2: y((scope.yDomain/11) * 4),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 5),
              y2: y((scope.yDomain/11) * 5),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 6),
              y2: y((scope.yDomain/11) * 6),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 7),
              y2: y((scope.yDomain/11) * 7),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 8),
              y2: y((scope.yDomain/11) * 8),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 9),
              y2: y((scope.yDomain/11) * 9),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          canvas.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: 0,
              x2: x(scope.xDomain),
              y1: y((scope.yDomain/11) * 10),
              y2: y((scope.yDomain/11) * 10),
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });
          //----------------------------------------//

          //----------BARS DATASIZE COPIED---------------//
          canvas.selectAll('rect.dataSize')
            .data(scope.input).enter()
            .append("svg:rect").attr('class', 'dataSize')
            .attr({
              x: function(d, i) { return x(i); },
              y: function(d, i) { return yDataSizeScale(scope.yMaxDataSizeDomain); },
              width: function(d, i) { return x(1); },
              height: function(d, i) { return 0; },
              stroke: "none",
              fill: "rgba(8,8,8,0.3)",
              transform: "translate(" + scope.t + "," + scope.t + ")"
            })
            .transition().duration(2000)
            .attr({
              height: function(d, i) { return yDataSizeScale(d.dataSizeCopied); },
              y: function(d, i) { return yDataSizeScale(scope.yMaxDataSizeDomain - d.dataSizeCopied); }
            });

          //-------------LINES AND AREAS------------//


          canvas.append('svg:path')
            .attr({
              d: linePrepareTransition(scope.input),
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")",
              stroke: "green",
              "stroke-width": 2,
              "stroke-linecap": "round",
              fill: "rgba(0,0,0,0)"
            })
            .transition().duration(1000)
            .attr({
              d: successLineFunc(scope.input)
            });


          canvas.append('svg:path')
            .attr({
              d: linePrepareTransition(scope.input),
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")",
              stroke: "red",
              "stroke-width": 2,
              fill: 'none'
            })
            .transition().duration(1000).delay(500)
            .attr({
              d: failedLineFunc(scope.input)
            });

          canvas.append('svg:path')
            .attr({
              d: linePrepareTransition(scope.input),
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")"
            })
            .transition().duration(1000)
            .attr({
              d: successAreaFunc(scope.input),
              stroke: "none",
              fill: "rgba(0,255,0,0.1)"
            });

          canvas.append('svg:path')
            .attr({
              d: linePrepareTransition(scope.input),
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")"
            })
            .transition().duration(1000).delay(500)
            .attr({
              d: failedAreaFunc(scope.input),
              stroke: "none",
              fill: "rgba(255,0,0,0.1)"
            });

          //------------COL----------------------------//
          col = canvas.selectAll('g.col')
            .data(scope.input).enter()
            .append("g").attr('class', 'column');

          col.append('svg:line')
            .attr({
              stroke: "#d3d3d3",
              'stroke-width': 1,
              x1: function(d, i) { return x(i); },
              x2: function(d, i) { return x(i); },
              y1: 0,
              y2: y(scope.yDomain),
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")"
            });

          col.append('svg:line')
            .attr({
              stroke: "#748484",
              'stroke-width': 3,
              x1: function(d, i) { return x(i); },
              x2: function(d, i) { return x(i + 1); },
              y1: function (d) { return yDataSizeScale((scope.yMaxDataSizeDomain - d.dataSizeCopied)) + 1.5; },
              y2: function (d) { return yDataSizeScale((scope.yMaxDataSizeDomain - d.dataSizeCopied)) + 1.5; },
              transform: "translate(" + scope.t + "," + scope.t + ")"
            });

          col.append("circle")
            .attr({
              r: 5,
              fill: "green",
              cx: function(d, i) { return x(i);},
              cy: function(d) { return (y(scope.yDomain - d.numSuccessfullInstances)); },
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")"
            });
          col.append("circle")
            .attr({
              r: 5,
              fill: "red",
              cx: function(d, i) { return x(i);},
              cy: function(d) { return (y(scope.yDomain - d.numFailedInstances)); },
              transform: "translate(" + (x(0.5) + parseInt(scope.t, 10)) + "," + scope.t + ")"
            });


          tip = col.append("g").attr('transform', "translate(" + scope.t + ", -" + scope.t/2 + ")");

          tip.append("svg:rect")
            .attr({
              stroke: "gray",
              fill: "white",
              transform: "translate(-6, -"+ scope.t + ")",
              width: 50,
              height: 50,
              'stroke-width': 1,
              x: function(d, i) { return x(i);},
              y: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              }
            });

          tip.append("text")
            .attr({
              x: function(d, i) { return x(i); },
              y: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              },
              transform: "translate(10, -" +  (scope.t * 0.5) +")",
              position: "relative"
            })

            .html(function(d, i) {
              var tip = "<tspan x='' y='' fill='green'>" + d.numSuccessfullInstances + "</tspan>";

              return tip;
            });

          tip.append("text")
            .attr({
              x: function(d, i) { return x(i); },
              y: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              },
              transform: "translate(10, -2)",
              position: "relative"
            })

            .html(function(d, i) {
              var tip = "<tspan x='' y='' fill='red'>" + d.numFailedInstances + "</tspan>";


              return tip;
            });
          tip.append("text")
            .attr({
              x: function(d, i) { return x(i); },
              y: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              },
              transform: "translate(0, 13)",
              position: "relative"
            })

            .html(function(d, i) {
              return "<tspan x='' y='' fill='gray'>" + d.dataSizeCopied + "</tspan>";
            });

          tip.append("circle")
            .attr({
              r: 5,
              fill: "green",
              cx: function(d, i) { return x(i);},
              cy: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              },
              transform: "translate(3,-20)"
            });

          tip.append("circle")
            .attr({
              r: 5,
              fill: "red",
              cx: function(d, i) { return x(i);},
              cy: function (d) {

                if (y(d.numSuccessfullInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numSuccessfullInstances) > y(d.numFailedInstances)) {
                  return (y(scope.yDomain) - y(d.numSuccessfullInstances));
                } else if (y(d.numFailedInstances) > yDataSizeScale(d.dataSizeCopied) && y(d.numFailedInstances) > y(d.numSuccessfullInstances)) {
                  return (y(scope.yDomain) - y(d.numFailedInstances));
                } else {
                  return (yDataSizeScale(scope.yMaxDataSizeDomain) - yDataSizeScale(d.dataSizeCopied));
                }

              },
              transform: "translate(3,-6)"
            });

          //--------------CLICKABLE-----------//
          col.append("rect")
            .attr({
              x: function(d, i) { return x(i); },
              y: 0,
              width: function(d, i) { return x(1); },
              height: scope.h,
              stroke: "none",
              fill: "transparent",
              transform: "translate(" + scope.t + ", 0)"
            })
            .on("click", function(d){ scope.details(d); });


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

    $scope.chartSidebarModel = {
      date: undefined,
      succeed: [],
      failed: [],
      dataCopied: []
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

    $scope.details = function (obj) {

      var from = obj.startTime,
          to = obj.endTime,
          entityType = $scope.chartOptions.entity;

      Falcon.getTopEntities(entityType, from, to).success(function (data) {
        $scope.chartSidebarModel = data;
      }).error(function (error) {
        Falcon.logResponse('error', error, false);
      });

    };

  }]);


}());


