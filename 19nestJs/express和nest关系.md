## Nest与Express的关系
前面我们用的`Nest`的 `request`、`response` 对象都特地强调了是引入`express`的
实际上，对于http请求响应的处理，Nest可以轻松的切换 express、fastify库，在源代码内部使用了**适配器模式**
首先大家要知道，后端都是强类型的模式，比如我们用动物举例：
```typescript
class Duck {
  quack(): void {
    console.log("鸭子：嘎嘎嘎");
  }
}
```
```typescript
class Chicken {
  cluck(): void {
    console.log("鸡：咯咯咯");
  }
}
```
鸭子和鸡，是不同的类型，两者像现在这样是无法产生关联的。
但是就算国内与其他地区的插头一样，虽然规格不一样，但是只要我们有一个转接头，就能完美的适配不同地区的接口
因此，我可以创建一个接口：

```typescript
interface Quackable {
  quack(): void;
}
```
当我需要统一的动物叫声的时候，我可以像下面这些写一个方法：
```typescript
function makeItQuack(animal: Quackable) {
  animal.quack();
}
```
`makeItQuack`方法的参数，是`Quackable`接口。

现在，无论是鸭还是鸡，我通过统一的适配器进行转换：

```typescript
class AnimalAdapter implements Quackable {
  private animal: any;
  private soundMethod: string;

  constructor(animal: any, soundMethod: string) {
    this.animal = animal;
    this.soundMethod = soundMethod;
  }

  quack(): void {
    // 动态调用对应动物的叫声方法
    if (this.soundMethod in this.animal) {
      this.animal[this.soundMethod]();
    } else {
      console.log("动物没有这个叫声方法！");
    }
  }
}
```
这样，具体在使用的时候，我们就可以非常方便的进行替换
```typescript
function makeItQuack(animal: Quackable) {
  animal.quack();
}
// 使用鸭子（通过适配器）
const duck = new Duck();
const duckAdapter = new AnimalAdapter(duck, "quack");
makeItQuack(duckAdapter);  // 输出: 鸭子：嘎嘎嘎
// 使用鸡（通过适配器）
const chicken = new Chicken();
const chickenAdapter = new AnimalAdapter(chicken, "cluck");
makeItQuack(chickenAdapter);  // 输出: 鸡：咯咯咯
```
所以，Nest对于请求响应的底层处理，就是通过这种适配器模式，可以非常方便的进行替换，到底是使用`express`，还是`fastify`，进本的情况如下图：