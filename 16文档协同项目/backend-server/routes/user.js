const express = require("express");
const router = express.Router();

const { formatResponse, analysisToken } = require("../utils/tools");

// 引入业务层方法
const {
  addUserService,
  loginService,
  findUserByUsernameService,
} = require("../service/userService");
const { ValidationError } = require("../utils/errors");

/**
 * 用户登录
 */
router.post("/login", async function (req, res, next) {
  // 首先应该有一个验证码的验证
  if (req.body.captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    // 如果进入此 if，说明是有问题的，用户输入的验证码不正确
    next(new ValidationError("验证码错误"));
    return;
  }
  const result = await loginService(req.body);
  // 对返回数据进行格式化
  res.send(formatResponse(0, "", result));
});

/**
 * 新增用户（用户注册）
 */
router.post("/", async function (req, res, next) {
  // 首先应该有一个验证码的验证
  // 但是如果是后台系统新增，则不需要验证码
  if (req.body.captcha.toLowerCase() !== req.session.captcha.toLowerCase()) {
    // 如果进入此 if，说明是有问题的，用户输入的验证码不正确
    next(new ValidationError("验证码错误"));
    return;
  }
  const result = await addUserService(req.body);
  if (result && result._id) {
    res.send(formatResponse(0, "", result));
  } else {
    next(result);
  }
});

/**
 * 用户恢复登录
 */
router.get("/whoami", async function (req, res, next) {
  // 1. 从客户端请求头的 Authorization 字段拿到 token，然后进行解析
  const token = analysisToken(req.get("Authorization"));
  // 查看解析 token 是否成功
  if (token) {
    // 2. 返回给客户端解析结果
    res.send(
      formatResponse(0, "", {
        _id: token._id,
        loginId: token.loginId,
      })
    );
  } else {
    next(new ValidationError("登录过期，请重新登录"));
  }
});

/**
 * 根据用户名查询用户
 */
router.get("/:username", async (req, res) => {
  const { username } = req.params;
  const user = await findUserByUsernameService(username); // 你之前写的那个服务

  if (user) {
    res.send({ code: 0, data: user });
  } else {
    res.send({ code: 1, msg: "用户不存在" });
  }
});

module.exports = router;
