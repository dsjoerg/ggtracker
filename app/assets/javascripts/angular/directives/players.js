gg.directive('players', ['Player', function(Player) {
  return {
    restrict: 'E',
    template: JST['angular/templates/players/index'](),
    transclude: true,
    replace: true,
    scope: {},

    controller: ['$scope', '$element', '$http', '$location', '$urlFilter', '$timeout',
      function($scope, $element, $http, $location, $urlFilter, $timeout) {

      $scope.refreshes = 0;
      $scope.filter = $urlFilter;

      $scope.filter.defaults = {
        name: '',
        race: '',
        current_highest_league: '',
        game_type: '',
        gateway: ''
      }

      $scope.filter.onChange = function(){ 
        $scope.filter.apply($scope);
        $scope.refresh(); 
      }

      // sets location to show the given player very bluntly
      $scope.go = function(id) {
        window.location = '/players/' + id;
      }

      $scope.refresh = function(params) {
        $timeout.cancel($scope.refresh_timer);
        $scope.refresh_timer = $timeout(function() {
          $scope._players = Player
            .all($scope.filter.cleanParams())
            .then(function(result) {
              $scope.players = $scope.collection = result;
            });

          // register pageview, only if it's not the initial refresh
          $scope.refreshes = $scope.refreshes + 1;
          if($scope.refreshes > 1)
            gg.analytics.pageview();
        }, 300, true);
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
