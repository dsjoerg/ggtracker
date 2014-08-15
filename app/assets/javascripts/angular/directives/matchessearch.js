gg.directive('matchessearch', ['Match', function(Match) {
  return {
    restrict: 'E',
    template: JST['angular/templates/matches/search'](),
    transclude: true,
    replace: true,
    scope: {
      matches: '=collection',
      identity: '=',
      haveReplay: '@',
      paginate: '@'
    },
    controller: ['$scope', '$element', '$http', '$urlFilter', '$timeout', 'Match', '$rootScope', 
      function($scope, $element, $http, $urlFilter, $timeout, Match, $rootScope) {

      $rootScope.$watch('user', function(v) { $scope.user = v; })
      
      $scope.refreshes = 0;

      $scope.filter = $urlFilter;

      $scope.filter.defaults = {
        average_league: '',
        game_type: '',
        map_name: '',
        identity_id: '',
        race: '',
        vs_race: '',
        one_wins: '',
        two_wins: '',
        unit_one: '',
        time_one: '',
        unit_two: '',
        time_two: '',
        gateway: '',
        category: ''
      }

      $scope.filter.hidden.push('identity_id');
      $scope.filter.hidden.push('game_type');

      // These are set via attributes, but just to be safe, let's hide them
      $scope.filter.hidden.push('stats');
      $scope.filter.hidden.push('replay');

      $scope.filter.onChange = function(){ 
        $scope.filter.apply($scope);
        $scope.refresh(); 
      }

      // sets location to show the given match very bluntly
      $scope.go = function(id) {
        window.location = '/matches/' + id;
      }

      // bind our identity bind to urlFilter
      $scope.$watch('identity', function(v) {
        if(v)
          $scope.filter.params.identity_id = v.id;
      });

      // The timeout here makes sure requests aren't being made too rapidly.

      $scope.refresh = function(params) {
        $timeout.cancel($scope.refresh_timer);
        $scope.refresh_timer = $timeout(function() {
          params = {
            stats: $scope.stats, 
            replay: $scope.haveReplay ? true : false,
            paginate: $scope.paginate ? true : false,
            game_type: '1v1'
          }
          
          if($scope.identity)
            params['identity_id'] = $scope.identity.id
          
          $scope._matches = Match
            .all($.extend($scope.filter.cleanParams(), params))
            .then(function(result) {
              $scope.matches = $scope.collection = result;
            }); // then
          
          // register pageview, only if it's not the initial refresh
          $scope.refreshes = $scope.refreshes + 1;
          if($scope.refreshes > 1)
            gg.analytics.pageview();

          // :(
          // FIXME: https://github.com/angular/angular.js/issues/734
          $timeout(function() {
            $('.tooltipped').tipsy();
          }, 500);
        }, 300, true);
      }

      $.each($scope.filter.defaults, function(k,v) {
        $scope.$watch(k, function(_v) {
          $scope.filter.params.page = 1;
          $scope.filter.params[k] = _v;
        })
      });

      $scope.$watch('one_wins', function(v) {
          if (v) {
            delete $scope.filter.params.two_wins;
          }
      });

      $scope.$watch('two_wins', function(v) {
          if (v) {
            delete $scope.filter.params.one_wins;
          }
      });

    }],

    link: function(scope, element, attrs) {
      // pre-defined keywords for stats, giving us a way better picture of what
      // we're actually requesting..
      switch(attrs.stats) {
      case 'player':
        iid = scope.identity.id;
        scope.stats = [
          'apm(avg:[<'+iid+'])',
          'apm(mavg:[<'+iid+'])',
          'wpm(avg:[<'+iid+'])',
          'wpm(mavg:[<'+iid+',E4])',
          'spending_skill(avg:[<'+iid+'])',
          'spending_skill(mavg:[<'+iid+'])',
          'win(mavg:[<'+iid+'])',
          'win(count:[<'+iid+'])',
          'loss(count:[<'+iid+'])',
        ]
        
        scope.stats = scope.stats.join(',');
        break;
      default:
        scope.stats = attrs.stats;
      }
    }
  }
}]);
