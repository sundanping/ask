/**
 * settlementCtrl
 */
productApp.controller('settlementCtrl', function ($scope, userProxyService, shoppingCartService, API_URL_ROOT, restProxyService, $location) {
    //判断是否登录
    if (!userProxyService.isLogin()) {
        if (/mobile/.test(window.location.href)) {
            $location.path('m/index');
            userProxyService.displayUserLoginModal();
        } else {
            $location.path('pc/index');
            userProxyService.displayUserLoginModal();
        }
        return;
    }


    var _user = userProxyService.getLoginData(),
        _userParams = {
            at_session_id: _user.atSessionId
        };
    $scope.goToURL = restProxyService.goToURL;

    $scope.init = function () {
        //选中总商品价格
        $scope.totalPrice = 0;
        //选中总商品数量
        $scope.totalNum = 0;
         $scope.allChecked = true;
        // getShoppingCartGoods();
        // $scope.shoppingCartGoods = shoppingCartService.goods;
        // console.log(shoppingCartService.goods)
        $scope.getShoppingCartGoods = getShoppingCartGoods();
        //计算商品总价格以及总数量
    };

//增加商品数量
    $scope.addGoodsNumber = function (event, goodsId, goodsNumber) {
            event.stopPropagation();

        goodsNumber = parseInt(goodsNumber);
        goodsNumber += 1;
        var params = {
            "shoppingCartGoodsId": goodsId,
            "shoppingCartNum": goodsNumber
        }

        $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/updateShoppingCartGoods/', params).success(function (response) {
            if (response.errCode === 0) {

                getShoppingCartGoods();
            }

        })
        // updateShoppingCart();
        // calcTotalPriceAndNum();
    };
