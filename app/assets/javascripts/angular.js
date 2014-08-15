
gg = angular.module('gg', ['ngResource', 'ngSanitize', 'ui']);

// Application States
// these indicate what state parts of the application is in.. not entirely sure
// about this approach, but I like it right now.
//
// Replay uploads set the processing state to true and a user object push from
// juggernaut with no processing replays resets it to false, for example.

window.gg.state = {
  // For IE compatibility, set this flag.
  //
  // Where is it used?
  // - all $resource classes request via JSONP instead of GET
  // - $locationProvider's html5Mode is disabled in iecompat mode
  //
  // TODO: stop using this, it's deprecated and going away in jquery 1.9
  // better to use feature detection, jQuery.support or modernizr or something.
  //
  iecompat: $.browser.msie && (parseInt($.browser.version, 10) <= 9) ? true : false,

  // we pass $http.pendingRequests in here in a watch below
  requests: 0,

  get processing() {
    return this._processing;
  },

  set processing(val) { 
    this._processing = val;
    this.apply();
  },

  get loading() {
    return this.requests > 0 ? true : false;
  },

  apply: function(digest) {
    rootScope = angular.element($('html')).scope();
    rootScope.gg = window.gg;
    if(digest === true) { rootScope.$digest(); }
  }
}

gg.config(['$locationProvider', '$routeProvider', '$httpProvider', 
  function($locationProvider, $routeProvider, $httpProvider) {

  // Use html5Mode, because we really don't want hashbanged urls if we can
  // help it. Yay future! (If we're in iecompat mode, obviously not.)
  // $locationProvider.html5Mode(!gg.state.iecompat).hashPrefix('');

  // Update: had to disable html5Mode entirely as it'll require some work
  // to make it work between IE and ..any good browser :(
  $locationProvider.html5Mode(false).hashPrefix('');

  // Note: this is not actually needed, as ESDB enforces JSON now and the
  // JSONP requests don't give a shit. But I'll leave it here for reference.
  $httpProvider.defaults.headers.get = {
    'Content-Type': "application/json;charset=utf-8"
  }

}]);

// Various configuration.
// Note: config() is a method provided by angular, so we can not use that name
// Some of these are being set delayed by gg.run when the app is initialized

window.gg.settings = {
  api_url: ''
}

gg.run(['$rootScope', '$window', '$http', function($rootScope, $window, $http) {
  $rootScope.user = $window.gg.user = ($window.gon != undefined) ? $window.gon.user : null;

  $rootScope.$watch('gg.state.processing', function(oldValue, newValue) {
    // Meh.
    if(oldValue != newValue) {
      $('#upload span.caption').effect('highlight', {}, 75);
    }
  });

  $rootScope.$watch(function(){ return $http.pendingRequests; }, function(v) {
    $window.gg.state.requests = $http.pendingRequests.length;
    $window.gg.state.apply(false);
  }, true);

  gg.settings.api_host = ($window.gon != undefined) ? $window.gon.global.api_host : '127.0.0.1:9292';
  
  // Finally, just default window.gon to an empty object if it's not defined.
  if(typeof $window.gon == 'undefined')
    $window.gon = {}

  // set gg.limits from the API server
  if (true) {
  $.ajax({
    url: 'http://' + gg.settings.api_host + '/limits',
          type: 'GET',
          success: function(data) {
              gg.limits = $.parseJSON(data);
          },
          error: function() {
              gg.limits = [1, 1, 9999];
          }
  });
}
}]);

// This takes the default _gaq from google analytics
// and gives helpers that register pageviews for our dynamic content
// (e.g. when a user changes filters on matches#index - that's a pageview.)
window.gg.analytics = {
  gaq: window._gaq,
    
  pageview: function() {
    window.gg.analytics.gaq.push(['_trackPageview']);
  }
}
