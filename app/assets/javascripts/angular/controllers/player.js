gg.controller('PlayerController', ['$scope', '$window', 'Player', function ($scope, $window, Player) {

  $scope.resolution = 100;
  $scope.cursor = 1;

  $scope.identity = new Player($window.gon.identity);
  $window.__identity = $scope.identity;

  $scope.$watch('matches.total', function(v) {
    if(v)
      $scope.cursor = Math.max(0,v - $scope.resolution)
  });

  $scope.$watch('matches.djstats.armystrength', function(v) {
    if(v) {
      $scope.matches.djstats.abm = [];
      
      $scope.matches.djstats.abm.push({name: "armystr",
                                data: $scope.matches.djstats.armystrength.slice(0,20)});
      $scope.matches.djstats.abm.push({name: "armystr_2weeks",
                                data: $scope.matches.djstats.armystrength_lasttwo.slice(0,20)});
      console.log("AS watch triggered", v, $scope);
    }
  });

  $scope.charcode = function() {
      result = prompt("Please enter the Character Code for " + $scope.identity.name + " on the Beta Server:");
      if (result.length == 0)
          return;

      $.ajax({
          url: 'http://' + gg.settings.api_host + '/api/v1/identities/' + $scope.identity.id + '/charcode',
          type: 'POST',
          data: {
            charcode: result,
            user_id: gon.user.id
          },
          success: function() {
              alert("Got it!  It usually takes about ten minutes to retrieve match details.  Whenever you upload a new replay we will retrieve match details for you again.");
          },
          error: function() {
              alert("Sorry, we couldn't process your Character Code for some reason.  Please contact hello@ggtracker.com and they'll take care of it for you.");
          }
      });
  }
}]);
