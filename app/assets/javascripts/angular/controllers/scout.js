
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
        animation: false,
        margin: [20],
        width: 300,
        height: 150
      },
      title: {text: ""},
      legend: {enabled: false},
      xAxis: {labels: {enabled: true, style: {"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}}},
      yAxis: {lineWidth: 0, minorGridLineWidth: 0, lineColor: 'transparent', labels: { enabled: false }, minorTickLength: 0, tickLength: 0, title: ''},
      credits: {'enabled':false},
      plotOptions: {"line":{"animation":false,"lineWidth":3,"marker":{"enabled":false, "radius":4, "symbol": "circle", "lineColor":"#111", "lineWidth":1, "fillColor":"#222", "states":{"hover":{"enabled":true}}},"shadow":false,"threshold":0}},
      subtitle: {}
    };
    options.series = [];
    $scope.chart = new Highcharts.Chart(options);
    $scope.chart.addSeries({
           data: [1]
    });
  }
]);
