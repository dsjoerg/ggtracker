
gg.controller('ScoutController', ['$scope', '$element', '$urlFilter',
  function ($scope, $element, $urlFilter) {
    $scope.race = '';
    $scope.filter = $urlFilter;
    $scope.vs_race = '';

    $scope.filter.onChange = function(){ 
      console.log('onChange!');
      $scope.filter.apply($scope);
      $scope.refresh(); 
    }

    $scope.refresh = function(params) {
      console.log('refresh!', params);
    }

    NUM_CLUSTERS = 10;

    $scope.compute_groups = function() {
	var start1 = Date.now();
	var start2 = Date.now();
	var all_gamerecords = dateDim.top(Infinity);
	var armies = _.map(all_gamerecords, function(gr) {
		return gr.player.army_vector(8);
	});
	var start3 = Date.now();
        kmeans_output = clusterfck.kmeans(armies, NUM_CLUSTERS);
	var end = Date.now();
	var total_time = end - start1;
	console.log("kmeans took " + (total_time / 1000) + " seconds");

	var centroids = kmeans_output[0];
	var clusters = kmeans_output[1];
	var assignment = kmeans_output[2];

	// make groups an array of empty arrays, one for each cluster
	var cluster_gamerecords = _.map(clusters, function(){return []});

	// put the gamerecords for each cluster into its respective array
	_.each(assignment, function(gr_assign, index) {
		cluster_gamerecords[gr_assign].push(all_gamerecords[index]);
	    });

	// then compute $scope.groups as aggregate functions of arrays of gamerecords
	var groupstats = _.map(clusters, function(cluster, cluster_index) {
		var groupstat = { count: cluster_gamerecords[cluster_index].length,
		                  gamerecords: cluster_gamerecords[cluster_index]
		};
		var armySum = _.map(_.range(0,19), function() { return 0.0 });
		var numWins = 0;
		_.each(cluster_gamerecords[cluster_index], function(gamerecord) {
			_.each(_.range(0,19), function(army_index) {
				armySum[army_index] += gamerecord.player.stat(8, 'u' + army_index);
			    });
			if (gamerecord.player.win == 'true') {
			    numWins++;
			}
		    });
		armySum = _.map(armySum, function(unit_count) {
			var average_count = unit_count / groupstat.count;
			if (average_count < 0.1) {
			    return '';
			}
			if (average_count >= 10.0) {
			    return Math.round(average_count);
			}
			return Math.floor(average_count * 10.0) / 10.0;

		    });
		groupstat.unit_counts = armySum;
		groupstat.winPct = Math.floor(100.0 * numWins / groupstat.count);
		groupstat.click = function() {
		    //		    console.log("groupstat clicked!", this);
		    $scope.groupsub = this.gamerecords;
		};
		
		return groupstat;
	    });

	$scope.groupstats = _.sortBy(groupstats, function(groupstat) {
		return -1 * groupstat.winPct;
	    });
    }

    $scope.$watch('race + vs_race', function(v) {
      $scope.filter.params.race = $scope.race;
      $scope.filter.params.vs_race = $scope.vs_race;

        if (typeof raceDim !== 'undefined') {
            if (_.isString($scope.race) && ($scope.race.length > 0)) {
                raceDim.filter($scope.race[0].toUpperCase());
            } else {
                raceDim.filterAll();
            }
        }
        if (typeof oppRaceDim !== 'undefined') {
            if (_.isString($scope.vs_race) && ($scope.vs_race.length > 0)) {
                oppRaceDim.filter($scope.vs_race[0].toUpperCase());
            } else {
                oppRaceDim.filterAll();
            }
        }
        renderAll();
    });
  }
]);
