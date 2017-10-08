productApp.controller('CommentListController', function ($scope,
                                                         API_URL_ROOT,
                                                         restProxyService,
                                                         userProxyService,
                                                         $routeParams) {

    $scope.initParam = function () {
        //每页数量
        $scope.limit = $scope.limit || 10;

        if ($scope.channel === 'm') {
            $scope.limit=6;
        }
            $scope.limit = parseInt($scope.limit);
        //商品id
        $scope.productId = $routeParams.productId;

        //分页
        $scope.pageNumArr = [];
        //商品评论列表
        $scope.commentList = [];

        //初始化不知道totalNum数量,假定非常大
        $scope.totalNum = 1000000;

        // 是否更多评论
        $scope.hasMore = true;

        //当前页面
        $scope.nowIndex = 0;

        $scope.getCommentList(0);
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
     获取评论列表
     @param index {number}
     * */

    $scope.getCommentList = function (pageIndex) {
        var start = $scope.limit * pageIndex;
        var end = start + $scope.limit;
        end = end > ($scope.totalNum) ? ($scope.totalNum) : end;
        var requestParams = angular.extend({}, {
            "productId": $scope.productId,
            "start": start,
            "end": end,
        });

        /* 更新当前页数 */
        $scope.nowIndex = pageIndex;

        $scope.loadingPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/comment/product/list/',
            requestParams).success(function (resp) {
            if (resp.errCode === 0) {

                if ($scope.channel === 'm') {
                    //追加到已获取到的评论列表中
                    $scope.commentList = $scope.commentList.concat(resp.data.result);
                } else {
                    $scope.commentList = resp.data.result;
                }

                $scope.totalNum = resp.data.total;
                $scope.maxNum=Math.ceil( $scope.totalNum/10);

                // 判断是否还有更多
                if ($scope.limit * (pageIndex + 1) >= $scope.totalNum) {
                    $scope.hasMore = false;
                }

                $scope.generatePageNumArr();

            }
            // else {
            //     swal('获取评论失败', resp.errMsg, 'error');
            // }
        });
    };


});