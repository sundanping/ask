productApp.controller('UserAddressController', function($scope, $location,
    restProxyService, userProxyService, API_URL_ROOT) {
    /*
     用户地址
     * */

    var _user = userProxyService.getLoginData(),
        _userParams = {
            at_session_id: _user.atSessionId
        };

    $scope.default = 0;

    /*
    清除用户选择的地址信息
    * */
    function _restAddressInfo() {
        $scope.address = {
            province: void 0,
            city: void 0,
            region: void 0,
            street: void 0,
            detail: ''
        };
    }


    /*
    验证地址
    @param address {object}
    @return boolean
    * */
    function _addressValidator(address) {
        if (address === void 0 || $.isEmptyObject(address)) {
            return false;
        } else if (address.province === void 0 ||
            $.isEmptyObject(address.province) ||
            address.province.name.trim() === '') {

            return false;
        } else if (address.city === void 0 ||
            $.isEmptyObject(address.city) ||
            address.city.name.trim() === '') {

            return false;
        } else if (address.region === void 0 ||
            $.isEmptyObject(address.region) ||
            address.region.name.trim() === '') {

            return false;
        } else if (address.street === void 0 ||
            $.isEmptyObject(address.street) ||
            address.street.name.trim() === '') {

            return false;
        } else if (address.detail === void 0 || address.detail.trim() === '') {
            return false;
        }

        return true;
    }

    /*
    获取用户地址列表
    * */
    $scope.getAddressList = function() {
        restProxyService.sendHttpGet(API_URL_ROOT, '/user/info/address/list/',
            _userParams).success(function(response) {

            if (response.errCode === 0) {
                $scope.addressList = response.data;
            } else {
                swal('获取用户地址列表', response.errMsg, 'error');
            }
        });
    };

    /*
    获取省份列表
    * */
    $scope.getProvinceList = function() {
        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/')
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.provinces = response.data;
                } else {
                    swal('获取省份列表', response.errMsg, 'error');
                }
            });
    };

    /*
    获取省份对应的城市列表
    @param province {object}
        省份信息
    * */
    $scope.getCites = function(province) {
        var provinceParams = {
            level: 2,
            parentId: province.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', provinceParams)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.cities = response.data;
                } else {
                    swal('获取城市列表', response.errMsg, 'error');
                }
            });
    };

    /*
    获取城市对应的行政区列表
        @param city {object}
        城市信息
    * */
    $scope.getRegionList = function(city) {
        var cityParams = {
            level: 3,
            parentId: city.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', cityParams)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.regions = response.data;
                } else {
                    swal('获取行政区列表', response.errMsg, 'error');
                }
            });
    };

    /*
    获取行政区对应的街道列表
        @param region {object}
        行政区信息
     * */
    $scope.getStreetList = function(region) {
        var regionParams = {
            level: 4,
            parentId: region.id
        };

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', regionParams)
            .success(function(response) {
                if (response.errCode === 0) {
                    $scope.streets = response.data;
                } else {
                    swal('获取街道列表', response.errMsg, 'error');
                }
            });
    };

    /*
    添加新地址
        @param address {object}
    * */
    $scope.addAddress = function(address) {
        var validateResult = _addressValidator(address),
            addAddressParams;


        if (!validateResult) {
            swal('添加地址', '请完善地址信息', 'error');
            return 0;
        }

        addAddressParams = {
            address: {
                name: address.name,
                phone: address.phone,
                province: address.province.name,
                city: address.city.name,
                region: address.region.name,
                street: address.street.name,
                detail: address.detail
            },
            default: $scope.default
        };

        restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/address/add/',
            addAddressParams).success(function(response) {

            if (response.errCode === 0) {
                swal('添加地址', '添加成功', 'success');
                _restAddressInfo();

                // 如果是M站则跳转到地址列表页面
                if ($scope.channel === 'm') {
                    $location.path('m/user/address');
                } else if ($scope.channel === 'pc') {
                    if ($scope.addressList !== void 0 || $scope.addressList.length > 0) {
                        $scope.addressList.push(addAddressParams.address);
                    }
                }
            } else {
                swal('添加地址', response.errMsg, 'error');
            }
        });
    };

    /*
    跳转到新增地址页面
    * */
    $scope.goToAddAddressPage = function(url) {
        $location.path(url);
    };

    /*
    删除地址
    @param addressIndex {int}
        地址下标
    * */
    $scope.delectAddress = function(addressIndex) {
        var deleteAddressParams = {
            index: addressIndex
        };
        restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/address/delete/',
            deleteAddressParams).success(function(response) {

            if (response.errCode === 0) {
                swal('删除地址', '删除地址成功', 'success');

                $scope.addressList.splice(addressIndex, 1);
            } else {
                swal('删除地址', response.errMsg, 'error');
            }
        });
    };

    /*
    设置默认地址状态
    * */
    $scope.setDefaultStatust = function() {
        if ($scope.default === 0) {
            $scope.default = 1;
        } else if ($scope.default === 1) {
            $scope.default = 0;
        }
    };
});