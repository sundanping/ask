'use strict';


productApp.controller('PayTestCtrl', ['$scope', 'restProxyService', function($scope, restProxyService) {
    $scope.sendPayTest = function() {
        //TODO 地址需要配置成全局常量
        restProxyService.sendHttpPost('http://localhost:8080/autoask', '/user/order/prePay/',{
            "payTotalPrice":2,
            "payType":"wx",
            "online":{
                "serveType": "online",
                "address": {
                    "province": "江苏省",
                    "city": "南京市",
                    "region": "栖霞区",
                    "street": "仙林大学城",
                    "detail": "文苑路9号"
                },
                "snapshotTotalPrice": 1,
                "payTotalPrice": 1,
                "payType": "wx",
                "snapshotCountMap": {
                    "baf63c862e13430ca182dbdb1d9c7c5c":1
                }
            },
            "offline":{
                "serveType":"offline_appoint",
                "snapshotTotalPrice":1,
                "payTotalPrice": 1,
                "payType":"wx",
                "serviceProviderId":"58040415d4c6ef6a63e0d976",
                "snapshotCountMap":{
                    "baf63c862e13430ca182dbdb1d9c7c5c":1
                }
            }
        }).success(function(resp) {
            console.log(resp.data);
            var charge = resp.data;
            pingpp.createPayment(charge, function(result, err) {
                if (result == "success") {
                    // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
                } else if (result == "fail") {
                    // charge 不正确或者微信公众账号支付失败时会在此处返回
                } else if (result == "cancel") {
                    // 微信公众账号支付取消支付
                    //TODO
                }
            });
        });
    };
}]);