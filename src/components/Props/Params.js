// @flow

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from './TableRow';

export default function Params(props) {

  const {ox: {params}, cnstr} = props;
  const res = [];

  params.find_rows({cnstr, inset: $p.utils.blank.guid}, (row) => {
    row.param && row.param.include_to_description && res.push(row);
  });

  return res
    .sort((a, b) => a.param.sorting_field - b.param.sorting_field)
    .map(({param, value}) => <TableRow key={param.ref}>
      <TableCell component="th" scope="row">{param.name}</TableCell>
      <TableCell>{value ? value.toString() : ''}</TableCell>
    </TableRow>);
}
