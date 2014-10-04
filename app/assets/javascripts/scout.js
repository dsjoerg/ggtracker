var formatNumber = d3.format(",d"),
    winInterp = d3.interpolateHsl(d3.hsl(0, 0.44, 0.49), d3.hsl(122, 0.44, 0.49));

function logistic(x) {
  return 1.0 / (1 + Math.exp(-x));
}

// we will keep a list of filter objects
// each filter object will have:
// * dim: the crossfilter dimension object
// * range: the currently filtered range, or null if nothing is currently applied

// currently filter settings get changed in the following places:
// brush.chart calls dimension.filterRange(extent);
// brushend.chart calls dimension.filterAll();
// chart.filter() calls both of those
// our race selectors call raceDim.filter(this.textContent) and oppRaceDim.filter(this.textContext)

function reduceAddDJ(p, v) {
  ++p.value;
  return p;
}

function reduceRemoveDJ(p, v) {
  --p.value;
  return p;
}

function reduceInitialDJ() {
  return {value:0};
}

function reduceAddWinPct(p, v) {
  ++p.games;
  if (v.player.win == "true") {
      ++p.wins;
  }
  if (p.games == 0) {
      p.value = 0;
  } else {
      p.value = Math.round(1000.0 * p.wins / p.games) / 10.0;
  }
  return p;
}

function reduceRemoveWinPct(p, v) {
  --p.games;
  if (v.player.win == "true") {
      --p.wins;
  }
  if (p.games == 0) {
      p.value = 0;
  } else {
      p.value = Math.round(1000.0 * p.wins / p.games) / 10.0;
  }
  return p;
}

function reduceInitialWinPct() {
  return {games:0, wins:0, value:0};
}

function orderValueDJ(p) {
  return p.value;
}

function groupDJ(group) {
    return group.reduce(reduceAddDJ, reduceRemoveDJ, reduceInitialDJ).order(orderValueDJ);
}

function groupWinPct(group) {
    return group.reduce(reduceAddWinPct, reduceRemoveWinPct, reduceInitialWinPct).order(orderValueDJ);
}

function render(method) {
    d3.select(this).call(method);
}

function renderAll() {
    $('.filterchart').each(function() { this.render() });

    if (typeof list !== 'undefined') {
      list.each(render);
      d3.select("#active").text(formatNumber(cf_all.value()));
    }

    if (typeof winGrp !== 'undefined') {
      numWins = _.find(winGrp.all(), function(grp) {return grp.key == "true"}).value.value
      pctWins = Math.round(1000.0 * numWins / cf_all.value()) / 10.0;
      //    console.log("wins:", numWins, pctWins);
      d3.select("#winrate").text(pctWins);
    }
}

function matchList(elem) {
    var gamerecordsByDate = dateDim.top(100);

    elem.each(function() {
        var match = d3.select(this).selectAll(".match")
            .data(gamerecordsByDate);

        var matchEnter = match.enter().append("tr").attr("class", "match");
        matchEnter.append("td").attr("class", "id").append("a");
        matchEnter.append("td").attr("class", "num_workers");
	//        matchEnter.append("td").attr("class", "num_zealots");
	_.each(_.range(1,19), function(i) {
	  var tdClass = 'num_unit';
          matchEnter.append("td").attr("class", tdClass).attr("id", 'u' + i);
        });
        matchEnter.append("td").attr("class", "result");

        match.exit().remove();

        match.select('.id a').text(function(gr) { return gr.match.id });
        match.select('.id a').attr("href", function(gr) { return "http://ggtracker.com/matches/" + gr.match.id });
        match.select('.num_workers').text(function(gr) { return gr.player.stat(8, 'u0') });
	_.each(_.range(1,19), function(i) {
          var selector = '.num_unit#u' + i;
          var unit_name = 'u' + i;
          match.select(selector).text( function(gr) {
	    num_units = gr.player.stat(8, unit_name);
	    return (num_units == 0) ? '' : num_units;
          });
        });
        match.select('.result').text(function(gr) { return gr.player.win == "true" ? "win" : "loss" });
    });
}

function data_host() {
    return "http://localhost:3000";
}

function debug_suffix() {
    debug = false;

    if (debug) {
        return "_debug";
    } else {
        return "";
    }
}

