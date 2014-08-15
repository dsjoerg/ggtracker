gg.factory('Account', ['$resource', function($resource) {
  var Account = $resource('/accounts/:id', {}, {
    all: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: true
    }
  });
  return Account;
}]);
