# llm
LLM 仅仅是 AI 的一个分支。
AI：Artificial Intelligence 任何能够让机器模仿人类行为的技术
- 交通程序导航
- 游戏里面的NPC
AI 下面有很多的分支：
1. 自动驾驶
2. 机器人
3. 处理语言模型
4. 处理图像模型
5. 语音识别
6. .....

## LLM发展史
AI 技术两大核心应用方向
1. 计算机视觉（Computer Vision，CV）：让计算机看懂图片和视频，模仿人类的眼睛
2. 自然语言处理（Natural Language Processing，NLP）：让计算机能够理解人类语言，甚至可以进行交流
早期 AI 的研究突破基本都是和 CV 相关的，这几年 NLP 属于后来居上。

## MCP
MCP = Model Context Protocol，模型上下文协议
MCP 标准化方案：工具封装一次 MCP 服务端，所有支持 MCP 的 AI 客户端（Claude、Cursor、阿里云百炼、VS Code Copilot 等）直接即插即用

## MCP Server 
是实现 MCP 协议的后端服务程序，是 AI 外部能力的封装载体。
一端：遵循 JSON-RPC 2.0 标准，对接 MCP Client（宿主端：Claude、Cursor、AI Agent、VSCode 插件等）
另一端：对接各类外部资源 / 工具：本地文件、数据库、API、Shell、Git、业务系统、爬虫等

## Resources
资源也是 MCP Server 向客户端应用提供信息的一种形式。
例如：
- File contents（文件内容）
  比如本地的 `.txt`、`.md`、`.js`、`.json` 文件
- Database records（数据库记录）
  比如 SQL 查询结果或某个表格的内容
- Screenshots and images（截图和图像）
  图像类资源

