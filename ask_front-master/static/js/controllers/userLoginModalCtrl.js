function UserLoginModalController($scope, $http, API_URL_ROOT, restProxyService,
                                  userProxyService,shoppingCartService, qrInfoProxyService) {
    /*
     controller user login or register
     * */

    $scope.onSendCode = function(event, phone) {
        /*
         send code
         @param event {Event}
         @param phone {string}
         * */
        var api = API_URL_ROOT + '/phone/code/?phone=' + phone,

            $ele = $(event.target),

            stopSeconds = 0,
            countSeconds = 30,
            intervalTime = 1000,

            waitInfoTemplate = '{0}秒后重试',
            waitInfo,

            rawButtonText = $ele.text(),

            timer;

        var phoneReg = /^\d{11}$/;

        if (!phoneReg.test(phone)) {
            swal('获取验证码失败', '请输入11位正确的手机号码', 'error');
            return false;
        }

        $http.get(api).then(function(response) {
            if (response.data.errCode === 0) {
                $ele.attr('disabled', 'disabled');
                swal('验证码发送成功');

                timer = setInterval(function() {
                    if (countSeconds === stopSeconds) {
                        $ele.text(rawButtonText);
                        $ele.removeAttr("disabled");

                        clearInterval(timer);
                    } else {
                        waitInfo = waitInfoTemplate.csFormat(countSeconds);
                        $ele.text(waitInfo);

                        --countSeconds;
                    }
                }, intervalTime);
            } else {
                swal("发送验证失败", response.data.errMsg, "error");
            }
        });

    };

    $scope.onCloseModal = function(event) {
        var modal = UIkit.modal(".user-login-modal");

        if (modal.isActive()) {
            modal.hide();
        }
    };
    //登录回车事件
    $scope.toLogin=function($event){
        if($event.keyCode==13){
            $scope.onUserLogin();
        }
    }
    var param=0;
    var pars;
    $scope.onUserLogin = function(event) {
        var user = $scope.login,
            userLoginValidator = userProxyService.userLoginValidator(user),
            loginParams,
            isSlide = $('.user-login-form').find('.slideunlock-lockable').val();
        if (isSlide === 0) {
            return 0;
        }

        if (userLoginValidator.status) {

            user = angular.extend({}, user, userLoginValidator.data);

            restProxyService.sendHttpPost(API_URL_ROOT, '/login/user/', user).then(function(response) {
                if (response.data.errCode === 0) {
                    var modal = UIkit.modal(".user-login-modal");

                    if (modal.isActive()) {
                        modal.hide();
                    }


                    userProxyService.setLogin(response.data.data);

                    swal({
                        title: '登录成功',
                        // text: '<a style=";" href="#">HTML内容登录成e功！</a>',
                        text:'登录成功',
                        type: 'success',
                        // html: true,
                        timer: 1000

                    });
                        param={
                            at_session_id:response.data.data.at_session_id
                        };
                    pars={
                        staff_session_id:response.data.data.at_session_id
                    };
                        // console.log(response.data.data)
                    getShoppingCartNums();
                    // var _user = userProxyService.getLoginData(),
                    //     _userParams = {
                    //         at_session_id: _user.atSessionId
                    //     };


                } else {
                    swal("登录失败", response.data.errMsg, "error");
                }
            });


        } else {
            swal("请检查您的输入", userLoginValidator.message, "error");
        }
    };

    $scope.onAgreeUserAgreement = function() {
        var isSlide = $('.user-register-form').find('.slideunlock-lockable').val();
        $scope.isAgreeUserAgreement = !$scope.isAgreeUserAgreement;

        if ($scope.isAgreeUserAgreement) {
            $scope.userRegisterTip = false;
        }
    };

    $scope.onAgreeUserAgreementContinue = function($event) {
        var modal = UIkit.modal(".user-login-modal");
        modal.show();
    };
    //enter 注册事件
    $scope.toRegister=function($event){
        if($event.keyCode==13){
            $scope.onUserRegister();
        }
    }
    $scope.onUserRegister = function($event) {
        var qrInfo = qrInfoProxyService.getQRInfo(),
            user = angular.extend({}, $scope.register, { 'qrInfo': qrInfo }),
            userRegisterValidator = userProxyService.userLoginValidator(user),
            registerParams,
            isSlide = $('.user-register-form').find('.slideunlock-lockable').val();

        if (isSlide === 0) {
            return 0;
        }

        if ($scope.isAgreeUserAgreement) {
            $scope.userRegisterTip = true;
            return 0;
        }

        if (userRegisterValidator.status) {
            restProxyService.sendJsonPost(API_URL_ROOT, '/register/user/', user).then(function(response) {
                if (response.data.errCode === 0) {
                    var modal = UIkit.modal(".user-login-modal");

                    if (modal.isActive()) {
                        modal.hide();
                    }

                    // swal("注册成功");
                    swal("注册成功", '请到个人中心完善资料', "success");

                    userProxyService.setLogin(response.data.data);

                } else {
                    swal("注册失败", response.data.errMsg, "error");
                }
            });
        } else {
            swal("请检查您的输入", userRegisterValidator.message, "error");
        }

    };
        function getShoppingCartNums(){
            $scope.total=0;

            $scope.myPromise=restProxyService.sendHttpGet(API_URL_ROOT, '/user/shoppingCard/shoppingCartGoodsList/',param).success(function (response) {
                $scope.data = response.data;

                if(Object.prototype.toString.call(response.data)==='[object Array]'){
                    for(var i=0;i<response.data.length;i++){
                        $scope.total+=response.data[i].shoppingCartNum;
                        // console.log($scope.total)

                    }
                    // console.log($scope.total)
                    window.localStorage.nums=$scope.total||0;

                }
            })

        }
    $scope.isAgreeUserAgreement = false;
    $scope.userRegisterTip = true;

    $scope.login = {
        phone: '',
        code: ''
    };

    $scope.register = {
        phone: '',
        code: '',
        recommendPhone: ''
    };
}