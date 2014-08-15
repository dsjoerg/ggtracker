gg.factory('Map', ['$resource', function($resource) {
  var Map = $resource('http://:api_host/api/v1/maps/names', {api_host: gg.settings.api_host}, {
    all: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: true
    }
  });

  return Map;
}]);
