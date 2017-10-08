/*
 XXX: 封装策略模式, 用以提交和表单验证
 * */

productApp.controller('InvoiceController', function ($scope, $location,
                                                     userProxyService, API_URL_ROOT, restProxyService, qrInfoProxyService) {

    var _user = userProxyService.getLoginData(),
        _userParams = {
            at_session_id: _user.atSessionId
        };

    /*
     验证增值税发票信息
     @param invoiceData
     * */
    function _validatorVATInvoice(invoiceData) {
        return true;
    }

    /*
     验证普通发票
     @param invoiceData
     * */
    function _validatorCommonInvoice(invoiceData) {
        var invoiceHeader = invoiceHeader || {};
        var invoiceHeader = invoiceData.header || '';

        if (invoiceHeader === '') {
            return false;
        }
        return true;
    }

    $scope.INVOICE_TYPE = {
        VAT: 'vat',
        COMMON: 'common'
    };

    $scope.goToURL = restProxyService.goToURL;

    /*
     获取发票类型
     * */
    $scope.getInvoice = function () {
        var invoiceParams = angular.extend({}, _userParams);
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT,
            '/user/invoice/view/', invoiceParams).success(function (response) {
                if (response.errCode === 0) {
                    if (response.data === null || response.data === 'null') {
                        $scope.data = '';
                    } else {
                        $scope.data = response.data;
                    }
                } else {
                    swal('获取发票信息失败', response.errMsg, 'error');
                }
            });
    };

    /*
     提交发票信息
     @param invoiceData
     * */
    $scope.submitInvoice = function (type, invoiceData) {
        var invoiceParams = {},
            invoice,
            validatorResult;

        invoiceData = invoiceData || {};

        if (type === $scope.INVOICE_TYPE.VAT) {
            validatorResult = _validatorVATInvoice(invoiceData.vatInvoice);
        } else if (type === $scope.INVOICE_TYPE.COMMON) {
            validatorResult = _validatorCommonInvoice(invoiceData.commonInvoice);
        }

        if (!validatorResult) {
            swal('提交发票信息', '请完善表单', 'error');
            return 0;
        }

        invoiceParams = angular.extend({}, {
            type: type
        }, invoiceData);

        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT,
            '/user/invoice/update/', invoiceParams).success(function (response) {

                if (response.errCode === 0) {
                    swal('提交发票信息', '提交成功', 'success');
                    window.sessionStorage.setItem('invoice', response.data);
                    if ($scope.channel === 'm') {
                        window.location.href = 'http://www.autoask.com/mobile/index.html#/m/shopping_cart';
                    } else if ($scope.channel === 'pc') {
                        $scope.hideInvoiceModal();
                    }
                } else {
                    swal('提交发票信息', response.errMsg, 'error');
                }

            });

    };

    /*
    隐藏弹窗
    * */
    $scope.hideInvoiceModal = function () {
        var modal = UIkit.modal("#add-invoice-modal");

        if (modal.isActive()) {
            modal.hide();
        }
    };
});