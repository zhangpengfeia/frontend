// 服务器文件
const http = require("http"); // 引入 node.js 原生的 http 模块
const { Server } = require("socket.io");
const Y = require("yjs");
const { Awareness } = require("y-protocols/awareness");
const axios = require("axios");

// 创建一个 http 服务器
const server = http.createServer();
// 基于 http 服务器创建 websocket 服务器
const io = new Server(server, {
  cors: "*",
});

// 这个 map 用于存储每个房间对应的文档和光标状态信息
// 类似于 { doc, awareness }
// 每个方法会独立的管理自己的文档和光标状态
const docs = new Map();

// 当有客户端连接到当前的 websocket 服务器的时候，会触发该事件
// 并且连接过来的客户端会有一个 socket 传递过来
io.on("connection", (socket) => {
  let currentRoom = null; // 记录当前 socket 加入的时候的房间名

  socket.on("join-room", async (roomName) => {
    currentRoom = roomName; // 保存当前加入的房间名

    // 将 socket 加入到指定的房间，方便后面进行群发
    socket.join(roomName);

    if (!docs.has(roomName)) {
      // 进入此分支，说明当前的这个房间是第一次被访问
      // 第一次访问，我们需要创建全新的 yjs 副本
      const doc = new Y.Doc();
      const awareness = new Awareness(doc);

      // 这里需要增加一段逻辑：需要获取该文档（roomName）已有的内容
      try {
        const res = await axios.get(
          `http://localhost:7001/api/doc/${roomName}`
        );

        const result = res.data;
        // 有了文档内容之后，将文档内容填充到 yjs 的副本里面
        if (result.code === 0 && result.data && result.data.content) {
          const ytext = doc.getText("codemirror");
          ytext.insert(0, result.data.content);
        } else {
          console.log("获取文档内容失败，初始化为新文档", result);
        }
      } catch (error) {
        console.error("网络请求故障，获取文档初始内容失败，请稍候再试", error);
      }

      // 接下来保存到当前的房间里面
      docs.set(roomName, { doc, awareness });
    }

    // 根据 roomName 获取对应的 doc 和 awareness
    const { doc } = docs.get(roomName);

    // 1. 文档同步 - 服务器需要将文档的状态发送给新加入的客户端
    const state = Y.encodeStateAsUpdate(doc);
    socket.emit("sync-doc", state.buffer);

    // 2. 监听客户端发送过来的增量更新
    socket.on("update", (update) => {
      const binary = new Uint8Array(update); // 首先将 ArrayBuffer 转为 Uint8Array
      // 应用到服务器的 doc 上面
      Y.applyUpdate(doc, binary);
      // 接下来还需要将这个更新广播给当前房间的其他人
      socket.to(roomName).emit("update", binary.buffer);
    });

    // 3. 监听客户端发来的 awareness 光标状态
    socket.on("awareness-update", (update) => {
      // 这边不需要解析，直接广播给其他客户端即可
      socket.to(roomName).emit("awareness-update", update);
    });

    // 4. 断开连接
    socket.on("disconnect", () => {
      if (currentRoom) socket.leave(currentRoom);
    });
  });
});

server.listen("1234", () => {
  console.log(`Websocket 服务器已启动，监听1234端口`);
});
