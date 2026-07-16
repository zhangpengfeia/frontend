# Runnable接口

在 LCEL 中，几乎所有的模块：

- 提示词模板
- 模型
- 解析器

都是实现了 Runnable 接口的，可以将这些模块称之为 Runnable 类型。这种类型的模块可以快速插入到链条里面。


**RunnableLambda**

`RunnableLambda` 是 LangChain.js 提供的一种轻量级工具，它能把 **普通函数** 封装成符合 `Runnable` 接口规范的实例，从而让该函数能够无缝参与到 LCEL 的链式调用与流式处理流程中。

1. 快速上手案例

   ```js
   import { RunnableLambda } from "@langchain/core/runnables";
   
   const fn = (text) => {
     return text.toUpperCase();
   };
   
   const runnableFn = RunnableLambda.from(fn);
   
   const res = await runnableFn.invoke("hello");
   
   console.log(res);
   ```

2. 关键词高亮插件

   `闭包` --> `*&*闭包*&*`

   ```js
   import { ChatOllama } from "@langchain/ollama";
   import { PromptTemplate } from "@langchain/core/prompts";
   import { StringOutputParser } from "@langchain/core/output_parsers";
   import { RunnableLambda } from "@langchain/core/runnables";
   
   // 1. 创建一个提示词模板
   const pt = PromptTemplate.fromTemplate("请使用中文解释下面的概念：{topic}");
   
   // 2. 创建模型
   const model = new ChatOllama({
     model: "llama3",
     temperature: 0.7,
   });
   
   // 3. 解析器
   const parser = new StringOutputParser();
   
   // 4. 创建一个链条
   let chain = pt.pipe(model).pipe(parser);
   
   // 5. 创建一个简单的插件
   const fn = (text) => text.replace(/闭包/g, "*&*闭包*&*");
   const highlight = RunnableLambda.from(fn);
   
   chain = chain.pipe(highlight);
   
   const res = await chain.invoke({
     topic: "闭包",
   });
   
   console.log(res);
   ```

更多场景：

- 插入日志收集模块
- 插入翻译模块（调用外部 API）
- 插入开关：判断某个条件是否中断执行
- 格式调整、结构清洗、敏感词过滤



`pipe()` 方法可接受的三种类型：

1. Runnable 实例：这是**最常用的，也是最推荐的**

2. 普通函数：LCEL 内部会自动用 `RunnableLambda.from(fn)` 包装成一个 `Runnable`。

3. 对象：将上游的输入（或结果）分别传给多个 runnable，然后返回一个对象。

   ```js
   import { ChatOllama } from "@langchain/ollama";
   import { PromptTemplate } from "@langchain/core/prompts";
   import { StringOutputParser } from "@langchain/core/output_parsers";
   import { RunnableLambda } from "@langchain/core/runnables";
   
   // 创建模型
   const model = new ChatOllama({
     model: "llama3",
     temperature: 0.7,
   });
   
   // 解析器
   const parser = new StringOutputParser();
   
   // 创建两个子链
   const chain1 = PromptTemplate.fromTemplate(
     "请用中文用 2-3 句概括以下主题的核心含义：{input}"
   )
     .pipe(model)
     .pipe(parser);
   
   const chain2 = PromptTemplate.fromTemplate(
     "请用中文从以下主题中提取 5 个关键词，以逗号分隔：{input}"
   )
     .pipe(model)
     .pipe(parser);
   
   let chain = RunnableLambda.from((x) => x);
   
   chain = chain.pipe({
     summary: chain1,
     keywords: chain2,
   });
   
   const res = await chain.invoke({
     input: "闭包",
   });
   console.log(res);
   ```
**RunnableMap**
`RunnableMap`（也叫 `RunnableParallel`），它可以让多个链条 **并发执行**，并返回一个结构化的对象结果。

`RunnableMap.from({ ... })` 会并发执行多个子链，并将它们的结果组合成一个对象返回。

```js
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableMap } from "@langchain/core/runnables";

// 创建模型
const model = new ChatOllama({
  model: "llama3",
  temperature: 0.7,
});

// 解析器
const parser = new StringOutputParser();

const chain1 = PromptTemplate.fromTemplate("用中文讲一个关于 {topic} 的笑话")
  .pipe(model)
  .pipe(parser);
const chain2 = PromptTemplate.fromTemplate("用中文写一首关于 {topic} 的两行诗")
  .pipe(model)
  .pipe(parser);

const chain = RunnableMap.from({
  joke: chain1,
  poem: chain2,
});

const res = await chain.invoke({
  topic: "小狗",
});
console.log(res);
```
实例化 RunnablePassthrough 的时候，接收一个配置对象，该对象中可以配置 func 副作用函数，用于对输入做一些副作用处理，例如记录日志、写入数据库、做埋点等。
```js
import { RunnablePassthrough } from "@langchain/core/runnables";
const injector = RunnablePassthrough.assign({
  timestamp: async () => new Date().toISOString(),
  meta: async () => ({
    region: "us-east",
    requestId: "req-456",
  }),
});

const result = await injector.invoke({ query: "Vue 是什么？" });

console.log(result);
/*
  {
    query: 'Vue 是什么？',
    timestamp: '2025-08-11T08:07:35.358Z',
    meta: { region: 'us-east', requestId: 'req-456' }
  }
*/
```

# RunnableBranch
RunnableBranch 是 LangChain.js 中提供的条件分派器。
它把一条流程拆成多条“候选子链”，并附带各自的触发条件，运行时从左到右依次评估条件，命中第一个就执行对应子链，若都不命中则走默认分支。可以把它理解成链式的 `if/else if/else`。

**适用场景**

- 意图分流：把“数学问答 / SQL 咨询 / 常规闲聊”分到不同处理链。
- 策略切换：根据上下文选择不同 Prompt / 模型 / 温度 或不同的工具集合。
- 合规与风控：命中敏感词/权限不足 → 分流到“拒答/脱敏/人工审核”链。
- 降本增效：先走便宜路径（检索/小模型），只有命中特定条件才走贵路径（推理型大模型）。
- 容错兜底：为无法归类或条件未命中的情况提供稳定的默认输出链。


**基础语法**
RunnableBranch 是一个类，因此使用的时候需要实例化：

```js
new RunnableBranch({ branches, default })
```

- branches：对应的类型为 `Branch<Runinput, Runoutput>[]`，其中 Runinput 是条件，Runoutput 是被选中后的子链。
- default：无分支命中时执行的 `Runnable<RunInput, RunOutput>`

RunnableBranch 还有一个静态方法 `RunnableBranch.from([...BranchLike[], defaultRunnableLike])`，该方法接受一个数组，数组的前 N 项是 `[条件, 子链]` 的数组，最后一项是默认子链。

```js
RunnableBranch.from([
  [条件1, 子链1],
  [条件2, 子链2],
  [条件3, 子链3],
  默认子链
])
```
不过现在 [官方更加推荐使用 RunnableLambda 的方式](https://js.langchain.com/docs/how_to/routing/?utm_source=chatgpt.com)。因为 RunnableLambda 更灵活，在函数里可以做复杂判别、动态返回任意子链，便于与外部系统结合。
