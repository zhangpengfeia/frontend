# langchain
**LangChain 能做什么？**
- 串联多个大模型对话任务，实现多轮对话
- 将大模型与外部工具（搜索引擎、计算器、代码解释器） 无缝连接
- 给大模型加上“记忆”，实现个性化互动体验
- 构建复杂的多步骤 Agent 工作流，支持决策分支和任务规划
- 与文档、数据库结合，打造 RAG 检索增强系统

除了 LangChain，AI 应用开发领域还有不少优秀的框架，它们的侧重点略有不同：
| 框架                    | 核心优势                                                |
| ----------------------- | ------------------------------------------------------- |
| **LangChain**           | 模块化 + 全功能集成，适用于 RAG / Agent / Memory 全场景 |
| **LlamaIndex**          | 专注于文档索引 + 检索，用于构建高性能 RAG 系统          |
| **Haystack**            | 企业级搜索方案，支持复杂问答管线和评估工具              |
| **Transformers Agents** | HuggingFace 出品，灵活组合各种模型，偏原始              |
| **OpenDevin / AutoGen** | 多 Agent 协同执行任务，适合流程分工和协作系统           |

那我们为什么选 LangChain？
**1. 全家桶式体验，一套代码搞定多种需求**
LangChain 提供了覆盖 LLM 应用各个关键维度的模块，助你快速构建复杂的智能体：

| 模块    | 说明                                                         |
| ------- | ------------------------------------------------------------ |
| Models  | 支持 OpenAI、Anthropic、Llama 等多种模型，封装调用细节与响应结构 |
| Prompts | 提供模板引擎和变量插值机制，让提示词更易复用                 |
| Indexes | 索引与检索接口，构建企业级知识库的核心能力                   |
| Memory  | 支持对话中记忆上下文（短期 + 长期），提升交互连贯性          |
| Chains  | 串联多个步骤形成逻辑工作流，是 LangChain 的“灵魂”            |
| Agents  | 构建“能自己调用工具”的大模型智能体，实现真正的自主行为       |

## 文本补全模型
Text Completion Models
`Ollama` 实际封装的是一类基础补全模型（Text Completion Model）。这类模型具备以下典型特征：
1. 输入格式：接收的是 **普通文本字符串**，而 **不是对话消息数组**
2. 输出格式：返回的同样是 **一段纯文本**，**不含结构化角色信息**
3. 适用场景：更适合非对话类任务，例如：摘要提取、句子改写、文本分类、代码生成等
4. 调用方式：使用 `invoke(text)` 方法，输入为字符串
5. 与聊天模型区别：不支持 `HumanMessage` / `AIMessage` 角色区分，也不保留上下文

### 对话模型
Chat Completion Models
对话模型在能力上更进一步，它们支持**多轮上下文**和**角色区分**，输入格式为一组带有身份标签的消息**数组**（例如 `system`、`user`、`assistant`），模型能够根据对话历史生成更加自然且连续的回复。
 代表性模型有 GPT-4、Claude 3、Gemini、Mistral Chat 等，常用于聊天机器人、Agent 推理流程等复杂交互场景。
 1. **`@langchain/core`**
   LangChain 的“内核”，提供**最基础的抽象能力**，比如 `Runnable`（可执行单元）、`Prompt`（提示词模板）、`OutputParser`（输出解析器）等。同时还包含 LangChain Expression Language，用于编排复杂的链式逻辑。
2. **`@langchain/community`**
   社区维护的扩展包，收录了大量第三方集成，例如各类向量数据库、模型 API、文档加载器等。可以理解为 LangChain 的“插件市场”。
3. **`langchain`**
   是在核心能力基础上的**高阶封装**，内置了常见的链式组件（Chains）、智能体模块（Agents）、工具调度（Tools）等，是大多数 LangChain 应用的默认入口包。

