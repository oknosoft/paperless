/**
 * записывает или читает лог сканирований
 *
 * @module scan
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

module.exports = function scan($p, log) {

  const {job_prm: {user_node: auth, server}, adapters: {pouch}, classes: {PouchDB}, utils: {moment, getBody, end}} = $p;
  if(!pouch.remote.events) {
    pouch.remote.events = new PouchDB(server.eve_url, {skip_setup: true, owner: pouch, adapter: 'http', auth});
  }

  function history({query, res}) {
    return pouch.remote.events.query('history', {startkey: [query.bar, ''], endkey: [query.bar, '\ufff0']})
      .then((rsp) => {
        res.end(JSON.stringify(rsp));
      })
      .catch((err) => end.end500({res, err, log}));
  }

  function stringifyKey(key) {
    return `${key[0]}${key[1].pad()}${key[2].pad()}${key[3]}${key[4]}`;
  }

  function events({query, res, method, path}) {
    if(!query.moment) {
      query.moment = moment().format('YYYYMMDDHHmmssSSS');
    }

    if(!query.period || !['month','year'].includes(query.period)) {
      query.period = 'day';
    }

    const opts = {};
    if(query.period === 'day') {
      const year = parseFloat(query.moment.substr(0, 4));
      const month = parseFloat(query.moment.substr(4, 2));
      const day = parseFloat(query.moment.substr(6, 2));
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
      const start = moment(`${query.moment.substr(0,4)}-${query.moment.substr(4,2)}-${query.moment.substr(6,2)}`);
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
          end.end404(res, `${method} ${path}`);
        }
      });
  }

  function raw({query, res}) {
    const startkey = query.moment ? query.moment.substr(0, 8) : moment().format('YYYYMMDD');
    return pouch.remote.events.query('history', {
      startkey,
      endkey: `${startkey}\ufff0`,
      include_docs: true,
    })
      .then((rsp) => {
        res.end(JSON.stringify(rsp));
      })
      .catch((err) => end.end500({res, err, log}));
  }

  return async function scan(req, res) {

    const {parsed: {path}, method, query} = req;
    if(method === 'GET') {
      if(query.bar) {
        return history({query, res});
      }
      else if(query.raw) {
        return raw({query, res});
      }
      if(query.user) {
        return events({query, res, method, path});
      }
      else {
        end.end404(res, `${method} ${path}`);
      }
    }

    else if(method === 'PUT' || method === 'POST') {
      return getBody(req)
        .then((body) => {
          const doc = JSON.parse(body);
          const code = doc._id.substr(18);
          if(code.length < 3 || code === 'undefined' || code.length > 20) {
            return end.end404(res, `${method} ${path}`);
          }
          const barcode = `bar|${code}`;
          return pouch.remote.events.put(doc)
            .catch(() => null)
            .then(() => pouch.remote.events.get(barcode))
            .catch(() => pouch.remote.doc.get(`_local/${barcode}`))
            .then((rsp) => {
              res.end(JSON.stringify(rsp));
            })
            .catch(() => end.end404(res, `${method} ${barcode}`));
      });
    }
    else {
      end.end404(res, `${method} ${path}`);
    }
  };
};
