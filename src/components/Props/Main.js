// @flow

import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

import {TableRow, TableCell} from './TableRow';
import Params from './Params';
import CompleteListSorting from './CompleteListSorting';

import scale_svg from '../../metadata/common/scale_svg';

export default function MainProps(props) {

  const {ox, cnstr, block, task, show_spec, changeFull} = props;
  const name = ox.prod_name && ox.prod_name(true);

  const rows = [];

  if(!name) {
    rows.push(<TableRow key="name">
      <TableCell>Изделие</TableCell>
      <TableCell>не выбрано</TableCell>
    </TableRow>);
  }
  else {
    const clrs = new Set();
    ox.coordinates.forEach(({clr, elm_type}) => {
      elm_type._manager.profiles.includes(elm_type) && !clr.empty() && clrs.add(clr);
    });
    rows.push(<TableRow key="sub">
      <TableCell onClick={changeFull}>
        <div dangerouslySetInnerHTML={{__html: ox.svg ? scale_svg(ox.svg, {width: 130, height: 110, zoom: 0.2}, 0) : 'нет эскиза'}}/>
      </TableCell>
      <TableCell>
        <Table>
          <TableBody>

            {task && <TableRow>
              <TableCell>Задание</TableCell>
              <TableCell>{task}</TableCell>
            </TableRow>}

            <TableRow>
              <TableCell>Расчет</TableCell>
              <TableCell>{ox.calc_order.number_doc}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Изделие</TableCell>
              <TableCell>{name}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Цвет</TableCell>
              <TableCell>{Array.from(clrs).join(',')}</TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Габарит</TableCell>
              <TableCell>{`${ox.x}x${ox.y} S:${ox.s.toFixed(3)}`}</TableCell>
            </TableRow>

            {block && <TableRow>
              <TableCell>Блок</TableCell>
              <TableCell>{block}</TableCell>
            </TableRow>}

          </TableBody>
        </Table>
      </TableCell>
    </TableRow>);

    //rows.push(<TableRow key="divider"><TableCell /><TableCell /></TableRow>);

    rows.push(...Params({ox, cnstr: 0}));

    cnstr && rows.push(...Params({ox, cnstr}));

    show_spec && rows.push(...CompleteListSorting({ox, cnstr, show_spec}));

  }

  return [
    <Table key="table">
      <TableBody>{rows}</TableBody>
    </Table>
  ];
}
