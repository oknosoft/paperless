/**
 * Допсвойства по табчасти параметров
 *
 * @module Params
 *
 * Created by Evgeniy Malyarov on 24.12.2018.
 */

import React from 'react';
import {TableRow, TableCell} from './TableRow';

export default function Params(props) {

  const {ox: {params}, cnstr, filter} = props;
  const res = [];

  params.find_rows({cnstr, inset: $p.utils.blank.guid}, (row) => {
    const {param} = row;
    if(param) {
      if(filter) {
        filter(row) && res.push(row);
      }
      else {
        param.include_to_description && res.push(row);
      }
    }
  });

  return res
    .sort((a, b) => a.param.sorting_field - b.param.sorting_field)
    .map(({param, value}) => <TableRow key={param.ref}>
      <TableCell component="th" scope="row">{param.name}</TableCell>
      <TableCell>{value ? value.toString() : ''}</TableCell>
    </TableRow>);
}
