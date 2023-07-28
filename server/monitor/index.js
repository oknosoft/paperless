/**
 * Формирует индекс сканирований в ОЗУ
 * Временный вариант без Postgres
 */

const Subscriber = require('./subscriber');

module.exports = function subscriber($p, log) {
  const {pong} = require('../hrtime')(log);
  const {adapters: {pouch}, utils} = $p;
  const {post_event, event_source} = require('./event_source')($p, log);
  const events = new Subscriber({events: pouch.remote.events, utils, log, post_event});
  post_event.register(events.index);

  function monitor(req, res, stat) {

    let {parsed: {paths}, query}  = req;

    if(query?.feed === 'longpoll' || paths[4] === 'longpoll') {
      return res.end(JSON.stringify({error: 'feed', reason: 'longpoll not supported now'}));
    }

    if(query?.feed === 'eventsource' || paths[4] === 'eventsource') {
      return event_source(req, res, stat);
    }

    res.end(JSON.stringify({ok: true, ...events.index.totals(req.query)}));
    pong(stat);
  }

  return monitor;
}