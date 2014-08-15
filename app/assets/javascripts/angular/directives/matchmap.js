gg.directive('matchmap', [function() {
  return {
    restrict: 'E',
    scope: {
      match: '=',
      minimapurl: '@',
      classes: '@',
      framee: '='
    },
    replace: true,
    transclude: true,
    template: '<div class="matchmap_container"><canvas class="mmcanvas"></canvas><img class="matchmap {{ classes }}"></img></div>',

    link: function(scope, element, attrs) {
      // console.log("matchmap link");

      scope.canvas = $('canvas.mmcanvas')[0]
      scope.canvas.width = 300;
      scope.canvas.height = 100;
      scope.context = scope.canvas.getContext('2d');
      scope.camWidth = 25 * scope.match.map.image_scale;
      scope.camHeight = 15 * scope.match.map.image_scale;

      strengthToPixels = function(str) {
        if (str < 100)
            return 3;
        if (str < 500)
            return 5;
        if (str < 1500)
            return 7;
        if (str < 3000)
            return 9;
        if (str < 6000)
            return 11;
        return 16;
      }

      updateCameras = function(v) {
//        console.log("uC", v);
        $('img.matchmap').attr('src', scope.minimapurl);

        scope.context.clearRect(0, 0, scope.canvas.width, scope.canvas.height);

        scope.context.lineWidth = 2;


        nowIndex = Math.floor(999.0 * v / (scope.match.duration_seconds * 16));
        if (!scope.match.camera) return;
        cameraInfo = scope.match.camera[0];
        if (scope.match.locations)
            nowlocs = scope.match.locations[nowIndex];
        else if (scope.match.locationdiffs)
            nowlocs = scope.match.full_locations(nowIndex);
        else
            nowlocs = undefined;

        // two passes.  in blackmode we draw black rectangles, offset by -1,-1
        // then in normal mode, we draw color-filled rectangles for army locations,
        // and unfilled rectangles for the cameras.
        _.each(["blackmode", "normal"], function(drawmode) {

          //console.log("nowlocs", nowlocs, nowIndex);
          _.each(scope.match.entities, function(entity) {
            playername = entity.identity.name;
            if (playername in cameraInfo[0]) {
              camRectX = cameraInfo[0][playername][nowIndex];
              camRectY = cameraInfo[1][playername][nowIndex];
            } else if (entity.identity.id in cameraInfo[0]) {
              camRectX = cameraInfo[0][entity.identity.id][nowIndex];
              camRectY = cameraInfo[1][entity.identity.id][nowIndex];
            }
            
            if (!_.isUndefined(nowlocs)) {
              scope.context.strokeStyle = "#000000";
              scope.context.fillStyle = "#" + entity.color;
              _.each(_.values(nowlocs[entity.identity.id]), function(pair) {
                  locBoxSize = strengthToPixels(pair[1]);
                  locAdjustW = (scope.camWidth - locBoxSize) / 2.0;
                  locAdjustH = (scope.camHeight - locBoxSize) / 2.0;
                  if (drawmode == "blackmode") {
                    scope.context.globalAlpha = 1.0;
                    scope.context.strokeRect(pair[0][0] + locAdjustW - 1, pair[0][1] + locAdjustH - 1, locBoxSize, locBoxSize);
                  } else {
                    scope.context.globalAlpha = 0.8;
                    scope.context.fillRect(pair[0][0] + locAdjustW, pair[0][1] + locAdjustH, locBoxSize, locBoxSize);
                  }
              });
            }

            if (drawmode != "blackmode") {
              scope.context.globalAlpha = 1.0;
              scope.context.strokeStyle = "#" + entity.color;
              scope.context.strokeRect(camRectX, camRectY, scope.camWidth, scope.camHeight);
            }
          });

          if (scope.match.deathlocations && drawmode != "blackmode") {
            prevlinewidth = scope.context.lineWidth;

            for (lookback=0; lookback<=5; lookback++) {
              _.each(scope.match.entities, function(entity) {

                scope.context.strokeStyle = "#" + entity.color;
                scope.context.globalAlpha = 0.5;
                scope.context.lineWidth = 2;

                lookbackTo = nowIndex - lookback;
                if (lookbackTo >= 0) {
                      deathlocs = scope.match.deathlocations[lookbackTo];

                      radius = 4 + lookback;
                      _.each(deathlocs[entity.identity.id], function(loc) {
//                          console.log("DRAWING DEATH at "+ lookbackTo +", (" + lookback + " ago) for " + entity.identity.id + " at " + loc[0] + "," + loc[1])
                          scope.context.beginPath();
                          locAdjustW = scope.camWidth / 2.0;
                          locAdjustH = scope.camHeight / 2.0;
                          scope.context.arc(loc[0] + locAdjustW, loc[1] + locAdjustH, radius, 0, Math.PI*2, true);
                          scope.context.stroke();
                      });
                }
              });
            }

            scope.context.lineWidth = prevlinewidth;
          }
        });
//        console.log("done");
      }

      scope.$watch('framee', _.throttle(updateCameras, 25));
    }
  }
}]);
