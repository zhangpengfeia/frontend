# 音视频技术
1.实时监控 ，使用RTSP等
2.直播，使用RTMP等技术
3.视频会议，webRTC等技术

```js
一个视频包含，封装格式和编码格式：
封装格式：MP4, MKV, AVI等
编码格式：H264, H265, VP8等 VP9等
文件的规范=规定这个文件在字节层面怎么进行排布的

视频可压缩，视频本质就是一张一张的图片，
1.帧内压缩，对每一帧进行压缩
2.帧间压缩，对相邻帧进行压缩
    I帧（关键帧）：独立存在，不依赖于其他帧
    P帧：依赖于前一帧，压缩率高
    B帧：依赖于前一帧和后一帧，压缩率更高

转格式，转码
编码：像素 -> 数学模型 -> 压缩的码流 编码是为了存储和传输
解码：码流 -> 数学模型逆算 -> 解码后的像素
码率 -> 文件大小
```

```js
网络流视频的实现：
const mediaSource = new MediaSource() // 创建一个MediaSource对象
video.src = URL.createObjectURL(mediaSource) // 视频元素的src属性指向MediaSource对象
mediaSource.addEventListener('sourceopen', async () => {
    // 告诉浏览器，接下来给 H.264 编码的数据
    const mime = 'video/mp4;codecs="avc1.42E01E, mp4a.40.2"'
    const sourceBuffer = mediaSource.addSourceBuffer(mime)
    // 请求服务器mp4流
    const response = await fetch('/video.mp4')
    const reader = await response.body.getReader()

    // 不断读取服务器推过来的二进制数据
    while (true) {
        const { done, value } = await reader.read()
        if (done) {
            mediaSource.endOfStream()
            break
        }
        // 把读取的二进制数据，添加到sourceBuffer中
        sourceBuffer.appendBuffer(value)
    }
})
```
## FFmpeg
```js
FFmpeg：编解码，格式转换，推流，拉流，视频截图水印，流媒体中间层
核心：ffmpeg,ffplay,ffprobe
后端服务可以使用FFmpeg
```
## HLS/DASH
```js
切片规则，清晰度自适应，cdn缓存，加密，播放列表（时序，更新机制）

前端js加载 hls.js，hls初始化，绑定video标签，hls.js 下载m3u8播放列表
```