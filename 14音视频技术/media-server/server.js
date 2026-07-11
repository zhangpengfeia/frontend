/**
 *
 * 目录结构示例：
 * project/
 * ├─ server.js        # Node.js 服务器入口文件
 * ├─ public/
 * │   └─ index.html   # 前端播放页面
 * └─ media/
 *     └─ live/
 *         └─ stream/  # ffmpeg 拉取RTMP流生成 HLS 文件
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpegPath = ffmpegInstaller.path;

// 配置
const PORT = 7001;
const HLS_DIR = path.join(__dirname, 'media/live/stream');
const RTMP_URL = 'rtmp://localhost/live/stream'; // OBS 推流地址

// 确保 HLS 目录存在
fs.mkdirSync(HLS_DIR, { recursive: true });

// 启动 Express 服务
const app = express();
app.use(cors()); // 允许跨域访问（可选）

// 提供前端页面
app.use(express.static(path.join(__dirname, 'public')));

// 提供 HLS 文件静态服务
app.use('/live', express.static(path.join(__dirname, 'media/live')));

app.listen(PORT, () => {
  console.log(`HTTP 服务已启动`);
  console.log(`前端页面: http://localhost:${PORT}/index.html`);
  console.log(`HLS 流地址: http://localhost:${PORT}/live/stream/index.m3u8`);
});

// 启动 ffmpeg 自动切片
const ffmpegArgs = [
  '-i', RTMP_URL,
  '-c', 'copy',
  '-f', 'hls',
  '-hls_time', '2',
  '-hls_list_size', '5',
  '-hls_flags', 'delete_segments+append_list',
  path.join(HLS_DIR, 'index.m3u8')
];

console.log('启动 ffmpeg 转 HLS...');
const ffmpeg = spawn(ffmpegPath, ffmpegArgs);

// 打印 ffmpeg 日志
// ffmpeg.stdout.on('data', data => console.log(`ffmpeg: ${data}`));
// ffmpeg.stderr.on('data', data => console.log(`ffmpeg err: ${data}`));

ffmpeg.on('close', code => console.log(`ffmpeg 退出，code=${code}`));
