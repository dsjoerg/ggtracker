// $filter is already used for other purposes
// http://docs.angularjs.org/api/ng.$filter
//
// $urlFilter is "middleware" between $location and bindings on directives'
// controllers. It's purpose is to provide an easy way to maintain a set of
// filter values (whatever they are used for) that "sync" back and forth
// between the URL ($location) and the scope of a controller for example.
//
// Empty keys are not given to the URL, but will still persist in the filter
// object.
//
// TODO: use http://api.jquery.com/category/deferred-object/ ?
// (I hesitate because I've never used it before and now is not the time for
// experimentation.)

// Quick note on why I'm using the array for dependency injection here:
// this is to circumvent the effects of obfuscation later on (and eventually,
// all of our injections need to look like this due to that.) FIXME TODO
gg.factory('$urlFilter', ['$rootScope', '$location', '$route', '$routeParams', 
  function($rootScope, $location, $route, $routeParams) {

  // Base Object
  urlFilter = {
    params: {},
    // A list of params that are "hidden" from the URL (are not passing through
    // cleanParams())
    hidden: [],
    _defaults: {},

    get defaults() {
      return this._defaults;
    },

    set defaults(_defaults) {
      // set system defaults, such as order
      if(_defaults.order == undefined) {
        _defaults.order = '';
      }

      if(_defaults.page == undefined) {
        _defaults.page = '';
      }

      return this._defaults = _defaults;
    },

    // onChange callback whenever params change.
    // Note: I'm pretty sure services are singletons, so if we want multiple
    // callbacks for multiple directives, we need to do some refactoring.
    onChange: function(){},

    _order: {},
    // Sets the order param for the given field, or if already set, reverses
    // it's direction. Defaults to ascending.
    //
    // When called with no arguments, it applies the currently set order to
    // params.
    //
    // Note: in esdb's order field, we prefix with _ for descending and - for
    // ascending order.
    order: function(field, event) {
      // Only change the order if field is supplied. We call order() on updates
      // to update the orderable element classes. See below.
      if(typeof field == 'string') {
        if(this._order && this._order.field == field) {
          this._order.direction = this._order.direction == '_' ? '-' : '_';
        } else {
          this._order = {
            field: field,
            direction: '_'
          }
        }

        if(this._order != {}) {
          this.params.order = this._order.direction + this._order.field;
          delete this.params.page;
        }
      // Otherwise - set _order
      } else {
        if(this.params.order) {
          this._order = {
            field: this.params.order.replace(/^[_\-]/g, ''),
            direction: this.params.order.replace(/^([_\-]).*/g, '$1')
          }
        }
      }

      // Apply classes for ordering
      // Remove asc/desc from all elements and re-apply it to elements with
      // data-order for our current ordering field.
      $('.orderable[data-order]').removeClass('asc');
      $('.orderable[data-order]').removeClass('desc');
      $('.orderable[data-order*=' + this._order.field + ']').addClass(this._order.direction == '_' ? 'desc' : 'asc');

      // Are we coming from a click? Mmm, irrelevant.
      // if(typeof event != 'undefined') {
      //   th = $(event.target);
      //   th.addClass(this._order.direction == '_' ? 'desc' : 'asc');
      //   th.removeClass(this._order.direction == '_' ? 'asc' : 'desc');
      // }
    }
  }
  
  // urlFilter.prototype = {
  // }

  // Set defaults for all expected params. If a key is missing from the URL
  // for example, it will default to this value.

  // Updates local values to target values, does not delete keys if they do not
  // exist in the target object.
  urlFilter.update = function(params, updateLocation) {
    // We currently discard existing values entirely here, assuming that a key
    // that is missing from the updated params should remove it here.
    // TODO: now, we can just take that one step further and remove defaults
    // as well, or don't do it.. because I might be missing something?
    $.extend(this.params, this.defaults, params);
    this.order();

    // don't update $location if we're coming from a watcher on it..
    if(updateLocation == undefined || updateLocation == true) {
      $location.search(this.urlParams());
    }
  }

  // Little helper to determine whether a value is "empty". Maybe put that
  // somewhere globally to use instead.
  urlFilter.isEmpty = function(v) { return (typeof v == 'undefined' || typeof v == 'string' && v == '' || v === null); }

  // returns params sans empty (and optionally hidden, used by urlParams) keys.
  urlFilter.cleanParams = function(include_hidden) {
    // include hidden parameters in "clean" by default if they're not empty
    include_hidden = typeof include_hidden == 'undefined' ? true : false;

    _params = {};
    $.each(this.params, function(k,v) { 
      if(!urlFilter.isEmpty(v) && (include_hidden || $.inArray(k, urlFilter.hidden) < 0)){
        _params[k] = v;
      }
    });
    return _params;
  }

  urlFilter.urlParams = function(hidden) {
    return this.cleanParams(false);
  }

  // merge current search()
  urlFilter.update($location.search());
  urlFilter.order();

  // then register a watcher to keep it updated

  // this works where a watch '$location.search()' does not.
  // remember to read the comments on docs.angularjs.org!
  // http://docs.angularjs.org/guide/dev_guide.services.$location
  $rootScope.$watch(function(){return $location.search()}, function(params) { 
    // Merge with defaults to blank out keys that are missing in the URL
    urlFilter.update(params, false);
  });
  
  // also watch our params, as we're binding to these directly
  $rootScope.$watch(function(){return urlFilter.params}, function(params) {
    // .. to update the URL
    $location.search(urlFilter.urlParams());

    urlFilter.onChange();
  }, true);

  // apply our params to a given scope
  urlFilter.apply = function(scope) {
    $.each(this.params, function(k,v) {scope[k] = v});
  }

  return urlFilter;
}]);