**简单类比：**
- 文本补全模型：像是让 AI 接着你写的作文续写一段内容；
- 对话模型：更像是你在和一个“懂上下文”的 AI 助手对话，支持来回沟通。
| 对比维度        | `Ollama`（文本补全模型）                           | `ChatOllama`（对话模型）                                  |
| --------------- | -------------------------------------------------- | --------------------------------------------------------- |
| 所属包          | 同为 `@langchain/ollama`                           | 同为 `@langchain/ollama`                                  |
| 继承体系        | 基于 `LLM` 抽象类                                  | 基于 `BaseChatModel` 抽象类                               |
| 输入类型        | 接收 **纯文本字符串** 作为 prompt                  | 接收 **消息对象数组**（含 `system`、`user`、`assistant`） |
| Prompt 模板支持 | 支持文本模板（单角色）                             | 支持多角色模板（含系统提示 + 用户消息）                   |
| 系统提示能力    | 不支持 `SystemMessage`，需手动写入 prompt 中       | 原生支持系统消息（如使用 `SystemMessagePromptTemplate`）  |
| 上下文记忆      | 不具备上下文感知能力，每次调用是独立的             | 支持对话上下文，可构建多轮逻辑                            |
| 使用方式        | 适合执行 `model.invoke("文本")` 类型的**单轮任务** | 可通过 `chatModel.invoke(messages)` 处理**多轮对话**      |
| 推荐场景        | 适用于摘要、问答、标题生成等**单轮文本生成任务**   | 适用于翻译、聊天机器人、角色扮演等**多轮交互任务**        |

## 缓存
在实际开发 AI 应用的过程中，我们经常会遇到**重复输入**的情况：
- 同一用户多次询问相同的问题
- 刷新页面或误触按钮触发了相同请求
- 不同用户提出了内容高度相似的问题
如果每次都让大模型重新生成响应，不仅**效率低下**，还会带来**不必要的计算成本**。为了解决这个问题，我们可以引入“缓存机制”。
**启用缓存的好处**
1. 提升响应速度：重复问题无需重新调用模型，直接命中缓存结果
2. 降低调用成本：尤其对于调用远程 LLM（如 GPT-4），可节省大量费用
3. 避免冗余请求：减少系统负担，提升整体并发性能

🤔 为什么流式模式下没有命中缓存？
>这是因为 **LangChain 的默认缓存机制目前只对同步调用接口（如 `.invoke()`、`.predict()`）生效**。这些方法会在调用前先检查是否存在缓存结果，如果有，就直接返回；否则才会请求模型。
>
>而 `.stream()` 方法返回的是一个异步迭代器（`AsyncIterable`），数据是**一块一块地实时生成**的。当前在 LangChain.js 的实现中，**大多数模型（包括 Ollama）对 `.stream()` 并未内建完整的缓存处理逻辑**。

## 提示词模板
在使用 LangChain 构建大模型应用时，**提示词（Prompt）设计是第一步**。但直接写死字符串容易出错、复用性差，也不利于维护。这时候就该用上 LangChain 提供的 **Prompt Template** —— 一个专为语言模型设计的提示词模板工具。

## 结构化提示词
```ts
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

// 构建系统提示
const systemPrompt = SystemMessagePromptTemplate.fromTemplate(
  "你是一位专业导游，负责用中文向游客介绍北京特产。"
);

// 构建用户提示
const humanPrompt = HumanMessagePromptTemplate.fromTemplate("{question}");

// 组合为 ChatPromptTemplate
const chatPrompt = ChatPromptTemplate.fromMessages([systemPrompt, humanPrompt]);

// 填充变量，生成最终结构
const messages = await chatPrompt.formatMessages({
  question: "北京有哪些值得推荐的特产？",
});
console.log("生成的消息结构：", messages);
```
多组合模型
```ts
import {
  PromptTemplate,
  PipelinePromptTemplate,
} from "@langchain/core/prompts";

// 获取当前日期字符串
const getDate = () => new Date().toLocaleDateString();

// 1. 创建一个主模板
const mainPt = PromptTemplate.fromTemplate(
  `你是一个智能助理，今天是 {date}，主人的信息是 {userInfo}，
  请根据上下文完成以下任务：
  {todo}`
);

// 2. 创建子模板
const timePl = PromptTemplate.fromTemplate("{date}，现在是 {time}");
const filledTimePl = await timePl.partial({
  date: getDate,
});

const userTpl = PromptTemplate.fromTemplate("姓名：{name}，性别：{gender}");
const taskTpl = PromptTemplate.fromTemplate(`
    我想吃 {time} 的 {dish}。
    请再次确认我的信息：{userInfo}
    `);

// 3. 可以将子模板填充到主模板里面
const finalPt = new PipelinePromptTemplate({
  pipelinePrompts: [
    {
      name: "date",
      prompt: filledTimePl,
    },
    {
      name: "userInfo",
      prompt: userTpl,
    },
    {
      name: "todo",
      prompt: taskTpl,
    },
  ],
  finalPrompt: mainPt,
});
const result = await finalPt.format({
  time: "12:01",
  name: "张三",
  gender: "男",
  dish: "煎蛋",
});
console.log(result);
```


