
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

  add({moment, place, work_center, person, characteristic, specimen}) {
    let date = parseInt(moment.substring(0, 8));
    let time = parseInt(moment.substring(8, 10));
    let shift = 1;
    if(time < 8) {
      const tmp = new Date(`${moment.substring(0, 4)}-${moment.substring(4, 6)}-${moment.substring(6, 8)}`);
      date = parseInt(format(this.utils.date_add_day(tmp, -1, 1)), 10);
      shift++;
    }
    else if(time >= 20) {
      shift++;
    }
    time *= 60;
    time += parseInt(moment.substring(10, 12));

    const root = this.root(date);
    if (!root.some((row) => row.shift === shift &&
      row.place === place &&
      row.work_center === work_center &&
      row.person === person &&
      row.characteristic === characteristic &&
      row.specimen === specimen)) {
      root.push({shift, place, work_center, person, characteristic, specimen, time});
      this.post_event();
      if(Math.random() < 0.01) {
        this.log(`monitor index add ${moment}`);
      }
    }
  }

  totals(query) {
    const tmp = new Date();
    let time = tmp.getHours();
    if(process.platform !== 'win32') {
      time -= tmp.getTimezoneOffset() / 60;
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
      query.date = parseInt(format(tmp));
      if(time < 8) {
        query.date = parseInt(format(this.utils.date_add_day(tmp, -1, 1)));
        query.shift++;
      }
      else if(time >= 20) {
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
    time = (time - 1) * 60 + tmp.getMinutes();
    const base = time = time * 60 + tmp.getMinutes();
    const hour = rows.filter((row) => row.time >= time);
    const max = rows.reduce((acc, val) => val > acc ? val : acc, 0);
    const last = `${Math.floor(max / 60).pad(2)}:${(max % 60).pad(2)}`;
    const delta = base - max;
    const pause = `${Math.floor(delta / 60).pad(1)}:${(delta % 60).pad(2)}`;
    const res = {count: rows.length, totals: {}, hour: hour.length, last, pause};

    // группировка, если задана в запросе
    if(['work_center', 'place'].includes(query.group_by)) {
      for(const row of rows) {
        if(res.totals[query.group_by]) {
          res.totals[query.group_by]++;
        }
        else {
          res.totals[query.group_by] = 1;
        }
      }
    }
    return res;
  }
}

module.exports = {Index, format};
