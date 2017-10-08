productApp.controller('exploreDetailCtrl', function ($scope, restProxyService, $routeParams, API_URL_ROOT) {
    $scope.init = function () {
        $scope.exploreId = $routeParams.id;
        $scope.params = {
            id: $scope.exploreId
        };

        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/index/richText/detail/', $scope.params)
            .success(function (response) {

                if (response.errCode === 0) {
                    $scope.data = response.data;
                }
            });
    };

    $scope.init();
});