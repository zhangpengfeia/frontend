# Schema
Schema 是 MCP 中**核心要素**之一，定义了各类 JSON‑RPC 请求与响应的 **结构、校验规则与类型安全**。
## Zod
Zod 是一个现代的、TypeScript 优先的 **模式验证库（schema validation library）**，它在前端（如表单校验、API 参数校验）和后端（如请求校验、配置文件验证、自动生成 JSON Schema）中都非常流行。
**快速上手**
```js
import { z } from "zod";
const userSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const input = { name: "张三", age: 30 };

const result = userSchema.safeParse(input);

if (result.success) {
  console.log("合法数据", result.data); 
} else {
  console.error("校验失败", result.error.format());
}
```
**常用 Zod 类型**

| 类型        | 写法                                | 说明                                     |
| ----------- | ----------------------------------- | ---------------------------------------- |
| 字符串      | `z.string()`                        | 可链 `.min(n)`、`.max(n)`、`.email()` 等 |
| 数字        | `z.number()`                        | 可链 `.int()`、`.positive()`、`.gte(n)`  |
| 布尔值      | `z.boolean()`                       |                                          |
| 日期        | `z.date()`                          |                                          |
| 数组        | `z.array(z.string())`               | 表示字符串数组                           |
| 对象        | `z.object({})`                      | 用于定义结构                             |
| 可选字段    | `.optional()`                       | 表示字段可缺省                           |
| 可以为 null | `.nullable()`                       |                                          |
| 联合类型    | `z.union([z.string(), z.number()])` |                                          |
| 枚举        | `z.enum(["A", "B", "C"])`           |                                          |

## Schema 
MCP 里面提供了一组 Schema.
Schema 由 TypeScript + Zod 定义，制作成 JSON Schema，用于**验证协议消息结构**。
在 SDK 中，每个 JSON‑RPC 方法（如 `resources/list`、`tools/call`）都对应相应的 Zod Schema，比如：

- `ReadResourceRequestSchema`
- `ListResourcesRequestSchema`
- `CallToolRequestSchema`
- `ListPromptsRequestSchema`

这些 schema 的功能包括：

- **校验请求结构** 严格保证参数类型与字段是否存在；
- **生成 TS 类型**，提高类型安全；
- **生成 JSON Schema**，用于能力声明或与客户端协商能力。