## Message消息对象
Message 模块是 LangChain.js 中和大模型进行交互的 **基本单位**，用来表达**谁说了什么**，并且能携带额外的元信息。
常见的 Message 类型有：
1. HumanMessage：用户输入
2. AIMessage：模型输出
3. SystemMessage：系统指令，例如告诉模型「你是一个助手」这种角色设定
4. FunctionMessage / ToolMessage：Function Calling 或 MCP 工具调用的结果
5. ChatMessage：通用的消息格式，可以指定角色

### 对象成员
**1. content**
消息的主要内容，最核心的字段。
- 一般是 **字符串**（最常见）
- 也可以是 **对象数组**（比如多模态：文字 + 图片）
例子 1：纯文本
```js
new HumanMessage("你好！")
{ content: "你好！" }

```
例子 2：多模态内容
```js
new HumanMessage({
  content: [
    { type: "text", text: "请描述这张图片" },
    { type: "image_url", image_url: "https://example.com/cat.png" }
  ]
})
{
  content: [
    { type: "text", text: "请描述这张图片" },
    { type: "image_url", image_url: "https://example.com/cat.png" }
  ]
}
```


**2. additional_kwargs**
附加参数，用来保存与 **OpenAI/其他模型 API 兼容的扩展字段**。
它通常是空的 `{}`，但在某些场景下会被用到，例如 Function Calling 的场景：
```js
new AIMessage({
  content: "",
  additional_kwargs: {
    function_call: {
      name: "getWeather",
      arguments: '{ "city": "北京" }'
    }
  }
})
```
这是早期的 OpenAI Function Calling 格式（GPT-3.5/4 `2023-06-13` 那一代）。这种格式只支持一次函数调用。
- 字段名是 `function_call`，里面直接放 `name` + `arguments`
- arguments 是 JSON 字符串，需要开发者自己 `JSON.parse()`
```js
new AIMessage({
  content: "",
  additional_kwargs: {
    tool_calls: [
      {
        id: "tool_123",
        type: "function",
        function: { name: "search", arguments: "{ \"query\": \"LangChain\" }" }
      }
    ]
  }
})
```

这是 OpenAI 新版 Tool Calling 格式（从 GPT-4-1106-preview 开始引入）。
- 支持 **多次调用**（`tool_calls` 是数组，可以一次性返回多个工具调用）
- 每个调用有 `id`（唯一标识符），方便你追踪调用 → 响应
- `type` 明确标注了调用类型（现在主要是 `"function"`）
- LangChain.js 会自动解析成标准化的 `tool_calls` 字段，`arguments` 会从字符串转成对象
不过现在，在最新的 LangChain.js 中，推荐使用`tool_calls` 字段，而非塞到 `additional_kwargs` 里：
```js
new AIMessage({
  content: "",
  tool_calls: [
    {
      id: "tool_123",
      name: "getWeather",
      args: { city: "北京" },
    },
  ],
});
```
**3. invalid_tool_calls**
当模型给出的工具调用结果无法被 LangChain 标准化时（例如 **解析失败** 或 **结构不合法**），这些调用不会出现在 `AIMessage.tool_calls`，而是被放进 `AIMessage.invalid_tool_calls`，方便你做兜底与修复。

