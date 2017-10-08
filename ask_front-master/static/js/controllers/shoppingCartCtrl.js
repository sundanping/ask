productApp.controller('ShoppingCartController', function ($scope, shoppingCartService, userProxyService, restProxyService, $location, $q, $window) {
    //判断是否登录
    if (!userProxyService.isLogin()) {
        if (/mobile/.test(window.location.href)) {
            $location.path('m/index');
            userProxyService.displayUserLoginModal();
        } else {
            $location.path('pc/index');
            userProxyService.displayUserLoginModal();
        }
    }
    // begin 获取session_id   sun
    var shoppingCartList = window.sessionStorage.getItem('goods');
    $scope.goodsList = JSON.parse(shoppingCartList);
    // console.log($scope.goodsList);
    $scope.goodsListForPay = JSON.parse(shoppingCartList);

    $scope.onChoicedAddress = false;
    // 是否为微信浏览器
    $scope.isWxBrowser = false;
    var userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.match(/MicroMessenger/i) == "micromessenger") {
        $scope.isWxBrowser = true;
    }

    $scope.goToURL = function (url) {
        $location.path(url);
    };

    $scope.initMap = function () {
        /*初始化百度地图*/
        $scope.mapOptions = {
            center: {
                lng: 118.78,
                lat: 32.04
            },
            zoom: 19,//缩放级别
            //显示一个标记
            markers: [{
                //标记坐标
                lng: 118.78,
                lat: 32.04,
                //标记图片
                icon: 'img/mappiont.png',
                //标记大小
                width: 98,
                height: 120,
                //点击标记后的提示框标题
                title: '',
                //点击标记后的提示框内容
                content: ''
            }]
        };
    };


    $scope.init = function () {
        $scope.shoppingCartGoods = shoppingCartService.goods;
        //商品列表

        //商品总价格
        $scope.snapshotTotalPrice = 0;

        //是否勾选服务
        $scope.serviceProviderInfo = JSON.parse(window.sessionStorage.getItem("serviceProviderInfo")) || {};
        $scope.serveChecked = $scope.serviceProviderInfo.hasOwnProperty("id");
        //原始服务费
        $scope.originServiceFee = 0;
        //服务费
        $scope.serviceFee = 0;
        //服务费详情列表
        $scope.serviceFeeList = [];

        calcServiceFee();

        //总折扣价格
        $scope.discountTotalPrice = 0;
        //总重量
        $scope.totalWeight = 0;
        //免快递费的总额度
        $scope.freeAmount = 0;
        //原始快递费
        $scope.originExpressFee = 0;
        //实际快递费
        $scope.expressFee = 0;
        //计算总商品价格以及重量
        calcWeightAndSnapshotPrice();

        //已使用卡兑换过的商品列表
        $scope.usedGoodsList = JSON.parse(window.sessionStorage.getItem("usedGoodsList")) || [];
        //卡兑换删除后的shoppingCartGoods
        $scope.copyShoppingCartGoods = JSON.parse(window.sessionStorage.getItem("copyShoppingCartGoods")) || angular.copy($scope.shoppingCartGoods);
        calcDiscountPrice();

        //获取默认发票信息(异步方法)
        $scope.getInvoice();

        initRedirect().then(initAddress).then(calcExpressFee);
    };

    //请求服务器判断是否是微信浏览器状态下需要跳转获取用户的open_id
    // 获取免邮金额
    var initRedirect = function () {
        var defer = $q.defer();
        var promise = defer.promise;
        $scope.myPromise = restProxyService.getOrderPre()
            .then(function (response) {
                if (response.data.errCode === 0) {
                    var responseData = response.data.data;
                    $scope.freeAmount = responseData.freeAmount;

                    responseData.redirect = responseData.redirect || '';
                    if (responseData.redirect !== '') {
                        window.location.href = responseData.redirect;
                    }
                    defer.resolve('');
                } else if (response.data.errCode === 100) {
                    if (/mobile/.test(window.location.href)) {
                        $location.path('m/index');
                    } else {
                        $location.path('pc/index');
                    }
                    defer.reject('');
                } else {
                    swal('错误', response.data.errMsg, 'error');
                    defer.reject('');
                }
            });
        return promise;
    };

    //获取用户的默认地址
    var initAddress = function () {
        var defer = $q.defer();
        var promise = defer.promise;
        var onlineAddress = JSON.parse(window.sessionStorage.getItem("onlineAddress"));

        $scope.myPromise = restProxyService.getUserAddressList().then(function (response) {
            if (response.data.errCode === 0) {
                $scope.addressList = response.data.data;
                angular.forEach($scope.addressList, function (address, ai) {
                    address = angular.extend({}, address, {
                        choiced: false
                    });
                });
                if ($scope.addressList instanceof Array && $scope.addressList.length > 0) {
                    $scope.addressList[0].choiced = true;
                    $scope.onlineAddress = $scope.addressList[0];
                }
                defer.resolve('');
            } else {
                defer.reject('');
            }
        });
        return promise;
    };


    //获取快递费用
    var calcExpressFee = function () {
        if ($scope.onlineAddress === undefined || $scope.onlineAddress === null) {
            $scope.expressFee = 0;
            $scope.originExpressFee = 0;
            return;
        }
        var province = $scope.onlineAddress.province || '';
        if (province === '') {
            $scope.expressFee = 0;
            $scope.originExpressFee = 0;
            return;
        }

        //展示页面对不包邮地区的邮费不需LineThrough
        var noFee = window.sessionStorage.getItem('noFreeAreas');
        $scope.noFee = noFee;
        // console.log(noFee)
        $scope.textLineThrough = noFee.search(province);

        var queryParam = {price: $scope.snapshotTotalPrice, totalWeight: $scope.totalWeight, province: province};
        $scope.myPromise = restProxyService.getExpressFee(queryParam).then(function (resp) {
            if (resp.data.errCode === 0) {
                $scope.originExpressFee = parseFloat(resp.data.data.originalPice);
                $scope.expressFee = parseFloat(resp.data.data.expressPrice);
            } else {
                swal('ERROR', '快递费获取失败，请刷新页面', 'error');
            }
        });

    };

    //计算服务费


    function calcServiceFee() {
        var serviceFee = 0;
        var categoryIdSet = {};
        var serviceFeeList = [];
        angular.forEach($scope.goodsList, function (goods) {
            // console.log($scope.goodsList)
            if (goods.choiced && !categoryIdSet.hasOwnProperty(goods.productCategoryId)) {
                serviceFee += parseFloat(goods.categoryServiceFee);
                categoryIdSet[goods.productCategoryId] = 1;
                // console.log(categoryIdSet)
                serviceFeeList.push({
                    'productCategoryName': goods.productCategoryName,
                    'categoryServiceFee': goods.categoryServiceFee
                });

                // console.log(serviceFeeList)
            }
        });
        $scope.originServiceFee = serviceFee.toFixed(2);
        if ($scope.serveChecked) {
            $scope.serviceFee = $scope.originServiceFee;
        } else {
            $scope.serviceFee = 0;
        }
        $scope.serviceFeeList = serviceFeeList;
    }

    //计算商品总价格以及总重量
    function calcWeightAndSnapshotPrice() {
        var totalPrice = 0;
        var totalWeight = 0;
        angular.forEach($scope.goodsList, function (goods) {
            if (goods.choiced) {
                totalPrice += parseFloat(goods.goodsSnapshot.onlinePrice) * parseFloat(goods.shoppingCartNum);
                totalWeight += parseFloat(goods.goodsSnapshot.weight) * parseFloat(goods.shoppingCartNum);
            }
        });
        $scope.totalWeight = totalWeight.toFixed(2);
        $scope.snapshotTotalPrice = totalPrice.toFixed(2);
    }

    /* 获取发票信息 */
    $scope.getInvoice = function () {
        $scope.myPromise = restProxyService.getInvoice().success(function (response) {
            if (response.errCode === 0) {
                if (response.data === null || response.data === 'null') {
                    $scope.invoice = {};
                } else {
                    $scope.invoice = response.data;
                }
            }
        });
    };

    //计算折扣价格
    function calcDiscountPrice() {
        var discountTotalPrice = 0;
        angular.forEach($scope.usedGoodsList, function (usedItem) {
            // alert(usedItem.onLinePrice)
            discountTotalPrice += parseFloat(usedItem.goodsPrice * 1);
            // alert(discountTotalPrice)
        });
        $scope.discountTotalPrice = discountTotalPrice.toFixed(2);
    }


    $scope.chooseServe = function (checkFlag) {
        $scope.serveChecked = checkFlag;
        if ($scope.serveChecked) {
            if ($scope.channel === 'm') {
                $scope.displayAddressModal2();
            } else {
                $scope.displayAddressModal();
            }
        } else {
            $scope.serviceProviderInfo = {};
            window.sessionStorage.removeItem("serviceProviderInfo");
        }
        calcServiceFee();
    };


    $scope.onCloseChoiceServiceAddress = function () {
        var modal = UIkit.modal("#choice-service-address");

        if (modal.isActive()) {
            modal.hide();
        }

    };

    $scope.onGetServiceProvider = function () {

        var area = {
            province: $scope.servicePointAddressTmp.province.name,
            city: $scope.servicePointAddressTmp.city.name,
            region: $scope.servicePointAddressTmp.region.name
        };


        restProxyService.sendHttpGet(API_URL_ROOT, '/serviceProvider/list/', area)
            .then(function (response) {
                var firstServiceProvider;
                /*服务店的位置信息*/
                var landmarks = [],
                    baiduMapCenter = {};

                if (response.data.errCode === 0) {
                    $scope.serviceProviders = response.data.data;

                    if ($scope.serviceProviders instanceof Array &&
                        $scope.serviceProviders.length > 0) {

                        firstServiceProvider = $scope.serviceProviders[0]
                        firstServiceProvider.choiced = true;
                        $scope.serviceProviderInfo = firstServiceProvider;

                        baiduMapCenter = {
                            center: {
                                lat: firstServiceProvider.landmark.latitude,
                                lng: firstServiceProvider.landmark.longitude
                            }
                        };
                    }

                    /*获取所有服务店的位置*/
                    angular.forEach($scope.serviceProviders, function (serviceProvider, si) {
                        landmarks.push(angular.extend({}, {
                            lat: serviceProvider.landmark.latitude,
                            lng: serviceProvider.landmark.longitude,
                            title: serviceProvider.name,
                            content: serviceProvider.name
                        }));
                    });

                    if ($scope.firstServiceProvider !== undefined) {
                        $scope.mapOptions = angular.extend({}, $scope.mapOptions, baiduMapCenter, {
                            markers: {
                                lat: firstServiceProvider.landmark.latitude,
                                lng: firstServiceProvider.landmark.longitude,
                                title: firstServiceProvider.name,
                                content: firstServiceProvider.name
                            }
                        });
                    }

                    angular.forEach($scope.serviceProviders, function (serviceProvider, si) {
                        serviceProvider = angular.extend({}, serviceProvider, {
                            choiced: false
                        });
                    });
                }
            });
    };

    $scope.displayAddressModal = function () {
        /*
         显示选择地址模态对话框
         @param event {Event}
         * */
        var modal = UIkit.modal("#choice-service-address");
        var switcher = UIkit.switcher('#switcher-choice-service-address')

        if (!modal.isActive()) {
            modal.show();
        }

        // if ($scope.shoppingCartGoods.offLine.length === 0) {
        //     switcher.show(1);
        // } else {
        //     switcher.show(0);
        // }
    };

    $scope.displayAddressModal2 = function () {
        var serveModal = UIkit.modal("#choice-service-address2");
        serveModal.show();
    };

    $scope.displayAddressModal3 = function () {
        var modal2 = UIkit.modal("#choice-service-address2");
        modal2.show();
    };
    $scope.submitOrder = function () {
        if ($.isEmptyObject($scope.onlineAddress)) {
            swal('错误', '请选择地址', 'error');
            return;
        }
        $scope.serviceProviderId = $scope.serviceProviderInfo.id || '';
        if ($scope.serveChecked && $scope.serviceProviderId === '') {
            swal('', '请选择服务店', 'error');
            return;
        }
        if ($scope.goodsList === undefined || $scope.goodsList === null || $scope.goodsList.length === 0) {
            swal('', '请至少选择一个商品', 'error');
            return;
        }

        var payTotalPrice = parseFloat($scope.snapshotTotalPrice) + parseFloat($scope.expressFee) + parseFloat($scope.serviceFee) - parseFloat($scope.discountTotalPrice);
        payTotalPrice = payTotalPrice.toFixed(2);
        var orderData = {
            channel: $scope.channel,
            payType: $scope.payType,
            payTotalPrice: payTotalPrice
        };
        var snapshotCountMap = {};
        //为避免核算商品信息时候商品价格（数量）不正确，用goodsListForPay而非goodsList
        angular.forEach($scope.goodsListForPay, function (goods) {
            snapshotCountMap[goods.goodsSnapshotId] = goods.shoppingCartNum;
        });
        var cardList = [];
        angular.forEach($scope.usedGoodsList, function (usedItem) {
            cardList.push(usedItem.serial);
        });

        var online = {};
        online['snapshotCountMap'] = snapshotCountMap;
        online['cardList'] = cardList;
        // online['at_session_id'] = at_session_id;

        online = angular.extend({}, online, {
            snapshotTotalPrice: $scope.snapshotTotalPrice,
            discountTotalPrice: $scope.discountTotalPrice,
            deliveryFee: $scope.expressFee,
            payTotalPrice: payTotalPrice,
            serviceFee: $scope.serviceFee,
            serviceProviderId: $scope.serviceProviderId,
            address: $scope.onlineAddress
        });

        orderData['online'] = online;

        console.log(JSON.stringify(orderData))
        $scope.orderData=orderData;

        if (!$.isEmptyObject($scope.invoice)) {
            orderData.invoiceId = $scope.invoice.id;
        }
        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/order/prePay/', orderData)
            .then(function (response) {

                var respData = response.data.data;

                if (response.data.errCode === 0) {
                    // console.log(JSON.stringify(respData))
                    //支付成功后删除购物车中已购买的商品
                    delectShoppingCartList();
                    if (respData.pay_success === true || respData.pay_success === 'true') {

                        if ($scope.channel === 'm') {
                            window.location.href = '#m/user/order';
                        } else if ($scope.channel === 'pc') {
                            $location.path('pc/user/order');
                        }
                        return;
                    }

                    window.sessionStorage.setItem("payResp", JSON.stringify(response.data));
                    // alert(11)

                    window.location.href = "/html/wait_pay.html";
                } else {
                    swal('', response.data.errMsg, 'error');
                }
            });
    };
    //支付成功删除购物车中已购买的商品

    function delectShoppingCartList() {
            // angular.forEach($scope.orderData,function(k,index){
            //     console.log(k.snapshotCountMap)
            // })

        var shoppingCartGoodsIds = JSON.parse(window.sessionStorage.getItem('shoppingCartGoodsIds'));
        for (var i = 0; i < shoppingCartGoodsIds.length; i++) {


            var params = {
                shoppingCartGoodsId: shoppingCartGoodsIds[i]
            }

            restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/deleteShoppingCartGoods/', params).success(function (response) {
                if (response.errCode === 0) {
                    console.log('支付后购物车商品删除成功')
                    // getShoppingCartGoods();
                    // calcTotalPriceAndNum();

                }
            });
        }
    }

    $scope.setAddress = function (event, chosenAddress) {
        angular.forEach($scope.addressList, function (address) {
            address.isChoiced = false;
        });

        chosenAddress.isChoiced = true;
    };

    $scope.addAddress = function () {

        var param = angular.extend({}, {default: 0}),
            isValidAddress = true;

        if (!$.isEmptyObject($scope.onlineAddressTmp)) {
            angular.forEach($scope.onlineAddressTmp, function (v, k) {
                if ($.isEmptyObject(v) || v === '') {
                    isValidAddress = false;
                    return;
                }
            });
        } else {
            isValidAddress = false;
        }

        if (isValidAddress) {
            address = angular.extend({}, {
                name: $scope.onlineAddressTmp.name,
                phone: $scope.onlineAddressTmp.phone,
                province: $scope.onlineAddressTmp.province.name,
                city: $scope.onlineAddressTmp.city.name,
                region: $scope.onlineAddressTmp.region.name,
                street: $scope.onlineAddressTmp.street.name,
                detail: $scope.onlineAddressTmp.detail
            });

            param = angular.extend({}, param, {address: address});

            $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/address/add/', param)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        angular.forEach($scope.addressList, function (address, ai) {
                            address.choiced = false;
                        });

                        address = angular.extend({}, address, {
                            choiced: true
                        });

                        $scope.onlineAdrress = address;
                        $scope.addressList.push(address);
                    } else {
                        swal('添加新地址失败', response.data.errMsg, 'error');
                    }
                });
        } else {
            swal('添加地址失败', '请设置有效省、市、区、街道以及具体地址', 'error');
        }
        $scope.onlineAddressTmp.name = "";
        $scope.onlineAddressTmp.phone = '';

    };

    $scope.onChoicedOnlineAddress = function (event, addressIndex) {
        event.preventDefault();

        var chosenAddress = $scope.addressList[addressIndex];

        angular.forEach($scope.addressList, function (address) {
            address.choiced = false;
        });

        chosenAddress.choiced = true;
        $scope.onlineAddress = chosenAddress;
        $scope.onCloseChoiceServiceAddress();
        window.sessionStorage.setItem("onlineAddress", JSON.stringify($scope.onlineAddress));
        //计算快递费
        calcExpressFee();
    };

    $scope.onGetCities = function (event, province) {
        var param = {
            level: 2,
            parentId: province.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
            .then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.cities = response.data.data;
                }
            });
    };

    $scope.onGetRegion = function (event, city) {
        var param = {
            level: 3,
            parentId: city.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
            .then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.regions = response.data.data;
                }
            });
    };
    //    街道
    $scope.onGetStreet = function (event, region) {
        var param = {
            level: 4,
            parentId: region.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
            .then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.streets = response.data.data;
                }
            });
    };

    $scope.onChoicedServiceProvider = function (event, serviceProviderIndex) {
        var choicedServiceProvider = $scope.serviceProviders[serviceProviderIndex];
        /*百度地图*/
        var markers;

        angular.forEach($scope.serviceProviders, function (serviceProvider, si) {
            serviceProvider.choiced = false;
        });

        var baiduMapCenter = {
            center: {
                lat: choicedServiceProvider.landmark.latitude,
                lng: choicedServiceProvider.landmark.longitude
            }
        };

        markers = {
            markers: {
                lat: choicedServiceProvider.landmark.latitude,
                lng: choicedServiceProvider.landmark.longitude,
                title: choicedServiceProvider.name,
                content: choicedServiceProvider.name
            }
        }

        $scope.mapOptions = angular.extend({}, $scope.mapOptions, baiduMapCenter, markers);

        choicedServiceProvider.choiced = true;
        $scope.serviceProviderInfo = choicedServiceProvider;
        window.sessionStorage.setItem("serviceProviderInfo", JSON.stringify($scope.serviceProviderInfo));
    };

    $scope.servicePoint = {};

    $scope.onlineAddressTmp = {};

    $scope.servicePointAddressTmp = {};

    $scope.addressList = [];

    $scope.isToggleTransactionTypeMode = false;

    $scope.addressEditMode = false;

    $scope.payType = 'wx';

    restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/').then(function (response) {
        if (response.data.errCode === 0) {
            $scope.provinces = response.data.data;
        } else {
            swal('获取省份列表失败', errMsg, 'error');
        }
    });

    $scope.provinces = [];
    $scope.cities = [];
    $scope.regions = [];

    $scope.displaySerials = function () {
        $scope.serialsDisplay = !$scope.serialsDisplay;
    };

    /*
     移除兑换券
     * */
    $scope.removeSerial = function (serialIndex) {
        var usedGoods = $scope.usedGoodsList[serialIndex];

        angular.forEach($scope.goodsList, function (goods) {
            if (goods.goodsSnapshotId === usedGoods.goodsSnapshotId) {
                goods.shoppingCartNum += 1;
            }
        });

        $scope.usedGoodsList.splice(serialIndex, 1);


        calcDiscountPrice();
    };

