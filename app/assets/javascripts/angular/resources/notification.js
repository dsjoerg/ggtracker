gg.factory('Notification', ['$resource', function($resource) {
  var Notification = $resource('/notifications/:id', {}, {
    all: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: true
    }
  });
  return Notification;
}]);
