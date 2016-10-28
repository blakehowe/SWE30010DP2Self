app.filter('ratingPercentage', ['$filter', function ($filter) {
	return function (input) {
		var result = null;
		if (input == 'N/A') {
			return input;
		}
		return (input * 10) + '%';
	};
}]);

app.filter('imdbURL', ['$filter', function ($filter) {
	return function (id) {
		return 'http://www.imdb.com/title/' + id;
	};
}]);

app.filter('watchedIcon', ['$filter', function ($filter) {
	return function (state) {
		//check state
		if (typeof (state) != "boolean") {
			state = false;
		}
		var icon;
		if (state == true) {
			icon = 'fa-check text-success';
		} else {
			icon = 'fa-times text-warning';
		}
		return icon;
	};
}]);

//change the url with the choice of actually refreshing the page or not.....
app.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
	var original = $location.path;
	$location.path = function (path, reload) {
		if (reload === false) {
			var lastRoute = $route.current;
			var un = $rootScope.$on('$locationChangeSuccess', function () {
				$route.current = lastRoute;
				un();
			});
		}
		return original.apply($location, [path]);
	};
}])