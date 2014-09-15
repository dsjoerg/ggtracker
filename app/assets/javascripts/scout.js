var formatNumber = d3.format(",d"),
formatChange = d3.format("+,d"),
formatDate = d3.time.format("%B %d, %Y"),
formatTime = d3.time.format("%I:%M %p");

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

function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
    x,
    y = d3.scale.linear().range([100, 0]),
    id = barChart.id++,
    axis = d3.svg.axis().orient("bottom").ticks(4),
//    vaxis = d3.svg.axis().orient("left").ticks(4).scale(y),
    brush = d3.svg.brush(),
    brushDirty,
    dimension,
    group,
    round;

    function chart(div) {
        var width = x.range()[1],
        height = y.range()[0];

        var topValue = group.top(1)[0].value;
        if (_.has(topValue, "wins")) {
            y.domain([0, 100]);
        } else {
            y.domain([0, topValue.value]);
        }

        div.each(function() {
            var div = d3.select(this),
            g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                // RESET link, hidden at first
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .attr("class", "filtered")
                    .text("reset")
                    .style("display", "none");

                limits = div.select(".title").append("div")
                             .attr("class", "filtered")
                             .style("display", "none")
                             .text("from ");

                lower_limit = limits.append("span")
                                     .text("-")
                                     .attr("class", "lower");

                limits.append("span").text(" to ");

                upper_limit = limits.append("span")
                                     .text("-")
                                     .attr("class", "upper");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

/**   WHY IS THIS HERE
                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);
*/

                g.selectAll(".bar")
                    .data(["background", "foreground"])
                    .enter().append("path")
                    .attr("class", function(d) { return d + " bar"; })
                    .datum(group.all());

                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);

/**  Y AXIS WAS DISTRACTING AS IT CHANGED CONSTANTLY
                g.append("g")
                    .attr("class", "axis")
                    .attr("class", "vaxis")
                    .attr("transform", "translate(" + width + ", 0)");
*/

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.selectAll(".title .filtered").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", 0)
                        .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            g.selectAll(".bar").attr("d", barPath);
//            g.selectAll(".vaxis").call(vaxis);
        });

        function barPath(groups) {
            var path = [],
            i = -1,
            n = groups.length,
            barwidth = Math.floor(width / n) + 1,
            d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value.value), "h", barwidth, "V", height);
            }
            return path.join("");
        }

        function resizePath(d) {
            var e = +(d == "e"),
            x = e ? 1 : -1,
            y = height / 3;
            return "M" + (.5 * x) + "," + y
                + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6)
                + "V" + (2 * y - 6)
                + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y)
                + "Z"
                + "M" + (2.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8)
                + "M" + (4.5 * x) + "," + (y + 8)
                + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function() {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.selectAll(".title .filtered").style("display", null);
    });

    brush.on("brush.chart", function() {
        var g = d3.select(this.parentNode),
        extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".lower").text(Math.floor(extent[0]));
        div.select(".upper").text(Math.floor(extent[1]));
    });

    brush.on("brushend.chart", function() {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.selectAll(".title .filtered").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
        }
    });

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        vaxis.scale(y);
        return chart;
    };

    chart.dimension = function(_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function(_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function(_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
    };

    chart.round = function(_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
};

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

function filter_chart(element, dimension, group, domain) {
    element.group = group;
    element.dimension = dimension;
    element.djchart = $(element).parents('.djchart');
    var dateAxis = (domain[0] > Date.UTC(2010, 1, 1));

    element.render = function () {
      var grp = this.group.all();
      if (typeof grp !== 'undefined') {
        var xyValues = _.map(grp, function (g) { return [g.key, g.value.value]; })
        this.chart.series[0].setData(xyValues);
      }
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

      event.preventDefault();
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
      credits: {enabled:false},
      plotOptions: {
          column:{
              animation:false,
              color:'steelblue',
              groupPadding: 0,
              pointPadding: 0,
              borderWidth: 0,
              pointPlacement: 'on',
              marker: {
                  enabled:true,
                  radius:4,
                  symbol: "circle",
                  lineColor: "#111",
                  lineWidth:1,
                  fillColor:"#222",
                  states: {hover:{enabled:true}}
              },
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

  filter_chart(thechart[0], dimension, group, domain);

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
            durGrp = groupWinPct(durDim.group(function(d) { return d }));

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

            add_filterchart($('#filtercharts'), lgDim, lgGrp, 'Game league', [0, 6]);
            add_filterchart($('#filtercharts'), asDim, asGrp, 'Player\'s Army Strength @ X minutes', [0, 2500]);
            add_filterchart($('#filtercharts'), oasDim, oasGrp, 'Opponent\'s Army Strength @ X minutes', [0, 2500]);
            add_filterchart($('#filtercharts'), wsDim, wsGrp, 'Player\'s Workers @ X minutes', [0, 60]);
            add_filterchart($('#filtercharts'), owsDim, owsGrp, 'Opponent\'s Workers @ X minutes', [0, 60]);
            add_filterchart($('#filtercharts'), mb2Dim, mb2Grp, 'Player\'s 2nd Mining Base Timing', [0, 15]);
            add_filterchart($('#filtercharts'), omb2Dim, omb2Grp, 'Opponent\'s 2nd Mining Base Timing', [0, 15]);
            add_filterchart($('#filtercharts'), durDim, durGrp, 'Game Length, minutes', [0, 40]);
            add_filterchart($('#filtercharts'), dateDim, dateGrp, 'Game Date', [Date.UTC(2014, 7, 1), Date.UTC(2014, 8, 3)]);
            
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
