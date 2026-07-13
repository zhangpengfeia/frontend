# 浏览器插件
 浏览器插件（更准确的说法是**扩展程序**）是一种基于 Web 技术（HTML、CSS、JavaScript）的小型应用程序，用于增强浏览器的功能。用户可以通过相关浏览器的**网上应用店** 安装扩展程序，它们能够实现以下功能：

- **修改网页内容**（如广告拦截、样式修改）。
- **浏览器功能扩展**（如快捷键、标签管理、下载工具）。
- **数据存储与同步**（如密码管理、笔记工具）。
- **调用浏览器 API**（如书签、历史记录、网络请求拦截）。
扩展程序在用户授权下运行，需明确声明权限（如访问特定网站、读取剪贴板），遵循安全沙箱机制，确保用户隐私。

> **什么是沙箱（Sandbox）？**
>
> 沙箱是一种安全机制，通过 **隔离运行环境**，限制程序或代码的访问权限，使其只能在特定范围内操作。即使程序存在漏洞或被恶意利用，沙箱也能阻止其破坏系统、窃取用户数据或影响其他程序。

当然，浏览器有很多种，最常用的Chrome、Edge，FireFox，针对这些不同的浏览器进行插件开发，差异主要体现在 **API 实现**、**Manifest 版本支持**和**审核规则**上，但大部分代码可以通过兼容性设计实现通用。

## Chrome 浏览器插件如何构建？
通过以下技术栈就可以基本构建`Chrome` 插件
- **基础技术**：HTML（界面）、CSS（样式）、JavaScript（逻辑）。
- **核心配置文件**：`manifest.json`（定义扩展的元数据、权限和功能）。
- **核心组件**：`Service Worker`（后台脚本），`Content Scripts`（内容脚本），`UI`（用户界面）
- **消息传递**：各模块之间的消息传递
- **浏览器 API**：通过 `chrome.*` 命名空间调用（如 `chrome.tabs`、`chrome.storage`）。

## 核心原理和api

### 核心概念
> 使用 Web 平台和扩展 API，可以通过组合不同的界面组件和扩展平台功能来构建更复杂的功能。
1. Service Worker
`Service worker` 是一个基于事件的脚本，在浏览器后台运行。它通常用于处理数据、协调扩展中不同部分的任务，以及作为扩展的事件管理器。
2. `Permissions` 权限
插件在浏览器中获取的功能和数据访问权限，通过声明所需的权限，插件可以执行更广泛的操作。
权限最小化原则，需要哪些权限加哪些权限。
3. `Content script` 内容脚本
内容脚本是在网页环境中运行的文件，可以操作 `DOM`，读取浏览器访问网页的信息，对网页就行更改等，和页面js代码隔离，不冲突。
4. Action/Popup
浏览器工具栏中显示的图标或按钮，用户可以单击该图标或按钮来执行插件提供的功能或操作。
5. 消息传递
一般来说，消息传递是指 `action`、`content script`、`service worker` 三者之间进行消息传递。
6. `Storage` 存储
`Chrome` 插件有一个专门的 `storage API`，用来进行数据存储。
7. 匹配模式
在开发 `Chrome` 插件时，可以使用的一种模式匹配语法，用于指定插件的内容脚本或页面操作脚本在哪些 URL 匹配模式下执行

### 控制浏览器api
借助 `Chrome` 的插件 `API`，可以改变浏览器的工作方式：
1. 覆盖 `Chrome` 页面和设置项：`Manifest.json` 配置 `chrome_settings_overrides`
2. 插件开发者工具：`Manifest.json` 配置 `devtools_page`
3. 显示通知：`chrome.notifications API`
4. 管理历史记录：`chrome.history API`
5. 控制标签页和窗口：`chrome.tabs、chrome.tabGroups` 和 `chrome.windows` 等 `API`
6. 键盘快捷键：`chrome.commands API`
7. 身份认证：`chrome.identity API`
8. 管理插件：`chrome.management API`
9. 提供建议：`chrome.omnibox API`
10. 更新 `Chrome` 设置：`chrome.proxy API`
11. 下载管理：`chrome.downloads API`
12. 书签：`chrome.bookmarks API`
13. ......
### 控制网络api
可以通过注入脚本、拦截网络请求以及使用 `Web API` 与网页进行交互，来控制和修改 `Web`：
1. 注入 `JS` 和 `CSS` 文件
2. 访问当前 `Tab` 页
3. 控制 `Web` 请求
4. 录音和屏幕截图
5. 修改网站设置


