productApp.controller('UserCommentController', function ($scope,
                                                         restProxyService,
                                                         API_URL_ROOT,
                                                         userProxyService,
                                                         $routeParams, $http,
                                                         $location) {
    /* 用户评论控制器 * */
    var user = userProxyService.getLoginData(),
        ORDER_TYPE = {
            'ORDER': 'order',
            'DELIVERY': 'deliveryDetail'
        },
        COMMENT_API_TYPE = {
            'ORDER': '/user/order/detail/',
            'DELIVERY': '/user/order/deliveryDetail/'
        },
        commentAPIParams = {
            at_session_id: user.atSessionId
        },
        commentAPI;


    $scope.goToURL = restProxyService.goToURL;

    /*
     最大星级
     * */
    var MAX_STAR_LEVEL = 5;


    /*服务星级*/
    $scope.serviceRateMap = angular.extend({}, {
        rate: 0,
        starLevelList: []
    });

    /*
     检查是否评价过
     * */
    $scope.hasComment = function () {
        $scope.isCommented = false;

        if ($scope.data.orderComment !== null) {
            $scope.isCommented = true;

            return 0;
        }

        angular.forEach($scope.data.containerList, function (goods, goodsIndex) {
            if (goods.goodsComment !== null) {
                $scope.isCommented = true;
                return 0;
            }
        });

    };

    $scope.hasMechanic = true;
    $scope.orderType = $routeParams.orderType;

    function extendContainerListGoods(containerList, options) {
        var defaultOptions = {
                isGoodsCommentMode: false
            },
            rateMap,
            extendParams,
            newcontainerList = [];


        if (options instanceof Object) {
            extendParams = angular.extend({}, defaultOptions, options);
        } else {
            extendParams = defaultOptions;
        }

        angular.forEach(containerList, function (goods, gi) {
            if (goods.goodsComment === null || goods.goodsComment === 'null') {
                rateMap = {
                    rate: 0,
                    starLevelList: $scope.getStarLevel(0)
                };
                newcontainerList.push(angular.extend({}, goods, extendParams, {
                    goodsComment: {},
                    isCommented: false,
                    rateMap: rateMap
                }));
            } else {
                rateMap = {
                    rate: goods.goodsComment.rate,
                    starLevelList: $scope.getStarLevel(goods.goodsComment.rate)
                };

                newcontainerList.push(angular.extend({}, goods, {
                    isCommented: true,
                    rateMap: rateMap
                }));
            }

        });

        return newcontainerList;
    }

    if (userProxyService.isLogin()) {
        if ($routeParams.orderType === ORDER_TYPE.DELIVERY) {
            commentAPI = COMMENT_API_TYPE.DELIVERY;

            commentAPIParams = angular.extend({}, commentAPIParams, {
                orderDeliveryId: $routeParams.orderId
            });
        } else if ($routeParams.orderType === ORDER_TYPE.ORDER) {
            commentAPI = COMMENT_API_TYPE.ORDER;

            commentAPIParams = angular.extend({}, commentAPIParams, {
                orderId: $routeParams.orderId
            });
        }

        /*
         获取星级状态用以显示
         @param starLevel {number}:
         星级
         * */
        $scope.getStarLevel = function (starLevel) {
            /* 星级信息 */
            var starLevelList = [];

            /*
             默认星级状态
             * */
            for (var i = 0; i < MAX_STAR_LEVEL; i++) {
                starLevelList.push({
                    choiced: false
                });
            }

            /*
             设置当前星级状态
             * */
            for (var i = 0; i < starLevel; i++) {
                starLevelList[i].choiced = true;
            }

            return starLevelList;
        };

        /*
         选择服务星级
         * */
        $scope.choiceServiceStarLevel = function (starLevel) {
            $scope.serviceRateMap = angular.extend({}, $scope.serviceRateMap, {
                rate: starLevel,
                starLevelList: $scope.getStarLevel(starLevel)
            });
        };

        /*
         选择产品星级
         * */
        $scope.choiceGoodsStarLevel = function (goods, starLevel) {
            var starLevelList = $scope.getStarLevel(starLevel);

            goods.rateMap = angular.extend({}, goods.rate, {
                rate: starLevel,
                starLevelList: $scope.getStarLevel(starLevel)
            });
        };

        $scope.onDisplayComment = function (goods) {
            goods.isGoodsCommentMode = !goods.isGoodsCommentMode;
        };

        $scope.uploadPicture = function (element) {
            /*上传图片
             @param element {Element}
             * */
            // $scope.uploadPictureList.push(element.value);

            var goodsIndex = element.dataset.goodsIndex;
            var idName = '#' + element.id;


            $scope.myPromise = $http({
                url: API_URL_ROOT + '/upload/qiniu/common/?at_session_id=' + user.atSessionId,
                method: 'POST',
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: function () {
                    var formData = new FormData();
                    formData.append('file', $(element)[0].files[0]);
                    return formData;
                }
            }).success(function (response) {
                if (response.errCode === 0) {
                    if (!$scope.data.containerList[goodsIndex].goodsComment) {
                        $scope.data.containerList[goodsIndex].goodsComment = {};
                    }

                    if (!$scope.data.containerList[goodsIndex].goodsComment.picUrlList) {
                        $scope.data.containerList[goodsIndex].goodsComment.picUrlList = [];
                    }

                    $scope.data.containerList[goodsIndex].goodsComment.picUrlList.push(response.data);
                } else {
                    swal('上传图片失败', response.errMsg, 'error');
                }
            });

        };

        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, commentAPI, commentAPIParams).then(function (response) {
            var mechanicer;
            if (response.data.errCode === 0) {
                $scope.data = response.data.data;
                // console.log(response.data.data);
                $scope.hasComment();
                /*如果是线下订单*/
                if ($routeParams.orderType === ORDER_TYPE.ORDER) {
                    /*没有修理工信息*/
                    if ($scope.data.mechanicId === void 0) {
                        $scope.hasMechanic = false;

                        if ($scope.channel === 'm') {
                            mechanicer = window.sessionStorage.getItem('mechanicer');

                            if (mechanicer !== null || mechanicer !== void 0) {
                                $scope.mechanicer = JSON.parse(mechanicer);
                            }
                        } else {
                            /*请求修理厂的修理工的列表*/
                            $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/mechanic/list/', {
                                at_session_id: user.atSessionId,
                                serviceProviderId: $scope.data.serviceProviderId
                            }).success(function (response) {
                                if (response.errCode === 0) {
                                    $scope.mechanicerList = response.data;
                                    $scope.mechanicer = {};
                                } else {
                                    swal('获取修理工', response.errMsg, 'error');
                                }
                            });
                        }
                    } else {
                        $scope.hasMechanic = true;
                        $scope.mechanicer = {
                            mechanicId: $scope.data.mechanicId,
                            mechanicName: $scope.data.mechanicName
                        }
                    }
                }

                if ($scope.data.orderComment === null || $scope.data.orderComment === 'null') {
                    $scope.serviceRateMap = angular.extend({}, $scope.serviceRateMap, {
                        rate: 0,
                        starLevelList: $scope.getStarLevel(0)
                    });

                    $scope.data.orderComment = {};
                    $scope.data.orderComment.isCommented = false;
                } else {
                    $scope.serviceRateMap = angular.extend({}, $scope.serviceRateMap, {
                        rate: $scope.data.orderComment.rate,
                        starLevelList: $scope.getStarLevel($scope.data.orderComment.rate)
                    });

                    $scope.data.orderComment.isCommented = true;
                }

                $scope.data.containerList = extendContainerListGoods($scope.data.containerList);

                /* 如果是未评价状态， 展开第一个商品评价滑块 */
                if (!$scope.isCommented) {
                    $scope.data.containerList[0].isGoodsCommentMode = true;
                }
            } else {
                swal({
                    title: '获取评价内容',
                    text: response.data.errMsg,
                    type: 'error'
                });
            }
        });

        $scope.onCommentOrder = function ($event) {
            var api,
                params = {
                    comment: $scope.data.orderComment.comment,
                    rate: $scope.serviceRateMap.rate
                };
            // console.log(params)

            // 商品评价列表
            var goodsCommentList = [];

            // 是否有未评论商品
            var hasNotEvaluatedGoods = false;

            // 订单是否评价
            var hasNotEvaluatedOrder = false;

            if ($routeParams.orderType === ORDER_TYPE.DELIVERY) {
                api = '/user/comment/orderDelivery/';
                params = angular.extend({}, params, {
                    orderDeliveryId: $scope.data.orderDeliveryId
                });
            } else if ($routeParams.orderType === ORDER_TYPE.ORDER) {
                api = '/user/comment/order/';
                params = angular.extend({}, params, {
                    orderId: $scope.data.orderId
                })
            }

            if ($scope.channel === 'pc' && !$scope.hasMechanic) {
                $scope.mechanicer = $scope.data.mechanicer;
            }

            $scope.mechanicer = $scope.mechanicer || {};

            /*如果是线下订单, 则检查mechanicId*/
            if ($scope.data.serviceProviderId && $scope.mechanicer.mechanicId === void 0) {
                swal('评价修理工', '请选择修改工', 'error');
                return 0;
            } else
                if ($scope.data.serviceProviderId) {
                params = angular.extend({}, params, {
                    mechanicId: $scope.mechanicer.mechanicId
                });
            }

            if ($scope.data.orderComment.picUrlList instanceof Array) {
                params = angular.extend({}, params, {
                    picUrlList: $scope.data.orderComment.picUrlList
                })
            }

            // 获取商品评价列表
            angular.forEach($scope.data.containerList, function (goods, goodsIndex) {
                var goodsComment = goods.goodsComment.comment || '';
                var goodsRate = goods.rateMap.rate || 0;

                if (goodsRate !== 0) {
                    goodsCommentList.push({
                        orderGoodsId: goods.orderGoodsId,
                        rate: goodsRate,
                        comment: goodsComment,
                        picUrlList: goods.goodsComment.picUrlList
                    });
                } else {
                    hasNotEvaluatedGoods = true;
                }
            });

            // 检查订单是否被评价
            var orderCommented = $scope.data.orderComment.comment || '';
            var orderRate = $scope.serviceRateMap.rate || 0;

            if (orderCommented === '' || orderRate === 0) {
                hasNotEvaluatedOrder = true;
            }

            if (hasNotEvaluatedGoods && hasNotEvaluatedOrder) {
                swal('提交评价', '有未评价的商品或订单未评价', 'error');
                return false;
            }

            // 扩展评论订单
            params = angular.extend({}, params, {
                goodsCommentList: goodsCommentList
            });

            $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, api, params).then(function (response) {
                if (response.data.errCode === 0) {
                    swal('提交评价', '提交评价成功', 'success');

                    if ($scope.channel === 'm') {
                        $location.path('m/user/order');
                    } else if ($scope.channel === 'pc') {
                        $location.path('pc/user/order');
                    }
                } else {
                    swal({
                        title: '评价失败',
                        text: response.data.errMsg,
                        type: 'error'
                    });
                }
            });
        };

        $scope.onCommentGoods = function (goods) {

            if (goods.isGoodsCommentMode) {
                var apiParams = angular.extend({}, goods.goodsComment, {
                    orderGoodsId: goods.orderGoodsId,
                    rate: goods.rateMap.rate
                });
                $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/comment/goods/', apiParams).then(function (response) {
                    if (response.data.errCode === 0) {
                        swal('提交评价', '提交评价成功', 'success');
                        goods.isCommented = true;
                    } else {
                        swal('提交评价', response.data.errMsg, 'error');
                    }
                });
                goods.isGoodsCommentMode = false;
            } else {
                goods.isGoodsCommentMode = true;
            }
        };

        // $scope.localPicturePath = '';
        // $scope.uploadPictureList = [];
        // $scope.serviceAttitude = '';
        // $scope.satisfaction = '';
        $scope.data = {};
    } else {
        userProxyService.displayUserLoginModal();
    };

    $scope.showImage=true;
    $scope.deleteImage=function(){
        $scope.showImage=!$scope.showImage;
        if($scope.showImage===false){
            angular.forEach(goods.goodsComment.picUrlList,function($index){
                goods.goodsComment.picUrlList.splice($index,1)
            })
            // angular.element(document).find('p').addClass('a');
        }
        // $scope.goods.goodsComment.picUrlList.splice(1)
    }

});