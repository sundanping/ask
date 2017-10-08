
productApp.controller("orderInformation",function($scope,
                                                  $route,
                                                  $location,
                                                  restProxyService,
                                                  userProxyService,
                                                  $rootScope,
                                                  $routeParams){

    $scope.message = $routeParams.id;
    $scope.id= $scope.message.split('&')[0]; //快递单号
    $scope.time= $scope.message.split('&')[1];
    $scope.goToURL = restProxyService.goToURL;
    var user = userProxyService.getLoginData();
    var params={
        at_session_id: user.atSessionId,
        'orderId':$scope.id
    };

    var orderInformation;//订单详情
    var totalgoodsPrice=0;//总价
    if (userProxyService.isLogin()){
        restProxyService.sendHttpGet(API_URL_ROOT,'/user/order/detail/',params )
            .success(function (response) {
                response.data;
                // console.log(response.data)
                $scope.orderInformation=response.data;
                //计算总价
                orderInformation=response.data.containerList;
                // console.log(response.data);
                angular.forEach(orderInformation,function(goods){
                    totalgoodsPrice+=goods.goodsPrice*1*goods.num;
                    $scope.totalgoodsPrice=totalgoodsPrice;

                })
                // console.log(user.atSessionId)
            });
    }
    // console.log(orderInformation);

})
