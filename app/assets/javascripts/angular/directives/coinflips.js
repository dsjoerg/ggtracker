gg.directive('coinflips', function() {
  return {
    restrict: 'C',
    link: function($scope) {
      $scope.N = 10000;
      $scope.flipcoins = function() {
        $scope.numHeads = 0;
        for (var i=0; i < $scope.N; i++) {
            if (Math.random() > 0.5)
                $scope.numHeads++;
        }
        $scope.pctHeads = 100.0 * $scope.numHeads / $scope.N;
        $scope.plusminus = 100.0 * (1.0 / Math.sqrt($scope.N));
      }
      $scope.flipcoins();
    }
  }
});
