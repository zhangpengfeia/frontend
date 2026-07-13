const express = require("express");
const router = express.Router();
const { getCaptchaService } = require("../service/captchaService");

// 登录
router.get("/", async function (req, res) {
  // 生成一个验证码
  const captcha = await getCaptchaService();
  // 将验证码存储在 session 中
  req.session.captcha = captcha.text;
  // 设置响应头
  res.setHeader("Content-Type", "image/svg+xml");
  res.send(captcha.data);
});

module.exports = router;
