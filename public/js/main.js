var citiesQuizApp = angular.module('citiesQuizApp', ['citiesQuizController', 'citiesQuizService', 'uiGmapgoogle-maps','ui.bootstrap']);

citiesQuizApp.config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
        //    key: 'your api key',
        v: '3.17',
        libraries: 'weather,geometry,visualization'
    });
})

var citiesQuizService = angular.module('citiesQuizService', []);


//SERVICE THAT RETURN THE JSON OF THE CITIES
citiesQuizService.factory('Cities', function($http) {
	return {
		get : function() {
			return $http.get('/json/capitalCities.json');
		} 
	}
});

var citiesQuizController = angular.module('citiesQuizController', []);


//MAIN CONTROLLER
citiesQuizController.controller('citiesQuizMainController', function($window, $scope, $modal, Cities, uiGmapGoogleMapApi) {

	//INIT THE APP
	function init(){

		$scope.zoom = 4;

		if($window.innerWidth < 600){
			$scope.zoom = 3; 
		}

		$scope.loaded = false;

		$scope.citiesPlaced = 0;
		$scope.citiesPlacedMsg = $scope.citiesPlaced + " cities placed.";

		$scope.kmLeft = 1500;
		$scope.kmLeftMsg = $scope.kmLeft + " kilometers left.";

		$scope.cities = [];
		$scope.actualCitieIndexToSearch = undefined;

		$scope.noNext = true;
		$scope.noCheck = true;

		$scope.markerCitie = {
			id: 0		
		};	

		$scope.marker = {
			id: 0,
			options: {
	            draggable: true
	        }			
		};			

		$scope.map = { center: { latitude: 49.4, longitude: 14.4 }, 
			zoom: $scope.zoom,
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

	            		//USER CAN MOVE THE MARKER ID THE NEXT BOTON IS NOT VISIBLE 
	            		if($scope.noNext){

		            		$scope.noCheck = false;

							var e = originalEventArgs[0];

							$scope.marker = {
							    id: 0,
							    coords: {
							        latitude: e.latLng.lat(),
							        longitude: e.latLng.lng()
							    },
							    options: {
	    							draggable: true
								}
							};

	            		}


					});
	            }
	        }
		};

		//LAT AND LOG OH EACH CITY
		Cities.get().success(function(cities) {

			var geocoder = new google.maps.Geocoder();

			var j = 0;

			for(var i = 0; i < cities.capitalCities.length; i++){

				(function(cityName){

				    geocoder.geocode({'address' : cityName}, function (results, status) {

				    	j++;

				        if (status === google.maps.GeocoderStatus.OK) {

				        	console.log(results[0].geometry.location);

				        	var city = {};
				        	city.capitalCity = cityName;
				        	city.lat = results[0].geometry.location.k;
				        	city.long = results[0].geometry.location.B;

				        	$scope.cities.push(city);


				        } else {
				            console.log("Unknown address: " + cityName);
				        }

				        //CHECK IF WE CAN START THE APP
				        if(j == cities.capitalCities.length){
							start();

							$scope.$apply();
				        }

				    });	

				})(cities.capitalCities[i].capitalCity);

			}

		});


	}

	//START THE APP
	function start(){

		console.log('START GAME');

		$scope.loaded = true;

		$scope.actualCitieIndexToSearch = 0;

	}

	//CLEAN THE MARKERS AND ADJUST THE MAP AND THE INTERFACE  
	function cleanMap(){

		$scope.map.center.latitude = 49.4;
		$scope.map.center.longitude = 14.4;
		$scope.map.zoom = $scope.zoom;

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

	//SHOW THE MARKER OF THE CITY
	function showCity(index){

		var city = $scope.cities[index];

		$scope.map.center.latitude = city.lat;
		$scope.map.center.longitude = city.long;
		$scope.map.zoom = 4;		


		$scope.markerCitie = {
			id: 1,
			coords: {
				latitude: city.lat,
				longitude: city.long
			},
			options: {
				labelContent: city.capitalCity,
				labelAnchor: "22 55",
				labelClass: "marker-class",
				icon: "/img/city_marker.png"
			}			
		};

	}

	//CALCUL THE DISTANCE BETWEEN THE MARKERS
	function distance(){

		var pos1 = new google.maps.LatLng($scope.markerCitie.coords.latitude, $scope.markerCitie.coords.longitude);
		var pos2 = new google.maps.LatLng($scope.marker.coords.latitude, $scope.marker.coords.longitude);

		$scope.distance = parseInt(google.maps.geometry.spherical.computeDistanceBetween(pos1,pos2) / 1000);

	}

	//SHOW THE MODAL WITH THE RESULTS AND INIT THE GAME WHEN THE USER CLOSE THE MODAL
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

	//CHECK THE DISTANCE BETWEEN THE MARKERS AND SHOW THE RESULT. END THE GAME IF THE kmLeft < 0
	$scope.check = function(){

		showCity($scope.actualCitieIndexToSearch);

		distance();

		$scope.distanceMsg = $scope.distance + " KM to " + $scope.cities[$scope.actualCitieIndexToSearch].capitalCity;

		$scope.kmLeft = $scope.kmLeft - $scope.distance;

		//CHECK IF IS OK
		if($scope.distance < 50){

			$scope.placed = true;

			$scope.citiesPlaced = $scope.citiesPlaced + 1;

		}else{

			$scope.placed = false;

		}

		if( $scope.kmLeft < 0){
			
			console.log('END GAME');

			endGame();

		}else{

			$scope.noNext = false;
			$scope.noCheck = true;		

		}

	}

	//EVENT WHEN THE USER CLICK IN THE NEXT BUTTON. CLEAN THE MAP, UPDATE THE INDEX AND CHECK IF THE GAME IS FINISH
	$scope.next = function(){

		cleanMap();

		$scope.actualCitieIndexToSearch++;

		if( $scope.actualCitieIndexToSearch >= $scope.cities.length ){

			console.log('END GAME');

			endGame();

		}

	}

	//INIT GOOGLE MAPS
	uiGmapGoogleMapApi.then(function(maps) {

		init();

    });	

});

//CONTROLLER FOR THE MODAL
citiesQuizController.controller('EndGameCtrl', function($scope, $modalInstance, cities, km) {

	$scope.cities = cities;
	$scope.km = km;


  $scope.ok = function () {
    $modalInstance.close();
  };

});