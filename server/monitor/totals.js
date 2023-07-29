
/**
 * Приводит дату к строке
 * @param {Date} date
 * @return {string}
 */
function format(date) {
  return date.toJSON().replace(/-/g, '').substring(0, 8);
}

/**
 * Хранит записи и возвращает итоги
 */
class Index {

  constructor(utils, post_event, log) {
    this.utils = utils;
    this.log = log;
    this.post_event = post_event;
    this.dates = new Map();
  }

  root(date) {
    const {dates} = this;
    if (!dates.has(date)) {
      dates.set(date, []);
    }
    return dates.get(date);
  }

  /**
   *
   * @param {String}} moment 20230301071906592
   * @param place
   * @param work_center
   * @param person
   * @param characteristic
   * @param specimen
   * @param stack
   */
  add({moment, place, work_center, person, characteristic, specimen, stack}) {
    const md = this.utils.moment(moment, 'YYYYMMDDHHmmssSSS');
    const hour = md.hour();
    let shift = 1;
    if(hour < 8) {
      md.subtract(1, 'day');
      shift++;
    }
    else if(hour >= 20) {
      shift++;
    }
    const date = parseInt(md.format('YYYYMMDD'));

    const root = this.root(date);
    if (!root.some((row) => row.shift === shift &&
      row.place === place &&
      row.work_center === work_center &&
      row.person === person &&
      row.characteristic === characteristic &&
      row.specimen === specimen)) {
      root.push({shift, place, work_center, person, characteristic, specimen, moment: md});
      if(stack.length < 20) {
        this.post_event();
      }
      if(Math.random() < 0.004) {
        this.log(`monitor index add ${moment}`);
      }
    }
  }

  totals(query) {
    const md = this.utils.moment();
    const hour = md.hour();
    if(process.env.TIME_DIFF) {
      md.add(parseInt(process.env.TIME_DIFF), 'minutes');
    }
    if(query.date && query.shift) {
      if(typeof query.date !== 'number') {
        query.date = parseInt(query.date);
      }
      if(typeof query.shift !== 'number') {
        query.shift = parseInt(query.shift);
      }
    }
    else {
      query.shift = 1;
      query.date = parseInt(md.format('YYYYMMDD'));
      if(hour < 8) {
        const tmp = md.clone();
        tmp.subtract(1, 'day');
        query.date = parseInt(tmp.format('YYYYMMDD'));
        query.shift++;
      }
      else if(hour >= 20) {
        query.shift++;
      }
    }

    if(query.place?.includes(',')) {
      query.place = query.place.split(',');
    }
    if(query.work_center?.includes(',')) {
      query.work_center = query.work_center.split(',');
    }

    // фильтр
    const rows = this.root(query.date).filter((row) => {
      return row.shift === query.shift &&
        (!query.place ||
          (Array.isArray(query.place) ? query.place.includes(row.place) : row.place === query.place)) &&
        (!query.work_center ||
          (Array.isArray(query.work_center) ? query.work_center.includes(row.work_center) : row.work_center === query.work_center));
    });

    // время с последнего сканирования
    const slice = md.clone();
    slice.subtract(1, 'hour');
    const old = md.clone();
    old.subtract(1, 'day');
    // записи за последний плавающий час
    const hour_rows = rows.filter((row) => row.moment.isAfter(slice)); // проверить
    const last = rows.reduce((acc, row) => row.moment.isAfter(slice) ? row.moment : acc, old); // проверить
    const delta = this.utils.moment.duration(last.diff(md));
    const res = {
      date: query.date,
      shift: query.shift,
      count: rows.length,
      hour: hour_rows.length,
      last: last.format('HH:mm:ss'),
      pause: delta.humanize(),
      totals: {},
    };

    // группировка, если задана в запросе
    if(['work_center', 'place'].includes(query.group_by)) {
      for(const row of rows) {
        const key = row[query.group_by];
        if(res.totals[key]) {
          res.totals[key]++;
        }
        else {
          res.totals[key] = 1;
        }
      }
    }
    return res;
  }
}

module.exports = {Index, format};
