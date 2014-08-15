gg.directive('uploads', function() {
  return {
    restrict: 'E',
    template: JST['angular/templates/uploads'](),
    transclude: true,
    replace: true,
    controller: ['$scope', function($scope) {
      // see fadey.js
      $scope.clearItem = function(item) {
        var idx = $scope.creplays.indexOf(item);
        if (idx !== -1) {
          //injected into repeater scope by fadey directive
          this.destroy(function() {
            $scope.$apply( function() {
              $scope.creplays = _.without($scope.creplays, item);
            });
          });
        }
      };

      $scope.$watch('creplays.length == 0', function(allgone) {
              //        console.log("All gone", allgone, $scope);
        if (allgone) {
          thehref = urlAfterUploading($scope.allreplays);
          //                    console.log("would go to:", thehref);
          if (_.isNull(thehref)) {
              if (!_.isUndefined(gg.settings.user_id)) {
                document.location.href = '/replays';
              } else {
                document.location.href = '/replay_problems';
              }
          } else { 
            document.location.href = thehref;
          }
        }
      });
    }]
  }
});

