gg.factory('MatchupStats', ['$resource', function($resource) {
  var MatchupStats = $resource('http://:api_host/api/v1/matchup_stats/:timeperiod', {api_host: gg.settings.api_host}, {
    get: {
      method: gg.state.iecompat ? 'JSONP' : 'GET',
      params: gg.state.iecompat ? {callback: 'JSON_CALLBACK'} : {},
      isArray: false
    }
  });

  return MatchupStats;
}]);
