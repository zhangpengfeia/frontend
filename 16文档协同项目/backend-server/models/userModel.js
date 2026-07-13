const mongoose = require("mongoose");

// 定义对应的 Schema
const userSchema = new mongoose.Schema(
  {
    id: String, // mongodb 自动生成的 id
    username: String, // 账号
    password: String, // 密码
    avatar: String, // 头像
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "documentModel" }],
  },
  {
    versionKey: false,
  }
);

// 通过 Schema 来创建相应的数据模型
// 创建数据模型的方法为 mongoose.model，只传一个名字，代表查找到对应名字的模型
// 如果传入 Schema，代表创建模型 (1) 给模型取一个名字 （2）对应的 Schema （3）对应的集合

mongoose.model("userModel", userSchema, "users");

// 将此模型进行导出
module.exports = mongoose.model("userModel");
