gg.factory('User', ['$resource', function($resource) {
  var User = $resource('/users/:id', {}, {
    all: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    },
    view_mode: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });
  return User;
}]);