function protoss_army_values () {
    protoss_army_unit_names = [
			       'zealot',
			       'sentry',
			       'stalker',
			       'hightemplar',
			       'darktemplar',
			       'immortal',
			       'colossus',
			       'archon',
			       'observer',
			       'warpprism',
			       'phoenix',
			       'voidray',
			       'carrier',
			       'mothership',
			       'photoncannon',
			       'oracle',
			       'tempest',
			       'mothershipcore'
			       ];
    return _.map(protoss_army_unit_names, function(unit_name) {
	    unit_stats = Sc2.armyUnits.HotS[unit_name];
	    return unit_stats[0] + 3 * unit_stats[1];
	});
}

PROTOSS_VALUES = protoss_army_values();

function army_distance(a, b) {
    distance = 0;
    _.each(PROTOSS_VALUES, function(value, index) {
      distance += value * Math.abs(a['u'+(index+1)] - b['u'+(index+1)]);
      console.log("distance for index ", index, " = ", value * Math.abs(a['u'+(index+1)] - b['u'+(index+1)]), value, a['u'+(index+1)], b['u'+(index+1)]);
    });
    return distance;
}

function matches_url() {
    return data_host() + "/matches" + debug_suffix() + ".csv";
}

function entities_url() {
    return data_host() + "/ents" + debug_suffix() + ".csv";
}

function minutes_url() {
    return data_host() + "/minutes" + debug_suffix() + ".csv";
}

function fum_url() {
    return data_host() + "/frequent_uploader_matches.csv";
}

function cumulativize(group) {
  // TODO can be more efficient, but does it matter.
  return _.map(group, function(element, index, list) {
      var allFollowingGroups = _.rest(list, index);
      var allFollowingSummary = _.reduce(allFollowingGroups,
                                         function(memo, group){
                                             return {wins: memo.wins + group.value.wins,
                                                     games: memo.games + group.value.games};
                                         }, {wins:0, games:0});
      allFollowingSummary.value = Math.round(1000.0 * allFollowingSummary.wins / allFollowingSummary.games) / 10.0;
      return {key: element.key, value: allFollowingSummary};
  });
}

function filter_chart(element, dimension, group, colorgroup, domain, tooltip) {

    // TODO actually use the tooltip function argument.

    element.group = group;
    element.colorgroup = colorgroup;
    element.dimension = dimension;
    element.djchart = $(element).parents('.djchart');
    var dateAxis = (domain[0] > Date.UTC(2010, 1, 1));

    element.render = function () {
      var grp = this.group.all();
//      var cumColorGrp = cumulativize(colorGrp);
      var data;

      if (this.colorgroup) {
        var colorGrp = this.colorgroup.all();
        data = _.map(_.zip(grp, colorGrp), function (gs) {
          var winpct = gs[1].value.value;
          var color = winInterp(logistic((winpct - 50) / 10.0));
          return {x:gs[0].key, y:gs[0].value.value, color:color, winpct:winpct};
        });
      } else {
        data = _.map(grp, function (g) {
          return {x:g.key, y:g.value.value, color: 'steelblue'};
        });
      }

      this.chart.series[0].setData(data);
    }

    element.reset = function () {
      console.log('element reset!');
      this.chart.xAxis[0].removePlotBand('plot-band-1');
      this.dimension.filterAll();

      this.djchart.children(".filtered").css('visibility', 'hidden');
      renderAll();
    }

    element.range_select = function (event) {
//      console.log("Selected", event.xAxis[0].min, event.xAxis[0].max, event);

      event.xAxis[0].axis.removePlotBand('plot-band-1');

      event.xAxis[0].axis.addPlotBand({
          from: event.xAxis[0].min,
          to: event.xAxis[0].max,
          color: 'rgba(150, 50, 50, 0.1)',
          zIndex: 5,
          id: 'plot-band-1'
      });

      element.djchart.find(".lower").text(Math.floor(event.xAxis[0].min));
      element.djchart.find(".upper").text(Math.floor(event.xAxis[0].max));
      element.djchart.children(".filtered").css('visibility', 'visible');

      dimension.filterRange([event.xAxis[0].min, event.xAxis[0].max]);
      renderAll();

      // TODO if not too hard, make selection area draggable
      // TODO get rid of remaining uses of d3, make page lighter

      event.preventDefault();
    };

    element.tooltip = tooltip;

    var options = {
      chart: {
        type: "column",
        renderTo: element,
        backgroundColor: "#F7F4EF",
        color: "#00f",
        animation: false,
        zoomType: 'x',
        width: 185,
        height: 130,
        events: { selection: element.range_select }
      },
      title: {text: ""},
      legend: {enabled: false},
      xAxis: {
          labels: {
              enabled: true,
              style: {"fontFamily":"'Open Sans', verdana, arial, helvetica, sans-serif"},
              formatter: dateAxis ? null : function () { return this.value; }
          },
          type: dateAxis ? 'datetime' : 'linear',
          min: domain[0],
          max: domain[1]
      },
      yAxis: {
          lineWidth: 0,
          minorGridLineWidth: 0,
          lineColor: 'transparent',
          labels: { enabled: false },
          minorTickLength: 0,
          tickLength: 0,
          title: '',
          endOnTick: false
      },
      credits: { enabled: false },
      tooltip: { enabled: true, formatter: function () { return this.x + ': ' + this.y + ' games, ' + this.point.winpct + '% win.' } },
      plotOptions: {
          column:{
              animation:false,
              cursor: 'pointer',
              color:'rgba(0,0,0,0)',
              groupPadding: 0,
              pointPadding: 0,
              borderWidth: 0,
              pointPlacement: 'on',
              states: { hover: { enabled: false } },
              marker: { enabled:false },
              shadow:false,
              threshold:0
          }
      },
      subtitle: {}
    };
    options.series = [];
    element.chart = new Highcharts.Chart(options);
    var xyValues = _.map(group.all(), function (g) { return [g.key, g.value.value]; })
    element.chart.addSeries({
           data: xyValues
    });
}

