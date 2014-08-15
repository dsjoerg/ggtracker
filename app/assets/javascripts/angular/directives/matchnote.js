gg.directive('matchnote', ['Matchnote', function(Matchnote) {
  return {
    restrict: 'E',
    replace: true,
    template: '<div class="matchnote"><span class="title">private match notes</span><textarea placeholder="You can keep private match notes here, for example: why did you win or lose?  What to improve on for next time?" rows="4" cols="50" ng-model="matchnote.note"></textarea><br><a href class="action button" ng-click="save()">save</a><span class="status">saved</span></div>',

    link: function(scope, element, attrs) {
      $('span.status').css('opacity', '0.0');
      
      scope.matchnote = Matchnote.get({match_id: scope.match.id});

      scope.save = function() {
        scope.matchnote.$save({match_id: scope.match.id}, function() {
            $('span.status').animate({opacity: '1.0'}, 250);
            _.delay(function() {
                  $('span.status').animate({opacity: '0.0'}, 250);
                },
              3000);
        });
        return false;
      }
    }
  }
}]);
