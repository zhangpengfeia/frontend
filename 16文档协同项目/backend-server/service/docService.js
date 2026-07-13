const {
  addDocumentDao,
  findAllDocumentDao,
  addCollaboratorDao,
  updateDocumentDao,
  findDocumentByIdDao,
} = require("../dao/docDao");
const {
  updateUserDocumentsService,
  findUserByUsernameService,
} = require("./userService");
const { ValidationError } = require("../utils/errors");

/**
 * 添加新的文档
 */
module.exports.addDocumentService = async function (newDocumentInfo) {
  // 对新文档信息进行补充
  const newDocInfo = {};
  newDocInfo.title = newDocumentInfo.docName;
  newDocInfo.desc = newDocumentInfo.docDesc;
  newDocInfo.content = "";
  newDocInfo.createTime = new Date().getTime().toString();
  newDocInfo.updateTime = new Date().getTime().toString();

  // 更新文档的创建者
  // 1. 根据 username 查询到对应的用户信息
  const userInfo = await findUserByUsernameService(newDocumentInfo.owner);
  // 2. 将查询到的用户信息，赋值给新文档的 owner 属性
  newDocInfo.owner = userInfo._id;
  // 3. 将查询到的用户信息，赋值给新文档的 collaborators 属性
  //    这里的 collaborators 属性是一个数组，表示多个用户
  //    但是我们这里只有一个用户，所以直接将其放入数组中
  newDocInfo.collaborators = [userInfo._id];

  const newAddedDoc = await addDocumentDao(newDocInfo);
  // 待你补充
  await updateUserDocumentsService(userInfo._id, newAddedDoc._id);
  return newAddedDoc;
};

/**
 * 查询所有的文档
 */
module.exports.findAllDocumentService = async function () {
  return await findAllDocumentDao();
};

/**
 * 添加文档的协作者
 * @param {*} docId
 * @param {*} userId
 */
module.exports.addCollaboratorService = async function (docId, username) {
  // 1. 根据 username 查询到对应的用户信息
  const userInfo = await findUserByUsernameService(username);
  if (!userInfo) {
    return new ValidationError("用户不存在");
  }
  // 2. 将文档id和用户id传入到 dao 层进行添加协作者
  return await addCollaboratorDao(docId, userInfo._id);
};

/**
 * 更新文档的内容
 */
module.exports.updateDocumentService = async function (docId, content) {
  // 1. 根据文档id和内容进行更新
  return await updateDocumentDao(docId, content);
};

/**
 * 根据文档id查询文档内容
 */
module.exports.findDocumentByIdService = async function (docId) {
  // 1. 根据文档id查询文档内容
  return await findDocumentByIdDao(docId);
};
