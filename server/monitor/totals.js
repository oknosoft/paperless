
/**
 * Приводит дату к строке
 * @param {Date} date
 * @return {string}
 */
function format(date) {
  return date.toISOString().replace(/-/g, '').substring(0, 8);
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
    let date = parseInt(moment.substring(0, 8), 10);
    let time = parseInt(moment.substring(8, 10), 10);
    let shift = 1;
    if(time < 8) {
      const tmp = new Date(`${moment.substring(0, 4)}-${moment.substring(4, 6)}-${moment.substring(6, 8)}`);
      date = parseInt(format(this.utils.date_add_day(tmp, -1, 1)), 10);
      shift++;
    }
    else if(time > 20) {
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
};

module.exports = {Index, format};
