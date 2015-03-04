var citiesQuizApp = angular.module('citiesQuizApp', ['citiesQuizController', 'citiesQuizService', 'uiGmapgoogle-maps','ui.bootstrap']);

citiesQuizApp.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})

var citiesQuizService = angular.module('citiesQuizService', []);

citiesQuizService.factory('Cities', function($http) {
	return {
		get : function() {
			return $http.get('/json/capitalCities.json');
		} 
	}
});

var citiesQuizController = angular.module('citiesQuizController', []);

citiesQuizController.controller('citiesQuizMainController', function($scope, $modal, Cities, uiGmapGoogleMapApi) {

	function init(){

		$scope.citiesPlaced = 0;
		$scope.citiesPlacedMsg = $scope.citiesPlaced + " cities placed.";

		$scope.kmLeft = 1500;
		$scope.kmLeftMsg = $scope.kmLeft + " kilometers left.";

		$scope.cities = [];
		$scope.actualCitieIndexToSearch = undefined;

		$scope.noNext = true;
		$scope.noCheck = true;

		Cities.get().success(function(cities) {

			var geocoder = new google.maps.Geocoder();

			var j = 0;

			for(var i = 0; i < cities.capitalCities.length; i++){

				(function(cityName){

				    geocoder.geocode({'address' : cityName}, function (results, status) {

				    	j++;

				        if (status === google.maps.GeocoderStatus.OK) {

				        	var city = {};
				        	city.capitalCity = cityName;
				        	city.lat = results[0].geometry.location.k;
				        	city.long = results[0].geometry.location.C;

				        	$scope.cities.push(city);


				        } else {
				            console.log("Unknown address: " + cityName);
				        }

				        //COMPROBAMOS SI YA PODEMOS INICIAR LA APLICACIÓN
				        if(j == cities.capitalCities.length){
							start();
				        }

				    });	

				})(cities.capitalCities[i].capitalCity);

			}

		});


	}

	function start(){

		console.log('START GAME');

		$scope.actualCitieIndexToSearch = 0;

	}

	function cleanMap(){

		$scope.map.center.latitude = 49.4;
		$scope.map.center.longitude = 14.4;

		$scope.marker = {
			id: 0		
		};

		$scope.markerCitie = {
			id: 1		
		};	

		$scope.distance = 0;
		$scope.distanceMsg = "";

		$scope.noNext = true;
		$scope.noCheck = true;		

	}


	function showCity(index){

		var city = $scope.cities[index];

		console.log(city);

		$scope.markerCitie = {
			id: 1,
			coords: {
				latitude: city.lat,
				longitude: city.long
			}			
		};

	}

	function distance(){

		var pos1 = new google.maps.LatLng($scope.markerCitie.coords.latitude, $scope.markerCitie.coords.longitude);
		var pos2 = new google.maps.LatLng($scope.marker.coords.latitude, $scope.marker.coords.longitude);

		$scope.distance = parseInt(google.maps.geometry.spherical.computeDistanceBetween(pos1,pos2) / 1000);

	}

	function endGame(){

		var modalInstance = $modal.open({
			templateUrl: 'endGame.html',
			controller: 'EndGameCtrl',
			resolve: {
				cities: function(){
					return $scope.citiesPlaced;
				},
				km: function(){
					return $scope.kmLeft;
				}
			}
		});

		modalInstance.result.then(function () {
				init();
			}, function () {
				init();
			});

	}	


	$scope.check = function(){

		showCity($scope.actualCitieIndexToSearch);

		distance();

		$scope.distanceMsg = $scope.distance + " KM"

		$scope.kmLeft = $scope.kmLeft - $scope.distance;

		if($scope.distance < 50){

			$scope.citiesPlaced = $scope.citiesPlaced + 1;

		}

		$scope.noNext = false;
		$scope.noCheck = true;		

	}

	$scope.next = function(){

		cleanMap();

		$scope.actualCitieIndexToSearch++;

		if( $scope.actualCitieIndexToSearch >= $scope.cities.length ){

			console.log('END GAME');

			endGame();

		}

	}

	uiGmapGoogleMapApi.then(function(maps) {

		init();

		$scope.markerCitie = {
			id: 0		
		};	

		$scope.map = { center: { latitude: 49.4, longitude: 14.4 }, 
						zoom: 4,
						options: {
							streetViewControl: false,
							styles: [
								{
									featureType: "road",
									elementType: "all",
									stylers: [
									  { visibility: "off" }
									]
								},
								{
									featureType: "landscape",
									elementType: "all",
									stylers: [
									  { visibility: "off" }
									]
								},
								{
									featureType: "all",
									elementType: "labels",
									stylers: [
									  { visibility: "off" }
									]
								},
								{
									featureType: "poi",
									elementType: "labels",
									stylers: [
									  { visibility: "off" }
									]
								},
								{
									featureType: "administrative.province",
									elementType: "all",
									stylers: [
									  { visibility: "off" }
									]
								}

							]
						},
						events: {
				            click: function (mapModel, eventName, originalEventArgs) {
				            	$scope.$apply(function(){

				            		$scope.noCheck = false;

									var e = originalEventArgs[0];

									$scope.marker = {
									    id: 0,
									    coords: {
									        latitude: e.latLng.lat(),
									        longitude: e.latLng.lng()
									    },
									    options: {
	            							draggable: false
	        							}
									};

								});
				            }
				        }
          			};

		$scope.marker = {
			id: 0,
			options: {
	            draggable: false
	        }			
		};	
				

    });	

});

citiesQuizController.controller('EndGameCtrl', function($scope, $modalInstance, cities, km) {

	$scope.cities = cities;
	$scope.km = km;


  $scope.ok = function () {
    $modalInstance.close();
  };

});