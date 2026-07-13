const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");
const { ServiceError, UnknownError } = require("./utils/errors");

// 默认读取项目根目录下的 .env 环境变量文件
require("dotenv").config();
// 数据库连接
require("./db/connect");

// 引入路由
const userRouter = require("./routes/user");
const captchaRouter = require("./routes/captcha");
const docRouter = require("./routes/doc");

const app = express();

/**
 * 使用各种各样的中间件
 */

// 使用 session 中间件
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);
// 使用其他中间件
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 使用路由中间件
app.use("/res/captcha", captchaRouter);
app.use("/api/user", userRouter);
app.use("/api/doc", docRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// 错误处理，一旦发生了错误，就会到这里来
app.use(function (err, req, res, _) {
  if (err instanceof ServiceError) {
    res.send(err.toResponseJSON());
  } else {
    res.send(new UnknownError().toResponseJSON());
  }
});

module.exports = app;
