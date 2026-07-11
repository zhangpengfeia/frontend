const NodeMediaServer = require("node-media-server");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpegPath = ffmpegInstaller.path;

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    mediaroot: "./media", // 指定生成文件的目录
    allow_origin: "*",
  },
  trans: {
    ffmpeg: ffmpegPath, // 使用ffmpeg-static自动获取路径
    tasks: [
      {
        app: "live", // OBS 推流地址里的 app 名称
        hls: true,
        hlsFlags: "hls_time=2:hls_list_size=3:hls_flags=delete_segments",
        hlsKeep: true, // true 表示保留切片文件
        dash: false,
      },
    ],
  },
};

const nms = new NodeMediaServer(config);
nms.run();