/**
 * записывает или читает расшифровку штрихкода для безбумажки
 *
 * @module bar
 *
 * Created by Evgeniy Malyarov on 09.02.2020.
 */

module.exports = function bar($p, log) {

  const {job_prm: {user_node: auth, server}, adapters: {pouch}, classes: {PouchDB}, utils: {getBody, end}} = $p;
  if(!pouch.remote.events) {
    pouch.remote.events = new PouchDB(server.eve_url, {skip_setup: true, owner: pouch, adapter: 'http', auth});
  }

  return async function bar(req, res) {

    const {parsed: {path}, method} = req;
    if(method === 'GET') {
      let ok;
      const id = decodeURIComponent(path.split('api/bar/')[1]);
      if(!id) {
        throw {status: 404, message: `empty bar`};
      }
      try {
        const doc = await pouch.remote.events.get(id.replace('_local/', ''));
        res.end(JSON.stringify(doc));
        ok = true;
      }
      catch(err) {
        err.message = 'bar ' + (err.message || '');
        log(err);
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
            .then((rsp) => {
              res.end(JSON.stringify(rsp));
            });
        });
    }
    else {
      end.end404(res, `${method} ${path}`);
    }
  };
};
