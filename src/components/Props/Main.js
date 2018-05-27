// @flow

import React from 'react';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

export default function MainProps(props) {

  const {ox: {name, note, calc_order}, cnstr} = props;

  return [
    <Typography key="title" variant="title">Свойства</Typography>,
    <Table key="table">
      <TableBody>
        {
          [
            <TableRow key="name">
              <TableCell component="th" scope="row">Изделие</TableCell>
              <TableCell>{name || 'не выбрано'}</TableCell>
            </TableRow>,

            note && <TableRow key="note">
              <TableCell component="th" scope="row">Инфо</TableCell>
              <TableCell>{note}</TableCell>
            </TableRow>,

            name && <TableRow key="cnstr">
              <TableCell component="th" scope="row">Контур</TableCell>
              <TableCell numeric>{cnstr}</TableCell>
            </TableRow>
          ]
        }
      </TableBody>
    </Table>
  ];
}
