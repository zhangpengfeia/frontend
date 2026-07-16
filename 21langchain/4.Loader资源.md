# 本地资源Loader

很多时候，我们需要加载额外的数据，比如 RAG 架构中，需要外挂知识库。

外部数据的形式千差万别：可能是一份 PDF 文件、一张表格、一段代码，甚至是来自网络的实时信息。针对这些需求，LangChain 提供了一整套开箱即用的 Loader 工具，帮助我们高效地加载各种结构化或非结构化的数据，并统一转换成 LLM 能够理解和处理的格式。

## Document对象

在 LangChain 中，无论你的数据来自哪里——文本文件、数据库、网页还是 GitHub 项目，最终都会被封装成一种统一的数据结构 `Document` 对象。

好处：LangChain 的后续模块（如向量化、检索器、分片器等）不需要关心你的数据来源，只需要对 `Document` 进行处理即可。

一个 `Document` 对象由两个部分构成：

```ts
interface Document {
  pageContent: string;             // 文本内容，表示这段文档的主体内容
  metadata: Record<string, any>;   // 元数据，附加的上下文信息，如来源、页码、标题等
}
```

手动创建一个 Document 对象示例：

```js
import { Document } from "@langchain/core/documents";

const doc = new Document({
  pageContent: "这是一段测试文字",
  metadata: {
    source: "abc",
  },
});

console.log(doc)
```

效果：

```js
Document {
  pageContent: '这是一段测试文字',
  metadata: { source: 'abc' },
  id: undefined
}
```

真实项目中，更多是通过 Loader 工具读取外部资源，然后封装成一组  `Document` 实例。

Loader 的种类很多：

1. 本地资源Loader
2. Web资源Loader

## 文本Loader

文本Loader位于langchain包下面

```bash
pnpm add langchain
```

用来加载纯文本文件的 Loader，适合处理 `.txt` 类型的文件。

示例代码：

```js
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("data/test.txt");

const result = await loader.load();

console.log(result)
```

效果：

```js
[
  Document {
    pageContent: '这是一段测试文本，啦啦啦啦',
    metadata: { source: 'data/test.txt' },
    id: undefined
  }
]
```

🤔这里返回的是一个数组，数组里面又只有一项。那什么时候数组里面有多项呢？

1. 读取一个目录中的多个文件

2. 一个文件很长，设置了文本切割。



## PDFLoader

PDF 文件是许多知识密集型场景中的常见数据源。在 LangChain 中，可以使用 `PDFLoader` 来方便地读取 PDF 文件内容，并将其转换为标准的 `Document` 对象。

> 它的默认行为是：将 PDF 每一页内容都拆成一个独立的 Document 对象。

安装依赖：

```bash
pnpm add @langchain/community pdf-parse
```

示例代码：

```js
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const loader = new PDFLoader("data/novel.pdf");

const result = await loader.load();

console.log(result);
```

如果你希望一次性读取整个 PDF 的所有页，而不是拆分成每页一个 Document，可以通过设置 `splitPages: false` 来关闭分页行为：

```js
const loader = new PDFLoader("data/bananaphone.pdf", {
  splitPages: false,
});
```



## 目录Loader

在实际项目中，数据通常不是孤零零存在，而是统一**放在一个文件夹中、由多种格式的文件组成**（比如：`.txt`、`.pdf`、`.md` 等等）。这时逐个调用对应的 Loader，会非常麻烦。

LangChain.js 为我们提供了一个统一入口 —— `DirectoryLoader`，可以自动识别目录中不同类型的文件，并调用对应的 Loader 执行加载任务。

`DirectoryLoader` 接收两个参数：

- 第一个参数：要加载的文件夹路径
- 第二个参数：**一个对象**，键是文件后缀名，值是对应的 Loader 工厂函数

每种类型的文件会自动使用我们配置的 Loader 进行处理。返回结果是一个 `Document[]` 数组，每个元素代表一个文档对象。

