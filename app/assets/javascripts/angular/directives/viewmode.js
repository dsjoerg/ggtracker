gg.directive('viewmode', ['$rootScope', 'User', function($rootScope, User) {
  return {
    restrict: 'C',

    link: function($scope) {

        $scope.staircase = function() {
            if (!($rootScope.user)) return false;
            if (!($rootScope.user.view_mode)) return false;
            return $rootScope.user.view_mode == 1
        }

        $scope.toggleStaircase = function() {
            console.log('toggleStaircase', $rootScope.user);
            if (!($rootScope.user)) return;
            $rootScope.user.view_mode = !($rootScope.user.view_mode);

            // argh, it seems that angular takes the response from a
            // $save and stuffs it into the object.  but Rails default
            // update does NOT return JSON of the object.  which
            // convention is more conventional?  i'll say Rails
            throwawayuser = new User($rootScope.user);
            throwawayuser.$save({id:throwawayuser.id});
        }
    }
  }
}]);
