
const {Index, format} = require('./totals');

/**
 * Слушает события сканирования и обновляет индекс
 */
class Subscriber {

  constructor(events, utils, log) {
    this.dates = {
      since: format(utils.date_add_day(new Date(), -2, 1)),
      start: format(utils.date_add_day(new Date(), -1, 1)),
      end: format(utils.date_add_day(new Date(), 1, 1)),
    };
    this.events = events;
    this.utils = utils;
    this.log = log;
    this.index = new Index(utils);
    this.subscribe(events, log);
  }

  // подписывается на события
  async subscribe(events, log) {

    // в _local/stat_ram_seq, храним текущий seq, чтобы не поолзать по базе events с начала времён
    const since = {
      _id: '_local/stat_ram_seq',
      get() {
        return events.get(this._id)
          .catch(() => ({since: 'now'}))
          .then(({since}) => since);
      },
      set(since) {
        return events.get(this._id)
          .catch(() => ({_id: this._id}))
          .then((doc) => {
            doc.since = since;
            return events.put(doc);
          })
      }
    };

    const {dates} = this;
    const conf = {
      live: true,
      include_docs: true,
      since: await since.get(),
      selector: {
        $and: [
          {_id: {$gt: dates.start}},
          {_id: {$lt: dates.end}},
        ]
      }
    };
    this._changes = events.changes(conf)
      .once('change', (change) => {
        if(change.id < dates.start || conf.since === 'now') {
          since.set(change.seq);
        }
      })
      .on('change', this.update.bind(this))
      .on('error', log);
  }

  // обновляет индекс
  async update(change) {
    const {id, doc: {user, place, work_center, person}} = change;
    const [moment, bar] = id.split('|');
    const {events, dates, utils, log, index} = this;
    if(!moment || !bar || bar.length < 12 || moment < dates.start || utils.is_empty_guid(work_center)) {
      return;
    }
    try {
      const {characteristic, cnstr, elm, specimen} = await events.get(`bar|${bar}`);
      if(specimen !== undefined) {
        index.add({moment, place, work_center, person, characteristic, specimen});
      }
    }
    catch (e) {
      if(e.status !== 404) {
        log(e);
      }
    }
  }
}

module.exports = Subscriber;
