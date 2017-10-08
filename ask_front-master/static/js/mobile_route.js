productApp.config(function ($routeProvider, $locationProvider) {
    /*
     TODO: route rules namespace factory
     **/
    $routeProvider
        .when('/', {
            templateUrl: '../../static/templates/mobile/home.html',
            controller: 'HomeProductListController'
        })
        .when('/m/index', {
            templateUrl: '../../static/templates/mobile/home.html',
            controller: 'HomeProductListController'
        })
        .when('/m/article/zhifufangshi', {
            templateUrl: '../../static/templates/mobile/zhifufanshi.html'
        })
        .when('/m/article/xfzbz', {
            templateUrl: '../../static/templates/mobile/xiaofezhebaozhang.html'
        })
        .when('/m/article/falvbaozhang', {
            templateUrl: '../../static/templates/mobile/falvbaozhang.html'
        })
        .when('/m/pay', {
            templateUrl: '../../static/templates/mobile/pay.html'
        })
        .when('/m/product/detail/:productId', {
            templateUrl: '../../static/templates/mobile/product_detail.html',
            controller: 'ProductDetailController'
        })
        .when('/m/shopping_cart', {
            templateUrl: '../../static/templates/mobile/shopping_cart.html',
            controller: 'ShoppingCartController'
        })
        .when('/m/comment/:orderType/:orderId', {
            templateUrl: '../../static/templates/mobile/comment.html',
            controller: 'UserCommentController'
        })
        .when('/m/profile_order', {
            templateUrl: '../../static/templates/mobile/profile_order.html',
            controller: 'ProfileOrderController'
        })
        .when('/m/user/order', {
            templateUrl: '../../static/templates/mobile/order_list.html',
            controller: 'OrderListController'
        })
        .when('/m/user/info', {
            templateUrl: '../../static/templates/mobile/user_profile.html',
            controller: 'UserProfileController'
        })
        .when('/m/user/modify/password', {
            templateUrl: '../../static/templates/mobile/mofidy_passwd.html',
            controller: 'UserPasswordController'
        })
        .when('/m/user/address', {
            templateUrl: '../../static/templates/mobile/user_address.html',
            controller: 'UserAddressController'
        })
        .when('/m/user/car', {
            templateUrl: '../../static/templates/mobile/user_car.html',
            controller: 'UserCarController'
        })
        .when('/m/user/base_info/', {
            templateUrl: '../../static/templates/mobile/user_base_info.html',
            controller: 'UserProfileController'
        })
        .when('/m/user/base_info/edit', {
            templateUrl: '../../static/templates/mobile/user_base_info_edit.html',
            controller: 'UserProfileController'
        })
        .when('/m/user/add/car', {
            templateUrl: '../../static/templates/mobile/add_car.html',
            controller: 'UserCarController'
        })
        .when('/m/user/add/address', {
            templateUrl: '../../static/templates/mobile/add_adrress.html',
            controller: 'UserAddressController'
        })
        .when('/m/invoice/', {
            templateUrl: '../../static/templates/mobile/invoice.html',
            contorller: 'InvoiceController'
        })
        .when('/m/invoice/vat/preview', {
            templateUrl: '../../static/templates/mobile/vat_invoice_preview.html',
            contorller: 'InvoiceController'
        })
        .when('/m/invoice/common/preview', {
            templateUrl: '../../static/templates/mobile/common_invoice_preview.html',
            contorller: 'InvoiceController'
        })
        .when('/m/invoice/vat/edit', {
            templateUrl: '../../static/templates/mobile/vat_invoice_edit.html',
            contorller: 'InvoiceController'
        })
        .when('/m/invoice/common/edit', {
            templateUrl: '../../static/templates/mobile/common_invoice_edit.html',
            contorller: 'InvoiceController'
        })
        .when('/m/invoice/vat/add', {
            templateUrl: '../../static/templates/mobile/vat_invoice_add.html',
            contorller: 'InvoiceController'
        })
        .when('/m/voucher', {
            templateUrl: '../../static/templates/mobile/voucher.html',
            contorller: 'VoucherController'
        })
        .when('/m/search_result', {
            templateUrl: '../../static/templates/mobile/search_result.html',
            contorller: 'SearchRusltController'
        })
        .when('/m/mechanicer/list/:serviceProviderId', {
            templateUrl: '../../static/templates/mobile/mechanicer_list.html',
            controller: 'MechanicerListCtrl'
        })
        .when('/m/invoice/common/add', {
            templateUrl: '../../static/templates/mobile/common_invoice_add.html',
        })
        .when('/m/about_us', {
            templateUrl: '../../static/templates/mobile/about_us.html',
            controller: 'aboutUsCtrl'
        })
        .when('/m/activity/:id', {
            templateUrl: '../../static/templates/mobile/activity.html',
            controller: 'activityCtrl'
        })
        .when('/m/active_form', {
            templateUrl: '../../static/templates/mobile/active_form.html',
            controller: 'activeCtrl'
        })
        .when('/m/help/:type', {
            templateUrl: '../../static/templates/pc/help_rich_text.html',
            controller: 'helpRichTextCtrl'
        })
        .when('/m/logistics/:deliverySerial', {
            templateUrl: '../../static/templates/mobile/logistics.html',
            controller: 'logisticsInformation'
        })
        .when('/m/orderInformation/:id', {
            templateUrl: '../../static/templates/mobile/order_information.html',
            controller: 'orderInformation'
        })
        .when('/m/pay_false', {
            templateUrl: '../../static/templates/mobile/pay_false.html',
        })
        .when('/m/shopping_settlement', {
            templateUrl: '../../static/templates/mobile/shopping_settlement.html',
            controller: 'settlementCtrl'
        })
        .when('/m/re-pay', {
            templateUrl: '../../static/templates/mobile/pay_again.html',
            controller: 'rePayCtrl'
        });

    // $locationProvider.html5Mode(true);

    // $locationProvider.html5Mode({
    //     enabled: true,
    //     requireBase: false
    // });
});