gg.factory('EconStaircase', ['$resource', function($resource) {

  var EconStaircase = $resource('http://:api_host/api/v1/econ_stats/staircase', {api_host: gg.settings.api_host}, {
    get: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });

  return EconStaircase;
}]);
