// Simple Charts with single series can specify values and name directly
// more complex charts can specify their series in data-series=

gg.directive('chart', ['$compile', function($compile) {
  return {
    restrict: 'E',
    scope: {
      values: '=',
      name: '@',
      classes: '@',
      series: '=',

      xgamenum: '=',
      xaxis: '=',
      resolution: '=',
      cursor: '=',
      multiplier: '=',
      ymax: '=',
      xmax: '=',
      replaystats: '=',
      
      condensed: '='
    },
    replace: true,
    transclude: true,
    template: '<div class="chart {{ classes }}"><div ng-transclude></div><div class="canvas"></div></div>',

    link: function(scope, element, attrs) {
//      console.log("chart link function", scope);
      options = {
        chart: {
          defaultSeriesType: "line",
          renderTo: element.find('.canvas')[0],
          backgroundColor: null,
          zoomType: "xy",
          animation: false,
          width: 310,
          height: 150,
          resetZoomButton: {
            theme: {
              fill: '#ffdddd'
            },
            position: {
              // align: 'right', // by default
              verticalAlign: 'bottom',
              // x: 0,
              y: -15
            }
          }
        },

        title: {text: ""},
        legend: {enabled: false},
        xAxis: {
          labels: {
            enabled: true,
            style: {
              fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
            }
          }
        },

        yAxis: {
          title: {
            text: null
          },
          labels: {
            style: {
              fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
            }
          },
          min: 0,
          gridLineWidth: 0,
          endOnTick: false
        },

        tooltip:  {
          enabled: true,
          style: {
            fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
          }
        },

        credits: { enabled: false },

        plotOptions: {
          areaspline: {},
          series: {},
          line: {
            shadow: false,
            lineWidth: 4,
            animation: false,

            marker: {
              enabled: false,
              radius: 4,
              lineColor: "#000",
              lineWidth: 1,
              fillColor: "#fff",
              states: {
                hover: { enabled: true }
              }
            }
          }
        },
        // series: scope.data,
        subtitle: {}
      };

      if (scope.ymax) {
        options.yAxis.max = scope.ymax;
      }
      if (scope.xmax) {
        options.xAxis.max = scope.xmax;
      }
      if (scope.xaxis == false) {
        options.xAxis.labels.enabled = false;
        options.xAxis.tickWidth = 0;
      }
      if (scope.replaystats) {
          options.plotOptions.line.pointStart = 1.0;
          options.plotOptions.line.pointInterval = 10.0 / 60.0;
//          console.log("REPLAYSTATS");
      }

      if (scope.$parent.match.engagements) {
          options.xAxis.plotBands = [];
          _.each(scope.$parent.match.engagements, function(engagement) {
            options.xAxis.plotBands.push({
              color: 'rgba(150, 50, 50, 0.10)',
              from: engagement[0] / 960.0,
              to: engagement[1] / 960.0,
              zIndex: 10
            });
          });
          options.xAxis.max = scope.$parent.match.duration_seconds / 60.0;
      }


      custom_tooltip = chart_tooltip_2(element[0].id);
      if (!_.isNull(custom_tooltip)) {
        options.tooltip.formatter = custom_tooltip;
      }

//        console.log("doing it", options, element[0].id);

      scope.chart = new Highcharts.Chart(options);

      if (scope.xgamenum != false) {
        scope.$watch('cursor', function(v) {
          if(v && scope.resolution) {
            extremes = scope.chart.xAxis[0].getExtremes();
            xMax = Math.min(v + scope.resolution, extremes.dataMax);
            xMin = Math.min(Math.max(v, 0), xMax);
            scope.chart.xAxis[0].setExtremes(xMin, xMax);
            //          console.log("extremes! cursors", xMin, xMax, v, scope.resolution, extremes.dataMax);
          }
        });
      }

//        console.log("chart", scope);

      scope.$watch('values', function(newValue, oldValue, scope) {
//        console.log("values", newValue, oldValue, scope);
        if (newValue != oldValue) {
          while(scope.chart.series.length > 0)
            scope.chart.series[0].remove(true);

          var valuesToPlot = [];
          var maxValue = 0.0;
          var multiplier = (typeof scope.multiplier !== 'undefined') ? scope.multiplier : 1.0;
          for (i=0; i < scope.values.length; i++) {
              var theValue = scope.values[i] * multiplier;
              // the game chart x-axis starts at 1. humans.
              valuesToPlot.push([i+1, theValue]);
              if (theValue > maxValue) maxValue = theValue;
          }

          scope.chart.addSeries({
            name: scope.name,
            data: valuesToPlot
          });
          if (scope.xgamenum != false) {
            xMax = scope.values.length;
            xMin = Math.max(1.0, scope.values.length - scope.resolution);
            scope.chart.xAxis[0].setExtremes(xMin, xMax, false);
          }
          scope.chart.yAxis[0].setExtremes(0.0, maxValue, false);

          if (scope.values.length == 0) {
              $(element.parent()).show();
          } else {
              $(element[0]).hide();
          }
          scope.chart.redraw();
        }
      });

      scope.$watch('series', function(newValue, oldValue, scope) {
        if(newValue) {
//          console.log("series", element[0].id, newValue, oldValue, scope);
          scope.chart.options.series = newValue;
//            console.log("redrawing", scope.chart.options, element[0].id);
          scope.chart = new Highcharts.Chart(scope.chart.options);
          if (newValue.length > 0) {
//              console.log("showing...", element[0].id);
              $(element.parent()).show();
          } else {
//              console.log("hiding...", element[0].id);
              $(element[0]).hide();
          }
        }
      }, true);

      all_zero = function(list) {
          return _.every(list, function(item) { return item == 0 })
      }

      scope.$watch('condensed', function(v) {
        if(scope.chart.options.series) {
          if(v != undefined) {
            if(v) {
              for(var __ in scope.chart.options.series) {
                az = all_zero(scope.chart.options.series[__].data);
                scope.chart.options.series[__].nz = !az;
                scope.chart.options.series[__].visible = !az && scope.chart.options.series[__].is_team;
              }
            } else {
              for(var __ in scope.chart.options.series) {
                az = all_zero(scope.chart.options.series[__].data);
                scope.chart.options.series[__].nz = !az;
                scope.chart.options.series[__].visible = !az && !scope.chart.options.series[__].is_team;
              }
            }
          }

          scope.chart.options.plotOptions.line.animation = false;

          scope.chart = new Highcharts.Chart(scope.chart.options);
        }
      });

    }
  }
}]);
