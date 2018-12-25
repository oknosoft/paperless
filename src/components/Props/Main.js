// @flow

import React from 'react';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from './TableRow';
import Params from './Params';
import CompleteListSorting from './CompleteListSorting';

export default function MainProps(props) {

  const {ox, cnstr, block, task} = props;
  let {name, note, calc_order, calc_order_row} = ox;
  if(calc_order_row && calc_order_row.note && !note) {
    note = calc_order_row.note;
  }

  return [
    //<Typography key="title" variant="h6">Свойства</Typography>,
    <Table key="table">
      <TableBody>
        {
          [
            task && name && <TableRow key="task">
              <TableCell component="th" scope="row">Задание</TableCell>
              <TableCell>{task}</TableCell>
            </TableRow>,

            name && <TableRow key="calc_order">
              <TableCell component="th" scope="row">Расчет</TableCell>
              <TableCell>{calc_order.number_doc}</TableCell>
            </TableRow>,

            <TableRow key="name">
              <TableCell component="th" scope="row">Изделие</TableCell>
              <TableCell>{name || 'не выбрано'}</TableCell>
            </TableRow>,

            block && <TableRow key="cnstr">
              <TableCell component="th" scope="row">Блок</TableCell>
              <TableCell>{block}</TableCell>
            </TableRow>,

            name && <TableRow key="divider"><TableCell /><TableCell /></TableRow>,

            // свойства изделия
            name && <Params key="prod_props" ox={ox} cnstr={0}/>,

            // свойства фурнитуры
            name && cnstr && <Params key="furn_props" ox={ox} cnstr={cnstr}/>,

            // свойства по сортировке в комплектации
            name && <CompleteListSorting key="furn_props" ox={ox} cnstr={cnstr}/>,

            note && <TableRow key="note">
              <TableCell component="th" scope="row">Инфо</TableCell>
              <TableCell>{note}</TableCell>
            </TableRow>,

          ]
        }
      </TableBody>
    </Table>
  ];
}
