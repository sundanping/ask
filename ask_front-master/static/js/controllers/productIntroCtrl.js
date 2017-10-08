productApp.controller('ProductIntroController', function($scope,
    API_URL_ROOT, restProxyService, userProxyService, $routeParams) {
    /*
     订单控制器
     * */
    var user = userProxyService.getLoginData(),
        apiParams = {
            productId: $routeParams.productId
        };

    $scope.productId = $routeParams.productId;

    $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/productInfo/', apiParams)
        .then(function(response) {
            if (response.data.errCode === 0) {
                $scope.data = response.data.data;
                // console.log($scope.data);
            }
        });


});