function reset_click(e) {
  console.log('reset_click', e);
  e.preventDefault();
  var filterchart = $(e.target).parents('.djchart').find('.filterchart')[0];
  filterchart.reset();
}

function add_filterchart(element, dimension, group, title, domain, addWinPct, tooltip) {

  addWinPct = typeof addWinPct !== 'undefined' ? addWinPct : true;

  var chartContainer = $(document.createElement('div')).addClass('djchart');

  var chartTitle = $('<div class="title">' + title + '</div>');

  var chartFilterText = $('<div class="filtered title" style="visibility:hidden">from <span class="lower">-</span> to <span class="upper">-</span></div>');
  var filterResetLink = $('<a href="#" class="reset">reset</a>');

  filterResetLink.click(reset_click);
  chartFilterText.append(filterResetLink);
  chartContainer.append(chartTitle);
  chartContainer.append(chartFilterText);

  var thechart = $(document.createElement('div')).addClass('filterchart');
  chartContainer.append(thechart);

  var colorgroup = null;
  if (addWinPct) {
      colorgroup = groupWinPct(group.clone());
  }

  filter_chart(thechart[0], dimension, group, colorgroup, domain, tooltip);

  element.append(chartContainer);
}

function army_vector(minute) {
    var entity = this;
    if (_.has(this.minutes, minute)) {
	return _.map(_.range(0,19), function(index) {
		unit_count = entity.minutes[minute]['u' + index];
		if (index == 0) return 50 * unit_count;
		return unit_count * PROTOSS_VALUES[index - 1];
	    });
    }  
    return _.map(_.range(0,19), function() { return 0; });
}

function unit_counts(minute) {
    var entity = this;
    if (_.has(this.minutes, minute)) {
	return _.map(_.range(0,19), function(index) {
		unit_count = entity.minutes[minute]['u' + index];
		return unit_count;
	    });
    }  
    return _.map(_.range(0,19), function() { return 0; });
}


function stat(minute, statname) {
    if (_.has(this.minutes, minute)) {
	return this.minutes[minute][statname];
    }
    return null;
}

