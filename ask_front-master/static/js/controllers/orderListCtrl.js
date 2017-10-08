productApp.controller('OrderListController', function ($scope,
                                                       API_URL_ROOT,
                                                       restProxyService,
                                                       userProxyService,
                                                       $location, $window,
                                                       $document) {
    /*
     订单控制器
     * */

    var user = userProxyService.getLoginData();
    $scope.goToURL = restProxyService.goToURL;

    $scope.initParam = function () {
        //每页数量
        $scope.limit = 10;

        // 是否为加载状态
        $scope.isLoading = false;

        //分页
        $scope.pageNumArr = [];

        //订单列表
        $scope.orderList = [];

        //初始化不知道totalNum数量,假定非常大
        $scope.totalNum = 1000000;

        // 是否更多订单
        $scope.hasMore = true;

        //当前页面
        $scope.nowIndex = 0;

        // 过滤订单状态
        $scope.statusCode = '10';

        // 搜索订单关键字
        $scope.content = '';

        $scope.getOrderList(0);
    };

    $scope.mobileInit = function () {

        $window.onscroll = function () {
            var pageYOffset = $window.pageYOffset;
            var clientHeight = $document[0].documentElement.clientHeight;
            var offsetHeight = $document[0].body.offsetHeight;


            //当滚动到90%的时候去加载
            if (pageYOffset + clientHeight > offsetHeight * 0.9 && !$scope.isLoading) {
                $scope.getOrderList($scope.nowIndex + 1);
            }
        };
    };

    /**
     * 重新初始化分页序号列表
     */
    $scope.generatePageNumArr = function () {
        var arrLength = ($scope.totalNum % $scope.limit == 0) ? parseInt($scope.totalNum / $scope.limit) : parseInt($scope.totalNum / $scope.limit + 1);
        $scope.pageNumArr = [];
        for (var index = 0; index < arrLength; index++) {
            $scope.pageNumArr.push(index);
        }
        $scope.pageNumArrLen= $scope.pageNumArr.length;
    };

    /*
     获取评论列表
     @param index {number}
     * */
    $scope.getOrderList = function (pageIndex) {
        var start = $scope.limit * pageIndex;
        var requestParams = angular.extend({}, {
            at_session_id: user.atSessionId,
            start: start,
            limit: $scope.limit,
            statusCode: $scope.statusCode
        });

        if ($scope.content.trim() !== '') {
            requestParams = angular.extend({}, requestParams, {
                content: $scope.content
            })
        }

        if (pageIndex === 0) {
            $scope.hasMore = true;
        }

        /* 更新当前页数 */
        $scope.nowIndex = pageIndex;

        if (!$scope.isLoading && $scope.hasMore) {
            $scope.isLoading = true;

            $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/order/list/',
                requestParams).success(function (resp) {

                $scope.isLoading = false;

                if (resp.errCode === 0) {

                    $scope.data = resp.data;
                    // console.log($scope.data);
                    /* 扩展订单列表字段， 用于前端效果 */

                    angular.forEach($scope.data.result, function (order, orderIndex) {
                        var number=0;
                        angular.forEach(order.orderGoodsList,function(goods,goodsIndex){
                            number+=order.orderGoodsList[goodsIndex].num;
                        })

                        $scope.data.result[orderIndex] = angular.extend({}, order, {
                            displayLogisticsMode: false
                        },{
                            number:number
                        });
                    });

                    // console.log($scope.data.result);

                    if ($scope.data.result.length <= 0) {
                        swal('获取订单列表', '没有订单', 'error');
                    }

                    $scope.orderList = $scope.orderList || [];

                    if ($scope.channel === 'm') {
                        if (pageIndex === 0) {
                            $scope.orderList = $scope.data.result;
                        } else {
                            //追加到已获取到的评论列表中
                            $scope.orderList = $scope.orderList.concat($scope.data.result);
                        }
                    } else {
                        $scope.orderList = $scope.data.result;
                    }
                    $scope.totalNum = resp.data.total;

                    // 判断是否还有更多
                    if ($scope.limit * (pageIndex + 1) >= $scope.totalNum) {
                        $scope.hasMore = false;
                    }

                    $scope.generatePageNumArr();

                } else if (resp.errCode === 100) {
                    userProxyService.displayUserLoginModal();
                } else {
                    swal('获取订单列表失败', resp.errMsg, 'error');
                }
            }).error(function () {
                $scope.isLoading = false;
                swal('获取订单列表失败', '请重试', 'error');
            });
        }

    };

    // 刷选订单
    $scope.changeStatusCode = function () {
        $scope.getOrderList(0);
    };

    // 搜索订单
    $scope.searchOrder = function () {
        $scope.getOrderList(0);
    };


    $scope.logout = function (indexURL) {
        userProxyService.logout(indexURL);
    };

    $scope.receiveDelivery = function (order) {
        var orderId = order.orderId;
        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/order/received/', {
            orderId: orderId
        }).then(function (response) {
            if (response.data.errCode === 0) {
                swal({
                    title: '',
                    text: '确认收货成功！',
                    type: 'success'
                });
                if (order.serveType === 'online') {
                    if ($scope.channel === 'm') {
                        $location.path('m/comment/order/{0}'.csformat(orderId));
                    } else if ($scope.channel === 'pc') {
                        $location.path('pc/comment/order/{0}'.csformat(orderId));
                    }
                }
            } else {
                swal({
                    title: '确认服务失败',
                    text: response.data.errMsg,
                    type: 'error'
                });
            }
        });
        $scope.getOrderList(0);
    };

    $scope.commentOrder = function (orderId) {
        // alert(csformat(orderId))
        if ($scope.channel === 'm') {
            $location.path('m/comment/order/{0}'.csformat(orderId));
        } else if ($scope.channel === 'pc') {
            $location.path('pc/comment/order/{0}'.csformat(orderId));
        }
    };

    $scope.viewComment = function (orderId) {
        $scope.commentOrder(orderId);
    };


    //重新支付
    $scope.rePay = function (orderId, price) {

        var rePayInfo = {
            orderId: orderId,
            price: price
        };
        window.sessionStorage.setItem("rePayInfo", JSON.stringify(rePayInfo));

        if ($scope.channel === 'pc') {
            $location.path("pc/re-pay");
        } else {
            $location.path("m/re-pay");
        }
    };

    $scope.completeOrder = function (orderId) {
        var params = {orderId: orderId};
        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/order/complete/', params).then(function (response) {
            console.log(response.data)
            if (response.data.errCode === 0) {
                swal({
                    title: '',
                    text: '确认服务成功！',
                    type: 'success'
                });
                if ($scope.channel === 'm') {
                    $location.path('m/comment/order/{10}'.csformat(orderId));
                } else if ($scope.channel === 'pc') {
                    $location.path('pc/comment/order/{10}'.csformat(orderId));
                    // console.log('pc/comment/order/{10}'.csformat(orderId))
                }
            } else {
                swal({
                    title: '确认服务失败',
                    text: response.data.errMsg,
                    type: 'error'
                });
            }
        });
    };

    // 删除订单
    $scope.deleteOrder = function (orderId, orderIndex) {
        var params = {
            orderId: orderId
        };

        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/order/delete/', params)
            .success(function (response) {
                $scope.orderList.splice(orderIndex, 1);
                swal('删除订单', '删除订单成功', 'success');
            }).error(function (response) {
                swal('删除订单', response.errMsg, 'error');
            });
    };

    $scope.showStatus = function (serveType, status) {
        if (status === "to_pay") {
            return '待支付';
        } else if (status === 'expired') {
            return '已过期';
        } else if (status === 'payed') {
            if (serveType === 'online') {
                return '待发货';
            } else {
                return '待确认';
            }
        } else if (status === 'confirm_sp') {
            return '待发货';
        } else if (status === 'confirmed') {
            return '待收货';
        } else if (status === 'refused') {
            return '退款中';
        } else if (status === 'refunded') {
            return '已退款';
        } else if (status === 'received') {
            if (serveType === 'online') {
                return '待评价';
            } else {
                return '待服务';
            }
        } else if (status === 'validated') {
            return '待服务';
        } else if (status === 'complete_s') {
            return '待评价';
        } else if (status === 'comment') {
            return '已评价';
        }
    };


    if (userProxyService.isLogin()) {
        $scope.initParam()
    } else {
        userProxyService.displayUserLoginModal();
    }
});

