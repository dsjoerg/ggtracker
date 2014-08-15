gg.factory('EconStats', ['$resource', function($resource) {

  var EconStats = $resource('http://:api_host/api/v1/econ_stats', {api_host: gg.settings.api_host}, {
    get: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });

  return EconStats;
}]);
