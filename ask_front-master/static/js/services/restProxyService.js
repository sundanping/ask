productApp.factory('restProxyService', ['$http', 'userProxyService', 'API_URL_ROOT',
    '$location', function ($http, userProxyService, API_URL_ROOT, $location) {

        /**
         * Convert json params to Form params
         */
        var SESSION_NAME = "at_session_id";

        function _getLoginMessage() {
            var atSessionId = window.localStorage[SESSION_NAME];
            var loginMessage = {};

            if (atSessionId !== void 0) {
                loginMessage = angular.extend({}, {
                    at_session_id: atSessionId
                });
            }

            return loginMessage;
        }



        function _removeLoginInfo() {
            window.localStorage[SESSION_NAME] = undefined;

            userProxyService.loginState = false;
            userProxyService.displayUserLoginModal();
        }

        function _param(obj) {

            var query = '',
                name, value, fullSubName, subName, subValue, innerObj, i;

            for (name in obj) {
                value = obj[name];

                if (value instanceof Array) {
                    for (i = 0; i < value.length; ++i) {
                        subValue = value[i];
                        fullSubName = name + '[' + i + ']';
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += _param(innerObj) + '&';
                    }
                } else if (value instanceof Object) {
                    for (subName in value) {
                        subValue = value[subName];
                        fullSubName = name + '.' + subName;
                        innerObj = {};
                        innerObj[fullSubName] = subValue;
                        query += _param(innerObj) + '&';
                    }
                } else if (value !== undefined && value !== null)
                    query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
            }

            return query.length ? query.substr(0, query.length - 1) : query;
        };

        function _extendSessionId(data) {
            if (!data.hasOwnProperty(SESSION_NAME)) {
                data[SESSION_NAME] = userProxyService.getLoginData().atSessionId;
            }
            return data;
        }

        return {
            /* go to url* */
            goToURL: function (url) {
                $location.path(url);
            },
            /**
             * Send http get request
             */



            sendHttpGet: function (apiPrefix, path, params, options) {
                // var sessionId = '?' + "at_session_id=" + requestParams['at_session_id'];
                // path=path+sessionId;
                var httpRequest = $http.get(apiPrefix + encodeURI(path), {params: params}, options);

                httpRequest.success(function (response) {
                    if (response.errCode === 100) {
                        _removeLoginInfo();
                        return;
                    }
                });
                return httpRequest;
                console.log(httpRequest)
            },

            /**
             * Send http post request
             */
            sendHttpPost: function (apiPrefix, path, data, options) {
                var getRequestParams = _getLoginMessage(),
                    httpRequest;

                if (getRequestParams === undefined) {
                    path += '?' + getRequestParams;
                }

                if (options === undefined) {
                    //默认使用 urlencoded方式发送，angular 默认为 application/json
                    var headers = {'Content-Type': "application/x-www-form-urlencoded"};
                    data = _param(data);
                } else {
                    var headers = options.headers;
                }
                httpRequest = $http({
                    method: 'POST',
                    url: apiPrefix + path,
                    data: data,
                    options: options,
                    headers: headers
                });

                httpRequest.success(function (response) {
                    if (response.errCode === 100) {
                        _removeLoginInfo();
                        return;
                    }
                });
                return httpRequest;
            },
            sendJsonPost: function (apiPrefix, path, data) {
                var requestParams = _getLoginMessage(),
                    httpRequest;

                if (requestParams['at_session_id'] !== void 0) {
                    path += '?' + "at_session_id=" + requestParams['at_session_id'];
                }

                httpRequest = $http({
                    method: 'POST',
                    url: apiPrefix + path,
                    data: data,
                    options: {headers: {'Content-Type': "application/json"}},
                    headers: {'Content-Type': "application/json"}
                });

                httpRequest.success(function (response) {
                    if (response.errCode === 100) {
                        _removeLoginInfo();
                        return;
                    }
                });
                return httpRequest;
            },
            sendJsonPost2: function (apiPrefix, path, data) {
                var httpRequest;

                httpRequest = $http({
                    method: 'POST',
                    url: apiPrefix + path,
                    data: data,
                    options: {headers: {'Content-Type': "application/json"}},
                    headers: {'Content-Type': "application/json"}
                });

                httpRequest.success(function (response) {
                    if (response.errCode === 100) {
                        _removeLoginInfo();
                        return;
                    }
                });
                return httpRequest;
            },
            getExpressPrice: function (data) {
                return this.sendJsonPost(API_URL_ROOT, '/expressFree/getExpressPrice/', _extendSessionId(data));
            },
            getInvoice: function () {
                return this.sendHttpGet(API_URL_ROOT, '/user/invoice/view/', _extendSessionId({}));
            },
            updateInvoice: function (data) {
                return this.sendJsonPost(API_URL_ROOT, '/user/invoice/update/', _extendSessionId(data));
            },
            getOrderPre: function () {
                return this.sendHttpGet(API_URL_ROOT, '/user/order/pre/', _extendSessionId({}));
            },
            getUserAddressList: function () {
                return this.sendHttpGet(API_URL_ROOT, '/user/info/address/list/', _extendSessionId({}));
            },
            getExpressFee: function (data) {
                return this.sendJsonPost(API_URL_ROOT, '/expressFree/getOriginalPrice/', _extendSessionId(data));
            },
            getCardInfo: function (data) {
                return this.sendHttpGet(API_URL_ROOT, '/user/card/info/', _extendSessionId(data));
            },
            rePayOrder: function (data) {
                return this.sendHttpPost(API_URL_ROOT, '/user/order/rePay/', _extendSessionId(data));
            },
            getExpressArea: function (data) {
                return this.sendHttpGet(API_URL_ROOT, '/expressFree/getProvinceName/', data);
            },
            getRePayRedirect: function () {
                return this.sendHttpGet(API_URL_ROOT, '/user/order/re-pay-pre/', _extendSessionId({}));
            }
        };
    }
]);