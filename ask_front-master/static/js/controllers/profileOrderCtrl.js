productApp.controller('ProfileOrderController', function($scope) {
    /*
     用户中心控制器
     * */
    var templates = {
            'order_list': '../../static/templates/my_order_list.html',
            'profile': '../../static/templates/my_profile.html'
        },
        urlHash = window.location.hash.replace('#/', '');

         $scope.switcher = function(event) {
        /*
         切换页面
         @param event {Event}
         * */
        event.preventDefault();
        var hrefHash = event.target.href.split('#')[1];

        $scope.template = templates[hrefHash];
    };

    $scope.template = templates[urlHash];
});