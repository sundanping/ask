productApp.controller('MechanicerListCtrl', function($scope, restProxyService,
                                                        API_URL_ROOT, userProxyService, $routeParams) {
    var user = userProxyService.getLoginData();

    /*修理厂ID*/
    $scope.serviceProviderId = $routeParams.serviceProviderId;

    $scope.initMechanicerList = function () {
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/mechanic/list/', {
            at_session_id: user.atSessionId,
            serviceProviderId: $scope.serviceProviderId
        }).success(function (response) {
            if (response.errCode === 0) {
                $scope.mechanicerList = response.data;

                angular.forEach($scope.mechanicerList, function (mechanicer, mechanicerIndex) {
                    angular.extend(mechanicer, {
                        choiced: false
                    });
                });
            } else {
                swal('获取修理工列表', response.errMsg, 'error');
            }
        })
    };


    /*
    选择修理工
    * */
    $scope.choiceMechanicer = function (mechanicerIndex) {
        angular.forEach($scope.mechanicerList, function (mechanicer, mechanicerIndex) {
            angular.extend(mechanicer, {
                choiced: false
            });
        });

        $scope.mechanicerList[mechanicerIndex].choiced = true;
        $scope.mechanicer = $scope.mechanicerList[mechanicerIndex];
    };
    
    /*确定要选择修理工*/
    $scope.submitMechanic = function () {
        if ($scope.mechanicer === void 0 || $scope.mechanicer === null) {
            swal('选择修理工', '请选择要评价的修理工', 'error');
            return 0;
        }
        window.sessionStorage.setItem('mechanicer', JSON.stringify($scope.mechanicer));
        history.back();
    }
});