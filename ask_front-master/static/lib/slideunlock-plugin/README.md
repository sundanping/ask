# slideunlock-plugin

![图片](http://7xrgqs.com1.z0.glb.clouddn.com/jquery-slideunlock-plugin.png)

## html
```html
<div class="slideunlock-wrapper">
    <input type="hidden" value="" class="slideunlock-lockable"/>
    <div class="slideunlock-slider">
        <span class="slideunlock-label"></span>
        <span class="slideunlock-lable-tip">Slide to unlock!</span>
    </div>
</div>
```

## css

在这个案例中，只是简单设置了滑块和容器的样式，可根据需求自定义`css`或者图片等。

```css
.slideunlock-wrapper{
    width: 360px;
    position: relative;
    padding: 50px;
    background: #ECF0F1;
    margin: 0 auto;
}
.slideunlock-slider{
    padding:20px;
    position: relative;
    border-radius: 2px;
    background-color: #FDEB9C;
    overflow: hidden;
    text-align: center;
}
.slideunlock-slider.success{
    background-color: #E5EE9F;
}
.slideunlock-label{
    width: 40px;
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background: #E67E22;
    z-index: 999;
    border-radius: 2px;
    cursor: pointer;
}
.slideunlock-label-tip{
    z-index: 9;
}
@media screen and (max-width: 640px) {
    .slideunlock-wrapper{
        width: 64%;
    }
}
```

## JavaScript
independent of jQuery. See the [demo](https://github.com/ArronYR/slideunlock-plugin/blob/master/index.plainjs.html)
```javascript
<script type="text/javascript" src="js/slideunlock.min.js"></script>
<script type="text/javascript">
    window.onload = function () {
        var slider = new SliderUnlock(".slideunlock-slider", {}, function(){
            alert('success');
        }, function(){
            document.querySelector(".warn").innerText = "index:" + slider.index + "， max:" + slider.max + ",lableIndex:" + slider.lableIndex + ",value:" + document.querySelector(".slideunlock-lockable").value + " date:" + new Date().getUTCDate();
        });
        slider.init();

        document.querySelector("#reset-btn").addEventListener('click', function(){
            slider.reset();
        });
    }
</script>
```

depend on jQuery. See the [demo](https://github.com/ArronYR/slideunlock-plugin/blob/master/index.html)
```javascript
<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.slideunlock.min.js"></script>
<script type="text/javascript">
    $(function () {
        var slider = new SliderUnlock(".slideunlock-slider", {
            labelTip: "滑动解锁",
            successLabelTip: "解锁成功",
            duration: 200   // 动画效果执行时间，默认200ms
        }, function(){
            alert('success');
        }, function(){
            $(".warn").text("index:" + slider.index + "， max:" + slider.max + ",lableIndex:" + slider.lableIndex + ",value:" + $(".slideunlock-lockable").val() + " date:" + new Date().getUTCDate());
        });
        slider.init();

        $("#reset-btn").on('click', function(){
            slider.reset();
        });
    })
</script>
```

```javascript
var slider = new SliderUnlock(element, options, success, always);
slider.init();

// element is required and right. id or class or any identifying which can be loaded by jquery.
// if you dont want to give options, please give a null object, like this -- {}
```

*If you need to support mobile，Please add `jQuery mobile` plugin：*
```
<script type="text/javascript" src="js/jquery.mobile.min.js"></script>
```

## Demo
<p data-height="268" data-theme-id="0" data-slug-hash="bpeoEp" data-default-tab="result" data-user="ArronYR" class="codepen">See the Pen <a href="http://codepen.io/ArronYR/pen/bpeoEp/">jquery-slide-unlock</a> by Arron.y (<a href="http://codepen.io/ArronYR">@ArronYR</a>) on <a href="http://codepen.io">CodePen</a>.</p>
<script async src="//assets.codepen.io/assets/embed/ei.js"></script>

## About me

文章地址：[详情](http://blog.helloarron.com/2016/03/17/javascript/jquery-slideunlock-plugin/)

博客：[http://blog.helloarron.com](http://blog.helloarron.com)