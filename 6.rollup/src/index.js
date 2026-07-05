import { randomNumber, deepClone } from "./util.js";
import { cloneDeep } from "lodash-es";

const r = randomNumber(1, 10);
console.log(r);

const obj1 = {
  a: 1,
  b: {
    c:3
  }
}
const obj2 = cloneDeep(obj1);
obj2.b.c = 4;
console.log(obj1)
console.log(obj2)
