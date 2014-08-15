
gg.controller('WinrateController', ['$scope', '$element', '$urlFilter', 'MatchupStats',
  function ($scope, $element, $urlFilter, MatchupStats) {
    $scope.timeperiod = 'patch_153';
    $scope.filter = $urlFilter;

    $scope.filter.defaults = {
      timeperiod: 'patch_153',
    }

    $scope.filter.onChange = function(){ 
      $scope.filter.apply($scope);
      $scope.refresh(); 
    }

    $scope.refresh = function(params) {
      $scope.new_ms = new MatchupStats.get($scope.filter.urlParams(), function() {
        $scope.ms = $scope.new_ms
        $scope.matchups = [["P","Z", "PvZ"], ["Z","T","ZvT"], ["T","P","TvP"]];
        $scope.leagues = [0,1,2,3,4,5,6];
        $scope.nowdt = Date.parse($scope.ms.now)
      });
    }

    $scope.$watch('timeperiod', function(v) {
      $scope.filter.params.timeperiod = $scope.timeperiod;
    });

    $scope.raceName = function(racechar) {
      return Sc2.race_names[racechar];
    }
    $scope.msdata = function(matchup, league, item) {
      if (item == '2sde') {
        return (100.0 / Math.sqrt($scope.ms[matchup][league]['num_matches'])).toFixed(1);
      }
      return $scope.ms[matchup][league][item];
    }
    $scope.prettyDataDate = function() {
      return Highcharts.dateFormat('%A, %b %e, %H:%M UTC', $scope.nowdt);
    }

  }
]);
