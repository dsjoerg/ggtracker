// To reproduce different breakage involving chosen, uncomment this directive
// and watch matches/index go to hell.
//
// TODO: when time permits, figure this out and implement chosen nicely.
// 
// gg.directive('chosen', function() {
//   return {
//     restrict: 'A',
//     link: function(scope, element) {
//       element.chosen({
//         search_contains: true,
//         allow_single_deselect: true
//       });
//     }
//   }
// });