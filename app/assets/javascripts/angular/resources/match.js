
// Match resource and associated objects

Team = function(teamNum) {
  this.num = teamNum;
  this.entities = [];
}

// TODO: reduce CPU usage by doing memoization. But perhaps not here,
// because this.entities[__].army can change
Team.prototype = {
  get supply() {
    this._supply = 0;
    for(var __ in this.entities) {
      if(this.entities[__].army) { this._supply += this.entities[__].army.supply; }
    }
    return this._supply;
  },

  get minerals() {
    this._minerals = 0;
    for(var __ in this.entities) {
      if(this.entities[__].army) { this._minerals += this.entities[__].army.minerals; }
    }
    return this._minerals;
  },

  get gas() {
    this._gas = 0;
    for(var __ in this.entities) {
      if(this.entities[__].army) { this._gas += this.entities[__].army.gas; }
    }
    return this._gas;
  },

  elem: function(elemname, frame) {
    match = this.entities[0].match;
    nowIndex = Math.floor(frame / 160);
    theArr = match[elemname][this.entities[0].identity.id];
    return theArr[nowIndex];
  },

  mininc: function(frame) {
    this._mi = 0;
    match = this.entities[0].match;
    nowIndex = Math.floor(frame / 160);
    for(var __ in this.entities) {
      var mineralsArr = match.MineralsCollectionRate[this.entities[__].identity.id];
      this._mi += mineralsArr[nowIndex];
    }
    return this._mi;
  },

  gasinc: function(frame) {
    this._result = 0;
    match = this.entities[0].match;
    nowIndex = Math.floor(frame / 160);
    for(var __ in this.entities) {
      var statArr = match.VespeneCollectionRate[this.entities[__].identity.id];
      this._result += statArr[nowIndex];
    }
    return this._result;
  }

}

// index is the entity's index in the match object's arrays
Entity = function(data, index) {
  $.extend(this, data);
  this.index = index;
  this.armies_by_frame = eval(this.armies_by_frame);
}


Entity.prototype = {
  get race_name() {
    return Sc2.race_names[this.race];
  },

  // Whenever Match#computeArmiesAt is called, it stores the current
  // armies in currentArmies as well as armiesAt. Together with our
  // "match index" for this entity, we can access these Army objects
  // and use them in the Team class above.
  get army() {
    return this.match.currentArmies[this.index];
  },
}

Entity.prototype.win_pretty = function() {
  switch(this.win) {
    case true: return "win";
    case false: return "loss";
    default: return "left";
  }
}

Entity.prototype.race_macro_pretty = function() {
  if (!_.isNumber(this.race_macro)) {
   return "";
  }
  return (this.race_macro * 100.0).toFixed(0);
}

Entity.prototype.mdelta2 = function() {
    if (this.stats == null ||
        this.stats.mineral_saturation_2 == null ||
        this.stats.miningbase_2 == null) {
        return null;
    }
    return Math.max(0, this.stats.mineral_saturation_2 - this.stats.miningbase_2);
}

Entity.prototype.mdelta3 = function() {
    if (this.stats == null ||
        this.stats.mineral_saturation_3 == null ||
        this.stats.miningbase_3 == null) {
        return null;
    }
    return Math.max(0, this.stats.mineral_saturation_3 - this.stats.miningbase_3);
}

Entity.prototype.color_style = function() {
    return { 'border-color': '#' + this.color };
}


// Army

Army = function(units, entity) {
  this.units = units;
  this.entity = entity;
}

