/**
 * записывает или читает лог сканирований
 *
 * @module scan
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

module.exports = function scan($p, log) {

  const {job_prm: {server}, adapters: {pouch}, utils: {moment, getBody, end}} = $p;

  const {ping, pong} = require('./hrtime')(log);

  const monitor = server.eve_url ? require('./monitor')($p, log) : () => null;

  function history({query, res, stat}) {
    return pouch.remote.events.query('history', {startkey: [query.bar, ''], endkey: [query.bar, '\ufff0']})
      .then((rsp) => {
        res.end(JSON.stringify(rsp));
      })
      .catch((err) => end.end500({res, err, log}))
      .then(() => pong(stat));
  }

  function stringifyKey(key) {
    return `${key[0]}${key[1].pad()}${key[2].pad()}${key[3]}${key[4]}`;
  }

  function events({query, res, method, path, stat}) {
    if(!query.moment) {
      query.moment = moment().format('YYYYMMDDHHmmssSSS');
    }

    if(!query.period || !['month','year'].includes(query.period)) {
      query.period = 'day';
    }

    const opts = {};
    if(query.period === 'day') {
      const year = parseFloat(query.moment.substring(0, 4));
      const month = parseFloat(query.moment.substring(4, 6));
      const day = parseFloat(query.moment.substring(6, 8));
      if(query.place) {
        opts.key = [year, month, day, query.user, query.place];
      }
      else {
        opts.startkey = [year, month, day, query.user, ''];
        opts.endkey = [year, month, day, query.user, '\ufff0'];
      }
    }
    else if(query.period === 'month') {
      opts.keys = [];
      const start = moment(`${query.moment.substring(0,4)}-${query.moment.substring(4,6)}-${query.moment.substring(6,8)}`);
      for(let i = 0; i < 31; i++) {
        const key = start.subtract(i ? 1 : 0, 'day').format('YYYY-MM-DD').split('-').map(v => parseFloat(v));
        key.push(query.user, query.place);
        opts.keys.unshift(key);
      }
    }
    // [ 2020, 2, 9, "ef5294e3-bdf3-11e6-81b5-00155d001639", "furn1" ]
    // query.totals_only
    return pouch.remote.events.query('events', opts)
      .then(({rows}) => {
        const grouping = new Map();
        for(const row of rows) {
          const key = stringifyKey(row.key);
          if(!grouping.has(key)) {
            grouping.set(key, {l: 0, d: new Set()});
          }
          const v = grouping.get(key);
          v.l++;
          v.d.add(row.value);
        }
        if(query.totals_only && query.period === 'day') {
          const v = Array.from(grouping.values())[0];
          if(v) {
            res.end(JSON.stringify({l: v.l, d: v.d.size}));
          }
          else {
            res.end(JSON.stringify({l: 0, d: 0}));
          }
        }
        else if(query.totals_only && query.period === 'month') {
          for(const ckey of opts.keys) {
            const key = stringifyKey(ckey);
            const v = grouping.get(key);
            if(v) {
              ckey.push(v.l, v.d.size);
            }
            else {
              ckey.push(0, 0);
            }
          }
          res.end(JSON.stringify(opts.keys));
        }
        else {
          stat.error = `${method} ${path}`;
          end.end404(res, stat.error);
        }
        pong(stat);
      });
  }

  function raw({query, res, stat}) {
    const startkey = query.moment ? query.moment.substring(0, 8) : moment().format('YYYYMMDD');
    return pouch.remote.events.query('history', {
      startkey,
      endkey: `${startkey}\ufff0`,
      include_docs: true,
    })
      .then((rsp) => {
        res.end(JSON.stringify(rsp));
      })
      .catch((err) => {
        stat.error = err.message || `${err.error} ${err.reason}`;
        end.end500({res, err, log});
      })
      .then(() => pong(stat));
  }

  return async function scan(req, res) {

    if(!server.eve_url) {
      throw {status: 404, message: `eve_url not defined`};
    }

    const {parsed: {path, paths}, method, query} = req;
    const stat = ping({method, query});

    if (paths[3] === 'monitor'){
      return monitor(req, res, stat);
    }

    if(method === 'GET') {
      if(query.bar) {
        return history({query, res, stat});
      }
      else if(query.raw) {
        return raw({query, res, stat});
      }
      if(query.user) {
        return events({query, res, method, path, stat});
      }
      else {
        stat.error = `${method} ${path}`;
        end.end404(res, stat.error);
        return pong(stat);
      }
    }

    else if(method === 'PUT' || method === 'POST') {
      return getBody(req)
        .then((body) => {
          const doc = JSON.parse(body);
          const code = doc._id.substring(18);
          if(code.length < 3 || code === 'undefined' || code.length > 20) {
            end.end404(res, `${method} ${path}`);
            return pong(stat);
          }
          const barcode = `bar|${code}`;
          return pouch.remote.events.put(doc)
            .catch(() => null)
            .then(() => pouch.remote.events.get(barcode))
            .then((rsp) => {
              res.end(JSON.stringify(rsp));
              pong(stat);
            })
            .catch(() => {
              stat.error = `${method} ${path}`;
              end.end404(res, stat.error);
              pong(stat);
            });
      });
    }
    else {
      stat.error = `${method} ${path}`;
      return end.end404(res, stat.error);
    }
  };
};
