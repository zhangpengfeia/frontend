# 前端服务监控
市面上最主流：sentry，阿里arms
核心流程：监控sdk -> 数据采集，异常收集，环境信息 -> 上报 -> 数据看板 -> 错误还原 -> 监控报警
```js
需要收集的数据类型：1.异常行为，2.性能数据，3.用户行为（事件）
异常行为：
	1.js异常，资源异常，异步处理异常
        方案：
        js错误 window.onerror,promise 未处理异常：window.onunhandledrejection，但使用window不能跨平台
    2.数据请求：
        xhr,fetch，原型重写
        方案：重写winfow.fetch, XMLHttpRequest.prototype.send
性能数据采集：
    1.CLS (Cumulative Layout Shift)累积布局偏移，衡量页面布局稳定性
    2.lcp (Largest Contentful Paint)最大内容绘制时间，衡量页面主要内容的加载速度
    3.TTFB (Time to First Byte)首字节时间，衡量服务器响应速度
    4.INP (Interaction to Next Paint)交互到下一次绘制的时间，衡量页面响应交互的速度
    5.FP（First Paint）,首次向屏幕绘制内容的时间
    6.FCP(First Contentful Paint) 浏览器首次绘制出内容元素的时间
    7.FMP（First Meaningful Paint）首次绘制用户关注内容的时间
	谷歌提供了 web-vitals，标准化库 import { onCLS,onFCP,onLCP,onTTFB,onINP } from 'web-vitals'
用户行为（事件）
	1.手工埋点，调用sdk
        方案：使用事件监听，点击，滚动，加载等事件，记录用户行为
        事件监听：addEventListener, removeEventListener
        事件参数：target, type, data
    2.无痕埋点
        PV页面浏览量访问一次算一次,UV用户访问量同一天多次访问算一次
        页面停留时间：beforeunload写在事件，时记录用户停留时间
        vue路由切换监听：hashchange
    3.可视化埋点
```

```js
数据上报：
    使用1*1png图片上报数据，性能最优
    上报时间，在浏览器空闲时上报，requestIdleCallback
    用户频繁点击上报时，用map做缓存，批量上报

```

```
sdk核心设计： 
sdk-core包：定义核心逻辑和 transport（前端后端接口联调话术） 接口，负责插件初始化和注册
sdk-browser包：负责浏览器相关插件：性能，异常点击事件采集，自定义浏览器 transport上报
sdk-browser-utils: 提供浏览器环境的工具方法，如浏览器环境，设备信息获取
sdk-node: 适配node环境 transport 上报实现
```