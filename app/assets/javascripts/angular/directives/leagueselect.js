// TODO: make ggselect take over this functionality too.
gg.directive('leagueselect', ['Map', function(Map) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      selected: '=name'
    },
    link: function(scope, element, attrs) {
      scope.values = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster'];

      // Helper for selection because '', null, etc are being parseInt'ed or
      // treated as 0 for another reason in the ng-selected filter below.
      scope._selected = function(index) {
        if(!urlFilter.isEmpty(scope.selected)) { 
          return (scope.selected == index); 
        }
        return false;
      }

      // scope.selectCalled = _.once(function() { mixpanel.track("leagueselect select"); });
      scope.select = function(index) {
        // scope.selectCalled();
        if(scope._selected(index)) { scope.selected = null; }
        else { scope.selected = index; }
      }
    },

    // see mapselect directive
    // template:
    //   '<select ng-model="selected">' +
    //     '<option value="">all leagues</option>' +
    //     '<option ng-repeat="league in leagues" value="{{ $index }}" ng-selected="_selected($index)">{{ league }}</option>' +
    //   '</select>'

    // TODO: below still contains the raw white icon name, see select.css $leagues
    template:
      '<ul class="leagueselect" ng-model="selected">' +
        '<li ng-click="select($index)" ng-repeat="value in values" ng-class="{selected: _selected($index)}">' +
          '<a href class="ggtipper2" title="{{ value }}" data-gravity="n">' +
            '<div class="icon league league-{{ value }}"></div><span class="name">{{ value }}</span>' +
          '</a>' +
        '</li>' +
      '</ul>'
  }
}]);
