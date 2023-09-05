
const {Index, format} = require('./totals');

/**
 * Слушает события сканирования и обновляет индекс
 */
class Subscriber {

  constructor({events, utils, log, post_event}) {
    this.dates = {
      since: format(utils.date_add_day(new Date(), -2, 1)),
      start: format(utils.date_add_day(new Date(), -1, 1)),
      end: format(utils.date_add_day(new Date(), 2, 1)),
    };
    this.events = events;
    this.utils = utils;
    this.log = log;
    this.index = new Index(utils, post_event, log);
    this.stack = [];
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
        heartbeat: 20000,
        batch_size: 100,
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
    log(`monitor reconnect ${since.conf.since.split('-')[0]}`);
    this.changes = events.changes(since.conf)
      .once('change', (change) => {
        if(change.id < dates.start || since.conf.since === 'now') {
          since.set(change.seq);
        }
      })
      .on('change', (change) => {
        this.stack.push(change);
        if(!this.updating) {
          this.update();
        }
      })
      .on('error', (error) => {
        log(error);
        setTimeout(this.reconnect.bind(this), 10000);
      });
  }

  // обновляет индекс
  async update() {
    const {events, dates, utils, log, index, since, stack} = this;
    this.updating = true;

    const queue = [];
    while (queue.length < 100 && stack.length) {
      const scan = stack.shift();
      const {id, doc: {place, work_center}} = scan;
      const [moment, bar] = id.split('|');
      // откидываем заведомо бессмысленные строки
      if(moment && bar?.length >= 12 && moment > dates.start && !utils.is_empty_guid(work_center)) {
        queue.push(scan);
      }
    }
    const keys = queue.map(({id}) => `bar|${id.split('|')[1]}`);
    try {
      const bars = await events.allDocs({keys, include_docs: true});
      for(const change of queue) {
        const {id, doc: {user, place, work_center, person}} = change;
        const [moment, bar] = id.split('|');
        const bid = `bar|${bar}`;
        const bdoc = bars.rows.find(({id}) => id === bid);
        if(bdoc?.doc) {
          const {characteristic, cnstr, elm, specimen} = bdoc.doc;
          if(specimen) {
            index.add({moment, place, work_center, person, characteristic, specimen, stack});
          }
          since.conf.since = change.seq;
        }
      }
    }
    catch (e) {
      if(e.status !== 404) {
        log(e.message || e.reason, 'error');
      }
    }

    if(stack.length) {
      await this.update();
    }
    else {
      this.updating = false;
    }
  }
}

module.exports = Subscriber;
