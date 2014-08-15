gg.directive('notifications', ['Notification', function(Notification) {
  return {
    restrict: 'E',
    template: JST['angular/templates/notifications/index'](),
    transclude: false,
    replace: true,
    scope: {},
    controller: ['$scope', '$rootScope', function($scope, $rootScope) {
      // watching the rootScope for changes in the user, which contains the 
      // user's notifications.
      $rootScope.$watch('user', function() {
        if($rootScope.user)
          $scope.notifications = $rootScope.user.notifications;
      });
    }]
  }
}]);

// A separate directive for the notification - this is the angular way of
// having a "callback", running code on the instantiation of a template, so
// to say.
//
// TODO: I would've liked to have a fadeIn() here, but as it is currently built
// the parent directive will reinstantiate the DOM elements on every change,
// and thus repeatedly call the link no this directive.
// There are several ways around that but they'll need some experimentation
// and we're not in immediate need for this (later on perhaps, also due to non-
// aesthetic reasons.)

gg.directive('notification', ['Notification', function(Notification) {
  return {
    restrict: 'C',
    link: function(scope, element, attrs) {
      scope.ack = function() {
        // TODO: I really want scope.notification.ack()
        $.get('/notifications/' + scope.notification.id +'/ack');
        element.fadeOut();
        return false;
      }
    }
  }
}]);