```js
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new DirectoryLoader("./data", {
  ".pdf": (path) => new PDFLoader(path, { splitPages: false }),
  ".txt": (path) => new TextLoader(path),
});

const result = await loader.load();
console.log(result);
```
**最佳实践**
| 使用场景                              | 是否适合使用 DirectoryLoader                 |
| ------------------------------------- | -------------------------------------------- |
| 加载同类型文件（比如全是 .txt）       | ❌ 推荐直接用 TextLoader，效率更高            |
| 加载多类型文件（pdf / txt / md 混合） | ✅ 推荐使用 DirectoryLoader 批量处理          |
| 加载小规模单个文档                    | ❌ 不推荐使用 DirectoryLoader，配置成本不划算 |
| 大型知识库统一导入                    | ✅ 非常推荐，可结合向量化批处理               |
**支持的 Loader 类型**
除了示例中用到的 `.txt` 和 `.pdf`，你还可以按需加载：

- `.md`：使用 `TextLoader` 加载 Markdown 文件
- `.csv`：使用 `CSVLoader`（来自 `fs/csv`）加载结构化数据
- `.json`：使用 `JSONLoader` 按 key 提取文本内容
- `.docx`：使用 `DocxLoader` 处理 Word 文档

几乎所有支持的 Loader 都可以配合 `DirectoryLoader` 使用，只需要在映射对象中正确配置后缀名和构造器即可。


# Web资源Loader

## Web Loader
`CheerioWebBaseLoader` 作用是抓取指定网页并解析 HTML 内容，提取需要的纯文本数据。

