productApp.controller('HeaderController', function($scope, shoppingCartService,
                                                   restProxyService, userProxyService) {
    /*
     头部控制器
     * */

    $scope.shoppingCartService = shoppingCartService;
    $scope.user = userProxyService;
    var categoryList = window.sessionStorage.getItem('categoryList');
    if (categoryList === null || categoryList === 'null') {
        restProxyService.sendHttpGet(API_URL_ROOT, '/index/category/')
            .then(function(response) {
                if (response.data.errCode === 0) {
                    var categoryListNav;
                    $scope.categoryList = response.data.data;
                    window.sessionStorage.setItem('categoryList', JSON.stringify($scope.categoryList));


                    if ($('.classifition-nav').length > 0) {
                        setTimeout(function () {
                            categoryListNav = UIkit.nav('.classifition-nav');
                            categoryListNav.init();
                            categoryListNav.boot();
                            categoryListNav.init();
                        }, 300);
                    }
                } else {
                    swal('请求产品分类失败', response.data.errMsg, 'error');
                }
            });
    } else {
        $scope.categoryList = JSON.parse(categoryList);
    }

    $scope.onClassifitionProductDetail = function (url) {
        var modal = UIkit.modal(".classifition-list-modal");

        if (modal.isActive()) {
            modal.hide();
        }

        restProxyService.goToURL(url);
    };

    /*
     跳转url前检查是否登录
     @param event {Event}
     * */
    $scope.onCheckLoginJumbShoppingCart = function(event) {
        var url = 'm/shopping_settlement',
            modal = UIkit.modal("#user-login-modal");

        if (userProxyService.isLogin()) {
            window.location.href = url;
        }

        if (!modal.isActive()) {
            modal.show();
        }
    };

    $scope.logout = function(indexURL) {
        userProxyService.logout(indexURL);
    };

    // begin免邮省份获取
    $scope.myPromise = restProxyService.getExpressArea(null).success(function (resp) {
        if (resp.errCode === 0) {
            $scope.noFreeAreas = resp.data;
            // console.log(resp.data)
            window.sessionStorage.setItem('noFreeAreas',resp.data.province);
            // console.log(resp.data.province)

        }
    });
//end 免邮省份获取
        window.localStorage.num=shoppingCartService.getTotalNum();
        // console.log(shoppingCartService.getTotalNum())
    $scope.getNum = function () {
        return    window.localStorage.nums;
    }

});
