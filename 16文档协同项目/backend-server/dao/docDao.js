const documentModel = require("../models/documentModel");

/**
 * 添加新的文档
 */
module.exports.addDocumentDao = async function (newDocumentInfo) {
  return await documentModel.create(newDocumentInfo);
};

/**
 * 查询所有的文档
 */
module.exports.findAllDocumentDao = async function () {
  return await documentModel.find().populate("owner", "username");
};

/**
 * 添加文档的协作者
 */
module.exports.addCollaboratorDao = async function (docId, userId) {
  return await documentModel.findByIdAndUpdate(
    docId,
    { $addToSet: { collaborators: userId } },
    { new: true }
  );
};

/**
 * 更新文档的内容
 */
module.exports.updateDocumentDao = async function (docId, content) {
  return await documentModel.findByIdAndUpdate(
    docId,
    { content, updateTime: new Date().getTime().toString() },
    { new: true }
  );
};

/**
 * 根据文档id查询文档内容
 */
module.exports.findDocumentByIdDao = async function (docId) {
  return await documentModel.findById(docId);
};