// Values such as army strength and supply are only being calculated when
// they are first being used.
Army.prototype = {
  units: [],
  _supply: 0,
  _minerals: 0,
  _gas: 0,

  get supply() {
    if(this._supply) { return this._supply; }

    this._supply = 0;
    for(var _ in this.units) { this._supply += (Sc2.armyInfo(this.entity.match.expansion_tag, _, 2) * this.units[_]); }
    this._supply = Math.round(this._supply);
    return this._supply;
  },

  get minerals() {
    if(this._minerals) { return this._minerals; }

    this._minerals = 0;
    // See angular/helpers/sc2.js for unit values
    for(var _ in this.units) { this._minerals += (Sc2.armyInfo(this.entity.match.expansion_tag, _, 0) * this.units[_]); }
    return this._minerals;
  },

  get gas() {
    if(this._gas) { return this._gas; }

    this._gas = 0;
    // See angular/helpers/sc2.js for unit values
    for(var _ in this.units) { this._gas += (Sc2.armyInfo(this.entity.match.expansion_tag, _, 1) * this.units[_]); }
    return this._gas;
  },

  get strength() {
    return this.minerals + this.gas;
  },
}


// Match

gg.factory('Match', ['$ggResource', '$compile', 'Matchnote', function($ggResource, $compile, Matchnote) {
  // argh, it appears the next line is intentionally broken?  try
  // using the :api_host syntax instead to see what I mean.
  var Match = $ggResource('http://' + gg.settings.api_host + '/api/v1/matches');

  Object.defineProperty(Match.prototype, 'expansion_tag', {
      get: function() {
          switch (this.expansion) {
          case 0: return 'WoL';
          case 1: return 'HotS';
          case 2: return 'LotV';
          }
      }
  });

  
  Object.defineProperty(Match.prototype, 'winner', {
    get: function() {
      return (this.game_type == '1v1') ? this.winners[0] : (this._winning_team != undefined ? 'Team ' + this._winning_team : undefined);
    }
  });

  Object.defineProperty(Match.prototype, 'winner_color', {
    get: function() { 
      return (this.game_type == '1v1') ? this.winning_entity.color : (this._winning_team == 1 ? 'red' : 'blue');
    }
  });

  Object.defineProperty(Match.prototype, 'winning_entity', {
    get: function() { return this._winning_entity; }
  });

  Object.defineProperty(Match.prototype, 'winners', {
    get: function() {
      if(typeof this._winner_names != 'undefined') { return this._winner_names; }
      _winner_names = [];
      angular.forEach(this.teams[this._winning_team].entities, function(e) {
        _winner_names.push(e.identity.name);
      });
      return this._winner_names = _winner_names;
    }
  });

  Object.defineProperty(Match.prototype, 'doubleents', {
    get: function() {
      _result = [];
      angular.forEach(this.entities, function(e) {
        _result.push(e);
        _result.push(e);
      });
      return _result;
    }
  });

  Object.defineProperty(Match.prototype, 'any_creep_spread', {
    get: function() {
      return _.some(this.series.creep_spread.entities, function(entity_data) {return entity_data.nz});
    }
  });


  // Temporary constructor
  Match.prototype.__init = function() {
    this.armies = [];
    this.armiesAt = {};
    // when storing in armiesAt, we also store the latest armies requested in
    // currentArmies.
    this.currentArmies = {};
    // last frame passed to computeArmiesAt
    this.lastFrame = null;

    this.playerCount = this.entities.length;
    this.entityIds = [];
    this.teams = {};

    var twoPlayerMatch = this.playerCount === 2;

    for(var ei in this.entities) {
//              console.log("ei", ei, this.armies_by_frame, this.entities, this.entities[ei].identity.name);
      if (this.armies_by_frame && this.entities[ei].identity) {
        var entityArmy = [];
        if (this.entities[ei].identity.name in this.armies_by_frame) {
          entityArmy = this.armies_by_frame[this.entities[ei].identity.name];
          //          console.log("got abf for ei by name", ei, entityArmy);
        } else if (this.entities[ei].identity.id in this.armies_by_frame) {
          entityArmy = this.armies_by_frame[this.entities[ei].identity.id];
          //          console.log("got abf for ei by id", ei, entityArmy);
        } else if (this.entities[ei].identity.name.match(/A.I./) && twoPlayerMatch) {
          entityArmy = this.armies_by_frame[0];
        }
        this.entities[ei].armies_by_frame = entityArmy;
      }
      entity = new Entity(this.entities[ei], ei);
      entity.match = this;

      // TODO: we already have winning_team on Match - was there a reason I 
      // didn't use it?
      // (We are using it on the frontend, just using _winning_team in here
      // directly)
      if(!this._winning_team && entity.win == true)
        this._winning_team = entity.team;

      if(!this._winning_entity && entity.win == true)
        this._winning_entity = entity;

      //      console.log("in __init, setting match.armies for " + ei, entity.armies_by_frame);
      this.armies[ei] = entity.armies_by_frame;
      this.entities[ei] = entity;
      this.entityIds[ei] = entity.id;
      
      if(this.teams[entity.team] == undefined) { this.teams[entity.team] = new Team(entity.team); }
      this.teams[entity.team].entities.push(entity);
    }
  }

  Match.prototype.computeLocationsUpTo = function(index) {
      // console.log("cLUT " + index + " " + this.locationsComputedUpTo);

      if (this.locationsComputedUpTo >= index)
          return;

      if (!this.stored_location) {
          this.stored_location = []
      }

      var current_locations = {}
      if (!this.locationsComputedUpTo) {
          this.locationsComputedUpTo = 0;
      } else {
          current_locations = _.clone(this.stored_location[this.locationsComputedUpTo]);
      }

      for (var i=this.locationsComputedUpTo; i<=index; i++) {
          _.each(_.pairs(this.locationdiffs[i]), function(playerlocdiffs) {
              var ident_id = playerlocdiffs[0];
              var locdiffs = playerlocdiffs[1];
              if (!_.has(current_locations, ident_id)) {
                  current_locations[ident_id] = []
              }
              _.each(locdiffs, function(pair) {
                if (pair[1] == 0) {
                    delete current_locations[ident_id][pair[0]];
                } else {
                    current_locations[ident_id][pair[0]] = pair;
                }
              });
          });
          this.stored_location[i] = $.extend(true, {}, current_locations);
      }

      this.locationsComputedUpTo = index;
  }

  Match.prototype.full_locations = function(index) {
      this.computeLocationsUpTo(index);
      return this.stored_location[index];
  }

  // Give us comma separated names for all identities in a team
  Match.prototype.team_names = function(team) {
    team = typeof team == 'number' ? team : 1;

    _names = [];
    $.each(this.entities, function(i, v) {
      if(v.team == team) {
        _name = v.identity.name;
        _names.push(_name);
      }
    });

    return _names;
  }

  Match.prototype.duration_minutes = function() {
    return(this.duration_seconds / 60).toFixed(0);
  }

  Match.prototype.entity = function(identity_id) {
    for (i=0; i<this.entities.length; i++) {
      entity = this.entities[i];
      if (entity.identity.id == identity_id) {
        // CLEANME
        // __init will populate entities with Entity objects, but we're not
        // calling that on collections (though we could: see resource-patched)
        return new Entity(entity);
      }
    }
    return null;
  }

  Match.prototype.entity_team = function(team_num) {
      for (i=0; i<this.entities.length; i++) {
        entity = this.entities[i];
        if (entity.team == team_num) {
            return new Entity(entity);
        }
      }
      return null;
  }

  Match.prototype.race_entities = function(raceletter) {
    return _.filter(this.entities, function(entity) {return entity.race == raceletter;});
  }

  // Armies!
  // compute and return a zero-index array mapping pid-1 to a map of
  // unit type to unit count, for the given frame.
  Match.prototype.computeArmiesAt = function(frame) {
    // return stored armies if generated previously and update 
    // Match#currentArmies too, because Entity#army will read from it.
    if(this.armiesAt[frame]) { return this.currentArmies = this.armiesAt[frame]; }

    var armies_now = new Array(this.playerCount);
    for (var pid=0; pid<this.playerCount; pid++) {
      armies_now[pid] = {}
      army_list = this.armies[pid];

      for (var army_item in army_list) {
        unitName = army_list[army_item][0];
        lookupName = unitName.replace(" (burrowed)", "");
        lookupName = lookupName.replace(" (sieged)", "");

        if (Sc2.isArmyUnit(lookupName)) {
          unitTypeCount = armies_now[pid][unitName];
          var howManyNow = 0;

          if (army_list[army_item][1] <= frame &&
            frame <= army_list[army_item][2]) {
            howManyNow = 1;
          }

          if (typeof unitTypeCount == "undefined") {
            armies_now[pid][unitName] = howManyNow;
          } else {
            armies_now[pid][unitName] = unitTypeCount + howManyNow;
          }
        }
      }
    }

    // Army objects!
    // The entity adding is HAXish.
    for(var _ in armies_now) { armies_now[_] = new Army(armies_now[_], this.entities[_]); }

    this.lastFrame = frame;
    this.armiesAt[frame] = this.currentArmies = armies_now;
    return armies_now;
  };

  Match.prototype.getArmiesAt = function(frame) {
    return this.computeArmiesAt(frame);
  };

  // Returns the army for a given entity at the given frame
  // accepts entity objects or ids.
  Match.prototype.entityArmyAt = function(entityId, frame) {
    entityId = typeof entityId == 'number' ? entityId : entityId.id;
    _armies = this.computeArmiesAt(frame);
    _entityIdx = this.entityIds.indexOf(entityId);
    return _armies[_entityIdx];
  }

  // Returns combined army strength
  Match.prototype.totalStrengthAt = function(frame) {
    armies = this.getArmiesAt(frame);
    total = 0;
    for(var _ in armies) { total += armies[_].strength; }
    return total;
  }

  // Returns combined army supply
  Match.prototype.totalSupplyAt = function(frame) {
    armies = this.getArmiesAt(frame);
    total = 0;
    for(var _ in armies) { total += armies[_].supply; }
    return total;
  }

  Match.prototype.matchup = function(identity_id) {
    if (!_.isUndefined(this._matchup)) { return this._matchup; }
    mu = {};
    for(var __ in this.entities) {
      entity = this.entities[__];
      if(mu[entity.team] == undefined) { mu[entity.team] = []; }
      mu[entity.team].push(entity.race);
    }
     if (!_.isUndefined(identity_id)) {
      teamnum = this.entity(identity_id).team;
      this._matchup = mu[teamnum].sort().join('') + 'v'
      delete mu[teamnum];
    } else {
      this._matchup = '';
    }
     for(var __ in mu) {
      this._matchup = this._matchup.concat(mu[__].sort().join('') + 'v');
    }
    this._matchup = this._matchup.replace(/v$/, '');

    return this._matchup;
  }

  // this was prepareArmyData()

  Object.defineProperty(Match.prototype, 'identity_ids', {get: function() {
    if(this._identity_ids) { return this._identity_ids; }
    this._identity_ids = _(_(this.entities).pluck('identity')).pluck('id');
    return this._identity_ids;
  }});
  
  // Accepts either accounts (objects with esdb_id), or an array of identity
  // IDs directly. Returns one of the identity ids if any of them participated in the match, or null.
  Match.prototype.hasPlayers = function(identities) {

    if(typeof identities != 'object' || identities.length == 0) { return false; } else {
      if(typeof identities[0].identity_id != 'undefined') {
        identities = _(identities).pluck('identity_id');
      }
      
      isc = _.intersection(this.identity_ids, identities);
      if(isc && isc.length > 0) { return isc[0]; }
      return null;
    }
  };
    
  Match.prototype.hasMatchNote = function() {
    if (!this.my_matchnote) {
      this.my_matchnote = Matchnote.get({match_id: this.id});
    }

    return !_.isUndefined(this.my_matchnote) && !_.isUndefined(this.my_matchnote.note);
  }

  Object.defineProperty(Match.prototype, 'series', {get: function() {
    if(this._series) { return this._series; }
    this._series = {
      apm: {teams:[], entities:[]},
      wpm: {teams:[], entities:[]},
      creep_spread: {teams:[], entities:[]},
      army: {teams: [], entities: []},
      bases: {teams: [], entities: []},
      summary_income: {teams: [], entities: []},
      summary_army: {teams: [], entities: []},
      summary_workersactive: {teams: [], entities: []},
      summary_upgradespending: {teams: [], entities: []},
      summary_upgradespending: {teams: [], entities: []},
      replayincome: {teams: [], entities: []},
      replaygasincome: {teams: [], entities: []},
      replaytotalincome: {teams: [], entities: []},
      replaylost: {teams: [], entities: []},
      replayminerals: {teams: [], entities: []},
      replaygas: {teams: [], entities: []},
      replayworkers: {teams: [], entities: []},
    };

    // Generate army chart series from armies?
    _ac = (this.replays_count > 0);
    
    // We collect the teamseries as we generate entity series
    _teamx = [];
    _teamy = {};

      // bases is a list of [base-completely-built, base-destroyed, base-build-begin] triples
      // but matchblobs from before 20140806 are [base-completely-built, base-destroyed] pairs
      //
      // returns a list of [x,y] pairs suitable for graphing
    computeBaseXY = function(bases) {
        completed_bases = _.filter(bases, function(base) { return !(_.isNull(base[0])) });
        cb_start_end = _.map(completed_bases, function(base) { return base.slice(0,2) });
        _bases_x = _.uniq(_.flatten(cb_start_end)).sort(function(a,b) { return a-b; });
        _jump_x_times = [];
        _.each(_bases_x, function(_x) {
            if (_x > 0) {
                _jump_x_times.push(_x - 1);
            }
        });
        _bases_x = _bases_x.concat(_jump_x_times).sort(function(a,b) { return a-b; });

        // don't graph the last base-time; its y-value is zero by definition
        _bases_x.pop();

        speed_multiplier = 1.0;
        if (this.expansion_tag == 'LotV') {
            speed_multiplier = Sc2.LOTV_SPEEDUP;
        }
        _bases_x_minutes = _.map(_bases_x, function(_frame_x) { return _frame_x / 960.0 / speed_multiplier });

        _series_y = [];
        _.each(_bases_x, function(_x) {
            bases_alive_at_x = _.filter(completed_bases, function(base) { return (_x >= base[0] && _x < base[1]) });
            num_bases_alive_at_x = bases_alive_at_x.length;
            _series_y.push(num_bases_alive_at_x);
        });

        return _.zip(_bases_x_minutes, _series_y);
    };

    statx = function(statarray) {
        result = [];
        seconds_between_stat_updates = 10.0;
        if (this.expansion_tag == 'LotV') {
            seconds_between_stat_updates /= Sc2.LOTV_SPEEDUP;
        }
        now_seconds = 0;
        _.each(statarray, function(stat) {
            result.push([now_seconds / 60.0, stat]);
            now_seconds = now_seconds + seconds_between_stat_updates;
        });
//        console.log("statarray", result);
        return result;
    }

    //    console.log("in series getter, this.armies = ", this.armies);
    
      for(var _entity in this.entities) {
          entity = this.entities[_entity];
          raw_army = this.armies[_entity];

          base_series = {
              name: entity.identity.name,
              color: entity.color ? '#' + entity.color : null,
              team: entity.team,
              is_team: false
          }

          // Income and army graphs from summary
          // Graph data is already prepared currently, so we just have to add it
          if(entity.summary) {
              this._series.summary_income.entities[_entity] = $.extend({data: entity.summary.incomegraph}, base_series);
              this._series.summary_army.entities[_entity] = $.extend({data: entity.summary.armygraph}, base_series);
              if (entity.summary.workersactivegraph) {
                  this._series.summary_workersactive.entities[_entity] = $.extend({data: entity.summary.workersactivegraph}, base_series);
              }
              if (entity.summary.upgradespendinggraph) {
                  this._series.summary_upgradespending.entities[_entity] = $.extend({data: entity.summary.upgradespendinggraph}, base_series);
              }
          }
          
          if(this.MineralsCurrent) {
              this._series.replayincome.entities[_entity] = $.extend({data: statx(this.MineralsCollectionRate[entity.identity.id])}, base_series);
              this._series.replaygasincome.entities[_entity] = $.extend({data: statx(this.VespeneCollectionRate[entity.identity.id])}, base_series);
              this._series.replaylost.entities[_entity] = $.extend({data: statx(this.Lost[entity.identity.id])}, base_series);
              this._series.replayminerals.entities[_entity] = $.extend({data: statx(this.MineralsCurrent[entity.identity.id])}, base_series);
              this._series.replaygas.entities[_entity] = $.extend({data: statx(this.VespeneCurrent[entity.identity.id])}, base_series);
              this._series.replayworkers.entities[_entity] = $.extend({data: statx(this.WorkersActiveCount[entity.identity.id])}, base_series);

              if (entity.identity.id in this.MineralsCollectionRate) {
                  zippedIncome = _.zip(this.MineralsCollectionRate[entity.identity.id], this.VespeneCollectionRate[entity.identity.id]);
                  incomeArr = _.map(zippedIncome, function(pair) { return pair[0] + pair[1] });
                  runningTotalIncome = _.map(incomeArr, function(income) {
                      return this.incomeSoFar += Math.floor(income / 6.0);
                  }, { incomeSoFar: 0 });
                  this._series.replaytotalincome.entities[_entity] = $.extend({data: statx(runningTotalIncome)}, base_series);
              }
          }

          if(entity.data) {
              this._series.apm.entities[_entity] = $.extend({data: entity.data.apm, pointStart: 1}, base_series);
              this._series.wpm.entities[_entity] = $.extend({data: entity.data.wpm, pointStart: 1}, base_series);
              this._series.creep_spread.entities[_entity] = $.extend({data: entity.data.creep_spread, pointStart: 1}, base_series);
          }

          if (this.num_bases) {
              playertoshow = _.find(this.num_bases, function(playerinfo) {return playerinfo[0] == entity.identity.id});
              if (playertoshow) {

                  basexy = computeBaseXY(playertoshow[1]);

                  this._series.bases.entities[_entity] = {
                      name: entity.identity.name,
                      team: entity.team,
                      is_team: false,
                      color: '#' + entity.color,
                      id: entity.id,
                      visible: true,
                      data: basexy
                  }
              }
          }


          // Army graph calculation from armies_by_frame
          if(_ac && raw_army) {
              // this was computeXPoints
              // collects unique birth and death frames from the army array
              // could do this for all armies instead.
              //          console.log("hiiii",raw_army);
              _series_x = _.uniq(
                  $.map(
                      $.map(raw_army, function(v,i){ return [v[1], v[2]]; }), 
                      function(n){return n;} 
                  )
              ).sort(function(a,b) { return a-b; });

              // this was computeYPoints
              // for every point in the x axis, it sums up the value of all units alive
              // at that frame number (strength)

              _series_y = [];
              for(var _x in _series_x) {
                  army = this.entityArmyAt(entity.id, _series_x[_x]);
                  if(army) { _series_y[_x] = army.strength; } else { _series_y[_x] = 0; }
              }

              _entity_data = _.zip(_series_x, _series_y);

              this._series.army.entities[_entity] = {
                  name: entity.name,
                  team: entity.team,
                  is_team: false,
                  color: '#' + entity.color,
                  id: entity.id,
                  visible: true,
                  data: _entity_data
              }

              // Concat/add team data
              _teamx = _teamx.concat(_series_x);
          }
      }
    
    // Add the team series
    for(var _team in this.teams) {

      _keys = ['summary_army', 'summary_income', 'summary_workersactive', 'summary_upgradespending', 'apm', 'wpm', 'creep_spread', 'replayincome', 'replaygasincome', 'replaylost', 'replayminerals', 'replaygas', 'replayworkers', 'replaytotalincome'];
      for(var _stype in _keys) {
        _stype = _keys[_stype];

        _entity_series = this._series[_stype].entities;

          if (_.isUndefined(_entity_series) || _entity_series.length == 0 || _.isUndefined(_entity_series[0].data)) {
              continue;
          }

        _team_series = [];

        // Note: while looping through, the data will be invalid. An object keyed
        // by x, with accumulated y value. At the end, we combine this back into
        // an array of arrays.
          for(var _entity in _entity_series) {
              _series = _entity_series[_entity];

              // [[x,y]] or [y]? We don't care for now
              if(Object.prototype.toString.call(_series.data[0]) === '[object Array]') {
                  __data = _.object(_series.data)
              } else {
                  __data = _series.data
              }

              if(!_team_series[_series.team]) {
                  _team_series[_series.team] = {
                      name: 'Team ' + _series.team,
                      color: _series.team == 1 ? 'red' : 'blue',
                      team: _series.team,
                      data: $.extend({}, __data),
                      is_team: true
                  }
              } else {
                  for(var _x in __data) {
                      // value exists? add to it
                      _team_series[_series.team].data[_x] = _team_series[_series.team].data[_x] ? 
                          _team_series[_series.team].data[_x] + __data[_x] : __data[_x];
                  }
              }
        }


        // I cast you back to the array from whence you came!
        for(var __ in _team_series) {
          _array = _team_series[__].data;
          // needs integer keys, sadly..
          // _array.length = _.keys(_array).length;
          // _array = Array.prototype.slice.call(_array);
          _array = $.map(_array, function(v,k){ return [[parseFloat(k),v]]; });
          _array = _.sortBy(_array, function(pair) { return pair[0] });
          _team_series[__].data = _array;
        }

        this._series[_stype].teams = _team_series;
        this._series[_stype].combined = _.values(this._series[_stype].entities).
          concat(_.values(this._series[_stype].teams));
      }

      if(_ac) {
        _teamx = _.uniq(_teamx).sort(function(a,b) { return a-b; });

        _v = [];
        for(var _x in _teamx) {
          armies = this.getArmiesAt(_teamx[_x]);
          t = 0;
          for(var _army in armies) {
            army = armies[_army];

            if(army.entity.team == _team)
              t += army.strength;
          }
          _v.push(t);
        }

        this._series.army.teams[_team] = {
          name: 'Team ' + _team,
          team: _team,
          is_team: true,
          // Matches team colors in matches.css
          color: _team == 1 ? 'red' : 'blue',
          id: 'Team ' + _team,
          data: _.zip(_teamx, _v),
          visible: false
        }
      }

      if(this.num_bases) {
        teambases = [];
        team_entities = this.entities;
        _.each(this.num_bases, function(playerinfo) {
          _.each(team_entities, function(entity) {
            if (entity.team == _team && entity.identity.id == playerinfo[0]) {
              teambases = teambases.concat(playerinfo[1]);
            }
          });
        });

        basexy = computeBaseXY(teambases);

        this._series.bases.teams[_team] = {
          name: 'Team ' + _team,
          team: _team,
          is_team: true,
          color: _team == 1 ? 'red' : 'blue',
          id: 'Team ' + _team,
          data: basexy,
          visible: false
        }

        this._series.bases.combined = _.values(this._series.bases.entities).
        concat(_.values(this._series.bases.teams));
      }

    }

    if(_ac)
      this._series.army.combined = _.values(this._series.army.entities).
        concat(_.values(this._series.army.teams));

    return this._series;
  }});

  return Match;
}]);
