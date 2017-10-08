productApp.controller('HomeProductListController', function ($scope, restProxyService,
                                                             qrInfoProxyService, $location) {
    /*
     首页控制器
     * */

    var INDEX_BASE_API_URL = '/index';

    // 产品列表类别常量
    var NEW_GEN = 'newGenList';
    var CLASSIC_SERIES = 'classicList';
    var CLASSIC_OTHERS = 'classicOtherList';

    // CLASSIC SERIES占位图
    var PLACEHOLDER_PIC_URL_LIST = {
        'newGenList': [
            '../../static/img/product_placeholder.jpg',
            '../../static/img/product_placeholder.jpg'
        ],
        'classicList': [
            '../../static/img/product_placeholder.jpg',
            '../../static/img/product_placeholder.jpg'
        ],
        'classicOtherList': [
            '../../static/img/product_placeholder.jpg',
            '../../static/img/product_placeholder.jpg'
        ]
    };


    /*
     设置产品分类列表占位图片
     @param type: 产品类别
     * */
    function setProductListPlaceholder(type) {
        // 每行展示产品个数
        var rowProductNumber = 0;
        // 对应占位图片列表
        var placeholderPicList = PLACEHOLDER_PIC_URL_LIST[type] || [];
        // 对应产品列表
        var productList = $scope.data[type] || [];
        // 补全个数
        var placeholderNum = 0;
        // 对应分类列表中产品数量
        var productNumber = productList.length;
        // 客户端类型
        var client = $('input[name="clientType"]').val();

        if (client === $scope.CLIENT_TYPE.MOBILE) {
            rowProductNumber = 2;
        } else if (client === $scope.CLIENT_TYPE.PC) {
            rowProductNumber = 3;
        }

        if (placeholderPicList.length > 0 && productNumber > 0) {
            if (productNumber > rowProductNumber) {
                placeholderNum = productNumber % rowProductNumber;

                if (client === $scope.CLIENT_TYPE.PC) {
                    placeholderNum -= 1;
                }
            } else if (productNumber < rowProductNumber) {
                placeholderNum = rowProductNumber - productNumber;
            }

            for (var i = 0; i < placeholderNum; i++) {
                productList.push({
                    'logoUrl': placeholderPicList[i]
                });
            }
        }
    }

    $scope.CLIENT_TYPE = {
        MOBILE: 'm',
        PC: 'pc'
    };

    $scope.clientType = '';

    $scope.onProductIntro = function () {
        /*
         查看产品详情
         @param event {Event}
         * */
        event.stopPropagation();


        var $ele = $(event.target),
            productDetailUrl = $ele.parents('li').data().productDetailUrl;

        if (/intro\/$/.test(productDetailUrl) || /detail\/$/.test(productDetailUrl)) {
            return false;
        }

        $location.path(productDetailUrl);
    };

    $scope.onProductDetail = function (event) {
        event.stopPropagation();

        var productDetailUrl = event.target.dataset.productDetailUrl;
        $location.path(productDetailUrl);
    };


    function getIndexApiUrl() {
        var clientType = $('input[name="clientType"]').val(),
            url;

        if (clientType === $scope.CLIENT_TYPE.MOBILE) {
            url = INDEX_BASE_API_URL + '/m/';
            return url;
        } else if (clientType === $scope.CLIENT_TYPE.PC) {
            url = INDEX_BASE_API_URL + '/pc/';
            return url;
        }

        return url;
    }

    $scope.activeHotProductIndex = 0;

    $scope.changeActiveHotProduct = function (index) {
        $scope.activeHotProductIndex = index;
    };

    $scope.homeInit = function () {
        $scope.changeNum=0;
        var apiURL = getIndexApiUrl();
        var client = $('input[name="clientType"]').val();

        qrInfoProxyService.initQRInfoProxyService();

        if (apiURL !== void 0) {
            $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, apiURL).then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.data = response.data.data;
                        // console.log($scope.data)
                    //m站banner
                    if (client === $scope.CLIENT_TYPE.MOBILE) {

                    var arrImg=[];
                    var index=0;
                    angular.forEach(response.data.data.bannerList,function(banner,bannerIndex){
                        arrImg.push({picUrl:banner.picUrl,linkUrl:banner.linkUrl});
                    })

                    //
                    $scope.arrImg=arrImg;
                    // console.log($scope.arrImg)

                    // // $scope.imgUrls=$scope;
                    $scope.changeNum=0;

                    var int=setInterval(clock,2400);
                        window.sessionStorage.arrImg=arrImg.length;
                    function clock() {

                            $scope.$apply(function(){
                                $scope.changeNum++;
                                if ($scope.changeNum === arrImg.length) {
                                    $scope.changeNum= 0;}
                            })


                        // console.log($scope.changeNum);


                     }
                    }


                    // console.log($scope.changeNum)
                    setProductListPlaceholder(NEW_GEN);
                    setProductListPlaceholder(CLASSIC_SERIES);
                    setProductListPlaceholder(CLASSIC_OTHERS);
                    setTimeout(function () {
                        var $hotGoodsImgList = $('.hot-goods-list').find('.hot-goods-img');

                        var $bannerATags = $('.banner .slides a');
                        var bannerATagLength = $bannerATags.length;
                        var $bannerATag;
                        var $bannera=$('.bannerNum').find('.bannera');

                        if (client === $scope.CLIENT_TYPE.PC) {
                            $.each($bannerATags, function (index, bannerATag) {
                                $bannerATag = $(bannerATag);
                                $bannerATag.css('background-image', 'url(' + $scope.data.bannerList[index].picUrl + ')');

                            });

                        }

                        $('.flexslider').flexslider({
                            animation: "slide",
                            slideshowSpeed: 2000,
                            animationSpeed: 400
                        });

                        $('.flex-control-nav li a').on('touchstart',function(){
                            clearTimeout(int)})
                        $('.flex-control-nav li a').on('mouseover',function(){
                            clearTimeout(int)
                            $(this).trigger('click');
                        });
                    }, 300);

                }
            });


        } else {
            // console.warn('client nokown');
        }
    };

});