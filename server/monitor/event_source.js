/**
 * Ответ монитора в формате event_source
 */


module.exports = function events({utils, cat: {users}}, log, auth) {

  const resps = new Set();
  let index;

  /**
   * Ответ всем подписчикам
   * @param {Object} that
   */
  const post_event = (that) => {
    for(const res of resps) {
      if(that && that !== res) {
        continue;
      }
      const data = index.totals(res.req.query);
      if(res.totals !== data.totals) {
        res.totals = data.totals;
        res.posti++;
        res.write(`event: scan\ndata: ${JSON.stringify({data})}\nid: ${res.posti}\n\n`);
      }
    }
  };
  post_event.register = (o) => index = o;

  const {pong} = require('../hrtime')(log);

  /**
   * Обрабатывает запросы к event-source
   * @param {http.ClientRequest} req
   * @param {http.ServerResponse} res
   * @param {Object} stat
   * @return {Promise}
   */
  const event_source = async (req, res, stat) => {

    if(req.method !== 'GET') {
      return res.end(JSON.stringify({ok: true, incoming: true}));
    }

    res.posti = 0;
    res.event_id = utils.generate_guid();
    res.removeHeader('Transfer-Encoding');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*',
    });
    res.write('\n');
    Promise.resolve().then(() => {
      res.posti++;
      res.write(`event: id\ndata: ${res.event_id}\nid: ${res.posti}\n\n`);
      post_event(res);
      pong(stat);
    });

    resps.add(res);
    res.socket.on('close', resps.delete.bind(resps, res));

  };

  setInterval(post_event.bind(null), 77000);

  return {post_event, event_source};
};