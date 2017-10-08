productApp.factory('qrInfoProxyService', [function () {
    return {
        initQRInfoProxyService: function () {
            var preQrInfo = window.sessionStorage.getItem('qrInfo');

            if (preQrInfo === void 0 || preQrInfo === null || preQrInfo === '{}')
            {
                var searchStr;
                var hashStr;
                var qrInfo = {};
                var qrInfoReg = /\?/;
                var pairArr;

                if (qrInfoReg.test(window.location.search)) {
                    searchStr = window.location.search;
                    searchStr = searchStr.substr(1, searchStr.length - 1);
                    pairArr = searchStr.split("&");

                    for (var index = 0; index < pairArr.length; index++) {
                        var pair = pairArr[index];
                        var entryArr = pair.split("=");
                        if (entryArr.length == 2) {
                            qrInfo[entryArr[0]] = entryArr[1];
                        }
                    }
                } else if (qrInfoReg.test(window.location.hash)) {
                    hashStr = window.location.hash;
                    hashStr = hashStr.split('?')[1];
                    qrInfo = utils.stringToJson(hashStr);
                }

                window.sessionStorage.setItem('qrInfo', JSON.stringify(qrInfo));
            }
        },
        getQRInfo: function () {
            var qrInfo = window.sessionStorage.getItem('qrInfo');
            if (qrInfo === null || qrInfo === void 0) {
                return {};
            }
            return JSON.parse(qrInfo);
        }
    };
}]);