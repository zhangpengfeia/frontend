var fn = function fn() {
  console.log('fn');
  return [1, 2, 3].map(function (item) {
    return item * 2;
  });
};

console.log(fn());
