const fs = require("fs");
const jwt = require("jsonwebtoken");
const md5 = require("md5");
// 格式化要响应的数据
module.exports.formatResponse = function (code, msg, data) {
  return {
    code,
    msg,
    data,
  };
};

/**
 * 读取一个目录下有多少个文件
 * @param {*} dir 目录地址
 */
async function readDirLength(dir) {
  return new Promise((resolve) => {
    fs.readdir(dir, (err, files) => {
      if (err) throw new UnknownError();
      resolve(files);
    });
  });
}

/**
 * 生成一个随机头像的路径
 */
module.exports.randomAvatar = async function () {
  const files = await readDirLength("./public/static/avatar");
  const randomIndex = Math.floor(Math.random() * files.length);
  return "/static/avatar/" + files[randomIndex];
};

// 解析客户端传递过来的 token
module.exports.analysisToken = function (token) {
  return jwt.verify(
    token.split(" ")[1],
    md5(process.env.JWT_SECRET),
    function (err, decode) {
      return decode;
    }
  );
};