//m站移除产品兑换码
    $scope.removeSerialMobile = function (serialIndex) {
        $scope.usedGoodsListMobile = JSON.parse(window.sessionStorage.getItem('usedMeg'));
        console.log($scope.usedGoodsListMobile)
        var usedGoodsMobile = $scope.usedGoodsList[serialIndex];

        angular.forEach($scope.goodsList, function (goods) {
            if (goods.goodsSnapshotId === usedGoodsMobile.goodsSnapshotId) {
                goods.shoppingCartNum += 1;
            }
        });

        $scope.usedGoodsListMobile.splice(serialIndex, 1);
        $scope.usedGoodsList = $scope.usedGoodsListMobile;
        calcDiscountPrice();
    };
    /* M站兑换卡券 */
    $scope.mobileAddVoucher = function () {
        window.sessionStorage.setItem('usedGoodsList', JSON.stringify($scope.usedGoodsList));

        $location.path('m/voucher');
    };

    /*
     提交兑换卡号
     * */
    $scope.goodsListForCord = $scope.goodsList;
    $scope.submitVoucher = function (data) {
        // console.log($scope.goodsList)
        var cardId;
        if (data === undefined) {
            cardId = undefined;
        }
        cardId = data.cardId;
        cardId = cardId || '';
        if (cardId === '') {
            swal('产品兑换卡', '请输入卡号', 'error');
            return;
        }

        var existed = false;
        angular.forEach($scope.usedGoodsList, function (usedGoods) {
            if (usedGoods.serial === cardId) {
                existed = true;
            }
        });
        if (existed) {
            swal('产品兑换卡', '该卡券已使用', 'error');
            return false;
        }
        // console.log(cardId)
        $scope.myPromise = restProxyService.getCardInfo({'cardId': cardId}).success(function (response) {
            var canUse = false;
            // console.log(JSON.stringify(response.data))
            // console.log($scope.goodsList)

            if (response.errCode !== 0) {
                swal('不存在', response.errMsg, 'error');
                return;
            } else {
                var exchangeGoodsList = response.data;
                angular.forEach(exchangeGoodsList, function (exchangeItem) {
                    if (canUse)return;
                    angular.forEach($scope.goodsListForCord, function (goods) {
                        //对比购物车中商品和返回的可兑换商品
                        if (goods.choiced && goods.goodsSnapshotId === exchangeItem.goodsSnapshotId && goods.shoppingCartNum > 0) {
                            goods.shoppingCartNum -= 1;
                            canUse = true;
                            $scope.usedGoodsList = $scope.usedGoodsList || [];
                            $scope.usedGoodsList.push(angular.extend({}, goods, {
                                goodsName: goods.goodsSnapshot.name,
                                goodsPrice: goods.goodsSnapshot.onlinePrice,
                                serial: cardId
                            }));
                            // console.log($scope.usedGoodsList)
                            return;
                        }
                    });
                });
                if (!canUse) {
                    swal('产品兑换卡', '购物车中没有可以兑换的商品', 'error');
                    return;
                }

                calcDiscountPrice();
            }
        });

        $scope.data.cardId = undefined;
    };


    /**
     * 提交发票信息
     * @param type
     * @param invoiceData
     * @returns {number}
     */
    $scope.submitInvoice = function (type, invoiceData) {
        var invoiceData = invoiceData || {};
        var commonInvoice = invoiceData.commonInvoice || {};
        var invoiceHeader = commonInvoice.header || '';
        if (invoiceHeader === '') {
            swal('提交发票信息', '请完善表单', 'error');
            return 0;
        }

        var invoiceParams = angular.extend({}, {
            type: type
        }, invoiceData);

        $scope.myPromise = restProxyService.updateInvoice(invoiceParams).success(function (response) {
            if (response.errCode === 0) {
                swal('提交发票信息', '提交成功', 'success');
                window.sessionStorage.setItem('invoice', response.data);
                if ($scope.channel === 'm') {
                    restProxyService.goToURL('m/invoice');
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

    $scope.init();
});
