/**
 * записывает или читает расшифровку штрихкода для безбумажки
 *
 * @module bar
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

module.exports = function bar($p, log) {

  const {job_prm: {user_node: auth, server}, adapters: {pouch}, classes: {PouchDB}, utils: {getBody, end}} = $p;
  if(!pouch.remote.events && server.eve_url) {
    log(server.eve_url);
    pouch.remote.events = new PouchDB(server.eve_url, {skip_setup: true, owner: pouch, adapter: 'http', auth});
    pouch.local.events = pouch.remote.events;
  }

  const {ping, pong} = require('./hrtime')(log);

  return async function bar(req, res) {

    if(!server.eve_url) {
      throw {status: 404, message: `eve_url not defined`};
    }

    const {parsed: {path}, method} = req;
    const stat = ping({method});

    if(method === 'GET') {
      let ok;
      const id = decodeURIComponent(path.split('api/bar/')[1]);
      if(!id) {
        stat.error = `empty bar`;
        pong(stat);
        throw {status: 404, message: stat.error};
      }
      try {
        const doc = await pouch.remote.events.get(id.replace('_local/', ''));
        res.end(JSON.stringify(doc));
        pong(stat);
        ok = true;
      }
      catch(err) {
        stat.error = 'bar ' + (err.message || `${err.error} ${err.reason}`);
        pong(stat);
      }
      if(!ok) {
        throw {status: 404, message: `bar not found '${id}'`};
      }
    }
    else if(method === 'PUT' || method === 'POST') {
      return getBody(req)
        .then((body) => {
          const doc = JSON.parse(body);
          doc._id = doc._id.replace('_local/', '');
          let diff;
          return pouch.remote.events.get(doc._id)
            .then((ndoc) => {
              doc._rev = ndoc._rev;
              for(const fld in doc) {
                if(fld.startsWith('_')) {
                  continue;
                }
                if(doc[fld] !== ndoc[fld]) {
                  diff = true;
                  break;
                }
              }
            })
            .catch(() => {
              diff = true;
            })
            .then(() => diff ? pouch.remote.events.put(doc) : {ok: true, rev: doc.rev || 'new'})
            .catch((err) => {
              stat.error = err.message || `${err.error} ${err.reason}`;
              return {error: stat.error};
            })
            .then((rsp) => {
              res.end(JSON.stringify(rsp));
              pong(stat);
            });
        });
    }
    else {
      stat.error = `${method} ${path}`;
      end.end404(res, stat.error);
      pong(stat);
    }
  };
};
