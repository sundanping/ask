productApp.controller('SearchRusltController', function($scope, restProxyService, $location) {

    $scope.goToURL = restProxyService.goToURL;

    $scope.getRusltList = function() {
        var resultList = window.sessionStorage.getItem('resultList');
        if (resultList === null || resultList === 'null' || resultList === void 0) {
            $scope.resultList = [];
        } else {
            $scope.resultList = JSON.parse(resultList);
        }

        window.sessionStorage.removeItem('resultList');
    };
});