这个 Loader 底层依赖 [cheerio](https://cheerio.js.org/)，语法类似 jQuery，可以方便地选择 HTML 元素并提取内容，适用于解析静态 HTML 网页。

```bash
pnpm add @langchain/community cheerio
```

**快速上手示例**

```js
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const loader = new CheerioWebBaseLoader("https://tech.meituan.com/");

const result = await loader.load();

console.log(result);
```

可以通过配置 `selector`，提取特定 HTML 标签内容。

例如只提取所有二级标题：

```js
const loader = new CheerioWebBaseLoader("https://tech.meituan.com/", {
  selector: "h2", // 只提取网页中的 <h2> 元素
});
```
## Github loader

经常有这样的需求，希望大模型理解某个项目的结构和实现细节，例如：

- 根据提问回答组件如何使用
- 根据错误信息定位源码位置
- 辅助理解项目代码逻辑

这种场景下，直接将整个 GitHub 仓库的代码作为数据源加载进来，是一种非常实用的做法。
`GithubRepoLoader` 来一键抓取 GitHub 项目的内容，并自动转换成 `Document` 对象。

>该 Loader 依赖 ignore 包，所以需要先安装这个包。

```bash
pnpm add ignore
```

**快速上手示例**

```js
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";

const loader = new GithubRepoLoader("https://github.com/vuejs/vue", {
  branch: "main", // 指定分支（注意有的项目是 main）
  recursive: false, // 是否递归子目录（建议测试时设为 false）
  unknown: "warn", // 遇到未知类型文件是否告警
  ignorePaths: ["*.md", "*.json", "yarn.lock"], // 忽略部分文件
});

const result = await loader.load();

console.log(result);
```
## SearchAPI

在很多场景中，希望 AI 应用回答一些最新的问题，比如：

- 今天有什么科技新闻？
- 某个 API 的用法有什么变动？

这类问题往往无法依赖本地知识库解决，需要实时从网络搜索并提取信息。

LangChain 中提供了多个工具：

1. SearchApiLoader：背后用到的服务商为 https://www.searchapi.io/
2. SerpAPILoader：背后用到的服务商为 https://serpapi.com/

这两个都是第三方的 SERP 抓取/解析 API 提供商，无论哪一个，注册后每月都有免费额度。


# 文本切割
**为什么需要切割？**
回忆一下 RAG 的流程：
1. 用户提问
2. 从知识库检索相关内容
3. 将检索到的内容和用户问题一起交给模型推理
如果文档不切割，检索阶段就只能以整篇为单位，长文会超出模型的 Token 限制，无法一次性送进模型。
**如何切割？**

最通用的是使用 `RecursiveCharacterTextSplitter` 来进行切割。

```js
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 64,
  chunkOverlap: 0,
});
```
- chunkSize：每块的最大长度
- chunkOverlap：块之间的重叠长度
在线的 [可视化工具](https://chunkviz.up.railway.app/)，可以快速看到不同 chunkSize 和 chunkOverlap 的切分效果。初学推荐设置：chunkSize = 1000，chunkOverlap = 200，再通过工具观察效果慢慢调。
快速上手示例：
```js
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { TextLoader } from "langchain/document_loaders/fs/text";

const loader = new TextLoader("data/kong.txt");

const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 64,
  chunkOverlap: 10,
});

const result = await splitter.splitDocuments(docs);

console.log(result);
```
## 其它类型切割器
现实场景里，处理的文档类型五花八门，比如：

- 📄 Markdown 教案
- 🌐 HTML 页面
- 🧑‍💻 JS/Python 代码片段
- 🧾 LaTeX 报告
- 📚 跨语言 API 文档……

LangChain 中提供了不同的切割器

| Splitter 名称                    | 适用文档类型           | 切分策略说明                     |
| -------------------------------- | ---------------------- | -------------------------------- |
| `RecursiveCharacterTextSplitter` | 普通文本（小说、说明） | 默认最常用，按字符层级递进切分   |
| `MarkdownTextSplitter`           | Markdown 文件          | 根据标题层级（#、## 等）结构来切 |
| `TokenTextSplitter`              | 精确控制 token 情况    | 按 token 数切分，不考虑语义      |
| `CharacterTextSplitter`          | 非结构文本             | 纯字符切，简单粗暴               |

**按照Token切割**
适合用在 token 预算敏感的场景。
```js
import { TokenTextSplitter } from "langchain/text_splitter";
const text =
  "I stand before you today the representative of a family in grief, in a country in mourning before a world in shock.";
const splitter = new TokenTextSplitter({
  chunkSize: 10,       // 每块最多 10 个 token
  chunkOverlap: 0      // 不需要重叠
});
const docs = await splitter.createDocuments([text]);
console.log(docs);
```
注意事项：
- TokenTextSplitter 不会“考虑语言结构”！它只按 token 数硬切。
- 切出来的块有可能把一个句子、段落、甚至一个词给切断。
- 它默认使用的 tokenizer 是 Tiktoken（适配 OpenAI 模型），如果是其他模型，可能 token 数会略有差异。

# 嵌入处理
回忆 RAG 关键步骤：
嵌入处理，又称之为**向量化操作**。核心就是将文本转为向量的形式，从而为下一步做数学运算做准备。
```
"今天的天气真好，万里无云"
```
```js
[
	 0.3297254741191864,   0.7386181354522705,    -3.342341899871826,
   -0.7811917066574097, -0.08536303788423538,   0.05086381733417511,
  ... 668 more items  
]
```
该操作一般需要依赖专门做嵌入处理的模型。例如：

```js
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY,
  model: "text-embedding-3-large", // OpenAI 官方提供的专门用于做嵌入的模型
});
const vectors = await embeddings.embedDocuments(
  documents.map((doc) => doc.pageContent)
);
```

在上面的代码中，使用的是 OpenAI 官方提供的专用嵌入模型。而 **OpenAIEmbeddings 则是 Embeddings 的子类**，关于 Embeddings 这个工具类，后面再来介绍。

## 自定义嵌入类
要实现并发的嵌入操作，我们可以自己来**自定义一个嵌入类**。
不过在此之前，需要先了解 Embeddings 工具类。
Embeddings 是 LangChain 中抽象出来的**嵌入操作基类**，不同厂商的向量模型，都通过继承该基类实现暴露统一方法，从而能在向量库、检索器等组件里互换使用。
基类提供两组最核心的方法：
- `embedDocuments(texts: string[]) => Promise<number[][]>`：批量嵌入用于**索引**的文本（返回二维向量数组）。
- `embedQuery(text: string) => Promise<number[]>`：为**查询**文本生成向量（返回一维向量）。
文档地址：https://js.langchain.com/docs/concepts/embedding_models/?utm_source=chatgpt.com
## 第三方并发库
关于并发的控制，还可以使用一个第三方库：[p-limit](https://www.npmjs.com/package/p-limit)
该库是一个极小的工具，用来限制并发执行的 Promise 个数，可以用于 Node.js 和浏览器环境。
基本用法：
```js
import pLimit from "p-limit";

const limit = pLimit(3); // 同时最多跑 3 个

const tasks = urls.map(url =>
  limit(() => fetchJson(url));
);
const results = await Promise.all(tasks);
```

