/**
 * Created by sun on 2017/4/10.
 */
productApp.controller("logisticsInformation",function($scope,
                                                  $route,
                                                  $location,
                                                  restProxyService,
                                                  userProxyService,
                                                  $rootScope,
                                                  $routeParams){

    $scope.message = $routeParams.deliverySerial;
    $scope.company= $scope.message.split('-')[0]; //快递单号
    $scope.id= $scope.message.split('-')[1];
            // console.log( "id=" +$scope.id );
            // $scope.aa=403234961918;
        var params={
        "oddNumber" : $scope.id,
        "com" : "auto"
        };
    restProxyService.sendJsonPost(API_URL_ROOT,'/expressFree/getExpressInfo/',params)
        .success(function (response) {
            $scope.ret_code=  response.data.content.showapi_res_body.ret_code;
            // console.log(response.data.content.showapi_res_body.ret_code)
            $scope.expressMessage= response.data.content.showapi_res_body.data;
        });

})


