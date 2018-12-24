/**
 *
 *
 * @module TableRow
 *
 * Created by Evgeniy Malyarov on 24.12.2018.
 */

import React from 'react';
import TableRow from '@material-ui/core/TableRow';
import withStyles from '@material-ui/core/styles/withStyles';

const styles = {
  row: {
    height: 'auto',
  },
};

const Row = withStyles(styles)(({classes, children, ...props}) =>
  <TableRow className={classes.row} {...props}>
    {children}
  </TableRow>);

export default Row;
