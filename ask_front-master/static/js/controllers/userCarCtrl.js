productApp.controller('UserCarController', function($scope, $location,
    restProxyService, userProxyService, API_URL_ROOT) {
    /*
     用户车型
    * */

    var _user = userProxyService.getLoginData(),
        _userParams = {
            at_session_id: _user.atSessionId
        };


    /*
    清除用户选择的车辆信息
    * */
    function _restCarInfo() {
        $scope.car = {
            brand: void 0,
            model: void 0,
            year: '',
            detailModel: ''
        };
    }

    /*
    验证添加车型参数
    @param car
    @return boolean
    * */
    function _validatorCarInfo(car) {
        if (car === void 0 || $.isEmptyObject(car)) {
            return false;
        } else if (car.brand === void 0 ||
            $.isEmptyObject(car.brand) ||
            car.brand.name.trim() === '') {

            return false;
        } else if (car.model === void 0 ||
            $.isEmptyObject(car.model) ||
            car.model.name.trim() === '') {

            return false;
        } else if (car.year === void 0 || car.year.trim() === '') {
            return false;
        } else if (car.detailModel === void 0 || car.detailModel.trim() === '') {
            return false;
        }

        return true;
    }

    /*
    获取用户已有的车型列表
    * */
    $scope.getCarList = function() {
        restProxyService.sendHttpGet(API_URL_ROOT, '/user/info/car/list/',
            _userParams).success(function(response) {

            if (response.errCode === 0) {
                $scope.carList = response.data;
            } else {
                swal('获取用户已有车型列表', response.errMsg, 'error');
            }
        });
    };

    /*
    获取汽车品牌列表
    * */
    $scope.getCarBrandList = function() {
        restProxyService.sendHttpGet(API_URL_ROOT, '/car/brands/')
            .success(function(response) {

                if (response.errCode === 0) {
                    $scope.brands = response.data;
                } else {
                    swal('获取汽车品牌列表', response.errMsg, 'error');
                }
            });
    };

    /*
    获取品牌所对应的信号
    @param brand {object}
    * */
    $scope.getCarModelList = function(brand) {
        var brandParams = {
            brand: brand.brand
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/car/models/', brandParams)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.models = response.data;
                } else {
                    swal('获取型号', response.errMsg, 'error');
                }
            });
    };

    /*
    获取车型对应的年款
    @param model {object}
    * */
    $scope.getCarYears = function(model) {
        var modelParams = {
            model: model.model
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/car/years/', modelParams)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.years = response.data;
                } else {
                    swal('获取车型年款', response.errMsg, 'error');
                }
            });
    };

    /*
    获取车型年款所对应的具体型号
    @param model {object}
    @param year {string}
    * */
    $scope.getDetailModels = function(model, year) {
        var params = {
            model: model.model,
            year: year
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/car/details/', params)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.detailModels = response.data;
                } else {
                    swal('获取具体款型', response.errMsg, 'error');
                }
            });
    };

    /*
    添加车型
    @param carModel {object}
    * */
    $scope.addCarModel = function(carModel) {
        var validateResult = _validatorCarInfo(carModel),
            carModelParams;

        if (!validateResult) {
            swal('添加车型', '请完善车型信息', 'error');
            return 0;
        }


        carModelParams = {
            brand: $scope.car.brand.name,
            model: $scope.car.model.name,
            year: $scope.car.year,
            detail: $scope.car.detailModel
        };

        restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/car/add/',
            carModelParams).success(function(response) {

            if (response.errCode === 0) {
                swal('添加车型', '添加车型成功', 'success');
                _restCarInfo();

                if ($scope.channel === 'm') {
                    $location.path('m/user/car');
                } else if ($scope.channel === 'pc') {
                    if ($scope.carList !== void 0 || $scope.carList.length > 0) {
                        $scope.carList.push(carModelParams);
                    }
                }
            } else {
                swal('添加车型', response.errMsg, 'error');
            }
        });
    };

    /*
    删除已有地址
    @param carModelIndex {number}
    * */
    $scope.deleteCarModel = function(carModelIndex) {
        var deleteCarModelParams = {
            index: carModelIndex
        };

        restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/car/delete/',
            deleteCarModelParams).success(function(response) {

            if (response.errCode === 0) {
                swal('删除车型', '删除车型成功', 'success');
                $scope.carList.splice(carModelIndex, 1);
            } else {
                swal('删除车型', response.errMsg, 'error');

            }
        });
    };

    /*XXX: 跳转封装为公共方法* */
    /*
    跳转到添加车型页面
    @param url {string}
    * */
    $scope.goToAddCarPage = function(url) {
        $location.path(url);
    };
});