function scout_init() {
    var start = Date.now();

    gamerecords = [];     // list of gamerecords, each having player entity, opponent entity and match
    matches = {};         // map from match id to match
    entities = [];        // list of entities
    var entities_by_id = {};  // map of entity id to entity
    match_winner = {};    // map from match id to winner entity
    match_loser = {};     // map from match id to loser entity
    // each entity is enhanced with a minutes map which maps from a
    // numeric minute to some info about what happened in that minute

    entity_non_numerics = ["race", "chosen_race", "win"]

    d3.csv(matches_url(), function(error, csv_matches) {
        csv_matches.forEach( function(match, index) {
            match.play_date = new Date(match.play_date);
            match.id = +match.id
            match.average_league = +match.average_league
            match.duration_minutes = +match.duration_minutes
	    match.fum = 0;
            matches[match.id] = match
        });
	d3.csv(fum_url(), function(error, fums) {
		fums.forEach( function(fum) {
			fum.esdb_id = +fum.esdb_id;
			if (fum.esdb_id in matches && typeof matches[fum.esdb_id] !== 'undefined') {
			    matches[fum.esdb_id].fum = 1;
			}
		    });
	    });

        d3.csv(entities_url(), function(error, csv_ents) {
            csv_ents.forEach( function(entity, index) {
                for (var key in entity) {
                    if (!(_.contains(entity_non_numerics, key))) {
                        entity[key] = +entity[key];
                    }
                }
		entity.minutes = {};
		entity.stat = stat;
		entity.unit_counts = unit_counts;
		entity.army_vector = army_vector;
                entities.push(entity);
                entities_by_id[entity.entity_id] = entity;
                if (entity.match_id in matches) {
                    match = matches[entity.match_id];
                    if (entity.win == "true") {
                        match_winner[entity.match_id] = entity;
                    } else if (entity.win == "false") {
                        match_loser[entity.match_id] = entity;
                    }
                    if (entity.match_id in match_winner && entity.match_id in match_loser) {
                        gamerecords.push({'player': match_winner[entity.match_id],
                                          'opponent': match_loser[entity.match_id],
                                          'match': match})
                        gamerecords.push({'player': match_loser[entity.match_id],
                                          'opponent': match_winner[entity.match_id],
                                          'match': match})
                    }
                    
                }
            });
	    d3.csv(minutes_url(), function(error, csv_minutes) {

	      csv_minutes.forEach( function(minute, index) {
                for (var key in minute) {
                  minute[key] = +minute[key];
                }
		var entity = entities_by_id[minute.entity_id];
		if (! _.isUndefined(entity)) {
		  entity.minutes[minute.minute] = minute;
                }
	      });

            var rec_built = Date.now();
            gr_cf = crossfilter(gamerecords);
            cf_all = gr_cf.groupAll();

            asDim = gr_cf.dimension(function(gr) { return gr.player.stat(8,'as') });
            asGrp = groupDJ(asDim.group(function(d) { return Math.floor(d / 100) * 100 }));

	    apmDim = gr_cf.dimension(function(gr) { return gr.player.apm });
	    apmGrp = groupDJ(apmDim.group(function(d) { return Math.floor(d / 10.0) * 10.0 }));

	    oppApmDim = gr_cf.dimension(function(gr) { return gr.opponent.apm });
	    oppApmGrp = groupDJ(oppApmDim.group(function(d) { return Math.floor(d / 10.0) * 10.0 }));

	    latencyDim = gr_cf.dimension(function(gr) { return gr.player.action_latency_real_seconds });
	    latencyGrp = groupDJ(latencyDim.group(function(d) { return Math.floor(d * 10.0) / 10.0 }));

	    oppLatencyDim = gr_cf.dimension(function(gr) { return gr.opponent.action_latency_real_seconds });
	    oppLatencyGrp = groupDJ(oppLatencyDim.group(function(d) { return Math.floor(d * 10.0) / 10.0 }));

            raceDim = gr_cf.dimension(function(gr) { return gr.player.race });
            raceGrp = groupDJ(raceDim.group());

            oppRaceDim = gr_cf.dimension(function(gr) { return gr.opponent.race });
            oppRaceGrp = groupDJ(oppRaceDim.group());

            winDim = gr_cf.dimension(function(gr) { return gr.player.win });
            winGrp = groupDJ(winDim.group());

            durDim = gr_cf.dimension(function(gr) { return Math.min(40, gr.match.duration_minutes) });
            durGrp = groupDJ(durDim.group(function(d) { return d }));

            dateDim = gr_cf.dimension(function(gr) {
                return gr.match.play_date.getTime();
            });
            dateGrp = groupDJ(dateDim.group());
            
            oasDim = gr_cf.dimension(function(gr) { return gr.opponent.stat(8,'as') });
            oasGrp = groupDJ(oasDim.group(function(d) { return Math.floor(d / 100) * 100 }));
            
            wsDim = gr_cf.dimension(function(gr) { return gr.player.stat(8,'u0') });
            wsGrp = groupDJ(wsDim.group(function(d) { return d }));

            owsDim = gr_cf.dimension(function(gr) { return gr.opponent.stat(8,'u0') });
            owsGrp = groupDJ(owsDim.group(function(d) { return d }));

            mb2Dim = gr_cf.dimension(function(gr) { return Math.floor(gr.player.miningbase_2 / 60) });
            mb2Grp = groupDJ(mb2Dim.group(function(d) { return d; }));

            omb2Dim = gr_cf.dimension(function(gr) { return Math.floor(gr.opponent.miningbase_2 / 60) });
            omb2Grp = groupDJ(omb2Dim.group(function(d) { return d; }));

            lgDim = gr_cf.dimension(function(gr) { return gr.match.average_league });
            lgGrp = groupDJ(lgDim.group(function(d) { return d; }));

            fumDim = gr_cf.dimension(function(gr) { return gr.match.fum });
            fumGrp = groupDJ(fumDim.group(function(d) { return d; }));

            playerDim = gr_cf.dimension(function(gr) { return gr.player.identity_id });

            var dims_built = Date.now();
            
            // Render the initial lists.
            list = d3.selectAll(".list#match-list tbody")
                .data([matchList]);

            d3.selectAll("#total")
                .text(formatNumber(gr_cf.size()));

            $("#player_id").each( function(index, playerIdInput) {
                $(playerIdInput).change( function() {
                    var playerId = $(this).val();
                    if (playerId && playerId.length > 0) {
                        playerDim.filter(playerId);
                    } else {
                        playerDim.filterAll();
                    }
                    renderAll();
                })
            });

            $("#unit_num").each( function(index, unitNumInput) {
                $(unitNumInput).change( function() {
			if (typeof unitCountDim !== 'undefined') {
			    unitCountDim.dispose();
			    delete unitCountDim;
			}
			var unitNum = $(this).val();
			if (unitNum && unitNum.length > 0) {
			    unitNum = +unitNum;
			    unitMinute = +$("#unit_minute").val()
			    unitCountDim = gr_cf.dimension(function(gr) { return gr.player.unit_counts(unitMinute)[unitNum]; });
			}
                    renderAll();
                    });
		});
		    
            $("#unit_count").each( function(index, unitCountInput) {
                $(unitCountInput).change( function() {
			var unitCount = $(this).val();
			if (unitCount && unitCount.length > 0 && (typeof unitCountDim !== 'undefined')) {
			    unitCount = +unitCount;
			    unitCountDim.filterRange([unitCount, Infinity]);
			    renderAll();
			}
		    });
		});


            var tooltip = function () {
                return this.x + ': ' + this.y + ' games, ' + this.point.winpct + '% win.';
            };

            add_filterchart($('#filtercharts'), lgDim, lgGrp, 'Game league', [0, 6], tooltip);
            add_filterchart($('#filtercharts'), asDim, asGrp, 'Player\'s Army Strength @ X minutes', [0, 2500], tooltip);
            add_filterchart($('#filtercharts'), oasDim, oasGrp, 'Opponent\'s Army Strength @ X minutes', [0, 2500], tooltip);
            add_filterchart($('#filtercharts'), wsDim, wsGrp, 'Player\'s Workers @ X minutes', [0, 60], tooltip);
            add_filterchart($('#filtercharts'), owsDim, owsGrp, 'Opponent\'s Workers @ X minutes', [0, 60], tooltip);
            add_filterchart($('#filtercharts'), mb2Dim, mb2Grp, 'Player\'s 2nd Mining Base Timing', [0, 15], tooltip);
            add_filterchart($('#filtercharts'), omb2Dim, omb2Grp, 'Opponent\'s 2nd Mining Base Timing', [0, 15], tooltip);
            add_filterchart($('#filtercharts'), durDim, durGrp, 'Game Length, minutes', [0, 40], tooltip);
            add_filterchart($('#filtercharts'), latencyDim, latencyGrp, 'Action Latency, seconds', [0, 1], tooltip);
            add_filterchart($('#filtercharts'), oppLatencyDim, oppLatencyGrp, 'Opponent\'s Action Latency, seconds', [0, 1], tooltip);
            add_filterchart($('#filtercharts'), apmDim, apmGrp, 'APM', [0, 200], tooltip);
            add_filterchart($('#filtercharts'), oppApmDim, oppApmGrp, 'Opponent\'s APM', [0, 200], tooltip);
            add_filterchart($('#filtercharts'), fumDim, fumGrp, 'Frequent Uploader', [-0.1, 1.1], tooltip);
            add_filterchart($('#filtercharts'), dateDim, dateGrp, 'Game Date', [Date.UTC(2014, 6, 25), Date.UTC(2014, 8, 15)], tooltip);
            
            renderAll();

            var end = Date.now();
            var total_time = end - start;
            console.log("init took " + (total_time / 1000) + " seconds");

            var build_rec = (rec_built - start) / 1000;
            var build_dims = (dims_built - rec_built) / 1000;
            var build_chart = (end - dims_built) / 1000;
            console.log(build_rec, build_dims, build_chart);
            });
        });
    });


}

