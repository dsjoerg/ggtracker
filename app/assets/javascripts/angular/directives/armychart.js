gg.directive('armychart', ['$location', '$timeout', function($location, $timeout) {
  return {
    restrict: 'E',
    template: JST['angular/templates/armychart'](),
    replace: true,
    scope: {
      data: '=',
      initialFrame: '=',
      chart: '=',
      armies: '=',
      width: '@',
      height: '@',
      timebarwidth: '@',
      
      frame: '=',
      framee: '=',
      match: '=',
      currentTime: '=',
      
      condensed: '='
    },
    link: function(scope, element, attrs) {

      // we use mouse movements on the chart in order to control the
      // matchmap.  unfortunately highcharts (the army chart itself)
      // does not give us the mouse x-coordinate.  more unfortunately,
      // there is no clear documented way to translate from the
      // coordinate system of the canvas element into the coordinate
      // system of the chart.
      //
      // So we do the following nonsense.  Every mouse movement gives
      // us both a mousemove event AND a setFrame.  So we keep track
      // of the _range_ of X values we've seen via both methods.
      //
      // By comparing those two ranges, we know how to translate a
      // mouse coordinate into a frame value.
      //
      // The estimated frame value goes into scope.framee.

      scope.$watch('height', function(v) {
          // console.log("height", scope.height);
          scope.timebarheight = scope.height - 39;
      });

      scope.$watch('frame', function(v) {
          scope.timebarleft = Math.floor(39.0 + scope.frame * (838.0 / 28528.0));
      });


      element.find('.canvas').mousemove(function(e) {
//        console.log("mm", scope.minFrame, scope.maxFrame, scope.minMMX, scope.maxMMX);
        if (scope.frozen) return false;

        lastMMX = e.pageX - $(this).position().left;
        lastMMY = e.pageY - $(this).position().top;
        if (_.isUndefined(scope.minMMX) || lastMMX < scope.minMMX) {
            scope.minMMX = lastMMX;
        }
        if (_.isUndefined(scope.maxMMX) || lastMMX > scope.maxMMX) {
            scope.maxMMX = lastMMX;
        }
        if (!_.isUndefined(scope.minFrame) && scope.maxFrame && (scope.maxMMX > scope.minMMX)) {
          scope.$apply( function() {
//            console.log("hola");
            scope.framee = Math.floor(scope.minFrame + (lastMMX - scope.minMMX) * (scope.maxFrame - scope.minFrame) / (scope.maxMMX - scope.minMMX));
          });
        }
      });

      scope.setFrameCalled = _.once(function() {
        // mixpanel.track("armychart setFrame");

        // TODO next line is bad because it makes matchmap too
        // dependent on armychart. How to refactor?
        if (scope.match.camera) {
          $('div.matchmap_container').fadeIn(1000);
        }
      });

      scope.compute_yt_time = function(s2_time) {
        if (s2_time < 329) {
          return Math.max(0, 417 + (s2_time - 20.0) / S2_TIMESCALE);
        }
        return Math.min(1884.786, 851.136 + (s2_time - 334.0) / S2_TIMESCALE);
      }

      scope.setFrame = function(frame, shouldFreeze) {
        scope.setFrameCalled();

        if (scope.timebarwidth) return false;
        if (scope.frozen) return false;
        frame = typeof frame == 'undefined' ? this.x : frame;

        // console.log("setFrame", scope.minFrame, scope.maxFrame, scope.minMMX, scope.maxMMX);
        if (_.isUndefined(scope.minFrame) || frame < scope.minFrame) {
            scope.minFrame = frame;
        }
        if (_.isUndefined(scope.maxFrame) || frame > scope.maxFrame) {
            scope.maxFrame = frame;
        }

        // update the time/frame counter always to give the feeling of
        // scrubbing.  individual directives may throttle as necessary.
        scope.frame = frame;
        //  console.log("setting frame", frame);
        scope.$apply();

        return false;
      }

      // TODO dont use evil globals, refactor the armyfun stuff
      // to use a scope.
      scope.frozen = false;

      scope.freeze = function(frame, updateURL) {
        switch(typeof frame) {
          case "number": frame = frame; break;
          case "string": frame = Sc2.timeToFrame(frame); break;
          default: return false;
        }

        // unfreeze first, to remove the line
        if(scope.frozen) {
          scope.unfreeze(null, false);
        }

        // updateURL defaults to true
        updateURL = typeof updateURL == 'undefined' ? true : updateURL;

        scope.frozen = true;
        scope.frame = frame;
        scope.chart.xAxis[0].addPlotLine({
          id: 'freeze', color: '#F00', width: 2, value: frame
        });

        if(updateURL) { 
          // frame or time in the URL? time is less accurate but looks cooler
          // and is easily editable manually..
          // $location.hash(Sc2.frameToTime(frame));
          // $location.search('time', Sc2.frameToTime(frame));
          // scope.$apply();
        }
      }

      scope.unfreeze = function(e, updateURL) {
        // updateURL defaults to true
        updateURL = typeof updateURL == 'undefined' ? true : updateURL;

        scope.frozen = false;
        scope.frame = frame;
        scope.chart.xAxis[0].removePlotLine('freeze');
        
        if(updateURL) { 
          // $location.search('time', null);
          // $location.hash(null);
          // scope.$apply();
        }
      }

      // The argument can also be a frame!
      scope.toggle_freeze = function(e) {
        if(typeof e == "number") {
          frame = e;
        } else if(typeof e == "string") {
          frame = Sc2.timeToFrame(e);
        } else {
          // If clicked on the background, we have xAxis on the event, if clicked
          // on a series, we'll have the point.
          frame = e.xAxis ? e.xAxis[0].value : e.point.x;
        }

        if (window.theGGYTplayer) {
            yt_time = Math.floor(scope.compute_yt_time(frame / 16.0));
            window.theGGYTplayer.seekTo(yt_time, true);
            return;
        }

        if(scope.frozen) { 
          scope.unfreeze(frame); 
        } else { 
          scope.freeze(frame); 
        }
      }

      options = {
        chart: {
          defaultSeriesType: "line",
          renderTo: element.find('.canvas')[0],
          backgroundColor: null,
          zoomType: "x",
          resetZoomButton: {
            theme: {
              fill: '#ffdddd'
            },
            position: {
              // align: 'right', // by default
              verticalAlign: 'bottom',
              // x: 0,
              y: -15
            }
          },
          events: {
            click: scope.toggle_freeze,
          }
        },
        title: {"text":""},
        legend: {"layout":"vertical","style":{},"enabled":false,"itemStyle":{"fontFamily":"'Lato', verdana, arial, helvetica, sans-serif"}},
        xAxis: {
          labels: {
            formatter: function() { return Sc2.frameToTime(this.value); }
          },
          "min":0,"labels":{"enabled":false,"style":{"fontFamily":"'Lato', verdana, arial, helvetica, sans-serif"}},
          plotBands: []
        },
        yAxis: [
          {
            //                          tickInterval: 1000,
            //            minorTickInterval: 1000,
            title: { text: null },
            labels: {
                //                              step: 2,
              style: {"fontFamily":"'Lato', verdana, arial, helvetica, sans-serif"}
            },
            min: 0,
            gridLineWidth: 0,
            endOnTick: false,
            startOnTick: false,
            minorGridLineColor:"#ccc",
            minorGridLineDashStyle:"Dot",
            minorGridLineWidth:1,
            minorTickInterval:"auto"
          },
        ],
        tooltip:  {
          enabled: true,
          shared: true,
          formatter: scope.setFrame,
          "useHTML":true,"style":{"fontFamily":"'Lato', verdana, arial, helvetica, sans-serif"},"crosshairs":[true,false]
        },
        credits: {"enabled":false},
        plotOptions: {
          areaspline: {},

          series: {events: {mouseOver: function() {}}},

          line: {
            lineWidth: 2,
            shadow: false,

            marker: {
              enabled: false
            },

            states: {
              hover: {enabled: false}
            },
            
            events: {
              click: scope.toggle_freeze
            }
          },
        },

        series: scope.match.series.army.combined,
        subtitle: {},
      };


      eTipShow = function(event, engagement) {
          offsetX = 0
          if ($('#etip').length == 0) {
//              console.log("making a new one");
              timespan = format_minutes(engagement[0] / 960.0) + ' - ' + format_minutes(engagement[1] / 960.0);
              $('div#match').append('<div id="etip" style="position: absolute; background-color: rgba(255,255,255)"></div>');

              MAXWIDTH = 100.0;

              nameToShow = {}
              nameToShow[1] = "Team 1";
              nameToShow[2] = "Team 2";
              colorToShow = {}
              colorToShow[1] = 'red';
              colorToShow[2] = 'blue';
              if (_.keys(scope.match.entities).length == 2) {
                  nameToShow[1] = scope.match.teams[1].entities[0].identity.name;
                  nameToShow[2] = scope.match.teams[2].entities[0].identity.name;
                  colorToShow[1] = '#' + scope.match.teams[1].entities[0].color;
                  colorToShow[2] = '#' + scope.match.teams[2].entities[0].color;
              }
              width1 = MAXWIDTH;
              width2 = MAXWIDTH;

              loss_one = engagement[3] + engagement[4]
              loss_two = engagement[6] + engagement[7]

              if (loss_one > loss_two) {
                  width2 = MAXWIDTH * loss_two / loss_one;
              } else {
                  width1 = MAXWIDTH * loss_one / loss_two;
              }
              
              $('#etip').append('<div class="rltitle"><span>Resources Lost</span></div>')
              $('#etip').append('<div class="firstlossrow"><div class="colorsquare" style="background-color: ' + colorToShow[1] + '">&nbsp;</div><div id="lost1" class="value">' + loss_one + '</div></div>')
              $('#etip').append('<div><div class="colorsquare" style="background-color: ' + colorToShow[2] + '">&nbsp;</div><div id="lost2" class="value">' + loss_two + '</div></div>')

              $('#lost1').css('min-width', width1);
              $('#lost2').css('min-width', width2);

              parentPos = $('#etip').parent().offset();
              targetPosX = event.pageX - (($('#etip').width() / 2) - offsetX);
              offsetFromParentX = targetPosX - parentPos.left;
              $('#etip')
                  .css('left', offsetFromParentX + 'px')
                  .fadeIn('fast');
          } else {
              parentPos = $('#etip').parent().offset();
              targetPosX = event.pageX - (($('#etip').width() / 2) - offsetX);
              offsetFromParentX = targetPosX - parentPos.left;
              $('#etip')
                  .css('left', offsetFromParentX + 'px');
          }
      };
        
      eTipHide = function(event) {
//              console.log("hiding that shit");
          $('#etip').remove();
      };

      _.each(scope.match.engagements, function(engagement) {
          options.xAxis.plotBands.push({
              color: 'rgba(0, 0, 0, 0.0)',
              from: engagement[0],
              to: engagement[1],
              events: {
                  mouseover: function(e) {
                      eTipShow(e, engagement);
                  },
                  mousemove: function(e) {
                      eTipShow(e, engagement);
                  },
                  mouseout:  function(e) {
                      eTipHide(e, engagement);
                  },
              },
              zIndex: 10
          });

//          totallost = engagement[3] + engagement[4] + engagement[6] + engagement[7];
//          teamoneratio = (engagement[3] + engagement[4]) / totallost;
//          red = Math.floor(teamoneratio * 250.0 + 25.0);
//          blue = Math.floor((1.0 - teamoneratio) * 250.0 + 25.0);
//          console.log("rgb", red, blue, engagement);
          red = 150;
          blue = 50;

          options.xAxis.plotBands.push({
              color: 'rgba(' + red + ', 50, ' + blue + ', 0.1)',
              from: engagement[0],
              to: engagement[1],
          });
      });

      scope.chart = new Highcharts.Chart(options);
      window.__chart = scope.chart;

      // Then watch the bound condensed value and toggle
      scope.$watch('condensed', function(nv, ov) {
        if(nv != undefined) {
          // Thought about giving this a timeout to keep animations fluid
          // but we should probably just optimize it in other ways.

          // And even with creating a new chart, we're operating directly on
          // the chart and thus should disable redrawing.
          _redraw = scope.chart.redraw;
          scope.chart.redraw = function(){};

          // $timeout.cancel(scope.condense_timer);
          // scope.condense_timer = $timeout(function() {
            if(nv == true) {
              for(var __ in scope.chart.options.series) {
                scope.chart.options.series[__].visible = scope.chart.options.series[__].is_team == true ? true : false;
              }
            } else {
              for(var __ in scope.chart.options.series) {
                scope.chart.options.series[__].visible = scope.chart.options.series[__].is_team == false ? true : false;
              }
            }

            // TODO: don't animate? only animate the first time?
            scope.chart.options.plotOptions.line.animation = false;

            window.__chart = scope.chart = new Highcharts.Chart(scope.chart.options);

            if(scope.frozen)
              scope.freeze(frame);
          // }, 300);
        }
      });

      scope.frame = scope.initialFrame;

      // If # is present in the URI, let's freeze on it.
      // And tell freeze to not update the URL of course.
      scope.$watch(function(){return $location.hash()}, function(v) {
        if(v) { 
          // make it a number if it's a frame
          if(parseInt(v).toString() == v) { v = parseInt(v); }
          scope.freeze(v, false);
        }
      });

      scope.chart.yAxis[0].setExtremes(0, scope.chart.yAxis[0].getExtremes().dataMax);

      // Hovering entities to highlight everything else belonging to that entity
      // Note: this is fickle. There is no way to do this correctly right now.
      // (as in without the timeout) and since this link function (armychart)
      // is likely to take the longest, we stick it here.
      // See https://groups.google.com/forum/?fromgroups=#!topic/angular/SCc45uVhTt8
      // TODO: could be made into a nice little grp-* grouping thing, could
      // be run after rootScope's digest cycle too then.
      setTimeout(function() {
          $('[class*=grp-entity]').mouseover(function() {
            _entity = $(this).attr('class').match(/entity(\d+)/)[1];
            $('[class*=grp-entity]').removeClass('highlight');
            $('.grp-entity' + _entity).addClass('highlight');
          });

          $('[class*=grp-entity]').mouseout(function() {
            $('[class*=grp-entity]').removeClass('highlight');
          });
      }, 500);
    }
  }
}]);
