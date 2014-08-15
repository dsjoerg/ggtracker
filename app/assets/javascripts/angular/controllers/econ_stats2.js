
gg.controller('EconomyStatsController2', ['$scope', '$element', '$urlFilter', 'EconStats',
  function ($scope, $element, $urlFilter, EconStats) {
    $scope.matchups = ['PvP','PvZ','PvT','ZvP','ZvZ','ZvT','TvP','TvZ','TvT']
    $scope.filter = $urlFilter;
    $scope.es = new EconStats.get({});

    $scope.filter.defaults = {
        league: 5
    }

    $scope.leaguename = function(league) {
        return Sc2.leagues[league];
    }

    $scope.filter.onChange = function(){ 
      $scope.filter.apply($scope);
    }

    $scope.$watch('league', function(v) {
      $scope.filter.params.league = $scope.league;
    });
  }
]);
