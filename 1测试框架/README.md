# 测试

分类：静态测试，单元测试，集成测试，E2E测试

```
静态测试：eslint, tslint,stylelint,preetir,在编写代码时就报错
单元测试：函数或者方法来验证某个功能，是测试的最小单位，开发来编写测试用例，用自动化测试用例跑通，一般使用mock
集成测试：将多个单元组成，保证多个部分连接起来能够跑通，连接真实数据
E2E测试：端到端测试，测试整个软件完整性，模拟真实用户的行为
```

## 自动化测试

```
在开发中，单元测试时间 > 集成测试 > E2E测试，因为到后期bug成本较高，因此写的最多的是单测，自动化测试是devops里重要环节
```

## Jest
### 配置
```js
// jest 配置
collectCoverage: true // 开启覆盖率收集,包含所有文件中每种类型的覆盖率
coverageThreshold: { // 覆盖率阈值
    statements: 100,
    branches: 100,
    lines: 100,
    functions: 100
}
testMatch: ["**/*.test.js","**/*.spec.js"] // 指定配置运行那些测试文件,.test.js,.spec.js
moduleFileExtensions: [".js",".jsx",".json",".node"] // 指定模块文件扩展名

// jest 浏览器环境测试
npx jest --init // 环境选择jsdom环境
npm install jest-environment-jsdom // 安装这个依赖提供特有的api，但是还是有部分缺失，需要额外包支持
npm install jest-location-mock // 模拟location对象
```

### 语法

