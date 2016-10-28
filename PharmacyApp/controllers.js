/*global angular*/
var app = angular.module('pharmacyApp', ['ngRoute', 'LocalStorageModule', 'dcbImgFallback']);

app.controller('mainController', function ($scope, $location, LocalStorage) {


	$scope.search = function () {
		$location.path('/browse/' + $scope.mSearchTitle);
	}
});

//Add Sale View Controller
app.controller('addController', function ($scope, $routeParams, $location, IMDBAPI) {
	$scope.selectedData = null;
	if ($routeParams.title) {
		$scope.titleToSearch = $routeParams.title;
	}

	IMDBAPI.searchByTitle($scope.titleToSearch).then(function (response) {
		$scope.tableData = (response.data).Search;
	});

	$scope.select = function (imdbID) {
		IMDBAPI.itemByID(imdbID).then(function (response) {
			$scope.selectedData = (response.data);
		});
	}

	$scope.viewSeasons = function () {
		if ($scope.selectedData.imdbID) {
			$location.path('/browse/series/' + $scope.selectedData.imdbID);
		}
	}
});

//Seasons View Controller
app.controller('overviewController', function ($scope, $routeParams, $location, $anchorScroll, IMDBAPI, LocalStorage) {
	var updateSeasonWatchedStatus = function () {
		//get the watched status for all the episodes in the season and add it to the data being used.
		$scope.seriesData['Watched'] = true;
		angular.forEach($scope.currentSeasonData, function (value, key) {
			value['Watched'] = LocalStorage.isEpisodeWatched(value.imdbID);
			if (value['Watched'] != true) {
				$scope.seriesData['Watched'] = false;
			}
		});


		//get the watched status for all the seasons in the series
		angular.forEach($scope.seasonData, function (value, key) {
			value['Watched'] = LocalStorage.isSeasonWatched(value);
			if (value['Watched'] != true) {
				$scope.seriesData['Watched'] = false;
			}
		});

	}

	$scope.selectSeason = function (index) {
		if (index != null) {
			// call $anchorScroll()
			$anchorScroll('seasonsView');

			var seasonNum = index + 1;
			$scope.currentSeasonNum = (seasonNum);

			var epString = '';
			if ($scope.currentEpisodeNum) {
				epString = '/' + $scope.currentEpisodeNum;
			}

			//change location without refresh
			$location.path('/browse/series/' + $scope.seriesData.imdbID + '/' + (seasonNum) + (epString), false);

			//load the data
			if ($scope.seasonData[index]) {
				//already have the data available to us.
				$scope.currentSeasonData = $scope.seasonData[index].Episodes;
				updateSeasonWatchedStatus();
			} else {
				IMDBAPI.seasonByID($scope.seriesData.imdbID, seasonNum).then(function (response) {
					//we have not got the data yet, load it manually.
					$scope.currentSeasonData = (response.data).Episodes;
					updateSeasonWatchedStatus();
				});
			}


		}
		updateSeasonWatchedStatus();
		$scope.currentEpisodeData = null;
		$scope.currentEpisodeNum = null;
	}

	$scope.selectEpisode = function (index) {
		if (index != null) {
			if ($scope.currentSeasonNum) {
				var episodeNum = index + 1;
				$scope.currentEpisodeNum = (episodeNum);
				$location.path('/browse/series/' + $scope.seriesData.imdbID + '/' + ($scope.currentSeasonNum) + '/' + (episodeNum), false);


				// call $anchorScroll()
				$anchorScroll('episodeView');
				$scope.loadingEpData = true;
				//get the data
				IMDBAPI.episodeByID($scope.selectedSeriesID, $scope.currentSeasonNum, $scope.currentEpisodeNum).then(function (response) {
					$scope.currentEpisodeData = (response.data);
					//append watched status from local storage
					$scope.currentEpisodeData['Watched'] = LocalStorage.isEpisodeWatched($scope.currentEpisodeData.imdbID);
					$scope.loadingEpData = false;
				});
			}
		}
	}

	//controls the watch state of an episode
	$scope.watchEp = function (imdbID) {
		//invert the boolean on the current ep data
		$scope.currentEpisodeData['Watched'] = !($scope.currentEpisodeData['Watched']);

		//set the watch state into the Local Storage.
		LocalStorage.setEpisodeWatched(imdbID, $scope.currentEpisodeData['Watched']);

		//update season data to reflect changes in episode table
		updateSeasonWatchedStatus();
	}

	//controls the favouriting of a series
	$scope.markAs = function (state) {
		//check state
		if (typeof (state) != "boolean") {
			state = false;
		}
		//set app data to state
		$scope.seriesData.isFavorite = state;
		//store the state in local storage
		LocalStorage.setLike($scope.seriesData.imdbID, $scope.seriesData.isFavorite);
	}

	//get all the data for the series overview
	$scope.getData = function () {
		IMDBAPI.itemByID($scope.selectedSeriesID).then(function (response) {
			$scope.seriesData = (response.data);
			$scope.seriesData['isFavorite'] = LocalStorage.isLiked($scope.seriesData.imdbID);
			$scope.seasonsBySeriesID();
			$scope.selectSeason($scope.currentSeasonNum - 1);
			updateSeasonWatchedStatus();
		});
	}

	//responsible for organising the season data
	$scope.seasonsBySeriesID = function () {
		//clear seasonData
		$scope.seasonData = [];

		//not the most efficient way of getting the seasons however due to API not giving any information regarding the totalSeason count for a series, this will do the job of looping until an invalid response.
		IMDBAPI.seasonsBySeriesID($scope.seriesData.imdbID).then(function () {
			$scope.seasonData = IMDBAPI.seasonsData();
			//update season data to reflect changes in episode table
			updateSeasonWatchedStatus();
			$scope.dataLoaded = true;
		});
	}

	$scope.initView = function () {
		$anchorScroll.yOffset = 70;

		$scope.seriesData = [];
		$scope.seasonData = [];

		$scope.selectedSeriesID = null;
		if ($routeParams.seriesID) {
			$scope.selectedSeriesID = $routeParams.seriesID;
		} else {
			$scope.selectedSeriesID = '';
		}

		$scope.currentSeasonNum = null;
		$scope.currentEpisodeNum = null;

		$scope.loadingEpData = false;

		$scope.currentSeasonData = [];
		$scope.currentEpisodeData = null;

		if ($routeParams.season) {
			if (Number($routeParams.season)) {
				$scope.currentSeasonNum = Number($routeParams.season);
				if ($routeParams.episode) {
					if (Number($routeParams.episode)) {
						$scope.currentEpisodeNum = Number($routeParams.episode);
					}
				}
			}
		}

		$scope.dataLoaded = false;

		$scope.getData();
	}

	$scope.initView();
});