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
app.controller('editController', function ($scope, $routeParams, $location, $http, $filter) {
	$scope.sales = null;
	$scope.products = null;
	$scope.saleSelected = null;
	$scope.viewSale = true;

	$scope.saleEdited = false;

	//editing the sale
	$scope.selectedProduct = null;
	$scope.changeItem = function (product) {
		$scope.selectedProduct = $scope.productByID(product);
	}

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

	$scope.submitEditForm = function (form) {
		/* while compiling form , angular created this object*/
		var data = JSON.stringify(form);
		/* post to server*/
		$http({
			url: 'http://localhost:3000/sales/' + $scope.saleSelected._id,
			method: "PUT",
			data: data,
			headers: {
				'Content-Type': 'application/json'
			}
		}).success(function (data, status, headers, config) {
			$scope.saleEdited = true;
			$scope.cancelEditing();
		}).error(function (data, status, headers, config) {

		});
	}

	$scope.editSale = function () {
		$scope.viewSale = false;
	}

	$scope.setFields = function () {
		$scope.fields.selectedProduct = $scope.selectedProduct;
	}

	$scope.cancelEditing = function () {
		$scope.viewSale = true;
	}

	$scope.rowCollection = function () {
		return $scope.products;
	};

	$scope.getters = {
		name: function (value) {
			console.log($scope.productByID(value));
			//this will sort by the length of the first name string
			return $scope.productByID(value).name;
		}
	}



	$scope.getProducts();
	$scope.getSales();
});