```js
test('测试',()=>{
    const res = 3
    expect(res).toBe(3) // 测试断言，是否为3
})
//测试用例分组
describe("这是一组测试", ()=>{
    it("测试",()=>{}) // test语法糖
})
// jest 匹配器
test("深度比较对象",()=>{
    expect({a:1,b:2}).toEqual({a:1,b:2})
})
// 布尔值相关匹配器
test("布尔值相关匹配器",()=>{
    expect(true).toBeTruthy() // 断言 true 是否为 true
    expect(false).toBeFalsy() // 断言 false 是否为 false
})
// 无参匹配器
test("无参匹配器",()=>{
    expect(1).toBeNull() 
    expect(1).toBeUndefined()
    expect(1).toBeNaN()
})
// 数值相关匹配器
test("数值相关匹配器",()=>{
    expect(1).toBeGreaterThan(0) // 断言 1 是否大于 0
    expect(1).toBeLessThan(2) // 断言 1 是否小于 2
})
// 字符串相关匹配器
test("字符串相关匹配器",()=>{
    expect("hello world").toContain("hello")
    expect("hello world").toMatch("hello")
})
// 异常相关匹配器
test("异常相关匹配器",()=>{
    expect(()=>{
        throw new Error("这是一个错误")
    }).toThrowError("这是一个错误")
})
// 非对称匹配器
test("非对称匹配器",()=>{
    expect([1,2,3]).toEqual(expect.arrayContaining([1,2,3])) // 期望数组包含 1,2,3 中的任意一个
    expect([1,2,3]).not.toContain(expect.arrayContaining([4,5,6])) // 期望数组不包含 4,5,6 中的任意一个
})
// jest.spyOn 监视函数调用
const spy = jest.spyOn(console,'log')
console.log('hello world')
expect(spy).toHaveBeenCalledWith('hello world')
// 模拟计时器
test('模拟计时器',()=>{
    const callback = jest.fn()
    const interval = 1000;
    const setInterval = jest.spyOn(window,'setInterval')
    const timerId = setInterval(callback,interval)
    expect(setInterval).toHaveBeenCalledWith(callback,interval)
    expect(timerId).toBeDefined()
    jest.advanceTimersByTime(interval)
    expect(callback).toHaveBeenCalledTimes(2)
    stopTimer(timerId)
})
test("停止定时器",()=>{
    const callback = jest.fn()
    const interval = 1000;
    const setInterval = jest.spyOn(window,'setInterval')
    const timerId = setInterval(callback,interval)
    stopTimer(timerId)
})
// jest测试vue组件 hello.test.ts
import { shallowMount } from '@vue/test-utils' // shallowMount 浅渲染函数
import App from '@/App.vue'
describe('hello.vue',()=>{
  it('hello.vue 组件渲染',async ()=>{
    const msg = 'hello world'
    const wrapper = shallowMount(HelloWorld,{
      props:{
        msg
      }
    })
    // wrapper 方法 text() 获取组件渲染后的文本内容
    expect(wrapper.text()).toBe(msg)
    await wrapper.get('h1').click()
    expect(wrapper.element).toMatchSnapshot() // 生成快照文件，测试组件每次是否一样
  })
})
// 测试登录功能
import Login from '@/components/Login.vue'
import { shallowMount } from '@vue/test-utils'
const fakeUserPesponse = {token:'fakeToken'}
window.fetch = mockResolvedValue({
  ok:true,
  json:()=>Promise.resolve(fakeUserPesponse)
})
afterEach(()=>{
  window.localStorage.removeItem('token')
})
test('请求成功',async ()=>{
  const wrapper = shallowMount(Login)
  await wrapper.find("#user").setValue("test")
  await wrapper.find("#password").setValue("test")
  await wrapper.find("button").click()
  await wrapper.vm.$nextTick()

  expect(window.localStorage.getItem('token')).toEqual(fakeUserPesponse.token)
  expect(wrapper.text()).toBe('登录成功')
})
test("请求失败",async ()=>{
  window.fetch = mockResolvedValue({
    ok:false,
    json:()=>Promise.resolve({error:"登录失败"})
  })
  const wrapper = shallowMount(Login)
  await wrapper.find("#user").setValue("test")
  await wrapper.find("#password").setValue("test")
  await wrapper.find("button").click()
  await wrapper.vm.$nextTick()
  expect(window.localStorage.getItem('token')).toEqual(null)
  expect(wrapper.text()).toBe('登录失败')
})
```
### 生命周期
```js
// jest 生命周期
// beforeAll 在所有测试用例执行前执行一次
beforeAll(()=>{
    console.log("beforeAll")
})
// beforeEach 在每个测试用例执行前执行一次
beforeEach(()=>{
    console.log("beforeEach")
})
// afterEach 在每个测试用例执行后执行一次
afterEach(()=>{
    console.log("afterEach")
})
// afterAll 在所有测试用例执行后执行一次
afterAll(()=>{
    console.log("afterAll")
})

// 分组中也可以使用生命周期
describe("分组",()=>{
    beforeAll(()=>{
        console.log("beforeAll")
    })
    beforeEach(()=>{
        console.log("beforeEach")
    })
    afterEach(()=>{
        console.log("afterEach")
    })
    afterAll(()=>{
        console.log("afterAll")
    })
})
```
### 模拟函数
```js
// jest 模拟函数
// mock 是一个模拟函数，调用时会返回 undefined
test("模拟函数",()=>{
    const mock = jest.fn()
    mock()
    expect(mock).toHaveBeenCalledTimes(1)
})
// 内置实现
test("内置实现",()=>{
    const mock = jest.fn((a,b)=>a+b)
    expect(1+2).toBe(mock(1,2))
})
// 控制模拟函数不同次数调用对应的返回值 mockReturnValueOnce
test("控制模拟函数不同次数调用对应的返回值",()=>{
    const mock = jest.fn((a,b)=>a+b)
    mock.mockReturnValueOnce(100)
    mock.mockReturnValueOnce(200)
    expect(100).toBe(mock(1,2))
    expect(200).toBe(mock(3,4))
})
// 模拟异步网络请求
const mock = jest.fn((a,b)=>{
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve(a+b)
        },1000)
    })
})
test("模拟异步网络请求",async()=>{
    expect(await mock(1,2)).toBe(3)
})
```
### 模拟模块
```js
// jest 模拟模块
// 模拟 axios模块
import axios from "axios"
// 模拟 axios 模块
jest.mock("axios",()=>{
    return {
        get:jest.fn(()=>Promise.resolve(100))
    }
})
test("模拟 axios 模块",async ()=>{
    await expect(user.api()).resolves.toBe(100) // 断言 user.api 函数返回值为 100
})
// 从tool替换sum,sub方法
jest.mock("../tool",()=>{
    return {
        sum:jest.fn(()=>100),
        sub:jest.fn(()=>100)
    }
})
test("模拟 tool 模块",()=>{
    expect(sum(1,2)).toBe(3)
    expect(sub(1,2)).toBe(-1)
})
```