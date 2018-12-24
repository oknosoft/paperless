// @flow

import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from './TableRow';

export default function Params(props) {

  const {ox: {params}, cnstr} = props;

  const res = [];

  params.find_rows({cnstr}, (row) => {
    row.param && row.param.set && res.push(<TableRow key={row.param}>
      <TableCell component="th" scope="row">row.param.name</TableCell>
      <TableCell>{row.value}</TableCell>
    </TableRow>)
  });


  return res;
}
