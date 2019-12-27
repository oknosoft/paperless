/**
 *
 *
 * @module TableRow
 *
 * Created by Evgeniy Malyarov on 24.12.2018.
 */

import React from 'react';
import Row from '@material-ui/core/TableRow';
import Cell from '@material-ui/core/TableCell';
import withStyles from '@material-ui/core/styles/withStyles';

export const TableRow = withStyles({row: {height: 'auto'}})(({classes, children, ...props}) =>
  <Row className={classes.row} {...props}>
    {children}
  </Row>);

export const TableCell = withStyles({
  root: {
    padding: 4
  },
  body: {
    color: 'inherit',
  }
})(({classes, children, ...props}) =>
  <Cell classes={classes} {...props}>
    {children}
  </Cell>);
