
# js工具链
### prettier格式化工具
```js
// 使用vscode 插件可以实时格式化代码
// 使用运行脚本命令，可以一次性格式化所有代码
// 1 .prettierrc 配置规则
{
  "printWidth": 120, // 每行字符数
  "singleQuote": true, // 单引号
  "trailingComma": "es5", // 使用 es5 格式
  "semi": false, // 不使用分号
  "tabWidth": 2, // 缩进宽度
  "useTabs": false, // 不使用制表符
  "arrowParens": "avoid", // 避免使用箭头函数的括号
}
// 2 还可以在package.json 中配置 prettier 格式化命令
"scripts": {
  "format": "prettier --write \"**/*.{js,jsx,ts,tsx}\""
}
// 3 忽略配置 .prettierignore 参考git

```
### eslint规范
```js
// eslint配置
{
  "env": {
    "browser": true, // 浏览器环境
    "es2021": true // es2021 环境
  },
  "extends": "eslint:recommended", // 推荐规则
  "parserOptions": {
    "ecmaVersion": 12, // 解析器选项
    "sourceType": "module" // 模块类型
  },
  "rules": { // 代码规则，类似prettier的规则,可能会与prettier冲突
    "no-console": "warn" // 警告 console 语句
    "indent": ["error", 2] // 缩进宽度
  }
}
// 与prettier结合使用
npm i eslint-config-prettier eslint-plugin-prettier
{
  "extends": [
    "eslint:recommended",
    "prettier/recommended" // .eslint解决冲突配置
  ],
}
// eslint9.0开始，推荐配置文件为eslint.config.js,并支持esm模块化风格
export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    extends: [
      "eslint:recommended",
      "prettier/recommended" // .eslint解决冲突配置
    ],
  },
]
// 如果项目里同时需要支持js和ts
export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    extends: [
      "eslint:recommended",
      "prettier/recommended" // .eslint解决冲突配置
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      "eslint:recommended",
      "prettier/recommended" // .eslint解决冲突配置
    ],
  },
]
// eslint 也可在package.json命令行中使用
// 也可以写成api脚本函数形式例如：
const eslint = require('eslint');
const results = eslint.lintFiles(['**/*.js', '**/*.jsx']);
console.log(results);
// eslint插件 eslint-plugin-[插件名称]
npm install eslint-plugin-vue -D
// 自定义插件
// meta 提供元数据信息 create 这个字段是一个函数
export default {
    meta: {
        type: "problem",
        docs: {
            description: "no-console",
            category: "Possible Errors",
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.callee.name === "console") {
                    context.report({
                        node,
                        message: "console is not allowed",
                    });
                }
            },
        };
    },
}
```
### babel规范
```js
// babel配置文件时目录级别的，子目录可继承父目录
babel.config.**
// babel常用配置
// 插件和预设配置，如果配置了插件和预设，那么先运行插件，在运行预设
{
    plugins: [ //对应的值为一个数组，配置使用的插件
        "babel-plugin-transform-runtime",
    ],
    presets: [ //对应的值为一个数组，配置使用的预设
        "@babel/preset-env",
    ],
    targets: { // 指定浏览器版本范围
        browsers: ["last 2 versions"],
    },
    browserlistConfigFile: true, // 开启browserlist配置文件搜索
    extends: "./base.babel.json", // 继承父目录的配置
    overrides: [ // 配置对匹配的文件或者目录应用不同配置
        {
            "test": ["*.ts", "*.tsx"],
            exclude: ["node_modules"],
            include: ["src"],
            plugins: ["@babel/plugin-transform-runtime"],
        }
    ],
    sourceMaps: true, // 是否生成source map文件
    sourceType: "module", // 溇定输入文件的类型
}
```