在 MCP 协议中，**不强制 URI 规则**，允许 Server 自定义。
- `notebook://cell/123`
- `log://app/service/error`
- `chat://conversation/abc123`
回头在 MCP Server 中，所有的资源都会有一个 URI.
#### 发现资源
MCP 提供了两种发现资源的方式：
1. 直接资源
服务器直接暴露一组固定资源，通过 JSON-RPC 方法 `resources/list` 提供给客户端。
工具：`tools/list`
每个资源包含字段如下：
```json
{
  uri: string;         // 资源的唯一 URI（例如 file:///xxx）
  name: string;        // 人类可读的名称
  description?: string;// 可选描述，解释用途或内容
  mimeType?: string;   // MIME 类型，如 text/plain, image/png
  size?: number;       // 文件大小（单位：字节）
}
```
例如：
```json
{
  uri: "file:///logs/build.log",
  name: "构建日志",
  description: "包含最近一次构建的所有输出信息",
  mimeType: "text/plain",
  size: 18423
}
```
2. 资源模板
服务器还可以提供一组 URI 模板，供客户端**根据参数动态构造 URI**（例如选择城市、文件名等）。
这些模板符合 [RFC 6570](https://datatracker.ietf.org/doc/html/rfc6570) 的格式，例如：
- `file:///project/src/{filename}`
- `screen://localhost/{displayId}`
>[!tip]
>
>RFC 6570 是一份由 IETF 制定的标准文档，它定义了一种 URI 模板语法，用于通过填入变量值来构建动态 URI。
每个模板的结构如下：
```json
{
  uriTemplate: string; // 可变 URI 模板（如 file:///{path}）
  name: string;        // 模板的说明名称
  description?: string;// 模板描述
  mimeType?: string;   // 匹配资源的 MIME 类型（适用于所有匹配项）
}
```
例如：
```json
{
  uriTemplate: "file:///home/user/{filename}",
  name: "用户目录下的文件",
  description: "允许读取任意用户目录下的文件名",
  mimeType: "text/plain"
}
```
为 MCP Server 注册资源模板。
setRequestHandler

| 功能         | Schema 名                            | 结构                                            |
| ------------ | ------------------------------------ | ----------------------------------------------- |
| 读取资源     | `ReadResourceRequestSchema`          | `{ method: "resources/read", params: { uri } }` |
| 列出资源     | `ListResourcesRequestSchema`         | `{ method: "resources/list", params: {} }`      |
| 列出资源模板 | `ListResourceTemplatesRequestSchema` | `{ method: "resources/templates", params: {} }` |

---

#### 读取资源
客户端通过发送 JSON-RPC 请求：
方法名为 `resources/read`，在 params 中写上资源的 URI
```json
{
  "method": "resources/read",
  "params": {
    "uri": "file:///logs/error.log"
  }
}
```
服务器返回一个 JSON 对象，包含一个 `contents` 数组，每个数组元素表示一个资源内容对象，结构如下：
```json
{
  contents: [
    {
      uri: string;          // 必填，资源的唯一 URI
      mimeType?: string;    // 可选，MIME 类型，如 text/plain、image/png

      // 以下两者二选一
      text?: string;        // 文本资源内容（UTF-8 编码）
      blob?: string;        // 二进制资源内容（Base64 编码）
    }
  ]
}
```
MCP 支持 **一次 `resources/read` 返回多个资源内容**。
比如：读取一个目录：`file:///project/src/`，返回值可能是里面多个文件的内容（如多个 `.ts` 文件）


#### 资源变化监听
有两种形式：
##### 资源列表变化
工作机制
当服务器上的资源列表发生变化时（例如 `resources/list` 中的项发生增删），**服务器主动发送通知**：
```json
notifications/resources/list_changed
```
这个方法名也是固定的。
这样客户端就知道资源目录发生了变动，可以重新发起 `resources/list` 重新拉取。
这里需要做 2 件事情：
1. 监听目录（涉及到回调函数，监听的目录发生了变化，就会触发对应的回调函数）
2. 回调函数：向客户端发送通知
chokidar:
`chokidar` 是一个功能强大、跨平台、性能优秀的 **文件系统监听库**，适用于 Node.js 环境，底层使用原生 `fs.watch` 和 `fs.watchFile`，并在 macOS/Linux 上优先使用更高效的 `fsevents`（若可用）。
```js
import chokidar from 'chokidar';

// 监听单个文件或目录
const watcher = chokidar.watch('./some-folder-or-file', {
  ignoreInitial: true, // 不触发初始的 add/addDir 事件
});

// 注册事件监听器
watcher
  .on('add', path => console.log(`📄 文件添加: ${path}`))
  .on('change', path => console.log(`✏️ 文件修改: ${path}`))
  .on('unlink', path => console.log(`❌ 文件删除: ${path}`))
  .on('addDir', path => console.log(`📁 目录添加: ${path}`))
  .on('unlinkDir', path => console.log(`🗑️ 目录删除: ${path}`));
```
**监听多个文件**

```js
chokidar.watch(['src/**/*.js', 'assets/**/*'], {
  ignored: /(^|[\/\\])\../, // 忽略 . 开头的隐藏文件
});
```
**停止监听**

```js
watcher.close().then(() => console.log('已停止监听'));
```
##### 资源内容变化
用于监听 **某个资源内容的变更**，如文件内容更新、数据库记录修改、日志追加等。
**工作机制**
1. **客户端订阅更新**，向服务器发送请求：
   ```json
   resources/subscribe
   ```
   方法名固定为 `resources/subscribe`，表示我要订阅某个资源。
   带上要订阅的资源 URI，例如：
   ```json
   { "uri": "file:///logs/error.log" }
   ```
2. 服务器监听变动并通知客户端。当该资源发生变化时，发送通知：
   ```json
   notifications/resources/updated
   ```
3. 客户端拉取最新内容。收到通知后，客户端可以重新调用：
   ```json
   resources/read
4. 客户端取消订阅（可选）。如果客户端不再关心此资源，可以发送：
   ```json
   resources/unsubscribe
   ```

# Prompts
MCP 支持 3 种上下文能力：
1. tools：工具
2. resources：资源
3. prompts：提示词
在 MCP 中，prompts 表示服务端内置的**提示词模板**（prompt templates）集合，通过 prompt 模板机制，客户端无需硬编码 prompt，而是**复用服务端定义的标准提示词**，实现统一、版本化、模块化的调用方式。

## 重新认识MCP
MCP，全称 Model Context Protocol， 模型上下文协议。 其旨在为AI 应用与外部程序之间建立**通信标准**，从而使得外部程序可以被部署到任意AI（满足MCP协议）， 也使得AI应用可以使用任意的外部程序（MCP Server）。
🤔为什么称之为模型上下文？
无论是工具、资源、提示词，这些信息最终都会作为上下文的一部分，提供给大模型。也就是说，大模型是最终信息的消费者。

## MCP 资源聚合平台
官方组织推出了一些 [MCP Server](https://github.com/modelcontextprotocol/servers)
除了官方以外，也有一些第三方的 MCP Server 的平台，例如：
1. [MCP.So](https://mcp.so/)
2. [Awesome MCP Servers](https://mcpservers.org/)

>[!tip]
>
>不过目前第三方平台的 MCP Server 的质量参差不齐，推荐优先使用官方推出的 MCP Server。

## 提示词
promptfoo 提示词工程评估工具