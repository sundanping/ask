productApp.controller('ProductDetailController', function ($scope,
                                                           $http,
                                                           shoppingCartService,
                                                           API_URL_ROOT,
                                                           restProxyService,
                                                           $routeParams,
                                                           userProxyService,
                                                           $location) {
    $scope.displayProductInfoMode = false;
    //不免邮的省份
    $scope.noFreeAreas = [];

    $scope.displayProductInfo = function () {
        var $window = $(window);
        $scope.displayProductInfoMode = !$scope.displayProductInfoMode;

        if ($scope.displayProductInfoMode) {
            setTimeout(function () {
                $window.scrollTop($window.height());
            }, 5)
        }
    };

    $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, "/productDetail/", {
        productId: $routeParams.productId
    }).success(function (response) {
        /* 拓展metaMap, 用以响应ng-disabled* */
        $scope.extendMetaMap = {};
        if (response.errCode === 0) {
            $scope.data = response.data;
            // console.log(response.data)

            $scope.productName = $scope.data.productName;
            $scope.goods.onLinePrice = response.data.priceStr;
            $scope.goods.offLinePrice = response.data.priceStr;

            //产品型号 sun

            $scope.goods.productCategoryId = response.data.productCategoryId;
            $scope.productCategoryId = response.data.productCategoryId;
            $scope.goods.categoryServiceFee = response.data.categoryServiceFee;
            $scope.categoryServiceFee = response.data.categoryServiceFee;
            $scope.goods.productCategoryName = response.data.productCategoryName;
            $scope.productCategoryName = response.data.productCategoryName;

            $scope.productPicURL = $scope.data.pcBuyUrlList[0];
            /*M站上只显示前六张图*/
            if ($scope.channel === 'm' && $scope.data.picUrlList.length > 6) {
                $scope.data.picUrlList = $scope.data.picUrlList.slice(0, 6);
            }

            /* 遍历MetaMap下子集合 * */


            angular.forEach($scope.data.metaMap, function (metaLabels, metaLabelKey) {
                $scope.extendMetaMap[metaLabelKey] = {};

                angular.forEach(metaLabels, function (label, labelIndex) {
                    var tmpLabelMap = $scope.extendMetaMap[metaLabelKey];
                    tmpLabelMap[label] = {
                        disabled: false,
                        selected: false
                    };
                });
            });

            var levelIndex1 = 0;
            var levelIndex2 = 0;

            angular.forEach($scope.extendMetaMap, function (metaLabelsMap, metaLabelKey) {
                angular.forEach(metaLabelsMap, function (statusMap, label) {
                    if (levelIndex1 == 0 && levelIndex2 == 0) {
                        $scope.choiceLabel(metaLabelsMap, statusMap);
                    }
                    levelIndex2++;
                });
                levelIndex2 = 0;
                levelIndex1++;
            });


            setTimeout(function () {
                $('.flexslider').flexslider({
                    animation: "slide",
                    slideshowSpeed: 6000,
                    animationSpeed: 600
                });
            }, 300);
        }
    });
// begin免邮省份获取
    $scope.myPromise = restProxyService.getExpressArea(null).success(function (resp) {
        if (resp.errCode === 0) {
            $scope.noFreeAreas  = resp.data;
            // console.log(resp.data)
            // window.sessionStorage.setItem('noFreeAreas',resp.data.province);
            // console.log(resp.data.province)

        }
    });
    $scope.noFreeAreas= window.sessionStorage.getItem('noFreeAreas');
    // console.log( $scope.noFreeAreas)
//end 免邮省份获取

    //跳转购物车
    $scope.onShoppingCart = function (event, jumpFlag) {
        var modal = UIkit.modal("#user-login-modal");
        jumpFlag = jumpFlag === void 0 ? false : true;

        if (jumpFlag && !userProxyService.isLogin()) {
            if (!modal.isActive()) {
                modal.show();
            }
            return;
        }

        if ($.isEmptyObject($scope.goods) || $scope.goods.goodsSnapshotId === '') {
            swal({title:'添加到购物车失败', text:'请正确选择商品规格参数', type:'error',timer:800});
            return;
        } else {
            // 对购物车进行修改时，清空与卡券相关sessionStorage
            window.sessionStorage.removeItem('copyShoppingCartGoods');
            window.sessionStorage.removeItem('usedGoodsList');
            // console.log( $scope.goods)

            var par={
                "goodsSnapshotId":$scope.goods.goodsSnapshotId,
                "shoppingCartNum":$scope.goods.number}
            restProxyService.sendJsonPost(API_URL_ROOT,'/user/shoppingCard/saveShoppingCartGoods/',par)
                .success(function(rsp){
                    // console.log( rsp.data)
                    if(rsp.errCode===0){
                        if (jumpFlag) {
                            if (/mobile/.test(window.location.href)) {
                                $location.path('m/shopping_settlement');
                            } else {
                                $location.path('pc/shopping_settlement');
                            }
                        }else{
                        swal(
                            {title:'添加购物车成功', type:'success',animation:'slide-from-top',timer:'800'}
                            );
                        }
                        setTotalNum($scope.goods.number*1);





                        // }else{
                        // swal(
                        //     {title:'添加购物车失败',text:'再次添加', type:'error',timer:'1000'});
                    }

                })

        }

         var NUMBER= shoppingCartService.getTotalNum();

function setTotalNum(a){
    // shoppingCartService.setTotalNum(a+NUMBER*1);
    if(window.localStorage.nums===null||window.localStorage.nums===undefined ||window.localStorage.nums==='undefined'||
        undefined==='' ){
           window.localStorage.nums=0
     }
        var ask=window.localStorage.nums;
    window.localStorage.nums=a+ask*1;
    // console.log(window.localStorage.nums)
}
    };

    $scope.onChangeProductPicURL = function (picUrl) {
        $scope.productPicURL = picUrl;
    };

    $scope.choiceLabel = function (metaLabelsMap, selectedLabelStatusMap) {
        // console.log("choiceLabel");
        // console.log(metaLabelsMap);
        // console.log(selectedLabelStatusMap);
        /*
         选中标签
         @param metaLabels {Map}
         同类型标签
         @param selectedLabelStatusMap {Map}
         被选中的标签状态信息
         * */
        /*所有被选中的标签* */
        var allSelectedLabelMap = {},
            optionalLabelsMap = {};

        /* 所有同类型标签的设为未选中状态* */
        angular.forEach(metaLabelsMap, function (labelStatusMap, labelMap) {
            labelStatusMap.selected = false;
        });

        /*当前标签为选中状态* */
        selectedLabelStatusMap.selected = true;

        /* 遍历extendMetaMap， 获取已有的标签* */

        angular.forEach($scope.extendMetaMap, function (metaLabelsMap, metaLabelKey) {
            angular.forEach(metaLabelsMap, function (statusMap, label) {
                if (statusMap.selected) {
                    allSelectedLabelMap[metaLabelKey] = label;
                }
            });
        });

        /*匹配goods* */
        angular.forEach($scope.data.goodsMap, function (goods, goodsIndex) {
            var flag = true;

            angular.forEach(goods.goodsLabel, function (goodsLabelVal, goodsLabelKey) {
                /* 匹配商品 * */
                if (allSelectedLabelMap[goodsLabelKey] !== goodsLabelVal) {
                    flag = false;
                }
            });

            /*如果匹配到商品* */
            if (flag) {
                $scope.goods = angular.extend({}, {
                    productName: $scope.productName,
                    categoryServiceFee: $scope.categoryServiceFee,
                    productCategoryId: $scope.productCategoryId,
                    productCategoryName: $scope.productCategoryName,
                    number: 1
                }, goods);

                $scope.goods.onLinePrice = $scope.goods.onLinePrice.toFixed(2);
                $scope.goods.offLinePrice = $scope.goods.offLinePrice.toFixed(2);
            }
        });

        /* 遍历已选中的label **/
        angular.forEach(allSelectedLabelMap, function (selectedLabel, selectedLabelKey) {
            var hasOptionalFlag = false;

            angular.forEach($scope.data.goodsMap, function (goods, goodsIndex) {
                if (goods.goodsLabel[selectedLabelKey] === selectedLabel) {
                    hasOptionalFlag = true;
                    return false;
                }
            });

            if (hasOptionalFlag) {
                angular.forEach($scope.data.goodsMap, function (goods, goodsIndex) {
                    angular.forEach(goods.goodsLabel, function (goodsLabelVal, goodsLabelKey) {
                        /* 如果该labelKey之前不存在， 则在optionalLabelsMap中初始化一个数组* */
                        if (!(optionalLabelsMap[goodsLabelKey] instanceof Array)) {
                            optionalLabelsMap[goodsLabelKey] = [];
                        }

                        /*避免添加重复标签* */
                        if (optionalLabelsMap[goodsLabelKey].indexOf(goodsLabelVal) === -1) {
                            optionalLabelsMap[goodsLabelKey].push(goodsLabelVal);
                        }
                    });
                });
            }
        });

        /* 遍历不可选的标签* */
        angular.forEach($scope.extendMetaMap, function (labelsMap, labelsKey) {
            var tmpOptionalLabels = optionalLabelsMap[labelsKey];

            if (tmpOptionalLabels === void 0) {
                tmpOptionalLabels = [];
            }

            angular.forEach(labelsMap, function (labelMap, labelKey) {
                /* 设置不可选的标签状态 * */
                if (tmpOptionalLabels.indexOf(labelKey) === -1) {
                    labelMap.disabled = true;
                }
            });
        });
    };

    $scope.addGoodsNumber = function (event) {
        $scope.goods.number += 1;
    };

    $scope.onScroll = function (direction) {
        var $thumbnails = $('.thumbnails'),
            offset = 340,
            offseted = $thumbnails.scrollTop(),
            distance;

        if (direction === 'top') {
            distance = offseted - offset;

            if (distance < 0) {
                $thumbnails.scrollTop(0);
            } else {
                $thumbnails.scrollTop(distance);
            }

        } else if (direction === 'bottom') {
            distance = offseted + offset;
            $thumbnails.scrollTop(distance);
        }
    };

    $scope.reduceGoodsNumber = function (event) {
        if ($scope.goods.number > 1) {
            $scope.goods.number -= 1;
        }
    };

    $scope.onProductIntro = function () {
        /*
         查看产品详情
         @param event {Event}
         * */
        event.stopPropagation();


        var $ele = $(event.target),
            productDetailUrl = $ele.parents('li').data().productDetailUrl;
        $location.path(productDetailUrl);
    };

    $scope.onProductDetail = function (event) {
        event.stopPropagation();

        var productDetailUrl = event.target.dataset.productDetailUrl;
        $location.path(productDetailUrl);
    };

    $scope.goods = {
        goodsSnapshotId: '',
        goodsId: '',
        goodsPic: '',
        goodsName: '',
        goodsNameEn: '',
        onLinePrice: 0,
        productCategoryId: '',
        categoryServiceFee: '',
        productCategoryName: '',
        number: 1,
        offLinePrice: 0
    };

    $scope.userOptions = {
        viscosity: '',
        capacity: ''
    };

    $scope.commentList = [];

 //   添加商品是更新数量
//   function setTotalNum() {
//     return  $totalNumber=   shoppingCartService.getTotalNum();
// }
// var NUMBER=$totalNumber+$scope.goods.number;
// shoppingCartService.setTotalNum(NUMBER);

});