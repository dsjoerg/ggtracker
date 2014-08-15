
gg.controller('SpendingCalcController', ['$scope', '$element', '$urlFilter', 'SpendingSkill',
  function ($scope, $element, $urlFilter, SpendingSkill) {
    $scope.race = 'protoss';
    $scope.gateway = 'us';
    $scope.filter = $urlFilter;
    $scope.playername = '';
    $scope.winner = '';
    $scope.dowinner = '';
    $scope.unit = '';
    $scope.versus = '';

    options = {
      chart: {
        defaultSeriesType: "line",
        renderTo: $element.find('.canvas')[0],
        backgroundColor: "#F7F4EF",
        zoomType: "xy",
        animation: false,
        margin: [20],
        width: 700,
        height: 400
      },
      title: {text: ""},
      legend: {enabled: true},
      xAxis: {"title":{"text":"GAME LENGTH (GAME TIME)"}, labels: {enabled: true, style: {"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}}},
      yAxis: {"title":{"text":"SPENDING QUOTIENT"},"labels":{"useHTML":true,"style":{"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}},"min":30,"max":95,"gridLineWidth":0,"endOnTick":false,"startOnTick":false,"minorGridLineColor":"#ccc","minorGridLineDashStyle":"Dot","minorGridLineWidth":1},
      tooltip:  {"enabled":true,"shared":false,"useHTML":false,"style":{"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"}},
      credits: {"enabled":false},
      plotOptions: {"line":{"animation":false,"lineWidth":3,"pointStart":5,"marker":{"enabled":false, "radius":4, "symbol": "circle", "lineColor":"#111", "lineWidth":1, "fillColor":"#222", "states":{"hover":{"enabled":true}}},"shadow":false,"threshold":0}},
      subtitle: {}
    };
    options.series = []
    options.tooltip.formatter = function() {
      return "The average Spending Quotient<br>for a<b>" + this.series.name +
      "</b> league " + gg.regionname[$scope.gateway] + " " + $scope.race +
      "<br>in a<b>" + this.x + "</b>minute game is <b>" + this.y.toFixed(0) +
      ",<br>based on " + $scope.ss["counts"+this.series.options.id][this.x - 5] + " matches.";
    }
    $scope.chart = new Highcharts.Chart(options);


    $scope.filter.defaults = {
        race: 'protoss',
        gateway: 'am'
    }

    $scope.filter.onChange = function(){ 
      $scope.filter.apply($scope);
      $scope.refresh(); 
    }

    $scope.refresh = function(params) {
      $scope.ss = new SpendingSkill.get($scope.filter.urlParams(), function() {
      while($scope.chart.series && $scope.chart.series.length > 0)
        $scope.chart.series[0].remove(true);

      _.each(_.keys(leaguename), function(league) {
         $scope.chart.addSeries({
           name: leaguename[league],
           id: league,
           data: $scope.ss[league],
           color: gg.leaguecolor[league]
         });
      });
      });
    }


    $scope.$watch('race + gateway', function(v) {
      $scope.filter.params.race = $scope.race;
      $scope.filter.params.gateway = $scope.gateway;
    });
  }
]);
