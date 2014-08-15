gg.directive('sqcalc', function() {
  return {
    restrict: 'C',
    link: function($scope) {
      $scope.aur = 1000.0;
      $scope.inc = 1500.0;
      $scope.updateSQ = function(scope) {
        scope.sq = (35.0 * (0.00137 * scope.inc - Math.log(scope.aur)) + 240.0).toFixed(0);
      }
      $scope.$watch("aur", function(newValue, oldValue, scope) {
        scope.updateSQ(scope);
      });
      $scope.$watch("inc", function(newValue, oldValue, scope) {
        scope.updateSQ(scope);
      });
    }
  }
});
