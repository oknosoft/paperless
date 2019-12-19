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

class Flap extends React.Component {

  constructor(props, context) {
    super(props, context);
    $p.cat.scheme_settings.find_rows({obj: 'cat.characteristics.constructions'}, (scheme) => {
      if(scheme.name.endsWith('furn1')) {
        this.scheme = scheme;
        scheme.filter = this.filter.bind(this);
      }
    });
  }

  filter(collection) {
    const res = [];
    const {cnstr} = this.props;
    collection.forEach((row) => {
      if(row.cnstr === cnstr) {
        res.push(row);
      }
    });
    return res;
  }

  render() {
    return this.scheme ?
      <div style={{height: 68}}>
        <TabularSection
          _obj={this.props.ox}
          _tabular="constructions"
          scheme={this.scheme}
          denyReorder
          hideToolbar
        />
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
