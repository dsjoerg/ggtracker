// Defining all filters here, use in extrapolation:
// {{ variable | filter }}

// Using jquery.timeago.js
// http://timeago.yarp.com/
gg.filter('timeago', function() {
  return function(object) {
    // nobody cares about "about".
    $.extend($.timeago.settings.strings, {
      seconds: 'seconds',
      minute: 'a minute',
      hour: 'an hour',
      hours: '%d hours',
      month: 'a month',
      year: 'a year'
    });
    return $.timeago(object);
  };
});

gg.filter('minutes_seconds', function() {
  return function(total_seconds) {
      if (total_seconds == null) {
          return "-";
      }
      var minutes = "" + Math.floor(total_seconds / 60);
      var seconds = "" + Math.floor(total_seconds % 60);
      var pad = "00";
      seconds = pad.substring(0, 2 - seconds.length) + seconds;
      return minutes + ":" + seconds;
  };
})
