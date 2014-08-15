// TODO: even though there's a watch in players/matches, it's not currently
// passing through page changes to this directive.

gg.directive('unpaginate', function() {
  return {
    restrict: 'E',
    template: JST['angular/templates/shared/_unpaginate'](),
    controller: ['$scope', '$element', '$urlFilter', function($scope, $element, $urlFilter) {

      $scope.nextPage = function() {
        if (_.isNumber($scope.collection.page)) {
          $scope.filter.params.page = $scope.collection.page + 1;
        } else {
          $scope.filter.params.page = 2;
        }
      }
      
      $scope.prevPage = function() {
        if($scope.collection.page > 1) {
          $scope.filter.params.page = $scope.collection.page - 1;
        }
      }
      
      $scope.toPage = function(page) {
        $scope.filter.params.page = page;
      }
    }]
  }
});

