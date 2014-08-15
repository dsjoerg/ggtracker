// from http://jsfiddle.net/xzachtli/K4Kx8/1/
// which was found from https://github.com/angular/angular.js/wiki/JSFiddle-Examples

gg.directive('fadey', function() {
    return {
        restrict: 'A',
        link: function(scope, elm, attrs) {
            var duration = parseInt(attrs.fadey);
            if (isNaN(duration)) {
                duration = 500;
            }
            elm = jQuery(elm);
            // one of these two lines causes a massive browser brain freeze when uploading
            // ~700 replays at once.  forget it!
            //
            //            elm.hide();
            //            elm.fadeIn(duration)

            scope.destroy = function(complete) {
                elm.fadeOut(duration, function() {
                    if (complete) {
                        complete.apply(scope);
                    }
                });
            };

            scope.$watch('replay.state', function(state) {
                    //              console.log("watcher", state, scope);
              if (isFinalState(state)) {
                scope.clearItem(scope.replay)
              }
            });
        }
    };
});
