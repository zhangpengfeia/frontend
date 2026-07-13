const mongoose = require("mongoose");

// 定义对应的 Schema
const documentSchema = new mongoose.Schema(
  {
    id: String, // mongodb 自动生成的 id
    title: String, // 文档标题
    desc: String, // 文档概述
    content: String, // 文档内容
    createTime: String, // 创建时间
    updateTime: String, // 更新时间
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],

    // 可选：文档创建者（单个用户）
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
  },
  {
    versionKey: false,
  }
);

// 通过 Schema 来创建相应的数据模型
// 创建数据模型的方法为 mongoose.model，只传一个名字，代表查找到对应名字的模型
// 如果传入 Schema，代表创建模型 (1) 给模型取一个名字 （2）对应的 Schema （3）对应的集合

mongoose.model("documentModel", documentSchema, "documents");

// 将此模型进行导出
module.exports = mongoose.model("documentModel");
