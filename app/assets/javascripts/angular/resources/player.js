gg.factory('Player', ['$ggResource', function($ggResource) {
  var Player = $ggResource('http://' + gg.settings.api_host + '/api/v1/identities');

  Object.defineProperty(Player.prototype, 'race_name', {
    get: function() {
      return Sc2.race_names[this.most_played_race];
    }
  });

  Object.defineProperty(Player.prototype, 'region', {
    get: function() {
      if (this.gateway == 'us') return 'am';
      return this.gateway;
    }
  });

  return Player;
}]);
