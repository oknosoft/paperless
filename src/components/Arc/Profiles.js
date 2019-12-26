/**
 * Профили текущего контура
 *
 * @module Profiles
 *
 * Created by Evgeniy Malyarov on 20.12.2019.
 */

import React from 'react';
import PropTypes from 'prop-types';
import TabularSection from 'metadata-react/TabularSection';
import Typography from '@material-ui/core/Typography';

class Profiles extends React.Component {

  constructor(props, context) {
    super(props, context);
    const {cat, utils} = $p;
    cat.scheme_settings.find_rows({obj: 'cat.characteristics.coordinates'}, (scheme) => {
      if(scheme.name.endsWith('arc')) {
        this.scheme = scheme;
        scheme.filter = this.filter.bind(this);

        this.ox = cat.characteristics.get();
        this._meta = utils._clone(this.ox._metadata('coordinates'));
        this._meta.fields.len.type.fraction = 0;
        this._meta.fields.alp1.type.fraction = 1;
        this._meta.fields.alp2.type.fraction = 1;
        this._meta.fields.r.type.fraction = 0;
      }
    });
  }

  filter(collection) {
    const res = [];
    collection.clear();
    const {ox: {coordinates, specification}, contour: {profiles}} = this.props;
    coordinates.forEach((row) => {
      if(profiles.some((profile) => profile.elm === row.elm)) {
        const nrow = collection.add(row);
        const srow = specification.find({elm: row.elm, nom: row.nom.ref});
        if(srow) {
          nrow.len = srow.len * 1000;
        }
        res.push(nrow);
      }
    });
    return res;
  }

  render() {
    return this.scheme ?
      <div style={{maxHeight: 600, minHeight: 400}}>
        <TabularSection
          _obj={this.ox}
          _meta={this._meta}
          _tabular="coordinates"
          scheme={this.scheme}
          read_only
          hideToolbar
        />
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.coordinates", name: "characteristics.coordinates.welding"}`}
      </Typography>;
  }

}

Profiles.propTypes = {
  ox: PropTypes.object.isRequired,
  contour: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
};

export default Profiles;
