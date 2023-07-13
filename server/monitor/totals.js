
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

  constructor(utils, post_event) {
    this.utils = utils;
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

    const root = this.root(date);
    if (!root.some((row) => row.shift === shift &&
      row.place === place &&
      row.work_center === work_center &&
      row.person === person &&
      row.characteristic === characteristic &&
      row.specimen === specimen)) {
      root.push({shift, place, work_center, person, characteristic, specimen});
      this.post_event();
    }
  }

  totals(query) {
    if(query.date && query.shift) {
      if(typeof query.date !== 'number') {
        query.date = parseInt(query.date);
      }
      if(typeof query.shift !== 'number') {
        query.shift = parseInt(query.shift);
      }
    }
    else {
      let tmp = new Date();
      const time = tmp.getHours();
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

    const rows = this.root(query.date).filter((row) => {
      return row.shift === query.shift &&
        (!query.place || row.place === query.place) &&
        (!query.work_center || row.work_center === query.work_center);
    });
    return rows.length;
  }

};

module.exports = {Index, format};
