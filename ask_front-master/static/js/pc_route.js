productApp.config(function ($routeProvider, $locationProvider) {
    /*
     TODO: route rules namespace factory
     **/
    $routeProvider
        .when('/', {
            templateUrl: '../../static/templates/pc/home.html',
            controller: 'HomeProductListController',
        })
        .when('/pc/index', {
            templateUrl: '../../static/templates/pc/home.html',
            controller: 'HomeProductListController',
        })
        .when('/pc/article/zhifufangshi', {
            templateUrl: '../../static/templates/pc/zhifufanshi.html'
        })
        .when('/pc/article/falvbaozhang', {
            templateUrl: '../../static/templates/pc/falvbaozhang.html'
        })
        .when('/pc/article/xiaofezhebaozhang', {
            templateUrl: '../../static/templates/pc/xiaofezhebaozhang.html'
        })
        .when('/pc/article/huodong', {
            templateUrl: '../../static/templates/pc/huodong.html'
        })
        .when('/pc/article/concern', {
            templateUrl: '../../static/templates/pc/concern.html'
        })
        .when('/pc/product/detail/:productId', {
            templateUrl: '../../static/templates/pc/product_detail.html',
            controller: 'ProductDetailController'
        })
        .when('/pc/product/intro/:productId', {
            templateUrl: '../../static/templates/pc/product_intro.html',
            controller: 'ProductIntroController'
        })
        .when('/pc/shopping_cart', {
            templateUrl: '../../static/templates/pc/shopping_cart.html',
            controller: 'ShoppingCartController'
        })
        .when('/pc/comment/:orderType/:orderId', {
            templateUrl: '../../static/templates/pc/comment.html',
            controller: 'UserCommentController'
        })
        .when('/pc/pay/qrcode', {
            templateUrl: '../../static/templates/pc/pay_qr_code.html',
            controller: 'PayQRCodeController'
        })
        .when('/pc/pay', {
            templateUrl: '../../static/templates/pc/pay.html'
        })
        .when('/pc/user/order', {
            templateUrl: '../../static/templates/pc/order_list.html',
            controller: 'OrderListController'
        })
        .when('/pc/user/info', {
            templateUrl: '../../static/templates/pc/user_profile.html',
            controller: 'UserProfileController'
        })
        .when('/pc/explore/list', {
            templateUrl: '../../static/templates/pc/explore_list.html',
            controller: 'exploreListCtrl'
        })
        .when('/pc/explore/detail/:id', {
            templateUrl: '../../static/templates/pc/explore_detail.html',
            controller: 'exploreDetailCtrl'
        })
        .when('/pc/service/list', {
            templateUrl: '../../static/templates/pc/service_list.html',
            controller: 'serviceListCtrl'
        })
        .when('/pc/about_us', {
            templateUrl: '../../static/templates/pc/about_us.html',
            controller: 'aboutUsCtrl'
        })
        .when('/pc/activity/:id', {
            templateUrl: '../../static/templates/pc/activity.html',
            controller: 'activityCtrl'
        })
        .when('/pc/help/:type', {
            templateUrl: '../../static/templates/pc/help_rich_text.html',
            controller: 'helpRichTextCtrl'
        })
        .when('/pc/user/orderInformation/:id', {
            templateUrl: '../../static/templates/pc/order-information.html',
            controller: 'orderInformation'
        })
        .when('/pc/user/logisticsInformation/:deliverySerial', {
            templateUrl: '../../static/templates/pc/logistics.html',
            controller: 'logisticsInformation'
        })
        .when('/pc/shopping_settlement', {
            templateUrl: '../../static/templates/pc/shopping_settlement.html',
            controller: 'settlementCtrl'
        })
        .when('/pc/pay_false', {
            templateUrl: '../../static/templates/pc/pay_false.html',
        })
        .when('/pc/re-pay', {
            templateUrl: '../../static/templates/pc/pay_again.html',
            controller: 'rePayCtrl'
        });

    // $locationProvider.html5Mode(true);
});