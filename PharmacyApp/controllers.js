/*global angular*/
var app = angular.module('pharmacyApp', ['ngRoute', 'smart-table']);

app.controller('mainController', function ($scope, $routeParams, $location, $http) {

});

//Add Sale View Controller
app.controller('addController', function ($scope, $routeParams, $location, $http) {
	$scope.products = null;
	$scope.selectedProduct = null;
	$scope.saleAdded = false;

	$scope.getProducts = function () {
		$http.get("http://localhost:3000/products").then(function (response) {
			$scope.products = response.data;
		});
	}

	$scope.changeItem = function (product) {
		for (var i = 0; i < $scope.products.length; i++) {
			console.log($scope.products[i]);
			console.log(product);
			if ($scope.products[i]._id == product) {
				$scope.selectedProduct = $scope.products[i];
			}
		}
	}

	$scope.submitForm = function () {
		/* while compiling form , angular created this object*/
		var data = JSON.stringify($scope.fields);

		/* post to server*/
		$http({
			url: 'http://localhost:3000/sales',
			method: "POST",
			data: data,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {
			$scope.saleAdded = true;
		}).error(function (data, status, headers, config) {

		});
	}

	$scope.getProducts();
});

//Edit Sales View Controller
app.controller('editController', function ($scope, $routeParams, $location, $http) {
	$scope.sales = null;
	$scope.products = null;
	$scope.saleSelected = null;

	$scope.getSales = function () {
		$http.get("http://localhost:3000/sales").then(function (response) {
			$scope.sales = response.data;
		});
	}

	$scope.getProducts = function () {
		$http.get("http://localhost:3000/products").then(function (response) {
			$scope.products = response.data;
		});
	}

	$scope.selectSale = function (sale) {
		$scope.saleSelected = sale;
	}

	$scope.dateFromObjectId = function (objectId) {
		return new Date(parseInt(objectId.substring(0, 8), 16) * 1000);
	};

	$scope.productByID = function (id) {
		for (var i = 0; i < $scope.products.length; i++) {
			if ($scope.products[i]._id == id) {
				return $scope.products[i];
			}
		}
	};
	$scope.getProducts();
	$scope.getSales();
});