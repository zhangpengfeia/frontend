// rollup_jsapi.js
const rollup = require('rollup');

const buildMainOptions = {
    input: 'src/main.js'
}

async function build() {
  const bundle = await rollup.rollup(buildMainOptions); // 抽象语法树
  const resp = await bundle.write(buildMainOptions.output); // 输出阶段
  console.log(resp);
  if (resp.code === 0) {
    console.log('build成功');
  }
  await bundle.close();
}
build();