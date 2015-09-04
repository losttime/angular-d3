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
			var scope = this;

			this.vm = {};
			this.vm.start = 2000;
			this.vm.end = 2015;

			var width = 900;
			var height = 500;

			var rawSvg = $element.find("svg")[0];
			var svg = d3.select(rawSvg);

			var xScale, yScale;

			var xAxis = svg.append("g")
				.attr("class","x axis")
				.attr("transform","translate(85,470)");

			var yAxis = svg.append("g")
				.attr("class","y axis")
				.attr("transform","translate(75,10)");

			var bars = svg.append("g")
				.attr("class","bars")
				.attr("transform","translate(85,10)");

			var tip = svg.append('g')
				.attr('class','tip')
				.attr("transform","translate(-100,-100)");
			tip.append('rect')
				.attr('fill', 'grey')
				.attr('width', 24)
				.attr('height', 24);
			tip.append('text')
				.attr('x', 12)
				.attr('y', 17)
				.attr('width', 24)
				.attr('text-anchor', 'middle');

			var popTip = function(d) {
				var tip = svg.select('.tip');
				if (d) {
					var x = 80 + xScale(new Date(d.key));
					var y = d3.min([459, yScale(d.values.length)]);

					tip.attr('transform', 'translate('+x+','+y+')');
					tip.select('text')
						.text(d.values.length);
				} else {
					tip.attr('transform', 'translate(-100, -100)');
				}
			};

			var updateChart = function(dataset) {
				var nestedData = d3.nest()
					.key(function(d) {
						return new Date(d.year);
					})
					.sortKeys(d3.ascending)
					.entries(dataset);

				xScale = d3.time.scale()
					.domain([d3.min(nestedData, function(d) {
						return new Date(d.key);
					}), d3.max(nestedData, function(d) {
						return new Date(d.key);
					})])
					.rangeRound([0, 815]);

				yScale = d3.scale.linear()
					.domain([0,
						d3.max(nestedData, function(d) {
							return d.values.length;
						})
					])
					.range([460, 0]);

				var xAxisConfig = d3.svg.axis()
					.scale(xScale)
					.orient("bottom")
					.ticks(10);

				var yAxisConfig = d3.svg.axis()
					.scale(yScale)
					.orient("left")
					.ticks(10);

				xAxis.call(xAxisConfig);
				yAxis.call(yAxisConfig);

				var rects = bars.selectAll('rect').data(nestedData);
				rects.enter()
					.append('rect')
					.attr('x', function(d) {
						return xScale(new Date(d.key));
					})
					.attr('y', function(d) {
						return d3.min([459, yScale(d.values.length)]);
					})
					.attr('data', function(d) {
						return d;
					})
					.attr('width', 15)
					.attr('height', function(d) {
						return 460 - d3.min([459, yScale(d.values.length)]);
					})
					.attr('stroke', 'white')
					.on('mouseover', function(d) {
						popTip(d);
					})
					.on('mouseout', function(d) {
						popTip();
					});
				rects.exit()
					.remove();

				rects.transition()
					.duration(500)
					.attr('x', function(d) {
						var x = xScale(new Date(d.key));
						return x;
					})
					.attr('y', function(d) {
						return d3.min([459, yScale(d.values.length)]);
					})
					.attr('height', function(d) {
						return 460 - d3.min([459, yScale(d.values.length)]);
					});
			};

			var getData = function(params) {
				params = params || {};
				params.$where = 'year >= \'' + scope.vm.start + '-01-01T00:00:00\' AND year <= \'' + scope.vm.end + '-12-31T23:59:59\'';
				params.$order = 'year';
				params.fall = 'Fell';

				meteoriteData.getData(params)
					.then(function(data) {
						updateChart(data);
					}, function(error) {
						console.error('error', error);
					});
			};

			this.vm.dateRangeChanged = function() {
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
