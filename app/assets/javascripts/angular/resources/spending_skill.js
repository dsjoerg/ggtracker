gg.factory('SpendingSkill', ['$resource', function($resource) {

  var SpendingSkill = $resource('http://:api_host/api/v1/spending_skill/:gateway/:race', {api_host: gg.settings.api_host}, {
    get: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });

  return SpendingSkill;
}]);
