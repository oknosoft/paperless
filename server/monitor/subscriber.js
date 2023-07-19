
const {Index, format} = require('./totals');

/**
 * Слушает события сканирования и обновляет индекс
 */
class Subscriber {

  constructor({events, utils, log, post_event}) {
    this.dates = {
      since: format(utils.date_add_day(new Date(), -2, 1)),
      start: format(utils.date_add_day(new Date(), -1, 1)),
      end: format(utils.date_add_day(new Date(), 1, 1)),
    };
    this.events = events;
    this.utils = utils;
    this.log = log;
    this.index = new Index(utils, post_event, log);
    this.subscribe(events, log);
  }

  // подписывается на события
  async subscribe() {

    // в _local/stat_ram_seq, храним текущий seq, чтобы не поолзать по базе events с начала времён
    const {dates, events} = this;
    const _id = '_local/stat_ram_seq';
    this.since = {
      set(since) {
        return events.get(_id)
          .catch(() => ({_id}))
          .then((doc) => {
            doc.since = since;
            return events.put(doc);
          });
      },
      conf: {
        live: true,
        include_docs: true,
        since: await events.get(_id)
          .catch(() => ({since: 'now'}))
          .then(({since}) => since),
        selector: {
          $and: [
            {_id: {$gt: dates.start}},
            {_id: {$lt: dates.end}},
          ]
        }
      }
    };

    this.reconnect();
  }

  reconnect() {
    const {dates, events, since, log} = this;
    this.changes = events.changes(since.conf)
      .once('change', (change) => {
        if(change.id < dates.start || since.conf.since === 'now') {
          since.set(change.seq);
        }
      })
      .on('change', this.update.bind(this))
      .on('error', (error) => {
        log(error);
        setTimeout(this.reconnect.bind(this), 10000);
      });
  }

  // обновляет индекс
  async update(change) {
    const {id, doc: {user, place, work_center, person}} = change;
    const [moment, bar] = id.split('|');
    const {events, dates, utils, log, index, since} = this;
    // откидываем заведомо бессмысленные строки
    if(!moment || !bar || bar.length < 12 || moment < dates.start || utils.is_empty_guid(work_center)) {
      return;
    }
    try {
      const {characteristic, cnstr, elm, specimen} = await events.get(`bar|${bar}`);
      if(specimen !== 0) {
        index.add({moment, place, work_center, person, characteristic, specimen});
      }
      since.conf.since = change.seq;
    }
    catch (e) {
      if(e.status !== 404) {
        log(e);
      }
    }
  }
}

module.exports = Subscriber;
