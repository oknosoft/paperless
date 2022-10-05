
function reset_replace(prm) {

  const {pouch} = $p.adapters;
  const {local} = pouch;
  const destroy_ram = local.ram && local.ram.destroy.bind(local.ram);
  const destroy_doc = local.doc && local.doc.destroy.bind(local.doc);
  const do_reload = () => {
    setTimeout(() => {
      location.replace(prm.host);
    }, 1000);
  };
  const do_replace = destroy_ram ?
    () => destroy_ram()
      .then(destroy_doc)
      .catch(destroy_doc)
      .then(do_reload)
      .catch(do_reload)
    :
    do_reload;

  alert(`Новый сервер. Зона №${prm.zone} перемещена на выделенный сервер ${prm.host}`);
  setTimeout(do_replace, 1000);
}

/**
 * предопределенные зоны
 */
export const predefined = {
  ':1110': {
    zone: 10,
  },
  // 'tmk.': {zone: 23, host: 'https://tmk-online.ru/'},
}

/**
 * патч зоны по умолчанию
 */
export function patch_prm(settings) {
  return (prm) => {
    settings(prm);
    for (const elm in predefined) {
      if(location.host.match(elm)) {
        prm.zone = predefined[elm].zone;
        break;
      }
    }
    return prm;
  };
}

/**
 * патч параметров подключения
 */
export function patch_cnn() {

  const {job_prm, wsql} = $p;

  for (const elm in predefined) {
    const prm = predefined[elm];
    if(location.host.match(elm)) {
      wsql.get_user_param('zone') != prm.zone && wsql.set_user_param('zone', prm.zone);
      'log_level,splash,templates,keys,crazy_ram'.split(',').forEach((name) => {
        if(prm.hasOwnProperty(name)) {
          if(typeof job_prm[name] === 'object') {
            Object.assign(job_prm[name], prm[name]);
          }
          else {
            job_prm[name] = prm[name];
          }
        }
      });
    }
  }
  if(!location.host.match(/localhost|192.168.9.160/)) {
    for (const elm in predefined) {
      const prm = predefined[elm];
      if(prm.host && wsql.get_user_param('zone') == prm.zone && !location.host.match(elm)) {
        reset_replace(prm);
      }
    }
  }
}
