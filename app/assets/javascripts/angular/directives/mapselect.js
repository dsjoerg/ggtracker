gg.directive('mapselect', ['Map', function(Map) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      selected: '=name'
    },
    link: function(scope, element, attrs) {

      if (_.isUndefined(scope.$parent.identity)) {
        scope.maps = Map.all();
      } else {
        scope.maps = Map.all({identity_id: scope.$parent.identity.id});
      }

      // Aside from the scope apply this works, using jquery autocomplete
      // instead of any of the fancy select2/chosen out there. If we want more
      // control over behavior, we might want to consider doing something like
      // it instead..
      //
      // scope.$watch('maps', function(value) {
      //   if(value) {
      //     source = [];
      //     for(var __ in scope.maps) {
      //       map = scope.maps[__];
      //       source.push({
      //         label: map.name,
      //         value: map.id
      //       });
      //     }
      //   
      //     $(element).autocomplete({
      //       source: source,
      //       select: function(e, ui) {
      //         console.log('select', e, ui);
      //         scope.selected = ui.item.value;
      //         console.log(scope);
      //         scope.$apply();
      //       }
      //     });
      //   }
      // }, true);

      scope.$watch('maps', function(maps) {
        if(maps.length > 0) {
          // And for some reason, select2 "just works", out of the box. So screw
          // all the other efforts for now.
          scope.select = $(element).select2({
            placeholder: 'all maps',
            allowClear: true,

            // The subject of dom manipulation with angular is very deep, so I'll
            // just do this HAX for now. Problem is: select2() will modify the DOM
            // but the element will not update, of course. So we can't deal with
            // element directly anymore and now use a simple $('.s2maps') instead.
            containerCssClass: 's2maps'
          });

          scope.$watch('selected', function(v) {
            if(v) {
                //                console.log('wtf', v, scope.selected);
              $('.s2maps').select2('val', scope.selected);
            }
          });
        }
      }, true); // AAAAAAAHHHHHH@§%#
    },

    // TODO: I'd rather use ng-options and all that jazz. But there were..
    // complications :) (related to chosen and select2)
    template:
      '<select ng-model="selected">' +
        '<option></option>' +
        '<option ng-repeat="map in maps" value="{{ map.name }}" ng-selected="(selected == map.name)">{{ map.name }}</option>' +
      '</select>'

    // template: '<input type="text"/>'
  }
}]);