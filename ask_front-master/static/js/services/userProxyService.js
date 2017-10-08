productApp.factory('userProxyService', ['md5', '$location', '$http', function (md5, $location, $http) {
    var phoneReg = /^\d{11}$/,
        codeReg = /^\d{4}$/,

        MAX_CODE_LENGTH = 4;

    var SESSION_NAME = "at_session_id";

    function getValidatorMessage(context) {
        /*
         验证器消息返回
         @param context {json}
         @return {json}, 格式为 extend(defaultOptions, context);
         * */
        //默认项
        var defaultOptions = {
                status: true,
                message: '',
                data: {}
            },
            result = angular.extend({}, defaultOptions, context);

        return result;
    }

    function _isLogin() {
        var atSessionId = window.localStorage[SESSION_NAME];

        if (atSessionId === void 0 ||
            atSessionId === null ||
            atSessionId.trim() === '' ||
            atSessionId === 'undefined') {
            this.loginState = false;
            return false;
        } else {
            this.loginState = true;
            return true;
        }
    }

    /*
     * Send http get request
     */
    function sendHttpGet(apiPrefix, path, params, options) {
        var httpRequest = $http.get(apiPrefix + encodeURI(path), {params: params}, options);

        httpRequest.success(function (response) {
            if (response.errCode === 100) {
                _removeLoginInfo();
                return;
            }
        });
        return httpRequest;
    }

    return {
        isLogin: function () {
            var atSessionId = window.localStorage[SESSION_NAME];

            if (atSessionId === void 0 ||
                atSessionId === null ||
                atSessionId.trim() === '') {
                return false;
            } else {
                return true;
            }
        },
        loginState: _isLogin(),
        getLoginData: function () {
            var loginData = {},
                atSessionId = window.localStorage[SESSION_NAME];

            if (atSessionId !== void 0 || atSessionId !== null) {
                loginData = angular.extend({}, loginData, {
                    atSessionId: atSessionId
                });
            }
            return loginData;
        },
            setLogin: function (data) {
            window.localStorage[SESSION_NAME] = data.at_session_id;
            this.loginState = true;
        },
        logout: function (indexURL) {
            // restProxyService.sendHttpGet(API_URL_ROOT, '/login/logout/', {
            //     at_session_id: window.localStorage.at_session_id
            // });
            sendHttpGet(API_URL_ROOT, '/login/logout/', {
                at_session_id: window.localStorage.at_session_id
            });
            delete window.localStorage.at_session_id;
            this.loginState = false;

            swal({
                title:'退出登录', text:'退出登录成功', type:'success',timer:'800'});
            // window.localStorage.clear();
            window.localStorage.nums=0;
            $location.path(indexURL);

            // 退出登录后清除相关数据
            window.sessionStorage.removeItem('copyShoppingCartGoods');
            window.sessionStorage.removeItem('usedGoodsList');
            window.sessionStorage.removeItem('goods');
            window.sessionStorage.removeItem('purchasesNum');
        },
        userLoginValidator: function (user) {
            /*
             验证用户登录信息
             IUserLoginData = {
             phone;
             code;
             };
             @param userLoginData <IUserLoginData>
             @return {json}
             * */
            var context,
                userCode = String(user.code),
                passwd;

            if (!phoneReg.test(user.phone)) {
                return getValidatorMessage({
                    status: false,
                    message: '手机号码格式错误'
                });
            }

            if (userCode.length < MAX_CODE_LENGTH) {
                return getValidatorMessage({
                    status: false,
                    message: '验证码格式错误'
                });
            }

            if (userCode.length === MAX_CODE_LENGTH && !codeReg.test(userCode)) {
                return getValidatorMessage({
                    status: false,
                    message: '验证码格式错误'
                });
            }

            if (userCode.length > MAX_CODE_LENGTH) {
                passwd = md5.createHash(userCode);
                context = angular.extend({}, user, {
                    code: passwd
                });
                return getValidatorMessage({data: context});
            }

            return getValidatorMessage();
        },
        userRegisterValidator: function (user) {
            /*
             验证用户登录信息
             IUserRegisterData = {
             phone;
             code;
             recommendPhone,
             };
             @param userLoginData <IUserRegisterData>
             @return {json}
             * */
            var context,
                userCode = String(user.code);

            if (String(user.recommendPhone).length !== 0 && !phoneReg.test(user.recommendPhone)) {
                return getValidatorMessage({
                    status: false,
                    message: '推荐人手机号码格式错误'
                });
            }

            if (!phoneReg.test(user.code)) {
                return getValidatorMessage({
                    status: false,
                    message: '手机号码格式错误'
                });
            }

            if (!codeReg.test(userCode)) {
                return getValidatorMessage({
                    status: false,
                    message: '验证码格式错误'
                });
            }
        },
        displayUserLoginModal: function () {
            var modal = UIkit.modal('#user-login-modal');

            if (!modal.isActive()) {
                modal.show();
            }
        }
    };
}]);