gg.directive('raceselect', ['Map', function(Map) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
          selected: '=name',
          versus: '@',
          playername: '=',
          winner: '=',
          dowinner: '=',
    },
    link: function(scope, element, attrs) {
      scope.races = ['terran', 'protoss', 'zerg'];

      // Helper for selection because '', null, etc are being parseInt'ed or
      // treated as 0 for another reason in the ng-selected filter below.
      scope._selected = function(index) {
        if(scope.selected && scope.selected != '') { 
          return (scope.selected == index); 
        }
        return false;
      }

      scope.capRaceName = function(race) {
        return race.charAt(0).toUpperCase() + race.slice(1);
      }

      scope.helpplz = function(race) {
          if (_.isUndefined(scope.playername)) {
              return race;
              // scope.capRaceName(race);
          } else {
              return "Show only the matches where " +
                     scope.playername + " " + scope.versus + " " +
                     scope.capRaceName(race) + ".";
          }
      }

      scope.select = function(index) {
        if(scope.selected == scope.races[index]) { scope.selected = null; }
        else { scope.selected = scope.races[index]; }

        // after an agonizing trip through angular hell, and learning more about how
        // url_filter works, realized that the only reliable way to change things that
        // are part of the URL is atomically, all at once, since there are bidirectional (circular!)
        // dependencies between the URL string and the filter widgets that influence it.
        //
        // the following line used to be in unitselect -- it would
        // trigger upon detecting a change to the selected race.  except it didnt quite work.
        //
      }
        
      scope.toggleWinner = function() {
          scope.winner = !scope.winner;
          if (!scope.winner) {
            delete scope.winner;
          }
      }
    },

    // see mapselect directive
    template:
      '<span style="text-align:center; display:inline-block; max-width:120px">'+
      '<ul class="raceselect" ng-model="selected">' +
        '<li ng-click="select($index)" ng-repeat="race in races" ng-class="{selected: _selected(race)}">' +
          '<a href class="ggtipper2" title="{{ helpplz(race) }}" data-gravity="n">' +
            '<div class="icon icon-{{ race }}"></div><span class="name">{{ race }}</span>' +
          '</a>' +
        '</li>' +
      '</ul>' +
          '<span ng-show="dowinner" ng-click="toggleWinner()" ng-class="{selected: winner}" class="below">' +
          'WINNER</span></span>'
  }
}]);
