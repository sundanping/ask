$(function() {
    var userLoginSlider = new SliderUnlock(".user-login-form .slideunlock-slider", {
            labelTip: '拖动滑块完成验证',
            successLabelTip: '验证成功'
        }, function() {
            var $form = $('.user-login-form'),
                $btnSubmitLogin = $form.find('.btn-user-login');
            $btnSubmitLogin.prop('disabled', '');
        }, function() {}),
        userRegisterSlider = new SliderUnlock(".user-register-form .slideunlock-slider", {
            labelTip: '拖动滑块完成验证',
            successLabelTip: '验证成功'
        }, function() {
            var $form = $('.user-register-form'),
                $btnSubmitLogin = $form.find('.btn-user-register'),
                isAgreeUserAgreement = $form.has('.uk-icon-check-square').length === 0 ? false : true;
            if (isAgreeUserAgreement) {
                $btnSubmitLogin.prop('disabled', '');
            }
        }, function() {});

    userLoginSlider.init();
    userRegisterSlider.init();
});