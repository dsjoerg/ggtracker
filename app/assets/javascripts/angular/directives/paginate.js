// TODO: even though there's a watch in players/matches, it's not currently
// passing through page changes to this directive.

gg.directive('paginate', function() {
  return {
    restrict: 'E',
    template: JST['angular/templates/shared/_paginate'](),
    controller: ['$scope', '$element', '$urlFilter', function($scope, $element, $urlFilter) {
      $scope.$watch('collection', function() {
        if($scope.collection) {

          // $scope.pages = Array($scope.collection.pages);
          // god damnit, I hate for loops.
          $scope.pages = [];
          for(i=1; i<= $scope.collection.pages; i++) { $scope.pages.push(i) }

          // I had a total brainfreeze here, but it's this easy:
          // Show up 11 pages total, up to 5 on each side with the current page
          // being in the middle. Maybe make it fancier ..later
          page = $scope.collection.page;
          left = (page-6 <= 0) ? 0 : page-6;
          right = (left+5 >= $scope.collection.pages-1) ? $scope.collection.pages-1 : left+5;
          // add whatever we need to get 10 on the right
          right = right + (11-(right-left));
          $scope.pages = $scope.pages.slice(left, right);
        }
      }, true);

      $scope.nextPage = function() {
        if($scope.collection.page < $scope.collection.pages) {
          $scope.filter.params.page = $scope.collection.page + 1;
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

