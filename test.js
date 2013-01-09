queue = require("./queue-limiter.js");

console.log(queue);

function async(val, callback) {
  setTimeout(function() {
    console.log('Value: ' + val);
    if (val % 1000 === 10) {
      callback(null, true);
    } else {
      callback();
    }
  }, val);
}

var q = queue()
  .push(async, 1)
  .push(async, 3001)
  .push(async, 2);

setTimeout(function() {q.push(async, 3);}, 8000);
