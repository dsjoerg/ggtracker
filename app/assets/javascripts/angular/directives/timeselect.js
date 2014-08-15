gg.directive('timeselect', [function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,

    scope: {
      selected: '=name'
    },
    link: function(scope, element, attrs) {

       scope.$watch('times', function(times) {
//         console.log("in times watch", times);
         if (times.length > 0) {
           scope.select = $(element).select2({
             placeholder: 'at time        ',
             allowClear: true,
             containerCssClass: 's2times'
           });

           scope.$watch('selected', function(v) {
             if(v) {
//               console.log("Hi DJJJ!", v, scope.selected, $(element), $(element).children('.s2times'));
               $(element).parent().children('.s2times').select2('val', scope.selected);
             }
           });
         }
       });

       scope.times = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25, 30, 35, 40];
    },

    template:
      '<select ng-model="selected">' +
        '<option></option>' +
        '<option ng-repeat="time in times" value="{{ time }}" ng-selected="(selected == time)">@ {{ time }}:00</option>' +
      '</select>'
  }
}]);
