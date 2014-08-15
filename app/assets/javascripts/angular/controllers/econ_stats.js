
gg.controller('EconomyStatsController', ['$scope', '$element', '$urlFilter', 'EconStats',
  function ($scope, $element, $urlFilter, EconStats) {
    $scope.race = 'protoss';
    $scope.vs_race = 'zerg';
    $scope.leagues = [0,1,2,3,4,5,6];
    $scope.filter = $urlFilter;
    $scope.unit = null;
    $scope.es = new EconStats.get({});

    $scope.filter.defaults = {
        race: 'protoss',
        vs_race: 'zerg',
    }

    $scope.filter.onChange = function(){ 
      $scope.filter.apply($scope);
    }

    $scope.$watch('race + vs_race', function(v) {
      $scope.filter.params.race = $scope.race;
      $scope.filter.params.vs_race = $scope.vs_race;
      $scope.key = $scope.race[0].toUpperCase() + 'v' + $scope.vs_race[0].toUpperCase();
    });
  }
]);
