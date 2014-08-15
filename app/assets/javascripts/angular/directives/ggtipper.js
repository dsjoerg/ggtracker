
gg.directive('ggtipper', function() {
    return {
        restrict: 'C',
        scope: {},
        link: function(scope, elm, attrs) {

            //            console.log("yo");

          if($(elm).data('gravity')) {
            gravity = $(elm).data('gravity');
          } else {
            gravity = $.fn.tipsy.autoBounds(10, 'sw');
          }

          // scope.showItCalled = _.once(function() { mixpanel.track("tooltip " + $(elm).next().children().first().attr('id')); });
          scope.showIt = function() {
            // scope.showItCalled();
            $(elm).tipsy("show");
            scope.shown = true;
          }

          if ($(elm).hasClass("clicky")) {
              //              console.log("whoa");
            trigger = "manual";
            scope.toggle = function() {
                //                console.log("no!");
                if (scope.shown) {
                  $(elm).tipsy("hide");
                  delete scope.shown;
                } else {
                  scope.showIt();
                }
            };
          } else {
            trigger = "hover";
          }

          $(elm).tipsy({
            className: 'htmltip',
            title: function(){
              if($(elm).data('content')) { return $(elm).data('content'); }
              return $(elm).next().html();
            },
            html: true,
            opacity: 1.0,
            offset: 10,
            gravity: gravity,
            trigger: trigger
          });

          // TODO track hovers.  Hack tipsy?
          // Or use a different class?
          // Or use mixpanel.track_links https://mixpanel.com/docs/integration-libraries/javascript

          // TODO how to make it so that clicking anywhere in the
          // browser window makes the tooltip go away?  maybe i should
          // just be using bootstrap popover instead anyway.
          //
          // or copy their approach. it involves detailed
          // understanding of jQuery event propagation.
          //
          // https://github.com/twitter/bootstrap/blob/master/js/bootstrap-dropdown.js
          //
          //          $('html').on('click.ggtipper', function () {
          //                  console.log("click in the tipper!");
          //                  scope.hide();
          //              });
          //
          //          scope.hide = function() {
          //              console.log("hiding!");
          //                  $(elm).tipsy("hide");
          //                  delete scope.shown;
          //          }
          //
        }
    };
});
