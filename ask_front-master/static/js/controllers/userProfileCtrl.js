productApp.controller('UserProfileController', function ($scope, $http, API_URL_ROOT,
                                                         restProxyService, userProxyService, qrInfoProxyService, md5, $location) {

    var user = userProxyService.getLoginData(),
        userParams = {
            at_session_id: user.atSessionId
        },
        defaultUserData = {
            password: ''
        };

    if (userProxyService.isLogin()) {
        $scope.myPromise = restProxyService.sendHttpGet(API_URL_ROOT, '/user/info/all/', userParams)
            .then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.data = angular.extend({}, defaultUserData, response.data.data);
                } else if (response.data.errCode === 100) {
                    userProxyService.displayUserLoginModal();
                } else {
                    swal('获取用户资料', errMsg, 'error');
                }
            });

        restProxyService.sendHttpGet(API_URL_ROOT, '/car/brands/')
            .then(function (response) {
                if (response.data.errCode === 0) {
                    // $scope.brands = angular.extend({}, response.data.data, defaultUserData);
                    $scope.brands = response.data.data;
                }
            });

        restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/')
            .then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.provinces = response.data.data;
                } else {
                    swal('获取省份列表失败', errMsg, 'error');
                }
            });

        $scope.onGetModel = function ($event) {
            var params = {
                brand: $scope.car.brand.brand
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/car/models/', params)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.models = response.data.data;
                    }
                });
        };

        $scope.onGetModelYears = function ($event) {
            var params = {
                model: $scope.car.model.model
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/car/years/', params)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.years = response.data.data;
                    }
                });
        };

        $scope.onGetDetailModel = function ($event) {
            var params = {
                model: $scope.car.model.model,
                year: $scope.car.year
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/car/details/', params)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.detailModels = response.data.data;
                    }
                });
        };

        $scope.onGetCities = function (event) {
            var param = {
                level: 2,
                parentId: $scope.addressTmp.province.id
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.cities = response.data.data;
                    }
                });
        };

        $scope.onGetRegion = function (event) {
            var param = {
                level: 3,
                parentId: $scope.addressTmp.city.id
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.regions = response.data.data;
                    }
                });
        };

        $scope.onGetStreet = function (event) {
            var param = {
                level: 4,
                parentId: $scope.addressTmp.region.id
            };

            restProxyService.sendHttpGet(API_URL_ROOT, '/area/list/', param)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.streets = response.data.data;
                    }
                });
        };

        $scope.onAddAddress = function ($event) {
            var param;

            if ($scope.isAddressMode) {

                param = {
                    province: $scope.addressTmp.province.name,
                    city: $scope.addressTmp.city.name,
                    region: $scope.addressTmp.region.name,
                    street: $scope.addressTmp.street.name,
                    detail: $scope.addressTmp.detail
                };

                restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/address/add/', param)
                    .then(function (response) {
                        if (response.data.errCode === 0) {
                            $scope.data.addressList.push(param);
                            swal('添加新地址成功', '添加新地址成功', 'success');
                            $scope.isAddressMode = false;
                        } else {
                            swal('添加新地址失败', response.data.errMsg, 'error');
                        }
                    });
                $scope.isAddressMode = false;
            } else {
                $scope.isAddressMode = true;
            }

        };

        $scope.uploadPicture = function () {
            $scope.myPromise = $http({
                url: API_URL_ROOT + '/upload/qiniu/common/?at_session_id=' + user.atSessionId,
                method: 'POST',
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: function () {
                    var formData = new FormData();
                    formData.append('file', $('#upload-avatar')[0].files[0]);
                    return formData;
                }
            }).success(function (response) {
                if (response.errCode === 0) {
                    $scope.data.avatar = response.data;
                } else {
                    swal('上传图片失败', response.errMsg, 'error');
                }
            });

        };

        $scope.onMofidyUserInfo = function ($event) {
            var userInfoParams = {
                avatar: $scope.data.avatar,
                phone: $scope.data.phone,
                nickname: $scope.data.nickname,
                gender: $scope.data.gender,
                birthday: $scope.data.birthday
            };

            //if ($scope.isUserInfoEditMode) {
            if ($scope.data.password.trim() !== '') {
                userInfoParams = angular.extend({}, userInfoParams, {
                    password: md5.createHash($scope.data.password)
                });
            }

            $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/update/', userInfoParams)
                .then(function (response) {
                    if (response.data.errCode === 0) {
                        swal('修改个人信息成功', '修改个人信息成功', 'success');
                        // $scope.addressList.push(param);
                        if ($scope.channel === 'm') {
                            $location.path('m/user/info');
                        } else {
                            //$scope.isUserInfoEditMode = false;
                        }
                    } else {
                        swal('修改个人信息失败', response.data.errMsg, 'error');
                    }
                });
            //} else {
            //    $scope.isUserInfoEditMode = true;
            //}


        };

        $scope.onMofidyCar = function ($event) {
            var carParams = {
                    brand: $scope.car.brand.name,
                    model: $scope.car.model.name,
                    year: $scope.car.year,
                    detail: $scope.car.detailModel
                },
                hasEmptyInfo = false;

            angular.forEach(carParams, function (v, k) {
                if (v === void 0 || v.trim() === '') {
                    swal('修改车型信息', '请选择车型信息', 'error');
                    hasEmptyInfo = true;
                    return;
                }
            });

            if (!hasEmptyInfo) {
                $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/car/update/', carParams).then(function (response) {
                    if (response.data.errCode === 0) {
                        $scope.car = {
                            brand: {},
                            model: {},
                            year: '',
                            detailModel: ''
                        };
                        $scope.data.carModel = carParams;
                        swal('修改车型信息', '修改车型成功', 'success');
                    } else {
                        swal('修改车型信息', response.data.errMsg, 'error');
                    }
                });
            }
        };


        $scope.onDeleteCarMode = function (event) {
            var carParams = {
                brand: '',
                model: '',
                year: '',
                detail: ''
            };

            $scope.myPromise = restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/car/update/', carParams).then(function (response) {
                if (response.data.errCode === 0) {
                    $scope.car = {
                        brand: {},
                        model: {},
                        year: '',
                        detailModel: ''
                    };
                    $scope.data.carModel = carParams;
                    swal('删除车型信息', '删除车型成功', 'success');
                } else {
                    swal('删除车型信息', response.data.errMsg, 'error');
                }
            });
        };

        $scope.logout = function (indexURL) {
            userProxyService.logout(indexURL);
        };

        $scope.onDeleteAddress = function (addressIndex) {
            $scope.data.addressList.splice(addressIndex, 1);
        };

        $scope.addressTmp = {
            province: {},
            city: {},
            region: {},
            street: {}
        };

        $scope.isUserInfoEditMode = false;
        $scope.isAddressMode = false;

        $scope.car = {
            brand: {},
            model: {},
            year: '',
            detailModel: ''
        };
    } else {
        userProxyService.displayUserLoginModal();
    }

    /*
     跳转页面
     @param url {string}
     * */
    $scope.goToPage = function (url) {
        $location.path(url);
    };
});