**4. response_metadata**
用于保存「消息是怎么来的」的元信息，常见于 **模型输出**。里面的内容取决于 LLM 的返回信息，比如：
例子 1：OpenAI 返回的 token 消耗

```js
new AIMessage({
  content: "你好，我是 AI 助手。",
  response_metadata: {
    tokenUsage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    model_name: "gpt-4o-mini",
    finish_reason: "stop"
  }
})
```
例子 2：Ollama 返回的时间戳
```js
new AIMessage({
  content: "好的。",
  response_metadata: {
    created: 1724453430,
    model: "llama3"
  }
})
```
例子 3：自定义的元信息
```js
new HumanMessage({
  content: "请帮我翻译",
  response_metadata: { source: "wechat" }
})
```
**5. text**
获取**纯文本**内容的便捷取值器。
```js
import { HumanMessage } from "@langchain/core/messages";
const msg = new HumanMessage({
  content: [
    { type: "text", text: "请描述这张图片" },
    { type: "image_url", image_url: "https://example.com/cat.png" },
  ],
});
console.log(msg.text); // 请描述这张图片
console.log(msg.content); // [{type:...},{type:...}]

```
**6. `getType()方法`**
返回消息类型。
```js
import { HumanMessage } from "@langchain/core/messages";
const msg = new HumanMessage({
  content: [
    { type: "text", text: "请描述这张图片" },
    { type: "image_url", image_url: "https://example.com/cat.png" },
  ],
});
console.log(msg.getType()); // human
```
`getType()` 方法常用语根据不同消息类型进行不同的处理。
`@langchain/core/messages` 里面还提供了一组守卫方法：
```js
import { HumanMessage, isHumanMessage } from "@langchain/core/messages";
const msg = new HumanMessage("你好，我叫小明");
console.log(isHumanMessage(msg)); // true
```

### 消息占位
在做聊天应用时，我们的提示词往往是一串按角色分好的消息
hatPromptTemplate.fromMessages()` 明确支持由“消息模板 + 占位符”组成的形式。
也就是说，以前我们使用 `ChatPromptTemplate.fromMessages()`，是这么使用的：
```js
const spt = SystemMessagePromptTemplate.fromTemplate(
  "你是一位中国的专业导游，请使用中文向游客介绍中国的某些地区的特产"
);
const hpt = HumanMessagePromptTemplate.fromTemplate("我想问：{question}");
// 将上面两个提示词进行一个组合
const chatpt = ChatPromptTemplate.fromMessages([spt, hpt]);
```
那么现在，你可以在数组中添加占位符，放置的位置取决于你自己的需求：
```js
ChatPromptTemplate.fromMessages([
  spt,
  new MessagesPlaceholder("history"),
  hpt
]);
```
在上面的代码中，我们就创建了一个占位符，放置于 spt 和 hpt 这两个提示词之间。

## LCEL
LangChain Expression Language，是 LangChain 提供的一种**声明式**构建 **链式** 调用流程的方式。它允许开发者用 `.pipe()` 操作符将不同的模块（如提示模板、模型、解析器等）连接起来，形成一个完整的“链（Chain）”。
```ts
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
// 创建模块：提示词模块、模型模块、解析器模块
// 1. 创建提示词
const pt = PromptTemplate.fromTemplate("请严格使用中文解释:{question}");
// 2. 创建模型
const model = new ChatOllama({
  model: "llama3",
  temperature: 0.7,
});
// 3. 创建一个解析器
const parser = new StringOutputParser();
// 4. 将上面的 3 个模块连接起来：pipe
// 相当于创建了一个链条
const chain = pt.pipe(model).pipe(parser);
// 5. 使用 chain 这个链条
const res = await chain.stream({
  question: "什么是闭包",
});
// .stream() 是异步的，.invoke() 是同步的，.batch() 是批量的
for await (const chunk of res) {
  process.stdout.write(chunk);
}
```

