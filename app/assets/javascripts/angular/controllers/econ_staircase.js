
gg.controller('EconomyStaircaseController', ['$scope', '$element', '$urlFilter', 'EconStaircase',
  function ($scope, $element, $urlFilter, EconStaircase) {
    $scope.race = 'protoss';
    $scope.vs_race = 'zerg';
    $scope.metrictype = 2;   // start out showing fit by default

    $scope.metrictypes = ['median', 'mean', 'fit'];
    $scope.leagues = [1,2,3,4,5];
    $scope.filter = $urlFilter;
    $scope.unit = null;
    $scope.es = new EconStaircase.get({});

    $scope.filter.defaults = {
        race: 'protoss',
        vs_race: 'zerg',
    }

    $scope.filter.onChange = function(){ 
      $scope.filter.apply($scope);
    }
      
    $scope.flipMetric = function() {
        $scope.metrictype = ($scope.metrictype + 1) % 3;
    }

    $scope.metric = function() {
        return $scope.metrictypes[$scope.metrictype];
    }

    $scope.criterion = function() {
        return $scope.metrictype == 1 ? 'Saturated' : 'Completed';
    }

    $scope.$watch('race + vs_race', function(v) {
      $scope.filter.params.race = $scope.race;
      $scope.filter.params.vs_race = $scope.vs_race;
      $scope.key = $scope.race[0].toUpperCase() + 'v' + $scope.vs_race[0].toUpperCase();
    });
  }
]);
