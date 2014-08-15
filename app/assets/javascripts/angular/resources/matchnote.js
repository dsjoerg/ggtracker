gg.factory('Matchnote', ['$resource', function($resource) {
  var Matchnote = $resource('/matches/:match_id/matchnote', {}, {
    all: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });
  return Matchnote;
}]);
