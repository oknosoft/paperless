
module.exports = function (log) {

  function pong(stat) {
    clearTimeout(stat.timer);
    const after = process.hrtime(stat.before);
    stat.latency = (after[0] * 1000000000 + after[1]) / 1000000;
    delete stat.before;
    delete stat.timer;
    log(stat);
  }

  function timeout(stat) {
    stat.error = 'timeout';
    pong(stat);
  }

  function ping({method, query}) {
    const stat = {method, before: process.hrtime()};
    if(query) {
      stat.query = query;
    }
    stat.timer = setTimeout(timeout.bind(null, stat), 10000);
    return stat;
  }

  return {ping, pong};
};
