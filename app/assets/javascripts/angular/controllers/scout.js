
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
  }
]);
