productApp.controller('rePayCtrl', function ($scope, $location, restProxyService) {
    $scope.init = function () {
        window.sessionStorage.getItem("rePayOrderId");
    };

    // 是否为微信浏览器
    var userAgent = navigator.userAgent.toLowerCase();
    $scope.isWxBrowser = (/MicroMessenger/i).test(userAgent);

    $scope.init = function () {
        //获取价格
        //获取订单id
        var rePayInfo = JSON.parse(window.sessionStorage.getItem("rePayInfo"));
        rePayInfo = rePayInfo || {};
        if ($.isEmptyObject(rePayInfo)) {
            swal('', '异常，请回到首页重新打开', 'error');
            return;
        }
        // console.log(rePayInfo);
        $scope.orderId = rePayInfo.orderId;
        $scope.price = rePayInfo.price;

        if ($scope.isWxBrowser) {
            $scope.loadingPromise = restProxyService.getRePayRedirect().success(function (resp) {
                if (resp.errCode == 0) {
                    var redirectUrl = resp.data.redirect || '';
                    if (redirectUrl !== '') {
                        window.location.href = redirectUrl;
                    }
                }
            });
        }
    };

    $scope.rePay = function () {
        $scope.payType = $scope.payType || '';
        if ($scope.payType === '') {
            swal('', '请选择支付方式', 'error');
            return;
        }
        $scope.myPromise = restProxyService.rePayOrder({
            orderId: $scope.orderId,
            channel: $scope.channel,
            payType: $scope.payType
        }).then(function (response) {
            var respData = response.data.data;
            if (response.data.errCode === 0) {
                if (respData.pay_success === true || respData.pay_success === 'true') {
                    if ($scope.channel === 'm') {
                        window.location.href = '#m/user/order';
                    } else if ($scope.channel === 'pc') {
                        $location.path('pc/user/order');
                    }
                    return;
                }
                window.sessionStorage.setItem("payResp", JSON.stringify(response.data));
                window.location.href = "/html/wait_pay.html";
            } else {
                swal('', response.data.errMsg, 'error');
            }

        });
    };


    $scope.init();
});
