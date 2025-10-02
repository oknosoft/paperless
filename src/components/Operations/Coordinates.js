import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import TabularSection from 'metadata-react/TabularSection';

function sort(a, b) {
  if(a.nom.name < b.nom.name) {
    return -1;
  }
  else if(a.nom.name > b.nom.name) {
    return 1;
  }
  else {
    return a.len - b.len;
  }
}

const nomStyle = {textAlign: 'right', paddingRight: 8};
function NomCoordinate({value}) {
  if(typeof value === 'number') {
    const text = (value * 1000).toFixed(0);
    return <div title={text} style={nomStyle}>{text}</div>;
  }
  const text = value.name;
  return <div title={text}>{text}</div>;
}

function columnsChange({columns}) {
  columns[0].formatter = NomCoordinate;
}

class Coordinates extends React.Component {

  constructor(props, context) {
    super(props, context);

    const {cat, utils} = $p;
    this._meta = utils._clone(cat.characteristics.metadata('specification'));

    cat.scheme_settings.find_rows({obj: 'cat.characteristics.specification'}, (scheme) => {
      if(scheme.name.endsWith('operations')) {
        this.scheme = scheme;
      }
    });
  }

  filter = (collection) => {
    const pre = [];
    const res = [];
    const noms = new Set();
    const {elm, ox: {cnn_elmnts}} = this.props;
    const {hide_oper} = $p.job_prm.nom;
    collection.forEach((row) => {
      if(row.elm === elm && row.dop === -2 && row.len && !hide_oper.includes(row.nom)) {
        pre.push(row);
      }
    });
    pre.sort(sort);
    for(const row of pre) {
      noms.add(row.nom);
    }
    for(const nom of noms) {
      res.push({nom});
      for(const row of pre.filter(row => row.nom === nom)) {
        res.push({nom: row.len});
      }
    }
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
            columnsChange={columnsChange}
            read_only
            disable_cache
            hideToolbar
          />
        </div>
      </div>
      :
      <Typography key="err-nom" color="error">
        {`Не найден элемент scheme_settings {obj: "cat.characteristics.specification", name: "characteristics.specification.operations"}`}
      </Typography>;
  }

}

Coordinates.propTypes = {
  ox: PropTypes.object.isRequired,
  elm: PropTypes.number.isRequired,
};

export default Coordinates;
