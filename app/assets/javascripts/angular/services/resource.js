// Modified version of a resource promise implementation for mongolab:
// https://github.com/pkozlowski-opensource/angularjs-mongolab-promise/blob/master/src/mongolabResourceHttp.js
// 
// I've become convinced that having a custom $resource-like implementation
// instead of patching ngResource is the way to go, partly due to threads like:
// https://groups.google.com/forum/?fromgroups=#!topic/angular/jKU8Xcc7aFg
//
// Otherwise, we'd have to maintain ngResource patches for a long time..
//
// Now, this brings at the very least one key feature to the table:
//
// * Since the return value of a query is a promise object, we can chain
//   on it as much as we want -- for example to show/hide specific loading 
//   indicators, or to modify the returned result.
//   promiseThen here already takes care of our important stuff, so this isn't
//   necessary to mold our data.
//
// * Also, since we know when the promise is fulfilled, we know if it's
//   actually empty and can choose to not clear out tables while we're loading
//   but when they're done loading and came back empty.

gg.factory('$ggResource', ['$http', function ($http) {
  function ggResourceFactory(baseUrl) {

    var url = baseUrl;
    var defaultParams = {};

    var promiseThen = function (httpPromise, successcb, errorcb, isArray) {
      return httpPromise.then(function (response) {
        var result = [];

        // When the params key is present, we're namespaced the collection
        if(typeof response.data.params != 'undefined') {
          _params = response.data.params;

          result.page = _params.page;
          if (!_.isNumber(result.page)) {
            result.page = 1;
          }
          result.limit = _params.limit;
          result.pages = Math.ceil(_params.total / _params.limit);
          result.total = _params.total;

          // also want those stats, right?
          result.stats = response.data.stats;
          result.djstats = response.data.djstats;

          // Then just put the collection in place.
          response.data = response.data.collection;
        }

        if (isArray) {
          for (var i = 0; i < response.data.length; i++) {
            result.push(new Resource(response.data[i]));
          }
        } else {
          result = new Resource(response.data);
        }

        (successcb || angular.noop)(result, response.status, response.headers, response.config);
        return result;
      }, function (response) {
        (errorcb || angular.noop)(undefined, response.status, response.headers, response.config);
        return undefined;
      });
    };

    var Resource = function (data) {
      angular.extend(this, data);
    };

    // A get that uses jsonp when gg.state.iecompat is true
    Resource.get = function(url, options) {
      if(window.gg.state.iecompat) {
        options.params = angular.extend(options.params, {callback: 'JSON_CALLBACK'});
        return $http.jsonp(url, options)
      }
      
      return $http.get(url, options);
    }

    Resource.all = function (params, cb, errorcb) {
      return Resource.query(params, cb, errorcb);
    };

    Resource.query = function (params, successcb, errorcb) {
      var params = angular.isObject(params)&&!angular.equals(params,{}) ? params : {};
      var httpPromise = this.get(url, {params:angular.extend({}, defaultParams, params)});
      return promiseThen(httpPromise, successcb, errorcb, true);
    };

    Resource.getById = function (id, successcb, errorcb) {
      var httpPromise = $http.get(url + '/' + id, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.getByObjectIds = function (ids, successcb, errorcb) {
      var qin = [];
      angular.forEach(ids, function (id) {
        qin.push({$oid:id});
      });
      return Resource.query({_id:{$in:qin}}, successcb, errorcb);
    };

    //instance methods

    Resource.prototype.$id = function () {
      if (this._id && this._id.$oid) {
        return this._id.$oid;
      } else if (this._id) {
        return this._id;
      }
    };

    Resource.prototype.$save = function (successcb, errorcb) {
      var httpPromise = $http.post(url, this, {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$update = function (successcb, errorcb) {
      var httpPromise = $http.put(url + "/" + this.$id(), angular.extend({}, this, {_id:undefined}), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$remove = function (successcb, errorcb) {
      var httpPromise = $http['delete'](url + "/" + this.$id(), {params:defaultParams});
      return promiseThen(httpPromise, successcb, errorcb);
    };

    Resource.prototype.$saveOrUpdate = function (savecb, updatecb, errorSavecb, errorUpdatecb) {
      if (this.$id()) {
        return this.$update(updatecb, errorUpdatecb);
      } else {
        return this.$save(savecb, errorSavecb);
      }
    };

    return Resource;
  }
  return ggResourceFactory;
}]);
