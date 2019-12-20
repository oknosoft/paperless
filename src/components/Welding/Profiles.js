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
    $p.cat.scheme_settings.find_rows({obj: 'cat.characteristics.coordinates'}, (scheme) => {
      if(scheme.name.endsWith('welding')) {
        this.scheme = scheme;
        scheme.filter = this.filter.bind(this);
        this.ox = $p.cat.characteristics.get();
      }
    });
  }

  filter(collection) {
    const res = [];
    collection.clear();
    const {cnstr, ox: {coordinates, specification}, contour: {profiles}} = this.props;
    const {elm_types} = $p.enm;
    coordinates.forEach((row) => {
      if(profiles.some((profile) => profile.elm === row.elm && !profile.elm_type._manager.impost_lay.includes(profile.elm_type))) {
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
      <div style={{maxHeight: 600}}>
        <TabularSection
          _obj={this.ox}
          _tabular="coordinates"
          scheme={this.scheme}
          denyReorder
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
  cnstr: PropTypes.number.isRequired,
};

export default Profiles;
