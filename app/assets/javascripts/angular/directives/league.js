gg.directive('league', function() {
  return {
    restrict: 'E',
    template: '<span class="league-icon">{{ league_name }}</span>',
    replace: true,
    scope: {
      league: '@',
      rank: '@'
    },
    link: function(scope, element, attrs) {
      _leagues = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'korean']

      // attrs.size can still be keywords "normal" (64), "small" (32) and "tiny" (16)
      switch(attrs.size) {
        case 'normal':
          attrs.size = 48;
          break;
        case 'small':
          attrs.size = 32;
          break;
        case 'tiny':
          attrs.size = 16;
          break;
      }

      scope.league_data = {
        name: '',
        flair: ''
      };

      // I know, I know.. $watch, $observe.. it's confusing to a degree.
      // It's all in the name of science and performance!
      // http://docs.angularjs.org/guide/directive#Attributes
      // One pitfall here: if you console.log() attrs on execution, it'll
      // display the value by the time you managed to expand it - it's not
      // there on execution though. Always observe.

      scope.$watch('league_data', function(value) {
        if (value) {
          size = typeof attrs.size != 'undefined' ? '-' + attrs.size : '-32';
          element[0].className = element[0].className.replace(/sc2.*?\b/g, '');
          name = scope.league_data['name'];
          flair = scope.league_data['flair'];
          element.addClass('sc2-' + name + flair + '-mpq' + size);
        }
      }, true);

      scope.rankToFlair = function(rank) {
        flair = '';
        // rank flairs are actually at 8, 25 and 50.  sprites are misnamed but whatev.
        if(parseInt(rank) <= 8) { flair = '-top16'; }
        else if(parseInt(rank) <= 25) { flair = '-top50'; }
        else if(parseInt(rank) <= 50) { flair = '-top100'; }
        return flair;
      }

      // range is a number between 0 and 100
      scope.rangeToFlair = function(range) {
        flair = '';
        // rank flairs are actually at 8, 25 and 50.  sprites are misnamed but whatev.
        if(parseInt(range) <= 25) { flair = '-top16'; }
        else if(parseInt(range) <= 50) { flair = '-top50'; }
        else if(parseInt(range) <= 75) { flair = '-top100'; }
        return flair;
      }

      attrs.$observe('league', function(value) {
        // value is a string, sometimes length 0
        if (value && value.length > 0) {
          intleague = parseInt(Math.min(Math.round(value), 6.0))
          league_name = _leagues[intleague];
          
          scope.league_data['name'] = league_name;
          if (!scope.league_data['flair']) {
            // 1.51 is low gold, almost silver. no little flair for you.
            // 2.0 is gold average. a little flair for you.
            // 2.49 is halfway between gold and plat. max flair for you!
            // so add 0.5, take the mod, and then scale it up.
            scaledvalue = 100 - (Math.round((parseFloat(value) + 0.5) * 100.0) % 100);
            if (value > 6.25) {
              scaledvalue = 0;
            }

            // now scaledvalue is 0 for the best in their league and 100 for the worst
            scope.league_data['flair'] = scope.rangeToFlair(scaledvalue);
          }
        }
      });

      attrs.$observe('rank', function(value) {
        if (value && value.length > 0) {
          scope.league_data['flair'] = scope.rankToFlair(value);
        }
      });
    }
  }
});

