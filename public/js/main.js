var citiesQuizApp = angular.module('citiesQuizApp', ['citiesQuizController', 'citiesQuizService', 'uiGmapgoogle-maps']);

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
			return $http.get('/api/users');
		} 
	}
});

var citiesQuizController = angular.module('citiesQuizController', []);

citiesQuizController.controller('citiesQuizController', function($scope, Cities, uiGmapGoogleMapApi) {

	$scope.citiesPlaced = 0;
	$scope.citiesPlacedMsg = $scope.citiesPlaced + " cities placed.";

	$scope.kmLeft = 1500;
	$scope.kmLeftMsg = $scope.kmLeft + " kilometers left.";

	$scope.actualCitieToSearch = "Amsterdam";


	uiGmapGoogleMapApi.then(function(maps) {

		$scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    });	

});