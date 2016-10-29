/*global angular*/
var app = angular.module('pharmacyApp', ['ngRoute', 'LocalStorageModule', 'dcbImgFallback']);

app.controller('mainController', function ($scope, $location, LocalStorage) {


	$scope.search = function () {
		$location.path('/browse/' + $scope.mSearchTitle);
	}
});

//Add Sale View Controller
app.controller('addController', function ($scope, $routeParams, $location, $http) {
	$scope.products = null;
	$scope.formData = null;
	$scope.getProducts = function () {
		$http.get("http://localhost:3000/products").then(function (response) {
			$scope.products = response.data;
		});
	}

	$scope.submitForm = function () {
		/* while compiling form , angular created this object*/
		var data = JSON.stringify($scope.fields);

		$scope.formData = $scope.fields;

		/* post to server*/
		//$http.post("http://localhost:3000/sales", data);

		$http({
			url: 'http://localhost:3000/sales',
			method: "POST",
			data: data,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {

		}).error(function (data, status, headers, config) {

		});
	}

	$scope.getProducts();
});