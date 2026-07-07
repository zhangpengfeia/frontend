
# 微前端
qiankun: single-spa, micro-apps: WebComponent
## WebComponent
web组件，它描述得其实就是三种不同的全新的API: 自定义元素、Shadow DOM、HTML模板
```js
// 1.创建一个自定义元素
const MyElement = customElements.define("my-element", class extends HTMLElement {});
// 2.创建一个Shadow DOM
const shadow = MyElement.shadowRoot;
// 3.创建一个HTML模板
const template = document.createElement("template");
template.innerHTML = "<div>hello world</div>";
shadow.appendChild(template.content.cloneNode(true));
```