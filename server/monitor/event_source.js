/**
 * Ответ монитора в формате event_source
 */


module.exports = function events({utils, cat: {users}}, log, auth) {

  const resps = new Set();
  let index;

  /**
   * Ответ всем подписчикам
   * @param {Object} data
   * @param {Object} evt
   */
  const post_event = (that) => {
    for(const res of resps) {
      if(that && that !== res) {
        continue;
      }
      const data = {ok: true};
      index.get;
      res.posti++;
      res.write(`${evt ? `event: ${evt.event}\n` : ''}data: ${JSON.stringify({data})}\nid: ${res.posti}\n\n`);
    }
  };
  post_event.register = (o) => index = o;

  /**
   * Шлёт пустые строки, чтобы браузер не уснул
   */
  const ping = () => {
    for(const res of resps) {
      res.write('\n');
    }
  }

  /**
   * Обрабатывает запросы к event-source
   * @param req
   * @return {Promise}
   */
  const event_source = async (req, res) => {

    if(req.method === 'POST' || req.method === 'PUT') {
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
    });

    resps.add(res);
    res.socket.on('close', resps.delete.bind(resps, res));

  };

  setInterval(ping.bind(null), 70000);

  return {post_event, event_source};
};
