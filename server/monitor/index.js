/**
 * Формирует индекс сканирований в ОЗУ
 * Временный вариант без Postgres
 */

const Subscriber = require('./subscriber');

module.exports = function subscriber($p, log) {

  const {adapters: {pouch}, utils} = $p;
  const {post_event, event_source} = require('./event_source')($p, log);
  const events = new Subscriber({events: pouch.remote.events, utils, log, post_event});
  post_event.register(events.index);

  function monitor(req, res) {

    let {parsed: {query, path}, headers, user}  = req;

    if(query && query.includes('feed=longpoll')) {
      return res.end(JSON.stringify({error: 'feed', reason: 'longpoll not supported now'}));
    }

    if(query && query.includes('feed=eventsource')) {
      return event_source(req, res);
    }

    res.end(JSON.stringify({ok: true, count: events.index.dates.get(20230712).length}));
  }

  return monitor;
}
