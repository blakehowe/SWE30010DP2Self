/*global angular*/
app.factory("IMDBAPI", function ($http, $q, LocalStorage) {
	//omdb API URL Variables

	const baseURL = 'https://www.omdbapi.com/?';
	const and = '&';
	const equals = '=';

	//parameters
	const imdbID = 'i';
	const name = 't';
	const type = 'type';
	const plot = 'plot';

	//search
	const searchFor = 's';

	var seasonSearchLimit;
	var seasonSearchNumber;
	var seasonData;

	//for getting seasons for a series.
	var initSeasonLoop = function () {
		seasonSearchLimit = 2;
		seasonSearchNumber = 1;
		seasonData = [];
		finished = false;
		defer = $q.defer();
	}

	initSeasonLoop();

	var checkSeasonCount = function (seriesID) {
		//check seasondata count
		if (seasonData.length + 1 == seasonSearchLimit) {
			//perform the loop again
			seasonSearchNumber = seasonSearchLimit;

			seasonSearchLimit++;

			seasonLoop(seriesID);
		} else {
			//finished searching, since the season data length was not expected, meaning the last response was invalid.
		}
	}

	var seasonLoop = function (seriesID) {
		return seasonByIDFunc(seriesID, seasonSearchNumber).then(function (response) {
			if (response.data.Response == 'True') {
				//only add the data if the response was valid.
				var result = (response.data);
				result['Watched'] = LocalStorage.isSeasonWatched(result);
				seasonData.push(result);
			}
			if (seasonData.length + 1 == seasonSearchLimit) {
				//perform the loop again
				seasonSearchNumber = seasonSearchLimit;

				seasonSearchLimit++;

				seasonLoop(seriesID);
			}
		});
	}

	var seasonByIDFunc = function (seriesID, seasonNumber) {
		return $http.get('http://www.omdbapi.com/?i=' + seriesID + '&Season=' + seasonNumber);
	}

	return {
		itemByID: function (itemID, plotType) {
			return $http.get('http://www.omdbapi.com/?i=' + itemID + '&type=series');
		},
		searchByTitle: function (titleToSearch) {
			return $http.get('http://www.omdbapi.com/?s=' + titleToSearch + '&type=series');
		},
		seasonByID: function (seriesID, seasonNumber) {
			return seasonByIDFunc(seriesID, seasonNumber);
		},
		episodeByID: function (seriesID, seasonNumber, episodeNumber) {
			return $http.get('http://www.omdbapi.com/?i=' + seriesID + '&Season=' + seasonNumber + '&Episode=' + episodeNumber);
		},
		seasonsBySeriesID: function (seriesID) {
			initSeasonLoop();
			return seasonLoop(seriesID);
		},
		seasonsData: function () {
			return seasonData;
		}
	};
});

app.factory("LocalStorage", ['localStorageService', function (localStorageService) {
	//Likes will have the Series as the Key
	//Watched Episodes will be in a watchedEps key
	var getWatchedEps = function () {
		var result = localStorageService.get('watchedEps');
		var json = angular.fromJson(result);
		if (json == null) {
			json = {};
		}
		return json;
	}
	var setWatchedEps = function (toStore) {
		localStorageService.set('watchedEps', angular.toJson(toStore));
	}

	var isEpWatchedFunc = function (imdbID) {
		var result = getWatchedEps();
		if (result[imdbID] == 'true') {
			return true;
		} else {
			return false;
		}
	}

	var isSeasonWatchedFunc = function (season) {
		var result = true;
		angular.forEach(season.Episodes, function (value, key) {;
			if (!isEpWatchedFunc(value['imdbID'])) {
				result = false;
			}
		});
		//otherwise return true
		return result;
	}

	return {
		favouritesKeys: function () {
			return localStorageService.keys()
		},
		isSeasonWatched: function (season) {
			return isSeasonWatchedFunc(season);
		},
		isEpisodeWatched: function (imdbID) {
			return isEpWatchedFunc(imdbID);
		},
		setEpisodeWatched: function (imdbID, state) {
			var watched = getWatchedEps();
			watched[imdbID] = state.toString();
			setWatchedEps(watched);
		},
		isLiked: function (imdbID) {
			var item = localStorageService.get(imdbID);
			var result = false;
			if (item == null) {
				console.log('does not exist');
			} else {
				//item is a string
				if (item == 'true') {
					result = true;
				}
			}
			return result;
		},
		setLike: function (imdbID, state) {
			if (state == true) {
				localStorageService.set(imdbID, state.toString());
			} else {
				localStorageService.remove(imdbID);
			}

		}
	};
}]);