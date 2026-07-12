# 文档协同项目
核心：防止冲突，合并冲突
常见方案：
1. 读写锁
    写锁和读锁，写锁只有一个排他，读锁共享
2. diff-patch合并，类似git
    找出两个版本之间的差异，合并到新版本中，对于冲突，需要手动解决
3. 自动合并冲突算法 crdt，ot （最常用）
    op: 操作类型，主要用于需要强实时同步应用场景
    crdt: 无冲突复制数据类型，操作可以并行执行，通过合并算法计算，合并冲突，适用于去中心化，和分布式系统场景
## yjs (CRDT核心库)
```js
1.支持的编辑器适配层
  ProseMirror, tiptap（富文本编辑器）
  Slate（React）
  Monaco (vscode内核的带啊吗编辑器)
  Quill（富文本编辑器）
  为了实现协同能力，每个编辑器都要开发一个绑定层，协同绑定Yjs（把编辑器变成 “可协同”）
    y-prosemirror: ProseMirror编辑器绑定层 / y-quill: Quill编辑器绑定层 / y-monaco：编辑器绑定层

2.中间层Yjs核心crdt
    管理文档的状态副本，即CRDT文档
    将用户操作转化为CRTD操作
    自动合并并发编辑，解决冲突
    管理数据结构，如Y.Text, Y.Map, Y.Array等
  所有编辑器变更同步到这里，统一进行处理和广播

3.底层：通信与存储模块
    方案：
        WebSocket：主通道（实时同步、光标、在线状态）
        Socket.IO：兼容断线重连、房间管理（可选）
        WebRTC：点对点（可选，降低服务器压力）
    y-websocket：通过 WebSocket 同步
    y-protocols：定义同步协议与协作状态
    y-webrtc: 实现点对点通信
    y-redis: 在多个WebSocket服务器直接同步更新
    y-indexeddb：本地离线存储
```



