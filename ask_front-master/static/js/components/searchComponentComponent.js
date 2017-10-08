productApp.controller('SearchComponent', function($scope, $timeout,restProxyService, $location) {
    /* search 组件 * */
    $scope.visibility = false;
    $scope.resultVisibility = false;

    $scope.goToURL = function(url) {
        $scope.visibility = false;
        $scope.resultVisibility = false;
        restProxyService.goToURL(url);
    };

    $scope.hideSearch = function() {
            $scope.visibility = false;
            $scope.resultVisibility = false;
    };



    $scope.doSubmit=function($event){
        if($event.keyCode===13){
            $scope.submitSearch();
        }
    };

    $scope.submitSearch = function() {
        var searchParams = angular.extend({}, $scope.data);
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT,
            '/index/search/', searchParams).success(function(response) {
            if (response.errCode === 0) {
                $scope.resultList = response.data;
                $scope.resultVisibility = true;
            }
        });
    };
});