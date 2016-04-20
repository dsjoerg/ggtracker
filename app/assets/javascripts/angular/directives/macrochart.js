
gg.directive('macrochart', [function() {
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
          defaultSeriesType: "columnrange",
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
                  animation: false
              }
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

      };

      speed_multiplier = 1;
      if (scope.$parent.match.expansion_tag == 'LotV') {
        speed_multiplier = 1.4;
      }

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

      scope.chart = new Highcharts.Chart(options);

      scope.show = true;
      macro = scope.match.macro;

      nametoshow = scope.$parent.entity.identity.name;
      playertoshow = _.find(macro, function(playerinfo) {return playerinfo[0] == nametoshow;});
      if (_.isUndefined(playertoshow)) {
        idtoshow = scope.$parent.entity.identity.id;
        playertoshow = _.find(macro, function(playerinfo) {return playerinfo[0] == idtoshow;});
      }
      
      if (!_.isUndefined(playertoshow)) {
        hatches = playertoshow[1];

        hatchdata = [];
       
        for (i=0; i<hatches.length; i++) {
          times = hatches[i].times;
          for (inj=0; inj<times.length; inj++) {
            hatchdata.push([i, times[inj] / (16.0 * 60.0 * speed_multiplier), (times[inj] + 16 * 40)/(16.0 * 60.0 * speed_multiplier)])
          }
        }
        scope.chart.addSeries({
          name: nametoshow,
          data: hatchdata,
          color: '#' + scope.$parent.entity.color
        });
        scope.chart.redraw();
      }
    }
  }
}]);
