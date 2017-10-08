productApp.controller('VoucherController', function ($scope, $location, userProxyService, API_URL_ROOT, restProxyService) {

    var _user = userProxyService.getLoginData(),
        _userParams = {
            at_session_id: _user.atSessionId
        };

    $scope.goToURL = restProxyService.goToURL;
    $scope.serials = [];

    $scope.copyShoppingCartGoods = window.sessionStorage.getItem('goods');
    if ($scope.copyShoppingCartGoods !== null && $scope.copyShoppingCartGoods !== 'null') {
        $scope.copyShoppingCartGoods = JSON.parse($scope.copyShoppingCartGoods);
    } else {
        $scope.copyShoppingCartGoods = [];
    }

    $scope.usedGoodsList = window.sessionStorage.getItem('usedGoodsList');


    if ($scope.usedGoodsList !== null && $scope.usedGoodsList !== 'null' && $scope.usedGoodsList !== void 0) {
        $scope.usedGoodsList = JSON.parse($scope.usedGoodsList);
    } else {
        $scope.usedGoodsList = [];
    }

    /*
     提交兑换卡号
     * */

    $scope.submit = function (voucherData) {
        $scope.data=$scope.data||'';
        var voucherParams = angular.extend({}, $scope.data, _userParams);
        console.log($scope.data)
        var isOldVoucher = false;
        var cardId = $scope.data.cardId || '';
        if (cardId === '') {
            swal('产品兑换卡', '请输入卡号', 'error');
            return;
        }

    console.log($scope.usedGoodsList)
        angular.forEach($scope.usedGoodsList, function (usedGoods, usedGoodsIndex) {
            if (usedGoods.serial === $scope.data.cardId) {
                isOldVoucher = true;
            }
        });

        if (cardId === '') {
            swal('产品兑换卡', '请输入卡号', 'error');
        }

        if (isOldVoucher) {
            swal('产品兑换卡', '该卡券已使用', 'error');
            return false;
        }


        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/card/info/', voucherParams)
            .success(function (response) {


                /*临时保存所有获取的卡券信息，不管是否可用*/
                var copySerials = angular.copy($scope.serials);
                    console.log('copySerials='+ copySerials)
                /*是否全部用完*/
                var isUsedAll = false;

                /*是否可用*/
                var isUsed = false;

                /*当前优惠券*/
                var currentSerial;
                console.log(response)
                if (response.errCode === 0) {
                    var currentSerial = $scope.data.cardId;
                    copySerials.push(response.data);
                    console.log(copySerials)
                    $scope.data.cardId = '';

                    /*使用优惠券*/
                    angular.forEach(copySerials, function (serial, serialIndex) {
                        angular.forEach(serial, function (serialGoods, serialGoodsIndex) {
                            if (!isUsed) {
                                isUsedAll = false;
                                angular.forEach($scope.copyShoppingCartGoods, function (goods, goodsIndex) {
                                    if (serialGoods.goodsSnapshotId === goods.goodsSnapshotId && serialGoods.serial === currentSerial && goods.shoppingCartNum>0) {

                                        if (goods.shoppingCartNum > 0) {
                                            goods.shoppingCartNum -= 1;
                                            console.log($scope.copyShoppingCartGoods)
                                        }
                                            isUsed = true;
                                            $scope.usedGoodsList.push(angular.extend({}, goods, {
                                                goodsPrice: goods.goodsSnapshot.onlinePrice,
                                                serial: serialGoods.serial
                                            }));

                                            console.log(  $scope.usedGoodsList)
                                        }
                                    // }
                                    return
                                });
                            }
                        });

                        if (isUsedAll) {
                            return false;
                        }
                    });


                    if (!isUsedAll && isUsed) {
                        $scope.serials.push(response.data);
                    } else if (isUsedAll) {
                        swal('产品兑换卡', '购物车中可兑换商品已使用完', 'error');
                    } else if (!isUsed) {
                        swal('产品兑换卡', '购物车中没有可以兑换的商品', 'error');
                    }

                    window.sessionStorage.setItem('usedGoodsList', JSON.stringify($scope.usedGoodsList));
                    window.sessionStorage.setItem('copyShoppingCartGoods', JSON.stringify($scope.copyShoppingCartGoods));

                    // window.location.href = 'http://www.autoask.com/mobile/index.html#/m/shopping_cart';
                    $location.path('m/shopping_cart');

                    // updateShoppingCart();
                } else {
                    swal('提交兑换卡号', response.errMsg, 'error');
                }
            });
    };


    window.sessionStorage.setItem('usedMeg', JSON.stringify($scope.usedGoodsList));
});