
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';

import {TableRow, TableCell} from './TableRow';
import Params from './Params';
import CompleteListSorting from './CompleteListSorting';

import scale_svg from '../../metadata/common/scale_svg';

function findClrs(ox) {
  const {pencil_pl, pencil_pl_map} = $p.job_prm.nom;
  const {clr} = ox;
  if(clr) {
    const stop = clr.is_composite() ? 1 : 0;
    const clrs = new Set();
    for(const row of ox.specification) {
      if(pencil_pl.includes(row.nom)) {
        clrs.add(row.clr);
        if(clrs.size > stop) {
          break;
        }
      }
    }
    if(clrs.size > 1) {
      return [
        pencil_pl_map.clrs_map().get(clr.clr_in) || clr.clr_in,
        pencil_pl_map.clrs_map().get(clr.clr_out) || clr.clr_out,
      ];
    }
    if(clrs.size) {
      return Array.from(clrs)[0];
    }
  }
}

export default function MainProps(props) {

  const {ox, cnstr, block, task, show_spec, changeFull, hideBounds, filter} = props;
  const name = ox.prod_name?.(true);
  const pencil_clrs = findClrs(ox);

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
    if(!clrs.size && ox.clr.empty && !ox.clr.empty()) {
      clrs.add(ox.clr);
    }
    const svg = ox.svg || ox.leading_product.svg;
    rows.push(<TableRow key="sub">
      <TableCell onClick={changeFull}>
        <div dangerouslySetInnerHTML={{__html: svg ? scale_svg(svg, {width: 130, height: 110, zoom: 0.2}, 0) : 'нет эскиза'}}/>
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

            {pencil_clrs ? (
              Array.isArray(pencil_clrs) ? <>
                  <TableRow>
                    <TableCell>Изнутри</TableCell>
                    <TableCell>{pencil_clrs[0].article}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Снаружи</TableCell>
                    <TableCell>{pencil_clrs[1].article}</TableCell>
                  </TableRow>
              </> :
                <TableRow>
                  <TableCell>Карандаш</TableCell>
                  <TableCell>{pencil_clrs.article}</TableCell>
                </TableRow>
            ) : null}

            {hideBounds ? null : <TableRow>
              <TableCell>Габарит</TableCell>
              <TableCell>{`${ox.x.round(1)}x${ox.y.round(1)} S:${ox.s.toFixed(3)}`}</TableCell>
            </TableRow>}

            {block && <TableRow>
              <TableCell>Блок</TableCell>
              <TableCell>{block}</TableCell>
            </TableRow>}

          </TableBody>
        </Table>
      </TableCell>
    </TableRow>);

    const note = ox.note || ox.calc_order_row.note;
    if(note) {
      rows.push(<TableRow>
        <TableCell>Комментарий</TableCell>
        <TableCell>{note}</TableCell>
      </TableRow>);
    }

    rows.push(...Params({ox, cnstr: 0, filter}));

    cnstr && rows.push(...Params({ox, cnstr, filter}));

    show_spec && rows.push(...CompleteListSorting({ox, cnstr, show_spec}));

  }

  return [
    <Table key="table">
      <TableBody>{rows}</TableBody>
    </Table>
  ];
}
