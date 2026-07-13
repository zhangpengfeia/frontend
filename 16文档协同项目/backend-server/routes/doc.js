/**
 * 文档对应的二级路由
 */

const express = require("express");
const router = express.Router();
const { formatResponse } = require("../utils/tools");
const { ServiceError } = require("../utils/errors");

// 引入业务层方法
const {
  addDocumentService,
  findAllDocumentService,
  addCollaboratorService,
  updateDocumentService,
  findDocumentByIdService,
} = require("../service/docService");
const {
  findUserByUsernameService,
  findUsersByIdsService,
} = require("../service/userService");

/**
 * 新增文档
 */
router.post("/", async function (req, res, next) {
  const result = await addDocumentService(req.body);
  if (result && result._id) {
    res.send(formatResponse(0, "", result));
  } else {
    next(result);
  }
});

/**
 * 查询所有文档
 */
router.get("/", async function (req, res, next) {
  const result = await findAllDocumentService();

  if (result) {
    res.send(formatResponse(0, "", result));
  } else {
    next(result);
  }
});

/**
 * 添加协作者
 */
router.post("/addCollaborator", async function (req, res, next) {
  const { docId, username } = req.body;
  const result = await addCollaboratorService(docId, username);

  if (result instanceof ServiceError) {
    res.send(result.toResponseJSON());
    return;
  } else if (result && result._id) {
    res.send(formatResponse(0, "", result));
    return;
  } else {
    next(result);
  }
});

/**
 * 保存文档
 */
router.post("/save", async function (req, res, next) {
  const { docId, content } = req.body;

  const result = await updateDocumentService(docId, content);

  if (result instanceof ServiceError) {
    res.send(result.toResponseJSON());
    return;
  } else if (result && result._id) {
    res.send(formatResponse(0, "", result));
    return;
  } else {
    next(result);
  }
});

/**
 * 根据文档id查询文档内容
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const result = await findDocumentByIdService(id);

  if (result && result._id) {
    res.send({ code: 0, data: { content: result.content } });
  } else {
    res.send({ code: 1, msg: "文档不存在" });
  }
});

/**
 * 根据文档id查询协作者
 */
router.get("/collaborators/:id", async (req, res) => {
  const { id } = req.params;

  // 1. 首先根据文档id查询到对应的文档
  const doc = await findDocumentByIdService(id);

  if (!doc) {
    return res.send({ code: 1, msg: "文档不存在" });
  }

  // 2. 接下来根据文档的协作者id查询到对应的用户信息
  //    这里的协作者id是一个数组，所以需要遍历
  //    然后将查询到的用户信息放入到一个数组中
  //    最后将这个数组返回给前端
  const collaboratorIds = doc.collaborators || [];

  const users = await findUsersByIdsService(collaboratorIds);

  const data = users.map((user) => ({
    username: user.username,
    avatar: user.avatar || "/avatar.gif",
  }));

  return res.send({ code: 0, data });
});

/**
 * 校验当前用户是否是该文档的协作者或拥有者
 */
router.get("/checkAccess/:docId", async (req, res) => {
  const { docId } = req.params;
  const { username } = req.query;

  // 首先通过 username 去查找用户
  const user = await findUserByUsernameService(username);

  if (!user || !user._id) {
    res.send({ code: 1, msg: "用户不存在" });
    return;
  }

  // 然后再根据文档 id 去查找文档
  const result = await findDocumentByIdService(docId);

  if (!result) {
    res.send({ code: 1, msg: "文档不存在" });
    return;
  }

  const userId = user._id.toString();

  // 判断当前用户是否是文档的拥有者
  const isOwner = result.owner?.toString() === userId;
  // 判断当前用户是否是文档的协作者
  // 这里的协作者是一个数组，所以需要遍历
  const isCollaborator = result.collaborators?.some(
    (id) => id.toString() === userId
  );

  if (isOwner || isCollaborator) {
    res.send({ code: 0, msg: "有权限" });
  } else {
    res.send({ code: 1, msg: "无访问权限" });
  }
});

module.exports = router;