# 常见操作
1.popup 弹窗
2.content script 内容脚本
3.service worker 后台脚本
## Service Worker 在扩展中的作用
1.事件响应中心
Service Worker 会响应各种事件，例如：
- `chrome.runtime.onInstalled`：扩展安装时触发
- `chrome.runtime.onMessage`：收到消息时触发
- `chrome.alarms.onAlarm`：定时器事件
- `chrome.webRequest.onBeforeRequest`：监听网络请求
- `chrome.action.onClicked`：点击扩展图标时触发
它就像一个“控制中心”，负责处理这些系统或用户行为。
2. **无需页面保持打开，始终运行在后台**
- 与页面无关，哪怕所有标签页都关闭了，只要浏览器还开着，Service Worker 也可以被唤醒来执行任务（在 MV3 中它是 **懒加载** 的，即事件来时才唤醒，执行完就释放）。
3. **协调扩展中的各个组件**
- 负责不同扩展组件（popup 页面、content script、options 页）之间的通信协调。
- 典型方式是用 `chrome.runtime.sendMessage` 和 `chrome.runtime.onMessage` 来通信。
4. **增强安全性**
Service Worker使得后台脚本是无 DOM 的独立线程，更安全、性能更好，不容易被注入脚本攻击。

## 消息传递
其实Chrome 为我们提供了多种：
1.长连接模式
2.扩展程序之间消息模式
3.扩展程序接收指定web页面发送的消息
### 一次性消息发送&接收
如果要向扩展程序的另一部分**发送**一条消息，有两个 API 可供调用：
- `chrome.runtime.sendMessage(extensionId?, message)`
- `chrome.tabs.sendMessage(tabId, message)`
**接收**消息的方法只有一个 API：
```typescript
chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => boolean | undefined
)
```
我们在每个页签中打开页面。`content_scripts` 是一个很特殊的存在！作为被注入到页面的脚本，它的生命周期跟随页面。而扩展程序的其他部分，都有自己的生命周期！
知道了 `content_scripts` 的特殊性后，那么这两个 API 就很好理解了。
`chrome.runtime.sendMessage()` 是给扩展程序发消息的，它的第一个参数是一个可选的 extensionId，意味着不但可以给自身扩展程序发消息，还能给别的扩展程序发消息，它发送的消息可以被扩展的任一部分接收到，包括 `background`，`action popup`，`side panel`，`options page`，`devtools` 等等，
那么想给 `content_scripts` 发送消息怎么办呢？？？
`chrome.tabs.sendMessage()` 就是专门用来给 `content_scripts` 发消息的！值得注意的是，想要给 `content_scripts` 发消息需要指定 tabId，也就是需要指明给哪个页签下的页面的 `content_scripts` 发消息。这个设计很好，因为每个页签的页面都运行了一份 `content_scripts`，这就避免了无关的页面接收到消息。
在扩展程序的任意部分（包括 `content_scripts`）都是用这个接收消息。这很方便。

## 权限
扩展程序可以请求使用相应清单键指定的以下类别的权限：
- [`"permissions"`]
  包含[已知字符串]列表中的项。更改可能会触发[警告]。
- [`"optional_permissions"`]
  由用户在运行时（而不是安装时）授予。
- [`"content_scripts.matches"`]
  包含一个或多个[匹配模式]，允许内容脚本注入到一个或多个主机中。更改可能会触发[警告]。
- [`"host_permissions"`]hl=zh-cn#host-permissions)
  包含一个或多个[匹配格式]，用于授予对一个或多个主机的访问权限。更改可能会触发[警告]。
- `"optional_host_permissions"`
  由用户在运行时（而不是安装时）授予。

## 右键菜单与选项页面配置
```js
chrome.contextMenus.create({
    id: "menu-1",
    type:"normal",
    title: "批量下载图片",
    contexts: ["all"],
  })
```

# 工程化开发
安装crxjs包，可以使用 package.json 包管理方式开发浏览器插件