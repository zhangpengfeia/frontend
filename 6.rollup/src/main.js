console.log(111)

import('./util.js').then(chunk => {
    console.log(chunk);
    console.log(chunk.defaultNumber(1, 10));
    console.log(chunk.deepClone({a: 1, b: {c: 3}}));
})