productApp.controller('activityCtrl', function ($scope, restProxyService, $routeParams, API_URL_ROOT) {
    $scope.init = function () {
        $scope.activityId = $routeParams.id;
        $scope.params = {
            id: $scope.activityId
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