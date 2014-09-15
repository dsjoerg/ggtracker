
gg.controller('ScoutController', ['$scope', '$element', '$urlFilter',
  function ($scope, $element, $urlFilter) {
    $scope.race = '';
    $scope.filter = $urlFilter;
    $scope.vs_race = '';

    $scope.filter.onChange = function(){ 
      console.log('onChange!');
      $scope.filter.apply($scope);
      $scope.refresh(); 
    }

    $scope.refresh = function(params) {
      console.log('refresh!', params);
    }

    $scope.$watch('race + vs_race', function(v) {
      $scope.filter.params.race = $scope.race;
      $scope.filter.params.vs_race = $scope.vs_race;

        if (typeof raceDim !== 'undefined') {
            if (_.isString($scope.race) && ($scope.race.length > 0)) {
                raceDim.filter($scope.race[0].toUpperCase());
            } else {
                raceDim.filterAll();
            }
            if (_.isString($scope.vs_race) && ($scope.vs_race.length > 0)) {
                oppRaceDim.filter($scope.vs_race[0].toUpperCase());
            } else {
                oppRaceDim.filterAll();
            }
            renderAll();
        }
    });

    $scope.render = function() {
      var grp = asGrp.all();
      if (typeof grp !== 'undefined') {
        xyValues = _.map(grp, function (g) { return [g.key, g.value.value]; })
        $scope.chart.series[0].setData(xyValues);
      }
    }

    options = {
      chart: {
        type: "column",
        renderTo: $element.find('.canvas')[0],
        backgroundColor: "#F7F4EF",
        color: "#00f",
        animation: false,
        zoomType: 'x',
        width: 170,
        height: 130,
        events: {
          selection: function(event) {
            console.log("Selected", event.xAxis[0].min, event.xAxis[0].max, event);

            // TODO bind dimension to chart properly
            if (typeof asDim !== 'undefined') {
              asDim.filterRange([event.xAxis[0].min, event.xAxis[0].max]);
              renderAll();
            }

            // TODO show current filter as text
            // TODO when filter is active, show a RESET link
            // TODO show filter as highlighted region on chart
            // TODO switch all charts over to highcharts            
            // TODO if not too hard, make selection area draggable

            event.preventDefault();
          }
        }
      },
      title: {text: ""},
      legend: {enabled: false},
      xAxis: {
          labels: {
              enabled: true,
              style: {"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"},
              formatter: function () { return this.value; }
          }
      },
      yAxis: {
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          labels: { enabled: false },
          minorTickLength: 0,
          tickLength: 0,
          title: '',
          endOnTick: false
      },
      credits: {enabled:false},
      plotOptions: {
          column:{
              animation:false,
              color:'steelblue',
              groupPadding: 0,
              pointPadding: 0,
              borderWidth: 0,
              pointPlacement: 'on',
              marker: {
                  enabled:true,
                  radius:4,
                  symbol: "circle",
                  lineColor: "#111",
                  lineWidth:1,
                  fillColor:"#222",
                  states: {hover:{enabled:true}}
              },
              shadow:false,
              threshold:0
          }
      },
      subtitle: {}
    };
    options.series = [];
    $scope.chart = new Highcharts.Chart(options);
    $scope.chart.addSeries({
           data: [1]
    });
  }
]);
