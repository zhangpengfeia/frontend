const md5 = require("md5");
const jwt = require("jsonwebtoken");
const {
  addUserDao,
  loginDao,
  findUserByUsernameDao,
  findUsersByIdsDao,
  updateUserDocumentsDao,
} = require("../dao/userDao");
const { randomAvatar } = require("../utils/tools");

/**
 * 用户注册
 */
module.exports.addUserService = async function (newUserInfo) {
  // 对密码进行加密
  newUserInfo.password = md5(newUserInfo.password);
  // 生成随机头像
  newUserInfo.avatar = await randomAvatar();
  return await addUserDao(newUserInfo);
};

/**
 * 登录的业务逻辑
 * @param {*} loginInfo
 */
module.exports.loginService = async function (loginInfo) {
  // 1. 首先对用户输入的密码进行加密
  loginInfo.password = md5(loginInfo.password);
  // 2. 接下来调用持久层的方法进行查询
  let data = await loginDao(loginInfo);
  // 3. 根据查询结果，来决定是否添加 token
  if (data) {
    // 说明用户填写的账号密码正确

    // 添加 token
    data = {
      _id: data._id,
      username: data.username,
    };
    // 生成 token
    const token = jwt.sign(data, md5(process.env.JWT_SECRET), {
      expiresIn: 60 * 60 * 24 * process.env.LOGIN_PERIOD,
    });
    return {
      data,
      token,
    };
  }
  // 没有进入上面的 if，说明账号密码不正确
  return {
    data,
  };
};

/**
 * 根据用户名查询用户
 */
module.exports.findUserByUsernameService = async function (username) {
  return await findUserByUsernameDao(username);
};

/**
 * 根据用户id列表查询用户
 * 这里的用户id列表是一个数组，表示多个用户
 * @param {*} idList
 * @returns
 */
module.exports.findUsersByIdsService = async function (idList) {
  return await findUsersByIdsDao(idList);
};

module.exports.updateUserDocumentsService = async function (userId, docId) {
  return await updateUserDocumentsDao(userId, docId);
};
