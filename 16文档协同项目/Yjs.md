# yjs (CRDT核心库)
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
        BroadcastChannel： 本地页面广播机制，浏览器原生api，同一个origin下多个标签互相通信
    y-websocket：通过 WebSocket 同步
    y-protocols：定义同步协议与协作状态
    y-webrtc: 实现点对点通信
    y-redis: 在多个WebSocket服务器直接同步更新
    y-indexeddb：本地离线存储
```


## 使用
yjs 会优先通过浏览器同host共享状态方式进行通信，然后才是网络通信，即使websocket连接失败，也会尝试使用浏览器同tab共享状态进行通信
```js
const doc = new Y.Doc(); // 起点，创建一个yjs副本,相当于一个客户端
const doc2 = new Y.Doc(); // 创建一个yjs副本,相当于另一个客户端

const text = new Y.Text('myText'); // 创建一个共享文本数据结构
// 参数是对共享文本的一个表示，如果第一次使用，会创建一个全新的共享文本
// 后续调用的时候，会取出key的共享文本
text.insert(0, 'hello world'); // 插入文本
text.toString(); // 获取文本内容
const update = Y.encodeStateAsUpdate(doc); // 编码当前状态为更新操作
Y.applyUpdate(doc2, update); // 应用更新操作到文档

doc.getMap('myMap'); // 创建一个共享映射数据结构
doc.getArray('myArray'); // 创建一个共享数组数据结构
```
## 监听机制
```js
const doc = new Y.Doc();
const text = new Y.Text('myText');
text.observe((event) => {
    console.log('文本内容变化了', event);
});
text.observeDeep((event) => {
    console.log('深度监听', event);
});
```




