gg.directive('matches', ['Match', function(Match) {
  return {
    restrict: 'E',
    template: JST['angular/templates/matches/index'](),
    transclude: true,
    replace: true,
    scope: {
      // quick Note: on binds - if we change it on our local scope and the attr
      // is not defined, it'll die. So for this, we always need to specify
      // *-collection= on the matches tag. For identity above we don't, because
      // we don't write it in the directive currently.
      matches: '=collection',
      identity: '=',
      haveReplay: '@',
      paginate: '@'
    },
    controller: ['$scope', '$element', '$http', '$urlFilter', '$timeout', 'Match', '$rootScope', 
      function($scope, $element, $http, $urlFilter, $timeout, Match, $rootScope) {
      // FIXME FIXME FIXME: how to access $window in interpolations? Only 
      // reason this is here is because angular refuses us access to, 
      // for example, $window.gg.user
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
        gateway: '',
        category: ''
      }

      $scope.filter.hidden.push('identity_id');

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

      // bind our identity bind to urlFilter (uhhh)
      // TODO: now this is something we can do with routes instead, if we want
      // to get the identity id from the URL. Still, if not, we need to get rid
      // of it displaying in the URL for players#show for example because I
      // think it's redundant and ugly.
      $scope.$watch('identity', function(v) {
        if(v)
          $scope.filter.params.identity_id = v.id;
      });

      // The timeout here makes sure requests aren't being made too rapidly.
      // TODO: the way our watchers and everything is set up, this can be a
      // real problem. Make sure this timeout doesn't just temporarily relieve
      // us.

      $scope.refresh = function(params) {
        $timeout.cancel($scope.refresh_timer);
        $scope.refresh_timer = $timeout(function() {
          params = {
            stats: $scope.stats, 
            replay: $scope.haveReplay ? true : false,
            paginate: $scope.paginate ? true : false
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
          'saturation_skill(avg:[<'+iid+'])',
          'sat_1_skill(avg:[<'+iid+'])',
          'sat_2_skill(avg:[<'+iid+'])',
          'sat_3_skill(avg:[<'+iid+'])',
          'sat_1_skill(mavg:[<'+iid+'])',
          'sat_2_skill(mavg:[<'+iid+'])',
          'sat_3_skill(mavg:[<'+iid+'])',
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
