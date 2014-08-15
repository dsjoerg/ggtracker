
gg.directive('ggtipper2', function() {
    return {
        restrict: 'C',
        link: function(scope, elm, attrs) {
          // hack for wcs
          if (window.dontggtipper) {
              return;
          }

          if($(elm).data('gravity')) {
            gravity = $(elm).data('gravity');
          } else {
            gravity = $.fn.tipsy.autoBounds(10, 'sw');
          }

          //          console.log("dada", $(elm), $(elm).data('content'));
          //            title: $(elm).data('content'),
          
          $(elm).tipsy({
            className: 'htmltip',
            html: true,
            opacity: 1.0,
            offset: 10,
            gravity: gravity
          });

        }
    };
});
