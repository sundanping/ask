productApp.controller('activeCtrl', function ($scope, restProxyService, API_URL_ROOT) {

    var ACTIVE_SESSION_NAME = "activeSessionId";

    var phoneReg = /^(((13[0-9]{1})|(15[0-9]{1})(17[0-9]{1})||(18[0-9]{1}))+\d{8})$/;

    $scope.init = function () {

        var activeSessionId = window.sessionStorage.getItem(ACTIVE_SESSION_NAME);
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/wechat/preActive/', {activeSessionId: activeSessionId}).success(function (resp) {
            if (resp.errCode == 0) {
                    if (resp.data.hasOwnProperty("redirect")) {
                    window.sessionStorage.setItem(ACTIVE_SESSION_NAME, resp.data.activeSessionId);
                    window.location.href = resp.data.redirect;
                }
            } else {
                swal(resp.errMsg, '', 'error');
            }
        });

    };
    $scope.getActiveCode = function () {
        if (!phoneReg.test($scope.phone)) {
            swal('请输入正确的手机号码', '', 'error');
            return;
        }
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/phone/code/', {phone: $scope.phone}).success(function (resp) {
            if (resp.errCode === 0) {
                swal('发送验证码成功', '', 'success');
            } else {
                swal(resp.errMsg, '', 'error');
            }
        });
    };

    $scope.active = function () {
        var activeSessionId = window.sessionStorage.getItem(ACTIVE_SESSION_NAME);
        if (activeSessionId === undefined || activeSessionId === null || activeSessionId === '') {
            swal('请在微信中重新扫描打开', '', 'error');
            return;
        }
        if (!phoneReg.test($scope.phone)) {
            swal('请输入正确的手机号码', '', 'error');
            return;
        }
        $scope.myPromise = restProxyService.sendHttpPost(API_URL_ROOT, '/wechat/active/', {
            phone: $scope.phone,
            code: $scope.code,
            activeSessionId: activeSessionId
        }).success(function (resp) {
            if (resp.errCode === 0) {
                swal('激活成功', '', 'success');
            } else {
                swal(resp.errMsg, '', 'error');
            }
        });
    };

    $scope.init();
});