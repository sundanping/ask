var productApp = angular.module('productApp', ['ngRoute', 'angular-md5', 'cgBusy', 'ngTouch', 'ngBaiduMap']).config(config);

function config(baiduMapApiProvider) {
    baiduMapApiProvider.version('2.0').accessKey('36O8zh5N6wBKFp1LBt2l1wOAG6wqo22P');
}


var API_URL_ROOT = 'https://www.autoask.com/autoask';
// var API_URL_ROOT = "http://192.168.1.171:8087/autoask";
productApp.constant('API_URL_ROOT', API_URL_ROOT);

String.prototype.csFormat = function () {
    if (arguments.length == 0) return this;
    for (var s = this, i = 0; i < arguments.length; i++)
        s = s.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
    return s;
};

productApp.constant('BUTTON_BG_COLOR', '#ccc');

productApp.filter('trustHtml', function ($sce) {
    return function (input) {
        return $sce.trustAsHtml(input);
    }
});