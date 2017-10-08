var utils = utils || {};

String.prototype.csformat = function() {
    /* 格式化字符 * */

    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m, i) {
            return args[i];
        });
};

/*
url get参数形式字符串转json
* */
utils.stringToJson = function (str) {
    var obj = {};
    var strTmp;

    str = str.split('&')

    $.each(str, function(pi, param) {
        strTmp = param.split('=');
        obj[strTmp[0]] = strTmp[1];
    });

    return obj;
};

utils.getPathParams = function() {
    var pathParamsString = window.location.search,
        pathParamsArray,
        paramTmp,
        pathParams = {};

    if (pathParamsString.trim() === '') {
        return pathParams;
    }

    pathParamsString = pathParamsString.substr(1, pathParamsString.length - 1);

    pathParamsArray = pathParamsString.split('&');

    $.each(pathParamsArray, function(pi, param) {
        paramTmp = param.split('=');
        pathParams[obj[0]] = paramTmp[1];
    });

    return pathParams;
};