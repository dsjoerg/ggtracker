gg.directive('replays', ['Replay', function(Replay) {
  return {
    restrict: 'E',
    template: JST['angular/templates/replays/index'](),
    transclude: true,
    replace: true,
    scope: {},

    controller: ['$scope', '$element', '$http', '$location', '$urlFilter', '$timeout', '$rootScope',
      function($scope, $element, $http, $location, $urlFilter, $timeout, $rootScope) {

      $scope.refreshes = 0;
      $scope.filter = $urlFilter;

      $scope.filter.defaults = {
      }

      $scope.filter.onChange = function(){ 
        $scope.filter.apply($scope);
        $scope.refresh(); 
      }

      // sets location to show the given player very bluntly
      $scope.go = function(state, id) {
        if (state == "done") {
          window.location = '/matches/' + id;
        }
      }

      $scope.refresh = function(params) {
        $timeout.cancel($scope.refresh_timer);
        $scope.refresh_timer = $timeout(function() {
          $scope._players = Replay
            .all($scope.filter.cleanParams())
            .then(function(result) {
              $scope.replays = $scope.collection = result;
            });

          // register pageview, only if it's not the initial refresh
          $scope.refreshes = $scope.refreshes + 1;
          if($scope.refreshes > 1)
            gg.analytics.pageview();
        }, 200, true);
      }

      // To implement Issue #16 the most obvious and simple way, albeit "dirty"
      // we don't ng-model directly on filter.params anymore and instead
      // ..do this (and apply these values above, on onChange too)
      $.each($scope.filter.defaults, function(k,v) {
        $scope.$watch(k, function(_v) {
          $scope.filter.params.page = 1;
          $scope.filter.params[k] = _v;
        })
      });
    }],

    link: function(scope) {
      scope.refresh();
    }
  }
}]);