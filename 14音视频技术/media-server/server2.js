const express = require("express");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { spawn } = require("child_process");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpegPath = ffmpegInstaller.path;

// ==================== 配置 ====================
const PORT = 7001;
const RTMP_URL = "rtmp://localhost/live/stream"; // OBS 推流地址
const OUTPUT_DIR = path.join(__dirname, "media/live/stream");

// 多码率输出
const HLS_OUTPUTS = [
  {
    name: "1080p",
    width: 1920,
    height: 1080,
    videoBitrate: "5000k",
    vf: "scale=1920:1080",
  },
  {
    name: "720p",
    width: 1280,
    height: 720,
    videoBitrate: "3000k",
    vf: "scale=1280:720,boxblur=2:1",
  },
  {
    name: "480p",
    width: 854,
    height: 480,
    videoBitrate: "500k",
    vf: "scale=854:480,boxblur=4:1",
  },
];

// 音频配置
const AUDIO_CONFIG = {
  codec: "aac",
  bitrate: "128k",
  sampleRate: "44100",
  channels: 2,
};

// ==================== HTTP 服务 ====================
const app = express();
app.use(cors());
app.use("/live", express.static(path.join(__dirname, "media/live")));
app.use("/", express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`HTTP 服务已启动: http://localhost:${PORT}`);
  console.log(
    `HLS master 地址: http://localhost:${PORT}/live/stream/master.m3u8`
  );
});

// ==================== 多码率 FFmpeg 转码 ====================
function startHLS() {
  console.log("==== 启动 FFmpeg 多码率 HLS 转码 ====");

  // 清空输出目录
  if (fs.existsSync(OUTPUT_DIR))
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  HLS_OUTPUTS.forEach((o) =>
    fs.mkdirSync(path.join(OUTPUT_DIR, o.name), { recursive: true })
  );

  // 生成 master.m3u8
  let masterContent = "#EXTM3U\n#EXT-X-VERSION:3\n";
  HLS_OUTPUTS.forEach((o) => {
    const bandwidth =
      parseInt(o.videoBitrate) * 1000 + parseInt(AUDIO_CONFIG.bitrate) * 1000;
    masterContent += `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${o.width}x${o.height}\n${o.name}/index.m3u8\n`;
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, "master.m3u8"), masterContent);

  // 构建 FFmpeg 参数
  const args = ["-i", RTMP_URL, "-threads", "auto", "-hide_banner"];

  HLS_OUTPUTS.forEach((o) => {
    args.push(
      "-map",
      "0:v:0", // 映射视频
      "-map",
      "0:a:0", // 映射音频
      "-vf",
      o.vf,
      "-c:v",
      "libx264",
      "-b:v",
      o.videoBitrate,
      "-preset",
      "veryfast",
      "-profile:v",
      "main",
      "-c:a",
      AUDIO_CONFIG.codec,
      "-b:a",
      AUDIO_CONFIG.bitrate,
      "-ar",
      AUDIO_CONFIG.sampleRate,
      "-ac",
      AUDIO_CONFIG.channels,
      "-f",
      "hls",
      "-hls_time",
      "2",
      "-hls_list_size",
      "5",
      "-hls_flags",
      "delete_segments+append_list",
      "-hls_segment_filename",
      path.join(OUTPUT_DIR, o.name, "segment_%03d.ts"),
      path.join(OUTPUT_DIR, o.name, "index.m3u8")
    );
  });

  // 启动 FFmpeg
  const ffmpeg = spawn(ffmpegPath, args);
  ffmpeg.stderr.on("data", (data) => {
    const log = data.toString().trim();
    if (
      log.includes("error") ||
      log.includes("warning") ||
      log.includes("Stream #")
    ) {
      console.log(`[ffmpeg] ${log}`);
    }
  });

  ffmpeg.on("close", (code) => {
    console.log(`⚠️ FFmpeg 退出，code=${code}`);
  });

  console.log("✅ FFmpeg 多码率转码已启动，等待 RTMP 推流...");
}

startHLS();
