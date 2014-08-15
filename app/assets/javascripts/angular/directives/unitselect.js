gg.directive('unitselect', [function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,

    scope: {
      selected: '=name',
      race: '=race'
    },
    link: function(scope, element, attrs) {

        scope.$watch('units', function(units) {
          if (units.length > 0) {
            scope.select = $(element).select2({
              placeholder: 'unit',
              allowClear: true,
              containerCssClass: 's2units'
            });
        
            scope.$watch('selected', function(v) {
              if(v) {
//                console.log("Hi DJ!", $(element).children('.s2units'));
                $(element).parent().children('.s2units').select2('val', scope.selected);
              }
            });
          }
        });

        scope.$watch('race', function(race) {
//            console.log("race!", race, scope.race);
            if (_.isUndefined(race) || _.isNull(race) || race == '') {
              scope.units = _.keys(Sc2.armyUnits['HotS']);
            } else {
              raceunits = _.filter(_.pairs(Sc2.armyUnits['HotS']), function(unit) { return unit[1][4] == race });
              scope.units = _.map(raceunits, function(unit) { return unit[0] });
          }
        });


        scope.units = _.keys(Sc2.armyUnits['HotS']);
    },

    template:
      '<select ng-model="selected">' +
        '<option></option>' +
        '<option ng-repeat="unit in units" value="{{ unit }}" ng-selected="(selected == unit)">{{ unit }}</option>' +
      '</select>'
  }
}]);