// TODO do this with angular rather than d3, so we can ditch d3 someday
function playerList(elem) {
    var playersByNumGames = numGamesDim.top(80);

    elem.each(function() {
        var player = d3.select(this).selectAll(".player")
            .data(playersByNumGames);

        var playerEnter = player.enter().append("tr").attr("class", "player");
        playerEnter.append("td").attr("class", "num").append("a");
        playerEnter.append("td").attr("class", "race");
        playerEnter.append("td").attr("class", "league");
        playerEnter.append("td").attr("class", "apm");
        playerEnter.append("td").attr("class", "num_games");
        playerEnter.append("td").attr("class", "winpct");

        player.exit().remove();

        player.select('.num a').text(function(p) { return p.identity_id });
        player.select('.num a').attr("href", function(p) { return "http://ggtracker.com/players/" + p.identity_id });
        player.select('.race').text(function(p) { return p.race(); });
        player.select('.league').text(function(p) { return p.league(); });
        player.select('.apm').text(function(p) { return p.apm(); });
        player.select('.num_games').text(function(p) { return p.num_games.total; });
        player.select('.winpct').text(function(p) { return p.win_pct('total'); });
    });
}

function scout_players_init() {
    var start = Date.now();

/**
 * Each player has the following defined:
 *
 * identity_id
 * num_games[matchup]   <-- where matchup is each of: PvT, PvZ, PvP...TvT and total
 * num_wins[matchup]
 * sum_apm     <-- sum of apm over all games
 * sum_league  <-- sum of league over all games
 * num_games_by_race[chosen_race]   <-- where chosen_race is P, T, Z, R
 *
 * apm()
 * league()
 * win_pct(matchup)
 * race()
 */

    matches = {};
    entities = [];
    players = {};
    match_winner = {};
    match_loser = {};
    gamerecords = [];


    var matchup_zero = {'PvT': 0,
                        'PvZ': 0,
                        'PvP': 0,
                        'TvT': 0,
                        'TvP': 0,
                        'TvZ': 0,
                        'ZvZ': 0,
                        'ZvT': 0,
                        'ZvP': 0,
                        'total': 0};
    var race_zero = {'P':0 , 'T':0, 'Z':0, 'R':0};

    var apm = function() {
        if (this.num_games.total == 0) return 0;
        return Math.floor(this.sum_apm / this.num_games.total);
    }
    var league = function() {
        if (this.num_games.total == 0) return 0;
        return Math.floor(10 * this.sum_league / this.num_games.total) / 10.0;
    }
    var win_pct = function(matchup) {
        if (this.num_games[matchup] == 0) return 0;
        return Math.floor(1000.0 * this.num_wins[matchup] / this.num_games[matchup]) / 10.0;
    }
    var race = function() {
        var num_most_played = _.max(_.values(this.num_games_by_race));
        var race_most_played = _.find(_.pairs(this.num_games_by_race), function(kv) { return kv[1] == num_most_played; })[0];
        return race_most_played;
    }

    // record
    record_player_in_match = function(match, player_entity, opponent_entity) {
        var matchup = player_entity.race + 'v' + opponent_entity.race;

        var player;
        if (!(player_entity.identity_id in players)) {
            player = { identity_id: player_entity.identity_id,
                       num_games: _.clone(matchup_zero),
                       num_wins: _.clone(matchup_zero),
                       num_games_by_race: _.clone(race_zero),
                       sum_apm: 0,
                       sum_league: 0,
                       apm: apm,
                       league: league,
                       win_pct: win_pct,
                       race: race
                     };
            players[player_entity.identity_id] = player;
        } else {
            player = players[player_entity.identity_id];
        }
        player.num_games[matchup]++;
        player.num_games['total']++;
        player.num_games_by_race[player_entity.chosen_race]++;
        if (player_entity.win == 'true') {
            player.num_wins[matchup]++;
            player.num_wins['total']++;
        }
        player.sum_apm += player_entity.apm;
        player.sum_league += match.average_league;
    }

    entity_non_numerics = ["race", "chosen_race", "win"]

    d3.csv(matches_url(), function(error, csv_matches) {
        csv_matches.forEach( function(match, index) {
            match.play_date = new Date(match.play_date);
            match.id = +match.id
            match.average_league = +match.average_league
            match.duration_minutes = +match.duration_minutes
            matches[match.id] = match
        });
        d3.csv(entities_url(), function(error, csv_ents) {
            csv_ents.forEach( function(entity, index) {

                // convert numeric fields to be actual numbers
                for (var key in entity) {
                    if (!(_.contains(entity_non_numerics, key))) {
                        entity[key] = +entity[key];
                    }
                }

                if (entity.match_id in matches) {
                    match = matches[entity.match_id];
                    if (entity.win == "true") {
                        match_winner[entity.match_id] = entity;
                    } else if (entity.win == "false") {
                        match_loser[entity.match_id] = entity;
                    }

                    if (entity.match_id in match_winner && entity.match_id in match_loser) {
                        record_player_in_match(match, match_winner[entity.match_id], match_loser[entity.match_id]);
                        record_player_in_match(match, match_loser[entity.match_id], match_winner[entity.match_id]);
                    }
                }
            });

            // get rid of players with less than 10 games, not useful here
            players = _.values(players);
            players = _.filter(players, function(player) { return player.num_games.total >= 10 });

            var rec_built = Date.now();
            p_cf = crossfilter(players);
            cf_all = p_cf.groupAll();

            raceDim = p_cf.dimension(function(p) { return p.race(); });
            raceGrp = groupDJ(raceDim.group());

            numGamesDim = p_cf.dimension(function(p) { return p.num_games.total; });
            numGamesGrp = groupDJ(numGamesDim.group(function(d) { return 5 * Math.floor(d / 5); }));

            leagueDim = p_cf.dimension(function(p) { return p.league(); });
            leagueGrp = groupDJ(leagueDim.group(function(d) { return Math.floor(d * 2) / 2; }));

            winPctDim = p_cf.dimension(function(p) { return p.win_pct('total'); });
            winPctGrp = groupDJ(winPctDim.group(function(d) { return 5 * Math.floor(d / 5); }));

            apmDim = p_cf.dimension(function(p) { return p.apm(); });
            apmGrp = groupDJ(apmDim.group(function(d) { return 5 * Math.floor(d / 5); }));

            var dims_built = Date.now();
            
            // Render the initial lists.
            list = d3.selectAll(".list tbody")
                .data([playerList]);

if (false) {

            d3.selectAll("#total")
                .text(formatNumber(p_cf.size()));
}

            tooltip = function () {
		console.log("tooltip!");
                return this.x + ': ' + this.y + ' players.';
            };

            add_filterchart($('#filtercharts'), numGamesDim, numGamesGrp, 'Number of Games Played', [0, 150], false, tooltip);
            add_filterchart($('#filtercharts'), leagueDim, leagueGrp, 'League', [0, 6], false, tooltip);
            add_filterchart($('#filtercharts'), winPctDim, winPctGrp, 'Win Percentage', [0, 100], false, tooltip);
            add_filterchart($('#filtercharts'), apmDim, apmGrp, 'APM', [0, 300], false, tooltip);
            
            renderAll();

            var end = Date.now();
            var total_time = end - start;
            console.log("init took " + (total_time / 1000) + " seconds");

            var build_rec = (rec_built - start) / 1000;
            var build_dims = (dims_built - rec_built) / 1000;
            var build_chart = (end - dims_built) / 1000;
            console.log(build_rec, build_dims, build_chart);
        });
    });


}
