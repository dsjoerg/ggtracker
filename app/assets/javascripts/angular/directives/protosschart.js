
gg.directive('protosschart', [function() {
  return {
    restrict: 'E',
    scope: {
      match: '=',
      classes: '@'
    },
    replace: true,
    transclude: true,
    template: '<div class="chart {{ classes }}"><div ng-transclude></div><div class="canvas"></div></div>',

    link: function(scope, element, attrs) {

      options = {
        chart: {
          renderTo: element.find('.canvas')[0],
          backgroundColor: null,
          zoomType: "y",
          animation: false,
          width: 310,
          height: 150,
          inverted: true
        },
        plotOptions: {
          columnrange: {
            animation: false,
          },
        },
        legend: {enabled: false},
        xAxis: {
          title: {
            text: null
          },
          labels: {
            style: {
              fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
            },
            enabled: false
          },
          gridLineWidth: 0,
          lineWidth: 0,
          tickLength: 0,
          endOnTick: false
        },
        yAxis: {
          labels: {
            enabled: true,
            style: {
              fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
            }
          },
          title: {
            text: null
          },
          min: 0,
          max: (scope.match.duration_seconds / 60.0),
          allowDecimals: false,
          lineWidth: 1.0,
          tickLength: 5.0,
          endOnTick: false
        },
        tooltip:  {
          enabled: false,
          style: {
            fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"
          }
        },
        subtitle: {},
        title: {text: ""},
        credits: {"enabled":false},
        series: []
      };

      macro = scope.match.pmacro;

      speed_multiplier = 1;
      if (scope.$parent.match.expansion_tag == 'LotV') {
        speed_multiplier = Sc2.LOTV_SPEEDUP;
      }

      nametoshow = scope.$parent.entity.identity.name;
      idtoshow = scope.$parent.entity.identity.id;
      nexus_stats = macro[idtoshow];
      if (!nexus_stats) return;

      numbases = nexus_stats.length
      maxouts = []
      for (basenum=0; basenum<numbases; basenum++) {
        maxout_blob = nexus_stats[basenum][1];
        for (j=0; j<maxout_blob.length; j++) {
          maxout = maxout_blob[j]
          maxouts.push([basenum, maxout[0] / (16.0 * 60.0 * speed_multiplier), maxout[1] / (16.0 * 60.0 * speed_multiplier)])
        }
      }

      options.series.push({
        name: nametoshow,
        data: maxouts,
        type: 'columnrange',
        color: '#' + scope.$parent.entity.color,
      });

      if (scope.$parent.match.engagements) {
          options.yAxis.plotBands = [];
          _.each(scope.$parent.match.engagements, function(engagement) {
            options.yAxis.plotBands.push({
              color: 'rgba(150, 50, 50, 0.1)',
              from: engagement[0] / 960.0 / speed_multiplier,
              to: engagement[1] / 960.0 / speed_multiplier,
              zIndex: 10
            });
          });
      }


      chronoboosts = [];
      for (basenum=0; basenum<numbases; basenum++) {
        chrono_blob = nexus_stats[basenum][0];
        for (chrono=0; chrono<chrono_blob.length; chrono++) {
          chronoboosts.push([basenum, chrono_blob[chrono] / (16.0 * 60.0 * speed_multiplier)]);
        }
      }

      options.series.push({
        name: nametoshow,
        data: chronoboosts,
        color: '#' + scope.$parent.entity.color,
        type: 'scatter',
        marker: { enabled: true,
                  symbol: 'circle',
                  fillColor: 'rgba(0,0,0,0)',
                  color: '#' + scope.$parent.entity.color,
                  radius: 24 / numbases,
                  lineColor: '#' + scope.$parent.entity.color,
                  lineWidth: 1,
                  states: {
                    hover: {
                      enabled: false
                    }
                  }
                }
      });
            
      scope.chart = new Highcharts.Chart(options);
      scope.show = true;
    }
  }
}]);
