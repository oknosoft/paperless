/**
 * Свойства слоя текущей створки
 *
 * @module Flap
 *
 * Created by Evgeniy Malyarov on 19.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import Params from '../Props/Params';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  shift: {
    backgroundColor: '#00c',
    color: '#fff',
    textAlign: 'center',
    padding: 3,
  },
  centr: {
    fontWeight: 500,
    opacity: 0.9,
    textAlign: 'center',
  }
});

const ruch_formatter = ({row, value}) => {
  const classes = useStyles();
  if(value === -1) {
    return <div className={classes.centr}>Ц</div>;
  }
  return <div className={classes.shift}>{row.h_ruch || ''}</div>;
}

export function columnsChange({scheme, columns}) {
  for(const column of columns) {
    if(column.key === "fix_ruch") {
      column.formatter = ruch_formatter;
    }
  }
};

class Flap extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('constructions'));
    this._meta.fields.w.type.fraction = 0;
    this._meta.fields.h.type.fraction = 0;

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.constructions'}, (scheme) => {
      if(scheme.name.endsWith('furn1')) {
        this.scheme = scheme;
      }
    });
  }

  filter = (collection) => {
    const res = [];
    const {cnstr} = this.props;
    collection.forEach((row) => {
      if(row.cnstr === cnstr) {
        res.push(row);
      }
    });
    return res;
  };

  render() {
    const {ox, cnstr} = this.props;
    const minHeight = 70;
    return this.scheme ?
      <div>
        <div style={{height: minHeight}}>
          <TabularSection
            _obj={ox}
            _meta={this._meta}
            _tabular="constructions"
            scheme={this.scheme}
            filter={this.filter}
            columnsChange={columnsChange}
            minHeight={minHeight}
            read_only
            hideToolbar
          />
        </div>
        <Table>
          <TableBody>
            <Params ox={ox} cnstr={cnstr} show_spec={false}/>
          </TableBody>
        </Table>
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.constructions", name: "characteristics.constructions.furn1"}`}
      </Typography>;
  }

}

Flap.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
};

export default Flap;
