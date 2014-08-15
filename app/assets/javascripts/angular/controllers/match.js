gg.controller('MatchController', ['$scope', '$window', '$route', '$location', '$element', 'Match',
function($scope, $window, $route, $location, $element, Match) {

  mb = $.parseJSON(gon.matchblob);
//  console.log("yoooo", mb);

  $scope.subreddit = function() {
      subreddit = 'starcraft_strategy';
      if (gon.user) {
          ident_in_match = $scope.match.hasPlayers(gon.user.accounts);
          if (ident_in_match) {
              entity = $scope.match.entity(ident_in_match);
              if (entity != null) {
                return 'allthings' + entity.race_name;
              }
          }
      }
      return subreddit;
  }
  
  $scope.reddit = function($event) {
    $event.preventDefault()
    newloc = 'http://www.reddit.com/r/' + $scope.subreddit() + '/submit?title=Your%20Title%20Here&text=Hi%2c%20take%20a%20look%20at%20' + encodeURIComponent(window.location);
    window.open(newloc, '_blank');
  }

  $('.noarmy').hide();
  if ($window.gon.match.replays_count > 0 && (!mb || _.isUndefined(mb.armies_by_frame))) {
      $('.top').hide();
      $('.noarmy').show();
  }

  matchhash = $.extend($window.gon.match, mb);
//  console.log("gon fun", mb, matchhash);
  $scope.match = new Match(matchhash);
  $scope.match.__init();

  $scope.selected = 'overview';
  window.__match = $scope.match;

  // bound and updated by armychart for hover selection
  $scope.current_frame = 0;
  $scope.current_framee = 0;
//    console.log("matchscope", $scope);
  $scope.$watch('current_frame', function(v) {
    if(v) { 
      $scope.current_time = Sc2.frameToTime(v); 
      $scope.time_has_been_set = true
    }
  });

  // Condensing the match view by default, except for 1v1
  $scope.condensed = ($scope.match.game_type != '1v1');

//  $scope.toggleCondensedCalled = _.once(function() { mixpanel.track("match toggleCondensed"); });
  $scope.toggleCondensed = function() {
//    $scope.toggleCondensedCalled();
    $scope.condensed = !$scope.condensed;
  }

  $scope.delete = function() {
    var r = confirm("Are you sure you want to delete this match?");
    if (r == true) {
        $.ajax({
          url: '/matches/' + $scope.match.id + '/userdelete',
          type: 'POST',
          success: function() {
              alert("Match deleted.");
              $('.deletelink').text("deleted").off("click");
              history.back();
          },
          error: function() {
              alert("Sorry, this match could not be deleted for some reason.  Please contact hello@ggtracker.com and they'll take care of it for you.");
          }
        });
    }
  }

  $scope.spoiled = false;
  $scope.spoil = function() {
    $scope.spoiled = !$scope.spoiled;
  }
}]);

