var formatNumber = d3.format(",d"),
formatChange = d3.format("+,d"),
formatDate = d3.time.format("%B %d, %Y"),
formatTime = d3.time.format("%I:%M %p");

function render(method) {
    d3.select(this).call(method);
}

function renderAll() {
    chart.each(render);
    d3.select("#active").text(formatNumber(gr_all.value()));
    numWins = _.find(winGrp.all(), function(grp) {return grp.key}).value
    pctWins = Math.round(1000.0 * numWins / gr_all.value()) / 10.0;
    console.log("wins:", numWins, pctWins);
    d3.select("#winrate").text(pctWins);
}

window.filter = function(filters) {
    filters.forEach(function(d, i) { charts[i].filter(d); });
    renderAll();
};

window.reset = function(i) {
    charts[i].filter(null);
    renderAll();
};


function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {top: 10, right: 10, bottom: 20, left: 10},
    x,
    y = d3.scale.linear().range([100, 0]),
    id = barChart.id++,
    axis = d3.svg.axis().orient("bottom"),
    brush = d3.svg.brush(),
    brushDirty,
    dimension,
    group,
    round;

    function chart(div) {
        var width = x.range()[1],
        height = y.range()[0];

        y.domain([0, group.top(1)[0].value]);

        div.each(function() {
            var div = d3.select(this),
            g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);

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

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
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
        });

        function barPath(groups) {
            var path = [],
            i = -1,
            n = groups.length,
            d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
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
        div.select(".title a").style("display", null);
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
    });

    brush.on("brushend.chart", function() {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", "none");
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

function scout_init() {
    matches = {};
    entities = [];
    match_winner = {};
    match_loser = {};
    gamerecords = [];
    $.getJSON("http://localhost:3000/matches.json", function( data ) {
        $.each( data, function( index, match ) {
            match.play_date = new Date(match.play_date);
            matches[match.id] = match
        });
        $.getJSON("http://localhost:3000/ents.json", function( data ) {
            $.each( data, function( index, entity ) {
                entities.push(entity);
                if (entity.match_id in matches) {
                    match = matches[entity.match_id];
                    if (entity.win == 1) {
                        match_winner[entity.match_id] = entity;
                    } else if (entity.win == 0) {
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
            gr_cf = crossfilter(gamerecords);
            gr_all = gr_cf.groupAll();

            raceDim = gr_cf.dimension(function(gr) { return gr.player.race });
            raceGrp = raceDim.group();

            oppRaceDim = gr_cf.dimension(function(gr) { return gr.opponent.race });
            oppRaceGrp = oppRaceDim.group();

            winDim = gr_cf.dimension(function(gr) { return gr.player.win });
            winGrp = winDim.group();

            durDim = gr_cf.dimension(function(gr) { return Math.min(40, gr.match.duration_minutes) });
            durGrp = durDim.group(function(d) { return Math.floor(d / 5) * 5 });

            dateDim = gr_cf.dimension(function(gr) { return gr.match.play_date });
            dateGrp = dateDim.group();
            
            asDim = gr_cf.dimension(function(gr) { return gr.player.as8 });
            asGrp = asDim.group(function(d) { return Math.floor(d / 100) * 100 });

            oasDim = gr_cf.dimension(function(gr) { return gr.opponent.as8 });
            oasGrp = oasDim.group(function(d) { return Math.floor(d / 100) * 100 });
            
            wsDim = gr_cf.dimension(function(gr) { return gr.player.w8 });
            wsGrp = wsDim.group(function(d) { return Math.floor(d / 5) * 5 });

            owsDim = gr_cf.dimension(function(gr) { return gr.opponent.w8 });
            owsGrp = owsDim.group(function(d) { return Math.floor(d / 5) * 5 });
            
            charts = [
                barChart()
                    .dimension(asDim)
                    .group(asGrp)
                    .x(d3.scale.linear()
                       .domain([0, 1500])
                       .rangeRound([0, 10 * 15])),

                barChart()
                    .dimension(oasDim)
                    .group(oasGrp)
                    .x(d3.scale.linear()
                       .domain([0, 1500])
                       .rangeRound([0, 10 * 15])),

                barChart()
                    .dimension(wsDim)
                    .group(wsGrp)
                    .x(d3.scale.linear()
                       .domain([0, 50])
                       .rangeRound([0, 10 * 20])),

                barChart()
                    .dimension(owsDim)
                    .group(owsGrp)
                    .x(d3.scale.linear()
                       .domain([0, 50])
                       .rangeRound([0, 10 * 20])),

                barChart()
                    .dimension(durDim)
                    .group(durGrp)
                    .x(d3.scale.linear()
                       .domain([0, 40])
                       .rangeRound([0, 20 * 8])),

                barChart()
                    .dimension(dateDim)
                    .group(dateGrp)
                    .round(d3.time.day.round)
                    .x(d3.time.scale()
                       .domain([new Date(2014, 7, 1), new Date(2014, 8, 3)])
                       .rangeRound([0, 10 * 40])),
            ];

            chart = d3.selectAll(".chart")
                .data(charts)
                .each(function(chart) { chart.on("brush", renderAll).on("brushend", renderAll); });

            d3.selectAll("#total")
                .text(formatNumber(gr_cf.size()));

            $("#player_race .selector").each( function(index, raceSelector) {
                $(raceSelector).click( function() {
                    raceDim.filter(this.textContent);
                    renderAll();
                })
            });
            $("#opponent_race .selector").each( function(index, raceSelector) {
                $(raceSelector).click( function() {
                    oppRaceDim.filter(this.textContent);
                    renderAll();
                })
            });

            renderAll();

        });
    });


}
