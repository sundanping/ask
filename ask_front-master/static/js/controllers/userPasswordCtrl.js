productApp.controller('UserPasswordController', function($scope, $location,
    md5, restProxyService, userProxyService, API_URL_ROOT) {
    /*
     用户密码修改
    * */

    /*
    清除用户新设的密码信息
    * */
    function _restPasswordInfo() {
        $scope.password = '';
        $scope.confirmPassword = '';
    }

    /*
    验证用户密码
    @param password {string}
    @param confirmPassword {string}
        确认密码
    * */
    function _validatorPassword(password, confirmPassword) {
        if (password === void 0 || password.trim() === '') {
            return false;
        } else if (confirmPassword === void 0 || confirmPassword.trim() === '') {
            return false;
        } else if (password !== confirmPassword) {
            return false;
        }
        return true;
    }

    /*
    修改密码
    @param password {string}
    @param confirmPassword {string}
        确认密码
    * */
    $scope.modifyPassword = function(password, confirmPassword) {
        var validateResult = _validatorPassword(password, confirmPassword),
            params;

        if (!validateResult) {
            swal('修改密码', '请检查您输入的密码', 'error');
            return 0;
        } else if (password.length < 6) {
            swal('修改密码', '密码至少要有6个字符', 'error');
            return 0;
        }

        params = {
            password: md5.createHash(password)
        };
    // console.log(params)
        restProxyService.sendJsonPost(API_URL_ROOT, '/user/info/password/reset/',
            params).success(function(response) {

            if (response.errCode === 0) {
                swal('修改密码', '修改密码成功', 'success');
                _restPasswordInfo();

                if ($scope.channel === 'm') {
                    $location.path('m/user/info');
                } else if ($scope.channel === 'pc') {}
            } else {
                swal('修改密码', response.errMsg, 'error');
            }
        });
    };
});