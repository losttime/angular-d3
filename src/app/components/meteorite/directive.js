var meteoriteModule = angular.module('meteoriteModule');

meteoriteModule.directive('meteoriteChart', ['meteoriteData', function(meteoriteData) {
	return {
		restrict: 'E',
		templateUrl: 'app/components/meteorite/template.html',
		scope: {},
		bindToController: {
			vm: '='
		},
		controllerAs: 'ctrl',
		controller: function($window, $element) {
			var d3 = $window.d3;
			console.log('d3', d3);
			var scope = this;

			this.vm = {};
			this.vm.start = 2000;
			this.vm.end = 2015;

			var width = 900;
			var height = 500;

			var rawSvg = $element.find("svg")[0];
			var svg = d3.select(rawSvg);

			var updateChart = function(dataset) {
				$element.find('svg').children().remove();

				var nestedData = d3.nest()
					.key(function(d) {
						return new Date(d.year);
					})
					.sortKeys(d3.ascending)
					.entries(dataset);

				var xScale = d3.time.scale()
					.domain([d3.min(nestedData, function(d) {
						return new Date(d.key);
					}), d3.max(nestedData, function(d) {
						return new Date(d.key);
					})])
					.rangeRound([0, 815]);

				var yScale = d3.scale.linear()
					.domain([0,
						d3.max(nestedData, function(d) {
							return d.values.length;
						})
					])
					.range([460, 0]);

				var xAxis = d3.svg.axis()
							   .scale(xScale)
							   .orient("bottom")
							   .ticks(10);

				var yAxis = d3.svg.axis()
							   .scale(yScale)
							   .orient("left")
							   .ticks(10);

				svg.append("g")
					.attr("class","x axis")
					.attr("transform","translate(85,470)")
					.call(xAxis);

				svg.append("g")
					.attr("class","y axis")
					.attr("transform","translate(85,10)")
					.call(yAxis);

				var rects = svg.selectAll('rect')
					.data(nestedData)
					.enter()
						.append('rect')
						.attr('x', function(d) {
							return 85 + xScale(new Date(d.key));
						})
						.attr('y', function(d) {
							return 10 + d3.min([459, yScale(d.values.length)]);
						})
						.attr('width', 15)
						.attr('height', function(d) {
							return 460 - d3.min([459, yScale(d.values.length)]);
						})
						.attr('stroke', 'white');
						// .style('fill-opacity', 1);
			};

			var getData = function(params) {
				params = params || {};
				// params.$where = 'year between \'' + scope.vm.start + '-01-01T00:00:00\' and \'' + scope.vm.end + '-12-31T23:59:59\'';
				params.$where = 'year >= \'' + scope.vm.start + '-01-01T00:00:00\' AND year <= \'' + scope.vm.end + '-12-31T23:59:59\'';
				params.$order = 'year';
				params.fall = 'Fell';

				meteoriteData.getData(params)
					.then(function(data) {
						console.log('data', data);
						updateChart(data);
					}, function(error) {
						console.log('error', error);
					});
			};

			this.vm.dateRangeChanged = function() {
				console.log('date range changed');
				getData();
			};

			this.vm.starts = function(end) {
				var years = [];
				for (var i = 1700; i <= end; i++) {
					years.push(i);
				}
				return years;
			};
			this.vm.ends = function(start) {
				var years = [];
				for (var i = start; i <= 2015; i++) {
					years.push(i);
				}
				return years;
			};

			getData();
		}
	};
}]);
