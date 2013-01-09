(function() {
  if (typeof module === 'undefined') self.queue = queue;
  else module.exports = queue;

  function queue(maxruns, perunit) {
    var queue = {},
        parallelism = 1,
        active = 0,
        remaining = 0,
        head, tail,
        error = null,
        results = [],
        interval,
        timeout;

    if (arguments.length < 1) maxruns = 1;
    if (arguments.length < 2) perunit = 's';

    interval = 1.0/maxruns;
    interval *= {'ms': 1.0, 's': 1000.0, 'sec': 1000.0, 'm': 60*1000.0,
      'min': 60*1000.0}[perunit];

    queue.push = function() {
      var node = arguments;
      node.index = results.push(undefined) - 1;
      if (tail) tail.next = node, tail = tail.next;
      else head = tail = node;
      ++remaining;
      timer();
      return queue;
    }

    function pop() {
      if (head && active < parallelism) {
        var node = head,
            f = node[0],
            a = Array.prototype.slice.call(node, 1);
        if (head === tail) head = tail = null;
        else head = head.next;
        ++active;
        a.push(function(e, req) {
          --active;
          if (error != null) return;
          if (e != null) {
            error = e;
            pause();
          }
          if (req != null) {
            queue.push.apply(queue, node);
          }
        });
        f.apply(null, a);
      } else if (!head) {
        queue.pause()
      }
    }

    function timer() {
      if (!timeout) {
        pop();
        timeout = setInterval(pop, interval);
      }
    }

    queue.pause = function() {
      console.log('clearing timeout');
      clearTimeout(timeout);
      timeout = null;
    }

    queue.continu = function() {
      timer()
    }

    return queue;
  }
})();
