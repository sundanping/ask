/**
 * Created by Administrator on 2017/5/6.
 */
productApp.controller('waitPayCtrl', ['$scope', 'restProxyService', '$location', function ($scope, restProxyService, $location) {

    function isPc() {
        var userAgentInfo = navigator.userAgent;
        var Agents = ["Android", "iPhone",
            "SymbianOS", "Windows Phone",
            "iPad", "iPod"];
        var flag = true;
        for (var v = 0; v < Agents.length; v++) {
            if (userAgentInfo.indexOf(Agents[v]) > 0) {
                flag = false;
                break;
            }
        }
        return flag;
    }
// alert(flag)
    var resp = JSON.parse(window.sessionStorage.getItem("payResp"));
    if (resp === undefined) {
        swal('', '支付失败', 'error');
        if (isPc) {
            window.location.href = "pc/index.html#/pc/pay_false";
        } else {
            window.location.href = 'mobile/index.html#/m/pay_false';
        }
        return;
    }
    var respData = resp.data;
    if (!isPc()) {
        var charge = respData,
            payed = respData.payed;

        if (payed !== void 0) {
            swal('支付提示', '支付成功', 'success');
            window.location.href = 'mobile/index.html#m/user/order';
        }

        pingpp.createPayment(charge, function (result, err) {
            if (result == "success") {
                swal('支付提示', '支付成功', 'success');
                window.location.href = 'mobile/index.html#/m/user/order';
            } else if (result == "fail") {
                swal('支付提示', '支付失败!', 'error');
                window.location.href = 'mobile/index.html#/m/pay_false';
            } else if (result == "cancel") {
                swal('支付提示', '支付取消!', 'error');
                window.location.href = 'mobile/index.html#/m/pay_false';
            }
        });
    } else {
        if ("payUrl" in respData) {

            var qrCodeInfo = {
                paySerial: respData.paySerial,
                payUrl: respData.payUrl,
                payPrice: respData.amount
            };

            window.sessionStorage.setItem('qrCodeInfo', JSON.stringify(qrCodeInfo));
            window.location.href = "pc/index.html#/pc/pay/qrcode";
        } else {
            var charge = respData;
            pingpp.createPayment(charge, function (result, err) {
                if (result == "success") {
                    swal('支付提示', '支付成功', 'success');
                    window.location.href = "pc/index.html#/pc/user/order";
                } else if (result == "fail") {
                    swal('支付提示', '支付失败!', 'error');
                    window.location.href = "pc/index.html#/pc/pay_false";
                } else if (result == "cancel") {
                    // 微信公众账号支付取消支付
                }
            });
        }
    }
}]);
