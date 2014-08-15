// Simple Charts with single series can specify values and name directly
// more complex charts can specify their series in data-series=

gg.directive('areachart', ['$compile', function($compile) {
  return {
    restrict: 'E',
    scope: {
      values: '=',
      name: '@',
      help: '@',
      classes: '@',
      series: '=',
      
      resolution: '=resolution',
      cursor: '=cursor',
      multiplier: '=multiplier',
      areafill: '=areafill',
      arealine: '=arealine',
      mti: '=mti',
      ymax: '=ymax',
      playername: '=playername',
      xgamenum: '='
    },
    replace: true,
    template: '<div class="chart {{ classes }}"><a href class="ggtipper2" title="{{ help }}" data-gravity="s"><span class="title">{{ name }}</span></a><div class="canvas"></div></div>',


    link: function(scope, element, attrs) {
      options = {
        chart: {
          defaultSeriesType: "area",
          renderTo: element.find('.canvas')[0],
          backgroundColor: "#F7F4EF",
          zoomType: "x",
          animation: false,
          margin: [20],
          width: 310,
          height: 150
        },
        title: {text: ""},
        legend: {layout: "vertical", style: {}, enabled: false, itemStyle: {fontFamily: "'Open Sans', verdana, arial, helvetica, sans-serif"}},
        xAxis: {tickWidth:0, labels: {enabled: false, style: {"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}}},
        yAxis: {"title":{"text":null},"labels":{"useHTML":true,"style":{"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}},"min":0,"gridLineWidth":0,"endOnTick":false,"startOnTick":false,"minorGridLineColor":"#ccc","minorGridLineDashStyle":"Dot","minorGridLineWidth":1,"minorTickInterval":scope.mti},
        tooltip:  {"enabled":true,"shared":true,"useHTML":false,"style":{"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}},
        credits: {"enabled":false},
        plotOptions: {"area":{"animation":false,"lineWidth":2,"marker":{"enabled":false, "radius":4, "symbol": "circle", "lineColor":"#111", "lineWidth":1, "fillColor":"#222", "states":{"hover":{"enabled":true}}},"fillColor":scope.areafill,"lineColor":scope.arealine,"shadow":false,"threshold":0}},
        subtitle: {}
      };

      if (scope.ymax) {
          options['yAxis']['max'] = scope.ymax;
      }

      options.xAxis.labels.formatter = function() { return this.value; };

      // HAX. actually megahax. i tried doing this the right way, but
      // angular is a gigantic fucking nuisance and makes everything
      // complicated.  how do you pass a function into a directive?  i
      // could make a new controller to be the parent of the charts,
      // but it's not clear if that would work.
      //
      // if you can fully fix this in 15 minutes or less, excellent
      // and i salute you.
      //
      // otherwise angular sucks, and when the hacks become too
      // annoying we'll swap it out for a framework that has better
      // documentation and more fully-featured examples.
      //
      options.tooltip.formatter = chart_tooltip(element[0].id, scope.playername);
      options.yAxis.labels.formatter = yAxis_tooltip(element[0].id);
      //      console.log("about to make the chart", element[0].id);
      scope.chart = new Highcharts.Chart(options);

      if (scope.xgamenum != false) {
        scope.$watch('cursor', function(v) {
          if(v && scope.resolution) {
            extremes = scope.chart.xAxis[0].getExtremes();
            xMax = Math.min(v + scope.resolution, extremes.dataMax);
            xMin = Math.min(Math.max(v, 0), xMax);
            scope.chart.xAxis[0].setExtremes(xMin, xMax);
            //          console.log("extremes! cursors", xMin, xMax, v, scope.resolution, extremes.dataMax, element[0].id);
            scope.chart.redraw();
          }
        });
      }

//      console.log("values", scope.values, scope.name);

      scope.$watch('values', function(newValue, oldValue, scope) {
        if (newValue != oldValue) {
          while(scope.chart.series.length > 0)
            scope.chart.series[0].remove(true);

//          console.log("new values", scope.values.length, scope.name);

          var valuesToPlot = [];
          var maxValue = 0.0;
          var multiplier = (typeof scope.multiplier !== 'undefined') ? scope.multiplier : 1.0;
          var x=1;
          var numNonzero=0;
          // scope.values has the oldest game in position 0.
          // on the chart, we want the most recent game to be on the right.
          // so it has to be at the end of the valuesToPlot array.
          for (i=0; i < scope.values.length; i++) {
              var theValue = scope.values[i] * multiplier;
              if (theValue > 0) {
                  numNonzero++;
              }
              // the game chart x-axis starts at 1. humans.
              valuesToPlot.push([x++, theValue]);
              if (theValue > maxValue) maxValue = theValue;
          }

          if (numNonzero > 0) {

            $(element.parent()).show();

            scope.chart.addSeries({
              name: scope.name,
              data: valuesToPlot
            });
            xMax = scope.values.length;
            xMin = Math.max(1.0, scope.values.length - scope.resolution);
            scope.chart.xAxis[0].setExtremes(xMin, xMax, false);
            scope.chart.yAxis[0].setExtremes(0.0, maxValue, false);

            //            console.log("redraw", element[0].id);
            scope.chart.redraw();

          } else {
              $(element.parent()).hide();
          }
        }
      });
    }
  }
}]);
