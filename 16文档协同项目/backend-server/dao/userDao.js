const userModel = require("../models/userModel");

/**
 * 添加新的用户
 * @param {*} newUserInfo 新管理员信息
 * @returns
 */
module.exports.addUserDao = async function (newUserInfo) {
  return await userModel.create(newUserInfo);
};

/**
 * 登录
 * @param {*} 用户输入的账号密码
 * @returns 返回查询到的数据
 */
module.exports.loginDao = async function ({ username, password }) {
  return await userModel.findOne({ username, password });
};

/**
 * 根据username来查询用户
 */
module.exports.findUserByUsernameDao = async function (username) {
  return await userModel.findOne({ username });
};

/**
 * 根据用户id列表查询用户
 * 这里的用户id列表是一个数组，表示多个用户
 * @param {*} idList
 * @returns
 */
module.exports.findUsersByIdsDao = async function (idList) {
  return await userModel.find({ _id: { $in: idList } });
};

/**
 * 根据用户id以及文档id更新用户对应的文档列表
 * @param {*} userId
 * @returns
 */
module.exports.updateUserDocumentsDao = async function (userId, docId) {
  return await userModel.updateOne(
    { _id: userId },
    { $push: { documents: docId } }
  );
};
