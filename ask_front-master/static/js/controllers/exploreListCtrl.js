// 服务探索列表
productApp.controller('exploreListCtrl', function($scope, API_URL_ROOT, restProxyService) {

    //页面初始化
    $scope.init = function () {
        $scope.channel = 'pc';

        $scope.type = 'explore';

        //每页数量
        $scope.limit = 10;

        //分页
        $scope.pageNumArr = [];

        //商品评论列表
        $scope.exploreList = [];

        //初始化不知道totalNum数量,假定非常大
        $scope.totalNum = 1000000;

        $scope.getExploreList(0);
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
    };

    /*
     获取探索列表
     @param index {number}
     * */
    $scope.getExploreList = function (pageIndex) {
        var start = $scope.limit * pageIndex;
        var end = start + $scope.limit;
        var requestParams;

        end = end > ($scope.totalNum) ? ($scope.totalNum) : end;

        requestParams = angular.extend({}, {
            'start': start,
            'end': end,
            'channel': $scope.channel,
            'type': $scope.type,
        });

        $scope.loadingPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/index/richText/list/', requestParams)
            .success(function (resp) {
                if (resp.errCode === 0) {

                    $scope.exploreList = resp.data;
                    $scope.totalNum = resp.data.count;
                    $scope.generatePageNumArr();

                    angular.forEach($scope.exploreList, function (explore, exploreIndex) {
                       explore.createTime = explore.createTime.split(' ')[0];
                    });

                    setTimeout(function () {
                        var $exploreImgWrapList = $('.explore-list .img-wrap');

                        $.each($exploreImgWrapList, function (index, exploreImgWrap) {
                            // console.log(exploreImgWrap);
                            $(exploreImgWrap).css('background-image', 'url(' + $scope.exploreList[index].picUrl + ')');
                        });
                    }, 300)
                } else {
                    swal('获取探索列表失败', resp.errMsg, 'error');
                }
            });
    };


    /*
     获取探索详情
     @param index {number}
    * */

    $scope.onExploreDetail = function (id) {
        var  baseURL = 'pc/explore/detail/';
        restProxyService.goToURL(baseURL + id);
    };

    $scope.init();
});
