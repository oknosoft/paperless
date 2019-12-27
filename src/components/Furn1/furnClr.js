/**
 *
 *
 * @module
 *
 * Created by Evgeniy Malyarov on 27.12.2019.
 */

import './furnClr.css';

const names = 'ACCADO,GU U/J,GU E/J,MACO,ROTO'.split(',');
const cache = new Map();

function fname(furn) {
  for(const name of names) {
    if(furn.name.includes(name)) {
      return name;
    }
  }
  if(!furn.parent.empty()) {
    return fname(furn.parent);
  }
  return '';
}
export default function furnClr(furn) {
  if(!cache.get(furn)) {
    const cssName = `fclr-${fname(furn).replace(/(\s|\/|\\)/g, '').toLowerCase()}`;
    cache.set(furn, cssName);
  }
  return cache.get(furn);
}
