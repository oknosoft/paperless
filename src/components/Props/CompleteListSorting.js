/**
 * Допсвойства по номенклатурам спецификации
 *
 * @module CompleteListSorting
 *
 * Created by Evgeniy Malyarov on 25.12.2018.
 */

import React from 'react';
import {TableRow, TableCell} from './TableRow';

export default function CompleteListSorting(props) {

  const {ox: {specification, constructions}, cnstr, show_spec} = props;
  const tmp = new Set();
  const data = new Map();
  const res = [];

  specification.forEach(({nom, elm}) => {
    if(!tmp.has(nom)) {
      if(typeof show_spec === 'function') {
        if(!show_spec(nom)) {
          return;
        }
      }
      else if(!nom.complete_list_sorting) {
        return;
      }
      const ccnstr = elm > 0 ? (constructions.find({elm}) || {cnstr: 0}).cnstr : -elm;
      if(cnstr && ccnstr && cnstr !== ccnstr) {
        return;
      }
      tmp.add(nom);
    }
  });

  tmp.forEach((nom) => {
    const group = nom.complete_list_sorting.round(-1);
    if(!data.has(group)) {
      data.set(group, new Set());
    }
    data.get(group).add(nom.note || nom.name);
  });

  data.forEach((value, key) => {
    res.push(<TableRow key={`l-${key}`}>
           <TableCell component="th" scope="row">{key}</TableCell>
           <TableCell>{Array.from(value).join(', ')}</TableCell>
         </TableRow>);
  });

  return res;

}
