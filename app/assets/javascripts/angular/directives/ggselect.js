// A generic version of raceselect
// TODO: refactor raceselect to work with this instead.

gg.directive('ggselect', ['Map', function(Map) {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      selected: '=name'
    },
    link: function(scope, element, attrs) {
      scope.values = {};

      classes = _.uniq(attrs.class.split(' ').concat('ggselect')).join(' ');
      $(element).attr('class', classes);

      // We allow values to be either a simple comma separated list of values
      // or of "key:value" pairs. In case we want to display something other
      // than the actual value.
      _values = attrs.values.split(',');
      for(var __ in _values) {
        _value = _values[__];

        if(_value.indexOf(':') != -1) {
          vk = _values[__].split(':');
          scope.values[vk[0]] = vk[1];
        } else {
          scope.values[_value] = _value;
        }
      }

      scope.select = function(key) {
        if(scope.selected == scope.values[key]) { scope.selected = null; }
        else { scope.selected = scope.values[key]; }
      }
    },

    // see mapselect directive
    template:
      '<ul ng-model="selected">' +
        '<li ng-click="select(name)" ng-repeat="(name, value) in values" ng-class="{selected: selected == value}"><span class="name">{{ name }}</span></li>' +
      '</ul>'
  }
}]);