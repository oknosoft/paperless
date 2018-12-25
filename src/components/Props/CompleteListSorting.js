/**
 * Допсвойства по номенклатурам спецификации
 *
 * @module CompleteListSorting
 *
 * Created by Evgeniy Malyarov on 25.12.2018.
 */

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from './TableRow';

export default function CompleteListSorting(props) {

  const {ox: {specification, constructions}, cnstr} = props;
  const tmp = new Set();
  const data = new Map();
  const res = [];

  specification.forEach(({nom, elm}) => {
    if(nom.complete_list_sorting && !tmp.has(nom)) {
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