//减少商品数量
    $scope.reduceGoodsNumber = function (event, goodsId, goodsNumber) {
        event.stopPropagation();
        goodsNumber = parseInt(goodsNumber);
        goodsNumber = goodsNumber > 1 ? (goodsNumber - 1) : 1;

        var params = {
            "shoppingCartGoodsId": goodsId,
            "shoppingCartNum": goodsNumber
        }

        restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/updateShoppingCartGoods/', params).success(function (response) {
            if (response.errCode === 0) {
                getShoppingCartGoods();

            }

        })
        // updateShoppingCart();
        // calcTotalPriceAndNum();
    };

    $scope.deleteGoods = function (event, shoppingCartGoodsId) {

        var params = {
            shoppingCartGoodsId: shoppingCartGoodsId
        }

        restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/deleteShoppingCartGoods/', params).success(function (response) {
            if (response.errCode === 0) {

                //删除到最后一个时候不能更新   修改成判断最后一个
                if($scope.goodsList.length===1){
                    $scope.totalNum = 0;
                    $scope.totalPrice = 0;
                    window.localStorage.nums=0;
                    shoppingCartService.setTotalNum(0);

                }
                getShoppingCartGoods();
                // calcTotalPriceAndNum();

            } else {
                swal({title:'删除失败',text: '请再次删除', type:'error',timer:'1000'});
                return false;
            }
        });

    };
    $scope.choose = true;

    $scope.chooseGoods = function (event, shoppingCardGoodsMsg) {
        event.preventDefault();

        shoppingCardGoodsMsg.choiced = !shoppingCardGoodsMsg.choiced;
        // console.log(JSON.stringify($scope.goodsList))
        // updateShoppingCart();
        calcTotalPriceAndNum();
        watchAll();
    };




    // 选中所有 不选中所有  -----------全选
    $scope.checkAll = function () {
        $scope.allChecked = !$scope.allChecked;
        angular.forEach($scope.goodsList, function (goods, index) {
            goods.choiced = $scope.allChecked;
        });
        calcTotalPriceAndNum();
        // updateShoppingCart();
    };

    // 监听是否都选中
    function watchAll() {
        var count = 0;
        var chkAll = $scope.goodsList;
        for (var i = 0; i < chkAll.length; i++) {
            if (chkAll[i].choiced) {
                count++;
            }
        }
        if (count == chkAll.length) {
            $scope.allChecked = true;
        } else {
            $scope.allChecked = false;
        }
    }


    //批量删除
    $scope.batchDel = function () {
        var arr = [];
        for (var i = 0; i < $scope.goodsList.length; i++) {


            if ($scope.goodsList[i].choiced) {
                arr.push({shoppingCartGoodsId: $scope.goodsList[i].shoppingCartGoodsId})
            }
        }
        // console.log(arr)

        for (var i = 0; i < arr.length; i++) {

            params = arr[i]

            restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/deleteShoppingCartGoods/', params).success(function (response) {
                if (response.errCode === 0) {
                    calcTotalPriceAndNum();
                } else {
                    swal({title: '删除失败', text: '请再次删除', type: 'error', timer: '1000'});
                    return false;
                }
            });

        }

            for (var index = 0; index < $scope.goodsList.length; index++) {
                if ($scope.goodsList[index].choiced) {
                    $scope.goodsList.splice(index, 1);
                    index--;
                }
            }
            calcTotalPriceAndNum();

        }

    /*更新购物车* */
    // function updateShoppingCart() {
    //     shoppingCartService.uploadShoppingCartMap($scope.shoppingCartGoods);
    // }
    $scope.data = '';
    var goodsList ;

    function getShoppingCartGoods() {

        $scope.myPromise=restProxyService.sendHttpGet(API_URL_ROOT, '/user/shoppingCard/shoppingCartGoodsList/',_userParams).success(function (response) {
            $scope.data = response.data;
            // console.log((response.data).length);
            // console.log(JSON.stringify($scope.data));
            // console.log($scope.data)
            $scope.goodsList = $scope.data;
            goodsList=$scope.goodsList;

            $scope.goodsList=$scope.goodsList ||[];
                if($scope.goodsList.length>0){
                        for (var i = 0; i < goodsList.length; i++) {
                        goodsList[i].choiced = true;
                    }
                    for (var i = 0; i < goodsList.length; i++) {
                      if( goodsList[i].isInvalid){

                      }
                    }

            }
            $scope.goodsList=goodsList;
            calcTotalPriceAndNum();
            return $scope.data;
        })
    }

    //计算总价和数量
    function calcTotalPriceAndNum(){
        // console.log(goodsList)
        if (goodsList === undefined || goodsList === null || $scope.goodsList.length === 0) {
            $scope.totalPrice = 0;
            $scope.totalNum = 0;
            window.localStorage.nums=0;
            return;
        }

        var totalPrice = 0;
        var totalNum = 0;
        var shoppingCartGoodsIds=[];
        angular.forEach(  $scope.goodsList , function (goods, index) {
            if (goods.choiced && !goods.isInvalid) {
                totalPrice += goods.goodsSnapshot.onlinePrice * 1 * goods.shoppingCartNum;
                totalNum += goods.shoppingCartNum * 1;
                shoppingCartGoodsIds.push(goods.shoppingCartGoodsId);
                window.sessionStorage.setItem('shoppingCartGoodsIds',JSON.stringify(shoppingCartGoodsIds));
                // ["2017061010593129cm", "201706091537491y99"]

                // $scope.$apply(function(){
                    window.localStorage.nums=totalNum;

            }
            if( $scope.goodsList===null|| $scope.goodsList===undefined|| $scope.goodsList.length===0){
                window.localStorage.nums=0;
            }
        });
        var shoppingCartList=[];

        for(var i=0;i<$scope.goodsList.length;i++){
            if($scope.goodsList[i].choiced &&!$scope.goodsList[i].isInvalid){
                shoppingCartList.push($scope.goodsList[i])
            }
        }

        window.sessionStorage.setItem('goods',JSON.stringify(shoppingCartList))
         // console.log(shoppingCartList)
        $scope.totalPrice = totalPrice.toFixed(2);
        $scope.totalNum = totalNum;
        // console.log(totalPrice)
        // window.sessionStorage.totalNum=$scope.totalNum;
        // console.log(window.sessionStorage.totalNum)

    }
    $scope.toShoppingCart=function(){
        calcTotalPriceAndNum()
    }
    $scope.init();
});
