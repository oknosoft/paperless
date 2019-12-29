/**
 * Свойства створок текущего контура
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';

function hieracy(contours, cnstr) {
  return contours.some((flap) => {
    if(cnstr === flap.cnstr) {
      return true;
    }
    return hieracy(flap.contours, cnstr);
  });
}

class Flaps extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('constructions'));
    this._meta.fields.w.type.fraction = 0;
    this._meta.fields.h.type.fraction = 0;

    this._filtered = [];

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.constructions'}, (scheme) => {
      if(scheme.name.endsWith('furn1')) {
        this.scheme = scheme;
      }
    });
  }

  prepare_filter() {
    this._filtered.length = 0;
    const {ox, contour: {contours}} = this.props;
    ox.constructions.forEach((row) => {
      if(hieracy(contours, row.cnstr)) {
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
          _tabular="constructions"
          scheme={this.scheme}
          filter={this.filter}
          minHeight={minHeight}
          read_only
          hideToolbar
        />
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.constructions", name: "characteristics.constructions.furn1"}`}
      </Typography>;
  }

}

Flaps.propTypes = {
  ox: PropTypes.object.isRequired,
  contour: PropTypes.object.isRequired,
};

export default Flaps;
