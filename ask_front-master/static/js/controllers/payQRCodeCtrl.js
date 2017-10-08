productApp.controller('PayQRCodeController', function ($scope,
                                                       API_URL_ROOT, restProxyService, userProxyService) {


    var user = userProxyService.getLoginData();
    var timer;
    var intervalTime = 1500;

    $scope.paySerial = JSON.parse(window.sessionStorage.getItem('qrCodeInfo'));

    $('#pay-qr-code').qrcode({
        render: 'table',
        text: $scope.paySerial.payUrl
    });

    timer = setInterval(function () {
        restProxyService.sendHttpGet(API_URL_ROOT, '/user/order/hasPayed/', {
            at_session_id: user.atSessionId,
            paySerial: $scope.paySerial.paySerial
        }).then(function (response) {
            if (response.data.errCode === 0) {
                if (response.data.data === true || response.data.data === 'true') {
                    clearInterval(timer);
                    window.location.href = '#pc/pay';
                }
            }
        });
    }, intervalTime);
});