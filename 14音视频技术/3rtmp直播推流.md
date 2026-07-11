# rtmp 推流
### HTTP-FLV：后Flash时代的解决方案
**核心思想**：把RTMP的数据用HTTP传输
### HLS：苹果推出的标准
### LL-HLS：低延迟HLS
把HLS的大切片，拆成小切片，

## RTMP的标准架构
下面是一个最简单的标准架构：

```
[ 推流端 ]  →  [ RTMP 服务器/接入层 ] → [ 转码层 ] → [ 分发层(CDN) ] → [ 拉流端 ]
```
### 推流端（Publisher / Encoder）
推流端负责把视频 + 音频压缩后通过 RTMP 推送到服务器。
常见推流方式：
- OBS
- WebRTC → RTMP（中间转换）
- FFmpeg
- 硬件编码器
- 手机 App SDK
**推流协议：RTMP**