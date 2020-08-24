import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TabularSection from 'metadata-react/TabularSection';

class Crooked extends React.Component {

  constructor(props, context) {
    super(props, context);

    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('coordinates'));
    this._meta.fields.len.type.fraction = 0;
    this._meta.fields.alp1.type.fraction = 0;
    this._meta.fields.alp2.type.fraction = 0;

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.coordinates'}, (scheme) => {
      if(scheme.name.endsWith('crooked')) {
        this.scheme = scheme;
      }
    });
  }

  filter = (collection) => {
    const res = [];
    const {cnstr} = this.props;
    const {Импост} = $p.enm.elm_types;
    collection.forEach((row) => {
      if(row.cnstr === cnstr && row.elm_type === Импост && (row.alp1 !== 90 || row.alp2 !== 90)) {
        res.push(row);
      }
    });
    return res;
  };

  render() {
    const {ox} = this.props;
    const rows = this.filter(ox.coordinates);
    if(!rows.length) {
      return null;
    }
    const minHeight = 35 + 35 * rows.length;
    return this.scheme ?
      <div>
        <div style={{height: minHeight}}>
          <TabularSection
            _obj={ox}
            _meta={this._meta}
            _tabular="coordinates"
            scheme={this.scheme}
            filter={this.filter}
            minHeight={minHeight}
            read_only
            hideToolbar
          />
        </div>
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.coordinates", name: "characteristics.coordinates.crooked"}`}
      </Typography>;
  }

}

Crooked.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
};

export default Crooked;
