import { io, Socket } from "socket.io-client";
import * as Y from "yjs";
import {
  Awareness,
  encodeAwarenessUpdate,
  applyAwarenessUpdate,
} from "y-protocols/awareness";

// 用于存储所有的 socket 实例
const socketMap = new Map<string, Socket>();

export class CustomSocketProvider {
  private socket: Socket; // 存储 socket 实例
  public awareness: Awareness; // 存储 Awareness 实例，主要用于更新光标相关信息

  /**
   *
   * @param serverUrl websocket 服务器地址
   * @param roomName 房间名称
   * @param ydoc Yjs 文档实例
   */
  constructor(serverUrl: string, roomName: string, ydoc: Y.Doc) {
    if (!socketMap.get(roomName)) {
      // 进入此分支，说明在 Map 中不存在对应 roomName 的 socket 实例
      // 不存在我们就需要创建一个新的 socket 实例
      const newSocket = io(serverUrl, { transports: ["websocket"] });

      socketMap.set(roomName, newSocket); // 将新创建的 socket 实例存入 Map 中
    }

    // 代码来到这里，在 Map 中一定存在对应 roomName 的 socket 实例
    this.socket = socketMap.get(roomName)!;
    // 再初始化一个 Awareness 实例
    this.awareness = new Awareness(ydoc);

    // 后面就是监听一系列的事件

    // 该事件会在成功连接上 websocket 服务器的时候触发
    this.socket.on("connect", () => {
      this.socket.emit("join-room", roomName); // 发送加入房间的请求
      // 设置一下光标相关信息
      this.awareness.setLocalStateField("user", {
        name: localStorage.getItem("username"),
        color: "#" + Math.floor(Math.random() * 0xffffff).toString(16),
        socketId: this.socket.id,
      });
    });

    // 该事件会在连接上 websocket 服务器之后，websocket 服务器会推送完整的文档内容
    // 该事件主要是应用于文档初次同步的时候
    this.socket.on("sync-doc", (update: ArrayBuffer) => {
      // 这里要做的事情，就是同步当前客户端的 yjs 文档状态
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    // 用于处理来自于其他用户的文档更新
    // 当其他用户对文档进行更新的时候，websocket 服务器会推送更新的内容
    // 我们这边需要根据更新内容更新我们本地的 yjs 文档
    this.socket.on("update", (update: ArrayBuffer) => {
      // 这里要做的事情，就是同步当前客户端的 yjs 文档状态
      Y.applyUpdate(ydoc, new Uint8Array(update));
    });

    // 我们本地文档有内容变化的时候，同样是需要同步给其他用户的
    // 本地文档内容有变化的时候，yjs 会触发一个 update 事件
    ydoc.on("update", (update: Uint8Array) => {
      if (this.socket.connected) {
        // 这里意味着在 websocket 服务器上面监听了一个 update 事件
        this.socket.emit("update", update.buffer);
      }
    });

    // 到目前为止，文档内容的同步，其实就已经完成了
    // 接下来就是光标相关的同步了
    // 本地用户的光标信息发生变化的时候，会触发一个 update 事件
    this.awareness.on(
      "update",
      ({
        added,
        updated,
        removed,
      }: {
        added: number[]; // 代表新进入协同编辑器用户的 id 列表
        updated: number[]; // 已经存在的，光标位置发生变化的用户的 id 列表
        removed: number[]; // 离开了协同编辑器的用户 id 列表
      }) => {
        const changed = [...added, ...updated, ...removed]; // 代表所有发生变化的用户的 id 列表
        // 将变化的状态信息编码成二进制数据，方便网络传输
        const update = encodeAwarenessUpdate(this.awareness, changed);

        if (this.socket.connected) {
          // 需要将这个光标更新信息发送给 websocket 服务器
          // 这里意味着在 websocket 服务器上面监听了一个 awareness-update 事件
          this.socket.emit("awareness-update", update);
        }
      },
    );

    // 同样，需要处理来自于其他用户的光标信息更新
    this.socket.on("awareness-update", (update: ArrayBuffer) => {
      // 接收到来自于其他用户的光标信息，直接应用到本地的 awareness 实例上面
      applyAwarenessUpdate(
        this.awareness,
        new Uint8Array(update),
        this.socket.id,
      );
    });
  }

  /**
   * 销毁 socket 实例
   * @param roomName 房间名称
   * @description 该方法主要用于销毁 socket 实例，避免内存泄漏
   */
  destory(roomName: string) {
    const socket = socketMap.get(roomName);

    if (socket && socket.connected) {
      socket.disconnect(); // 断开连接
      socketMap.delete(roomName); // 从 Map 中删除 socket 实例
    }
  }
}
