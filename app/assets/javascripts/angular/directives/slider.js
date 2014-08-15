// There are voices in my head I'm going overboard with directives, but..
// it's just so effective and cool and I simply can not see a downside.
// What else would we do? Stick $('.slider').slider() somewhere? Have
// 10 different handles to initiate different slider options, like it's 2009?
// Damn, I love angular.

gg.directive('slider', function() {
  return {
    restrict: 'C',
    scope: {
      // I really haven't made up my mind about naming in angular yet.
      'valueBind': '=',
      // Normally, I would not want to bind max, but I also don't want some
      // complicated construct that watches for it elsewhere now..
      'maxBind': '='
    },
    template: '<div class="ui-slider"></div>',

    link: function(scope, element, attrs) {
      slider = element.find('.ui-slider');
      slider.slider({
        min: 1,
        max: attrs.max || 100,
        animate: true,
        slide: function(e, ui) {
          // Note: remember to $scope.$apply, or $digest in jQuery callbacks
          // (anywhere outside of angulars own $digest cycles)
          scope.$apply(function() { scope.valueBind = ui.value });
        }
      });

      scope.$watch('maxBind', function(v) {
        if(v)
          slider.slider('option', 'max', v);
      });

      scope.$watch('valueBind', function(v) {
        if(v)
          slider.slider('option', 'value', v);
      });
    }
  }
});

