
/**
 * Приводит дату к строке
 * @param {Date} date
 * @return {string}
 */
function format(date) {
  return date.toJSON().replace(/-/g, '').substring(0, 8);
}

/**
 * Приводит moment.duration в читаемый вид
 * @param {Moment} delta
 * @return {string}
 */
function formattedMomentDuration (delta) {
  if (!delta) return '';

  const hh = Math.floor(delta.asHours()).pad(2);
  const mm = delta.minutes().pad(2);
  const ss = delta.seconds().pad(2);

  return `${hh}:${mm}:${ss}`;
};

/**
 * Хранит записи и возвращает итоги
 */
class Index {

  constructor(utils, post_event, log) {
    this.utils = utils;
    this.log = log;
    this.post_event = post_event;
    this.dates = new Map();
    this.last = {};
  }

  root(date) {
    const {dates} = this;
    if (!dates.has(date)) {
      dates.set(date, []);
    }
    return dates.get(date);
  }

  /**
   * @param {Array|String} work_center
   * @return {Moment|Undefined}
   */
  getLastMoment(work_center) {
    if (Array.isArray(work_center)) {
      const moments = work_center.map(w_c => this.last[w_c]).filter(w_c => !!w_c);
      return this.utils.moment.max(moments);
    }

    return this.last[work_center];
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

      // сохранение времени последних сканов
      if (!this.last[work_center]) {
        this.last[work_center] = md;
      } else if (md.isAfter(this.last[work_center])) {
        this.last[work_center] = md;
      }


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

      if (typeof query.shift !== 'number') {
        // несколько значений превращаем в цифровой массив
        if (query.shift?.includes(',')) {
          query.shift = query.shift.split(',').map(Number);
        } else {
          query.shift = parseInt(query.shift);
        }
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
      return (Array.isArray(query.shift) ? query.shift.includes(row.shift) : row.shift === query.shift) &&
        (!query.place ||
          (Array.isArray(query.place) ? query.place.includes(row.place) : row.place === query.place)) &&
        (!query.work_center ||
          (Array.isArray(query.work_center) ? query.work_center.includes(row.work_center) : row.work_center === query.work_center));
        });

    // Получение сканов за час из общего массива
    const getRowsLastHour = (rows) => {
      const timeSlice = md.clone().subtract(1, 'hour');
      return rows.filter((row) => row.moment.isAfter(timeSlice));
    };

    // последние сканы за час
    const hour_rows = getRowsLastHour(rows);

    // время последнего скана и временная разница
    const lastMomentTime = this.getLastMoment(query.work_center);
    const delta = this.utils.moment.duration(md.diff(lastMomentTime));


    const res = {
      date: query.date,
      shift: query.shift,
      count: rows.length,
      hour: hour_rows.length,
      last: lastMomentTime?.format('HH:mm:ss'),
      pause: formattedMomentDuration(delta),
      totals: {},
    };



    // Вариант нового решения по общей группировке
    if (['work_center', 'place', 'shift'].includes(query.group_by)) {
      const temp = {}; // временное хранение отфильтрованных данных

      // группировка по group_by
      for (const row of rows) {
        const key = row[query.group_by];
        if(!temp[key]) temp[key] = [];

        temp[key].push(row);
      }

      // вычисление параметров по отфильтрованному массиву
      for (const [key, values] of Object.entries(temp)) {
        if (res.totals[key]) continue;

        // последние сканы за час
        const hour_rows = getRowsLastHour(values);

        // время последнего скана и временная разница
        const lastMomentTime = this.utils.moment.max(values.map(r => r.moment));
        const delta = this.utils.moment.duration(md.diff(lastMomentTime));

        res.totals[key] = {
          date: query.date,
          shift: query.shift,
          count: values.length,
          hour: hour_rows.length,
          last: lastMomentTime?.format('HH:mm:ss'),
          pause: formattedMomentDuration(delta),
        };
      }
    }


    // Группировка частного случая по work_center (рабочее решение с созвона)
    // switch (query.group_by) {
    //   case 'work_center': {
    //     for (const wc of query.work_center) {
    //       if (!res.totals[wc]) res.totals[wc] = this.totals({ ...query, work_center: wc, group_by: '' });
    //     }
    //   }
    // }


    // группировка, если задана в запросе
    // if(['work_center', 'place'].includes(query.group_by)) {
    //   for(const row of rows) {
    //     const key = row[query.group_by];
    //     if(res.totals[key]) {
    //       res.totals[key]++;
    //     }
    //     else {
    //       res.totals[key] = 1;
    //     }
    //   }
    // }
    return res;
  }
}

module.exports = {Index, format};
