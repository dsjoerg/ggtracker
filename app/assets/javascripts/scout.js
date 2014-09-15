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
    list.each(render);
    d3.select("#active").text(formatNumber(gr_all.value()));
    numWins = _.find(winGrp.all(), function(grp) {return grp.key == "true"}).value.value
    pctWins = Math.round(1000.0 * numWins / gr_all.value()) / 10.0;
    //    console.log("wins:", numWins, pctWins);
    d3.select("#winrate").text(pctWins);
}

function matchList(elem) {
    var gamerecordsByDate = dateDim.top(80);

    elem.each(function() {
        var match = d3.select(this).selectAll(".match")
            .data(gamerecordsByDate);

        var matchEnter = match.enter().append("tr").attr("class", "match");
        matchEnter.append("td").attr("class", "id").append("a");
        matchEnter.append("td").attr("class", "result");

        match.exit().remove();

        match.select('.id a').text(function(gr) { return gr.match.id });
        match.select('.id a').attr("href", function(gr) { return "http://ggtracker.com/matches/" + gr.match.id });
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

function matches_url() {
    return data_host() + "/matches" + debug_suffix() + ".csv";
}

function entities_url() {
    return data_host() + "/ents" + debug_suffix() + ".csv";
}

function filter_chart(element, dimension, group, colorgroup, domain) {
    element.group = group;
    element.colorgroup = colorgroup;
    element.dimension = dimension;
    element.djchart = $(element).parents('.djchart');
    var dateAxis = (domain[0] > Date.UTC(2010, 1, 1));

    element.render = function () {
      var grp = this.group.all();
      var colorGrp = this.colorgroup.all();
      
      var xycolor = _.map(_.zip(grp, colorGrp), function (gs) {
          var winpct = gs[1].value.value;
          var color = winInterp(logistic((winpct - 50) / 10.0));
          return {x:gs[0].key, y:gs[0].value.value, color:color, winpct:winpct};
      });

      this.chart.series[0].setData(xycolor);
    }

    element.reset = function () {
      console.log('element reset!');
      this.chart.xAxis[0].removePlotBand('plot-band-1');
      this.dimension.filterAll();

      this.djchart.children(".filtered").css('visibility', 'hidden');
      renderAll();
    }

    element.range_select = function (event) {
      console.log("Selected", event.xAxis[0].min, event.xAxis[0].max, event);

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

    element.tooltip = function () {
      return this.x + ': ' + this.y + ' games, ' + this.point.winpct + '% win.';
    };

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
      tooltip: { formatter: element.tooltip },
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

function add_filterchart(element, dimension, group, title, domain) {

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

  var colorgroup = groupWinPct(group.clone());

  filter_chart(thechart[0], dimension, group, colorgroup, domain);

  element.append(chartContainer);
}

function scout_init() {
    var start = Date.now();

    matches = {};
    entities = [];
    match_winner = {};
    match_loser = {};
    gamerecords = [];

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
                for (var key in entity) {
                    if (!(_.contains(entity_non_numerics, key))) {
                        entity[key] = +entity[key];
                    }
                }
                entities.push(entity);
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
            var rec_built = Date.now();
            gr_cf = crossfilter(gamerecords);
            gr_all = gr_cf.groupAll();

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
            
            asDim = gr_cf.dimension(function(gr) { return gr.player.as8 });
            asGrp = groupDJ(asDim.group(function(d) { return Math.floor(d / 100) * 100 }));

            oasDim = gr_cf.dimension(function(gr) { return gr.opponent.as8 });
            oasGrp = groupDJ(oasDim.group(function(d) { return Math.floor(d / 100) * 100 }));
            
            wsDim = gr_cf.dimension(function(gr) { return gr.player.w8 });
            wsGrp = groupDJ(wsDim.group(function(d) { return d }));

            owsDim = gr_cf.dimension(function(gr) { return gr.opponent.w8 });
            owsGrp = groupDJ(owsDim.group(function(d) { return d }));

            mb2Dim = gr_cf.dimension(function(gr) { return Math.floor(gr.player.miningbase_2 / 60) });
            mb2Grp = groupDJ(mb2Dim.group(function(d) { return d; }));

            omb2Dim = gr_cf.dimension(function(gr) { return Math.floor(gr.opponent.miningbase_2 / 60) });
            omb2Grp = groupDJ(omb2Dim.group(function(d) { return d; }));

            lgDim = gr_cf.dimension(function(gr) { return gr.match.average_league });
            lgGrp = groupDJ(lgDim.group(function(d) { return d; }));

            playerDim = gr_cf.dimension(function(gr) { return gr.player.identity_id });

            var dims_built = Date.now();
            
            // Render the initial lists.
            list = d3.selectAll(".list tbody")
                .data([matchList]);

            d3.selectAll("#total")
                .text(formatNumber(gr_cf.size() / 2));

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

            add_filterchart($('#filtercharts'), lgDim, lgGrp, 'Game league', [0, 6]);
            add_filterchart($('#filtercharts'), asDim, asGrp, 'Player\'s Army Strength @ X minutes', [0, 2500]);
            add_filterchart($('#filtercharts'), oasDim, oasGrp, 'Opponent\'s Army Strength @ X minutes', [0, 2500]);
            add_filterchart($('#filtercharts'), wsDim, wsGrp, 'Player\'s Workers @ X minutes', [0, 60]);
            add_filterchart($('#filtercharts'), owsDim, owsGrp, 'Opponent\'s Workers @ X minutes', [0, 60]);
            add_filterchart($('#filtercharts'), mb2Dim, mb2Grp, 'Player\'s 2nd Mining Base Timing', [0, 15]);
            add_filterchart($('#filtercharts'), omb2Dim, omb2Grp, 'Opponent\'s 2nd Mining Base Timing', [0, 15]);
            add_filterchart($('#filtercharts'), durDim, durGrp, 'Game Length, minutes', [0, 40]);
            add_filterchart($('#filtercharts'), dateDim, dateGrp, 'Game Date', [Date.UTC(2014, 6, 25), Date.UTC(2014, 8, 15)]);
            
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
