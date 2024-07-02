import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TabularSection from 'metadata-react/TabularSection';

class Crooked extends React.Component {

  constructor(props, context) {
    super(props, context);

    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('specification'));
    this._meta.fields.qty.type.fraction = 0;
    this._meta.fields.totqty.type.fraction = 0;

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.specification'}, (scheme) => {
      if(scheme.name.endsWith('crackers')) {
        this.scheme = scheme;
      }
    });
  }

  filter = (collection) => {
    const res = [];
    const {elm, ox: {cnn_elmnts}} = this.props;
    const {rigel_cnn} = $p.job_prm.nom;
    collection.forEach((row) => {
      if(row.elm === elm || cnn_elmnts.find({elm1: row.elm, elm2: elm})) {
        for(const nom of rigel_cnn) {
          if(row.nom._hierarchy(nom)) {
            res.push(row);
            break;
          }
        }
      }
    });
    return res;
  };

  render() {
    const {ox} = this.props;
    const rows = this.filter(ox.specification);
    if(!rows.length) {
      return null;
    }
    const minHeight = Math.min(420, 35 + 35 * rows.length);
    return this.scheme ?
      <div>
        <div style={{height: minHeight}}>
          <TabularSection
            _obj={ox}
            _meta={this._meta}
            _tabular="specification"
            scheme={this.scheme}
            filter={this.filter}
            minHeight={minHeight}
            read_only
            disable_cache
            hideToolbar
          />
        </div>
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.specification", name: "characteristics.specification.crackers"}`}
      </Typography>;
  }

}

Crooked.propTypes = {
  ox: PropTypes.object.isRequired,
  cnstr: PropTypes.number.isRequired,
};

export default Crooked;
