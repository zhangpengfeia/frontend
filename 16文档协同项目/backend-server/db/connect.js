/**
 * 该文件负责连接数据库
 */

const mongoose = require("mongoose");

// 定义链接数据库字符串
const dbURI = "mongodb://" + process.env.DB_HOST + "/" + process.env.DB_NAME;

// 连接
mongoose.connect(dbURI);

// 监听
mongoose.connection.on("connected", function () {
  console.log(`渡一文档数据库已经连接...`);
});
