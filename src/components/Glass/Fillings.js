/**
 * Заполнения текущего контура
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';


class Fillings extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('glasses'));
    this._meta.fields.width.type.fraction = 1;
    this._meta.fields.height.type.fraction = 1;

    this._filtered = [];

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.glasses'}, (scheme) => {
      if(scheme.name.endsWith('gl1')) {
        this.scheme = scheme;
      }
    });
  }

  prepare_filter() {
    this._filtered.length = 0;
    const {ox, contour: {fillings}} = this.props;
    ox.glasses.forEach((row) => {
      if(fillings.some((filling) => filling.elm === row.elm)) {
        this._filtered.push(row);
      }
    });
  }

  filter = () => {
    return this._filtered;
  }

  render() {
    const {ox} = this.props;
    this.prepare_filter();
    const minHeight = 36 + this._filtered.length * 35;
    return this.scheme ?
      <div style={{height: minHeight}}>
        <TabularSection
          _obj={ox}
          _meta={this._meta}
          _tabular="glasses"
          scheme={this.scheme}
          filter={this.filter}
          minHeight={minHeight}
          read_only
          disable_cache
          hideToolbar
        />
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.glasses", name: "characteristics.glasses.gl1"}`}
      </Typography>;
  }

}

Fillings.propTypes = {
  ox: PropTypes.object.isRequired,
  contour: PropTypes.object.isRequired,
};

export default Fillings;

