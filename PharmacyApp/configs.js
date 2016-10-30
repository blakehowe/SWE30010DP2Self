//configure the route
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/add', {
			templateUrl: 'templates/addSalesView.html',
			controller: 'addController'
		})
		.when('/edit', {
			templateUrl: 'templates/editSalesView.html',
			controller: 'editController'
		})
		.otherwise({
			redirectTo: '/edit'
		});
}]);