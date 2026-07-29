
export function browserUid({wsql, adapters, cat}){

  const urlid = new URLSearchParams(location.search.substring(1));
  if(urlid.has('id')) {
    wsql.set_user_param('url_id', urlid.get('id'));
  }
  if(urlid.has('wc')) {
    const id = urlid.get('wc');
    adapters.pouch.once('pouch_complete_loaded', () => {
      const wc = cat.work_centers.by_id(id);
      if(wc && !wc.empty()) {
        wsql.set_user_param('work_center', wc.ref);
      }
    });
  }
}
