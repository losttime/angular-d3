var meteoriteModule = angular.module('meteoriteModule');

meteoriteModule.service('meteoriteData', ['$http', '$q', function($http, $q) {
	var baseUrl = 'https://data.nasa.gov/resource/gh4g-9sfh.json';

	var getData = function(params) {
		return $q(function(resolve, reject) {
			var paramSet = [];
			for (var key in params) {
				paramSet.push(key + '=' + params[key]);
			}
			var request = {
				method: 'GET',
				url: baseUrl + '?' + paramSet.join('&')
			};
			$http(request)
					.then(function(response) {
						console.log('response', response);
						resolve(response.data);
					}, function(error) {
						console.log('error', error);
						reject(error);
					});
		});
	};

	return {
		getData: getData
	};
}]);
