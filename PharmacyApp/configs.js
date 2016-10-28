//configure the route
app.config(['$routeProvider', function ($routeProvider) {
	$routeProvider.when('/add', {
		templateUrl: 'templates/addSalesView.html',
		controller: 'addController'
	}).
	otherwise({
		redirectTo: '/browse'
	});;
}]);

//configure local storage
app.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
	localStorageServiceProvider.setPrefix('pharmacyApp');
}]);