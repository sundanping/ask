productApp.factory('shoppingCartService', function() {



    //获取商品数量

    var  goodsNum=0;
    function _setTotalNum(a){
        goodsNum=a;
    }
    function _getTotalNum(){

        return  goodsNum;
        ;

    }


    /*
     获取购物车所有商品列表
     * */
    function _getShoppingCartMap() {
        var goods = window.sessionStorage.getItem('goods');
        /*
        FIXED: 禁止传入空对象
        * */
        // if (goods === null || goods === void 0 || goods === '{}') {
        //     return {
                // onLine: [],
                // offLine: []
            // };
        // } else
        //
        // {
            return JSON.parse(goods);
        // }

        };
    //
    // function _batchDelete(){
    //     var shoppingCartGoodsIds = JSON.parse(window.sessionStorage.getItem('shoppingCartGoodsIds'));
    //     // var batchArr=[];
    //     for(var j=0;j<shoppingCartGoodsIds.length;j++){
    //         // batchArr.push({shoppingCartGoodsId:shoppingCartGoodsIds[j]})
    //     var par={shoppingCartGoodsId:shoppingCartGoodsIds[j]};
    //
    //         restProxyService.sendJsonPost(API_URL_ROOT, '/user/shoppingCard/deleteShoppingCartGoods/', params).success(function (response) {
    //             if (response.errCode === 0) {
    //                 calcTotalPriceAndNum();
    //             } else {
    //                 swal({title:'删除失败',text: '请再次删除', type:'error',timer:'1000'});
    //                 return false;
    //             }
    //         });
    //
    //
    //
    //     }
    //
    //
    // }


    return {
        setTotalNum:_setTotalNum,
        getTotalNum:_getTotalNum,
        // batchDelete:_batchDelete,
        goods: _getShoppingCartMap()
        // purchasesNum: getTotalNum(),

        // }
    };
});