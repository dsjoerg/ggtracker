gg.directive('army', function() {
  return {
    restrict: 'E',
    template: JST['angular/templates/army'](),
    transclude: true,
    replace: true,
    scope: {
      match: '=',
      entity: '=',
      frame: '='
    },
    controller: ['$scope', function($scope) {

      armyUpdate = function(v) {
        if(v) { $scope.army = $scope.match.entityArmyAt($scope.entity, v); }
      };
      throttledArmyUpdate = _.throttle(armyUpdate, 250);

      // Watch the frame and update the army
      $scope.$watch('frame', throttledArmyUpdate);
    }]
  }
});
