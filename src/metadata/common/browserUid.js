
export function browserUid({wsql}){

  const urlid = new URLSearchParams(location.search.substring(1));
  if(urlid.has('id')) {
    wsql.set_user_param('url_id', urlid.get('id'));
  }
  // const signal = AbortSignal.timeout(2000);
  // fetch(`http://localhost:9190/uid`, {signal})
  //   .then((res) => res.text())
  //   .then((urlid) => {
  //     wsql.set_user_param('browser_uid', urlid);
  //   })
  //   .catch(() => null);
}
